import React from 'react'
import IMusic from '../interfaces/music.interface'

interface IAppProps {
    type: string,
    item: IMusic
}

const Card: React.FC<IAppProps> = ({ type, item }) => {
  return (
    <div className="border-2 rounded-lg border-indigo-500 border-double shadow-lg p-10 m-4">
      {item.name}
    </div>
  )
}

export default Card
