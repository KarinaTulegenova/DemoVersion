// Dashboard: habits CRUD plus log management.
let habits = [];
let currentHabitId = null;
let habitModal = null;
let logsModal = null;

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

function setHabitModalMode(isEdit) {
  const title = document.getElementById("habitModalLabel");
  const button = document.getElementById("saveHabitBtn");
  title.textContent = isEdit ? "Edit Habit" : "Add Habit";
  button.textContent = isEdit ? "Update Habit" : "Save Habit";
}

function resetHabitForm() {
  document.getElementById("habitId").value = "";
  document.getElementById("habitTitle").value = "";
  document.getElementById("habitDescription").value = "";
  document.getElementById("habitFrequency").value = "daily";
  document.getElementById("habitStart").value = "";
  document.getElementById("habitActive").checked = true;
  showAlert("habitAlert", "", "success");
  const container = document.getElementById("habitAlert");
  if (container) container.innerHTML = "";
}

function renderHabits() {
  const cards = document.getElementById("habitCards");
  cards.innerHTML = "";

  if (!habits.length) {
    const empty = document.createElement("div");
    empty.className = "col-12 text-center text-muted py-4";
    empty.textContent = "No habits yet. Add your first habit to get started.";
    cards.appendChild(empty);
    return;
  }

  habits.forEach((habit) => {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4";

    const card = document.createElement("div");
    card.className = "habit-card";

    const header = document.createElement("div");
    header.className = "habit-card-header";
    header.innerHTML = `
      <div>
        <h5 class="mb-1">${habit.title || "Untitled"}</h5>
        <p class="text-muted mb-0">${habit.description || "No description yet."}</p>
      </div>
      <div class="habit-pill">
        <i class="fa-solid fa-fire"></i>
        <span>0</span>
      </div>
    `;

    const meta = document.createElement("div");
    meta.className = "habit-meta";
    meta.innerHTML = `
      <div>
        <div class="meta-label">Frequency</div>
        <div class="meta-value">${habit.frequency || "-"}</div>
      </div>
      <div>
        <div class="meta-label">Start</div>
        <div class="meta-value">${formatDate(habit.startDate)}</div>
      </div>
      <div>
        <div class="meta-label">Status</div>
        <div class="meta-value">${habit.isActive === false ? "Inactive" : "Active"}</div>
      </div>
    `;

    const footer = document.createElement("div");
    footer.className = "habit-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-soft me-2";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => openEditHabit(habit));

    const logsBtn = document.createElement("button");
    logsBtn.className = "btn btn-soft me-2";
    logsBtn.textContent = "View Logs";
    logsBtn.addEventListener("click", () => openLogsModal(habit));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-soft-danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteHabit(habit));

    footer.append(editBtn, logsBtn, deleteBtn);

    card.append(header, meta, footer);
    col.appendChild(card);
    cards.appendChild(col);
  });
}

async function loadHabits() {
  try {
    habits = await apiRequest("GET", "/habits");
    if (!Array.isArray(habits)) {
      habits = [];
    }
    renderHabits();
    await loadStats();
  } catch (error) {
    showAlert("alertContainer", error.message);
  }
}

async function loadStats() {
  try {
    const stats = await apiRequest("GET", "/habits/stats");
    const statCompleted = document.getElementById("statCompleted");
    const statBest = document.getElementById("statBest");
    const statActive = document.getElementById("statActive");
    if (statCompleted) {
      statCompleted.textContent = `${stats.completedToday}/${stats.totalHabits}`;
    }
    if (statBest) statBest.textContent = `${stats.bestStreak}`;
    if (statActive) statActive.textContent = `${stats.activeHabits}`;
  } catch (error) {
    showAlert("alertContainer", error.message);
  }
}

function openEditHabit(habit) {
  setHabitModalMode(true);
  document.getElementById("habitId").value = habit._id || habit.id || "";
  document.getElementById("habitTitle").value = habit.title || "";
  document.getElementById("habitDescription").value = habit.description || "";
  document.getElementById("habitFrequency").value = habit.frequency || "daily";
  document.getElementById("habitStart").value = habit.startDate ? habit.startDate.substring(0, 10) : "";
  document.getElementById("habitActive").checked = habit.isActive !== false;
  const container = document.getElementById("habitAlert");
  if (container) container.innerHTML = "";
  habitModal.show();
}

