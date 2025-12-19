// ===== AUTH GUARD =====
if (!localStorage.getItem("authToken") || localStorage.getItem("userRole") !== "ngo") {
    window.location.href = "../login/login-ngo.html";
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('claimsContainer');
  const filterChips = document.querySelectorAll('.filter-chip');
  let requests = JSON.parse(localStorage.getItem('ngoRequests') || '[]');

  // Map company to logo filename
  const logoMap = {
    'Jollibee': 'jollibee-logo.jpg',
    'SM Grocery': 'sm-logo.jpg',
    'McDonald\'s': 'mcdonalds-logo.jpg',
    'Noodle Haus': 'noodle-haus-logo.jpg'
  };

  function renderRequests(filterStatus = 'all') {
    if (!requests.length) {
      container.innerHTML = '<p style="grid-column:1/-1;color:var(--muted)">No requests yet.</p>';
      return;
    }

    let filtered = requests;
    
    if (filterStatus !== 'all') {
      filtered = requests.filter(r => {
        const status = r.status || 'Pending Provider Confirmation';
        return status === filterStatus;
      });
    }

    if (!filtered.length) {
      container.innerHTML = '<p style="grid-column:1/-1;color:var(--muted)">No requests with this status.</p>';
      return;
    }

    const html = filtered.map(r => {
      const status = r.status || 'Pending Provider Confirmation';
      const statusClass = status.toLowerCase().replace(/ /g, '-');
      return `
      <div class="claim-item">
        <div class="claim-header">
          <div>
            <div class="claim-id">Request #${r.id || 'N/A'}</div>
            <div class="claim-date">${r.date || 'Recent request'}</div>
          </div>
          <span class="status-badge ${statusClass}">${status}</span>
        </div>
        
        <div class="claim-body">
          <div class="product-section">
            <div class="claim-logo">
              <img src="${logoMap[r.company] || 'placeholder-logo.jpg'}" alt="${r.company}" />
            </div>
            <div class="product-details">
              <div class="claim-title">${r.item}</div>
              <div class="claim-provider"><i class="fas fa-store"></i> ${r.company}</div>
              <div class="claim-meta"><i class="fas fa-box"></i> Quantity: ${r.qty}</div>
            </div>
          </div>
          
          <div class="details-grid">
            <div class="detail-item">
              <h5><i class="fas fa-map-marker-alt"></i> Pickup Location</h5>
              <p>${r.location || r.company + ' Store'}</p>
            </div>
            
            <div class="detail-item">
              <h5><i class="fas fa-calendar"></i> Pickup Date</h5>
              <p>${r.pickup}</p>
            </div>
            
            <div class="detail-item">
              <h5><i class="fas fa-credit-card"></i> Payment Method</h5>
              <p>${r.paymentMethod || 'Donation (Free)'}</p>
            </div>
            
            <div class="detail-item">
              <h5><i class="fas fa-info-circle"></i> Status</h5>
              <p><span class="payment-status ${statusClass}">${status}</span></p>
            </div>
            
            ${r.notes ? `
            <div class="detail-item full-width">
              <h5><i class="fas fa-sticky-note"></i> Notes</h5>
              <p>${r.notes}</p>
            </div>
            ` : ''}
          </div>
        </div>
        
        <div class="claim-actions">
          ${status !== 'Cancelled' && status !== 'Completed' ? `
            <button class="btn-action btn-cancel" data-id="${r.id}">
              <i class="fas fa-times"></i> Cancel Request
            </button>
          ` : ''}
          ${status === 'Ready for Pickup' ? `
            <button class="btn-action btn-complete" data-id="${r.id}">
              <i class="fas fa-check-circle"></i> Mark as Complete
            </button>
          ` : ''}
        </div>
      </div>
    `;
    }).join('');

    container.innerHTML = html;

    // Add event listeners to buttons
    container.querySelectorAll('.btn-cancel').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.closest('button').getAttribute('data-id');
        if (confirm('Are you sure you want to cancel this request?')) {
          const updatedRequests = requests.map(r => 
            r.id === parseInt(id) ? { ...r, status: 'Cancelled' } : r
          );
          localStorage.setItem('ngoRequests', JSON.stringify(updatedRequests));
          requests = updatedRequests;
          renderRequests(filterStatus);
          alert('Request cancelled successfully');
        }
      });
    });
    
    container.querySelectorAll('.btn-complete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.closest('button').getAttribute('data-id');
        if (confirm('Mark this request as complete?')) {
          const updatedRequests = requests.map(r => 
            r.id === parseInt(id) ? { 
              ...r, 
              status: 'Completed',
              completedDate: new Date().toISOString(),
              paymentStatus: 'Completed'
            } : r
          );
          localStorage.setItem('ngoRequests', JSON.stringify(updatedRequests));
          requests = updatedRequests;
          renderRequests(filterStatus);
          alert('Request marked as complete! Thank you for using WasteNot.');
        }
      });
    });
  }

  // Initial render
  renderRequests('Pending Provider Confirmation');

  // Filter chip click handlers
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const status = chip.getAttribute('data-status');
      renderRequests(status);
    });
  });

  // Logout button
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
        'ngoLoggedIn',
        'adminLoggedIn'
      ].forEach(k => localStorage.removeItem(k));
      sessionStorage.clear();
      window.location.href = "../login/login-ngo.html";
    });
  }
});
