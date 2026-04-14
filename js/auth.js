// ============================================================
// auth.js — FINAL CLEAN VERSION (WORKING)
// ============================================================

let SESSION = null; // { lion_id, name, role, is_admin }

function getSession(){ return SESSION; }
function isAdmin(){ return SESSION?.is_admin || false; }


// ── INIT AUTH ────────────────────────────────────────────────
async function initAuth(){
  await seedMembersIfEmpty();

  const saved = localStorage.getItem('lccsk_session');
  if(saved){
    try {
      SESSION = JSON.parse(saved);
      updateUserChip();
      return true;
    } catch(e){
      localStorage.removeItem('lccsk_session');
    }
  }

  return false;
}


// ── LOGIN FUNCTION (FINAL) ───────────────────────────────────
async function attemptLogin(lionId){
  const trimmed = String(lionId).trim();

  if(!trimmed){
    toast('Please enter your Lion ID.', 'error');
    return false;
  }

  // 🔐 Admin login
  if(trimmed === ADMIN_CODE){
    SESSION = {
      lion_id:'admin',
      name:'Admin',
      role:'Administrator',
      is_admin:true
    };

    localStorage.setItem('lccsk_session', JSON.stringify(SESSION));
    updateUserChip();
    toast('Admin access granted.', 'success');
    return true;
  }

  try {
    // 🚀 Direct DB fetch (reliable)
    const { data, error } = await DB
      .from('members')
      .select('*');

    if(error){
      console.error("DB Error:", error.message);
      toast('Database error. Try again.', 'error');
      return false;
    }

    // 🔍 Match ID safely
    const member = data.find(m =>
      String(m.lion_id).trim() === trimmed
    );

    if(!member){
      toast('Lion ID not recognised.', 'error');
      document.getElementById('loginError').textContent =
        'ID not found. Contact Lion Shankar Kumar M (Secretary).';
      return false;
    }

    // ✅ SESSION SET
    SESSION = {
      lion_id: member.lion_id,
      name: member.name,
      role: member.role,
      is_admin: member.is_admin
    };

    localStorage.setItem('lccsk_session', JSON.stringify(SESSION));
    updateUserChip();

    // 🔁 Track activity
    await heartbeat(SESSION.lion_id, SESSION.name);
    await logActivity(
      SESSION.lion_id,
      SESSION.name,
      'login',
      'opened the planner'
    );

    toast(`Welcome, ${SESSION.name}!`, 'success');

    return true;

  } catch (e) {
    console.error("Login error:", e.message);
    toast('Something went wrong.', 'error');
    return false;
  }
}


// ── LOGOUT ───────────────────────────────────────────────────
function logout(){
  if(!confirm('Log out?')) return;

  localStorage.removeItem('lccsk_session');
  SESSION = null;
  location.reload();
}


// ── UI HELPERS ───────────────────────────────────────────────
function updateUserChip(){
  const chip = document.getElementById('userChip');
  if(chip && SESSION){
    chip.textContent = SESSION.name;
  }
}


// ── AUTH CHECK ───────────────────────────────────────────────
function requireAuth(){
  if(!SESSION){
    toast('Please log in first.', 'error');
    return false;
  }
  return true;
}
