import ImageCarousel from "@/components/ImageCarousel";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import IPost from "@/app/interface/IPost";
import debounce from "@/lib/debounce";
import formatDate from "@/lib/formatDate";
import useUserProfile from "@/app/hooks/useUserProfile";
import formatText from "@/lib/formatText";
import { getTagName, getTagNames } from "@/lib/getTagNames";
import Comment from "@/components/Comment";
import { animated, useSpring } from "@react-spring/web";
import Modal from "./Modal";
import { fetchSession } from "@/lib/api";
import { useQuery } from "react-query";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function Post({
  post,
  fetchPosts,
}: {
  post: IPost;
  fetchPosts: (page: number, initialLoad?: boolean) => void;
}) {
  // 유저 정보
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const uid = searchParams.get("uid");

  const { data: sessionData } = useQuery("session", fetchSession);
  const [userId, setUserId] = useState(0);
  const {
    data: userProfile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useUserProfile(sessionData?.id || 0);
  const profileImage = userProfile?.profile;

  // 좋아요
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [animate, setAnimate] = useState(false);

  // 댓글
  const [commentCount, setCommentCount] = useState(0);

  // 버튼 클릭
  const [showModal, setShowModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number>(0);
  const [openPostModalId, setOpenPostModalId] = useState<number>(0);
  const postModalRefs = useRef<HTMLUListElement | null>(null);
  const postRefs = useRef<(HTMLUListElement | null)[]>([]);

  // 유저 아이디 세팅
  useEffect(() => {
    if (sessionData) {
      setUserId(sessionData.id);
    }
  }, [sessionData]);

  useEffect(() => {
    if (uid && uid === post.uid) {
      setShowModal(true);
    }
  }, [uid, post.uid]);

  const handleCopyLink = useCallback(() => {
    const postUrl = `${window.location.origin}/?uid=${post.uid}`;
    navigator.clipboard
      .writeText(postUrl)
      .then(() => {
        alert("링크가 클립보드에 복사되었습니다.");
        setShowPostModal(false); // 모달 닫기
      })
      .catch((err) => {
        console.error("링크 복사 실패:", err);
      });
  }, [post.uid]);

  // 좋아요 버튼 클릭시 추가 or 삭제
  const handleLike = useCallback(
    debounce(async () => {
      try {
        // Optimistic UI 업데이트
        setLiked(!liked);
        setLikeCount((prevCount) => (liked ? prevCount - 1 : prevCount + 1));
        setAnimate(true);
        setTimeout(() => setAnimate(false), 300);

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
        // Optimistic UI 롤백
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
      // console.log(`handlePostModal called with id: ${id}`);
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
        const response = await fetch(`/api/posts?postId=${postId}`, {
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
        setShowPostModal(false); // 모달 닫기
        fetchPosts(1, true); // 포스트 새로고침
      } catch (error) {
        console.error("Failed to delete post.", error);
      }
    }
  };

  const likeAnimation = useSpring({
    transform: animate ? "scale(1.2)" : "scale(1)",
  });

  // 모달 열기/닫기 함수 추가
  const openCommentModal = () => {
    router.push(`${pathname}?uid=${post.uid}`);
    setShowModal(true);
  };

  const closeCommentModal = () => {
    router.push(pathname);
    setShowModal(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        postModalRefs.current &&
        !postModalRefs.current.contains(event.target as Node)
      ) {
        setShowPostModal(false); // 모달 닫기
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="py-5">
        <div className="flex items-center justify-between">
          <div className="flex gap-2 items-center">
            {post.user.profile ? (
              <div className="relative w-10 h-10 rounded-full flex-shrink-0">
                <Link href={`/${post.user.username}`}>
                  <Image
                    src={post.user.profile}
                    fill
                    className="object-cover rounded-full"
                    alt="profile"
                  />
                </Link>
              </div>
            ) : (
              <div className="inline-block w-10 h-10 bg-gray-300 rounded-full"></div>
            )}
            <Link href={`/${post.user.username}`} className="font-semibold">{post.user.username}</Link>
            <span className="text-sm text-gray-500">
              {formatDate(post.date)}
            </span>
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
              ref={postModalRefs}
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
                    <span className="flex-grow text-sm text-gray-500">
                      수정
                    </span>
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
              <li
                className="p-2 cursor-pointer w-full hover:bg-gray-100 hover:rounded-b-md flex text-gray-500"
                onClick={() => {
                  handleCopyLink();
                }}
              >
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
      {/* 게시글 내용 */}
      <p className="py-6 border-b text-sm text-gray-700">
        {formatText(post.content)}
      </p>
      <div className="py-4">
        {/* 좋아요, 댓글 버튼 */}
        <div className="flex gap-4">
          <button
            type="button"
            className="text-gray-500 flex items-center gap-2"
            onClick={handleLike}
          >
            <animated.span
              style={likeAnimation}
              className="text-xl text-brand-200"
            >
              {liked ? (
                <Image
                  src="/icons/flower-filled-pink.svg"
                  alt="좋아요"
                  width={24}
                  height={24}
                />
              ) : (
                <Image
                  src="/icons/flower-filled-gray.svg"
                  alt="좋아요"
                  width={24}
                  height={24}
                />
              )}
            </animated.span>
            <span className="text-sm">{likeCount}</span>
          </button>
          <button
            type="button"
            className="text-gray-500 flex items-center gap-2"
            onClick={openCommentModal}
          >
            <Image
              src="/icons/talk-bubble.svg"
              alt="댓글"
              width={24}
              height={24}
            />
            <span className="text-sm">{post.commentCount}</span>
          </button>
        </div>
      </div>
      <Modal isOpen={showModal} onClose={closeCommentModal}>
        <div className="flex flex-col md:flex-row overflow-hidden h-full md:h-auto">
          <div className="w-full md:w-1/2">
            <ImageCarousel images={post.images} />
            <p className="border-b py-4 text-sm text-gray-700 md:hidden md:pb-4">
              {formatText(post.content)}
            </p>
          </div>
          <div className="w-full md:w-1/2 md:p-4 overflow-y-auto h-full md:h-auto no-scrollbar pb-12">
            <p className="border-b pb-4 text-sm text-gray-700 hidden md:block">
              {formatText(post.content)}
            </p>
            <Comment
              postId={post.id}
              userId={userId}
              sessionData={sessionData}
              profileImage={profileImage}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
