import React, { useState, useRef } from 'react';
import '../fonts/fonts.css';
import './player.css';

const YouTubePlayer = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const overlayRef = useRef(null);

  // Function that can be called from Phaser
  window.openYouTubePlaylist = (playlistId) => {
    setSelectedPlaylist(playlistId);
    setShowOverlay(true);
  };

  const closeOverlay = () => {
    setShowOverlay(false);
    setSelectedPlaylist(null);
  };

  // Dragging logic
  const handleMouseDown = (e) => {
    e.preventDefault();
    const overlay = overlayRef.current;
    const offsetX = e.clientX - overlay.getBoundingClientRect().left;
    const offsetY = e.clientY - overlay.getBoundingClientRect().top;

    const handleMouseMove = (e) => {
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - overlay.getBoundingClientRect().width, e.clientX - offsetX)),
        y: Math.max(0, Math.min(window.innerHeight - overlay.getBoundingClientRect().height, e.clientY - offsetY)),
      });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="youtube-player pixel-font">
      {/* Draggable Overlay with YouTube Embed */}
      {showOverlay && (
        <div
          className="overlay"
          ref={overlayRef}
          style={{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            cursor: 'move',
          }}
          onMouseDown={handleMouseDown}
        >
          <button onClick={closeOverlay} className="floating-close-button">
            &times;
          </button>
          <div className="iframe-container">
            <iframe
              style={{ borderRadius: '12px' }}
              width="540"
              height="300"
              src={`https://www.youtube.com/embed/videoseries?list=${selectedPlaylist}`} // &autoplay=1
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubePlayer;