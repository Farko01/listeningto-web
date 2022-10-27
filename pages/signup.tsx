import type { NextPage } from "next";
import Head from "next/head";
import { useState, useEffect } from "react";
import Router from "next/router";
import Cookies from "universal-cookie";
import Image from 'next/image';
import { VscAccount } from 'react-icons/vsc';
import { HiOutlineMail } from 'react-icons/hi';
import { AiOutlineLock } from 'react-icons/ai';
import Link from "next/link";
import { useUpdateMisc } from "../contexts/MiscContext";
import { toast } from "react-toastify";

const SignupPage: NextPage = () => {
  // Deactivating the player and navbar
  const { setPlayer, setNavbar } = useUpdateMisc()!;
  setPlayer(false);
  setNavbar(false);

  const cookies = new Cookies();

  useEffect(() => {
    const auth = cookies.get("auth");
    if (auth) Router.push("/");
  });

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [cPassword, setCPassword] = useState("");

  const handleSubmit = async () => {
    if (password !== cPassword) return toast.error("As senhas são diferentes");

    fetch("/api/user", {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
      headers: { "Content-Type": "application/json" },
    })
    .then((res) => res.json())
    .then((data) => {
      if (data.message) return toast.error(data.message);

      cookies.set("auth", data.auth, { expires: new Date(Date.now() + 315360000000), path: "/", sameSite: "none" });
      Router.push(`/user/${data.user._id}`);
    });
  };
  
  return (
    <div>
      <Head>
        <title>Sign up - Listeningto</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-primary w-11/12 md:w-1/4 p-8 border-2 border-white/20">
          <div className="flex items-center justify-center my-8">
            <Image src={"/logo.png"} width={128} height={128} className="mx-auto" />
          </div>
          <h1 className="text-white/80 text-center mb-8 -mt-4 text-2xl">Sign up</h1>

          <div className="w-full flex flex-col items-center [&>*]:my-2">
            <div className="w-full bg-white rounded-md flex items-center h-12">
              <VscAccount size={36} className="text-black text-center ml-2" />
              <input placeholder="Nome de usuário" value={username} onChange={(e) => setUsername(e.target.value)} type={"text"} className="rounded-md w-full text-black border-none appearance-none focus:ring-0 font-light" />
            </div>
            <div className="w-full bg-white rounded-md flex items-center h-12">
              <HiOutlineMail size={36} className="text-black text-center ml-2" />
              <input placeholder="Endereço de email" value={email} onChange={(e) => setEmail(e.target.value)} type={"email"} className="rounded-md w-full text-black border-none appearance-none focus:ring-0 font-light" />
            </div>
            <div className='w-full bg-white rounded-md flex items-center h-12'>
              <AiOutlineLock size={36} className="text-black text-center ml-2" />
              <input placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} type={"password"} className="rounded-md w-full text-black border-none appearance-none focus:ring-0 font-light" />
            </div>
            <div className='w-full bg-white rounded-md flex items-center h-12'>
              <AiOutlineLock size={36} className="text-black text-center ml-2" />
              <input placeholder="Confirme a senha" value={cPassword} onChange={(e) => setCPassword(e.target.value)} type={"password"} className="rounded-md w-full text-black border-none appearance-none focus:ring-0 font-light" />
            </div>
            <button className="w-full h-12 bg-blue-900/60 hover:bg-blue-900/80 hover:cursor-pointer text-white font-semibold rounded" onClick={handleSubmit}>Registre-se</button>
          </div>
          <h2 className="text-white/80 text-center mt-2">Já possui uma conta? <Link href="/login"><a className="text-blue-900/60 hover:text-blue-900/80">Entre!</a></Link></h2>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
