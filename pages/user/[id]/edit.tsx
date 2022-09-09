import type { NextPage, GetServerSideProps } from "next";
import { ChangeEvent, useEffect, useState } from "react";
import cookie from "cookie";
import { verify } from "jsonwebtoken";
import { useRouter } from "next/router";
import axios from "axios";
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
  authorized: boolean;
  auth: string;
  data: IUser;
}

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
  let authorized: boolean = false;
  let parsedCookies: any;

  if (req.headers.cookie) {
    parsedCookies = cookie.parse(req.headers.cookie);

    if (parsedCookies.auth) {
      const decoded = verify(parsedCookies.auth, process.env.JWT_SECRET!) as IAuthToken;
      if (decoded.id == params!.id) authorized = true;
    }
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL}/user/${params!.id}`;
  const res = await axios.get(url, authorized ? { headers: { Authorization: `Bearer ${parsedCookies!.auth}` } } : undefined);

  return {
    props: {
      authorized: authorized,
      auth: parsedCookies.auth,
	    data: res.data
    },
  };
};

const EditPage: NextPage<IAppProps> = (props) => {
  // Deactivating the player
  const { setPlayer } = useUpdateMisc()!;
  setPlayer(false);
  
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!props.authorized) router.push(`../${id}`);
  });

  const [profilePic, setProfilePic] = useState<any>(process.env.NEXT_PUBLIC_API_URL + props.data.profilePic);
  const [profilePicFile, setProfilePicFile] = useState<File>();
  const [username, setUsername] = useState<string>();

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
    <div className="h-full w-full relative">
      <Head>
        <title>Editar Perfil - Listeningto</title>
      </Head>

      <div className="container ml-20 w-4/5 pt-16 pb-20">
        {/* Foto de perfil */}
        <div>
          <h1 className="text-2xl font-merriweather">Foto de perfil</h1>
          <div className="relative h-64 w-64 mt-4">
            <input id="file" type={"file"} onChange={(e) => handleImage(e)} className="hidden" />
            <label htmlFor="file" className="cursor-pointer">
              <Image src={profilePic} width={256} height={256} className="rounded-full block" />
              <div className="absolute top-0 left-0 h-full w-full rounded-full bg-black/60 flex flex-col items-center justify-center opacity-0 transition-opacity hover:opacity-100">
                <FiUpload size={100} className="text-gray-900/90" />
              </div>
            </label>
          </div>

          <div className="mt-4 [&>*]:p-0.5 text-white/90">
            <p className="text-base">Clique na imagem para escolher uma nova foto de perfil</p>
            <p className="text-sm">Tamanho recomendado: 256x256</p>
          </div>
        </div>

        {/* Nome de usuário */}
        <div className="mt-4">
          <h1 className="text-2xl font-merriweather">Nome de usuário</h1>
          <input type="text" className="bg-transparent text-white block w-auto border border-blue-900 mt-0.5 rounded-lg appearance-none focus:ring-0" onChange={(e) => setUsername(e.target.value)} />
        </div>

        {/* Senha */}
        <div className="mt-4 [&>*]:py-0.5 [&>*>*]:my-0.5">
          <h1 className="text-2xl font-merriweather">Senha</h1>
          <div className="mt-1">
            <label htmlFor="new_pw text-sm">Senha nova</label>
            <input id="new_pw" type="password" className="bg-transparent text-white block w-auto border border-blue-900 rounded-lg appearance-none focus:ring-0" onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="mt-1">
            <label htmlFor="c_new_pw text-sm">Confirmar senha nova</label>
            <input id="c_new_pw" type="password" className="bg-transparent text-white block w-auto border border-blue-900 rounded-lg appearance-none focus:ring-0" onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="absolute w-full bottom-10 [&>*]:mx-4">
        <button className="float-right border border-blue-900 font-semibold rounded-xl py-2 px-4 bg-primary hover:bg-primary/5" onClick={() => handleSubmit()}>Salvar alterações</button>
        <button className="float-right border border-blue-900 font-semibold rounded-xl py-2 px-4 bg-gray-900 hover:bg-gray-700" onClick={() => router.push(`../${id}`)}>Cancelar</button>
      </div>
    </div>
  );
};

export default EditPage;
