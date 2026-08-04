import mongoose from "mongoose";

const uri = "mongodb+srv://dorusgame_db_user:c8ch9VhqQW8sKZr@cluster0.q1y4bfd.mongodb.net/?appName=Cluster0";

async function run() {
  await mongoose.connect(uri);
  console.log("Connected!");

  const db = mongoose.connection.db;
  if (!db) return;

  const govExams = await db.collection("govexams").find().toArray();
  const presets = await db.collection("typingrulepresets").find().toArray();

  console.log("\n--- RULE PRESETS ---");
  presets.forEach(p => {
    console.log(`Preset Name: "${p.name}", ID: ${p._id}, GovExamID field: ${p.govExamId}`);
  });

  console.log("\n--- GOV EXAMS ---");
  govExams.forEach(g => {
    console.log(`GovExam Title: "${g.title}", ID: ${g._id}, rulePresetId: ${g.rulePresetId}`);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
