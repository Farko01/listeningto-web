import React, { useEffect, useState, useRef } from 'react'
import { BsFillPlayFill, BsPauseFill } from 'react-icons/bs'
import { BiShuffle, BiSkipPrevious, BiSkipNext } from 'react-icons/bi'
import { FiVolume1, FiVolume2, FiVolumeX } from 'react-icons/fi'
import { TbRepeat, TbRepeatOnce } from 'react-icons/tb'
import { IconContext } from 'react-icons'

import IMusic from '../interfaces/music.interface';
import IMusicList from '../interfaces/musicList.interface'

interface IAppProps {
  playerRef: React.MutableRefObject<IMusicList | null>
}

const Player = (props: IAppProps) => {
  // References
  const audioPlayer = useRef() as React.RefObject<HTMLAudioElement>;  // <audio> reference
  const progressBar = useRef() as React.RefObject<HTMLInputElement>;  // Progress bar reference
  const animationRef = useRef<number>();  // Animation reference
  
  // Changing the music that is being played
  useEffect(() => {
    if (!props.playerRef.current) return;

    const currentSrc = props.playerRef.current.musicList[props.playerRef.current.index].file!;
    audioPlayer.current!.src = `${process.env.NEXT_PUBLIC_API_URL}${currentSrc}`;
  }, [props.playerRef.current?.musicList, props.playerRef.current?.index]);

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
    progressBar.current!.max = seconds.toString();

    setDuration(seconds);
  }, [audioPlayer?.current?.onloadedmetadata, audioPlayer?.current?.readyState]);

  // Current time
  const [currentTime, setCurrentTime] = useState(0);

  const changeRange = () => {
    audioPlayer.current!.currentTime = parseInt(progressBar.current?.value!);
    // setCurrentTime(parseInt(progressBar.current!.value));
    changeProgressBarColor();
  }

  const updateProgress = () => {
    progressBar.current!.value = audioPlayer.current!.currentTime.toString();
    // setCurrentTime(parseInt(progressBar.current!.value));
    changeProgressBarColor();

    animationRef.current = requestAnimationFrame(updateProgress);
  }

  const changeProgressBarColor = () => {
    const value = parseInt(progressBar.current!.value);
    const progressBarHTML = document.getElementById("progress-bar") as HTMLInputElement;
    progressBarHTML!.style.background = `linear-gradient(to right, green 0%, green ${value / duration * 100}%, #fff ${value / duration * 100}%, white 100%)`
    setCurrentTime(value);
  }

  return (
    <div id="player" className="w-screen fixed bottom-0 border-t-2 border-blue-900 bg-gradient-to-b from-blue-900/50 to-dark-gray-800 h-20 pt-7">
      <audio ref={audioPlayer} id="audio" autoPlay />

      
      <div className="flex flex-col items-center">
        {/* Buttons */}
        <IconContext.Provider value={{ className: "mx-1", size: '30px' }}>
          <div className="inline-block absolute top-2">
            {/* Previous */}
            <button>
              <BiSkipPrevious />
            </button>

            {/* Shuffle */}
            <button>
              <BiShuffle />
            </button>

            {/* Play/Pause */}
            <button onClick={() => togglePlayPause() }>
              { isPlaying ? <BsPauseFill /> : <BsFillPlayFill />  }
            </button>

            {/* Repeat */}
            <button>
              <TbRepeat />
            </button>

            {/* Next */}
            <button>
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
            <input id="progress-bar" type="range" defaultValue="0" onChange={() => { changeRange() }} ref={progressBar} className="appearance-none audio-progress-bar h-1 w-full rounded outline-none" />
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