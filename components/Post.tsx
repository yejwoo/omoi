import ImageCarousel from "@/components/ImageCarousel";
import { getSession } from "@/lib/session";
import { useCallback, useEffect, useState } from "react";
import { tags1, tags2 } from "@/app/data/tags";
import { defaultSession } from "@/lib/sessionSetting";
import Image from "next/image";
import IPost from "@/app/interface/IPost";
import debounce from "@/lib/debounce";

export default function Post({ post }: { post: IPost }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [emailSession, setEmailSession] = useState(defaultSession);
  const [userId, setUserId] = useState(0); 

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

  useEffect(() => {
    const fetchSession = async () => {
      const emailSession = await getSession();
      if (emailSession && emailSession.id) {
        setUserId(emailSession.id || 0);
      }
    };

    fetchSession();
  }, []);

  // 좋아요 버튼 클릭시 추가 or 삭제
  const handleLike = useCallback(
    debounce(async () => {
      try {
          // Optimistic UI 업데이트
        setLiked(!liked);
        setLikeCount((prevCount) => (liked ? prevCount - 1 : prevCount + 1));

        const response = await fetch(
          `/api/posts/${post.id}/like?userId=${userId}`,
          {
            method: liked ? "DELETE" : "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update like.");
        }
      } catch (error) {
        console.error(error);
        // Optimistic UI 롤백
        setLiked(!liked);
        setLikeCount((prevCount) => (liked ? prevCount + 1 : prevCount - 1));
      }
    }, 300),
    [liked, userId, post.id] // 의존성 배열에 포함된 값이 변경될 때만 함수 새로 생성
  );

  useEffect(() => {
    // 좋아요 상태 및 개수 가져오기
    const fetchLikes = async () => {
      try {
        const response = await fetch(
          `/api/posts/${post.id}/like?userId=${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          // console.log(data);
          setLikeCount(data.likeCount);
          setLiked(data.liked);
        } else {
          console.error("Failed to fetch likes.");
        }
      } catch (error) {
        console.error("Failed to fetch likes.", error);
      }
    };
    if (userId) {
      fetchLikes();
    }
  }, [userId, post.id]);

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
          type="button"
          className="text-gray-500 hover:text-gray-700 flex items-center gap-2"
          onClick={handleLike}
        >
          <span className="text-xl text-brand-200">
            {liked ? (
              <Image
                src="/icons/flower-filled-pink.svg"
                alt="like"
                width={24}
                height={24}
              />
            ) : (
              <Image
                src="/icons/flower-filled-gray.svg"
                alt="like"
                width={24}
                height={24}
              />
            )}
          </span>
          {likeCount}
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
