import axios from "axios";
import { verify } from "jsonwebtoken";
import type { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import router from "next/router";
import { useEffect, useState } from "react";
import { FiUpload } from "react-icons/fi";
import { IAlbum } from "../../../interfaces/album.interface";
import Image from "next/image"
import { useUpdateMisc } from "../../../contexts/MiscContext";
import { BsFillTrashFill, BsXCircle, BsXLg } from 'react-icons/bs';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { HiOutlinePlus } from "react-icons/hi";
import { GoSearch } from "react-icons/go";
import { IMusic } from "../../../interfaces/music.interface";
import { toast } from "react-toastify";

interface IAuthToken {
  id: string;
}

interface IAppProps {
  auth: string;
  album: IAlbum;
}

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
  const album_url = `${process.env.NEXT_PUBLIC_API_URL}/album/${params!.id}`;
  const album = await axios.get(album_url);

  if (req.cookies.auth) {
    const decoded = verify(req.cookies.auth, process.env.JWT_SECRET!) as IAuthToken;
    if (decoded.id == album.data.author._id) {
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
	    album: album.data
    },
  };
};

const EditAlbum: NextPage<IAppProps> = (props) => {
  // Deactivating the player and activating the navbar
  const { setPlayer, setNavbar } = useUpdateMisc()!;
  setPlayer(false);
  setNavbar(true);

  // DnD da ordem das músicas
  const [musics, setMusics] = useState(props.album.musics);
  const [order, setOrder] = useState([...Array(props.album.musics.length).keys()]);

  const handleOnDragEnd = (result: any) => {
    const phMusics = musics;
    const phOrder = order;

    const [reorderedMusic] = phMusics.splice(result.source.index, 1);
    phMusics.splice(result.destination.index, 0, reorderedMusic);
    const [reorderedIndex] = phOrder.splice(result.source.index, 1);
    phOrder.splice(result.destination.index, 0, reorderedIndex);

    setMusics(phMusics);
    setOrder(phOrder);
  }

  const deleteMusic = (id: string) => {
    const musicIndex = musics.findIndex((music) => music._id == id);
    const newMusics = musics.filter((music) => !(music._id == id));

    const newOrder = order.filter((index) => { return index !== musicIndex }).map((index) => {
      if (index < musicIndex) return index;
      return index - 1;
    })

    setMusics(newMusics);
    setOrder(newOrder);
  }

  const addMusic = (music: IMusic) => {
    const newMusics = [...musics, music];
    const newOrder = [...order, order.length];

    setMusics(newMusics);
    setOrder(newOrder);
  }

  // Tags
  const [tags, setTags] = useState<string[]>(props.album.tags ? props.album.tags : []);
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
  const [cover, setCover] = useState<any>(process.env.NEXT_PUBLIC_API_URL + props.album.cover);
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
    fetch(`/api/music/search?query=` + modelSearch, {
      method: "GET"
    }).then((res) => res.json().then((data) => setModelSearchRes(data)));
  }

  const [name, setName] = useState<string>();

  // Atualizar database
  const handleSubmit = () => {
    const changeMusics = (() => {
      const compareArrays = (a: IMusic, b: IMusic) => a._id == b._id;
      const onlyInOriginal = props.album.musics.filter((music) => !musics.some((m) => compareArrays(music, m)));
      const onlyInNew = musics.filter((music) => !props.album.musics.some((m) => compareArrays(music, m)));

      return [...onlyInOriginal, ...onlyInNew].map((music) => music._id);
    })();

    const changeTags = (() => {
      const compareArrays = (a: string, b: string) => a == b;
      const onlyInOriginal = props.album.tags.filter((t1) => !tags.some((t2) => compareArrays(t1, t2)));
      const onlyInNew = tags.filter((t1) => !props.album.tags.some((t2) => compareArrays(t1, t2)));

      return [...onlyInOriginal, ...onlyInNew]
    })();

    const formdata = new FormData();
    name ? formdata.append("name", name) : null;
    coverFile ? formdata.append("cover", coverFile) : null;
    changeMusics.forEach((music) => formdata.append("musics", music));
    changeTags.forEach((tag) => formdata.append("tags", tag));
    order.forEach((index) => formdata.append("order", index.toString()));

    fetch(`/api/album/${props.album._id}`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${props.auth}` },
      body: formdata
    }).then((res) => res.json().then((data) => {
      if (data.message) throw new Error(data.message);

      toast.success("Alterações salvas.");
      router.push(`/album/${props.album._id}`);
    })).catch((e: any) => {
      return toast.error(e.message);
    });
  }

  return (
    <div className="m-24 flex items-center justify-center">
      <Head>
        <title>Editar {props.album.name} - Listeningto</title>
      </Head>

      <div className="w-5/6 h-5/6 pb-2 bg-white/10 relative">
        <div className="ml-16 mt-16 w-11/12">
          <h1 className="font-fjalla text-3xl mt-8 border-b-4 border-black/50">Editar "{props.album.name}"</h1>

          {/* Foto de perfil */}
          <div className="relative h-64 w-64 mt-8">
            <input id="file" type={"file"} onChange={(e) => handleImage(e)} className="hidden" />
            <label htmlFor="file" className="cursor-pointer">
              <Image src={cover} width={256} height={256} className="block" />
              <div className="absolute top-0 left-0 h-full w-full bg-black/60 flex flex-col items-center justify-center opacity-0 transition-opacity hover:opacity-100">
                <FiUpload size={100} className="text-gray-900/90" />
              </div>
            </label>
          </div>

          {/* Nome do álbum */}
          <div className="flex mt-8 border-b-4 border-black/50 pb-8">
            <div className="basis-1/2">
              <label htmlFor="albumName" className="text-lg">Nome do álbum</label>
              <input id="albumName" type="text" className="bg-transparent text-white block w-96 outline-0 border-0 border-b-2 mt-0.5 appearance-none focus:ring-0" onChange={(e) => setName(e.target.value)} />
            </div>
          </div>

          {/* Músicas */}
          <div className="flex mt-8">
            <div className="basis-1/2 pr-4">
              <h1 className='font-fjalla text-2xl mt-2 mb-2'>Músicas</h1>
              <DragDropContext onDragEnd={(result) => handleOnDragEnd(result)}>
                <Droppable droppableId="musics">
                  {(provided) => {
                    return (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {
                        musics.map((music, i) => {
                          return (
                            <Draggable key={music._id} draggableId={music._id} index={i}>
                              {(provided) => {
                                return (
                                  <div {...provided.draggableProps} ref={provided.innerRef} {...provided.dragHandleProps} className="p-1 even:bg-gray-500 odd:bg-gray-600 text-black">
                                    <span>{ music.name }</span>
                                    <BsFillTrashFill onClick={() => { deleteMusic(music._id) }} className='float-right my-1 mr-1 inline-block cursor-pointer hover:text-red-800' size={16} />
                                  </div>
                                )
                              }}
                            </Draggable>
                          )
                        })
                      }
                      {provided.placeholder}
                    </div>
                    )
                  }}
                </Droppable>
              </DragDropContext>
              <button onClick={() => { const prevVal = showModel; setShowModel(!prevVal) }} className='mt-2 py-1 px-2 block border border-blue-900 font-semibold rounded-md bg-primary hover:bg-primary/50'>
                <HiOutlinePlus size={20} className='inline-block' />
                <p className='inline-block ml-1'>Adicionar música</p>
              </button>
            </div>
            <div className="basis-1/2">
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

          <div className="absolute w-full pr-16 bottom-4 [&>*]:mx-2">
            <button className="float-right border border-blue-900 font-semibold rounded-xl py-2 px-4 bg-primary hover:bg-primary/5" onClick={handleSubmit}>Salvar alterações</button>
            <button className="float-right border border-blue-900 font-semibold rounded-xl py-2 px-4 bg-gray-900 hover:bg-gray-700" onClick={() => router.push(`../${ router.query.id }`)}>Cancelar</button>
          </div>   
        </div>
      </div>

      <div className={`fixed top-0 left-0 z-10 w-full h-full justify-center items-center bg-black/40 ${showModel ? "flex" : "hidden"}`}>
        <div className='w-1/2 h-5/6 p-4 bg-box border-2 relative overflow-hidden'>
          <BsXCircle size={24} className="float-right cursor-pointer" onClick={() => { setShowModel(false); setModelSearchRes(undefined); setModelSearch("") }} />
          <h1 className='text-2xl font-fjalla mb-2'>Adicionar músicas</h1>
          <div className='w-4/6 bg-white rounded-md flex items-center h-10'>
            <input onChange={(e) => setModelSearch(e.target.value)} value={modelSearch} type={"text"} className="rounded-md basis-11/12 text-black border-none appearance-none focus:ring-0" />
            <GoSearch onClick={handleModelSearch} size={30} className="text-black text-center basis-1/12 cursor-pointer" />
          </div>
          <div className='flex flex-col text-black w-4/6 -mt-1'>
            {
              (modelSearchRes?.filter((music) => { return !musics.some((m) => m._id == music._id && !m.authors.some((a) => a._id == props.album.author._id)) }))?.map((music, i) => {
                return (
                  <div className='even:bg-white/50 odd:bg-gray-300 p-1 relative'>
                    <span className='inline-block'>{ i + 1 }.</span>
                    <span className='ml-1 inline-block'>{ music.name }</span>
                    <HiOutlinePlus onClick={() => { addMusic(music); setShowModel(false) }} className='float-right my-1 mr-1 inline-block cursor-pointer hover:text-green-800' size={16} />
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