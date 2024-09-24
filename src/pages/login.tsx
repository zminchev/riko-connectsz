import { useRouter } from "next/router";
import { useState } from "react";

import { createClient } from "src/utils/supabase/component";

export default function LoginPage() {
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
    router.push("/chats");
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
    router.push("/chats");
  }

  return (
    <main className="h-screen w-full">
      <form className="h-full flex flex-col w-full p-10 justify-center items-center">
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label htmlFor="password">First Name:</label>
        <input
          id="first-namee"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <label htmlFor="password">Last Name:</label>
        <input
          id="last-name"
          type="text"
          value={lastName}
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
