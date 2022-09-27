import type { NextPage } from "next";
import Head from "next/head";
import { useUpdateMisc } from "../contexts/MiscContext";

const Home: NextPage = () => {
  // Activating the player and navbar
  const { setPlayer, setNavbar } = useUpdateMisc()!;
  setPlayer(true);
  setNavbar(true);
  
  return (
    <>
      <Head>
        <title>Biblioteca - Listeningto</title>
      </Head>

      <div>
        
      </div>
    </>
  );
};

export default Home;