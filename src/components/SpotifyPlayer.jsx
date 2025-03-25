import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";
import './player.css';
import { startDragging } from './overlay.js'

const WIDTH = 300;
const HEIGHT = 360;

const SpotifyPlayer = () => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [error, setError] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [position, setPosition] = useState({ x: window.innerWidth - WIDTH - 20, y: window.innerHeight - HEIGHT - 20 });
  const overlayRef = useRef(null);

  const playlists = [
    { id: '76dYmvEpokqCq7HqleQd4x', name: '🌊' },
    { id: '4P9nNPCGiCHXRq1Zz5oCB2', name: '♾️' },
    { id: '7hYQbCLuMQK1TNtWRG4Y9g', name: '⛰️' },
  ];

  const handlePlaylistClick = (playlistId) => {
    setSelectedPlaylist(playlistId);
    setShowOverlay(true);
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

    const updatePosition = () => {
      if (!overlayRef.current) return;
      setPosition((prev) => ({
        x: Math.min(
          Math.max(10, prev.x),
          window.innerWidth - getDynamicWidth() - 10
        ),
        y: Math.min(
          Math.max(10, prev.y),
          window.innerHeight - getDynamicHeight() - 10
        ),
      }));
    };
  
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, []);

  // Responsive width & height
  const getDynamicWidth = () => Math.min(WIDTH, window.innerWidth * 0.9);
  const getDynamicHeight = () => (getDynamicWidth() / 5) * 6;

  // Fetch currently playing track
  const getCurrentTrack = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/spotify/currently-playing`);

      if (response.status === 204) {
        setCurrentTrack(null);
        return;
      }

      setCurrentTrack(response.data);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to fetch current track");
    }
  };

  // Poll for currently playing track
  useEffect(() => {
    getCurrentTrack();
    const interval = setInterval(getCurrentTrack, 3000);
    return () => clearInterval(interval);
  }, []);

  // Pixelate album image
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!currentTrack?.item?.album?.images?.[0]?.url) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = "anonymous"; // Allow cross-origin loading if needed
    img.src = currentTrack.item.album.images[0].url;

    img.onload = () => {
      // Set canvas dimensions to match the image
      canvas.width = img.width;
      canvas.height = img.height;

      // Default number of blocks for downsampling
      const blocks = 24;

      // Step 1: Draw the image at a smaller size (downsample)
      ctx.imageSmoothingEnabled = true; // Improve quality of first step
      ctx.drawImage(img, 0, 0, blocks, blocks);

      // Step 2: Scale the downsampled image back up (pixelate)
      ctx.imageSmoothingEnabled = false; // Disable smoothing for pixelation
      ctx.drawImage(canvas, 0, 0, blocks, blocks, 0, 0, canvas.width, canvas.height);
    };
  }, [currentTrack]);

  if (error) {
    console.log(error);
    return;
  }

  return (
    <div>
      <div className="spotify-player pixel-font">
        <div className="player-container">
          <div className="track-info">
            {currentTrack?.item?.album?.images?.[0] && (
              <canvas ref={canvasRef} className="album-art" />
            )}
            <div className="track-details">
              <div className="player-controls">
                {currentTrack?.is_playing ? (
                  <span className="play-status playing">▶ Dylan is playing</span>
                ) : (
                  <span className="play-status paused">❚❚ Dylan has paused</span>
                )}
              </div>
              <div className="track-name">
                {currentTrack?.item?.name || 'No track playing'}
              </div>
              <div className="artist-names">
                {currentTrack?.item?.artists?.map(artist => artist.name).join(', ')}
              </div>
            </div>
            {window.innerWidth > 500 && <div className="playlist-container">
              {/* Playlist Buttons (to the right of the player) */}
              <div className="playlist-title">Dylan's Playlists</div>
              <div className="playlist-buttons">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => handlePlaylistClick(playlist.id)}
                    className="playlist-button pixel-button"
                  >
                    {playlist.name}
                  </button>
                ))}
              </div>
            </div>
            }
          </div>
        </div>
      </div>

      {/* Draggable Overlay with Spotify Embed */}
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
          onMouseDown={(e) => {
            e.preventDefault();
            startDragging(e.clientX, e.clientY, overlayRef.current, setPosition)
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            startDragging(e.touches[0].clientX, e.touches[0].clientY, overlayRef.current, setPosition)
          }}
        >
          <button onClick={closeOverlay} className="floating-close-button">
            &times;
          </button>
          <div className="iframe-container">
            <iframe
              src={`https://open.spotify.com/embed/playlist/${selectedPlaylist}?utm_source=generator&theme=0`}
              width={getDynamicWidth()}
              height={getDynamicHeight()}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpotifyPlayer;