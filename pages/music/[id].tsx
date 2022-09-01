import type { NextPage, GetServerSideProps } from "next";
import axios from "axios";
import IMusic from '../../interfaces/music.interface';
import IAlbum from "../../interfaces/album.interface";
import Head from "next/head";
import Image from "next/image";
import MusicList from '../../components/MusicList';
import Player from "../../components/Player";
import { usePlayer, useUpdatePlayer } from "../../contexts/PlayerContext";

interface IAppProps {
  music: IMusic;
  album: IAlbum | null;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const music_url = `${process.env.NEXT_PUBLIC_API_URL}/music/${params!.id}`
  const music_data = await axios.get(music_url);

  const musicAlbum_url = `${process.env.NEXT_PUBLIC_API_URL}/music/${params!.id}/album`;
  const musicAlbum = await axios.get(musicAlbum_url);

  return {
    props: {
      music: music_data.data,
      album: musicAlbum.data
    }
  }
}

const MusicPage: NextPage<IAppProps> = (props) => {
  const musicList = usePlayer();
  const setMusicList = useUpdatePlayer()!;
  
  const hasAlbum: boolean = props.album ? true : false;

  let displayNames = "";
  for (let i in props.music.authors) {
    if (parseInt(i) != props.music.authors.length - 1) {

      displayNames += `${props.music.authors[parseInt(i)].username!}, `;
    } else displayNames += props.music.authors[parseInt(i)].username!;
  }

  const showAlbum = () => {
    if (hasAlbum) {
      return (
        // <MusicList musics={props.album!.musics!} />
        <h1>aaa</h1>
      )
    }
  }

  return (
    <div className="bg-primary bg-gradient-to-br from-blue-900/30 text-white/80 h-screen w-screen">
      <Head>
        <title>{`${props.music.name} - ${props.music.authors![0].username} - Listeningto`}</title>
      </Head>
      
      <div className="container relative flex w-screen border-b-2 border-blue-900">
        <div className="ml-12 mt-20 mb-8 h-64 w-64 max-w-full">
          <Image src={`${process.env.NEXT_PUBLIC_API_URL}${hasAlbum ? props.album!.cover! : props.music!.cover!}`} width={256} height={256} />
        </div>
        <div className="mt-32 ml-12 antialiased">
          <h1 className="text-3xl text-white/100 mb-2">{props.music.name}</h1>
          <h2 className="text-2xl text-white/80">Por {displayNames}</h2>
          <h2 className="text-2xl text-white/80">Álbum: {hasAlbum ? props.album?.name : "Nenhum"}</h2>
        </div>
      </div>

      <Player />
    </div>
  );
};

export default MusicPage;
