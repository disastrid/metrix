let studies = [];
let tooltips = {};
let currentUser = null;

async function loadTooltips() {
    try {
        const response = await fetch('/data/tooltips.json');
        tooltips = await response.json();
    } catch (error) {
        console.error('Failed to load tooltips:', error);
    }
}

function positionTooltip(icon, tooltip) {
    const iconRect = icon.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    // Position to the right of the icon
    let left = iconRect.right + 12;
    let top = iconRect.top + (iconRect.height / 2) - (tooltipRect.height / 2);
    
    // Ensure tooltip doesn't go off screen
    const maxLeft = window.innerWidth - tooltipRect.width - 20;
    const maxTop = window.innerHeight - tooltipRect.height - 20;
    
    if (left > maxLeft) {
        // Position to the left if no room on right
        left = iconRect.left - tooltipRect.width - 12;
    }
    
    if (top < 20) {
        top = 20;
    } else if (top > maxTop) {
        top = maxTop;
    }
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
}

function setupTooltips() {
    const infoIcons = document.querySelectorAll('.info-icon, .info-icon-new');
    
    infoIcons.forEach(icon => {
        const tooltip = icon.querySelector('.tooltip');
        if (tooltip) {
            icon.addEventListener('mouseenter', () => {
                positionTooltip(icon, tooltip);
            });
        }
    });
}


document.addEventListener('DOMContentLoaded', async () => {
    await loadTooltips();
    await loadCurrentUser(); // Load user first
    loadStudies();
    setupEventListeners();
    setupTooltips();
});

function setupEventListeners() {
    document.getElementById('createStudyBtn').addEventListener('click', showCreateStudyModal);
    document.getElementById('userMenuToggle').addEventListener('click', toggleUserDropdown);
    
    // Close modal when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('settings-overlay')) {
            closeSettingsModal();
        }
        if (e.target.classList.contains('settings-overlay')) {
            closeAccountSettings();
        }
        
        // Close user dropdown when clicking outside
        if (!e.target.closest('.user-menu')) {
            document.getElementById('userDropdown').style.display = 'none';
        }
    });
}

async function loadStudies() {
    try {
        const response = await fetch('/api/studies');
        studies = await response.json();
        renderStudies();
    } catch (error) {
        console.error('Failed to load studies:', error);
        document.getElementById('currentStudies').innerHTML = '<div class="empty-state"><h3>' + tooltips.messages.failedToLoadStudies + '</h3><p>' + tooltips.messages.failedToLoadStudiesSubtext + '</p></div>';
        document.getElementById('completedStudies').innerHTML = '<div class="empty-state"><h3>' + tooltips.messages.failedToLoadStudies + '</h3><p>' + tooltips.messages.failedToLoadStudiesSubtext + '</p></div>';
    }
}

function renderStudies() {
    const currentContainer = document.getElementById('currentStudies');
    const completedContainer = document.getElementById('completedStudies');
    
    const currentStudies = studies.filter(study => study.status !== 'completed');
    const completedStudies = studies.filter(study => study.status === 'completed');
    
    currentContainer.innerHTML = renderStudyList(currentStudies, 'current');
    completedContainer.innerHTML = renderStudyList(completedStudies, 'completed');
}

