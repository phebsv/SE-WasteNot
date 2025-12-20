// SAMPLE AGGREGATES – replace with real derived data
const weeklyWaste = [4, 10, 5, 2];
const categories = {
  "Bread / Pastry": 48.4,
  "Prepared Meals": 32.3,
  "Drinks": 19.3
};

// Waste Bar
new Chart(document.getElementById("wasteBar"), {
  type: "bar",
  data: {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [{
      data: weeklyWaste,
      backgroundColor: "#1b7d2a"
    }]
  }
});

// Category Pie
new Chart(document.getElementById("categoryPie"), {
  type: "pie",
  data: {
    labels: Object.keys(categories),
    datasets: [{
      data: Object.values(categories),
      backgroundColor: ["#1b7d2a", "#7fbf7f", "#bfe0b8"]
    }]
  }
});

// Sales
new Chart(document.getElementById("salesLine"), {
  type: "line",
  data: {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [{
      data: [300, 1000, 500, 200],
      borderColor: "#1b7d2a"
    }]
  }
});

// Donations
new Chart(document.getElementById("donationBar"), {
  type: "bar",
  data: {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [{
      data: [5, 15, 8, 4],
      backgroundColor: "#7fbf7f"
    }]
  }
});

const stats = getInventoryStats();

document.getElementById("totalItemsSold").innerText = stats.totalItems;
document.getElementById("wasteKg").innerText = `${stats.wasteReducedKg} kg`;
document.getElementById("co2Saved").innerText = `${stats.co2SavedKg} kg`;

