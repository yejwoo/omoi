import { useQuery } from 'react-query';

const fetchUserProfile = async (userId: number) => {
  const response = await fetch(`/api/user/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  const data = await response.json();
  return data.data;
};

const useUserProfile = (userId: number) => {
  return useQuery(['userProfile', userId], () => fetchUserProfile(userId), {
    enabled: !!userId,
  });
};

export default useUserProfile;
