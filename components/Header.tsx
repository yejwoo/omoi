"use client";

import Image from "next/image";
import logo from "../public/logo/logo_title.svg";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import WriteModal from "@/components/WriteModal";
import useClickOutside from "@/app/hooks/useClickOutside";
import useUserProfile from "@/app/hooks/useUserProfile";
import { useQuery, useQueryClient } from "react-query";
import { fetchSession } from "@/lib/api";
import { logout } from "@/lib/session";
import { defaultSession } from "@/lib/sessionSetting";
import SkeletonHeader from "@/components/SkeletonHeader";

const Header = () => {
  const queryClient = useQueryClient();
  const {
    data: sessionData,
    isLoading,
    error,
  } = useQuery("session", fetchSession, {
    refetchOnWindowFocus: false,
  });

  const [showDropDown, setShowDropDown] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const toggleDropDown = () => setShowDropDown(!showDropDown);
  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  const dropDownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    data: userProfile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useUserProfile(sessionData?.id || 0);
  const username = sessionData ? sessionData.username : defaultSession.username;
  const profileImage = userProfile?.profile;

  useClickOutside(dropDownRef, () => setShowDropDown(false));
  useClickOutside(modalRef, () => setModalOpen(false));

  const handleLinkClick = () => {
    setShowDropDown(false);
  };

  const handleSubmit = () => {
    handleCloseModal();
  };

  const handleLogout = async () => {
    await logout();
    queryClient.invalidateQueries("session"); // 세션 쿼리 무효화
    queryClient.removeQueries("userProfile");
    window.location.reload();
  };

  if (isLoading) return <SkeletonHeader />;
  if (error) {
    console.error("Error fetching session data:", error);
  }

  return (
    <header className="z-[99] bg-white dark:bg-gray-800 w-full md:h-16 border-gray-200 border-t fixed bottom-0 md:top-0 md:shadow">
      {/* PC 네비 */}
      <nav className="max-w-3xl mx-auto px-2 sm:px-6 lg:px-8 hidden md:block">
        <div className="flex justify-between items-center gap-4">
          <div className="flex gap-8 ">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <div className="relative w-[72px] h-[48px]">
                  <Image
                    src={logo}
                    fill
                    objectFit="contain"
                    alt="omoi logo"
                    priority
                  />
                </div>
              </Link>
            </div>
            <ul className="flex gap-2">
              <li>
                <Link className="block px-2 py-4" href="/">
                  <Image
                    src="/icons/home.svg"
                    width={24}
                    height={24}
                    alt="home"
                    priority
                  />
                </Link>
              </li>
            </ul>
          </div>
          <div>
            {!sessionData?.isLoggedIn && (
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
            {sessionData?.isLoggedIn && (
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
                    {profileImage ? (
                      <div className="relative w-8 h-8 rounded-full">
                        <Image
                          src={profileImage}
                          fill
                          className="object-cover rounded-full"
                          alt="profile"
                        />
                      </div>
                    ) : (
                      <div className="inline-block w-8 h-8 bg-gray-300 rounded-full"></div>
                    )}
                  </div>
                </div>
                {showDropDown && (
                  <ul className="origin-top-right absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <li className="text-gray-700 text-base rounded-t-md">
                      <div
                        className="block px-4 py-2"
                        onClick={handleLinkClick}
                      >
                        <span className="font-bold">{username}</span> 님
                      </div>
                    </li>
                    <li className="text-gray-700 text-sm hover:bg-gray-100">
                      <Link
                        className="block px-4 py-2"
                        href={`/${username}`}
                        onClick={handleLinkClick}
                      >
                        내 피드
                      </Link>
                    </li>
                    <li className="text-gray-700 text-sm hover:bg-gray-100">
                      <Link
                        className="block px-4 py-2"
                        href="/profile"
                        onClick={handleLinkClick}
                      >
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
      {/* 모바일 네비 */}
      <nav className="max-w-3xl mx-auto px-2 sm:px-6 lg:px-8 block md:hidden">
        <ul className="flex gap-2">
          <li className="w-1/3 flex justify-center items-center">
            <Link className="block p-2" href="/">
              <Image
                src="/icons/home.svg"
                width={28}
                height={28}
                alt="메인"
              />
            </Link>
          </li>
          <li className="w-1/3 flex justify-center items-center">
            <button onClick={handleOpenModal}>
            <Image
                src="/icons/add.svg"
                width={28}
                height={28}
                alt="작성"
              />
            </button>
          </li>
          <li className="w-1/3 flex justify-center items-center">
            {profileImage ? (
              <div className="relative w-6 h-6 rounded-full border-2 border-black">
                <Image
                  src={profileImage}
                  fill
                  className="object-cover rounded-full"
                  alt="profile"
                />
              </div>
            ) : (
              <div className="inline-block border-2 w-6 h-6 bg-gray-300 rounded-full"></div>
            )}
          </li>
        </ul>
      </nav>
      <WriteModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </header>
  );
};

export default Header;
