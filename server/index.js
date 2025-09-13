const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const axios = require("axios");

require("./passport");

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

app.use(session({
  secret: "supersecret",           // move to env variable
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }        // true if using HTTPS
}));
app.use(passport.initialize());
app.use(passport.session());

// OAuth routes
app.get("/auth/google",
  passport.authenticate("google", { 
    scope: [
      "email",
      "profile",
      "https://www.googleapis.com/auth/cloud-platform",
      "https://www.googleapis.com/auth/generative-language.retriever",
    ],
    accessType: "offline",
    prompt: "consent"
  })
);

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("http://localhost:5173"); // back to frontend
  }
);

// Gemini proxy endpoint
app.post("/api/gemini", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });

  try {
    const { prompt } = req.body;

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      },
      {
        headers: {
          Authorization: `Bearer ${req.user.accessToken}`,
          "Content-Type": "application/json",
          "x-goog-user-project": "agent-weights"
        }
      }
    );

    const geminiResponse = response.data;
    const firstCandidate = geminiResponse.candidates?.[0];

    // Safely extract text
    let replyText = "";
    if (firstCandidate?.content?.parts) {
      replyText = firstCandidate.content.parts.map(part => part.text || "").join("\n");
    }

    console.log("Reply text:", replyText);
    console.log("Full Gemini response:", geminiResponse);

    res.json({ reply: replyText || "No response 🤔" });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to call Gemini" });
  }
});




app.listen(5004, () => console.log("✅ Backend running on http://localhost:5004"));
