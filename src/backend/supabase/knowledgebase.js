import "dotenv/config";
import OpenAI from "openai";
import crypto from "crypto";
import { supabase } from "./supabaseClient.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Function to compute SHA256 hash of question + answer
function computeHash(question, answer) {
    return crypto.createHash("sha256").update(question + answer).digest("hex");
}

export async function addKnowledge(question, answer, tags = extractKeywords(question)) {
    const contentHash = computeHash(question, answer);

    const response = await openai.embeddings.create({
        input: question,
        model: "text-embedding-3-small",
    });

    const embedding = response.data[0].embedding;

    const { error } = await supabase.from("knowledge_base").insert([
        { question, answer, embedding, content_hash: contentHash, tags }
    ]);

    if (error) console.error("Error adding knowledge:", error);
    else console.log("Knowledge added successfully!");
}

export async function upsertKnowledgeBatch(entries) {
    const updatedEntries = [];

    for (const entry of entries) {
        const { tags, question, answer } = entry;
        const newHash = computeHash(question, answer);

        // Check if the content has changed
        const { data: existingData, error: fetchError } = await supabase
            .from("knowledge_base")
            .select("id, content_hash")
            .eq("question", question)
            .single();

        if (fetchError && fetchError.code !== "PGRST116") {
            console.error("Error checking existing knowledge:", fetchError);
            continue;
        }

        if (existingData && existingData.content_hash === newHash) {
            continue;
        }
        console.log(`Upserting: ${question}`);

        const response = await openai.embeddings.create({
            input: question, // `${question} - ${answer}`
            model: "text-embedding-3-small",
        });

        updatedEntries.push({
            question,
            answer,
            embedding: response.data[0].embedding,
            content_hash: newHash,
            tags: tags,
        });
    }

    if (updatedEntries.length === 0) {
        console.log("No updates needed.");
        return;
    }

    const { error } = await supabase.from("knowledge_base").upsert(updatedEntries, { onConflict: ["question"] });

    if (error) console.error("Error upserting knowledge:", error);
    else console.log("Knowledge batch upserted successfully!");
}

function extractKeywords(query) {
    // Basic keyword extraction: remove stop words and split
    return query
        .toLowerCase()
        .match(/[a-z]+/g);
}

export async function searchKnowledge(query) {
    const response = await openai.embeddings.create({
        input: query,
        model: "text-embedding-3-small",
    });

    const queryEmbedding = response.data[0].embedding;
    const queryTags = extractKeywords(query);

    const { data, error } = await supabase.rpc("match_knowledge", {
        query_embedding: queryEmbedding,
        query_tags: queryTags,
        match_threshold: 0.5,
        match_count: 3,
    });

    if (error) console.error("Search error:", error);
    if (!data || data.length === 0) {
        return `No knowledge found. DO NOT MAKE UP AN ANSWER. Reply with "I'm not sure, but you can ask the real Dylan! You can leave a message right through this chat! Just format the message as such: \"Name: [Your Name] Email: [Your Email] Message: [Your Message]\". Or you can send an email directly to dylan.li@uwaterloo.ca or connect with me on LinkedIn!"`;
    }
    
    return data.map((entry, index) => `(${index + 1}) ${entry.question} ${entry.answer}`).join("\n\n");
}

export async function updateKnowledge(id, newQuestion, newAnswer, newTags = extractKeywords(newQuestion)) {
    const newHash = computeHash(newQuestion, newAnswer);

    const { data: existingData, error: fetchError } = await supabase
        .from("knowledge_base")
        .select("content_hash")
        .eq("id", id)
        .single();

    if (fetchError) {
        console.error("Error checking existing knowledge:", fetchError);
        return;
    }

    if (existingData && existingData.content_hash === newHash) {
        console.log("Skipping update: No changes detected.");
        return;
    }

    const response = await openai.embeddings.create({
        input: newQuestion,
        model: "text-embedding-3-small",
    });

    const newEmbedding = response.data[0].embedding;

    const { error } = await supabase.from("knowledge_base").update({
        question: newQuestion,
        answer: newAnswer,
        embedding: newEmbedding,
        content_hash: newHash,
        tags: newTags
    }).eq("id", id);

    if (error) console.error("Update error:", error);
    else console.log("Knowledge updated!");
}

export async function deleteKnowledge(id) {
    const { error } = await supabase.from("knowledge_base").delete().eq("id", id);

    if (error) console.error("Delete error:", error);
    else console.log("Knowledge deleted!");
}
