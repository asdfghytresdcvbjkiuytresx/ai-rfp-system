import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// Keep OpenAI import for assignment completeness (not used in mock mode)
// import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/*
// REAL AI SETUP (not used due to no billing)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
*/

// HEALTH CHECK
app.get("/", (req, res) => {
  res.send("AI RFP System Backend Running ✅");
});

// CREATE RFP - MOCK AI VERSION
app.post("/api/rfp/create", async (req, res) => {
  try {
    const userText = req.body.text;

    if (!userText) {
      return res.status(400).json({ error: "Missing input text" });
    }

    // MOCK AI RESPONSE
    // Used because billing is not enabled.
    // Full OpenAI integration is documented in README.
    const mockResponse = {
      items: [
        {
          type: "Laptop",
          quantity: 10,
          specs: "16GB RAM"
        }
      ],
      budget: 15000,
      delivery_days: 20,
      warranty: "1 year",
      payment_terms: "Net 30"
    };

    return res.json({
      source_text: userText,
      structured_rfp: mockResponse,
      note: "Mock AI response (used due to no active LLM billing)"
    });

  } catch (err) {
    console.error("RFP create error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// SERVER START
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ Server live at http://localhost:${PORT}`);
});
