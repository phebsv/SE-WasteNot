// Minimal admin JS to populate tables and perform simple actions. Uses localStorage for demo data.
document.addEventListener('DOMContentLoaded', ()=>{
  const storageKey = 'adminDataV1';
  const seed = {
    providers:[{id:1,name:'Jollibee',loc:'Colon St., Cebu',contact:'09171234567',status:'Active'},{id:2,name:'SM Grocery',loc:'SM Seaside',contact:'09171239999',status:'Active'},{id:3,name:"McDonald's",loc:"Ayala Center Cebu",contact:'09171230000',status:'Active'}],
    ngos:[{id:1,name:'Hope Foundation',contact:'hope@example.org',area:'Cebu',status:'Active'},{id:2,name:'Feeding Hands',contact:'feed@example.org',area:'Mandaue',status:'Active'}],
    donations:[
      {id:1,item:'Packed Meals',provider:'Jollibee',qty:25,expiry:'2025-10-07'},
      {id:2,item:'Canned Goods',provider:'SM Grocery',qty:50,expiry:'2025-10-10'},
      {id:3,item:'Juice Packs',provider:"McDonald's",qty:15,expiry:'2025-10-08'},
      {id:4,item:'Pancit Canton Party Tray',provider:'Noodle Haus',qty:5,expiry:'2025-10-10'}
    ],
    // marketplace products copied from consumer marketplace sample data so admin can review listings
    products:[
      {id:1,name:'BreadTalk Croissant',partner:'BreadTalk',price:60,oldPrice:120,discountPercent:50,category:'breads',expiry:'Today • 8 PM',pickupWindow:'4:00 PM – 7:30 PM'},
      {id:2,name:'Goldilocks Cake Slice',partner:'Goldilocks',price:28,oldPrice:45,discountPercent:35,category:'breads',expiry:'Tomorrow • 10 AM',pickupWindow:'3:00 PM – 8:00 PM'},
      {id:3,name:'Gardenia Classic Bread',partner:'Gardenia',price:95,oldPrice:105,discountPercent:10,category:'breads',expiry:'In 2 days',pickupWindow:'Anytime within store hours'},
      {id:4,name:'Stop N Shop Fruit Cup',partner:'Stop N Shop',price:85,oldPrice:120,discountPercent:30,category:'drinks',expiry:'Tomorrow • 6 PM',pickupWindow:'2:00 PM – 6:00 PM'},
      {id:5,name:'Stop N Shop Mango Juice',partner:'Stop N Shop',price:30,oldPrice:50,discountPercent:40,category:'drinks',expiry:'Today • 9 PM',pickupWindow:'5:00 PM – 8:30 PM'},
      {id:6,name:'Assorted Pastry Box',partner:'SM Supermarket',price:95,oldPrice:150,discountPercent:37,category:'breads',expiry:'Today • 10 PM',pickupWindow:'5:30 PM – 9:30 PM'},
      {id:7,name:'Jollibee Chickenjoy Meal',partner:'Jollibee',price:75,oldPrice:150,discountPercent:50,category:'meals',expiry:'Today • 7 PM',pickupWindow:'4:00 PM – 6:30 PM'},
      {id:8,name:'Jollibee Jolly Spaghetti',partner:'Jollibee',price:40,oldPrice:60,discountPercent:33,category:'meals',expiry:'Today • 7 PM',pickupWindow:'4:30 PM – 6:45 PM'}
    ],
    users:[{id:1,name:'Maria',role:'Consumer',email:'maria@example.com',status:'Active'},{id:2,name:'Antonio',role:'Provider',email:'ant@example.com',status:'Active'},{id:3,name:'Liza',role:'NGO',email:'liza@ngo.org',status:'Active'}],
    approvals:[{id:1,type:'Provider',name:'New Cafe',submitted:new Date().toISOString()}],
    logs:[{id:1,event:'Seeded admin data',time:new Date().toISOString()}],
    announcements:[]
  };

  if(!localStorage.getItem(storageKey)) localStorage.setItem(storageKey, JSON.stringify(seed));
  const get = ()=>JSON.parse(localStorage.getItem(storageKey));
  const set = (d)=>localStorage.setItem(storageKey, JSON.stringify(d));

  // Stats on dashboard
  const statsMap = {statProviders:'providers', statNgos:'ngos', statDonations:'donations', statProducts:'products'};
  Object.keys(statsMap).forEach(el=>{ const list = get()[statsMap[el]]||[]; const node = document.getElementById(el); if(node) node.textContent = list.length; });

  // recent activity
  const recent = document.getElementById('recentActivity'); if(recent){ const logs = get().logs.slice(-6).reverse(); recent.innerHTML = logs.map(l=>`<div style="padding:6px 0;border-bottom:1px solid #f1f5f2">${l.event} <div style="font-size:0.85rem;color:#6b7280">${new Date(l.time).toLocaleString()}</div></div>`).join(''); }

  // populate providers table
  const providersTable = document.getElementById('providersTable'); if(providersTable){ const tbody = providersTable.querySelector('tbody'); tbody.innerHTML=''; get().providers.forEach(p=>{ const tr=document.createElement('tr'); tr.innerHTML=`<td>${p.name}</td><td>${p.loc}</td><td>${p.contact}</td><td><span class='status-badge small'>${p.status}</span></td><td><button class='btn small primary' data-id='${p.id}' data-action='edit'>Edit</button> <button class='btn small ghost danger' data-id='${p.id}' data-action='remove'>Remove</button></td>`; tbody.appendChild(tr); }); providersTable.addEventListener('click', e=>{ const b=e.target.closest('button'); if(!b) return; const id=parseInt(b.getAttribute('data-id')); const action=b.getAttribute('data-action'); if(action==='remove'){ if(confirm('Remove provider?')){ const d=get(); d.providers=d.providers.filter(x=>x.id!==id); d.logs.push({id:Date.now(),event:`Removed provider ${id}`,time:new Date().toISOString()}); set(d); location.reload(); } } }); }

  // populate ngos table
  const ngosTable = document.getElementById('ngosTable'); if(ngosTable){ const tbody=ngosTable.querySelector('tbody'); tbody.innerHTML=''; get().ngos.forEach(n=>{ const tr=document.createElement('tr'); tr.innerHTML=`<td>${n.name}</td><td>${n.contact}</td><td>${n.area}</td><td><span class='status-badge small'>${n.status}</span></td><td><button class='btn small primary' data-id='${n.id}' data-action='edit'>Edit</button> <button class='btn small ghost danger' data-id='${n.id}' data-action='remove'>Remove</button></td>`; tbody.appendChild(tr); }); ngosTable.addEventListener('click', e=>{ const b=e.target.closest('button'); if(!b) return; const id=parseInt(b.getAttribute('data-id')); if(confirm('Remove NGO?')){ const d=get(); d.ngos=d.ngos.filter(x=>x.id!==id); d.logs.push({id:Date.now(),event:`Removed NGO ${id}`,time:new Date().toISOString()}); set(d); location.reload(); } }); }

  // donations table
  const donationsTable = document.getElementById('donationsTable'); if(donationsTable){ const tbody=donationsTable.querySelector('tbody'); tbody.innerHTML=''; get().donations.forEach(don=>{ const tr=document.createElement('tr'); tr.innerHTML=`<td>${don.item}</td><td>${don.provider}</td><td>${don.qty}</td><td>${don.expiry}</td><td><button class='btn small ghost' data-id='${don.id}' data-action='edit'>Edit</button> <button class='btn small ghost danger' data-id='${don.id}' data-action='remove'>Remove</button></td>`; tbody.appendChild(tr); }); donationsTable.addEventListener('click', e=>{ const b=e.target.closest('button'); if(!b) return; const id=parseInt(b.getAttribute('data-id')); const action = b.getAttribute('data-action'); if(action==='remove'){ if(confirm('Remove donation?')){ const d=get(); d.donations=d.donations.filter(x=>x.id!==id); d.logs.push({id:Date.now(),event:`Removed donation ${id}`,time:new Date().toISOString()}); set(d); location.reload(); } } else if(action==='edit'){ alert('Edit donation (demo)'); } }); }

  // marketplace products table (admin view)
  const productsTable = document.getElementById('productsTable'); if(productsTable){ const tbody=productsTable.querySelector('tbody'); tbody.innerHTML=''; (get().products||[]).forEach(p=>{ const tr=document.createElement('tr'); tr.innerHTML=`<td>${p.name}</td><td>${p.partner}</td><td>₱${p.price}${p.oldPrice?` <span style="color:#9ca3af;font-size:0.9rem">₱${p.oldPrice}</span>`:''}</td><td>${p.expiry}</td><td>${p.pickupWindow}</td><td><button class='btn small primary' data-id='${p.id}' data-action='feature'>Feature</button> <button class='btn small ghost danger' data-id='${p.id}' data-action='remove'>Remove</button></td>`; tbody.appendChild(tr); }); productsTable.addEventListener('click', e=>{ const b=e.target.closest('button'); if(!b) return; const id=parseInt(b.getAttribute('data-id')); const action=b.getAttribute('data-action'); if(action==='remove'){ if(confirm('Remove product listing?')){ const d=get(); d.products=d.products.filter(x=>x.id!==id); d.logs.push({id:Date.now(),event:`Removed marketplace product ${id}`,time:new Date().toISOString()}); set(d); location.reload(); } } else if(action==='feature'){ alert('Marked as featured (demo)'); } }); }

  // users table
  const usersTable = document.getElementById('usersTable'); if(usersTable){ const tbody=usersTable.querySelector('tbody'); tbody.innerHTML=''; get().users.forEach(u=>{ const tr=document.createElement('tr'); tr.innerHTML=`<td>${u.name}</td><td>${u.role}</td><td>${u.email}</td><td><span class='status-badge small'>${u.status}</span></td><td><button class='btn small ghost danger' data-id='${u.id}' data-action='suspend'>Suspend</button></td>`; tbody.appendChild(tr); }); usersTable.addEventListener('click', e=>{ const b=e.target.closest('button'); if(!b) return; const id=parseInt(b.getAttribute('data-id')); if(confirm('Suspend user?')){ const d=get(); d.users=d.users.map(x=> x.id===id?{...x,status:'Suspended'}:x); d.logs.push({id:Date.now(),event:`Suspended user ${id}`,time:new Date().toISOString()}); set(d); location.reload(); } }); }

  // approvals table
  const approvalsTable = document.getElementById('approvalsTable'); if(approvalsTable){ const tbody=approvalsTable.querySelector('tbody'); tbody.innerHTML=''; get().approvals.forEach(a=>{ const tr=document.createElement('tr'); tr.innerHTML=`<td>${a.type}</td><td>${a.name}</td><td>${new Date(a.submitted).toLocaleString()}</td><td><button class='btn small primary' data-id='${a.id}' data-action='approve'>Approve</button> <button class='btn small ghost danger' data-id='${a.id}' data-action='reject'>Reject</button></td>`; tbody.appendChild(tr); }); approvalsTable.addEventListener('click', e=>{ const b=e.target.closest('button'); if(!b) return; const id=parseInt(b.getAttribute('data-id')); const action=b.getAttribute('data-action'); if(action==='approve'){ const d=get(); d.approvals=d.approvals.filter(x=>x.id!==id); d.logs.push({id:Date.now(),event:`Approved application ${id}`,time:new Date().toISOString()}); set(d); location.reload(); } else if(action==='reject'){ if(confirm('Reject application?')){ const d=get(); d.approvals=d.approvals.filter(x=>x.id!==id); d.logs.push({id:Date.now(),event:`Rejected application ${id}`,time:new Date().toISOString()}); set(d); location.reload(); } } }); }

  // logs
  const logsContainer = document.getElementById('logsContainer'); if(logsContainer){ const d=get(); logsContainer.innerHTML = d.logs.slice().reverse().map(l=>`<div style="padding:8px;border-bottom:1px solid #f1f5f2">${l.event}<div style="font-size:0.85rem;color:#6b7280">${new Date(l.time).toLocaleString()}</div></div>`).join(''); }

  // announcements
  const annList = document.getElementById('annList'); if(annList){ const d=get(); annList.innerHTML = d.announcements.map(a=>`<div style="padding:8px;border-bottom:1px solid #f1f5f2"><strong>${a.title}</strong><div style="color:#6b7280">${a.body}</div></div>`).join(''); const saveBtn=document.getElementById('announceSave'); if(saveBtn){ saveBtn.addEventListener('click', ()=>{ const title=document.getElementById('announceTitle').value; const body=document.getElementById('announceBody').value; if(!title||!body){ alert('Title and message required'); return; } const dd=get(); dd.announcements.unshift({id:Date.now(),title,body,time:new Date().toISOString()}); dd.logs.push({id:Date.now(),event:`Published announcement: ${title}`,time:new Date().toISOString()}); set(dd); location.reload(); }); } }

  // settings
  const saveSettings = document.getElementById('saveSettings'); if(saveSettings){ saveSettings.addEventListener('click', ()=>{ alert('Settings saved (demo)'); }); }

});