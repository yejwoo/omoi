import { useCallback, useEffect, useRef, useState } from "react";
import IComments from "@/app/interface/IComments";
import formatDate from "@/lib/formatDate";
import formatText from "@/lib/formatText";
import SendIcon from "@/public/icons/sendIcon";
import Image from "next/image";

interface CommentProps {
  postId: number;
  userId: number;
  emailSession: any;
}

const Comment: React.FC<CommentProps> = ({ postId, userId, emailSession }) => {
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<IComments[]>([]);
  const [disableBtn, setDisableBtn] = useState(true);
  const [isReply, setIsReply] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number>(0);
  const [replyCommentId, setReplyCommentId] = useState<number>(0);
  const [openCommentModalId, setOpenCommentModalId] = useState<number>(0);
  const [commentValues, setCommentValues] = useState<Record<number, string>>(
    {}
  );

  const commentRefs = useRef<(HTMLUListElement | null)[]>([]);

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

  const handleChangeComment = async (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setComment(value);
  };

  useEffect(() => {
    fetchComments();
  }, [userId, postId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
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

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);

    let content = formData.get("content") as string;
    if (isReply) {
      const match = content.match(/^@\S+\s+/);
      if (match) {
        content = content.substring(match[0].length);
      }
    }

    try {
      const url = isReply
        ? `/api/posts/${postId}/comments/${replyCommentId}/replies`
        : `/api/posts/${postId}/comments`;

      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ content }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to create comment.");
      }

      const result = await response.json();
      console.log("답글: ", result);
      setComment("");
      setIsReply(false);
      setReplyCommentId(0);
      await fetchComments();
    } catch (error) {
      console.error("Failed to create comment.", error);
    }
  };

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

  const handleReplyComment = (commentId: number, username: string) => {
    const newComment = `@${username} `;
    setIsReply(true);
    setReplyCommentId(commentId);
    setComment(newComment);
  };

  const handleCommentModal = useCallback(
    (id: number) => {
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

  useEffect(() => {
    setDisableBtn(comment.length === 0);
  }, [comment]);

  return (
    <>
      <div className="text-xs text-gray-400 mt-2">
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <div
              key={comment.id}
              className="border-b border-gray-100 py-3 flex flex-col gap-2"
            >
              {editingCommentId === comment.id ? (
                <form onSubmit={(e) => handleEditCommentSubmit(e, comment.id)}>
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
                  <span className="text-gray-500">
                    {formatText(comment.content)}
                  </span>
                </div>
              )}
              <div className="relative flex items-center gap-2">
                <span className="text-xs">{formatDate(comment.createdAt)}</span>
                <button
                  className="text-gray-600 cursor-pointer"
                  type="button"
                  onClick={() =>
                    handleReplyComment(comment.id, comment.user.username)
                  }
                >
                  답글
                </button>
                <div className="relative h-5">
                  <button onClick={() => handleCommentModal(comment.id)}>
                    <Image
                      src="/icons/more.svg"
                      alt="더보기"
                      width={20}
                      height={20}
                    />
                  </button>
                  <ul
                    className={`w-20 border border-gray-200 bg-white shadow-md rounded-md absolute right-0 z-10 ${
                      showCommentModal && openCommentModalId === comment.id
                        ? "block"
                        : "hidden"
                    } `}
                    ref={(el) => {
                      commentRefs.current[index] = el;
                    }}
                  >
                    {comment.userId === emailSession.id && (
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
                    )}
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
                  </ul>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">댓글이 없습니다.</p>
        )}
      </div>
      <form
        className="border-gray-200 py-3 flex max-h-20"
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
        <input type="hidden" name="postId" value={postId} />
        <input type="hidden" name="userId" value={userId} />
        <button
          id="submitBtn"
          type="submit"
          className={`font-semibold ${
            disableBtn ? "text-gray-300" : "text-brand-200"
          }`}
          disabled={disableBtn}
        >
          <SendIcon
            className={`transition-colors duration-200 ${
              disableBtn ? "text-gray-300" : "text-brand-200"
            }`}
          />
        </button>
      </form>
    </>
  );
};

export default Comment;
