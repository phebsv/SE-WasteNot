// ===== AUTH GUARD (Check if admin is logged in) =====
if (localStorage.getItem("adminLoggedIn") !== "true") {
    window.location.href = "login-admin.html";
}

// --- MOCK LOG DATA ---
let allLogs = [
    { time: '2025-12-14 19:55:01', type: 'DANGER', user: 'Admin (System)', actor: 'System', action: 'Login Failure Alert', details: 'Failed login attempt detected from IP: 192.168.1.10.' },
    { time: '2025-12-14 19:50:30', type: 'SUCCESS', user: 'Admin', actor: 'Admin', action: 'Approved Application', details: 'Approved Provider application: Fresh Bakery Co. (PA005)' },
    { time: '2025-12-14 18:30:15', type: 'INFO', user: 'NGO_102', actor: 'NGO', action: 'Donation Request', details: 'Requested 10kg of produce from Provider (PR_022).' },
    { time: '2025-12-13 11:22:45', type: 'WARNING', user: 'Provider_001', actor: 'Provider', action: 'Listing Edited', details: 'Listing LST_302 price reduced from $5 to $2. (Near expiry).' },
    { time: '2025-12-13 10:05:10', type: 'SUCCESS', user: 'Customer_450', actor: 'Customer', action: 'Account Registration', details: 'New customer account created successfully.' },
    { time: '2025-12-12 15:40:00', type: 'INFO', user: 'Admin', actor: 'Admin', action: 'Settings Change', details: 'Updated Max Listing Duration to 48 hours.' },
    { time: '2025-12-12 09:10:20', type: 'DANGER', user: 'Provider_010', actor: 'Provider', action: 'Suspended Account', details: 'Provider (PR_010) account suspended due to repeated policy violations.' },
    { time: '2025-12-11 14:00:00', type: 'SYSTEM', user: 'System', actor: 'System', action: 'Cron Job', details: 'Daily data backup completed successfully.' },
    { time: '2025-12-11 12:30:00', type: 'WARNING', user: 'Provider_003', actor: 'Provider', action: 'Login Failure', details: '3 failed password attempts in 5 minutes.' },
    { time: '2025-12-10 17:00:00', type: 'SUCCESS', user: 'NGO_110', actor: 'NGO', action: 'Profile Update', details: 'Updated contact information.' },
];

const logsPerPage = 10;
let currentPage = 1;
let filteredLogs = [...allLogs]; // Working array

document.addEventListener("DOMContentLoaded", () => {
    
    // --- Element References ---
    const logsContainer = document.getElementById('logsContainer');
    const logSearch = document.getElementById('logSearch');
    const logTypeFilter = document.getElementById('logTypeFilter');
    const logActorFilter = document.getElementById('logActorFilter');
    const logDateFilter = document.getElementById('logDateFilter');
    const resetFiltersBtn = document.getElementById('resetFilters');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageInfoSpan = document.getElementById('pageInfo');
    const logoutBtn = document.getElementById('logoutBtn');

    // --- 1. Rendering Functions ---
    function renderLogs() {
        logsContainer.innerHTML = '';
        const startIndex = (currentPage - 1) * logsPerPage;
        const endIndex = startIndex + logsPerPage;
        const currentLogs = filteredLogs.slice(startIndex, endIndex);

        if (currentLogs.length === 0) {
            logsContainer.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px;">No matching activity logs found.</td></tr>`;
            updatePaginationControls(0);
            return;
        }

        currentLogs.forEach(log => {
            const row = logsContainer.insertRow();
            row.innerHTML = `
                <td>${log.time}</td>
                <td class="log-type ${log.type}">${log.type}</td>
                <td>${log.user}</td>
                <td>${log.action}</td>
                <td>${log.details}</td>
            `;
        });
        
        updatePaginationControls(filteredLogs.length);
    }
    
    function updatePaginationControls(totalLogs) {
        const totalPages = Math.ceil(totalLogs / logsPerPage);
        
        pageInfoSpan.textContent = `Page ${currentPage} of ${totalPages || 1}`;
        prevPageBtn.disabled = (currentPage === 1);
        nextPageBtn.disabled = (currentPage === totalPages || totalLogs === 0);
    }

    // --- 2. Filtering Logic ---
    function applyFilters() {
        const search = logSearch.value.toLowerCase();
        const type = logTypeFilter.value;
        const actor = logActorFilter.value;
        const date = logDateFilter.value; // YYYY-MM-DD

        filteredLogs = allLogs.filter(log => {
            // Search filter (User or Action or Details)
            const searchMatch = log.user.toLowerCase().includes(search) || 
                                log.action.toLowerCase().includes(search) ||
                                log.details.toLowerCase().includes(search);

            // Type filter
            const typeMatch = !type || log.type === type;
            
            // Actor filter
            const actorMatch = !actor || log.actor === actor;

            // Date filter
            const dateMatch = !date || log.time.startsWith(date);

            return searchMatch && typeMatch && actorMatch && dateMatch;
        });

        currentPage = 1;
        renderLogs();
    }
    
    function resetFilters() {
        logSearch.value = '';
        logTypeFilter.value = '';
        logActorFilter.value = '';
        logDateFilter.value = '';
        applyFilters();
    }

    // --- 3. Event Listeners ---
    logSearch.addEventListener('input', applyFilters);
    logTypeFilter.addEventListener('change', applyFilters);
    logActorFilter.addEventListener('change', applyFilters);
    logDateFilter.addEventListener('change', applyFilters);
    resetFiltersBtn.addEventListener('click', resetFilters);
    
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderLogs();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderLogs();
        }
    });

    // Initial Load and Logout
    renderLogs();
    
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("adminLoggedIn");
            window.location.href = "login-admin.html";
        });
    }
});