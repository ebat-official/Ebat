import imageCompression, {
	Options as ImageCompressionOptions,
} from "browser-image-compression";

/**
 * Compress an image file using browser-image-compression.
 * @param file The image file to compress.
 * @param options Optional custom compression options.
 * @returns A Promise that resolves to a compressed File.
 */
export async function compressImage(
	file: File,
	options?: ImageCompressionOptions,
): Promise<File> {
	const defaultOptions: ImageCompressionOptions = {
		maxSizeMB: 0.5,
		maxWidthOrHeight: 1024,
		useWebWorker: true,
	};

	const finalOptions = { ...defaultOptions, ...options };
	return await imageCompression(file, finalOptions);
}
