// ============================================================
// agenda.js — Installation Agenda page
// ============================================================

let agendaState = [];

async function initAgenda(){
  const data = await dbGet('agenda','order');
  agendaState = data.length ? data : DEFAULT_AGENDA;
  if(!data.length){ for(const a of DEFAULT_AGENDA) await DB.from('agenda').upsert(a,{onConflict:'id'}); }
  renderAgenda();
}

function renderAgenda(){
  const c = document.getElementById('agenda-container');
  if(!c) return;
  const sorted = [...agendaState].sort((a,b)=>a.order-b.order);
  // Renumber
  sorted.forEach((item,i)=>{ item.order=i+1; });
  let totalMins = 0;
  sorted.forEach(a=>{ totalMins += parseInt(a.duration)||0; });
  const hrs = Math.floor(totalMins/60), mins = totalMins%60;

  const typeMap = {protocol:'at-protocol',ceremony:'at-ceremony',speech:'at-speech',service:'at-service',felicitation:'at-felicitation'};

  c.innerHTML = sorted.map(item=>{
    const isDone = !!item.done;
    const doneby = isDone&&item.done_by ? `<div class="agenda-done-by">✓ ${item.done_by}</div>` : '';
    return `
    <div class="agenda-item ${isDone?'done':''}" id="aitem-${item.id}">
      <div class="agenda-num ${isDone?'done-num':''}" onclick="toggleAgendaItem('${item.id}')">${item.order}</div>
      <div class="agenda-body" onclick="toggleAgendaItem('${item.id}')">
        <div class="agenda-title">${item.title}</div>
        <div class="agenda-detail">${item.detail}</div>
        <span class="agenda-type ${typeMap[item.type]||''}">${item.type}</span>
        ${doneby}
      </div>
      <div class="agenda-right">
        <div class="time-badge">${item.time}</div>
        <div class="duration-badge">${item.duration} min</div>
        <div class="agenda-move">
          <button class="icon-btn" onclick="moveAgenda('${item.id}',-1)" title="Move up">↑</button>
          <button class="icon-btn" onclick="moveAgenda('${item.id}',1)" title="Move down">↓</button>
          <button class="icon-btn" onclick="editAgendaItem('${item.id}')" title="Edit">✏️</button>
        </div>
      </div>
    </div>`; }).join('');

  const durEl = document.getElementById('agenda-total-duration');
  if(durEl) durEl.textContent = hrs>0 ? `${hrs}h ${mins}m` : `${mins} min`;

  setText('agenda-total-display', `Total: ${hrs>0?hrs+'h ':''} ${mins}min across ${sorted.length} items`);
}

async function toggleAgendaItem(id){
  if(!requireAuth()) return;
  const item = agendaState.find(a=>a.id===id);
  if(!item) return;
  item.done    = !item.done;
  item.done_by = item.done ? SESSION.name : '';
  renderAgenda();
  await dbUpsert('agenda', item);
  await logActivity(SESSION.lion_id, SESSION.name, 'agenda', `${item.done?'completed':'uncompleted'} agenda: ${item.title}`);
}

async function moveAgenda(id, dir){
  if(!requireAuth()) return;
  const sorted = [...agendaState].sort((a,b)=>a.order-b.order);
  const idx  = sorted.findIndex(a=>a.id===id);
  const swap = sorted[idx+dir];
  if(!swap) return;
  [sorted[idx].order, swap.order] = [swap.order, sorted[idx].order];
  await Promise.all([dbUpsert('agenda',sorted[idx]), dbUpsert('agenda',swap)]);
  renderAgenda();
}

function editAgendaItem(id){
  if(!requireAuth()) return;
  const item = id==='new' ? {id:'new',title:'',detail:'',time:'',duration:5,type:'protocol',order:agendaState.length+1} : agendaState.find(a=>a.id===id);
  if(!item) return;
  document.getElementById('am-id').value       = item.id;
  document.getElementById('am-title').value    = item.title;
  document.getElementById('am-detail').value   = item.detail;
  document.getElementById('am-time').value     = item.time;
  document.getElementById('am-duration').value = item.duration;
  document.getElementById('am-type').value     = item.type;
  document.getElementById('am-delete').style.display = id==='new'?'none':'inline-flex';
  document.getElementById('agendaModal').classList.remove('hidden');
}

