const API_BASE ='https://gym-app-2muj.onrender.com/api';

function getToken() {
  return localStorage.getItem('token');
}

function headers() {
  const h = { 'Content-Type': 'application/json' };
  const t = getToken();
  if (t) h['Authorization'] = `Bearer ${t}`;
  return h;
}

export async function signup(gymName, email, password, name) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gymName, email, password, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Signup failed');
  return data;
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
}

export async function getMe() {
  const res = await fetch(`${API_BASE}/auth/me`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Unauthorized');
  return data;
}

export async function getMembers() {
  const res = await fetch(`${API_BASE}/members`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch members');
  return data;
}

export async function getMember(id) {
  const res = await fetch(`${API_BASE}/members/${id}`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch member');
  return data;
}

export async function createMember(body) {
  const res = await fetch(`${API_BASE}/members`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create member');
  return data;
}

export async function updateMember(id, body) {
  const res = await fetch(`${API_BASE}/members/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update member');
  return data;
}

export async function deleteMember(id) {
  const res = await fetch(`${API_BASE}/members/${id}`, {
    method: 'DELETE',
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete member');
  return data;
}

export async function getPlans() {
  const res = await fetch(`${API_BASE}/plans`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch plans');
  return data;
}

export async function getPlan(id) {
  const res = await fetch(`${API_BASE}/plans/${id}`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch plan');
  return data;
}

export async function createPlan(body) {
  const res = await fetch(`${API_BASE}/plans`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create plan');
  return data;
}

export async function updatePlan(id, body) {
  const res = await fetch(`${API_BASE}/plans/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update plan');
  return data;
}

export async function deletePlan(id) {
  const res = await fetch(`${API_BASE}/plans/${id}`, {
    method: 'DELETE',
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete plan');
  return data;
}

export async function checkInMember(memberId, date) {
  const res = await fetch(`${API_BASE}/attendance/check-in`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ memberId, date }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to record attendance');
  return data;
}

export async function uncheckMember(memberId, date) {
  const res = await fetch(`${API_BASE}/attendance/check-in`, {
    method: 'DELETE',
    headers: headers(),
    body: JSON.stringify({ memberId, date }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to remove attendance');
  return data;
}

export async function getAttendanceMonth(year, month) {
  const res = await fetch(
    `${API_BASE}/attendance/month?year=${year}&month=${month}`,
    { headers: headers() }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch attendance');
  return data;
}

export async function getAttendanceToday() {
  const res = await fetch(`${API_BASE}/attendance/today`, {
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch attendance');
  return data;
}

export async function getStats() {
  const res = await fetch(`${API_BASE}/stats`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch stats');
  return data;
}

export async function getAttendanceTodayHours() {
  const res = await fetch(`${API_BASE}/attendance/today-hours`, {
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch peak hours');
  return data;
}

export async function sendReminder(memberId, title, body) {
  const res = await fetch(`${API_BASE}/reminders/send`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ memberId, title, body }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to send reminder');
  return data;
}

export async function sendBulkReminders(memberIds, title, body) {
  const res = await fetch(`${API_BASE}/reminders/send-bulk`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ memberIds, title, body }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to send reminders');
  return data;
}

export async function getSettings() {
  const res = await fetch(`${API_BASE}/settings`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch settings');
  return data;
}

export async function updateSettings(body) {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update settings');
  return data;
}

export async function getWhatsAppSubscribeLink() {
  const res = await fetch(`${API_BASE}/config/whatsapp-link`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch');
  return data;
}

export async function getReminderLogs(limit = 20) {
  const res = await fetch(`${API_BASE}/reminders/logs?limit=${limit}`, {
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch reminder logs');
  return data;
}
