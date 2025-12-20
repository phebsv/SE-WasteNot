// ===== AUTH GUARD =====
// if (!localStorage.getItem("authToken") || localStorage.getItem("userRole") !== "admin") {
//     window.location.href = "../login/login-consumer.html";
// }

// Mock Data Store
let announcements = JSON.parse(localStorage.getItem('adminAnnouncements')) || [
    { id: 1, title: 'Scheduled Maintenance', body: 'The WasteNot platform will undergo scheduled maintenance on 12/18...', target: 'All', type: 'Warning', status: 'Published', date: '2025-12-14 10:00' },
    { id: 2, title: 'New Analytics Feature', body: 'Providers now have access to a detailed dashboard on food waste reduction.', target: 'Providers', type: 'Success', status: 'Published', date: '2025-12-10 14:30' },
    { id: 3, title: 'Draft NGO Reminder', body: 'Reminder about uploading documents for new NGO approvals.', target: 'NGOs', type: 'Info', status: 'Draft', date: '2025-12-05 09:00' },
];

document.addEventListener("DOMContentLoaded", () => {
    
    // --- Element References ---
    const form = document.getElementById('announcementForm');
    const historyList = document.getElementById('annList');
    const historyFilter = document.getElementById('historyFilter');
    const logoutBtn = document.getElementById("logoutBtn");

    // --- Utility Function ---
    function showToast(message, type = "success") {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }
    
    // --- 1. History Rendering and Filtering ---
    function renderHistory(statusFilter = 'Published') {
        historyList.innerHTML = '';
        
        const filteredAnnouncements = announcements
            .filter(ann => ann.status === statusFilter)
            .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending

        if (filteredAnnouncements.length === 0) {
            historyList.innerHTML = `<p class="text-muted" style="text-align: center; padding: 20px;">No ${statusFilter.toLowerCase()} announcements found.</p>`;
            return;
        }

        filteredAnnouncements.forEach(ann => {
            const item = document.createElement('div');
            item.className = 'announcement-item';
            
            item.innerHTML = `
                <div class="announcement-details">
                    <h4>${ann.title}</h4>
                    <p>${ann.body.substring(0, 100)}...</p>
                    <p>Audience: <strong>${ann.target}</strong></p>
                </div>
                <div class="announcement-meta">
                    <span class="status-tag type-${ann.type}">${ann.type}</span>
                    <span class="status-tag status-${ann.status}">${ann.status}</span>
                    <p style="font-size:0.85rem; margin:0;">${ann.date}</p>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn-secondary btn-sm" onclick="editAnnouncement(${ann.id})">Edit</button>
                        <button class="btn-sm btn-danger" onclick="archiveAnnouncement(${ann.id})">${ann.status === 'Archived' ? 'Delete' : 'Archive'}</button>
                    </div>
                </div>
            `;
            historyList.appendChild(item);
        });
    }

    historyFilter.addEventListener('change', () => {
        renderHistory(historyFilter.value);
    });
    
    // --- 2. Form Submission ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        publishAnnouncement();
    });
    
    document.getElementById('announceDraft').addEventListener('click', (e) => {
        e.preventDefault();
        saveDraft();
    });

    function createNewAnnouncement(status) {
        const newAnn = {
            id: Date.now(), // Use timestamp as a simple unique ID
            title: document.getElementById('announceTitle').value.trim(),
            body: document.getElementById('announceBody').value.trim(),
            target: document.getElementById('targetAudience').value,
            type: document.getElementById('announcementType').value,
            status: status,
            date: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })
        };
        return newAnn;
    }

    function publishAnnouncement() {
        const newAnn = createNewAnnouncement('Published');
        announcements.unshift(newAnn); // Add to the beginning
        localStorage.setItem('adminAnnouncements', JSON.stringify(announcements));
        form.reset();
        showToast('Announcement published successfully!', 'success');
        renderHistory(historyFilter.value); // Re-render current tab
    }
    
    function saveDraft() {
        if (!document.getElementById('announceTitle').value.trim()) {
            showToast('Title is required to save a draft.', 'warning');
            return;
        }
        const newAnn = createNewAnnouncement('Draft');
        announcements.unshift(newAnn); // Add to the beginning
        localStorage.setItem('adminAnnouncements', JSON.stringify(announcements));
        form.reset();
        showToast('Announcement saved as draft.', 'info');
        // Switch to and render Drafts tab
        historyFilter.value = 'Draft';
        renderHistory('Draft');
    }
    
    // --- 3. Global Actions ---
    window.editAnnouncement = (id) => {
        const ann = announcements.find(a => a.id === id);
        if (ann) {
            // MOCK: In a real app, this would open a modal/edit page
            alert(`Editing Announcement ID ${id}:\nTitle: ${ann.title}\nStatus: ${ann.status}\nBody: ${ann.body}`);
        }
    };
    
    window.archiveAnnouncement = (id) => {
        const index = announcements.findIndex(a => a.id === id);
        if (index !== -1) {
            const currentStatus = announcements[index].status;
            let message, type;
            
            if (currentStatus === 'Archived') {
                // Permanently delete the item
                announcements.splice(index, 1);
                message = `Announcement ${id} permanently deleted.`;
                type = 'danger';
            } else {
                // Archive the item
                announcements[index].status = 'Archived';
                message = `Announcement ${id} archived.`;
                type = 'warning';
            }

            localStorage.setItem('adminAnnouncements', JSON.stringify(announcements));
            renderHistory(historyFilter.value);
            showToast(message, type);
        }
    };

    // --- Initial Load and Logout ---
    renderHistory(historyFilter.value);

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "../login/login-consumer.html";
        });
    }
});