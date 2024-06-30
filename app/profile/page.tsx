// profile
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "react-query";
import { fetchSession } from "@/lib/api";
import Button from "@/components/Button";
import ProfileImageDropzone from "@/components/ProfileDropzone";
import uploadFiles from "@/lib/UploadFiles";

interface FileWithPreview extends File {
  preview: string;
  url?: string;
}

const MyOmoi = () => {
  const queryClient = useQueryClient();
  const { data: sessionData, isLoading: isSessionLoading } = useQuery("session", fetchSession, {
    refetchOnWindowFocus: false,
  });
  const [nickname, setNickname] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string>("");
  const [profilePreview, setProfilePreview] = useState<FileWithPreview | null>(null);
  const [email, setEmail] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    if (sessionData) {
      setNickname(sessionData.username || "");
      setEmail(sessionData.email || "");
    }
  }, [sessionData]);

  useEffect(() => {
    if (sessionData?.id) {
      const fetchUserProfile = async () => {
        try {
          const response = await fetch(`/api/user/${sessionData.id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const data = await response.json();
            setProfileImage(data.data.profile);
            setBio(data.data.bio);
          }
        } catch (error) {
          console.error("Failed to fetch user profile", error);
        }
      };

      fetchUserProfile();
    }
  }, [sessionData?.id]);

  const fileToBlob = (file: FileWithPreview): Promise<Blob> => {
    return fetch(file.preview).then((res) => res.blob());
  };

  const handleProfileImageChange = async (file: FileWithPreview | null) => {
    if (file) {
      const blob = await fileToBlob(file);
      const urls = await uploadFiles([blob], [file.name]);
      const url = urls[0];
      setProfilePreview({ ...file, url });
      setProfileImage(url);
    } else {
      setProfilePreview(null);
      setProfileImage("");
    }
  };

  // 유저 프로필 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    setIsLoading(true);
    const response = await fetch(`/api/user/${sessionData?.id}`, {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    if (result.success) {
      queryClient.invalidateQueries("session");
      // router.reload();
    } else {
      console.error("Failed to update user profile:", result.errors);
    }
    setIsLoading(false);
  };

  if (isSessionLoading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-10 px-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-lg font-semibold mb-4">내 정보</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm">이메일</label>
            <input
              type="email"
              value={email}
              disabled
              className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm">닉네임</label>
            <input
              type="text"
              name="username"
              defaultValue={nickname}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm">소개글(최대 50자)</label>
            <textarea
              name="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="mt-1 block w-full px-3 py-2 rounded-md text-sm"
              style={{ border: "1px solid rgb(209 213 219)" }}
              placeholder="소개글을 작성하세요."
              maxLength={50}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-4 text-sm">프로필 이미지</label>
            <ProfileImageDropzone onFileAdded={handleProfileImageChange} profile={profileImage} />
            <input type="hidden" id="hiddenProfileImage" name="profile" value={profileImage} />
          </div>
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
