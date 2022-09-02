import type { NextPage, GetServerSideProps } from "next";
import { verify } from "jsonwebtoken";
import axios from "axios";
import Head from "next/head";
import Image from "next/image";
import cookie from "cookie";
import Link from 'next/link';
import { useState } from "react";

import IMusic from "../../interfaces/music.interface";
import IAlbum from "../../interfaces/album.interface";
import IPlaylist from "../../interfaces/playlist.interface";
import IMusicList from "../../interfaces/musicList.interface";

import MusicList from '../../components/MusicList';
import Player from '../../components/Player';
import { usePlayer, useUpdatePlayer } from "../../contexts/PlayerContext";
import Card from "../../components/Card";

interface IAuthToken {
  id: string;
}

interface IAppProps {
  authorized: boolean;
  data: {
    _id: string;
    username: string;
    profilePic: string;
  };
  musics: IMusic[];
  albuns: IAlbum[];
  playlists: IPlaylist[];
}

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
  let parsedCookies: any;

  // Este valor determina se o usuário acessando a página é aquele a quem a página se refere, dando permissão para
  // atualizar informações a partir dela
  let authorized: boolean = false;

  if (req.headers.cookie) {
    parsedCookies = cookie.parse(req.headers.cookie);

    if (parsedCookies.auth) {
      const decoded = verify(parsedCookies.auth,process.env.JWT_SECRET!) as IAuthToken;
      if (decoded.id == params!.id) authorized = true;
    }
  }

  // Request de data do usuário
  const userdata_url = `${process.env.NEXT_PUBLIC_API_URL}/user/${params!.id}`;
  const userdata = await axios.get(userdata_url);

  // Request de músicas
  const musics_url = `${process.env.NEXT_PUBLIC_API_URL}/user/${params!.id}/musics`;
  const musics = await axios.get(musics_url);

  // Request de álbuns
  const albuns_url = `${process.env.NEXT_PUBLIC_API_URL}/user/${params!.id}/albums`;
  const albuns = await axios.get(albuns_url);

  // Request de playlists
  const playlists_url = `${process.env.NEXT_PUBLIC_API_URL}/user/${params!.id}/playlists`;
  const playlists = await axios.get(playlists_url, authorized ? { headers: { Authorization: `Bearer ${parsedCookies!.auth}` } } : undefined);

  return {
    props: {
      authorized: authorized,
      data: userdata.data,
      musics: musics.data.musics,
      albuns: albuns.data,
      playlists: playlists.data
    },
  };
};

const UserPage: NextPage<IAppProps> = (props) => {
  const UpdateInfo = () => {
    if (props.authorized) {
      return (
        <button className="h-12 w-28 text-white font-semibold border border-blue-900 bg-dark-gray-800 hover:bg-dark-gray-600 rounded-xl">
          <Link href={`${props.data._id}/edit`}>
            Editar Perfil
          </Link>
        </button>
      )
    } else return null
  }

  return (
    <div className="w-screen h-screen bg-primary bg-gradient-to-br from-blue-900/60 text-white">
      <Head>
        <title>{props.data.username} - Listeningto</title>
      </Head>

      <div className="flex flex-col">
        {/* Header */}
        <div className="relative flex w-full border-b-2 border-blue-900 h-96">
          <div className="mt-20 ml-20 h-64 w-64">
            <Image src={process.env.NEXT_PUBLIC_API_URL + props.data.profilePic} width={256} height={256} className="rounded-full" />
          </div>
          <h1 className="text-5xl antialiased mt-48 ml-16">{props.data.username}</h1>

          <div className="absolute bottom-10 right-40">
            <UpdateInfo />
          </div>
        </div>

        {/* Conteúdo */}
        <div className="container ml-20">
          {/* Músicas */}
          <div>
            <div className="mt-16 bg-white/10 p-4 shadow-xl shadow-black/50">
            <h1 className="mb-2 text-2xl font-fjalla border-b-4 border-gray-900">Músicas</h1>
            <MusicList musics={props.musics} />
          </div>
        </div>
      </div>

      {/* Player */}
      <Player />
    </div>
  </div>
);
};

export default UserPage;
