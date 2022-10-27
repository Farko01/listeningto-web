import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { PlayerProvider } from '../contexts/PlayerContext'
import Player from '../components/Player'
import { MiscProvider } from '../contexts/MiscContext'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../components/Navbar'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="font-roboto py-2">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed&display=swap" rel="stylesheet" /> 
        <link href="https://fonts.googleapis.com/css2?family=Fjalla+One&display=swap" rel="stylesheet" /> 
        <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet" /> 
        <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@700&display=swap" rel="stylesheet" /> 
        <link href="https://fonts.googleapis.com/css2?family=Overpass:wght@700&display=swap" rel="stylesheet" /> 
      </Head>

      <PlayerProvider>
        <MiscProvider>
          <ToastContainer position="top-right" autoClose={2000} theme={"dark"} />
          <Navbar />
          <Component {...pageProps} />
          <Player />
        </MiscProvider>
      </PlayerProvider>
    </div>
  )
}

export default MyApp
