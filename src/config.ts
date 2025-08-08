export const ALLOWED_FILE_TYPES = ["image/*", "video/mp4", "video/quicktime"];
export const POST_ID_LENGTH = 21;
export const MAX_POSTS_IMAGE_SIZE = Number.parseInt(
	process.env.MAX_POSTS_IMAGE_SIZE || "1048576",
	10,
);
export const MAX_POSTS_VIDEO_SIZE = Number.parseInt(
	process.env.MAX_POSTS_VIDEO_SIZE || "10485760",
	10,
);

export const SOCIAL_LINKS = {
	DISCORD: "https://discord.gg/UKNCtK7Y5x",
	GITHUB: "https://github.com/ebat-official/Ebat",
} as const;
