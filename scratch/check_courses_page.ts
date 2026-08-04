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

        const CmsPage = mongoose.models.CmsPage || mongoose.model('CmsPage', new mongoose.Schema({}, { strict: false }));
        const CmsSection = mongoose.models.CmsSection || mongoose.model('CmsSection', new mongoose.Schema({}, { strict: false }));

        const pages = ['home', 'courses'];
        for (const pageName of pages) {
            const page = await CmsPage.findOne({ page_name: pageName });
            if (page) {
                console.log(`\n--- PAGE FOUND: ${pageName.toUpperCase()} ---`);
                console.log(`ID: ${page._id}`);
                const sections = await CmsSection.find({ page_id: page._id }).sort({ sort_order: 1 });
                console.log(`Sections count: ${sections.length}`);
                for (const s of sections) {
                    console.log(`  Section: ${s.section_name} (${s.section_type}) | Active: ${s.is_active} | Order: ${s.sort_order}`);
                    if (s.section_type === 'CourseGrid' || s.section_type === 'CoursesSection') {
                        console.log(`    Blocks:`, JSON.stringify(s.blocks, null, 2));
                    }
                }
            } else {
                console.log(`Page '${pageName}' not found in CMS.`);
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

check();
