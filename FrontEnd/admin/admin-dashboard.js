// // ===== AUTH GUARD (Check if admin is logged in) =====
// if (!localStorage.getItem("authToken") || localStorage.getItem("userRole") !== "admin") {
//     window.location.href = "../login/login-consumer.html";
// }

const API_AUTH = 'http://localhost/wastenot-api/api';
const API_MARKETPLACE = 'http://localhost:8081/api';

document.addEventListener("DOMContentLoaded", () => {
    loadDashboardStats();
    loadRecentActivity();
    setupLogout();
});

// ===== LOAD DASHBOARD STATISTICS =====
async function loadDashboardStats() {
    try {
        const token = localStorage.getItem('authToken');
        
        // Get all users to count providers and NGOs
        const usersResponse = await fetch(`${API_AUTH}/users.php`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            const users = usersData.users || [];
            
            const providers = users.filter(u => u.role === 'partner').length;
            const ngos = users.filter(u => u.role === 'ngo').length;
            const pendingUsers = users.filter(u => u.status === 'pending').length;
            
            document.getElementById('statProviders').textContent = providers;
            document.getElementById('statNgos').textContent = ngos;
            document.getElementById('statPendingApprovals').textContent = pendingUsers;
        } else {
            // Fallback to mock data
            document.getElementById('statProviders').textContent = '--';
            document.getElementById('statNgos').textContent = '--';
            document.getElementById('statPendingApprovals').textContent = '--';
        }
        
        // Get active donations/products count
        const productsResponse = await fetch(`${API_MARKETPLACE}/products`);
        if (productsResponse.ok) {
            const productsData = await productsResponse.json();
            const activeProducts = productsData.data ? productsData.data.length : 0;
            document.getElementById('statActiveDonations').textContent = activeProducts;
        } else {
            document.getElementById('statActiveDonations').textContent = '--';
        }
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Show fallback values
        document.getElementById('statProviders').textContent = '--';
        document.getElementById('statNgos').textContent = '--';
        document.getElementById('statPendingApprovals').textContent = '--';
        document.getElementById('statActiveDonations').textContent = '--';
    }
}

// ===== LOAD RECENT ACTIVITY =====
async function loadRecentActivity() {
    const activityListContainer = document.getElementById('recentActivity');
    activityListContainer.innerHTML = '<p class="text-muted">Loading recent activity...</p>';
    
    try {
        const token = localStorage.getItem('authToken');
        
        // Try to get activity logs
        const response = await fetch(`${API_AUTH}/logs.php?limit=6`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            const activities = data.logs || [];
            
            activityListContainer.innerHTML = '';
            
            if (activities.length === 0) {
                activityListContainer.innerHTML = '<p class="text-muted">No recent activity</p>';
                return;
            }
            
            activities.forEach(activity => {
                const item = document.createElement('div');
                item.className = 'activity-item';
                
                let statusClass = 'status-info';
                if (activity.level === 'error') statusClass = 'status-danger';
                else if (activity.level === 'warning') statusClass = 'status-warning';
                else if (activity.level === 'success') statusClass = 'status-success';
                
                const timeAgo = formatTimeAgo(activity.created_at);
                
                item.innerHTML = `
                    <span class="${statusClass}">[${activity.level?.toUpperCase() || 'INFO'}]</span> 
                    ${activity.user_name || 'System'}: ${activity.message} 
                    <span class="text-muted float-right" style="font-size: 0.85rem;">(${timeAgo})</span>
                `;
                activityListContainer.appendChild(item);
            });
        } else {
            // Fallback: Show recent user registrations
            showFallbackActivity(activityListContainer);
        }
    } catch (error) {
        console.error('Error loading activity:', error);
        showFallbackActivity(activityListContainer);
    }
}

function showFallbackActivity(container) {
    container.innerHTML = `
        <div class="activity-item">
            <span class="status-info">[INFO]</span> 
            System: Dashboard loaded successfully
            <span class="text-muted float-right" style="font-size: 0.85rem;">(Just now)</span>
        </div>
    `;
}

function formatTimeAgo(timestamp) {
    if (!timestamp) return 'Recently';
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
}

// ===== LOGOUT HANDLER =====
function setupLogout() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "../login/login-consumer.html";
        });
    }
}