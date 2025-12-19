// ===== AUTH GUARD =====
if (!localStorage.getItem("authToken") || localStorage.getItem("userRole") !== "partner") {
  window.location.href = "../login/login-partner.html";
}

const PRODUCTS_API = 'http://localhost:8081/api/products';

function unwrapData(payload) {
  if (payload && typeof payload === 'object' && Array.isArray(payload.data)) return payload.data;
  return Array.isArray(payload) ? payload : [];
}

function parseProductionDate(item) {
  if (item?.productionDate) return item.productionDate;
  const desc = String(item?.description || '');
  const m = desc.match(/Production\s*Date:\s*(\d{4}-\d{2}-\d{2})/i);
  return m ? m[1] : null;
}

function isExpired(expiryDate) {
  if (!expiryDate) return false;
  const d = new Date(expiryDate);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() < Date.now();
}

function computeInventoryStatus(item) {
  const status = String(item?.status || 'ACTIVE').toUpperCase();
  const qty = Number(item?.quantity ?? 0);

  if (status !== 'ACTIVE') return { label: 'Unavailable', tone: 'inactive' };
  if (!Number.isFinite(qty) || qty <= 0) return { label: 'Unavailable', tone: 'inactive' };
  if (isExpired(item?.expiryDate)) return { label: 'Unavailable', tone: 'inactive' };
  return { label: 'Available', tone: 'active' };
}

// Load partner's inventory from products
async function loadInventory() {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) return [];

    // Prefer server-side filtering.
    const partnerRes = await fetch(`${PRODUCTS_API}/partner/${encodeURIComponent(userId)}`);
    if (partnerRes.ok) {
      const payload = await partnerRes.json();
      const data = unwrapData(payload);
      return data;
    }

    // Fallback: load all active products and filter by partnerId client-side.
    const response = await fetch(PRODUCTS_API);
    if (!response.ok) return [];
    const payload = await response.json();
    const allProducts = unwrapData(payload);
    return allProducts.filter(p => String(p?.partnerId) === String(userId));
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
      // Clear only auth/session flags; keep cached profile + app data.
      [
        'authToken',
        'userId',
        'userRole',
        'userName',
        'userEmail',
        'ngoName',
        'consumerLoggedIn',
        'partnerLoggedIn',
        'providerLoggedIn',
        'ngoLoggedIn',
        'adminLoggedIn'
      ].forEach(k => localStorage.removeItem(k));
      sessionStorage.clear();
      window.location.href = '../login/login-partner.html';
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
        <td>${parseProductionDate(item) || 'N/A'}</td>
        <td>${item.expiryDate || item.expiryDisplay || 'N/A'}</td>
        <td>
          ${(() => {
            const s = computeInventoryStatus(item);
            return `<span class="status-badge status-${s.tone}">${s.label}</span>`;
          })()}
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