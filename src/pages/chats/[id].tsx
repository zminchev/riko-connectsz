import { GetServerSidePropsContext, PreviewData } from 'next';
import { ParsedUrlQuery } from 'querystring';
import React from 'react';
import ActiveChat from 'src/components/ActiveChat';
import ChatSidebar from 'src/components/ChatSidebar';
import PageMeta from 'src/components/PageMeta';
import { Chat } from 'src/types/Chat.types';
import { createClient } from 'src/utils/supabase/server-props';

const ChatsPage = ({
  chatsData,
  currentUserId,
  activeChat,
}: {
  chatsData: Chat[];
  currentUserId: string;
  activeChat: Chat | null;
}) => {
  const otherUser =
    activeChat?.participant_1_id === currentUserId
      ? activeChat.participant_2
      : activeChat?.participant_1;

  const userNames = `${otherUser?.first_name} ${otherUser?.last_name}`;

  return (
    <>
      <PageMeta title={`Chats | ${userNames}`} />
      <div className="flex">
        <ChatSidebar chats={chatsData} currentUserId={currentUserId} />
        {activeChat ? (
          <ActiveChat chat={activeChat} userId={currentUserId} />
        ) : (
          <div>Choose a chat to start messaging</div>
        )}
      </div>
    </>
  );
};

export default ChatsPage;

export const getServerSideProps = async (
  ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>,
) => {
  const supabase = createClient({ req: ctx.req, res: ctx.res });
  const { data: userData } = await supabase.auth.getUser();
  const currentUserId = userData?.user?.id;

  if (!userData.user) {
    return {
      redirect: {
        destination: `/login`,
        permanent: false,
      },
    };
  }

  const { data: chatsData, error: chatError } = await supabase
    .from('chats')
    .select(
      `
    id,
    participant_1_id,
    participant_2_id,
    created_at,
    participant_1:participant_1_id(first_name, last_name, profile_photo),
    participant_2:participant_2_id(first_name, last_name, profile_photo)
  `,
    )
    .or(
      `participant_1_id.eq.${currentUserId},participant_2_id.eq.${currentUserId}`,
    );

  const chatSlug = ctx.params?.id;

  let activeChat = null;

  if (chatsData?.length) {
    activeChat = chatsData?.find((chat) => {
      return chat.id === chatSlug?.toString();
    });
  }

  if (chatError) {
    console.error(chatError);
  }

  return {
    props: {
      chatsData,
      activeChat: activeChat,
      currentUserId,
    },
  };
};
