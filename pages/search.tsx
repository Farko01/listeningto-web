import { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { GoSearch } from "react-icons/go";
import { useUpdateMisc } from "../contexts/MiscContext";
import { IAlbum } from "../interfaces/album.interface";
import { IMusic } from "../interfaces/music.interface";
import { IPlaylist } from "../interfaces/playlist.interface";
import IUser from "../interfaces/user.interface";

interface ISearchRes {
	user?: IUser[];
	music?: IMusic[];
	album?: IAlbum[];
	playlist?: IPlaylist[];
}

const SearchPage: NextPage = () => {
  // Activating the player and navbar
  const { setPlayer, setNavbar } = useUpdateMisc()!;
  setPlayer(true);
  setNavbar(true);

	const [searchVal, setSearchVal] = useState<string>("");
	const [searchRes, setSearchRes] = useState<ISearchRes>();
	const [showRes, setShowRes] = useState<boolean>(false);
	const [hasRes, setHasRes] = useState<boolean>(false);
	const handleSearch = () => {
		let resObj: ISearchRes = {};
		setShowRes(false);

		// User
		fetch("/api/user/search?query=" + searchVal, { method: "GET" }).then((res) => res.json().then((data) => { resObj.user = data }));

		// Music
		fetch("/api/music/search?query=" + searchVal, { method: "GET" }).then((res) => res.json().then((data) => { resObj.music = data }));

		// Album
		fetch("/api/album/search?query=" + searchVal, { method: "GET" }).then((res) => res.json().then((data) => { resObj.album = data }));

		// Playlist
		fetch("/api/playlist/search?query=" + searchVal, { method: "GET" }).then((res) => res.json().then((data) => { resObj.playlist = data }));

		console.log(searchVal, resObj);

		Object.values(resObj!).every(x => x.length > 0 ) ? setHasRes(true) : setHasRes(false);

		setSearchRes(resObj);
		setShowRes(true);
	}

	return (
		<div>
			<Head>
				<title>Buscar - Listeningto</title>
			</Head>

			<div className="mt-24 flex justify-center">
				<div className='w-4/6 bg-white rounded-md flex items-center h-12'>
          <input value={searchVal} onChange={(e) => { setSearchVal(e.target.value); setShowRes(false) }} type={"text"} className="rounded-md w-full text-black border-none appearance-none focus:ring-0" />
          <GoSearch onClick={handleSearch} size={36} className="text-black text-center cursor-pointer mr-2" />
        </div>
			</div>
			<div>
				{
					showRes ?
					<>
						{
							hasRes ?
							<div>
								<h1>Resultados para: {searchVal}</h1>

								
							</div>
							: <h1>Não há resultados para: {searchVal}</h1>
						}
					</>
					: null
				}
			</div>
		</div>
	)
}

export default SearchPage