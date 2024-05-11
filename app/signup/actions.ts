"use server";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import { z } from "zod";
import { createHash } from "crypto";
import { redirect } from "next/navigation";
import nodemailer from "nodemailer";

// 이메일 인증 토큰 생성
async function generateVerificationToken(userId: number) {
  const secret = process.env.JWT_SECRET!;
  const token = jwt.sign({ userId }, secret, { expiresIn: "1h" });
  return token;
}

// 유저에게 이메일 전송
async function sendVerificationEmail(email: string, verificationUrl: string) {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    host: process.env.EMAIL_SERVER,
    port: Number(process.env.EMAIL_PORT),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "[OMOI] 이메일 인증을 진행해주세요.",
    html: `이메일 인증을 위해 아래 URL을 클릭해주세요.:<br>
    <a href="${verificationUrl}">${verificationUrl}</a>`,
  };

  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

// 유저 폼 데이터 유효성 검사
const passwordRegex = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/);
const userSchema = z
  .object({
    username: z
      .string()
      .min(2, "2글자 이상 입력해주세요.")
      .max(20, "최대 20자까지 입력 가능합니다.")
      .trim()
      .toLowerCase(),
    email: z.string().email("이메일 형식이 아닙니다.").trim().toLowerCase(),
    password: z
      .string()
      .regex(passwordRegex, "비밀번호는 영문 대소문자, 특수문자를 포함해야 합니다.")
      .min(8, "8자 이상 입력해주세요.")
      .trim(),
  })
  .superRefine(async ({ username }, ctx) => {
    const user = await db.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
      },
    });
    if (user) {
      ctx.addIssue({
        code: "custom",
        message: "이미 사용중인 닉네임입니다.",
        path: ["username"],
        fatal: true,
      });
    }
  })
  .superRefine(async ({ email }, ctx) => {
    const user = await db.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });
    if (user) {
      ctx.addIssue({
        code: "custom",
        message: "이미 사용중인 이메일입니다.",
        path: ["email"],
        fatal: true,
      });
    }
  });

export default async function createAccount(prevState: any, formData: FormData) {
  // 폼 데이터 파싱
  const data = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const result = await userSchema.spa(data);

  if (!result.success) {
    return result.error.flatten();
  } else {
    console.log("user: ", result);

    // 이메일 중복 검사
    const userEmail = await db.user.findUnique({
      where: {
        email: result.data.email,
      },
      select: {
        id: true,
      },
    });

    if (userEmail) {
      throw new Error("이미 사용중인 이메일입니다.");
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(result.data.password, 12);

    // 유저 정보 저장
    const user = await db.user.create({
      data: {
        username: result.data.username,
        email: result.data.email,
        password: hashedPassword,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new Error("유저 정보 저장 실패");
    }

    // 이메일 인증 토큰 생성
    const token = await generateVerificationToken(user.id);

    console.log("Updating user with data:", {
      email: result.data.email,
      token: token,
      expiration: new Date(new Date().getTime() + 60 * 60 * 1000),
    });

    // 유저 로우에 이메일 토큰 저장
    const updateToken = await db.user.update({
      where: {
        email: result.data.email,
      },
      data: {
        emailToken: token,
        emailTokenExpiration: new Date(new Date().getTime() + 60 * 60 * 1000),
      },
      select: {
        id: true,
      },
    });

    if (!updateToken) {
      throw new Error("토큰 저장 실패");
    }

    await sendVerificationEmail(
      result.data.email,
      `${process.env.DEV_DOMAIN}/api/verify?token=${token}`
    );

    redirect("/signup/verify");
  }
}
