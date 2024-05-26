"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getSession } from "@/lib/session";
import { defaultSession } from "@/lib/sessionSetting";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import ProfileImageDropzone from "@/components/ProfileDropzone";

const MyOmoi = () => {
  const { data: session } = useSession();
  const [emailSession, setEmailSession] = useState(defaultSession);
  const [nickname, setNickname] = useState(session?.user?.name || emailSession.username);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [email, setEmail] = useState(session?.user?.email || emailSession.email);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      if (!emailSession.isLoggedIn) {
        const session = await getSession();
        setEmailSession(session);
        setNickname(session.username);
        setEmail(session.email);
      }
    };

    fetchSession();
  }, [emailSession.isLoggedIn]);

  const handleNicknameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(event.target.value);
  };

  const handleProfileImageChange = (file: File | null) => {
    setProfileImage(file);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("nickname", nickname);
    if (profileImage) {
      formData.append("profileImage", profileImage);
    }

    try {
      const response = await fetch("/api/user", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        router.reload();
      } else {
        console.error("Failed to update profile.");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-10 px-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4">내 정보</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">이메일</label>
            <input
              type="email"
              value={email}
              disabled
              className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-gray-700">닉네임</label>
            <input
              type="text"
              value={nickname}
              onChange={handleNicknameChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-4">프로필 이미지</label>
            <ProfileImageDropzone onFileAdded={handleProfileImageChange} />
          </div>
          <Button
            content={isLoading ? "업데이트 중..." : "업데이트"}
            type="primary"
          />
        </form>
      </div>
    </div>
  );
};

export default MyOmoi;
