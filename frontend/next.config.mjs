/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    domains: [
      "item-image-storage.s3.eu-west-2.amazonaws.com",
      "item-image-storage.s3.amazonaws.com",
    ],
  },
};

export default nextConfig;
