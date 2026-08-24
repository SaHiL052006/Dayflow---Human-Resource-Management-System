# Dayflow HRMS - Development Progress Log

This document tracks milestones, completed stages, and technical decisions made throughout the Dayflow HRMS project lifecycle.

---

## 📌 Stage 1: Project Setup

### Overview
Established the foundational full-stack monorepo structure for Dayflow HRMS using the MERN stack (MongoDB, Express.js, React, Node.js).

### Completed Items

#### 1. Backend Architecture (`/server`)
- **Runtime & Framework**: Initialized Node.js project configured with ES Modules (`"type": "module"`).
- **Environment Management**: Configured `dotenv` with `.env` and `.env.example` templates.
- **Database Layer**: Built robust MongoDB connection handler with Mongoose (`config/db.js`), including connection status monitoring, auto-reconnect listeners, and graceful shutdown handling.
- **Folder Structure**:
  - `/config` — Database & app configuration.
  - `/controllers` — Route controllers (e.g., `healthController.js`).
  - `/middleware` — Centralized error handler and 404 router middleware.
  - `/models` — Mongoose schemas placeholder.
  - `/routes` — API routes modular structure (e.g., `healthRoutes.js`).
  - `/utils` — Standardized response utility (`utils/response.js`).
- **Core Middleware**:
  - `cors` with flexible client origin mapping.
  - `morgan` HTTP request logger for development visibility.
  - Express built-in JSON and URL-encoded body parsers.
  - Centralized error-handling middleware (`errorHandler.js`).
- **Health Check Endpoint**:
  - `GET /api/health` providing real-time server status, database connection state, memory usage, and uptime.

#### 2. Frontend Architecture (`/client`)
- **Build Tool & Framework**: Configured React 18 with Vite for ultra-fast HMR and build performance.
- **Styling**: Configured Tailwind CSS with custom font and theme tokens for an enterprise HRMS appearance.
- **Routing**: Set up `react-router-dom` with foundational routes.
- **Folder Structure**:
  - `/components` — Layout, Navbar, and Sidebar navigation.
  - `/pages` — Page view components.
  - `/context` — Global state management (`AuthContext.jsx`).
  - `/hooks` — Custom hooks (`useAuth.js`).
  - `/services` — Configured Axios client with interceptors (`api.js`) and API services (`healthService.js`).
- **Icons**: Integrated `lucide-react` for modern icon set.

---

## 📌 Stage 2: Authentication & Role-Based Access Control (RBAC)

### Overview
Engineered enterprise-grade user authentication and role-based access control (RBAC) across the MERN stack with password security, tokenized email verification flow, JWT authorization, protected routes, and dedicated role portals.

### Completed Items

#### 1. Backend Authentication Layer (`/server`)
- **User Model (`models/User.js`)**:
  - Schema fields: `employeeId` (unique, uppercase), `name`, `email` (unique, lowercase), `password` (hashed with bcrypt), `role` (`"employee"` | `"admin"`), `isEmailVerified` (boolean), `verificationToken`, `verificationTokenExpires`.
  - Secure pre-save hook for automatic bcrypt password hashing with salt rounds.
  - Instance methods: `matchPassword()` for constant-time comparison, `generateVerificationToken()` for SHA-256 token hashing.
- **Endpoints (`controllers/authController.js` & `routes/authRoutes.js`)**:
  - `POST /api/auth/signup`: Validates employee ID uniqueness, email uniqueness, and strict password security rules (min 8 chars, 1 uppercase, 1 number). Generates verification token and simulates email dispatch.
  - `GET /api/auth/verify/:token`: Verifies email verification tokens, marks `isEmailVerified: true`, and expires the token.
  - `POST /api/auth/login`: Authenticates credentials with bcrypt, generates signed JWT access token with user details and embedded role payload.
  - `GET /api/auth/me`: Authenticated profile retrieval endpoint.
  - `POST /api/auth/logout`: Graceful session termination endpoint.
- **Middleware (`middleware/authMiddleware.js`)**:
  - `authMiddleware` / `protect`: Extracts and verifies Bearer JWT tokens, injects sanitized user object into `req.user`.
  - `roleMiddleware(allowedRoles)`: Enforces role permissions and denies unauthorized requests with 403 Forbidden.

