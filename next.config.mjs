/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['lh3.googleusercontent.com', 'firebasestorage.googleapis.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  webpack: (config) => {
    config.externals.push('@node-rs/argon2', '@node-rs/bcrypt');
    return config;
  },
};

export default nextConfig;