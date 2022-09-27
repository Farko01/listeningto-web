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
  }, [showMore]);

  return (
    <div>
      { props.musics.map((music, i) => {
        if (props.showMore) {
          if (i < 10) {
            return <div key={i} className="hover:bg-white/20 font-barlow p-0.5 flex">
            {/* Numeração e play */}
            <BsFillPlayFill size={24} className="hover:text-blue-900 cursor-pointer inline-block mr-2" onClick={() => playMusicList(i)} />

            {/* Nome e link da música */}
            <div className='basis-4/5'>
                <Link href={"/music/" + music._id!}>
                  <a className="cursor-pointer hover:underline inline-block">
                    { music.name }
                  </a>
                </Link>
              </div>
              <div className='basis-1/5'>
                <span>{ formatTime(music.duration) }</span>
              </div>
          </div>
          } else {
            // Mesma coisa do de acima, mas por padrão tem display: none
            return <div key={i} className="hover:bg-white/20 font-barlow p-0.5 showMoreClass flex">
              {/* Numeração e play */}
              <BsFillPlayFill size={24} className="hover:text-blue-900 cursor-pointer inline-block mr-2" onClick={() => playMusicList(i)} />

              {/* Nome e link da música */}
              <div className='basis-4/5'>
                <Link href={"/music/" + music._id!}>
                  <a className="cursor-pointer hover:underline inline-block">
                    { music.name }
                  </a>
                </Link>
              </div>
              <div className='basis-1/5'>
                <span>{ formatTime(music.duration) }</span>
              </div>
            </div>
          }
        } else return <div key={i} className="hover:bg-white/20 font-barlow p-0.5 flex">
          {/* Numeração e play */}
          <BsFillPlayFill size={24} className="hover:text-blue-900 cursor-pointer inline-block mr-2" onClick={() => playMusicList(i)} />

          {/* Nome e link da música */}
          <div className='basis-4/5'>
            <Link href={"/music/" + music._id!}>
              <a className="cursor-pointer hover:underline inline-block">
                { music.name }
              </a>
            </Link>
          </div>
          <div className='basis-1/5'>
            <span>{ formatTime(music.duration) }</span>
          </div>
        </div>
      }) }

      { props.showMore && props.musics.length >= 10 ? <span onClick={() => toggleShowMore()} className="ml-2 mt-2 cursor-pointer text-sm text-white/60">{ showMore ? "Mostrar menos" : "Mostrar mais" }</span> : null }
    </div>
  )
}

export default MusicList