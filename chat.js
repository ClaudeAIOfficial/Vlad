const MAX_HISTORY = 12;

const VLAD_INSTRUCTIONS = `
You are Vlad, the AI character on the Vlad website.
You are a fictional AI character inspired by a tech-founder/trader aesthetic.
You are not the real Vlad Tenev and you are not an employee or representative of Robinhood.

Personality:
- calm, confident, sharp, casual
- concise by default
- conversational, never robotic
- interested in markets, startups, technology, crypto, stocks, product design, and trading psychology

Behavior:
- answer the user's actual question directly
- remember the recent conversation supplied to you
- keep most answers short unless the user asks for detail
- do not invent live prices, real positions, private information, or wallet activity
- if current/live data is not supplied, say that clearly rather than making it up
- refer to yourself simply as Vlad
`;

function extractText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const pieces = [];
  for (const item of data?.output || []) {
    if (item?.type !== "message") continue;
    for (const content of item?.content || []) {
      if (content?.type === "output_text" && typeof content?.text === "string") {
        pieces.push(content.text);
      }
    }
  }
  return pieces.join("\n").trim();
}

async function callOpenAI(apiKey, model, input) {
  return fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      instructions: VLAD_INSTRUCTIONS,
      input,
      max_output_tokens: 500
    })
  });
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is missing.");
    return res.status(503).json({
      error: "Vlad is not configured yet. Add OPENAI_API_KEY in Vercel → Settings → Environment Variables, then redeploy."
    });
  }

  let body = req.body || {};
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (_) { body = {}; }
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  const history = Array.isArray(body.history) ? body.history : [];

  if (!message) {
    return res.status(400).json({ error: "Say something to Vlad first." });
  }

  if (message.length > 4000) {
    return res.status(400).json({ error: "That message is too long." });
  }

  const safeHistory = history
    .filter(x =>
      x &&
      (x.role === "user" || x.role === "assistant") &&
      typeof x.content === "string"
    )
    .slice(-MAX_HISTORY)
    .map(x => ({
      role: x.role,
      content: x.content.slice(0, 4000)
    }));

  const input = [
    ...safeHistory,
    { role: "user", content: message }
  ];

  // Current low-cost GPT-5.6 model. Can be overridden in Vercel with OPENAI_MODEL.
  const model = process.env.OPENAI_MODEL || "gpt-5.6-luna";

  try {
    const response = await callOpenAI(apiKey, model, input);
    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error", response.status, JSON.stringify(data));

      const code = data?.error?.code || "";
      const type = data?.error?.type || "";

      if (response.status === 401) {
        return res.status(503).json({
          error: "Vlad's API key is invalid. Replace OPENAI_API_KEY in Vercel and redeploy."
        });
      }

      if (response.status === 429) {
        return res.status(429).json({
          error: "Vlad is getting too many requests right now. Try again shortly."
        });
      }

      if (code === "model_not_found" || type === "invalid_request_error") {
        return res.status(502).json({
          error: `Vlad's AI model is unavailable. Remove OPENAI_MODEL from Vercel or set it to gpt-5.6-luna.`
        });
      }

      return res.status(502).json({
        error: data?.error?.message || "Vlad could not answer right now."
      });
    }

    const answer = extractText(data);

    if (!answer) {
      console.error("Empty OpenAI response:", JSON.stringify(data));
      return res.status(502).json({
        error: "Vlad received an empty AI response. Try again."
      });
    }

    return res.status(200).json({ answer });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      error: "Vlad is temporarily unavailable. Try again in a moment."
    });
  }
};
