// Aptitude Section JavaScript
class AptitudeManager {
    constructor() {
        this.currentTopic = 'quant';
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.timer = null;
        this.elapsedTime = 0;
        this.questionStartTime = null;
        this.init();
    }

    init() {
        this.loadContent();
        this.setupEventListeners();
        this.loadTopicContent(this.currentTopic);
    }

    async loadContent() {
        try {
            const response = await fetch('/data/aptitude-content.json');
            this.content = await response.json();
        } catch (error) {
            console.error('Error loading content:', error);
        }
    }

    setupEventListeners() {
        // Topic navigation
        document.querySelectorAll('.topic-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const topic = e.currentTarget.dataset.topic;
                this.switchTopic(topic);
            });
        });

        // Practice button
        const practiceBtn = document.querySelector('.practice-btn');
        if (practiceBtn) {
            practiceBtn.addEventListener('click', () => {
                window.location.href = '/aptitude/challenges';
            });
        }

        // Start timer when questions are loaded
        this.startQuestionTimer();

        // Navigation controls
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        const submitBtn = document.querySelector('.submit-btn');

        if (prevBtn) prevBtn.addEventListener('click', () => this.previousQuestion());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextQuestion());
        if (submitBtn) submitBtn.addEventListener('click', () => this.submitTest());
    }

    switchTopic(topic) {
        this.currentTopic = topic;

        // Update active state
        document.querySelectorAll('.topic-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-topic="${topic}"]`).classList.add('active');

        this.loadTopicContent(topic);
    }

    loadTopicContent(topic, subsection = null) {
        if (!this.content || !this.content[topic]) return;

        const contentTitle = document.querySelector('.content-title');
        const learningContent = document.querySelector('.learning-content');

        if (contentTitle) {
            contentTitle.textContent = subsection ? `${this.content[topic].title} - ${subsection}` : this.content[topic].title;
        }

        if (learningContent) {
            if (subsection) {
                // Load specific subsection
                const sections = this.parseSections(this.content[topic].content);
                const sectionContent = sections.find(s => s.title === subsection);
                learningContent.innerHTML = sectionContent ? this.parseMarkdown(sectionContent.content) : 'Section not found';
            } else {
                // Load full topic
                learningContent.innerHTML = this.parseMarkdown(this.content[topic].content);
            }
        }

        this.populateSidebar(topic);
    }

    parseSections(content) {
        const sections = [];
        const lines = content.split('\n');
        let currentSection = null;
        let currentContent = [];

        for (const line of lines) {
            if (line.startsWith('### ')) {
                if (currentSection) {
                    sections.push({
                        title: currentSection,
                        content: currentContent.join('\n')
                    });
                }
                currentSection = line.replace('### ', '').trim();
                currentContent = [];
            } else {
                currentContent.push(line);
            }
        }

        if (currentSection) {
            sections.push({
                title: currentSection,
                content: currentContent.join('\n')
            });
        }

        return sections;
    }

    populateSidebar(topic) {
        const topicList = document.querySelector('.topic-list');
        if (!topicList) return;

        topicList.innerHTML = '';

        Object.keys(this.content).forEach(topicKey => {
            const topicItem = document.createElement('li');
            topicItem.className = 'topic-item';

            const topicLink = document.createElement('a');
            topicLink.href = '#';
            topicLink.className = `topic-link ${topicKey === topic ? 'active' : ''}`;
            topicLink.dataset.topic = topicKey;
            topicLink.innerHTML = `
                <i class="fas fa-${this.getTopicIcon(topicKey)} topic-icon"></i>
                ${this.content[topicKey].title}
            `;

            topicLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTopic(topicKey);
            });

            topicItem.appendChild(topicLink);
            topicList.appendChild(topicItem);
        });
    }

    getTopicIcon(topic) {
        const icons = {
            'quant': 'calculator',
            'logical-reasoning': 'puzzle-piece',
            'verbal': 'language',
            'puzzles': 'lightbulb'
        };
        return icons[topic] || 'book';
    }

    parseMarkdown(markdown) {
        return markdown
            .replace(/### (.*)/g, '<h3>$1</h3>')
            .replace(/## (.*)/g, '<h2>$1</h2>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/- (.*)/g, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(.*)$/gm, '<p>$1</p>')
            .replace(/<p><h/g, '<h')
            .replace(/<\/h([1-6])><\/p>/g, '</h$1>')
            .replace(/<p><ul>/g, '<ul>')
            .replace(/<\/ul><\/p>/g, '</ul>')
            .replace(/<p><div/g, '<div')
            .replace(/<\/div><\/p>/g, '</div>');
    }

    async loadQuestions(topic, difficulty = 'medium') {
        try {
            const userEmail = localStorage.getItem('typingTestUserEmail') || `${localStorage.getItem('typingTestUser')}@guest.local`;
            
            // Try API first with user email to exclude solved questions
            try {
                const response = await fetch(`/api/aptitude/questions/${topic}/${difficulty}?email=${encodeURIComponent(userEmail)}`);
                const apiData = await response.json();
                if (apiData.success && apiData.questions.length > 0) {
                    this.questions = apiData.questions;
                    this.currentQuestionIndex = 0;
                    this.userAnswers = new Array(this.questions.length).fill('');
                    this.showStartButton(topic, difficulty);
                    return;
                }
            } catch (apiError) {
                console.log('API failed, falling back to local data');
            }
            
            // Fallback to local JSON
            const response = await fetch('/data/aptitude-questions.json');
            const data = await response.json();

            if (data[topic] && data[topic][difficulty]) {
                this.questions = data[topic][difficulty];
                this.currentQuestionIndex = 0;
                this.userAnswers = new Array(this.questions.length).fill('');
                this.showStartButton(topic, difficulty);
            } else {
                this.showNoQuestionsMessage(topic, difficulty);
            }
        } catch (error) {
            console.error('Error loading questions:', error);
            this.showErrorMessage();
        }
    }

    showStartButton(topic, difficulty) {
        const questionText = document.getElementById('question-text');
        const answerContainer = document.getElementById('answer-container');
        
        if (questionText) {
            questionText.textContent = `Ready to start ${topic} - ${difficulty} challenge?`;
        }
        
        if (answerContainer) {
            answerContainer.innerHTML = `
                <div class="start-challenge-container" style="text-align: center; padding: 40px;">
                    <i class="fas fa-play-circle" style="font-size: 3rem; color: var(--accent-color); margin-bottom: 20px;"></i>
                    <h3 style="color: var(--text-color); margin-bottom: 15px;">Challenge Ready!</h3>
                    <p style="color: rgba(225, 230, 242, 0.8); margin-bottom: 25px;">You have ${this.questions.length} questions to solve. Timer will start when you begin.</p>
                    <button class="start-challenge-btn" style="background: linear-gradient(135deg, var(--accent-color), #0099cc); color: white; border: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 1.1rem;">
                        <i class="fas fa-rocket"></i> Start Challenge
                    </button>
                </div>
            `;
            
            const startBtn = answerContainer.querySelector('.start-challenge-btn');
            startBtn.addEventListener('click', () => {
                this.startQuestionTimer();
                this.displayQuestion();
            });
        }
    }

    showNoQuestionsMessage(topic, difficulty) {
        const questionText = document.getElementById('question-text');
        const answerContainer = document.getElementById('answer-container');
        
        if (questionText) {
            questionText.textContent = `No questions available for ${topic} - ${difficulty}`;
        }
        
        if (answerContainer) {
            answerContainer.innerHTML = `
                <div class="no-questions-message">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--warning-color); margin-bottom: 15px;"></i>
                    <p>Questions for this topic and difficulty are coming soon!</p>
                    <p>Try selecting a different challenge from the sidebar.</p>
                </div>
            `;
        }
    }

    showErrorMessage() {
        const questionText = document.getElementById('question-text');
        const answerContainer = document.getElementById('answer-container');
        
        if (questionText) {
            questionText.textContent = 'Error loading questions';
        }
        
        if (answerContainer) {
            answerContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle" style="font-size: 2rem; color: var(--error-color); margin-bottom: 15px;"></i>
                    <p>Unable to load questions. Please try again later.</p>
                </div>
            `;
        }
    }

    displayQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        if (!question) return;

        // Update question number and difficulty
        document.querySelector('.question-number').textContent =
            `Question ${this.currentQuestionIndex + 1} of ${this.questions.length}`;

        const difficultyEl = document.querySelector('.question-difficulty');
        difficultyEl.textContent = question.difficulty.toUpperCase();
        difficultyEl.className = `question-difficulty difficulty-${question.difficulty}`;

        // Update question text
        document.querySelector('.question-text').textContent = question.question;

        // Display options or text input
        const container = document.querySelector('.answer-container');
        container.innerHTML = '';

        if (question.type === 'mcq') {
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'options-container';

            question.options.forEach((option, index) => {
                const optionEl = document.createElement('div');
                optionEl.className = 'option-item';
                optionEl.innerHTML = `
                    <div class="option-radio ${this.userAnswers[this.currentQuestionIndex] === option ? 'checked' : ''}"></div>
                    <span>${option}</span>
                `;

                optionEl.addEventListener('click', () => {
                    this.selectOption(option);
                });

                optionsContainer.appendChild(optionEl);
            });

            container.appendChild(optionsContainer);
        } else {
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.className = 'text-input';
            textInput.placeholder = 'Enter your answer...';
            textInput.value = this.userAnswers[this.currentQuestionIndex];

            textInput.addEventListener('input', (e) => {
                this.userAnswers[this.currentQuestionIndex] = e.target.value;
            });

            container.appendChild(textInput);
        }

        // Update navigation buttons
        document.querySelector('.prev-btn').disabled = this.currentQuestionIndex === 0;
        document.querySelector('.next-btn').disabled = this.currentQuestionIndex === this.questions.length - 1;
    }

    selectOption(option) {
        this.userAnswers[this.currentQuestionIndex] = option;

        // Update visual selection
        document.querySelectorAll('.option-item').forEach(item => {
            const radio = item.querySelector('.option-radio');
            radio.classList.remove('checked');
        });

        document.querySelectorAll('.option-item').forEach(item => {
            if (item.textContent.trim().includes(option)) {
                item.querySelector('.option-radio').classList.add('checked');
            }
        });
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayQuestion();
            this.resetQuestionTimer();
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
            this.resetQuestionTimer();
        }
    }

    startQuestionTimer() {
        this.questionStartTime = Date.now();
        this.elapsedTime = 0;

        if (this.timer) {
            clearInterval(this.timer);
        }

        this.timer = setInterval(() => {
            this.elapsedTime++;
            this.updateTimerDisplay();
        }, 1000);
    }

    resetQuestionTimer() {
        this.elapsedTime = 0;
        this.questionStartTime = Date.now();
        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.elapsedTime / 60);
        const seconds = this.elapsedTime % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        const timerDisplay = document.querySelector('#timer');
        if (timerDisplay) {
            timerDisplay.textContent = display;
        }
    }

    calculateLocalResults() {
        if (this.timer) {
            clearInterval(this.timer);
        }

        // Calculate results locally
        let correctAnswers = 0;
        const results = this.questions.map((q, index) => {
            const userAnswer = this.userAnswers[index] || '';
            const isCorrect = userAnswer === q.correct;
            if (isCorrect) correctAnswers++;
            return {
                questionId: q._id,
                userAnswer,
                correctAnswer: q.correct,
                isCorrect
            };
        });

        const accuracy = (correctAnswers / this.questions.length) * 100;
        const score = correctAnswers * 10; // 10 points per correct answer
        
        // Determine badges based on performance
        const badges = [];
        if (accuracy >= 90) badges.push('excellent');
        if (accuracy >= 80) badges.push('good');
        if (this.elapsedTime < 60) badges.push('fast-thinker');
        if (correctAnswers === this.questions.length) badges.push('perfect-score');

        const result = {
            score,
            accuracy,
            correctAnswers,
            totalQuestions: this.questions.length,
            timeTaken: this.elapsedTime,
            badges,
            results
        };

        this.showResults(result);
        this.resetQuestionTimer();
    }

    async submitTest() {
        if (this.timer) {
            clearInterval(this.timer);
        }

        const currentUser = localStorage.getItem('typingTestUser');
        const userEmail = localStorage.getItem('typingTestUserEmail') || `${currentUser}@guest.local`;
        
        if (!currentUser) {
            alert('Please login to submit test');
            window.location.href = '/login.html';
            return;
        }

        const submissionData = {
            email: userEmail,
            displayName: currentUser,
            answers: this.userAnswers,
            timeTaken: this.elapsedTime,
            questionIds: this.questions.map(q => q._id || q.id)
        };

        try {
            const response = await fetch('/api/aptitude/submit-secure', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData)
            });

            if (!response.ok) {
                console.error('HTTP Error:', response.status, response.statusText);
                const text = await response.text();
                console.error('Response body:', text);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.success) {
                this.showResults(data.result);
                this.resetQuestionTimer();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Submit error:', error);
            this.calculateLocalResults(); // Fallback
        }
    }

    showResults(result) {
        const modal = document.createElement('div');
        modal.className = 'results-modal';
        modal.innerHTML = `
            <div class="results-content">
                <h2 class="results-title">Test Results</h2>
                <div class="results-grid">
                    <div class="result-item">
                        <div class="result-label">Score</div>
                        <div class="result-value">${result.score}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Accuracy</div>
                        <div class="result-value">${result.accuracy.toFixed(1)}%</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Correct</div>
                        <div class="result-value">${result.correctAnswers}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Time</div>
                        <div class="result-value">${Math.floor(result.timeTaken / 60)}:${(result.timeTaken % 60).toString().padStart(2, '0')}</div>
                    </div>
                </div>
                ${result.badges.length > 0 ? `
                    <div class="badges-section">
                        <h3 class="badges-title">Badges Earned</h3>
                        <div class="badges-list">
                            ${result.badges.map(badge => `
                                <div class="badge">
                                    <i class="fas fa-medal"></i>
                                    ${this.getBadgeName(badge)}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                <div class="results-actions">
                    <button class="view-leaderboard-btn" onclick="window.location.href='/aptitude-leaderboard.html'">
                        <i class="fas fa-trophy"></i>
                        View Leaderboard
                    </button>
                    <button class="close-results" onclick="document.body.removeChild(this.closest('.results-modal'))">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    getBadgeName(badge) {
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

    displayNoDataMessage(message) {
        const tbody = document.querySelector('.leaderboard-table tbody');
        if (!tbody) return;
        
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-color);">
                    <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 15px; color: var(--warning-color);"></i>
                    <br>
                    ${message}
                </td>
            </tr>
        `;
    }

    async loadLeaderboard(period = 'all-time') {
        try {
            const response = await fetch(`/api/aptitude/leaderboard?period=${period}`);
            
            console.log('Leaderboard response status:', response.status);
            const data = await response.json();
            console.log('Leaderboard data:', data);

            if (data.success) {
                this.displayLeaderboard(data.leaderboard);
            } else {
                console.error('Leaderboard API error:', data.message);
                this.displayNoDataMessage(data.message || 'Failed to load leaderboard');
            }
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            this.displayNoDataMessage('Error loading leaderboard');
        }
    }

    displayLeaderboard(leaderboard) {
        const tbody = document.querySelector('.leaderboard-table tbody');
        if (!tbody) return;

        if (!leaderboard || leaderboard.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-color);">
                        <i class="fas fa-trophy" style="font-size: 2rem; margin-bottom: 15px; opacity: 0.5;"></i>
                        <br>
                        No leaderboard data available yet.<br>
                        Complete some challenges to see rankings!
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = leaderboard.map((entry, index) => `
            <tr>
                <td class="rank-cell">${index + 1}</td>
                <td>${entry.name || entry.username || 'Anonymous'}</td>
                <td>${entry.score}</td>
                <td>${Math.floor(entry.timeTaken / 60)}:${(entry.timeTaken % 60).toString().padStart(2, '0')}</td>
                <td>${entry.accuracy.toFixed(1)}%</td>
                <td>
                    ${(entry.badges || []).map(badge => `
                        <span class="badge-mini">${this.getBadgeName(badge)}</span>
                    `).join('')}
                </td>
            </tr>
        `).join('');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aptitudeManager = new AptitudeManager();

    // Setup leaderboard filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const period = e.target.dataset.period;
            window.aptitudeManager.loadLeaderboard(period);
        });
    });
});
