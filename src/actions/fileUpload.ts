"use server";
import { auth } from "@/auth";
import { UNAUTHENTICATED_ERROR } from "@/utils/errors";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


type SignedURLResponse =
  | { status: "success"; data: { url: string,fileKey:string } }
  | { status: "error"; cause?:string; data: { message: string } };

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
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})


const allowedFileTypes = ["image/jpeg", "image/png", "video/mp4", "video/quicktime"];

const MAX_POSTS_IMAGE_SIZE = Number.parseInt(process.env.MAX_POSTS_IMAGE_SIZE || "1048576", 10);
const MAX_POSTS_VIDEO_SIZE = Number.parseInt(process.env.MAX_POSTS_VIDEO_SIZE || "10485760", 10); 

const getMaxFileSize = (fileType: string): number => {
  return fileType.startsWith("image") ? MAX_POSTS_IMAGE_SIZE : MAX_POSTS_VIDEO_SIZE;
};


export async function getSignedURL({
  fileType,
  fileSize,
  checksum,
  metadata,

}: GetSignedURLParams): Promise<SignedURLResponse> {
  const session = await auth();
  if (!session) {
    return UNAUTHENTICATED_ERROR as SignedURLResponse
  }

  if (!allowedFileTypes.includes(fileType)) {
    return { status: "error", data: { message: "File type not allowed" } };
  }

  const maxFileSize = getMaxFileSize(fileType);
  if (fileSize > maxFileSize) {
    return { status: "error", data: { message: `File size exceeds limit (${maxFileSize} bytes)` } };
  }

  const bucketName = process.env.AWS_BUCKET_NAME;
  if (!bucketName) {
    return { status: "error", data: { message: "AWS bucket name is missing" } };
  }
  const postId = metadata?.postId || "default"

  const fileKey = `posts/${postId}/${Date.now()}-${Math.random().toString(36).substring(7)}`;

  const putObjectCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
    ContentType: fileType,
    ContentLength: fileSize,
    ChecksumSHA256: checksum,
    Metadata: {
      userId: session.user.id,
        ...metadata,
    },
  });

  const signedUrl = await getSignedUrl(s3, putObjectCommand, { expiresIn: 60 * 5 }); // 5 minutes

  return { status: "success", data: { url: signedUrl,fileKey } };
}
