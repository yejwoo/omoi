"use client";

import Button from "@/components/Button";
import { useState } from "react";
import Dropzone from "@/components/Dropzone";
import Image from "next/image";

interface modalState {
  isOpen: any;
  onClose: any;
}

export default function PostForm({ isOpen, onClose }: modalState) {
  if (!isOpen) return null;

  return (
    <main className="fixed flex justify-center items-center inset-0 bg-black bg-opacity-50">
      <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col w-full h-full sm:w-[640px] sm:h-auto">
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
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
            작성 내용
          </label>
          <textarea
            id="content"
            name="content"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-56"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="region">
            지역
          </label>
          <select
            id="region"
            name="region"
            className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
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
          <div className="w-1/2 mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date1">
              날짜 1
            </label>
            <input
              type="date"
              id="date1"
              name="date1"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="w-1/2 mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date2">
              날짜 2
            </label>
            <input
              type="date"
              id="date2"
              name="date2"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tag">
            태그
          </label>
          <input
            type="text"
            id="tag"
            name="tag"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="flex items-center justify-between">
          <Button content="공유" type="primary" />
        </div>
      </form>
    </main>
  );
}
