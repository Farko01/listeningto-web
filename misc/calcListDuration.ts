import { IMusic } from "../interfaces/music.interface";

const calcListDuration = (musics: IMusic[]) => {
	let listDur = 0;
	for (let i of musics) {
		listDur += i.duration;
	}

	return listDur;
}

export default calcListDuration;