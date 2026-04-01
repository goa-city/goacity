# 🔄 Sync & Multi-Device Workflow Guide

This guide explains how to seamlessly work on **Goa.City** across multiple machines (e.g., your PC and Laptop) using **Syncthing**.

## 1. 🛑 Essential: The `.stignore` File
Syncthing should **NEVER** sync `node_modules` or build artifacts. These folders contain thousands of tiny files and are OS-specific. Syncing them will slow down your machines and can cause crashes.

I have created a `.stignore` file in the project root with the correct settings. Syncthing should pick this up automatically.

---

## 2. 🗄️ Database Strategy

### Option A: Use the Production Database (Easiest)
If you are mainly working on the frontend or small backend tweaks:
- Use **`1-START-FRONTEND.command`**.
- Both machines will talk to the same live database.
- Cons: You can't test new backend logic until you deploy.

### Option B: Local Full-Stack Development
If you need to make heavy backend/schema changes:
1. **Install PostgreSQL** on your laptop (follow instructions in `LOCAL_SETUP.md`).
2. **Sync the Schema:** After you pull changes on the laptop, run:
   ```bash
   cd backend_node
   npx prisma generate
   npx prisma db push
   ```
   *Note: Syncthing does NOT sync the actual data inside PostgreSQL. If you add a user on one machine, it won't appear on the other unless you export/import a `.sql` dump.*

---

## 3. 🚀 The "Switching" Workflow

When you stop working on **Machine A** and move to **Machine B**:

1. **On Machine A:** 
   - Close your IDE and stop the servers (use `3-STOP-ALL.command`).
   - Wait 10-20 seconds for Syncthing to finish uploading changes.

2. **On Machine B:**
   - Wait for Syncthing to show "Up to Date".
   - **Important:** If you've added new packages, run `npm install` in both `frontend` and `backend_node`.
   - Start development using the `.command` files.

---

## 4. 🛠️ One-Time Setup on New Device
If you are setting up the laptop for the first time:
1. Ensure Syncthing has finished the initial sync.
2. Open Terminal and run this helper command to install all dependencies:
   ```bash
   # Install Frontend deps
   cd frontend && npm install
   
   # Install Backend deps & Generate Prisma client
   cd ../backend_node && npm install && npx prisma generate
   ```

## ⚠️ Important Note on Git
Since you are also using Git (`5-GIT-PUSH.command`), Syncthing is essentially syncing your "Work in Progress". 
- **DO NOT** have the project open and running on both machines at the exact same time, as they might conflict when writing to the same files.
- **Commit often:** Syncthing is for convenience, but Git is your safety net.
