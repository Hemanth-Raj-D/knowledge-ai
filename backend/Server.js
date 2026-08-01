const multer = require("multer");
const pdf = require("pdf-parse");
const fs = require("fs");

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const Groq = require("groq-sdk");

const app = express();

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const upload = multer({
  dest: "uploads/",
});

let pdfText = "";

// Automatically load React.pdf when the server starts
async function loadPDF() {
  try {
    const dataBuffer = fs.readFileSync("knowledge/React.pdf");
    const data = await pdf(dataBuffer);

    pdfText = data.text;

    console.log("✅ React.pdf loaded successfully");
  } catch (error) {
    console.error("❌ Error loading PDF:", error);
  }
}

// Chat API
app.post("/chat", async (req, res) => {
  try {
    const { question } = req.body;

    if (!pdfText) {
      return res.json({
        answer: "Knowledge PDF not loaded.",
      });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `
You are Knowledge AI.

Answer ONLY from the following PDF content.

PDF Content:
${pdfText.substring(0, 5000)}

Question:
${question}

If the answer is not present in the PDF, reply:

"I couldn't find this information in the knowledge book."
`,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    res.json({
      answer: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      answer: "Something went wrong!",
    });
  }
});

// Optional upload endpoint
app.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No PDF uploaded!",
      });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdf(dataBuffer);

    pdfText = data.text;

    fs.unlinkSync(req.file.path);

    res.json({
      message: "PDF uploaded and read successfully!",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to read PDF!",
    });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  await loadPDF();
  console.log(`🚀 Server running on port ${PORT}`);
});