// ===== AUTH GUARD =====
if (!localStorage.getItem("authToken") || localStorage.getItem("userRole") !== "admin") {
    window.location.href = "../login/login-consumer.html";
}

const API_URL = 'http://localhost/wastenot-api/api/users.php';

// Data storage for pending users
let pendingUsers = {
    providers: [],
    ngos: []
};

let activeTab = 'provider'; // Default active tab

// ===== LOAD PENDING USERS =====
async function loadPendingUsers(role) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}?role=${role}&status=pending`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.users || [];
        }
        return [];
    } catch (error) {
        console.error(`Error loading pending ${role}:`, error);
        return [];
    }
}

// ===== APPROVE/REJECT USER =====
async function updateUserStatus(userId, newStatus) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ id: userId, status: newStatus })
        });
        
        return response.ok;
    } catch (error) {
        console.error('Error updating user:', error);
        return false;
    }
}

// ===== LOAD ALL PENDING USERS =====
async function loadAllPendingUsers() {
    pendingUsers.providers = await loadPendingUsers('partner');
    pendingUsers.ngos = await loadPendingUsers('ngo');
}

document.addEventListener("DOMContentLoaded", async () => {
    
    // Load pending users
    await loadAllPendingUsers();
    
    const tabs = document.querySelectorAll('.tab-btn');
    const searchInput = document.getElementById('approvalSearch');
    
    // Initial count display
    updateCounts();

    // --- Tab Switching Logic ---
    tabs.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            if (activeTab === targetTab) return;

            // 1. Update button classes
            document.querySelector('.tab-btn.active').classList.remove('active');
            button.classList.add('active');

            // 2. Update content visibility
            document.querySelector('.tab-content.active').classList.remove('active');
            document.getElementById(targetTab).classList.add('active');

            activeTab = targetTab;
            // Reset search and render new tab content
            searchInput.value = '';
            filterAndRender();
        });
    });

    // --- Helper Functions ---
    function updateCounts() {
        document.getElementById('providerCount').textContent = pendingUsers.providers.length;
        document.getElementById('ngoCount').textContent = pendingUsers.ngos.length;
    }

    function createActions(id) {
        return `
            <div class="action-group">
                <button class="btn-sm btn-success" onclick="handleApproval(${id}, 'active')">Approve</button>
                <button class="btn-sm btn-danger" onclick="handleApproval(${id}, 'suspended')">Reject</button>
            </div>
        `;
    }

    // --- Rendering Functions ---
    function renderProviders(data) {
        const tbody = document.getElementById('providerTbody');
        tbody.innerHTML = '';
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No pending provider approvals</td></tr>';
            return;
        }
        data.forEach(p => {
            const row = tbody.insertRow();
            const submitted = p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A';
            row.innerHTML = `
                <td>${p.id}</td>
                <td>${p.full_name}</td>
                <td>${p.phone || 'N/A'}</td>
                <td>${submitted}</td>
                <td>${p.email}</td>
                <td>${createActions(p.id)}</td>
            `;
        });
    }

    function renderNgos(data) {
        const tbody = document.getElementById('ngoTbody');
        tbody.innerHTML = '';
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No pending NGO approvals</td></tr>';
            return;
        }
        data.forEach(n => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${n.id}</td>
                <td>${n.full_name}</td>
                <td>${n.phone || 'N/A'}</td>
                <td>${n.location || 'N/A'}</td>
                <td>${n.email}</td>
                <td>${createActions(n.id)}</td>
            `;
        });
    }

    // --- Filtering Logic ---
    function filterAndRender() {
        const searchText = searchInput.value.toLowerCase();
        let currentData = activeTab === 'provider' ? pendingUsers.providers : pendingUsers.ngos;
        const renderer = activeTab === 'provider' ? renderProviders : renderNgos;

        const filteredData = currentData.filter(app => {
            const searchableFields = [
                app.full_name || '',
                app.email || '',
                app.phone || '',
                app.location || ''
            ].join(' ').toLowerCase();
            return searchableFields.includes(searchText);
        });

        renderer(filteredData);
    }
    
    // --- Global Action Handlers ---
    window.handleApproval = async (id, newStatus) => {
        const action = newStatus === 'active' ? 'approve' : 'reject';
        if(confirm(`Confirm action: ${action} this application?`)) {
            const success = await updateUserStatus(id, newStatus);
            if (success) {
                showToast(`Application ${action}ed successfully`, 'success');
                // Reload pending users
                await loadAllPendingUsers();
                updateCounts();
                filterAndRender();
            } else {
                showToast(`Failed to ${action} application`, 'danger');
            }
        }
    };
    
    window.viewDocs = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_URL}?id=${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                const user = data.user;
                alert(`User Details:\n\nName: ${user.full_name}\nEmail: ${user.email}\nPhone: ${user.phone || 'N/A'}\nRole: ${user.role}\nLocation: ${user.location || 'N/A'}\nRegistered: ${new Date(user.created_at).toLocaleString()}`);
            }
        } catch (error) {
            console.error('Error loading user details:', error);
        }
    };
    
    // Utility for toasts 
    function showToast(message, type = "success") {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }

    // --- Event Listeners and Initial Load ---
    searchInput.addEventListener('input', filterAndRender);
    
    // Initial counts and render
    updateCounts();
    filterAndRender();

    // Logout Handler
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        [
            'authToken',
            'userId',
            'userRole',
            'userName',
            'userEmail',
            'ngoName',
            'consumerLoggedIn',
            'partnerLoggedIn',
            'ngoLoggedIn',
            'adminLoggedIn'
        ].forEach(k => localStorage.removeItem(k));
        sessionStorage.clear();
        window.location.href = "../login/login.html";
    });
});