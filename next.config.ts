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
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "Permissions-Policy",
                        value: "camera=(self), microphone=(), geolocation=(self), interest-cohort=()",
                    },
                    {
                        key: "X-Frame-Options",
                        value: "SAMEORIGIN",
                    },
                    {
                        key: "Content-Security-Policy",
                        value: "frame-src 'self' https://drive.google.com https://docs.google.com https://*.google.com; object-src 'self' blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google.com; worker-src 'self' blob:;",
                    },
                ],
            },
            {
                // Explicitly allow iframes for uploads
                source: "/uploads/(.*)",
                headers: [
                    {
                        key: "Content-Type",
                        value: "application/pdf",
                    },
                    {
                        key: "Content-Disposition",
                        value: "inline",
                    },
                ],
            },
        ];
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
