import { useEffect, useState } from "react";

const usePlayer = () => {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = document.getElementById("audio") as HTMLAudioElement;
    
    // Fazer o áudio tocar
    playing ? audio.play() : audio.pause;
  });

  return { playing, setPlaying }
}

export default usePlayer