export default function parseRedirectError(
	error: Error,
): { url: string; statusCode: number } | null {
	// @ts-ignore
	if (error.message === "NEXT_REDIRECT" && error.digest) {
		// @ts-ignore
		const [code, type, url, statusCode] = error.digest.split(";");
		if (code === "NEXT_REDIRECT" && url) {
			return { url, statusCode: Number.parseInt(statusCode, 10) };
		}
	}
	return null;
}