function renderStudyList(studyList, type) {
    if (studyList.length === 0) {
        return '<div class="empty-state"><h3>' + tooltips.messages['no' + type.charAt(0).toUpperCase() + type.slice(1) + 'Studies'] + '</h3><p>' + 
               tooltips.messages['no' + type.charAt(0).toUpperCase() + type.slice(1) + 'StudiesSubtext'] + 
               '</p></div>';
    }

    let html = '';
    for (let i = 0; i < studyList.length; i++) {
        const study = studyList[i];
        html += '<div class="study-row">';
        html += '<div class="study-card" onclick="enterStudy(\'' + study._id + '\')">';
        html += '<div class="study-info">';
        html += '<div class="study-name">' + study.name + '</div>';
        html += '<div class="study-meta">' + (type === 'completed' ? 'Completed' : 'Created') + ' on: ' + formatDate(study.createdAt) + '</div>';
        html += '</div>';
        html += '<img src="/icons/arrow-right.svg" alt="Enter study" class="study-arrow">';
        html += '</div>';
        html += '<div class="study-settings" onclick="showSettingsModal(event, \'' + study._id + '\')">';
        html += '<img src="/icons/sliders.svg" alt="Settings">';
        html += '</div>';
        html += '</div>';
    }
    return html;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function enterStudy(studyId) {
    window.location.href = '/admin/study/' + studyId;
}

function showSettingsModal(event, studyId) {
    event.stopPropagation();
    
    const settingsButton = event.currentTarget;
    settingsButton.classList.add('active');
    
    const study = studies.find(s => s._id === studyId);
    if (!study) return;

    const overlay = document.createElement('div');
    overlay.className = 'settings-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'settings-modal';
    
    modal.innerHTML = '' +
        '<div class="settings-back" onclick="closeSettingsModal()">' +
            '<img src="/icons/arrow-left.svg" alt="Back">' +
        '</div>' +
        '<div class="settings-header-row">' +
            '<h2 class="settings-title">Settings</h2>' +
            '<button class="btn btn-primary-outline" onclick="exportStudyData(\'' + studyId + '\')">' +
                'Download all data' +
                '<div class="icon">' +
                    '<img src="/icons/download.svg" alt="Download">' +
                '</div>' +
            '</button>' +
        '</div>' +
        '<div class="study-name-row">' +
            '<span class="study-name-label">Study Name:</span>' +
            '<span class="study-name-value" id="settingsStudyNameDisplay">' + study.name + '</span>' +
            '<div class="edit-icon" id="editIcon" onclick="editStudyName()">' +
                '<img src="/icons/edit.svg" alt="Edit">' +
            '</div>' +
            '<input type="text" id="settingsStudyName" value="' + study.name + '" style="display: none;" class="study-name-input">' +
            '<div class="check-icon" id="checkIcon" onclick="saveStudyNameEdit()" style="display: none !important;">' +
                '<img src="/icons/check.svg" alt="Save">' +
            '</div>' +
        '</div>' +
        '<div style="margin-bottom: var(--space-9);">' +
            '<h3 style="font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); color: var(--color-grey-800); margin-bottom: var(--space-7);">Participant settings</h3>' +
            '<div class="setting-row-new">' +
                '<div class="setting-label-new">Number of groups:</div>' +
                '<div class="setting-control-new">' +
                    '<div class="number-control-new">' +
                        '<button class="control-btn-new" onclick="changeGroupCount(-1)">' +
                            '<img src="/icons/minus.svg" alt="Minus">' +
                        '</button>' +
                        '<span class="control-value-new" id="groupCount">' + (study.groupCount || 1) + '</span>' +
                        '<button class="control-btn-new" onclick="changeGroupCount(1)">' +
                            '<img src="/icons/plus.svg" alt="Plus">' +
                        '</button>' +
                    '</div>' +
                '</div>' +
                '<div class="info-icon-new">' +
                    '<img src="/icons/info.svg" alt="Info">' +
                    '<div class="tooltip">' + tooltips.numberOfGroups + '</div>' +
                '</div>' +
            '</div>' +
            '<div class="setting-row-new">' +
                '<div class="setting-label-new">Generate random usernames:</div>' +
                '<div class="setting-control-new">' +
                    '<div class="custom-checkbox ' + (study.randomUsernames !== false ? 'checked' : '') + '" onclick="toggleCheckbox(this, \'randomUsernames\')">' +
                        (study.randomUsernames !== false ? '<img src="/icons/check.svg" class="icon icon-sm" alt="Checked">' : '') +
                    '</div>' +
                '</div>' +
                '<div class="info-icon-new">' +
                    '<img src="/icons/info.svg" alt="Info">' +
                    '<div class="tooltip">' + tooltips.randomUsernames + '</div>' +
                '</div>' +
            '</div>' +
            '<div class="setting-row-new">' +
                '<div class="setting-label-new">Display usernames between segments:</div>' +
                '<div class="setting-control-new">' +
                    '<div class="custom-checkbox ' + (study.showUsernamesBetweenSegments !== false ? 'checked' : '') + '" onclick="toggleCheckbox(this, \'showUsernamesBetweenSegments\')">' +
                        (study.showUsernamesBetweenSegments !== false ? '<img src="/icons/check.svg" class="icon icon-sm" alt="Checked">' : '') +
                    '</div>' +
                '</div>' +
                '<div class="info-icon-new">' +
                    '<img src="/icons/info.svg" alt="Info">' +
                    '<div class="tooltip">' + tooltips.displayUsernames + '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div style="margin-bottom: var(--space-9);">' +
            '<h3 style="font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); color: var(--color-grey-800); margin-bottom: var(--space-7);">Segments</h3>' +
            '<div class="setting-row-new">' +
                '<div class="setting-label-new">Number of segments:</div>' +
                '<div class="setting-control-new">' +
                    '<div class="number-control-new">' +
                        '<button class="control-btn-new" onclick="changeSegmentCount(-1)">' +
                            '<img src="/icons/minus.svg" alt="Minus">' +
                        '</button>' +
                        '<span class="control-value-new" id="segmentCount">' + (study.segmentCount || 3) + '</span>' +
                        '<button class="control-btn-new" onclick="changeSegmentCount(1)">' +
                            '<img src="/icons/plus.svg" alt="Plus">' +
                        '</button>' +
                    '</div>' +
                '</div>' +
                '<div class="info-icon-new">' +
                    '<img src="/icons/info.svg" alt="Info">' +
                    '<div class="tooltip">' + tooltips.numberOfSegments + '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div>' +
            '<h3 style="font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); color: var(--color-grey-800); margin-bottom: var(--space-5);">Delete Study</h3>' +
            '<p class="delete-warning">' + tooltips.deleteWarning + '</p>' +
            '<div id="deleteButtonContainer">' +
                '<button class="btn btn-warning" onclick="showDeleteConfirmation(\'' + studyId + '\')">' +
                    'Delete study' +
                    '<div class="icon">' +
                        '<img src="/icons/trash.svg" alt="Delete">' +
                    '</div>' +
                '</button>' +
            '</div>' +
            '<div id="deleteConfirmationContainer" style="display: none;">' +
                '<p style="font-size: var(--font-size-base); color: var(--color-grey-700); margin-bottom: var(--space-4); font-weight: var(--font-weight-medium);">Are you sure?</p>' +
                '<div style="display: flex; gap: var(--space-3);">' +
                    '<button class="btn btn-warning" onclick="confirmDeleteStudy(\'' + studyId + '\')">' +
                        'Yes, delete study' +
                    '</button>' +
                    '<button class="btn btn-secondary-outline" onclick="cancelDeleteConfirmation()">' +
                        'Cancel' +
                    '</button>' +
                '</div>' +
            '</div>' +
        '</div>';
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Setup tooltips for the modal content
    setupTooltips();
    
    window.currentSettingsStudyId = studyId;
    window.currentSettingsData = Object.assign({}, study);
}

function closeSettingsModal() {
    if (window.currentSettingsStudyId) {
        saveSettingsChanges();
    }
    
    const overlay = document.querySelector('.settings-overlay');
    if (overlay) {
        overlay.remove();
    }
    
    const settingsButton = document.querySelector('.study-settings.active');
    if (settingsButton) {
        settingsButton.classList.remove('active');
    }
    
    window.currentSettingsStudyId = null;
    window.currentSettingsData = null;
}

function editStudyName() {
    const display = document.getElementById('settingsStudyNameDisplay');
    const input = document.getElementById('settingsStudyName');
    const editIcon = document.getElementById('editIcon');
    const checkIcon = document.getElementById('checkIcon');
    
    // Hide display and edit icon
    display.style.display = 'none';
    editIcon.style.display = 'none';
    
    // Show input and check icon
    input.style.display = 'inline-block';
    checkIcon.style.display = 'flex';
    
    input.focus();
    input.select();
    
    // Add input validation
    function handleInput() {
        const input = document.getElementById('settingsStudyName');
        if (!input) return;
        
        console.log('Input length:', input.value.length);
        
        // Prevent typing beyond 40 characters
        if (input.value.length > 40) {
            input.value = input.value.substring(0, 40);
        }
        
        // Add warning class if at limit
        if (input.value.length >= 40) {
            console.log('Adding warning class');
            input.classList.add('warning');
        } else {
            console.log('Removing warning class');
            input.classList.remove('warning');
        }
    }
    
    input.addEventListener('input', handleInput);
    input.addEventListener('keyup', handleInput);
    input.addEventListener('paste', function() {
        setTimeout(handleInput, 10);
    });
    
    function handleKeydown(e) {
        if (e.key === 'Enter') {
            saveStudyNameEdit();
        } else if (e.key === 'Escape') {
            cancelStudyNameEdit();
        }
    }
    
    input.addEventListener('keydown', handleKeydown);
}

function saveStudyNameEdit() {
    const display = document.getElementById('settingsStudyNameDisplay');
    const input = document.getElementById('settingsStudyName');
    const editIcon = document.getElementById('editIcon');
    const checkIcon = document.getElementById('checkIcon');
    
    const newName = input.value.trim();
    if (newName && newName.length <= 40) {
        display.textContent = newName;
        window.currentSettingsData.name = newName;
    }
    
    display.style.display = 'inline';
    editIcon.style.display = 'inline-flex';
    input.style.display = 'none';
    checkIcon.style.display = 'none';
    input.style.borderColor = 'var(--color-grey-200)';
}

function cancelStudyNameEdit() {
    const display = document.getElementById('settingsStudyNameDisplay');
    const input = document.getElementById('settingsStudyName');
    const editIcon = document.getElementById('editIcon');
    const checkIcon = document.getElementById('checkIcon');
    
    input.value = display.textContent;
    display.style.display = 'inline';
    editIcon.style.display = 'inline-flex';
    input.style.display = 'none';
    checkIcon.style.display = 'none';
    input.style.borderColor = 'var(--color-grey-200)';
}

function changeGroupCount(delta) {
    const current = parseInt(document.getElementById('groupCount').textContent);
    const newValue = Math.max(1, Math.min(10, current + delta));
    document.getElementById('groupCount').textContent = newValue;
    window.currentSettingsData.groupCount = newValue;
}

function changeSegmentCount(delta) {
    const current = parseInt(document.getElementById('segmentCount').textContent);
    const newValue = Math.max(1, Math.min(20, current + delta));
    document.getElementById('segmentCount').textContent = newValue;
    window.currentSettingsData.segmentCount = newValue;
}

function toggleCheckbox(element, property) {
    const isChecked = element.classList.contains('checked');
    
    if (isChecked) {
        element.classList.remove('checked');
        element.innerHTML = '';
        window.currentSettingsData[property] = false;
    } else {
        element.classList.add('checked');
        element.innerHTML = '<img src="/icons/check.svg" class="icon icon-sm" alt="Checked">';
        window.currentSettingsData[property] = true;
    }
}

async function saveSettingsChanges() {
    if (!window.currentSettingsStudyId || !window.currentSettingsData) return;
    
    try {
        const response = await fetch('/api/studies/' + window.currentSettingsStudyId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(window.currentSettingsData)
        });
        
        if (response.ok) {
            loadStudies();
        } else {
            console.error('Failed to update study');
        }
    } catch (error) {
        console.error('Failed to update study:', error);
    }
}

