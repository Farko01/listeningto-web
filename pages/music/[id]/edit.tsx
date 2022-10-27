import axios from "axios";
import { verify } from "jsonwebtoken";
import type { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import router from "next/router";
import { useState } from "react";
import { FiUpload } from "react-icons/fi";
import Image from "next/image"
import { useUpdateMisc } from "../../../contexts/MiscContext";
import { BsFillTrashFill, BsXCircle } from 'react-icons/bs';
import { HiOutlinePlus } from "react-icons/hi";
import { GoSearch } from "react-icons/go";
import { IMusic } from "../../../interfaces/music.interface";
import { toast } from "react-toastify";
import IUser from "../../../interfaces/user.interface";

interface IAuthToken {
  id: string;
}

interface IAppProps {
  auth: string;
  music: IMusic;
}

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
  const music_url = `${process.env.NEXT_PUBLIC_API_URL}/music/${params!.id}`;
  const music = await axios.get(music_url);

  if (req.cookies.auth) {
    const decoded = verify(req.cookies.auth, process.env.JWT_SECRET!) as IAuthToken;
    if (decoded.id != music.data.authors[0]._id) {
      return {
        props: {},
        redirect: {
          destination: "/",
          permanent: false
        }
      }
    }
  }

  return {
    props: {
      auth: req.cookies.auth ? req.cookies.auth : null,
	    music: music.data,
    },
  };
};

