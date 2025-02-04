type Duration = {
	days: string;
	hours: string;
	minutes: string;
};

export const convertToMinutes = ({
	days,
	hours,
	minutes,
}: Duration): number => {
	const daysInMinutes = Number.parseInt(days) * 24 * 60;
	const hoursInMinutes = Number.parseInt(hours) * 60;
	const minutesInMinutes = Number.parseInt(minutes);

	return daysInMinutes + hoursInMinutes + minutesInMinutes;
};

export const convertFromMinutes = (totalMinutes: number) => {
	const days = Math.floor(totalMinutes / (24 * 60));
	const remainingMinutesAfterDays = totalMinutes % (24 * 60);

	const hours = Math.floor(remainingMinutesAfterDays / 60);
	const minutes = remainingMinutesAfterDays % 60;

	return {
		days: days.toString(),
		hours: hours.toString(),
		minutes: minutes.toString(),
	};
};
