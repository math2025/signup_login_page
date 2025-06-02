const mongoose = require('mongoose');
require('dotenv').config();

let isConnected = false;

async function connectToDatabase() {
    if (isConnected) {
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        isConnected = true;
        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err.message);
        throw err;
    }
}

// Define schema
const Loginschema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    type: { type: String, required: true },
    password: { type: String, required: true }
});

// Model
const collection = mongoose.models.user_details || mongoose.model("user_details", Loginschema);

// Export both
module.exports = {
    connectToDatabase,
    collection
};
