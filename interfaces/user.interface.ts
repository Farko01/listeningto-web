interface IUser {
  _id?: string;
  username?: string;
  email?: string;
  password?: string;
  profilePic?: string;
  verifiedArtist?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export default IUser;
