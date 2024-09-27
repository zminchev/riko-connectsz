import { createClient } from "src/utils/supabase/component";
import { createClient as createServerClient } from "src/utils/supabase/server-props";
import { useState, useEffect } from "react";
import { Room } from "src/types/Room.types";
import ChatSidebar from "src/components/ChatSidebar";
import { GetServerSidePropsContext } from "next";
import PageMeta from "src/components/PageMeta";

export default function Groups({
  groups,
  currentUserId,
}: {
  groups: Room[];
  currentUserId: string;
}) {
  const supabase = createClient();
  const [rooms, setRooms] = useState<Room[]>(groups);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    const { data, error } = await supabase.from("rooms").select("*");

    if (error) console.error("Error fetching rooms:", error.message);
    else setRooms(data);
  };

  return (
    <>
    <PageMeta title="Riko ConnectsZ | Groups" />
      <div>
        <ChatSidebar
          groups={rooms}
          currentUserId={currentUserId}
          isOpen={true}
        />
      </div>
    </>
  );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  // @ts-expect-error Expect
  const supabase = createServerClient({ req: ctx.req, res: ctx.res });
  const { data: userData } = await supabase.auth.getUser();
  const currentUserId = userData?.user?.id;

  if (!userData.user) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const { data: userRooms, error: userRoomsError } = await supabase
    .from("room_participants")
    .select("room_id")
    .eq("user_id", currentUserId);

  if (userRoomsError) {
    console.error("Error fetching user rooms:", userRoomsError.message);
    return { props: { groups: [], currentUserId } };
  }

  const roomIds = userRooms.map((rp) => rp.room_id);

  if (roomIds.length === 0) {
    // User is not part of any rooms
    return {
      props: {
        groups: [],
        currentUserId,
      },
    };
  }

  const { data: roomsData, error: roomsError } = await supabase
    .from("rooms")
    .select(
      `
      id,
      name,
      room_participants (
        user_id,
        users (
          first_name,
          last_name
        )
      )
    `
    )
    .in("id", roomIds);

  if (roomsError) {
    console.error("Error fetching rooms:", roomsError.message);
    return { props: { groups: [], currentUserId } };
  }

  return {
    props: {
      groups: roomsData || [],
      currentUserId,
    },
  };
};
