const mongoose = require('mongoose');
require('dotenv').config();

// console.log("MONGO_URI from .env:", process.env.MONGO_URI);

// MongoDB connection string (ensure this is correct)
const dbURI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(dbURI, {
    serverSelectionTimeoutMS: 10000 // Timeout after 10 seconds
}).then(() => {
    console.log("Database Connected Successfully");
}).catch((err) => {
    console.error("Database connection failed:", err.message);

    // Provide additional debugging information
    if (err.name === 'MongoNetworkError') {
        console.error("Network error: Please check your internet connection or MongoDB URI.");
    } else if (err.name === 'MongoParseError') {
        console.error("URI parsing error: Please verify your MongoDB connection string.");
    }

    process.exit(1); // Exit the process if the database cannot connect
});

// Create Schema
const Loginschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

// Collection
const collection = mongoose.model("user_details", Loginschema);

module.exports = collection;