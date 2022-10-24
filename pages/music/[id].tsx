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
import { BsFillPlayCircleFill, BsPlusCircleFill, BsXCircle } from "react-icons/bs";
import { useUpdatePlayer } from '../../contexts/PlayerContext';
import formatDate from "../../misc/formatDate";
import formatTime from "../../misc/formatTime";
import { useState } from "react";
import { verify } from "jsonwebtoken";
import { toast } from "react-toastify";
import { IPlaylist } from "../../interfaces/playlist.interface";
import { HiOutlinePlus, HiPencil } from "react-icons/hi";
import { useRouter } from "next/router";

interface IAuthToken {
  id: string;
}

interface IAppProps {
  music: IMusic;
  album: IAlbum | null;
  authorized: boolean;
  auth: string | null;
  playlists: IPlaylist[] | null;
}

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
  const music_url = `${process.env.NEXT_PUBLIC_API_URL}/music/${params!.id}`
  const music_data = await axios.get(music_url);

  const musicAlbum_url = `${process.env.NEXT_PUBLIC_API_URL}/music/${params!.id}/album`;
  const musicAlbum = await axios.get(musicAlbum_url);

  let playlists;
  let authorized: boolean = false;
  if (req.cookies.auth) {
    const decoded = verify(req.cookies.auth, process.env.JWT_SECRET!) as IAuthToken;
    if (decoded.id == music_data.data.authors[0]._id) authorized = true;

    playlists = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/${decoded.id}/playlists`, { headers: { Authorization: `Bearer ${req.cookies.auth}` } });
  }

  return {
    props: {
      music: music_data.data,
      album: musicAlbum.data,
      authorized: authorized,
      auth: req.cookies.auth ? req.cookies.auth : null,
      playlists: playlists ? playlists.data.playlists : null
    }
  }
}

const MusicPage: NextPage<IAppProps> = (props) => {
  // Activating the player and navbar
  const { setPlayer, setNavbar } = useUpdateMisc()!;
  setPlayer(true);
  setNavbar(true);

  const { setMusicList } = useUpdatePlayer()!;
  const router = useRouter();
  
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

  // Model
  const [showModel, setShowModel] = useState<boolean>(false);

  const handleAddPlaylistButton = () => {
    if (!props.auth) return toast.error("Você precisa estar logado para adicionar uma música à uma playlist.");

    setShowModel(true);
  }

  const [playlists, setPlaylists] = useState(props.playlists);
  const handleAddPlaylist = (playlistId: string, musicId: string) => {
    const formdata = new FormData();
    formdata.append("musics", musicId);

    fetch(`/api/playlist/${playlistId}`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${props.auth}` },
      body: formdata
    }).then((res) => res.json()).then((data) => {
      if (data.message) return toast.error(data.message);

      const index = playlists!.findIndex(playlist => {
        return playlist._id == playlistId;
      });

      const newPlaylists = [...playlists!];
      newPlaylists[index] = data;

      setPlaylists(newPlaylists);
      return toast.success(`"${props.music.name}" adicionada à playlist "${data.name}"`);
    }).catch((e: any) => {
      return toast.error(e.message);
    });
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
        <div className="h-64 p-4 flex mt-20 ml-4 flex-col">
          <div className="basis-2/3">
            <h1 className="text-3xl text-white/100 mb-2">{props.music.name}</h1>
            <h2 className="text-2xl text-white/80">Por {displayAuthors()}</h2>
            <h2 className="text-2xl text-white/80">Álbum: {hasAlbum ? <Link href={"/album/" + props.album!._id}><a className="hover:underline cursor-pointer">{props.album!.name}</a></Link> : "Nenhum"}</h2>
          </div>
          <div className="basis-1/3">
            <h3 className="text-lg text-white/90">Criado em {formatDate(props.music.createdAt)}</h3>
            <h3 className="text-lg text-white/90">Duração: {formatTime(props.music.duration)}</h3>
          </div>
        </div>
        <div className="absolute bottom-5 right-20">
          <div className="inline-block [&>*]:mx-2">
            { props.authorized ? 
            <HiPencil title="Editar álbum" className="text-black p-2 inline-block cursor-pointer bg-white/80 hover:bg-white rounded-full" size={40} onClick={() => { router.push(`./${ router.query.id }/edit`) }} />
            : null }
            <BsFillPlayCircleFill title="Tocar música" className="text-white/80 hover:text-white inline-block cursor-pointer" size={40} onClick={handlePlay} />
            <MdDownloadForOffline title="Baixar música" className="text-white/80 hover:text-white inline-block cursor-pointer" size={48} onClick={handleDownload} />
            <BsPlusCircleFill title="Adicionar à playlist" className="text-white/80 hover:text-white inline-block cursor-pointer" size={40} onClick={handleAddPlaylistButton} />
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

      {/* Model */}
      <div className={`fixed top-0 left-0 z-10 w-full h-full justify-center items-center bg-black/40 ${showModel ? "flex" : "hidden"}`}>
        <div className='w-1/2 h-5/6 p-4 bg-box border-2 relative overflow-hidden'>
          <BsXCircle size={24} className="float-right cursor-pointer" onClick={() => { setShowModel(false) }} />
          <h1 className='text-2xl font-fjalla mb-2'>Selecionar playlist</h1>
          <div className="w-fit">
            {
              (playlists?.filter((p) => { return !p.musics?.some((music) => { return music._id == props.music._id }) }))?.map((playlist) => {
                return (
                  <div className="flex items-center even:bg-white/50 odd:bg-gray-300 p-2 cursor-pointer" onClick={() => { handleAddPlaylist(playlist._id, props.music._id) }}>
                    <span className="mr-2">
                      <Image src={process.env.NEXT_PUBLIC_API_URL + playlist.cover} width={56} height={56} />
                    </span>
                    <p className="font-barlow text-lg text-black">
                      { playlist.name }
                    </p>
                  </div>
                )
              })
            }
            <button onClick={() => { router.push("/new") }} className='ml-2 mt-2 py-1 px-2 block border border-blue-900 font-semibold rounded-md bg-primary hover:bg-primary/50'>
              <HiOutlinePlus size={20} className='inline-block' />
              <p className='inline-block ml-1'>Criar nova playlist</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPage;
