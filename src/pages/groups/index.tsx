import { createClient } from 'src/utils/supabase/component';
import { createClient as createServerClient } from 'src/utils/supabase/server-props';
import { useState, useEffect } from 'react';
import { Group } from 'src/types/Group.types';
import ChatSidebar from 'src/components/ChatSidebar';
import { GetServerSidePropsContext } from 'next';
import PageMeta from 'src/components/PageMeta';
import Card from 'src/components/Card';

export default function Groups({
  groupData,
  currentUserId,
}: {
  groupData: Group[];
  currentUserId: string;
}) {
  const supabase = createClient();
  const [rooms, setRooms] = useState<Group[]>(groupData);

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRooms = async () => {
    const { data, error } = await supabase.from('rooms').select('*');

    if (error) console.error('Error fetching rooms:', error.message);
    else setRooms(data);
  };

  return (
    <>
      <PageMeta title="Riko ConnectsZ | Groups" />
      <div className="flex">
        <ChatSidebar groups={rooms} currentUserId={currentUserId} />
        <div className="bg-white p-2 w-full flex justify-center items-center h-screen">
          <Card className="w-full h-full flex justify-center items-center">
            <h2 className="text-gray-500">
              Select a person from the sidebar to start messaging
            </h2>
          </Card>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createServerClient({ req: ctx.req, res: ctx.res });
  const { data: userData } = await supabase.auth.getUser();
  const currentUserId = userData?.user?.id;

  if (!userData.user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const { data: userGroups, error: userGroupsError } = await supabase
    .from('room_participants')
    .select('room_id')
    .eq('user_id', currentUserId);

  if (userGroupsError) {
    console.error('Error fetching user rooms:', userGroupsError.message);
    return { props: { groups: [], currentUserId } };
  }

  const groupIds = userGroups.map((rp) => rp.room_id);

  if (groupIds.length === 0) {
    // User is not part of any rooms
    return {
      props: {
        groups: [],
        currentUserId,
      },
    };
  }

  const { data: groupData, error: groupsError } = await supabase
    .from('rooms')
    .select(
      `
      id,
      name,
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
    .in('id', groupIds);

  if (groupsError) {
    console.error('Error fetching rooms:', groupsError.message);
    return { props: { groups: [], currentUserId } };
  }

  return {
    props: {
      groupData: groupData || [],
      currentUserId,
    },
  };
};
