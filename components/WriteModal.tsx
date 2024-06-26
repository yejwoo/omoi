"use client";

import Button from "@/components/Button";
import { useEffect, useState, useRef } from "react";
import Dropzone from "@/components/Dropzone";
import Image from "next/image";
import Input from "./Input";
import { FileWithPath } from "react-dropzone";
import uploadFiles from "@/lib/UploadFiles";
import { tags1, tags2 } from "@/app/data/tags";
import { useQuery } from "react-query";
import { fetchSession } from "@/lib/api";
import generateUID from "@/lib/generateUID";

interface modalState {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

interface FileWithPreview extends FileWithPath {
  preview: string;
}

const disableScroll = () => {
  document.body.style.overflow = "hidden";
};

const enableScroll = () => {
  document.body.style.overflow = "";
};

export default function PostForm({ isOpen, onClose, onSubmit }: modalState) {
  const { data: sessionData } = useQuery("session", fetchSession);
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([]);
  const [selectedTag1, setSelectedTag1] = useState<string>("");
  const [selectedTag2, setSelectedTag2] = useState<string[]>([]);
  const [content, setContent] = useState<string>("");
  const [region, setRegion] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [errors, setErrors] = useState<{
    content: boolean;
    region: boolean;
    files: boolean;
  }>({
    content: false,
    region: false,
    files: false,
  });
  const modalRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      disableScroll();
    } else {
      enableScroll();
    }

