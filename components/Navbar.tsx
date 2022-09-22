import React, { useEffect, useState } from 'react'
import { useMisc } from '../contexts/MiscContext'
import { AiFillHome } from 'react-icons/ai'
import { GoSearch } from 'react-icons/go'
import { IconContext } from 'react-icons'
import Image from 'next/image'
import Cookies from 'universal-cookie'
import IUser from '../interfaces/user.interface'

const Navbar = () => {
  // Activating / deactivating the player
	const { navbar } = useMisc()!;

  useEffect(() => {
    const navbarHTML = document.getElementById("navbar")!;

    if (navbar) {
      navbarHTML.classList.remove("hidden")
    } else {
      navbarHTML.classList.add("hidden");
    }
  });

  const [userData, setUserData] = useState<IUser>();
  useEffect(() => {
   const cookies = new Cookies();
   const auth = cookies.get("auth"); 
  
   if (!auth) return;
  })

  return (
		<div id="navbar" className='fixed top-0 left-0 z-10  h-16 w-screen text-white bg-primary bg-gradient-to-tr from-blue-900/50 border-b-2 border-white/20'>
			<div className='flex items-center h-full w-full'>
        <IconContext.Provider value={{ size: '36px', className: 'mx-2 inline-block cursor-pointer' }} >
          <div className='group'>
            <AiFillHome title="Home" />
            <h1 className='text-xl pointer-events-none font-semibold text-center inline-block -ml-36 transition-all ease-in-out duration-1000 -translate-x-10 opacity-0 group-hover:ml-0 group-hover:translate-x-0 group-hover:opacity-100'>Página Principal</h1>
          </div>
          <div className='group'>
            <GoSearch title="Buscar" />
            <h1 className='text-xl pointer-events-none font-semibold text-center inline-block -ml-20 transition-all ease-in-out duration-1000 -translate-x-10 opacity-0 group-hover:ml-0 group-hover:translate-x-0 group-hover:opacity-100'>Buscar</h1>
          </div>
        </IconContext.Provider>

        <div className='absolute right-4'>
          {/* <Image width={36} height={36} className="rounded-full" src={process.env.NEXT_PUBLIC_API_URL + props.data.profilePic} /> */}
        </div>
      </div>
		</div>
  )
}

export default Navbar