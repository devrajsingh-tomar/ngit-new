import mongoose from "mongoose";

// Pre-register schemas to prevent MissingSchemaError during populate calls
import "@/models/User";
import "@/models/Course";
import "@/models/Enrollment";
import "@/models/Invoice";
import "@/models/Payment";
import "@/models/TypingExam";
import "@/models/TypingExamAccess";
import "@/models/TypingSubscription";
import "@/models/StudentProfile";
import "@/models/TypingResult";
import "@/models/MockTestResult";
import "@/models/Quiz";
import "@/models/StenoPassage";
import "@/models/StenoSeries";
import "@/models/StenoBatch";
import "@/models/StenoExam";
import "@/models/StenoResult";
import "@/models/StenoFont";
import "@/models/StenoErrorRule";
import "@/models/StenoCustomTest";

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    // eslint-disable-next-line no-var
    var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached!.conn) {
        return cached!.conn;
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error("Please define the MONGODB_URI environment variable");
    }

    if (!cached!.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached!.promise = mongoose.connect(uri, opts).then((m) => {
            return m;
        });
    }

    try {
        cached!.conn = await cached!.promise;
    } catch (e) {
        cached!.promise = null;
        throw e;
    }

    return cached!.conn;
}

export default connectDB;
