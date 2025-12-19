// Shared notifications helper (placed at FrontEnd/notifications.js)
// Role-aware + user-aware: notifications are stored per role + userId, with optional broadcast buckets.
(function () {
  const PREFIX = 'wn.notifications.v2:';

  function getRole() {
    return String(localStorage.getItem('userRole') || '').trim().toLowerCase();
  }

  function getUserId() {
    const raw = localStorage.getItem('userId');
    const id = raw == null ? '' : String(raw).trim();
    return id || '';
  }

  function isAuthed() {
    return Boolean(localStorage.getItem('authToken')) && Boolean(getRole());
  }

  function storageKey(role, userIdOrAll) {
    const r = String(role || '').trim().toLowerCase() || 'unknown';
    const u = (userIdOrAll == null || userIdOrAll === '') ? 'all' : String(userIdOrAll).trim();
    return `${PREFIX}${r}:${u}`;
  }

  function safeParseJson(v, fallback) {
    try {
      const parsed = JSON.parse(v);
      return parsed == null ? fallback : parsed;
    } catch (_) {
      return fallback;
    }
  }

  function readBucket(role, userIdOrAll) {
    const key = storageKey(role, userIdOrAll);
    const raw = localStorage.getItem(key);
    const list = safeParseJson(raw || '[]', []);
    return Array.isArray(list) ? list : [];
  }

  function writeBucket(role, userIdOrAll, list) {
    const key = storageKey(role, userIdOrAll);
    localStorage.setItem(key, JSON.stringify(Array.isArray(list) ? list : []));
  }

  function makeId() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function normalizeNotification(n, bucketKey) {
    const createdAt = n.createdAt || new Date().toISOString();
    return {
      id: n.id || makeId(),
      title: String(n.title || '').trim() || 'Notification',
      body: String(n.body || '').trim() || '',
      link: n.link || '#',
      read: Boolean(n.read),
      createdAt,
      _bucketKey: bucketKey
    };
  }

  function getNotificationsFor(role, userId) {
    const userKey = storageKey(role, userId);
    const allKey = storageKey(role, 'all');
    const personal = readBucket(role, userId).map(n => normalizeNotification(n, userKey));
    const broadcast = readBucket(role, 'all').map(n => normalizeNotification(n, allKey));
    return [...personal, ...broadcast].sort((a, b) => {
      const ta = Date.parse(a.createdAt) || 0;
      const tb = Date.parse(b.createdAt) || 0;
      return tb - ta;
    });
  }

  function getCurrentNotifications() {
    const role = getRole();
    const userId = getUserId();
    if (!role) return [];
    return getNotificationsFor(role, userId);
  }

  function addForTarget(target, notification) {
    const role = String(target?.role || '').trim().toLowerCase();
    if (!role) return;

    const userId = target?.userId == null ? 'all' : String(target.userId).trim();
    const bucketKey = storageKey(role, userId || 'all');
    const list = readBucket(role, userId || 'all');
    list.unshift(normalizeNotification({ ...notification, read: false }, bucketKey));
    writeBucket(role, userId || 'all', list);
  }

  function notifyTargets(targets, notification) {
    const list = Array.isArray(targets) ? targets : [];
    list.forEach(t => addForTarget(t, notification));
  }

  function markAsRead(id) {
    const role = getRole();
    const userId = getUserId();
    if (!role) return;

    const buckets = [storageKey(role, userId), storageKey(role, 'all')];
    buckets.forEach(key => {
      const raw = localStorage.getItem(key);
      const list = safeParseJson(raw || '[]', []);
      if (!Array.isArray(list)) return;
      const next = list.map(n => (String(n.id) === String(id) ? { ...n, read: true } : n));
      localStorage.setItem(key, JSON.stringify(next));
    });
  }

  function markAllRead() {
    const role = getRole();
    const userId = getUserId();
    if (!role) return;

    const buckets = [storageKey(role, userId), storageKey(role, 'all')];
    buckets.forEach(key => {
      const raw = localStorage.getItem(key);
      const list = safeParseJson(raw || '[]', []);
      if (!Array.isArray(list)) return;
      const next = list.map(n => ({ ...n, read: true }));
      localStorage.setItem(key, JSON.stringify(next));
    });
  }

  function formatTime(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch (_) {
      return String(iso || '');
    }
  }

  function unreadCount() {
    return getCurrentNotifications().filter(n => !n.read).length;
  }

  function renderDropdown(container) {
    const list = getCurrentNotifications();
    if (!container) return;

    container.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'notif-header';
    header.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid rgba(0,0,0,0.04)">
        <strong>Notifications</strong>
        <button id="markAllNotif" class="btn tiny" type="button">Mark all read</button>
      </div>
    `;
    container.appendChild(header);

    const listEl = document.createElement('div');
    listEl.className = 'notif-list';

    if (!list.length) {
      const empty = document.createElement('div');
      empty.className = 'notif-empty';
      empty.textContent = 'No notifications';
      empty.style.padding = '12px';
      listEl.appendChild(empty);
    } else {
      list.forEach(n => {
        const item = document.createElement('a');
        item.href = n.link || '#';
        item.className = 'notif-item' + (n.read ? ' read' : '');
        item.style.display = 'block';
        item.style.padding = '12px';
        item.style.borderBottom = '1px solid rgba(0,0,0,0.03)';
        item.style.textDecoration = 'none';
        item.style.color = 'inherit';

        const safeTitle = String(n.title || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const safeBody = String(n.body || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        item.innerHTML = `
          <div style="font-weight:600;margin-bottom:4px">${safeTitle}</div>
          <div style="font-size:0.9rem;color:#6b7280">${safeBody}</div>
          <div style="font-size:0.75rem;color:#9ca3af;margin-top:6px">${formatTime(n.createdAt)}</div>
        `;

        item.addEventListener('click', (e) => {
          e.preventDefault();
          markAsRead(n.id);
          setTimeout(() => {
            const href = n.link || '#';
            if (href && href !== '#') window.location.href = href;
          }, 60);
        });

        listEl.appendChild(item);
      });
    }

    container.appendChild(listEl);

    const markBtn = container.querySelector('#markAllNotif');
    if (markBtn) {
      markBtn.addEventListener('click', () => {
        markAllRead();
        renderDropdown(container);
      });
    }
  }

  function updateBadge(badgeEl) {
    if (!badgeEl) return;
    const unread = unreadCount();
    if (unread > 0) {
      badgeEl.textContent = String(unread);
      badgeEl.style.display = 'inline-flex';
    } else {
      badgeEl.textContent = '';
      badgeEl.style.display = 'none';
    }
  }

  function findNotifButton() {
    // Prefer explicit aria-label.
    const labeled = document.querySelector('.topbar-actions button[aria-label="Notifications"], button[aria-label="Notifications"]');
    if (labeled) return labeled;

    // Otherwise try to find a bell-like button.
    const candidates = Array.from(document.querySelectorAll('.topbar-actions button, button.icon-btn'));
    return candidates.find(b => String(b.textContent || '').includes('🔔')) || null;
  }

  function ensureSeed(role, userId) {
    const hasAny = getNotificationsFor(role, userId).length > 0;
    if (hasAny) return;

    const base = {
      link: '#'
    };

    if (role === 'partner') {
      addForTarget({ role: 'partner', userId }, { ...base, title: 'You’re all set', body: 'New requests and listing updates will appear here.', link: '/provider/partner-dashboard.html' });
      return;
    }

    if (role === 'consumer') {
      addForTarget({ role: 'consumer', userId }, { ...base, title: 'You’re all set', body: 'Claim updates and pickups will appear here.', link: '/consumer/consumer-dashboard.html' });
      return;
    }

    if (role === 'ngo') {
      addForTarget({ role: 'ngo', userId }, { ...base, title: 'You’re all set', body: 'Request updates will appear here.', link: '/ngo/ngo-dashboard.html' });
      return;
    }

    if (role === 'admin') {
      addForTarget({ role: 'admin', userId }, { ...base, title: 'You’re all set', body: 'Approvals and system updates will appear here.', link: '/admin/admin-dashboard.html' });
    }
  }

  function migrateLegacyGlobal() {
    // Older versions stored a single shared key "notifications".
    // We migrate it into the current user's bucket once.
    const legacyKey = 'notifications';
    const legacy = safeParseJson(localStorage.getItem(legacyKey) || '[]', []);
    if (!Array.isArray(legacy) || legacy.length === 0) return;
    if (!isAuthed()) return;

    const role = getRole();
    const userId = getUserId();
    const existing = readBucket(role, userId);
    const migrated = legacy.map(n => {
      const createdAt = n.createdAt || new Date().toISOString();
      return normalizeNotification({ ...n, createdAt }, storageKey(role, userId));
    });
    writeBucket(role, userId, [...migrated, ...existing]);
    localStorage.removeItem(legacyKey);
  }

  document.addEventListener('DOMContentLoaded', () => {
    migrateLegacyGlobal();
    if (!isAuthed()) return;

    const role = getRole();
    const userId = getUserId();
    ensureSeed(role, userId);

    const btn = findNotifButton();
    if (!btn) return;

    // Hide any old hardcoded counter badge.
    const oldCount = btn.querySelector('.notification-count');
    if (oldCount) oldCount.style.display = 'none';

    btn.id = btn.id || 'notifBtn';
    btn.style.position = 'relative';

    const badge = document.createElement('span');
    badge.className = 'notif-badge';
    badge.style.position = 'absolute';
    badge.style.top = '-6px';
    badge.style.right = '-6px';
    badge.style.minWidth = '18px';
    badge.style.height = '18px';
    badge.style.borderRadius = '999px';
    badge.style.backgroundColor = 'var(--green-main)';
    badge.style.color = '#fff';
    badge.style.fontSize = '12px';
    badge.style.display = 'none';
    badge.style.alignItems = 'center';
    badge.style.justifyContent = 'center';
    badge.style.padding = '0 6px';
    badge.style.lineHeight = '18px';
    badge.style.pointerEvents = 'none';
    btn.appendChild(badge);

    // Wrapper for positioning dropdown
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    btn.parentNode.insertBefore(wrapper, btn);
    wrapper.appendChild(btn);

    const dropdown = document.createElement('div');
    dropdown.id = 'notifDropdown';
    dropdown.className = 'notif-dropdown hidden';
    dropdown.style.position = 'absolute';
    dropdown.style.right = '0';
    dropdown.style.top = '40px';
    dropdown.style.minWidth = '320px';
    dropdown.style.maxHeight = '420px';
    dropdown.style.overflow = 'auto';
    dropdown.style.background = '#fff';
    dropdown.style.border = '1px solid var(--border-soft)';
    dropdown.style.borderRadius = '10px';
    dropdown.style.boxShadow = '0 8px 30px rgba(15,23,42,0.12)';
    dropdown.style.zIndex = '9999';
    dropdown.style.display = 'none';
    wrapper.appendChild(dropdown);

    function setDropdownOpen(open) {
      if (open) {
        dropdown.classList.remove('hidden');
        dropdown.style.display = 'block';
      } else {
        dropdown.classList.add('hidden');
        dropdown.style.display = 'none';
      }
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.style.display !== 'none';
      setDropdownOpen(!isOpen);
      if (!isOpen) {
        renderDropdown(dropdown);
        updateBadge(badge);
      }
    });

    document.addEventListener('click', () => {
      if (dropdown.style.display !== 'none') setDropdownOpen(false);
    });

    updateBadge(badge);

    // Refresh badge when other tabs update notifications.
    window.addEventListener('storage', () => updateBadge(badge));
  });

  // Public API
  window.WasteNotNotifications = {
    // Read
    getRole,
    getUserId,
    getCurrentNotifications,

    // Write
    notifyTargets,
    addForTarget,

    // Mark read
    markAsRead,
    markAllRead
  };
})();
