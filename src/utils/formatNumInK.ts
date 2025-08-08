export const formatNumInK = (num: number) => {
	if (num >= 1000) {
		const thousands = num / 1000;
		return thousands % 1 === 0 ? `${thousands}K` : `${thousands.toFixed(1)}K`;
	}
	return num.toString();
};
