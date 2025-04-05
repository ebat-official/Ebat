import { POST_ID_LENGTH } from "@/config";
import { nanoid } from "nanoid";

/**
 * Generates a unique Post ID using nanoid.
 * Example: "post_xvT3kY5XJvLQ9aNwGpBZC"
 */
export function generateNanoId(length = POST_ID_LENGTH): string {
	return nanoid(length);
}
