import React, { useState, useEffect } from 'react'
import { IMusic } from '../interfaces/music.interface';
import Link from 'next/link';
import { useUpdatePlayer } from '../contexts/PlayerContext';
import { BsFillPlayFill } from 'react-icons/bs'
import formatTime from '../misc/formatTime';

interface IAppProps {
  musics: IMusic[];
  showMore: boolean;
}

interface IMusicItemProps {
  music: IMusic;
  i: number;
}

const MusicList = (props: IAppProps) => {
  const { setMusicList } = useUpdatePlayer()!;

  const playMusicList = (index: number) => {
    setMusicList({ musics: props.musics, index: index });
  }

  const [showMore, setShowMore] = useState(!props.showMore);
  const toggleShowMore = () => {
    const prevValue = showMore;
    setShowMore(!prevValue);
  }

  useEffect(() => {
    const elements = document.querySelectorAll(".showMoreClass");
    elements.forEach((el) => {
      showMore ? el.classList.remove("hidden") : el.classList.add("hidden");
    });
  });

  const displayAuthors = (music: IMusic) => {
    return <>
      { music.authors.map((author, i) => { 
        if (i != music.authors.length - 1) return <Link href={"/user/" + author._id!}><a className="hover:underline cursor-pointer">{author.username! + ", "}</a></Link>
        else return <Link href={"/user/" + author._id!}><a className="hover:underline cursor-pointer">{author.username!}</a></Link>
       }) }
    </>;
  }

  const MusicItem = ({ music, i }: IMusicItemProps) => {
    return (
      <li key={i} className={`hover:bg-white/20 font-barlow p-0.5 flex ${ props.showMore && i > 10 ? "showMoreClass" : null }`}>
        {/* Play */}
        <BsFillPlayFill size={24} className="hover:text-blue-900 cursor-pointer mr-2" onClick={() => playMusicList(i)} />

        {/* Nome e link da música */}
        <div className='flex w-full [&>*]:px-2'>
          <div className='basis-2/5'>
            <Link href={"/music/" + music._id!}>
              <a className="cursor-pointer hover:underline inline-block text-ellipsis">
                { music.name }
              </a>
            </Link>
          </div>

          <div className='basis-2/5 text-ellipsis'>
            { displayAuthors(music) }
          </div>

          <div className='basis-1/5'>
            <span>{ formatTime(music.duration) }</span>
          </div>
        </div>
      </li>
    )
  }

  return (
    <ul>
      { props.musics.map((music, i) => {
        return <MusicItem key={i} music={music} i={i} />
      }) }

      { props.showMore && props.musics.length > 10 ? <span onClick={() => toggleShowMore()} className="ml-2 mt-2 cursor-pointer text-sm text-white/60">{ showMore ? "Mostrar menos" : "Mostrar mais" }</span> : null }
    </ul>
  )
}

export default MusicList