
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(1);
}

async function fixUrls() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        
        // Fix GovExams
        const govExamsCollection = db.collection('govexams');
        const allGovExams = await govExamsCollection.find({}).toArray();
        console.log(`Total GovExams: ${allGovExams.length}`);
        allGovExams.forEach(e => console.log(`- ${e.title}: ${e.logo}`));

        const govExams = allGovExams.filter(exam => exam.logo && exam.logo.startsWith('http') && (exam.logo.includes('localhost') || exam.logo.includes('127.0.0.1')));
        
        console.log(`Found ${govExams.length} GovExams with absolute local URLs`);

        
        for (const exam of govExams) {
            const url = new URL(exam.logo);
            const relativeUrl = url.pathname;
            await govExamsCollection.updateOne({ _id: exam._id }, { $set: { logo: relativeUrl } });
            console.log(`Updated GovExam ${exam.title}: ${exam.logo} -> ${relativeUrl}`);
        }

        // Fix Media
        const mediaCollection = db.collection('media');
        const mediaItems = await mediaCollection.find({ url: { $regex: '^https?://localhost' } }).toArray();
        
        console.log(`Found ${mediaItems.length} Media items with absolute localhost URLs`);
        
        for (const item of mediaItems) {
            const url = new URL(item.url);
            const relativeUrl = url.pathname;
            await mediaCollection.updateOne({ _id: item._id }, { $set: { url: relativeUrl } });
            console.log(`Updated Media ${item.filename}: ${item.url} -> ${relativeUrl}`);
        }

        console.log('Finished fixing URLs');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

fixUrls();
