const express = require("express");
const path = require("path");
const collection = require("./config");
const bcrypt = require('bcrypt');
const session = require("express-session");
const { google } = require("googleapis");

const app = express();
// convert data into json format
app.use(express.json());
// Static file
app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));
//use EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));
app.use(express.static(path.join(__dirname, "..", "public")));


app.use(session({
  secret: 'your-secret-key', // Replace with strong key
  resave: false,
  saveUninitialized: true
}));

// Google OAuth2 Setup 👇
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:5000/auth/google/callback"
);
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

// Google Drive API instance
const drive = google.drive({
  version: "v3",
  auth: oauth2Client
});

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

// ---------- Google OAuth Routes -------------

// Initiate OAuth flow
app.get("/auth/google", (req, res) => {
  const scopes = [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email"
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes
  });

  res.redirect(authUrl);
});

// Handle OAuth callback
app.get("/auth/google/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.redirect("/login");
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    req.session.tokens = tokens; // Save tokens in session

    // Optionally get user profile
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: profile } = await oauth2.userinfo.get();

    // Save profile info in session
    req.session.user = profile;

    res.redirect("/home");
  } catch (error) {
    console.error("OAuth Callback Error:", error);
    res.render("login_students", { error: "Google Authentication Failed." });
  }
});

// Home Route
app.get("/home", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  try {
    // Example: List files in Drive
    const response = await drive.files.list({
      pageSize: 5,
      fields: "files(id, name)"
    });

    const files = response.data.files;

    res.render("home", {
      user: req.session.user,
      files: files,
      apiKey: process.env.API_KEY,
      rootFolderId: process.env.ROOT_FOLDER_ID
    });
  } catch (err) {
    console.error("Drive API error:", err);
    res.render("home", { user: req.session.user, files: [], apiKey: "", rootFolderId: "" });
  }
});

// Route to serve PDF files by ID
app.get("/pdf/:id", async (req, res) => {
  const fileId = req.params.id;

  try {
    const response = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );

    res.setHeader("Content-Type", "application/pdf");
    response.data.pipe(res);
  } catch (error) {
    console.error("Error serving PDF:", error);
    res.status(404).send("File not found or access denied.");
  }
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
        res.redirect("/home", {
            user
        });
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
        res.redirect("/home", {
            user
        });
    } catch (err) {
        console.error("Login error:", err);
        res.render("login_parents", { error: "An error occurred during login. Please try again." });
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

        // ✅ Store user in session
        req.session.user = user;

        // ✅ Redirect
        res.redirect("/home");
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