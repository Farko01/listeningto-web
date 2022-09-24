import { NextPage } from "next";
import { FormEvent, useState, useEffect } from "react";
import Head from "next/head";
import Router from "next/router";
import Cookies from "universal-cookie";
import Image from 'next/image';
import Link from 'next/link';

import { VscAccount } from 'react-icons/vsc';
import { AiOutlineLock } from 'react-icons/ai';
import { useUpdateMisc } from "../contexts/MiscContext";

const LoginPage: NextPage = () => {
  // Deactivating the player and navbar
  const { setPlayer, setNavbar } = useUpdateMisc()!;
  setPlayer(false);
  setNavbar(false);

  
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

    fetch("/api/user/login", {
      method: "POST",
      body: JSON.stringify({ email_or_username, password }),
      headers: { "Content-Type": "application/json" },
    }).then((res) => res.json())
    .then((data) => {
      if (data.message) return setAlert(data.message);

      cookies.set("auth", data.auth, { expires: rememberMe ? new Date(Date.now() + 315360000000) : undefined });
      Router.push(`user/${data.user._id}`)
    });
  };

  return (
    <div className="text-black">
      <Head>
        <title>Login - Listeningto</title>
      </Head>

      <div className="h-screen flex items-center justify-center">
        <div className="border-2 border-white/20 bg-primary rounded p-8 m-auto w-[28%]">
          <div className="flex items-center justify-center my-8">
            <Image src={"http://localhost:3000/favicon.ico"} width={128} height={128} className="mx-auto" />
          </div>
          <h1 className="text-white/80 text-center mb-8 -mt-4 text-2xl">Login</h1>
          <form onSubmit={(e) => handleSubmit(e)}>
            <div className="block m-4">
              <div className="bg-white flex items-center w-auto h-12 rounded">
                <label htmlFor="email_or_username">
                  <VscAccount size={36} className="float-left m-1" />
                </label>

                <input
                  type="text"
                  placeholder="Email ou nome de usuário"
                  onChange={(e) => setEOU(e.target.value)}
                  className="bg-white w-auto border-none appearance-none focus:ring-0"
                  name="email_or_username"
                />
              </div>
            </div>

            <div className="block m-4">
              <div className="bg-white flex items-center w-auto h-12 rounded">
                <label htmlFor="password">
                  <AiOutlineLock size={36} className="float-left m-1" />
                </label>
                
                <input
                  type="password"
                  placeholder="Senha"
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white w-auto border-none appearance-none focus:ring-0"
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
              <label className="text-white/80 ml-2" htmlFor="rememberMe">Lembrar de mim</label>
            </div>

            <div className="block m-4">
              <input 
                type="submit" 
                value="Login" 
                className="w-full h-12 bg-blue-900/60 hover:bg-blue-900/80 hover:cursor-pointer text-white font-semibold rounded" 
              />
            </div>
          </form>
          <h2 className="text-white/80 text-center mt-2">Novo aqui? <Link href="/signup"><a className="text-blue-900/60 hover:text-blue-900/80">Crie uma conta!</a></Link></h2>
          <h2 id="alert" className="text-red-800 text-center mt-2">{alert}</h2>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;