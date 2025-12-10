document.addEventListener('DOMContentLoaded', ()=>{
  const key = 'ngoProfile';
  const el = id=>document.getElementById(id);
  const fields = ['orgName','contactName','phone','email','address','about'];

  function load(){
    const data = JSON.parse(localStorage.getItem(key) || '{}');
    fields.forEach(f=>{ if(el(f)) el(f).value = data[f] || '' });
  }
  function save(){
    const data = {};
    fields.forEach(f=>{ data[f] = el(f).value });
    localStorage.setItem(key, JSON.stringify(data));
    alert('Profile saved');
  }
  function reset(){ if(confirm('Reset profile to empty?')){ fields.forEach(f=>{ if(el(f)) el(f).value=''}); localStorage.removeItem(key); } }

  el('saveBtn').addEventListener('click', save);
  el('resetBtn').addEventListener('click', reset);

  load();
});