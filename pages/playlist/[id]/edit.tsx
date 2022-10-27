import { verify } from "jsonwebtoken";
import type { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import router from "next/router";
import { useState } from "react";
import { FiUpload } from "react-icons/fi";
import Image from "next/image"
import { useUpdateMisc } from "../../../contexts/MiscContext";
import { BsXCircle } from 'react-icons/bs';
import { toast } from "react-toastify";
import { IPlaylist } from "../../../interfaces/playlist.interface";

interface IAuthToken {
  id: string;
}

interface IAppProps {
  playlist: IPlaylist;
  auth: string | null;
}

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
  if (req.cookies.auth) {
    const playlist = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/playlist/${params!.id}`, { headers: { "Authorization": `Bearer ${req.cookies.auth}` } }).then((res) => res.json());
    const decoded = verify(req.cookies.auth, process.env.JWT_SECRET!) as IAuthToken;

    if (!playlist.message) {
      if (playlist.createdBy._id == decoded.id) {
        return {
          props: {
            playlist: playlist,
            auth: req.cookies.auth ? req.cookies.auth : null,
          }
        }
      }
    }
  }

  return {
    props: {},
    redirect: {
      destination: "/",
      permanent: false
    }
  }
}

const EditAlbum: NextPage<IAppProps> = (props) => {
  // Deactivating the player and activating the navbar
  const { setPlayer, setNavbar } = useUpdateMisc()!;
  setPlayer(false);
  setNavbar(true);

  // Tags
  const [tags, setTags] = useState<string[]>(props.playlist.tags ? props.playlist.tags : []);
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
  const [cover, setCover] = useState<any>(process.env.NEXT_PUBLIC_API_URL + props.playlist.cover);
  const [coverFile, setCoverFile] = useState<File>();

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    setCoverFile(e.target.files![0]);
    reader.readAsDataURL(e.target.files![0]);

    reader.onload = () => {
      if (reader.readyState == 2) setCover(reader.result);
    }
  }

  const [name, setName] = useState<string>();

  // Atualizar database
  const handleSubmit = () => {
    const changeTags = (() => {
      const compareArrays = (a: string, b: string) => a == b;
      const onlyInOriginal = props.playlist.tags.filter((t1) => !tags.some((t2) => compareArrays(t1, t2)));
      const onlyInNew = tags.filter((t1) => !props.playlist.tags.some((t2) => compareArrays(t1, t2)));

      return [...onlyInOriginal, ...onlyInNew]
    })();

    const formdata = new FormData();
    name ? formdata.append("name", name) : null;
    coverFile ? formdata.append("cover", coverFile) : null;
    changeTags.forEach((tag) => formdata.append("tags", tag));

    fetch(`/api/music/${props.playlist._id}`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${props.auth}` },
      body: formdata
    }).then((res) => res.json().then((data) => {
      if (data.message) throw new Error(data.message);

      toast.success("Alterações salvas.");
      router.push(`/playlist/${props.playlist._id}`);
    })).catch((e: any) => {
      return toast.error(e.message);
    });
  }

  const handleDelete = () => {
    fetch(`/api/playlist/${props.playlist._id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${props.auth}` }
    }).then((res) => {
      if (res.status !== 204) res.json().then((data) => { throw new Error(data.message) });

      toast.success(`Álbum deletada: ${props.playlist.name}`);
      router.push("/");
    }).catch((e: any) => {
      return toast.error(e.message);
    });
  }

  return (
    <div className="m-24 flex items-center justify-center">
      <Head>
        <title>Editar {props.playlist.name} - Listeningto</title>
      </Head>

      <div className="w-5/6 h-5/6 bg-white/10 relative pb-16">
        <div className="ml-16 mt-16 w-11/12">
          <h1 className="font-fjalla text-3xl mt-8 border-b-4 border-black/50">Editar "{props.playlist.name}"</h1>



          <div className="flex mt-8">
            <div className="basis-1/2 relative mt-8">
              <input id="file" type={"file"} onChange={(e) => handleImage(e)} className="hidden" />
              <label htmlFor="file" className="cursor-pointer">
                <Image src={cover} width={256} height={256} className="block" />
                <div className="absolute top-0 left-0 h-64 w-64 bg-black/60 flex flex-col items-center justify-center opacity-0 transition-opacity hover:opacity-100">
                  <FiUpload size={100} className="text-gray-900/90" />
                </div>
              </label>
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

          <div className="flex mt-8 pb-8">
            <div className="basis-1/2">
              <label htmlFor="musicName" className="text-lg">Nome da playlist</label>
              <input id="musicName" type="text" className="bg-transparent text-white block w-96 outline-0 border-0 border-b-2 mt-0.5 appearance-none focus:ring-0" onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="absolute w-full bottom-4 px-16 [&>*]:mx-2">
          <button className="float-left border border-red-700 font-semibold rounded-xl py-2 px-4 bg-red-600 hover:bg-red-600/75" onClick={handleDelete}>Deletar playlist</button>
          <button className="float-right border border-blue-900 font-semibold rounded-xl py-2 px-4 bg-primary hover:bg-primary/5" onClick={handleSubmit}>Salvar alterações</button>
          <button className="float-right border border-blue-900 font-semibold rounded-xl py-2 px-4 bg-gray-900 hover:bg-gray-700" onClick={() => router.push(`../${ router.query.id }`)}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}

export default EditAlbum