async function saveHabit() {
  const id = document.getElementById("habitId").value;
  const payload = {
    title: document.getElementById("habitTitle").value.trim(),
    description: document.getElementById("habitDescription").value.trim() || undefined,
    frequency: document.getElementById("habitFrequency").value,
    startDate: document.getElementById("habitStart").value || undefined,
    isActive: document.getElementById("habitActive").checked,
  };

  if (!payload.title) {
    showAlert("habitAlert", "Title is required.");
    return;
  }

  try {
    if (id) {
      await apiRequest("PUT", `/habits/${id}`, payload);
    } else {
      await apiRequest("POST", "/habits", payload);
    }
    habitModal.hide();
    resetHabitForm();
    await loadHabits();
    await loadStats();
    showAlert("alertContainer", "Habit saved successfully.", "success");
  } catch (error) {
    showAlert("habitAlert", error.message);
  }
}

async function deleteHabit(habit) {
  const id = habit._id || habit.id;
  if (!id) return;
  if (!window.confirm(`Delete habit "${habit.title || "this habit"}"?`)) return;
  try {
    await apiRequest("DELETE", `/habits/${id}`);
    await loadHabits();
    await loadStats();
    showAlert("alertContainer", "Habit deleted.", "success");
  } catch (error) {
    showAlert("alertContainer", error.message);
  }
}

async function openLogsModal(habit) {
  currentHabitId = habit._id || habit.id;
  document.getElementById("logsModalLabel").textContent = `Logs: ${habit.title || "Habit"}`;
  document.getElementById("logForm").reset();
  const logAlert = document.getElementById("logAlert");
  if (logAlert) logAlert.innerHTML = "";
  await loadLogs();
  logsModal.show();
}

async function loadLogs() {
  if (!currentHabitId) return;
  try {
    const logs = await apiRequest("GET", `/habits/${currentHabitId}/logs`);
    renderLogs(Array.isArray(logs) ? logs : []);
  } catch (error) {
    showAlert("logAlert", error.message);
  }
}

function renderLogs(logs) {
  const tbody = document.getElementById("logsTableBody");
  const count = document.getElementById("logCount");
  tbody.innerHTML = "";
  count.textContent = `${logs.length} log${logs.length === 1 ? "" : "s"}`;

  if (!logs.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.className = "text-center text-muted py-3";
    cell.textContent = "No logs yet. Add your first entry.";
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  logs.forEach((log) => {
    const row = document.createElement("tr");

    const dateCell = document.createElement("td");
    dateCell.textContent = formatDate(log.date);

    const statusCell = document.createElement("td");
    statusCell.textContent = log.status || "-";

    const noteCell = document.createElement("td");
    noteCell.textContent = log.note || "-";

    const actionCell = document.createElement("td");
    actionCell.className = "text-end";
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-sm btn-outline-danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteLog(log));
    actionCell.appendChild(deleteBtn);

    row.append(dateCell, statusCell, noteCell, actionCell);
    tbody.appendChild(row);
  });
}

async function addLog(event) {
  event.preventDefault();
  if (!currentHabitId) return;
  const payload = {
    date: document.getElementById("logDate").value,
    status: document.getElementById("logStatus").value,
    note: document.getElementById("logNote").value.trim() || undefined,
  };

  if (!payload.date) {
    showAlert("logAlert", "Date is required.");
    return;
  }

  try {
    await apiRequest("POST", `/habits/${currentHabitId}/logs`, payload);
    document.getElementById("logForm").reset();
    await loadLogs();
    await loadStats();
    showAlert("logAlert", "Log added.", "success");
  } catch (error) {
    showAlert("logAlert", error.message);
  }
}

async function deleteLog(log) {
  const id = log._id || log.id || log.logId;
  if (!id) return;
  if (!window.confirm("Delete this log entry?")) return;
  try {
    await apiRequest("DELETE", `/logs/${id}`);
    await loadLogs();
    await loadStats();
    showAlert("logAlert", "Log deleted.", "success");
  } catch (error) {
    showAlert("logAlert", error.message);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const habitModalEl = document.getElementById("habitModal");
  const logsModalEl = document.getElementById("logsModal");
  habitModal = new bootstrap.Modal(habitModalEl);
  logsModal = new bootstrap.Modal(logsModalEl);

  habitModalEl.addEventListener("hidden.bs.modal", () => {
    resetHabitForm();
    setHabitModalMode(false);
  });

  document.getElementById("saveHabitBtn").addEventListener("click", saveHabit);
  document.getElementById("logForm").addEventListener("submit", addLog);

  setHabitModalMode(false);
  loadHabits();
});
