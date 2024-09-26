import { GetServerSidePropsContext } from "next";
import { Room } from "src/types/Room.types";
import React, { useState } from "react";
import ChatSidebar from "src/components/ChatSidebar";
import { createClient } from "src/utils/supabase/server-props";
import ActiveChat from "src/components/ActiveChat";
import { useRouter } from "next/router";

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
  const router = useRouter();

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
      <ActiveChat
        room={activeGroup}
        userId={currentUserId}
        onSidebarToggle={onSidebarToggle}
      />
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
    .eq("id", groupSlug);

  console.log(roomsData);

  let activeGroup = null;

  if (roomsData?.length) {
    activeGroup = roomsData?.find((group) => group.id === groupSlug);
  }

  if (roomsError) {
    console.error("Error fetching rooms:", roomsError.message);
  }

  return {
    props: {
      groups: roomsData || [],
      currentUserId,
      activeGroup,
    },
  };
};
