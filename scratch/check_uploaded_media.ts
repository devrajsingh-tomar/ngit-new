import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function check() {
    try {
        if (!MONGODB_URI) {
            console.error("MONGODB_URI not found");
            process.exit(1);
        }
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB.");

        const Media = mongoose.models.Media || mongoose.model('Media', new mongoose.Schema({}, { strict: false }));
        const uploads = await Media.find({}).sort({ createdAt: -1 }).limit(10).lean();
        console.log("\n--- RECENT UPLOADS IN DB ---");
        console.log(JSON.stringify(uploads, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

check();
