# Habit Tracker Frontend

## Run the frontend
- Open the `frontend` folder in a static server (e.g., VS Code Live Server) and load `index.html`.
- Or run a simple server: `python3 -m http.server` from inside `frontend`, then open the local URL.

## Configure API base URL
- Default API base: `http://localhost:5000/api`.
- Override in DevTools console:
  - `localStorage.setItem("apiBase", "http://localhost:5000/api");`
  - Refresh the page after setting.

## Test user flow
1. Register a new account on `register.html`.
2. Login to receive a JWT and load `dashboard.html`.
3. Add a habit, then click "View Logs" to add a log entry.
4. Logout from the navbar to clear the JWT.
