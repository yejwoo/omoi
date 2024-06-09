import ImageCarousel from "@/components/ImageCarousel";
import { getSession } from "@/lib/session";
import { useCallback, useEffect, useRef, useState } from "react";
import { tags1, tags2 } from "@/app/data/tags";
import { defaultSession } from "@/lib/sessionSetting";
import Image from "next/image";
import IPost from "@/app/interface/IPost";
import debounce from "@/lib/debounce";
import formatDate from "@/lib/formatDate";
import useUserProfile from "@/app/hooks/useUserProfile";
import formatText from "@/lib/formatText";
import { getTagName, getTagNames } from "@/lib/getTagNames";
import Comment from "@/components/Comment";

export default function Post({ post }: { post: IPost }) {
  // 유저 정보
  const [emailSession, setEmailSession] = useState(defaultSession);
  const [userId, setUserId] = useState(0);
  const { profileImage } = useUserProfile(userId || 0);

  // 좋아요
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // 버튼 클릭
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number>(0);
  const [openPostModalId, setOpenPostModalId] = useState<number>(0);

  const postRefs = useRef<(HTMLUListElement | null)[]>([]);

  useEffect(() => {
    const fetchSession = async () => {
      const emailSession = await getSession();
      if (emailSession && emailSession.id) {
        setUserId(emailSession.id || 0);
        setEmailSession(emailSession);
      }
    };

    fetchSession();
  }, []);

  // 좋아요 버튼 클릭시 추가 or 삭제
  const handleLike = useCallback(
    debounce(async () => {
      try {
        setLiked(!liked);
        setLikeCount((prevCount) => (liked ? prevCount - 1 : prevCount + 1));

        const response = await fetch(`/api/posts/${post.id}/likes/${userId}`, {
          method: liked ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
          throw new Error("Failed to update like.");
        }
      } catch (error) {
        console.error(error);
        setLiked(!liked);
        setLikeCount((prevCount) => (liked ? prevCount + 1 : prevCount - 1));
      }
    }, 300),
    [liked, userId, post.id]
  );

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const response = await fetch(`/api/posts/${post.id}/likes/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
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

  const handlePostModal = useCallback(
    (id: number) => {
      console.log(`handlePostModal called with id: ${id}`);
      setOpenPostModalId((prevId) => (prevId === id ? 0 : id));
      setShowPostModal((prevShow) =>
        prevShow && openPostModalId === id ? false : true
      );
    },
    [openPostModalId]
  );

  const handleEditPostId = (id: number) => {
    setEditingPostId((prevId) => (prevId === id ? 0 : id));
    setShowPostModal(!showPostModal);
  };

  const handleDeletePost = async (postId: number) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      try {
        const response = await fetch(`/api/posts/${postId}`, {
          method: "DELETE",
          body: JSON.stringify({
            id: postId,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete post.");
        }

        const result = await response.json();
        console.log("포스트 삭제: ", result.id);
      } catch (error) {
        console.error("Failed to delete post.", error);
      }
    }
  };

  return (
    <>
      <header className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex gap-2 items-center">
            {post.user.profile ? (
              <div className="relative w-10 h-10 rounded-full flex-shrink-0">
                <Image
                  src={post.user.profile}
                  fill
                  className="object-cover rounded-full"
                  alt="profile"
                />
              </div>
            ) : (
              <div className="inline-block w-10 h-10 bg-gray-300 rounded-full"></div>
            )}
            <span className="font-semibold">{post.user.username}</span>
          </div>
          <div className="relative">
            <button
              onClick={() => {
                handlePostModal(post.id);
              }}
            >
              <Image
                src="/icons/more.svg"
                alt="더보기"
                width={20}
                height={20}
              />
            </button>
            <ul
              className={`w-28 border border-gray-200 bg-white shadow-md rounded-md absolute z-10 right-0 ${
                showPostModal ? "" : "hidden"
              }`}
            >
              {post.userId == userId && (
                <>
                  <li
                    className="p-2 cursor-pointer w-full hover:bg-gray-100 hover:rounded-t-md flex text-gray-500"
                    onClick={() => handleEditPostId(post.id)}
                  >
                    <span className="flex-grow text-sm text-gray-500">수정</span>
                    <Image
                      src="/icons/edit.svg"
                      alt="편집"
                      width={16}
                      height={16}
                    />
                  </li>
                  <li
                    className="p-2 cursor-pointer w-full hover:bg-gray-100 hover:rounded-b-md flex text-gray-500"
                    onClick={() => handleDeletePost(post.id)}
                  >
                    <span className="flex-grow text-sm">삭제</span>
                    <Image
                      src="/icons/delete.svg"
                      alt="삭제"
                      width={16}
                      height={16}
                    />
                  </li>
                </>
              )}
              <li className="p-2 cursor-pointer w-full hover:bg-gray-100 hover:rounded-b-md flex text-gray-500">
                <span className="flex-grow text-sm">링크 복사</span>
                <Image
                  src="/icons/link.svg"
                  alt="url 복사"
                  className="text-gray-600"
                  width={16}
                  height={16}
                />
              </li>
            </ul>
          </div>
        </div>
        {/* 태그 */}
        {(post.tags1 || post.tags2) && (
          <div className="flex gap-1 mt-3">
            {post.tags1 && (
              <span
                key={`tag1-${post.id}`}
                className="py-1 px-2 rounded-full text-sm font-semibold cursor-pointer text-gray-500 bg-gray-100"
              >
                {getTagName(post.tags1)}
              </span>
            )}
            {post.tags2 &&
              getTagNames(post.tags2).map((tag: string, index: number) => (
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
      {/* 이미지 */}
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
        {/* 게시글 내용 */}
        <p className="mt-2 text-sm text-gray-700">{formatText(post.content)}</p>
        {/* 댓글 */}
        <Comment postId={post.id} userId={userId} emailSession={emailSession} />
      </div>
    </>
  );
}
