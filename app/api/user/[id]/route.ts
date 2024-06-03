import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get("id");
    const username = formData.get("username");
    const profile = formData.get("profile");

    if (!id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const data = await db.user.update({
      where: { id: Number(id) },
      data: {
        username: String(username),
        profile: String(profile),
      },
    });

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("Error updating profile: ", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
