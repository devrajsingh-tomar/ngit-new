import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
    try {
        if (!MONGODB_URI) {
            console.error("MONGODB_URI not found");
            process.exit(1);
        }
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB.");

        const Course = mongoose.models.Course || mongoose.model('Course', new mongoose.Schema({}, { strict: false }));
        
        // Find PGDCA course
        const pgdca = await Course.findOne({ title: "PGDCA" });
        if (pgdca) {
            console.log("Found PGDCA course. Current thumbnail:", pgdca.thumbnail);
            
            // Set thumbnail to a valid local uploaded path from the gallery folder
            const localThumbnail = "/uploads/gallery/1778315484176-c8e02f96-2bbc-4655-a98b-239833c68407.jpg";
            pgdca.thumbnail = localThumbnail;
            await pgdca.save();
            
            console.log("Updated PGDCA course thumbnail to:", pgdca.thumbnail);
        } else {
            console.log("PGDCA course not found");
        }

    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

run();
