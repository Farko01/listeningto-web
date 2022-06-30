import React from 'react'
import Card from './Card';
import IMusic from '../interfaces/music.interface';

interface IAppProps {
    height: number,
    width: number,
    items: IMusic[]
}

const CardGrid: React.FC<IAppProps> = ({ height, width, items }) => {
	console.log(items);

	const createCards = () => {
		return items.map((item) => {
			return React.createElement(Card, { type: "Music", item: item });
		});
	}

  return (
    <div>
      {createCards()}
    </div>
  )
}

export default CardGrid
