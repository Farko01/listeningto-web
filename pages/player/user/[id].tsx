import type { NextPage, GetServerSideProps } from "next";
import { verify } from "jsonwebtoken";
import axios from "axios";
import Head from "next/head";
import Image from "next/image";
import cookie from "cookie";
import Link from 'next/link';

interface IAuthToken {
  id: string;
}

interface IAppProps {
  data: {
    _id: string;
    username: string;
    profilePic: string;
  };
  status: number;
  authorized: boolean;
}

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
  const url = `${process.env.API_URL}/user/${params!.id}`;
  const res = await axios.get(url);

  // Este valor determina se o usuário acessando a página é aquele a quem a página se refere, dando permissão para
  // atualizar informações a partir dela
  let authorized: boolean = false;

  if (req.headers.cookie) {
    const parsedCookies = cookie.parse(req.headers.cookie);

    if (parsedCookies.auth) {
      const decoded = verify(parsedCookies.auth,process.env.JWT_SECRET!) as IAuthToken;
      if (decoded.id == params!.id) authorized = true;
    }
  }

  return {
    props: {
      data: res.data,
      status: res.status,
      authorized: authorized
    },
  };
};

const UserPage: NextPage<IAppProps> = (props) => {
  const UpdateInfo = () => {
    if (props.authorized) {
      return (
        <Link href={`${props.data._id}/edit`}>
          Edit Profile
        </Link>
      )
    } else return null
  }

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
      <h2>{props.authorized ? "O usuário logado é o mesmo que o dessa página" : "O usuário logado não é o mesmo que o dessa página" }</h2>

      <UpdateInfo />
    </>
  );
};

export default UserPage;
