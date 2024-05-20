import db from '@/lib/db';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const postId = Number(req.query.id);
    const { userId } = req.body;

    try {
      const like = await db.like.create({
        data: {
          userId,
          postId,
        },
      });
      res.status(200).json(like);
    } catch (error) {
      res.status(500).json({ error: 'Failed to like the post.' });
    }
  } else if (req.method === 'DELETE') {
    const postId = Number(req.query.id);
    const { userId } = req.body;

    try {
      await db.like.deleteMany({
        where: {
          userId,
          postId,
        },
      });
      res.status(200).json({ message: 'Successfully unliked the post.' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to unlike the post.' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
