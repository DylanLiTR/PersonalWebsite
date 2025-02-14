import React, { useState, useEffect, useRef } from 'react';
import '../fonts/fonts.css';
import '../App.css';

const SpotifyPlayer = () => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [error, setError] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
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

  // Fetch currently playing track
  const getCurrentTrack = async () => {
    try {
      const response = await fetch('http://localhost:3001/currently-playing');
      if (response.status === 204) {
        setCurrentTrack(null);
        return;
      }
      const data = await response.json();
      setCurrentTrack(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to fetch current track');
    }
  };

  // Poll for currently playing track
  useEffect(() => {
    getCurrentTrack();
    const interval = setInterval(getCurrentTrack, 1000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    console.log(error);
    return;
  }

  return (
    <div className="spotify-player pixel-font">
      <div className="player-container">
        <div className="track-info">
          {currentTrack?.item?.album?.images?.[0] && (
            <img 
              src={currentTrack.item.album.images[0].url} 
              alt="Album Art" 
              className="album-art"
            />
          )}
          <div className="track-details">
            <div className="player-controls">
              {currentTrack?.is_playing ? (
                <span className="play-status playing">▶ Léi is playing</span>
              ) : (
                <span className="play-status paused">❚❚ Léi has paused</span>
              )}
            </div>
            <div className="track-name">
              {currentTrack?.item?.name || 'No track playing'}
            </div>
            <div className="artist-names">
              {currentTrack?.item?.artists?.map(artist => artist.name).join(', ')}
            </div>
          </div>
          <div className="playlist-container">
            {/* Playlist Buttons (to the right of the player) */}
            <div className="playlist-title">Léi's Playlists</div>
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
        </div>
      </div>

      {/* Draggable Overlay with Spotify Embed */}
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
          <button onClick={closeOverlay} className="close-button">
            &times;
          </button>
          <div className="iframe-container">
            <iframe
              style={{ borderRadius: '12px' }}
              src={`https://open.spotify.com/embed/playlist/${selectedPlaylist}?utm_source=generator&theme=0`}
              width="300"
              height="360"
              allowFullScreen=""
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpotifyPlayer;