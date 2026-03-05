# Monefy - Full-Stack Invoice Dashboard

A modern, full-stack invoice management dashboard built with React, Node.js, Express, and PostgreSQL. This project was developed to fulfill the requirements of a Full-Stack Internship assignment, featuring a premium UI inspired by modern SaaS applications.

## 🚀 Features

* **Modern UI/UX:** A responsive, two-column grid layout with clean typography, hover states, and smooth CSS animations.
* **Complete Backend API:** RESTful endpoints to fetch invoices, line items, and payment history.
* **Secure Payment Logic:** Strict backend validations prevent overpaying, ensure valid amounts, and automatically update the invoice status to `PAID` when the balance reaches zero.
* **Database Transactions:** Utilizes Prisma `$transaction` to guarantee data integrity across multiple tables during payment processing.
* **Bonus Features Implemented:** * PDF Export functionality.
  * Overdue date calculation logic and pulsing alert badges.
  * Archiving/Restoring invoice logic built into the API.

## 🛠️ Tech Stack

**Frontend:**
* React (Vite)
* CSS3 (Custom responsive grid layout)
* Lucide-React (Icons)
* Axios (Data fetching)

**Backend:**
* Node.js & Express.js
* Prisma ORM (v7 Adapter Setup)
* PostgreSQL (Hosted on Neon)

---
# 📂 Project Structure

```
invoice-project
│
├── prisma/           # Database schema and migrations
├── frontend/         # React + Vite frontend application
├── server.js         # Express server and API logic
├── seed.js           # Database initialization script
└── README.md
```

---

## ⚙️ Setup Instructions

Follow these steps to run the project locally.

### Prerequisites
* Node.js (v18+)
* A PostgreSQL database string (e.g., from Neon, Supabase, or local)

### 1. Clone the Repository
```bash
git clone [https://github.com/Richapal14/invoice-backend.git](https://github.com/Richapal14/invoice-backend.git)
cd invoice-backend
```

# 2️⃣ Backend Setup

Open a terminal in the **root folder (`invoice-backend`)**

### Install Dependencies

```bash
npm install
```

---

### Environment Variables

Create a `.env` file in the root directory and add your PostgreSQL connection string.

```env
DATABASE_URL="postgres://username:password@your-database-url/dbname?uselibpqcompat=true&sslmode=require"
PORT=5000
```

---

### Generate Prisma Client & Seed the Database

This will create database tables and insert sample invoice data.

```bash
npx prisma generate
node seed.js
```

---

### Start the Backend Server

```bash
npm run dev
```

Backend API will run on:

```
http://localhost:5000
```

---

# 3️⃣ Frontend Setup

Open a **second terminal** (keep the backend running).

Move to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the React application:

```bash
npm run dev
```

Frontend will run on:

```
http://localhost:5173
```

Open this URL in your browser to view the dashboard.

---

# 📡 API Endpoints

| Method | Endpoint | Description |
|------|------|------|
| GET | `/api/invoices` | Fetch all invoices |
| GET | `/api/invoices/:id` | Fetch a specific invoice with line items and payments |
| POST | `/api/invoices/:id/payments` | Record a payment and update balance |
| POST | `/api/invoices/archive` | Archive an invoice |
| POST | `/api/invoices/restore` | Restore an archived invoice |

---

# 🧠 Business Logic Implemented

### Line Totals
Automatically calculated as:

```
quantity * unitPrice
```

---

### Balance Due Calculation

```
BalanceDue = Total - AmountPaid
```

Real-time updates when payments are recorded.

---

### Payment Validation

The system rejects payments that are:

- Less than or equal to `0`
- Greater than the current `balanceDue`

---

### Automatic Status Update

When an invoice is fully paid:

```
status → PAID
```

---

### PDF Export

Invoices can be exported using **browser print optimization**.

---

### Overdue Detection

If:

```
currentDate > dueDate
```

The UI shows a **pulsing red overdue badge**.

---

# 🎨 UI Features

- Two-column modern dashboard layout
- Smooth CSS keyframe animations
- Sticky invoice summary panel
- Dynamic overdue alerts
- Clean and responsive interface

---

# 📸 Future Improvements

- Authentication system
- Role-based invoice access
- Email invoice sending
- Stripe payment integration
- Invoice analytics dashboard

---

# 👨‍💻 Author

Developed by **RICHA PAL**

---
