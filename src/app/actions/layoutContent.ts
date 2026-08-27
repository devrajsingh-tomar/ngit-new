"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import CMSContent from "@/models/CMSContent";
import { UserRole } from "@/models/User";

export async function getHeaderFooterData() {
    try {
        await dbConnect();

        const [header, footer] = await Promise.all([
            CMSContent.findOne({ key: "HEADER" }),
            CMSContent.findOne({ key: "FOOTER" }),
        ]);

        const defaultHeader = {
            logoImage: "",
            logoText: "NGIT",
            navigation: [
                { label: "Home", href: "/" },
                { label: "Online Admission", href: "/enroll" },
                { label: "Typing Test", href: "/typing" },
                { label: "Steno / Short Hand", href: "/steno" },
                { label: "Practical Tools", href: "/tools" },
                { label: "Mock Tests", href: "/exams" },
                { label: "Results", href: "/results" },
                { label: "Gallery", href: "/gallery" },
                { label: "Faculty", href: "/faculty" },
                { label: "About", href: "/about" },
                { label: "Contact", href: "/contact" },
            ],
            ctaButton: { label: "Login", href: "/student/login" },
        };

        const defaultFooter = {
            logoImage: "",
            logoText: "NGIT",
            description: "Leading coaching institute providing quality education.",
            sections: [
                {
                    title: "Quick Links",
                    links: [
                        { label: "About Us", href: "/about" },
                        { label: "Contact", href: "/contact" },
                    ],
                },
                {
                    title: "Contact",
                    links: [
                        { label: "Email: info@ngit.edu", href: "mailto:info@ngit.edu" },
                        { label: "Phone: +91 1234567890", href: "tel:+911234567890" },
                    ],
                },
            ],
            social: [
                { platform: "Facebook", url: "#" },
                { platform: "Twitter", url: "#" },
                { platform: "Instagram", url: "#" },
            ],
            copyright: "© 2024 NGIT Institute. All rights reserved.",
        };

        return {
            success: true,
            header: { ...defaultHeader, ...(header?.data || {}) },
            footer: { ...defaultFooter, ...(footer?.data || {}) },
        };
    } catch (error) {
        console.error("Error fetching header/footer data:", error);
        return { success: false, error: "Failed to fetch data" };
    }
}

export async function updateHeaderData(data: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== UserRole.ADMIN) {
            return { success: false, error: "Unauthorized" };
        }

        await dbConnect();


        await CMSContent.findOneAndUpdate(
            { key: "HEADER" },
            {
                data,
                updatedBy: session.user.id
            },
            { upsert: true, new: true }
        );

        revalidatePath("/", "layout");
        revalidatePath("/");
        return { success: true, message: "Header updated successfully" };
    } catch (error) {
        console.error("Error updating header:", error);
        return { success: false, error: "Failed to update header" };
    }
}

export async function updateFooterData(data: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== UserRole.ADMIN) {
            return { success: false, error: "Unauthorized" };
        }

        await dbConnect();

        await CMSContent.findOneAndUpdate(
            { key: "FOOTER" },
            {
                data,
                updatedBy: session.user.id
            },
            { upsert: true, new: true }
        );

        revalidatePath("/", "layout");
        revalidatePath("/");
        return { success: true, message: "Footer updated successfully" };
    } catch (error) {
        console.error("Error updating footer:", error);
        return { success: false, error: "Failed to update footer" };
    }
}

export async function getFloatingSocialsData() {
    try {
        await dbConnect();
        const content = await CMSContent.findOne({ key: "FLOATING_SOCIALS" });
        const defaultSocials = [
            { platform: "WhatsApp", url: "https://wa.me/911234567890", isActive: true },
            { platform: "Telegram", url: "https://t.me/yourchannel", isActive: true },
            { platform: "Instagram", url: "https://instagram.com/yourprofile", isActive: true },
        ];
        return {
            success: true,
            data: content?.data || defaultSocials
        };
    } catch (error) {
        console.error("Error fetching floating socials:", error);
        return { success: false, error: "Failed to fetch data" };
    }
}

export async function updateFloatingSocialsData(data: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== UserRole.ADMIN) {
            return { success: false, error: "Unauthorized" };
        }
        await dbConnect();
        await CMSContent.findOneAndUpdate(
            { key: "FLOATING_SOCIALS" },
            {
                data,
                updatedBy: session.user.id
            },
            { upsert: true, new: true }
        );
        revalidatePath("/", "layout");
        revalidatePath("/");
        return { success: true, message: "Floating socials updated successfully" };
    } catch (error) {
        console.error("Error updating floating socials:", error);
        return { success: false, error: "Failed to update floating socials" };
    }
}

