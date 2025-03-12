import React, { useState, useRef, useEffect } from 'react';
import '../fonts/fonts.css';
import './DuolingoProfile.css';

const USERNAME = "leibei8";

const DuolingoProfile = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const overlayRef = useRef(null);

  // Function to fetch Duolingo profile data
  const fetchProfileData = async (username) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:3001/duolingo/${username}`);
      const userData = await response.json();
      
      // Transform the API response to match the expected shape if needed
      const formattedData = {
        username: userData.username,
        name: userData.name,
        streak: userData.streak,
        totalXp: userData.totalXp,
        learningLanguage: userData.learningLanguage,
        fromLanguage: userData.fromLanguage,
        picture: userData.picture,
        hasPlus: userData.hasPlus,
        joinDate: new Date(userData.creationDate * 1000).toLocaleDateString()
      };
      
      setProfileData(formattedData);
    } catch (err) {
      console.error('Error fetching Duolingo profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const getFlagEmoji = (countryCode) => {
    const utfCountryCode = {
      "ko": "kr"
    }
    return [...(utfCountryCode[countryCode] || countryCode).toUpperCase()]
      .map(char => String.fromCodePoint(0x1F1E6 + char.charCodeAt(0) - 65))
      .join("");
  }

  // Fetch data when overlay opens
  useEffect(() => {
    if (showOverlay && !profileData && !loading) {
      fetchProfileData(USERNAME);
    }
  }, [showOverlay, profileData, loading]);

  // Function that can be called from Phaser
  window.openDuolingoProfile = () => {
    setShowOverlay(true);
  };

  const closeOverlay = () => {
    setShowOverlay(false);
  };

  // Dragging logic
  const handleMouseDown = (e) => {
    if (!overlayRef.current) return;
    
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

  // Language code to name mapping
  const languageNames = {
    'ko': 'Korean',
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'ja': 'Japanese',
    'de': 'German',
  };

  return (
    <div className="duolingo-profile">
      {/* Draggable Overlay with Profile */}
      {showOverlay && (
        <div
          className="duolingo-overlay"
          ref={overlayRef}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
          onMouseDown={handleMouseDown}
        >
          {/* Header with close button */}
          <div className="duolingo-header">
            <h2>Duolingo Profile</h2>
            <button onClick={closeOverlay} className="duolingo-close-button">
              &times;
            </button>
          </div>

          {/* Profile content */}
          <div className="duolingo-content">
            {loading && (
              <div className="duolingo-loading">
                <p>Loading profile data...</p>
              </div>
            )}

            {error && (
              <div className="duolingo-error"> 
                <p>{error}</p>
                <button
                  onClick={fetchProfileData}
                  className="duolingo-retry-button"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && profileData && (
              <>
                {/* User info section */}
                <div className="duolingo-user-info">
                  <div className="duolingo-user-details">
                    <h3>{profileData.name || "User"}</h3>
                    <p>@{profileData.username || "username"}</p>
                    {profileData.hasPlus && (
                      <div className="duolingo-plus-badge">
                        PLUS
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats section */}
                <div className="duolingo-stats"> 
                  <div className="duolingo-stat">
                    <p className="duolingo-stat-value duolingo-streak-color">
                      {profileData.streak !== undefined ? profileData.streak : "-"}
                    </p>
                    <p className="duolingo-stat-label">Day Streak</p>
                  </div>
                  <div className="duolingo-stat">
                    <p className="duolingo-stat-value duolingo-xp-color">
                      {profileData.totalXp !== undefined ? profileData.totalXp.toLocaleString() : "-"}
                    </p>
                    <p className="duolingo-stat-label">Total XP</p>
                  </div>
                  <div className="duolingo-stat">
                    <p className="duolingo-stat-value duolingo-join-color">
                      {profileData.joinDate || "-"}
                    </p>
                    <p className="duolingo-stat-label">Joined</p>
                  </div>
                </div>

                {/* Language section */}
                {profileData.learningLanguage && (
                  <div className="duolingo-language-section">
                    <h4>Learning</h4>
                    <div className="duolingo-language-item">
                      <div className="duolingo-language-icon">
                        {getFlagEmoji(profileData.learningLanguage)}
                      </div>
                      <div>
                        <p className="duolingo-language-name">
                          {languageNames[profileData.learningLanguage] || profileData.learningLanguage}
                        </p>
                        {profileData.fromLanguage && (
                          <p className="duolingo-language-from">
                            From {languageNames[profileData.fromLanguage] || profileData.fromLanguage}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DuolingoProfile;