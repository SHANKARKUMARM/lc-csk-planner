// ============================================================
// planning.js — Planning & Checklist page
// ============================================================

let phasesState = []; // live data from DB
let tasksState  = []; // live data from DB
let undoQueue   = null;
let filterP     = 'all';
let filterS     = 'all';
let sortBy      = 'order';
let eventDate   = null;

// ── INIT ─────────────────────────────────────────────────────
async function initPlanning(){
  const [phases, tasks, evtDate] = await Promise.all([
    dbGet('phases','order'),
    dbGet('tasks','order'),
    getSetting('event_date')
  ]);
  phasesState = phases.length ? phases : DEFAULT_PHASES.map(p=>({...p, tasks:undefined}));
  tasksState  = tasks.length  ? tasks  : DEFAULT_PHASES.flatMap(p=>p.tasks);
  eventDate   = evtDate;

  if(!phases.length){ for(const p of DEFAULT_PHASES){ await DB.from('phases').upsert({id:p.id,order:p.order,label:p.label,cls:p.cls},{onConflict:'id'}); } }
  if(!tasks.length){  for(const ph of DEFAULT_PHASES){ for(const t of ph.tasks){ await DB.from('tasks').upsert(t,{onConflict:'id'}); } } }

  renderPlanningPage();
  updateCountdown();
}

// ── RENDER ───────────────────────────────────────────────────
function renderPlanningPage(){
  updatePlanningStats();
  renderPlanningFilters();
  renderPhases();
}

function updatePlanningStats(){
  const all   = tasksState;
  const done  = all.filter(t=>t.done).length;
  const urgent= all.filter(t=>t.p==='urgent'&&!t.done).length;
  const pct   = all.length ? Math.round(done/all.length*100) : 0;
  setText('p-total', all.length);
  setText('p-done', done);
  setText('p-urgent', urgent);
  setText('p-pct', pct+'%');
  setStyle('p-bar','width', pct+'%');
  setText('h-total', all.length);
  setText('h-done', done);
  setText('h-pct', pct+'%');
}

function renderPlanningFilters(){
  const bar = document.getElementById('filter-bar');
  if(!bar) return;
  bar.innerHTML = `
    <div class="filter-group">
      <label>Priority</label>
      <select onchange="filterP=this.value;renderPhases()">
        <option value="all">All</option>
        <option value="urgent">Urgent</option>
        <option value="high">High</option>
        <option value="med">Medium</option>
        <option value="low">Low</option>
      </select>
    </div>
    <div class="filter-group">
      <label>Status</label>
      <select onchange="filterS=this.value;renderPhases()">
        <option value="all">All</option>
        <option value="pending">Pending</option>
        <option value="done">Done</option>
      </select>
    </div>
    <div class="filter-group">
      <label>Sort by</label>
      <select onchange="sortBy=this.value;renderPhases()">
        <option value="order">Default</option>
        <option value="deadline">Deadline</option>
        <option value="priority">Priority</option>
      </select>
    </div>
    ${isAdmin() ? `<button class="btn-sm btn-outline" onclick="showAddPhaseModal()">+ Add Phase</button>` : ''}
  `;
}

