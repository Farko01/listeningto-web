import React from 'react'
import IMusic from '../interfaces/music.interface';
import IMusicList from '../interfaces/musicList.interface';

interface IAppProps {
  musics: IMusic[],
  playerRef: React.MutableRefObject<IMusicList | null>
}

const MusicList = (props: IAppProps) => {
  const playMusicList = (index: number) => {
    props.playerRef.current = { musicList: props.musics, index: index }
  }

  return (
    <div>
      { props.musics.map((music, i) => {
        return <div key={i} onClick={() => playMusicList(i) } className="bg-dark-gray-800 hover:bg-dark-gray-600">
          {music.name}
        </div>
      }) }
    </div>
  )
}

export default MusicList