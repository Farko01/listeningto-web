import IUser from './user.interface';
import { IMusic } from './music.interface';

export interface IAlbum {
  readonly _id: string;
  author: IUser;
  name: string;
  musics: IMusic[];
  cover: string;
  tags: string[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface IPatchAlbum extends IAlbum {
  order: number[];
}