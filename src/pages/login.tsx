import { useRouter } from 'next/router';
import { useState } from 'react';

import { createClient } from 'src/utils/supabase/component';
import { createClient as serverClient } from 'src/utils/supabase/server-props';
import type { PreviewData, GetServerSidePropsContext } from 'next';
import { ParsedUrlQuery } from 'querystring';
import Input from 'src/components/Input/Input';
import Button from 'src/components/Button';
import PageMeta from 'src/components/PageMeta';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  async function logIn() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    await supabase
      .from('users')
      .update({
        is_online: true,
      })
      .eq('id', data?.user?.id);

    if (error) {
      console.error(error);
    }

    router.push(`/chats`);
  }

  async function signUp() {
    const { data: userAuthData, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (userAuthData) {
      await supabase.from('users').insert({
        id: userAuthData?.user?.id,
        email,
        first_name: firstName,
        last_name: lastName,
      });
    }

    if (error) {
      console.error(error);
    }
    router.push(`/chats`);
  }

  return (
    <>
      <PageMeta title="Riko ConnectsZ | Login" />
      <main className="h-screen w-full">
        <form className="w-full h-full p-6 md:p-0">
          <div className="flex flex-col items-center justify-center gap-2 w-full h-full">
            <h1 className="text-4xl mb-4 text-cyan-500">Riko ConnectsZ</h1>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              className="w-full md:w-1/2 lg:w-1/3 border border-gray-500/25"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              id="first-namee"
              type="text"
              placeholder="First Name"
              className="w-full md:w-1/2 lg:w-1/3 border border-gray-500/25"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              id="last-name"
              type="text"
              placeholder="Last Name"
              className="w-full md:w-1/2 lg:w-1/3 border border-gray-500/25"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <Input
              id="password"
              type="password"
              placeholder="Password"
              className="w-full md:w-1/2 lg:w-1/3 border border-gray-500/25"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="button"
              text="Log in"
              className="p-2 bg-cyan-500 hover:bg-cyan-600 w-full md:w-1/2 lg:w-1/3 transition-colors duration-300 ease-in-out rounded-sm text-white"
              onClick={logIn}
            />
            <Button
              type="button"
              text="Sign up"
              className="p-2 bg-cyan-500 hover:bg-cyan-600 w-full md:w-1/2 lg:w-1/3 transition-colors duration-300 ease-in-out rounded-sm text-white"
              onClick={signUp}
            />
          </div>
        </form>
      </main>
    </>
  );
}

export const getServerSideProps = async (
  ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>,
) => {
  const supabase = serverClient({ req: ctx.req, res: ctx.res });
  const { data: userData } = await supabase.auth.getUser();
  const { data: chat, error } = await supabase.from('chats').select('*');

  if (userData.user && chat) {
    return {
      redirect: {
        destination: `/chats/${chat[0].id}`,
        permanent: false,
      },
    };
  }

  if (error) {
    console.error(error);
  }

  return {
    props: {},
  };
};
