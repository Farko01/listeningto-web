interface IUser {
  readonly _id: string;
  username: string;
  email: string;
  password: string;
  profilePic: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export default IUser;
