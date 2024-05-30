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

export default function Post({ post }: { post: IPost }) {
  // 유저 정보
  const [emailSession, setEmailSession] = useState(defaultSession);
  const [userId, setUserId] = useState(0);

  // 좋아요
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // 댓글
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<IComments[]>([]);
  const [disableBtn, setDisableBtn] = useState(true);

  // 버튼 클릭
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [clickEditBtn, setClickEditBtn] = useState<boolean>(false);
  const [clickDeleteBtn, setClickDeleteBtn] = useState<boolean>(false);
  const [clickEditBtnCount, setClickEditBtnCount] = useState<number>(0);
  const [editingCommentId, setEditingCommentId] = useState<number>(0);
  const [openCommentModalId, setOpenCommentModalId] = useState<number>(0);
  const [commentValues, setCommentValues] = useState<Record<number, string>>(
    {}
  );
  const commentModalRef = useRef<HTMLUListElement>(null);

  useClickOutside(commentModalRef, () => setShowCommentModal(false));

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
          id: commentId,
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
      setEditingCommentId(0); // 수정 모드 종료
      await fetchComments(); // 댓글 목록 새로고침
    } catch (error) {
      console.error("Failed to edit comment.", error);
    }
  };

  const handleEditCommentId = (id: number) => {
    setEditingCommentId((prevId) => (prevId === id ? 0 : id));
    setClickEditBtn(true);
    setShowCommentModal(false);
  };

  // 댓글 삭제 DELETE
  const handleDeleteComment = async (commentId: number) => {
    handleEditCommentId(commentId);
    setClickDeleteBtn(true);
    if (confirm("정말 삭제하시겠습니까?")) {
      try {
        const response = await fetch(`/api/comment/${commentId}`, {
          method: "DELETE",
          body: JSON.stringify({
            id: commentId,
          }),
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

  const handleCommentModal = (id: number) => {
    setOpenCommentModalId((prevId) => (prevId === id ? 0 : id));
    setClickEditBtnCount((prevCount) => {
      const newCount = prevCount + 1;
      // console.log(newCount);
      // @TODO 모달 바깥 클릭시에도 count + 1
      if (newCount % 2 === 1) {
        setShowCommentModal(true);
      } else {
        setShowCommentModal(false);
      }
      return newCount;
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
        <div className="text-xs text-gray-400 mt-2">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="border-b border-gray-200 py-2 flex items-center gap-2"
              >
                {clickEditBtn && comment.id === editingCommentId ? (
                  <form
                    onSubmit={(e) => handleEditCommentSubmit(e, comment.id)}
                    className="flex flex-grow"
                  >
                    <input
                      type="text"
                      defaultValue={comment.content}
                      onChange={(e) =>
                        handleEditCommentChange(comment.id, e.target.value)
                      }
                      className="border p-1 flex-grow"
                    />
                    <button
                      type="submit"
                      className="bg-gray-200 text-gray-500 p-1 rounded-sm ml-2"
                    >
                      제출
                    </button>
                  </form>
                ) : (
                  <div>
                    {comment.content} | {comment.userId} |{" "}
                    {formatDate(comment.createdAt)}
                  </div>
                )}
                {comment.userId === emailSession.id && (
                  <div className="relative">
                    <button
                      onClick={() => {
                        handleCommentModal(comment.id);
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
                      className={`w-20 border border-gray-200 bg-white shadow-md rounded-md absolute z-10 ${
                        showCommentModal && openCommentModalId === comment.id ? "block" : "hidden"
                      } `}
                      ref={commentModalRef}
                    >
                      <li
                        className="p-2 cursor-pointer w-full hover:bg-gray-100 hover:rounded-t-md flex"
                        onClick={() => {
                          handleEditCommentId(comment.id);
                        }}
                      >
                        <span className="flex-grow">수정</span>
                        <Image
                          src="/icons/edit.svg"
                          alt="편집"
                          width={16}
                          height={16}
                        />
                      </li>
                      <li
                        className="p-2 cursor-pointer w-full hover:bg-gray-100 hover:rounded-b-md flex"
                        onClick={() => {
                          handleDeleteComment(comment.id);
                        }}
                      >
                        <span className="flex-grow">삭제</span>
                        <Image
                          src="/icons/delete.svg"
                          alt="삭제"
                          width={16}
                          height={16}
                        />
                      </li>
                    </ul>
                  </div>
                )}
                <button
                  type="button"
                  className="text-gray-500"
                  onClick={() => handleEditCommentId(comment.id)}
                >
                  {editingCommentId === comment.id && "취소"}
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-400">댓글이 없습니다.</p>
          )}
        </div>
      </div>
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
