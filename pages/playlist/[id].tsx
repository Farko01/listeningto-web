import axios from "axios";
import { verify } from "jsonwebtoken";
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useUpdateMisc } from "../../contexts/MiscContext";
import { IPlaylist } from "../../interfaces/playlist.interface";
import Image from 'next/image'
import Link from "next/link";
import formatDate from "../../misc/formatDate";
import calcListDuration from "../../misc/calcListDuration";
import formatTime from "../../misc/formatTime";
import { HiPencil } from "react-icons/hi";
import { BsFillPlayCircleFill, BsFillPlayFill, BsFillTrashFill } from "react-icons/bs";
import { useUpdatePlayer } from "../../contexts/PlayerContext";
import router from "next/router"
import { toast } from "react-toastify";
import { useState } from "react";

interface IAuthToken {
  id: string;
}

interface IAppProps {
  playlist: IPlaylist;
  authorized: boolean;
  auth: string | null;
}

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
  const playlist_url = `${process.env.NEXT_PUBLIC_API_URL}/playlist/${params!.id}`
  const playlist_data = await axios.get(playlist_url);

  let authorized: boolean = false;
  if (req.cookies.auth) {
    const decoded = verify(req.cookies.auth, process.env.JWT_SECRET!) as IAuthToken;
    if (decoded.id == playlist_data.data.createdBy._id) authorized = true;
  }

  return {
    props: {
      playlist: playlist_data.data,
      authorized: authorized,
      auth: req.cookies.auth ? req.cookies.auth : null,
    }
  }
}

const PlaylistPage: NextPage<IAppProps> = (props) => {
  // Activating the player and navbar
  const { setPlayer, setNavbar } = useUpdateMisc()!;
  setPlayer(true);
  setNavbar(true);

  const { setMusicList } = useUpdatePlayer()!;
  const playMusicList = (index: number) => {
    if (!playlistMusics) return;

    setMusicList({ musics: playlistMusics, index: index });
  }

  const [playlistMusics, setPlaylistMusics] = useState(props.playlist.musics);

  const handlePlay = () => {
    if (!playlistMusics || playlistMusics!.length == 0) return;

    setMusicList({ musics: playlistMusics, index: 0 });
  }

  const deleteMusic = (musicId: string) => {
    const formdata = new FormData();
    formdata.append("musics", musicId);

    fetch("/api/playlist/" + props.playlist._id, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${props.auth}` },
      body: formdata
    }).then((res) => res.json()).then((data) => {
      if (data.message) throw new Error(data.message);
      setPlaylistMusics(data.musics);
    }).catch((e: any) => {
      return toast.error(e.message);
    });
  }
  
  return (
    <div>
      <Head>
        <title>{ props.playlist.name } - Listeningto</title>
      </Head>

      <div className="relative flex w-full h-full border-b-2 border-blue-900">
        <div className="ml-12 mt-20 mb-8 h-64 w-64 max-w-full">
          <Image src={process.env.NEXT_PUBLIC_API_URL + props.playlist.cover} width={256} height={256} />
        </div>
        <div className="h-64 p-4 flex mt-20 ml-4 flex-col">
          <div className="basis-2/3">
            <h1 className="text-3xl text-white/100 mb-2">{props.playlist.name}</h1>
            <h2 className="text-2xl text-white/90">Por <Link href={"/user/" + props.playlist.createdBy._id}><a className="hover:underline cursor-pointer">{props.playlist.createdBy.username}</a></Link></h2>
          </div>
          <div className="basis-1/3">
            <h3 className="text-lg text-white/90">{playlistMusics ? playlistMusics.length : 0} músicas • Criado em {formatDate(props.playlist.createdAt)}</h3>
            <h3 className="text-lg text-white/90">Duração: {playlistMusics ? formatTime(calcListDuration(playlistMusics)) : 0}</h3>
          </div>
        </div>
        <div className="absolute bottom-5 right-20">
          <div className="inline-block [&>*]:mx-2">
            { props.authorized ? 
            <HiPencil title="Editar playlist" className="text-black p-2 inline-block cursor-pointer bg-white/80 hover:bg-white rounded-full" size={40} onClick={() => { router.push(`./${ router.query.id }/edit`) }} />
            : null }
            <BsFillPlayCircleFill title="Tocar playlist" className="text-white/80 hover:text-white inline-block cursor-pointer" size={40} onClick={() => handlePlay() } />
          </div>
        </div>
      </div>

      <div className="container w-4/5 ml-20">
        <div className="mt-12 bg-white/10 p-4 shadow-xl shadow-black/50">
          <h1 className="mb-2 text-2xl font-fjalla border-b-4 border-gray-900">Músicas</h1>
          {
            playlistMusics && playlistMusics?.length > 0 ?
            <div>
              {
                playlistMusics.map((music, i) => {
                  return (
                    <div key={i} className="hover:bg-white/20 font-barlow p-0.5 flex">
                      {/* Numeração e play */}
                      <BsFillPlayFill size={24} className="hover:text-blue-900 cursor-pointer inline-block mr-2" onClick={() => playMusicList(i)} />

                      {/* Nome e link da música */}
                      <div className='basis-3/5'>
                        <Link href={"/music/" + music._id!}>
                          <a className="cursor-pointer hover:underline inline-block">
                            { music.name }
                          </a>
                        </Link>
                      </div>
                      <div className='basis-1/5'>
                        <span>{ formatTime(music.duration) }</span>
                      </div>
                      {
                        props.authorized ?
                        <>
                          <div className="basis-1/5">
                            <BsFillTrashFill size={16} onClick={() => { deleteMusic(music._id) }} className='float-right my-1 mr-1 inline-block cursor-pointer hover:text-red-800' />
                          </div>
                        </>
                        : null
                      }
                    </div>
                  )
                })
              }
            </div>
            : <h1>Não há músicas nesta playlist.</h1>
          }
        </div>
      </div>
    </div>
  );
};

export default PlaylistPage;