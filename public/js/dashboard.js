let studies = [];
let tooltips = {};

async function loadTooltips() {
    try {
        const response = await fetch('/data/tooltips.json');
        tooltips = await response.json();
    } catch (error) {
        console.error('Failed to load tooltips:', error);
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    await loadTooltips();
    loadStudies();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('createStudyBtn').addEventListener('click', showCreateStudyModal);
    
    // Close modal when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('settings-overlay')) {
            closeSettingsModal();
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
        document.getElementById('currentStudies').innerHTML = '<div class="empty-state"><h3>Failed to load studies</h3><p>Please try refreshing the page</p></div>';
        document.getElementById('completedStudies').innerHTML = '<div class="empty-state"><h3>Failed to load studies</h3><p>Please try refreshing the page</p></div>';
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
        return '<div class="empty-state"><h3>No ' + type + ' studies</h3><p>' + 
               (type === 'current' ? 'Create your first study to get started' : 'No completed studies yet') + 
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
        html += '<svg class="study-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
        html += '<path d="M9 18l6-6-6-6"/>';
        html += '</svg>';
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
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                '<path d="M19 12H5M12 19l-7-7 7-7"/>' +
            '</svg>' +
        '</div>' +
        '<div class="settings-header-row">' +
            '<h2 class="settings-title">Settings</h2>' +
            '<button class="btn btn-primary-outline" onclick="exportStudyData(\'' + studyId + '\')">' +
                'Download all data' +
                '<img src="/icons/download.svg" class="icon" alt="Download">' +
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
                        '<span class="control-value-new" id="groupCount">' + (study.groupCount || 2) + '</span>' +
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
                    '<div class="custom-checkbox ' + (study.showUsernamesBetweenSegments ? 'checked' : '') + '" onclick="toggleCheckbox(this, \'showUsernamesBetweenSegments\')">' +
                        (study.showUsernamesBetweenSegments ? '<img src="/icons/check.svg" class="icon icon-sm" alt="Checked">' : '') +
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
        '<div style="margin-top: var(--space-12); padding-top: var(--space-9);">' +
            '<h3 style="font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); color: var(--color-grey-800); margin-bottom: var(--space-5);">Delete Study</h3>' +
            '<p class="delete-warning">This will permanently delete this study and all settings and associated data. You will not be able to undo this action</p>' +
            '<button class="btn btn-warning" onclick="deleteStudy(\'' + studyId + '\')">' +
                'Delete study' +
                '<img src="/icons/trash.svg" class="icon" alt="Delete">' +
            '</button>' +
        '</div>';
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
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

async function deleteStudy(studyId) {
    if (!confirm('Are you sure you want to delete this study? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch('/api/studies/' + studyId, { method: 'DELETE' });
        if (response.ok) {
            closeSettingsModal();
            loadStudies();
        } else {
            alert('Failed to delete study');
        }
    } catch (error) {
        alert('Failed to delete study');
    }
}

function exportStudyData(studyId) {
    window.open('/api/studies/' + studyId + '/export', '_blank');
}

function showCreateStudyModal() {
    const name = prompt('Enter study name:');
    if (name && name.trim()) {
        createStudy(name.trim());
    }
}

async function createStudy(name) {
    const data = {
        name: name,
        groupCount: 2,
        segmentCount: 3,
        randomUsernames: true,
        showUsernamesBetweenSegments: false
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
            alert('Failed to create study');
        }
    } catch (error) {
        alert('Failed to create study');
    }
}