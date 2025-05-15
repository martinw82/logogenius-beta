import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      // Add the hostname for Genkit-served images or other AI image sources if known
      // Example for a generic AI service domain:
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com', // Common for Google Cloud Storage
        port: '',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // Common for Firebase Storage
        port: '',
        pathname: '/**',
      },
      // Add other potential hostnames if your AI service uses them
    ],
  },
};

export default nextConfig;
