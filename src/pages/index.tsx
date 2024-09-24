import {
  GetServerSidePropsContext,
  PreviewData,
} from "next";
import { ParsedUrlQuery } from "querystring";
import { createClient } from "src/utils/supabase/server-props";

export default function Home() {
  return <div>test</div>;
}

export const getServerSideProps = async (
  ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
) => {
  //@ts-expect-error - Supabase client is not initialized
  const supabase = createClient({ req: ctx.req, res: ctx.res });

  const { data } = await supabase.auth.getUser();
  const { data: chat } = await supabase
    .from("chats")
    .select("*")
    .single();

  if (data.user) {
    return {
      redirect: {
        destination: `/chats/${chat.id}`,
        permanent: false,
      },
    };
  }
};
