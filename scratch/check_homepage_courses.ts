import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

// Define schema directly to avoid import issues
const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String, required: true },
    thumbnail: { type: String, required: true },
    price: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    category: { type: String, required: true },
    type: { type: String, enum: ["ONLINE", "OFFLINE"], default: "ONLINE" },
}, { strict: false });

const Course = mongoose.models.Course || mongoose.model("Course", CourseSchema);

async function check() {
    try {
        if (!MONGODB_URI) {
            console.error("MONGODB_URI not found");
            process.exit(1);
        }
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB.");

        // Fetch exactly like the server action
        const courses = await Course.find({ isPublished: true })
            .select('title description price category thumbnail slug level lessonCount duration')
            .sort({ createdAt: -1 })
            .lean();

        console.log("Public courses fetched for homepage:");
        console.log(JSON.stringify(courses, null, 2));

        const CmsPage = mongoose.models.CmsPage || mongoose.model('CmsPage', new mongoose.Schema({}, { strict: false }));
        const CmsSection = mongoose.models.CmsSection || mongoose.model('CmsSection', new mongoose.Schema({}, { strict: false }));

        const homePage = await CmsPage.findOne({ page_name: 'home' });
        if (homePage) {
            console.log("\nHome Page configuration found.");
            const sections = await CmsSection.find({ page_id: homePage._id, is_active: true }).sort({ sort_order: 1 }).lean();
            console.log("Active Sections:");
            sections.forEach((s: any) => {
                console.log(`- ${s.section_name} (${s.section_type})`);
                if (s.section_type === 'CoursesSection' || s.section_type === 'CourseGrid') {
                    console.log("  Section Blocks:", JSON.stringify(s.blocks, null, 2));
                }
            });
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

check();
