"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import WriteModal from "@/components/WriteModal";
import ImageCarousel from "@/components/ImageCarousel";
import { tags1, tags2 } from "./data/tags";
import SkeletonPost from "@/components/SkeletonPost";

interface Post {
  id: number;
  content: string;
  images: { url: string }[];
  user: { username: string };
  comments: { content: string }[];
  tags1: string;
  tags2: string;
  createdAt: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
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
      setHasMore(data.hasMore);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      setError("Failed to fetch posts.");
      setIsLoading(false);
    }
  }, []);
  

  useEffect(() => {
    fetchPosts(1, true);
  }, [fetchPosts]);
  

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
  

  useEffect(() => {
    if (page > 1) {
      fetchPosts(page);
    }
    console.log(posts);
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
                <PostComponent post={post} />
              </div>
            );
          } else {
            return (
              <div key={index} className="mb-8 bg-white rounded-xl shadow-lg">
                <PostComponent post={post} />
              </div>
            );
          }
        })}
        {isLoading && <div className="text-center">Loading more posts...</div>}
      </main>
    </div>
  );
}

const PostComponent = ({ post }: { post: Post }) => {
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

  return (
    <>
      <header className="p-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden"></div>
          <span className="font-bold">{post.user.username}</span>
        </div>
        {(post.tags1 || post.tags2) && (
          <div className="flex gap-1 mt-3">
            {post.tags1 && (
              <span
              key={`tag1-${post.id}`}
              className="py-1 px-2 rounded-full text-sm font-semibold cursor-pointer text-gray-500 bg-gray-100">
                {getTag1Name(post.tags1)}
              </span>
            )}
            {post.tags2 &&
              getTag2Names(post.tags2).map((tag: string, index: number) => (
                <span
                key={`tag2-${post.id}-${index}`}
                  className="py-1 px-2 rounded-full text-sm font-semibold cursor-pointer text-gray-500 bg-gray-100"
                >
                  {tag}
                </span>
              ))}
          </div>
        )}
      </header>

      {post.images.length > 0 && <ImageCarousel images={post.images} />}

      <div className="p-5">
        <button className="text-gray-500 hover:text-gray-700">
          <span className="text-xl">♥️</span>
        </button>

        <p className="mt-2 text-sm text-gray-700">
          {post.content}
        </p>

        <p className="text-xs text-gray-500 mt-2">View all comments</p>
      </div>

      <form className="border-t border-gray-200 p-3 flex items-center">
        <input
          type="text"
          placeholder="Add a comment..."
          className="flex-1 border-none focus:ring-0"
        />
        <button type="submit" className="text-blue-500 font-semibold">
          Post
        </button>
      </form>
    </>
  );
};
