// ====== TOAST REUSABLE SYSTEM ======

function showToast(message, type = "info", withButton = false) {
    const container = document.getElementById("toastContainer");

    // Backward-compatible fallback for pages that still use a single #toast element
    // styled by existing CSS (.toast.show, .toast.success, .toast.error).
    if (!container) {
        const legacyToast = document.getElementById("toast");
        if (!legacyToast) return;

        legacyToast.textContent = String(message);
        legacyToast.classList.remove("success", "error");
        if (type === "success") legacyToast.classList.add("success");
        if (type === "error") legacyToast.classList.add("error");
        legacyToast.classList.add("show");

        if (typeof playToastSound === 'function') {
            try { playToastSound(); } catch (_) { /* ignore */ }
        }

        if (!withButton) {
            setTimeout(() => legacyToast.classList.remove("show"), 2500);
        }
        return;
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        ${withButton ? `<button class="toast-ok">OK</button>` : ""}
    `;

    container.appendChild(toast);

    if (typeof playToastSound === 'function') {
        try { playToastSound(); } catch (_) { /* ignore */ }
    }

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