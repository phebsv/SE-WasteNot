// ===== AUTH GUARD =====
if (!localStorage.getItem("authToken") || localStorage.getItem("userRole") !== "partner") {
  window.location.href = "../login/login-consumer.html";
}

const PRODUCTS_API = 'http://localhost:8081/api/products';

// Load partner's inventory from products
async function loadInventory() {
  try {
    const userId = localStorage.getItem('userId');
    console.log('Loading inventory for userId:', userId, 'Type:', typeof userId);
    const response = await fetch(PRODUCTS_API);
    if (response.ok) {
      const data = await response.json();
      console.log('API Response:', data);
      const allProducts = data.data || [];  // Extract data array from response
      console.log('All products from API:', allProducts);
      const filtered = allProducts.filter(p => {
        const matches = p.partnerId == userId;
        console.log(`Product ID ${p.id}: partnerId=${p.partnerId} (${typeof p.partnerId}), userId=${userId} (${typeof userId}), matches=${matches}`);
        return matches;
      });
      console.log('Filtered inventory:', filtered);
      return filtered;
    }
    return [];
  } catch (error) {
    console.error('Error loading inventory:', error);
    return [];
  }
}

let partnerInventory = [];

// Initialize inventory on load
document.addEventListener('DOMContentLoaded', async () => {
  partnerInventory = await loadInventory();
  
  // Setup logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.clear();
      window.location.href = '../login/login-consumer.html';
    });
  }
  
  // Setup avatar
  const avatarInitial = document.getElementById('avatarInitial');
  const userName = localStorage.getItem('userName');
  if (avatarInitial && userName) {
    avatarInitial.textContent = userName.charAt(0).toUpperCase();
  }
  
  renderInventory();
});

function daysUntilExpiry(date) {
  const today = new Date();
  const exp = new Date(date);
  return Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
}

function renderInventory() {
  const tbody = document.getElementById("inventoryBody");
  if (!tbody) return;
  
  tbody.innerHTML = "";

  if (partnerInventory.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No inventory items. Products are managed in Listings.</td></tr>';
    return;
  }

  partnerInventory.forEach(item => {
    const days = daysUntilExpiry(item.expiryDate);

    let rowClass = "";
    if (days <= 1) rowClass = "expiry-danger";
    else if (days <= 3) rowClass = "expiry-warning";

    tbody.innerHTML += `
      <tr class="${rowClass}">
        <td>${item.name}</td>
        <td>${item.quantity} ${item.unit || 'pcs'}</td>
        <td>${item.productionDate || 'N/A'}</td>
        <td>${item.expiryDate || 'N/A'}</td>
        <td>
          <span class="status-badge status-${item.available ? 'active' : 'inactive'}">${item.available ? 'Available' : 'Unavailable'}</span>
        </td>
      </tr>
    `;
  });
}

let editingId = null;

function openAddModal() {
  // Redirect to create listing page
  window.location.href = 'partner-add-item.html';
}

function openEditModal(id) {
  alert('Edit functionality: Products can be edited from the Listings page');
}

function saveInventory() {
  if (editingId) {
    const item = partnerInventory.find(i => i.id === editingId);
    item.name = itemName.value;
    item.qty = +itemQty.value;
    item.productionDate = itemProd.value;
    item.expiryDate = itemExp.value;
    showToast("Inventory updated");
  } else {
    partnerInventory.push({
      id: Date.now(),
      name: itemName.value,
      qty: +itemQty.value,
      productionDate: itemProd.value,
      expiryDate: itemExp.value
    });
    showToast("Inventory added");
  }

  closeModal();
  renderInventory();
}

function closeModal() {
  document.getElementById("inventoryModal").classList.remove("show");
}