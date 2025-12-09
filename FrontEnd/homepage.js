const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        // once visible, we can stop observing
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,
  }
);

document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));