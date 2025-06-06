import React, { useState, useRef, useEffect } from 'react';
import axios from "axios";
import './LeetCodeProfile.css';
import { startDragging } from './overlay.js'

const LeetCodeProfile = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const overlayRef = useRef(null);

  // Function that can be called externally (e.g., from other components)
  window.openLeetCodeProfile = () => {
    setShowOverlay(true);
    fetchProfileData();
  };

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/leetcode/profile`);
      setProfileData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    if (showOverlay && !profileData && !loading) {
      fetchProfileData();
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

  // Pixelate album image
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!profileData?.avatarUrl) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = "anonymous"; // Allow cross-origin loading if needed
    img.src = profileData.avatarUrl;

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
  }, [profileData]);

  const closeOverlay = () => {
    setShowOverlay(false);
  };

  // Sample difficulty distribution colors
  const difficultyColors = {
    easy: '#00af9b',
    medium: '#ffb800',
    hard: '#ff2d55'
  };

  return (
    <div className="leetcode-profile">
      {/* Draggable Overlay with Profile */}
      {showOverlay && (
        <div
          className="leetcode-overlay"
          ref={overlayRef}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            if (e.target.closest('.leetcode-header')) {
              startDragging(e.clientX, e.clientY, overlayRef.current, setPosition);
            }
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            if (e.target.closest('.leetcode-header')) {
              startDragging(e.touches[0].clientX, e.touches[0].clientY, overlayRef.current, setPosition);
            }
          }}
        >
          {/* Header with close button */}
          <div className="leetcode-header">
            <h2>LeetCode Profile</h2>
            <button onClick={closeOverlay} className="leetcode-close-button">
              &times;
            </button>
          </div>

          {/* Profile content */}
          <div className="leetcode-content">
            {loading && <div className="loading">Loading profile data...</div>}

            {error && <div className="error">Error: {error}</div>}

            {!loading && !error && profileData && (
              <>
                {/* User info section */}
                <div className="user-info">
                  {(
                    <canvas ref={canvasRef} className="profile-image" />
                  )}
                  <div className="user-details">
                    <h3><a href="https://leetcode.com/u/LeiBei/" target="_blank">{profileData.name || "User"}</a></h3>
                    <p className="username">@{profileData.username}</p>
                    <div className="rank">
                      <span className="rank-label">Rank</span>
                      <span className="rank-number">{profileData.ranking}</span>
                    </div>
                  </div>
                </div>

                {/* Stats section */}
                <div className="stats-section">
                  <div className="stat-item">
                    <p className="stat-value">{profileData.streak}</p>
                    <p className="stat-label">Day Streak</p>
                  </div>
                  <div className="stat-item">
                    <p className="stat-value">{profileData.solved}</p>
                    <p className="stat-label">Problems Solved</p>
                  </div>
                  <div className="stat-item">
                    <p className="stat-value">{Math.round(profileData.contestRating) || 'N/A'}</p>
                    <p className="stat-label">Contest Rating</p>
                  </div>
                </div>

                {/* Submission Stats */}
                <div className="submission-stats">
                  <h4>Submission Stats</h4>
                  <div className="difficulty-bars">
                    <div className="difficulty-bar">
                      <div className="difficulty-label">
                        <span className="dot" style={{ backgroundColor: difficultyColors.easy }}></span>
                        <span className="difficulty easy">Easy</span>
                        <span className="count">{profileData.easySolved}/{profileData.easyTotal}</span>
                      </div>
                      <div className="progress-bar easy">
                        <div
                          className="progress"
                          style={{
                            width: `${(profileData.easySolved / profileData.easyTotal) * 100}%`,
                            backgroundColor: difficultyColors.easy
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="difficulty-bar">
                      <div className="difficulty-label">
                        <span className="dot" style={{ backgroundColor: difficultyColors.medium }}></span>
                        <span className="difficulty medium">Medium</span>
                        <span className="count">{profileData.mediumSolved}/{profileData.mediumTotal}</span>
                      </div>
                      <div className="progress-bar medium">
                        <div
                          className="progress"
                          style={{
                            width: `${(profileData.mediumSolved / profileData.mediumTotal) * 100}%`,
                            backgroundColor: difficultyColors.medium
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="difficulty-bar">
                      <div className="difficulty-label">
                        <span className="dot" style={{ backgroundColor: difficultyColors.hard }}></span>
                        <span className="difficulty hard">Hard</span>
                        <span className="count">{profileData.hardSolved}/{profileData.hardTotal}</span>
                      </div>
                      <div className="progress-bar hard">
                        <div
                          className="progress"
                          style={{
                            width: `${(profileData.hardSolved / profileData.hardTotal) * 100}%`,
                            backgroundColor: difficultyColors.hard
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeetCodeProfile;