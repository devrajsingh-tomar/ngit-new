import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../lib/db';
import Question, { QuestionType, Difficulty } from '../models/Question';
import Course from '../models/Course';

dotenv.config({ path: '.env.local' });

async function seed() {
    try {
        await connectDB();
        console.log('Connected to database...');

        // 1. Find or create a course
        let course = await Course.findOne();
        if (!course) {
            console.log('No course found, creating a "Default Seed Course"...');
            course = await Course.create({
                title: "Default Seed Course",
                description: "Used for seeding questions",
                category: "General",
                status: "Active"
            });
        }

        const courseId = course._id;
        console.log(`Using course: ${course.title} (${courseId})`);

        // 2. Define questions
        const questionsData = [
            {
                courseId,
                type: QuestionType.MCQ_SINGLE,
                difficulty: Difficulty.EASY,
                content: { en: "What is the primary function of the CPU?" },
                options: [
                    { text: { en: "Storage" }, isCorrect: false },
                    { text: { en: "Processing" }, isCorrect: true },
                    { text: { en: "Input" }, isCorrect: false },
                    { text: { en: "Output" }, isCorrect: false }
                ],
                marks: 2,
                negativeMarks: 0.5,
                explanation: { en: "The CPU (Central Processing Unit) is the primary component of a computer that acts as its 'control center' and processes data." }
            },
            {
                courseId,
                type: QuestionType.MCQ_MULTIPLE,
                difficulty: Difficulty.MEDIUM,
                content: { en: "Which of the following are operating systems?" },
                options: [
                    { text: { en: "Windows" }, isCorrect: true },
                    { text: { en: "Linux" }, isCorrect: true },
                    { text: { en: "Oracle" }, isCorrect: false },
                    { text: { en: "macOS" }, isCorrect: true }
                ],
                marks: 4,
                negativeMarks: 1,
                explanation: { en: "Windows, Linux, and macOS are OS, while Oracle is primarily a database company." }
            },
            {
                courseId,
                type: QuestionType.TRUE_FALSE,
                difficulty: Difficulty.EASY,
                content: { en: "RAM is a volatile memory." },
                options: [
                    { text: { en: "True" }, isCorrect: true },
                    { text: { en: "False" }, isCorrect: false }
                ],
                marks: 2,
                negativeMarks: 0,
                explanation: { en: "True, RAM loses its data when the power is turned off." }
            },
            {
                courseId,
                type: QuestionType.NUMERIC,
                difficulty: Difficulty.MEDIUM,
                content: { en: "What is the binary equivalent of decimal number 10?" },
                numericAnswer: 1010,
                marks: 3,
                negativeMarks: 0,
                explanation: { en: "Decimal 10 is 1010 in binary (8+0+2+0)." }
            },
            {
                courseId,
                type: QuestionType.SHORT_ANSWER,
                difficulty: Difficulty.MEDIUM,
                content: { en: "Who is known as the father of computer?" },
                shortAnswer: "Charles Babbage",
                marks: 3,
                negativeMarks: 0,
                explanation: { en: "Charles Babbage is considered the father of computer." }
            },
            {
                courseId,
                type: QuestionType.DESCRIPTIVE,
                difficulty: Difficulty.HARD,
                content: { en: "Explain the differences between RAM and ROM in detail." },
                marks: 10,
                negativeMarks: 0,
                explanation: { en: "RAM is volatile/read-write, ROM is non-volatile/read-only." }
            },
            {
                courseId,
                type: QuestionType.MATCH_THE_FOLLOWING,
                difficulty: Difficulty.MEDIUM,
                content: { en: "Match the following hardware components with their functions:" },
                options: [
                    { text: { en: "Monitor" }, pair: { en: "Display" }, isCorrect: false },
                    { text: { en: "Keyboard" }, pair: { en: "Input" }, isCorrect: false },
                    { text: { en: "Printer" }, pair: { en: "Hard Copy" }, isCorrect: false }
                ],
                marks: 6,
                negativeMarks: 1,
                explanation: { en: "Monitor is for display, keyboard for input, and printer for hard copy." }
            },
            {
                courseId,
                type: QuestionType.ASSERTION_REASON,
                difficulty: Difficulty.HARD,
                content: { en: "Analyze the following statements regarding cloud computing:" },
                assertion: { en: "Cloud computing reduces local hardware costs." },
                reason: { en: "Cloud computing allows resources to be accessed over the internet from remote servers." },
                numericAnswer: 0, // A: Both true, R is correct explanation
                marks: 5,
                negativeMarks: 1.25,
                explanation: { en: "Cloud computing uses remote infrastructure, thus reducing the need for powerful local machines." }
            },
            {
                courseId,
                type: QuestionType.TYPING,
                difficulty: Difficulty.MEDIUM,
                content: { en: "Type the following paragraph as fast and accurately as you can." },
                shortAnswer: "Technology has revolutionized the way we live and work. From the smartphones in our pockets to the complex algorithms that power our search engines, digital innovation is everywhere. Mastery of computer systems is no longer just a skill but a necessity in the modern world.",
                marks: 0,
                negativeMarks: 0,
                explanation: { en: "Typing test for evaluating speed and accuracy." }
            }
        ];

        // 3. Insert questions
        console.log(`Clearing existing seed data for course ${courseId}...`);
        await Question.deleteMany({ courseId });

        console.log(`Seeding ${questionsData.length} questions...`);
        await Question.insertMany(questionsData);

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
