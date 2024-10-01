import { GetServerSidePropsContext } from 'next';
import { Group } from 'src/types/Group.types';
import React, { useState } from 'react';
import ChatSidebar from 'src/components/ChatSidebar';
import { createClient } from 'src/utils/supabase/server-props';
import ActiveChat from 'src/components/ActiveChat';
import PageMeta from 'src/components/PageMeta';

const GroupPage = ({
  groups,
  currentUserId,
  activeGroup,
}: {
  groups: Group[];
  currentUserId: string;
  activeGroup: Group;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const onSidebarToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <PageMeta title={`Groups | ${activeGroup?.name}`} />
      <div className="flex">
        <ChatSidebar
          groups={groups}
          currentUserId={currentUserId}
          activeGroup={activeGroup}
          isOpen={isOpen}
          onSidebarToggle={onSidebarToggle}
        />
        {activeGroup ? (
          <ActiveChat room={activeGroup} userId={currentUserId} />
        ) : (
          <div>Choose or create a group to start messaging</div>
        )}
      </div>
    </>
  );
};

export default GroupPage;

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createClient({ req: ctx.req, res: ctx.res });

  const { data: userData } = await supabase.auth.getUser();
  const currentUserId = userData?.user?.id;
  const groupSlug = ctx.params?.id;

  const { data: userRooms, error: userRoomsError } = await supabase
    .from('room_participants')
    .select('room_id')
    .eq('user_id', currentUserId);

  if (userRoomsError) {
    console.error('Error fetching user rooms:', userRoomsError.message);
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
    .from('rooms')
    .select(
      `
    id,
    name,
    room_photo,
    room_participants (
      user_id,
      users (
          first_name,
          last_name,
          profile_photo
          )
          )
          `,
    )
    .in('id', roomIds);

  if (roomsError) {
    console.error('Error fetching rooms:', roomsError.message);
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
