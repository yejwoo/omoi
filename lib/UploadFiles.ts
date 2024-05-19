import { S3, PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";

const s3 = new S3({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

async function uploadFileToS3(file: Blob, fileName: string) {
  console.log(file, fileName);
  const date = new Date();
  const dateString = date.toISOString().slice(0, 10).replace(/-/g, "");

  const params: PutObjectCommandInput = {
    Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
    Key: `${dateString}/${Date.now()}_${fileName}`,
    Body: file,
    ContentType: file.type,
  };

  const command = new PutObjectCommand(params);
  const result = await s3.send(command);
  const imageUrl = `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${params.Key}`;
  return imageUrl;
}

export default async function uploadFiles(files: Blob[], fileNames: string[]) {
  const uploadPromises = files.map((file, index) => uploadFileToS3(file, fileNames[index]));

  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error("업로드 오류:", error);
    throw error;
  }
}
