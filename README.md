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
│   ├── seed.js         # Initial mock data seeding script
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

### 1. MongoDB Database Setup
The backend connects to MongoDB locally. Ensure MongoDB is running on your machine:
- Default Connection URI: `mongodb://127.0.0.1:27017/hrorbit`

If you are using a hosted MongoDB cluster (e.g. MongoDB Atlas) or a different local port, configure it inside `backend/.env`:
```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=hrorbitjwtsecretkey12345
```

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
