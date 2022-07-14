import React, { useState } from 'react'
import ReactAudioPlayer from 'react-audio-player'
import usePlayer from './usePlayer';

import { VolumeUpIcon, VolumeOffIcon } from '@heroicons/react/outline';

interface IAppProps {
  name: string;
  file: string
}

const Player = () => {
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [src, setSrc] = useState();
  const { playing, setPlaying } = usePlayer();
  const [rap, setRap] = useState<ReactAudioPlayer | null>();

  // Tempo
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState("00");
  
  // Obter duração
  const getDuration = () => {
    const duration = rap?.audioEl.current?.duration;

    if (duration) {
      setMinutes(Math.floor(duration / 60));

      // Formatar segundos com só um dígito
      const seconds = duration - minutes * 60;
      setSeconds(seconds < 10 ? "0" + seconds : seconds.toString());
    }
  }

  return (
    <div id="player" className="w-screen fixed bottom-0 border-t-2 border-blue-900 bg-gradient-to-b from-blue-900/50 to-transparent h-20 pt-7">
      <ReactAudioPlayer ref={(element) => { setRap(element) }} id="audio" volume={volume} muted={muted} src={src} onLoadedMetadata={() => getDuration() } />

      <div className="inline-block absolute right-4">
        <div>

        </div>

        <div onClick={() => setMuted(!muted)} className="h-7 w-7 inline-block mr-2">
          {muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
        </div>
        <input className="inline-block mb-1" type="range" value={muted ? 0 : volume} defaultValue={1} min={0} max={1} step={0.01} onChange={(e) => { setVolume(parseFloat(e.target.value)); } } />
      </div>
    </div>
  )
}

export default Player