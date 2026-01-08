// Handles submission of aptitude challenge results from the challenge page
import { submitAptitudeResult } from './aptitude-leaderboard.js';

// Example usage: call this function when a user completes a question
export async function handleAptitudeSubmit({ userId, pointsEarned, attempts, completionTime, questionId, createGuestUser, displayName, email }) {
  const payload = {
    userId,
    pointsEarned,
    attempts,
    completionTime,
    questionId,
    createGuestUser,
    displayName,
    email
  };
  try {
    const result = await submitAptitudeResult(payload);
    if (result.success) {
      // Show success message, update UI, etc.
      alert('Aptitude result submitted!');
    } else {
      alert(result.message || 'Submission failed');
    }
  } catch (e) {
    alert('Error submitting result: ' + e.message);
  }
}
