import type { NextPage } from "next";
import Head from "next/head";
import { useUpdateMisc } from "../contexts/MiscContext";

const Home: NextPage = (props) => {
  // Activating the player and navbar
  const { setPlayer, setNavbar } = useUpdateMisc()!;
  setPlayer(true);
  setNavbar(true);
  
  return (
    <>
      <Head>
        <title>Lista de Reprodução - Listeningto</title>
      </Head>

      <div>

      </div>
    </>
  );
};

export default Home;