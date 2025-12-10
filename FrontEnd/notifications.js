// Shared notifications helper (placed at FrontEnd/notifications.js)
(function(){
  const STORAGE_KEY = 'notifications';

  function getNotifications(){
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }
  function saveNotifications(list){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
  function addNotification(n){
    const list = getNotifications();
    list.unshift({...n, id: Date.now(), read: false, createdAt: new Date().toISOString()});
    saveNotifications(list);
  }

  function markAsRead(id){
    const list = getNotifications().map(n => n.id === id ? {...n, read:true} : n);
    saveNotifications(list);
  }

  function markAllRead(){
    const list = getNotifications().map(n => ({...n, read:true}));
    saveNotifications(list);
  }

  function formatTime(iso){
    try{ const d=new Date(iso); return d.toLocaleString(); }catch(e){return iso}
  }

  function renderDropdown(container){
    const list = getNotifications();
    if(!container) return;
    container.innerHTML = '';
    const header = document.createElement('div');
    header.className = 'notif-header';
    header.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid rgba(0,0,0,0.04)"><strong>Notifications</strong><button id="markAllNotif" class="btn tiny">Mark all read</button></div>`;
    container.appendChild(header);

    const listEl = document.createElement('div');
    listEl.className = 'notif-list';
    if(!list.length){
      const empty = document.createElement('div');
      empty.className='notif-empty';
      empty.textContent = 'No notifications';
      empty.style.padding='12px';
      listEl.appendChild(empty);
    } else {
      list.forEach(n=>{
        const item = document.createElement('a');
        item.href = n.link || '#';
        item.className = 'notif-item' + (n.read? ' read':'');
        item.style.display='block';
        item.style.padding='12px';
        item.style.borderBottom='1px solid rgba(0,0,0,0.03)';
        item.style.textDecoration='none';
        item.style.color='inherit';
        item.innerHTML = `<div style="font-weight:600;margin-bottom:4px">${n.title}</div><div style="font-size:0.9rem;color:#6b7280">${n.body}</div><div style="font-size:0.75rem;color:#9ca3af;margin-top:6px">${formatTime(n.createdAt)}</div>`;
        item.addEventListener('click', (e)=>{
          e.preventDefault();
          markAsRead(n.id);
          // small delay to ensure saved
          setTimeout(()=>{ window.location.href = n.link || '#'; }, 80);
        });
        listEl.appendChild(item);
      });
    }
    container.appendChild(listEl);

    const markBtn = container.querySelector('#markAllNotif');
    if(markBtn) markBtn.addEventListener('click', ()=>{ markAllRead(); renderDropdown(container); updateBadge(); });
  }

  function updateBadge(badgeEl){
    const unread = getNotifications().filter(n=>!n.read).length;
    if(!badgeEl) return;
    if(unread>0){ badgeEl.textContent = unread; badgeEl.style.display='inline-block'; }
    else{ badgeEl.textContent=''; badgeEl.style.display='none'; }
  }

  // init: find topbar-actions on page and convert first icon-btn (the bell) to notif button
  document.addEventListener('DOMContentLoaded', ()=>{
    const topbarActions = document.querySelector('.topbar-actions');
    if(!topbarActions) return;

    // find existing bell icon button (first icon-btn)
    let btn = topbarActions.querySelector('button.icon-btn');
    if(!btn) return;

    btn.id = 'notifBtn';
    btn.style.position='relative';

    // create badge
    const badge = document.createElement('span');
    badge.className = 'notif-badge';
    badge.style.position='absolute';
    badge.style.top='-6px';
    badge.style.right='-6px';
    badge.style.minWidth='18px';
    badge.style.height='18px';
    badge.style.borderRadius='999px';
    badge.style.backgroundColor='var(--green-main)';
    badge.style.color='#fff';
    badge.style.fontSize='12px';
    badge.style.display='none';
    badge.style.alignItems='center';
    badge.style.justifyContent='center';
    badge.style.padding='0 6px';
    badge.style.lineHeight='18px';

    btn.appendChild(badge);

    // create wrapper for positioning dropdown
    const wrapper = document.createElement('div');
    wrapper.style.position='relative';
    wrapper.style.display='inline-block';
    btn.parentNode.insertBefore(wrapper, btn);
    wrapper.appendChild(btn);

    // dropdown
    const dropdown = document.createElement('div');
    dropdown.id = 'notifDropdown';
    dropdown.className = 'notif-dropdown hidden';
    dropdown.style.position='absolute';
    dropdown.style.right='0';
    dropdown.style.top='40px';
    dropdown.style.minWidth='320px';
    dropdown.style.maxHeight='420px';
    dropdown.style.overflow='auto';
    dropdown.style.background='#fff';
    dropdown.style.border='1px solid var(--border-soft)';
    dropdown.style.borderRadius='10px';
    dropdown.style.boxShadow='0 8px 30px rgba(15,23,42,0.12)';
    dropdown.style.zIndex='9999';

    wrapper.appendChild(dropdown);

    // wire up
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
      renderDropdown(dropdown);
      updateBadge(badge);
    });

    // hide on outside click
    document.addEventListener('click', (e)=>{
      if(!dropdown.classList.contains('hidden')) dropdown.classList.add('hidden');
    });

    // initial badge update
    updateBadge(badge);

    // add a sample notification if none
    if(getNotifications().length === 0){
      addNotification({title:'Provider Accepted Your Request', body:'Jollibee has accepted your pickup. Please prepare to collect.', link:'ngo-claims.html'});
      addNotification({title:'Request Submitted', body:'Your request for Packed Meals has been submitted.', link:'ngo-claims.html'});
      updateBadge(badge);
    }
  });

  // expose helpers for dev console
  window.WasteNotNotifications = { getNotifications, addNotification, markAsRead, markAllRead };
})();
