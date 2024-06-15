import { useState, useEffect } from 'react';

const useUserProfile = (userId: number) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      const fetchUserProfile = async () => {
        try {
          const response = await fetch(`/api/user/${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log('유저 프로필', data);
            setProfileImage(data.data.profile);
            setUserName(data.data.username);
          } else {
            setError('Failed to fetch user profile');
          }
        } catch (error) {
          console.error('Failed to fetch user profile', error);
          setError('Failed to fetch user profile');
        } finally {
          setLoading(false);
        }
      };

      fetchUserProfile();
    }
  }, []);

  return { profileImage, userName, loading, error };
};

export default useUserProfile;
