"use server";
import bcrypt from "bcrypt";
import db from "@/lib/db";
import { z } from "zod";
import { redirect, useRouter } from "next/navigation";
import { getSession } from "@/lib/session";

const checkEmailExists = async (email: string) => {
  const user = await db.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });
  return Boolean(user);
};

// 로그인 폼 유효성 검사
const formSchema = z.object({
  email: z
    .string({
      required_error: "이메일을 입력해주세요.",
    })
    .email("@를 포함한 이메일 주소를 입력해주세요.")
    .toLowerCase()
    .refine(checkEmailExists, "이메일을 찾을 수 없습니다."),
  password: z.string({
    required_error: "비밀번호를 입력해주세요.",
  }),
});
export async function handleSignIn(prevState: any, formData: FormData) {
  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  // 폼 유효성 검사
  const result = await formSchema.spa(data);

  if (!result.success) {
    return result.error.flatten();
  } else {
    // 이메일 대조
    const user = await db.user.findUnique({
      where: {
        email: result.data.email,
      },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
      },
    });

    // 비밀번호 확인
    const ok = await bcrypt.compare(result.data.password, user!.password ?? "xxxx");

    if (ok) {
      const session = await getSession();
      session.id = user!.id;
      session.username = user!.username;
      if(user && user!.email) {
        session.email = user!.email;
      }
      session.isLoggedIn = true;
      await session.save();
      redirect("/")
    } else {
      return {
        fieldErrors: {
          password: ["비밀번호를 틀렸습니다."],
          email: [],
        },
      };
    }
  }
}
