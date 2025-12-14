// homepage.js

document.addEventListener("DOMContentLoaded", () => {

    const fadeInObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {

                    entry.target.classList.add("visible");

                    observer.unobserve(entry.target);
                }
            });
        },
        {

            threshold: 0.15,
        }
    );

    document.querySelectorAll(".fade-in").forEach((el) => {
        fadeInObserver.observe(el);
    });

    const header = document.querySelector('.navbar');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

});