import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { createClient } from "src/utils/supabase/component";
import { createClient as serverClient } from "src/utils/supabase/server-props";
import type {
  InferGetServerSidePropsType,
  GetServerSideProps,
  PreviewData,
  GetServerSidePropsContext,
} from "next";
import { ParsedUrlQuery } from "querystring";

type Chat = {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  created_at: string;
};

export default function LoginPage({
  chat,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  async function logIn() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error(error);
    }
    router.push(`/chats/${chat.id}`);
  }

  async function signUp() {
    const { data: userAuthData, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (userAuthData) {
      await supabase.from("users").insert({
        id: userAuthData?.user?.id,
        email,
        first_name: firstName,
        last_name: lastName,
      });
    }

    if (error) {
      console.error(error);
    }
    router.push(`/chats/${chat.id}`);
  }

  return (
    <main className="h-screen w-full">
      <form className="h-full flex flex-col w-full p-10 justify-center items-center">
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          className="text-black"
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          value={password}
          className="text-black"
          onChange={(e) => setPassword(e.target.value)}
        />
        <label htmlFor="password">First Name:</label>
        <input
          id="first-namee"
          type="text"
          value={firstName}
          className="text-black"
          onChange={(e) => setFirstName(e.target.value)}
        />
        <label htmlFor="password">Last Name:</label>
        <input
          id="last-name"
          type="text"
          value={lastName}
          className="text-black"
          onChange={(e) => setLastName(e.target.value)}
        />
        <button type="button" onClick={logIn}>
          Log in
        </button>
        <button type="button" onClick={signUp}>
          Sign up
        </button>
      </form>
    </main>
  );
}

export const getServerSideProps = (async (
  ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
) => {
  //@ts-ignore
  const supabase = serverClient({ req: ctx.req, res: ctx.res });
  const { data: userData } = await supabase.auth.getUser();
  const { data: chat, error } = await supabase
    .from("chats")
    .select("*")
    .single();

  if (userData.user) {
    return {
      redirect: {
        destination: `/chats/${chat.id}`,
        permanent: false,
      },
    };
  }

  if (error) {
    console.error(error);
  }

  return {
    props: {
      chat,
    },
  };
}) satisfies GetServerSideProps<{ chat: Chat }>;
