export const truncateText = (word: string, count: number): string => {
	if (word.length <= count) {
		return word;
	}
	return `${word.slice(0, count - 3)}...`; // Truncate and add ellipsis
};
