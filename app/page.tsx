"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import WriteModal from "@/components/WriteModal";
import SkeletonPost from "@/components/SkeletonPost";
import Post from "@/components/Post";
import IPost from "@/app/interface/IPost";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { defaultSession } from "@/lib/sessionSetting";

interface Like {
  id: number;
  postId: number;
  userId: number;
}

export default function Home() {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchPosts = useCallback(async (page: number, initialLoad = false) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts?page=${page}`);
      const data = await response.json();
      if (initialLoad) {
        setPosts(data.posts);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...data.posts]);
      }
      console.log("포스트: ", data.posts);
      setHasMore(data.hasMore);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      setError("Failed to fetch posts.");
      setIsLoading(false);
    }
  }, []);

  const lastPostRef = useRef<HTMLDivElement | null>(null);

  const lastPostElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  // 초기 포스트 3개 로드
  useEffect(() => {
    fetchPosts(1, true);
  }, [fetchPosts]);

  // 2페이지부터 포스트 로드
  useEffect(() => {
    if (page > 1) {
      fetchPosts(page);
    }
    // console.log(posts);
  }, [page, fetchPosts]);

  if (isLoading && page === 1) {
    return (
      <div className="min-h-screen py-20 px-5">
        <main className="max-w-lg mx-auto">
          {[...Array(5)].map((_, index) => (
            <SkeletonPost key={index} />
          ))}
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-5">
      <main className="max-w-lg mx-auto">
        {posts.map((post, index) => {
          if (posts.length === index + 1) {
            return (
              <div
                ref={lastPostElementRef}
                key={index}
                className="mb-8 bg-white rounded-xl shadow-lg"
              >
                <Post post={post} />
              </div>
            );
          } else {
            return (
              <div key={index} className="mb-8 bg-white rounded-xl shadow-lg">
                <Post post={post} />
              </div>
            );
          }
        })}
        {isLoading && (
          <div className="text-center text-gray-500">Loading more posts...</div>
        )}
        {!hasMore && (
          <div className="text-center text-gray-500">마지막 포스트입니다.</div>
        )}
      </main>
    </div>
  );
}
