import "dotenv/config";
import { searchKnowledge } from "../supabase/knowledgebase.js";
import { styleGuide, exampleConversations } from "../supabase/persona.js";

import OpenAI from "openai";
const client = new OpenAI();

export const getResponse = async (req, res) => {
    try {
        const { messages } = req.body;

        const knowledgeBaseResponse = await searchKnowledge(messages[messages.length - 1].content);
        // console.log(knowledgeBaseResponse);
        const systemPrompt = `
${styleGuide}

Use the following knowledge if it's relevant to the user's message:
${knowledgeBaseResponse}

To reiterate, if the user's message is unrelated to stored knowledge, DO NOT UNDER ANY CIRCUMSTANCES MAKE UP FALSE INFORMATION.
        `;
        console.log(systemPrompt);

        const completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: systemPrompt }, ...exampleConversations, ...messages],
        }, {
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            max_tokens: 300
        });

        res.json(completion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};