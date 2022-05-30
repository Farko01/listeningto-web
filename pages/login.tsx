import type { NextPage } from "next";
import { FormEvent, useState } from "react";
import Head from "next/head";

const LoginPage: NextPage = () => {
  const [email_or_username, setEOU] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    fetch("api/user/login", {
      method: "POST",
      body: JSON.stringify({ email_or_username, password }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => console.log(data));
  };

  return (
    <div>
      <Head>
        <title>Login - Listeningto</title>
      </Head>

      <form onSubmit={(e) => handleSubmit(e)}>
        <input
          type="text"
          placeholder="Username or email address"
          onChange={(e) => setEOU(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <input type="submit" value={"Login"} />
      </form>
      <></>
    </div>
  );
};

export default LoginPage;
