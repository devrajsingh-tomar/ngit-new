import type { NextConfig } from "next";

const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "ngit.org.in",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "ngitedu.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "www.ngitedu.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "img.freepik.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "i.pravatar.cc",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "i.pinimg.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "i.ytimg.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "media.9curry.com",
                pathname: "/**",
            },
        ],
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    experimental: {
        optimizePackageImports: ["lucide-react", "framer-motion", "@radix-ui/react-icons"],
        serverActions: {
            bodySizeLimit: "60mb",
        },
    },
} as any;

export default nextConfig as NextConfig;
