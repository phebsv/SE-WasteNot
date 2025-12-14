// ===== AUTH GUARD (Check if admin is logged in) =====
// if (localStorage.getItem("adminLoggedIn") !== "true") {
//     window.location.href = "login-admin.html";
// }

document.addEventListener("DOMContentLoaded", () => {
    
    // Mock Data for demonstration
    const mockStats = {
        totalProviders: 42,
        totalNgos: 28,
        pendingApprovals: 7, // Highlighting this one
        activeDonations: 155
    };

    const mockActivity = [
        { type: 'SUCCESS', user: 'AdminUser', action: 'Approved new NGO "Green Hands"', time: '2 mins ago' },
        { type: 'DANGER', user: 'System', action: 'Login attempt failed (IP: 192.168.1.1)', time: '10 mins ago' },
        { type: 'INFO', user: 'Provider XYZ', action: 'Submitted new listing: 50kg produce', time: '1 hour ago' },
        { type: 'WARNING', user: 'AdminUser', action: 'Maintenance mode disabled', time: '2 hours ago' },
        { type: 'INFO', user: 'NGO Hope', action: 'Claimed donation #4582', time: '3 hours ago' },
        { type: 'SUCCESS', user: 'AdminUser', action: 'Updated system settings', time: '5 hours ago' },
    ];

    // --- 1. Populate KPI Stats ---
    document.getElementById('statProviders').textContent = mockStats.totalProviders;
    document.getElementById('statNgos').textContent = mockStats.totalNgos;
    document.getElementById('statPendingApprovals').textContent = mockStats.pendingApprovals;
    document.getElementById('statActiveDonations').textContent = mockStats.activeDonations;

    // --- 2. Populate Recent Activity ---
    const activityListContainer = document.getElementById('recentActivity');
    activityListContainer.innerHTML = ''; // Clear 'Loading...' message

    mockActivity.forEach(activity => {
        let statusClass;
        switch (activity.type) {
            case 'SUCCESS':
                statusClass = 'status-success';
                break;
            case 'WARNING':
                statusClass = 'status-warning';
                break;
            case 'DANGER':
                statusClass = 'status-danger';
                break;
            default:
                statusClass = 'status-info';
        }

        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <span class="${statusClass}">[${activity.type}]</span> 
            ${activity.user}: ${activity.action} 
            <span class="text-muted float-right" style="font-size: 0.85rem;">(${activity.time})</span>
        `;
        activityListContainer.appendChild(item);
    });

    // --- 3. Handle Logout ---
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("adminLoggedIn");
            // Assuming adminSession storage exists
            // localStorage.removeItem("adminSession"); 
            window.location.href = "login-admin.html";
        });
    }
});