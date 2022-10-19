import { NextPage, GetServerSideProps } from 'next'
import Head from 'next/head'
import React, { ChangeEvent, useState } from 'react'
import { useUpdateMisc } from '../contexts/MiscContext';
import Image from 'next/image'
import cookie from "cookie";
import { FiUpload } from 'react-icons/fi';
import { AiOutlineFileAdd } from 'react-icons/ai';
import { useRouter } from 'next/router'
import { verify } from 'jsonwebtoken';
import axios from 'axios';
import IUser from '../interfaces/user.interface';
import { HiOutlinePlus } from 'react-icons/hi';
import { BsFillTrashFill, BsXCircle } from 'react-icons/bs';
import { GoSearch } from 'react-icons/go';
import { toast } from 'react-toastify';
import { IMusic } from '../interfaces/music.interface';

interface IAuthToken {
  id: string;
}

interface IAppProps {
  authorized: boolean;
  auth: string;
  user: IUser;
}

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
  let parsedCookies: any;

  let res;
  if (req.headers.cookie) {
    parsedCookies = cookie.parse(req.headers.cookie);

    if (parsedCookies.auth) {
      const decoded = verify(parsedCookies.auth, process.env.JWT_SECRET!) as IAuthToken;
      const url = `${process.env.NEXT_PUBLIC_API_URL}/user/${decoded.id}`;

      res = await axios.get(url, { headers: { Authorization: `Bearer ${parsedCookies!.auth}` } });
    }
  }

  return {
    props: {
      auth: parsedCookies.auth,
	    user: res?.data
    },
  };
};

