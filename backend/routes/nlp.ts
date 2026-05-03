import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

enum Priority {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW"
}

// POST /api/nlp/predict-priority
router.post("/predict-priority", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ error: "Missing description" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are a task priority classifier. Given the following task description, classify its priority as exactly one of: HIGH, MEDIUM, or LOW. Consider urgency, complexity, and impact. Respond with ONLY the priority level word, nothing else.\n\nTask description: "${description}"`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text =
            data?.candidates?.[0]?.content?.parts?.[0]?.text
              ?.trim()
              ?.toUpperCase() || "";

          if (text.includes("HIGH")) return res.json({ priority: Priority.HIGH });
          if (text.includes("LOW")) return res.json({ priority: Priority.LOW });
          return res.json({ priority: Priority.MEDIUM });
        }
      } catch (error) {
        console.error("Gemini API error, falling back to keyword analysis:", error);
      }
    }

    // Keyword-based fallback
    res.json({ priority: keywordPriorityAnalysis(description) });
  } catch (error) {
    res.status(500).json({ error: "Failed to predict priority" });
  }
});

function keywordPriorityAnalysis(description: string): Priority {
  const text = description.toLowerCase();

  const highPriorityKeywords = [
    "urgent", "critical", "asap", "immediately", "emergency", "blocker",
    "breaking", "outage", "security", "vulnerability", "production",
    "hotfix", "crash", "deadline", "p0", "p1", "showstopper", "data loss", "regression",
  ];

  const lowPriorityKeywords = [
    "nice to have", "eventually", "when possible", "low priority", "minor",
    "cosmetic", "refactor", "cleanup", "documentation", "typo", "nice-to-have",
    "backlog", "polish", "optimization", "p3", "p4",
  ];

  const highScore = highPriorityKeywords.filter((kw) => text.includes(kw)).length;
  const lowScore = lowPriorityKeywords.filter((kw) => text.includes(kw)).length;

  if (highScore > lowScore) return Priority.HIGH;
  if (lowScore > highScore) return Priority.LOW;

  return Priority.MEDIUM;
}

export default router;
