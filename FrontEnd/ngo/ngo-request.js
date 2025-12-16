// ===== AUTH GUARD =====
if (!localStorage.getItem("authToken") || localStorage.getItem("userRole") !== "ngo") {
    window.location.href = "../login/login-ngo.html";
}

// Parse URL params and populate the page
function getParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    company: params.get('company') || '',
    item: params.get('item') || '',
    qty: params.get('qty') || '',
    expiry: params.get('expiry') || '',
    pickup: params.get('pickup') || '',
    location: params.get('location') || '',
    tagged: params.get('tagged') || 'Urgent Donation'
  };
}

function safeDecode(v){ try{return decodeURIComponent(v);}catch(e){return v}}

document.addEventListener('DOMContentLoaded', () => {
  const p = getParams();
  let isEditMode = false;

  document.getElementById('reqItem').textContent = safeDecode(p.item) || safeDecode(p.company);
  document.getElementById('reqCategory').textContent = safeDecode(p.company);
  document.getElementById('reqExpiry').textContent = safeDecode(p.expiry) || '-';
  document.getElementById('reqPickup').textContent = safeDecode(p.pickup) || '-';
  document.getElementById('reqStore').textContent = safeDecode(p.location) || '-';
  document.getElementById('reqQty').textContent = (safeDecode(p.qty) ? safeDecode(p.qty) + ' Servings' : '-');
  document.getElementById('reqTagged').textContent = safeDecode(p.tagged);

  // logo heuristic: make filename from company (fallback to placeholder)
  const logoEl = document.getElementById('reqLogo');
  const logoFile = safeDecode(p.company).toLowerCase().replace(/[^a-z0-9]+/g,'-') + '-logo.jpg';
  logoEl.src = logoFile;
  logoEl.alt = p.company + ' logo';

  // Initialize input fields with current values
  function initializeInputs() {
    document.getElementById('editTagged').value = safeDecode(p.tagged) || 'Urgent Donation';
    document.getElementById('editExpiry').value = safeDecode(p.expiry) || '';
    document.getElementById('editPickup').value = safeDecode(p.pickup) || '';
    document.getElementById('editStore').value = safeDecode(p.location) || '';
    document.getElementById('editQty').value = safeDecode(p.qty) || '';
  }

  // Edit mode toggle
  document.getElementById('editToggleBtn').addEventListener('click', () => {
    if (!isEditMode) {
      isEditMode = true;
      initializeInputs();
      toggleEditMode(true);
    }
  });

  document.getElementById('cancelEditBtn').addEventListener('click', () => {
    isEditMode = false;
    toggleEditMode(false);
  });

  function toggleEditMode(enable) {
    const displayElements = document.querySelectorAll('#requestDetailsDisplay .value');
    const inputElements = document.querySelectorAll('[id^="edit"]');
    const editBtn = document.getElementById('editToggleBtn');
    const saveBtn = document.getElementById('saveChangesBtn');
    const cancelBtn = document.getElementById('cancelEditBtn');
    const confirmBtn = document.getElementById('confirmRequest');

    if (enable) {
      displayElements.forEach(el => el.style.display = 'none');
      inputElements.forEach(el => el.style.display = 'block');
      editBtn.style.display = 'none';
      saveBtn.style.display = 'block';
      cancelBtn.style.display = 'block';
      confirmBtn.style.display = 'none';
    } else {
      displayElements.forEach(el => el.style.display = 'block');
      inputElements.forEach(el => el.style.display = 'none');
      editBtn.style.display = 'block';
      saveBtn.style.display = 'none';
      cancelBtn.style.display = 'none';
      confirmBtn.style.display = 'block';
    }
  }

  // Save changes
  document.getElementById('saveChangesBtn').addEventListener('click', () => {
    const updates = {
      tagged: document.getElementById('editTagged').value,
      expiry: document.getElementById('editExpiry').value,
      pickup: document.getElementById('editPickup').value,
      location: document.getElementById('editStore').value,
      qty: document.getElementById('editQty').value
    };

    // Update display values
    document.getElementById('reqTagged').textContent = updates.tagged;
    document.getElementById('reqExpiry').textContent = updates.expiry || '-';
    document.getElementById('reqPickup').textContent = updates.pickup || '-';
    document.getElementById('reqStore').textContent = updates.location || '-';
    document.getElementById('reqQty').textContent = (updates.qty ? updates.qty : '-');

    // Update params for later use
    Object.assign(p, updates);

    isEditMode = false;
    toggleEditMode(false);

    // Show success message
    const msg = document.createElement('div');
    msg.textContent = '✓ Changes saved!';
    msg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #4CAF50; color: white; padding: 12px 18px; border-radius: 5px; z-index: 1000; font-weight: 600;';
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2500);
  });

  // confirm / directions actions
  document.getElementById('viewDirections').addEventListener('click', () => {
    // If you have a map route, navigate or open map. For now just open Google Maps search
    const q = encodeURIComponent(p.location || p.company);
    window.open('https://www.google.com/maps/search/' + q, '_blank');
  });

  const confirmBtn = document.getElementById('confirmRequest');
  let hasConfirmed = false;
  
  confirmBtn.addEventListener('click', () => {
    if (hasConfirmed) return; // Prevent duplicate submissions
    hasConfirmed = true;

    // Build request object
    const newRequest = {
      id: Date.now(),
      company: p.company || '',
      item: p.item || '',
      qty: p.qty || '',
      expiry: p.expiry || '',
      pickup: p.pickup || '',
      location: p.location || '',
      tagged: p.tagged || 'Urgent Donation',
      status: 'Pending Provider Confirmation',
      createdAt: new Date().toISOString()
    };

    // Save to localStorage (key: ngoRequests)
    const existing = JSON.parse(localStorage.getItem('ngoRequests') || '[]');
    existing.push(newRequest);
    localStorage.setItem('ngoRequests', JSON.stringify(existing));

    // SHOW TOAST (mirrors consumer claim flow)
    const toast = document.getElementById('toast');
    toast.classList.remove('hidden');
    toast.classList.add('show');

    // OK BUTTON HANDLER -> redirect to requests page
    document.getElementById('toastOkBtn').onclick = () => {
      toast.classList.remove('show');
      toast.classList.add('hidden');
      setTimeout(() => {
        window.location.href = 'ngo-claims.html';
      }, 250);
    };
  });

  // ---- COUNTDOWN TIMER (follow consumer product pattern) ----
  const timerEl = document.getElementById('reqTimer');
  let seconds = 24 * 60 * 60; // default 24 hours

  // If expiry param looks like a date string, try to compute remaining seconds
  if (p.expiry) {
    // attempt to parse expiry as a date (try multiple formats)
    let parsed = Date.parse(p.expiry);
    if (isNaN(parsed)) {
      // try adding a time and parsing as MM/DD/YYYY or DD/MM/YYYY fallback
      parsed = Date.parse(p.expiry + 'T23:59:59');
    }

    if (!isNaN(parsed)) {
      const diff = Math.floor((parsed - Date.now()) / 1000);
      if (diff > 0) seconds = diff;
    }
  }

  if (timerEl) {
    // initialize immediately
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
