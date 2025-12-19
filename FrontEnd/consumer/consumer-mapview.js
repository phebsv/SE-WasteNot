// ===== AUTH GUARD: only logged-in consumers can view =====
if (localStorage.getItem("consumerLoggedIn") !== "true") {
  window.location.href = "../login/login-consumer.html";
}

// Backend API Configuration
const API_URL = "http://localhost:8080/api";

// User's current location
let userLocation = {
  latitude: 14.599512,
  longitude: 120.984222,
  name: "Manila, Philippines"
};

let map;
let userMarker;
let providerMarkers = [];
let providers = [];
let currentRadius = 10;

document.addEventListener("DOMContentLoaded", () => {
  // Get user's real location - with continuous tracking
  if (navigator.geolocation) {
    // First get position immediately
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Location acquired:', position.coords);
        userLocation.latitude = position.coords.latitude;
        userLocation.longitude = position.coords.longitude;
        initializeMap();
        loadNearbyProviders();
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        console.log('Using default location (Manila)');
        initializeMap();
        loadNearbyProviders();
      },
      { 
        enableHighAccuracy: true,  // Use GPS if available
        timeout: 15000,             // Wait up to 15 seconds
        maximumAge: 0               // Don't use cached location
      }
    );

    // Then watch for continuous updates
    navigator.geolocation.watchPosition(
      (position) => {
        userLocation.latitude = position.coords.latitude;
        userLocation.longitude = position.coords.longitude;
        console.log('Location updated:', position.coords);
        
        // Update map view if it exists
        if (map && userMarker) {
          const newLatLng = [position.coords.latitude, position.coords.longitude];
          userMarker.setLatLng(newLatLng);
          map.panTo(newLatLng);
          document.getElementById('currentLocation').textContent = 
            `📍 Your Location: (${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}) - Accuracy: ±${position.coords.accuracy.toFixed(0)}m`;
        }
      },
      (error) => {
        console.warn('Watch position error:', error.message);
      },
      { 
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  } else {
    console.log('Geolocation not supported, using default');
    initializeMap();
    loadNearbyProviders();
  }

  // Initialize Leaflet Map
  function initializeMap() {
    map = L.map('map', {
      zoomControl: true,
      attributionControl: true
    }).setView(
      [userLocation.latitude, userLocation.longitude], 
      14
    );

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      minZoom: 2
    }).addTo(map);

    // Add user location marker (blue with better styling)
    const userIcon = L.icon({
      iconUrl: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="%234169E1"><circle cx="16" cy="16" r="10"/><circle cx="16" cy="16" r="6" fill="white"/></svg>',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });

    userMarker = L.marker(
      [userLocation.latitude, userLocation.longitude],
      { 
        icon: userIcon, 
        title: 'Your Location',
        zIndexOffset: 1000
      }
    ).addTo(map);

    userMarker.bindPopup('<b>📍 Your Location</b><br><small>You are here</small>');

    // Add accuracy circle if available (shows uncertainty range)
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const accuracy = position.coords.accuracy;
          if (accuracy < 100) {
            L.circle(
              [position.coords.latitude, position.coords.longitude],
              accuracy,
              {
                color: '#4169E1',
                fillColor: '#87CEEB',
                fillOpacity: 0.1,
                weight: 2,
                dashArray: '5, 5'
              }
            ).addTo(map);
          }
        }
      );
    }

    // Update location text with more details
    document.getElementById('currentLocation').textContent = 
      `📍 Your Location: (${userLocation.latitude.toFixed(5)}, ${userLocation.longitude.toFixed(5)})`;
  }

  // Fetch nearby providers from backend
  async function loadNearbyProviders() {
    try {
      const response = await fetch(
        `${API_URL}/nearby-providers?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&radius=${currentRadius}`
      );
      const data = await response.json();
      
      if (data.success && data.data) {
        providers = data.data.map((provider) => ({
          id: provider.providerId,
          name: provider.name || 'Provider',
          latitude: provider.latitude,
          longitude: provider.longitude,
          distance: Math.round(provider.distanceKm * 10) / 10,
          address: provider.address || 'No address provided',
          rating: 4.5,
          hours: '9:00 AM - 6:00 PM'
        }));
        updateProviderMarkers();
      } else {
        console.error('Failed to load providers');
        showError('Failed to load providers from backend.');
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      showError('Could not connect to location service. Please ensure backend is running on port 8080.');
    }
  }

  function updateProviderMarkers() {
    // Clear existing markers
    providerMarkers.forEach(marker => map.removeLayer(marker));
    providerMarkers = [];

    // Add new markers for each provider
    providers.forEach((provider, index) => {
      // Create custom green numbered marker
      const markerHtml = `
        <div style="
          background: #15803d;
          color: white;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">${index + 1}</div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
      });

      const marker = L.marker(
        [parseFloat(provider.latitude), parseFloat(provider.longitude)],
        { icon: customIcon, title: provider.name }
      ).addTo(map);

      marker.on('click', () => showProviderInfo(provider));
      providerMarkers.push(marker);
    });

    if (providers.length === 0) {
      showError('No providers found within ' + currentRadius + ' km');
    }
  }

  function showProviderInfo(provider) {
    document.getElementById('providerName').textContent = provider.name;
    document.getElementById('providerDistance').textContent = `Distance: ${provider.distance} km`;
    document.getElementById('providerAddress').textContent = provider.address;
    document.getElementById('providerRating').textContent = `⭐ ${provider.rating}`;
    document.getElementById('providerHours').textContent = `🕐 ${provider.hours}`;
    
    const infoPanel = document.getElementById('providerInfo');
    infoPanel.classList.remove('hidden');

    // Update button actions
    document.getElementById('viewDetailsBtn').onclick = () => {
      // Try Google Maps first (more reliable)
      const googleMapsUrl = `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${provider.latitude},${provider.longitude}`;
      window.open(googleMapsUrl, '_blank');
    };

    document.getElementById('contactBtn').onclick = () => {
      alert(`Contacting ${provider.name}...\\nIn a real app, this would open a messaging interface.`);
    };
  }

  // Close provider info
  document.getElementById('closeProviderBtn').addEventListener('click', () => {
    document.getElementById('providerInfo').classList.add('hidden');
  });

  // Radius slider
  document.getElementById('radiusSlider').addEventListener('change', (e) => {
    currentRadius = e.target.value;
    document.getElementById('radiusValue').textContent = currentRadius;
    loadNearbyProviders();
  });

  // Recenter button with smooth animation
  document.getElementById('recenterBtn').addEventListener('click', () => {
    map.flyTo([userLocation.latitude, userLocation.longitude], 14, {
      duration: 1.5  // Smooth 1.5 second animation
    });
  });

  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'background: #fee; color: #c00; padding: 15px; margin: 10px; border-radius: 8px; text-align: center; font-weight: 600;';
    errorDiv.textContent = '⚠️ ' + message;
    document.querySelector('.main').insertBefore(errorDiv, document.querySelector('.main').firstChild);
    setTimeout(() => errorDiv.remove(), 5000);
  }

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
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
      'ngoLoggedIn',
      'adminLoggedIn'
    ].forEach(k => localStorage.removeItem(k));
    sessionStorage.clear();
    window.location.href = '../login/login-consumer.html';
  });
});
