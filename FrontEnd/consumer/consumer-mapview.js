// ===== AUTH GUARD: only logged-in consumers can view =====
if (localStorage.getItem("consumerLoggedIn") !== "true") {
  window.location.href = "login-consumer.html";
}

document.addEventListener("DOMContentLoaded", () => {
  // ==== Fake provider data ====
  const providers = [
    {
      id: 1,
      name: "EatSmart",
      distanceKm: 1.2,
      items: ["Rice meal box", "Veggie bowl"],
      rating: 4.6,
      hours: "10:00 AM – 8:00 PM"
    },
    {
      id: 2,
      name: "FreshLeaf Cafe",
      distanceKm: 2.5,
      items: ["Salad bowls", "Wraps"],
      rating: 4.8,
      hours: "9:00 AM – 7:00 PM"
    },
    {
      id: 3,
      name: "BreadTalk",
      distanceKm: 3.8,
      items: ["Assorted breads", "Pastries"],
      rating: 4.3,
      hours: "7:30 AM – 9:00 PM"
    },
    {
      id: 4,
      name: "Stop N Shop",
      distanceKm: 5.2,
      items: ["Packaged meals", "Snacks"],
      rating: 4.1,
      hours: "24 hours"
    }
  ];

  const mapCard = document.querySelector(".map-card");
  const pins = document.querySelectorAll(".pin");
  const popup = document.getElementById("popup");
  const popupName = document.getElementById("popupName");
  const popupDistance = document.getElementById("popupDistance");
  const viewDetailsBtn = document.getElementById("viewDetailsBtn");
  const searchInput = document.getElementById("searchInput");
  const filterBtn = document.getElementById("filterBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  let currentFilter = "all"; // all | near | medium

  // ===== Logout =====
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("consumerLoggedIn");
      localStorage.removeItem("consumerName");
      localStorage.removeItem("consumerEmail");
      window.location.href = "login-consumer.html";
    });
  }

  // ===== Helper: Get provider by ID =====
  function getProviderById(id) {
    return providers.find((p) => p.id === Number(id));
  }

  // ===== Handle pin click =====
  pins.forEach((pin) => {
    pin.addEventListener("click", (e) => {
      const id = pin.dataset.id;
      const provider = getProviderById(id);
      if (!provider) return;

      // Fill popup content
      popupName.textContent = provider.name;
      popupDistance.innerHTML =
        `<strong>${provider.distanceKm.toFixed(1)} km away</strong><br>` +
        `Items: ${provider.items.join(", ")}<br>` +
        `Rating: ⭐ ${provider.rating} · Hours: ${provider.hours}`;

      // Position popup near the pin
      const mapRect = mapCard.getBoundingClientRect();
      const pinRect = pin.getBoundingClientRect();

      const offsetX = pinRect.left - mapRect.left;
      const offsetY = pinRect.top - mapRect.top;

      popup.style.left = `${offsetX + 20}px`;
      popup.style.top = `${offsetY - 10}px`;

      popup.classList.remove("hidden");

      // Simple "view details" behavior
      viewDetailsBtn.onclick = () => {
        alert(
          `${provider.name}\n` +
          `Distance: ${provider.distanceKm.toFixed(1)} km\n` +
          `Items: ${provider.items.join(", ")}\n` +
          `Hours: ${provider.hours}\n\n` +
          "(In a full system, this would open the provider listing page.)"
        );
      };

      e.stopPropagation();
    });
  });

  // Hide popup when clicking elsewhere on the map
  mapCard.addEventListener("click", (e) => {
    if (!e.target.classList.contains("pin")) {
      popup.classList.add("hidden");
    }
  });

  // ===== Search filter (by name or items) =====
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase().trim();

    pins.forEach((pin) => {
      const provider = getProviderById(pin.dataset.id);
      if (!provider) return;

      const haystack =
        provider.name.toLowerCase() +
        " " +
        provider.items.join(" ").toLowerCase();

      if (haystack.includes(q)) {
        pin.style.display = "";
      } else {
        pin.style.display = "none";
      }
    });

    popup.classList.add("hidden");
  });

  // ===== Distance filter button =====
  filterBtn.addEventListener("click", () => {
    if (currentFilter === "all") {
      currentFilter = "near"; // <= 2km
      filterBtn.textContent = "Showing: ≤ 2 km ⚙️";
    } else if (currentFilter === "near") {
      currentFilter = "medium"; // <= 4km
      filterBtn.textContent = "Showing: ≤ 4 km ⚙️";
    } else {
      currentFilter = "all";
      filterBtn.textContent = "Filter the distance ⚙️";
    }

    applyDistanceFilter();
    popup.classList.add("hidden");
  });

  function applyDistanceFilter() {
    pins.forEach((pin) => {
      const provider = getProviderById(pin.dataset.id);
      if (!provider) return;

      let show = true;
      if (currentFilter === "near") {
        show = provider.distanceKm <= 2;
      } else if (currentFilter === "medium") {
        show = provider.distanceKm <= 4;
      }
      pin.style.display = show ? "" : "none";
    });
  }
});