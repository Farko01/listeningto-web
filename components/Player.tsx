import React, { useEffect, useState, useRef } from 'react'
import { BsFillPlayFill, BsPauseFill } from 'react-icons/bs'
import { BiShuffle, BiSkipPrevious, BiSkipNext } from 'react-icons/bi'
import { FiVolume1, FiVolume2, FiVolumeX } from 'react-icons/fi'
import { TbRepeat, TbRepeatOnce } from 'react-icons/tb'
import { IconContext } from 'react-icons'

import IMusic from '../interfaces/music.interface';
import IMusicList from '../interfaces/musicList.interface'
import shuffle from '../misc/shuffle';
import rotateArray from '../misc/rotateArray'

/*
  TODO:
  
  - Make the list not repeat when no repeat is active
  - Make a music loop when repeat one is active

*/

interface IAppProps {
  musicList: IMusicList | undefined;
  setMusicList: React.Dispatch<React.SetStateAction<IMusicList | undefined>>
}

const Player = (props: IAppProps) => {
  // References
  const audioPlayer = useRef() as React.RefObject<HTMLAudioElement>;  // <audio> reference
  const progressBar = useRef() as React.RefObject<HTMLInputElement>;  // Progress bar reference
  const animationRef = useRef<number>();  // Animation reference
  
  // Changing the music that is being played
  const [src, setSrc] = useState<string>();

  useEffect(() => {
    if (!props.musicList) return;

    const currentSrc = props.musicList!.musics[props.musicList.index].file!;
    setSrc(`${process.env.NEXT_PUBLIC_API_URL}${currentSrc}`);
    
    if (!isShuffled) {
      setOrder(rotateArray([... Array(props.musicList.musics.length).keys()], props.musicList.index));
    }

    audioPlayer.current!.load();
    if (!isPlaying) { 
      togglePlayPause();
    } else {
      audioPlayer.current?.play();
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  }, [props.musicList]);

  // Play and pause
  const [isPlaying, setIsPlaying] = useState(false);

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
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const seconds = Math.floor(audioPlayer.current?.duration!);
    setDuration(seconds);
  }, [audioPlayer?.current?.readyState]);

  // Current time
  const [currentTime, setCurrentTime] = useState(0);

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
  const [order, setOrder] = useState<number[]>();
  const [isShuffled, setIsShuffled] = useState(false);

  const shuffleList = () => {
    if (!props.musicList) return;

    const prevValue = isShuffled;
    setIsShuffled(!prevValue);

    if (!prevValue) {
      const randomOrder = shuffle([... Array(props.musicList.musics.length).keys()]);
      randomOrder.splice(randomOrder.indexOf(props.musicList.index), 1);
      randomOrder.unshift(props.musicList.index);
  
      setOrder(randomOrder);
    } else {
      // Unshuffles the list - creates a new array and rotates to the current index
      setOrder(rotateArray([... Array(props.musicList.musics.length).keys()], props.musicList.index));
    }
  }

  // Going to the next music after the previous one ended
  const changeMusic = () => {
    if (!order || !props.musicList) return;

    const prevOrder = order;
    const nextMusic = prevOrder[1];

    const rotatedOrder = rotateArray(prevOrder, 1);
    setOrder(rotatedOrder);

    console.log(rotatedOrder);

    const prevMusics = props.musicList.musics;
    props.setMusicList({ musics: prevMusics, index: nextMusic });
  }

  // Skip to the next music
  const nextMusic = () => {
    changeMusic();
  }

  // Skip to the previous music
  // I don't understand what I did with the rotations, but it works
  const previousMusic = () => {
    if (!order || !props.musicList) return;

    const prevOrder = order;
    const rotatedOrder = rotateArray(prevOrder, -1);
    const nextMusic = rotatedOrder[0];

    const prevMusics = props.musicList.musics;
    props.setMusicList({ musics: prevMusics, index: nextMusic });
  }

  return (
    <div id="player" className="w-screen fixed bottom-0 border-t-2 border-blue-900 bg-gradient-to-b from-blue-900/50 to-dark-gray-800 h-20 pt-7">
      <audio ref={audioPlayer} id="audio" onEnded={() => changeMusic() }>
        <source src={src} />
      </audio>
      
      <div className="flex flex-col items-center">
        {/* Buttons */}
        <IconContext.Provider value={{ className: "mx-1", size: '30px' }}>
          <div className="inline-block absolute top-2">
            {/* Previous */}
            <button onClick={() => { previousMusic() }} className="hover:text-green-900">
              <BiSkipPrevious />
            </button>

            {/* Shuffle */}
            <button onClick={() => shuffleList() }>
              <BiShuffle className={ isShuffled ? 'text-green-900' : 'text-white hover:text-green-900' } />
            </button>

            {/* Play/Pause */}
            <button onClick={() => togglePlayPause() } className="hover:text-green-900">
              { isPlaying ? <BsPauseFill /> : <BsFillPlayFill />  }
            </button>

            {/* Repeat */}
            <button className="hover:text-green-900">
              <TbRepeat />
            </button>

            {/* Next */}
            <button onClick={() => { nextMusic() }} className="hover:text-green-900">
              <BiSkipNext />
            </button>
          </div>
        </IconContext.Provider>

        {/* Current Time / Progress Bar / Duration */}
        <div className="block ml-5 mt-3">
          {/* Current Time */}
          <div className='inline-block mx-2 font-mono text-xs'>
            {formatTime(currentTime)}
          </div>

          {/* Progress Bar */}
          <div className='mx-2 inline-block relative bottom-0.5 w-72'>
            <input id="progress-bar" type="range" value={currentTime} max={duration} onChange={() => { changeRange() }} ref={progressBar} className="appearance-none audio-progress-bar h-1 w-full rounded outline-none" />
          </div>

          {/* Duration */}
          <div className='inline-block mx-2 font-mono text-xs'>
            {formatTime(duration)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Player