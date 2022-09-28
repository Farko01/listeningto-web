import React, { useContext, useState, useRef } from 'react';
import { IAlbum } from '../interfaces/album.interface';
import { IMusic } from '../interfaces/music.interface';
import { IMusicList } from '../interfaces/musicList.interface';
import IUser from '../interfaces/user.interface';

interface IAppProps {
	children: any;
}

interface IInfo {
  cover: string;
	album: IAlbum;
  music: IMusic;
}

enum Repeat {
  NoRepeat = 0,
  Repeat = 1,
  RepeatOne = 2
}

interface IPlayerContext {
	audioPlayer: React.RefObject<HTMLAudioElement>;
	musicList: IMusicList | undefined;
	src: string | undefined;
	info: IInfo | null;
	isPlaying: boolean;
	duration: number;
	currentTime: number;
	order: number[] | undefined;
	orderIndex: number;
	isShuffled: boolean;
	volume: number;
	isMuted: boolean;
	repeat: Repeat;
	autoPlay: boolean;
}

interface IPlayerUpdateContext {
	setMusicList: React.Dispatch<React.SetStateAction<IMusicList | undefined>>;
	setSrc: React.Dispatch<React.SetStateAction<string | undefined>>;
	setInfo: React.Dispatch<React.SetStateAction<IInfo | null>>;
	setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
	setDuration: React.Dispatch<React.SetStateAction<number>>;
	setCurrentTime: React.Dispatch<React.SetStateAction<number>>
	setOrder: React.Dispatch<React.SetStateAction<number[] | undefined>>;
	setOrderIndex: React.Dispatch<React.SetStateAction<number>>;
	setIsShuffled: React.Dispatch<React.SetStateAction<boolean>>;
	setVolume: React.Dispatch<React.SetStateAction<number>>;
	setIsMuted: React.Dispatch<React.SetStateAction<boolean>>;
	setRepeat: React.Dispatch<React.SetStateAction<Repeat>>;
	setAutoplay: React.Dispatch<React.SetStateAction<boolean>>;
}

const PlayerContext = React.createContext<IPlayerContext | undefined>(undefined);
const PlayerUpdateContext = React.createContext<IPlayerUpdateContext | undefined>(undefined);

export const usePlayer = () => {
	return useContext(PlayerContext);
}

export const useUpdatePlayer = () => {
	return useContext(PlayerUpdateContext);
}

export const PlayerProvider: React.FC<IAppProps> = ({ children }) => {
	const [musicList, setMusicList] = useState<IMusicList>();
	const [src, setSrc] = useState<string>();
	const [info, setInfo] = useState<IInfo | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [duration, setDuration] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);
	const [order, setOrder] = useState<number[]>();
	const [orderIndex, setOrderIndex] = useState(0);
	const [isShuffled, setIsShuffled] = useState(false);
	const [volume, setVolume] = useState(100);
	const [isMuted, setIsMuted] = useState(false);
	const [repeat, setRepeat] = useState(Repeat.NoRepeat);
	const [autoPlay, setAutoplay] = useState(true); // This state is only used for not autoplaying when looping the list with the repeat state being set to NoRepeat
	const audioPlayer = useRef() as React.RefObject<HTMLAudioElement>;

	return (
		<PlayerContext.Provider value={{ audioPlayer, musicList, src, info, isPlaying, duration, currentTime, order, orderIndex, isShuffled, volume, isMuted, repeat, autoPlay }}>
			<PlayerUpdateContext.Provider value={{ setMusicList, setSrc, setInfo, setIsPlaying, setDuration, setCurrentTime, setOrder, setOrderIndex, setIsShuffled, setVolume, setIsMuted, setRepeat, setAutoplay }}>
				<audio ref={audioPlayer} id="audio">
					<source src={src} />
				</audio>

				{ children }
			</PlayerUpdateContext.Provider>
		</PlayerContext.Provider>
	)
}