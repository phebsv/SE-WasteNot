// homepage.js

// 1. Setup the Intersection Observer (Fade-in on scroll)
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        // Stop observing once the animation triggers
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,
  }
);

// 2. Select the elements
const storeName = document.getElementById("storeName");
// The element with ID "register-btn" is the "Open in Google Maps" button in your HTML.
const registerBtn = document.getElementById("register-btn"); 

// 3. Set the HREF for the "Open in Google Maps" button (linking to the Google Form)
if (storeName && registerBtn) {
  // Use the long URL from your initial code snippet for the partner form
  const PARTNER_FORM_BASE_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeQTKLas-6mTJ6C1KARWmyzpnE_lGrYusl3at8vjMgyYTtC1g/viewform";
  
  // !!! CRITICAL: REPLACE '1234567890' with the actual Entry ID for your 'Store Name' field
  const ENTRY_ID_FOR_STORE_NAME = "1234567890";
  
  // Use .value since storeName is a hidden input
  const storeNameValue = storeName.value;
  
  // Construct the pre-filled URL
  registerBtn.href = `${PARTNER_FORM_BASE_URL}?entry.${ENTRY_ID_FOR_STORE_NAME}=${encodeURIComponent(storeNameValue)}`;
  
  // Ensure this button opens in a new tab (if it's not already set in HTML)
  registerBtn.target = "_blank";
}

// 4. Start observing elements
document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));