    // 모달 바깥 클릭시 모달 창 끄기
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      enableScroll();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, sessionData, onClose]);

  // 파일 업로드
  function fileToBlob(file: FileWithPreview): Promise<Blob> {
    return fetch(file.preview).then((res) => res.blob());
  }

  const handleFilesAdded = async (files: FileWithPreview[]) => {
    const blobs = await Promise.all(files.map(fileToBlob));
    const urls = await uploadFiles(
      blobs,
      files.map((file) => file.name)
    );
    setUploadedFiles(
      files.map((file, index) => ({ ...file, url: urls[index] }))
    );
    const hiddenInput = document.getElementById(
      "hiddenFiles"
    ) as HTMLInputElement;
    hiddenInput.value = JSON.stringify(urls);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag2((prevSelectedTags) => {
      if (prevSelectedTags.includes(tag)) {
        return prevSelectedTags.filter((t) => t !== tag);
      } else if (prevSelectedTags.length < 3) {
        return [...prevSelectedTags, tag];
      } else {
        return [...prevSelectedTags.slice(0, -1), tag];
      }
    });
  };

  const handleDate = (date: string) => {
    const newDate = new Date(date).toISOString();
    setDate(newDate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    formData.set("tags1", selectedTag1);
    formData.set("tags2", selectedTag2.join(","));
    formData.set("date", date);

    const newErrors = {
      content: content.trim() === "",
      region: region === "",
      files: uploadedFiles.length === 0,
    };

    setErrors(newErrors);

    if (!newErrors.content && !newErrors.region && !newErrors.files) {
      setIsSubmitting(true);

      try {
        const response = await fetch("/api/posts", {
          method: "POST",
          body: JSON.stringify(Object.fromEntries(formData)),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();
        if (result.success) {
          onSubmit(); // 모달 닫기
          window.location.href = result.redirectUrl; // 홈으로 리다이렉트
        } else {
          console.error("Failed to create post:", result.errors);
        }
      } catch (error) {
        console.error("Failed to create post:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // 실시간 에러메시지 삭제
  useEffect(() => {
    if (content !== "") {
      setErrors((prevErrors) => ({ ...prevErrors, content: false }));
    }
  }, [content]);

  useEffect(() => {
    if (region !== "") {
      setErrors((prevErrors) => ({ ...prevErrors, region: false }));
    }
  }, [region]);

  useEffect(() => {
    if (uploadedFiles.length > 0) {
      setErrors((prevErrors) => ({ ...prevErrors, files: false }));
    }
  }, [uploadedFiles]);

  if (!isOpen) return null;

  return (
    <main className="fixed flex justify-center items-center inset-0 bg-black bg-opacity-50 overflow-auto h-full">
      <div
        ref={modalRef}
        className="bg-white shadow-md px-8 pt-6 pb-8 flex flex-col w-full max-h-screen overflow-y-auto sm:w-[640px] sm:h-auto sm:rounded sm:h-[902px]"
      >
        <form onSubmit={handleSubmit}>
          <input id="hiddenFiles" name="files" type="hidden" />
          <div className="mb-4">
            <Image
              className="flex p-1 items-end cursor-pointer hover:rounded-full hover:bg-gray-200 hover:transition ml-auto"
              src="/icons/close.svg"
              width={32}
              height={32}
              alt="close"
              onClick={onClose}
            />
            <div className="flex gap-1">
              <span className="text-brand-200">* </span>
              <Dropzone onFilesAdded={handleFilesAdded} />
            </div>
            {errors.files && (
              <p className="text-red-500 text-xs mt-2">
                이미지를 업로드 해주세요.
              </p>
            )}
          </div>
          <div className="mb-4">
            <textarea
              id="content"
              name="content"
              className={`bg-gray-50 resize-none appearance-none w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-56 rounded-md ${
                errors.content ? "border-red-500" : ""
              }`}
              placeholder="내용을 입력하세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            {errors.content && (
              <p className="text-red-500 text-xs mt-2">내용을 입력해주세요.</p>
            )}
          </div>
          {/* 지역 */}
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="region"
            >
              <span className="text-brand-200">* </span>지역
            </label>
            <select
              id="region"
              name="region"
              className={`block appearance-none w-full bg-white border border-gray-200 px-4 py-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline ${
                errors.region ? "border-red-500" : ""
              }`}
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="">지역 선택</option>
              <option value="TK">도쿄</option>
              <option value="FK">후쿠오카</option>
              <option value="OS">오사카</option>
              <option value="KG">가고시마</option>
              <option value="SZ">시즈오카</option>
              <option value="NY">나고야</option>
              <option value="SP">삿포로</option>
              <option value="OK">오키나와</option>
              <option value="NG">나가사키</option>
              <option value="TM">다카마쓰</option>
            </select>
            {errors.region && (
              <p className="text-red-500 text-xs mt-2">지역을 선택해주세요.</p>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              type="date"
              name="date"
              label="날짜"
              required
              onChange={(e) => handleDate(e.target.value)}
            />
          </div>
          {/* 태그 */}
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="tags1"
            >
              누구와
            </label>
            <div id="tags1" className="flex flex-wrap gap-2">
              {tags1.map((tag, index) => (
                <button
                  type="button"
                  key={index}
                  className={`py-1 px-2 rounded-full text-sm font-medium cursor-pointer transition ${
                    selectedTag1 === tag.value
                      ? "bg-brand-200 text-white border border-transparent"
                      : "bg-white text-gray-700 border border-gray-200"
                  }`}
                  onClick={() =>
                    setSelectedTag1(selectedTag1 === tag.value ? "" : tag.value)
                  }
                >
                  {tag.name}
                </button>
              ))}
            </div>
            <select id="tags1" name="tags1" className="hidden">
              <option value="">태그 선택</option>
              {tags1.map((tag) => (
                <option key={tag.name} value={tag.value}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="tags2"
            >
              테마 (최대 3개)
            </label>
            <div id="tags2" className="flex flex-wrap gap-2">
              {tags2.map((tag, index) => (
                <button
                  type="button"
                  key={index}
                  className={`py-1 px-2 rounded-full text-sm font-medium cursor-pointer transition ${
                    selectedTag2.includes(tag.value)
                      ? "bg-brand-200 text-white border border-transparent"
                      : "bg-white text-gray-700 border border-gray-200"
                  }`}
                  onClick={() => handleTagClick(tag.value)}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            <select id="tags2" name="tags2" className="hidden">
              <option value="">태그 선택</option>
              {tags2.map((tag) => (
                <option key={tag.name} value={tag.value}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="postStatus"
            >
              공개 범위
            </label>
            <select
              id="postStatus"
              name="postStatus"
              className="block appearance-none w-full bg-white border border-gray-200 hover:border-gray-500 px-4 py-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="public" defaultChecked>
                공개
              </option>
              <option value="private">비공개</option>
            </select>
          </div>
          {sessionData.id && (
            <div className="hidden">
              <Input
                type="hidden"
                name="userId"
                label="유저 아이디"
                value={sessionData.id}
              />
            </div>
          )}
          <div>
            <div className="hidden">
              <Input
                type="hidden"
                name="uid"
                label="UID"
                value={generateUID()}
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <Button content="게시" type="primary" isSubmitting={isSubmitting} />
          </div>
        </form>
      </div>
    </main>
  );
}
