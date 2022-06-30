interface IMusic {
  readonly _id?: string;
  authors?: string[];
  name?: string;
  file?: string;
  cover?: string;
  genre?: string;
  monthlyListeners?: number;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export default IMusic;
