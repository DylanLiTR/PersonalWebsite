import "dotenv/config";

import OpenAI from "openai";
const client = new OpenAI();

export const getResponse = async (req, res) => {
  try {
      const { messages } = req.body;

      const completion = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: "You are a chatbot that speaks exactly like Dylan Li." }, ...messages],
      }, {
          headers: {
              "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
              "Content-Type": "application/json"
          },
          max_tokens: 300
      });

      res.json(completion);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};