import type { NextPage, GetServerSideProps } from "next";
import axios from "axios";
import { IMusic } from '../../interfaces/music.interface';
import { IAlbum } from "../../interfaces/album.interface";
import Head from "next/head";
import Image from "next/image";
import MusicList from '../../components/MusicList';
import Link from "next/link";
import { useUpdateMisc } from "../../contexts/MiscContext";
import { MdDownloadForOffline } from "react-icons/md";
import { BsFillPlayCircleFill } from "react-icons/bs";
import { useUpdatePlayer } from '../../contexts/PlayerContext';
import formatDate from "../../misc/formatDate";

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
  // Activating the player and navbar
  const { setPlayer, setNavbar } = useUpdateMisc()!;
  setPlayer(true);
  setNavbar(true);

  const { setMusicList } = useUpdatePlayer()!;
  
  const hasAlbum: boolean = props.album ? true : false;

  const displayAuthors = () => {
    return <>
      { props.music.authors!.map((author, i) => { 
        if (i != props.music.authors!.length - 1) return <a className="hover:underline cursor-pointer"><Link href={"/user/" + author._id!}>{author.username! + ", "}</Link></a>
        else return <Link href={"/user/" + author._id!}><a className="hover:underline cursor-pointer">{author.username!}</a></Link>
       }) }
    </>;
  }

  const ShowAlbum = () => {
    if (hasAlbum) {
      return (
        <MusicList musics={props.album!.musics} showMore={false} />
      )
    } else return <h1>Esta música não pertence a nenhum álbum</h1>
  }

  const handleDownload = () => {
    fetch("/api" + props.music.file).then((res) => res.blob().then((blob) => {
      let url = window.URL.createObjectURL(blob);
      let a = document.createElement('a');
      a.href = url;
      a.download = `${props.music.name}.${props.music.file.split(".").pop()}`;
      a.click();
    }));
  }

  const handlePlay = () => {
    if (hasAlbum) {
      const music_index = props.album!.musics.findIndex((el) => el._id == props.music._id);
      setMusicList({ musics: props.album!.musics, index: music_index });
    } else {
      setMusicList({ musics: [props.music], index: 0 });
    }
  }

  return (
    <div>
      <Head>
        <title>{`${props.music.name} - ${props.music.authors![0].username} - Listeningto`}</title>
      </Head>
      
      <div className="relative flex w-full h-full border-b-2 border-blue-900">
        <div className="ml-12 mt-20 mb-8 h-64 w-64 max-w-full">
          <Image src={`${process.env.NEXT_PUBLIC_API_URL}${hasAlbum ? props.album!.cover! : props.music!.cover!}`} width={256} height={256} />
        </div>
        <div className="mt-32 ml-12 flex flex-col">
          <div className="basis-2/3">
            <h1 className="text-3xl text-white/100 mb-2">{props.music.name}</h1>
            <h2 className="text-2xl text-white/80">Por {displayAuthors()}</h2>
            <h2 className="text-2xl text-white/80">Álbum: {hasAlbum ? <Link href={"/album/" + props.album!._id}><a className="hover:underline cursor-pointer">{props.album!.name}</a></Link> : "Nenhum"}</h2>
          </div>
          <div className="basis-1/3">
            <h3 className="text-lg text-white/90">Criado em {formatDate(props.music.createdAt)}</h3>
          </div>
        </div>
        <div className="absolute bottom-5 right-20">
          <div className="inline-block [&>*]:mx-2">
            <BsFillPlayCircleFill title="Tocar música" className="text-white/80 hover:text-white inline-block cursor-pointer" size={40} onClick={() => handlePlay() } />
            <MdDownloadForOffline title="Baixar música" className="text-white/80 hover:text-white inline-block cursor-pointer" size={48} onClick={() => handleDownload() } />
          </div>
        </div>
      </div>
      <div>
        <div className="container w-4/5 ml-20">
          <div className="mt-12 bg-white/10 p-4 shadow-xl shadow-black/50">
            <h1 className="mb-2 text-2xl font-fjalla border-b-4 border-gray-900">Álbum</h1>
            { ShowAlbum() }
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPage;
