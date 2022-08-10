import IUser from './user.interface'

interface IMusic {
  readonly _id?: string;
  authors?: IUser[];
  name?: string;
  file?: string;
  cover?: string;
  genre?: string;
  monthlyListeners?: number;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export default IMusic;
