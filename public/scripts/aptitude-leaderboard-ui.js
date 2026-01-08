import { fetchAptitudeLeaderboard } from './aptitude-leaderboard.js';

document.addEventListener('DOMContentLoaded', async () => {
  const leaderboardTable = document.querySelector('.leaderboard-table tbody');
  if (!leaderboardTable) return;
  
  try {
    const data = await fetchAptitudeLeaderboard();
    if (data.success && data.data && data.data.leaderboard && data.data.leaderboard.length > 0) {
      leaderboardTable.innerHTML = data.data.leaderboard.map(entry => `
        <tr>
          <td>${entry.rank}</td>
          <td>${entry.user.name}</td>
          <td>${entry.stats.totalPoints}</td>
          <td>-</td>
          <td>-</td>
          <td>${entry.stats.badges || '-'}</td>
        </tr>
      `).join('');
    } else {
      leaderboardTable.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">No leaderboard data available yet. Complete some challenges to appear here!</td></tr>';
    }
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    leaderboardTable.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #ff4444;">Error loading leaderboard. Please try again later.</td></tr>';
  }
});
