const mongoose = require('mongoose');
const connect = mongoose.connect("mongodb://localhost:27017/student_data");

connect.then(() => {
    console.log("Database Connected Successfully");
}).catch(() => {
    console.log("Database cannot be Connected");
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
const collection = new mongoose.model("user_details", Loginschema);

module.exports = collection;
