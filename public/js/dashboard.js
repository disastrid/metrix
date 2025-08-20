let studies = [];

// Load studies when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadStudies();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('createStudyBtn').addEventListener('click', showCreateStudyModal);
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

async function loadStudies() {
    try {
        const response = await fetch('/api/studies');
        studies = await response.json();
        renderStudies();
    } catch (error) {
        console.error('Failed to load studies:', error);
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
        return `
            <div class="empty-state">
                <h3>No ${type} studies</h3>
                <p>${type === 'current' ? 'Create your first study to get started' : 'No completed studies yet'}</p>
            </div>
        `;
    }

    return studyList.map(study => `
        <div class="study-row">
            <div class="study-card" onclick="enterStudy('${study._id}')">
                <div class="study-info">
                    <div class="study-name">${study.name}</div>
                    <div class="study-meta">
                        ${type === 'completed' ? 'Completed' : 'Created'} on: ${formatDate(study.createdAt)}
                    </div>
                </div>
                <img src="/icons/arrow-right.svg" class="study-arrow" alt="Enter study">
            </div>
            <div class="study-settings" onclick="showSettingsModal(event, '${study._id}')">
                <img src="/icons/sliders.svg" alt="Settings">
            </div>
        </div>
    `).join('');
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
    window.location.href = `/admin/study/${studyId}`;
}

function showSettingsModal(event, studyId) {
    event.stopPropagation(); // Prevent card click
    
    // Add active state to the clicked settings button
    const settingsButton = event.currentTarget;
    settingsButton.classList.add('active');
    
    const study = studies.find(s => s._id === studyId);
    if (!study) return;

    const overlay = document.createElement('div');
    overlay.className = 'settings-overlay';
    overlay.innerHTML = `
        <div class="settings-modal">
            <div class="settings-header">
                <div class="settings-header-left">
                    <button class="back-btn" onclick="this.closest('.settings-overlay').remove()">
                        <img src="/icons/arrow-left.svg" class="icon" alt="Back">
                    </button>
                    <h2 class="settings-title">Settings</h2>
                </div>
                <button class="btn-download" onclick="exportStudyData('${studyId}')">
                    <img src="/icons/download.svg" class="icon icon-sm" alt="Download">
                    Download all data
                </button>
            </div>
            
            <div class="settings-content">
                <!-- Study Name -->
                <div class="study-name-field">
                    <span class="study-name-label">Study Name:</span>
                    <input type="text" class="study-name-input" id="settingsStudyName" value="${study.name}">
                    <svg class="icon-btn" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </div>

                <!-- Participant Settings -->
                <div class="settings-section">
                    <h3 class="section-header">Participant settings</h3>
                    
                    <div class="setting-row">
                        <div class="setting-label">
                            <span>Number of groups:</span>
                            <div class="info-icon" data-tooltip="Set how many groups participants can choose from">
                                <img src="/icons/info.svg" class="icon icon-sm" alt="Info">
                                <div class="tooltip">Set how many groups participants can choose from</div>
                            </div>
                        </div>
                        <div class="setting-control">
                            <div class="number-control">
                                <button class="control-btn" onclick="changeGroupCount(${studyId}, -1)">
                                    <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M5 12h14"/>
                                    </svg>
                                </button>
                                <span class="control-value" id="groupCount">${study.groupCount}</span>
                                <button class="control-btn" onclick="changeGroupCount(${studyId}, 1)">
                                    <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M12 5v14M5 12h14"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="setting-row">
                        <div class="setting-label">
                            <span>Generate random usernames:</span>
                            <div class="info-icon" data-tooltip="This setting will generate a unique username for every participant, using two random nouns. This allows you to align a participant's real-time data with their surveys after the study.">
                                <img src="/icons/info.svg" class="icon icon-sm" alt="Info">
                                <div class="tooltip">This setting will generate a unique username for every participant, using two random nouns. This allows you to align a participant's real-time data with their surveys after the study.</div>
                            </div>
                        </div>
                        <div class="setting-control">
                            <div class="custom-checkbox ${study.randomUsernames ? 'checked' : ''}" onclick="toggleCheckbox(this, 'randomUsernames')">
                                ${study.randomUsernames ? '<img src="/icons/check.svg" class="icon icon-sm" alt="Checked">' : ''}
                            </div>
                        </div>
                    </div>

                    <div class="setting-row">
                        <div class="setting-label">
                            <span>Display usernames between segments:</span>
                            <div class="info-icon" data-tooltip="Show participant usernames during breaks between study segments">
                                <img src="/icons/info.svg" class="icon icon-sm" alt="Info">
                                <div class="tooltip">Show participant usernames during breaks between study segments</div>
                            </div>
                        </div>
                        <div class="setting-control">
                            <div class="custom-checkbox ${study.showUsernamesBetweenSegments ? 'checked' : ''}" onclick="toggleCheckbox(this, 'showUsernamesBetweenSegments')">
                                ${study.showUsernamesBetweenSegments ? '<img src="/icons/check.svg" class="icon icon-sm" alt="Checked">' : ''}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Segments -->
                <div class="settings-section">
                    <h3 class="section-header">Segments</h3>
                    
                    <div class="setting-row">
                        <div class="setting-label">
                            <span>Number of segments:</span>
                            <div class="info-icon" data-tooltip="Set how many segments your study will have">
                                <img src="/icons/info.svg" class="icon icon-sm" alt="Info">
                                <div class="tooltip">Set how many segments your study will have</div>
                            </div>
                        </div>
                        <div class="setting-control">
                            <div class="number-control">
                                <button class="control-btn" onclick="changeSegmentCount(${studyId}, -1)">
                                    <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M5 12h14"/>
                                    </svg>
                                </button>
                                <span class="control-value" id="segmentCount">${study.segmentCount}</span>
                                <button class="control-btn" onclick="changeSegmentCount(${studyId}, 1)">
                                    <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M12 5v14M5 12h14"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Delete Section -->
            <div class="delete-section">
                <h3 class="section-header">Delete Study</h3>
                <p class="delete-warning">This will permanently delete this study and all settings and associated data. You will not be able to undo this action</p>
                <button class="btn-delete" onclick="deleteStudy('${studyId}')">
                    <img src="/icons/trash.svg" class="icon icon-sm" alt="Delete">
                    Delete study
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Remove active state when modal is closed
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            settingsButton.classList.remove('active');
        }
    });
    
    // Also remove active state when back button is clicked
    overlay.querySelector('.back-btn').addEventListener('click', () => {
        settingsButton.classList.remove('active');
    });
    
    // Store current study ID for the control functions
    window.currentSettingsStudyId = studyId;
    window.currentSettingsData = { ...study };
}

// Helper functions for the settings modal
function changeGroupCount(studyId, delta) {
    const current = parseInt(document.getElementById('groupCount').textContent);
    const newValue = Math.max(1, Math.min(10, current + delta));
    document.getElementById('groupCount').textContent = newValue;
    window.currentSettingsData.groupCount = newValue;
}

function changeSegmentCount(studyId, delta) {
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
    const studyName = document.getElementById('settingsStudyName').value;
    const data = {
        ...window.currentSettingsData,
        name: studyName
    };
    
    try {
        const response = await fetch(`/api/studies/${window.currentSettingsStudyId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            document.querySelector('.settings-overlay').remove();
            loadStudies(); // Reload the list
        } else {
            alert('Failed to update study');
        }
    } catch (error) {
        alert('Failed to update study');
    }
}