function showDeleteConfirmation(studyId) {
    const deleteButtonContainer = document.getElementById('deleteButtonContainer');
    const deleteConfirmationContainer = document.getElementById('deleteConfirmationContainer');
    
    deleteButtonContainer.style.display = 'none';
    deleteConfirmationContainer.style.display = 'block';
    
    // Store the study ID for later use
    window.pendingDeleteStudyId = studyId;
}

function cancelDeleteConfirmation() {
    const deleteButtonContainer = document.getElementById('deleteButtonContainer');
    const deleteConfirmationContainer = document.getElementById('deleteConfirmationContainer');
    
    deleteButtonContainer.style.display = 'block';
    deleteConfirmationContainer.style.display = 'none';
    
    // Clear the pending delete
    window.pendingDeleteStudyId = null;
}

async function confirmDeleteStudy(studyId) {
    try {
        const response = await fetch('/api/studies/' + studyId, { method: 'DELETE' });
        if (response.ok) {
            closeSettingsModal();
            loadStudies();
        } else {
            alert(tooltips.messages.failedToDeleteStudy);
        }
    } catch (error) {
        alert(tooltips.messages.failedToDeleteStudy);
    }
}

function exportStudyData(studyId) {
    window.open('/api/studies/' + studyId + '/export', '_blank');
}