const NewPage: NextPage<IAppProps> = (props) => {
  // Deactivating the player and activating the navbar
  const { setPlayer, setNavbar } = useUpdateMisc()!;
  setPlayer(false);
  setNavbar(true);

  const router = useRouter();
  if (!props.user) router.push("/");

  const [name, setName] = useState<string>();

  const [tags, setTags] = useState<string[]>([]);
  const [tag, setTag] = useState<string>("");

  const addTag = () => {
    if (tag) setTags([...tags, tag]);
    setTag("");
  }

  const deleteTag = (deletedTag: string) => {
    const newTags = tags.filter((tag) => tag != deletedTag);
    setTags(newTags);
  }

  const [cover, setCover] = useState<any>(`${process.env.NEXT_PUBLIC_API_URL}/images/1/2bc42b242b5d423f77a700a4e2bb12df.png`);
  const [coverFile, setCoverFile] = useState<File>();

  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    setCoverFile(e.target.files![0]);
    reader.readAsDataURL(e.target.files![0]);

    reader.onload = () => {
      if (reader.readyState == 2) setCover(reader.result);
    }
  }

  const [selectedType, setSelectedType] = useState("music");

  const handleSubmit = () => {
    switch(selectedType) {
      case "music": {
        if (!name || !musicFile) return toast.error("O nome e o arquivo da música é necessário.");

        // Criar formdata
        const formdata = new FormData();
        formdata.append("name", name);
        formdata.append("file", musicFile);
        coverFile ? formdata.append("cover", coverFile) : null;
        authors.forEach((author) => {
          formdata.append("authors", author._id);
        });
        tags.forEach((tag) => {
          formdata.append("tags", tag);
        });

        // Adicionar ao database
        fetch("/api/music", {
          method: "POST",
          headers: { "Authorization": `Bearer ${props.auth}` },
          body: formdata
        }).then((res) => res.json()).then((data) => {
          if (data.message) throw new Error(data.message);

          toast.success(`Música criada: "${name}"`);
          router.push(`/music/${data._id}`);
        }).catch((e: any) => {
          return toast.error(e.message);
        });
      }
      case "album": {
        if (!name || !musics) return toast.error("O nome e as músicas do álbum são necessários.");

        // Criar formdata
        const formdata = new FormData();
        formdata.append("name", name);
        coverFile ? formdata.append("cover", coverFile) : null;
        musics.forEach((music) => {
          formdata.append("musics", music._id);
        });
        tags.forEach((tag) => {
          formdata.append("tags", tag);
        });

        // Adicionar ao database
        fetch("/api/album", {
          method: "POST",
          headers: { "Authorization": `Bearer ${props.auth}` },
          body: formdata
        }).then((res) => res.json()).then((data) => {
          if (data.message) throw new Error(data.message);

          toast.success(`Álbum criado: "${name}"`);
          router.push(`/album/${data._id}`);
        }).catch((e: any) => {
          return toast.error(e.message);
        });
      }
      case "playlist": {
        if (!name) return toast.error("O nome da playlist é necessário");

        // Criar formdata
        const formdata = new FormData();
        formdata.append("name", name);
        coverFile ? formdata.append("cover", coverFile) : null;
        tags.forEach((tag) => {
          formdata.append("tags", tag);
        });

        // Adicionar ao database
        fetch("/api/playlist", {
          method: "POST",
          headers: { "Authorization": `Bearer ${props.auth}` },
          body: formdata
        }).then((res) => res.json()).then((data) => {
          if (data.message) throw new Error(data.message);

          toast.success(`Playlist criada: "${name}"`);
          router.push(`/playlist/${data._id}`);
        }).catch((e: any) => {
          return toast.error(e.message);
        });
      }
    }
  }

  // Model
  const [showModel, setShowModel] = useState(false);
  const [modelSearch, setModelSearch] = useState("");
  const [modelSearchRes, setModelSearchRes] = useState<any[]>();

  const handleModelSearch = async (type: string) => {
    fetch(`/api/${type}/search?query=` + modelSearch, {
      method: "GET"
    }).then((res) => res.json().then((data) => setModelSearchRes(data)));
  }

  // Música
  const [musicFile, setMusicFile] = useState<File>();
  const [musicFileName, setMusicFileName] = useState<string>();
  const [authors, setAuthors] = useState<IUser[]>([props.user]);

  const handleDeleteAuthor = (id: string) => {
    const newAuthors = authors.filter((user) => user._id != id);
    setAuthors(newAuthors);
  }

  // Álbum
  const [musics, setMusics] = useState<IMusic[]>([]);

  const deleteMusic = (id: string) => {
    const newMusics = musics.filter((music) => music._id != id);
    setMusics(newMusics);
  }

  const NewType = () => {
    switch(selectedType) {
      case "music": {
        return (
          <div className='mt-8'>
            <div className='grid grid-cols-2'>
              <div>
                <label htmlFor="name" className="text-lg">Nome da música</label>
                <input id="name" type="text" className="bg-transparent text-white block w-96 outline-0 border-0 border-b-2 mt-0.5 appearance-none focus:ring-0" onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <h1 className='text-lg mb-1'>Arquivo da música</h1>
                <label htmlFor='musicFile' className='text-lg block'>
                  <AiOutlineFileAdd size={36} className='inline-block cursor-pointer' />
                  <h1 className='inline-block ml-1'>{ musicFileName }</h1>
                </label>
                <input id="musicFile" type="file" onChange={(e) => { setMusicFile(e.target.files![0]); setMusicFileName(e.target.files![0].name) }} className='hidden' />
              </div>
            </div>
            <div className='border-t-4 mt-8 mr-8 border-black/50'>
              <div className='ml-2'>
                <h1 className='font-fjalla text-2xl mt-2'>Autores</h1>
                <div className='mt-2 flex flex-col w-1/4'>
                  {
                    authors.map((user) => {
                      return (
                        <div className='p-1 even:bg-gray-500 odd:bg-gray-600 text-black'>
                          <span>{ user.username }</span>
                          { user._id == props.user._id ? null : <BsFillTrashFill onClick={() => { handleDeleteAuthor(user._id) }} className='float-right my-1 mr-1 inline-block cursor-pointer hover:text-red-800' size={16} /> }
                        </div>
                      )
                    })
                  }
                </div>
                <button onClick={() => { const prevVal = showModel; setShowModel(!prevVal) }} className='mt-2 py-1 px-2 block border border-blue-900 font-semibold rounded-md bg-primary hover:bg-primary/50'>
                  <HiOutlinePlus size={20} className='inline-block' />
                  <p className='inline-block ml-1'>Adicionar autor</p>
                </button>
              </div>
            </div>

            <div className={`fixed top-0 left-0 z-10 w-full h-full justify-center items-center bg-black/40 ${showModel ? "flex" : "hidden"}`}>
              <div className='w-1/2 h-5/6 p-4 bg-box border-2 relative overflow-hidden'>
                <BsXCircle size={24} className="float-right cursor-pointer" onClick={() => { setShowModel(false); setModelSearchRes(undefined); setModelSearch("") }} />
                <h1 className='text-2xl font-fjalla mb-2'>Adicionar autores</h1>
                <div className='w-4/6 bg-white rounded-md flex items-center h-10'>
                  <input onChange={(e) => setModelSearch(e.target.value)} value={modelSearch} type={"text"} className="rounded-md basis-11/12 text-black border-none appearance-none focus:ring-0" />
                  <GoSearch onClick={() => { handleModelSearch("user") }} size={30} className="text-black text-center basis-1/12 cursor-pointer" />
                </div>
                <div className='flex flex-col text-black w-4/6 -mt-1'>
                  {
                    (modelSearchRes?.filter((user) => { return !authors.some((author) => author._id == user._id) }))?.map((user, i) => {
                      return (
                        <div className='even:bg-white odd:bg-gray-300 p-1 relative'>
                          <span className='inline-block'>{ i + 1 }.</span>
                          <span className='ml-1 inline-block'>{ user.username }</span>
                          <HiOutlinePlus onClick={() => { setAuthors([...authors, user]); setShowModel(false) }} className='float-right my-1 mr-1 inline-block cursor-pointer hover:text-green-800' size={16} />
                        </div>
                      )
                    })
                  }
                </div>
              </div>
            </div>
          </div>
        )
      }
      case "album": {
        return (
          <div className='mt-8'>
            <div>
              <label htmlFor="name" className="text-lg">Nome do álbum</label>
              <input id="name" type="text" className="bg-transparent text-white block w-96 outline-0 border-0 border-b-2 mt-0.5 appearance-none focus:ring-0" onChange={(e) => setName(e.target.value)} />
            </div>
            <div className='border-t-4 mt-8 mr-8 border-black/50'>
              <div className='ml-2'>
                <h1 className='font-fjalla text-2xl mt-2'>Músicas</h1>
                <div className='mt-2 flex flex-col w-1/4'>
                  {
                    musics.map((music) => {
                      return (
                        <div className='p-1 even:bg-gray-500 odd:bg-gray-600 text-black'>
                          <span>{ music.name }</span>
                          <BsFillTrashFill onClick={() => { deleteMusic(music._id) }} className='float-right my-1 mr-1 inline-block cursor-pointer hover:text-red-800' size={16} />
                        </div>
                      )
                    })
                  }
                </div>
              </div>
              <button onClick={() => { const prevVal = showModel; setShowModel(!prevVal) }} className='ml-2 mt-2 py-1 px-2 block border border-blue-900 font-semibold rounded-md bg-primary hover:bg-primary/50'>
                <HiOutlinePlus size={20} className='inline-block' />
                <p className='inline-block ml-1'>Adicionar música</p>
              </button>
            </div>

            <div className={`fixed top-0 left-0 z-10 w-full h-full justify-center items-center bg-black/40 ${showModel ? "flex" : "hidden"}`}>
              <div className='w-1/2 h-5/6 p-4 bg-box border-2 relative overflow-hidden'>
                <BsXCircle size={24} className="float-right cursor-pointer" onClick={() => { setShowModel(false); setModelSearchRes(undefined); setModelSearch("") }} />
                <h1 className='text-2xl font-fjalla mb-2'>Adicionar músicas</h1>
                <div className='w-4/6 bg-white rounded-md flex items-center h-10'>
                  <input onChange={(e) => setModelSearch(e.target.value)} value={modelSearch} type={"text"} className="rounded-md basis-11/12 text-black border-none appearance-none focus:ring-0" />
                  <GoSearch onClick={() => { handleModelSearch("music") }} size={30} className="text-black text-center basis-1/12 cursor-pointer" />
                </div>
                <div className='flex flex-col text-black w-4/6 -mt-1'>
                  {
                    (modelSearchRes?.filter((music) => { return !musics.some((m) => m._id == music._id && !m.authors.some((a) => a._id == props.user._id)) }))?.map((music, i) => {
                      return (
                        <div className='even:bg-white/50 odd:bg-gray-300 p-1 relative'>
                          <span className='inline-block'>{ i + 1 }.</span>
                          <span className='ml-1 inline-block'>{ music.name }</span>
                          <HiOutlinePlus onClick={() => { setMusics([...musics, music]); setShowModel(false) }} className='float-right my-1 mr-1 inline-block cursor-pointer hover:text-green-800' size={16} />
                        </div>
                      )
                    })
                  }
                </div>
              </div>
            </div>
          </div>
        )
      }
      case "playlist": {
        return (
          <div className='mt-8'>
            <div>
              <label htmlFor="name" className="text-lg">Nome da playlist</label>
              <input id="name" type="text" className="bg-transparent text-white block w-96 outline-0 border-0 border-b-2 mt-0.5 appearance-none focus:ring-0" onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
        )
      }
    }
  }
  
  return (
    <div>
      <Head>
        <title>Novo - Listeningto</title>
      </Head>

      <div className='container w-4/5 ml-20 mt-20'>
        <div className='bg-box shadow-xl shadow-black/50 relative'>
          <div className='flex gap-8 font-fjalla text-2xl border-b-4 border-black/50 py-2 pl-4'>
            <span onClick={() => setSelectedType("music")} className="cursor-pointer">Música</span>
            <span onClick={() => setSelectedType("album")} className="cursor-pointer">Álbum</span>
            <span onClick={() => setSelectedType("playlist")} className="cursor-pointer">Playlist</span>
          </div>
          <div className='p-4'>
            <div className='mt-4 ml-4 pb-24'>
              <div className='grid grid-cols-2'>
                <div className="relative h-64 w-64">
                  <input id="file" type={"file"} onChange={(e) => handleImage(e)} className="hidden" />
                  <label htmlFor="file" className="cursor-pointer">
                    <Image src={cover} width={256} height={256} className="block" />
                    <div className="absolute top-0 left-0 h-full w-full bg-black/60 flex flex-col items-center justify-center opacity-0 transition-opacity hover:opacity-100">
                      <FiUpload size={100} className="text-gray-900/90" />
                    </div>
                  </label>
                </div>
                <div className='w-[432px] h-64'>
                  <h1 className='font-fjalla text-2xl mt-2'>Tags</h1>
                  <div className='block mt-2'>
                    <input id="tag" type="text" value={tag} className="inline-block bg-transparent text-white w-80 h-8 outline-0 border-2 mt-0.5 appearance-none focus:ring-0" onChange={(e) => { setTag(e.target.value) }} />
                    <button className='inline-block h-8 w-28 text-white font-semibold border-2 border-blue-900' onClick={addTag}>Adicionar tag</button>
                  </div>
                  <div className='mt-2 flex flex-row gap-2 flex-wrap'>
                    {
                      tags.map((tag) => {
                        return (
                          <div className='rounded-2xl bg-gray-200 border-2 border-gray-500 text-black w-fit block'>
                            <span className='ml-1 inline-block'>
                              { tag }
                            </span>
                            <BsXCircle size={12} className='mx-1 inline-block cursor-pointer' onClick={() => { deleteTag(tag) }} />
                          </div>
                        )
                      })
                    }
                  </div>
                </div>
              </div>
              { NewType() } 
            </div>
            <div className="absolute w-full pr-8 bottom-4 [&>*]:mx-2">
              <button className="float-right border border-blue-900 font-semibold rounded-xl py-2 px-4 bg-primary hover:bg-primary/50" onClick={handleSubmit}>Salvar</button>
              <button className="float-right border border-blue-900 font-semibold rounded-xl py-2 px-4 bg-gray-900 hover:bg-gray-700" onClick={() => router.back()}>Cancelar</button>
            </div>  
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewPage