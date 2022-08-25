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
  const [musicList, setMusicList] = useState<IMusicList>();

  const UpdateInfo = () => {
    if (props.authorized) {
      return (
        <button className="h-12 w-28 text-white font-semibold border border-blue-900 bg-dark-gray-800 hover:bg-dark-gray-600 rounded-xl">
          <Link href={`${props.data._id}/edit`}>
            Edit Profile
          </Link>
        </button>
      )
    } else return null
  }

  return (
    <div className="h-screen w-screen bg-primary bg-gradient-to-br from-blue-900/30 text-white/80">
      <Head>
        <title>{`${props.data.username} - Listeningto`}</title>

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed&display=swap" rel="stylesheet" /> 
        <link href="https://fonts.googleapis.com/css2?family=Fjalla+One&display=swap" rel="stylesheet" /> 
      </Head>

      <div className="container">
        <div className="relative">
          <div className="flex w-screen bg-gradient-to-b border-b-2 border-blue-900">
            <div className="ml-12 mt-20 mb-8 h-64 w-64 max-w-full">
              <Image src={process.env.NEXT_PUBLIC_API_URL + props.data.profilePic} width={256} height={256} layout={"responsive"} className="rounded-full" />
            </div>
            <h1 className="mt-48 ml-12 text-5xl antialiased text-white/100">{props.data.username}</h1>
            <div className="absolute bottom-10 right-0">
              <UpdateInfo />
            </div>
          </div>
        </div>

        <div className="mt-20 ml-20 bg-gray-800 bg-gradient-to-br from-gray-600 border-8 border-gray-900 p-4">
          <h1 className="mb-2 text-2xl font-fjalla border-b-4 border-gray-900">Músicas</h1>
          <div id="musics" className="">
            <MusicList musics={props.musics} setMusicList={setMusicList} />
          </div>
        </div>
      </div>
''
      <Player musicList={musicList} setMusicList={setMusicList} />
    </div>
  );
};

export default UserPage;