function showCreateStudyModal() {
    const name = prompt(tooltips.messages.createStudyPrompt);
    if (name && name.trim()) {
        createStudy(name.trim());
    }
}

async function createStudy(name) {
    const data = {
        name: name,
        groupCount: 1,
        segmentCount: 3,
        randomUsernames: true,
        showUsernamesBetweenSegments: true
    };
    
    try {
        const response = await fetch('/api/studies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            loadStudies();
        } else {
            alert(tooltips.messages.failedToCreateStudy);
        }
    } catch (error) {
        alert(tooltips.messages.failedToCreateStudy);
    }
}

// Authentication and user management
async function loadCurrentUser() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            redirectToLogin();
            return;
        }

        const response = await fetch('/api/auth/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            redirectToLogin();
            return;
        }

        currentUser = await response.json();
        updateUserGreeting();
    } catch (error) {
        console.error('Failed to load user:', error);
        redirectToLogin();
    }
}

function updateUserGreeting() {
    const greetingElement = document.getElementById('userGreeting');
    if (currentUser && currentUser.firstName) {
        greetingElement.textContent = `Hi ${currentUser.firstName}!`;
    } else {
        greetingElement.textContent = 'Hi Admin!';
    }
}

function redirectToLogin() {
    localStorage.removeItem('authToken');
    window.location.href = '/landing.html';
}

