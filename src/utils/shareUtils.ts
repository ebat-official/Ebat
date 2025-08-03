export interface ShareData {
	title: string | null;
	url: string;
	postType: string | null;
}

export type SharePlatform =
	| "twitter"
	| "linkedin"
	| "whatsapp"
	| "telegram"
	| "email";

// Constants for better maintainability
const SHARE_PLATFORMS = {
	twitter: {
		baseUrl: "https://twitter.com/intent/tweet",
		params: ["text", "url"],
	},
	linkedin: {
		baseUrl: "https://www.linkedin.com/sharing/share-offsite",
		params: ["url"],
	},
	whatsapp: {
		baseUrl: "https://wa.me",
		params: ["text"],
	},
	telegram: {
		baseUrl: "https://t.me/share/url",
		params: ["url", "text"],
	},
	email: {
		baseUrl: "mailto",
		params: ["subject", "body"],
	},
} as const;

export const generateShareUrl = (
	platform: SharePlatform,
	data: ShareData,
): string => {
	const { title, url, postType } = data;

	// Validate required data
	if (!url) {
		console.warn("Share URL generation failed: URL is required");
		return "";
	}

	const postTypeText = (postType || "post").toLowerCase();
	const titleText = title || "Untitled";
	const shareText = `Check out this ${postTypeText} on Ebat: ${titleText}`;

	try {
		const encodedText = encodeURIComponent(shareText);
		const encodedUrl = encodeURIComponent(url);

		switch (platform) {
			case "twitter":
				return `${SHARE_PLATFORMS.twitter.baseUrl}?text=${encodedText}&url=${encodedUrl}`;

			case "linkedin":
				return `${SHARE_PLATFORMS.linkedin.baseUrl}/?url=${encodedUrl}`;

			case "whatsapp":
				return `${SHARE_PLATFORMS.whatsapp.baseUrl}/?text=${encodedText}%20${encodedUrl}`;

			case "telegram":
				return `${SHARE_PLATFORMS.telegram.baseUrl}?url=${encodedUrl}&text=${encodedText}`;

			case "email": {
				const subject = encodeURIComponent(
					`Check out my ${postTypeText} on Ebat`,
				);
				const body = `${encodedText}%20${encodedUrl}`;
				return `${SHARE_PLATFORMS.email.baseUrl}:?subject=${subject}&body=${body}`;
			}

			default:
				console.warn(`Unsupported share platform: ${platform}`);
				return "";
		}
	} catch (error) {
		console.error("Error generating share URL:", error);
		return "";
	}
};

export const shareToPlatform = (
	platform: SharePlatform,
	data: ShareData,
): void => {
	const shareUrl = generateShareUrl(platform, data);

	if (!shareUrl) {
		console.warn(`Failed to generate share URL for platform: ${platform}`);
		return;
	}

	try {
		// Open in new window with consistent dimensions
		const windowFeatures = "width=600,height=400,scrollbars=yes,resizable=yes";
		window.open(shareUrl, "_blank", windowFeatures);
	} catch (error) {
		console.error("Error opening share window:", error);
	}
};

// Utility function to check if a platform is supported
export const isSupportedPlatform = (
	platform: string,
): platform is SharePlatform => {
	return Object.keys(SHARE_PLATFORMS).includes(platform);
};
