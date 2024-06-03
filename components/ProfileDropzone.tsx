import React, { useCallback, useEffect, useState } from "react";
import { useDropzone, FileWithPath } from "react-dropzone";
import Image from "next/image";

interface FileWithPreview extends FileWithPath {
  preview: string;
}

interface ProfileImageDropzoneProps {
  onFileAdded: (file: FileWithPreview | null) => void;
}

const ProfileImageDropzone: React.FC<ProfileImageDropzoneProps> = ({
  onFileAdded,
}) => {
  const [file, setFile] = useState<FileWithPreview | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      if (acceptedFiles.length > 0) {
        const newFile = Object.assign(acceptedFiles[0], {
          preview: URL.createObjectURL(acceptedFiles[0]),
        });
        setFile(newFile);
        onFileAdded(newFile);
      }
    },
    [onFileAdded]
  );

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/jpg": [],
      "image/jpeg": [],
      "image/png": [],
    },
    onDrop,
    multiple: false, // 한 번에 하나의 파일만 업로드
    maxSize: 10 * 1024 * 1024, // 10 MB
  });

  const removeFile = () => {
    if (file) {
      URL.revokeObjectURL(file.preview);
      setFile(null);
      onFileAdded(null);
    }
  };

  useEffect(() => {
    return () => {
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
    };
  }, [file]);

  return (
    <section className="container">
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <div className="relative group w-24">
          {file && (
            <button
              className="mt-2 p-1 text-white rounded-full bg-gray-200 hover:bg-gray-300 absolute z-10 top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              type="button"
            >
              <Image
                src="/icons/close.svg"
                width={16}
                height={16}
                alt="close"
              />
            </button>
          )}
          <div className="w-24 h-24 flex flex-col gap-2 justify-center items-center bg-gray-200 rounded-full hover:bg-gray-300 hover:transition-all cursor-pointer overflow-hidden">
            {file ? (
              <div className="relative w-full h-full">
                <Image
                  src={file.preview}
                  alt="profile preview"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="text-center text-gray-500">+</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileImageDropzone;
