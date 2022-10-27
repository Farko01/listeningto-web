import React, { useEffect, useRef } from 'react'
import formatTime from '../misc/formatTime'
import { BsFillPlayFill, BsPauseFill } from 'react-icons/bs'
import { BiShuffle, BiSkipPrevious, BiSkipNext } from 'react-icons/bi'
import { FiVolume, FiVolume1, FiVolume2, FiVolumeX } from 'react-icons/fi'
import { TbRepeat, TbRepeatOff, TbRepeatOnce } from 'react-icons/tb'
import { IconContext } from 'react-icons'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link';
import shuffle from '../misc/shuffle';
import { usePlayer, useUpdatePlayer } from '../contexts/PlayerContext'
import { useMisc } from '../contexts/MiscContext'
import { IoLibraryOutline } from 'react-icons/io5'
import { useRouter } from 'next/router'
import { IAlbum } from '../interfaces/album.interface'
import { IMusic } from '../interfaces/music.interface'

interface IInfo {
  cover: string;
  music: IMusic;
  album: IAlbum;
}

enum Repeat {
  NoRepeat = 0,
  Repeat = 1,
  RepeatOne = 2
}

const Player = () => {
  // Context
  const { audioPlayer, musicList, src, info, isPlaying, duration, currentTime, order, orderIndex, isShuffled, volume, isMuted, repeat, autoPlay } = usePlayer()!;
  const { setMusicList, setSrc, setInfo, setIsPlaying, setDuration, setCurrentTime, setOrder, setOrderIndex, setIsShuffled, setVolume, setIsMuted, setRepeat, setAutoplay } = useUpdatePlayer()!;
  const { player } = useMisc()!;

  // References
  const progressBar = useRef() as React.RefObject<HTMLInputElement>;  // Progress bar reference
  const animationRef = useRef<number>();  // Animation reference
  const volumeRef = useRef() as React.RefObject<HTMLInputElement>;  // Volume bar reference

  // Activating / deactivating the player
  useEffect(() => {
    const playerHTML = document.getElementById("player")!;

    if (player) {
      playerHTML.classList.remove("hidden")
      playerHTML.parentElement?.classList.add("pb-36");
    } else {
      playerHTML.classList.add("hidden");
      playerHTML.parentElement?.classList.remove("pb-36");
      
      audioPlayer.current!.pause();
      setIsPlaying(false);
    }
  });

  // Changing the music that is being played
  useEffect(() => {
    if (!musicList) return;
    
    // Setting src
    const currentSrc = musicList!.musics[ musicList.index].file!;
    setSrc(`${process.env.NEXT_PUBLIC_API_URL}${currentSrc}`);
    
    // Setting order
    if (!isShuffled) {
      const newOrder = [... Array(musicList.musics.length).keys()];
      setOrder(newOrder);
      setOrderIndex(newOrder.indexOf(musicList.index));
    }
  }, [musicList]);

  // Changing the cover, the music name and author shown in the player
  useEffect(() => {
    if (!musicList) return;
    
    const musicId = musicList.musics[musicList.index]._id;
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/music/${musicId}/album`).then((res) => {
      const musicInfo: IInfo = {
        cover: res.data ? res.data.cover : musicList.musics[musicList.index].cover,
        music: musicList.musics[musicList.index],
        album: res.data
      }

      setInfo(musicInfo);
    })
  }, [musicList]);

  useEffect(() => {
    if (!src) return;
    if (!audioPlayer.current) return;

    // Loading and playing new src
    audioPlayer.current.load();

    // Not autoplaying if repeat is set to NoRepeat
    if (!autoPlay) {
      setAutoplay(true);

      audioPlayer.current.pause();
      cancelAnimationFrame(animationRef.current!);
      setIsPlaying(false);

      return;
    }

    if (!isPlaying) { 
      togglePlayPause();
    } else {
      audioPlayer.current.play();
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  }, [src]);

  // Play and pause
  const togglePlayPause = () => {
    if (!audioPlayer.current) return;
    const prevValue = isPlaying;

    if (!prevValue) {
      audioPlayer.current.play();
      
      animationRef.current = requestAnimationFrame(updateProgress);
    } else {
      audioPlayer.current.pause();
      cancelAnimationFrame(animationRef.current!);
    }

    setIsPlaying(!prevValue);
  }

  // Duration
  useEffect(() => {
    if (!audioPlayer.current) return;

    const seconds = Math.floor(audioPlayer.current.duration);
    setDuration(seconds);
  }, [audioPlayer?.current?.readyState]);

  // Current time
  const changeRange = () => {
    if (!audioPlayer.current || !progressBar.current) return;

    audioPlayer.current.currentTime = parseInt(progressBar.current!.value);
    setCurrentTime(parseInt(progressBar.current!.value));
  }

  const updateProgress = () => {
    if (!audioPlayer.current || !progressBar.current || !animationRef.current) return;

    progressBar.current.value = audioPlayer.current.currentTime.toString();
    setCurrentTime(audioPlayer.current!.currentTime);

    animationRef.current = requestAnimationFrame(updateProgress);
  }

  // Update the progress bar
  const UpdateProgressBarColor = () => {
    if (!progressBar.current) return;

    const value = currentTime / duration * 100;
    progressBar.current.style.background = `linear-gradient(to right, #1e3b8a 0%, #1e3b8a ${value}%, #fff ${value}%, white 100%)`;
  }

  useEffect(() => {
    UpdateProgressBarColor();
  }, [currentTime]);

  // Shuffle the list
  const shuffleList = () => {
    if (!musicList) return;

    const prevValue = isShuffled;
    setIsShuffled(!prevValue);

    if (!prevValue) {
      // Shuffles the list
      const randomOrder = shuffle([... Array(musicList.musics.length).keys()]);
      setOrder(randomOrder);

      setOrderIndex(randomOrder.indexOf(musicList.index));
    } else {
      // Unshuffles the list
      const normalOrder = [... Array(musicList.musics.length).keys()];

      setOrder(normalOrder);
      setOrderIndex(normalOrder.indexOf(musicList.index));
    }
  }

  // Going to the next music after the previous one ended
  const changeMusic = () => {
    if (!order || !musicList) return;

    // Repeating the same music if repeat is set to RepeatOne
    if (repeat == Repeat.RepeatOne) {
      audioPlayer.current!.currentTime = 0;
      audioPlayer.current!.play();
      
      return;
    }

    const prevIndex = orderIndex;
    const newIndex = prevIndex ==  musicList.musics.length - 1 ? 0 : prevIndex + 1;
    setOrderIndex(newIndex);

    // Not autoplaying if repeat is set to NoRepeat
    if (newIndex == 0 && repeat == Repeat.NoRepeat) setAutoplay(false);
    
    const prevMusics =  musicList.musics;
    setMusicList({ musics: prevMusics, index: order[newIndex] });
  }

  useEffect(() => {
    if (Math.trunc(currentTime) == duration) changeMusic();
  }, [currentTime]);

  // Skip to the next music
  const nextMusic = () => {
    // The state changes after changeMusic() is executed, so to stop
    // the music from playing again even when skipping
    // I needed to copy the code from the changeMusic() function
    if (repeat == Repeat.RepeatOne) {
      setRepeat(Repeat.Repeat);

      const prevIndex = orderIndex;
      const newIndex = prevIndex ==  musicList!.musics.length - 1 ? 0 : prevIndex + 1;
      setOrderIndex(newIndex);

      const prevMusics =  musicList!.musics;
      setMusicList({ musics: prevMusics, index: order![newIndex] });
    } else changeMusic();
  }

  // Go to the previous music
  const previousMusic = () => {
    if (!order || ! musicList) return;
    if (repeat == Repeat.RepeatOne) setRepeat(Repeat.Repeat);

    const prevIndex = orderIndex;
    const newIndex = prevIndex == 0 ?  musicList.musics.length - 1 : prevIndex - 1;
    setOrderIndex(newIndex);

    const prevMusics =  musicList.musics;
    setMusicList({ musics: prevMusics, index: order[newIndex] });
  }

  // Manipulate volume
  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.valueAsNumber;

    // Changing audio volume
    setVolume(value);
    audioPlayer.current!.volume = value / 100; 

    // Unmuting on volume change
    if (isMuted) setIsMuted(false);

    // Changing range background
    e.target.style.background = `linear-gradient(to right, #1e3b8a 0%, #1e3b8a ${value}%, #fff ${value}%, white 100%)`;
  }

  const handleMuted = () => {
    const prevValue = isMuted;
    setIsMuted(!prevValue);
  }

  useEffect(() => {
    audioPlayer.current!.muted = isMuted;
  }, [isMuted]);

  // Changing repeat
  const changeRepeat = () => {
    switch(repeat) {
      case Repeat.NoRepeat: {
        setRepeat(Repeat.Repeat);
        break;
      }
      case Repeat.Repeat: {
        setRepeat(Repeat.RepeatOne);
        break;
      }
      case Repeat.RepeatOne: {
        setRepeat(Repeat.NoRepeat);
        break;
      }
    }
  }

  const router = useRouter();
  const queueRedirect = () => {
    if (router.asPath !== '/queue') router.push('/queue');
    else router.back();
  }

  // Music info
  const MusicInfo = () => {
    if (info) {
      const displayAuthors = () => {
        return <>
          { info.music.authors.map((author, i) => { 
            if (i != info.music.authors.length - 1) return <a><Link href={"/user/" + author._id!}>{author.username! + ", "}</Link></a>
            else return <Link href={"/user/" + author._id!}><a>{author.username!}</a></Link>
           }) }
        </>;
      }

      return (
        <div className="flex flex-row items-center justify-start gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 shrink-0">
              <Image src={`${process.env.NEXT_PUBLIC_API_URL}${info.cover}`} width="100%" height="100%" objectFit="cover" alt='' />
            </div>

            <div>
              <p className="text-ellipsis overflow-hidden">
                {info.music.name}
              </p>
              <p className="text-ellipsis overflow-hidden">
                {displayAuthors()}
              </p>
            </div>
          </div>
        </div>
      )
    } else return null
  }
  
  return (
    <div id="player" className="fixed bottom-0 left-0 w-full text-white">
      <div className="relative bg-primary bg-gradient-to-b from-blue-900/50 border-t-2 border-white/20 w-full h-28 flex justify-center items-center p-4">
        {/* Music Info */}
        <div className='basis-1/6 mx-2'>
          <MusicInfo />
        </div>
        
        <div className="basis-4/6 flex flex-col items-center gap-6 mx-2">
          {/* Buttons */}
          <IconContext.Provider value={{ size: '30px' }}>
            <div className="flex items-center gap-3 -mb-4">
              {/* Previous */}
              <button onClick={() => { previousMusic() }} className="hover:text-blue-900">
                <BiSkipPrevious />
              </button>
              {/* Shuffle */}
              <button onClick={() => shuffleList() }>
                <BiShuffle className={ isShuffled ? 'text-blue-900' : 'text-white hover:text-blue-900' } />
              </button>
              {/* Play/Pause */}
              <button onClick={() => togglePlayPause() } className="hover:text-blue-900" >
                { isPlaying ? <BsPauseFill/> : <BsFillPlayFill /> }
              </button>
              {/* Repeat */}
              <button onClick={() => changeRepeat() } className="hover:text-blue-900">
                { repeat == Repeat.NoRepeat ? <TbRepeatOff /> : repeat == Repeat.Repeat ? <TbRepeat /> : <TbRepeatOnce /> }
              </button>
              {/* Next */}
              <button onClick={() => { nextMusic() }} className="hover:text-blue-900">
                <BiSkipNext />
              </button>
            </div>
          </IconContext.Provider>

          {/* Current Time / Progress Bar / Duration */}
          <div className="w-full flex items-center justify-center gap-4">
            {/* Current Time */}
            <span>
              {formatTime(currentTime)}
            </span>
            {/* Progress Bar */}
            <div className="w-1/3">
              <input type="range" value={currentTime} max={duration} onChange={() => { changeRange() }} ref={progressBar} className="appearance-none range-input h-1 mb-1 w-full rounded outline-none" />
            </div>
            {/* Duration */}
            <span>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className='basis-1/6 mx-2'>
          <IconContext.Provider value={{ className: "mx-2", size: "30px" }}>
            <div className="flex items-center gap-2">
              <IoLibraryOutline title={"Lista de Reprodução"} className="cursor-pointer" onClick={() => { queueRedirect() }} />

              <button onClick={() => handleMuted() }>
                {/* I can't just use a local component to render the icons since it will not work, so yeah it's a mess */}
                { isMuted ? <FiVolumeX /> : volume > 50 ? <FiVolume2 /> : volume > 0 ? <FiVolume1 /> : <FiVolume /> }
              </button>

              <div className="w-36">
                <input type="range" value={volume} ref={volumeRef} step={1} max={100} onChange={(e) => handleVolume(e) } className="appearance-none range-input h-1 mb-1 w-full rounded outline-none bg-blue-900" />
              </div>
            </div>
          </IconContext.Provider>
        </div>
      </div>
    </div>
  )
}

export default Player