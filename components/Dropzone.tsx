import React, { useCallback, useState } from "react";
import { useDropzone, FileWithPath } from "react-dropzone";
import Image from "next/image";
import { S3, PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";

interface FileWithPreview extends FileWithPath {
  preview: string;
}

const Dropzone: React.FC = (props: any) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [modalImage, setModalImage] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    const newFiles = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/jpg": [],
      "image/jpeg": [],
      "image/png": [],
    },
    onDrop,
    multiple: true,
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024, // 10 MB
  });

  const uploadFiles = async () => {
    const s3 = new S3({
      region: process.env.NEXT_PUBLIC_AWS_REGION,
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
      },
    });

    const uploadPromises = files.map(async (file) => {
      const date = new Date();
      const dateString = date.toISOString().slice(0, 10).replace(/-/g, "");

      const params: PutObjectCommandInput = {
        Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
        Key: `${dateString}/${Date.now()}_${file.name}`,
        Body: file,
        ContentType: file.type,
      };

      const command = new PutObjectCommand(params);
      return s3.send(command);
    });

    try {
      const results = await Promise.all(uploadPromises);
      console.log("업로드 성공:", results);
    } catch (error) {
      console.error("업로드 오류:", error);
    }
  };

  const removeFile = (file: FileWithPreview) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f !== file));
    URL.revokeObjectURL(file.preview);
  };

  const scrollLeft = () => {
    const container = document.getElementById("thumbnail-container");
    container?.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    const container = document.getElementById("thumbnail-container");
    container?.scrollBy({ left: 200, behavior: "smooth" });
  };

  return (
    <section className="container">
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <div className="w-32 h-48 p-8 flex flex-col gap-2 justify-center items-center bg-gray-100 rounded-lg hover:bg-gray-200 hover:transition-all cursor-pointer">
          <Image src="/icons/add-to-photo.svg" width={24} height={24} alt="add photo" />
        </div>
      </div>
      {files.length > 0 && (
        <div className="relative flex items-center">
          {files.length > 4 && (
            <button
              className="absolute left-0 z-30 p-2 bg-gray-300 rounded-full hover:bg-gray-400"
              onClick={scrollLeft}
              type="button"
            >
              <Image src="/icons/arrow-left.svg" width={24} height={24} alt="left arrow" />
            </button>
          )}
          <div id="thumbnail-container" className="flex gap-4 p-4 overflow-x-auto no-scrollbar">
            {files.map((file) => (
              <div key={file.name} className="relative">
                <Image
                  className="z-20 p-1 bg-gray-200 rounded-full top-2 right-2 absolute hover:bg-gray-300 cursor-pointer"
                  src="/icons/close.svg"
                  width={24}
                  height={24}
                  alt="close"
                  onClick={() => removeFile(file)}
                />
                <div className="w-32 h-48 relative">
                  <Image
                    src={file.preview}
                    alt="preview"
                    layout="fill"
                    objectFit="cover"
                    onClick={() => setModalImage(file.preview)}
                  />
                </div>
              </div>
            ))}
          </div>
          {files.length > 4 && (
            <button
              className="absolute right-0 z-30 p-2 bg-gray-300 rounded-full hover:bg-gray-400"
              onClick={scrollRight}
              type="button"
            >
              <Image src="/icons/arrow-right.svg" width={24} height={24} alt="right arrow" />
            </button>
          )}
        </div>
      )}
      {modalImage && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40"
          onClick={() => setModalImage(null)}
        >
          <div className="relative">
            <Image src={modalImage} alt="full preview" width={800} height={600} />
            <button
              className="absolute top-2 right-2 p-1 bg-gray-200 rounded-full hover:bg-gray-300"
              onClick={() => setModalImage(null)}
              type="button"
            >
              <Image src="/icons/close.svg" width={24} height={24} alt="close" />
            </button>
          </div>
        </div>
      )}
      {files.length > 0 && (
        <button onClick={uploadFiles} className="mt-4 p-2 bg-blue-500 text-white rounded">
          Upload Files
        </button>
      )}
    </section>
  );
};

export default Dropzone;
