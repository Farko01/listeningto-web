const formatTime = (seconds: number) => {
  if (!seconds || seconds == 0) return `00:00`

	const hours = Math.floor(seconds / 3600);
	seconds %= 3600;
	const minutes = Math.floor(seconds / 60);
	seconds = Math.trunc(seconds % 60);

	const returnedHours = hours < 10 ? `0${hours}` : hours.toString();
	const returnedMinutes = minutes < 10 ? `0${minutes}` : minutes.toString();
	const returnedSeconds = seconds < 10 ? `0${seconds}` : seconds.toString();

	if (returnedHours == "00") return `${returnedMinutes}:${returnedSeconds}`;
	return `${returnedHours}:${returnedMinutes}:${returnedSeconds}`;
}

export default formatTime;