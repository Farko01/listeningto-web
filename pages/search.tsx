import { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { GoSearch } from "react-icons/go";
import Card from "../components/Card";
import { useUpdateMisc } from "../contexts/MiscContext";
import { IAlbum } from "../interfaces/album.interface";
import { IMusic } from "../interfaces/music.interface";
import { IPlaylist } from "../interfaces/playlist.interface";
import IUser from "../interfaces/user.interface";
import { HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi'

const SearchPage: NextPage = () => {
  // Activating the player and navbar
  const { setPlayer, setNavbar } = useUpdateMisc()!;
  setPlayer(true);
  setNavbar(true);

	const [searchVal, setSearchVal] = useState<string>("");
	const [searchedVal, setSearchedVal] = useState<string>("");
	const [showRes, setShowRes] = useState<boolean>(false);

	const [userRes, setUserRes] = useState<IUser[]>([]);
	const [musicRes, setMusicRes] = useState<IMusic[]>([]);
	const [albumRes, setAlbumRes] = useState<IAlbum[]>([]);
	const [playlistRes, setPlaylistRes] = useState<IPlaylist[]>([]);

	const [showUsers, setShowUsers] = useState<boolean>(true);
	const [showMusics, setShowMusics] = useState<boolean>(true);
	const [showAlbums, setShowAlbums] = useState<boolean>(true);
	const [showPlaylists, setShowPlaylists] = useState<boolean>(true);

	const handleSearch = () => {
		setSearchedVal(searchVal);
		setShowRes(false);

		fetch("/api/user/search?query=" + searchVal, { method: "GET" }).then((res) => res.json().then((data) => setUserRes(data)));
		fetch("/api/music/search?query=" + searchVal, { method: "GET" }).then((res) => res.json().then((data) => setMusicRes(data)));
		fetch("/api/album/search?query=" + searchVal, { method: "GET" }).then((res) => res.json().then((data) => setAlbumRes(data)));
		fetch("/api/playlist/search?query=" + searchVal, { method: "GET" }).then((res) => res.json().then((data) => setPlaylistRes(data)));

		setShowUsers(true);
		setShowMusics(true);
		setShowAlbums(true);
		setShowPlaylists(true);
		setShowRes(true);
	}

	return (
		<div>
			<Head>
				<title>Buscar - Listeningto</title>
			</Head>

			<div className="mt-24 flex justify-center">
				<div className='w-4/6 bg-white rounded-md flex items-center h-12' onKeyUp={(e) => { if (e.key == 'Enter') handleSearch() }}>
					<input placeholder="Busque por músicas, álbuns, playlists, tags ou usuários" value={searchVal} onChange={(e) => { setSearchVal(e.target.value) }} type={"text"} className="rounded-md w-full text-black border-none appearance-none focus:ring-0 font-light placeholder:italic" />
					<GoSearch onClick={handleSearch} size={36} className="text-black text-center cursor-pointer mr-2" />
        </div>
			</div>
			<div className="flex justify-center">
				{
					showRes ?
						<div className="bg-box mt-12 p-4 shadow-xl shadow-black/50 w-11/12">
						{
							userRes.length > 0 || musicRes.length > 0 || albumRes.length > 0 || playlistRes.length > 0 ?
							<div className="-mb-2">
								<h1 className="mb-2 text-2xl font-fjalla border-b-4 border-gray-900">Resultados para &quot;{searchedVal}&quot;</h1>
								{
									userRes.length > 0 ?
									<div className="pl-2 mb-2">
										<div className="w-full flex items-center bg-white/20 relative cursor-pointer" onClick={() => { const prevVal = showUsers; setShowUsers(!prevVal) } }>
											<h1 className="text-2xl font-fjalla py-1 px-3">Usuários</h1>
											{ showUsers ?  <HiOutlineChevronUp size={24} className="absolute right-8" /> : <HiOutlineChevronDown size={24} className="absolute right-8" /> }
										</div>
										<div className={`flex-wrap w-full [&>*]:m-2 py-1 border-2 border-white/20 ${showUsers ? "flex" : "hidden"}`}>
										{
											userRes.map((user, i) => <Card key={i} image={process.env.NEXT_PUBLIC_API_URL + user.profilePic} link={`/user/${user._id}`} text={user.username} subtext={"Perfil de usuário"} />)
										}
										</div>
									</div>
									: null
								}
								{
									musicRes.length > 0 ?
									<div className="pl-2 mb-2">
										<div className="w-full flex items-center bg-white/20 relative cursor-pointer" onClick={() => { const prevVal = showMusics; setShowMusics(!prevVal) } }>
											<h1 className="text-2xl font-fjalla py-1 px-3">Músicas</h1>
											{ showMusics ?  <HiOutlineChevronUp size={24} className="absolute right-8" /> : <HiOutlineChevronDown size={24} className="absolute right-8" /> }
										</div>
										<div className={`flex-wrap w-full [&>*]:m-2 py-1 border-2 border-white/20 ${showMusics ? "flex" : "hidden"}`}>
										{
											musicRes.map((music, i) => <Card key={i} image={process.env.NEXT_PUBLIC_API_URL + music.cover} link={`/music/${music._id}`} text={music.name} subtext={"Música"} />)
										}
										</div>
									</div>
									: null
								}
								{
									albumRes.length > 0 ?
									<div className="pl-2 mb-2">
										<div className="w-full flex items-center bg-white/20 relative cursor-pointer" onClick={() => { const prevVal = showAlbums; setShowAlbums(!prevVal) } }>
											<h1 className="text-2xl font-fjalla py-1 px-3">Álbuns</h1>
											{ showAlbums ?  <HiOutlineChevronUp size={24} className="absolute right-8" /> : <HiOutlineChevronDown size={24} className="absolute right-8" /> }
										</div>
										<div className={`flex-wrap w-full [&>*]:m-2 py-1 border-2 border-white/20 ${showAlbums ? "flex" : "hidden"}`}>
										{
											albumRes.map((album, i) => <Card key={i} image={process.env.NEXT_PUBLIC_API_URL + album.cover} link={`/album/${album._id}`} text={album.name} subtext={"Álbum"} />)
										}
										</div>
									</div>
									: null
								}
								{
									playlistRes.length > 0 ?
									<div className="pl-2 mb-2">
										<div className="w-full flex items-center bg-white/20 relative cursor-pointer" onClick={() => { const prevVal = showPlaylists; setShowPlaylists(!prevVal) } }>
											<h1 className="text-2xl font-fjalla py-1 px-3">Playlists</h1>
											{ showPlaylists ?  <HiOutlineChevronUp size={24} className="absolute right-8" /> : <HiOutlineChevronDown size={24} className="absolute right-8" /> }
										</div>
										<div className={`flex-wrap w-full [&>*]:m-2 py-1 border-2 border-white/20 ${showPlaylists ? "flex" : "hidden"}`}>
										{
											playlistRes.map((playlist, i) => <Card key={i} image={process.env.NEXT_PUBLIC_API_URL + playlist.cover} link={`/album/${playlist._id}`} text={playlist.name} subtext={"Playlist"} />)
										}
										</div>
									</div>
									: null
								}
							</div>
							: <h1 className="text-2xl font-fjalla">Nenhum resultado para &quot;{searchedVal}&quot;</h1>
						}
						</div>
					: null
				}
			</div>
		</div>
	)
}

export default SearchPage