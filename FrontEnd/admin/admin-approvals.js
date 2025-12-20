// ===== AUTH GUARD (Check if admin is logged in) =====
// if (localStorage.getItem("adminLoggedIn") !== "true") {
//     window.location.href = "login-admin.html";
// }

// Mock Data for Approvals
let mockProviderApprovals = [
    { id: 'PA001', name: 'New Cafe Co.', contact: 'Liam Jones', email: 'liam@cafe.com', submitted: '2025-12-14', documents: true },
    { id: 'PA002', name: 'Warehouse Foods Inc.', contact: 'Sara Khan', email: 'sara@warehouse.com', submitted: '2025-12-12', documents: true },
    { id: 'PA003', name: 'City Diner', contact: 'Ben Miller', email: 'ben@diner.com', submitted: '2025-12-10', documents: false },
];

let mockNgoApprovals = [
    { id: 'NA101', name: 'Urban Outreach', contact: 'Priya Sharma', email: 'priya@uo.org', area: 'Downtown', submitted: '2025-12-13', documents: true },
    { id: 'NA102', name: 'Kids First Shelter', contact: 'Alex Rodriguez', email: 'alex@kidsfirst.org', area: 'North End', submitted: '2025-12-09', documents: true },
];

// Map tab names to data arrays and Tbody IDs
const dataMap = {
    provider: { data: mockProviderApprovals, tbodyId: 'providerTbody', render: renderProviders },
    ngo: { data: mockNgoApprovals, tbodyId: 'ngoTbody', render: renderNgos },
};

let activeTab = 'provider'; // Default active tab

document.addEventListener("DOMContentLoaded", () => {
    
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
        document.getElementById('providerCount').textContent = mockProviderApprovals.length;
        document.getElementById('ngoCount').textContent = mockNgoApprovals.length;
    }

    function createActions(id) {
        return `
            <div class="action-group">
                <button class="btn-sm btn-success" onclick="handleApproval('${activeTab}', '${id}', 'Approved')">Approve</button>
                <button class="btn-sm btn-danger" onclick="handleApproval('${activeTab}', '${id}', 'Rejected')">Reject</button>
            </div>
        `;
    }

    // --- Rendering Functions ---
    function renderProviders(data) {
        const tbody = document.getElementById('providerTbody');
        tbody.innerHTML = '';
        data.forEach(p => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${p.id}</td>
                <td>${p.name}</td>
                <td>${p.contact}</td>
                <td>${p.submitted}</td>
                <td>${p.documents ? `<a href="#" class="document-link" onclick="viewDocs('${p.id}')">View Documents</a>` : 'Missing'}</td>
                <td>${createActions(p.id)}</td>
            `;
        });
    }

    function renderNgos(data) {
        const tbody = document.getElementById('ngoTbody');
        tbody.innerHTML = '';
        data.forEach(n => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${n.id}</td>
                <td>${n.name}</td>
                <td>${n.contact}</td>
                <td>${n.area}</td>
                <td>${n.documents ? `<a href="#" class="document-link" onclick="viewDocs('${n.id}')">View Documents</a>` : 'Missing'}</td>
                <td>${createActions(n.id)}</td>
            `;
        });
    }

    // --- Filtering Logic ---
    function filterAndRender() {
        const searchText = searchInput.value.toLowerCase();
        const currentData = dataMap[activeTab].data;
        const renderer = dataMap[activeTab].render;

        const filteredData = currentData.filter(app => {
            const searchableFields = Object.values(app).join(' ').toLowerCase();
            return searchableFields.includes(searchText);
        });

        renderer(filteredData);
    }
    
    // --- Global Action Handlers (Mock) ---
    window.handleApproval = (type, id, action) => {
        if(confirm(`Confirm action: ${action} application ID: ${id}?`)) {
            // MOCK: Remove item from array
            const userArray = dataMap[type].data;
            const index = userArray.findIndex(u => u.id === id);
            if (index > -1) {
                userArray.splice(index, 1);
            }
            
            filterAndRender();
            updateCounts();
            showToast(`${type.toUpperCase()} ${id} ${action} successfully.`, action === 'Approved' ? 'success' : 'danger');
        }
    };
    
    window.viewDocs = (id) => {
        alert(`Opening verification documents for application ID: ${id}`);
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
    
    // Initial render for the default 'provider' tab
    filterAndRender();

    // Logout Handler
    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("adminLoggedIn");
        window.location.href = "login-admin.html";
    });
});