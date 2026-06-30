
import connectDB from "@/lib/db";
import Certificate from "@/models/Certificate";
import Course from "@/models/Course";

/**
 * Generate a unique certificate number
 * Format: NGIT/YYYY/COURSE-CODE/SERIAL
 * Example: NGIT/2026/FSD/0001
 */
export async function generateCertificateNumber(
    courseId?: string, 
    year: number = new Date().getFullYear(),
    customCourseName?: string
): Promise<string> {
    let courseCode = "GEN"; // Default/General code
    
    if (courseId) {
        const course = await Course.findById(courseId);
        if (course) {
            courseCode = (course.slug || "UNKNOWN").substring(0, 3).toUpperCase();
        }
    } else if (customCourseName) {
        // Generate course code from the custom course name (remove non-alphabetic chars, get first 3 chars)
        courseCode = customCourseName.replace(/[^a-zA-Z]/g, "").substring(0, 3).toUpperCase() || "GEN";
    }

    // Find latest certificate for this course & year to increment serial
    const prefix = `NGIT/${year}/${courseCode}/`;

    // We look for max certificate number with this prefix
    const latestCert = await Certificate.findOne({
        certificateNumber: { $regex: `^${prefix}` }
    })
        .sort({ certificateNumber: -1 }) // Sort DESC to get max
        .select("certificateNumber");

    let serial = 1;
    if (latestCert && latestCert.certificateNumber) {
        const parts = latestCert.certificateNumber.split("/");
        const lastSerial = parts[parts.length - 1];
        const lastSerialNum = parseInt(lastSerial, 10);
        if (!isNaN(lastSerialNum)) {
            serial = lastSerialNum + 1;
        }
    }

    return `${prefix}${serial.toString().padStart(4, "0")}`;
}
