"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Plus,
    Calendar,
    MapPin,
    Edit3,
    Trash2,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { getEvents, deleteEvent } from "@/app/actions/events";

export default function AdminEventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const res = await getEvents();
            if (res.success) {
                setEvents(res.events);
            } else {
                toast.error("Failed to load events");
            }
        } catch (error) {
            console.error("Error loading events:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this event?")) return;

        try {
            const res = await deleteEvent(id);
            if (res.success) {
                toast.success("Event deleted successfully");
                loadEvents(); // Reload list
            } else {
                toast.error(res.error || "Failed to delete event");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Event Management</h1>
                    <p className="text-slate-500 font-medium mt-1">Schedule and manage workshops, seminars, and campus events.</p>
                </div>
                <Link href="/admin/events/new">
                    <Button className="gap-2 h-12 rounded-xl px-6 shadow-lg shadow-primary/20 font-bold">
                        <Plus className="w-5 h-5" />
                        Create New Event
                    </Button>
                </Link>
            </div>

            <div className="bg-white border rounded-[2.5rem] overflow-x-auto shadow-sm">
                <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-400">Event Details</th>
                            <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-400">Date & Location</th>
                            <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-400">Category</th>
                            <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-400">Status</th>
                            <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center text-slate-400 flex justify-center items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" /> Loading events...
                                </td>
                            </tr>
                        ) : events.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center text-slate-400 font-medium italic">
                                    No events scheduled yet. click "Create New Event" to start.
                                </td>
                            </tr>
                        ) : (
                            events.map((event) => (
                                <tr key={event._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <p className="font-bold text-slate-900 text-lg group-hover:text-primary transition-colors">{event.title}</p>
                                        <p className="text-xs text-slate-400 font-medium mt-1 line-clamp-1 max-w-xs">{event.description}</p>
                                    </td>
                                    <td className="px-8 py-6 space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                            <Calendar className="w-3.5 h-3.5 text-primary" />
                                            {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {event.location}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500">
                                            {event.category}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${event.status === 'UPCOMING' ? 'bg-emerald-50 text-emerald-600' :
                                                event.status === 'COMPLETED' ? 'bg-slate-100 text-slate-500' : 'bg-red-50 text-red-600'
                                            }`}>
                                            {event.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link href={`/admin/events/edit/${event._id}`}>
                                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100 text-slate-400 hover:text-primary">
                                                    <Edit3 className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="rounded-xl hover:bg-red-50 text-slate-300 hover:text-red-500"
                                                onClick={() => handleDelete(event._id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
