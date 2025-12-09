// Mandatory setup redirect
if (localStorage.getItem("consumerLoggedIn") !== "true") {
  window.location.href = "login-consumer.html";
}

const form = document.getElementById("setupForm");
const avatarInput = document.getElementById("avatarInput");
const avatarPreview = document.getElementById("avatarPreview");

let avatarData = null;

// Preview uploaded avatar
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

// Submit setup form
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const profile = {
    name: document.getElementById("fullName").value,
    contact: document.getElementById("contactNumber").value,
    address: document.getElementById("address").value,
    avatar: avatarData,
    notify: document.getElementById("notifyMe").checked,
    profileComplete: true,
  };

  localStorage.setItem("consumerProfile", JSON.stringify(profile));

  window.location.href = "consumer-dashboard.html";
});
