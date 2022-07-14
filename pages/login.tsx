import { NextPage } from "next";
import { FormEvent, useState, useEffect } from "react";
import Head from "next/head";
import Router from "next/router";
import Cookies from "universal-cookie";

import { UserCircleIcon, LockClosedIcon } from "@heroicons/react/outline"

const LoginPage: NextPage = () => {
  const cookies = new Cookies();

  // Redirecionamento caso o usuário já esteja logado
  useEffect(() => {
    const auth = cookies.get("auth");
    if (auth) Router.push("/");
  });

  // States pro form
  const [email_or_username, setEOU] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // State de error message
  const [alert, setAlert] = useState("");

  // Função que cuida da data do formulário
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

        cookies.set("auth", data.auth, { expires: rememberMe ? new Date(Date.now() + 315360000000) : undefined });
        Router.push(`user/${data.user._id}`)
      });
  };

  return (
    <div className="h-screen w-screen bg-dark-gray-900">
      <Head>
        <title>Login - Listeningto</title>
      </Head>

      <div className="container m-auto h-screen flex flex-col items-center">
        <div className="border-2 border-dark-gray-800 rounded p-8 m-auto">
          <form onSubmit={(e) => handleSubmit(e)}>
            <div className="block m-4">
              <div className="bg-white flex items-center w-auto h-12 rounded">
                <label htmlFor="email_or_username">
                  <UserCircleIcon className="float-left m-1 w-8 h-8" />
                </label>

                <input
                  type="text"
                  placeholder="Username or email address"
                  onChange={(e) => setEOU(e.target.value)}
                  className="bg-white border-none appearance-none focus:ring-0"
                  name="email_or_username"
                />
              </div>
            </div>

            <div className="block m-4">
              <div className="bg-white flex items-center w-auto h-12 rounded">
                <label htmlFor="password">
                  <LockClosedIcon className="float-left m-1 w-8 h-8" />
                </label>
                
                <input
                  type="password"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white border-none appearance-none focus:ring-0"
                  name="password"
                />
              </div>
            </div>

            <div className="block m-4">
              <input 
                type="checkbox"
                checked={rememberMe}
                onChange={() => { setRememberMe(!rememberMe) }}
                name="rememberMe"
                className="appearance-none rounded accent-blue-900"
              />
              <label className="text-white ml-2" htmlFor="rememberMe">Remember me</label>
            </div>

            <div className="block m-4">
              <input 
                type="submit" 
                value="Login" 
                className="w-72 h-12 bg-blue-800 hover:bg-blue-900 hover:cursor-pointer text-white font-semibold rounded" 
              />
            </div>
          </form>
          <h2 id="alert" className="text-red-800">{alert}</h2>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
