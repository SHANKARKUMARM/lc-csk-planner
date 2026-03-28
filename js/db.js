// ============================================================
// db.js — All Supabase database calls (FINAL CLEAN VERSION)
// ============================================================

const { createClient } = supabase;

// ✅ FIXED: correct key variable
const DB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// ── TOAST NOTIFICATIONS ──────────────────────────────────────
function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.className = 'toast show ' + type;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3000);
}


// ── GENERIC HELPERS ──────────────────────────────────────────
async function dbGet(table, order = 'id') {
  try {
    const { data, error } = await DB.from(table).select('*').order(order);
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error(`DB read error [${table}]:`, e.message);
    toast(`Could not load ${table}. Check connection.`, 'error');
    return [];
  }
}

async function dbUpsert(table, row) {
  try {
    const { error } = await DB.from(table).upsert(row, { onConflict: 'id' });
    if (error) throw error;
    toast('Saved ✓', 'success');
    return true;
  } catch (e) {
    console.error(`DB upsert error [${table}]:`, e.message);
    toast('Could not save. Please try again.', 'error');
    return false;
  }
}

async function dbDelete(table, id) {
  try {
    const { error } = await DB.from(table).delete().eq('id', id);
    if (error) throw error;
    toast('Deleted ✓', 'success');
    return true;
  } catch (e) {
    console.error(`DB delete error [${table}]:`, e.message);
    toast('Could not delete. Please try again.', 'error');
    return false;
  }
}

async function dbInsert(table, row) {
  try {
    const { error } = await DB.from(table).insert(row);
    if (error) throw error;
    return true;
  } catch (e) {
    console.error(`DB insert error [${table}]:`, e.message);
    return false;
  }
}


// ── MEMBERS ──────────────────────────────────────────────────
async function getMemberById(lionId) {
  try {
    const { data, error } = await DB
      .from('members')
      .select('*')
      .eq('lion_id', lionId)
      .maybeSingle(); // safer than .single()

    if (error) {
      console.error("Member fetch error:", error.message);
      return null;
    }

    return data;
  } catch (e) {
    console.error("Unexpected error:", e.message);
    return null;
  }
}

async function seedMembersIfEmpty() {
  const existing = await dbGet('members');
  if (existing.length > 0) return;

  for (const m of MEMBERS_SEED) {
    await DB.from('members').upsert(m, { onConflict: 'lion_id' });
  }
}


// ── ONLINE PRESENCE ──────────────────────────────────────────
async function heartbeat(lionId, name) {
  await DB.from('online_members').upsert(
    {
      lion_id: lionId,
      name,
      last_seen: new Date().toISOString()
    },
    { onConflict: 'lion_id' }
  );
}

async function getOnlineMembers() {
  try {
    const cutoff = new Date(Date.now() - 3 * 60 * 1000).toISOString();
    const { data } = await DB
      .from('online_members')
      .select('*')
      .gte('last_seen', cutoff);

    return data || [];
  } catch (e) {
    console.error("Online members error:", e.message);
    return [];
  }
}


// ── ACTIVITY LOG ─────────────────────────────────────────────
async function logActivity(lionId, name, actionType, description) {
  await dbInsert('activity_log', {
    lion_id: lionId,
    lion_name: name,
    action_type: actionType,
    description,
    created_at: new Date().toISOString()
  });
}

async function getActivityLog(limit = 100) {
  try {
    const { data } = await DB
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    return data || [];
  } catch (e) {
    console.error("Activity log error:", e.message);
    return [];
  }
}


// ── SETTINGS ─────────────────────────────────────────────────
async function getSetting(key) {
  try {
    const { data } = await DB
      .from('settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    return data ? data.value : null;
  } catch (e) {
    console.error("Settings read error:", e.message);
    return null;
  }
}

async function setSetting(key, value) {
  await DB.from('settings').upsert({ key, value }, { onConflict: 'key' });
}


// ── REALTIME SUBSCRIPTIONS ───────────────────────────────────
function subscribeAll(callbacks) {
  DB.channel('lccsk-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, p => callbacks.tasks?.(p))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'phases' }, p => callbacks.phases?.(p))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'agenda' }, p => callbacks.agenda?.(p))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'chairpersons' }, p => callbacks.chairs?.(p))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'budget' }, p => callbacks.budget?.(p))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'online_members' }, p => callbacks.online?.(p))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, p => callbacks.settings?.(p))
    .subscribe();
}
