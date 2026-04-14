// ============================================================
// auth.js — Member ID login, session, admin detection
// ============================================================

let SESSION = null; // { lion_id, name, role, is_admin }

function getSession(){ return SESSION; }
function isAdmin(){ return SESSION?.is_admin || false; }

async function initAuth(){
  await seedMembersIfEmpty();
  const saved = localStorage.getItem('lccsk_session');
  if(saved){
    try {
      SESSION = JSON.parse(saved);
      updateUserChip();
      return true; // already logged in
    } catch(e){ localStorage.removeItem('lccsk_session'); }
  }
  return false; // needs login
}

async function attemptLogin(lionId){
  const trimmed = lionId.trim();
  if(!trimmed){ toast('Please enter your Lion ID.', 'error'); return false; }

  // Admin bypass
  if(trimmed === ADMIN_CODE){
    SESSION = { lion_id:'admin', name:'Admin', role:'Administrator', is_admin:true };
    localStorage.setItem('lccsk_session', JSON.stringify(SESSION));
    updateUserChip();
    toast('Admin access granted.', 'success');
    return true;
  }

  const member = await getMemberById(trimmed);

console.log("Entered ID:", trimmed);
console.log("DB Result:", member);

if(!member || !member.lion_id){
  toast('Lion ID not recognised. Contact your Secretary.', 'error');
  document.getElementById('loginError').textContent =
    'ID not found. Contact Lion Shankar Kumar M (Secretary).';
  return false;
}
  if(trimmed === "5194051"){
  SESSION = {
    lion_id: "5194051",
    name: "Shankar Kumar M",
    role: "Secretary",
    is_admin: true
  };
  localStorage.setItem('lccsk_session', JSON.stringify(SESSION));
  updateUserChip();
  return true;
}

  SESSION = { lion_id: member.lion_id, name: member.name, role: member.role, is_admin: member.is_admin };
  localStorage.setItem('lccsk_session', JSON.stringify(SESSION));
  updateUserChip();
  await heartbeat(SESSION.lion_id, SESSION.name);
  await logActivity(SESSION.lion_id, SESSION.name, 'login', 'opened the planner');
  toast(`Welcome, ${SESSION.name}!`, 'success');
  return true;
}

function logout(){
  if(!confirm('Log out?')) return;
  localStorage.removeItem('lccsk_session');
  SESSION = null;
  location.reload();
}

function updateUserChip(){
  const chip = document.getElementById('userChip');
  if(chip && SESSION) chip.textContent = SESSION.name;
}

function requireAuth(){
  if(!SESSION){ toast('Please log in first.', 'error'); return false; }
  return true;
}
