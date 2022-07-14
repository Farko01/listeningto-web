import type { NextPage } from "next";
import Head from "next/head";
import { FormEvent, useState, useEffect } from "react";
import Router from "next/router";
import Cookies from "universal-cookie";

const SignupPage: NextPage = () => {
  const cookies = new Cookies();

  useEffect(() => {
    const auth = cookies.get("auth");
    if (auth) Router.push("/");
  });

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [cPassword, setCPassword] = useState("");

  const [alert, setAlert] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== cPassword) return setAlert("The passwords are different");

    fetch("/api/user/signup", {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
      headers: { "Content-Type": "application/json" },
    })
    .then((res) => res.json())
    .then((data) => {
      if (data.message) return setAlert(data.message);

      cookies.set("auth", data.auth);
      Router.push(`user/${data.user._id}`);
    });
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
      <h2 id="alert" className="text-red-800">{alert}</h2>
    </>
  );
};

export default SignupPage;
