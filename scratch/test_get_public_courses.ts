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

async function test() {
    try {
        if (!MONGODB_URI) {
            console.error("MONGODB_URI not found");
            process.exit(1);
        }
        await mongoose.connect(MONGODB_URI);
        
        const courses = await Course.find({ isPublished: true })
            .select('title description price category thumbnail slug level lessonCount duration')
            .sort({ createdAt: -1 })
            .lean();
            
        console.log("Fetched Courses:");
        console.log(JSON.stringify(courses, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

test();
