import fs from 'fs';
import { upsertKnowledgeBatch } from './knowledgebase.js';

const rawData = fs.readFileSync('./src/backend/supabase/knowledge.json');
const knowledgeEntries = JSON.parse(rawData);

(async () => {
  await upsertKnowledgeBatch(knowledgeEntries);
  console.log("Knowledge loaded successfully!");
})();
