import type { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import { useUpdateMisc } from "../contexts/MiscContext";
import Image from 'next/image'
import { IMusic } from "../interfaces/music.interface";
import { IAlbum } from "../interfaces/album.interface";
import Card from "../components/Card";
import { verify } from "jsonwebtoken";
import IUser from "../interfaces/user.interface";
import { IPlaylist } from "../interfaces/playlist.interface";
import Link from "next/link";

interface IAuthToken {
  id: string;
}

interface IAppProps {
  musics: IMusic[];
  albums: IAlbum[];
  user: IUser | null;
  userPlaylists: IPlaylist[] | null;
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  let user: IUser | null = null;
  let userPlaylists: IPlaylist[] | null = null;
  if (req.cookies.auth) {
    const decoded = verify(req.cookies.auth, process.env.JWT_SECRET!) as IAuthToken;
    user = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/${decoded.id}`).then((res) => res.json());
    userPlaylists = (await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/${decoded.id}/playlists`, { headers: { "Authorization": `Bearer ${req.cookies.auth}` } }).then((res) => res.json())).playlists;
  }
  
  let musics = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/music/search`).then((res) => res.json());
  let albums = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/album/search`).then((res) => res.json());

  return {
    props: {
      musics: musics,
      albums: albums,
      user: user,
      userPlaylists: userPlaylists
    }
  }
}

const Home: NextPage<IAppProps> = ({ musics, albums, user, userPlaylists }) => {
  // Activating the player and navbar
  const { setPlayer, setNavbar } = useUpdateMisc()!;
  setPlayer(true);
  setNavbar(true);
  
  return (
    <div>
      <Head>
        <title>Home - Listeningto</title>
      </Head>

      <div className="h-[70vh] mt-12 mx-16 flex flex-col items-center justify-center bg-blue-900/20 bg-gradient-to-r to-blue-500 border-2 border-white/50">
        <Image src={"/logo.png"} width={256} height={256} alt="" />
        <div className="drop-shadow-[0_5px_3px_rgba(0,0,0,0.4)] text-center">
          <h1 className="font-overpass mt-6 mb-3 text-4xl">Listeningto</h1>
          <h2 className="font-roboto text-xl">Liberdade para criar e ouvir.</h2>
        </div>
      </div>

      <div className="flex flex-col items-center">
        {
          userPlaylists && userPlaylists.length > 0 ?
          <div className="bg-box mt-12 p-4 shadow-xl shadow-black/50 w-11/12">
            <h1 className="mb-2 text-2xl font-fjalla border-b-4 border-gray-900">Suas playlists</h1>
            <div className="flex flex-wrap w-full [&>*]:m-2">
              {
                [...userPlaylists].map((playlist, i) => {
                  return <Card key={i} image={process.env.NEXT_PUBLIC_API_URL + playlist.cover} link={`/playlist/${playlist._id}`} text={playlist.name} subtext={"Playlist"} />
                })
              }
            </div>
          </div>
          : null
        }

        <div className="bg-box mt-12 p-4 shadow-xl shadow-black/50 w-11/12">
          <h1 className="mb-2 text-2xl font-fjalla border-b-4 border-gray-900">Músicas lançadas recentemente</h1>
          <div className="flex flex-wrap w-full [&>*]:m-2">
            {
              [...musics].reverse().map((music, i) => {
                if (i + 1 > 6) return

                return <Card key={i} image={process.env.NEXT_PUBLIC_API_URL + music.cover} link={`/music/${music._id}`} text={music.name} subtext={"Música"} />
              })
            }
          </div>
        </div>

        <div className="bg-box mt-12 p-4 shadow-xl shadow-black/50 w-11/12">
          <h1 className="mb-2 text-2xl font-fjalla border-b-4 border-gray-900">Álbuns lançados recentemente</h1>
          <div className="flex flex-wrap w-full [&>*]:m-2">
            {
              [...albums].reverse().map((album, i) => {
                if (i + 1 > 6) return

                return <Card key={i} image={process.env.NEXT_PUBLIC_API_URL + album.cover} link={`/album/${album._id}`} text={album.name} subtext={"Álbum"} />
              })
            }
          </div>
        </div>

        {
          !user ?
          <div className="mt-12 px-16 py-8 border-2 border-white/50 flex flex-col items-center">
            <h1 className="text-4xl font-fjalla text-white">Crie uma conta</h1>
            <div className="mt-1 font-roboto text-white/80 flex flex-col items-center text-xl">
              <h2 className="text-center">Crie playlists e ouça os novos lançamentos dos artistas que você gosta,</h2>
              <h2 className="text-center">ou poste suas próprias músicas.</h2>
            </div>

            <Link href={"/signup"}>
              <button className="my-5 py-2 px-4 text-lg bg-blue-600 text-white font-semibold">Fazer registro</button>
            </Link>

            <div className=" flex justify-center text-white/70">
              <p className="m-auto text-lg">Já possui uma conta?</p>

              <Link href={"/login"}>
                <button className="ml-2 py-0.5 px-2 border-2 border-white/70">Faça login</button>
              </Link>
            </div>
          </div>
          : null
        }
      </div>
    </div>
  );
};

export default Home;
