const mongoose = require("mongoose");

const uri = "mongodb+srv://dorusgame_db_user:c8ch9VhqQW8sKZr@cluster0.q1y4bfd.mongodb.net/?appName=Cluster0";

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) return;

  // Let's check how many books exist and how many passages are mapped to each book in database
  const books = await db.collection("typingbooks").find({}).toArray();
  console.log("Books in DB:", books.map((b: any) => ({ id: b._id, name: b.name })));

  for (const b of books) {
    const count = await db.collection("typingpassages").countDocuments({ bookId: b._id });
    console.log(`Book ${b.name} (${b._id}) has ${count} passages/chapters.`);
  }

  // Let's also check if there is an aggregation stats mismatch for languages in Taxonomy
  // This aggregation:
  // TypingPassage.aggregate([
  //   { $match: { bookId: { $exists: true } } },
  //   { $group: { _id: '$bookId', languages: { $addToSet: '$language' } } }
  // ])
  const bookStats = await db.collection("typingpassages").aggregate([
    { $match: { bookId: { $exists: true } } },
    { $group: { _id: '$bookId', languages: { $addToSet: '$language' } } }
  ]).toArray();

  console.log("\nAggregation Stats of book languages:", bookStats);

  await mongoose.disconnect();
}

run().catch(console.error);
