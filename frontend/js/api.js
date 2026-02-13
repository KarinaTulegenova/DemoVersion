// Shared API helpers for JWT-authenticated requests.
const API_BASE =
  localStorage.getItem("apiBase") ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5001/api"
    : "https://demoversion-p9vl.onrender.com/api");
const REMINDER_NOTIFIED_SLOTS_KEY = "reminderNotifiedSlots";
const REMINDER_POLL_MS = 30 * 1000;
const REMINDER_GRACE_MINUTES = 2;

let reminderNotifierStarted = false;
let reminderNotifierTimer = null;

function getToken() {
  return localStorage.getItem("token");
}

function setToken(token) {
  localStorage.setItem("token", token);
}

function clearToken() {
  localStorage.removeItem("token");
}

function showAlert(containerId, message, type = "danger") {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!message) {
    container.innerHTML = "";
    return;
  }
  container.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
}

async function apiRequest(method, url, body) {
  const headers = {
    "Content-Type": "application/json",
  };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 || res.status === 403) {
    clearToken();
    const isAuthPage = ["/login.html", "/register.html"].some((p) =>
      window.location.pathname.endsWith(p)
    );
    if (!isAuthPage) {
      window.location.href = "login.html";
    }
  }

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      data = { message: text };
    }
  }

  if (!res.ok) {
    const message = data?.message || data?.error || "Something went wrong.";
    throw new Error(message);
  }

  return data;
}

window.API_BASE = API_BASE;
window.apiRequest = apiRequest;
window.showAlert = showAlert;
window.getToken = getToken;
window.setToken = setToken;
window.clearToken = clearToken;

function loadNotifiedSlots() {
  try {
    const raw = localStorage.getItem(REMINDER_NOTIFIED_SLOTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
}

function saveNotifiedSlots(slots) {
  localStorage.setItem(REMINDER_NOTIFIED_SLOTS_KEY, JSON.stringify(slots));
}

function reminderSlot(date, time) {
  return `${date.toISOString().slice(0, 10)}:${time}`;
}

function parseReminderTime(time) {
  if (!time || typeof time !== "string") return null;
  const parts = time.split(":");
  if (parts.length < 2) return null;
  const hour = Number(parts[0]);
  const minute = Number(parts[1]);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

function dayMatches(daysOfWeek, date) {
  if (!Array.isArray(daysOfWeek) || !daysOfWeek.length) return true;
  const current = date.toLocaleDateString("en-US", { weekday: "short" }).toLowerCase();
  return daysOfWeek.some((day) => String(day || "").slice(0, 3).toLowerCase() === current);
}

function getReminderDueDate(reminder, now) {
  if (!reminder || reminder.enabled === false) return null;
  const time = parseReminderTime(reminder.time);
  if (!time) return null;

  const dueDate = new Date(now);
  dueDate.setSeconds(0, 0);
  dueDate.setHours(time.hour, time.minute, 0, 0);
  if (!dayMatches(reminder.daysOfWeek, dueDate)) return null;
  return dueDate;
}

function isReminderDueNow(reminder, now) {
  const dueDate = getReminderDueDate(reminder, now);
  if (!dueDate) return false;
  const diffMs = now.getTime() - dueDate.getTime();
  return diffMs >= 0 && diffMs <= REMINDER_GRACE_MINUTES * 60 * 1000;
}

function showReminderNotification(reminder) {
  const habitTitle = reminder.habit?.title || "Habit";
  const categoryName = reminder.habit?.category?.name;
  const body = categoryName
    ? `Category: ${categoryName}. Time to complete "${habitTitle}".`
    : `Time to complete "${habitTitle}".`;
  new Notification(`Reminder: ${habitTitle}`, { body });
}

async function checkDueReminders() {
  if (!getToken() || Notification.permission !== "granted") return;
  let reminders = [];
  try {
    const data = await apiRequest("GET", "/reminders");
    reminders = Array.isArray(data) ? data : [];
  } catch (error) {
    return;
  }

  const now = new Date();
  const slots = loadNotifiedSlots();
  let changed = false;

  reminders.forEach((reminder) => {
    if (!isReminderDueNow(reminder, now)) return;
    const reminderId = reminder._id || reminder.id;
    if (!reminderId) return;

    const dueDate = getReminderDueDate(reminder, now);
    if (!dueDate) return;
    const slot = reminderSlot(dueDate, reminder.time);
    if (slots[reminderId] === slot) return;

    showReminderNotification(reminder);
    slots[reminderId] = slot;
    changed = true;
  });

  if (changed) saveNotifiedSlots(slots);
}

async function startReminderNotifications() {
  if (reminderNotifierStarted) return;
  if (!("Notification" in window)) return;
  if (!getToken()) return;

  reminderNotifierStarted = true;
  if (Notification.permission !== "granted") return;

  await checkDueReminders();
  reminderNotifierTimer = setInterval(checkDueReminders, REMINDER_POLL_MS);
}

async function requestReminderNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission !== "default") return Notification.permission;
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      await startReminderNotifications();
    }
    return permission;
  } catch (error) {
    return "denied";
  }
}

function stopReminderNotifications() {
  if (reminderNotifierTimer) {
    clearInterval(reminderNotifierTimer);
    reminderNotifierTimer = null;
  }
  reminderNotifierStarted = false;
}

window.startReminderNotifications = startReminderNotifications;
window.stopReminderNotifications = stopReminderNotifications;
window.requestReminderNotificationPermission = requestReminderNotificationPermission;
