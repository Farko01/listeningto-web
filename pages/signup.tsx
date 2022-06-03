import type { NextPage } from "next";
import Head from "next/head";
import { FormEvent, useState, useEffect } from "react";
import Router from "next/router";
import Cookies from "universal-cookie";

const SignupPage: NextPage = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [cPassword, setCPassword] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <>
      <Head>
        <title>Sign up - Listeningto</title>
      </Head>

      <form onSubmit={(e) => handleSubmit(e)}>
        <input
          type="email"
          placeholder="Email address"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm password"
          onChange={(e) => setCPassword(e.target.value)}
        />
        <input type="submit" value="Sign up" />
      </form>
    </>
  );
};

export default SignupPage;
