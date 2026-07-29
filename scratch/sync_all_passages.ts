import mongoose from "mongoose";

const uri = "mongodb+srv://dorusgame_db_user:c8ch9VhqQW8sKZr@cluster0.q1y4bfd.mongodb.net/?appName=Cluster0";

async function run() {
  await mongoose.connect(uri);
  console.log("Connected to MongoDB!");

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("DB connection not established");
  }
  const passagesCollection = db.collection("typingpassages");
  const govExamsCollection = db.collection("govexams");
  const typingExamsCollection = db.collection("typingexams");

  const passages = await passagesCollection.find().toArray();
  const govExams = await govExamsCollection.find({ active: true }).toArray();

  console.log(`Found ${passages.length} passages and ${govExams.length} active government exams.`);

  let createdCount = 0;
  let skippedCount = 0;

  for (const passage of passages) {
    for (const govExam of govExams) {
      // Check if a typing exam already exists for this passage and gov exam combination
      const existing = await typingExamsCollection.findOne({
        passageId: passage._id,
        govExamId: govExam._id
      });

      if (existing) {
        skippedCount++;
        continue;
      }

      // Find the preset for this Gov Exam (if populated in govExam.rulePresetId)
      let preset: any = null;
      if (govExam.rulePresetId) {
        preset = await db.collection("typingrulepresets").findOne({ _id: govExam.rulePresetId });
      }

      // Create new typing exam
      await typingExamsCollection.insertOne({
        title: passage.title,
        category: govExam.title,
        language: passage.language,
        passageId: passage._id,
        govExamId: govExam._id,
        duration: govExam.defaultDuration || 10,
        wordLimit: preset?.wordLimit || 0,
        backspaceMode: preset?.backspaceMode || "full",
        highlightMode: preset?.highlightMode || "word",
        autoScroll: preset?.autoScroll !== undefined ? preset.autoScroll : true,
        showScrollbar: preset?.showScrollbar !== undefined ? preset.showScrollbar : true,
        examMode: preset?.examMode || "General",
        rulePresetId: preset?._id || null,
        difficulty: passage.difficulty || "Medium",
        status: "Active",
        startTime: new Date(),
        endTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        createdAt: new Date(),
        updatedAt: new Date()
      });

      createdCount++;
    }
  }

  console.log(`Synchronization finished!`);
  console.log(`Created: ${createdCount} new exams`);
  console.log(`Skipped (already existing): ${skippedCount} exams`);

  await mongoose.disconnect();
}

run().catch(console.error);
