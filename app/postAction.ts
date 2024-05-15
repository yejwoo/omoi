"use server";

import db from "@/lib/db";
import uploadFiles from "@/lib/UploadFiles";

export default async function createPost(prevState: any, formData: FormData) {
  // 폼 데이터 파싱
  const data = {
    content: formData.get("content"),
    region: formData.get("region"),
    date1: formData.get("date1"),
    date2: formData.get("date2"),
    tag: formData.get("tag"),
    userId: 1, // 수정 필요
    files: JSON.parse(formData.get("files") as string) || [], // 업로드된 파일 목록
  };

  console.log("data", data);

  // if (!data.content || !data.region || !data.date1 || !data.date2 || !data.tag || !data.userId) {
  //   throw new Error("Missing required fields");
  // }

  // try {
  //   // 파일 업로드
  //   const fileUploads = await uploadFiles(data.files);
  //   console.log(fileUploads);
  //   const imageUrl = fileUploads.length > 0 ? fileUploads[0] : ""; // 첫 번째 이미지 URL

  //   // 콘텐츠 저장
  //   const post = await db.post.create({
  //     data: {
  //       image: imageUrl,
  //       content: data.content as string,
  //       region: data.region as string,
  //       date1: new Date(data.date1 as string),
  //       date2: new Date(data.date2 as string),
  //       tag: data.tag as string,
  //       userId: 1, // 정수형 변환
  //     },
  //     select: {
  //       id: true,
  //     },
  //   });

  //   console.log("Post created", post);
  // } catch (error) {
  //   console.error("Error creating post:", error);
  //   throw new Error("Post creation failed");
  // }
}
