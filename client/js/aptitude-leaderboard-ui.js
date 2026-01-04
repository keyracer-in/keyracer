import { fetchAptitudeLeaderboard } from './js/aptitude-leaderboard.js';

document.addEventListener('DOMContentLoaded', async () => {
  const leaderboardTable = document.getElementById('aptitudeLeaderboardTable');
  if (!leaderboardTable) return;
  const data = await fetchAptitudeLeaderboard();
  if (data.success && data.data && data.data.leaderboard) {
    leaderboardTable.innerHTML = data.data.leaderboard.map(entry => `
      <tr>
        <td>${entry.rank}</td>
        <td>${entry.user.name}</td>
        <td>${entry.stats.totalPoints}</td>
        <td>${entry.stats.questionsCompleted}</td>
      </tr>
    `).join('');
  } else {
    leaderboardTable.innerHTML = '<tr><td colspan="4">No data</td></tr>';
  }
});
