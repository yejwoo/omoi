import React, { useCallback, useEffect, useState } from "react";
import { useDropzone, FileWithPath } from "react-dropzone";
import Image from "next/image";

interface FileWithPreview extends FileWithPath {
  preview: string;
}

interface DropzoneProps {
  onFilesAdded: (files: FileWithPreview[]) => void;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFilesAdded }) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [modalImage, setModalImage] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    const newFiles = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    onFilesAdded(newFiles);
  }, [onFilesAdded]);

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

  const removeFile = (file: FileWithPreview) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f !== file));
    URL.revokeObjectURL(file.preview);
  };

  // 프리뷰 이미지 좌우 이동
  const scrollLeft = () => {
    const container = document.getElementById("thumbnail-container");
    container?.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    const container = document.getElementById("thumbnail-container");
    container?.scrollBy({ left: 200, behavior: "smooth" });
  };

  // useEffect(() => {
  //   console.log("preview images: ", files);
  // }, [files]);

  return (
    <section className="container">
      <div className="flex items-center gap-2">
        <p className="text-gray-700 text-sm font-bold">이미지 추가</p>
        <div {...getRootProps({ className: "dropzone" })}>
          <input {...getInputProps()} />
          <div className="w-8 h-8 flex flex-col gap-2 justify-center items-center bg-gray-200 rounded-lg hover:bg-gray-300 hover:transition-all cursor-pointer">
            <Image src="/icons/add.svg" width={16} height={16} alt="add photo" />
          </div>
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
                    className="hover:cursor-pointer"
                    src={file.preview}
                    alt="preview"
                    fill
                    style={{ objectFit: "cover" }}
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
    </section>
  );
};

export default Dropzone;
