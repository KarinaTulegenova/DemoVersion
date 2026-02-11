// Reminder CRUD helpers and UI wiring.
let reminders = [];
let habits = [];
let reminderModal = null;

function setReminderModalMode(isEdit) {
  const title = document.getElementById("reminderModalLabel");
  const button = document.getElementById("saveReminderBtn");
  title.textContent = isEdit ? "Edit Reminder" : "Add Reminder";
  button.textContent = isEdit ? "Update Reminder" : "Save Reminder";
}

function resetReminderForm() {
  document.getElementById("reminderId").value = "";
  document.getElementById("reminderHabit").value = "";
  document.getElementById("reminderTime").value = "";
  document.getElementById("reminderDays").value = "";
  document.getElementById("reminderEnabled").checked = true;
  const container = document.getElementById("reminderAlert");
  if (container) container.innerHTML = "";
}

function renderHabitsDropdown() {
  const select = document.getElementById("reminderHabit");
  select.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select a habit";
  placeholder.disabled = true;
  placeholder.selected = true;
  select.appendChild(placeholder);

  habits.forEach((habit) => {
    const option = document.createElement("option");
    option.value = habit._id || habit.id;
    option.textContent = habit.title || "Untitled";
    select.appendChild(option);
  });
}

function renderReminders() {
  const tbody = document.getElementById("remindersTableBody");
  const count = document.getElementById("reminderCount");
  tbody.innerHTML = "";
  count.textContent = `${reminders.length} reminder${reminders.length === 1 ? "" : "s"}`;

  if (!reminders.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.className = "text-center text-muted py-3";
    cell.textContent = "No reminders yet.";
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  reminders.forEach((reminder) => {
    const row = document.createElement("tr");
    const habitCell = document.createElement("td");
    habitCell.textContent = reminder.habit?.title || habitTitleById(reminder.habitId) || "-";

    const timeCell = document.createElement("td");
    timeCell.textContent = reminder.time || "-";

    const daysCell = document.createElement("td");
    if (Array.isArray(reminder.daysOfWeek)) {
      daysCell.textContent = reminder.daysOfWeek.join(", ");
    } else {
      daysCell.textContent = reminder.daysOfWeek || "-";
    }

    const statusCell = document.createElement("td");
    statusCell.innerHTML = reminder.enabled === false
      ? '<span class="badge text-bg-secondary">Paused</span>'
      : '<span class="badge text-bg-success">Enabled</span>';

    const actionsCell = document.createElement("td");
    actionsCell.className = "text-end";

    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-sm btn-outline-primary me-2";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => openEditReminder(reminder));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-sm btn-outline-danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteReminder(reminder));

    actionsCell.append(editBtn, deleteBtn);
    row.append(habitCell, timeCell, daysCell, statusCell, actionsCell);
    tbody.appendChild(row);
  });
}

function habitTitleById(id) {
  const habit = habits.find((item) => (item._id || item.id) === id);
  return habit?.title;
}

async function loadHabits() {
  try {
    habits = await apiRequest("GET", "/habits");
    if (!Array.isArray(habits)) {
      habits = [];
    }
    renderHabitsDropdown();
  } catch (error) {
    showAlert("alertContainer", error.message);
  }
}

async function loadReminders() {
  try {
    reminders = await apiRequest("GET", "/reminders");
    if (!Array.isArray(reminders)) {
      reminders = [];
    }
    renderReminders();
  } catch (error) {
    showAlert("alertContainer", error.message);
  }
}

function openEditReminder(reminder) {
  setReminderModalMode(true);
  document.getElementById("reminderId").value = reminder._id || reminder.id || "";
  document.getElementById("reminderHabit").value = reminder.habitId || reminder.habit?._id || "";
  document.getElementById("reminderTime").value = reminder.time || "";
  if (Array.isArray(reminder.daysOfWeek)) {
    document.getElementById("reminderDays").value = reminder.daysOfWeek.join(", ");
  } else {
    document.getElementById("reminderDays").value = reminder.daysOfWeek || "";
  }
  document.getElementById("reminderEnabled").checked = reminder.enabled !== false;
  const container = document.getElementById("reminderAlert");
  if (container) container.innerHTML = "";
  reminderModal.show();
}

function parseDays(value) {
  if (!value) return undefined;
  const days = value
    .split(",")
    .map((day) => day.trim())
    .filter(Boolean);
  return days.length ? days : undefined;
}

async function saveReminder() {
  const id = document.getElementById("reminderId").value;
  const payload = {
    habitId: document.getElementById("reminderHabit").value,
    time: document.getElementById("reminderTime").value,
    daysOfWeek: parseDays(document.getElementById("reminderDays").value),
    enabled: document.getElementById("reminderEnabled").checked,
  };

  if (!payload.habitId || !payload.time) {
    showAlert("reminderAlert", "Habit and time are required.");
    return;
  }

  try {
    if (id) {
      await apiRequest("PUT", `/reminders/${id}`, payload);
    } else {
      await apiRequest("POST", "/reminders", payload);
    }
    reminderModal.hide();
    resetReminderForm();
    await loadReminders();
    showAlert("alertContainer", "Reminder saved.", "success");
  } catch (error) {
    showAlert("reminderAlert", error.message);
  }
}

async function deleteReminder(reminder) {
  const id = reminder._id || reminder.id;
  if (!id) return;
  if (!window.confirm("Delete this reminder?")) return;
  try {
    await apiRequest("DELETE", `/reminders/${id}`);
    await loadReminders();
    showAlert("alertContainer", "Reminder deleted.", "success");
  } catch (error) {
    showAlert("alertContainer", error.message);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const modalEl = document.getElementById("reminderModal");
  reminderModal = new bootstrap.Modal(modalEl);

  modalEl.addEventListener("hidden.bs.modal", () => {
    resetReminderForm();
    setReminderModalMode(false);
  });

  document.getElementById("saveReminderBtn").addEventListener("click", saveReminder);

  setReminderModalMode(false);
  loadHabits();
  loadReminders();
});
