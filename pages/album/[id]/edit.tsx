import axios from "axios";
import { verify } from "jsonwebtoken";
import type { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import router from "next/router";
import { useEffect, useState } from "react";
import { FiUpload } from "react-icons/fi";
import { IAlbum } from "../../../interfaces/album.interface";
import Image from "next/image"
import { useUpdateMisc } from "../../../contexts/MiscContext";
import { BsXLg } from 'react-icons/bs';

interface IAuthToken {
  id: string;
}

interface IAppProps {
  authorized: boolean;
  auth: string;
  album: IAlbum;
}

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
  const album_url = `${process.env.NEXT_PUBLIC_API_URL}/album/${params!.id}`;
  const album = await axios.get(album_url);

  let authorized: boolean = false;
  if (req.cookies.auth) {
    const decoded = verify(req.cookies.auth, process.env.JWT_SECRET!) as IAuthToken;
    if (decoded.id == album.data.author._id) authorized = true;
  }

  return {
    props: {
      authorized: authorized,
      auth: req.cookies.auth ? req.cookies.auth : null,
	    album: album.data
    },
  };
};

const EditAlbum: NextPage<IAppProps> = (props) => {
  // Deactivating the player and activating the navbar
  const { setPlayer, setNavbar } = useUpdateMisc()!;
  setPlayer(false);
  setNavbar(true);
  
  useEffect(() => {
    if (!props.authorized) router.push(`../${ router.query.id }`);
  });

  const [cover, setCover] = useState<any>(process.env.NEXT_PUBLIC_API_URL + props.album.cover);
  const [albumName, setAlbumName] = useState<string>();
  const [order, setOrder] = useState<number[]>();
  const [musics, setMusics] = useState<string[]>();
  const [tags, setTags] = useState<string[]>();

  // Alterar foto exibida
  const [coverFile, setCoverFile] = useState<File>();

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    setCoverFile(e.target.files![0]);
    reader.readAsDataURL(e.target.files![0]);

    reader.onload = () => {
      if (reader.readyState == 2) setCover(reader.result);
    }
  }

  return (
    <div className="m-24 flex items-center justify-center">
      <Head>
        <title>Editar {props.album.name} - Listeningto</title>
      </Head>

      <div className="w-5/6 h-5/6 bg-white/10 relative">
        <div className="ml-16 mt-16 w-11/12">
          <h1 className="font-fjalla text-3xl mt-8 border-b-4 border-black/50">Editar "{props.album.name}"</h1>

          {/* Foto de perfil */}
          <div className="relative h-64 w-64 mt-8">
            <input id="file" type={"file"} onChange={(e) => handleImage(e)} className="hidden" />
            <label htmlFor="file" className="cursor-pointer">
              <Image src={cover} width={256} height={256} className="block" />
              <div className="absolute top-0 left-0 h-full w-full bg-black/60 flex flex-col items-center justify-center opacity-0 transition-opacity hover:opacity-100">
                <FiUpload size={100} className="text-gray-900/90" />
              </div>
            </label>
          </div>

          {/* Nome do álbum */}
          <div className="flex mt-8 border-b-4 border-black/50 pb-8">
            <div className="basis-1/2">
              <label htmlFor="albumName" className="text-lg">Nome do álbum</label>
              <input id="albumName" type="text" className="bg-transparent text-white block w-96 outline-0 border-0 border-b-2 mt-0.5 appearance-none focus:ring-0" onChange={(e) => setAlbumName(e.target.value)} />
            </div>
          </div>

          {/* Músicas */}

          <div className="absolute w-full pr-16 bottom-4 [&>*]:mx-2">
            <button className="float-right border border-blue-900 font-semibold rounded-xl py-2 px-4 bg-primary hover:bg-primary/5">Salvar alterações</button>
            <button className="float-right border border-blue-900 font-semibold rounded-xl py-2 px-4 bg-gray-900 hover:bg-gray-700" onClick={() => router.push(`../${ router.query.id }`)}>Cancelar</button>
          </div>   
        </div>
      </div>
    </div>
  )
}

export default EditAlbum