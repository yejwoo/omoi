"use client";

import { getSession } from "@/lib/session";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import IPost from "@/app/interface/IPost";
import { tags1, tags2 } from "@/app/data/tags";

const Home = () => {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<IPost | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");
  const modalRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setModalOpen] = useState<Boolean>(false);

  const getTag1Name = (value: string) => {
    const tag = tags1.find((tag) => tag.value === value);
    return tag ? tag.name : value;
  };

  const getTag2Names = (values: string) => {
    return values.split(",").map((value) => {
      const tag = tags2.find((tag) => tag.value === value);
      return tag ? tag.name : value;
    });
  };

  // 모달 바깥 클릭시 안 보이기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [modalRef]);

  useEffect(() => {
    const fetchSession = async () => {
      const emailSession = await getSession();
      if (emailSession && emailSession.id) {
        setUserId(emailSession.id || 0);
        setUserName(emailSession.username || "");
      }
    };

    fetchSession();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // userId가 있을 때만 fetchPosts 실행
        if (userId) {
          const response = await fetch(`/api/posts?userId=${userId}`);
          if (response.ok) {
            const data = await response.json();
            console.log(data);
            setPosts(data.posts);
          } else {
            console.error("Failed to fetch My Posts.");
          }
        }
      } catch (error) {
        console.error("Failed to fetch My Posts.", error);
      }
    };
    fetchPosts();
  }, [userId]);

  const handleCloseModal = () => {
    setSelectedPost(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-5">
      <div className="max-w-lg mx-auto">
        {/* 상단 유저 프로필 */}
        <div className="flex items-center space-x-4 p-4 bg-white shadow w-full max-w-2xl">
          <div className="w-12 h-12 rounded-full bg-gray-300"></div>
          <div>
            <h1 className="text-xl font-bold">{userName}</h1>
            {/* <p className="text-gray-600">Bio goes here...</p> */}
          </div>
        </div>

        {/* 3x3 그리드 피드 */}
        <div className="grid grid-cols-3 gap-2 py-4 w-full max-w-2xl">
          {posts.map((post, index) => (
            <div
              key={index}
              className="relative w-full cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              <div className="w-full" style={{ paddingBottom: "100%" }}></div>
              <div className="absolute top-0 left-0 w-full h-full bg-gray-300">
                {post.images[0] && (
                  <Image
                    src={post.images[0].url}
                    alt={`Post image ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: "contain" }}
                    loading="lazy"
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 모달 */}
        {selectedPost && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]"
            ref={modalRef}
          >
            <div className="bg-white p-4 rounded-lg max-w-xl w-full relative mx-4">
              <button
                onClick={handleCloseModal}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                <Image
                  src="/icons/close.svg"
                  width={32}
                  height={32}
                  alt="close"
                />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-gray-300"></div>
                <h2 className="text-xl font-bold">
                  {selectedPost.user.username}
                </h2>
              </div>
              <Image
                src={selectedPost.images[0].url}
                alt="Post image"
                width={600}
                height={600}
                className="mb-4"
                style={{ objectFit: "contain" }}
              />
              <p>{selectedPost.content}</p>
              {(selectedPost.tags1 || selectedPost.tags2) && (
                <div className="flex gap-1 mt-3">
                  {selectedPost.tags1 && (
                    <span
                      key={`tag1-${selectedPost.id}`}
                      className="py-1 px-2 rounded-full text-sm font-semibold cursor-pointer text-gray-500 bg-gray-100"
                    >
                      {getTag1Name(selectedPost.tags1)}
                    </span>
                  )}
                  {selectedPost.tags2 &&
                    getTag2Names(selectedPost.tags2).map(
                      (tag: string, index: number) => (
                        <span
                          key={`tag2-${selectedPost.id}-${index}`}
                          className="py-1 px-2 rounded-full text-sm font-semibold cursor-pointer text-gray-500 bg-gray-100"
                        >
                          {tag}
                        </span>
                      )
                    )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
