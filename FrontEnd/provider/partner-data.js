// === INVENTORY DATA (shared) ===
let partnerInventory = [
  {
    id: 1,
    name: "Mango Tapioca",
    qty: 3,
    productionDate: "2025-11-21",
    expiryDate: "2025-11-26"
  },
  {
    id: 2,
    name: "Asado Siopao",
    qty: 10,
    productionDate: "2025-11-21",
    expiryDate: "2025-11-26"
  },
  {
    id: 3,
    name: "Cookies",
    qty: 30,
    productionDate: "2025-11-21",
    expiryDate: "2025-11-26"
  },
  {
    id: 4,
    name: "Fruit Cup",
    qty: 15,
    productionDate: "2025-11-20",
    expiryDate: "2025-11-27"
  }
];

// === IMPACT CALCULATIONS ===
function getInventoryStats() {
  const today = new Date();
  let totalItems = 0;
  let nearExpiry = 0;

  partnerInventory.forEach(item => {
    totalItems += item.qty;
    const exp = new Date(item.expiryDate);
    const diff = (exp - today) / (1000 * 60 * 60 * 24);
    if (diff <= 3) nearExpiry += item.qty;
  });

  return {
    totalItems,
    nearExpiry,
    wasteReducedKg: (totalItems * 0.6).toFixed(1), // realistic estimate
    co2SavedKg: (totalItems * 0.75).toFixed(1)
  };
}