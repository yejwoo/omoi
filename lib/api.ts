export const fetchSession = async () => {
  const response = await fetch('/api/session', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch session');
  }

  return response.json();
};
