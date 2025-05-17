
## **🛠️ System Design: Student Admission & Fee Tracker** ##

### 1. Architecture Overview

**Frontend (React.js + Chart.js)** → **Backend (Node.js + Express.js)** → **MongoDB Atlas (Cloud DB)**

---

### 2. Frontend (React)

* **Framework:** React.js
* **Charts:** Chart.js
* **Forms:** Student data inputs and submission
* **Deployment:** Netlify ([https://kalstudentadmissiontracker.netlify.app](https://kalstudentadmissiontracker.netlify.app))
* **Responsibilities:** Render charts, handle form data, call APIs, Google OAuth login

---

### 3. Backend (Node.js + Express.js)

* **Framework:** Express.js
* **Auth:** Google OAuth 2.0, JWT for session
* **Environment Variables:**
  `MONGO_URI`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
  `JWT_SECRET`, `SESSION_SECRET`
* **API Endpoints:**
  `POST /api/students` – Add student
  `GET /api/students` – Get all students
  `GET /api/summary` – Stats for charts
  `POST /auth/google` – Login with Google
  `GET /api/users/:id/students` – Filtered student data

---

### 4. Database (MongoDB Atlas)

* **Collections:** `students`, `users`
* **Student Schema:** `name`, `college`, `year`, `feePaid`, `transactionId`, `gender`, etc.
* **User Schema:** `name`, `email`, `googleId`, `createdAt`

---

### 5. DevOps / Deployment

* **Frontend:** Netlify
* **Backend:** Render
* **Database:** MongoDB Atlas
* **Monitoring:** Render Logs
* **CI/CD:** GitHub Auto-deploy

---

### 6. Security Measures

* Uses environment variables for secrets
* JWT-based sessions
* OAuth-based login (no passwords)
* Optional: rate-limiting, input validation

---

### 7. Optional Improvements

* CSV Upload
* Email Alerts
* Role-based Admin Panel
* GraphQL API
* Redis Cache Layer

---

graph TD
  A[Frontend (React.js + Chart.js) on Netlify] -->|HTTPS Calls| B[Backend (Node.js + Express.js) on Render]
  B -->|Mongoose Queries| C[MongoDB Atlas (StudentData DB)]
  
  subgraph ENV [Environment Variables]
    M[MONGO_URI]
    G[GOOGLE_CLIENT_ID]
    S[GOOGLE_CLIENT_SECRET]
    J[JWT_SECRET]
    SS[SESSION_SECRET]
  end
  
  ENV --> B

  subgraph Enhancements
    U[CSV Upload Feature]
    E[Email Alerts]
    AP[Admin Panel]
    R[Redis Cache]
  end

  U --> B
  E --> B
  AP --> B
  R --> B