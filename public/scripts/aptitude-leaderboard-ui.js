import { fetchAptitudeLeaderboard } from './aptitude-leaderboard.js';

document.addEventListener('DOMContentLoaded', async () => {
  const leaderboardTable = document.querySelector('.leaderboard-table tbody');
  if (!leaderboardTable) return;
  
  try {
    const data = await fetchAptitudeLeaderboard();
    if (data.success && data.data && data.data.leaderboard && data.data.leaderboard.length > 0) {
      leaderboardTable.innerHTML = data.data.leaderboard.map(entry => {
        const accuracy = entry.stats?.bestAccuracy || 0;
        const badges = entry.stats?.badges || [];
        const avgTime = entry.stats?.averageTime || 0;
        
        // Format time as MM:SS
        const minutes = Math.floor(avgTime / 60);
        const seconds = avgTime % 60;
        const timeDisplay = avgTime > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : '-';
        
        return `
          <tr>
            <td>${entry.rank}</td>
            <td>${entry.user.name}</td>
            <td>${entry.stats.totalPoints}</td>
            <td>${timeDisplay}</td>
            <td>${accuracy > 0 ? accuracy.toFixed(1) + '%' : '-'}</td>
            <td>${badges.length > 0 ? badges.map(badge => `<span class="badge-mini">${formatBadgeName(badge)}</span>`).join('') : '-'}</td>
          </tr>
        `;
      }).join('');
    } else {
      leaderboardTable.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">No leaderboard data available yet. Complete some challenges to appear here!</td></tr>';
    }
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    leaderboardTable.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #ff4444;">Error loading leaderboard. Please try again later.</td></tr>';
  }
});

function formatBadgeName(badge) {
  const names = {
    'excellent': 'Excellent',
    'good': 'Good',
    'fast-thinker': 'Fast Thinker',
    'perfect-score': 'Perfect Score',
    'math-whiz': 'Math Whiz',
    'puzzle-master': 'Puzzle Master'
  };
  return names[badge] || badge.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
}
