# HRorbit — Premium HRM Portal

A full-stack Human Resource Management (HRM) web application built using React (Vite) on the frontend, Node.js & Express on the backend, and MongoDB for database storage. It supports role-based features for HR Directors and Employees (Shift logging, Leave approvals, Recruitment ATS Kanban, Learning academy, and Support helpdesk).

---

## Repository Structure

```
HRM_PROJECT/
├── backend/            # Express REST API Server
│   ├── config/         # Database configuration
│   ├── middleware/     # Auth and validation middleware
│   ├── models/         # Mongoose DB schemas
│   ├── routes/         # Router controllers
│   ├── scripts/        # seed_demo.js (demo database only)
│   └── server.js       # Main server entry
├── frontend/           # React SPA Client (Vite)
│   ├── src/
│   │   ├── components/ # Sidebar, Header, Modals, Toasts
│   │   ├── context/    # Auth and Data sync providers
│   │   ├── pages/      # Login gateway, HR workspace, Employee workspace
│   │   └── api.js      # Axios client configuration
│   └── index.html      # Root HTML template
└── README.md           # Setup & execution instructions (this file)
```

---

## Setup & Running Instructions

Make sure you have [Node.js](https://nodejs.org/) installed.

### 1. Configuration (environment variables only)
The backend reads all configuration from environment variables; nothing has a built-in fallback.
Put them in `backend/.env` (git-ignored):
```env
PORT=5001
MONGODB_URI=<connection string, including the database name, e.g. .../hrorbit?retryWrites=true>
JWT_SECRET=<a long random string>
CLOUDINARY_CLOUD_NAME=<optional, for avatar hosting>
CLOUDINARY_API_KEY=<optional>
CLOUDINARY_API_SECRET=<optional>
```

Databases:
- `hrorbit` — production (real records). Never seed or test against it.
- `hrorbit_demo` — demo/preview data. Rebuild it with:
  ```bash
  cd backend
  # backend/.env.demo (git-ignored) holds MONGODB_URI=.../hrorbit_demo?..., DEMO_HR_PASSWORD, DEMO_EMPLOYEE_PASSWORD
  node scripts/seed_demo.js
  ```
  The script refuses to run unless the database name ends in `_demo` (or the host is local), and it drops that database first.

On Vercel Preview the backend checks the demo database at start-up: if either demo login (`hr@company.com`, `employee@company.com`) is missing, it clears `hrorbit_demo` and seeds it again. Deleting a demo login therefore resets the demo data.

Tests run against a local database only: `MONGODB_URI=mongodb://127.0.0.1:27017/hrorbit_test npm test`.

### Deployment (Vercel project `hrorbit.`)
Each variable is set separately per environment:

| Variable | Production | Preview |
|---|---|---|
| `MONGODB_URI` | `.../hrorbit?retryWrites=true&w=majority` | `.../hrorbit_demo?retryWrites=true&w=majority` |
| `JWT_SECRET` | production secret | a different secret |
| `DEMO_HR_PASSWORD`, `DEMO_EMPLOYEE_PASSWORD` | not set | demo logins (from `backend/.env.demo`) |
| `CLOUDINARY_*` | set | set (optional) |

The server enforces the split: a Preview deployment refuses any database not ending in `_demo`, Production refuses a `_demo` database,
and a URI without a database name is rejected. On first start, a Preview deployment fills an empty demo database with the demo data.
`GET /api/health` shows the database name and which variables are present (never their values).

---

### 2. Start Backend Server
Install dependencies and run the Node.js development server (port `5001` with hot-reloading). On first run, a default HR Director account will be automatically created in the database:
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Run server
npm run dev
```

---

### 3. Start React Frontend
In a new terminal window, install dependencies and boot up the local Vite development server (port `5173`):
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Launch Dev Server
npm run dev
```
Vite will automatically proxy requests to `/api` directly to your backend on port `5001`.

---

## Sandbox Login Credentials

Once the servers are running, log in with the following default credentials to access the system:

### HR Director Portal
- **Email**: `hr@company.com`
- **Password**: `admin123`
- **Role**: Select **HR Portal** on the login card.

### Employee Portal
- **Email**: `employee@company.com`
- **Password**: `employee123`
- **Role**: Select **Employee Portal** on the login card.
- **Registration Option**: You can also register a new account. Click on the **Create an account** link in the Employee Portal section of the login gateway to sign up. Once submitted, it is automatically approved and ready to log in.
# HRM_PROJECT
