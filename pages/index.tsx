import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Corpo from '../Components/Corpo'
import Layout from '../Components/Layout'

const Home: NextPage = () => {
  return (
    <>
    <Layout></Layout>
    <Corpo></Corpo>
    </>
  )
}

export default Home
