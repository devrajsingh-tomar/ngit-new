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

        // Define a loose model for Course
        const Course = mongoose.models.Course || mongoose.model('Course', new mongoose.Schema({}, { strict: false }));
        
        const updates = [
            {
                title: "PGDCA",
                thumbnail: "/uploads/gallery/1778315484176-c8e02f96-2bbc-4655-a98b-239833c68407.jpg"
            },
            {
                title: "Offline CCC Course",
                thumbnail: "/uploads/gallery/1778253537773-6796f46e-e827-4f7c-9cf3-9f2adc51085f.png"
            },
            {
                title: "O Level",
                thumbnail: "/uploads/gallery/1777633481530-5add2892-7c9a-4f46-8d99-5a47d830b5d9.png"
            },
            {
                title: "Tally with GST",
                thumbnail: "/uploads/gallery/1771287962481-78ad41bd-1efd-49d1-ab49-5d17eab83753.png"
            },
            {
                title: "ADCA (Advanced Diploma in Computer Applications)",
                thumbnail: "/uploads/gallery/1778313928967-430526af-001e-4dc1-ab0e-9b3f75a8de45.png"
            }
        ];

        for (const item of updates) {
            const result = await Course.updateOne(
                { title: item.title },
                { $set: { thumbnail: item.thumbnail } }
            );
            console.log(`Update status for "${item.title}":`, result);
        }

        console.log("All courses updated.");
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

run();
