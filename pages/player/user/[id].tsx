import type { NextPage, GetServerSideProps } from "next";
import { verify } from "jsonwebtoken";
import axios from "axios";
import Head from "next/head";
import Image from "next/image";
import cookie from "cookie";
import Link from 'next/link';

import CardGrid from '../../../components/CardGrid';
import IMusic from "../../../interfaces/music.interface";
import IAlbum from "../../../interfaces/album.interface";
import IPlaylist from "../../../interfaces/playlist.interface";

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
  const userdata_url = `${process.env.API_URL}/user/${params!.id}`;
  const userdata = await axios.get(userdata_url);

  // Request de músicas
  const musics_url = `${process.env.API_URL}/user/${params!.id}/musics`;
  const musics = await axios.get(musics_url);

  // Request de álbuns
  const albuns_url = `${process.env.API_URL}/user/${params!.id}/albuns`;
  const albuns = await axios.get(albuns_url);

  // Request de playlists
  const playlists_url = `${process.env.API_URL}/user/${params!.id}/playlists`;
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
        <Link href={`${props.data._id}/edit`}>
          Edit Profile
        </Link>
      )
    } else return null
  }

  return (
    <>
      <Head>
        <title>{props.data.username} - Listeningto</title>
      </Head>

      <h1>Usuário foda</h1>
      <Image
        src={"http://localhost:8080" + props.data.profilePic}
        width={200}
        height={200}
      />
      <h2>Nome: {props.data.username}</h2>
      <h2>{props.authorized ? "O usuário logado é o mesmo que o dessa página" : "O usuário logado não é o mesmo que o dessa página" }</h2>

      <UpdateInfo />
      <CardGrid height={1} width={1} items={props.musics} />
    </>
  );
};

export default UserPage;
