const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://127.0.0.1:27017/travel-booking';

mongoose.connect(MONGO_URI).then(async () => {
    console.log('Connected, dropping db...');
    await mongoose.connection.db.dropDatabase();
    console.log('DB dropped. Restart backend server to seed.');
    process.exit(0);
}).catch(console.error);
