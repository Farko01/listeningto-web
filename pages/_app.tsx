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
