// Preloader animation
document.addEventListener('DOMContentLoaded', async function() {
    const preloader = document.getElementById('preloader');
    const loaderBar = document.getElementById('loader-bar');
    let width = 0;
    const interval = setInterval(function() {
        width += Math.floor(Math.random() * 10) + 1;
        if (width > 100) width = 100;
        loaderBar.style.width = width + '%';

        if (width === 100) {
            clearInterval(interval);
            setTimeout(function() {
                preloader.style.opacity = '0';
                preloader.style.visibility = 'hidden';
            }, 500);
        }
    }, 100);

    // Initialize particles.js
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

    // Initialize Flatpickr for date and time pickers
    function initializeFlatpickr() {
        if (typeof flatpickr !== 'undefined') {
            flatpickr("#hackathonDate", {
                dateFormat: "Y-m-d",
                minDate: "today"
            });

            flatpickr("#startTime", {
                enableTime: true,
                noCalendar: true,
                dateFormat: "H:i",
                time_24hr: true
            });

            flatpickr("#endTime", {
                enableTime: true,
                noCalendar: true,
                dateFormat: "H:i",
                time_24hr: true
            });
        } else {
            // Retry after a short delay if flatpickr is not loaded yet
            setTimeout(initializeFlatpickr, 100);
        }
    }

    initializeFlatpickr();

    // Sidebar toggle for mobile
    const sidebar = document.getElementById('sidebar');
    const mobileToggle = document.getElementById('mobile-toggle');
    const sidebarClose = document.getElementById('sidebar-close');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            sidebar.classList.add('show');
        });
    }

    if (sidebarClose) {
        sidebarClose.addEventListener('click', function() {
            sidebar.classList.remove('show');
        });
    }

    // Navigation menu
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));

            // Add active class to clicked link
            this.classList.add('active');

            // Hide sidebar on mobile after clicking a link
            if (window.innerWidth < 992) {
                sidebar.classList.remove('show');
            }

            // Show the corresponding page
            const pageName = this.getAttribute('data-page');
            console.log(`Navigating to ${pageName} page`);

            // Hide all pages
            pages.forEach(page => {
                page.style.display = 'none';
            });

            // Show the selected page
            const selectedPage = document.getElementById(`${pageName}-page`);
            if (selectedPage) {
                selectedPage.style.display = 'block';

                // Refresh hackathon dropdowns when problems page is shown
                if (pageName === 'problems') {
                    loadHackathonsIntoSelect();
                }
            }
        });
    });

    // Code generation functions
    function generateHackathonId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = 'HK';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    function generateOrganizerCode() {
        return 'ORG' + Math.random().toString(36).substr(2, 8).toUpperCase();
    }

    // Copy to clipboard function
    window.copyToClipboard = function(elementId) {
        const element = document.getElementById(elementId);
        element.select();
        element.setSelectionRange(0, 99999);
        document.execCommand('copy');

        // Show feedback
        const button = element.nextElementSibling;
        const originalIcon = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.style.color = 'var(--participant-color)';

        setTimeout(() => {
            button.innerHTML = originalIcon;
            button.style.color = '';
        }, 1000);
    };

    // Organizer Data Management
    let currentOrganizerCode = localStorage.getItem('currentOrganizerCode');

    // Check if organizer is accessing via organizer code
    const urlParams = new URLSearchParams(window.location.search);
    const organizerCode = urlParams.get('organizerCode') || localStorage.getItem('currentOrganizerCode');

    // Set organizer name from URL parameters or localStorage
    const organizerNameFromUrl = urlParams.get('organizerName');
    if (organizerNameFromUrl) {
        localStorage.setItem('organizerName', organizerNameFromUrl);
        document.getElementById('organizer-name').textContent = organizerNameFromUrl;
    } else {
        // Try to get from localStorage
        const storedName = localStorage.getItem('organizerName');
        if (storedName) {
            document.getElementById('organizer-name').textContent = storedName;
        }
    }

    // If organizer code exists, validate it and load hackathons
    if (organizerCode) {
        try {
            console.log('Validating organizer code:', organizerCode);
            const hackathon = await window.HackathonAPI.findHackathon(organizerCode);

            if (hackathon) {
                currentOrganizerCode = organizerCode;
                localStorage.setItem('currentOrganizerCode', organizerCode);
                console.log('Validated organizer code:', organizerCode, 'for hackathon:', hackathon.id);

                // Load all hackathons for this organizer from MongoDB
                console.log('Loading hackathons from MongoDB for organizer code:', currentOrganizerCode);
                const hackathonsFromDB = await window.HackathonAPI.getHackathonsByOrganizer(currentOrganizerCode);
                console.log('Hackathons loaded from DB:', hackathonsFromDB);

                if (hackathonsFromDB && hackathonsFromDB.length > 0) {
                    // Store hackathons in localStorage for UI display
                    setOrganizerData('hackathons', hackathonsFromDB);

                    // Also store problems and participants data for each hackathon
                    hackathonsFromDB.forEach(hackathon => {
                        if (hackathon.problems && hackathon.problems.length > 0) {
                            setOrganizerData('problems', hackathon.problems);
                        }
                        if (hackathon.participants && hackathon.participants.length > 0) {
                            // Store participants data if needed for other functions
                            console.log(`Loaded ${hackathon.participants.length} participants for hackathon ${hackathon.id}`);
                        }
                    });
                }
            } else {
                throw new Error('Hackathon not found for organizer code');
            }
        } catch (error) {
            console.error('Error validating organizer code:', error);
            // Invalid organizer code
            alert('Invalid organizer code. Please check and try again.');
            window.location.href = 'hackathon.html';
            return;
        }
    }

    // If no organizer code was provided, try to load hackathons from MongoDB using stored code
    if (!organizerCode && currentOrganizerCode) {
        try {
            console.log('Loading hackathons from MongoDB for stored organizer code:', currentOrganizerCode);
            const hackathonsFromDB = await window.HackathonAPI.getHackathonsByOrganizer(currentOrganizerCode);
            console.log('Hackathons loaded from DB:', hackathonsFromDB);

            if (hackathonsFromDB && hackathonsFromDB.length > 0) {
                // Store hackathons in localStorage for UI display
                setOrganizerData('hackathons', hackathonsFromDB);

                // Also store problems and participants data for each hackathon
                hackathonsFromDB.forEach(hackathon => {
                    if (hackathon.problems && hackathon.problems.length > 0) {
                        setOrganizerData('problems', hackathon.problems);
                    }
                    if (hackathon.participants && hackathon.participants.length > 0) {
                        // Store participants data if needed for other functions
                        console.log(`Loaded ${hackathon.participants.length} participants for hackathon ${hackathon.id}`);
                    }
                });
            }
        } catch (error) {
            console.error('Error loading hackathons from DB:', error);
            // Fallback to localStorage if DB fails
            const storedHackathons = getOrganizerData('hackathons');
            if (storedHackathons.length > 0) {
                console.log('Fallback: Loaded hackathons from localStorage');
            }
        }
    }

    // Helper functions for organizer-specific data
    function getOrganizerKey(key) {
        return `${currentOrganizerCode}_${key}`;
    }

    function getOrganizerData(key) {
        const keyName = getOrganizerKey(key);
        const data = localStorage.getItem(keyName);
        console.log(`Getting data for key: ${keyName}, data:`, data);
        return data ? JSON.parse(data) : [];
    }

    function setOrganizerData(key, data) {
        const keyName = getOrganizerKey(key);
        console.log(`Setting data for key: ${keyName}, data:`, data);
        localStorage.setItem(keyName, JSON.stringify(data));
        console.log(`After setting, localStorage[${keyName}]:`, localStorage.getItem(keyName));
    }

    // Create Hackathon Button
    const createHackathonBtn = document.getElementById('createHackathonBtn');

    if (createHackathonBtn) {
        createHackathonBtn.addEventListener('click', async function() {
            const title = document.getElementById('hackathonTitle').value;
            const date = document.getElementById('hackathonDate').value;
            const startTime = document.getElementById('startTime').value;
            const endTime = document.getElementById('endTime').value;

            if (!title || !date || !startTime || !endTime) {
                alert('Please fill in all required fields');
                return;
            }

            // Generate unique codes
            const hackathonId = generateHackathonId();
            const organizerCode = generateOrganizerCode();

            console.log('Creating hackathon with ID:', hackathonId, 'Organizer Code:', organizerCode);
            console.log('Current organizer code:', currentOrganizerCode);

            // Get selected tech stack
            const techStackSelect = document.getElementById('allowedTechStack');
            const allowedTechStack = Array.from(techStackSelect.selectedOptions).map(option => option.value);

            // Create hackathon object
            const hackathon = {
                id: hackathonId,
                organizerCode: organizerCode,
                title,
                date,
                startTime,
                endTime,
                rules: document.getElementById('hackathonRules').value,
                allowedTechStack,
                autoStart: document.getElementById('autoStart').checked,
                antiCheating: {
                    screenshotCheck: document.getElementById('screenshotCheck').checked,
                    webcamPermission: document.getElementById('webcamPermission').checked,
                    tabSwitchMonitoring: document.getElementById('tabSwitchMonitoring').checked
                },
                createdAt: new Date().toISOString(),
                status: 'upcoming',
                participants: []
            };

            // Save hackathon to MongoDB via API
            try {
                const result = await window.HackathonAPI.createHackathon({
                    title: hackathon.title,
                    date: hackathon.date,
                    startTime: hackathon.startTime,
                    endTime: hackathon.endTime,
                    rules: hackathon.rules,
                    allowedTechStack: hackathon.allowedTechStack,
                    autoStart: hackathon.autoStart,
                    antiCheating: hackathon.antiCheating,
                    organizerCode: organizerCode
                });

                console.log('Hackathon created successfully:', result);

                // Store the created hackathon info in localStorage for UI display
                hackathon.id = result.hackathon.id;
                hackathon.organizerCode = result.hackathon.organizerCode;

                let hackathons = getOrganizerData('hackathons');
                hackathons.push(hackathon);
                setOrganizerData('hackathons', hackathons);

                alert(`Hackathon "${hackathon.title}" created successfully!\n\nHackathon ID: ${hackathon.id}\nOrganizer Code: ${hackathon.organizerCode}`);
            } catch (error) {
                console.error('Failed to create hackathon:', error);
                alert('Failed to create hackathon. Please try again.');
                return;
            }

            // Store organizer code for this session
            localStorage.setItem('currentOrganizerCode', organizerCode);
            localStorage.setItem('currentHackathonId', hackathonId);

            // Also store the organizer code in the hackathon data for future access
            hackathon.organizerCode = organizerCode;

            // Close the create modal
            const createModal = bootstrap.Modal.getInstance(document.getElementById('createHackathonModal'));
            createModal.hide();

            // Show the generated codes
            document.getElementById('generatedHackathonId').value = hackathonId;
            document.getElementById('generatedOrganizerCode').value = organizerCode;

            // Show success modal
            const successModal = new bootstrap.Modal(document.getElementById('hackathonCreatedModal'));
            successModal.show();

            // Focus management for accessibility
            successModal._element.addEventListener('shown.bs.modal', function() {
                const modal = document.getElementById('hackathonCreatedModal');
                const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (focusableElements.length > 0) {
                    focusableElements[0].focus();
                }
            });

            // Show alert with the codes
            alert(`Hackathon created successfully!\n\nHackathon ID: ${hackathonId}\nOrganizer Code: ${organizerCode}\n\nCopy the Hackathon ID to share with participants.`);

            // Reset the form
            document.getElementById('createHackathonForm').reset();

            // Refresh hackathons table
            displayHackathons();
        });
    }

    // Display hackathons in table
    function displayHackathons() {
        const hackathons = getOrganizerData('hackathons');
        const tableBody = document.getElementById('hackathons-table-body');

        if (!tableBody) return;

        tableBody.innerHTML = '';

        if (hackathons.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="6" class="text-center">No hackathons created yet</td>`;
            tableBody.appendChild(emptyRow);
            return;
        }

        hackathons.forEach((hackathon, index) => {
            const participantCount = hackathon.participants ? hackathon.participants.length : 0;
            const statusClass = hackathon.status === 'active' ? 'active' : hackathon.status === 'completed' ? 'completed' : 'upcoming';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${hackathon.title}</td>
                <td>${hackathon.date}</td>
                <td>${hackathon.startTime} - ${hackathon.endTime}</td>
                <td><span class="badge bg-primary">${participantCount}</span></td>
                <td><span class="status ${statusClass}">${hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}</span></td>
                <td>
                    <div class="actions">
                        <button class="action-btn view" title="View Details" onclick="viewHackathon(${index})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" title="Edit Hackathon" onclick="editHackathon(${index})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" title="Delete Hackathon" onclick="deleteHackathon(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Hackathon action functions
    window.viewHackathon = function(index) {
        const hackathons = getOrganizerData('hackathons');
        const hackathon = hackathons[index];
        if (hackathon) {
            alert(`Hackathon: ${hackathon.title}\nID: ${hackathon.id}\nOrganizer Code: ${hackathon.organizerCode}\nParticipants: ${hackathon.participants ? hackathon.participants.length : 0}`);
        }
    };

    window.editHackathon = function(index) {
        const hackathons = getOrganizerData('hackathons');
        const hackathon = hackathons[index];

        if (!hackathon) return;

        // Populate edit form
        document.getElementById('editHackathonIndex').value = index;
        document.getElementById('editHackathonTitle').value = hackathon.title;
        document.getElementById('editHackathonDate').value = hackathon.date;
        document.getElementById('editStartTime').value = hackathon.startTime;
        document.getElementById('editEndTime').value = hackathon.endTime;
        document.getElementById('editHackathonRules').value = hackathon.rules || '';
        document.getElementById('editAutoStart').checked = hackathon.autoStart || false;

        // Set tech stack selections
        const techStackSelect = document.getElementById('editAllowedTechStack');
        Array.from(techStackSelect.options).forEach(option => {
            option.selected = hackathon.allowedTechStack && hackathon.allowedTechStack.includes(option.value);
        });

        // Set anti-cheating options
        if (hackathon.antiCheating) {
            document.getElementById('editScreenshotCheck').checked = hackathon.antiCheating.screenshotCheck || false;
            document.getElementById('editWebcamPermission').checked = hackathon.antiCheating.webcamPermission || false;
            document.getElementById('editTabSwitchMonitoring').checked = hackathon.antiCheating.tabSwitchMonitoring || false;
        }

        // Show edit modal
        const editModal = new bootstrap.Modal(document.getElementById('editHackathonModal'));
        editModal.show();
    };

    window.deleteHackathon = function(index) {
        if (confirm('Are you sure you want to delete this hackathon?')) {
            let hackathons = getOrganizerData('hackathons');
            hackathons.splice(index, 1);
            setOrganizerData('hackathons', hackathons);
            displayHackathons();
            alert('Hackathon deleted successfully!');
        }
    };

    // Real-time updates - check for participant changes every 3 seconds
    setInterval(async function() {
        displayHackathons();
        await displayParticipants();
        await displaySubmissions();
        await displayEvaluations();
        await displayLeaderboard();
    }, 3000);

    // Display submissions function
    async function displaySubmissions() {
        const hackathons = getOrganizerData('hackathons');
        const hackathonIds = hackathons.map(h => h.id);

        let allSubmissions = [];

        // Fetch submissions from API for each hackathon
        for (const hackathonId of hackathonIds) {
            try {
                const submissions = await window.HackathonAPI.getHackathonSubmissions(hackathonId);
                if (submissions && submissions.length > 0) {
                    allSubmissions = allSubmissions.concat(submissions);
                }
            } catch (error) {
                console.error(`Error fetching submissions for hackathon ${hackathonId}:`, error);
            }
        }

        const tableBody = document.getElementById('submissions-table-body');
        const submissionCount = document.getElementById('submission-count');

        if (!tableBody) return;

        if (submissionCount) {
            submissionCount.textContent = allSubmissions.length;
        }

        tableBody.innerHTML = '';

        if (allSubmissions.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="6" class="text-center">No submissions found</td>`;
            tableBody.appendChild(emptyRow);
            return;
        }

        allSubmissions.forEach(submission => {
            const problems = getOrganizerData('problems');
            const problem = problems.find(p => p.id === submission.problemId);
            const problemTitle = problem ? problem.title : 'Unknown Problem';

            const submittedDate = new Date(submission.submittedAt).toLocaleString();
            const statusClass = submission.status === 'Completed' ? 'active' : 'completed';
            const evaluationStatus = submission.evaluated ? 'evaluated' : 'pending';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${submission.participantName || 'Anonymous'}</td>
                <td>${problemTitle}</td>
                <td>${submission.language}</td>
                <td>${submittedDate}</td>
                <td><span class="status ${statusClass}">${evaluationStatus}</span></td>
                <td>
                    <div class="actions">
                        <button class="action-btn view" title="View Code" onclick="viewSubmission('${submission.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" title="Evaluate" onclick="evaluateSubmission('${submission.id}')">
                            <i class="fas fa-star"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Display evaluations function - Participant-centric view
    async function displayEvaluations() {
        const hackathons = getOrganizerData('hackathons');
        const hackathonIds = hackathons.map(h => h.id);

        let allSubmissions = [];

        // Fetch submissions from API for each hackathon
        for (const hackathonId of hackathonIds) {
            try {
                const submissions = await window.HackathonAPI.getHackathonSubmissions(hackathonId);
                if (submissions && submissions.length > 0) {
                    allSubmissions = allSubmissions.concat(submissions);
                }
            } catch (error) {
                console.error(`Error fetching submissions for hackathon ${hackathonId}:`, error);
            }
        }

        // Group submissions by participant
        const participantEvaluations = {};

        allSubmissions.forEach(submission => {
            const participantId = submission.participantId;
            const participantName = submission.participantName || 'Anonymous';

            if (!participantEvaluations[participantId]) {
                participantEvaluations[participantId] = {
                    id: participantId,
                    name: participantName,
                    submissions: [],
                    totalScore: 0,
                    problemsSolved: 0,
                    totalEvaluated: 0
                };
            }

            participantEvaluations[participantId].submissions.push(submission);

            // Calculate scores for evaluated submissions
            if (submission.evaluated && submission.evaluation) {
                participantEvaluations[participantId].totalEvaluated++;
                if (submission.evaluation.status === 'accepted') {
                    participantEvaluations[participantId].totalScore += submission.evaluation.score;
                    participantEvaluations[participantId].problemsSolved++;
                }
            }
        });

        const participants = Object.values(participantEvaluations);
        const tableBody = document.getElementById('evaluations-table-body');
        const evaluationCount = document.getElementById('evaluation-count');

        if (!tableBody) return;

        if (evaluationCount) {
            evaluationCount.textContent = participants.length;
        }

        tableBody.innerHTML = '';

        if (participants.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="5" class="text-center">No participants found</td>`;
            tableBody.appendChild(emptyRow);
            return;
        }

        participants.forEach(participant => {
            const evaluationStatus = participant.totalEvaluated === participant.submissions.length ?
                'Fully Evaluated' : `${participant.totalEvaluated}/${participant.submissions.length} Evaluated`;
            const statusClass = participant.totalEvaluated === participant.submissions.length ? 'active' : 'upcoming';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <div class="user-avatar me-2" style="width: 30px; height: 30px; font-size: 0.8rem;">
                            ${participant.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div class="fw-bold">${participant.name}</div>
                        </div>
                    </div>
                </td>
                <td><span class="badge bg-info">${participant.problemsSolved}/${participant.submissions.length}</span></td>
                <td><span class="badge bg-success">${participant.totalScore}</span></td>
                <td><span class="status ${statusClass}">${evaluationStatus}</span></td>
                <td>
                    <div class="actions">
                        <button class="action-btn view" title="View Details" onclick="viewParticipantEvaluation('${participant.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" title="Evaluate" onclick="evaluateParticipant('${participant.id}')">
                            <i class="fas fa-star"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // View submission function
    window.viewSubmission = async function(submissionId) {
        const hackathons = getOrganizerData('hackathons');
        const hackathonIds = hackathons.map(h => h.id);

        let submission = null;

        // Find submission across all hackathons
        for (const hackathonId of hackathonIds) {
            try {
                const submissions = await window.HackathonAPI.getHackathonSubmissions(hackathonId);
                submission = submissions.find(s => s.id === submissionId);
                if (submission) break;
            } catch (error) {
                console.error(`Error fetching submissions for hackathon ${hackathonId}:`, error);
            }
        }

        if (submission) {
            const problems = getOrganizerData('problems');
            const problem = problems.find(p => p.id === submission.problemId);
            const problemTitle = problem ? problem.title : 'Unknown Problem';

            alert(`Submission Details:\n\nID: ${submission.id}\nParticipant: ${submission.participantName}\nProblem: ${problemTitle}\nLanguage: ${submission.language}\nSubmitted: ${new Date(submission.submittedAt).toLocaleString()}\nStatus: ${submission.status}\n\nCode:\n${submission.code}`);
        } else {
            alert('Submission not found');
        }
    };

    // View participant evaluation details
    window.viewParticipantEvaluation = async function(participantId) {
        const hackathons = getOrganizerData('hackathons');
        const hackathonIds = hackathons.map(h => h.id);

        let participant = null;
        let participantSubmissions = [];

        // Find participant and their submissions across all hackathons
        for (const hackathonId of hackathonIds) {
            try {
                const hackathon = hackathons.find(h => h.id === hackathonId);
                if (hackathon && hackathon.participants) {
                    const foundParticipant = hackathon.participants.find(p => p.id === participantId);
                    if (foundParticipant) {
                        participant = foundParticipant;
                        // Get submissions for this participant
                        const submissions = await window.HackathonAPI.getHackathonSubmissions(hackathonId);
                        participantSubmissions = submissions.filter(s => s.participantId === participantId);
                        break;
                    }
                }
            } catch (error) {
                console.error(`Error fetching participant data for hackathon ${hackathonId}:`, error);
            }
        }

        if (!participant) {
            alert('Participant not found');
            return;
        }

        // Populate participant info
        document.getElementById('participant-info').innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <p><strong>Name:</strong> ${participant.name}</p>
                    <p><strong>Email:</strong> ${participant.email || 'Not provided'}</p>
                    <p><strong>Joined:</strong> ${new Date(participant.joinedAt).toLocaleString()}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Total Submissions:</strong> ${participantSubmissions.length}</p>
                    <p><strong>Status:</strong> ${participant.status || 'Active'}</p>
                </div>
            </div>
        `;

        // Populate problems accordion
        const problemsContainer = document.getElementById('participant-problems');
        problemsContainer.innerHTML = '';

        const problems = getOrganizerData('problems');

        participantSubmissions.forEach((submission, index) => {
            const problem = problems.find(p => p.id === submission.problemId);
            const problemTitle = problem ? problem.title : 'Unknown Problem';
            const evaluationStatus = submission.evaluated ? 'Evaluated' : 'Pending';
            const score = submission.evaluated && submission.evaluation ? submission.evaluation.score : 'N/A';
            const status = submission.evaluated && submission.evaluation ? submission.evaluation.status : 'Not Evaluated';

            const problemCard = document.createElement('div');
            problemCard.className = 'accordion-item';
            problemCard.innerHTML = `
                <h2 class="accordion-header" id="heading${index}">
                    <button class="accordion-button ${index > 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="${index === 0 ? 'true' : 'false'}" aria-controls="collapse${index}">
                        <div class="d-flex justify-content-between align-items-center w-100 me-3">
                            <span><strong>${problemTitle}</strong> - ${submission.language}</span>
                            <div>
                                <span class="badge bg-${submission.evaluated ? 'success' : 'warning'} me-2">${evaluationStatus}</span>
                                <span class="badge bg-info">${score}/100</span>
                            </div>
                        </div>
                    </button>
                </h2>
                <div id="collapse${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" aria-labelledby="heading${index}" data-bs-parent="#participant-problems">
                    <div class="accordion-body">
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>Submitted:</strong> ${new Date(submission.submittedAt).toLocaleString()}</p>
                                <p><strong>Status:</strong> ${status}</p>
                                <p><strong>Score:</strong> ${score}</p>
                            </div>
                            <div class="col-md-6">
                                <h6>Code Preview:</h6>
                                <div class="code-example" style="max-height: 200px; overflow-y: auto; font-size: 0.8rem;">
                                    ${submission.code.substring(0, 500)}${submission.code.length > 500 ? '...' : ''}
                                </div>
                            </div>
                        </div>
                        ${submission.evaluated && submission.evaluation ? `
                            <div class="mt-3">
                                <h6>Feedback:</h6>
                                <p class="text-muted">${submission.evaluation.feedback || 'No feedback provided'}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
            problemsContainer.appendChild(problemCard);
        });

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('participantEvaluationModal'));
        modal.show();
    };

    // Evaluate participant function
    window.evaluateParticipant = async function(participantId) {
        // This will open the detailed evaluation modal for the participant
        // For now, we'll reuse the view function but with evaluation capabilities
        viewParticipantEvaluation(participantId);
    };

    // Evaluate individual problem submission
    window.evaluateProblemSubmission = async function(participantId, problemId) {
        const hackathons = getOrganizerData('hackathons');
        const hackathonIds = hackathons.map(h => h.id);

        let submission = null;
        let hackathonId = null;

        // Find submission across all hackathons
        for (const hid of hackathonIds) {
            try {
                const submissions = await window.HackathonAPI.getHackathonSubmissions(hid);
                submission = submissions.find(s => s.participantId === participantId && s.problemId === problemId);
                if (submission) {
                    hackathonId = hid;
                    break;
                }
            } catch (error) {
                console.error(`Error fetching submissions for hackathon ${hid}:`, error);
            }
        }

        if (!submission || !hackathonId) {
            alert('Submission not found');
            return;
        }

        const problems = getOrganizerData('problems');
        const problem = problems.find(p => p.id === submission.problemId);
        const problemTitle = problem ? problem.title : 'Unknown Problem';

        // Populate problem evaluation modal
        document.getElementById('eval-participant-id').value = participantId;
        document.getElementById('eval-problem-id').value = problemId;
        document.getElementById('eval-hackathon-id').value = hackathonId;

        document.getElementById('problem-details').innerHTML = `
            <p><strong>Problem:</strong> ${problemTitle}</p>
            <p><strong>Participant:</strong> ${submission.participantName}</p>
            <p><strong>Language:</strong> ${submission.language}</p>
            <p><strong>Submitted:</strong> ${new Date(submission.submittedAt).toLocaleString()}</p>
            <p><strong>Current Status:</strong> ${submission.evaluated ? submission.evaluation.status : 'Not Evaluated'}</p>
            ${submission.evaluated ? `<p><strong>Current Score:</strong> ${submission.evaluation.score}/100</p>` : ''}
        `;

        document.getElementById('problem-code').textContent = submission.code;

        // Pre-fill form if already evaluated
        if (submission.evaluated && submission.evaluation) {
            document.getElementById('problem-score').value = submission.evaluation.score;
            document.getElementById('problem-status').value = submission.evaluation.status;
            document.getElementById('problem-feedback').value = submission.evaluation.feedback || '';
        } else {
            // Clear form for new evaluation
            document.getElementById('problemEvaluationForm').reset();
        }

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('problemEvaluationModal'));
        modal.show();
    };

    // Save problem evaluation
    const saveProblemEvaluationBtn = document.getElementById('saveProblemEvaluationBtn');
    if (saveProblemEvaluationBtn) {
        saveProblemEvaluationBtn.addEventListener('click', async function() {
            const participantId = document.getElementById('eval-participant-id').value;
            const problemId = document.getElementById('eval-problem-id').value;
            const hackathonId = document.getElementById('eval-hackathon-id').value;
            const score = document.getElementById('problem-score').value;
            const status = document.getElementById('problem-status').value;
            const feedback = document.getElementById('problem-feedback').value;

            if (!score || !status || !hackathonId || !participantId || !problemId) {
                alert('Please fill in all required fields');
                return;
            }

            try {
                // Update evaluation via API
                const evaluationData = {
                    participantId: participantId,
                    problemId: problemId,
                    evaluation: {
                        score: parseInt(score),
                        status: status,
                        feedback: feedback,
                        evaluatedAt: new Date().toISOString(),
                        evaluatedBy: currentOrganizerCode
                    }
                };

                // Call API to save evaluation
                const result = await window.HackathonAPI.evaluateSubmission(hackathonId, evaluationData);

                if (result.success) {
                    alert('Evaluation saved successfully!');
                } else {
                    throw new Error('Failed to save evaluation');
                }

                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('problemEvaluationModal'));
                modal.hide();

                // Refresh displays
                await displaySubmissions();
                await displayEvaluations();

            } catch (error) {
                console.error('Error saving evaluation:', error);
                alert('Failed to save evaluation. Please try again.');
            }
        });
    }

    // Save all evaluations for participant
    const saveAllEvaluationsBtn = document.getElementById('saveAllEvaluationsBtn');
    if (saveAllEvaluationsBtn) {
        saveAllEvaluationsBtn.addEventListener('click', async function() {
            // This would save all evaluations at once - for now, we'll just close the modal
            // In a full implementation, this would collect all evaluation forms and save them
            alert('Bulk evaluation save feature - to be implemented');
            const modal = bootstrap.Modal.getInstance(document.getElementById('participantEvaluationModal'));
            modal.hide();
        });
    }

    // Quick action functions
    window.evaluateAllPending = function() {
        alert('Evaluate all pending submissions - feature to be implemented');
    };

    window.exportParticipantResults = function() {
        alert('Export participant results - feature to be implemented');
    };

    // Refresh functions
    window.refreshSubmissions = function() {
        displaySubmissions();
    };

    window.refreshEvaluations = function() {
        displayEvaluations();
    };

    window.refreshLeaderboard = function() {
        displayLeaderboard();
    };

    // Display participants function
    async function displayParticipants() {
        // Get all participants for this organizer's hackathons from API
        const hackathons = getOrganizerData('hackathons');
        const hackathonIds = hackathons.map(h => h.id);

        let allParticipants = [];

        // Fetch participants for each hackathon from API
        for (const hackathonId of hackathonIds) {
            try {
                const response = await window.HackathonAPI.getParticipants(hackathonId);
                if (response.success && response.participants) {
                    // Add hackathonId to each participant for filtering
                    const participantsWithHackathon = response.participants.map(p => ({
                        ...p,
                        hackathonId: hackathonId
                    }));
                    allParticipants = allParticipants.concat(participantsWithHackathon);
                }
            } catch (error) {
                console.error(`Error fetching participants for hackathon ${hackathonId}:`, error);
            }
        }

        const participants = allParticipants;
        const tableBody = document.getElementById('participants-table-body');
        const participantCount = document.getElementById('participant-count');
        const hackathonFilter = document.getElementById('hackathon-filter');

        console.log('Current organizer code:', currentOrganizerCode);
        console.log('Organizer hackathons:', hackathons);
        console.log('Looking for participants across all organizers for hackathons:', hackathonIds);
        console.log('Found participants from API:', participants);

        if (!tableBody) return;

        // Update participant count
        if (participantCount) {
            participantCount.textContent = participants.length;
        }

        // Filter participants based on selected hackathon
        const selectedHackathon = hackathonFilter ? hackathonFilter.value : '';
        const filteredParticipants = selectedHackathon ?
            participants.filter(p => p.hackathonId === selectedHackathon) : participants;

        tableBody.innerHTML = '';

        if (filteredParticipants.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="6" class="text-center">No participants found</td>`;
            tableBody.appendChild(emptyRow);
            return;
        }

        filteredParticipants.forEach((participant, index) => {
            const hackathon = hackathons.find(h => h.id === participant.hackathonId);
            const hackathonName = hackathon ? hackathon.title : 'Unknown';
            const joinedDate = new Date(participant.joinedAt).toLocaleString();
            const submissionCount = participant.submissions ? participant.submissions.length : 0;
            const status = participant.status || 'active';
            const statusClass = status === 'active' ? 'active' : status === 'inactive' ? 'completed' : 'upcoming';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <div class="user-avatar me-2" style="width: 30px; height: 30px; font-size: 0.8rem;">
                            ${participant.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div class="fw-bold">${participant.name}</div>
                            <small class="text-muted">${participant.email || 'No email'}</small>
                        </div>
                    </div>
                </td>
                <td>${hackathonName}</td>
                <td>${joinedDate}</td>
                <td><span class="badge bg-info">${submissionCount}</span></td>
                <td><span class="status ${statusClass}">${status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
                <td>
                    <div class="actions">
                        <button class="action-btn view" title="View Details" onclick="viewParticipant('${participant.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" title="Send Message" onclick="messageParticipant('${participant.id}')">
                            <i class="fas fa-envelope"></i>
                        </button>
                        <button class="action-btn delete" title="Remove Participant" onclick="removeParticipant('${participant.id}')">
                            <i class="fas fa-user-times"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Display leaderboard function
    async function displayLeaderboard() {
        const hackathons = getOrganizerData('hackathons');
        const hackathonIds = hackathons.map(h => h.id);

        let allSubmissions = [];

        // Fetch submissions from API for each hackathon
        for (const hackathonId of hackathonIds) {
            try {
                const submissions = await window.HackathonAPI.getHackathonSubmissions(hackathonId);
                if (submissions && submissions.length > 0) {
                    allSubmissions = allSubmissions.concat(submissions);
                }
            } catch (error) {
                console.error(`Error fetching submissions for hackathon ${hackathonId}:`, error);
            }
        }

        // Filter evaluated submissions
        const evaluatedSubmissions = allSubmissions.filter(sub => sub.evaluated && sub.evaluation);

        // Calculate participant scores
        const participantScores = {};

        evaluatedSubmissions.forEach(submission => {
            const participantId = submission.participantId;
            const participantName = submission.participantName || 'Anonymous';

            if (!participantScores[participantId]) {
                participantScores[participantId] = {
                    id: participantId,
                    name: participantName,
                    totalScore: 0,
                    solvedProblems: 0,
                    hackathonId: '', // We'll need to determine this from context
                    submissions: []
                };
            }

            // Only count accepted submissions
            if (submission.evaluation.status === 'accepted') {
                participantScores[participantId].totalScore += submission.evaluation.score;
                participantScores[participantId].solvedProblems += 1;
            }
            participantScores[participantId].submissions.push(submission);
        });

        // Convert to array and sort by total score (descending)
        const leaderboard = Object.values(participantScores).sort((a, b) => b.totalScore - a.totalScore);

        const tableBody = document.getElementById('leaderboard-table-body');
        const leaderboardCount = document.getElementById('leaderboard-count');
        const leaderboardFilter = document.getElementById('leaderboard-filter');

        if (!tableBody) return;

        // Update leaderboard count
        if (leaderboardCount) {
            leaderboardCount.textContent = leaderboard.length;
        }

        // Hackathon filter change event for leaderboard
        if (leaderboardFilter) {
            leaderboardFilter.addEventListener('change', function() {
                displayLeaderboard();
            });
        }

        // Filter leaderboard based on selected hackathon
        const selectedHackathon = leaderboardFilter ? leaderboardFilter.value : '';
        const filteredLeaderboard = selectedHackathon ?
            leaderboard.filter(p => p.hackathonId === selectedHackathon) : leaderboard;

        tableBody.innerHTML = '';

        if (filteredLeaderboard.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="6" class="text-center">No leaderboard data available</td>`;
            tableBody.appendChild(emptyRow);
            return;
        }

        filteredLeaderboard.forEach((participant, index) => {
            const hackathon = hackathons.find(h => h.id === participant.hackathonId);
            const hackathonName = hackathon ? hackathon.title : 'Unknown';
            const averageScore = participant.solvedProblems > 0 ?
                (participant.totalScore / participant.solvedProblems).toFixed(1) : '0.0';
            const rank = index + 1;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <span class="badge bg-${rank === 1 ? 'warning' : rank === 2 ? 'secondary' : rank === 3 ? 'danger' : 'light'} me-2" style="width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                            ${rank}
                        </span>
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="user-avatar me-2" style="width: 30px; height: 30px; font-size: 0.8rem;">
                            ${participant.name.charAt(0).toUpperCase()}
                        </div>
                        <div class="fw-bold">${participant.name}</div>
                    </div>
                </td>
                <td>${hackathonName}</td>
                <td><span class="badge bg-success">${participant.totalScore}</span></td>
                <td><span class="badge bg-info">${participant.solvedProblems}</span></td>
                <td><span class="badge bg-primary">${averageScore}</span></td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Save hackathon changes
    const saveHackathonBtn = document.getElementById('saveHackathonBtn');
    if (saveHackathonBtn) {
        saveHackathonBtn.addEventListener('click', function() {
            const index = parseInt(document.getElementById('editHackathonIndex').value);
            const hackathons = getOrganizerData('hackathons');

            if (index >= 0 && index < hackathons.length) {
                // Update hackathon data
                hackathons[index].title = document.getElementById('editHackathonTitle').value;
                hackathons[index].date = document.getElementById('editHackathonDate').value;
                hackathons[index].startTime = document.getElementById('editStartTime').value;
                hackathons[index].endTime = document.getElementById('editEndTime').value;
                hackathons[index].rules = document.getElementById('editHackathonRules').value;
                hackathons[index].autoStart = document.getElementById('editAutoStart').checked;

                // Update tech stack
                const techStackSelect = document.getElementById('editAllowedTechStack');
                hackathons[index].allowedTechStack = Array.from(techStackSelect.selectedOptions).map(option => option.value);

                // Update anti-cheating settings
                hackathons[index].antiCheating = {
                    screenshotCheck: document.getElementById('editScreenshotCheck').checked,
                    webcamPermission: document.getElementById('editWebcamPermission').checked,
                    tabSwitchMonitoring: document.getElementById('editTabSwitchMonitoring').checked
                };

                // Save to organizer-specific storage
                setOrganizerData('hackathons', hackathons);

                // Close modal
                const editModal = bootstrap.Modal.getInstance(document.getElementById('editHackathonModal'));
                editModal.hide();

                // Refresh table
                displayHackathons();

                alert('Hackathon updated successfully!');
            }
        });
    }

    // Initialize edit form date pickers
    function initializeEditFlatpickr() {
        if (typeof flatpickr !== 'undefined') {
            flatpickr("#editHackathonDate", {
                dateFormat: "Y-m-d",
                minDate: "today"
            });

            flatpickr("#editStartTime", {
                enableTime: true,
                noCalendar: true,
                dateFormat: "H:i",
                time_24hr: true
            });

            flatpickr("#editEndTime", {
                enableTime: true,
                noCalendar: true,
                dateFormat: "H:i",
                time_24hr: true
            });
        } else {
            setTimeout(initializeEditFlatpickr, 100);
        }
    }

    initializeEditFlatpickr();

    // Problem Management Functions
    function loadHackathonsIntoSelect() {
        const hackathons = getOrganizerData('hackathons');
        const addProblemSelect = document.getElementById('problemHackathon');
        const editProblemSelect = document.getElementById('editProblemHackathon');

        // Clear existing options except the first one for add problem modal
        if (addProblemSelect) {
            addProblemSelect.innerHTML = '<option value="">Select hackathon</option>';
            hackathons.forEach(hackathon => {
                const option = document.createElement('option');
                option.value = hackathon.id;
                option.textContent = hackathon.title;
                addProblemSelect.appendChild(option);
            });
        }

        // Clear existing options except the first one for edit problem modal
        if (editProblemSelect) {
            editProblemSelect.innerHTML = '<option value="">Select hackathon</option>';
            hackathons.forEach(hackathon => {
                const option = document.createElement('option');
                option.value = hackathon.id;
                option.textContent = hackathon.title;
                editProblemSelect.appendChild(option);
            });
        }

        // Also populate leaderboard filter
        const leaderboardFilter = document.getElementById('leaderboard-filter');
        if (leaderboardFilter) {
            leaderboardFilter.innerHTML = '<option value="">All Hackathons</option>';
            hackathons.forEach(hackathon => {
                const option = document.createElement('option');
                option.value = hackathon.id;
                option.textContent = hackathon.title;
                leaderboardFilter.appendChild(option);
            });
        }

        // Also populate participants filter
        const hackathonFilter = document.getElementById('hackathon-filter');
        if (hackathonFilter) {
            hackathonFilter.innerHTML = '<option value="">All Hackathons</option>';
            hackathons.forEach(hackathon => {
                const option = document.createElement('option');
                option.value = hackathon.id;
                option.textContent = hackathon.title;
                hackathonFilter.appendChild(option);
            });
        }
    }

    // Add Problem Button Event
    const addProblemBtn = document.getElementById('addProblemBtn');
    if (addProblemBtn) {
        addProblemBtn.addEventListener('click', async function() {
            const title = document.getElementById('problemTitle').value;
            const difficulty = document.getElementById('problemDifficulty').value;
            const category = document.getElementById('problemCategory').value;
            const hackathonId = document.getElementById('problemHackathon').value;
            const description = document.getElementById('problemDescription').value;

            if (!title || !difficulty || !category || !hackathonId || !description) {
                alert('Please fill in all required fields');
                return;
            }

            const problemData = {
                title,
                difficulty,
                category,
                description,
                constraints: document.getElementById('problemConstraints').value,
                timeLimit: parseInt(document.getElementById('problemTimeLimit').value) || 1000,
                memoryLimit: parseInt(document.getElementById('problemMemoryLimit').value) || 256,
                sampleInput: document.getElementById('problemSampleInput').value,
                sampleOutput: document.getElementById('problemSampleOutput').value,
                createdAt: new Date().toISOString(),
                status: 'active'
            };

            try {
                // Save problem to database via API
                const addedProblem = await window.HackathonAPI.addProblem(hackathonId, problemData);
                console.log('Problem added to database:', addedProblem);

                // Save problem to organizer-specific storage
                let problems = getOrganizerData('problems');
                problems.push(addedProblem);
                setOrganizerData('problems', problems);

                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('addProblemModal'));
                modal.hide();

                // Reset form
                document.getElementById('addProblemForm').reset();

                // Refresh problems table
                displayProblems();

                // Trigger problem sync for participants
                if (window.problemSync) {
                    window.problemSync.broadcastProblems();
                }
                if (window.triggerProblemUpdate) {
                    window.triggerProblemUpdate();
                }

                alert('Problem added successfully!');
            } catch (error) {
                console.error('Failed to add problem:', error);
                alert('Failed to add problem. Please try again.');
            }
        });
    }

    // Display problems in table
    function displayProblems() {
        const problems = getOrganizerData('problems');
        const hackathons = getOrganizerData('hackathons');
        const tableBody = document.getElementById('problems-table-body');

        if (!tableBody) return;

        tableBody.innerHTML = '';

        if (problems.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="6" class="text-center">No problems added yet</td>`;
            tableBody.appendChild(emptyRow);
            return;
        }

        problems.forEach((problem, index) => {
            const hackathon = hackathons.find(h => h.id === problem.hackathonId);
            const hackathonName = hackathon ? hackathon.title : 'Unknown';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${problem.title}</td>
                <td><span class="badge bg-${getDifficultyColor(problem.difficulty)}">${problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}</span></td>
                <td>${problem.category ? problem.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'}</td>
                <td>${hackathonName}</td>
                <td><span class="status active">Active</span></td>
                <td>
                    <div class="actions">
                        <button class="action-btn view" title="View Problem" onclick="viewProblem(${index})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" title="Edit Problem" onclick="editProblem(${index})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" title="Delete Problem" onclick="deleteProblem(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    function getDifficultyColor(difficulty) {
        switch(difficulty) {
            case 'easy': return 'success';
            case 'medium': return 'warning';
            case 'hard': return 'danger';
            case 'expert': return 'dark';
            default: return 'secondary';
        }
    }

    // Problem action functions
    window.viewProblem = function(index) {
        const problems = getOrganizerData('problems');
        const problem = problems[index];
        if (problem) {
            alert(`Problem: ${problem.title}\nDifficulty: ${problem.difficulty}\nCategory: ${problem.category}\nDescription: ${problem.description.substring(0, 100)}...`);
        }
    };

    window.editProblem = function(index) {
        const problems = getOrganizerData('problems');
        const problem = problems[index];

        if (!problem) return;

        // Populate edit form
        document.getElementById('editProblemIndex').value = index;
        document.getElementById('editProblemTitle').value = problem.title;
        document.getElementById('editProblemDifficulty').value = problem.difficulty;
        document.getElementById('editProblemCategory').value = problem.category;
        document.getElementById('editProblemHackathon').value = problem.hackathonId;
        document.getElementById('editProblemDescription').value = problem.description;
        document.getElementById('editProblemConstraints').value = problem.constraints || '';
        document.getElementById('editProblemTimeLimit').value = problem.timeLimit || '';
        document.getElementById('editProblemMemoryLimit').value = problem.memoryLimit || '';
        document.getElementById('editProblemSampleInput').value = problem.sampleInput || '';
        document.getElementById('editProblemSampleOutput').value = problem.sampleOutput || '';

        // Show edit modal
        const editModal = new bootstrap.Modal(document.getElementById('editProblemModal'));
        editModal.show();
    };

    window.deleteProblem = function(index) {
        if (confirm('Are you sure you want to delete this problem?')) {
            let problems = getOrganizerData('problems');
            problems.splice(index, 1);
            setOrganizerData('problems', problems);
            displayProblems();
            alert('Problem deleted successfully!');
        }
    };

    // Save problem changes
    const saveProblemBtn = document.getElementById('saveProblemBtn');
    if (saveProblemBtn) {
        saveProblemBtn.addEventListener('click', function() {
            const index = parseInt(document.getElementById('editProblemIndex').value);
            const problems = getOrganizerData('problems');

            if (index >= 0 && index < problems.length) {
                // Update problem data
                problems[index].title = document.getElementById('editProblemTitle').value;
                problems[index].difficulty = document.getElementById('editProblemDifficulty').value;
                problems[index].category = document.getElementById('editProblemCategory').value;
                problems[index].hackathonId = document.getElementById('editProblemHackathon').value;
                problems[index].description = document.getElementById('editProblemDescription').value;
                problems[index].constraints = document.getElementById('editProblemConstraints').value;
                problems[index].timeLimit = document.getElementById('editProblemTimeLimit').value;
                problems[index].memoryLimit = document.getElementById('editProblemMemoryLimit').value;
                problems[index].sampleInput = document.getElementById('editProblemSampleInput').value;
                problems[index].sampleOutput = document.getElementById('editProblemSampleOutput').value;

                // Save to organizer-specific storage
                setOrganizerData('problems', problems);

                // Close modal
                const editModal = bootstrap.Modal.getInstance(document.getElementById('editProblemModal'));
                editModal.hide();

                // Refresh table
                displayProblems();

                // Trigger problem sync for participants
                if (window.problemSync) {
                    window.problemSync.broadcastProblems();
                }
                if (window.triggerProblemUpdate) {
                    window.triggerProblemUpdate();
                }

                alert('Problem updated successfully!');
            }
        });
    }

    // Logout function
    window.logoutOrganizer = function() {
        // Clear organizer-specific data
        localStorage.removeItem('currentOrganizerCode');
        localStorage.removeItem('currentHackathonId');

        // Clear any other organizer-related data from localStorage
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
            if (key.includes('_hackathons') || key.includes('_problems') || key.includes('_participants')) {
                // Only clear if it matches the current organizer's data
                if (key.startsWith(currentOrganizerCode + '_')) {
                    localStorage.removeItem(key);
                }
            }
        });

        // Redirect to main page
        window.location.href = 'hackathon.html';
    };

    // Add event listeners for buttons
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logoutOrganizer();
        });
    }

    // Participants page buttons
    const exportParticipantsBtn = document.getElementById('export-participants-btn');
    if (exportParticipantsBtn) {
        exportParticipantsBtn.addEventListener('click', function() {
            exportParticipants();
        });
    }

    const refreshParticipantsBtn = document.getElementById('refresh-participants-btn');
    if (refreshParticipantsBtn) {
        refreshParticipantsBtn.addEventListener('click', function() {
            refreshParticipants();
        });
    }

    // Participant action functions
    window.viewParticipant = function(participantId) {
        // Get all participants for this organizer's hackathons
        const hackathons = getOrganizerData('hackathons');
        const hackathonIds = hackathons.map(h => h.id);

        let participant = null;
        let hackathonName = 'Unknown';

        // Find participant across all hackathons
        for (const hackathonId of hackathonIds) {
            try {
                // Since we already have participants data from displayParticipants, we can search in local data
                // For now, show basic info
                const hackathon = hackathons.find(h => h.id === hackathonId);
                if (hackathon && hackathon.participants) {
                    participant = hackathon.participants.find(p => p.id === participantId);
                    if (participant) {
                        hackathonName = hackathon.title;
                        break;
                    }
                }
            } catch (error) {
                console.error(`Error finding participant ${participantId}:`, error);
            }
        }

        if (participant) {
            alert(`Participant Details:\n\nName: ${participant.name}\nEmail: ${participant.email || 'Not provided'}\nHackathon: ${hackathonName}\nJoined: ${new Date(participant.joinedAt).toLocaleString()}\nStatus: ${participant.status || 'Active'}\nSubmissions: ${participant.submissions ? participant.submissions.length : 0}`);
        } else {
            alert('Participant not found');
        }
    };

    window.messageParticipant = function(participantId) {
        // Message feature removed as requested
        alert('Message feature is currently disabled');
    };

    window.removeParticipant = function(participantId) {
        if (confirm('Are you sure you want to remove this participant from the hackathon?')) {
            // This would require backend implementation to properly remove participant
            alert('Participant removal requires backend implementation. Participant ID: ' + participantId);
        }
    };

    // Export participants function
    window.exportParticipants = function() {
        const hackathons = getOrganizerData('hackathons');
        let csvContent = 'Name,Email,Hackathon,Joined,Status,Submissions\n';

        hackathons.forEach(hackathon => {
            if (hackathon.participants && hackathon.participants.length > 0) {
                hackathon.participants.forEach(participant => {
                    const submissions = participant.submissions ? participant.submissions.length : 0;
                    csvContent += `"${participant.name}","${participant.email || ''}","${hackathon.title}","${new Date(participant.joinedAt).toLocaleString()}","${participant.status || 'active'}","${submissions}"\n`;
                });
            }
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'participants.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Refresh participants function
    window.refreshParticipants = function() {
        displayParticipants().catch(error => console.error('Error refreshing participants:', error));
    };

    // Submissions page button
    const refreshSubmissionsBtn = document.getElementById('refresh-submissions-btn');
    if (refreshSubmissionsBtn) {
        refreshSubmissionsBtn.addEventListener('click', function() {
            refreshSubmissions();
        });
    }

    // Evaluation page button
    const refreshEvaluationsBtn = document.getElementById('refresh-evaluations-btn');
    if (refreshEvaluationsBtn) {
        refreshEvaluationsBtn.addEventListener('click', function() {
            refreshEvaluations();
        });
    }



    // Copy buttons
    const copyHackathonIdBtn = document.getElementById('copy-hackathon-id-btn');
    if (copyHackathonIdBtn) {
        copyHackathonIdBtn.addEventListener('click', function() {
            copyToClipboard('generatedHackathonId');
        });
    }

    const copyOrganizerCodeBtn = document.getElementById('copy-organizer-code-btn');
    if (copyOrganizerCodeBtn) {
        copyOrganizerCodeBtn.addEventListener('click', function() {
            copyToClipboard('generatedOrganizerCode');
        });
    }

    // Initialize functions on load
    loadHackathonsIntoSelect();
    displayHackathons();
    displayProblems();
    displayParticipants().catch(error => console.error('Error loading participants:', error));
    displaySubmissions().catch(error => console.error('Error loading submissions:', error));
    displayEvaluations().catch(error => console.error('Error loading evaluations:', error));
    displayLeaderboard().catch(error => console.error('Error loading leaderboard:', error));

});
