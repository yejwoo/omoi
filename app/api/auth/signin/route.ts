"use server";

import { NextRequest, NextResponse } from "next/server";
import { saveSession } from "@/lib/session";
import bcrypt from "bcrypt";
import db from "@/lib/db";
import { z } from "zod";

const checkEmailExists = async (email: string) => {
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return Boolean(user);
};

// 로그인 폼 유효성 검사
const formSchema = z.object({
  email: z
    .string({ required_error: "이메일을 입력해주세요." })
    .email("@를 포함한 이메일 주소를 입력해주세요.")
    .refine(checkEmailExists, "이메일을 찾을 수 없습니다."),
  password: z.string({ required_error: "비밀번호를 입력해주세요." }),
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    // 폼 유효성 검사
    const result = await formSchema.safeParseAsync(data);

    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.error.flatten() },
        { status: 400 }
      );
    }

    // 이메일 대조
    const user = await db.user.findUnique({
      where: { email: result.data.email },
      select: { id: true, username: true, email: true, password: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          fieldErrors: { email: ["이메일을 찾을 수 없습니다."], password: [] },
        },
        { status: 404 }
      );
    }

    // 비밀번호 확인
    const ok = await bcrypt.compare(
      result.data.password,
      user.password ?? "xxxx"
    );

    if (!ok) {
      return NextResponse.json(
        {
          success: false,
          fieldErrors: { password: ["비밀번호를 틀렸습니다."], email: [] },
        },
        { status: 401 }
      );
    }

    const sessionData = {
      id: user.id,
      email: user.email ?? "",
      username: user.username,
      isLoggedIn: true,
    };

    await saveSession(sessionData);

    const baseUrl = new URL(req.nextUrl.origin);
    baseUrl.pathname = "/";

    return NextResponse.json({
      success: true,
      redirectUrl: baseUrl.toString(),
    });
  } catch (error) {
    console.error("Unexpected error occurred:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
