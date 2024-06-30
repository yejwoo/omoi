"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import SkeletonPost from "@/components/SkeletonPost";
import Post from "@/components/Post";
import IPost from "@/app/interface/IPost";
import Image from "next/image";

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
  const lastElementRef = useRef<HTMLDivElement | null>(null);
  let hasSetRef = false;

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

  const observeElement = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            console.log("70% 위치에 도달, 페이지 로드");
            setPage((prevPage) => prevPage + 1);
          }
        },
        {
          threshold: 0.7, // 70%에 도달했을 때 작동
        }
      );
      if (node) {
        observer.current.observe(node);
        // console.log("Observer attached to:", node);
      }
    },
    [isLoading, hasMore]
  );

  // 초기 포스트 로드
  useEffect(() => {
    fetchPosts(1, true);
  }, [fetchPosts]);

  // 2페이지부터 포스트 로드
  useEffect(() => {
    if (page > 1) {
      fetchPosts(page);
    }
  }, [page, fetchPosts]);

  useEffect(() => {
    if (lastElementRef.current) {
      observeElement(lastElementRef.current);
    }
  }, [observeElement, posts]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight || document.documentElement.clientHeight;
  
      if (scrollTop + clientHeight >= scrollHeight && hasMore && !isLoading) {
        setPage((prevPage) => prevPage + 1);
      }
    };
  
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoading, hasMore]);
  

  if (isLoading && page === 1) {
    return (
      <div className="min-h-screen py-5 md:py-20 px-5">
        <main className="max-w-lg mx-auto">
          {[...Array(30)].map((_, index) => (
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
    <div className="min-h-screen bg-white py-5 md:py-20 px-5">
      <main className="max-w-lg mx-auto">
        {posts.map((post, index) => {
          if (!hasSetRef && index >= Math.floor(posts.length * 0.7)) {
            hasSetRef = true;
            return (
              <div
                ref={lastElementRef}
                key={index}
              >
                <Post post={post} fetchPosts={fetchPosts}/>
              </div>
            );
          } else {
            return (
              <div key={index}>
                <Post post={post} fetchPosts={fetchPosts}/>
              </div>
            );
          }
        })}
        {isLoading && (
          <div className="flex justify-center items-center">
            <Image
              src="/images/loading.gif"
              alt="Loading"
              width={56}
              height={56}
            />
          </div>
        )}
        {!hasMore && (
          <div className="text-center text-gray-500">마지막 포스트입니다.</div>
        )}
      </main>
    </div>
  );
}
