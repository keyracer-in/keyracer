 // Toggle between new and existing conductor forms
document.getElementById('newConductor').addEventListener('change', function() {
    document.getElementById('newConductorForm').style.display = 'block';
    document.getElementById('existingConductorForm').style.display = 'none';
    
    // Add animation
    document.getElementById('newConductorForm').classList.add('animate__animated', 'animate__fadeIn');
    setTimeout(() => {
        document.getElementById('newConductorForm').classList.remove('animate__animated', 'animate__fadeIn');
    }, 1000);
});

document.getElementById('existingConductor').addEventListener('change', function() {
    document.getElementById('newConductorForm').style.display = 'none';
    document.getElementById('existingConductorForm').style.display = 'block';
    
    // Add animation
    document.getElementById('existingConductorForm').classList.add('animate__animated', 'animate__fadeIn');
    setTimeout(() => {
        document.getElementById('existingConductorForm').classList.remove('animate__animated', 'animate__fadeIn');
    }, 1000);
});

// Generate a unique organizer code
function generateUniqueCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Conductor form submission with enhanced animations
document.getElementById('conductorSubmit').addEventListener('click', async function() {
    const isNewConductor = document.getElementById('newConductor').checked;
    const submitBtn = document.getElementById('conductorSubmit');
    
    // Add animation to button
    submitBtn.classList.add('animate__animated', 'animate__pulse');
    submitBtn.textContent = 'Processing...';
    
    if (isNewConductor) {
        const conductorName = document.getElementById('conductorName').value.trim();
        const hackathonName = document.getElementById('hackathonName').value.trim();
        
        if (conductorName === '' || hackathonName === '') {
            submitBtn.classList.remove('animate__pulse');
            submitBtn.classList.add('animate__shakeX');
            submitBtn.textContent = 'Access Dashboard';
            
            setTimeout(() => {
                submitBtn.classList.remove('animate__shakeX');
            }, 1000);
            
            // Highlight empty fields
            if (conductorName === '') {
                document.getElementById('conductorName').classList.add('animate__animated', 'animate__shakeX');
                document.getElementById('conductorName').style.borderColor = 'var(--danger-color)';
                setTimeout(() => {
                    document.getElementById('conductorName').classList.remove('animate__shakeX');
                }, 1000);
            }
            
            if (hackathonName === '') {
                document.getElementById('hackathonName').classList.add('animate__animated', 'animate__shakeX');
                document.getElementById('hackathonName').style.borderColor = 'var(--danger-color)';
                setTimeout(() => {
                    document.getElementById('hackathonName').classList.remove('animate__shakeX');
                }, 1000);
            }
            
            return;
        }
        
        // Show success animation
        document.querySelector('#conductorModal .modal-content').classList.add('animate__animated', 'animate__fadeOutUp');
        
        setTimeout(() => {
            // Store the conductor info in localStorage
            localStorage.setItem('conductorName', conductorName);
            localStorage.setItem('organizerName', conductorName);
            localStorage.setItem('hackathonName', hackathonName);
            localStorage.setItem('userRole', 'conductor');
            localStorage.setItem('isNewHackathon', 'true');
            
            // Clear any existing organizer data to start fresh
            localStorage.removeItem('currentOrganizerId');
            localStorage.removeItem('currentOrganizerCode');
            
            // Redirect to organizer dashboard with parameters
            window.location.href = `organizer-dashboard.html?organizerName=${encodeURIComponent(conductorName)}&isNew=true`;
        }, 800);
    } else {
        const organizerCode = document.getElementById('hackathonCode').value.trim();
        
        if (organizerCode === '') {
            submitBtn.classList.remove('animate__pulse');
            submitBtn.classList.add('animate__shakeX');
            submitBtn.textContent = 'Access Dashboard';
            
            setTimeout(() => {
                submitBtn.classList.remove('animate__shakeX');
            }, 1000);
            
            // Highlight empty field
            document.getElementById('hackathonCode').classList.add('animate__animated', 'animate__shakeX');
            document.getElementById('hackathonCode').style.borderColor = 'var(--danger-color)';
            setTimeout(() => {
                document.getElementById('hackathonCode').classList.remove('animate__shakeX');
            }, 1000);
            
            return;
        }
        
        // Validate organizer code using API
        let validHackathon = null;
        let organizerName = 'Organizer';

        try {
            console.log(`[FORMS] Validating organizer code: ${organizerCode}`);
            // Use HackathonAPI to find hackathon by organizer code
            validHackathon = await window.HackathonAPI.findHackathon(organizerCode);
            console.log(`[FORMS] Valid hackathon found:`, validHackathon);

            // Try to get organizer name from stored data
            const storedName = localStorage.getItem('organizerName') || localStorage.getItem('conductorName');
            if (storedName) {
                organizerName = storedName;
            }
        } catch (error) {
            console.error('[FORMS] Error validating organizer code:', error);
            validHackathon = null;
        }

        if (!validHackathon) {
            submitBtn.classList.remove('animate__pulse');
            submitBtn.classList.add('animate__shakeX');
            submitBtn.textContent = 'Invalid Code';

            // Show error styling and message
            document.getElementById('hackathonCode').classList.add('animate__animated', 'animate__shakeX');
            document.getElementById('hackathonCode').style.borderColor = 'var(--danger-color)';

            // Show specific error message
            const errorMsg = document.createElement('div');
            errorMsg.id = 'organizerCodeError';
            errorMsg.style.color = 'var(--danger-color)';
            errorMsg.style.fontSize = '0.9rem';
            errorMsg.style.marginTop = '5px';
            errorMsg.textContent = `Organizer code "${organizerCode}" not found. Please check the code and try again.`;

            // Remove any existing error message
            const existingError = document.getElementById('organizerCodeError');
            if (existingError) existingError.remove();

            document.getElementById('hackathonCode').parentNode.appendChild(errorMsg);

            setTimeout(() => {
                submitBtn.classList.remove('animate__shakeX');
                submitBtn.textContent = 'Access Dashboard';
                document.getElementById('hackathonCode').classList.remove('animate__shakeX');
                document.getElementById('hackathonCode').style.borderColor = '';

                // Remove error message
                const errorMsg = document.getElementById('organizerCodeError');
                if (errorMsg) errorMsg.remove();
            }, 4000);

            return;
        }
        
        // Show success animation
        document.querySelector('#conductorModal .modal-content').classList.add('animate__animated', 'animate__fadeOutUp');
        
        setTimeout(() => {
            // Store the validated info in localStorage
            localStorage.setItem('currentOrganizerCode', organizerCode);
            localStorage.setItem('currentHackathonId', validHackathon.id);
            localStorage.setItem('hackathonName', validHackathon.title);
            localStorage.setItem('organizerName', organizerName);
            localStorage.setItem('userRole', 'conductor');
            localStorage.setItem('isNewHackathon', 'false');
            
            // Redirect to organizer dashboard with parameters
            window.location.href = `organizer-dashboard.html?organizerCode=${encodeURIComponent(organizerCode)}&organizerName=${encodeURIComponent(organizerName)}`;
        }, 800);
    }
});

