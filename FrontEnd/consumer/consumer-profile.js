document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://localhost/wastenot-api/api/profile.php';
  const el = id => document.getElementById(id);
  const fields = ['fullName', 'phone', 'email', 'address', 'prefs'];

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
          if (el('fullName')) el('fullName').value = user.full_name || '';
          if (el('phone')) el('phone').value = user.phone || '';
          if (el('email')) el('email').value = user.email || '';
          if (el('address')) el('address').value = user.address || '';
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

      const data = {
        full_name: el('fullName').value,
        phone: el('phone').value,
        address: el('address').value
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
        // Update localStorage with new name
        localStorage.setItem('userName', data.full_name);
        console.log('Profile updated:', data);
      } else {
        alert('❌ Failed to save profile: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('❌ Error saving profile. Please try again.');
    }
  }

  function reset() {
    if (confirm('Reset profile to empty?')) {
      fields.forEach(f => { if (el(f)) el(f).value = '' });
      localStorage.removeItem('consumerProfile');
    }
  }

  el('saveBtn').addEventListener('click', save);
  el('resetBtn').addEventListener('click', reset);
  load();
});