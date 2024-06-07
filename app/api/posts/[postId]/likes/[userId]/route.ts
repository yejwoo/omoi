import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Helper function to extract parameters from the URL
const getPathParams = (url: URL) => {
  const postId = Number(url.pathname.split('/')[3]);
  const userId = Number(url.pathname.split('/')[5]);
  return { postId, userId };
};

export async function GET(req: NextRequest) {
  const { postId, userId } = getPathParams(new URL(req.url));

  if (!postId || !userId) {
    return NextResponse.json({ message: "Invalid request parameters" }, { status: 400 });
  }

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

    return NextResponse.json({ liked: !!like, likeCount }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch like status.", error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { postId, userId } = getPathParams(new URL(req.url));

  if (!postId || !userId) {
    return NextResponse.json({ message: "Invalid request parameters" }, { status: 400 });
  }

  try {
    const like = await db.like.create({
      data: {
        userId,
        postId,
      },
    });
    return NextResponse.json(like, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to like the post.", error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { postId, userId } = getPathParams(new URL(req.url));

  if (!postId || !userId) {
    return NextResponse.json({ message: "Invalid request parameters" }, { status: 400 });
  }

  try {
    await db.like.deleteMany({
      where: {
        userId,
        postId,
      },
    });
    return NextResponse.json({ message: "Successfully unliked the post." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to unlike the post.", error: error.message }, { status: 500 });
  }
}
