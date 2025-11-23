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

        // Update sidebar to show subsections
        this.populateSidebar(topic, subsection);
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

    populateSidebar(topic, activeSubsection = null) {
        const topicList = document.querySelector('.topic-list');
        if (!topicList) return;

        // Clear existing content
        topicList.innerHTML = '';

        // Add main topics
        Object.keys(this.content).forEach(topicKey => {
            const topicItem = document.createElement('li');
            topicItem.className = 'topic-item';

            const topicLink = document.createElement('a');
            topicLink.href = '#';
            topicLink.className = `topic-link ${topicKey === topic && !activeSubsection ? 'active' : ''}`;
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

            // Add subsections if this is the active topic
            if (topicKey === topic) {
                const sections = this.parseSections(this.content[topicKey].content);
                if (sections.length > 0) {
                    const subsectionList = document.createElement('ul');
                    subsectionList.className = 'subsection-list';

                    sections.forEach(section => {
                        const subsectionItem = document.createElement('li');
                        subsectionItem.className = 'subsection-item';

                        const subsectionLink = document.createElement('a');
                        subsectionLink.href = '#';
                        subsectionLink.className = `subsection-link ${section.title === activeSubsection ? 'active' : ''}`;
                        subsectionLink.dataset.topic = topicKey;
                        subsectionLink.dataset.subsection = section.title;
                        subsectionLink.textContent = section.title;

                        subsectionLink.addEventListener('click', (e) => {
                            e.preventDefault();
                            this.loadTopicContent(topicKey, section.title);
                        });

                        subsectionItem.appendChild(subsectionLink);
                        subsectionList.appendChild(subsectionItem);
                    });

                    topicItem.appendChild(subsectionList);
                }
            }

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

    async loadQuestions(topic) {
        try {
            const response = await fetch(`/api/aptitude/questions/${topic}`);
            const data = await response.json();

            if (data.success) {
                this.questions = data.questions;
                this.currentQuestionIndex = 0;
                this.userAnswers = new Array(this.questions.length).fill('');
                this.startQuestionTimer();
                this.displayQuestion();
            }
        } catch (error) {
            console.error('Error loading questions:', error);
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
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
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

    async submitTest() {
        if (this.timer) {
            clearInterval(this.timer);
        }

        const submissionData = {
            testType: 'individual',
            questions: this.questions.map((q, index) => ({
                questionId: q._id,
                userAnswer: this.userAnswers[index] || '',
                timeSpent: this.elapsedTime
            })),
            timeTaken: this.elapsedTime
        };

        try {
            const response = await fetch('/api/aptitude/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submissionData)
            });

            const data = await response.json();

            if (data.success) {
                this.showResults(data.result);
                this.resetQuestionTimer();
            } else {
                alert('Error submitting test: ' + data.message);
            }
        } catch (error) {
            console.error('Error submitting test:', error);
            alert('Error submitting test. Please try again.');
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
                <button class="close-results" onclick="this.parentElement.parentElement.remove()">
                    Close
                </button>
            </div>
        `;

        document.body.appendChild(modal);
    }

    getBadgeName(badge) {
        const names = {
            'math-whiz': 'Math Whiz',
            'fast-thinker': 'Fast Thinker',
            'puzzle-master': 'Puzzle Master'
        };
        return names[badge] || badge;
    }

    async loadLeaderboard(period = 'all-time') {
        try {
            const response = await fetch(`/api/aptitude/leaderboard?period=${period}`);
            const data = await response.json();

            if (data.success) {
                this.displayLeaderboard(data.leaderboard);
            }
        } catch (error) {
            console.error('Error loading leaderboard:', error);
        }
    }

    displayLeaderboard(leaderboard) {
        const tbody = document.querySelector('.leaderboard-table tbody');
        if (!tbody) return;

        tbody.innerHTML = leaderboard.map((entry, index) => `
            <tr>
                <td class="rank-cell">${index + 1}</td>
                <td>${entry.name || entry.username || 'Anonymous'}</td>
                <td>${entry.score}</td>
                <td>${Math.floor(entry.timeTaken / 60)}:${(entry.timeTaken % 60).toString().padStart(2, '0')}</td>
                <td>${entry.accuracy.toFixed(1)}%</td>
                <td>
                    ${entry.badges.map(badge => `
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