#### 2. Frontend Authentication & RBAC (`/client`)
- **Auth Context (`context/AuthContext.jsx`)**:
  - Centralized authentication state management with session initialization and localStorage synchronization (`dayflow_token`, `dayflow_user`).
  - Role-based boolean helpers: `isAdmin`, `isEmployee`, `isAuthenticated`.
- **Protected Routing (`components/ProtectedRoute.jsx`)**:
  - Prevents unauthorized access by redirecting unauthenticated visitors to `/login`.
  - Enforces role-based route guarding with custom 403 Forbidden screen if a user attempts to access an unauthorized section.

---

## 📌 Stage 3: Dashboards & Context Switching

### Overview
Built customized, card-based responsive dashboards for Employees and Administrators, supported by admin-only workforce APIs, live summary metrics, and contextual inspection capabilities.

### Completed Items

#### 1. Backend Admin API (`/server`)
- **Admin Controller (`controllers/adminController.js`)**:
  - `GET /api/admin/employees`: Protected endpoint returning all workforce records (name, employeeId, email, role, account status, department, join date) from MongoDB.
  - `GET /api/admin/stats`: Aggregates total workforce count, active attendance estimate, pending leave requests, and verified account count.
  - `GET /api/admin/employees/:id`: Single employee lookup returning personal profile, attendance logs, leave balances, and compensation status.
- **Admin Routes (`routes/adminRoutes.js`)**:
  - Fully secured with `protect` and `roleMiddleware(['admin'])`.

#### 2. Frontend Dashboards & Layout (`/client`)
- **Employee Dashboard (`pages/EmployeeDashboardPage.jsx`)**:
  - **Quick-Access Cards**: Profile card (employee details), Attendance punch card (interactive clock-in/out timer), Leave Requests card (leave balances & modal application form), and Logout card.
  - **Recent Activity & Alerts Feed**: Live feed with status chips for leave approvals, attendance check-in timestamps, official company holiday alerts, and security status.
- **Admin/HR Dashboard (`pages/AdminDashboardPage.jsx`)**:
  - **Summary Widgets**: Total workforce, present today (% & count), pending leave approvals count, and verified accounts.
  - **Live Workforce Directory Table**: Fetches from `GET /api/admin/employees`, featuring real-time client-side search by name/ID/email and role filtering.
  - **Context Switching**: "Inspect Record" action button on each row allowing Admins to view detailed employee attendance and leave histories.

---

## 📌 Stage 4: Profile Management

### Overview
Constructed comprehensive employee profile management with role-restricted update authorization on the employee side, full workforce editing on the admin side, structured salary calculation breakdowns, and documents repository.

### Completed Items

#### 1. Backend Profile & Extended Model Layer (`/server`)
- **Extended User Schema (`models/User.js`)**:
  - Added `phone`, `address`, `profilePictureUrl`.
  - Added `jobDetails`: `designation`, `department`, `joiningDate`.
  - Added `salaryStructure`: `basic`, `hra`, `allowances`, `deductions`.
  - Added `documents`: Array of `{ name, url, type, uploadedAt }`.
- **Profile Controller & Routes (`controllers/profileController.js` & `routes/profileRoutes.js`)**:
  - `GET /api/profile/me`: Returns the authenticated user's complete profile with job details, salary structure, and documents.
  - `PUT /api/profile/me`: Employee restricted update allowing changes **ONLY** to `phone`, `address`, `profilePictureUrl`, and `name`. Rejects/blocks any modifications to `role`, `salaryStructure`, `jobDetails`, `employeeId`, or `email`.
- **Admin Full Update Endpoint (`controllers/adminController.js` & `routes/adminRoutes.js`)**:
  - `GET /api/admin/employees/:id`: Returns full profile of any employee with stored subdocuments.
  - `PUT /api/admin/employees/:id`: Admin-only full update allowing HR administrators to modify any employee's name, email, role, job details (designation, department, joining date), salary structure (basic, hra, allowances, deductions), documents, and verification state.

