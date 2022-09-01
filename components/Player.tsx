import React, { useEffect, useState, useRef } from 'react'
import { BsFillPlayFill, BsPauseFill } from 'react-icons/bs'
import { BiShuffle, BiSkipPrevious, BiSkipNext } from 'react-icons/bi'
import { FiVolume, FiVolume1, FiVolume2, FiVolumeX } from 'react-icons/fi'
import { TbRepeat, TbRepeatOff, TbRepeatOnce } from 'react-icons/tb'
import { IconContext } from 'react-icons'
import axios from 'axios'

import Image from 'next/image'

import shuffle from '../misc/shuffle';
import IUser from '../interfaces/user.interface'
import { usePlayer, useUpdatePlayer } from '../contexts/PlayerContext'

interface IInfo {
  authors: IUser[];
  musicName: string;
  albumName: string | null;
  cover: string;
}

enum Repeat {
  NoRepeat = 0,
  Repeat = 1,
  RepeatOne = 2
}

const Player = () => {
  // Context
  const { musicList, src, info, isPlaying, duration, currentTime, order, orderIndex, isShuffled, volume, isMuted, repeat, autoPlay } = usePlayer()!;
  const { setMusicList, setSrc, setInfo, setIsPlaying, setDuration, setCurrentTime, setOrder, setOrderIndex, setIsShuffled, setVolume, setIsMuted, setRepeat, setAutoplay } = useUpdatePlayer()!;

  // References
  const audioPlayer = useRef() as React.RefObject<HTMLAudioElement>;  // <audio> reference
  const progressBar = useRef() as React.RefObject<HTMLInputElement>;  // Progress bar reference
  const animationRef = useRef<number>();  // Animation reference

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

  useEffect(() => {
    if (!src) return;

    // Loading and playing new src
    audioPlayer.current!.load();

    // Not autoplaying if repeat is set to NoRepeat
    if (!autoPlay) {
      setAutoplay(true);

      audioPlayer.current?.pause();
      cancelAnimationFrame(animationRef.current!);
      setIsPlaying(false);

      return;
    }

    if (!isPlaying) { 
      togglePlayPause();
    } else {
      audioPlayer.current?.play();
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  }, [src]);

  // Changing the cover, the music name and author shown in the player
  useEffect(() => {
    if (!musicList) return;
    
    const musicId = musicList.musics[musicList.index]._id!;
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/music/${musicId}/album`).then((res) => {
      const musicInfo: IInfo = {
        authors: musicList.musics[musicList.index].authors!,
        musicName: musicList.musics[musicList.index].name!,
        albumName: res.data ? res.data.name : null,
        cover: res.data ? res.data.cover : null
      }

      setInfo(musicInfo);
    }).catch((e: any) => console.log(e));
  }, [ musicList]);

  // Play and pause
  const togglePlayPause = () => {
    const prevValue = isPlaying;

    if (!prevValue) {
      audioPlayer.current?.play();
      
      animationRef.current = requestAnimationFrame(updateProgress);
    } else {
      audioPlayer.current?.pause();
      cancelAnimationFrame(animationRef.current!);
    }

    setIsPlaying(!prevValue);
  }

  // Formating time
  const formatTime = (seconds: number) => {
    if (!seconds || seconds == 0) return `00:00`

    const minutes = Math.floor(seconds / 60);
    const returnedMinutes = minutes < 10 ? `0${minutes}` : minutes.toString();

    const remainingSeconds = Math.floor(seconds % 60);
    const returnedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds.toString();

    return `${returnedMinutes}:${returnedSeconds}`;
  }

  // Duration
  useEffect(() => {
    const seconds = Math.floor(audioPlayer.current?.duration!);
    setDuration(seconds);
  }, [audioPlayer?.current?.readyState]);

  // Current time
  const changeRange = () => {
    audioPlayer.current!.currentTime = parseInt(progressBar.current?.value!);
    setCurrentTime(parseInt(progressBar.current!.value));
  }

  const updateProgress = () => {
    progressBar.current!.value = audioPlayer.current!.currentTime.toString();
    setCurrentTime(audioPlayer.current!.currentTime);

    animationRef.current = requestAnimationFrame(updateProgress);
  }

  // Update the progress bar
  const UpdateProgressBarColor = () => {
    const value = currentTime / duration * 100;
    progressBar.current!.style.background = `linear-gradient(to right, green 0%, green ${value}%, #fff ${value}%, white 100%)`;
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
      const randomOrder = shuffle([... Array( musicList.musics.length).keys()]);
      setOrder(randomOrder);

      setOrderIndex(randomOrder.indexOf( musicList.index));
    } else {
      // Unshuffles the list
      const normalOrder = [... Array( musicList.musics.length).keys()];

      setOrder(normalOrder);
      setOrderIndex(normalOrder.indexOf( musicList.index));
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

  // Skip to the next music
  const nextMusic = () => {
    if (repeat == Repeat.RepeatOne) setRepeat(Repeat.Repeat);

    changeMusic();
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

  // Music info
  const MusicInfo = () => {
    if (info) {
      const displayAuthors = () => {
        let displayNames = "";

        for (let i in info.authors) {
          if (parseInt(i) != info.authors.length - 1) {

            displayNames += `${info.authors[i].username!}, `;
          } else displayNames += info.authors[i].username!;
        }

        return displayNames;
      }

      return (
        <div className="absolute left-4 flex flex-row items-center justify-start w-1/4 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 shrink-0">
              <Image src={`${process.env.NEXT_PUBLIC_API_URL}${info.cover}`} width="100%" height="100%" objectFit="cover" />
            </div>

            <div>
              <p className="text-ellipsis overflow-hidden hover:underline">
                {info.musicName}
              </p>
              <p className="text-ellipsis overflow-hidden hover:underline">
                {displayAuthors()}
              </p>
            </div>
          </div>
        </div>
      )
    } else return null
  }

  return (
    <div className="absolute bottom-0">
      <audio ref={audioPlayer} id="audio" onEnded={() => changeMusic() }>
        <source src={src} />
      </audio>
      {/* parte do tailwind do site */}
      <div className="relative bg-primary bg-gradient-to-b from-blue-900/30 border-top border-t-2 border-white/20 w-screen h-28 flex justify-center items-center p-4">
        {/* Music Info */}
        <MusicInfo />
        
        <div className="w-full flex flex-col items-center gap-6 md:flex">
          {/* Buttons */}
          <IconContext.Provider value={{ size: '30px' }}>
            <div className="flex items-center gap-3 -mb-4">
              {/* Previous */}
              <button onClick={() => { previousMusic() }} className="hover:text-green-900">
                <BiSkipPrevious />
              </button>
              {/* Shuffle */}
              <button onClick={() => shuffleList() }>
                <BiShuffle className={ isShuffled ? 'text-green-900' : 'text-white hover:text-green-900' } />
              </button>
              {/* Play/Pause */}
              <button onClick={() => togglePlayPause() } className="hover:text-green-900" >
                { isPlaying ? <BsPauseFill/> : <BsFillPlayFill /> }
              </button>
              {/* Repeat */}
              <button onClick={() => changeRepeat() } className="hover:text-green-900">
                { repeat == Repeat.NoRepeat ? <TbRepeatOff /> : repeat == Repeat.Repeat ? <TbRepeat /> : <TbRepeatOnce /> }
              </button>
              {/* Next */}
              <button onClick={() => { nextMusic() }} className="hover:text-green-900">
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
        <div className="sm:flex md:shrink-0">
          <IconContext.Provider value={{ className: "mx-2", size: "30px" }}>
            <div className="flex items-center gap-2">
              <button onClick={() => handleMuted() }>
                {/* I can't just use a local component to render the icons since it will not work, so yeah it's a mess */}
                { isMuted ? <FiVolumeX /> : volume > 50 ? <FiVolume2 /> : volume > 0 ? <FiVolume1 /> : <FiVolume /> }
              </button>

              <div className="w-48">
                <input type="range" value={volume} step={1} max={100} onChange={(e) => handleVolume(e) } className="bg-blue-900 appearance-none range-input h-1 mb-1 w-full rounded outline-none" />
              </div>
            </div>
          </IconContext.Provider>
        </div>
      </div>
    </div>
  )
}

export default Player