"use server";

import connectDB from "@/lib/db";
import User, { UserRole } from "@/models/User";
import StudentProfile from "@/models/StudentProfile";
import Enrollment from "@/models/Enrollment";
import Invoice from "@/models/Invoice";
import TypingResult from "@/models/TypingResult";
import MockTestResult from "@/models/MockTestResult";
import Course from "@/models/Course";
import TypingSubscription from "@/models/TypingSubscription";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Auto-heal helper to ensure all student accounts have a StudentProfile and a unique Student ID (idNo)
export async function autoHealStudentProfiles() {
  try {
    await connectDB();
    
    // Find all users with role STUDENT
    const users = await User.find({ role: UserRole.STUDENT }).lean();
    
    // Find all existing student profiles
    const profiles = await StudentProfile.find({}).lean();
    const profileUserIds = new Set(profiles.map(p => p.userId.toString()));
    
    // For any student user missing a StudentProfile, create a default one
    let totalCount = await StudentProfile.countDocuments();
    
    for (const user of users) {
      if (!profileUserIds.has(user._id.toString())) {
        // Generate a unique sequential idNo
        let suffix = totalCount + 1001;
        let idNo = `NGIT-${suffix}`;
        while (await StudentProfile.exists({ idNo })) {
          suffix++;
          idNo = `NGIT-${suffix}`;
        }
        
        await StudentProfile.create({
          userId: user._id,
          name: user.name || "Unknown Student",
          dateOfBirth: "—",
          fatherName: "—",
          motherName: "—",
          aadharNo: "—",
          category: "General",
          localAddress: "—",
          localPhone: user.mobile || "—",
          permanentAddress: "—",
          permanentPhone: user.mobile || "—",
          course: "General Typing",
          status: user.isActive ? "Approved" : "Pending",
          idNo,
          whatsappNo: user.mobile || "",
        });
        
        totalCount++;
      }
    }
    
    // For any existing profile that has no idNo or empty/N/A idNo, assign one
    const emptyProfiles = await StudentProfile.find({
      $or: [
        { idNo: { $exists: false } },
        { idNo: null },
        { idNo: "" },
        { idNo: "N/A" }
      ]
    });
    
    if (emptyProfiles.length > 0) {
      for (const profile of emptyProfiles) {
        let suffix = totalCount + 1001;
        let idNo = `NGIT-${suffix}`;
        while (await StudentProfile.exists({ idNo })) {
          suffix++;
          idNo = `NGIT-${suffix}`;
        }
        await StudentProfile.findByIdAndUpdate(profile._id, { idNo });
        totalCount++;
      }
    }
  } catch (err) {
    console.error("autoHealStudentProfiles error:", err);
  }
}

