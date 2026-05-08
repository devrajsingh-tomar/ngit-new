"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Info, AlertTriangle, CreditCard, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getMyNotifications, markAsRead } from "@/app/actions/notifications";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function NotificationBell() {
    const [isFetching, setIsFetching] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        if (isFetching) return;
        try {
            setIsFetching(true);
            const res = await getMyNotifications();
            if (res.success && res.notifications) {
                setNotifications(res.notifications);
                setUnreadCount(res.notifications.filter((n: any) => !n.isRead).length);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        let timeoutId: NodeJS.Timeout;

        const poll = async () => {
            await fetchNotifications();
            if (isMounted) {
                // Polling every 60 seconds instead of 30 to reduce server load
                timeoutId = setTimeout(poll, 60000);
            }
        };

        poll();
        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, []);

    const handleMarkAsRead = async (id: string) => {
        await markAsRead(id);
        setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "SUCCESS": return <Check className="w-4 h-4 text-emerald-500" />;
            case "PAYMENT": return <CreditCard className="w-4 h-4 text-blue-500" />;
            case "COURSE": return <BookOpen className="w-4 h-4 text-primary" />;
            case "WARNING": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            default: return <Info className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-slate-100">
                    <Bell className="w-5 h-5 text-slate-600" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl shadow-2xl border-slate-100 overflow-hidden">
                <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Notifications</h3>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {unreadCount} New
                    </span>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p className="text-sm font-medium">No notifications yet</p>
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <Link
                                href={n.link || "#"}
                                key={n._id}
                                onClick={() => handleMarkAsRead(n._id)}
                            >
                                <DropdownMenuItem className={cn(
                                    "p-4 flex gap-4 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 border-b last:border-0",
                                    !n.isRead && "bg-blue-50/30"
                                )}>
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                        !n.isRead ? "bg-white shadow-sm" : "bg-slate-100"
                                    )}>
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="space-y-1">
                                        <p className={cn(
                                            "text-sm leading-tight",
                                            !n.isRead ? "font-bold text-slate-900" : "font-medium text-slate-600"
                                        )}>{n.title}</p>
                                        <p className="text-xs text-slate-500 line-clamp-2">{n.message}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">
                                            {new Date(n.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </DropdownMenuItem>
                            </Link>
                        ))
                    )}
                </div>
                <div className="p-3 border-t bg-slate-50/50 text-center">
                    <Button variant="ghost" className="w-full text-xs font-bold text-primary hover:bg-white h-8">
                        View All Notifications
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
