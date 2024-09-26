import { GetServerSidePropsContext, PreviewData } from "next";
import Head from "next/head";
import { ParsedUrlQuery } from "querystring";
import React, { useState } from "react";
import ActiveChat from "src/components/ActiveChat";
import ChatSidebar from "src/components/ChatSidebar";
import { Chat } from "src/types/Chat.types";
import { createClient } from "src/utils/supabase/server-props";

const ChatsPage = ({
  chatsData,
  currentUserId,
  activeChat,
}: {
  chatsData: Chat[];
  currentUserId: string;
  activeChat: Chat;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const otherUser =
    activeChat.participant_1_id === currentUserId
      ? activeChat.participant_2
      : activeChat.participant_1;

  const onSidebarToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <Head>
        <title>
          Chats | {otherUser?.first_name} {otherUser?.last_name}
        </title>
      </Head>
      <div className="flex">
        <ChatSidebar
          chats={chatsData}
          currentUserId={currentUserId}
          isOpen={isOpen}
          onSidebarToggle={onSidebarToggle}
        />
        <ActiveChat
          chat={activeChat}
          userId={currentUserId}
          onSidebarToggle={onSidebarToggle}
        />
      </div>
    </>
  );
};

export default ChatsPage;

export const getServerSideProps = async (
  ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
) => {
  //@ts-expect-error - Supabase client is not initialized
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
    .from("chats")
    .select(
      `
    id,
    participant_1_id,
    participant_2_id,
    created_at,
    participant_1:participant_1_id(first_name, last_name),
    participant_2:participant_2_id(first_name, last_name)
  `
    )
    .or(
      `participant_1_id.eq.${currentUserId},participant_2_id.eq.${currentUserId}`
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
