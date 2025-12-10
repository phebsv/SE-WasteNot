// FILTER FUNCTION
const filterButtons = document.querySelectorAll(".filter-btn");
const cards = document.querySelectorAll(".card");

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;

    cards.forEach(card => {
      if (filter === "all" || card.dataset.category.includes(filter)) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
});

// REQUEST BUTTON ACTION
function goRequest() {
  window.location.href = "request.html"; 
}
