// Handles submission of aptitude challenge results and leaderboard fetching

const API_BASE_URL = '/api';

export async function submitAptitudeResult(payload) {
  const response = await fetch(`${API_BASE_URL}/aptitude-leaderboard/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return response.json();
}

export async function fetchAptitudeLeaderboard() {
  const response = await fetch(`${API_BASE_URL}/aptitude/leaderboard`);
  return response.json();
}
