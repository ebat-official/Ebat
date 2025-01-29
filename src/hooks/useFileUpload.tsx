import { useState } from "react";
import axios from "axios";
import { getSignedURL } from "@/actions/fileUpload";

const useFileUpload = () => {
	const [progress, setProgress] = useState<number>(0); // Upload progress percentage
	const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state
	const [error, setError] = useState<string | null>(null); // Error message
	const [isSuccess, setIsSuccess] = useState<boolean>(false); // Success state

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
		setError(null);
		setIsSuccess(false);

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
				throw new Error(signedURLResult.data.message);
			}

			// Step 3: Upload the file to S3 using the signed URL
			const signedUrl = signedURLResult.data.url;
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

			if (response.status === 200) {
				setIsSuccess(true);
			} else {
				throw new Error("Failed to upload file");
			}
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "An unknown error occurred",
			);
		} finally {
			setIsLoading(false);
		}
	};

	return {
		progress,
		isLoading,
		error,
		isSuccess,
		uploadFile,
	};
};

export default useFileUpload;
