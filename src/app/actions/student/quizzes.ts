"use server";

import connectDB from "@/lib/db";
import Quiz from "@/models/Quiz";
import Attempt from "@/models/Attempt";
import Answer from "@/models/Answer";
import User, { UserRole } from "@/models/User";
import Enrollment from "@/models/Enrollment";
import PaidTestRequest, { RequestStatus } from "@/models/PaidTestRequest";
import Question from "@/models/Question";
import { z } from "zod";
import { createSafeAction } from "@/lib/safe-action";
import { RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";

const QuizIdSchema = z.object({
    quizId: z.string().min(1)
});

export const getAvailableQuizzes = createSafeAction(
    { requireAuth: true, roles: [UserRole.STUDENT, UserRole.ADMIN] },
    async (_, session) => {
        await connectDB();
        const activeEnrollments = await Enrollment.find({ userId: session.user.id, isActive: true }).lean();
        const enrolledCourseIds = activeEnrollments.map(e => e.courseId);

        const [quizzes, requests] = await Promise.all([
            Quiz.find({
                $or: [
                    { courseId: { $in: enrolledCourseIds } },
                    { isMockTest: true, isPublic: true }
                ],
                isPublished: true
            }).sort({ createdAt: -1 }),
            PaidTestRequest.find({ studentId: session.user.id }).lean()
        ]);

        const quizzesWithAccess = quizzes.map(quiz => {
            const request = requests.find(r => r.mockTestId.toString() === quiz._id.toString());
            return {
                ...quiz.toObject(),
                accessRequest: request ? { status: request.status } : null
            };
        });

        return JSON.parse(JSON.stringify(quizzesWithAccess));
    }
);

export const getQuiz = createSafeAction(
    { schema: QuizIdSchema, requireAuth: true, roles: [UserRole.STUDENT, UserRole.ADMIN] },
    async ({ quizId }, session) => {
        await connectDB();
        const quiz = await Quiz.findById(quizId).populate("questions").lean();
        if (!quiz) throw new Error("Assessment not found in our records.");

        // 2. Pricing/Access Check for Mock Tests
        if (quiz.isMockTest) {
            if (quiz.pricing?.type === "PAID") {
                const request = await PaidTestRequest.findOne({ 
                    studentId: session.user.id, 
                    mockTestId: quizId,
                    status: RequestStatus.APPROVED 
                });
                if (!request) {
                    throw new Error("ACCESS_DENIED: This is a premium mock test. Access must be approved by admin after payment.");
                }
            }
        } else {
            // 3. Enrollment Check for Course-specific Quizzes
            const enrollment = await Enrollment.findOne({
                userId: session.user.id,
                courseId: quiz.courseId,
                isActive: true
            });
            if (!enrollment) {
                throw new Error("ENROLLMENT_REQUIRED: This assessment is part of a course you are not enrolled in.");
            }
        }

        let questionsList = (quiz.questions as any[]).map((q: any) => {
            if (!q) return null;
            return {
                _id: q._id ? q._id.toString() : null,
                content: q.content,
                options: q.options?.map((opt: any) => ({ 
                    _id: opt._id ? opt._id.toString() : null, 
                    text: opt.text, 
                    pair: opt.pair 
                })), // Hide isCorrect
                marks: q.marks,
                type: q.type,
                assertion: q.assertion,
                reason: q.reason,
                shortAnswer: q.shortAnswer
            };
        }).filter(Boolean);

        // Dynamic Shuffling
        if (quiz.settings?.shuffleQuestions) {
            for (let i = questionsList.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [questionsList[i], questionsList[j]] = [questionsList[j], questionsList[i]];
            }
        }

        return { ...JSON.parse(JSON.stringify(quiz)), questions: questionsList };
    }
);

const SubmitQuizSchema = z.object({
    quizId: z.string().min(1),
    answers: z.record(z.any()),
    timeTaken: z.number().min(0)
});

export const submitQuiz = createSafeAction(
    { schema: SubmitQuizSchema, requireAuth: true, roles: [UserRole.STUDENT, UserRole.ADMIN], rateLimit: RATE_LIMIT_CONFIGS.SENSITIVE },
    async ({ quizId, answers, timeTaken }, session) => {
        await connectDB();
        const quiz = await Quiz.findById(quizId).populate("questions");
        if (!quiz) throw new Error("Quiz not found");

        let score = 0;
        let correctCount = 0;
        let incorrectCount = 0;
        let unattemptedCount = 0;
        const totalMarks = quiz.settings?.totalMarks || 0;

        const attempt = await Attempt.create({
            studentId: session.user.id,
            quizId: quiz._id,
            status: "SUBMITTED",
            startTime: new Date(Date.now() - timeTaken * 1000),
            endTime: new Date(),
            totalScore: 0,
            totalMarks,
            securityLogs: { tabSwitchCount: 0, violations: [] }
        });

        const answersToCreate = [];
        for (const question of (quiz.questions as any[])) {
            if (!question) continue;
            const userAnswer = answers[question._id?.toString()];
            let isCorrect = false;
            let marksAwarded = 0;

            if (userAnswer === undefined || userAnswer === null || (Array.isArray(userAnswer) && userAnswer.length === 0)) {
                unattemptedCount++;
            } else {
                try {
                    if (question.type === "MCQ_SINGLE" || question.type === "TRUE_FALSE" || question.type === "ASSERTION_REASON") {
                        // UI sends labels like 'A', 'B', 'C', 'D' OR 'True', 'False'
                        const correctOption = question.options.find((o: any) => o.isCorrect);
                        
                        if (question.type === "TRUE_FALSE") {
                            // Handle True/False separately
                            const correctVal = correctOption?.text?.en?.toLowerCase() === "true";
                            isCorrect = String(userAnswer).toLowerCase() === String(correctVal);
                        } else {
                            // Handle MCQ/AR via Labels (A=0, B=1, etc.)
                            const labelToIndex = (lbl: string) => lbl.charCodeAt(0) - 65;
                            const userIndex = labelToIndex(String(userAnswer).toUpperCase());
                            const correctIndex = question.options.findIndex((o: any) => o.isCorrect);
                            
                            isCorrect = userIndex === correctIndex && userIndex !== -1;
                        }
                    } else if (question.type === "MCQ_MULTIPLE") {
                        const userLabels = Array.isArray(userAnswer) ? userAnswer : [];
                        const correctIndices = question.options
                            .map((o: any, idx: number) => o.isCorrect ? idx : -1)
                            .filter((idx: number) => idx !== -1);
                        
                        const userIndices = userLabels.map((lbl: string) => lbl.charCodeAt(0) - 65);
                        
                        isCorrect = userIndices.length === correctIndices.length && 
                                    userIndices.every(idx => correctIndices.includes(idx));
                    } else if (question.type === "NUMERIC") {
                        isCorrect = parseFloat(userAnswer) === question.numericAnswer;
                    } else if (question.type === "MATCH_THE_FOLLOWING") {
                        const matches = Object.entries(userAnswer as Record<string, string>);
                        if (matches.length === question.options.length) {
                            isCorrect = matches.every(([optId, matchId]) => optId === matchId);
                        }
                    } else if (question.type === "TYPING") {
                        const originalText = question.shortAnswer || question.content?.en || "";
                        const typedText = typeof userAnswer === "string" ? userAnswer : "";
                        
                        if (!typedText.trim()) {
                            isCorrect = false;
                        } else {
                            const originalWords = originalText.trim().split(/\s+/);
                            const typedWords = typedText.trim().split(/\s+/);
                            
                            let correctWords = 0;
                            for (let i = 0; i < Math.min(originalWords.length, typedWords.length); i++) {
                                if (originalWords[i] === typedWords[i]) {
                                    correctWords++;
                                }
                            }
                            const accuracy = (correctWords / Math.max(1, originalWords.length)) * 100;
                            isCorrect = accuracy >= 80;
                        }
                    }

                    if (isCorrect) {
                        marksAwarded = question.marks || 4;
                        score += marksAwarded;
                        correctCount++;
                    } else {
                        marksAwarded = -(question.negativeMarks || 1);
                        score += marksAwarded;
                        incorrectCount++;
                    }
                } catch (e) {
                    console.error("Error evaluating question:", question._id, e);
                    // Continue with default (incorrect) to prevent crashing the whole submission
                    incorrectCount++;
                }
            }

            answersToCreate.push({
                attemptId: attempt._id,
                questionId: question._id,
                selectedOptionIds: Array.isArray(userAnswer) ? userAnswer : (userAnswer ? [userAnswer] : []),
                numericAnswer: question.type === "NUMERIC" ? userAnswer : undefined,
                timeTakenSeconds: 0,
                evaluation: {
                    isEvaluated: true,
                    isCorrect,
                    marksAwarded
                }
            });
        }

        // Bulk insert all answers at once for high performance
        if (answersToCreate.length > 0) {
            await Answer.insertMany(answersToCreate);
        }

        attempt.totalScore = score;
        attempt.isPassed = score >= (quiz.settings?.passingMarks || 0);
        await attempt.save();

        // --- NEW: Automatically create a MockTestResult for immediate student visibility ---
        try {
            const MockTestResult = (await import("@/models/MockTestResult")).default;
            const Enrollment = (await import("@/models/Enrollment")).default;
            
            // Get course info if available (safe check)
            let courseTitle = "General";
            if (quiz.courseId) {
                const enrollment = await Enrollment.findOne({ userId: session.user.id, courseId: quiz.courseId }).populate("courseId");
                if (enrollment?.courseId) {
                    courseTitle = (enrollment.courseId as any).title;
                }
            }
            
            // Explicitly set attempt date to now
            const now = new Date();

            await MockTestResult.findOneAndUpdate(
                { attemptId: attempt._id },
                {
                    studentId: session.user.id,
                    mockTestId: quiz._id,
                    attemptId: attempt._id,
                    score,
                    totalMarks,
                    attemptDate: now,
                    course: courseTitle,
                    publishStatus: "PUBLISHED", // Make it visible immediately
                    analysis: {
                        correctAnswers: correctCount,
                        incorrectAnswers: incorrectCount,
                        unattemptedQuestions: unattemptedCount,
                        accuracy: ((correctCount / Math.max(1, (correctCount + incorrectCount))) * 100) || 0,
                        timeTaken
                    }
                },
                { upsert: true, new: true }
            );
        } catch (err) {
            console.error("[SubmitQuiz] Failed to auto-create MockTestResult:", err);
            // We don't throw here to ensure the student's attempt is at least saved
        }

        return {
            attemptId: attempt._id.toString(),
            score,
            totalMarks,
            metrics: { correctCount, incorrectCount, unattemptedCount },
            isPassed: attempt.isPassed
        };
    }
);

const AnalysisSchema = z.object({
    attemptId: z.string().optional(),
    quizId: z.string().optional()
});

export const getQuizAnalysis = createSafeAction(
    { schema: AnalysisSchema, requireAuth: true, roles: [UserRole.STUDENT, UserRole.ADMIN] },
    async ({ attemptId, quizId }, session) => {
        await connectDB();
        
        let attempt;
        if (attemptId) {
            attempt = await Attempt.findById(attemptId).populate({
                path: "quizId",
                populate: { path: "questions" }
            }).lean();
        } else if (quizId) {
            attempt = await Attempt.findOne({ studentId: session.user.id, quizId })
                .sort({ createdAt: -1 })
                .populate({
                    path: "quizId",
                    populate: { path: "questions" }
                }).lean();
        }

        if (!attempt) throw new Error("Result analysis not found for this assessment.");
        if (attempt.studentId.toString() !== session.user.id && session.user.role !== UserRole.ADMIN) {
             throw new Error("Unauthorized access to result analysis");
        }

        const answers = await Answer.find({ attemptId }).lean();

        return JSON.parse(JSON.stringify({
            ...attempt,
            answers
        }));
    }
);
