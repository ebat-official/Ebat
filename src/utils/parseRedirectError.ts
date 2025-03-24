export default function parseRedirectError(
  error: Error
): { url: string; statusCode: number } | null {
  if (error.message === "NEXT_REDIRECT" && error.digest) {
    const [code, type, url, statusCode] = error.digest.split(";");
    if (code === "NEXT_REDIRECT" && url) {
      return { url, statusCode: parseInt(statusCode, 10) };
    }
  }
  return null;
}
