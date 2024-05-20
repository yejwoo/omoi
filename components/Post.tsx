import ImageCarousel from "@/components/ImageCarousel";
import { getSession } from "@/lib/session";
import { useEffect, useState } from "react";
import { tags1, tags2 } from "@/app/data/tags";

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

export default function Post({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [userId, setUserId] = useState<number | null>(null);

  // useEffect(() => {
  //   const fetchSession = async () => {
  //     if (!userId) {
  //       // 로그인 상태가 아니면 새로운 세션 정보를 요청
  //       const emailSession = await getSession();
  //       setUserId(emailSession.id || 0);
  //     }
  //   };

  //   fetchSession();
  // }, []);

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: liked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: 1 }),
      });

      if (response.ok) {
        setLiked(!liked);
        setLikeCount((prevCount: any) =>
          liked ? prevCount - 1 : prevCount + 1
        );
      } else {
        console.error("Failed to update like.");
      }
    } catch (error) {
      console.error("Failed to update like.", error);
    }
  };

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
                className="py-1 px-2 rounded-full text-sm font-semibold cursor-pointer text-gray-500 bg-gray-100"
              >
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
        <button
          className="text-gray-500 hover:text-gray-700 flex items-center gap-2"
          onClick={handleLike}
        >
          <span className="text-xl text-brand-200">{liked ? "♥️" : "♡"}</span>{likeCount}
        </button>

        <p className="mt-2 text-sm text-gray-700">{post.content}</p>

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
}
