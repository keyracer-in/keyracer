// Hackathon API Service for MongoDB backend

class HackathonAPI {
    constructor() {
        this.baseURL = '/api/hackathons';
    }

    async createHackathon(hackathonData) {
        try {
            const response = await fetch(`${this.baseURL}/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(hackathonData)
            });

            if (!response.ok) {
                // If response is not ok, try to get the error message
                let errorMessage = 'Failed to create hackathon';
                let responseText = '';
                try {
                    responseText = await response.text();
                    // Try to parse as JSON
                    const errorData = JSON.parse(responseText);
                    errorMessage = errorData.error || errorMessage;
                } catch (jsonError) {
                    // If response is not JSON (e.g., HTML error page), use status text
                    console.error('Server returned non-JSON response:', responseText.substring(0, 200) + '...');
                    errorMessage = `Server error (${response.status || 'unknown'}): ${response.statusText || 'Unknown error'}`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error creating hackathon:', error);
            throw error;
        }
    }

    async findHackathon(identifier) {
        try {
            const response = await fetch(`${this.baseURL}/find/${identifier}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Hackathon not found');
            }

            return data.hackathon;
        } catch (error) {
            console.error('Error finding hackathon:', error);
            throw error;
        }
    }

    async registerParticipant(hackathonId, participantData) {
        try {
            const response = await fetch(`${this.baseURL}/${hackathonId}/participants`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(participantData)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to register participant');
            }

            return data.participant;
        } catch (error) {
            console.error('Error registering participant:', error);
            throw error;
        }
    }

    async getHackathonParticipants(hackathonId) {
        try {
            const response = await fetch(`${this.baseURL}/${hackathonId}/participants`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get participants');
            }

            return data.participants;
        } catch (error) {
            console.error('Error getting participants:', error);
            throw error;
        }
    }

    async getHackathonProblems(hackathonId) {
        try {
            const response = await fetch(`${this.baseURL}/${hackathonId}/problems`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get problems');
            }

            return data.problems;
        } catch (error) {
            console.error('Error getting problems:', error);
            throw error;
        }
    }

    async addProblem(hackathonId, problemData) {
        try {
            const response = await fetch(`${this.baseURL}/${hackathonId}/problems`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(problemData)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to add problem');
            }

            return data.problem;
        } catch (error) {
            console.error('Error adding problem:', error);
            throw error;
        }
    }

    async submitSolution(hackathonId, submissionData) {
        try {
            const response = await fetch(`${this.baseURL}/${hackathonId}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submissionData)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit solution');
            }

            return data.submission;
        } catch (error) {
            console.error('Error submitting solution:', error);
            throw error;
        }
    }
}

// Create global instance
if (typeof window !== 'undefined') {
    window.HackathonAPI = new HackathonAPI();
}
