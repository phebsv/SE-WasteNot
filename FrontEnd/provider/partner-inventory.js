function daysUntilExpiry(date) {
  const today = new Date();
  const exp = new Date(date);
  return Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
}

function renderInventory() {
  const tbody = document.getElementById("inventoryBody");
  tbody.innerHTML = "";

  partnerInventory.forEach(item => {
    const days = daysUntilExpiry(item.expiryDate);

    let rowClass = "";
    if (days <= 1) rowClass = "expiry-danger";
    else if (days <= 3) rowClass = "expiry-warning";

    tbody.innerHTML += `
      <tr class="${rowClass}">
        <td>${item.name}</td>
        <td>${item.qty}</td>
        <td>${item.productionDate}</td>
        <td>${item.expiryDate}</td>
        <td>
          <button class="edit-btn" onclick="openEditModal(${item.id})">Edit</button>
        </td>
      </tr>
    `;
  });
}

renderInventory();

let editingId = null;

function openAddModal() {
  editingId = null;
  document.getElementById("modalTitle").innerText = "Add Inventory";
  document.getElementById("inventoryModal").classList.add("show");
}

function openEditModal(id) {
  const item = partnerInventory.find(i => i.id === id);
  editingId = id;

  itemName.value = item.name;
  itemQty.value = item.qty;
  itemProd.value = item.productionDate;
  itemExp.value = item.expiryDate;

  document.getElementById("modalTitle").innerText = "Edit Inventory";
  document.getElementById("inventoryModal").classList.add("show");
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