import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // این گزینه باعث می‌شود که هشدارها و ارورهای ESLint در زمان بیلد نادیده گرفته شوند
  },
};

export default nextConfig;
