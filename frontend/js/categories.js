// Category CRUD helpers and UI wiring.
let categories = [];
let categoryModal = null;

function setCategoryModalMode(isEdit) {
  const title = document.getElementById("categoryModalLabel");
  const button = document.getElementById("saveCategoryBtn");
  title.textContent = isEdit ? "Edit Category" : "Add Category";
  button.textContent = isEdit ? "Update Category" : "Save Category";
}

function resetCategoryForm() {
  document.getElementById("categoryId").value = "";
  document.getElementById("categoryName").value = "";
  document.getElementById("categoryColor").value = "#f59e0b";
  const container = document.getElementById("categoryAlert");
  if (container) container.innerHTML = "";
}

function renderCategories() {
  const tbody = document.getElementById("categoriesTableBody");
  const count = document.getElementById("categoryCount");
  tbody.innerHTML = "";
  count.textContent = `${categories.length} categor${categories.length === 1 ? "y" : "ies"}`;

  if (!categories.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 3;
    cell.className = "text-center text-muted py-3";
    cell.textContent = "No categories yet.";
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  categories.forEach((category) => {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    nameCell.textContent = category.name || "Unnamed";

    const colorCell = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.style.background = category.color || "#e2e8f0";
    badge.textContent = category.color || "-";
    colorCell.appendChild(badge);

    const actionsCell = document.createElement("td");
    actionsCell.className = "text-end";

    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-sm btn-outline-primary me-2";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => openEditCategory(category));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-sm btn-outline-danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteCategory(category));

    actionsCell.append(editBtn, deleteBtn);
    row.append(nameCell, colorCell, actionsCell);
    tbody.appendChild(row);
  });
}

async function loadCategories() {
  try {
    categories = await apiRequest("GET", "/categories");
    if (!Array.isArray(categories)) {
      categories = [];
    }
    renderCategories();
  } catch (error) {
    showAlert("alertContainer", error.message);
  }
}

function openEditCategory(category) {
  setCategoryModalMode(true);
  document.getElementById("categoryId").value = category._id || category.id || "";
  document.getElementById("categoryName").value = category.name || "";
  document.getElementById("categoryColor").value = category.color || "#f59e0b";
  const container = document.getElementById("categoryAlert");
  if (container) container.innerHTML = "";
  categoryModal.show();
}

async function saveCategory() {
  const id = document.getElementById("categoryId").value;
  const payload = {
    name: document.getElementById("categoryName").value.trim(),
    color: document.getElementById("categoryColor").value || undefined,
  };

  if (!payload.name) {
    showAlert("categoryAlert", "Name is required.");
    return;
  }

  try {
    if (id) {
      await apiRequest("PUT", `/categories/${id}`, payload);
    } else {
      await apiRequest("POST", "/categories", payload);
    }
    categoryModal.hide();
    resetCategoryForm();
    await loadCategories();
    showAlert("alertContainer", "Category saved.", "success");
  } catch (error) {
    showAlert("categoryAlert", error.message);
  }
}

async function deleteCategory(category) {
  const id = category._id || category.id;
  if (!id) return;
  if (!window.confirm(`Delete category "${category.name || "this category"}"?`)) return;
  try {
    await apiRequest("DELETE", `/categories/${id}`);
    await loadCategories();
    showAlert("alertContainer", "Category deleted.", "success");
  } catch (error) {
    showAlert("alertContainer", error.message);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const modalEl = document.getElementById("categoryModal");
  categoryModal = new bootstrap.Modal(modalEl);

  modalEl.addEventListener("hidden.bs.modal", () => {
    resetCategoryForm();
    setCategoryModalMode(false);
  });

  document.getElementById("saveCategoryBtn").addEventListener("click", saveCategory);

  setCategoryModalMode(false);
  loadCategories();
});
