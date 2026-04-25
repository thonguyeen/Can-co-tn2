import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Docker standalone build ──────────────────────────────────────
  // Required for Docker multi-stage build — generates server.js self-contained output.
  // See: app/Dockerfile Stage 3 (runner)
  output: 'standalone',

  // ── Image optimization ───────────────────────────────────────────
  // Allow external image sources (Facebook CDN, placeholders, user avatars, etc.)
  images: {
    remotePatterns: [
      {
        // Facebook CDN (SocialPostCard ảnh crawl từ n8n)
        protocol: 'https',
        hostname: '**.fbcdn.net',
      },
      {
        // Facebook static content
        protocol: 'https',
        hostname: '**.facebook.com',
      },
      {
        // Generic HTTPS external images (Supabase storage, placeholder, etc.)
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
