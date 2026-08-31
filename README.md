# Vlad AI — fixed version

Changes:
- Removed "WHAT IS VLAD TRADING"
- Fixed the AI backend to use `gpt-5.6-luna`
- Better Vercel/OpenAI error handling
- No wallet connection or user login
- Text chat, conversation history, microphone input, and speech output remain enabled

## Vercel
Add this Environment Variable:

`OPENAI_API_KEY` = your OpenAI API key

Optional:
`OPENAI_MODEL` = `gpt-5.6-luna`

Important: after adding/changing an environment variable, redeploy the project.
