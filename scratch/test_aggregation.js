
const mongoose = require('mongoose');
const uri = "mongodb+srv://dorusgame_db_user:c8ch9VhqQW8sKZr@cluster0.q1y4bfd.mongodb.net/?appName=Cluster0";

mongoose.connect(uri).then(async () => {
    const db = mongoose.connection.db;
    
    console.log('Testing aggregation...');
    const stats = await db.collection('typingpassages').aggregate([
        { $match: { section: 'Book', bookId: { $exists: true } } },
        { $group: { _id: '$bookId', languages: { $addToSet: '$language' } } }
    ]).toArray();
    console.log('Stats:', JSON.stringify(stats, null, 2));

    const books = await db.collection('typingbooks').find().toArray();
    console.log('Books:', JSON.stringify(books, null, 2));

    const merged = books.map(b => {
        const s = stats.find(stat => stat._id.toString() === b._id.toString());
        return {
            ...b,
            languages: s ? s.languages : []
        };
    });
    console.log('Merged:', JSON.stringify(merged, null, 2));

    mongoose.disconnect();
}).catch(err => console.error(err));
