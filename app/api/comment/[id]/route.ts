import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const { id, content } = await request.json();

    if (!id || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newComment = await db.comment.update({
      where: {
        id,
      },
      data: {
        content: content,
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

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newComment = await db.comment.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("Error deleting comment: ", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
