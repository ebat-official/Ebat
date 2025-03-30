const SUPPORTED_URL_PROTOCOLS = new Set([
	"http:",
	"https:",
	"mailto:",
	"sms:",
	"tel:",
	"ftp:",
]);

export function sanitizeUrl(url: string): string {
	try {
		const parsedUrl = new URL(url);
		// eslint-disable-next-line no-script-url
		if (!SUPPORTED_URL_PROTOCOLS.has(parsedUrl.protocol)) {
			return "about:blank";
		}
	} catch {
		return url;
	}
	return url;
}

// Source: https://stackoverflow.com/a/8234912/2013580
const urlRegExp = new RegExp(
	/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/,
);
export function validateUrl(url: string): boolean {
	// TODO Fix UI for link insertion; it should never default to an invalid URL such as https://.
	// Maybe show a dialog where they user can type the URL before inserting it.
	return url === "https://" || urlRegExp.test(url);
}
interface Metadata {
	title: string;
	description: string;
	image: string | undefined;
	website: string;
	logo: string;
}

export async function fetchMetadata(url: string): Promise<Metadata> {
	try {
		const proxyUrl = "https://api.allorigins.win/get?url=";
		const response = await fetch(`${proxyUrl}${encodeURIComponent(url)}`);
		const data = await response.json();

		// Extract the HTML content from the proxy response
		const html = data.contents;

		// Parse the HTML using DOMParser
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, "text/html");

		// Helper function to extract meta tag content
		const getMetaTagContent = (property: string) => {
			const element =
				doc.querySelector(`meta[property="${property}"]`) ||
				doc.querySelector(`meta[name="${property}"]`);
			return element ? element.getAttribute("content") : null;
		};

		// Helper function to extract favicon or logo
		const getFavicon = () => {
			// Check for common favicon locations
			const favicon =
				doc.querySelector('link[rel="icon"]') ||
				doc.querySelector('link[rel="shortcut icon"]') ||
				doc.querySelector('link[rel="apple-touch-icon"]');

			if (favicon) {
				const href = favicon.getAttribute("href");
				if (href) {
					// Resolve relative URLs to absolute URLs
					return new URL(href, url).toString();
				}
			}

			// Fallback to default favicon location
			return new URL("/favicon.ico", url).toString();
		};

		// Extract metadata
		const metadata = {
			title:
				doc.querySelector("title")?.textContent ||
				getMetaTagContent("og:title") ||
				"No title",
			description:
				getMetaTagContent("og:description") ||
				getMetaTagContent("description") ||
				"No description",
			image: getMetaTagContent("og:image") || undefined, // Use a valid fallback image URL
			website: getMetaTagContent("og:site_name") || new URL(url).hostname, // Use hostname as fallback
			logo: getFavicon(), // Extract favicon or logo
		};

		return metadata;
	} catch (error) {
		return {
			title: "No title",
			description: "No description",
			image: undefined,
			website: new URL(url).hostname,
			logo: new URL("/favicon.ico", url).toString(), // Fallback to default favicon
		};
	}
}
