import type { NextPage, GetServerSideProps } from "next";
import { verify } from "jsonwebtoken";
import axios from "axios";
import Head from "next/head";
import Image from "next/image";
import cookie from "cookie";
import Link from 'next/link';

import { IMusic } from "../../interfaces/music.interface";
import { IAlbum } from "../../interfaces/album.interface";
import { IPlaylist } from "../../interfaces/playlist.interface";

import MusicList from '../../components/MusicList';
import Card from "../../components/Card";
import { useUpdateMisc } from "../../contexts/MiscContext";

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
  albums: IAlbum[];
  playlists: IPlaylist[];
}

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
  // Este valor determina se o usuário acessando a página é aquele a quem a página se refere, dando permissão para
  // atualizar informações a partir dela
  let authorized: boolean = false;
  if (req.cookies.auth) {
    const decoded = verify(req.cookies.auth, process.env.JWT_SECRET!) as IAuthToken;
    if (decoded.id == params!.id) authorized = true;
  }

  // Request de data do usuário
  const user_url = `${process.env.NEXT_PUBLIC_API_URL}/user/${params!.id}`;
  const user = await axios.get(user_url);

  // Request de músicas
  const musics_url = `${process.env.NEXT_PUBLIC_API_URL}/user/${params!.id}/musics`;
  const musics = await axios.get(musics_url);

  // Request de álbuns
  const albums_url = `${process.env.NEXT_PUBLIC_API_URL}/user/${params!.id}/albums`;
  const albums = await axios.get(albums_url);

  // Request de playlists
  const playlists_url = `${process.env.NEXT_PUBLIC_API_URL}/user/${params!.id}/playlists`;
  const playlists = await axios.get(playlists_url, authorized ? { headers: { Authorization: `Bearer ${req.cookies.auth}` } } : undefined);

  return {
    props: {
      authorized: authorized,
      data: user.data,
      musics: musics.data.musics,
      albums: albums.data.albuns,
      playlists: playlists.data.playlists
    },
  };
};

const UserPage: NextPage<IAppProps> = (props) => {
  // Activating the player and navbar
  const { setPlayer, setNavbar } = useUpdateMisc()!;
  setPlayer(true);
  setNavbar(true);

  const ShowAlbums = () => {
    if (props.albums.length > 0) {
      return (
        <div className="flex flex-wrap w-full [&>*]:m-2">
          { props.albums.map((album) => {
            return <Card image={ process.env.NEXT_PUBLIC_API_URL + album.cover } text={ album.name } subtext="Álbum" link={"/album/" + album._id } />
          }) }
        </div>
      )
    } else return <h2>Este usuário não possui nenhum álbum</h2>
  }

  const ShowPlaylists = () => {
    if (props.playlists.length > 0) {
      return (
        <div className="flex flex-wrap w-full [&>*]:m-2">
          { props.playlists.map((playlist) => {
            return <Card image={ process.env.NEXT_PUBLIC_API_URL + playlist.cover } text={ playlist.name } subtext="Playlist" link={"/playlist/" + playlist._id } />
          }) }
        </div>
      )
    } else return <h2>Este usuário não possui nenhuma playlist</h2>
  }

  return (
    <div>
      <Head>
        <title>{props.data.username} - Listeningto</title>
      </Head>

      <div>
        {/* Header */}
        <div className="relative flex w-full border-b-2 border-blue-900 h-96">
          <div className="mt-20 ml-20 h-64 w-64">
            <Image src={process.env.NEXT_PUBLIC_API_URL + props.data.profilePic} width={256} height={256} className="rounded-full" />
          </div>
          <h1 className="text-5xl antialiased mt-48 ml-16">{props.data.username}</h1>

          <div className="absolute bottom-10 right-40">
            {
              props.authorized ?
              <button className="h-12 w-28 text-white font-semibold border border-blue-900 rounded-xl">
                <Link href={"/user/" + props.data._id + "/edit"}>
                  Editar Perfil
                </Link>
              </button>
              : null
            }
          </div>
        </div>

        {/* Conteúdo */}
        <div className="container w-4/5 ml-20">
          {/* Músicas */}
          <div>
            <div className="mt-16 bg-box p-4 shadow-xl shadow-black/50">
              <h1 className="mb-2 text-2xl font-fjalla border-b-4 border-gray-900">Músicas</h1>
              { props.musics.length > 0 ? <MusicList musics={props.musics} showMore={true} /> : <h2>Este usuário não possui nenhuma música</h2> }
            </div>
          </div>

          {/* Álbuns */}
          <div>
            <div className="mt-12 bg-box p-4 shadow-xl shadow-black/50">
              <h1 className="mb-2 text-2xl font-fjalla border-b-4 border-gray-900">Álbuns</h1>
              { ShowAlbums() }
            </div>
          </div>

          {/* Playlists */}
          <div>
            <div className="mt-12 bg-box p-4 shadow-xl shadow-black/50">
              <h1 className="mb-2 text-2xl font-fjalla border-b-4 border-gray-900">Playlists</h1>
              { ShowPlaylists() }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
