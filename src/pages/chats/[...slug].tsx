import {
  GetServerSideProps,
  GetServerSidePropsContext,
  PreviewData,
} from "next";
import { ParsedUrlQuery } from "querystring";
import React from "react";
import { createClient } from "src/utils/supabase/server-props";

const ChatsPage = () => {
  return <div>ChatsPage</div>;
};

export default ChatsPage;

export const getServerSideProps = async (
  ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
) => {
  //@ts-ignore
  const supabase = createClient({ req: ctx.req, res: ctx.res });
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return {
      redirect: {
        destination: `/login`,
        permanent: false,
      },
    };
  }

  const { data: chat, error } = await supabase
    .from("chats")
    .select("*")
    .single();

  if (error) {
    console.error(error);
  }

  return {
    props: {
      chat,
    },
  };
};
