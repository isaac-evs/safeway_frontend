/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure transpilers for mapbox-gl
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    return config;
  },
  // Add environment variables
  env: {
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  },
};

export default nextConfig; 