#### 2. Frontend Profile Interfaces (`/client`)
- **Employee Profile Page (`pages/EmployeeProfilePage.jsx` on `/employee/profile`)**:
  - **View Mode**: Personal details, avatar, work email, phone, address, job & employment details, read-only salary structure breakdown with gross pay & net in-hand calculation, and documents vault.
  - **Edit Mode**: Allows the employee to update contact info (phone & address) and upload a new profile picture. Locks organization and salary fields.
- **Admin Employee Detail & Editor (`pages/EmployeeDetailPage.jsx` on `/admin/employees/:id`)**:
  - Full admin management suite with tabbed organization: *Profile & Contact*, *Job & Department*, *Salary & Compensation*, *Attendance Logs*, and *Leave Balances*.
  - Full editing mode allowing administrators to alter employee roles, departments, designations, and salary numbers with persistent MongoDB saving.

---

## 📌 Stage 5: Attendance Tracking

### Overview
Engineered attendance tracking architecture including live check-in/out punch timestamps, shift duration calculations, on-the-fly absence computation for missed weekdays, employee weekly attendance grid, and administrator workforce attendance oversight.

### Technical Design Decisions
- **On-The-Fly Absent Computation**: To ensure lightweight, reliable operation within hackathon time constraints without running an external scheduled cron daemon, missing weekday records (Mon-Fri) are computed on-the-fly during range queries (`GET /api/attendance/me`). If a past working day contains no punch record in MongoDB, it is automatically returned as `'Absent'`, providing immediate, accurate calendar views.

### Completed Items

#### 1. Backend Attendance Layer (`/server`)
- **Attendance Model (`models/Attendance.js`)**:
  - Fields: `employee` (ref `User`), `employeeId`, `employeeName`, `department`, `date` (`YYYY-MM-DD`), `checkInTime`, `checkOutTime`, `workDurationMinutes`, `status` (`'Present'`, `'Absent'`, `'Half-day'`, `'Leave'`), `notes`.
  - Compound unique index on `{ employee: 1, date: 1 }` ensuring strict daily punch integrity.
- **Attendance Endpoints (`controllers/attendanceController.js` & `routes/attendanceRoutes.js`)**:
  - `POST /api/attendance/checkin`: Records today's check-in timestamp and sets `status: 'Present'`.
  - `POST /api/attendance/checkout`: Records check-out timestamp, calculates duration in minutes, and adjusts status to `'Half-day'` if shift was less than 4 hours (240 mins).
  - `GET /api/attendance/today-status`: Quick endpoint returning current punch state for dashboard cards.
  - `GET /api/attendance/me?range=daily|weekly|monthly`: Returns employee's own attendance history with on-the-fly absent computation and summary statistics (attendance rate, present count, absent count, half-days, total hours).
  - `GET /api/attendance/admin?employeeId=&date=&range=`: Admin-only endpoint to view workforce-wide attendance logs with date and employee filters.

#### 2. Frontend Attendance Interfaces (`/client`)
- **Employee Attendance Page (`pages/EmployeeAttendancePage.jsx` on `/employee/attendance`)**:
  - **Live Punch Clock Station**: Real-time digital clock ticker (HH:MM:SS), dynamic button state (*Check In Shift* vs *Check Out Shift* vs *Shift Completed*), and live session elapsed timer.
  - **Summary KPI Widgets**: Present days count & attendance rate percentage, Half-days count, Absent days count, and Total logged hours.
  - **Attendance History Table**: Range toggle (Daily, Last 7 Days, Last 30 Days) with color-coded status badges (`Present`: green dot, `Half-day`: amber dot, `Absent`: red dot, `Leave`: indigo dot).
- **Admin Attendance Page (`pages/AdminAttendancePage.jsx` on `/admin/attendance`)**:
  - Workforce attendance monitoring dashboard with live search, employee dropdown filter, range selector (Today vs Weekly), workforce KPI widgets, and full punch duration table.
- **Dashboard Integration**:
  - Connected the Employee Dashboard attendance punch card directly to `attendanceService` for live check-in/out.

---

## 📌 Stage 6: Leave Management

### Overview
Constructed end-to-end leave management and approval workflows, featuring multi-type leave applications (`Paid`, `Sick`, `Unpaid`), annual balance tracking, admin review with custom feedback comments, instant attendance synchronization for approved leaves, and dynamic employee dashboard alerts.

