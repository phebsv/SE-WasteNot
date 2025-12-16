// ===== AUTH GUARD =====
if (!localStorage.getItem("authToken") || localStorage.getItem("userRole") !== "admin") {
    window.location.href = "../login/login-consumer.html";
}

const API_URL = 'http://localhost/wastenot-api/api/users.php';
const REGISTER_API = 'http://localhost/wastenot-api/api/register.php';

// Data storage
let allUsers = {
    providers: [],
    ngos: [],
    customers: []
};

let activeTab = 'providers'; // Default active tab

// ===== LOAD USERS FROM BACKEND =====
async function loadUsers(role) {
    try {
        const token = localStorage.getItem('authToken');
        console.log(`Loading ${role} users...`);
        console.log(`Token: ${token ? 'Present' : 'Missing'}`);
        
        const response = await fetch(`${API_URL}?role=${role}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log(`Response status for ${role}:`, response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log(`${role} data:`, data);
            return data.users || [];
        } else {
            console.error(`Failed to load ${role}:`, response.status);
            return [];
        }
    } catch (error) {
        console.error(`Error loading ${role} users:`, error);
        return [];
    }
}

// ===== UPDATE USER STATUS =====
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
        
        if (response.ok) {
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error updating user:', error);
        return false;
    }
}

// ===== LOAD ALL USERS =====
async function loadAllUsers() {
    console.log('Loading all users...');
    allUsers.providers = await loadUsers('partner');
    allUsers.ngos = await loadUsers('ngo');
    allUsers.customers = await loadUsers('consumer');
    console.log('All users loaded:', allUsers);
}

document.addEventListener("DOMContentLoaded", async () => {
    
    const tabs = document.querySelectorAll('.tab-btn');
    const searchInput = document.getElementById('userSearch');
    const statusFilter = document.getElementById('statusFilter');
    
    // Load all users from backend
    await loadAllUsers();
    
    // Render initial tab
    filterAndRender();
    
    // Setup logout
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = "../login/login-consumer.html";
    });

    // === CREATE USER MODAL HANDLING ===
    const createUserBtn = document.getElementById('createUserBtn');
    const createUserModal = document.getElementById('createUserModal');
    const closeCreateModal = document.getElementById('closeCreateModal');
    const cancelCreateBtn = document.getElementById('cancelCreateBtn');
    const createUserForm = document.getElementById('createUserForm');

    console.log('Create User Button:', createUserBtn);
    console.log('Create User Modal:', createUserModal);

    function openCreateModal() {
        console.log('Opening modal...');
        createUserModal.classList.remove('hidden');
        createUserForm.reset();
    }

    function closeCreateModalHandler() {
        console.log('Closing modal...');
        createUserModal.classList.add('hidden');
    }

    if (createUserBtn) {
        createUserBtn.addEventListener('click', openCreateModal);
        console.log('Event listener added to create button');
    } else {
        console.error('Create User Button not found!');
    }
    closeCreateModal?.addEventListener('click', closeCreateModalHandler);
    cancelCreateBtn?.addEventListener('click', closeCreateModalHandler);

    createUserModal?.addEventListener('click', (e) => {
        if (e.target === createUserModal) closeCreateModalHandler();
    });

    createUserForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userData = {
            email: document.getElementById('newUserEmail').value.trim(),
            password: document.getElementById('newUserPassword').value,
            full_name: document.getElementById('newUserName').value.trim(),
            role: document.getElementById('newUserRole').value,
            phone: document.getElementById('newUserPhone').value.trim() || null,
            location: document.getElementById('newUserLocation').value.trim() || null
        };

        if (!userData.role) {
            showToast('Please select a user role', 'danger');
            return;
        }

        try {
            const response = await fetch(REGISTER_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok) {
                showToast(`${userData.role.toUpperCase()} account created successfully!`, 'success');
                closeCreateModalHandler();
                // Reload users and refresh display
                await loadAllUsers();
                filterAndRender();
            } else {
                showToast(data.message || 'Failed to create account', 'danger');
            }
        } catch (error) {
            console.error('Error creating user:', error);
            showToast('Error creating account. Please try again.', 'danger');
        }
    });

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
            // Reset filters and render new tab content
            searchInput.value = '';
            statusFilter.value = '';
            filterAndRender();
        });
    });

    // --- Rendering Functions ---
    function createActions(id, status) {
        const buttons = [`<button class="btn-secondary btn-sm" onclick="viewDetails(${id})">View</button>`];
        
        if (status === 'active') {
            buttons.push(`<button class="btn-sm btn-danger" onclick="changeStatus(${id}, 'suspended')">Suspend</button>`);
        } else if (status === 'suspended') {
            buttons.push(`<button class="btn-sm btn-success" onclick="changeStatus(${id}, 'active')">Activate</button>`);
        } else if (status === 'pending') {
            buttons.push(`<button class="btn-sm btn-success" onclick="changeStatus(${id}, 'active')">Approve</button>`);
            buttons.push(`<button class="btn-sm btn-danger" onclick="changeStatus(${id}, 'suspended')">Reject</button>`);
        }
        
        return buttons.join(' ');
    }

    function renderProviders(data) {
        const tbody = document.getElementById('providersTbody');
        tbody.innerHTML = '';
        data.forEach(p => {
            const row = tbody.insertRow();
            const statusLower = (p.status || 'pending').toLowerCase();
            row.innerHTML = `
                <td>${p.id}</td>
                <td>${p.full_name}</td>
                <td>${p.phone || 'N/A'}</td>
                <td>${p.email}</td>
                <td><span class="status-badge status-${statusLower}">${statusLower}</span></td>
                <td>${createActions(p.id, statusLower)}</td>
            `;
        });
    }

    function renderNgos(data) {
        const tbody = document.getElementById('ngosTbody');
        tbody.innerHTML = '';
        data.forEach(n => {
            const row = tbody.insertRow();
            const statusLower = (n.status || 'pending').toLowerCase();
            row.innerHTML = `
                <td>${n.id}</td>
                <td>${n.full_name}</td>
                <td>${n.phone || 'N/A'}</td>
                <td>${n.address || 'N/A'}</td>
                <td><span class="status-badge status-${statusLower}">${statusLower}</span></td>
                <td>${createActions(n.id, statusLower)}</td>
            `;
        });
    }

    function renderCustomers(data) {
        const tbody = document.getElementById('customersTbody');
        tbody.innerHTML = '';
        data.forEach(c => {
            const row = tbody.insertRow();
            const date = c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A';
            const statusLower = (c.status || 'pending').toLowerCase();
            row.innerHTML = `
                <td>${c.id}</td>
                <td>${c.full_name}</td>
                <td>${c.email}</td>
                <td>${date}</td>
                <td><span class="status-badge status-${statusLower}">${statusLower}</span></td>
                <td>${createActions(c.id, statusLower)}</td>
            `;
        });
    }

    // --- Filtering Logic ---
    function filterAndRender() {
        const searchText = searchInput.value.toLowerCase();
        const statusText = statusFilter.value;
        
        // Get current data based on active tab
        let currentData = [];
        let renderer = null;
        
        if (activeTab === 'providers') {
            currentData = allUsers.providers;
            renderer = renderProviders;
        } else if (activeTab === 'ngos') {
            currentData = allUsers.ngos;
            renderer = renderNgos;
        } else if (activeTab === 'customers') {
            currentData = allUsers.customers;
            renderer = renderCustomers;
        }

        const filteredData = currentData.filter(user => {
            // Filter 1: Status
            const matchesStatus = !statusText || user.status === statusText;

            // Filter 2: Search (Name, Contact, Email, etc.)
            const searchableFields = [
                user.full_name || '',
                user.email || '',
                user.phone || '',
                user.location || ''
            ].join(' ').toLowerCase();
            const matchesSearch = searchableFields.includes(searchText);

            return matchesStatus && matchesSearch;
        });

        renderer(filteredData);
    }
    
    // --- Global Actions ---
    window.viewDetails = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_URL}?id=${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                alert(`User Details:\n\nName: ${data.user.full_name}\nEmail: ${data.user.email}\nPhone: ${data.user.phone || 'N/A'}\nRole: ${data.user.role}\nStatus: ${data.user.status}\nLocation: ${data.user.location || 'N/A'}`);
            }
        } catch (error) {
            console.error('Error viewing user:', error);
            showToast('Failed to load user details', 'danger');
        }
    };

    window.changeStatus = async (id, newStatus) => {
        const actionText = newStatus === 'active' ? 'approve' : newStatus === 'suspended' ? 'suspend' : 'update';
        
        if (confirm(`Are you sure you want to ${actionText} this user?`)) {
            const success = await updateUserStatus(id, newStatus);
            if (success) {
                showToast(`User ${actionText}ed successfully`, 'success');
                // Reload data and refresh display
                await loadAllUsers();
                filterAndRender();
            } else {
                showToast(`Failed to ${actionText} user`, 'danger');
            }
        }
    };
    
    // Utility for toasts (Assumes showToast exists)
    function showToast(message, type = "success") {
        const toast = document.createElement('div'); // Mock toast creation
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }

    // --- Event Listeners and Initial Load ---
    searchInput.addEventListener('input', filterAndRender);
    statusFilter.addEventListener('change', filterAndRender);
    
    // Initial render for the default 'providers' tab
    filterAndRender();
});