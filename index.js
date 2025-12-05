import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ------------------------------------------------------------------
// IN-MEMORY STORAGE (NO DATABASE)
// ------------------------------------------------------------------
let vendors = [];
let proposals = [];

// ------------------------------------------------------------------
// HEALTH CHECK
// ------------------------------------------------------------------
app.get("/", (req, res) => {
  res.send("AI RFP System Backend Running ✅");
});

// ------------------------------------------------------------------
// CREATE RFP - MOCK AI VERSION
// ------------------------------------------------------------------
app.post("/api/rfp/create", async (req, res) => {
  try {
    const userText = req.body.text;

    if (!userText) {
      return res.status(400).json({ error: "Missing input text" });
    }

    // ✅ MOCK AI RESPONSE
    const mockRfp = {
      items: [
        { type: "Laptop", quantity: 10, specs: "16GB RAM" }
      ],
      budget: 15000,
      delivery_days: 20,
      warranty: "1 year",
      payment_terms: "Net 30"
    };

    res.json({
      source_text: userText,
      structured_rfp: mockRfp,
      note: "Mock AI response (OpenAI disabled for demo)"
    });

  } catch (err) {
    console.error("RFP Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// ------------------------------------------------------------------
// ADD VENDOR
// ------------------------------------------------------------------
app.post("/api/vendors", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Vendor name and email required" });
  }

  const vendor = {
    id: vendors.length + 1,
    name,
    email
  };

  vendors.push(vendor);

  res.json({
    message: "Vendor added successfully",
    vendor
  });
});

// ------------------------------------------------------------------
// LIST VENDORS
// ------------------------------------------------------------------
app.get("/api/vendors", (req, res) => {
  res.json(vendors);
});


// ------------------------------------------------------------------
// SEND RFP TO ALL VENDORS (SIMULATION)
// ------------------------------------------------------------------
app.post("/api/send-rfp", (req, res) => {

  if (vendors.length === 0) {
    return res.json({
      message: "No vendors available to receive the RFP"
    });
  }

  const sent = vendors.map(vendor => ({
    vendor_id: vendor.id,
    vendor_name: vendor.name,
    email: vendor.email,
    status: "RFP sent (simulated)"
  }));

  res.json({
    message: "RFP successfully sent to all vendors (simulation)",
    sent_to: sent
  });
});

// ------------------------------------------------------------------
// PARSE VENDOR PROPOSAL (MOCK AI)
// ------------------------------------------------------------------
app.post("/api/proposals/parse", (req, res) => {
  const { vendor_id, proposal_text } = req.body;

  if (!vendor_id || !proposal_text) {
    return res.status(400).json({
      error: "vendor_id and proposal_text are required"
    });
  }

  // ✅ MOCK AI TEXT EXTRACTION
  // In real AI, this would be replaced by LLM prompt parsing

  // Extract first number as price
  const priceMatch = proposal_text.match(/\$?(\d{4,6})/);
  const price = priceMatch ? Number(priceMatch[1]) : null;

  // Extract delivery days
  const daysMatch = proposal_text.match(/(\d+)\s*days/i);
  const delivery_days = daysMatch ? Number(daysMatch[1]) : null;

  // Extract warranty
  const warrantyMatch = proposal_text.match(/(\d+)\s*year/i);
  const warranty = warrantyMatch ? `${warrantyMatch[1]} years` : null;

  const proposal = {
    id: proposals.length + 1,
    vendor_id,
    proposal_text,
    price,
    delivery_days,
    warranty
  };

  proposals.push(proposal);

  res.json({
    message: "Proposal parsed successfully (mock AI)",
    proposal
  });
});

// ------------------------------------------------------------------
// COMPARE PROPOSALS & RECOMMEND BEST VENDOR
// ------------------------------------------------------------------
app.get("/api/rfp/compare", (req, res) => {

  if (proposals.length === 0) {
    return res.json({
      message: "No vendor proposals available for comparison"
    });
  }

  // Simple scoring logic
  const scored = proposals.map(p => {
    let score = 0;

    // Lower price is better
    if (p.price) score += 100000 / p.price;

    // Faster delivery is better
    if (p.delivery_days) score += 100 / p.delivery_days;

    // Longer warranty is better
    if (p.warranty) {
      const years = parseInt(p.warranty);
      score += years * 10;
    }

    return {
      ...p,
      score: Number(score.toFixed(2))
    };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  const winner = scored[0];

  res.json({
    message: "Vendor comparison completed",
    recommended_vendor: winner,
    comparison_table: scored
  });
});

// ------------------------------------------------------------------
// SERVER START
// ------------------------------------------------------------------
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ Server live at http://localhost:${PORT}`);
});
