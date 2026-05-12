import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStudentDashboardData } from "@/app/actions/dashboard";
import StudentDashboardClient from "@/components/student/StudentDashboardClient";

export const dynamic = "force-dynamic";

export default async function StudentDashboard() {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session) {
            redirect("/student/login");
        }

        // Role check
        if (session.user.role !== "STUDENT" && session.user.role !== "ADMIN") {
            redirect("/login");
        }

        const res = await getStudentDashboardData();
        
        // Fallback data if fetch fails
        const data = res.success ? res : {
            stats: { avgProgress: 0, activeCourses: 0, attendancePercentage: 0, testsCompleted: 0, avgGrade: '-' },
            enrollments: [],
            typingResults: [],
            typingExams: [],
            userName: session.user.name || 'Student',
            userImage: session.user.image,
            userId: session.user.id,
            progressTrend: []
        };

        return <StudentDashboardClient data={data} />;
    } catch (error: any) {
        // Next.js redirect throws an error, we need to rethrow it
        if (error?.digest?.includes('NEXT_REDIRECT')) {
            throw error;
        }
        console.error("Student Dashboard Server Error:", error);
        // On fatal error, try to redirect to login
        redirect("/student/login");
    }
}
