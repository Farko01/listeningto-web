import React from 'react'

interface IAppProps {
  name: string;
  filepath: string;
}

const MusicElement = (props: IAppProps) => {
  // const [audio, setAudio] = useState<HTMLAudioElement>();

  // useEffect(() => {
  //   setAudio(new Audio(process.env.NEXT_PUBLIC_API_URL + props.filepath));
  // })
  // new Audio(process.env.NEXT_PUBLIC_API_URL + props.filepath

  // const audioElement = useRef<HTMLAudioElement>();

  return (
    <div className='bg-dark-gray-800 hover:bg-dark-gray-600'>
      {props.name}

      {/* {audio!.duration} */}
      
    </div>
  )
}

export default MusicElement