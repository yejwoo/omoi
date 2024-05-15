"use client";

import Button from "@/components/Button";
import { useEffect, useState } from "react";
import Dropzone from "@/components/Dropzone";
import Image from "next/image";
import { useFormState } from "react-dom";
import createPost from "@/app/postAction";
import Input from "./Input";
import { getSession, useSession } from "next-auth/react";
import { defaultSession } from "@/lib/sessionSetting";

interface modalState {
  isOpen: boolean;
  onClose: () => void;
}

export default function PostForm({ isOpen, onClose }: modalState) {
  const { data: session } = useSession();
  const [state, action] = useFormState(createPost, null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      // 네이버 로그인 사용자의 ID 가져오기
      if (session.user && session.user?.name) {
        setUserId(session.user?.name);
      }
    } else {
      // 이메일 세션의 ID 가져오기
      const fetchSession = async () => {
        const emailSession = await getSession();
        if (emailSession && emailSession.user && emailSession.user.email) {
          setUserId(emailSession.user.email);
        }
      };
      fetchSession();
    }
  }, [session]);


  if (!isOpen) return null;

  return (
    <main className="fixed flex justify-center items-center inset-0 bg-black bg-opacity-50">
      <form
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col w-full h-full sm:w-[640px] sm:h-auto"
        action={action}
      >
        <div className="mb-4">
          <Image
            className="flex p-1 items-end cursor-pointer hover:rounded-full hover:bg-gray-200 hover:transition ml-auto"
            src="/icons/close.svg"
            width={32}
            height={32}
            alt="close"
            onClick={onClose}
          />
          <Dropzone />
        </div>
        <div className="mb-4">
          <textarea
            id="content"
            name="content"
            className="bg-gray-50 resize-none appearance-none rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-56 rounded-md"
            placeholder="내용을 입력하세요."
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="region">
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
          <Input type="date" name="date1" label="날짜 1"/>
          <Input type="date" name="date2" label="날짜 2"/>
        </div>
        <Input
          type="text"
          name="tag"
          label="태그"
          placeholder="태그를 입력하세요."
        />
        {userId && (
          <div className="hidden">
            <Input type="hidden" name="userId" label="유저 아이디" value={userId} />
          </div>
        )}
        <div className="flex items-center justify-between mt-4">
          <Button content="공유" type="primary" />
        </div>
      </form>
    </main>
  );
}
