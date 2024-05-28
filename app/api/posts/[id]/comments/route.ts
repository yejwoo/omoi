import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { content, postId, userId } = await request.json();

    if (!content || !postId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newComment = await db.comment.create({
      data: {
        content,
        postId: parseInt(postId, 10),
        userId: parseInt(userId, 10),
      },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment: ", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

export async function GET (request: Request) {
  try {
    const url = new URL(request.url);
    const postId = parseInt(url.pathname.split('/').slice(-2, -1)[0]);

    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid postId" }, { status: 400 });
    }

    const comments = await db.comment.findMany({
      where: {
        postId: postId,
      },
      select: {
        id: true,
        content: true,
        userId: true,
        postId: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    return NextResponse.json(comments, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch comment" },
      { status: 500 }
    );
  }
}