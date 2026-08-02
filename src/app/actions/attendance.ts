"use server";

import connectDB from "@/lib/db";
import Attendance from "@/models/Attendance";
import AttendanceSession from "@/models/AttendanceSession";
import Enrollment from "@/models/Enrollment";
import User, { UserRole } from "@/models/User";
import { AttendanceStatus } from "@/types/attendance";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import crypto from 'crypto'; // For secure random code

// --- HELPERS ---

function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // Radius of the earth in m
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in m
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

// --- ADMIN ACTIONS ---

export async function generateQRSession(batchId: string, lat?: number, lng?: number, radius: number = 500) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

        // Deactivate previous active sessions for this batch
        await AttendanceSession.updateMany(
            { batchId, isActive: true },
            { isActive: false }
        );

        // Generate Secure Code (6 characters, uppercase) for manual entry fallback
        const code = crypto.randomBytes(3).toString('hex').toUpperCase();

        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        const newSession = await AttendanceSession.create({
            batchId,
            code,
            expiresAt,
            isActive: true,
            createdBy: session.user.id,
            location: (lat && lng) ? { lat, lng, radius } : undefined
        });

        return {
            success: true,
            code,
            expiresAt: newSession.expiresAt,
            sessionId: newSession._id.toString()
        };
    } catch (error: unknown) {
        console.error("Generate QR Error:", error);
        return { success: false, error: "Failed to generate QR session" };
    }
}

export async function getActiveSession(batchId: string) {
    try {
        await connectDB();
        const session = await AttendanceSession.findOne({
            batchId,
            isActive: true,
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        if (!session) return { success: false };

        return {
            success: true,
            session: JSON.parse(JSON.stringify(session))
        };
    } catch (error) {
        return { success: false, error: "Failed to fetch active session" };
    }
}

export async function stopSession(sessionId: string) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

        await AttendanceSession.findByIdAndUpdate(sessionId, { isActive: false });
        getAllAttendance(new Date().toISOString());
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to stop session" };
    }
}

// --- STUDENT ACTIONS ---

export async function submitAttendance(code: string, lat: number, lng: number, accuracy?: number) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, error: "Unauthorized" };

        if (!lat || !lng) {
            return { success: false, error: "Location mandatory" };
        }

        // 1. Find valid session
        const activeSession = await AttendanceSession.findOne({
            code,
            isActive: true,
            expiresAt: { $gt: new Date() }
        });

        if (!activeSession) {
            return { success: false, error: "Invalid or expired QR code" };
        }

        // 2. Validate Location (Geofencing)
        let distance = 0;
        if (activeSession.location && activeSession.location.lat && activeSession.location.lng) {
            distance = getDistanceFromLatLonInM(
                lat, lng,
                activeSession.location.lat,
                activeSession.location.lng
            );

            // Allow tolerance of accuracy + radius
            // Usually 500m radius is generous enough, plus the accuracy reported by GPS.
            const allowedRadius = activeSession.location.radius + (accuracy || 0);
            if (distance > allowedRadius) {
                return {
                    success: false,
                    error: `You are too far from the class location (${Math.round(distance)}m away). Allowed: ${Math.round(allowedRadius)}m.`
                };
            }
        }

        // 3. Check Enrollment
        const enrollment = await Enrollment.findOne({
            userId: session.user.id,
            courseId: activeSession.batchId
        }); // Removed isActive check for simplicity, or keep it if strictly enforced

        if (!enrollment) {
            // Maybe allow open batches? No, requirement says "Student must be logged in" and implies enrollment.
            // If manual enrollment management, check it.
            // For now assume enrollment required.
            return { success: false, error: "You are not enrolled in this batch" };
        }

        // 4. Check Existing Attendance
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const exist = await Attendance.findOne({
            studentId: session.user.id,
            batchId: activeSession.batchId,
            date: { $gte: todayStart, $lte: todayEnd }
        });

        if (exist) {
            return { success: false, error: "Attendance already marked for today" };
        }

        // 5. Mark
        await Attendance.create({
            studentId: session.user.id,
            batchId: activeSession.batchId,
            sessionId: activeSession._id,
            date: new Date(),
            status: AttendanceStatus.PRESENT,
            markedByCode: true,
            markedBy: session.user.id,
            location: {
                lat,
                lng,
                distance,
                accuracy
            }
        });

        return { success: true, batchId: activeSession.batchId, distance: Math.round(distance) };
    } catch (error: unknown) {
        console.error("Submit Attendance Error:", error);
        const message = error instanceof Error ? error.message : "Failed to submit attendance";
        return { success: false, error: message };
    }
}

