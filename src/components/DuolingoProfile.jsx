import React, { useState, useRef, useEffect } from 'react';
import axios from "axios";
import './DuolingoProfile.css';
import { startDragging } from './overlay.js'

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
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/duolingo/${username}`);
      const userData = response.data;

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
        joinDate: new Date(userData.creationDate * 1000).toLocaleDateString(),
      };

      setProfileData(formattedData);
    } catch (err) {
      console.error("Error fetching Duolingo profile:", err);
      setError("Failed to load profile data");
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

  useEffect(() => {
    if (!overlayRef.current) return;
    const updatePosition = () => {
      setPosition((prev) => ({
        x: Math.min(
          Math.max(10, prev.x),
          window.innerWidth - overlayRef.current.clientWidth - 10
        ),
        y: Math.min(
          Math.max(10, prev.y),
          window.innerHeight - overlayRef.current.clientHeight - 10
        ),
      }));
    };
  
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, []);

  // Fetch data when overlay opens
  useEffect(() => {
    if (showOverlay && !profileData && !loading) {
      fetchProfileData(USERNAME);
    } else if (showOverlay && !loading) {
      const overlay = overlayRef.current;
      const overlayWidth = overlay.offsetWidth;
      const overlayHeight = overlay.offsetHeight;

      setPosition({
        x: Math.max(0, window.innerWidth - overlayWidth - 10),
        y: Math.max(0, window.innerHeight - overlayHeight - 10),
      });
    }

    if (showOverlay && loading) {
      const overlay = overlayRef.current;
      const overlayWidth = overlay.offsetWidth;
      const overlayHeight = overlay.offsetHeight;

      setPosition({
        x: Math.max(0, window.innerWidth - overlayWidth - 10),
        y: Math.max(0, window.innerHeight - overlayHeight - 10),
      });
    }
  }, [showOverlay, profileData, loading]);

  // Function that can be called from Phaser
  window.openDuolingoProfile = () => {
    setShowOverlay(true);
  };

  const closeOverlay = () => {
    setShowOverlay(false);
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
          onMouseDown={(e) => {
            e.preventDefault();
            if (e.target.closest('.duolingo-header')) {
              startDragging(e.clientX, e.clientY, overlayRef.current, setPosition);
            }
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            if (e.target.closest('.duolingo-header')) {
              startDragging(e.touches[0].clientX, e.touches[0].clientY, overlayRef.current, setPosition);
            }
          }}
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
                    <h3><a href="https://www.duolingo.com/profile/LeiBei8" target="_blank">{profileData.name || "User"}</a></h3>
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
                      {profileData.totalXp !== undefined ? profileData.totalXp : "-"}
                    </p>
                    <p className="duolingo-stat-label">Total XP</p>
                  </div>
                  {/* <div className="duolingo-stat">
                    <p className="duolingo-stat-value duolingo-join-color">
                      {profileData.joinDate || "-"}
                    </p>
                    <p className="duolingo-stat-label">Joined</p>
                  </div> */}
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