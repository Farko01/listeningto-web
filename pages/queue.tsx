import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { BsFillPlayFill } from "react-icons/bs";
import { useUpdateMisc } from "../contexts/MiscContext";
import { usePlayer, useUpdatePlayer } from "../contexts/PlayerContext";
import formatTime from "../misc/formatTime";

const Home: NextPage = () => {
  // Activating the player and navbar
  const { setPlayer, setNavbar } = useUpdateMisc()!;
  setPlayer(true);
  setNavbar(true);

  const { musicList, order, orderIndex, info } = usePlayer()!;
  const { setMusicList } = useUpdatePlayer()!;

  const displayAuthors = () => {
    return <>
      { info!.music.authors.map((author, i) => { 
        if (i != info!.music.authors.length - 1) return <Link href={"/user/" + author._id!}><a>{author.username! + ", "}</a></Link>
        else return <Link href={"/user/" + author._id!}><a>{author.username!}</a></Link>
       }) }
    </>;
  }

  const playMusicList = (index: number) => {
    const musics = musicList!.musics;
    setMusicList({ musics: musics, index: index });
  }

  const displayMusics = () => {
    let jsxMusics: JSX.Element[] = [];

    // Criar elementos da lista de música
    musicList!.musics.map((music, i) => {
      jsxMusics.push(
        <div key={i} className="basis-4 hover:bg-white/20 font-barlow p-0.5 flex">
          {/* Numeração e play */}
          <BsFillPlayFill size={24} className="hover:text-blue-900 cursor-pointer inline-block mr-2" onClick={() => playMusicList(i)} />

          {/* Nome e link da música */}
          <div className='basis-4/5'>
            <Link href={"/music/" + music._id}>
              <a className="cursor-pointer hover:underline inline-block">{ music.name }</a>
            </Link>
          </div>
          <div className='basis-1/5'>
            <span>{ formatTime(music.duration) }</span>
          </div>
        </div>
      )
    });

    // Organizar baseado na order
    let jsxMusicsOrdered: JSX.Element[] = [];

    for (let i of order!) {
      jsxMusicsOrdered.push(jsxMusics[i]);
    }

    // Rotacionar a array até o index atual
    function arrayRotate(arr: any[], count: number) {
      count -= arr.length * Math.floor(count / arr.length);
      arr.push.apply(arr, arr.splice(0, count));
      return arr;
    }

    jsxMusicsOrdered = arrayRotate(jsxMusicsOrdered, orderIndex);
    delete jsxMusicsOrdered[0]

    return jsxMusicsOrdered
  }
  
  const PlayerQueue = () => {
    return (
      <div className="flex flex-col ml-2">
        <div className="basis-24 flex flex-col pb-2 border-b-2 border-gray-900 mb-2">
          <h1 className="font-fjalla text-xl mb-2">Tocando:</h1>
          <div className="flex flex-row items-center">
            <div className="h-16 w-16">
              <Image src={`${process.env.NEXT_PUBLIC_API_URL}${info!.cover}`} width="100%" height="100%" objectFit="cover" />
            </div>
            <div className="flex flex-col justify-center ml-4">
              <h1 className="text-base">{ info!.music.name }</h1>
              <h2 className="text-sm text-white/75">{ info!.album ? <Link href={`/album/${info!.album._id}`}>{info!.album.name}</Link> : null }</h2>
              <h2 className="text-sm text-white/75">{ displayAuthors() }</h2>
            </div>
          </div>
        </div>
        { displayMusics() }
      </div>
    )
  }
  
  return (
    <>
      <Head>
        <title>Lista de Reprodução - Listeningto</title>
      </Head>

      <div>
        <div className="container w-4/5 ml-20">
          <div className="bg-box mt-24 p-4 shadow-xl shadow-black/50">
            <h1 className="mb-2 text-2xl font-fjalla border-b-4 border-gray-900">Lista de Reprodução</h1>
            {
              musicList?.musics ? 
              <div className="flex flex-col ml-2">
                <div className="basis-24 flex flex-col pb-2 border-b-2 border-gray-900 mb-2">
                  <h1 className="font-fjalla text-xl mb-2">Tocando:</h1>
                  <div className="flex flex-row items-center">
                    <div className="h-16 w-16">
                      <Image src={`${process.env.NEXT_PUBLIC_API_URL}${info!.cover}`} width="100%" height="100%" objectFit="cover" />
                    </div>
                    <div className="flex flex-col justify-center ml-4">
                      <h1 className="text-base">{ info!.music.name }</h1>
                      <h2 className="text-sm text-white/75">{ info!.album ? <Link href={`/album/${info!.album._id}`}>{info!.album.name}</Link> : null }</h2>
                      <h2 className="text-sm text-white/75">{ displayAuthors() }</h2>
                    </div>
                  </div>
                </div>
                { displayMusics() }
              </div>
              :
              <div>
                <h2>Nenhuma música na lista de reprodução</h2>
              </div>
            }
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;