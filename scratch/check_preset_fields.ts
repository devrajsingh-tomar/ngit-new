const mongoose = require("mongoose");

const uri = "mongodb+srv://dorusgame_db_user:c8ch9VhqQW8sKZr@cluster0.q1y4bfd.mongodb.net/?appName=Cluster0";

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) return;

  const passage = await db.collection("typingpassages").findOne({ bookId: { $ne: null } });
  if (passage) {
    console.log("Passage ID:", passage._id);
    console.log("Title:", passage.title);
    console.log("bookId value:", passage.bookId);
    console.log("bookId type:", typeof passage.bookId);
    console.log("bookId constructor:", passage.bookId?.constructor?.name);
    console.log("section value:", passage.section);
    console.log("section type:", typeof passage.section);
  } else {
    console.log("No passage with bookId found.");
  }

  await mongoose.disconnect();
}

run().catch(console.error);
