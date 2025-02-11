// SpotifyAuth.js
export const loginWithSpotify = () => {
  console.log('Initiating Spotify login...');
  window.location.href = 'http://localhost:3001/login';
};

export const getAccessToken = async (refreshToken) => {
  console.log('Attempting to refresh token with:', refreshToken);
  try {
    const response = await fetch(`http://localhost:3001/refresh_token?refresh_token=${refreshToken}`);
    const data = await response.json();
    console.log('Refresh token response:', data);
    if (data.access_token) {
      localStorage.setItem('spotify_access_token', data.access_token);
      return data.access_token;
    }
    return null;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};

export const handleCallback = async (code) => {
  console.log('Handling callback with code:', code);
  try {
    const response = await fetch('http://localhost:3001/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
      credentials: 'include'
    });
    const data = await response.json();
    console.log('Callback response data:', data);
    
    if (data.access_token) {
      localStorage.setItem('spotify_access_token', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('spotify_refresh_token', data.refresh_token);
      }
      return data.access_token;
    }
    return null;
  } catch (error) {
    console.error('Error handling callback:', error);
    return null;
  }
};
