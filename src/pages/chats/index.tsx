import { GetServerSidePropsContext } from "next";
import ChatSidebar from "src/components/ChatSidebar";
import { Chat } from "src/types/Chat.types";
import { createClient } from "src/utils/supabase/server-props";

const ChatsIndex = ({
  chats,
  currentUserId,
}: {
  chats: Chat[];
  currentUserId: string;
}) => {
  return (
    <div className="flex bg-gray-500">
      <ChatSidebar chats={chats} currentUserId={currentUserId} />
      <div className="w-full flex justify-center items-center">
        <h2>Select a person from the sidebar to start messaging</h2>
      </div>
    </div>
  );
};

export default ChatsIndex;

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  // @ts-expect-error Expect
  const supabase = createClient({ req: ctx.req, res: ctx.res });
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

  const { data: chatsData } = await supabase
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

  return {
    props: {
      chats: chatsData || [],
      currentUserId,
    },
  };
};
