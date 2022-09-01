import React from 'react'
import IMusic from '../interfaces/music.interface';
import IMusicList from '../interfaces/musicList.interface';
import Link from 'next/link';
import { useUpdatePlayer } from '../contexts/PlayerContext';

interface IAppProps {
  musics: IMusic[],
}

const MusicList = (props: IAppProps) => {
  const { setMusicList } = useUpdatePlayer()!;

  const playMusicList = (index: number) => {
    setMusicList({ musics: props.musics, index: index });
  }

  return (
    <div>
      { props.musics.map((music, i) => {
        return <div key={i} onClick={() => playMusicList(i) } className="hover:bg-blue-900 font-barlow">
          <Link href={`../music/${music._id}`}>
            <a className="cursor-pointer">
              { music.name }
            </a>
          </Link>
        </div>
      }) }
    </div>
  )
}

export default MusicList