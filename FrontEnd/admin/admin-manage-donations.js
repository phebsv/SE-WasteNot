// ===== AUTH GUARD =====
if (!localStorage.getItem("authToken") || localStorage.getItem("userRole") !== "admin") {
    window.location.href = "../login/login-consumer.html";
}

const PRODUCTS_API = 'http://localhost:8081/api/products';

let allProducts = [];
let activeTab = 'donations'; // Default active tab

// ===== LOAD PRODUCTS FROM BACKEND =====
async function loadProducts() {
    try {
        const response = await fetch(PRODUCTS_API);
        
        if (response.ok) {
            const data = await response.json();
            
            // Spring Boot API returns { success, data: [...] }
            if (Array.isArray(data)) {
                return data;
            }
            const products = Array.isArray(data?.data) ? data.data : [];
            return products;
        }
        return [];
    } catch (error) {
        console.error('Error loading products:', error);
        return [];
    }
}

// ===== DELETE PRODUCT =====
async function deleteProduct(productId) {
    try {
        const response = await fetch(`${PRODUCTS_API}/${productId}`, {
            method: 'DELETE'
        });
        return response.ok;
    } catch (error) {
        console.error('Error deleting product:', error);
        return false;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    
    // Load products from backend
    allProducts = await loadProducts();
    
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
        const donations = data.filter(p => p.type === 'donation');
        if (donations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">No donations found</td></tr>';
            return;
        }
        donations.forEach(d => {
            const row = tbody.insertRow();
            const status = d.available ? 'Active' : 'Claimed';
            row.innerHTML = `
                <td>${d.id}</td>
                <td>${d.name}</td>
                <td>${d.partnerName || 'N/A'}</td>
                <td>${d.quantity} ${d.unit || ''}</td>
                <td>${new Date(d.expiryDate).toLocaleDateString()}</td>
                <td><span class="status-badge status-${status}">${status}</span></td>
                <td>${createActions(d.id)}</td>
            `;
        });
    }

    function renderMarketplace(data) {
        const tbody = document.getElementById('marketplaceTbody');
        tbody.innerHTML = '';
        
        // All products from Spring Boot are marketplace products (not donations)
        const marketplace = data; // No filtering by type since Spring Boot API returns all marketplace products
        
        if (marketplace.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">No marketplace items found</td></tr>';
            return;
        }
        
        marketplace.forEach(m => {
            const row = tbody.insertRow();
            const status = m.status === 'ACTIVE' ? 'Active' : 'Inactive';
            const expiryDisplay = m.expiryDisplay || m.expiryDate || 'N/A';
            
            row.innerHTML = `
                <td>${m.id}</td>
                <td>${m.name}</td>
                <td>${m.partnerName || 'N/A'}</td>
                <td>₱${m.price || 0}</td>
                <td>${expiryDisplay}</td>
                <td><span class="status-badge status-${status.toLowerCase()}">${status}</span></td>
                <td>${createActions(m.id)}</td>
            `;
        });
    }

    // --- Filtering Logic ---
    function filterAndRender() {
        const searchText = searchInput.value.toLowerCase();
        const statusText = statusFilter.value;
        const renderer = activeTab === 'donations' ? renderDonations : renderMarketplace;

        let filteredData;
        
        if (activeTab === 'donations') {
            // For donations tab, filter by type (if type field exists)
            filteredData = allProducts.filter(listing => {
                const typeMatch = listing.type === 'donation';
                const listingStatus = listing.available ? 'Active' : 'Claimed';
                const matchesStatus = !statusText || listingStatus === statusText;
                const matchesSearch = (listing.name || '').toLowerCase().includes(searchText) || 
                                      (listing.partnerName || '').toLowerCase().includes(searchText);
                return typeMatch && matchesStatus && matchesSearch;
            });
        } else {
            // For marketplace tab, use all products from Spring Boot API
            filteredData = allProducts.filter(listing => {
                const listingStatus = listing.status === 'ACTIVE' ? 'Active' : 'Inactive';
                const matchesStatus = !statusText || listingStatus === statusText;
                const matchesSearch = (listing.name || '').toLowerCase().includes(searchText) || 
                                      (listing.partnerName || '').toLowerCase().includes(searchText);
                return matchesStatus && matchesSearch;
            });
        }

        renderer(filteredData);
    }
    
    // --- Global Actions ---
    window.editListing = (id) => {
        const product = allProducts.find(p => p.id === id);
        if (product) {
            alert(`Edit Product:\n\nID: ${product.id}\nName: ${product.name}\nPrice: ₱${product.price}\nQuantity: ${product.quantity}\nExpiry: ${new Date(product.expiryDate).toLocaleDateString()}\n\nNote: Edit functionality can be implemented with a modal form`);
        }
    };

    window.removeListing = async (id) => {
        if(confirm(`Are you sure you want to permanently remove this listing?`)) {
            const success = await deleteProduct(id);
            if (success) {
                showToast(`Listing removed successfully`, "success");
                allProducts = await loadProducts();
                filterAndRender();
            } else {
                showToast(`Failed to remove listing`, "danger");
            }
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
    
    // Initial render
    filterAndRender();
    
    // Logout Handler
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "../login/login-consumer.html";
    });
});