import mongoose from "mongoose";

const uri = "mongodb+srv://dorusgame_db_user:c8ch9VhqQW8sKZr@cluster0.q1y4bfd.mongodb.net/?appName=Cluster0";

async function run() {
  await mongoose.connect(uri);
  console.log("Connected to database!");

  const db = mongoose.connection.db;
  if (!db) return;

  const presets = await db.collection("typingrulepresets").find().toArray();
  console.log(`Found ${presets.length} rule presets.`);

  // 1. Link GovExams to RulePresets
  for (const preset of presets) {
    if (preset.govExamId) {
      const govExamId = preset.govExamId;
      console.log(`Linking GovExam ${govExamId} to RulePreset ${preset.name} (${preset._id})`);
      
      await db.collection("govexams").updateOne(
        { _id: govExamId },
        { $set: { rulePresetId: preset._id } }
      );
    }
  }

  // 2. Sync all TypingExams belonging to these GovExams
  const govExams = await db.collection("govexams").find().toArray();
  console.log(`Found ${govExams.length} GovExams in database.`);

  let totalUpdatedExams = 0;

  for (const gov of govExams) {
    if (gov.rulePresetId) {
      const preset = presets.find(p => p._id.toString() === gov.rulePresetId.toString());
      if (!preset) continue;

      console.log(`Syncing rules from preset "${preset.name}" to all typing exams of GovExam "${gov.title}"`);
      
      const updateResult = await db.collection("typingexams").updateMany(
        { govExamId: gov._id },
        {
          $set: {
            rulePresetId: preset._id,
            wordLimit: preset.wordLimit || 0,
            backspaceMode: preset.backspaceMode || "full",
            highlightMode: preset.highlightMode || "word",
            autoScroll: preset.autoScroll !== undefined ? preset.autoScroll : true,
            showScrollbar: preset.showScrollbar !== undefined ? preset.showScrollbar : true,
            examMode: preset.examMode || "General"
          }
        }
      );
      
      console.log(`Updated ${updateResult.modifiedCount} exams for "${gov.title}"`);
      totalUpdatedExams += updateResult.modifiedCount;
    }
  }

  console.log(`\nMigration completed successfully! Total updated typing tests: ${totalUpdatedExams}`);
  await mongoose.disconnect();
}

run().catch(console.error);
