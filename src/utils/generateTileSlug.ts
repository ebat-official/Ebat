import slugify from "slugify";

export const generateTitleSlug = (title: string): string => {
	return slugify(title, {
		lower: true,
		strict: true,
		trim: true,
		remove: /[*+~.()'"!:@]/g,
	});
};
