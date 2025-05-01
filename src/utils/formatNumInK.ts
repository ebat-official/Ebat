export const formatNumInK = (num: number) => {
	return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num.toString();
};
