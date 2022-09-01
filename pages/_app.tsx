import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { PlayerProvider } from '../contexts/PlayerContext'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed&display=swap" rel="stylesheet" /> 
        <link href="https://fonts.googleapis.com/css2?family=Fjalla+One&display=swap" rel="stylesheet" /> 
      </Head>

      <PlayerProvider>
        <Component {...pageProps} />
      </PlayerProvider>
    </>
  )
}

export default MyApp
