import { NextPage } from "next";
import { FormEvent, useState, useEffect } from "react";
import Head from "next/head";
import Router from "next/router";
import Cookies from "universal-cookie";

const LoginPage: NextPage = () => {
  const cookies = new Cookies();

  useEffect(() => {
    const auth = cookies.get("auth");
    if (auth) Router.push("player");
  });

  const [email_or_username, setEOU] = useState("");
  const [password, setPassword] = useState("");

  const [alert, setAlert] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    fetch("api/user/login", {
      method: "POST",
      body: JSON.stringify({ email_or_username, password }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) return setAlert(data.message);

        cookies.set("auth", data.auth);
        Router.push(`player/user/${data.user._id}`)
      });
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
        <input type="submit" value="Login" />
      </form>
      <h2 id="alert" className="text-red-800">{alert}</h2>
    </div>
  );
};

export default LoginPage;