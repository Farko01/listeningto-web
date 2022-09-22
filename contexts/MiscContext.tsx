import React, { useContext, useState, useRef } from 'react';

interface IAppProps {
	children: any;
}

interface IMiscContext {
  player: Boolean;
  navbar: Boolean;
}

interface IMiscUpdateContext {
  setPlayer: React.Dispatch<React.SetStateAction<boolean>>;
  setNavbar: React.Dispatch<React.SetStateAction<boolean>>;
}

const MiscContext = React.createContext<IMiscContext | undefined>(undefined);
const MiscUpdateContext = React.createContext<IMiscUpdateContext | undefined>(undefined);

export const useMisc = () => {
	return useContext(MiscContext);
}

export const useUpdateMisc = () => {
	return useContext(MiscUpdateContext);
}

export const MiscProvider: React.FC<IAppProps> = ({ children }) => {
  const [player, setPlayer] = useState(false);
  const [navbar, setNavbar] = useState(false);

	return (
		<MiscContext.Provider value={{ player, navbar }}>
			<MiscUpdateContext.Provider value={{ setPlayer, setNavbar }}>
				{ children }
			</MiscUpdateContext.Provider>
		</MiscContext.Provider>
	)
}