import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const postSchema = z.object({
  content: z.string().min(1, "내용을 작성해주세요."),
  region: z.string().min(1, "지역을 선택해주세요."),
  date: z.string().optional(),
  tags1: z.string().optional(),
  tags2: z.string().optional(),
  userId: z.number().int(),
  images: z.array(z.string()),
  postStatus: z.string().optional(),
});
type PostData = z.infer<typeof postSchema>;

const parseQueryParams = (req: NextRequest) => {
  const url = new URL(req.url);
  return {
    userId: url.searchParams.get("userId"),
    page: parseInt(url.searchParams.get("page") || "1", 10),
    limit: parseInt(url.searchParams.get("limit") || "3", 10),
  };
};

export async function GET(req: NextRequest) {
  const { userId, page, limit } = parseQueryParams(req);

  if (userId) {
    try {
      const posts = await db.post.findMany({
        include: {
          images: true,
          user: true,
          comments: {
            include: {
              replies: true,
            },
          },
        },
        where: {
          userId: Number(userId),
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const postsWithCommentCount = posts.map(post => {
        const validComments = post.comments.filter(comment => comment.deletedAt === null);
        const commentCount = validComments.reduce((count, comment) => {
          const validReplies = comment.replies.filter(reply => reply.deletedAt === null);
          return count + 1 + validReplies.length;
        }, 0);

        return {
          ...post,
          commentCount,
        };
      });

      return NextResponse.json({ posts: postsWithCommentCount });
    } catch (error) {
      console.error(`Failed to fetch posts for userId ${userId}:`, error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  } else {
    const skip = (page - 1) * limit;

    try {
      const posts = await db.post.findMany({
        include: {
          images: true,
          user: {
            select: {
              username: true,
              email: true,
              profile: true,
            },
          },
          comments: {
            include: {
              replies: true,
            },
          },
        },
        where: {
          postStatus: "public",
          deletedAt: null,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      });

      const postsWithCommentCount = posts.map(post => {
        const validComments = post.comments.filter(comment => comment.deletedAt === null);
        const commentCount = validComments.reduce((count, comment) => {
          const validReplies = comment.replies.filter(reply => reply.deletedAt === null);
          return count + 1 + validReplies.length;
        }, 0);

        return {
          ...post,
          commentCount,
        };
      });

      const totalPosts = await db.post.count({
        where: {
          postStatus: "public",
          deletedAt: null,
        },
      });
      const hasMore = totalPosts > page * limit;

      return NextResponse.json({ posts: postsWithCommentCount, hasMore });
    } catch (error) {
      console.error("Failed to fetch public posts:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.json();

    const data = {
      content: formData.content,
      region: formData.region,
      date: formData.date,
      tags1: formData.tags1,
      tags2: formData.tags2,
      userId: Number(formData.userId),
      images: JSON.parse(formData.files || "[]"), // This should be an array of image URLs
      postStatus: formData.postStatus,
    };

    const result = await postSchema.safeParseAsync(data);

    if (!result.success) {
      return NextResponse.json({ success: false, errors: result.error.flatten() }, { status: 400 });
    }

    const postData: PostData = result.data;

    await db.post.create({
      data: {
        content: postData.content,
        region: postData.region,
        date: postData.date,
        tags1: postData.tags1,
        tags2: postData.tags2,
        userId: postData.userId,
        postStatus: postData.postStatus,
        images: {
          create: postData.images.map((url: string) => ({ url })),
        },
      },
    });

    return NextResponse.json({ success: true, redirectUrl: "/" }, { status: 200 });
  } catch (error) {
    console.error("Failed to save post to database: ", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { postId } = await req.json();

    if (!postId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const post = await db.post.update({
      where: {
        id: postId,
      },
      data: {
        deletedAt: new Date(),
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error deleting post: ", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
