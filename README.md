# Loan Management System (LMS) — Lending Against Mutual Funds (LAMF)

A full-stack fintech portfolio project for managing loans secured by mutual fund collateral.

## 🚀 Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, shadcn/ui, Sonner (toasts)
- **Backend:** Node.js, Express 5
- **Database:** MongoDB, Mongoose
- **Auth:** JWT (30-day tokens)

## 📂 Project Structure

```
LMS/
├── client/                    # React Frontend (Vite)
│   └── src/
│       ├── components/        # Shared UI (shadcn)
│       ├── context/           # AuthContext
│       ├── pages/             # All pages
│       └── lib/               # axios instance, utils
└── server/                    # Node.js Backend
    ├── config/                # DB connection
    ├── controllers/           # Business logic
    ├── middleware/            # JWT auth middleware
    ├── models/                # Mongoose schemas
    ├── routes/                # Express routes
    └── seeder.js              # Database seeder
```

## 🛠️ Setup

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)

### 1. Backend
```bash
cd server
npm install
# Optional: create .env (defaults provided)
# MONGO_URI=mongodb://localhost:27017/lamf_lms
# JWT_SECRET=secret123

node seeder.js   # Seed demo data
npm start        # Runs on http://localhost:5000
```

### 2. Frontend
```bash
cd client
npm install
npm run dev      # Runs on http://localhost:5173
```

## 🔑 Demo Credentials (after seeding)

| Role     | Email                       | Password    |
|----------|-----------------------------|-------------|
| Admin    | admin@lamf.com              | password123 |
| Borrower | rahul.verma@example.com     | password123 |
| Borrower | anita.patel@example.com     | password123 |

## 📡 API Reference

### Auth
| Method | Endpoint             | Access  | Description          |
|--------|----------------------|---------|----------------------|
| POST   | /api/users           | Public  | Register new user    |
| POST   | /api/users/login     | Public  | Login & get token    |
| GET    | /api/users/profile   | Private | Get current user     |

### Products
| Method | Endpoint       | Access | Description        |
|--------|----------------|--------|--------------------|
| GET    | /api/products  | Public | List loan products |
| POST   | /api/products  | Admin  | Create product     |

### Applications
| Method | Endpoint                        | Access  | Description              |
|--------|---------------------------------|---------|--------------------------|
| POST   | /api/applications               | Private | Submit new application   |
| GET    | /api/applications               | Private | My applications          |
| GET    | /api/applications/:id           | Private | Single application       |
| GET    | /api/applications/admin/all     | Admin   | All applications         |
| GET    | /api/applications/admin/all?status=SUBMITTED | Admin | Filtered by status |
| PUT    | /api/applications/:id/status    | Admin   | Update status + remarks  |

## 🔄 Loan Workflow

```
User Submits → SUBMITTED → UNDER_REVIEW → APPROVED → DISBURSED
                                        ↘ REJECTED
```

## 🗄️ Status Values
`DRAFT` | `SUBMITTED` | `UNDER_REVIEW` | `APPROVED` | `REJECTED` | `DISBURSED`
