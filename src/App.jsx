import { useState } from "react";
import SpotifyPlayer from './components/SpotifyPlayer';
import YouTubePlayer from './components/YouTubePlayer';
import DuolingoProfile from './components/DuolingoProfile';
import LeetCodeProfile from './components/LeetCodeProfile';
import Chatbot from "./components/chatbot.jsx";
import { PhaserProvider } from "./components/PhaserContext";
import GameContainer from "./components/GameContainer";
import "./App.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';

function App() {
  return (
    <PhaserProvider>
      <GameContainer />
      <SpotifyPlayer />
      <YouTubePlayer />
      <DuolingoProfile />
      <LeetCodeProfile />
      <Chatbot />
      <div className="bottom-left">
        <button
          className="button pixel-font"
          onClick={() => window.open("/Dylan_Li_Resume.pdf")}
        >
          Resumé
        </button>
        <button
          className="button fa-button pixel-font"
          onClick={() => window.open("https://www.linkedin.com/in/dylan-cjl-li", "_blank")}
        >
          <FontAwesomeIcon size="lg" icon={faLinkedin} />
        </button>
        <button
          className="button fa-button pixel-font"
          onClick={() => window.open("https://github.com/DylanLiTR", "_blank")}
        >
          <FontAwesomeIcon size="lg" icon={faGithub} />
        </button>
      </div>
    </PhaserProvider>
  );
}

export default App;