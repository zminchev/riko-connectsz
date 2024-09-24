import { GetServerSidePropsContext, PreviewData } from "next";
import { useRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";
import React from "react";
import ActiveChat from "src/components/ActiveChat";
import ChatSidebar from "src/components/ChatSidebar";
import { Chat } from "src/types/Chat.types";
import { createClient } from "src/utils/supabase/server-props";

const ChatsPage = ({
  chatsData,
  currentUserId,
}: {
  chatsData: Chat[];
  currentUserId: string;
}) => {
  const router = useRouter();
  const chatSlug = router.query.slug;

  const activeChatIndex = chatsData.findIndex((chat) => {
    return chat.id === chatSlug?.toString();
  });

  return (
    <div className="flex">
      <ChatSidebar chats={chatsData} currentUserId={currentUserId} />
      <ActiveChat chat={chatsData[activeChatIndex]} userId={currentUserId} />
    </div>
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

  if (chatError) {
    console.error(chatError);
  }

  return {
    props: {
      chatsData,
      currentUserId,
    },
  };
};
