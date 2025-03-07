const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { Octokit } = require("@octokit/rest");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());

// Set up Multer for file uploads
const upload = multer({ dest: "uploads/" });

// GitHub Authentication
const octokit = new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN });
const REPO_OWNER = "Eshetu70";
const REPO_NAME = "contacts";

// File Upload Route
app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        const filePath = req.file.path;
        const fileName = req.file.originalname;
        const fileContent = fs.readFileSync(filePath, "utf8");

        // Upload to GitHub
        await octokit.repos.createOrUpdateFileContents({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: `uploads/${fileName}`,
            message: `New file uploaded: ${fileName}`,
            content: Buffer.from(fileContent).toString("base64"),
            branch: "main",
        });

        res.json({ message: "File uploaded successfully to GitHub!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Serve Static Files (Frontend)
app.use(express.static("public"));

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
