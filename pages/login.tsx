import { NextPage } from "next";
import { useState, useEffect } from "react";
import Head from "next/head";
import Router from "next/router";
import Cookies from "universal-cookie";
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';

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

  // Função que cuida da data do formulário
  const handleSubmit = async () => {
    fetch("/api/user/login", {
      method: "POST",
      body: JSON.stringify({ email_or_username, password }),
      headers: { "Content-Type": "application/json" },
    }).then((res) => res.json())
    .then((data) => {
      if (data.message) return toast.error(data.message);

      cookies.set("auth", data.auth, { expires: rememberMe ? new Date(Date.now() + 315360000000) : undefined, path: "/", sameSite: "none" });
      Router.push(`user/${data.user._id}`)
    });
  };

  return (
    <div>
      <Head>
        <title>Login - Listeningto</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-primary w-11/12 md:w-1/4 p-8 border-2 border-white/20">
          <div className="flex items-center justify-center my-8">
            <Image src={"/logo.png"} width={128} height={128} className="mx-auto" alt="" />
          </div>
          <h1 className="text-white/80 text-center mb-8 -mt-4 text-2xl">Login</h1>

          <div className="w-full flex flex-col items-center [&>*]:my-2">
            <div className="w-full bg-white rounded-md flex items-center h-12">
              <VscAccount size={36} className="text-black text-center ml-2" />
              <input placeholder="Email ou nome de usuário" value={email_or_username} onChange={(e) => { setEOU(e.target.value) }} type={"text"} className="rounded-md w-full text-black border-none appearance-none focus:ring-0 font-light" />
            </div>
            <div className='w-full bg-white rounded-md flex items-center h-12'>
              <AiOutlineLock size={36} className="text-black text-center ml-2" />
              <input placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} type={"password"} className="rounded-md w-full text-black border-none appearance-none focus:ring-0 font-light" />
            </div>
            <div className="flex items-center">
              <input type={"checkbox"} checked={rememberMe} onChange={() => { const prevVal = rememberMe; setRememberMe(!prevVal) }} className="rounded accent-blue-900" />
              <p className="text-white/80 ml-2">Lembrar de mim</p>
            </div>
            <button className="w-full h-12 bg-blue-900/60 hover:bg-blue-900/80 hover:cursor-pointer text-white font-semibold rounded" onClick={handleSubmit}>Login</button>
          </div>
          <h2 className="text-white/80 text-center mt-2">Novo aqui? <Link href="/signup"><a className="text-blue-900/60 hover:text-blue-900/80">Crie uma conta!</a></Link></h2>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;