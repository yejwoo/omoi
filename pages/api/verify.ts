import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";
import jwt from "jsonwebtoken";

export default async function verify(req: NextApiRequest, res: NextApiResponse) {
  // url 쿼리스트링으로 token 받기
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    return res.status(400).json({ message: "Token is required" });
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
      return res.status(404).json({ message: "User not found" });
    }

    if (user.emailVerified) {
      res.redirect("/signin");
    }

    const currentTime = new Date();
    if (currentTime > user.emailTokenExpiration!) {
      return res.status(401).json({ message: "Token expired" });
    }

    const updateEmailVerified = await db.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });

    if (!updateEmailVerified) {
      return res.status(400).json({ message: "Failed to update email verification status" });
    }
  } catch (error) {
    console.error("Error during verification:", error);

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired", error: error });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({ message: "Invalid token", error: error });
    }
    return res.status(500).json({ message: "Verification failed", error: error });
  }
}