async function saveAgendaModal(){
  if(!requireAuth()) return;
  const id = document.getElementById('am-id').value;
  const ttl = document.getElementById('am-title').value.trim();
  if(!ttl){ toast('Title cannot be empty.','error'); return; }
  const row = {
    id: id==='new' ? 'ag_'+Date.now() : id,
    title: ttl,
    detail: document.getElementById('am-detail').value.trim(),
    time:   document.getElementById('am-time').value.trim(),
    duration: parseInt(document.getElementById('am-duration').value)||5,
    type:   document.getElementById('am-type').value,
    order:  id==='new' ? agendaState.length+1 : agendaState.find(a=>a.id===id)?.order||1,
    done:   id==='new' ? false : agendaState.find(a=>a.id===id)?.done||false,
    done_by:''
  };
  if(id==='new') agendaState.push(row); else { const i=agendaState.findIndex(a=>a.id===id); agendaState[i]=row; }
  await dbUpsert('agenda', row);
  await logActivity(SESSION.lion_id, SESSION.name, 'agenda', `${id==='new'?'added':'edited'} agenda: ${row.title}`);
  document.getElementById('agendaModal').classList.add('hidden');
  renderAgenda();
}

async function deleteAgendaItem(){
  const id = document.getElementById('am-id').value;
  const item = agendaState.find(a=>a.id===id);
  if(!item||!confirm(`Delete "${item.title}"?`)) return;
  agendaState = agendaState.filter(a=>a.id!==id);
  await dbDelete('agenda', id);
  document.getElementById('agendaModal').classList.add('hidden');
  renderAgenda();
}

// ============================================================
// chairs.js — Chairperson Roles page
// ============================================================

let chairsState = [];

async function initChairs(){
  const data = await dbGet('chairpersons','order');
  chairsState = data.length ? data : DEFAULT_CHAIRS;
  if(!data.length){ for(const c of DEFAULT_CHAIRS) await DB.from('chairpersons').upsert(c,{onConflict:'id'}); }
  renderChairs();
}

function renderChairs(){
  const c = document.getElementById('chair-grid');
  if(!c) return;
  const sorted = [...chairsState].sort((a,b)=>a.order-b.order);
  c.innerHTML = sorted.map(ch=>{
    const chips = (ch.projects||[]).map(p=>`<span class="chip" style="background:${ch.chipBg};color:${ch.chipColor}">${p}</span>`).join('');
    const assignedby = ch.assigned_by ? `<div class="assigned-by">Assigned by ${ch.assigned_by}</div>` : '';
    return `
    <div class="chair-card">
      <div class="chair-card-head" style="background:${ch.bg}">
        <div class="chair-icon" style="background:${ch.iconBg};color:#fff">${ch.icon}</div>
        <div style="flex:1">
          <div class="chair-name">${ch.name}</div>
          <div class="chair-lci">${ch.lci}</div>
        </div>
        <button class="icon-btn" onclick="editChair('${ch.id}')" title="Edit">✏️</button>
      </div>
      <div class="chair-body">
        <div class="chair-projects">${chips}</div>
        <div class="chair-duties">${ch.duties}</div>
        <div class="chair-assign">
          <span class="assign-label">Assigned to:</span>
          <input class="assign-input" type="text" placeholder="Enter Lion's name…" value="${ch.assigned_to||''}"
            onblur="saveChairAssignment('${ch.id}',this.value)" />
        </div>
        ${assignedby}
      </div>
    </div>`; }).join('');

  // Add new button (all members can suggest)
  c.innerHTML += `<div class="chair-add-card" onclick="editChair('new')"><div style="font-size:28px">+</div><div style="font-size:13px;color:var(--text-muted);margin-top:6px">Add Chairperson</div></div>`;
}

async function saveChairAssignment(id, val){
  if(!requireAuth()) return;
  const ch = chairsState.find(c=>c.id===id);
  if(!ch||ch.assigned_to===val) return;
  ch.assigned_to = val;
  ch.assigned_by = SESSION.name;
  await dbUpsert('chairpersons', ch);
  await logActivity(SESSION.lion_id, SESSION.name, 'chairperson', `assigned "${val}" as ${ch.name}`);
  renderChairs();
}

