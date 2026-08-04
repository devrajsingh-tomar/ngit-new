const mongoose = require("mongoose");

const uri = "mongodb+srv://dorusgame_db_user:c8ch9VhqQW8sKZr@cluster0.q1y4bfd.mongodb.net/?appName=Cluster0";

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) return;

  const collections = await db.listCollections().toArray();
  console.log("Collections:", collections.map(c => c.name));

  const layouts = await db.collection("layoutcontents").find({}).toArray();
  console.log(`Found ${layouts.length} layout content documents:`);
  layouts.forEach(l => {
    console.log(`- ID: ${l._id}, Identifier: ${l.identifier}`);
    console.log(`  Header LogoText: ${l.header?.logoText}`);
    console.log(`  Header Nav:`, l.header?.navigation);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
