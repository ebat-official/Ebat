import { useState } from "react";
import axios from "axios";
import { getSignedURL } from "@/actions/fileUpload";

const useFileUpload = () => {
	const [progress, setProgress] = useState<number>(0); // Upload progress percentage
	const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state
	const [fileKey, setFileKey] = useState<string | null>(null); // File key

	// Function to compute SHA-256 checksum
	const computeSHA256 = async (file: File) => {
		const buffer = await file.arrayBuffer();
		const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		const hashHex = hashArray
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("");
		return hashHex;
	};

	// Function to upload a file
	const uploadFile = async (file: File, metadata?: Record<string, string>) => {
		setIsLoading(true);

		try {
			// Step 1: Compute checksum
			const checksum = await computeSHA256(file);

			// Step 2: Get signed URL from the server
			const signedURLResult = await getSignedURL({
				fileSize: file.size,
				fileType: file.type,
				checksum,
				metadata,
			});

			if (signedURLResult.status !== "success") {
				throw new Error(signedURLResult.cause || signedURLResult.data.message);
			}

			// Step 3: Upload the file to S3 using the signed URL
			const filekey = signedURLResult.data.fileKey;
			const signedUrl = signedURLResult.data.url;
			let imageUrl = signedURLResult.data.url.split("?")[0];

			if (process.env.NODE_ENV === "development") {
				imageUrl = `${process.env.NEXT_PUBLIC_AWS_BUCKET_PUBLIC_URL}/${filekey}`;
			}

			const response = await axios.put(signedUrl, file, {
				headers: {
					"Content-Type": file.type,
				},
				onUploadProgress: (progressEvent) => {
					const percentCompleted = Math.round(
						(progressEvent.loaded * 100) / (progressEvent.total || 1),
					);
					setProgress(percentCompleted);
				},
			});

			if (response.status !== 200) {
				throw new Error("Failed to upload file");
			}
			setFileKey(filekey);
			return { status: "success", data: { url: imageUrl } };
		} catch (err) {
			const errMsg =
				err instanceof Error ? err.message : "An unknown error occurred";
			return { status: "error", data: { message: errMsg } };
		} finally {
			setProgress(0);
			setIsLoading(false);
		}
	};

	return {
		progress,
		isLoading,
		uploadFile,
		fileKey,
	};
};

export default useFileUpload;
