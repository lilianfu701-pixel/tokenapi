import { API_BASE } from "./i18n";

// Shared, language-neutral homepage code sample. All copy lives in ./locales/*.
export const heroCode = `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "${API_BASE}",
  apiKey: process.env.TOKENAPI_KEY,
});

const res = await client.chat.completions
  .create({
    model: "tokenapi-pro",
    messages: [
      { role: "user", content: "Hello!" },
    ],
  });`;
