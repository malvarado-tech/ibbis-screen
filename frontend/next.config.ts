import type {NextConfig} from 'next';

// Demo mode (NEXT_PUBLIC_DEMO_MODE=true) builds a fully static site into `out/`:
// every API call is answered in the browser from lib/mock-data.ts, so no server is needed.
// Real mode keeps the `standalone` server build used by the Docker image.
const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  output: isDemo ? 'export' : 'standalone',
  // The image optimizer needs a server; a static export serves images as-is.
  images: isDemo ? { unoptimized: true } : undefined,
  // Emit /screen/index.html instead of /screen.html so any static host resolves clean URLs.
  trailingSlash: isDemo,
  transpilePackages: ['motion'],
};

export default nextConfig;
