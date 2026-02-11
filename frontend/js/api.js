// Shared API helpers for JWT-authenticated requests.
const API_BASE =
  localStorage.getItem("apiBase") || `${window.location.origin}/api`;

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
