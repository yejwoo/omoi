"use client";

import Button from "@/components/Button";
import { useEffect, useState, useRef } from "react";
import Dropzone from "@/components/Dropzone";
import Image from "next/image";
import Input from "./Input";
import { useSession } from "next-auth/react";
import { FileWithPath } from "react-dropzone";
import uploadFiles from "@/lib/UploadFiles";
import { tags1, tags2 } from "@/app/data/tags";
import { getSession } from "@/lib/session";

interface modalState {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

interface FileWithPreview extends FileWithPath {
  preview: string;
}

const disableScroll = () => {
  document.body.style.overflow = 'hidden';
};

const enableScroll = () => {
  document.body.style.overflow = '';
};

export default function PostForm({ isOpen, onClose, onSubmit }: modalState) {
  const { data: session } = useSession();
  const [userId, setUserId] = useState<number | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([]);
  const [selectedTag1, setSelectedTag1] = useState<string>("");
  const [selectedTag2, setSelectedTag2] = useState<string[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  function fileToBlob(file: FileWithPreview): Promise<Blob> {
    return fetch(file.preview).then((res) => res.blob());
  }

  useEffect(() => {
    const fetchSession = async () => {
      if (session) {
        // @TODO: 네이버 이메일 유저 정보 및 아이디 저장
        // if (session.user && session.user?.name) {
          // setUserId(session.user?.name);
        // }
      } else {
        const emailSession = await getSession();
        // console.log(emailSession)
        if (emailSession && emailSession.id) {
          setUserId(emailSession.id || 0);
        }
      }
    };

    if (isOpen) {
      fetchSession();
      disableScroll();
    } else {
      enableScroll();
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
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
  }, [isOpen, session, onClose]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    formData.set("tags1", selectedTag1);
    formData.set("tags2", selectedTag2.join(","));
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
  };

  if (!isOpen) return null;

  return (
    <main className="fixed flex justify-center items-center inset-0 bg-black bg-opacity-50 overflow-auto h-full">
      <div ref={modalRef} className="bg-white shadow-md px-8 pt-6 pb-8 flex flex-col w-full max-h-screen overflow-y-auto sm:w-[640px] sm:h-auto sm:rounded sm:h-[902px]">
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
            <Dropzone onFilesAdded={handleFilesAdded} />
          </div>
          <div className="mb-4">
            <textarea
              id="content"
              name="content"
              className="bg-gray-50 resize-none appearance-none w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-56 rounded-md"
              placeholder="내용을 입력하세요."
            />
          </div>
          {/* 지역 */}
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="region"
            >
              지역
            </label>
            <select
              id="region"
              name="region"
              className="block appearance-none w-full bg-white border border-gray-200 hover:border-gray-500 px-4 py-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline"
            >
              <option>지역 선택</option>
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
          </div>
          <div className="flex gap-2">
            <Input type="date" name="date1" label="날짜 1" />
            <Input type="date" name="date2" label="날짜 2" />
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
          {userId && (
            <div className="hidden">
              <Input
                type="hidden"
                name="userId"
                label="유저 아이디"
                value={userId}
              />
            </div>
          )}
          <div className="flex items-center justify-between mt-4">
            <Button content="게시" type="primary" />
          </div>
        </form>
      </div>
    </main>
  );
}
