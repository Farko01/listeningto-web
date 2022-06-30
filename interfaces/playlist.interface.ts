interface IPlaylist {
  readonly _id?: string;
  createdBy?: string;
  name?: string;
  musics?: string[] | null;
  cover?: string;
  private?: boolean;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export default IPlaylist;
