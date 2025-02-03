import { nanoid } from "nanoid";

/**
 * Generates a unique Post ID using nanoid.
 * Example: "post_xvT3kY5XJvLQ9aNwGpBZC"
 */
export function generateNanoId(length=21): string {
  return nanoid(length)
}