### Completed Items

#### 1. Backend Leave Architecture (`/server`)
- **Leave Model (`models/Leave.js`)**:
  - Fields: `employee` (ref `User`), `employeeId`, `employeeName`, `department`, `leaveType` (`'Paid'`, `'Sick'`, `'Unpaid'`), `startDate`, `endDate`, `daysCount`, `remarks`, `status` (`'Pending'`, `'Approved'`, `'Rejected'`), `adminComment`, `reviewedBy` (ref `User`), `reviewedAt`.
  - Indexes on `{ employee: 1, createdAt: -1 }`, `{ status: 1 }`, and `{ startDate: 1, endDate: 1 }`.
- **Leave Controller & Endpoints (`controllers/leaveController.js` & `routes/leaveRoutes.js`)**:
  - `POST /api/leaves`: Validates date order, calculates duration in days, and registers new request with `status: 'Pending'`.
  - `GET /api/leaves/me`: Returns authenticated employee's leave history sorted chronologically, along with computed annual leave allowances (Paid: 14, Sick: 7, Unpaid).
  - `GET /api/leaves/admin?status=`: Admin-only endpoint with status filter (`Pending`, `Approved`, `Rejected`, `All`), populating employee profile and reviewer details with summary counters.
  - `PATCH /api/leaves/admin/:id`: Admin-only review endpoint updating request status with optional `adminComment`. **On Approval**, automatically synchronizes `Attendance` records for every date within the leave range marked with `status: 'Leave'`.
- **Server Integration (`server.js`)**:
  - Mounted `/api/leaves` at `leaveRoutes`.

#### 2. Frontend Leave Interfaces (`/client`)
- **Employee Leave Page (`pages/EmployeeLeavePage.jsx` on `/employee/leave` & `/leaves`)**:
  - **Application Form**: Leave type dropdown, date range pickers with live days counter badge, remarks textarea, and submission handling.
  - **Leave Balances Summary**: Paid Annual remaining, Sick Leave remaining, Unpaid days taken, and Pending Review counter.
  - **My Leave Request History Table**: Displays leave type, dates, duration, employee remarks, admin feedback comments, and status dot badges.
- **Admin Leave Approvals Page (`pages/AdminLeaveApprovalsPage.jsx` on `/admin/leaves`)**:
  - **Status Tabs**: Quick filtering for *Pending*, *Approved*, *Rejected*, and *All Requests*.
  - **Workforce Requests Table**: Employee info (avatar, ID, department), leave type, date range, duration, remarks, and review actions.
  - **Approval Modal with Remarks**: Allows administrators to input optional management feedback comments and confirms automatic attendance synchronization on approval.

---

## 📌 Stage 7: Payroll Engine & In-App Notification System

### Overview
Engineered the compensation architecture, net salary computational engine, admin workforce salary structure management, and real-time in-app notification center with dynamic unread badges, popover dropdowns, and automated event triggers.

### Completed Items

#### 1. Backend Payroll & Notifications Architecture (`/server`)
- **Notification Model (`models/Notification.js`)**:
  - Fields: `userId` (ref `User`), `title`, `message`, `type` (`'leave'`, `'payroll'`, `'attendance'`, `'system'`, `'onboarding'`), `isRead` (boolean), `link`, `createdAt`.
  - Indexed on `{ userId: 1, isRead: 1, createdAt: -1 }`.
- **Notification Controller & Endpoints (`controllers/notificationController.js` & `routes/notificationRoutes.js`)**:
  - `createNotificationHelper`: Centralized notification dispatcher utility.
  - `GET /api/notifications/me`: Retrieves authenticated user's notification list with unread counter.
  - `PATCH /api/notifications/:id/read`: Marks an individual notification as read.
  - `PATCH /api/notifications/read-all`: Bulk marks all unread notifications as read.
