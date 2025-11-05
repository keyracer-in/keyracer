// Participant Dashboard Refactored JavaScript

class ParticipantDashboard {
    constructor() {
        this.currentPage = 'problem';
        this.codeEditor = null;
        this.timerInterval = null;
        this.chatMessages = [];
        this.problems = [];
        this.submissions = [];
        this.tabSwitchCount = 0;
        this.fullscreenExitCount = 0;
        this.currentProblemIndex = 0;
        this.codeExecutor = new CodeExecutor();

        // Make dashboard accessible globally for viewSubmission function
        window.participantDashboard = this;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeCodeEditor();
        this.initializeParticles();
        this.loadInitialData();
        this.startTimer();
        this.showFullscreenModal();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.navigateToPage(page);
            });
        });

        // Mobile sidebar toggle
        const mobileToggle = document.getElementById('mobile-toggle');
        const sidebarClose = document.getElementById('sidebar-close');

        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                document.getElementById('sidebar').classList.add('show');
            });
        }

        if (sidebarClose) {
            sidebarClose.addEventListener('click', () => {
                document.getElementById('sidebar').classList.remove('show');
            });
        }

        // Chat functionality
        this.setupChat();

        // Code execution
        this.setupCodeExecution();

        // Anti-cheating measures
        this.setupAntiCheating();

        // Form submissions
        this.setupFormSubmissions();
    }

    async navigateToPage(page) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // Hide sidebar on mobile
        if (window.innerWidth < 992) {
            document.getElementById('sidebar').classList.remove('show');
        }

        // Show selected page
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        document.getElementById(`${page}-page`).classList.add('active');

        this.currentPage = page;

        // Load page-specific data
        await this.loadPageData(page);
    }

    async loadPageData(page) {
        switch (page) {
            case 'problem':
                await this.loadProblems();
                break;
            case 'history':
                await this.loadSubmissionHistory();
                break;
            case 'rules':
                // Rules are static
                break;
        }
    }

    async loadProblems() {
        try {
            const currentHackathonId = localStorage.getItem('currentHackathonId');
            if (!currentHackathonId) {
                this.showNotification('No hackathon selected', 'warning');
                return;
            }

            // Load problems from API
            this.problems = await window.HackathonAPI.getHackathonProblems(currentHackathonId);
            this.displayProblems();
        } catch (error) {
            console.error('Error loading problems:', error);
            this.showNotification('Failed to load problems', 'error');
            this.problems = [];
            this.displayProblems();
        }
    }

    displayProblems() {
        const problemPage = document.getElementById('problem-page');
        if (!problemPage) return;

        if (this.problems.length === 0) {
            problemPage.innerHTML = `
                <div class="page-header">
                    <h1 class="page-title">Problem Statement</h1>
                </div>
                <div class="problem-container">
                    <div class="problem-content">
                        <p class="text-center">No problems available yet. Please check back later.</p>
                    </div>
                </div>
            `;
            return;
        }

        // Create problem selector if multiple problems exist
        let problemSelector = '';
        if (this.problems.length > 1) {
            problemSelector = `
                <div class="problem-selector">
                    <div class="problem-tabs">
                        ${this.problems.map((problem, index) => `
                            <button class="problem-tab ${index === 0 ? 'active' : ''}" data-problem-index="${index}">
                                <span class="problem-number">${index + 1}</span>
                                <span class="problem-title-short">${problem.title.substring(0, 20)}${problem.title.length > 20 ? '...' : ''}</span>
                                <span class="problem-difficulty difficulty-${problem.difficulty}">${problem.difficulty.charAt(0).toUpperCase()}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        problemPage.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Problem Statement</h1>
                ${problemSelector}
            </div>
            <div class="problem-container">
                <div class="problem-content" id="problem-content">
                    <!-- Problem content will be loaded here -->
                </div>
            </div>
        `;

        // Add event listeners for problem tabs
        if (this.problems.length > 1) {
            const problemTabs = problemPage.querySelectorAll('.problem-tab');
            problemTabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    const index = parseInt(e.currentTarget.getAttribute('data-problem-index'));
                    this.selectProblem(index);
                });
            });
        }

        // Display the first problem by default
        this.displayProblem(this.problems[0]);
    }

    selectProblem(index) {
        // Update active tab
        const problemTabs = document.querySelectorAll('.problem-tab');
        problemTabs.forEach((tab, i) => {
            tab.classList.toggle('active', i === index);
        });

        // Display selected problem
        const problem = this.problems[index];
        this.displayProblem(problem);

        // Update current problem for submission
        this.currentProblemIndex = index;

        // Update submission page with selected problem details
        this.updateSubmissionPage(problem);

        // Check if already submitted for this problem and disable submit button
        this.checkAndDisableSubmittedProblems();
    }

    displayProblem(problem) {
        const problemContent = document.getElementById('problem-content');
        if (!problemContent) return;

        problemContent.innerHTML = `
            <div class="problem-header">
                <h2 class="problem-title">${problem.title}</h2>
                <span class="problem-difficulty difficulty-${problem.difficulty}">${problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}</span>
            </div>
            <div class="problem-content">
                <div class="problem-section">
                    <h3 class="problem-section-title">Description</h3>
                    <p>${problem.description}</p>
                </div>
                <div class="problem-section">
                    <h3 class="problem-section-title">Input Format</h3>
                    <p>${problem.inputFormat || 'Not specified'}</p>
                </div>
                <div class="problem-section">
                    <h3 class="problem-section-title">Output Format</h3>
                    <p>${problem.outputFormat || 'Not specified'}</p>
                </div>
                ${problem.sampleInput ? `
                    <div class="problem-section">
                        <h3 class="problem-section-title">Sample Input/Output</h3>
                        <div class="example-box">
                            <h4 class="example-title">Sample Input:</h4>
                            <div class="code-example">${problem.sampleInput}</div>
                            <h4 class="example-title">Sample Output:</h4>
                            <div class="code-example">${problem.sampleOutput || 'Not provided'}</div>
                        </div>
                    </div>
                ` : ''}
                ${problem.constraints ? `
                    <div class="problem-section">
                        <h3 class="problem-section-title">Constraints</h3>
                        <div class="constraints">
                            <p>${problem.constraints}</p>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    async loadSubmissionHistory() {
        try {
            const currentHackathonId = localStorage.getItem('currentHackathonId');
            const currentParticipantId = localStorage.getItem('currentParticipantId');

            if (!currentHackathonId || !currentParticipantId) {
                this.showNotification('Participant data not found', 'warning');
                return;
            }

            // Load submissions from API
            this.submissions = await window.HackathonAPI.getParticipantSubmissions(currentHackathonId, currentParticipantId);
            this.displaySubmissionHistory();
        } catch (error) {
            console.error('Error loading submission history:', error);
            this.showNotification('Failed to load submission history', 'error');
            this.submissions = [];
            this.displaySubmissionHistory();
        }
    }

    displaySubmissionHistory() {
        const historyContainer = document.querySelector('.history-container');
        if (!historyContainer) return;

        const tbody = historyContainer.querySelector('tbody');
        if (!tbody) return;

        if (this.submissions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">No submissions yet.</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.submissions.map(submission => `
            <tr>
                <td>#${submission._id ? submission._id.toString() : 'N/A'}</td>
                <td>${submission.problemId}</td>
                <td>${submission.language}</td>
                <td>${new Date(submission.submittedAt).toLocaleString()}</td>
                <td><span class="submission-status status-${submission.status}">${submission.status}</span></td>
                <td>
                    <button class="btn-sm btn-secondary-custom" onclick="viewSubmission('${submission._id ? submission._id.toString() : submission.problemId}')">View</button>
                </td>
            </tr>
        `).join('');
    }

    viewSubmission(submissionId) {
        // Find the submission by ID
        const submission = this.submissions.find(s => s._id && s._id.toString() === submissionId);
        if (!submission) {
            console.log('Submission not found:', submissionId);
            return;
        }

        // Create a modal to display submission details
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            color: white;
            font-family: 'Orbitron', sans-serif;
        `;

        modal.innerHTML = `
            <div style="background: var(--card-bg); border-radius: 15px; border: 2px solid var(--accent-color); max-width: 800px; width: 90%; max-height: 80vh; overflow-y: auto; padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="color: var(--accent-color); margin: 0;">Submission Details</h2>
                    <button id="closeModalBtn" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer;">&times;</button>
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Problem ID:</strong> ${submission.problemId}
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Language:</strong> ${submission.language}
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Submitted At:</strong> ${new Date(submission.submittedAt).toLocaleString()}
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Status:</strong> <span class="submission-status status-${submission.status}">${submission.status}</span>
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Code:</strong>
                </div>
                <pre style="background: #1e1e1e; padding: 15px; border-radius: 8px; overflow-x: auto; white-space: pre-wrap; font-family: 'Courier New', monospace; font-size: 14px;">${submission.code}</pre>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal functionality
        document.getElementById('closeModalBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    setupChat() {
        const chatHeader = document.getElementById('chat-header');
        const chatInput = document.getElementById('chat-input');
        const chatSend = document.getElementById('chat-send');
        const chatBody = document.getElementById('chat-body');

        chatHeader.addEventListener('click', () => {
            document.getElementById('chat-container').classList.toggle('open');
        });

        const sendMessage = () => {
            const message = chatInput.value.trim();
            if (!message) return;

            const currentHackathonId = localStorage.getItem('currentHackathonId');
            const participantName = localStorage.getItem('participantName') || 'Anonymous';

            if (!currentHackathonId) {
                this.showNotification('No hackathon selected. Please join a hackathon first.', 'warning');
                return;
            }

            const chatMessage = {
                id: Date.now().toString(),
                hackathonId: currentHackathonId,
                sender: 'participant',
                senderName: participantName,
                message: message,
                timestamp: new Date().toISOString()
            };

            this.chatMessages.push(chatMessage);
            localStorage.setItem('chatMessages', JSON.stringify(this.chatMessages));

            chatInput.value = '';
            this.displayChatMessages();
        };

        chatSend.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });

        // Load existing messages
        this.chatMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
        this.displayChatMessages();

        // Auto-refresh chat messages
        setInterval(() => {
            this.displayChatMessages();
        }, 5000);
    }

    displayChatMessages() {
        const chatBody = document.getElementById('chat-body');
        const currentHackathonId = localStorage.getItem('currentHackathonId');

        if (!currentHackathonId) return;

        const hackathonMessages = this.chatMessages
            .filter(m => m.hackathonId === currentHackathonId)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        chatBody.innerHTML = '';

        if (hackathonMessages.length === 0) {
            chatBody.innerHTML = `
                <div class="text-center text-muted p-3">
                    <i class="fas fa-comments fa-2x mb-2"></i>
                    <p>No messages yet. Start the conversation!</p>
                </div>
            `;
            return;
        }

        hackathonMessages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = `chat-message ${message.sender === 'participant' ? 'message-sent' : 'message-received'}`;

            const timestamp = new Date(message.timestamp);
            const timeString = timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            messageElement.innerHTML = `
                <div class="message-content">
                    <div class="message-sender" style="font-size: 0.8rem; color: ${message.sender === 'participant' ? 'var(--participant-color)' : 'var(--organizer-color)'}; margin-bottom: 2px;">
                        ${message.senderName}
                    </div>
                    ${message.message}
                </div>
                <div class="message-time">${timeString}</div>
            `;

            chatBody.appendChild(messageElement);
        });

        chatBody.scrollTop = chatBody.scrollHeight;
    }

    initializeCodeEditor() {
        const textarea = document.getElementById('solution-editor');
        if (!textarea || typeof CodeMirror === 'undefined') return;

        this.codeEditor = CodeMirror.fromTextArea(textarea, {
            lineNumbers: true,
            mode: 'javascript',
            theme: 'dracula',
            indentUnit: 4,
            lineWrapping: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            gutters: ['CodeMirror-linenumbers'],
            extraKeys: {
                'Ctrl-V': () => false,
                'Cmd-V': () => false,
                'Ctrl-C': () => false,
                'Cmd-C': () => false
            }
        });

        // Focus and position cursor
        setTimeout(() => {
            this.codeEditor.refresh();
            this.codeEditor.focus();
            this.codeEditor.setCursor({line: 0, ch: 0});
        }, 200);

        // Prevent context menu and paste
        this.codeEditor.getWrapperElement().addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });

        // Apply anti-cheating attributes from data attributes
        const solutionTextarea = document.getElementById('solution-editor');
        if (solutionTextarea) {
            const antiCheatAttrs = ['onpaste', 'ondrop', 'oncontextmenu', 'onselectstart', 'ondragstart'];
            antiCheatAttrs.forEach(attr => {
                const dataAttr = `data-${attr}`;
                if (solutionTextarea.hasAttribute(dataAttr)) {
                    const handler = solutionTextarea.getAttribute(dataAttr);
                    solutionTextarea.addEventListener(attr.slice(2), (e) => {
                        e.preventDefault();
                        return eval(handler);
                    });
                }
            });
        }
    }

    setupCodeExecution() {
        const runBtn = document.getElementById('run-code-btn');
        if (!runBtn) return;

        runBtn.addEventListener('click', () => {
            this.runCode();
        });

        // Setup custom input toggle
        const customInputToggle = document.getElementById('custom-input-toggle');
        if (customInputToggle) {
            customInputToggle.addEventListener('click', () => {
                this.toggleCustomInput();
            });
        }
    }

    async runCode() {
        const outputContent = document.getElementById('output-content');
        if (!outputContent) return;

        const code = this.codeEditor ? this.codeEditor.getValue() : '';
        if (!code.trim()) {
            outputContent.innerHTML = '<div class="error">Please enter some code to run.</div>';
            return;
        }

        // Get the selected language from the dropdown
        const language = document.querySelector('.language-selector').value;

        // Get custom input if provided
        const customInput = document.getElementById('custom-input-editor');
        const input = customInput && customInput.value.trim() ? customInput.value : '';

        // Get the current problem for context
        const currentProblem = this.getCurrentProblem();

        // Show loading state with problem context
        const problemTitle = currentProblem ? currentProblem.title : 'Unknown Problem';
        const inputIndicator = input ? ' with custom input' : '';
        outputContent.innerHTML = `<div class="loading">Running ${language.charAt(0).toUpperCase() + language.slice(1)} code for "${problemTitle}"${inputIndicator}...</div>`;

        try {
            // Use the Piston API to execute code with the selected language and custom input
            const result = await this.codeExecutor.execute(code, language, input);

            if (result.error) {
                outputContent.innerHTML = `
                    <div class="error">Execution Error for "${problemTitle}" (${language.charAt(0).toUpperCase() + language.slice(1)}):</div>
                    <pre class="error-output">${result.error}</pre>
                `;
            } else {
                outputContent.innerHTML = `
                    <div class="success">Code executed successfully for "${problemTitle}" (${language.charAt(0).toUpperCase() + language.slice(1)} )!</div>
                    <pre class="code-output">${result.output || 'No output'}</pre>
                `;
            }
        } catch (error) {
            outputContent.innerHTML = `<div class="error">Error running code for "${problemTitle}" (${language.charAt(0).toUpperCase() + language.slice(1)}): ${error.message}</div>`;
        }
    }

    getCurrentProblem() {
        // Get the current problem from URL or from the problems list
        const urlParams = new URLSearchParams(window.location.search);
        const problemId = urlParams.get('problem');

        if (problemId) {
            return this.problems.find(p => p.id === problemId);
        }

        // If no problem in URL, return the currently selected problem or the first problem
        const currentIndex = this.currentProblemIndex !== undefined ? this.currentProblemIndex : 0;
        return this.problems.length > 0 ? this.problems[currentIndex] : null;
    }

    setupAntiCheating() {
        // Tab switching detection
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.tabSwitchCount++;
                localStorage.setItem('tabSwitchCount', this.tabSwitchCount.toString());

                if (this.tabSwitchCount >= 3) {
                    this.showNotification('Multiple tab switches detected! This may be reported to organizers.', 'warning');
                }
            }
        });

        // Fullscreen monitoring
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('msfullscreenchange', () => this.handleFullscreenChange());

        // Prevent common cheating shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.key === 'u') ||
                (e.ctrlKey && e.shiftKey && e.key === 'C')) {
                e.preventDefault();
                this.showNotification('Developer tools are disabled during the hackathon.', 'warning');
                return false;
            }
        });

        // Disable right-click
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });
    }

    handleFullscreenChange() {
        const isFullscreen = !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        );

        if (!isFullscreen) {
            this.fullscreenExitCount++;
            if (this.fullscreenExitCount === 1 || this.fullscreenExitCount === 2) {
                this.showWarningModal('Warning!', 'You have exited fullscreen mode. Please return to fullscreen mode to continue.');
            } else if (this.fullscreenExitCount >= 3) {
                this.showDisqualificationModal();
            }
        }
    }

    setupFormSubmissions() {
        // Handle solution submission
        const submitBtn = document.querySelector('.btn-primary-custom');
        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.submitSolution();
            });
        }

        // Check and disable submit button for problems already submitted
        this.checkAndDisableSubmittedProblems();
    }

    disableSubmitForProblem(problemId) {
        const submitBtn = document.querySelector('.btn-primary-custom');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Already Submitted';
            submitBtn.style.opacity = '0.6';
            submitBtn.style.cursor = 'not-allowed';
        }
    }

    async checkAndDisableSubmittedProblems() {
        try {
            const currentHackathonId = localStorage.getItem('currentHackathonId');
            const currentParticipantId = localStorage.getItem('currentParticipantId');

            if (!currentHackathonId || !currentParticipantId) {
                return;
            }

            const submissions = await window.HackathonAPI.getParticipantSubmissions(currentHackathonId, currentParticipantId);
            const submittedProblemIds = submissions.map(s => s.problemId);

            // Get current problem
            const currentProblem = this.getCurrentProblem();
            if (currentProblem && submittedProblemIds.includes(currentProblem.id)) {
                this.disableSubmitForProblem(currentProblem.id);
            }
        } catch (error) {
            console.error('Error checking submitted problems:', error);
        }
    }

    async submitSolution() {
        const code = this.codeEditor ? this.codeEditor.getValue() : '';
        const language = document.querySelector('.language-selector').value;

        if (!code.trim()) {
            this.showNotification('Please enter some code before submitting.', 'warning');
            return;
        }

        // Show confirmation modal
        this.showSubmissionConfirmation(code, language);
    }

    showSubmissionConfirmation(code, language) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            color: white;
            font-family: 'Orbitron', sans-serif;
        `;

        modal.innerHTML = `
            <div style="text-align: center; padding: 40px; background: var(--card-bg); border-radius: 15px; border: 2px solid var(--accent-color); max-width: 600px; width: 90%;">
                <h2 style="color: var(--accent-color); margin-bottom: 20px;">⚠️ Confirm Submission</h2>
                <p style="margin-bottom: 20px; font-size: 1.1rem; line-height: 1.5;">
                    Are you sure you want to submit your solution?
                </p>
                <div style="margin-bottom: 20px; text-align: left;">
                    <strong>Language:</strong> ${language.charAt(0).toUpperCase() + language.slice(1)}<br>
                    <strong>Code Length:</strong> ${code.length} characters<br>
                    <strong>Problem:</strong> ${this.getCurrentProblem() ? this.getCurrentProblem().title : 'N/A'}
                </div>
                <p style="margin-bottom: 30px; font-size: 0.9rem; color: var(--text-secondary);">
                    Once submitted, you cannot modify your solution. Make sure your code is correct and complete.
                </p>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button id="cancelSubmitBtn" style="
                        background: var(--danger-color);
                        border: none;
                        color: white;
                        padding: 12px 25px;
                        font-size: 1rem;
                        border-radius: 8px;
                        cursor: pointer;
                        font-family: 'Orbitron', sans-serif;
                        font-weight: 600;
                    ">Cancel</button>
                    <button id="confirmSubmitBtn" style="
                        background: linear-gradient(90deg, var(--participant-color) 0%, var(--secondary-color) 100%);
                        border: none;
                        color: white;
                        padding: 12px 25px;
                        font-size: 1rem;
                        border-radius: 8px;
                        cursor: pointer;
                        font-family: 'Orbitron', sans-serif;
                        font-weight: 600;
                    ">Submit Solution</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('cancelSubmitBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        document.getElementById('confirmSubmitBtn').addEventListener('click', async () => {
            document.body.removeChild(modal);
            await this.processSubmission(code, language);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    async processSubmission(code, language) {
        try {
            const currentHackathonId = localStorage.getItem('currentHackathonId');
            const currentParticipantId = localStorage.getItem('currentParticipantId');

            if (!currentHackathonId || !currentParticipantId) {
                this.showNotification('Participant data not found', 'error');
                return;
            }

            // Get current problem (now uses the selected problem)
            const currentProblem = this.getCurrentProblem();
            if (!currentProblem) {
                this.showNotification('No problem selected', 'error');
                return;
            }

            // Submit via API
            const submissionData = {
                participantId: currentParticipantId,
                problemId: currentProblem.id,
                code: code,
                language: language
            };

            const submission = await window.HackathonAPI.submitSolution(currentHackathonId, submissionData);

            // Reload submission history to show the new submission
            await this.loadSubmissionHistory();

            // Disable submit button for this problem
            this.disableSubmitForProblem(currentProblem.id);

            // Show success message with problem name
            this.showNotification(`Solution for "${currentProblem.title}" submitted successfully! You cannot submit another solution for this problem.`, 'success');

        } catch (error) {
            console.error('Error submitting solution:', error);
            // Check if error is due to already submitted
            if (error.message && error.message.includes('You can only submit one solution per problem')) {
                this.showNotification('You have already submitted a solution for this problem. You can only submit once per problem.', 'warning');
                // Disable submit button for this problem
                const currentProblem = this.getCurrentProblem();
                if (currentProblem) {
                    this.disableSubmitForProblem(currentProblem.id);
                }
            } else {
                this.showNotification('Failed to submit solution', 'error');
            }
        }
    }

    async startTimer() {
        const timerElement = document.getElementById('countdown-timer');
        if (!timerElement) return;

        const currentHackathonId = localStorage.getItem('currentHackathonId');
        if (!currentHackathonId) {
            timerElement.textContent = '00:00:00';
            return;
        }

        try {
            // Fetch hackathon details to get start and end times
            const hackathon = await window.HackathonAPI.findHackathon(currentHackathonId);

            if (!hackathon || !hackathon.startTime || !hackathon.endTime) {
                console.error('Hackathon start/end times not available');
                timerElement.textContent = '00:00:00';
                return;
            }

            // Parse start and end times
            const startTime = new Date(`${hackathon.date}T${hackathon.startTime}`);
            const endTime = new Date(`${hackathon.date}T${hackathon.endTime}`);
            const now = new Date();

            // Calculate total duration in seconds
            const totalDuration = Math.floor((endTime - startTime) / 1000);

            // Calculate remaining time from now
            let timeLeft;
            if (now < startTime) {
                // Hackathon hasn't started yet
                timeLeft = totalDuration;
                timerElement.textContent = 'Not started';
                this.showNotification('Hackathon has not started yet. Timer will begin when it starts.', 'info');
                return;
            } else if (now >= endTime) {
                // Hackathon has ended
                timeLeft = 0;
                timerElement.textContent = '00:00:00';
                this.showNotification('Hackathon time is up!', 'warning');
                return;
            } else {
                // Hackathon is in progress
                timeLeft = Math.floor((endTime - now) / 1000);
            }

            this.timerInterval = setInterval(() => {
                const hours = Math.floor(timeLeft / 3600);
                const minutes = Math.floor((timeLeft % 3600) / 60);
                const seconds = timeLeft % 60;

                timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                if (timeLeft <= 0) {
                    clearInterval(this.timerInterval);
                    timerElement.textContent = '00:00:00';
                    this.showNotification('Hackathon time is up!', 'warning');
                }
                timeLeft--;
            }, 1000);

        } catch (error) {
            console.error('Error fetching hackathon details for timer:', error);
            // Fallback to a default timer if API fails
            let timeLeft = 2 * 60 * 60; // 2 hours fallback

            this.timerInterval = setInterval(() => {
                const hours = Math.floor(timeLeft / 3600);
                const minutes = Math.floor((timeLeft % 3600) / 60);
                const seconds = timeLeft % 60;

                timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                if (timeLeft <= 0) {
                    clearInterval(this.timerInterval);
                    timerElement.textContent = '00:00:00';
                    this.showNotification('Hackathon time is up!', 'warning');
                }
                timeLeft--;
            }, 1000);
        }
    }

    showFullscreenModal() {
        setTimeout(() => {
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                color: white;
                font-family: 'Orbitron', sans-serif;
            `;

            modal.innerHTML = `
                <div style="text-align: center; padding: 40px; background: var(--card-bg); border-radius: 15px; border: 2px solid var(--accent-color); max-width: 500px;">
                    <h2 style="color: var(--accent-color); margin-bottom: 20px;">🔒 Security Mode Required</h2>
                    <p style="margin-bottom: 30px; font-size: 1.1rem; line-height: 1.5;">This hackathon requires fullscreen mode for security and fair play. Tab switching will be monitored.</p>
                    <button id="enterFullscreenBtn" style="
                        background: linear-gradient(90deg, var(--participant-color) 0%, var(--secondary-color) 100%);
                        border: none;
                        color: white;
                        padding: 15px 30px;
                        font-size: 1.1rem;
                        border-radius: 8px;
                        cursor: pointer;
                        font-family: 'Orbitron', sans-serif;
                        font-weight: 600;
                    ">Enter Fullscreen Mode</button>
                </div>
            `;

            document.body.appendChild(modal);

            document.getElementById('enterFullscreenBtn').addEventListener('click', () => {
                this.enterFullscreen();
                document.body.removeChild(modal);
            });
        }, 2000);
    }

    enterFullscreen() {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    }

    showWarningModal(title, message) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            color: white;
            font-family: 'Orbitron', sans-serif;
        `;

        modal.innerHTML = `
            <div style="text-align: center; padding: 40px; background: var(--card-bg); border-radius: 15px; border: 2px solid var(--danger-color); max-width: 500px;">
                <h2 style="color: var(--danger-color); margin-bottom: 20px;">⚠️ ${title}</h2>
                <p style="margin-bottom: 30px; font-size: 1.1rem; line-height: 1.5;">${message}</p>
                <button id="returnFullscreenBtn" style="
                    background: linear-gradient(90deg, var(--participant-color) 0%, var(--secondary-color) 100%);
                    border: none;
                    color: white;
                    padding: 15px 30px;
                    font-size: 1.1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-family: 'Orbitron', sans-serif;
                    font-weight: 600;
                ">Return to Fullscreen</button>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('returnFullscreenBtn').addEventListener('click', () => {
            this.enterFullscreen();
            document.body.removeChild(modal);
        });
    }

    showDisqualificationModal() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            color: white;
            font-family: 'Orbitron', sans-serif;
        `;

        modal.innerHTML = `
            <div style="text-align: center; padding: 40px; background: var(--card-bg); border-radius: 15px; border: 2px solid var(--danger-color); max-width: 500px;">
                <h2 style="color: var(--danger-color); margin-bottom: 20px;">🚫 DISQUALIFIED</h2>
                <p style="margin-bottom: 30px; font-size: 1.1rem; line-height: 1.5;">You have exited fullscreen mode twice. You are now disqualified from this hackathon.</p>
                <button id="exitHackathonBtn" style="
                    background: var(--danger-color);
                    border: none;
                    color: white;
                    padding: 15px 30px;
                    font-size: 1.1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-family: 'Orbitron', sans-serif;
                    font-weight: 600;
                ">Exit Hackathon</button>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('exitHackathonBtn').addEventListener('click', () => {
            window.location.href = 'hackathon.html';
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // Add to page
        document.body.appendChild(notification);

        // Remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    initializeParticles() {
        if (typeof particlesJS !== 'undefined') {
            particlesJS("particles-js", {
                "particles": {
                    "number": {
                        "value": 50,
                        "density": {
                            "enable": true,
                            "value_area": 800
                        }
                    },
                    "color": {
                        "value": "#00FFDD"
                    },
                    "shape": {
                        "type": "circle",
                        "stroke": {
                            "width": 0,
                            "color": "#000000"
                        },
                        "polygon": {
                            "nb_sides": 5
                        }
                    },
                    "opacity": {
                        "value": 0.2,
                        "random": true,
                        "anim": {
                            "enable": true,
                            "speed": 1,
                            "opacity_min": 0.1,
                            "sync": false
                        }
                    },
                    "size": {
                        "value": 3,
                        "random": true,
                        "anim": {
                            "enable": true,
                            "speed": 2,
                            "size_min": 0.1,
                            "sync": false
                        }
                    },
                    "line_linked": {
                        "enable": true,
                        "distance": 150,
                        "color": "#00C2FF",
                        "opacity": 0.2,
                        "width": 1
                    },
                    "move": {
                        "enable": true,
                        "speed": 1,
                        "direction": "none",
                        "random": true,
                        "straight": false,
                        "out_mode": "out",
                        "bounce": false,
                        "attract": {
                            "enable": false,
                            "rotateX": 600,
                            "rotateY": 1200
                        }
                    }
                },
                "interactivity": {
                    "detect_on": "canvas",
                    "events": {
                        "onhover": {
                            "enable": true,
                            "mode": "grab"
                        },
                        "onclick": {
                            "enable": true,
                            "mode": "push"
                        },
                        "resize": true
                    },
                    "modes": {
                        "grab": {
                            "distance": 140,
                            "line_linked": {
                                "opacity": 0.5
                            }
                        },
                        "bubble": {
                            "distance": 400,
                            "size": 40,
                            "duration": 2,
                            "opacity": 8,
                            "speed": 3
                        },
                        "repulse": {
                            "distance": 200,
                            "duration": 0.4
                        },
                        "push": {
                            "particles_nb": 4
                        },
                        "remove": {
                            "particles_nb": 2
                        }
                    }
                },
                "retina_detect": true
            });
        }
    }

    async loadInitialData() {
        // Get parameters from URL
        const urlParams = new URLSearchParams(window.location.search);
        const hackathonId = urlParams.get('hackathonId');
        const participantId = urlParams.get('participantId');

        if (hackathonId) {
            localStorage.setItem('currentHackathonId', hackathonId);
        }

        if (participantId) {
            localStorage.setItem('currentParticipantId', participantId);
        }

        // Set participant name
        const participantName = localStorage.getItem('participantName');
        if (participantName) {
            const nameElement = document.getElementById('participant-name');
            if (nameElement) nameElement.textContent = participantName;
        }

        // Load initial problems
        await this.loadProblems();

        // Initialize submission page with first problem if available
        if (this.problems.length > 0) {
            this.updateSubmissionPage(this.problems[0]);
        }
    }

    updateSubmissionPage(problem) {
        const titleElement = document.getElementById('submission-problem-title');
        const difficultyElement = document.getElementById('submission-problem-difficulty');

        if (titleElement) {
            titleElement.textContent = problem.title;
        }

        if (difficultyElement) {
            // Clear existing difficulty classes
            difficultyElement.className = 'problem-difficulty';
            // Add the appropriate difficulty class
            difficultyElement.classList.add(`difficulty-${problem.difficulty}`);
            difficultyElement.textContent = problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1);
        }

        // Update custom input placeholder with problem sample input if available
        const customInputEditor = document.getElementById('custom-input-editor');
        if (customInputEditor && problem.sampleInput) {
            customInputEditor.placeholder = `Enter custom input for testing your code...\n\nSample Input from "${problem.title}":\n${problem.sampleInput}`;
        }
    }

    toggleCustomInput() {
        const container = document.getElementById('custom-input-container');
        const toggleBtn = document.getElementById('custom-input-toggle');
        const toggleIcon = toggleBtn.querySelector('i');
        const toggleText = toggleBtn.querySelector('span');

        if (container.style.display === 'none') {
            container.style.display = 'block';
            toggleIcon.className = 'fas fa-chevron-up';
            toggleText.textContent = 'Hide Input';
        } else {
            container.style.display = 'none';
            toggleIcon.className = 'fas fa-chevron-down';
            toggleText.textContent = 'Show Input';
        }
    }
}

// Global function for viewing submissions
function viewSubmission(submissionId) {
    if (window.participantDashboard) {
        window.participantDashboard.viewSubmission(submissionId);
    } else {
        console.log('Viewing submission:', submissionId);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Preloader animation
    const preloader = document.getElementById('preloader');
    const loaderBar = document.getElementById('loader-bar');
    let width = 0;

    const loadingMessages = [
        "Loading participant dashboard",
        "Preparing problem statements",
        "Setting up code editor",
        "Configuring submission system",
        "Ready to code!"
    ];

    let loadingText = preloader.querySelector('p');
    loadingText.textContent = loadingMessages[0];

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        loadingText.textContent = loadingMessages[messageIndex];
    }, 1500);

    const interval = setInterval(() => {
        width += Math.floor(Math.random() * 10) + 1;
        if (width > 100) width = 100;
        loaderBar.style.width = width + '%';

        if (width === 100) {
            clearInterval(interval);
            clearInterval(messageInterval);
            loadingText.textContent = "Launch complete!";
            setTimeout(() => {
                preloader.style.opacity = '0';
                preloader.style.visibility = 'hidden';
                new ParticipantDashboard();
            }, 800);
        }
    }, 100);
});
