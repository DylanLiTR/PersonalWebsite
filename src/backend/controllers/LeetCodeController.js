import axios from 'axios';

// LeetCode GraphQL API endpoint
const LEETCODE_API = 'https://leetcode.com/graphql';

// LeetCode username - replace with your actual username or make it configurable
const LEETCODE_USERNAME = 'leibei';

// Function to fetch user profile data using correct LeetCode queries
export async function fetchLeetCodeProfile() {
  try {
    // Using the actual queries from LeetCode
    const [
      userProfileResponse,
      problemsStatsResponse,
      contestResponse,
      submissionsResponse,
      calendarResponse,
      languageStatsResponse,
      skillStatsResponse,
      badgesResponse
    ] = await Promise.all([
      // Basic profile information
      axios.post(LEETCODE_API, {
        query: `
          query userPublicProfile($username: String!) {
            matchedUser(username: $username) {
              contestBadge {
                name
                expired
                hoverText
                icon
              }
              username
              githubUrl
              twitterUrl
              linkedinUrl
              profile {
                ranking
                userAvatar
                realName
                aboutMe
                school
                websites
                countryName
                company
                jobTitle
                skillTags
                postViewCount
                reputation
                solutionCount
              }
            }
          }
        `,
        variables: { username: LEETCODE_USERNAME }
      }),
      
      // Problems solved stats
      axios.post(LEETCODE_API, {
        query: `
          query userProblemsSolved($username: String!) {
            allQuestionsCount {
              difficulty
              count
            }
            matchedUser(username: $username) {
              problemsSolvedBeatsStats {
                difficulty
                percentage
              }
              submitStatsGlobal {
                acSubmissionNum {
                  difficulty
                  count
                }
              }
            }
          }
        `,
        variables: { username: LEETCODE_USERNAME }
      }),
      
      // Contest information
      axios.post(LEETCODE_API, {
        query: `
          query userContestRankingInfo($username: String!) {
            userContestRanking(username: $username) {
              attendedContestsCount
              rating
              globalRanking
              totalParticipants
              topPercentage
              badge {
                name
              }
            }
            userContestRankingHistory(username: $username) {
              attended
              trendDirection
              problemsSolved
              totalProblems
              finishTimeInSeconds
              rating
              ranking
              contest {
                title
                startTime
              }
            }
          }
        `,
        variables: { username: LEETCODE_USERNAME }
      }),
      
      // Recent submissions
      axios.post(LEETCODE_API, {
        query: `
          query recentAcSubmissions($username: String!, $limit: Int!) {
            recentAcSubmissionList(username: $username, limit: $limit) {
              id
              title
              titleSlug
              timestamp
            }
          }
        `,
        variables: { username: LEETCODE_USERNAME, limit: 5 }
      }),
      
      // Calendar & streak info
      axios.post(LEETCODE_API, {
        query: `
          query userProfileCalendar($username: String!, $year: Int) {
            matchedUser(username: $username) {
              userCalendar(year: $year) {
                activeYears
                streak
                totalActiveDays
                dccBadges {
                  timestamp
                  badge {
                    name
                    icon
                  }
                }
                submissionCalendar
              }
            }
          }
        `,
        variables: { 
          username: LEETCODE_USERNAME, 
          year: new Date().getFullYear() 
        }
      }),
      
      // Language stats
      axios.post(LEETCODE_API, {
        query: `
          query languageStats($username: String!) {
            matchedUser(username: $username) {
              languageProblemCount {
                languageName
                problemsSolved
              }
            }
          }
        `,
        variables: { username: LEETCODE_USERNAME }
      }),
      
      // Skill stats
      axios.post(LEETCODE_API, {
        query: `
          query skillStats($username: String!) {
            matchedUser(username: $username) {
              tagProblemCounts {
                advanced {
                  tagName
                  tagSlug
                  problemsSolved
                }
                intermediate {
                  tagName
                  tagSlug
                  problemsSolved
                }
                fundamental {
                  tagName
                  tagSlug
                  problemsSolved
                }
              }
            }
          }
        `,
        variables: { username: LEETCODE_USERNAME }
      }),
      
      // Badges
      axios.post(LEETCODE_API, {
        query: `
          query userBadges($username: String!) {
            matchedUser(username: $username) {
              badges {
                id
                name
                shortName
                displayName
                icon
                hoverText
                medal {
                  slug
                  config {
                    iconGif
                    iconGifBackground
                  }
                }
                creationDate
                category
              }
              upcomingBadges {
                name
                icon
                progress
              }
            }
          }
        `,
        variables: { username: LEETCODE_USERNAME }
      })
    ]);
    
    // Extract and process all the data
    const userProfile = userProfileResponse.data.data.matchedUser;
    const problemsStats = problemsStatsResponse.data.data;
    const contestInfo = contestResponse.data.data;
    const recentSubmissions = submissionsResponse.data.data.recentAcSubmissionList;
    const calendarInfo = calendarResponse.data.data.matchedUser.userCalendar;
    const languageStats = languageStatsResponse.data.data.matchedUser.languageProblemCount;
    const skillStats = skillStatsResponse.data.data.matchedUser.tagProblemCounts;
    const badges = badgesResponse.data.data.matchedUser.badges;
    const upcomingBadges = badgesResponse.data.data.matchedUser.upcomingBadges;
    
    // Get difficulty information for recent submissions
    const submissionsWithDifficulty = await Promise.all(
      recentSubmissions.map(async (submission) => {
        const difficultyResponse = await axios.post(LEETCODE_API, {
          query: `
            query questionData($titleSlug: String!) {
              question(titleSlug: $titleSlug) {
                difficulty
                status
              }
            }
          `,
          variables: { titleSlug: submission.titleSlug }
        });
        
        const questionData = difficultyResponse.data.data.question;
        
        return {
          id: submission.id,
          problemName: submission.title,
          titleSlug: submission.titleSlug,
          difficulty: questionData.difficulty,
          status: questionData.status || 'Accepted',  // Default to Accepted since we're using recentAcSubmissionList
          timestamp: new Date(parseInt(submission.timestamp) * 1000).toLocaleString()
        };
      })
    );
    
    // Extract submission statistics
    const submitStats = problemsStats.matchedUser.submitStatsGlobal.acSubmissionNum;
    const totalStats = problemsStats.allQuestionsCount;
    
    // Format easy/medium/hard counts
    const easySolved = submitStats.find(item => item.difficulty === 'Easy')?.count || 0;
    const mediumSolved = submitStats.find(item => item.difficulty === 'Medium')?.count || 0;
    const hardSolved = submitStats.find(item => item.difficulty === 'Hard')?.count || 0;
    
    const easyTotal = totalStats.find(item => item.difficulty === 'Easy')?.count || 0;
    const mediumTotal = totalStats.find(item => item.difficulty === 'Medium')?.count || 0;
    const hardTotal = totalStats.find(item => item.difficulty === 'Hard')?.count || 0;
    
    // Get percentile beats
    const beatsStats = problemsStats.matchedUser.problemsSolvedBeatsStats || [];
    const easyBeats = beatsStats.find(item => item.difficulty === 'Easy')?.percentage || 0;
    const mediumBeats = beatsStats.find(item => item.difficulty === 'Medium')?.percentage || 0;
    const hardBeats = beatsStats.find(item => item.difficulty === 'Hard')?.percentage || 0;
    
    // Format calendars and streaks
    const submissionCalendar = calendarInfo.submissionCalendar 
      ? JSON.parse(calendarInfo.submissionCalendar) 
      : {};
    
    // Top languages
    const topLanguages = languageStats
      .sort((a, b) => b.problemsSolved - a.problemsSolved)
      .slice(0, 5);
    
    // Format top skills
    const formatSkills = (skills) => {
      return skills
        .sort((a, b) => b.problemsSolved - a.problemsSolved)
        .slice(0, 5)
        .map(skill => ({
          name: skill.tagName,
          slug: skill.tagSlug,
          count: skill.problemsSolved
        }));
    };
    
    const topSkills = {
      advanced: formatSkills(skillStats.advanced || []),
      intermediate: formatSkills(skillStats.intermediate || []),
      fundamental: formatSkills(skillStats.fundamental || [])
    };
    
    // Format contest history for chart (most recent 10)
    const contestHistory = (contestInfo.userContestRankingHistory || [])
      .sort((a, b) => new Date(b.contest.startTime) - new Date(a.contest.startTime))
      .slice(0, 10)
      .map(contest => ({
        name: contest.contest.title.replace('Weekly Contest', 'WC').replace('Biweekly Contest', 'BWC'),
        date: new Date(contest.contest.startTime).toLocaleDateString(),
        rating: contest.rating,
        ranking: contest.ranking,
        solved: contest.problemsSolved,
        total: contest.totalProblems
      }))
      .reverse(); // Reverse to show chronological order
    
    // Format response
    return {
      // Basic profile info
      username: userProfile.username,
      name: userProfile.profile.realName || userProfile.username,
      avatarUrl: userProfile.profile.userAvatar,
      ranking: userProfile.profile.ranking,
      company: userProfile.profile.company,
      school: userProfile.profile.school,
      location: userProfile.profile.countryName,
      websites: userProfile.profile.websites,
      githubUrl: userProfile.githubUrl,
      linkedinUrl: userProfile.linkedinUrl,
      twitterUrl: userProfile.twitterUrl,
      aboutMe: userProfile.profile.aboutMe,
      
      // Badges
      badges: badges.map(badge => ({
        name: badge.displayName,
        icon: badge.icon,
        hoverText: badge.hoverText,
        creationDate: badge.creationDate,
        category: badge.category
      })),
      upcomingBadges: upcomingBadges.map(badge => ({
        name: badge.name,
        icon: badge.icon,
        progress: badge.progress
      })),
      
      // Problem solving stats
      solved: easySolved + mediumSolved + hardSolved,
      totalProblems: easyTotal + mediumTotal + hardTotal,
      
      // Difficulty breakdown
      easySolved,
      easyTotal,
      mediumSolved,
      mediumTotal,
      hardSolved,
      hardTotal,
      
      // Beats percentages
      easyBeats,
      mediumBeats,
      hardBeats,
      
      // Activity
      streak: calendarInfo.streak,
      totalActiveDays: calendarInfo.totalActiveDays,
      submissionCalendar,
      
      // Contest info
      contestRating: contestInfo.userContestRanking?.rating,
      contestsAttended: contestInfo.userContestRanking?.attendedContestsCount,
      globalContestRanking: contestInfo.userContestRanking?.globalRanking,
      totalContestParticipants: contestInfo.userContestRanking?.totalParticipants,
      contestTopPercentage: contestInfo.userContestRanking?.topPercentage,
      contestBadge: contestInfo.userContestRanking?.badge?.name,
      contestHistory,
      
      // Languages and skills
      topLanguages,
      topSkills,
      
      // Recent submissions
      recentSubmissions: submissionsWithDifficulty
    };
  } catch (error) {
    console.error('Error fetching LeetCode profile data:', error);
    throw error;
  }
}

