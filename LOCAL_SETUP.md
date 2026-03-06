# Local Development Setup for Goa City

You can now test your changes locally on your computer without uploading them to the server every time. 

There are two ways to work locally:

---

## Option 1: Frontend-only Development (Recommended)
This is the easiest way to work on the UI, layouts, and styles.
- **How it works:** The Website runs on your computer, but it talks to the **live production database**.
- **Pros:** No local database setup required. 
- **Cons:** You cannot test backend code changes (like new API logic) until you upload them.

### How to run (Easy Method):
1. Open the project folder in Finder.
2. **Double-click** on **`1-START-FRONTEND.command`**.
3. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Option 2: Full-Stack Development
Use this if you are making changes to the backend (database logic, API endpoints).
- **How it works:** Both the Website and the Backend run on your computer.
- **Requirements:** You need PostgreSQL installed locally.

### Setup (One-time):
1. **Install PostgreSQL:**
   ```bash
   brew install postgresql@14
   brew services start postgresql@14
   ```
2. **Create the database:**
   ```bash
   createdb goacity
   ```

3. **Update Credentials:**
   Edit `backend_node/.env`. For local development, it might look like:
   `DATABASE_URL="postgresql://localhost:5432/goacity"`
   (Check your local postgres username if it fails).

### How to run:
1. Start the Backend: `./dev-backend.sh`
2. Start the Frontend (connected to local): `VITE_API_PROXY=http://localhost:5001 ./dev-frontend.sh`

---

## Controls Summary

| Action | Command / File (Clickable) |
| :--- | :--- |
| **Start Frontend** | `1-START-FRONTEND.command` |
| **Start Backend** | `2-START-BACKEND.command` |
| **Stop Everything** | `3-STOP-ALL.command` |
| **Deploy to Server** | `4-DEPLOY-TO-SERVER.command` |
| **Push to Git** | `5-GIT-PUSH.command` |

### Important Files
- `frontend/src/api/axios.js`: Automatically handles Switching between local and production APIs.
- `frontend/vite.config.js`: Proxies your local requests to the server to avoid security (CORS) issues.

---

## Deployment & Updates
When you are ready to push your changes live or backup your code:

1. **Deploy to Server:** Double-click `4-DEPLOY-TO-SERVER.command`. This will build your code and upload it to the live server automatically.
2. **Push to Git:** Double-click `5-GIT-PUSH.command`. This will ask for a message and push your code to your Git repository.
