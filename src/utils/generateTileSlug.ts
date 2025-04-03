import slugify from "slugify";

export const generateTitleSlug = (title: string, postId: string): string => {
	const slug = slugify(title, {
		lower: true,
		strict: true,
		trim: true,
		remove: /[*+~.()'"!:@]/g,
	});
	return `${slug}-${postId}`;
};
