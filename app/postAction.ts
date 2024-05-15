"use server";

import db from "@/lib/db";

// @TODO 유효성 검사

export default async function createPost(prevState: any, formData: FormData) {
  // 폼 데이터 파싱
  const data = {
    content: formData.get("content"),
    region: formData.get("region"),
    date1: formData.get("date1"),
    date2: formData.get("date2"),
    tag: formData.get("tag"),
    userId: formData.get("userId"),
  };

  console.log(data);
  // 현재 유저 아이디 저장

  // 콘텐츠 저장
  try {
    const post = await db.post.create({
      data: {
        image: "",
        content: data.content as string,
        region: data.region as string,
        date1: new Date(data.date1 as string),
        date2: new Date(data.date2 as string),
        tag: data.tag as string,
        userId: 1,
      },
      select: {
        id: true,
      },
    });
    console.log('updated post', post);
    return post;
  } catch (error) {
    console.error("Error creating post:", error);
    throw new Error("Post creation failed");
  }
}
