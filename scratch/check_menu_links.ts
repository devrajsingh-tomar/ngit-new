import mongoose from "mongoose";

const uri = "mongodb+srv://dorusgame_db_user:c8ch9VhqQW8sKZr@cluster0.q1y4bfd.mongodb.net/?appName=Cluster0";

async function run() {
  await mongoose.connect(uri);
  console.log("Connected to database!");

  const db = mongoose.connection.db;
  if (!db) return;

  const headerDoc = await db.collection("cmscontents").findOne({ key: "HEADER" });
  if (!headerDoc) {
    console.log("HEADER CMSContent doc not found!");
    await mongoose.disconnect();
    return;
  }

  console.log("\n--- CURRENT DB HEADER DATA ---");
  console.log(JSON.stringify(headerDoc.data, null, 2));

  // If headerDoc has data.navigation, let's update any shorthand menu link
  if (headerDoc.data && Array.isArray(headerDoc.data.navigation)) {
    const updatedNav = headerDoc.data.navigation.map((link: any) => {
      if (link.label?.toLowerCase() === "shorthand" || link.label?.toLowerCase() === "short hand") {
        console.log(`Updating Shorthand link from ${link.href} to https://stenobyvishalsir.com/`);
        return { ...link, href: "https://stenobyvishalsir.com/" };
      }
      return link;
    });

    await db.collection("cmscontents").updateOne(
      { _id: headerDoc._id },
      { $set: { "data.navigation": updatedNav } }
    );
    console.log("Successfully updated dynamic header navigation in database!");
  } else {
    console.log("No dynamic navigation array in header database document.");
  }

  await mongoose.disconnect();
}

run().catch(console.error);
