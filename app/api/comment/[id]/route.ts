import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const { content } = await request.json();
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();


    if (!id || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newComment = await db.comment.update({
      where: {
        id: parseInt(id)
      },
      data: {
        content: content,
      },
      select: {
        id: true,
        content: true
      }
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
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await db.comment.update({
      where: {
        id: parseInt(id),
      },
      data: {
        deletedAt: new Date(),
      },
      select: {
        id: true
      }
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error deleting comment: ", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
