// Show toast
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// For Sale Listings
const saleForm = document.getElementById("saleForm");
if (saleForm) {
  saleForm.addEventListener("submit", (e) => {
    e.preventDefault();

    showToast("Sale Listing Created!");

    setTimeout(() => {
      window.location.href = "partner-listings.html";
    }, 1500);
  });
}

// For Donation
const donationForm = document.getElementById("donationForm");
if (donationForm) {
  donationForm.addEventListener("submit", (e) => {
    e.preventDefault();

    showToast("Donation Listing Created!");

    setTimeout(() => {
      window.location.href = "partner-listings.html";
    }, 1500);
  });
}