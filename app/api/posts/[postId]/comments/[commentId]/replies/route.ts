import db from "@/lib/db";
import { NextResponse } from "next/server";
interface Params {
  postId?: string;
  commentId?: string;
  replyId?: string;
}

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const { commentId } = params;

    if (!commentId) {
      return NextResponse.json(
        { error: "commentId is required" },
        { status: 400 }
      );
    }

    const replies = await db.replyComment.findMany({
      where: {
        commentId: parseInt(commentId),
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            profile: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json(replies, { status: 200 });
  } catch (error) {
    console.error("Error fetching replies: ", error);
    return NextResponse.json(
      { error: "Failed to fetch replies" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: { params: Params }) {
  try {
    const { commentId } = params;
    const { content, parentReplyId, userId } = await request.json();

    if (!commentId || !content || !userId) {
      return NextResponse.json(
        { error: "commentId, content, userId fields are required" },
        { status: 400 }
      );
    }

    const newReply = await db.replyComment.create({
      data: {
        content: content,
        commentId: parseInt(commentId),
        userId: parseInt(userId),
        parentReplyId: parentReplyId ? parseInt(parentReplyId) : null,
      },
      select: {
        id: true,
        content: true,
        userId: true,
        commentId: true,
        parentReplyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(newReply, { status: 201 });
  } catch (error) {
    console.error("Error creating reply: ", error);
    return NextResponse.json(
      { error: "Failed to create reply" },
      { status: 500 }
    );
  }
}


export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const { replyId } = params;
    const { content } = await request.json();

    if (!replyId || !content) {
      return NextResponse.json(
        { error: "replyId and content are required" },
        { status: 400 }
      );
    }

    const updatedReply = await db.replyComment.update({
      where: {
        id: parseInt(replyId),
      },
      data: {
        content: content,
      },
      select: {
        id: true,
        content: true,
      },
    });

    return NextResponse.json(updatedReply, { status: 200 });
  } catch (error) {
    console.error("Error updating reply: ", error);
    return NextResponse.json(
      { error: "Failed to update reply" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    const { replyId } = params;

    if (!replyId) {
      return NextResponse.json(
        { error: "replyId is required" },
        { status: 400 }
      );
    }

    const deletedReply = await db.replyComment.update({
      where: {
        id: parseInt(replyId),
      },
      data: {
        deletedAt: new Date(),
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json(deletedReply, { status: 200 });
  } catch (error) {
    console.error("Error deleting reply: ", error);
    return NextResponse.json(
      { error: "Failed to delete reply" },
      { status: 500 }
    );
  }
}