- **Payroll Controller & Endpoints (`controllers/payrollController.js` & `routes/payrollRoutes.js`)**:
  - `computeSalaryBreakdown`: Helper computing `basic`, `hra`, `allowances`, `deductions`, `grossSalary = basic + hra + allowances`, `netSalary = grossSalary - deductions`, `annualGross`, `annualNet`.
  - `GET /api/payroll/me`: Returns personal compensation breakdown, itemized earnings, statutory withholdings, and monthly payslips history.
  - `GET /api/payroll/admin`: Admin-only endpoint aggregating workforce-wide payroll metrics (total monthly gross outlay, total net take-home, average net salary, total tax withholdings) and compensation roster.
  - `PUT /api/payroll/admin/:id`: Admin-only endpoint updating an employee's salary numbers (`basic`, `hra`, `allowances`, `deductions`) and automatically dispatching an in-app alert notification.
- **Leave Notification Integration (`controllers/leaveController.js`)**:
  - Automatically dispatches leave status update notifications (`Approved` / `Rejected`) with admin feedback remarks directly into the employee's notification tray.
- **Server Integration (`server.js`)**:
  - Mounted `/api/payroll` and `/api/notifications`.

#### 2. Frontend Payroll & Notifications Interfaces (`/client`)
- **Employee Payroll Page (`pages/EmployeePayrollPage.jsx` on `/employee/payroll` & `/payroll`)**:
  - **KPI Summary**: Monthly Net Take-Home Pay, Gross Earnings, Total Deductions, and Annual CTC.
  - **Itemized Breakdown**: Earnings table (Basic, HRA, Special Allowances with % of gross) and Deductions table (Provident Fund, Income Tax / TDS).
  - **Monthly Salary Slips & Printable Viewer**: Generated payslips with detailed modal preview and browser print integration.
- **Admin Payroll Management Page (`pages/AdminPayrollPage.jsx` on `/admin/payroll`)**:
  - **Executive Outlay KPIs**: Monthly Gross Outlay, Total Net Disbursed, Statutory Deductions, and Average Net Salary.
  - **Workforce Compensation Table**: Real-time search by employee name, ID, or department.
  - **Interactive Salary Structure Modal**: Live recalculation of Gross & Net Pay while editing, with instant save and employee notification.
- **Navbar Notification Bell & Popover (`components/Navbar.jsx`)**:
  - Dynamic unread count badge.
  - Interactive popover dropdown listing recent notifications with category icons and timestamps.
  - Click-to-read with automatic navigation link routing and "Mark all as read" button.

---

## 📌 Stage 8: Analytics & Reports Engine, Global UI Polish & Deployment Readiness

### Overview
Delivered executive workforce analytics, visual distribution charts for attendance rates and leave requests, an official salary slip generation and printable export engine with number-to-words conversion, double-submit protection, and structured deployment templates.

### Completed Items

#### 1. Backend Analytics & Reports Architecture (`/server`)
- **Report Controller & Endpoints (`controllers/reportController.js` & `routes/reportRoutes.js`)**:
  - `numberToWords`: Converter utility rendering official net salary amount in words for legal compliance.
  - `GET /api/admin/reports/attendance-summary`: Aggregates company attendance metrics (`Present`, `Absent`, `Half-day`, `Leave`), computes company attendance rate, and provides status and department-wise distributions.
  - `GET /api/admin/reports/leave-summary`: Aggregates leave metrics across types (`Paid`, `Sick`, `Unpaid`) and review statuses (`Pending`, `Approved`, `Rejected`), with total approved days and approval rate.
  - `GET /api/admin/reports/salary-slip/:employeeId`: Generates an official, structured company payslip payload including letterhead, employee meta, itemized earnings/deductions, gross/net pay, and net amount in words.
- **Server Integration (`server.js`)**:
  - Mounted `/api/admin/reports` with `protect` and `roleMiddleware(['admin'])`.
- **Environment Documentation (`server/.env.example`)**:
  - Template configured with `PORT`, `NODE_ENV`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, and `CLIENT_URL`.

#### 2. Frontend Analytics & Reports Interfaces (`/client`)
- **Admin Reports & Analytics Page (`pages/AdminReportsPage.jsx` on `/admin/reports`)**:
  - **KPI Strip**: Active Workforce Headcount, Overall Attendance Rate, Total Approved Leave Days, and Leave Approval Rate.
  - **Visual Distribution Charts**:
    - Interactive Attendance Status Bars & Department Overview breakdown.
    - Leave Request Category & Status distribution cards.
  - **Official Salary Slip Generator Flow**:
    - Select employee and billing period dropdown.
    - Generates official company payslip modal with letterhead, itemized earnings/deductions, number-to-words net salary, and browser print / PDF export.

