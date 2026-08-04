import mongoose from "mongoose";

const uri = "mongodb+srv://dorusgame_db_user:c8ch9VhqQW8sKZr@cluster0.q1y4bfd.mongodb.net/?appName=Cluster0";

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) return;

  const upssscGov = await db.collection("govexams").findOne({ title: "UPSSSC" });
  if (!upssscGov) {
    console.log("UPSSSC GovExam not found!");
    await mongoose.disconnect();
    return;
  }

  // Fetch one typing exam belonging to UPSSSC
  const exam = await db.collection("typingexams").findOne({ govExamId: upssscGov._id });
  if (!exam) {
    console.log("No typing exam found for UPSSSC!");
    await mongoose.disconnect();
    return;
  }

  console.log("Selected Exam ID:", exam._id);
  console.log("Selected Exam Title:", exam.title);
  console.log("Selected Exam rulePresetId:", exam.rulePresetId);
  console.log("Selected Exam backspaceMode:", exam.backspaceMode);
  console.log("Selected Exam govExamId:", exam.govExamId);

  // Let's emulate the populate query Mongoose runs
  const populatedGovExam = await db.collection("govexams").findOne({ _id: exam.govExamId });
  console.log("\nPopulated GovExam title:", populatedGovExam?.title);
  console.log("Populated GovExam rulePresetId:", populatedGovExam?.rulePresetId);

  if (populatedGovExam?.rulePresetId) {
    const preset = await db.collection("typingrulepresets").findOne({ _id: populatedGovExam.rulePresetId });
    console.log("\nPopulated Preset details:", {
      name: preset?.name,
      backspaceMode: preset?.backspaceMode,
      examMode: preset?.examMode
    });
  }

  await mongoose.disconnect();
}

run().catch(console.error);