// Auto-save when closing modal or clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('settings-overlay')) {
        if (window.currentSettingsStudyId) {
            saveSettingsChanges();
        }
    }
});

// Auto-save when study name changes
document.addEventListener('input', (e) => {
    if (e.target.id === 'settingsStudyName') {
        window.currentSettingsData.name = e.target.value;
    }
});

// Tooltip functionality
document.addEventListener('mouseenter', (e) => {
    if (e.target.closest('.info-icon')) {
        const icon = e.target.closest('.info-icon');
        icon.classList.add('active');
    }
}, true);

document.addEventListener('mouseleave', (e) => {
    if (e.target.closest('.info-icon')) {
        const icon = e.target.closest('.info-icon');
        icon.classList.remove('active');
    }
}, true);

async function deleteStudy(studyId) {
    if (!confirm('Are you sure you want to delete this study? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/studies/${studyId}`, { method: 'DELETE' });
        if (response.ok) {
            document.querySelector('.settings-overlay').remove();
            loadStudies(); // Reload the list
        } else {
            alert('Failed to delete study');
        }
    } catch (error) {
        alert('Failed to delete study');
    }
}

function exportStudyData(studyId) {
    window.open(`/api/studies/${studyId}/export`, '_blank');
}

function showCreateStudyModal() {
    const overlay = document.createElement('div');
    overlay.className = 'settings-overlay';
    overlay.innerHTML = `
        <div class="settings-modal">
            <div class="settings-header">
                <h2 class="settings-title">Create New Study</h2>
                <button class="close-btn" onclick="this.closest('.settings-overlay').remove()">&times;</button>
            </div>
            <div class="settings-content">
                <form id="createStudyForm">
                    <div class="form-group">
                        <label class="form-label">Study Name</label>
                        <input type="text" id="createStudyName" class="form-input" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Number of Groups</label>
                        <input type="number" id="createGroupCount" class="form-input" min="1" max="10" value="3" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Number of Segments</label>
                        <input type="number" id="createSegmentCount" class="form-input" min="1" max="20" value="5" required>
                    </div>
                    
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: var(--space-3);">
                            <input type="checkbox" id="createRandomUsernames" checked>
                            <span>Enable random usernames</span>
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: var(--space-3);">
                            <input type="checkbox" id="createShowUsernames">
                            <span>Show usernames between segments</span>
                        </label>
                    </div>
                </form>
            </div>
            <div class="settings-actions">
                <button type="button" class="btn btn-outline" onclick="this.closest('.settings-overlay').remove()">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="createStudy()">Create Study</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

async function createStudy() {
    const data = {
        name: document.getElementById('createStudyName').value,
        groupCount: parseInt(document.getElementById('createGroupCount').value),
        segmentCount: parseInt(document.getElementById('createSegmentCount').value),
        randomUsernames: document.getElementById('createRandomUsernames').checked,
        showUsernamesBetweenSegments: document.getElementById('createShowUsernames').checked
    };
    
    try {
        const response = await fetch('/api/studies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            document.querySelector('.settings-overlay').remove();
            loadStudies(); // Reload the list
        } else {
            alert('Failed to create study');
        }
    } catch (error) {
        alert('Failed to create study');
    }
}

function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin';
}