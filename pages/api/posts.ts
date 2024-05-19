import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';
import { z } from 'zod';

const postSchema = z.object({
  content: z.string().min(1, "내용을 작성해주세요."),
  region: z.string().min(1, "지역을 선택해주세요."),
  date1: z.string().optional(),
  date2: z.string().optional(),
  tags1: z.string().optional(),
  tags2: z.string().optional(),
  userId: z.number().int(),
  images: z.array(z.string()), 
  postStatus: z.string().optional()
});
type PostData = z.infer<typeof postSchema>;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 포스트 생성
  if (req.method === 'POST') {
    // Handle POST request
    const formData = req.body;

    const data = {
      content: formData.content,
      region: formData.region,
      date1: formData.date1,
      date2: formData.date2,
      tags1: formData.tags1,
      tags2: formData.tags2,
      // userId: Number(formData.userId), // Convert userId to a number
      userId: 1,
      images: JSON.parse(formData.files || "[]"), // This should be an array of image URLs
      postStatus: formData.postStatus
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
            region: postData.region,
            date1: postData.date1 ? new Date(postData.date1) : null,
            date2: postData.date2 ? new Date(postData.date2) : null,
            tags1: postData.tags1,
            tags2: postData.tags2,
            userId: postData.userId,
            postStatus: postData.postStatus,
            images: {
              create: postData.images.map((url: string) => ({ url })),
            },
          },
        });

        return res.status(200).json({ success: true, redirectUrl: "/" });
      } catch (error) {
        console.error("Failed to save post to database: ", error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
      }
    }
  }
  // 포스트 조회
  else if (req.method === 'GET') {
    try {
      const posts = await db.post.findMany({
        include: {
          images: true,
          user: true,
          comments: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return res.status(200).json(posts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
