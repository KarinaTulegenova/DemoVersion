// Profile view/update behavior.
async function loadProfile() {
  try {
    const profile = await apiRequest("GET", "/users/profile");
    if (!profile) return;
    document.getElementById("profileUsername").value = profile.username || "";
    document.getElementById("profileEmail").value = profile.email || "";
  } catch (error) {
    showAlert("alertContainer", error.message);
  }
}

async function saveProfile(event) {
  event.preventDefault();
  const payload = {
    username: document.getElementById("profileUsername").value.trim(),
    email: document.getElementById("profileEmail").value.trim(),
  };

  if (!payload.username || !payload.email) {
    showAlert("alertContainer", "Username and email are required.");
    return;
  }

  try {
    await apiRequest("PUT", "/users/profile", payload);
    showAlert("alertContainer", "Profile updated.", "success");
  } catch (error) {
    showAlert("alertContainer", error.message);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("profileForm").addEventListener("submit", saveProfile);
  loadProfile();
});
