import type { NextPage } from "next";
import { FormEvent, useState } from "react";
import Head from "next/head";
import axios from "axios";

const LoginPage: NextPage = () => {

  const [email_or_username, setEOU] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    return;
  }

  return (
    <>
      <Head>
        <title>Login - Listeningto</title>
      </Head>

      <form onSubmit={(e) => handleSubmit(e) }>
        <input type="text" placeholder="Username or email address" onChange={(e) => setEOU(e.target.value)} />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <input type="submit" />
      </form>
    </>
  )
}

export default LoginPage;