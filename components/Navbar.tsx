import React, { useCallback, useEffect, useState } from 'react'
import { useMisc } from '../contexts/MiscContext'
import { AiFillHome } from 'react-icons/ai'
import { GoSearch } from 'react-icons/go'
import { IconContext } from 'react-icons'
import Image from 'next/image'
import Cookies from 'universal-cookie'
import IUser from '../interfaces/user.interface'
import jwt from 'jsonwebtoken'
import Router from 'next/router'
import Link from 'next/link'
import { VscAccount } from 'react-icons/vsc'

interface IAuthToken {
  id: string;
}

const Navbar = () => {
  // Activating / deactivating the navbar
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
    const jwtData = jwt.decode(auth) as IAuthToken;
    if (jwtData.id) {
      fetch(`/api/user/${jwtData.id}`).then((res) => res.json()).then((data) => setUserData(data));
    }
  });

  const UserTab = () => {
    if (!userData) return (
      <Link href={"/login"}>
        <button className="border-2 border-blue-900 py-2 px-6 bg-gray-900 hover:bg-gray-700">
          Fazer Login
        </button>
      </Link>
    )

    return (
      <div>
        
      </div>
    )
  }

  return (
		<div id="navbar" className='fixed top-0 left-0 z-10  h-16 w-screen text-white bg-primary bg-gradient-to-tr from-blue-900/50 border-b-2 border-white/20'>
			<div className='flex items-center h-full w-full'>
        <IconContext.Provider value={{ size: '36px', className: 'mx-2 inline-block cursor-pointer' }} >
          <div className='group'>
            <AiFillHome title="Home" />
            <h1 className='text-xl pointer-events-none font-semibold text-center inline-block -ml-36 transition-all ease-in-out duration-500 -translate-x-10 opacity-0 group-hover:ml-0 group-hover:translate-x-0 group-hover:opacity-100'>Página Principal</h1>
          </div>
          <div className='group'>
            <GoSearch title="Buscar" />
            <h1 className='text-xl pointer-events-none font-semibold text-center inline-block -ml-20 transition-all ease-in-out duration-500 -translate-x-10 opacity-0 group-hover:ml-0 group-hover:translate-x-0 group-hover:opacity-100'>Buscar</h1>
          </div>
        </IconContext.Provider>

        <div className='absolute right-8'>
          <UserTab />
        </div>
      </div>
		</div>
  )
}

export default Navbar