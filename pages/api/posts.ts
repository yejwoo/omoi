// pages/api/createPost.ts
import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';
import { z } from 'zod';

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const formData = req.body;

  const data = {
    content: formData.content,
    region: formData.region,
    date1: formData.date1,
    date2: formData.date2,
    tag: formData.tag,
    userId: 1, // 수정 필요
    // userId: Number(formData.userId), // userId를 숫자로 변환
    image: formData.files || "", // 업로드된 파일 목록을 문자열로 저장
  };

  const result = await postSchema.safeParseAsync(data);

  if (!result.success) {
    return res.status(400).json({ success: false, errors: result.error.flatten() });
  } else {
    const postData: PostData = result.data;

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

      return res.status(200).json({ success: true, redirectUrl: "/" });
    } catch (error) {
      console.error("Failed to save post to database: ", error);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
}
