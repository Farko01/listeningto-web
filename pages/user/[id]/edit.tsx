import type { NextPage, GetServerSideProps } from "next";
import { ChangeEvent, useEffect, useState } from "react";
import { verify } from "jsonwebtoken";
import { useRouter } from "next/router";
import Head from 'next/head';
import Image from "next/image";
import IUser from "../../../interfaces/user.interface";
import { useUpdateMisc } from "../../../contexts/MiscContext";
import { FiUpload } from "react-icons/fi";
import { toast } from 'react-toastify';

interface IAuthToken {
  id: string;
}

interface IAppProps {
  auth: string;
  data: IUser;
}

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
  if (req.cookies.auth) {
    const decoded = verify(req.cookies.auth, process.env.JWT_SECRET!) as IAuthToken;
    if (decoded.id != params!.id) {
      return {
        props: {},
        redirect: {
          destination: "/",
          permanent: false
        }
      }
    }
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL}/user/${params!.id}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${req.cookies.auth}` } });
  const data = await res.json();

  return {
    props: {
      auth: req.cookies.auth,
	    data: data
    },
  };
};

const EditPage: NextPage<IAppProps> = (props) => {
  // Deactivating the player and activating the navbar
  const { setPlayer, setNavbar } = useUpdateMisc()!;
  setPlayer(false);
  setNavbar(true);
  
  const router = useRouter();
  const { id } = router.query;

  const [profilePic, setProfilePic] = useState<any>(process.env.NEXT_PUBLIC_API_URL + props.data.profilePic);
  const [profilePicFile, setProfilePicFile] = useState<File>();
  const [username, setUsername] = useState<string>();
  const [email, setEmail] = useState<string>();

  const [password, setPassword] = useState<string>();
  const [confirmPassword, setConfirmPassword] = useState<string>();

  // Alterar foto exibida
  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    setProfilePicFile(e.target.files![0]);
    reader.readAsDataURL(e.target.files![0]);

    reader.onload = () => {
      if (reader.readyState == 2) setProfilePic(reader.result);
    }
  }

  const handleSubmit = async () => {
    if (!username && !password && !profilePicFile) return;

    // Conferir senhas
    if (password !== confirmPassword) return toast.error("As senhas não coincidem");

    // Criar formdata
    const formdata = new FormData();
    username ? formdata.append("username", username) : null;
    email ? formdata.append("email", email) : null;
    password ? formdata.append("password", password) : null;
    profilePicFile ? formdata.append("profilePic", profilePicFile) : null;

    // Atualizar database
    fetch("/api/user", {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${props.auth}` },
      body: formdata
    }).then((res) => res.json()).then((data) => {
      if (data.message) throw new Error(data.message);

      toast.success("Alterações salvas.");
    }).catch((e: any) => {
      return toast.error(e.message);
    });
  }

  return (
    <div className="m-24 flex items-center justify-center">
      <Head>
        <title>Editar Perfil - Listeningto</title>
      </Head>

      <div className="w-5/6 h-5/6 bg-box shadow-xl shadow-black/50 relative">
        <div className="ml-16 mt-16 w-11/12">
          <h1 className="font-fjalla text-3xl mt-8 border-b-4 border-black/50">Editar perfil</h1>

          {/* Foto de perfil */}
          <div className="relative h-64 w-64 mt-8">
            <input id="file" type={"file"} onChange={(e) => handleImage(e)} className="hidden" />
            <label htmlFor="file" className="cursor-pointer">
              <Image src={profilePic} width={256} height={256} className="rounded-full block" />
              <div className="absolute top-0 left-0 h-full w-full rounded-full bg-black/60 flex flex-col items-center justify-center opacity-0 transition-opacity hover:opacity-100">
                <FiUpload size={100} className="text-gray-900/90" />
              </div>
            </label>
          </div>

          <div className="flex mt-8 border-b-4 border-black/50 pb-8">
            <div className="basis-1/2">
              <label htmlFor="username" className="text-lg">Nome de usuário</label>
              <input id="username" type="text" className="bg-transparent text-white block w-96 outline-0 border-0 border-b-2 mt-0.5 appearance-none focus:ring-0" onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="basis-1/2">
              <label htmlFor="email" className="text-lg">Endereço de email</label>
              <input id="email" type="email" className="bg-transparent text-white block w-96 outline-0 border-0 border-b-2 mt-0.5 appearance-none focus:ring-0" onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-fjalla mt-4">Senha</h1>

            <div className="[&>*]:py-0.5 [&>*>*]:my-0.5 mt-4 mb-8">
              <div className="mt-1">
                <label htmlFor="new_pw text-sm">Senha nova</label>
                <input id="new_pw" type="password" className="bg-transparent text-white block w-96 outline-0 border-0 border-b-2 appearance-none focus:ring-0" onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="mt-1">
                <label htmlFor="c_new_pw text-sm">Confirmar senha nova</label>
                <input id="c_new_pw" type="password" className="bg-transparent text-white block w-96 outline-0 border-0 border-b-2 appearance-none focus:ring-0" onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute w-full pr-16 bottom-4 [&>*]:mx-2">
          <button className="float-right border border-blue-900 font-semibold rounded-xl py-2 px-4 bg-primary hover:bg-primary/5" onClick={() => handleSubmit()}>Salvar alterações</button>
          <button className="float-right border border-blue-900 font-semibold rounded-xl py-2 px-4 bg-gray-900 hover:bg-gray-700" onClick={() => router.push(`../${id}`)}>Cancelar</button>
        </div>   
      </div>
    </div>
  );
};

export default EditPage;
