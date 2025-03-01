import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import LoadingScreen from "./LoadingScreen"
import MainScene from "./scenes/MainScene";
import SpotifyPlayer from './components/SpotifyPlayer';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const phaserRef = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,  // Set width to full page
      height: window.innerHeight, // Set height to full page
      pixelArt: true,  // Keeps pixel art crisp
      scene: [MainScene],
      scale: {
        mode: Phaser.Scale.RESIZE, // 🚀 Makes Phaser resize dynamically
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    phaserRef.current = new Phaser.Game(config);

    phaserRef.current.events.on("progress", (progress) => {
      setLoadingProgress(progress * 100);
    });

    phaserRef.current.events.once("loadingComplete", () => {
      setTimeout(() => {
        setIsLoading(false); // Hide the loading screen after the delay
      }, 1000);
    });

    return () => {
      phaserRef.current.destroy(true); // Destroy game on unmount
    };
  }, []);

  return (
    <div>
      {isLoading && <LoadingScreen progress={loadingProgress}/>}
      <div id="phaser-game" style={{ display: isLoading ? "none" : "block" }}></div>
      <SpotifyPlayer /> {/* Display Now Playing */}
    </div>
  );
}

export default App;