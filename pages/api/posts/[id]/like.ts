import db from '@/lib/db';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const postId = Number(req.query.id);
  const userId = Number(req.query.userId);

  if (!postId || !userId) {
    return res.status(400).json({ message: 'Invalid request parameters' });
  }

  if (req.method === 'GET') {
    try {
      const like = await db.like.findFirst({
        where: {
          userId,
          postId,
        },
      });

      const likeCount = await db.like.count({
        where: { postId },
      });

     res.status(200).json({ liked: !!like, likeCount });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch like status.', error: error });
    }
  }
  else if (req.method === 'POST') {
    try {
      const like = await db.like.create({
        data: {
          userId,
          postId,
        },
      });
      res.status(200).json(like);
    } catch (error) {
      res.status(500).json({ message: 'Failed to like the post.', error: error });
    }
  } else if (req.method === 'DELETE') {
    try {
      await db.like.deleteMany({
        where: {
          userId,
          postId,
        },
      });
      res.status(200).json({ message: 'Successfully unliked the post.' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to unlike the post.', error: error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
