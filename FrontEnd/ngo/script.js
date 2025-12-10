// Filter functionality
const filterChips = document.querySelectorAll('.filter-chip');
const cards = document.querySelectorAll('.card');
const searchInput = document.getElementById('search');

// Filter by category
filterChips.forEach(chip => {
  chip.addEventListener('click', () => {
    // Remove active class from all chips
    filterChips.forEach(c => c.classList.remove('active'));
    // Add active class to clicked chip
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
searchInput.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();

  cards.forEach(card => {
    const title = card.querySelector('.card-title').textContent.toLowerCase();
    const item = card.querySelector('.card-item').textContent.toLowerCase();
    const location = card.querySelector('.card-location').textContent.toLowerCase();

    if (title.includes(searchTerm) || item.includes(searchTerm) || location.includes(searchTerm)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
});

// Logout button
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    // Add logout logic here
    console.log('Logout clicked');
    // Example: window.location.href = 'login.html';
  });
}
