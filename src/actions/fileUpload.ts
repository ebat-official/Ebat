import { auth } from "@/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: process.env.AWS_REGION });

type SignedURLResponse =
  | { status: "success"; data: { url: string } }
  | { status: "failure"; data: { message: string } };

const allowedFileTypes = ["image/jpeg", "image/png", "video/mp4", "video/quicktime"];
const maxFileSize = 1048576 * 10; // 10MB

type GetSignedURLParams = {
  fileType: string;
  fileSize: number;
  checksum: string;
  metadata?: Record<string, string>;
};

export async function getSignedURL({
  fileType,
  fileSize,
  checksum,
  metadata,

}: GetSignedURLParams): Promise<SignedURLResponse> {
  const session = await auth();
  if (!session) {
    return { status: "failure", data: { message: "Not authenticated" } };
  }

  if (!allowedFileTypes.includes(fileType)) {
    return { status: "failure", data: { message: "File type not allowed" } };
  }

  if (fileSize > maxFileSize) {
    return { status: "failure", data: { message: "File size too large" } };
  }

  const bucketName = process.env.AWS_BUCKET_NAME;
  if (!bucketName) {
    return { status: "failure", data: { message: "AWS bucket name is missing" } };
  }

  const fileKey = `uploads/${session.user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}`;

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

  return { status: "success", data: { url: signedUrl } };
}
