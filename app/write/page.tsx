"use client";

import { useState } from "react";

export default function PostForm() {
  const [post, setPost] = useState({
    content: "",
    image: "",
    region: "",
    latitude: "",
    longitude: "",
    date1: "",
    date2: "",
    tag: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPost({ ...post, [name]: value });
  };

  const handleFileChange = (e) => {
    setPost({ ...post, image: e.target.files[0] });
  };

  // 서버 URL을 action 속성에 명시
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 px-5">
      <form
        action="/your-server-endpoint"
        method="POST"
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col"
        enctype="multipart/form-data"
      >
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
            이미지
          </label>
          <input
            type="file"
            id="image"
            name="image"
            className="shadow w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            onChange={handleFileChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
            작성 내용
          </label>
          <textarea
            id="content"
            name="content"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={post.content}
            onChange={handleInputChange}
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
            value={post.region}
            onChange={handleInputChange}
          >
            <option>지역 선택</option>
            <option value="Seoul">서울</option>
            <option value="Busan">부산</option>
            <option value="Incheon">인천</option>
          </select>
        </div>
        <div className="flex mb-4 space-x-4">
          <div className="w-1/2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="latitude">
              위도
            </label>
            <input
              type="number"
              id="latitude"
              name="latitude"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={post.latitude}
              onChange={handleInputChange}
            />
          </div>
          <div className="w-1/2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="longitude">
              경도
            </label>
            <input
              type="number"
              id="longitude"
              name="longitude"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={post.longitude}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date1">
            날짜 1
          </label>
          <input
            type="date"
            id="date1"
            name="date1"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={post.date1}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date2">
            날짜 2
          </label>
          <input
            type="date"
            id="date2"
            name="date2"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={post.date2}
            onChange={handleInputChange}
          />
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
            value={post.tag}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            제출
          </button>
        </div>
      </form>
    </main>
  );
}
