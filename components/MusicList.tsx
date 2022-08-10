import React from 'react'
import IMusic from '../interfaces/music.interface';
import IMusicList from '../interfaces/musicList.interface';

interface IAppProps {
  musics: IMusic[],
  setMusicList: React.Dispatch<React.SetStateAction<IMusicList | undefined>>
}

const MusicList = (props: IAppProps) => {
  const playMusicList = (index: number) => {
    props.setMusicList({ musics: props.musics, index: index });
  }

  return (
    <div>
      { props.musics.map((music, i) => {
        return <div key={i} onClick={() => playMusicList(i) } className="hover:bg-dark-gray-600">
          {music.name}
        </div>
      }) }
    </div>
  )
}

export default MusicList