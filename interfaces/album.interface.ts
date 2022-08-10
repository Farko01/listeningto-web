import IUser from './user.interface';
import IMusic from './music.interface';

interface IAlbum {
  readonly _id?: string;
  author?: IUser;
  name?: string;
  musics?: IMusic[];
  cover?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export default IAlbum;
