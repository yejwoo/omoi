"use client";

import { ReactEventHandler, useEffect, useState } from "react";
import { FormEvent } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Link from "next/link";
import { useFormState } from "react-dom";
import { handleSignIn } from "./actions";
import { signIn, signOut, useSession } from "next-auth/react";
import { getSession, login, logout } from "@/lib/session";

export default function SignIn() {
  const [state, action] = useFormState(handleSignIn, null);
  const { data: session, status } = useSession();

  return (
    <div className="flex min-h-screen bg-gray-100 items-center justify-center px-4">
      <div className="w-full max-w-md p-8 space-y-3 rounded-xl bg-white shadow-lg">
        <div>
          <p className="text-gray-700 font-medium text-lg text-left">로그인</p>
        </div>
        <form className="space-y-6" action={action}>
          <Input
            name="email"
            type="email"
            label="이메일"
            placeholder="이메일을 입력하세요."
            errors={state?.fieldErrors.email}
          />
          <Input
            name="password"
            type="password"
            label="비밀번호"
            placeholder="비밀번호를 입력하세요."
            errors={state?.fieldErrors.password}
          />
          <Button content="로그인" type="primary" />
        </form>
        <Button
          content="네이버 로그인"
          type="secondary"
          onClick={() => {
            signIn("naver", { redirect: true, callbackUrl: "/" });
          }}
        />
        <div className="flex items-center">
          <Link href="/signup" className="text-sm text-gray-500 mr-4 hover:text-gray-700">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}