// --- COMMON HELPER ---
export async function getStudentsForAttendance() {
    return { success: true, students: [] }; // No direct universal list anymore without batch
}

export async function getEnrolledStudentsForBatch(batchId: string) {
    try {
        await connectDB();
        const enrollments = await Enrollment.find({ courseId: batchId })
            .populate({ path: "userId", select: "name email image", match: { role: UserRole.STUDENT, isActive: true } })
            .lean();

        const students = enrollments.map(e => e.userId).filter(u => u != null);
        // sort by name
        students.sort((a: any, b: any) => a.name.localeCompare(b.name));
        return { success: true, students: JSON.parse(JSON.stringify(students)) };
    } catch (error) {
        return { success: false, error: "Failed to fetch enrolled students" };
    }
}

export async function getAllAttendance(dateStr: string, batchId?: string) {
    try {
        await connectDB();
        const date = new Date(dateStr);
        const start = new Date(date); start.setHours(0, 0, 0, 0);
        const end = new Date(date); end.setHours(23, 59, 59, 999);

        const query: any = { date: { $gte: start, $lte: end } };
        if (batchId) {
            query.batchId = batchId;
        }

        const records = await Attendance.find(query).populate("studentId", "name email image");

        return { success: true, records: JSON.parse(JSON.stringify(records)) };
    } catch (error) {
        return { success: false, error: "Failed to load records" };
    }
}

export async function markAttendance(records: { studentId: string, status: AttendanceStatus, remarks?: string }[], date: string, batchId?: string) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const attendanceDate = new Date(date);
        attendanceDate.setHours(12, 0, 0, 0);

        const operations = records.map(record => ({
            updateOne: {
                filter: { studentId: record.studentId, batchId: batchId || undefined, date: { $gte: new Date(new Date(date).setHours(0, 0, 0, 0)), $lte: new Date(new Date(date).setHours(23, 59, 59, 999)) } },
                update: {
                    $set: {
                        status: record.status,
                        remarks: record.remarks,
                        batchId: batchId || undefined,
                        markedBy: session.user.id,
                        date: attendanceDate
                    }
                },
                upsert: true
            }
        }));

        await Attendance.bulkWrite(operations as any);
        revalidatePath("/admin/attendance");
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An error occurred";
        return { success: false, error: message };
    }
}

export async function getAttendanceByDate(date: string, batchId?: string) {
    return getAllAttendance(date, batchId);
}

export async function markSingleStudentAttendance(studentId: string, status: AttendanceStatus, batchId: string) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        let targetUserId = studentId;

        // Convert sequential Student ID (NGIT-XXXX) to MongoDB User _id
        if (studentId.startsWith("NGIT-")) {
            const StudentProfile = (await import("@/models/StudentProfile")).default;
            const profile = await StudentProfile.findOne({ idNo: studentId }).select("userId").lean();
            if (!profile) {
                return { success: false, error: `Student ID ${studentId} not found` };
            }
            targetUserId = profile.userId.toString();
        }

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const attendanceDate = new Date();
        attendanceDate.setHours(12, 0, 0, 0);

        await Attendance.findOneAndUpdate(
            { 
                studentId: targetUserId, 
                batchId, 
                date: { $gte: todayStart, $lte: todayEnd } 
            },
            {
                $set: {
                    status,
                    markedBy: session.user.id,
                    date: attendanceDate
                }
            },
            { upsert: true, new: true }
        );

        revalidatePath("/admin/attendance");
        return { success: true };
    } catch (error) {
        console.error("Mark Single Attendance Error:", error);
        return { success: false, error: "Failed to mark attendance" };
    }
}

// Keep older compatibility calls if needed, but we are rewriting.
