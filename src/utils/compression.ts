import pako from "pako";

// Type for JSON-serializable content
export type JsonContent =
	| Record<string, unknown>
	| unknown[]
	| string
	| number
	| boolean
	| null;

/**
 * Compress JSON content to a Buffer for binary storage
 */
export function compressContent(content: JsonContent): Buffer {
	try {
		const jsonString = JSON.stringify(content);
		const compressed = pako.deflate(jsonString);
		return Buffer.from(compressed);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		throw new Error(`Failed to compress content: ${errorMessage}`);
	}
}

/**
 * Decompress Buffer back to original JSON content
 */
export function decompressContent(buffer: Buffer): JsonContent {
	try {
		const decompressed = pako.inflate(buffer, { to: "string" });
		return JSON.parse(decompressed) as JsonContent;
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		throw new Error(`Failed to decompress content: ${errorMessage}`);
	}
}
