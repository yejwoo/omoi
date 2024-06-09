/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'static-omoi.s3.ap-northeast-2.amazonaws.com',
          pathname: '/**',
        },
        {
            protocol: 'https',
            hostname: 'dummyimage.com',
            pathname: '/**',
          },
      ],
    },
  };
  
  export default nextConfig;
  