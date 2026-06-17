import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export so the whole app can be bundled inside a native (Capacitor) APK.
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
