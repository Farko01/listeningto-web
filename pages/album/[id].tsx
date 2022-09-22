import type { NextPage, GetServerSideProps } from "next";
import axios from 'axios';
import { IAlbum } from "../../interfaces/album.interface";
import { useUpdateMisc } from "../../contexts/MiscContext";
import { useUpdatePlayer } from "../../contexts/PlayerContext";
import Head from "next/head";
import Image from "next/image";
import Link from 'next/link';
import formatDate from "../../misc/formatDate";
import MusicList from "../../components/MusicList";

interface IAppProps {
  album: IAlbum;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const album_url = `${process.env.NEXT_PUBLIC_API_URL}/album/${params!.id}`;
  const album = await axios.get(album_url);

  return {
    props: {
      album: album.data
    }
  }
}

const AlbumPage: NextPage<IAppProps> = (props) => {
  // Activating the player
  const { setPlayer } = useUpdateMisc()!;
  setPlayer(true);
  
  const { setMusicList } = useUpdatePlayer()!;

  return (
    <div>
      <Head>
        <title>{`${props.album.name} - Listeningto`}</title>
      </Head>

      <div className="relative flex w-full h-full border-b-2 border-blue-900">
        <div className="ml-12 mt-20 mb-8 h-64 w-64 max-w-full">
          <Image src={process.env.NEXT_PUBLIC_API_URL + props.album.cover} width={256} height={256} />
        </div>
        <div className="mt-32 ml-12 flex flex-col">
          <div className="basis-2/3">
            <h1 className="text-3xl text-white/100 mb-2">{props.album.name}</h1>
            <h2 className="text-2xl text-white/90">Por <Link href={"/user/" + props.album.author._id}><a className="hover:underline cursor-pointer">{props.album.author.username}</a></Link></h2>
          </div>
          <div className="basis-1/3">
            <h3 className="text-lg text-white/90">{props.album.musics.length} músicas • Criado em {formatDate(props.album.createdAt)}</h3>
          </div>
        </div>
      </div>

      <div className="container w-4/5 ml-20">
        <div className="mt-12 bg-white/10 p-4 shadow-xl shadow-black/50">
          <h1 className="mb-2 text-2xl font-fjalla border-b-4 border-gray-900">Álbum</h1>
          <MusicList musics={props.album.musics} showMore={false} />
        </div>
      </div>
    </div>
  );
};

export default AlbumPage;
