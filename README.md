# dylan-li.com
This is the repository for my personal website! It was a personal project made with love and passion, not for a particular purpose. Hope you like it!
![website preview](/website.png)

### Tech Stack
Languages: JavaScript
Frontend: React, Vite, Axios, Phaser, Vercel
Backend: Express, Node.js, Render, Supabase, OpenAI
APIs: Duolingo, YouTube, LeetCode

### Run instructions
Backend server: `node src/backend/server.js` <br>
Frontend: `npm run dev` <br>
Upsert Knowledgebase: `node ./src/backend/supabase/loadKnowledge.js` <br>
Add data to `knowledge.json` in format `{ "tags": [], "question": "", "answer": "" },`

### Improvements
- Fix scroll to zoom using mouse
- Improve minimap sizing
- Improve chatbot style