// Search students globally (by name, email, phone, roll/id number)
export async function searchStudentsAdmin(queryText: string) {
  try {
    await connectDB();
    await autoHealStudentProfiles(); // Run profile healing on search
    const cleanQuery = queryText.trim();
    if (!cleanQuery) return { success: true, students: [] };

    const regex = new RegExp(cleanQuery, "i");

    // Search in User model first
    const matchedUsers = await User.find({
      role: UserRole.STUDENT,
      $or: [
        { name: regex },
        { email: regex },
        { mobile: regex }
      ]
    }).limit(20).lean();

    const userIds = matchedUsers.map(u => u._id);

    // Search in StudentProfile model
    const matchedProfiles = await StudentProfile.find({
      $or: [
        { userId: { $in: userIds } },
        { name: regex },
        { localPhone: regex },
        { permanentPhone: regex },
        { idNo: regex },
        { whatsappNo: regex }
      ]
    }).limit(20).populate("userId").lean();

    // Map profiles
    const mapped = matchedProfiles.map((p: any) => {
      const u = p.userId || {};
      return {
        _id: p._id.toString(),
        userId: u._id?.toString() || "",
        name: p.name || u.name || "Unknown",
        email: u.email || p.email || "",
        phone: p.localPhone || u.mobile || "",
        whatsapp: p.whatsappNo || "",
        course: p.course || "",
        status: p.status || "Pending",
        idNo: p.idNo || "",
        image: u.image || "",
        createdAt: p.createdAt
      };
    });

    // Merge in stub profiles for users who match the search but don't have a StudentProfile document yet
    const profileUserIds = new Set(
      matchedProfiles.map((p: any) => p.userId?._id?.toString() || p.userId?.toString())
    );

    matchedUsers.forEach((u: any) => {
      if (!profileUserIds.has(u._id.toString())) {
        mapped.push({
          _id: `temp_${u._id.toString()}`,
          userId: u._id.toString(),
          name: u.name || "Unknown",
          email: u.email || "",
          phone: u.mobile || "",
          whatsapp: "",
          course: "No Profile Yet",
          status: "Pending",
          idNo: "N/A",
          image: u.image || "",
          createdAt: u.createdAt || new Date()
        });
      }
    });

    return { success: true, students: JSON.parse(JSON.stringify(mapped)) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Fetch complete profile, attempts record, and billing info
export async function getStudentFullDetailsAdmin(userId: string) {
  try {
    await connectDB();

    const userObj = await User.findById(userId).lean();
    if (!userObj) throw new Error("Student account not found");

    const profileObj = await StudentProfile.findOne({ userId }).lean();
    
    // Fetch Enrollments and check duration status
    const enrollments = await Enrollment.find({ userId })
      .populate({ path: "courseId", model: "Course" })
      .lean();

    const now = new Date();
    const mappedEnrollments = enrollments.map((e: any) => {
      // Auto duration expiration calculation: 30 days
      const enrolledDate = e.enrolledAt ? new Date(e.enrolledAt) : new Date();
      const diffTime = Math.abs(now.getTime() - enrolledDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const isExpired = diffDays > 30;
      const statusActive = e.isActive && !isExpired;

      return {
        ...e,
        _id: e._id.toString(),
        daysEnrolled: diffDays,
        isExpired,
        isActive: statusActive, // Overwritten dynamically if completed 30 days (1 month)
        originalIsActive: e.isActive
      };
    });

    // Fetch Invoices / Fees details
    const invoices = await Invoice.find({ studentId: userId })
      .populate({ path: "courseId", model: "Course" })
      .lean();

    // Fetch Typing attempts record
    const typingResults = await TypingResult.find({ userId })
      .populate("examId")
      .sort({ createdAt: -1 })
      .lean();

    // Fetch Mock Test / Quiz attempts record
    const mockResults = await MockTestResult.find({ studentId: userId })
      .populate({ path: "mockTestId", model: "Quiz" })
      .sort({ attemptDate: -1 })
      .lean();

    // Fetch Typing Subscription record
    const typingSubscription = await TypingSubscription.findOne({ userId })
      .sort({ endDate: -1 })
      .lean();

    return {
      success: true,
      student: JSON.parse(JSON.stringify({
        user: userObj,
        profile: profileObj,
        enrollments: mappedEnrollments,
        invoices,
        typingResults,
        mockResults,
        typingSubscription
      }))
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Renew student course enrollment (reset duration timer & toggle active)
export async function renewStudentEnrollmentAdmin(enrollmentId: string) {
  try {
    await connectDB();
    const enrollment = await Enrollment.findByIdAndUpdate(
      enrollmentId,
      { 
        enrolledAt: new Date(), 
        isActive: true 
      },
      { new: true }
    );
    if (!enrollment) throw new Error("Enrollment record not found");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Toggle enrollment status manually
export async function toggleStudentEnrollmentActiveAdmin(enrollmentId: string, isActive: boolean) {
  try {
    await connectDB();
    await Enrollment.findByIdAndUpdate(enrollmentId, { isActive });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Permanently delete a student and all related database records
export async function deleteStudentPermanentlyAdmin(profileId: string, userId: string) {
  try {
    await connectDB();

    if (profileId) {
      await StudentProfile.findByIdAndDelete(profileId);
    }
    if (userId) {
      await User.findByIdAndDelete(userId);
      await Enrollment.deleteMany({ userId });
      await Invoice.deleteMany({ studentId: userId });
      await TypingResult.deleteMany({ userId });
      await MockTestResult.deleteMany({ studentId: userId });
    }

    revalidatePath("/admin/students");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Fetch dashboard KPIs for Student Affairs overview
export async function getStudentAffairsKPIs() {
  try {
    await connectDB();
    await autoHealStudentProfiles(); // Run profile healing on dashboard load
    
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);

    const [totalStudents, typingToday, pendingCount] = await Promise.all([
      User.countDocuments({ role: UserRole.STUDENT }),
      TypingResult.countDocuments({ createdAt: { $gte: startOfToday } }),
      StudentProfile.countDocuments({ status: "Pending" })
    ]);

    // Daily active users checking distinct student submissions today
    const activeUserIdsToday = await TypingResult.distinct("userId", {
      createdAt: { $gte: startOfToday }
    });

    return {
      success: true,
      kpis: {
        totalStudents,
        activeUsersToday: activeUserIdsToday.length,
        typingToday,
        pendingRegistrations: pendingCount
      }
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Reset student password admin action
export async function resetStudentPasswordAdmin(userId: string, newPassword: string) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== UserRole.ADMIN) {
      return { success: false, error: "Unauthorized access: Admin authorization required" };
    }

    if (!userId) {
      return { success: false, error: "Student User ID is required" };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long" };
    }

    const user = await User.findById(userId);
    if (!user) {
      return { success: false, error: "Student user account not found" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    revalidatePath("/admin/students");
    return { 
      success: true, 
      message: `Password for ${user.name || "student"} reset successfully!` 
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reset password" };
  }
}

