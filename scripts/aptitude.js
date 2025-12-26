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
            const response = await fetch('data/aptitude-content.json');
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
        const learningContent = document.querySelector('.learning-content') || document.getElementById('learningContent');

        if (contentTitle) {
            contentTitle.textContent = subsection ? `${this.content[topic].title} - ${subsection}` : this.content[topic].title;
        }

        if (learningContent) {
            if (subsection) {
                const sections = this.parseSections(this.content[topic].content);
                const sectionContent = sections.find(s => s.title === subsection);
                learningContent.innerHTML = sectionContent ? this.parseMarkdown(sectionContent.content) : 'Section not found';
            } else {
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
            
            // Try API first
            try {
                const response = await fetch(`/api/aptitude/questions/${topic}/${difficulty}?email=${encodeURIComponent(userEmail)}`);
                if (response.ok) {
                    const apiData = await response.json();
                    if (apiData.success && apiData.questions && apiData.questions.length > 0) {
                        this.questions = apiData.questions;
                        this.currentQuestionIndex = 0;
                        this.userAnswers = new Array(this.questions.length).fill('');
                        this.showStartButton(topic, difficulty);
                        return;
                    }
                }
            } catch (apiError) {
                console.log('Using local data');
            }
            
            // Fallback to local JSON
            const response = await fetch('data/aptitude-questions.json');
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
        
        // Update all count displays immediately
        const totalEl = document.getElementById('totalCount');
        const progressText = document.getElementById('progressText');
        const answeredCount = document.getElementById('answeredCount');
        
        if (totalEl) totalEl.textContent = this.questions.length;
        if (progressText) progressText.textContent = `Question 1 of ${this.questions.length}`;
        if (answeredCount) answeredCount.textContent = '0';
        
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

        // Update progress text
        const progressText = document.getElementById('progressText');
        if (progressText) {
            progressText.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.questions.length}`;
        }

        // Update question text
        const questionText = document.getElementById('question-text');
        if (questionText) {
            questionText.textContent = question.question;
        }

        // Display options or text input
        const container = document.getElementById('answer-container');
        if (!container) return;
        
        container.innerHTML = '';

        if (question.type === 'mcq') {
            question.options.forEach((option, index) => {
                const optionEl = document.createElement('div');
                optionEl.className = 'option-item';
                if (this.userAnswers[this.currentQuestionIndex] === option) {
                    optionEl.classList.add('selected');
                }
                optionEl.innerHTML = `
                    <div class="option-radio ${this.userAnswers[this.currentQuestionIndex] === option ? 'checked' : ''}"></div>
                    <span>${option}</span>
                `;

                optionEl.addEventListener('click', () => {
                    this.selectOption(option);
                });

                container.appendChild(optionEl);
            });
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
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        if (prevBtn) prevBtn.disabled = this.currentQuestionIndex === 0;
        if (nextBtn) nextBtn.disabled = this.currentQuestionIndex === this.questions.length - 1;
    }

    selectOption(option) {
        this.userAnswers[this.currentQuestionIndex] = option;

        // Update visual selection
        document.querySelectorAll('.option-item').forEach(item => {
            item.classList.remove('selected');
            const radio = item.querySelector('.option-radio');
            if (radio) radio.classList.remove('checked');
        });

        document.querySelectorAll('.option-item').forEach(item => {
            if (item.textContent.trim().includes(option)) {
                item.classList.add('selected');
                const radio = item.querySelector('.option-radio');
                if (radio) radio.classList.add('checked');
            }
        });
        
        // Update progress counter
        this.updateProgressCounter();
    }
    
    updateProgressCounter() {
        const answered = this.userAnswers.filter(a => a && a.trim() !== '').length;
        const answeredEl = document.getElementById('answeredCount');
        const totalEl = document.getElementById('totalCount');
        
        if (answeredEl) answeredEl.textContent = answered;
        if (totalEl) totalEl.textContent = this.questions.length;
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

    calculateLocalResults(isGuest = false) {
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

        this.showResults(result, !isGuest);
        this.resetQuestionTimer();
    }

    async submitTest() {
        // Check if all questions are answered
        const unanswered = this.userAnswers.filter(a => !a || a.trim() === '').length;
        
        if (unanswered > 0) {
            const confirmMsg = `You have ${unanswered} unanswered question(s). Submit anyway?`;
            if (!confirm(confirmMsg)) return;
        }
        
        if (this.timer) {
            clearInterval(this.timer);
        }

        const currentUser = localStorage.getItem('typingTestUser');
        const userEmail = localStorage.getItem('typingTestUserEmail') || (currentUser ? `${currentUser}@guest.local` : null);

        // Show loading state
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;

        // If user is logged in, try to submit to API
        if (currentUser && userEmail) {
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

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                        this.showResults(data.result, true);
                        return;
                    }
                }
            } catch (error) {
                console.log('API submit failed, calculating locally');
            }
        }
        
        // Calculate locally (for non-logged users or API failure)
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        this.calculateLocalResults(!currentUser);
    }

    showResults(result, savedToLeaderboard = false) {
        const modal = document.createElement('div');
        modal.className = 'results-modal';
        modal.innerHTML = `
            <div class="results-content">
                <h2 class="results-title">Test Results</h2>
                ${!savedToLeaderboard ? `
                    <div style="background: rgba(255, 199, 0, 0.1); border: 1px solid rgba(255, 199, 0, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: center;">
                        <i class="fas fa-info-circle" style="color: var(--highlight-color); margin-right: 8px;"></i>
                        <span style="color: var(--text-color);">Login to save your score to the leaderboard!</span>
                    </div>
                ` : ''}
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
                        <div class="result-value">${result.correctAnswers}/${result.totalQuestions}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Time</div>
                        <div class="result-value">${Math.floor(result.timeTaken / 60)}:${(result.timeTaken % 60).toString().padStart(2, '0')}</div>
                    </div>
                </div>
                ${result.badges && result.badges.length > 0 ? `
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
                    ${!savedToLeaderboard ? `
                        <button class="view-leaderboard-btn" onclick="window.location.href='/login.html'">
                            <i class="fas fa-sign-in-alt"></i>
                            Login to Save Score
                        </button>
                    ` : `
                        <button class="view-leaderboard-btn" onclick="window.location.href='/aptitude-leaderboard.html'">
                            <i class="fas fa-trophy"></i>
                            View Leaderboard
                        </button>
                    `}
                    <button class="retry-btn" onclick="window.location.reload()">
                        <i class="fas fa-redo"></i>
                        Try Again
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
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.displayLeaderboard(data.leaderboard);
                    return;
                }
            }
        } catch (error) {
            console.log('API leaderboard failed, using mock data');
        }
        
        // Fallback mock data
        const mockLeaderboard = [
            { name: 'Guest User', score: 80, accuracy: 85.5, timeTaken: 180, badges: ['good'] },
            { name: 'Demo Player', score: 60, accuracy: 75.0, timeTaken: 240, badges: [] }
        ];
        this.displayLeaderboard(mockLeaderboard);
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