// User dropdown menu
function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

function openAccountSettings() {
    // Close dropdown
    document.getElementById('userDropdown').style.display = 'none';
    
    // Populate form with current user data
    if (currentUser) {
        document.getElementById('profileFirstName').value = currentUser.firstName || '';
        document.getElementById('profileEmail').value = currentUser.email || '';
    }
    
    // Show modal
    document.getElementById('accountSettingsModal').style.display = 'flex';
}

function closeAccountSettings() {
    document.getElementById('accountSettingsModal').style.display = 'none';
    clearSettingsMessages();
}

function clearSettingsMessages() {
    document.getElementById('settingsMessage').style.display = 'none';
    document.getElementById('settingsError').style.display = 'none';
}

async function updateProfile(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('profileFirstName').value;
    const email = document.getElementById('profileEmail').value;
    const token = localStorage.getItem('authToken');
    
    try {
        const response = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ firstName, email })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSettingsMessage('Profile updated successfully!', 'success');
            // Reload user data to update greeting
            await loadCurrentUser();
        } else {
            showSettingsMessage(data.error || 'Failed to update profile', 'error');
        }
    } catch (error) {
        showSettingsMessage('Connection error. Please try again.', 'error');
    }
}

async function updatePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    const token = localStorage.getItem('authToken');
    
    if (newPassword !== confirmNewPassword) {
        showSettingsMessage('New passwords do not match', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSettingsMessage('Password updated successfully!', 'success');
            // Clear the form
            document.getElementById('passwordForm').reset();
        } else {
            showSettingsMessage(data.error || 'Failed to update password', 'error');
        }
    } catch (error) {
        showSettingsMessage('Connection error. Please try again.', 'error');
    }
}

function showSettingsMessage(message, type) {
    clearSettingsMessages();
    
    if (type === 'success') {
        const messageDiv = document.getElementById('settingsMessage');
        messageDiv.textContent = message;
        messageDiv.className = 'status status-success';
        messageDiv.style.display = 'block';
    } else {
        const errorDiv = document.getElementById('settingsError');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

async function logout() {
    const token = localStorage.getItem('authToken');
    
    try {
        // Call logout endpoint
        await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Always clear local storage and redirect
        localStorage.removeItem('authToken');
        window.location.href = '/landing.html';
    }
}