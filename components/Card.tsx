import React from "react";
import Image from 'next/image';
import Link from 'next/link';

interface IAppProps {
  image: string;
  text: string;
  subtext: string;
  link: string;
}

const Card: React.FC<IAppProps> = ({ image, text, subtext, link }) => {
  return (
    <div className="h-60 w-48 bg-white/10 shadow-lg shadow-black/50 p-4 font-barlow">
			<Image src={image} width={168} height={168} alt="" />

			<Link href={link}>
				<a>
					<p className="truncate hover:underline">{ text }</p>
				</a>
			</Link>
			<h2>{ subtext }</h2>
    </div>
  )
}

export default Card;