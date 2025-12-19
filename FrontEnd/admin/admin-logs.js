// ===== AUTH GUARD =====
if (!localStorage.getItem("authToken") || localStorage.getItem("userRole") !== "admin") {
    window.location.href = "../login/login-consumer.html";
}

const API_URL = 'http://localhost/wastenot-api/api/logs.php';

let allLogs = [];
const logsPerPage = 10;
let currentPage = 1;
let filteredLogs = [];

// ===== LOAD LOGS FROM BACKEND =====
async function loadLogs(limit = 100, offset = 0) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}?limit=${limit}&offset=${offset}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.logs || [];
        }
        return [];
    } catch (error) {
        console.error('Error loading logs:', error);
        return [];
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    
    // Load logs from backend
    allLogs = await loadLogs(200);
    filteredLogs = [...allLogs];
    
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
            const timestamp = new Date(log.timestamp).toLocaleString();
            const logType = (log.level || 'INFO').toUpperCase();
            row.innerHTML = `
                <td>${timestamp}</td>
                <td class="log-type ${logType}">${logType}</td>
                <td>User #${log.user_id || 'System'}</td>
                <td>${log.action}</td>
                <td>${log.message}</td>
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
        const date = logDateFilter.value; // YYYY-MM-DD

        filteredLogs = allLogs.filter(log => {
            // Search filter (Action or Message)
            const searchMatch = (log.action || '').toLowerCase().includes(search) || 
                                (log.message || '').toLowerCase().includes(search) ||
                                (log.user_id || '').toString().includes(search);

            // Type filter
            const logLevel = (log.level || 'INFO').toUpperCase();
            const typeMatch = !type || logLevel === type;

            // Date filter (check if timestamp starts with the date)
            const dateMatch = !date || log.timestamp.startsWith(date);

            return searchMatch && typeMatch && dateMatch;
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
    }
});