import "./LoadingScreen.css"; // Import the CSS file

const LoadingScreen = ({ progress }) => {
  return (
    <div className="loadingScreen">
      <div className="progressBar">
        <div className="progressFill" style={{ width: `${progress}%` }}></div>
      </div>
      <p>Loading... {Math.round(progress)}%</p>
    </div>
  );
};

export default LoadingScreen;
