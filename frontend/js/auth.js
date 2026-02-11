// Auth guards, login/register handling, and logout behavior.
function isLoggedIn() {
  return !!getToken();
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
  }
}

function redirectIfAuth() {
  if (isLoggedIn()) {
    window.location.href = "dashboard.html";
  }
}

function setupAuthGuards() {
  const authState = document.body.dataset.auth;
  if (authState === "required") {
    requireAuth();
  }
  if (authState === "guest") {
    redirectIfAuth();
  }
}

function setupLogoutLink() {
  const logoutLink = document.getElementById("logoutLink");
  if (!logoutLink) return;

  logoutLink.addEventListener("click", (event) => {
    event.preventDefault();
    clearToken();
    window.location.href = "index.html";
  });
}

function toggleAuthLinks() {
  const loggedIn = isLoggedIn();
  document.querySelectorAll("[data-auth-visible]").forEach((el) => {
    const visibility = el.dataset.authVisible;
    if (visibility === "logged-in") {
      el.classList.toggle("d-none", !loggedIn);
    }
    if (visibility === "logged-out") {
      el.classList.toggle("d-none", loggedIn);
    }
  });
}

function setupLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    try {
      const data = await apiRequest("POST", "/auth/login", { email, password });
      if (data?.token) {
        setToken(data.token);
        window.location.href = "dashboard.html";
      } else {
        showAlert("alertContainer", "Login failed. No token received.");
      }
    } catch (error) {
      showAlert("alertContainer", error.message);
    }
  });
}

function setupRegisterForm() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    try {
      await apiRequest("POST", "/auth/register", { username, email, password });
      const loginData = await apiRequest("POST", "/auth/login", { email, password });
      if (loginData?.token) {
        setToken(loginData.token);
        window.location.href = "dashboard.html";
      } else {
        showAlert("alertContainer", "Registration succeeded, but login failed.");
      }
    } catch (error) {
      showAlert("alertContainer", error.message);
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  setupAuthGuards();
  setupLogoutLink();
  toggleAuthLinks();
  setupLoginForm();
  setupRegisterForm();
});
