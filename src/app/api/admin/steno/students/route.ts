import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User, { UserRole } from "@/models/User";
import StudentProfile from "@/models/StudentProfile";
import StenoResult from "@/models/StenoResult";
import { seedStenoInstituteAccountAction } from "@/app/actions/steno";

export async function GET(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || !["ADMIN", "STENO_ADMIN", "CONTENT_MANAGER"].includes(userRole)) {
      return NextResponse.json({ success: false, error: "Unauthorized: Admin authorization required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const instCode = (searchParams.get("code") || "NGIT-STENO").trim().toUpperCase();

    // 1. Find profile userIds with matching instituteCode
    let profileUserIds: any[] = [];
    try {
      profileUserIds = await StudentProfile.find({
        instituteCode: { $regex: new RegExp(`^${instCode}$`, "i") }
      }).distinct("userId");
    } catch (profileErr) {
      console.warn("StudentProfile lookup warning:", profileErr);
    }

    // 2. Find users matching instituteCode directly or via profile
    const users = await User.find({
      $or: [
        { instituteCode: { $regex: new RegExp(`^${instCode}$`, "i") } },
        { instituteCode: instCode },
        { _id: { $in: profileUserIds } },
        { email: "stenoinstitute@ngitedu.com" },
      ],
    }).select("name email mobile instituteCode createdAt isActive role").lean();

    const studentUsers = users.filter((u: any) => !u.role || String(u.role).toUpperCase() === "STUDENT");
    const userIds = studentUsers.map((u: any) => u._id);

    // 3. Fetch results for these students
    const results = await StenoResult.find({ userId: { $in: userIds } })
      .select("userId speedWpm netWpm accuracy createdAt score")
      .sort({ createdAt: -1 })
      .lean();

    // 4. Aggregate stats
    const studentDataMap: Record<string, any> = {};
    for (const u of studentUsers) {
      const uidStr = u._id ? u._id.toString() : "";
      if (!uidStr) continue;
      studentDataMap[uidStr] = {
        _id: uidStr,
        name: u.name,
        email: u.email,
        mobile: u.mobile || "N/A",
        instituteCode: u.instituteCode || instCode,
        createdAt: u.createdAt,
        totalAttempts: 0,
        bestWpm: 0,
        avgAccuracy: 0,
        results: [],
      };
    }

    const accSumMap: Record<string, number> = {};
    for (const r of results) {
      const uidStr = r.userId ? r.userId.toString() : "";
      if (studentDataMap[uidStr]) {
        studentDataMap[uidStr].totalAttempts += 1;
        const wpm = r.netWpm || r.speedWpm || 0;
        if (wpm > studentDataMap[uidStr].bestWpm) {
          studentDataMap[uidStr].bestWpm = wpm;
        }
        accSumMap[uidStr] = (accSumMap[uidStr] || 0) + (r.accuracy || 0);
        studentDataMap[uidStr].results.push(r);
      }
    }

    const studentList = Object.values(studentDataMap).map((s: any) => {
      if (s.totalAttempts > 0) {
        s.avgAccuracy = Math.round((accSumMap[s._id] / s.totalAttempts) * 10) / 10;
      }
      return s;
    });

    return NextResponse.json({
      success: true,
      instituteCode: instCode,
      totalStudents: studentList.length,
      students: studentList,
    });
  } catch (err: any) {
    console.error("GET /api/admin/steno/students error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to load institute students" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || !["ADMIN", "STENO_ADMIN", "CONTENT_MANAGER"].includes(userRole)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    if (body.action === "seed") {
      const seedRes = await seedStenoInstituteAccountAction();
      return NextResponse.json(seedRes);
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("POST /api/admin/steno/students error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
