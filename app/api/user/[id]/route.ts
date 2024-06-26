import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const pathnameParts = url.pathname.split("/");    
    const id = parseInt(pathnameParts[pathnameParts.length - 1]);

    if (!id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const data = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        profile: true,
        bio: true
      },
    });

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("Error getting profile: ", error);
    return NextResponse.json(
      { error: "Failed to getting profile" },
      { status: 500 }
    );
  }
}
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const url = new URL(request.url);
    const pathnameParts = url.pathname.split("/");    
    const id = parseInt(pathnameParts[pathnameParts.length - 1]);
    const username = formData.get("username");
    const profile = formData.get("profile");
    const bio = formData.get("bio"); 

    if (!id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 기존 유저 데이터를 가져옴
    const existingUser = await db.user.findUnique({
      where: { id },
      select: {
        profile: true,
        bio: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const updatedProfile = profile || existingUser.profile;
    const updatedBio = bio || existingUser.bio;

    const data = await db.user.update({
      where: { id },
      data: {
        username: String(username),
        profile: String(updatedProfile),
        bio: String(updatedBio),
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