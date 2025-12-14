// Mandatory setup auth guard:
if (localStorage.getItem("partnerLoggedIn") !== "true") {
  window.location.href = "login-partner.html";
}

const form = document.getElementById("setupForm");
const avatarPreview = document.getElementById("avatarPreview");
const avatarInput = document.getElementById("avatarInput");

let avatarData = null;

// ---- Avatar Preview ----
avatarInput.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    avatarData = reader.result;
    avatarPreview.style.backgroundImage = `url(${avatarData})`;
    avatarPreview.textContent = "";
  };
  reader.readAsDataURL(file);
});

// ---- Save Provider Profile ----
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const providerProfile = {
    businessName: document.getElementById("businessName").value,
    businessType: document.getElementById("businessType").value,
    email: document.getElementById("email").value,
    location: document.getElementById("location").value,
    hours: document.getElementById("hours").value,
    avatar: avatarData,
    notify: document.getElementById("notifyMe").checked,
    profileComplete: true
  };

  localStorage.setItem("providerProfile", JSON.stringify(providerProfile));

  window.location.href = "partner-dashboard.html";
});
