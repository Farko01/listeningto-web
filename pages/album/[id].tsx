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
import formatTime from "../../misc/formatTime";
import calcListDuration from "../../misc/calcListDuration";
import { BsFillPlayCircleFill } from "react-icons/bs";
import { verify } from "jsonwebtoken";
import { HiPencil } from 'react-icons/hi'
import router from "next/router"

interface IAuthToken {
  id: string;
}

interface IAppProps {
  album: IAlbum;
  authorized: boolean;
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
      album: album.data,
      authorized: authorized
    }
  }
}

const AlbumPage: NextPage<IAppProps> = (props) => {
  // Activating the player and navbar
  const { setPlayer, setNavbar } = useUpdateMisc()!;
  setPlayer(true);
  setNavbar(true);

  const { setMusicList } = useUpdatePlayer()!;

  const handlePlay = () => {
    setMusicList({ musics: props.album.musics, index: 0 })
  }

  return (
    <div>
      <Head>
        <title>{`${props.album.name} - Listeningto`}</title>
      </Head>

      <div className="relative flex w-full h-full border-b-2 border-blue-900">
        <div className="ml-12 mt-20 mb-8 h-64 w-64 max-w-full">
          <Image src={process.env.NEXT_PUBLIC_API_URL + props.album.cover} width={256} height={256} alt="" />
        </div>
        <div className="h-64 p-4 flex mt-20 ml-4 flex-col">
          <div className="basis-2/3">
            <h1 className="text-3xl text-white/100 mb-2">{props.album.name}</h1>
            <h2 className="text-2xl text-white/90">Por <Link href={"/user/" + props.album.author._id}><a className="hover:underline cursor-pointer">{props.album.author.username}</a></Link></h2>
          </div>
          <div className="basis-1/3">
            <h3 className="text-lg text-white/90">{props.album.musics.length} músicas • Criado em {formatDate(props.album.createdAt)}</h3>
            <h3 className="text-lg text-white/90">Duração: {formatTime(calcListDuration(props.album.musics))}</h3>
          </div>
        </div>
        <div className="absolute bottom-5 right-20">
          <div className="inline-block [&>*]:mx-2">
            { props.authorized ? 
            <HiPencil title="Editar álbum" className="text-black p-2 inline-block cursor-pointer bg-white/80 hover:bg-white rounded-full" size={40} onClick={() => { router.push(`./${ router.query.id }/edit`) }} />
            : null }
            <BsFillPlayCircleFill title="Tocar álbum" className="text-white/80 hover:text-white inline-block cursor-pointer" size={40} onClick={() => handlePlay() } />
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
