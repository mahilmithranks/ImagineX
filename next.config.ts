import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // HuggingFace Spaces inference endpoints
        protocol: "https",
        hostname: "*.hf.space",
      },
      {
        // HuggingFace hosted model inference
        protocol: "https",
        hostname: "api-inference.huggingface.co",
      },
      {
        // HuggingFace CDN for model assets
        protocol: "https",
        hostname: "huggingface.co",
      },
    ],
    // Allow data URIs for mocked/base64 images
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
  },
};

export default nextConfig;
