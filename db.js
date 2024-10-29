const mongoose = require('mongoose');

async function connectToMongo() {
    try {
        await mongoose.connect('mongodb+srv://resto:MDPpc776@cluster0.ohw5n.mongodb.net', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
    }
}

module.exports = connectToMongo;