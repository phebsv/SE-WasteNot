document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://localhost/wastenot-api/api/profile.php';
  const el = id => document.getElementById(id);
  const SESSION_KEY = 'consumerSession';
  const fields = ['fullName', 'phone', 'email', 'address', 'prefs'];

  function safeJsonParse(raw, fallback) {
    try {
      return JSON.parse(raw) ?? fallback;
    } catch {
      return fallback;
    }
  }

  function getSession() {
    const userId = localStorage.getItem('userId') || '';
    const base = {
      id: userId || null,
      fullName: localStorage.getItem('userName') || '',
      email: localStorage.getItem('userEmail') || '',
      phone: localStorage.getItem('userPhone') || '',
      address: localStorage.getItem('userAddress') || '',
      prefs: ''
    };

    const stored = safeJsonParse(localStorage.getItem(SESSION_KEY), {});
    return {
      ...base,
      ...stored,
      id: stored.id || base.id
    };
  }

  function setSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    if (session.fullName != null) localStorage.setItem('userName', session.fullName);
    if (session.email != null) localStorage.setItem('userEmail', session.email);
    if (session.phone != null) localStorage.setItem('userPhone', session.phone);
    if (session.address != null) localStorage.setItem('userAddress', session.address);
  }

  function fillForm(session) {
    if (el('fullName')) el('fullName').value = session.fullName || '';
    if (el('phone')) el('phone').value = session.phone || '';
    if (el('email')) el('email').value = session.email || '';
    if (el('address')) el('address').value = session.address || '';
    if (el('prefs')) el('prefs').value = session.prefs || '';
  }

  async function load() {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.log('No auth token, user not logged in');
        return;
      }

      const response = await fetch(API_URL, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.user) {
          const user = result.user;
          const nextSession = {
            ...getSession(),
            fullName: user.full_name || getSession().fullName || '',
            phone: user.phone || getSession().phone || '',
            email: user.email || getSession().email || '',
            address: user.address || getSession().address || ''
          };
          setSession(nextSession);
          fillForm(nextSession);
          console.log('Profile loaded successfully:', user);
        }
      } else {
        console.error('Failed to load profile:', response.status);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  async function save() {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        alert('Please log in first');
        return;
      }

      const current = getSession();
      const nextSession = {
        ...current,
        fullName: el('fullName')?.value || '',
        phone: el('phone')?.value || '',
        email: el('email')?.value || current.email || '',
        address: el('address')?.value || '',
        prefs: el('prefs')?.value || ''
      };
      setSession(nextSession);

      const data = {
        full_name: nextSession.fullName,
        phone: nextSession.phone,
        address: nextSession.address
      };

      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        alert('✅ Profile saved successfully!');
        // Keep shared keys in sync
        localStorage.setItem('userName', data.full_name);
        console.log('Profile updated:', data);
      } else {
        alert('❌ Failed to save profile to server: ' + (result.message || 'Unknown error') + '\n\nYour changes were saved locally and will still show on next login.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('❌ Error saving profile to server. Your changes were saved locally and will still show on next login.');
    }
  }

  function reset() {
    if (confirm('Reset changes back to your saved profile?')) {
      const session = getSession();
      fillForm(session);
    }
  }

  // Logout
  const logoutBtn = el('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      // Clear only auth/session flags; keep cached profile + app data.
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
      window.location.href = '../login/login-consumer.html';
    });
  }

  // Prefill immediately from local cache, then refresh from backend
  fillForm(getSession());

  if (el('saveBtn')) el('saveBtn').addEventListener('click', save);
  if (el('resetBtn')) el('resetBtn').addEventListener('click', reset);
  load();
});