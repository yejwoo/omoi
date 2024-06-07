import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const post = await db.post.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
      select: {
        id: true
      }
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error deleting post: ", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
