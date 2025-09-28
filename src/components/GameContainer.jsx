import PhaserGame from '../components/PhaserGame';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { usePhaser } from '../components/PhaserContext';

const GameContainer = () => {
  const { isLoading, loadingProgress } = usePhaser();

  return (
    <>
      {isLoading && <LoadingScreen progress={loadingProgress} />}
      <div id="phaser-game" style={{ display: isLoading ? "none" : "block" }}></div>
      <PhaserGame />
    </>
  );
};

export default GameContainer;