import { useCallback, useEffect, useRef, useState } from "react";
import IComments from "@/app/interface/IComments";
import formatDate from "@/lib/formatDate";
import formatText from "@/lib/formatText";
import SendIcon from "@/public/icons/sendIcon";
import Image from "next/image";

interface CommentProps {
  postId: number;
  userId: number;
  sessionData: any;
}

interface IReplies {
  id: number;
  content: string;
  userId: number;
  commentId: number;
  createdAt: string;
  updatedAt: string;
  user: {
    username: string;
    profile: string;
  };
}

const Comment: React.FC<CommentProps> = ({
  postId,
  userId,
  sessionData,
  profileImage,
}) => {
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<IComments[]>([]);
  const [disableBtn, setDisableBtn] = useState(true);
  const [isReply, setIsReply] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [replyCommentId, setReplyCommentId] = useState<number | null>(null);
  const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
  const [parentReplyId, setParentReplyId] = useState<number | null>(null);
  const [replyValues, setReplyValues] = useState<Record<number, string>>({});
  const [openCommentModalId, setOpenCommentModalId] = useState<number | null>(
    null
  );
  const [openReplyModalId, setOpenReplyModalId] = useState<number>(0);
  const [commentValues, setCommentValues] = useState<Record<number, string>>(
    {}
  );
  const [formHeight, setFormHeight] = useState("auto"); 
  const [textareaHeight, setTextareaHeight] = useState("auto");


  const [replies, setReplies] = useState<Record<number, IReplies[]>>({});

  const commentRefs = useRef<(HTMLUListElement | null)[]>([]);
  const replyRefs = useRef<(HTMLUListElement | null)[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 댓글 모달 바깥 클릭시 모달 끄기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 댓글 모달 바깥 클릭 시 모달 끄기
      commentRefs.current.forEach((ref, index) => {
        if (ref && !ref.contains(event.target as Node)) {
          if (openCommentModalId === comments[index]?.id) {
            setOpenCommentModalId(0);
            setShowCommentModal(false);
          }
        }
      });

      // 답글 모달 바깥 클릭 시 모달 끄기
      replyRefs.current.forEach((ref, index) => {
        // `replies`가 배열의 배열 형태로 되어 있으므로 올바르게 참조하도록 수정
        if (ref && !ref.contains(event.target as Node)) {
          const currentReply = Object.values(replies).flat()[index];
          if (openReplyModalId === currentReply?.id) {
            setOpenReplyModalId(0);
          }
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [comments, replies, openCommentModalId, openReplyModalId]);

  const handleChangeComment = async (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setComment(value);

    if (textareaRef.current && formRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = `${textareaRef.current.scrollHeight}px`;
      textareaRef.current.style.height = newHeight;
      setTextareaHeight(newHeight); 
      setFormHeight(`calc(${newHeight} + 2rem)`);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [userId, postId]);

  // 댓글
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
      result.forEach((comment: IComments) => fetchReplies(comment.id));
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
        body: JSON.stringify({
          content,
          postId: postId.toString(),
          userId: userId.toString(),
          parentReplyId:
            isReply && parentReplyId !== replyCommentId ? parentReplyId : null,
          commentId: isReply ? replyCommentId : postId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to create comment.");
      }

      const result = await response.json();
      console.log("답글: ", result);
      setComment("")
      setFormHeight("auto"); 
      setTextareaHeight("auto"); 
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"; 
      }
      setIsReply(false);
      setReplyCommentId(null);
      setParentReplyId(null);
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

  // 답글
  const fetchReplies = async (commentId: number) => {
    try {
      const response = await fetch(
        `/api/posts/${postId}/comments/${commentId}/replies`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch replies.");
      }

      const result = await response.json();
      // console.log(`답글 for comment ${commentId}: `, result);
      setReplies((prevReplies) => ({ ...prevReplies, [commentId]: result }));
    } catch (error) {
      console.error("Failed to fetch replies.", error);
    }
  };

  const handleEditReplyChange = (replyId: number, value: string) => {
    setReplyValues({
      ...replyValues,
      [replyId]: value,
    });
  };

  const handleReplyComment = (
    replyCommentId: number,
    parentReplyId: number,
    username: string
  ) => {
    const newComment = `@${username} `;
    setIsReply(true);
    setComment(newComment);
    setReplyCommentId(replyCommentId);
    setParentReplyId(parentReplyId);
  };

  const handleReplyModal = (replyId: number) => {
    setOpenReplyModalId((prevId) => (prevId === replyId ? 0 : replyId));
  };

  const handleEditReplySubmit = async (e: React.FormEvent, replyId: number) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/replies/${replyId}`, {
        method: "PUT",
        body: JSON.stringify({
          content: replyValues[replyId],
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to edit reply.");
      }

      const result = await response.json();
      console.log("답글 수정: ", result);
      setEditingReplyId(0);
      await fetchComments();
    } catch (error) {
      console.error("Failed to edit reply.", error);
    }
  };

  const handleDeleteReply = async (replyId: number) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      try {
        const response = await fetch(`/api/replies/${replyId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete reply.");
        }

        const result = await response.json();
        console.log("답글 삭제: ", result.id);
        setEditingReplyId(0);
        await fetchComments();
      } catch (error) {
        console.error("Failed to delete reply.", error);
      }
    }
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
                    className="my-3 w-full h-24 focus:ring-2 focus:ring-gray-100 focus:border-transparent"
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
                    handleReplyComment(
                      comment.id,
                      comment.id,
                      comment.user.username
                    )
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
                    {comment.userId === sessionData.id && (
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
              {/* 답글 */}
              <div className="ml-6 mt-2">
                {replies[comment.id] &&
                  replies[comment.id].map((reply, replyIndex) => (
                    <div key={reply.id} className="flex flex-col gap-2 py-2">
                      <div className="flex flex-shrink-0 gap-2 items-center mb-1">
                        {reply.user.profile ? (
                          <div className="relative w-6 h-6 rounded-full flex-shrink-0">
                            <Image
                              src={reply.user.profile}
                              fill
                              className="object-cover rounded-full"
                              alt="profile"
                            />
                          </div>
                        ) : (
                          <div className="inline-block w-5 h-5 bg-slate-300 rounded-full"></div>
                        )}
                        <span className="font-semibold text-gray-700 flex-shrink-0 text-sm">
                          {reply.user.username}
                        </span>
                      </div>
                      {editingReplyId === reply.id ? (
                        <form
                          onSubmit={(e) => handleEditReplySubmit(e, reply.id)}
                        >
                          <textarea
                            defaultValue={reply.content}
                            onChange={(e) =>
                              handleEditReplyChange(reply.id, e.target.value)
                            }
                            className="p-1 w-full resize-y min-h-10"
                          />
                          <button
                            type="button"
                            className="bg-gray-200 text-gray-500 px-2 py-1 rounded-sm"
                            onClick={() => setEditingReplyId(0)}
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
                        <span className="text-gray-500 text-sm">
                          {formatText(reply.content)}
                        </span>
                      )}
                      {/* 대댓글 */}
                      <div className="flex gap-2">
                        <span className="text-xs text-gray-400">
                          {formatDate(reply.createdAt)}
                        </span>
                        <button
                          onClick={() =>
                            handleReplyComment(
                              reply.commentId,
                              reply.id,
                              reply.user.username
                            )
                          }
                        >
                          답글
                        </button>
                        {reply.userId === sessionData.id && (
                          <div className="relative h-5">
                            <button onClick={() => handleReplyModal(reply.id)}>
                              <Image
                                src="/icons/more.svg"
                                alt="더보기"
                                width={20}
                                height={20}
                              />
                            </button>
                            <ul
                              className={`w-20 border border-gray-200 bg-white shadow-md rounded-md absolute right-0 z-10 ${
                                openReplyModalId === reply.id
                                  ? "block"
                                  : "hidden"
                              } `}
                              ref={(el) => {
                                replyRefs.current[replyIndex] = el;
                              }}
                            >
                              <li
                                className="p-2 cursor-pointer w-full hover:bg-gray-100 hover:rounded-t-md flex text-gray-500"
                                onClick={() => setEditingReplyId(reply.id)}
                              >
                                <span className="flex-grow text-gray-500">
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
                                onClick={() => handleDeleteReply(reply.id)}
                              >
                                <span className="flex-grow text-gray-500">
                                  삭제
                                </span>
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
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">댓글이 없습니다.</p>
        )}
      </div>

      <form
        ref={formRef}
        className="border-gray-200 border-t p-3 bg-white flex gap-2 md:static fixed bottom-0 left-0 right-0"
        onSubmit={handleComment}
      >
        <div className="flex flex-grow items-baseline gap-2">
          <div className="relative w-6 h-6 rounded-full flex-shrink-0">
            <Image
              src={profileImage}
              fill
              className="object-cover rounded-full mt-2"
              alt="유저 프로필"
            />
          </div>
          <textarea
            id="content"
            name="content"
            ref={textareaRef}
            placeholder="댓글을 작성하세요."
            value={comment}
            onChange={handleChangeComment}
            className="flex-grow w-full text-sm focus:ring-2 focus:ring-gray-100 focus:border-transparent max-h-20"
            rows={1}
          />
        </div>
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
