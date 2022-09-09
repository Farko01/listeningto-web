import React, { useContext, useState, useRef } from 'react';
import { IMusicList } from '../interfaces/musicList.interface';
import IUser from '../interfaces/user.interface';

interface IAppProps {
	children: any;
}

interface IMiscContext {
  player: Boolean;
}

interface IMiscUpdateContext {
  setPlayer: React.Dispatch<React.SetStateAction<boolean>>;
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

	return (
		<MiscContext.Provider value={{ player }}>
			<MiscUpdateContext.Provider value={{ setPlayer }}>
				{ children }
			</MiscUpdateContext.Provider>
		</MiscContext.Provider>
	)
}