function renderPhases(){
  const container = document.getElementById('phases-container');
  if(!container) return;
  container.innerHTML = '';

  const sortedPhases = [...phasesState].sort((a,b)=>a.order-b.order);

  sortedPhases.forEach(ph => {
    let tasks = tasksState.filter(t=>t.phase_id===ph.id || ph.id===getPhaseIdForLegacy(t));

    // Apply filters
    if(filterP !== 'all') tasks = tasks.filter(t=>t.p===filterP);
    if(filterS !== 'all') tasks = tasks.filter(t=> filterS==='done' ? t.done : !t.done);

    // Sort
    if(sortBy === 'deadline') tasks.sort((a,b)=>{ if(!a.deadline) return 1; if(!b.deadline) return -1; return new Date(a.deadline)-new Date(b.deadline); });
    else if(sortBy === 'priority'){ const o={urgent:0,high:1,med:2,low:3}; tasks.sort((a,b)=>(o[a.p]||3)-(o[b.p]||3)); }
    else tasks.sort((a,b)=>a.order-b.order);

    const doneCount = tasksState.filter(t=>(t.phase_id===ph.id||getPhaseIdForLegacy(t)===ph.id)&&t.done).length;
    const totalCount = tasksState.filter(t=>t.phase_id===ph.id||getPhaseIdForLegacy(t)===ph.id).length;
    const phPct = totalCount ? Math.round(doneCount/totalCount*100) : 0;

    const div = document.createElement('div');
    div.className = 'phase';
    div.dataset.phaseId = ph.id;

    const taskRows = tasks.map(t => renderTaskRow(t, ph)).join('');

    div.innerHTML = `
      <div class="phase-header ${ph.cls} open" onclick="togglePhase(this)">
        <div style="flex:1">
          <div style="font-weight:600;font-size:14px">${ph.label}</div>
          <div style="font-size:11px;opacity:.7;margin-top:2px">${doneCount}/${totalCount} done · ${phPct}%</div>
        </div>
        <div class="phase-prog-mini"><div style="width:${phPct}%;height:100%;background:var(--teal);border-radius:3px;transition:width .3s"></div></div>
        ${isAdmin()?`<button class="icon-btn" title="Edit phase" onclick="event.stopPropagation();editPhase('${ph.id}')">✏️</button>`:''}
        <span class="toggle-icon">▼</span>
      </div>
      <div class="phase-body" id="body-${ph.id}">
        ${taskRows}
        <div class="add-task-row" onclick="showAddTaskModal('${ph.id}')">+ Add task to this phase</div>
      </div>`;

    container.appendChild(div);

    // Confetti if phase just hit 100%
    if(phPct === 100 && totalCount > 0) triggerConfetti();
  });
}

function getPhaseIdForLegacy(task){
  // Maps legacy task IDs (t1_x, t2_x etc.) to phase IDs
  const m = task.id.match(/^t(\d+)_/);
  if(m) return 'ph'+m[1];
  return task.phase_id || 'ph1';
}

