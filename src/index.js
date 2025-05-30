const express = require("express");
const path = require("path");
const collection = require("./config");
const bcrypt = require('bcrypt');

const app = express();
// convert data into json format
app.use(express.json());
// Static file
app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));
//use EJS as the view engine
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("login_students");
});

app.get("/login", (req, res) => {
    res.render("login_students", { error: null });
});

app.get("/login/students", (req, res) => {
    res.render("login_students", { error: null });
});

app.get("/login/parents", (req, res) => {
    res.render("login_parents", { error: null });
});

app.get("/login/faculty", (req, res) => {
    res.render("login_faculty", { error: null });
});

app.get("/signup", (req, res) => {
    res.render("signup_students");
});

app.get("/signup/students", (req, res) => {
    res.render("signup_students");
});

app.get("/signup/parents", (req, res) => {
    res.render("signup_parents");
});

app.get("/signup/faculty", (req, res) => {
    res.render("signup_faculty");
});

// Signup/faculty Route
app.post("/signup/faculty", async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    // Validation: check if passwords match
    if (password !== confirmPassword) {
        return res.render("signup_faculty", { error: "Passwords do not match." });
    }

    // Check if email already exists
    const existingUser = await collection.findOne({ email: email });
    if (existingUser) {
        return res.render("signup_faculty", { error: "Email already registered. Try logging in." });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Save user
    try {
        const user = new collection({
            name: name,
            email: email,
            type: "faculty",
            password: hashedPassword
        });
        await user.save();
        res.redirect("/login/faculty");
    } catch (err) {
        console.error(err);
        res.render("signup_faculty", { error: "An error occurred. Please try again." });
    }
});

// Signup/parents Route
app.post("/signup/parents", async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    // Validation: check if passwords match
    if (password !== confirmPassword) {
        return res.render("signup_parents", { error: "Passwords do not match." });
    }

    // Check if email already exists
    const existingUser = await collection.findOne({ email: email });
    if (existingUser) {
        return res.render("signup_parents", { error: "Email already registered. Try logging in." });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Save user
    try {
        const user = new collection({
            name: name,
            email: email,
            type: "parents",
            password: hashedPassword
        });
        await user.save();
        res.redirect("/login/parents");
    } catch (err) {
        console.error(err);
        res.render("signup_parents", { error: "An error occurred. Please try again." });
    }
});

// Signup/students Route
app.post("/signup/students", async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    // Validation: check if passwords match
    if (password !== confirmPassword) {
        return res.render("signup_students", { error: "Passwords do not match." });
    }

    // Check if email already exists
    const existingUser = await collection.findOne({ email: email });
    if (existingUser) {
        return res.render("signup_students", { error: "Email already registered. Try logging in." });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Save user
    try {
        const user = new collection({
            name: name,
            email: email,
            type: "students",
            password: hashedPassword
        });
        await user.save();
        res.redirect("/login/students");
    } catch (err) {
        console.error(err);
        res.render("signup_students", { error: "An error occurred. Please try again." });
    }
});

// Login/faculty user 
app.post("/login/faculty", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Match both name and email
        const user = await collection.findOne({ name: name, email: email, type: "faculty" });

        if (!user) {
            return res.render("login_faculty", { error: "No user found with the given name and email." });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.render("login_faculty", { error: "Incorrect password." });
        }

        // Login successful
        res.render("home");
    } catch (err) {
        console.error("Login error:", err);
        res.render("login_faculty", { error: "An error occurred during login. Please try again." });
    }
});

// Login/parents user 
app.post("/login/parents", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Match both name and email
        const user = await collection.findOne({ name: name, email: email, type: "parents" });

        if (!user) {
            return res.render("login_parents", { error: "No user found with the given name and email." });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.render("login_parents", { error: "Incorrect password." });
        }

        // Login successful
        res.render("home");
    } catch (err) {
        console.error("Login error:", err);
        res.render("login_faculty", { error: "An error occurred during login. Please try again." });
    }
});

// Login/students user 
app.post("/login/students", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Match both name and email
        const user = await collection.findOne({ name: name, email: email, type: "students" });

        if (!user) {
            return res.render("login_students", { error: "No user found with the given name and email." });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.render("login_students", { error: "Incorrect password." });
        }

        // Login successful
        res.render("home");
    } catch (err) {
        console.error("Login error:", err);
        res.render("login_students", { error: "An error occurred during login. Please try again." });
    }
});


// Define Port for Application
const port = 5000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
});