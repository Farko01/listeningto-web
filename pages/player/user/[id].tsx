import type { NextPage } from "next";
import type { GetServerSideProps } from "next";
import axios from "axios";
import Head from "next/head";
import Image from "next/image";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const url = `${process.env.API_URL}/user/${params!.id}`;
  const res = await axios.get(url);
  delete res.data.email;

  return {
    props: {
      data: res.data,
      status: res.status,
    },
  };
};

interface IAppProps {
  data: {
    username: string;
    profilePic: string;
  };
  status: number;
}

const UserPage: NextPage<IAppProps> = (props) => {
  return (
    <>
      <Head>
        <title>{props.data.username} - Listeningto</title>
      </Head>
      <h1>Usuário foda</h1>
      <Image
        src={"http://localhost:8080" + props.data.profilePic}
        width={200}
        height={200}
      />
      <h2>Nome: {props.data.username}</h2>
    </>
  );
};

export default UserPage;
