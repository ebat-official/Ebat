"use server";
import { auth } from "@/auth";
import {
	ALLOWED_FILE_TYPES,
	MAX_POSTS_IMAGE_SIZE,
	MAX_POSTS_VIDEO_SIZE,
} from "@/config";
import { SUCCESS } from "@/utils/constants";
import { UNAUTHENTICATED_ERROR, RATE_LIMIT_ERROR } from "@/utils/errors";
import { GenerateActionReturnType } from "@/utils/types";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getCurrentUser } from "./user";
import { rateLimit, UploadActions, RateLimitCategory } from "@/lib/rateLimit";

type ResponseData = { url: string; fileKey: string };

type GetSignedURLParams = {
	fileType: string;
	fileSize: number;
	checksum: string;
	metadata?: Record<string, string>;
};

const s3 = new S3Client({
	region: process.env.AWS_BUCKET_REGION!,
	endpoint: process.env.AWS_ENDPOINT!,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID!,
	},
});

const getMaxFileSize = (fileType: string): number => {
	return fileType.startsWith("image")
		? MAX_POSTS_IMAGE_SIZE
		: MAX_POSTS_VIDEO_SIZE;
};

export async function getSignedURL({
	fileType,
	fileSize,
	checksum,
	metadata,
}: GetSignedURLParams): Promise<GenerateActionReturnType<ResponseData>> {
	// Rate limiting
	const action = fileType.startsWith("image")
		? UploadActions.IMAGE_UPLOAD
		: UploadActions.FILE_UPLOAD;
	const rateLimitResult = await rateLimit(RateLimitCategory.UPLOADS, action);
	if (!rateLimitResult.success) {
		return RATE_LIMIT_ERROR;
	}

	const user = await getCurrentUser();
	if (!user) {
		return UNAUTHENTICATED_ERROR;
	}

	if (
		!ALLOWED_FILE_TYPES.some(
			(type) =>
				fileType === type ||
				(type.endsWith("/*") && fileType.startsWith(type.slice(0, -1))),
		)
	) {
		return { status: "error", data: { message: "File type not allowed" } };
	}

	const maxFileSize = getMaxFileSize(fileType);
	if (fileSize > maxFileSize) {
		return {
			status: "error",
			data: { message: `File size exceeds limit (${maxFileSize} bytes)` },
		};
	}

	const bucketName = process.env.AWS_BUCKET_NAME;
	if (!bucketName) {
		return { status: "error", data: { message: "AWS bucket name is missing" } };
	}
	const postId = metadata?.postId || "default";

	const fileKey = `posts/${postId}/${Date.now()}-${Math.random().toString(36).substring(7)}`;

	const putObjectCommand = new PutObjectCommand({
		Bucket: bucketName,
		Key: fileKey,
		ContentType: fileType,
		ContentLength: fileSize,
		ChecksumSHA256: checksum,
		Metadata: {
			userId: user.id,
			...metadata,
		},
	});

	const signedUrl = await getSignedUrl(s3, putObjectCommand, {
		expiresIn: 60 * 5,
	}); // 5 minutes

	return { status: SUCCESS, data: { url: signedUrl, fileKey } };
}
