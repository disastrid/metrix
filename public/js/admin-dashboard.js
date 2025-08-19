let studies = [];

// Load studies when page loads
document.addEventListener('DOMContentLoaded', loadStudies);

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
    const container = document.getElementById('studiesContainer');
    
    if (studies.length === 0) {
        container.innerHTML = `
            <div class="card text-center">
                <h3>No studies yet</h3>
                <p class="text-grey-600">Create your first study to get started</p>
            </div>
        `;
        return;
    }

    container.innerHTML = studies.map(study => `
        <div class="card" style="margin-bottom: var(--space-8);">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="text-lg font-semibold">${study.name}</h3>
                    <div class="text-sm text-grey-600" style="margin: var(--space-2) 0;">
                        Code: <strong>${study.code}</strong> | 
                        ${study.groupCount} groups | 
                        ${study.segmentCount} segments | 
                        Status: ${study.status}
                    </div>
                </div>
                <div class="flex gap-3">
                    <button onclick="controlStudy('${study._id}')" class="btn btn-sm btn-primary">Control</button>
                    <button onclick="deleteStudy('${study._id}')" class="btn btn-sm btn-warning">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

function controlStudy(studyId) {
    window.location.href = `/admin/study/${studyId}`;
}

async function deleteStudy(studyId) {
    if (!confirm('Are you sure you want to delete this study?')) return;
    
    try {
        await fetch(`/api/studies/${studyId}`, { method: 'DELETE' });
        loadStudies(); // Reload the list
    } catch (error) {
        alert('Failed to delete study');
    }
}

document.getElementById('logoutBtn').onclick = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin';
};

document.getElementById('createStudyBtn').onclick = showCreateStudyModal;

function showCreateStudyModal() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
        background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;
    `;
    
    modal.innerHTML = `
        <div class="card" style="width: 500px; max-width: 90vw;">
            <h2 class="text-xl font-semibold" style="margin-bottom: var(--space-7);">Create New Study</h2>
            
            <form id="createStudyForm">
                <div class="form-group">
                    <label class="form-label">Study Name</label>
                    <input type="text" id="studyName" class="form-input" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Number of Groups</label>
                    <input type="number" id="groupCount" class="form-input" min="1" max="10" value="3" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Number of Segments</label>
                    <input type="number" id="segmentCount" class="form-input" min="1" max="20" value="5" required>
                </div>
                
                <div class="form-group">
                    <label style="display: flex; align-items: center; gap: var(--space-3);">
                        <input type="checkbox" id="randomUsernames" checked>
                        <span>Enable random usernames</span>
                    </label>
                </div>
                
                <div class="flex gap-3" style="margin-top: var(--space-9);">
                    <button type="button" onclick="this.closest('div').remove()" class="btn btn-outline">Cancel</button>
                    <button type="submit" class="btn btn-primary">Create Study</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('createStudyForm').onsubmit = async (e) => {
        e.preventDefault();
        await createStudy();
        modal.remove();
    };
}

async function createStudy() {
    const data = {
        name: document.getElementById('studyName').value,
        groupCount: parseInt(document.getElementById('groupCount').value),
        segmentCount: parseInt(document.getElementById('segmentCount').value),
        randomUsernames: document.getElementById('randomUsernames').checked
    };
    
    try {
        const response = await fetch('/api/studies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            loadStudies(); // Reload the list
        } else {
            alert('Failed to create study');
        }
    } catch (error) {
        alert('Failed to create study');
    }
}