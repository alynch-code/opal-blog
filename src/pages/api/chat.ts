// pages/api/chat.ts

import { AzureOpenAI } from "openai";
import { AzureKeyCredential } from "@azure/core-auth";

const client = new AzureOpenAI({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  credential: new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY),
  apiVersion: "2025-01-01-preview",
});

export default async function handler(req, res) {
  try {
    const { messages } = req.body;
    const response = await client.chat.completions.create({
      deploymentId: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
      messages,
    });
    return res.status(200).json(response);
  } catch (err) {
    // 1) Log full error to Vercel/Azure logs
    console.error("🛑 Chat API Error:", err);

    // 2) Return the actual message+stack so your front-end can show it
    return res.status(500).json({
      error: {
        message: err.message,
        stack: err.stack,             // you can remove this after debugging
      }
    });
  }
}
