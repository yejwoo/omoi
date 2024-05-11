"use client";

import Image from "next/image";
import logo from "../public/logo/logo_title.svg";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { getSession, logout } from "@/lib/session";
import { defaultSession } from "@/lib/sessionSetting";
import { redirect, useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [emailSession, setEmailSession] = useState(defaultSession);
  const [showDropDown, setShowDropDown] = useState(false);
  const toggleDropDown = () => setShowDropDown(!showDropDown);
  const dropDownRef = useRef<HTMLDivElement>(null);
  const username = session ? session.user?.name : emailSession.username;

  // 드롭다운 바깥 클릭시 안 보이기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropDownRef.current && !dropDownRef.current.contains(event.target as Node)) {
        setShowDropDown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropDownRef]);

  // 이메일 세션 저장
  useEffect(() => {
    const fetchSession = async () => {
      const emailSession = await getSession();
      setEmailSession(emailSession);
    };

    fetchSession();
  }, []);

  // 로그아웃 함수
  const handleLogout = async () => {
    // 네이버
    if (session) {
      await signOut();
    }
    // 이메일
    else if (emailSession) {
      await logout();
      await setEmailSession(defaultSession); 
    }
    router.refresh();
  };

  useEffect(() => {
    console.log("emailSession:", emailSession); // 비동기로 가져온 데이터 로깅
  }, [emailSession]);

  return (
    <header className="z-[99]  bg-white dark:bg-gray-800 w-full  shadow fixed top-0">
      <nav className="max-w-3xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center gap-4">
          <div className="flex gap-8">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <Image src={logo} width={72} height={72} alt="omoi logo" />
              </Link>
            </div>
            <ul className="flex gap-2">
              <li>
                <Link className="block px-2 py-4" href="/">
                  피드
                </Link>
              </li>
            </ul>
          </div>
          <div>
            {!username && (
              <Link className="block px-2 py-4" href="/signin">
                로그인
              </Link>
            )}
            {username && (
              <div className="relative" ref={dropDownRef}>
                <div className="flex items-center gap-2 px-2 py-4 cursor-pointer" onClick={toggleDropDown}>
                  {/* <Image className="" src={logo} width={72} height={72} alt="omoi logo" /> */}
                  <div className="w-8 h-8 bg-slate-300 rounded-full"></div>
                  {username} 님
                </div>
                {showDropDown && (
                  <ul className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 cursor-pointer">
                    <li className="text-gray-700 text-sm hover:bg-gray-100">
                      <Link className="block px-4 py-2" href="/profile">
                        프로필 수정
                      </Link>
                    </li>
                    <li className="text-gray-700 text-sm hover:bg-gray-100" onClick={handleLogout}>
                      <Link className="block px-4 py-2" href="/">
                        로그아웃
                      </Link>
                    </li>
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
