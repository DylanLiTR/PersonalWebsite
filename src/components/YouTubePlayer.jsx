import React, { useState, useRef, useEffect } from 'react';
import './player.css';
import { startDragging } from './overlay.js'

const WIDTH = 480;
const HEIGHT = 270;

const YouTubePlayer = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [isPlaylist, setIsPlaylist] = useState(true);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [position, setPosition] = useState({ x: window.innerWidth - WIDTH - 20, y: window.innerHeight - HEIGHT - 20 });
  const overlayRef = useRef(null);

  // Function that can be called from Phaser
  window.openYouTubePlaylist = (playlistId, isPlaylist) => {
    setSelectedPlaylist(playlistId);
    setShowOverlay(true);
    setIsPlaylist(isPlaylist);
  };

  const closeOverlay = () => {
    setShowOverlay(false);
    setSelectedPlaylist(null);
  };

  useEffect(() => {
    setPosition({
      x: Math.max(10, window.innerWidth - getDynamicWidth() - 20),
      y: Math.max(10, window.innerHeight - getDynamicHeight() - 20),
    });
  }, []);

  // Responsive width & height
  const getDynamicWidth = () => Math.min(WIDTH, window.innerWidth * 0.9);
  const getDynamicHeight = () => (getDynamicWidth() / 16) * 9; // Maintain 16:9 aspect ratio

  return (
    <div className="youtube-player pixel-font">
      {/* Draggable Overlay with YouTube Embed */}
      {showOverlay && (
        <div
          className="overlay"
          ref={overlayRef}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: `${getDynamicWidth()}px`,
            height: `${getDynamicHeight()}px`,
          }}
          onMouseDown={(e) => startDragging(e.clientX, e.clientY, overlayRef.current, setPosition)}
          onTouchStart={(e) => startDragging(e.touches[0].clientX, e.touches[0].clientY, overlayRef.current, setPosition)}
        >
          <button onClick={closeOverlay} className="floating-close-button">
            &times;
          </button>
          <div className="iframe-container">
            <iframe
              width={WIDTH}
              height={HEIGHT}
              src={`https://www.youtube.com/embed/${isPlaylist?"videoseries?list=" : ""}${selectedPlaylist}`} // &autoplay=1
              title="YouTube video player"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubePlayer;