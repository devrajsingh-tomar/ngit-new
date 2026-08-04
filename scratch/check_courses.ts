const mongoose = require("mongoose");

const uri = "mongodb+srv://dorusgame_db_user:c8ch9VhqQW8sKZr@cluster0.q1y4bfd.mongodb.net/?appName=Cluster0";

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) return;

  const books = await db.collection("typingbooks").find({}).toArray();
  console.log(`Found ${books.length} books:`);
  for (const b of books) {
    console.log(`- Book ID: ${b._id}, Name: ${b.name}`);
  }

  // Find passages where bookId is populated and is not null
  const passages = await db.collection("typingpassages").find({ 
    bookId: { $ne: null, $exists: true } 
  }).toArray();

  console.log(`\nFound ${passages.length} book chapters:`);
  for (const p of passages) {
    console.log(`- ID: ${p._id}, Title: ${p.title}, Language: ${p.language}, BookID: ${p.bookId}, Category: ${p.category}`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
