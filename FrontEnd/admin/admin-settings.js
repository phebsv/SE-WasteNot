// ===== AUTH GUARD =====
if (!localStorage.getItem("authToken") || localStorage.getItem("userRole") !== "admin") {
    window.location.href = "../login/login-consumer.html";
}

document.addEventListener("DOMContentLoaded", () => {
    
    let activeTab = 'general';

    // --- Tab Switching Logic ---
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            if (activeTab === targetTab) return;

            // Update button classes
            document.querySelector('.tab-btn.active').classList.remove('active');
            button.classList.add('active');

            // Update content visibility
            document.querySelector('.tab-content.active').classList.remove('active');
            document.getElementById(targetTab).classList.add('active');

            activeTab = targetTab;
        });
    });

    // --- Form Submission Handlers (Mock) ---
    const forms = document.querySelectorAll('.tab-content form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // In a real app, form data would be serialized and sent to API here
            showToast(`Settings for ${activeTab.toUpperCase()} saved successfully!`, 'success');
        });
    });
    
    // Utility for toasts 
    function showToast(message, type = "success") {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }
    
    // Logout Handler
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        [
            'authToken',
            'userId',
            'userRole',
            'userName',
            'userEmail',
            'ngoName',
            'consumerLoggedIn',
            'partnerLoggedIn',
            'ngoLoggedIn',
            'adminLoggedIn'
        ].forEach(k => localStorage.removeItem(k));
        sessionStorage.clear();
        window.location.href = "../login/login.html";
    });
});