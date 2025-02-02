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
