"use client";

import Button from "@/components/Button";
import Link from "next/link";
import { FormEvent, useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Input from "@/components/Input";
import createAccount from "./actions";

export default function SignUp() {
  const [state, action] = useFormState(createAccount, null);

  return (
    <div className="flex min-h-screen bg-gray-100 items-center justify-center px-4">
      <div className="w-full max-w-md p-8 space-y-3 rounded-xl bg-white shadow-lg">
        <div>
          <p className="text-gray-700 font-medium text-lg text-left">회원가입</p>
          <form action={action} noValidate>
            <Input
              type="text"
              name="username"
              label="닉네임"
              placeholder="닉네임을 입력하세요."
              errors={state?.fieldErrors.username}
              required={true}
            />
            <Input
              type="email"
              name="email"
              label="이메일"
              placeholder="이메일을 입력하세요."
              errors={state?.fieldErrors.email}
              required={true}
            />
            <Input
              type="password"
              name="password"
              label="비밀번호"
              placeholder="영문 대소문자, 특수문자 포함 8자 이상 입력하세요."
              errors={state?.fieldErrors.password}
              required={true}
            />
            <Button content="회원가입" type="primary" />
          </form>
          <div className="flex text-sm text-gray-500">
            <span className="mr-1">이미 회원이신가요?</span>
            <Link href="/signin" className="font-semibold">
              로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
