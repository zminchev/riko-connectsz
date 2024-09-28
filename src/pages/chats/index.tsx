import { GetServerSidePropsContext } from "next";
import Card from "src/components/Card";
import ChatSidebar from "src/components/ChatSidebar";
import PageMeta from "src/components/PageMeta";
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
    <>
      <PageMeta title="Riko ConnectsZ | Chats" />
      <div className="flex">
        <ChatSidebar chats={chats} currentUserId={currentUserId} />
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
};

export default ChatsIndex;

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
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
    participant_1:participant_1_id(first_name, last_name, profile_photo),
    participant_2:participant_2_id(first_name, last_name, profile_photo)
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
