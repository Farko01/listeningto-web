import { IMusic } from "./music.interface";
import IUser from "./user.interface";

export interface IPlaylist {
  readonly _id: string;
  createdBy: IUser;
  name: string;
  musics: IMusic[] | null;
  cover: string;
  private: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface IPatchPlaylist extends IPlaylist {
  order: number[];
}