---

## 🎨 Stage 9: Minimal Grey/White Theme & Simplified 3D Landing Page

### Overview
Redesigned the entire application with a minimal grey-and-white enterprise aesthetic, subtle 1px borders, near-black primary accents (`#18181B`), Inter typography, and an ambient low-power 3D procedural background for the landing page.

### Completed Items

#### 1. Design System & Palette Specification
- **Base Backgrounds**: Pure White (`#FFFFFF`) and Off-White (`#FAFAFA` / `#F4F4F5`).
- **Primary Accent**: Charcoal / Near-Black (`#18181B`, `#0F172A`) for primary action buttons and active indicators.
- **Borders & Dividers**: Crisp 1px borders (`border-slate-200/90`, `border-slate-300`).
- **Status Badges**: Soft neutral grey badges with colored status dots (`bg-emerald-500` for Present/Approved, `bg-amber-500` for Half-day/Pending, `bg-rose-500` for Absent/Rejected, `bg-indigo-500` for Leave).
- **Typography**: Clean *Inter* font across headings and body text.

#### 2. Stylish Typographic Wordmark (`components/Logo.jsx`)
- Replaced separate icon box with a modern typographic symbol where **"Dayflow"** itself serves as the distinctive brand mark (`Day` in bold/black + `flow` in light italic with an emerald alignment dot `•`).
- Reusable across Navbar, Sidebar, Login, Signup, Verify, and Landing pages with dark/light variants and embedded SVG favicon in `index.html`.

#### 3. Simplified 3D Background Canvas (`components/Dayflow3DScene.jsx`)
- Low-power WebGL 3D canvas positioned quietly in the background behind hero text.
- Ambient wireframe geometries and kinetic gimbal rings floating with smooth rotation.
- Automatic WebGL fallback to clean CSS mesh gradient on unsupported devices.

#### 4. Simplified Transparent Landing Page (`pages/LandingPage.jsx` on `/`)
- Removed solid opaque card box behind the hero so the headline and CTAs float seamlessly over the 3D rotating rings.
- Minimalist centered hero with headline: *"Every workday, perfectly aligned."*
- Clean dual CTAs: *"Get Started"* (`/signup`) and *"Sign In to Portal"* (`/login`).
- Smart auto-redirect to dashboard when logged in.

#### 5. Complete App-Wide Restyling & High-Contrast Dark Accents
- Sleek dark theme sidebar (`#111827`) with light text and stylish light wordmark.
- Real-time punch station in dark charcoal with glowing clock digits for executive contrast.
- Restyled all internal pages (`LoginPage`, `SignupPage`, `VerifyEmailPage`, `NotFoundPage`, `EmployeeDashboardPage`, `AdminDashboardPage`, `EmployeeAttendancePage`, `AdminAttendancePage`, `EmployeeLeavePage`, `AdminLeaveApprovalsPage`, `EmployeePayrollPage`, `AdminPayrollPage`, `AdminReportsPage`, `EmployeeProfilePage`, `EmployeeDetailPage`).
- Consistent 1px bordered cards, minimalist tables, and clean action buttons throughout.

---

## 🏆 Project Milestones Completed
- ✅ **Stage 1**: Monorepo Setup, Health Monitor & Express/Mongoose Core
- ✅ **Stage 2**: Authentication, Verification Tokens & RBAC Route Guarding
- ✅ **Stage 3**: Personalized Dashboards, Workforce Directory & Context Inspection
- ✅ **Stage 4**: Extended Profile Management & Restricted Self-Service
- ✅ **Stage 5**: Attendance Tracking, Live Clock Punch Station & Absence Computation
- ✅ **Stage 6**: Leave Request Approvals Workflow & Attendance Synchronization
- ✅ **Stage 7**: Payroll Engine, Salary Revision & In-App Notification System
- ✅ **Stage 8**: Analytics & Reports Engine, Global UI Polish & Deployment Readiness
- ✅ **Stage 9**: Minimal Grey/White Theme & Simplified 3D Landing Page
