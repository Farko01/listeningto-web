import type { NextPage } from "next";
import Head from "next/head";
import { FormEvent, useState, useEffect } from "react";
import Router from "next/router";
import Cookies from "universal-cookie";
import Image from 'next/image';

import { VscAccount } from 'react-icons/vsc';
import { HiOutlineMail } from 'react-icons/hi';
import { AiOutlineLock } from 'react-icons/ai';
import { BsArrowClockwise } from 'react-icons/bs';
import Link from "next/link";

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

    if (password !== cPassword) return setAlert("As senhas são diferentes");

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
    <div className="h-screen w-screen bg-primary bg-gradient-to-br from-blue-900/30">
      <Head>
        <title>Sign up - Listeningto</title>
      </Head>

      <div className="container m-auto h-screen flex flex-col items-center">
        <div className="border-2 border-white/20 bg-primary rounded p-8 m-auto w-[28%]">
          <div className="flex items-center justify-center my-8">
            <Image src={"http://localhost:3000/favicon.ico"} width={128} height={128} className="mx-auto" />
          </div>
          <h1 className="text-white/80 text-center mb-8 -mt-4 text-2xl">Sign up</h1>

          <form onSubmit={(e) => handleSubmit(e)}>
            <div className="block m-4">
              <div className="bg-white flex items-center w-auto h-12 rounded">
                <label htmlFor="username">
                  <VscAccount size={36} className="float-left m-1" />
                </label>
                  
                <input
                  type="text"
                  placeholder="Nome de usuário"
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white border-none appearance-none focus:ring-0"
                  name="username"
                />
              </div>
            </div>

            <div className="block m-4">
              <div className="bg-white flex items-center w-auto h-12 rounded">
                <label htmlFor="email">
                  <HiOutlineMail size={36} className="float-left m-1" />
                </label>

                <input
                  type="email"
                  placeholder="Endereço de email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white border-none appearance-none focus:ring-0"
                  name="email"
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
                  className="bg-white border-none appearance-none focus:ring-0"
                  name="password"
                />
              </div>
            </div>

            <div className="block m-4">
              <div className="bg-white flex items-center w-auto h-12 rounded">
                <label htmlFor="CPassword">
                  <BsArrowClockwise size={36} className="float-left m-1" />
                </label>
                  
                <input
                  type="password"
                  placeholder="Confirme a senha"
                  onChange={(e) => setCPassword(e.target.value)}
                  className="bg-white border-none appearance-none focus:ring-0"
                  name="CPassword"
                />
              </div>
            </div>

            <div className="block m-4">
              <input 
                type="submit" 
                value="Registre-se" 
                className="w-full h-12 bg-blue-900/60 hover:bg-blue-900/80 hover:cursor-pointer text-white font-semibold rounded" 
              />
            </div>
          </form>
          <h2 className="text-white/80 text-center mt-2">Já possui uma conta? <Link href="/login"><a className="text-blue-900/60 hover:text-blue-900/80">Entre!</a></Link></h2>
          <h2 id="alert" className="text-red-800 text-center mt-2">{alert}</h2>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
