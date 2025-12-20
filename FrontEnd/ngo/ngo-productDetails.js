document.addEventListener('DOMContentLoaded', () => {
  // Get request ID from URL params
  const params = new URLSearchParams(window.location.search);
  const requestId = parseInt(params.get('id'));

  if (!requestId) {
    console.error('No request ID provided');
    document.querySelector('.details-section').innerHTML = '<p class="muted">Request not found.</p>';
    return;
  }

  // Retrieve request from localStorage
  const requests = JSON.parse(localStorage.getItem('ngoRequests') || '[]');
  const request = requests.find(r => r.id === requestId);

  if (!request) {
    document.querySelector('.details-section').innerHTML = '<p class="muted">Request not found.</p>';
    return;
  }

  // Map company to logo
  const logoMap = {
    'Jollibee': 'jollibee-logo.jpg',
    'SM Grocery': 'sm-logo.jpg',
    'McDonald\'s': 'mcdonalds-logo.jpg',
    'Noodle Haus': 'noodle-haus-logo.jpg'
  };

  // Populate page with request details
  document.getElementById('detailsLogo').src = logoMap[request.company] || 'placeholder-logo.jpg';
  document.getElementById('detailsItem').textContent = request.item;
  document.getElementById('detailsProvider').textContent = `Provider: ${request.company}`;
  
  // Set status badge styling
  const statusEl = document.getElementById('detailsStatus');
  statusEl.textContent = request.status;
  statusEl.classList.add(request.status.toLowerCase().replace(/\s+/g, ''));

  // Populate detail fields
  document.getElementById('detailItemName').textContent = request.item;
  document.getElementById('detailProvider').textContent = request.company;
  document.getElementById('detailQty').textContent = request.qty + ' Servings';
  document.getElementById('detailTagged').textContent = request.tagged;
  document.getElementById('detailExpiry').textContent = request.expiry || '-';
  document.getElementById('detailLocation').textContent = request.location;
  document.getElementById('detailPickup').textContent = request.pickup;
  document.getElementById('detailRequestStatus').textContent = request.status;
  document.getElementById('detailCreatedAt').textContent = new Date(request.createdAt).toLocaleString();

  // Back button
  document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = 'ngo-claims.html';
  });

  // Cancel request button
  document.getElementById('cancelRequestBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to cancel this request?')) {
      const updatedRequests = requests.map(r => 
        r.id === requestId ? { ...r, status: 'Cancelled' } : r
      );
      localStorage.setItem('ngoRequests', JSON.stringify(updatedRequests));
      window.location.href = 'ngo-claims.html';
    }
  });

  // Contact buttons (placeholder actions)
  document.getElementById('callBtn').addEventListener('click', () => {
    alert(`Calling ${request.company}...`);
  });

  document.getElementById('messageBtn').addEventListener('click', () => {
    alert(`Opening message with ${request.company}...`);
  });

  document.getElementById('directionsBtn').addEventListener('click', () => {
    // Map locations to real Google Maps links
    const locationMap = {
      'Jollibee Leon Kilat Cebu': 'https://www.google.com/maps/place/Jollibee/@10.29581,123.8914674,17z/data=!4m10!1m2!2m1!1sjollibee+leon+kilat+cebu!3m6!1s0x33a99bfd3080b643:0x8ba53349f0f7e84b!8m2!3d10.29581!4d123.896231!15sChhqb2xsaWJlZSBsZW9uIGtpbGF0IGNlYnUiA4gBAVoaIhhqb2xsaWJlZSBsZW9uIGtpbGF0IGNlYnWSARRmYXN0X2Zvb2RfcmVzdGF1cmFudOABAA!16s%2Fg%2F1pp2vkngm?entry=ttu&g_ep=EgoyMDI1MTIwNy4wIKXMDSoASAFQAw%3D%3D',
      'SM Grocery Cebu': 'https://www.google.com/maps/search/SM+Grocery+Cebu',
      'McDonald\'s Cebu': 'https://www.google.com/maps/search/McDonald\'s+Cebu',
      'Noodle Haus Cebu': 'https://www.google.com/maps/search/Noodle+Haus+Cebu'
    };
    
    const url = locationMap[request.location] || (request.location ? 'https://www.google.com/maps/search/' + encodeURIComponent(request.location) : 'https://www.google.com/maps/search/' + encodeURIComponent(request.company));
    window.open(url, '_blank');
  });

  // Countdown timer
  const timerEl = document.getElementById('expiryTimer');
  let seconds = 24 * 60 * 60; // default 24 hours

  if (request.expiry) {
    let parsed = Date.parse(request.expiry);
    if (isNaN(parsed)) {
      parsed = Date.parse(request.expiry + 'T23:59:59');
    }

    if (!isNaN(parsed)) {
      const diff = Math.floor((parsed - Date.now()) / 1000);
      if (diff > 0) seconds = diff;
    }
  }

  if (timerEl) {
    const updateTimer = () => {
      const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
      const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
      const s = String(seconds % 60).padStart(2, '0');
      timerEl.textContent = `${h}h ${m}m ${s}s`;
      if (seconds > 0) seconds--;
    };

    updateTimer();
    setInterval(updateTimer, 1000);
  }
});