function editChair(id){
  if(!requireAuth()) return;
  const ch = id==='new' ? {id:'new',name:'',lci:'',icon:'🦁',bg:'#E8F0FF',iconBg:'#1A2F5A',chipColor:'#1A2F5A',chipBg:'#E8F0FF',projects:[],duties:'',assigned_to:'',assigned_by:''} : chairsState.find(c=>c.id===id);
  if(!ch) return;
  document.getElementById('chm-id').value      = ch.id;
  document.getElementById('chm-name').value    = ch.name;
  document.getElementById('chm-lci').value     = ch.lci;
  document.getElementById('chm-duties').value  = ch.duties;
  document.getElementById('chm-tags').value    = (ch.projects||[]).join(', ');
  document.getElementById('chm-delete').style.display = id==='new'?'none':'inline-flex';
  document.getElementById('chairModal').classList.remove('hidden');
}

async function saveChairModal(){
  if(!requireAuth()) return;
  const id = document.getElementById('chm-id').value;
  const name = document.getElementById('chm-name').value.trim();
  if(!name){ toast('Name cannot be empty.','error'); return; }
  const tagsRaw = document.getElementById('chm-tags').value;
  const projects = tagsRaw.split(',').map(s=>s.trim()).filter(Boolean);
  const existing = id==='new' ? null : chairsState.find(c=>c.id===id);
  const row = {
    ...(existing||DEFAULT_CHAIRS[0]),
    id: id==='new' ? 'ch_'+Date.now() : id,
    name,
    lci:    document.getElementById('chm-lci').value.trim(),
    duties: document.getElementById('chm-duties').value.trim(),
    projects,
    order:  existing?.order || chairsState.length+1,
  };
  if(id==='new') chairsState.push(row); else { const i=chairsState.findIndex(c=>c.id===id); chairsState[i]=row; }
  await dbUpsert('chairpersons', row);
  await logActivity(SESSION.lion_id, SESSION.name, 'chairperson', `${id==='new'?'added':'edited'} chairperson: ${name}`);
  document.getElementById('chairModal').classList.add('hidden');
  renderChairs();
}

async function deleteChair(){
  const id = document.getElementById('chm-id').value;
  const ch = chairsState.find(c=>c.id===id);
  if(!ch||!confirm(`Delete "${ch.name}"?`)) return;
  chairsState = chairsState.filter(c=>c.id!==id);
  await dbDelete('chairpersons', id);
  document.getElementById('chairModal').classList.add('hidden');
  renderChairs();
}

// ============================================================
// budget.js — Budget Tracker page
// ============================================================

let budgetState = [];
let budgetSortStatus = 'all';

async function initBudget(){
  const data = await dbGet('budget','id');
  if(data.length){ budgetState = data; }
  else { budgetState = DEFAULT_BUDGET; for(const r of DEFAULT_BUDGET) await DB.from('budget').upsert(r,{onConflict:'id'}); }
  renderBudget();
}

