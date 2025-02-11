import { useState, useEffect } from "react";
import { loginWithSpotify, handleCallback } from "./SpotifyAuth";

export default function SpotifyPlayer() {
  const [accessToken, setAccessToken] = useState(() => {
    const token = localStorage.getItem('spotify_access_token');
    console.log('Initial access token from localStorage:', token);
    return token;
  });
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Handle the callback from Spotify
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    console.log('URL code parameter:', code);
    
    if (code) {
      handleCallback(code).then(token => {
        console.log('Received token after callback:', token);
        if (token) {
          setAccessToken(token);
          // Clear the URL parameters
          window.history.pushState({}, null, '/');
        }
      });
    }
  }, []);

  const checkPremiumStatus = async (token) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('User profile:', data);
      return data.product === 'premium';
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  };
  
  // In your SpotifyPlayer component, update the player initialization useEffect:
  useEffect(() => {
    if (!accessToken) return;
  
    // Check premium status before initializing player
    checkPremiumStatus(accessToken).then(isPremium => {
      if (!isPremium) {
        setError('Spotify Premium is required to use the Web Playback SDK');
        return;
      }
  
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
  
      document.body.appendChild(script);
  
      window.onSpotifyWebPlaybackSDKReady = () => {
        const spotifyPlayer = new window.Spotify.Player({
          name: "Pixel Art Player",
          getOAuthToken: cb => {
            console.log('Token requested by player');
            cb(accessToken);
          },
          volume: 0.5,
        });

        spotifyPlayer.addListener('ready', ({ device_id }) => {
          console.log('Player ready with Device ID:', device_id);
        });

        spotifyPlayer.addListener('not_ready', ({ device_id }) => {
          console.log('Device ID is not ready:', device_id);
        });

        spotifyPlayer.addListener('initialization_error', ({ message }) => {
          console.error('Player initialization error:', message);
          setError(`Initialization error: ${message}`);
        });

        spotifyPlayer.addListener('authentication_error', ({ message }) => {
          console.error('Player authentication error:', message);
          setError(`Authentication error: ${message}`);
        });

        spotifyPlayer.addListener('account_error', ({ message }) => {
          console.error('Player account error:', message);
          setError(`Account error: ${message}`);
        });

        spotifyPlayer.addListener('player_state_changed', state => {
          console.log('Player state changed:', state);
          setIsPlaying(!state?.paused);
        });

        console.log('Attempting to connect to Spotify...');
        spotifyPlayer.connect().then(success => {
          if (success) {
            console.log('Successfully connected to Spotify!');
            setPlayer(spotifyPlayer);
          } else {
            console.error('Failed to connect to Spotify');
            setError('Failed to connect to Spotify');
          }
        });
      }
    });

    return () => {
      if (player) {
        console.log('Disconnecting player...');
        player.disconnect();
      }
      document.body.removeChild(script);
    };
  }, [accessToken]);

  const handlePlayPause = async () => {
    console.log('Play/Pause clicked');
    if (!player) {
      console.error('Player not initialized');
      return;
    }
    try {
      await player.togglePlay();
    } catch (err) {
      console.error('Error toggling play:', err);
    }
  };

  const handlePrevious = async () => {
    console.log('Previous clicked');
    if (!player) {
      console.error('Player not initialized');
      return;
    }
    try {
      await player.previousTrack();
    } catch (err) {
      console.error('Error going to previous track:', err);
    }
  };

  const handleNext = async () => {
    console.log('Next clicked');
    if (!player) {
      console.error('Player not initialized');
      return;
    }
    try {
      await player.nextTrack();
    } catch (err) {
      console.error('Error going to next track:', err);
    }
  };

  if (!accessToken) {
    return <button onClick={loginWithSpotify}>Login to Spotify</button>;
  }

  return (
    <div className="spotify-player">
      {error && <div style={{color: 'red'}}>{error}</div>}
      <button onClick={handlePrevious}>⏮</button>
      <button onClick={handlePlayPause}>
        {isPlaying ? '⏸' : '▶'}
      </button>
      <button onClick={handleNext}>⏭</button>
    </div>
  );
}