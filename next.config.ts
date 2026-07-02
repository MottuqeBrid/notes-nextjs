import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: "/api/:path*", // সব api route cover হবে
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "http://localhost:5173",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "http://localhost:5174",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "http://localhost:3000",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "https://note-v2.pages.dev",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "https://note.brid.bd",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PUT,DELETE,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
