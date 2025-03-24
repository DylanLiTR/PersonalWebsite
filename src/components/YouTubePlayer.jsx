import React, { useState, useRef, useEffect } from 'react';
import './player.css';

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

  // Dragging logic
  const startDragging = (clientX, clientY) => {
    const overlay = overlayRef.current;
    const offsetX = clientX - overlay.getBoundingClientRect().left;
    const offsetY = clientY - overlay.getBoundingClientRect().top;

    const moveOverlay = (clientX, clientY) => {
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - overlay.offsetWidth, clientX - offsetX)),
        y: Math.max(0, Math.min(window.innerHeight - overlay.offsetHeight, clientY - offsetY)),
      });
    };

    const handleMouseMove = (e) => moveOverlay(e.clientX, e.clientY);
    const handleTouchMove = (e) => moveOverlay(e.touches[0].clientX, e.touches[0].clientY);

    const stopDragging = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', stopDragging);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopDragging);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', stopDragging);
  };

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
          onMouseDown={(e) => startDragging(e.clientX, e.clientY)}
          onTouchStart={(e) => startDragging(e.touches[0].clientX, e.touches[0].clientY)}
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