import React, { useCallback, useEffect, useRef, useState } from 'react'
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
import { ImExit } from 'react-icons/im'
import { HiOutlinePlus } from 'react-icons/hi'

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
    if (userData) return;

    const cookies = new Cookies();
    const auth = cookies.get("auth");
  
    if (!auth) return;
    const jwtData = jwt.decode(auth) as IAuthToken;
    if (jwtData.id) {
      fetch(`/api/user/${jwtData.id}`).then((res) => res.json()).then((data) => setUserData(data));
    }
  });

  const [showDropdown, setShowDropdown] = useState<Boolean>(false);
  const dropdownRef = useRef<any>(null);
  useEffect(() => {
    document.addEventListener("mousedown", (e) => {
      if (dropdownRef.current && showDropdown && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    });
  });

  const logOff = async () => {
    const cookies = new Cookies();
    cookies.remove("auth", { path: "/" });
    setUserData(undefined);
    Router.reload();
  }

  return (
		<div id="navbar" className='fixed top-0 left-0 z-10 h-16 w-screen text-white bg-primary bg-gradient-to-tr from-blue-900/50 border-b-2 border-white/20'>
			<div className='flex items-center h-full w-full'>
        <IconContext.Provider value={{ size: '36px', className: 'mx-2 inline-block cursor-pointer' }} >
          <Link href={"/"}>
            <div className='group'>
              <AiFillHome title="Home" />
              <h1 className='text-xl pointer-events-none font-semibold text-center inline-block -ml-36 transition-all ease-in-out duration-500 -translate-x-10 opacity-0 group-hover:ml-0 group-hover:translate-x-0 group-hover:opacity-100'>Página Principal</h1>
            </div>
          </Link>
          <div className='group'>
            <GoSearch title="Buscar" />
            <h1 className='text-xl pointer-events-none font-semibold text-center inline-block -ml-20 transition-all ease-in-out duration-500 -translate-x-10 opacity-0 group-hover:ml-0 group-hover:translate-x-0 group-hover:opacity-100'>Buscar</h1>
          </div>
        </IconContext.Provider>

        <div className='absolute right-10'>
          {
            userData ? 
            <div ref={dropdownRef}>
              <button className='h-12 w-12 z-30' onClick={() => { const prevVal = showDropdown; setShowDropdown(!prevVal) }}>
                <Image src={process.env.NEXT_PUBLIC_API_URL + userData.profilePic} layout={'fill'} className="rounded-full cursor-pointer z-30" />
              </button>

              <div className={`absolute z-20 -mt-16 -ml-56 w-72 h-96 flex flex-col bg-primary/[.98] bg-gradient-to-b from-blue-900/[.98] shadow-inner shadow-black ${ showDropdown ? 'block' : 'hidden' }`}>
                <div className='h-[73px] flex justify-center items-center border-b-2 border-white/20'>
                  <h1 className='text-xl font-semibold text-center mt-3'>{userData.username}</h1>
                </div>
                <Link href={`/user/${userData._id}`}>
                  <div className='flex items-center w-[95%] p-2 m-2 hover:bg-white/20 cursor-pointer'>
                    <VscAccount size={36} />
                    <a className='text-xl font-semibold ml-2'>Perfil</a>
                  </div>
                </Link>
                <Link href={`/new`}>
                  <div className='flex items-center w-[95%] p-2 m-2 hover:bg-white/20 cursor-pointer'>
                    <HiOutlinePlus size={36} />
                    <a className='text-xl font-semibold ml-2'>Novo</a>
                  </div>
                </Link>
                <div className='absolute bottom-0 flex items-center m-2 w-[95%] mr-8 hover:bg-white/20 p-2 cursor-pointer' onClick={() => logOff() }>
                  <ImExit size={36} />
                  <h1 className='text-xl font-semibold ml-2'>Sair</h1>
                </div>
              </div>
            </div>
            : 
            <Link href={"/login"}>
              <button className="border-2 border-blue-900 rounded-xl py-2 px-6 bg-gray-900 hover:bg-gray-700">
                Fazer Login
              </button>
            </Link>  
          }
        </div>
      </div>
		</div>
  )
}

export default Navbar