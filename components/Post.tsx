import ImageCarousel from "@/components/ImageCarousel";
import { getSession } from "@/lib/session";
import { useCallback, useEffect, useRef, useState } from "react";
import { tags1, tags2 } from "@/app/data/tags";
import { defaultSession } from "@/lib/sessionSetting";
import Image from "next/image";
import IPost from "@/app/interface/IPost";
import IComments from "@/app/interface/IComments";
import debounce from "@/lib/debounce";
import formatDate from "@/lib/formatDate";
import useClickOutside from "@/app/hooks/useClickOutside";
import useUserProfile from "@/app/hooks/useUserProfile";
import formatText from "@/lib/formatText";
import { getTagName, getTagNames } from "@/lib/getTagNames";


export default function Post({ post }: { post: IPost }) {
  // 유저 정보
  const [emailSession, setEmailSession] = useState(defaultSession);
  const [userId, setUserId] = useState(0);
  const { profileImage } = useUserProfile(userId || 0);

  // 좋아요
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // 댓글
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<IComments[]>([]);
  const [disableBtn, setDisableBtn] = useState(true);

  // 버튼 클릭
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number>(0);
  const [replyCommentId, setReplyCommentId] = useState<number>(0);
  const [openCommentModalId, setOpenCommentModalId] = useState<number>(0);
  const [editingPostId, setEditingPostId] = useState<number>(0);
  const [openPostModalId, setOpenPostModalId] = useState<number>(0);
  const [commentValues, setCommentValues] = useState<Record<number, string>>(
    {}
  );

  const commentRefs = useRef<(HTMLUListElement | null)[]>([]);
  const postRefs = useRef<(HTMLUListElement | null)[]>([]);

  // 댓글 모달 바깥 클릭시 모달 끄기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      commentRefs.current.forEach((ref, index) => {
        if (ref && !ref.contains(event.target as Node)) {
          if (openCommentModalId === comments[index]?.id) {
            setOpenCommentModalId(0);
            setShowCommentModal(false);
          }
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [comments, openCommentModalId]);


  // 댓글 실시간 작성 감지
  const handleChangeComment = async (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setComment(value);
  };

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
        // Optimistic UI 업데이트
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
        const response = await fetch(`/api/posts/${post.id}/likes/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

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
      fetchComments();
    }
  }, [userId, post.id]);

  // 댓글 생성 POST
  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);

    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData)),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to create comment.");
      }

      const result = await response.json();
      console.log("댓글: ", result);
      setComment("");
      await fetchComments();
    } catch (error) {
      console.error("Failed to create comment.", error);
    }
  };

  // 댓글 실시간 작성 감지
  const handleChangeComment = async (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setComment(e.target.value);
    setDisableBtn(true);
    if (e.target.value.length > 0) {
      setDisableBtn(false);
    }
  };

  // 댓글 조회 GET
  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch comment.");
      }

      const result = await response.json();
      console.log("댓글: ", result);
      setComments(result);
    } catch (error) {
      console.error("Failed to fetch comment.", error);
    }
  };

  // 댓글 수정 PUT
  const handleEditCommentChange = (commentId: number, value: string) => {
    setCommentValues({
      ...commentValues,
      [commentId]: value,
    });
  };

  const handleEditCommentSubmit = async (
    e: React.FormEvent,
    commentId: number
  ) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/comment/${commentId}`, {
        method: "PUT",
        body: JSON.stringify({
          content: commentValues[commentId],
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to edit comment.");
      }

      const result = await response.json();
      console.log("댓글 수정: ", result);
      setEditingCommentId(0);
      await fetchComments();
    } catch (error) {
      console.error("Failed to edit comment.", error);
    }
  };

  // 댓글 삭제 DELETE
  const handleDeleteComment = async (commentId: number) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      try {
        const response = await fetch(`/api/comment/${commentId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete comment.");
        }

        const result = await response.json();
        console.log("댓글 삭제: ", result.id);
        setEditingCommentId(0);
        await fetchComments();
      } catch (error) {
        console.error("Failed to delete comment.", error);
      }
    }
  };

  // 코멘트 모달
  const handleCommentModal = useCallback(
    (id: number) => {
      // console.log(`handleCommentModal called with id: ${id}`);
      setOpenCommentModalId((prevId) => (prevId === id ? 0 : id));
      setShowCommentModal((prevShow) =>
        prevShow && openCommentModalId === id ? false : true
      );
    },
    [openCommentModalId]
  );

  const handleEditCommentId = (id: number) => {
    setEditingCommentId((prevId) => (prevId === id ? 0 : id));
    setShowCommentModal(!showCommentModal);
  };

  // 포스트 모달
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

  // 포스트 삭제 DELETE
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

  const handleReplyComment = (commentId: number) => {
    console.log("답글을 달 댓글의 아이디", commentId);
  };

  return (
    <>
      <header className="p-5">
        <div className="flex items-center justify-between">
          {/* 프로필 & 닉네임 */}
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
          {/* 포스트 모달 (수정, 삭제, 링크 공유 등) */}
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
              // ref={(el) => {
              //   postRefs.current[index] = el;
              // }}
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
                // @TODO: 링크 복사 클릭 이벤트 추가
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
      {/* 좋아요 */}
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
        {/* 내용 */}
        <p className="mt-2 text-sm text-gray-700">{formatText(post.content)}</p>
        {/* 댓글 */}
        <div className="text-xs text-gray-400 mt-2">
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <div
                key={comment.id}
                className="border-b border-gray-100 py-3 flex flex-col gap-2"
              >
                {/* 댓글 수정 폼 */}
                {editingCommentId === comment.id ? (
                  <form
                    onSubmit={(e) => handleEditCommentSubmit(e, comment.id)}
                  >
                    <textarea
                      defaultValue={comment.content}
                      onChange={(e) =>
                        handleEditCommentChange(comment.id, e.target.value)
                      }
                      className="p-1 w-full resize-y min-h-10"
                    />
                    <button
                      type="button"
                      className="bg-gray-200 text-gray-500 px-2 py-1 rounded-sm"
                      onClick={() => handleEditCommentId(0)}
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="bg-brand-100 text-white px-2 py-1 rounded-sm ml-2"
                    >
                      제출
                    </button>
                  </form>
                ) : (
                  <div className="text-sm">
                    {/* 유저 프로필 */}
                    <div className="flex flex-shrink-0 gap-2 items-center mb-3">
                      {comment.user.profile ? (
                        <div className="relative w-6 h-6 rounded-full flex-shrink-0">
                          <Image
                            src={comment.user.profile}
                            fill
                            className="object-cover rounded-full"
                            alt="profile"
                          />
                        </div>
                      ) : (
                        <div className="inline-block w-6 h-6 bg-slate-300 rounded-full"></div>
                      )}
                      <span className="font-semibold text-gray-700 flex-shrink-0">
                        {comment.user.username}
                      </span>
                    </div>
                    {/* 댓글 내용 */}
                    <span className="text-gray-500">{formatText(comment.content)}</span>
                  </div>
                )}
                {/* 날짜 & 더보기 모달 */}
                <div className="relative flex items-center gap-2">
                  <span className="text-xs">
                    {formatDate(comment.createdAt)}
                  </span>
                  <button
                    onClick={() => handleCommentModal(comment.id)}
                  >
                    <Image
                      src="/icons/more.svg"
                      alt="더보기"
                      width={20}
                      height={20}
                    />
                  </button>
                  <ul
                    className={`w-20 border border-gray-200 bg-white shadow-md rounded-md absolute left-16 top-6 z-10 ${
                      showCommentModal && openCommentModalId === comment.id
                        ? "block"
                        : "hidden"
                    } `}
                    ref={(el) => {
                      commentRefs.current[index] = el;
                    }}
                  >
                    {/* 본인 댓글 수정 & 삭제 */}
                    {comment.userId === emailSession.id ? (
                      <>
                        <li
                          className="p-2 cursor-pointer w-full hover:bg-gray-100 hover:rounded-t-md flex text-gray-500"
                          onClick={() => handleEditCommentId(comment.id)}
                        >
                          <span className="flex-grow text-gray-500">수정</span>
                          <Image
                            src="/icons/edit.svg"
                            alt="편집"
                            width={16}
                            height={16}
                          />
                        </li>
                        <li
                          className="p-2 cursor-pointer w-full hover:bg-gray-100 hover:rounded-b-md flex text-gray-500"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <span className="flex-grow text-gray-500">삭제</span>
                          <Image
                            src="/icons/delete.svg"
                            alt="삭제"
                            width={16}
                            height={16}
                          />
                        </li>
                      </>
                    ) : (
                      <li
                        className="p-2 cursor-pointer w-full hover:bg-gray-100 hover:rounded-t-md flex"
                        onClick={() => handleReplyComment(comment.id)}
                      >
                        <span className="flex-grow">답글</span>
                        <Image
                          src="/icons/reply.svg"
                          alt="답글"
                          width={16}
                          height={16}
                        />
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400">댓글이 없습니다.</p>
          )}
        </div>
      </div>
      {/* 댓글 작성 폼 */}
      <form
        className="border-t border-gray-200 p-3 flex max-h-20"
        onSubmit={handleComment}
      >
        <textarea
          id="content"
          name="content"
          placeholder="댓글을 작성하세요."
          value={comment}
          onChange={handleChangeComment}
          className="flex flex-grow text-sm max-h-20"
        />
        <input type="hidden" name="postId" value={post.id} />
        <input type="hidden" name="userId" value={userId} />
        <button
          id="submitBtn"
          type="submit"
          className="disabled:text-gray-300 text-brand-200 font-semibold"
          disabled={disableBtn}
        >
          Post
        </button>
      </form>
    </>
  );
}
