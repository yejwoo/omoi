"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getSession } from "@/lib/session";
import { defaultSession } from "@/lib/sessionSetting";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import ProfileImageDropzone from "@/components/ProfileDropzone";
import Input from "@/components/Input";
import uploadFiles from "@/lib/UploadFiles";

interface FileWithPreview extends File {
  preview: string;
  url?: string;
}

const MyOmoi = () => {
  const { data: session } = useSession();
  const [emailSession, setEmailSession] = useState(defaultSession);
  const [nickname, setNickname] = useState(
    session?.user?.name || emailSession.username
  );
  const [profileImage, setProfileImage] = useState<string>("");
  const [profilePreview, setProfilePreview] = useState<FileWithPreview | null>(null);
  const [email, setEmail] = useState(
    session?.user?.email || emailSession.email
  );
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

  useEffect(() => {
    if(emailSession.id) {
      const fetchUserProfile = async () => {
        try {
          const response = await fetch(`/api/user/${emailSession.id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
  
          if (response.ok) {
            const data = await response.json();
            console.log("user profile", data);
            setProfileImage(data.data.profile);
          }
        } catch (error) {
          console.error("Failed to fetch user profile", error);
        }
      };
  
      fetchUserProfile();
    }
  }, [emailSession.id]);

  const fileToBlob = (file: FileWithPreview): Promise<Blob> => {
    return fetch(file.preview).then((res) => res.blob());
  };

  const handleProfileImageChange = async (file: FileWithPreview | null) => {
    if (file) {
      const blob = await fileToBlob(file);
      const urls = await uploadFiles([blob], [file.name]);
      const url = urls[0];
      setProfilePreview({ ...file, url });
      const hiddenInput = document.getElementById(
        "hiddenProfileImage"
      ) as HTMLInputElement;
      hiddenInput.value = url;
    } else {
      setProfilePreview(null);
      const hiddenInput = document.getElementById(
        "hiddenProfileImage"
      ) as HTMLInputElement;
      hiddenInput.value = "";
    }
  };

  // 유저 프로필 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    setIsLoading(true);
    const response = await fetch(`/api/user/${emailSession.id}`, {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    if (result.success) {
      console.log(result);
      // router.reload();
    } else {
      console.error("Failed to update user profile:", result.errors);
    }
    setIsLoading(false);
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
              name="username"
              defaultValue={nickname}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-4">프로필 이미지</label>
            <ProfileImageDropzone onFileAdded={handleProfileImageChange} profile={profileImage}/>
            <input type="hidden" id="hiddenProfileImage" name="profile" />
          </div>
          {/* {emailSession.id && (
            <div className="hidden">
              <Input
                type="hidden"
                name="id"
                label="유저 아이디"
                value={emailSession.id}
              />
            </div>
          )} */}
          <Button
            content={isLoading ? "업데이트 중..." : "업데이트"}
            type="primary"
            isSubmitting={isLoading}
          />
        </form>
      </div>
    </div>
  );
};

export default MyOmoi;
