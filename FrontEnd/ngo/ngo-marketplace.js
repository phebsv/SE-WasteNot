// FILTER FUNCTION
const filterChips = document.querySelectorAll('.filter-chip');
const cards = document.querySelectorAll('.card');
const searchInput = document.getElementById('search');

filterChips.forEach(chip => {
  chip.addEventListener('click', () => {
    filterChips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    const filterValue = chip.getAttribute('data-filter');

    // Show/hide cards based on filter
    cards.forEach(card => {
      if (filterValue === 'all') {
        card.style.display = 'flex';
      } else {
        const cardCategory = card.getAttribute('data-category');
        card.style.display = cardCategory === filterValue ? 'flex' : 'none';
      }
    });
  });
});

// Search functionality
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const activeFilter = document.querySelector('.filter-chip.active').getAttribute('data-filter');

    cards.forEach(card => {
      const title = card.querySelector('.card-title').textContent.toLowerCase();
      const item = card.querySelector('.card-item').textContent.toLowerCase();
      const location = card.querySelector('.card-location').textContent.toLowerCase();
      const cardCategory = card.getAttribute('data-category');

      const matchesSearch = title.includes(searchTerm) || item.includes(searchTerm) || location.includes(searchTerm);
      const matchesFilter = activeFilter === 'all' || cardCategory === activeFilter;

      card.style.display = (matchesSearch && matchesFilter) ? 'flex' : 'none';
    });
  });
}

// REQUEST BUTTON: navigate to separate request page with params
const requestBtns = document.querySelectorAll('.request-btn');
if (requestBtns) {
  requestBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    const data = btn.dataset;
    const params = new URLSearchParams();
    if (data.company) params.set('company', data.company);
    if (data.item) params.set('item', data.item);
    if (data.qty) params.set('qty', data.qty);
    if (data.expiry) params.set('expiry', data.expiry);
    if (data.pickup) params.set('pickup', data.pickup);
    if (data.location) params.set('location', data.location);
    if (data.tagged) params.set('tagged', data.tagged);

    window.location.href = 'ngo-request.html?' + params.toString();
  }));
}

// Logout button
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    console.log('Logout clicked');
  });
}