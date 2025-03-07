const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { Octokit } = require("@octokit/rest");
const dotenv = require("dotenv");
const cors = require("cors");
const nodemailer = require("nodemailer");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Enable CORS & JSON Parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files (Frontend)
app.use(express.static("public"));

// ✅ Serve index.html for the root route `/`
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Set up Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ GitHub Authentication
const octokit = new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN });
const REPO_OWNER = "Eshetu70";  
const REPO_NAME = "contacts";   

// ✅ Contact Form Submission
app.post("/contact", upload.single("file"), async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const file = req.file ? req.file.buffer.toString("base64") : null;
        const fileName = req.file ? req.file.originalname : null;

        // ✅ Save Contact Data
        const contactData = { name, email, message, fileName, timestamp: new Date() };
        const contactsFilePath = path.join(__dirname, "data", "contacts.json");

        let contacts = [];
        if (fs.existsSync(contactsFilePath)) {
            contacts = JSON.parse(fs.readFileSync(contactsFilePath));
        }
        contacts.push(contactData);
        fs.writeFileSync(contactsFilePath, JSON.stringify(contacts, null, 2));

        // ✅ Upload file to GitHub (if provided)
        if (file && fileName) {
            try {
                await octokit.repos.createOrUpdateFileContents({
                    owner: REPO_OWNER,
                    repo: REPO_NAME,
                    path: `uploads/${fileName}`,
                    message: `New contact submission file: ${fileName}`,
                    content: file,
                    branch: "main",
                });
                console.log("✅ File uploaded to GitHub successfully");
            } catch (error) {
                console.error("❌ GitHub file upload failed:", error);
            }
        }

        // ✅ Send Email Notification
        try {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: "eshetuwek1@gmail.com",
                subject: "New Contact Submission",
                text: `New contact received from ${name} (${email}):\n\n${message}`,
            };

            await transporter.sendMail(mailOptions);
            console.log("✅ Email sent successfully");
        } catch (error) {
            console.error("❌ Email sending failed:", error);
        }

        res.json({ message: "Contact submitted successfully!" });

    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Admin Page - View Contact Submissions
app.get("/admin/contacts", (req, res) => {
    const contactsFilePath = path.join(__dirname, "data", "contacts.json");

    if (!fs.existsSync(contactsFilePath)) {
        return res.json([]);
    }

    const contacts = JSON.parse(fs.readFileSync(contactsFilePath));
    res.json(contacts);
});

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
