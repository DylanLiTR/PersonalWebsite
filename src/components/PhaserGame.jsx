import { useEffect } from 'react';
import Phaser from 'phaser';
import MainScene from '../scenes/MainScene';
import { usePhaser } from '../components/PhaserContext';

const PhaserGame = () => {
  const { sceneRef, setIsLoading, setLoadingProgress } = usePhaser();

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 200 },
          debug: false,
        },
      },
      pixelArt: true,
      scene: [MainScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    const game = new Phaser.Game(config);

    // Handle loading progress
    game.events.on("progress", (progress) => {
      setLoadingProgress(progress * 100);
    });

    // Handle loading completion
    game.events.once("loadingComplete", () => {
      setTimeout(() => {
        setIsLoading(false); // Hide the loading screen after a delay
      }, 1000);
    });

    // Set the scene reference when the scene is ready
    game.events.once('ready', () => {
      sceneRef.current = game.scene.getScene('MainScene');
    });

    return () => {
      game.destroy(true); // Destroy game on unmount
    };
  }, [sceneRef, setIsLoading, setLoadingProgress]);

  return null;
};

export default PhaserGame;