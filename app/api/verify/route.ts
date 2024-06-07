import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import jwt from "jsonwebtoken";

const getQueryParams = (url: URL) => {
  const token = url.searchParams.get("token");
  return { token };
};

export async function GET(req: NextRequest) {
  const { token } = getQueryParams(new URL(req.url));

  if (!token || typeof token !== "string") {
    return NextResponse.json({ message: "Token is required" }, { status: 400 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
    const userId = decoded.userId;
    console.log("User ID from token:", userId);

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true, emailTokenExpiration: true },
    });

    console.log("Database query result:", user);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.redirect("/signin");
    }

    const currentTime = new Date();
    if (currentTime > user.emailTokenExpiration!) {
      return NextResponse.json({ message: "Token expired" }, { status: 401 });
    }

    const updateEmailVerified = await db.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });

    if (!updateEmailVerified) {
      return NextResponse.json({ message: "Failed to update email verification status" }, { status: 400 });
    }

    return NextResponse.json({ message: "Email verified successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error during verification:", error);

    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ message: "Token expired", error: error.message }, { status: 401 });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: "Invalid token", error: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Verification failed", error: error.message }, { status: 500 });
  }
}
