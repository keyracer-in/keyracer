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

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to create hackathon');
            }

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
