// ====== TOAST REUSABLE SYSTEM ======

function showToast(message, type = "info", withButton = false) {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        ${withButton ? `<button class="toast-ok">OK</button>` : ""}
    `;

    container.appendChild(toast);

    playToastSound();

    if (!withButton) {
        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(20px)";
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    if (withButton) {
        toast.querySelector(".toast-ok").addEventListener("click", () => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(20px)";
            setTimeout(() => toast.remove(), 300);
        });
    }
}