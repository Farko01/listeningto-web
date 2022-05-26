import type { NextPage } from "next";
import { useRouter } from "next/router";
import type { GetServerSideProps } from 'next'
import axios from "axios";
import Head from "next/head";
import Image from "next/image";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const user = await axios.get(`http://localhost:8080/user/${params!.id}`);
  const data = user.data;
  const status = user.status;

  return {
    props: {
      data,
      status
    }
  }
}

const UserPage: NextPage = (props) => {
  return (
    <>
      <Head>
        <title>{props.data.username} - Listeningto</title>
      </Head>
      <h1>Usuário foda</h1>
      <Image src={"http://localhost:8080" + props.data.profilePic} width={200} height={200} />
      <h2>Nome: {props.data.username}</h2>
      <h2>Email: {props.data.email}</h2>
    </>
  )
}

export default UserPage;