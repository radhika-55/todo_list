# MERN Todo Application

This project contains:
- `backend/` - Express + MongoDB/Mongoose API
- `frontend/` - React + Vite UI
- User registration and login
- Add, view, edit and delete tasks
- Responsive TaskFlow dashboard
- Vite proxy connecting the React frontend to the backend on port 3000

## Run the project

### 1. Start backend

Open a terminal:

```bash
cd backend
npm install
node app.js
```

Backend:
`http://localhost:3000`

You should see:
`server started on http://localhost:3000`

Make sure the MongoDB Atlas connection in `backend/conn/conn.js` is valid.

### 2. Start frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL shown by Vite, normally:
`http://localhost:5173`

The frontend uses the Vite `/api` proxy, so API requests are forwarded to `http://localhost:3000`.

## Main API endpoints

### Authentication
- POST `/api/v1/register`
- POST `/api/v1/signin`

### Tasks
- POST `/api/v2/addTask`
- GET `/api/v2/getTask/:email`
- GET `/api/v2/getTaskById/:id`
- PUT `/api/v2/updateTask/:id`
- DELETE `/api/v2/deleteTask/:id`

## Important

Do not publish your MongoDB Atlas username/password or connection string in a public GitHub repository. Rotate the database password if the connection string has already been shared publicly, and move the MongoDB URI to an environment variable before publishing.
