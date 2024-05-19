"use server";

import db from "@/lib/db";
import { redirect } from "next/navigation";
import { z } from "zod";

const postSchema = z.object({
  content: z.string().min(1, "내용을 작성해주세요."),
  region: z.string().min(1, "지역을 선택해주세요."),
  date1: z.string().optional(),
  date2: z.string().optional(),
  tag: z.string().optional(),
  userId: z.number().int(),
  image: z.string(),
});
type PostData = z.infer<typeof postSchema>;

export default async function createPost(prevState: any, formData: FormData) {
  // 폼 데이터 파싱
  const data = {
    content: formData.get("content"),
    region: formData.get("region"),
    date1: formData.get("date1"),
    date2: formData.get("date2"),
    tag: formData.get("tag"),
    userId: 1, // 수정 필요
    image: formData.get("files") || "", // 업로드된 파일 목록을 문자열로 저장
  };

  const result = await postSchema.spa(data);

  if (!result.success) {
    return result.error.flatten();
  } else {
    console.log("post: ", result);
    const postData: PostData = result.data;

    // DB에 데이터 저장
    try {
      await db.post.create({
        data: {
          content: postData.content,
          image: postData.image,
          region: postData.region,
          date1: postData.date1 ? new Date(postData.date1) : null,
          date2: postData.date2 ? new Date(postData.date2) : null,
          tag: postData.tag,
          userId: postData.userId,
        },
      });
    } catch (error) {
      console.error("Failed to save post to database: ", error);
    } finally {
      redirect("/signin");
    }
    
  }
}