function renderTaskRow(t, ph){
  const isDone = !!t.done;
  const pcls  = {urgent:'p-urgent',high:'p-high',med:'p-med',low:'p-low'}[t.p] || 'p-low';
  const plbl  = {urgent:'Urgent',high:'High',med:'Medium',low:'Low'}[t.p] || 'Low';
  const doneby = isDone && t.done_by ? `<span class="task-done-by">✓ ${t.done_by}</span>` : '';

  // Deadline info
  let deadlineHtml = '';
  if(t.deadline){
    const days = Math.ceil((new Date(t.deadline)-new Date())/(1000*60*60*24));
    const dcls = days < 0 ? 'deadline-red' : days <= 3 ? 'deadline-amber' : 'deadline-ok';
    const dlbl = days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d left`;
    deadlineHtml = `<span class="deadline-badge ${dcls}">${dlbl}</span>`;
  }

  // Move controls
  const phaseOpts = phasesState.sort((a,b)=>a.order-b.order)
    .filter(p=>p.id !== (t.phase_id||getPhaseIdForLegacy(t)))
    .map(p=>`<option value="${p.id}">${p.label.slice(0,35)}…</option>`).join('');

  return `
    <div class="task ${isDone?'done':''} ${t.p==='urgent'&&!isDone?'task-urgent-bg':''}" id="task-${t.id}">
      <div class="task-cb" onclick="toggleTask('${t.id}')">
        <div class="checkbox ${isDone?'checked':''}"></div>
      </div>
      <div class="task-content" onclick="toggleTask('${t.id}')">
        <div class="task-title">${t.t}</div>
        ${t.note?`<div class="task-note">${t.note}</div>`:''}
        <div class="task-meta">
          <span class="task-who">${t.who||''}</span>
          ${deadlineHtml}
          ${doneby}
        </div>
      </div>
      <div class="task-actions">
        <span class="priority ${pcls}">${plbl}</span>
        <button class="icon-btn" onclick="editTask('${t.id}')" title="Edit">✏️</button>
        <div class="move-wrap">
          <button class="icon-btn" onclick="moveTask('${t.id}',-1)" title="Move up">↑</button>
          <button class="icon-btn" onclick="moveTask('${t.id}',1)" title="Move down">↓</button>
          <select class="move-phase-select" title="Move to phase" onchange="moveTaskToPhase('${t.id}',this.value);this.value=''">
            <option value="">Move to…</option>${phaseOpts}
          </select>
        </div>
      </div>
    </div>`;
}

// ── TOGGLE TASK ───────────────────────────────────────────────
async function toggleTask(taskId){
  if(!requireAuth()) return;
  const task = tasksState.find(t=>t.id===taskId);
  if(!task) return;

  // Confirm uncheck
  if(task.done && !confirm(`Mark "${task.t}" as not done?`)) return;

  const prevDone = task.done;
  const prevDoneBy = task.done_by;

  task.done    = !task.done;
  task.done_by = task.done ? SESSION.name : '';
  task.done_at = task.done ? new Date().toISOString() : null;
  renderPhases();
  updatePlanningStats();

  const ok = await dbUpsert('tasks', task);
  if(!ok){ task.done=prevDone; task.done_by=prevDoneBy; renderPhases(); return; }

  await logActivity(SESSION.lion_id, SESSION.name, 'task', `${task.done?'completed':'uncompleted'} task: ${task.t}`);

  // Undo toast
  if(task.done){
    showUndoToast(`"${task.t.slice(0,30)}" marked done`, async () => {
      task.done=false; task.done_by=''; task.done_at=null;
      await dbUpsert('tasks', task);
      renderPhases(); updatePlanningStats();
    });
  }
}

// ── EDIT TASK ─────────────────────────────────────────────────
function editTask(taskId){
  if(!requireAuth()) return;
  const task = tasksState.find(t=>t.id===taskId);
  if(!task) return;

  const m = document.getElementById('taskModal');
  document.getElementById('tm-id').value      = task.id;
  document.getElementById('tm-title').value   = task.t;
  document.getElementById('tm-note').value    = task.note||'';
  document.getElementById('tm-who').value     = task.who||'';
  document.getElementById('tm-priority').value= task.p||'med';
  document.getElementById('tm-deadline').value= task.deadline||'';
  document.getElementById('tm-delete').style.display = isAdmin()?'inline-flex':'none';
  document.getElementById('taskModalTitle').textContent = 'Edit Task';
  m.classList.remove('hidden');
}

function showAddTaskModal(phaseId){
  if(!requireAuth()) return;
  document.getElementById('tm-id').value       = 'new__'+phaseId+'__'+Date.now();
  document.getElementById('tm-title').value    = '';
  document.getElementById('tm-note').value     = '';
  document.getElementById('tm-who').value      = '';
  document.getElementById('tm-priority').value = 'med';
  document.getElementById('tm-deadline').value = '';
  document.getElementById('tm-delete').style.display = 'none';
  document.getElementById('taskModalTitle').textContent = 'Add Task';
  document.getElementById('taskModal').classList.remove('hidden');
}

async function saveTaskModal(){
  if(!requireAuth()) return;
  const id  = document.getElementById('tm-id').value;
  const ttl = document.getElementById('tm-title').value.trim();
  if(!ttl){ toast('Task title cannot be empty.','error'); return; }

  if(id.startsWith('new__')){
    const parts   = id.split('__');
    const phaseId = parts[1];
    const phTasks = tasksState.filter(t=>getPhaseIdForLegacy(t)===phaseId||t.phase_id===phaseId);
    const newTask = {
      id: 'tu_'+Date.now(),
      phase_id: phaseId,
      order: phTasks.length + 1,
      t: ttl,
      note: document.getElementById('tm-note').value.trim(),
      who:  document.getElementById('tm-who').value.trim(),
      p:    document.getElementById('tm-priority').value,
      deadline: document.getElementById('tm-deadline').value,
      done: false, done_by:'', done_at:null
    };
    tasksState.push(newTask);
    await dbUpsert('tasks', newTask);
    await logActivity(SESSION.lion_id, SESSION.name, 'task', `added new task: ${newTask.t}`);
  } else {
    const task = tasksState.find(t=>t.id===id);
    if(!task) return;
    task.t        = ttl;
    task.note     = document.getElementById('tm-note').value.trim();
    task.who      = document.getElementById('tm-who').value.trim();
    task.p        = document.getElementById('tm-priority').value;
    task.deadline = document.getElementById('tm-deadline').value;
    await dbUpsert('tasks', task);
    await logActivity(SESSION.lion_id, SESSION.name, 'task', `edited task: ${task.t}`);
  }

  document.getElementById('taskModal').classList.add('hidden');
  renderPhases();
  updatePlanningStats();
}

async function deleteTask(){
  const id = document.getElementById('tm-id').value;
  const task = tasksState.find(t=>t.id===id);
  if(!task || !confirm(`Delete task "${task.t}"? This cannot be undone.`)) return;
  tasksState = tasksState.filter(t=>t.id!==id);
  await dbDelete('tasks', id);
  await logActivity(SESSION.lion_id, SESSION.name, 'task', `deleted task: ${task.t}`);
  document.getElementById('taskModal').classList.add('hidden');
  renderPhases(); updatePlanningStats();
}

// ── MOVE TASK ─────────────────────────────────────────────────
async function moveTask(taskId, dir){
  if(!requireAuth()) return;
  const task = tasksState.find(t=>t.id===taskId);
  if(!task) return;
  const phId  = task.phase_id || getPhaseIdForLegacy(task);
  const group = tasksState.filter(t=>(t.phase_id||getPhaseIdForLegacy(t))===phId).sort((a,b)=>a.order-b.order);
  const idx   = group.findIndex(t=>t.id===taskId);
  const swap  = group[idx+dir];
  if(!swap) return;
  [task.order, swap.order] = [swap.order, task.order];
  await Promise.all([dbUpsert('tasks',task), dbUpsert('tasks',swap)]);
  renderPhases();
}

async function moveTaskToPhase(taskId, newPhaseId){
  if(!requireAuth() || !newPhaseId) return;
  const task = tasksState.find(t=>t.id===taskId);
  if(!task) return;
  const phTasks = tasksState.filter(t=>(t.phase_id||getPhaseIdForLegacy(t))===newPhaseId);
  task.phase_id = newPhaseId;
  task.order    = phTasks.length + 1;
  await dbUpsert('tasks', task);
  await logActivity(SESSION.lion_id, SESSION.name, 'task', `moved task "${task.t}" to another phase`);
  renderPhases();
}

// ── ADD/EDIT PHASE ────────────────────────────────────────────
function showAddPhaseModal(){
  document.getElementById('pm-id').value    = '';
  document.getElementById('pm-label').value = '';
  document.getElementById('phaseModal').classList.remove('hidden');
}

function editPhase(phaseId){
  const ph = phasesState.find(p=>p.id===phaseId);
  if(!ph) return;
  document.getElementById('pm-id').value    = ph.id;
  document.getElementById('pm-label').value = ph.label;
  document.getElementById('phaseModal').classList.remove('hidden');
}

async function savePhaseModal(){
  if(!requireAuth()) return;
  const id    = document.getElementById('pm-id').value;
  const label = document.getElementById('pm-label').value.trim();
  if(!label){ toast('Phase name cannot be empty.','error'); return; }

  if(!id){
    const newPh = { id:'ph_'+Date.now(), order: phasesState.length+1, label, cls:'ph-0' };
    phasesState.push(newPh);
    await dbUpsert('phases', newPh);
    await logActivity(SESSION.lion_id, SESSION.name, 'phase', `added new phase: ${label}`);
  } else {
    const ph = phasesState.find(p=>p.id===id);
    if(ph){ ph.label=label; await dbUpsert('phases', ph); }
  }
  document.getElementById('phaseModal').classList.add('hidden');
  renderPhases();
}

// ── COUNTDOWN ─────────────────────────────────────────────────
async function updateCountdown(){
  const dateStr = await getSetting('event_date');
  const banner  = document.getElementById('countdown-banner');
  if(!banner) return;
  if(!dateStr){ banner.innerHTML = isAdmin() ? `<span style="cursor:pointer" onclick="setEventDate()">📅 Set installation date to see countdown</span>` : ''; return; }
  const days = Math.ceil((new Date(dateStr) - new Date()) / (1000*60*60*24));
  if(days > 0)      banner.innerHTML = `🦁 Installation in <strong>${days} days</strong> — ${new Date(dateStr).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}`;
  else if(days===0) banner.innerHTML = `🎉 <strong>Installation Day is TODAY!</strong>`;
  else              banner.innerHTML = `✅ Installation was ${Math.abs(days)} days ago`;
  if(isAdmin()) banner.innerHTML += ` <span style="cursor:pointer;font-size:12px;opacity:.7" onclick="setEventDate()">✏️</span>`;
}

async function setEventDate(){
  const d = prompt('Enter installation date (YYYY-MM-DD):', await getSetting('event_date')||'');
  if(!d) return;
  await setSetting('event_date', d);
  updateCountdown();
}

// ── TOGGLE PHASE ──────────────────────────────────────────────
function togglePhase(header){
  header.classList.toggle('open');
  const body = header.nextElementSibling;
  if(body) body.classList.toggle('collapsed');
}

// ── UNDO TOAST ────────────────────────────────────────────────
let undoTimer = null;
function showUndoToast(msg, undoFn){
  const el = document.getElementById('undo-toast');
  if(!el) return;
  el.querySelector('.undo-msg').textContent = msg;
  el.classList.add('show');
  clearTimeout(undoTimer);
  el.querySelector('.undo-btn').onclick = () => { clearTimeout(undoTimer); el.classList.remove('show'); undoFn(); };
  undoTimer = setTimeout(()=> el.classList.remove('show'), 5000);
}

// ── CONFETTI ──────────────────────────────────────────────────
const _confettiDone = new Set();
function triggerConfetti(){
  const colors=['#C9A84C','#0D7C6B','#0B1A3B','#F0D98A','#E0F2EE'];
  const c = document.getElementById('confetti-canvas');
  if(!c) return;
  const ctx = c.getContext('2d');
  c.width=window.innerWidth; c.height=window.innerHeight;
  c.style.display='block';
  let pieces = Array.from({length:80},()=>({x:Math.random()*c.width,y:-20,r:Math.random()*6+3,color:colors[Math.floor(Math.random()*colors.length)],vx:(Math.random()-0.5)*4,vy:Math.random()*4+2,life:1}));
  function draw(){
    ctx.clearRect(0,0,c.width,c.height);
    pieces=pieces.filter(p=>p.life>0);
    pieces.forEach(p=>{ ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,2*Math.PI); ctx.fillStyle=p.color; ctx.globalAlpha=p.life; ctx.fill(); p.x+=p.vx; p.y+=p.vy; p.life-=0.015; });
    if(pieces.length) requestAnimationFrame(draw); else { ctx.clearRect(0,0,c.width,c.height); c.style.display='none'; }
  }
  draw();
}
