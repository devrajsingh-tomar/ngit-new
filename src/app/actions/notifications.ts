"use server";

import connectDB from "@/lib/db";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getMyNotifications() {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, error: "Unauthorized" };

        // Optimized with .lean() and lean selection
        const notifications = await Notification.find({ userId: session.user.id })
            .sort({ createdAt: -1 })
            .limit(20)
            .select('title message type isRead link createdAt')
            .lean();

        // Convert to plain objects to ensure serializability
        const plainNotifications = notifications.map(n => ({
            _id: n._id.toString(),
            title: n.title,
            message: n.message,
            type: n.type,
            isRead: n.isRead,
            link: n.link,
            createdAt: n.createdAt.toISOString()
        }));

        return { success: true, notifications: plainNotifications };
    } catch (error) {
        console.error("getMyNotifications error:", error);
        return { success: false, error: "Failed to fetch notifications" };
    }
}

export async function markAsRead(notificationId: string) {
    try {
        await connectDB();
        // Use findOneAndUpdate with projection if possible, but here update is fine
        await Notification.updateOne({ _id: notificationId }, { $set: { isRead: true } });
        
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function createNotification(userId: string, title: string, message: string, type: string = "INFO", link?: string) {
    try {
        await connectDB();
        await Notification.create({
            userId,
            title,
            message,
            type,
            link
        });
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}
