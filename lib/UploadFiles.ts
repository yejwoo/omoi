import { S3, PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";
import { FileWithPath } from "react-dropzone";

// interface FileWithPreview extends FileWithPath {
//   content: string; // Blob URL
// }

const s3 = new S3({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

async function uploadFileToS3(file: File) {
  const date = new Date();
  const dateString = date.toISOString().slice(0, 10).replace(/-/g, "");

  const params: PutObjectCommandInput = {
    Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
    Key: `${dateString}/${Date.now()}_${file.name}`,
    Body: file,
    ContentType: file.type,
  };

  const command = new PutObjectCommand(params);
  const result = await s3.send(command);
  const imageUrl = `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${params.Key}`;
  return imageUrl;
}

export default async function uploadFiles(files: File[]) {
  const uploadPromises = files.map(uploadFileToS3);

  try {
    const results = await Promise.all(uploadPromises);
    console.log("업로드 성공:", results);
    return results;
  } catch (error) {
    console.error("업로드 오류:", error);
    throw error;
  }
}