const EditAlbum: NextPage<IAppProps> = (props) => {
  // Deactivating the player and activating the navbar
  const { setPlayer, setNavbar } = useUpdateMisc()!;
  setPlayer(false);
  setNavbar(true);

  // Tags
  const [tags, setTags] = useState<string[]>(props.music.tags ? props.music.tags : []);
  const [tag, setTag] = useState("");

  const addTag = () => {
    if (tag) setTags([...tags, tag]);
    setTag("");
  }

  const deleteTag = (deletedTag: string) => {
    const newTags = tags.filter((t) => !(t == deletedTag));
    setTags(newTags);
  }

  // Alterar foto exibida
  const [cover, setCover] = useState<any>(process.env.NEXT_PUBLIC_API_URL + props.music.cover);
  const [coverFile, setCoverFile] = useState<File>();

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    setCoverFile(e.target.files![0]);
    reader.readAsDataURL(e.target.files![0]);

    reader.onload = () => {
      if (reader.readyState == 2) setCover(reader.result);
    }
  }

  // Model
  const [showModel, setShowModel] = useState(false);
  const [modelSearch, setModelSearch] = useState("");
  const [modelSearchRes, setModelSearchRes] = useState<any[]>();

  const handleModelSearch = async () => {
    fetch(`/api/user/search?query=` + modelSearch, {
      method: "GET"
    }).then((res) => res.json().then((data) => setModelSearchRes(data)));
  }

  // Autores
  const [authors, setAuthors] = useState<IUser[]>([...props.music.authors]);
  const handleDeleteAuthor = (id: string) => {
    const newAuthors = authors.filter((user) => user._id != id);
    setAuthors(newAuthors);
  }

  const [name, setName] = useState<string>();

  // Atualizar database
  const handleSubmit = () => {
    const changeTags = (() => {
      const compareArrays = (a: string, b: string) => a == b;
      const onlyInOriginal = props.music.tags.filter((t1) => !tags.some((t2) => compareArrays(t1, t2)));
      const onlyInNew = tags.filter((t1) => !props.music.tags.some((t2) => compareArrays(t1, t2)));

      return [...onlyInOriginal, ...onlyInNew]
    })();

    const changeAuthors = (() => {
      const compareArrays = (a: string, b: string) => a == b;
      const onlyInOriginal = props.music.authors.filter((t1) => !authors.some((t2) => compareArrays(t1._id, t2._id)));
      const onlyInNew = authors.filter((t1) => !props.music.authors.some((t2) => compareArrays(t1._id, t2._id)));

      return [...onlyInOriginal, ...onlyInNew]
    })();

    const formdata = new FormData();
    name ? formdata.append("name", name) : null;
    coverFile ? formdata.append("cover", coverFile) : null;
    changeTags.forEach((tag) => formdata.append("tags", tag));
    changeAuthors.forEach((author) => formdata.append("authors", author._id));

    fetch(`/api/music/${props.music._id}`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${props.auth}` },
      body: formdata
    }).then((res) => res.json().then((data) => {
      if (data.message) throw new Error(data.message);

      toast.success("Alterações salvas.");
      router.push(`/music/${props.music._id}`);
    })).catch((e: any) => {
      return toast.error(e.message);
    });
  }

  const handleDelete = () => {
    fetch(`/api/music/${props.music._id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${props.auth}` }
    }).then((res) => {
      if (res.status !== 204) res.json().then((data) => { throw new Error(data.message) });

      toast.success(`Música deletada: ${props.music.name}`);
      router.push("/");
    }).catch((e: any) => {
      return toast.error(e.message);
    });
  }

  return (
    <div className="m-24 flex items-center justify-center">
      <Head>
        <title>Editar {props.music.name} - Listeningto</title>
      </Head>

      <div className="w-5/6 h-5/6 bg-white/10 relative pb-16">
        <div className="ml-16 mt-16 w-11/12 mb-4">
          <h1 className="font-fjalla text-3xl mt-8 border-b-4 border-black/50">Editar &quot;{props.music.name}&quot;</h1>

          {/* Imagem de cover */}
          <div className="relative h-64 w-64 mt-8">
            <input id="file" type={"file"} onChange={(e) => handleImage(e)} className="hidden" />
            <label htmlFor="file" className="cursor-pointer">
              <Image src={cover} width={256} height={256} className="block" alt="" />
              <div className="absolute top-0 left-0 h-full w-full bg-black/60 flex flex-col items-center justify-center opacity-0 transition-opacity hover:opacity-100">
                <FiUpload size={100} className="text-gray-900/90" />
              </div>
            </label>
          </div>

          {/* Nome da música */}
          <div className="flex mt-8 border-b-4 border-black/50 pb-8">
            <div className="basis-1/2">
              <label htmlFor="musicName" className="text-lg">Nome da música</label>
              <input id="musicName" type="text" className="bg-transparent text-white block w-96 outline-0 border-0 border-b-2 mt-0.5 appearance-none focus:ring-0" onChange={(e) => setName(e.target.value)} />
            </div>
          </div>

          {/* Músicas */}
          <div className="flex mt-8">
            <div className="basis-1/2 pr-4">
              <div className='ml-2'>
                  <h1 className='font-fjalla text-2xl mt-2'>Autores</h1>
                  <div className='mt-2 flex flex-col w-1/4'>
                    {
                      authors.map((user, i) => {
                        return (
                          <div key={i} className='p-1 even:bg-gray-500 odd:bg-gray-600 text-black'>
                            <span>{ user.username }</span>
                            { user._id == props.music.authors[0]._id ? null : <BsFillTrashFill onClick={() => { handleDeleteAuthor(user._id) }} className='float-right my-1 mr-1 inline-block cursor-pointer hover:text-red-800' size={16} /> }
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
            <div className="basis-1/2">
              <h1 className='font-fjalla text-2xl mt-2'>Tags</h1>
              <div className='block mt-2'>
                <input id="tag" type="text" value={tag} className="inline-block bg-transparent text-white w-80 h-8 outline-0 border-2 mt-0.5 appearance-none focus:ring-0" onChange={(e) => { setTag(e.target.value) }} />
                <button className='inline-block h-8 w-28 text-white font-semibold border-2 border-blue-900' onClick={addTag}>Adicionar tag</button>
              </div>
              <div className='mt-2 flex flex-row gap-2 flex-wrap'>
                {
                  tags.map((tag, i) => {
                    return (
                      <div key={i} className='rounded-2xl bg-gray-200 border-2 border-gray-500 text-black w-fit block'>
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
        </div>
        <div className="absolute w-full bottom-4 px-16 [&>*]:mx-2">
          <button className="float-left border border-red-700 font-semibold rounded-xl py-2 px-4 bg-red-600 hover:bg-red-600/75" onClick={handleDelete}>Deletar música</button>
          <button className="float-right border border-blue-900 font-semibold rounded-xl py-2 px-4 bg-primary hover:bg-primary/5" onClick={handleSubmit}>Salvar alterações</button>
          <button className="float-right border border-blue-900 font-semibold rounded-xl py-2 px-4 bg-gray-900 hover:bg-gray-700" onClick={() => router.push(`../${ router.query.id }`)}>Cancelar</button>
        </div>  
      </div>

      <div id="model-bg" className={`fixed top-0 left-0 z-10 w-full h-full justify-center items-center bg-black/40 ${showModel ? "flex" : "hidden"}`} onClick={(e) => { if ((e.target as HTMLElement).id == "model-bg") setShowModel(false) }}>
        <div className='w-1/2 h-5/6 p-4 bg-box border-2 relative overflow-hidden'>
          <BsXCircle size={24} className="float-right cursor-pointer" onClick={() => { setShowModel(false); setModelSearchRes(undefined); setModelSearch("") }} />
          <h1 className='text-2xl font-fjalla mb-2'>Adicionar autores</h1>
          <div className='w-4/6 bg-white rounded-md flex items-center h-10' onKeyUp={(e) => { if (e.key == 'Enter') handleModelSearch()}}>
            <input onChange={(e) => setModelSearch(e.target.value)} value={modelSearch} type={"text"} className="rounded-md basis-11/12 text-black border-none appearance-none focus:ring-0" />
            <GoSearch onClick={handleModelSearch} size={30} className="text-black text-center basis-1/12 cursor-pointer" />
          </div>
          <div className='flex flex-col text-black w-4/6 -mt-1'>
            {
              (modelSearchRes?.filter((user) => { return !authors.some((author) => author._id == user._id) }))?.map((user, i) => {
                return (
                  <div key={i} className='even:bg-white odd:bg-gray-300 p-1 relative'>
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

export default EditAlbum