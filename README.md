# HotelPro — Full-Stack Hotel Management & Luxury Room Booking System

HotelPro is an enterprise-grade, responsive full-stack MERN (MongoDB, Express, React, Node.js) web application designed for luxury hospitality management and room reservations. It delivers a modern, high-conversion guest experience alongside a robust administrative management portal.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Folder Structure](#folder-structure)
5. [Prerequisites](#prerequisites)
6. [Environment Variables](#environment-variables)
7. [Installation & Setup](#installation--setup)
8. [Database Seeding & Initial Admin Account](#database-seeding--initial-admin-account)
9. [Running Frontend & Backend Locally](#running-frontend--backend-locally)
10. [REST API Endpoints](#rest-api-endpoints)
11. [Payment Sandbox Workflow](#payment-sandbox-workflow)
12. [Testing & Verification](#testing--verification)
13. [Security Architecture](#security-architecture)

---

## 1. Project Overview

HotelPro replaces legacy hotel management spreadsheets and generic reservation templates with a purpose-built, luxury-branded platform. It empowers guests to discover suites, verify live room availability across specific date ranges, book rooms, and checkout through a PCI-compliant simulated sandbox. On the back office side, administrators can monitor real-time gross revenue, manage reservations, update room catalog details, upload multi-image galleries via Multer, and safeguard audit history against accidental deletions.

---

## 2. Key Features

### Customer Experience
- **Luxury Landing Page:** High-resolution hero carousel, quick date/guest search bar, signature amenities, testimonials, and awards showcase.
- **Dynamic Date-Based Availability:** Availability is determined strictly on the fly by checking overlapping confirmed/pending bookings rather than static manual counters.
- **Suite Filtering:** Filter by Room Type (`Single`, `Double`, `Deluxe`, `Suite`, `Family`), price range slider, guest capacity, and search keywords.
- **Suite Details & Gallery:** Photo thumbnail carousel, comprehensive amenities checklist, and interactive stay price calculator.
- **3-Step Checkout Flow:**
  1. Primary guest details and date confirmation.
  2. Server verification of overlapping bookings, capacity, total nights, and pricing.
  3. Interactive payment sandbox simulation (test cards, success and decline scenarios).
- **Customer Portal (`My Bookings`):** View active, confirmed, and cancelled stays, printable booking vouchers, and one-click booking cancellation with policy-based sandbox refunds.
- **Role-Based Authentication:** Secure registration (customer role only), login with password visibility toggle, and HttpOnly session cookies.

### Administrative Management Portal
- **Dashboard Overview:** KPI stat cards tracking Total Rooms, Active Inventory, Registered Guests, Total Reservations, Confirmed Stays, Cancelled Stays, and Gross Verified Revenue ($).
- **All Bookings:** Filter by booking status (`pending`, `confirmed`, `completed`, `cancelled`) and payment status (`paid`, `pending`, `refunded`, `failed`) with instant search and status management.
- **Room Catalog Management:** View inventory, toggle active/inactive status, edit room details, and safe-delete rooms (deletions are rejected if linked to historical bookings).
- **Room Creation with Multer:** Validated form supporting multi-file image uploads (JPEG, PNG, WebP up to 5MB) and external image URLs.
- **Customer Directory:** View registered guests, contact details, total booking counts, and cumulative expenditure.

---

## 3. Technology Stack

### Frontend
- **Framework:** React 19 with Vite
- **Styling:** Bootstrap 5, Custom CSS3 Luxury Hospitality Design System (`Cinzel` & `Plus Jakarta Sans` Google Fonts)
- **Routing:** React Router DOM (v7)
- **Icons:** React Icons (`Fa` & `Fa6`)
- **HTTP Client:** Axios with `withCredentials: true` and Bearer token interceptor

### Backend
- **Runtime:** Node.js (v24+)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs password hashing
- **File Uploads:** Multer with mime-type verification and 5MB per-file constraints
- **Cross-Origin & Parsing:** CORS (credentials enabled), cookie-parser, express.json

---

## 4. Folder Structure

```
hotelpro/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── HeroCarousel.jsx
│   │   │   ├── RoomCard.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── SignUp.jsx
│   │   │   ├── UserHome.jsx
│   │   │   ├── Rooms.jsx
│   │   │   ├── RoomDetails.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   ├── BookingPage.jsx
│   │   │   ├── AdminHome.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── .env
│   └── package.json
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── roomController.js
│   │   ├── bookingController.js
│   │   ├── adminController.js
│   │   └── paymentController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── adminMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── userModel.js
│   │   ├── roomModel.js
│   │   ├── bookingModel.js
│   │   └── paymentModel.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── roomRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── adminRoutes.js
│   │   └── paymentRoutes.js
│   ├── uploads/
│   │   └── rooms/
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── seed.js
│   ├── tests/
│   │   └── api.test.js
│   ├── .env.example
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
├── .gitignore
└── README.md
```

---

## 5. Prerequisites

- **Node.js**: v18.0.0 or higher (Tested with v24.13.0)
- **MongoDB**: Local MongoDB instance running on port 27017 or a MongoDB Atlas URI
- **npm**: v9+ (Tested with v11.6.2)

---

## 6. Environment Variables

### Backend Configuration (`backend/.env`)
```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/hotelpro
JWT_SECRET=hotelpro_super_secret_jwt_key_2026_production_grade_random_seed_9876543210
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:5173
PAYMENT_MODE=sandbox
```

### Frontend Configuration (`frontend/.env`)
```ini
VITE_API_URL=http://localhost:5000/api
```

---

## 7. Installation & Setup

1. **Clone or navigate to the workspace directory:**
   ```bash
   cd c:\Users\anura\HotelPro
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

---

## 8. Database Seeding & Initial Admin Account

To safely initialize the database without exposing an insecure public admin registration route, run the dedicated seed script:

```bash
cd backend
npm run seed
```

This bootstraps:
- **Administrator Account:**
  - **Email:** `admin@hotelpro.com`
  - **Password:** `Admin@12345`
  - **Role:** `admin`
- **Sample Customer Account:**
  - **Email:** `customer@hotelpro.com`
  - **Password:** `Customer@12345`
  - **Role:** `customer`
- **6 Premium Hotel Suites:** Single, Double, Oceanfront Deluxe, Royal Penthouse Suite, Family Garden Residence, and Sunset Terrace Suite.
- **Sample Verified Reservation:** Pre-loaded for immediate dashboard analytics.

---

## 9. Running Frontend & Backend Locally

### Start Backend API Server
```bash
cd backend
npm run dev
```
*The API server will connect to MongoDB and start on `http://localhost:5000`.*

### Start Frontend Application
In a separate terminal:
```bash
cd frontend
npm run dev
```
*The Vite development server will start on `http://localhost:5173`.*

---

## 10. REST API Endpoints

Base URL: `/api`

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register customer account (forces customer role) |
| `POST` | `/api/auth/login` | Public | Authenticate user & return signed JWT cookie/token |
| `GET` | `/api/auth/me` | Private | Retrieve authenticated profile |
| `POST` | `/api/auth/logout` | Private | Clear session cookie |

### Rooms (`/api/rooms`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/rooms` | Public | Filter rooms by type, price, guests, and dates |
| `GET` | `/api/rooms/availability` | Public | Check room date overlap availability |
| `GET` | `/api/rooms/:id` | Public | Get single suite specifications |
| `POST` | `/api/rooms` | Admin | Create room with Multer image upload |
| `PUT` | `/api/rooms/:id` | Admin | Update room specifications |
| `PATCH` | `/api/rooms/:id/status` | Admin | Toggle room active/inactive |
| `DELETE` | `/api/rooms/:id` | Admin | Safe deletion (fails if bookings exist) |

### Bookings (`/api/bookings`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/bookings` | Private | Create booking (concurrency lock, server price calculation) |
| `GET` | `/api/bookings/my` | Private | Get logged-in customer's reservations |
| `GET` | `/api/bookings/:id` | Private | Get single booking details (owner or admin) |
| `PATCH` | `/api/bookings/:id/cancel` | Private | Cancel booking & trigger sandbox refund |

### Payments (`/api/payments`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/payments/checkout` | Private | Process sandbox payment (success / decline simulation) |
| `POST` | `/api/payments/webhook` | Public | External PSP webhook receiver |
| `GET` | `/api/payments/:bookingId/status` | Private | Retrieve payment audit status |

### Admin Management (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Admin | Metrics summary, revenue, and recent stays |
| `GET` | `/api/admin/bookings` | Admin | Search, filter, and paginate all reservations |
| `PATCH` | `/api/admin/bookings/:id/status` | Admin | Update booking status & handle manual refund |
| `GET` | `/api/admin/rooms` | Admin | List all rooms with reservation statistics |
| `GET` | `/api/admin/users` | Admin | Registered customer directory & total spend |

---

## 11. Payment Sandbox Workflow

HotelPro enforces zero storage of raw card numbers, CVVs, or sensitive magnetic stripe data:
1. **Initiation:** The customer creates a pending reservation.
2. **Review:** Server computes nights and exact total.
3. **Sandbox Execution:**
   - The user selects or inputs a simulated card.
   - Click **"Pay & Simulate Success"**: Records transaction `TXN-HP-...`, confirms booking, and marks payment status as `paid`.
   - Click **"Test Card Decline"**: Simulates bank rejection, records transaction `FAIL-...`, marks payment status as `failed` with 402 status code.
4. **Refund Processing:** When an eligible paid reservation is cancelled before the check-in date, a sandbox refund transaction `REF-...` is generated and recorded.

---

## 12. Testing & Verification

HotelPro includes an automated backend integration test suite validating:
- Public customer registration and duplicate email rejection.
- Customer and Administrator login credential verification.
- 403 Forbidden enforcement blocking customers from administrative routes.
- Dynamic room availability and overlapping interval filtering.
- Strict server-side total price calculations.
- Overlapping booking prevention under concurrent simulation (409 Conflict).
- Payment sandbox success and decline handling.
- Booking cancellation and automatic sandbox refunds.
- Data isolation ensuring customers cannot access other customers' records.

Run the integration suite:
```bash
cd backend
npm test
```
*Expected result: 13 / 13 integration tests passing.*

---

## 13. Security Architecture

- **Password Protection:** Uses `bcryptjs` with salt rounds = 10. Passwords are never returned in JSON queries (`select('-password')` and model `toJSON` strip).
- **Session Tokens:** Signed using `jsonwebtoken` with 24h expiration, delivered in secure HttpOnly cookies (`sameSite: 'lax'`) and Bearer headers.
- **Role Verification:** Roles are enforced strictly by server-side database lookups in `adminMiddleware.js`; client-supplied roles are completely ignored.
- **Upload Hardening:** Multer checks file size (< 5MB), limits file count (< 8), validates MIME types against an explicit whitelist (`image/jpeg`, `image/png`, `image/webp`), and assigns cryptographic timestamps.
- **Concurrency Protection:** In-flight room reservation requests employ mutex locking to prevent race conditions during booking creation.
- **Database Safety:** Safe deletion guards prevent administrators from deleting rooms with existing reservation history, preserving financial audit trails.
