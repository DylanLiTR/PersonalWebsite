// server.js
import express from "express";
import cors from "cors";

import DuolingoRouter from "./routes/Duolingo.js"
import LeetCodeRouter from "./routes/LeetCode.js"
import SpotifyRouter from "./routes/Spotify.js"
import chatbotRouter from "./routes/chatbot.js"

const app = express();
const port = 3001;

app.use(cors({ origin: ["https://dylan-li.com", "http://localhost:5173"] }));
app.use(express.json());

app.use("/spotify/", SpotifyRouter);
app.use("/duolingo/", DuolingoRouter);
app.use("/leetcode/", LeetCodeRouter);
app.use("/npc/", chatbotRouter);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
