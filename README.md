# Vlad AI Website

This version has no wallet connection or visitor login.

## What works
- Ask Vlad anything in the chat box
- Real AI replies through a server-side API route
- Conversation memory for the current browser session
- Vlad's latest answer appears in the speech bubble
- Microphone input in supported browsers
- Optional browser text-to-speech
- "WHAT IS VLAD TRADING" asks Vlad directly

## Deploy on Vercel
1. Upload this project to Vercel.
2. In Vercel → Project Settings → Environment Variables, add:
   - `OPENAI_API_KEY` = your OpenAI API key
   - `OPENAI_MODEL` = `gpt-5.4-mini` (optional; this is already the default)
3. Redeploy.

Visitors do **not** need to connect a wallet, create an account, or enter an API key.
The OpenAI key stays on the server and is never included in the browser code.

## Important
Do not paste an OpenAI API key directly into `index.html` or other frontend JavaScript.
For a public launch, add proper rate limiting / abuse protection so strangers cannot run up API usage.


## Vercel build fix
The previous `vercel.json` contained a `functions` pattern that Vercel rejected.
This version removes that pattern. Vercel will automatically detect `api/chat.js`
as a Serverless Function.

Deploy the project root exactly as-is. Do not set the Root Directory to `/api`.
