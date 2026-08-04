import connectDB from '../src/lib/db';
import { getPublicCourses } from '../src/app/actions/courses';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
    const res = await getPublicCourses();
    console.log("Result:", JSON.stringify(res, null, 2));
    process.exit(0);
}

test();
