import { GetServerSidePropsContext } from "next";
import { Room } from "src/types/Room.types";
import React, { useState } from "react";
import ChatSidebar from "src/components/ChatSidebar";
import { createClient } from "src/utils/supabase/server-props";
import ActiveChat from "src/components/ActiveChat";

const Group = ({
  groups,
  currentUserId,
  activeGroup,
}: {
  groups: Room[];
  currentUserId: string;
  activeGroup: Room;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const onSidebarToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex">
      <ChatSidebar
        groups={groups}
        currentUserId={currentUserId}
        isOpen={isOpen}
        onSidebarToggle={onSidebarToggle}
      />
      {activeGroup ? (
        <ActiveChat
          room={activeGroup}
          userId={currentUserId}
          onSidebarToggle={onSidebarToggle}
        />
      ) : (
        <div>Choose or create a group to start messaging</div>
      )}
    </div>
  );
};

export default Group;

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  //@ts-expect-error - Supabase client is not initialized
  const supabase = createClient({ req: ctx.req, res: ctx.res });

  const { data: userData } = await supabase.auth.getUser();
  const currentUserId = userData?.user?.id;
  const groupSlug = ctx.params?.id;

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

  let activeGroup = null;

  if (roomsData?.length) {
    activeGroup = roomsData?.find((group) => group.id === groupSlug);
  }

  return {
    props: {
      groups: roomsData || [],
      currentUserId,
      activeGroup,
    },
  };
};
