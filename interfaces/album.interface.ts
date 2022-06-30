interface IAlbum {
  readonly _id?: string;
  author?: string;
  name?: string;
  musics?: string[];
  cover?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export default IAlbum;