// Cache the profile data for 10 minutes to avoid excessive API calls
let cachedProfileData = null;
let cacheTimestamp = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

// API endpoint to fetch LeetCode profile data
export const getProfile = async (req, res) => {
  try {
    const currentTime = Date.now();
    
    // Check if we have a valid cached response
    if (cachedProfileData && cacheTimestamp && (currentTime - cacheTimestamp < CACHE_DURATION)) {
      return res.json(cachedProfileData);
    }
    
    // Fetch fresh data
    const profileData = await fetchLeetCodeProfile();
    
    // Update cache
    cachedProfileData = profileData;
    cacheTimestamp = currentTime;
    
    res.json(profileData);
  } catch (error) {
    console.error('Error in LeetCode profile API:', error);
    res.status(500).json({ 
      error: 'Failed to fetch LeetCode profile data',
      message: error.message 
    });
  }
};

// Add a refresh endpoint to force a cache refresh
export const refreshProfile = async (req, res) => {
  try {
    // Clear cache
    cachedProfileData = null;
    cacheTimestamp = null;
    
    // Fetch fresh data
    const profileData = await fetchLeetCodeProfile();
    
    // Update cache
    cachedProfileData = profileData;
    cacheTimestamp = Date.now();
    
    res.json({
      success: true,
      message: 'LeetCode profile data refreshed successfully',
      lastUpdated: new Date(cacheTimestamp).toLocaleString()
    });
  } catch (error) {
    console.error('Error refreshing LeetCode profile data:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to refresh LeetCode profile data',
      message: error.message 
    });
  }
};