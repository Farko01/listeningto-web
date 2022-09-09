import IUser from './user.interface'

export interface IMusic {
  readonly _id: string;
  authors: IUser[];
  name: string;
  file: string;
  cover: string;
  timesPlayed: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}