"use client";

import Image from "next/image";
import logo from "../public/logo/logo_title.svg";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { getSession, logout } from "@/lib/session";
import { defaultSession } from "@/lib/sessionSetting";
import WriteModal from "@/components/WriteModal";
import useClickOutside from "@/app/hooks/useClickOutside";

const Header = () => {
  const { data: session } = useSession();
  const [emailSession, setEmailSession] = useState(defaultSession);
  const [showDropDown, setShowDropDown] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const toggleDropDown = () => setShowDropDown(!showDropDown);
  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  const dropDownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const username = session ? session.user?.name : emailSession.username;

  useClickOutside(dropDownRef, () => setShowDropDown(false));
  useClickOutside(modalRef, () => setModalOpen(false));

  const handleSubmit = () => {
    handleCloseModal();
  }

  // 이메일 세션 저장
  useEffect(() => {
    const fetchSession = async () => {
      if (!emailSession.isLoggedIn) {
        // 로그인 상태가 아니면 새로운 세션 정보를 요청
        const emailSession = await getSession();
        setEmailSession(emailSession);
      }
    };

    fetchSession();
  }, [emailSession.isLoggedIn]);

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
  };

  return (
    <header className="z-[99] bg-white dark:bg-gray-800 w-full shadow fixed top-0">
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
                  <Image src="/icons/home.svg" width={24} height={24} alt="home" />
                </Link>
              </li>
            </ul>
          </div>
          <div>
            {!username && (
              <div className="flex gap-4 items-center text-sm">
                <Link className="block px-2 py-4" href="/signin">
                  로그인
                </Link>
                <Link
                  className="block px-4 py-2 bg-brand-100 text-white text-sm rounded-full hover:bg-brand-200"
                  href="/signup"
                >
                  회원가입
                </Link>
              </div>
            )}
            {username && (
              <div className="relative" ref={dropDownRef}>
                <div className="flex items-center gap-2">
                  <button
                    className="inline-block px-4 py-2 bg-brand-100 text-white text-sm rounded-full hover:bg-brand-200"
                    onClick={handleOpenModal}
                  >
                    글쓰기
                  </button>
                  <div
                    className="flex items-center gap-2 px-2 py-4 cursor-pointer text-sm"
                    onClick={toggleDropDown}
                  >
                    <div className="inline-block w-8 h-8 bg-slate-300 rounded-full"></div>
                  </div>
                </div>
                {showDropDown && (
                  <ul className="origin-top-right absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 cursor-pointer">
                    <li className="text-gray-700 text-base rounded-t-md">
                      <Link className="block px-4 py-2" href="/my-omoi">
                        <span className="font-bold">{username}</span> 님
                      </Link>
                    </li>
                    <li className="text-gray-700 text-sm hover:bg-gray-100">
                      <Link className="block px-4 py-2" href="/my-omoi">
                        내 피드
                      </Link>
                    </li>
                    <li className="text-gray-700 text-sm hover:bg-gray-100">
                      <Link className="block px-4 py-2" href="/profile">
                        프로필 수정
                      </Link>
                    </li>
                    <li
                      className="text-gray-700 text-sm hover:bg-gray-100 rounded-b-md"
                      onClick={handleLogout}
                    >
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
      <WriteModal isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleSubmit}/>
    </header>
  );
};

export default Header;
