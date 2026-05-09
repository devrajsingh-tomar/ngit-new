
const mongoose = require('mongoose');
const uri = "mongodb+srv://dorusgame_db_user:c8ch9VhqQW8sKZr@cluster0.q1y4bfd.mongodb.net/?appName=Cluster0";

mongoose.connect(uri).then(async () => {
    const db = mongoose.connection.db;
    
    const books = await db.collection('typingbooks').find().toArray();
    console.log('Books in DB:');
    books.forEach(b => console.log(`- ${b.name} (${b._id})`));

    const passages = await db.collection('typingpassages').find().toArray();
    console.log('\nAll Passages Analysis:');
    passages.forEach(p => {
        console.log(`- ${p.title} | Section: ${p.section} | BookId: ${p.bookId} | Lang: ${p.language}`);
    });

    mongoose.disconnect();
}).catch(err => console.error(err));
