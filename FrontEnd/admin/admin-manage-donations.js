// ===== AUTH GUARD (Check if admin is logged in) =====
// if (localStorage.getItem("adminLoggedIn") !== "true") {
//     window.location.href = "login-admin.html";
// }

// Mock Data
const mockDonations = [
    { id: 'D501', item: 'Organic Bread Loaves', provider: 'Bakery Delights', qty: '50 units', expiry: '2025-12-16', status: 'Active' },
    { id: 'D502', item: 'Canned Vegetables (Mix)', provider: 'MegaStore', qty: '300 cans', expiry: '2026-06-01', status: 'Claimed' },
    { id: 'D503', item: 'Fresh Produce Box', provider: 'Local Fresh Market', qty: '20 kg', expiry: '2025-12-14', status: 'Expired' },
];

const mockMarketplace = [
    { id: 'M701', product: 'Frozen Chicken Breasts', partner: 'Meat & Produce Co.', price: '$5.00/kg', expiry: '2025-12-20', status: 'Active' },
    { id: 'M702', product: 'Bulk Dairy Milk', partner: 'Dairy Farm Inc.', price: '$1.50/L', expiry: '2025-12-15', status: 'Sold' },
    { id: 'M703', product: 'Assorted Energy Drinks', partner: 'Beverage King', price: '$0.25/can', expiry: '2025-12-30', status: 'Active' },
];

// Map tab names to data arrays
const dataMap = {
    donations: { data: mockDonations, tbodyId: 'donationsTbody', render: renderDonations },
    marketplace: { data: mockMarketplace, tbodyId: 'marketplaceTbody', render: renderMarketplace },
};

let activeTab = 'donations'; // Default active tab

document.addEventListener("DOMContentLoaded", () => {
    
    const tabs = document.querySelectorAll('.tab-btn');
    const searchInput = document.getElementById('listingSearch');
    const statusFilter = document.getElementById('listingStatusFilter');

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

    // --- Utility Function to Create Action Buttons ---
    function createActions(id) {
        return `
            <button class="btn-primary btn-sm" onclick="editListing('${id}')">Edit</button>
            <button class="btn-sm btn-danger" onclick="removeListing('${id}')">Remove</button>
        `;
    }

    // --- Rendering Functions ---
    function renderDonations(data) {
        const tbody = document.getElementById('donationsTbody');
        tbody.innerHTML = '';
        data.forEach(d => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${d.id}</td>
                <td>${d.item}</td>
                <td>${d.provider}</td>
                <td>${d.qty}</td>
                <td>${d.expiry}</td>
                <td><span class="status-badge status-${d.status}">${d.status}</span></td>
                <td>${createActions(d.id)}</td>
            `;
        });
    }

    function renderMarketplace(data) {
        const tbody = document.getElementById('marketplaceTbody');
        tbody.innerHTML = '';
        data.forEach(m => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${m.id}</td>
                <td>${m.product}</td>
                <td>${m.partner}</td>
                <td>${m.price}</td>
                <td>${m.expiry}</td>
                <td><span class="status-badge status-${m.status.replace(/\s/g, '')}">${m.status}</span></td>
                <td>${createActions(m.id)}</td>
            `;
        });
    }

    // --- Filtering Logic ---
    function filterAndRender() {
        const searchText = searchInput.value.toLowerCase();
        const statusText = statusFilter.value;
        const currentData = dataMap[activeTab].data;
        const renderer = dataMap[activeTab].render;

        const filteredData = currentData.filter(listing => {
            // Filter 1: Status
            const matchesStatus = !statusText || listing.status === statusText;

            // Filter 2: Search (Item/Product name or Provider/Partner name)
            const matchesSearch = listing.item?.toLowerCase().includes(searchText) || 
                                  listing.product?.toLowerCase().includes(searchText) ||
                                  listing.provider?.toLowerCase().includes(searchText) ||
                                  listing.partner?.toLowerCase().includes(searchText);

            return matchesStatus && matchesSearch;
        });

        renderer(filteredData);
    }
    
    // --- Global Actions (Mock) ---
    window.editListing = (id) => {
        alert(`Navigating to edit listing ID: ${id}`);
    };

    window.removeListing = (id) => {
        if(confirm(`Are you sure you want to permanently remove listing ID: ${id}?`)) {
            // MOCK: Find and remove from array, then re-render
            const index = dataMap[activeTab].data.findIndex(l => l.id === id);
            if (index > -1) dataMap[activeTab].data.splice(index, 1);
            filterAndRender();
            showToast(`Listing ${id} has been removed.`, "danger");
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
    statusFilter.addEventListener('change', filterAndRender);
    
    // Initial render for the default 'donations' tab
    filterAndRender();

    // Logout Handler
    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("adminLoggedIn");
        window.location.href = "login-admin.html";
    });
});