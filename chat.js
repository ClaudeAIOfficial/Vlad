const MAX_HISTORY = 10;

const VLAD_INSTRUCTIONS = `
You are Vlad, the AI character on the Vlad website.
You are a fictional AI character, not the real Vlad Tenev and not an employee or representative of Robinhood.
Your personality is calm, confident, sharp, casual, and concise.
You like markets, startups, technology, crypto, stocks, product design, and trading psychology.
Keep most answers to 1-4 short paragraphs unless the user explicitly asks for detail.
Do not pretend you have live positions, a live wallet, real-time prices, or private information unless data is actually provided in the conversation.
If asked what you are trading, explain your current fictional thesis rather than inventing real holdings.
Never tell the user that you are ChatGPT. Refer to yourself simply as Vlad.
`;

function extractText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const pieces = [];
  for (const item of data?.output || []) {
    if (item?.type !== "message") continue;
    for (const content of item?.content || []) {
      if (content?.type === "output_text" && content?.text) {
        pieces.push(content.text);
      }
    }
  }
  return pieces.join("\n").trim();
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "Vlad's AI is not configured yet. Add OPENAI_API_KEY in the server environment."
    });
  }

  const body = req.body || {};
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const history = Array.isArray(body.history) ? body.history : [];

  if (!message) {
    return res.status(400).json({ error: "Say something to Vlad first." });
  }

  if (message.length > 3000) {
    return res.status(400).json({ error: "That message is too long." });
  }

  const safeHistory = history
    .filter(x => x && (x.role === "user" || x.role === "assistant") && typeof x.content === "string")
    .slice(-MAX_HISTORY)
    .map(x => `${x.role === "user" ? "User" : "Vlad"}: ${x.content.slice(0, 3000)}`)
    .join("\n");

  const input = `${safeHistory ? safeHistory + "\n" : ""}User: ${message}`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
        instructions: VLAD_INSTRUCTIONS,
        input,
        max_output_tokens: 350
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);
      return res.status(response.status >= 500 ? 502 : response.status).json({
        error: data?.error?.message || "Vlad's AI request failed."
      });
    }

    const answer = extractText(data);
    if (!answer) {
      return res.status(502).json({ error: "Vlad returned an empty answer." });
    }

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ answer });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Vlad is temporarily unavailable." });
  }
};