// Participant form submission with enhanced animations
document.getElementById('participantSubmit').addEventListener('click', async function() {
    const participantName = document.getElementById('participantName').value.trim();
    const hackathonId = document.getElementById('hackathonId').value.trim();
    const submitBtn = document.getElementById('participantSubmit');
    
    // Add animation to button
    submitBtn.classList.add('animate__animated', 'animate__pulse');
    submitBtn.textContent = 'Processing...';
    
    if (participantName === '' || hackathonId === '') {
        submitBtn.classList.remove('animate__pulse');
        submitBtn.classList.add('animate__shakeX');
        submitBtn.textContent = 'Join Hackathon';
        
        setTimeout(() => {
            submitBtn.classList.remove('animate__shakeX');
        }, 1000);
        
        // Highlight empty fields
        if (participantName === '') {
            document.getElementById('participantName').classList.add('animate__animated', 'animate__shakeX');
            document.getElementById('participantName').style.borderColor = 'var(--danger-color)';
            setTimeout(() => {
                document.getElementById('participantName').classList.remove('animate__shakeX');
            }, 1000);
        }
        
        if (hackathonId === '') {
            document.getElementById('hackathonId').classList.add('animate__animated', 'animate__shakeX');
            document.getElementById('hackathonId').style.borderColor = 'var(--danger-color)';
            setTimeout(() => {
                document.getElementById('hackathonId').classList.remove('animate__shakeX');
            }, 1000);
        }
        
        return;
    }
    
    try {
        // Validate hackathon ID using API (only accepts hackathon IDs, not organizer codes)
        const validHackathon = await window.HackathonAPI.findHackathon(hackathonId);

        // Additional validation: ensure the identifier is a hackathon ID, not an organizer code
        if (!validHackathon || hackathonId.startsWith('ORG')) {
            submitBtn.classList.remove('animate__pulse');
            submitBtn.classList.add('animate__shakeX');
            submitBtn.textContent = 'Invalid Hackathon ID';

            // Show error styling
            document.getElementById('hackathonId').style.borderColor = 'var(--danger-color)';
            document.getElementById('hackathonId').classList.add('animate__animated', 'animate__shakeX');

            setTimeout(() => {
                submitBtn.classList.remove('animate__shakeX');
                submitBtn.textContent = 'Join Hackathon';
                document.getElementById('hackathonId').classList.remove('animate__shakeX');
                document.getElementById('hackathonId').style.borderColor = '';
            }, 2000);

            return;
        }

        // Register participant using API
        const registeredParticipant = await window.HackathonAPI.registerParticipant(hackathonId, {
            name: participantName,
            email: '' // Optional email field
        });
        
        submitBtn.textContent = 'Success!';
        submitBtn.style.background = 'linear-gradient(90deg, var(--participant-color) 0%, var(--secondary-color) 100%)';
        
        // Show success animation
        document.querySelector('#participantModal .modal-content').classList.add('animate__animated', 'animate__fadeOutUp');
        
        setTimeout(() => {
            // Store the participant info in localStorage
            localStorage.setItem('participantName', participantName);
            localStorage.setItem('currentHackathonId', hackathonId);
            localStorage.setItem('currentParticipantId', registeredParticipant.id);
            localStorage.setItem('hackathonTitle', validHackathon.title);
            localStorage.setItem('userRole', 'participant');
            
            // Redirect to participant dashboard
            window.location.href = 'participant-dashboard.html';
        }, 800);
        
    } catch (error) {
        submitBtn.classList.remove('animate__pulse');
        submitBtn.classList.add('animate__shakeX');
        submitBtn.textContent = 'Error: ' + error.message;
        
        setTimeout(() => {
            submitBtn.classList.remove('animate__shakeX');
            submitBtn.textContent = 'Join Hackathon';
            submitBtn.style.background = '';
        }, 3000);
        
        return;
    }
});