function renderBudget(){
  let rows = [...budgetState];
  if(budgetSortStatus!=='all') rows = rows.filter(r=>r.status===budgetSortStatus);

  const tbody = document.getElementById('budget-rows');
  if(!tbody) return;
  tbody.innerHTML = rows.map(row=>{
    const updby = row.updated_by ? `<div class="updated-by">Updated by ${row.updated_by}</div>` : '';
    const opts  = ['pending','paid','na'].map(s=>`<option value="${s}"${row.status===s?' selected':''}>${s==='na'?'N/A':s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('');
    const scls  = row.status==='paid'?'status-paid':row.status==='pending'?'status-pending':'status-na';
    return `
    <div class="btrow">
      <div>
        <input class="inline-edit" type="text" value="${row.item}" onblur="updateBudgetField('${row.id}','item',this.value)" />
        <span class="btcat">${row.cat}</span>
        ${updby}
      </div>
      <span><input type="number" class="num-input" value="${row.est||0}" onblur="updateBudgetField('${row.id}','est',this.value)" /></span>
      <span><input type="number" class="num-input" value="${row.actual||0}" onblur="updateBudgetField('${row.id}','actual',this.value)" /></span>
      <span>
        <select class="${scls}" onchange="updateBudgetField('${row.id}','status',this.value)">${opts}</select>
      </span>
      <span class="note-cell">
        <button class="icon-btn" onclick="toggleNote('${row.id}')" title="Note">📝</button>
        <div class="note-popup hidden" id="note-${row.id}">
          <textarea placeholder="Add note…" onblur="updateBudgetField('${row.id}','note',this.value)">${row.note||''}</textarea>
        </div>
      </span>
    </div>`; }).join('');

  calcBudget();
}

function toggleNote(id){
  const el = document.getElementById('note-'+id);
  if(el) el.classList.toggle('hidden');
}

async function updateBudgetField(id, field, val){
  if(!requireAuth()) return;
  const row = budgetState.find(r=>r.id===id);
  if(!row) return;
  const prev = row[field];
  const newVal = (field==='est'||field==='actual') ? parseFloat(val)||0 : val;
  if(prev===newVal) return;

  if(field!=='note' && !confirm(`Update "${row.item}" — ${field} to "${val}"?`)){ renderBudget(); return; }

  row[field]      = newVal;
  row.updated_by  = SESSION.name;
  row.updated_at  = new Date().toISOString();
  calcBudget();
  await dbUpsert('budget', row);
  await logActivity(SESSION.lion_id, SESSION.name, 'budget', `updated "${row.item}" (${field})`);
}

function calcBudget(){
  let total=0, paid=0, pending=0;
  budgetState.forEach(r=>{ const e=parseFloat(r.est)||0,a=parseFloat(r.actual)||0; total+=e; if(r.status==='paid') paid+=a||e; else if(r.status==='pending') pending+=e; });
  setText('b-total',   '₹'+total.toLocaleString('en-IN'));
  setText('b-paid',    '₹'+paid.toLocaleString('en-IN'));
  setText('b-pending', '₹'+pending.toLocaleString('en-IN'));
}

async function addBudgetRow(){
  if(!requireAuth()) return;
  const row = {id:'b_'+Date.now(),item:'New expense',cat:'Event',est:0,actual:0,status:'pending',note:'',updated_by:SESSION.name,updated_at:new Date().toISOString()};
  budgetState.push(row);
  await dbUpsert('budget', row);
  await logActivity(SESSION.lion_id, SESSION.name, 'budget', 'added new budget item');
  renderBudget();
}

function exportBudgetPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const today = new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'});
  let total=0,paid=0,pending=0;
  budgetState.forEach(r=>{ const e=parseFloat(r.est)||0,a=parseFloat(r.actual)||0; total+=e; if(r.status==='paid') paid+=a||e; else if(r.status==='pending') pending+=e; });

  doc.setFillColor(11,26,59); doc.rect(0,0,210,40,'F');
  doc.setTextColor(201,168,76); doc.setFont('helvetica','bold'); doc.setFontSize(14);
  doc.text('Lions Club of Chennai Super Kings',105,16,{align:'center'});
  doc.setTextColor(255,255,255); doc.setFontSize(10); doc.setFont('helvetica','normal');
  doc.text('Club No. 192069 · District 3241 E · Installation Budget Report',105,26,{align:'center'});
  doc.text(`Date: ${today}`,105,34,{align:'center'});

  doc.setTextColor(11,26,59); doc.setFontSize(11); doc.setFont('helvetica','bold');
  doc.text('Summary',14,52);
  doc.setFont('helvetica','normal'); doc.setFontSize(10);
  doc.text(`Total Estimated:  ₹${total.toLocaleString('en-IN')}`,14,60);
  doc.text(`Amount Paid:      ₹${paid.toLocaleString('en-IN')}`,14,67);
  doc.text(`Pending:          ₹${pending.toLocaleString('en-IN')}`,14,74);
  doc.text(`Member Collection: ₹40,000 (₹2,000 × 20 members)`,14,81);

  doc.autoTable({
    startY:90,
    head:[['#','Expense Item','Category','Estimated (₹)','Actual (₹)','Status']],
    body: budgetState.map((r,i)=>[i+1,r.item,r.cat,(parseFloat(r.est)||0).toLocaleString('en-IN'),(parseFloat(r.actual)||0).toLocaleString('en-IN'),r.status.toUpperCase()]),
    headStyles:{fillColor:[11,26,59],textColor:[201,168,76],fontStyle:'bold'},
    alternateRowStyles:{fillColor:[247,245,240]},
    styles:{fontSize:9},
  });

  const finalY = doc.lastAutoTable.finalY + 20;
  doc.setDrawColor(180,180,180);
  doc.line(14, finalY, 100, finalY);
  doc.line(110, finalY, 196, finalY);
  doc.setFontSize(9); doc.setTextColor(100,100,100);
  doc.text('Treasurer Signature', 14, finalY+6);
  doc.text('President Signature', 110, finalY+6);
  doc.text('Aashaya Philip · Club Treasurer', 14, finalY+12);
  doc.text('K.V Udhaya Raj · Club President', 110, finalY+12);

  doc.setFontSize(8); doc.setTextColor(150,150,150);
  doc.text(`Generated by LC CSK Planner · ${today}`, 105, 285, {align:'center'});
  doc.save('LC_CSK_Budget_Report.pdf');
  toast('PDF downloaded ✓', 'success');
}

// ============================================================
// admin.js — Admin panel (activity log + reset)
// ============================================================

async function initAdmin(){
  if(!isAdmin()){ toast('Admin access required.','error'); showPage('home'); return; }
  await loadActivityLog();
  renderMembersTable();
}

async function loadActivityLog(){
  const data = await getActivityLog(200);
  const c = document.getElementById('activity-log');
  if(!c) return;
  if(!data.length){ c.innerHTML='<div class="log-empty">No activity yet.</div>'; return; }
  c.innerHTML = data.map(item=>{
    const initials = (item.lion_name||'?').split(' ').map(w=>w&&w[0]).join('').toUpperCase().slice(0,2);
    const time = new Date(item.created_at).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
    const typeColors={task:'#0D7C6B',agenda:'#9C6A0A',budget:'#B83A2A',chairperson:'#5A3A8A',login:'#1A2F5A'};
    const tc = typeColors[item.action_type]||'#888';
    return `<div class="log-item">
      <div class="log-avatar" style="background:${tc}">${initials}</div>
      <div class="log-text">
        <span class="log-name">${item.lion_name||'Unknown'}</span>
        <span class="log-badge" style="background:${tc}20;color:${tc}">${item.action_type}</span>
        ${item.description}
        <div class="log-time">${time}</div>
      </div></div>`;
  }).join('');
}

function renderMembersTable(){
  const c = document.getElementById('members-table');
  if(!c) return;
  c.innerHTML = `
    <div class="bthead" style="grid-template-columns:1fr 1fr 1.5fr auto"><span>Lion ID</span><span>Name</span><span>Role</span><span>Admin</span></div>
    ${MEMBERS_SEED.map(m=>`
    <div class="btrow" style="grid-template-columns:1fr 1fr 1.5fr auto">
      <span style="font-family:monospace;font-size:12px">${m.lion_id}</span>
      <span>${m.name}</span>
      <span style="font-size:12px;color:var(--text-muted)">${m.role}</span>
      <span>${m.is_admin?'✅':''}</span>
    </div>`).join('')}`;
}

async function resetAllData(){
  if(!isAdmin()) return;
  const code = prompt('Type RESET to confirm deleting ALL data. This cannot be undone.');
  if(code !== 'RESET'){ toast('Reset cancelled.','error'); return; }
  toast('Resetting all data…','error');
  await Promise.all([
    DB.from('tasks').delete().neq('id','__never__'),
    DB.from('phases').delete().neq('id','__never__'),
    DB.from('agenda').delete().neq('id','__never__'),
    DB.from('chairpersons').delete().neq('id','__never__'),
    DB.from('budget').delete().neq('id','__never__'),
    DB.from('activity_log').delete().neq('id',0),
  ]);
  toast('All data reset. Reloading…','success');
  setTimeout(()=>location.reload(), 1500);
}

// ============================================================
// pages/home.js — Home page (Lions International info)
// ============================================================

function renderHome(){
  const c = document.getElementById('page-home');
  if(!c) return;
  c.innerHTML = `
  <div class="home-hero">
    <div class="home-hero-inner">
      <div class="hero-badge">Est. 1917 · 200+ Countries</div>
      <h1>Lions Clubs <span>International</span></h1>
      <p>The world's largest service club organisation, empowering volunteers to serve their communities.</p>
    </div>
  </div>
  <div class="container">
    <div class="info-grid">
      <div class="info-card"><div class="info-icon">👁️</div><div class="info-title">Vision</div><div class="info-desc">To be the global leader in community and humanitarian service.</div></div>
      <div class="info-card"><div class="info-icon">🤝</div><div class="info-title">Mission</div><div class="info-desc">Empower Lions clubs and volunteers to improve health, strengthen communities, and support those in need.</div></div>
      <div class="info-card"><div class="info-icon">🌍</div><div class="info-title">Motto</div><div class="info-desc" style="font-size:22px;font-weight:700;color:var(--gold)">We Serve</div></div>
    </div>

    <div class="section-title" style="margin-top:32px">LCI Global Causes</div>
    <p class="section-sub">Our 6 global causes guide all service activities worldwide</p>
    <div class="causes-grid">
      <div class="cause-card" style="border-top:3px solid #0D7C6B"><div class="cause-icon">🩺</div><strong>Diabetes</strong><p>Awareness, prevention, and support for those living with diabetes.</p></div>
      <div class="cause-card" style="border-top:3px solid #9C6A0A"><div class="cause-icon">🍚</div><strong>Hunger</strong><p>Fighting food insecurity and providing meals to those in need.</p></div>
      <div class="cause-card" style="border-top:3px solid #2A6B3A"><div class="cause-icon">🌿</div><strong>Environment</strong><p>Protecting our planet through service and education.</p></div>
      <div class="cause-card" style="border-top:3px solid #5A3A8A"><div class="cause-icon">👁️</div><strong>Vision</strong><p>Providing sight-saving services since Lions' founding in 1917.</p></div>
      <div class="cause-card" style="border-top:3px solid #B83A2A"><div class="cause-icon">🎗️</div><strong>Childhood Cancer</strong><p>Supporting children and families affected by cancer.</p></div>
      <div class="cause-card" style="border-top:3px solid #C9A84C"><div class="cause-icon">🤝</div><strong>Humanitarian</strong><p>Disaster relief and emergency humanitarian response worldwide.</p></div>
    </div>

    <div class="section-title" style="margin-top:32px">About Lions Clubs International</div>
    <div class="about-lci-grid">
      <div class="stat-card"><div class="stat-num" style="color:var(--gold)">1.4M+</div><div class="stat-lbl">Members worldwide</div></div>
      <div class="stat-card"><div class="stat-num" style="color:var(--teal)">49,000+</div><div class="stat-lbl">Clubs globally</div></div>
      <div class="stat-card"><div class="stat-num" style="color:var(--navy)">200+</div><div class="stat-lbl">Countries & regions</div></div>
      <div class="stat-card"><div class="stat-num" style="color:var(--red)">1917</div><div class="stat-lbl">Founded in Chicago</div></div>
    </div>

    <div class="lci-contact">
      <strong>Contact Lions Clubs International</strong>
      <div class="contact-grid">
        <div><div class="contact-label">ISAME Regional Office — India</div><div>📞 (+91) 22-61217900 &nbsp;·&nbsp; 9:00 AM – 5:30 PM IST</div><div>✉️ Lionssupport@lionsclubs.org</div></div>
        <div><div class="contact-label">Headquarters — USA</div><div>📞 (+1) 630-468-6900 &nbsp;·&nbsp; 8:00 AM – 4:30 PM CST</div></div>
      </div>
    </div>
  </div>`;
}

// ============================================================
// pages/about.js — About Club page
// ============================================================

function renderAbout(){
  const c = document.getElementById('page-about');
  if(!c) return;

  const officers = MEMBERS_SEED.filter(m=>m.role!=='Member');
  const members  = MEMBERS_SEED;

  c.innerHTML = `
  <div style="background:var(--navy);padding:32px 20px;text-align:center;position:relative;overflow:hidden">
    <div style="position:absolute;inset:0;background:repeating-linear-gradient(45deg,transparent,transparent 40px,rgba(201,168,76,0.04) 40px,rgba(201,168,76,0.04) 80px)"></div>
    <div class="hero-badge">District 3241 E · Club No. 192069</div>
    <h1 style="color:#fff;font-size:clamp(18px,3vw,30px)">Lions Club of <span style="color:var(--gold)">Chennai Super Kings</span></h1>
    <p style="color:rgba(255,255,255,0.5);font-size:13px;margin-top:6px">Newly Chartered · March 2, 2026 · E-Waste Specialty</p>
  </div>

  <div class="container">
    <div class="about-sub-tabs">
      <button class="about-tab active" onclick="showAboutSection('details',this)">Details</button>
      <button class="about-tab" onclick="showAboutSection('members',this)">Members (${members.length})</button>
      <button class="about-tab" onclick="showAboutSection('officers',this)">Officers (${officers.length})</button>
      <button class="about-tab" onclick="showAboutSection('service',this)">Service Activities</button>
    </div>

    <!-- DETAILS -->
    <div id="about-details" class="about-section">
      <div class="detail-grid">
        <div class="detail-item"><div class="detail-label">Account Name</div><div class="detail-val">Chennai Super Kings</div></div>
        <div class="detail-item"><div class="detail-label">Lion ID</div><div class="detail-val">192069</div></div>
        <div class="detail-item"><div class="detail-label">Type</div><div class="detail-val">Leo Lions</div></div>
        <div class="detail-item"><div class="detail-label">Status</div><div class="detail-val"><span class="status-badge-green">Newly Chartered</span></div></div>
        <div class="detail-item"><div class="detail-label">Total Members</div><div class="detail-val">20</div></div>
        <div class="detail-item"><div class="detail-label">Parent Account</div><div class="detail-val">District 3241 E</div></div>
        <div class="detail-item"><div class="detail-label">Charter Date</div><div class="detail-val">March 2, 2026</div></div>
        <div class="detail-item"><div class="detail-label">Specialty</div><div class="detail-val">Cause-Specific</div></div>
        <div class="detail-item"><div class="detail-label">Club Sub-Specialty</div><div class="detail-val">Environment</div></div>
        <div class="detail-item"><div class="detail-label">Specialty Description</div><div class="detail-val">E Waste</div></div>
        <div class="detail-item"><div class="detail-label">Region / Zone</div><div class="detail-val">District 3241 E</div></div>
      </div>
    </div>

    <!-- MEMBERS -->
    <div id="about-members" class="about-section hidden">
      <div class="members-list">
        ${members.map((m,i)=>`
        <div class="member-row">
          <div class="member-avatar" style="background:var(--navy-light)">${m.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</div>
          <div>
            <div class="member-name">${m.name}</div>
            <div class="member-role">${m.role}</div>
          </div>
          <div class="member-id">ID: ${m.lion_id}</div>
        </div>`).join('')}
      </div>
    </div>

    <!-- OFFICERS -->
    <div id="about-officers" class="about-section hidden">
      <div class="officers-grid">
        ${officers.map(m=>`
        <div class="officer-card">
          <div class="officer-avatar">${m.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</div>
          <div class="officer-name">${m.name}</div>
          <div class="officer-role">${m.role}</div>
        </div>`).join('')}
      </div>
    </div>

    <!-- SERVICE -->
    <div id="about-service" class="about-section hidden">
      <div class="empty-state">
        <div style="font-size:40px">🦁</div>
        <div style="font-size:16px;font-weight:600;margin-top:12px">Service Activities Coming Soon</div>
        <div style="font-size:13px;color:var(--text-muted);margin-top:6px">Service activities will appear here once the club begins its projects.</div>
      </div>
    </div>
  </div>`;
}

function showAboutSection(id, btn){
  document.querySelectorAll('.about-section').forEach(s=>s.classList.add('hidden'));
  document.querySelectorAll('.about-tab').forEach(t=>t.classList.remove('active'));
  const el = document.getElementById('about-'+id);
  if(el) el.classList.remove('hidden');
  if(btn) btn.classList.add('active');
}
