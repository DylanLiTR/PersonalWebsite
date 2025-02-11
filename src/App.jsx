import { useEffect } from "react";
import Phaser from "phaser";
import MainScene from "./scenes/MainScene";
import SpotifyPlayer from './components/SpotifyPlayer';

function App() {
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
    
    const game = new Phaser.Game(config);
    return () => {
      game.destroy(true); // Destroy game on unmount
    };
  }, []);

  return (
    <div>
      <div id="phaser-game"></div>
      <SpotifyPlayer /> {/* Display Now Playing */}
    </div>
  );
}

export default App;