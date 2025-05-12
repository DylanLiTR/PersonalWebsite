import "dotenv/config";
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function runFinetuning() {
  try {
    const filePath = path.resolve('./src/backend/supabase/finetuning.jsonl');

    // Upload file
    const uploadedFile = await openai.files.create({
      file: fs.createReadStream(filePath),
      purpose: 'fine-tune',
    });

    console.log('✅ File uploaded:', uploadedFile.id);

    // Start fine-tuning
    const fineTune = await openai.fineTuning.jobs.create({
      training_file: uploadedFile.id,
      model: 'gpt-4o-mini-2024-07-18',
    });

    console.log('🚀 Finetuning started. Job ID:', fineTune.id);

    // Optional: Poll for completion
    const checkStatus = async () => {
      let job = await openai.fineTuning.jobs.retrieve(fineTune.id);
      if (job.status === 'succeeded') {
        console.log('🎉 Finetuning complete. Model name:', job.fine_tuned_model);
      } else if (job.status === 'failed') {
        console.error('❌ Finetuning failed.');
      } else {
        console.log(`⏳ Status: ${job.status}...`);
        setTimeout(checkStatus, 10000); // Check every 10 sec
      }
    };

    checkStatus();

  } catch (error) {
    console.error('⚠️ Error during finetuning:', error);
  }
}

runFinetuning();
