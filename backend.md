# Backend Development Guide: Book-Club Library API

This document details the backend server architecture, database modeling (MongoDB + Mongoose), security configurations (JWT), transaction calculations, and SMTP email services (Nodemailer) for the **Book-Club** library system.

---

## 🛠️ Technology Stack
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose ORM)
- **Security**: JWT (JSON Web Tokens), Bcrypt.js (password hashing)
- **Email Service**: Nodemailer
- **Environment Management**: dotenv

---

## 📁 Directory Structure
All backend code resides in the `Backend/` folder, structured as follows:

```
Backend/
├── src/
│   ├── controllers/         # Request handlers (processes payloads, coordinates DB interactions)
│   │   ├── authController.ts
│   │   ├── bookController.ts
│   │   ├── readerController.ts
│   │   ├── lendingController.ts
│   │   └── auditController.ts
│   ├── middleware/          # Express route middleware
│   │   ├── authMiddleware.ts # JWT decoding & role checks
│   │   └── logMiddleware.ts  # Automatic event-based audit logging
│   ├── models/              # Mongoose schemas & TypeScript type interfaces
│   │   ├── Book.ts
│   │   ├── Reader.ts
│   │   ├── Lending.ts
│   │   ├── User.ts (Library Staff credentials)
│   │   └── AuditLog.ts
│   ├── routes/              # Express API endpoint definitions
│   │   ├── authRoutes.ts
│   │   ├── bookRoutes.ts
│   │   ├── readerRoutes.ts
│   │   ├── lendingRoutes.ts
│   │   └── auditRoutes.ts
│   ├── utils/               # Helper methods
│   │   ├── mailer.ts        # Nodemailer config & email template generator
│   │   └── seed.ts          # Seed data script for initial catalog and admin staff
│   ├── app.ts               # Application setup (CORS, Parsers, Routing)
│   └── index.ts             # Server entry point (starts listener & connects to DB)
├── package.json             # Build commands, scripts, and runtime dependencies
├── tsconfig.json            # Compiler options for TypeScript to JavaScript
└── .env                     # Private environment configurations (port, DB URI, mail SMTP)
```

---

## 🗄️ Database Schemas & Models

### 1. **User (Staff Account)**
* **Fields**:
  - `username` (String, unique, required)
  - `password` (String, hashed, required)
  - `name` (String, required)

### 2. **Book**
* **Fields**:
  - `title` (String, required, indexed)
  - `author` (String, required)
  - `isbn` (String, unique, required)
  - `genre` (String)
  - `totalCopies` (Number, default 1)
  - `availableCopies` (Number, default 1)

### 3. **Reader**
* **Fields**:
  - `readerId` (String, unique, required) - unique reader barcode or serial number
  - `name` (String, required)
  - `email` (String, required, unique)
  - `phone` (String, required)
  - `registrationDate` (Date, default Date.now)

### 4. **Lending**
* **Fields**:
  - `book` (ObjectId, ref `Book`, required)
  - `reader` (ObjectId, ref `Reader`, required)
  - `issueDate` (Date, default Date.now, required)
  - `dueDate` (Date, required) - automatically calculated (e.g., Issue Date + 14 days)
  - `returnDate` (Date) - populated when returned
  - `status` (String, enum: `['LENT', 'RETURNED', 'OVERDUE']`, default `'LENT'`)

### 5. **AuditLog**
* **Fields**:
  - `action` (String, required) e.g., `'CREATE_BOOK'`, `'LEND_BOOK'`, `'DELETE_READER'`
  - `collection` (String, required) e.g., `'Book'`, `'Reader'`, `'Lending'`
  - `documentId` (String, required)
  - `performedBy` (ObjectId, ref `User`, required)
  - `details` (String) - changes made or transaction context
  - `timestamp` (Date, default Date.now)

---

## 🔒 Security & Auth Flow
- **Bcrypt**: All password inputs are salted and hashed (rounds = 10) on user creation. Verification is checked during login.
- **JWT**: Upon successful login, the server responds with a signed token payload containing `{ id: user._id, username: user.username }`.
- **Authorization**: The `authMiddleware.ts` parses the `Authorization: Bearer <token>` header, verifies the token, and populates `req.user`.

---

## 📧 Email Notification Setup (Nodemailer)
- Core functionality includes a single utility class in [mailer.ts](file:///e:/Book-Club/Backend/src/utils/mailer.ts).
- It initiates an SMTP transport node using parameters from the environment.
- On client request trigger (`POST /api/lending/overdue/:id/notify`), it pulls the specific overdue details (Book Title, Borrower Name, Due Date, Fine calculation if any) and compiles a dynamic HTML card sent directly to the Reader's registered email inbox.

---

## 🚀 Phase-Wise Backend Implementation (Git Commit Plan)

Use the following breakdown to construct your commits and prove a clean, step-by-step development process:

### **Phase 1: Project Setup & DB Connection**
* **Commit Message**: `feat(backend): scaffold Express application and configure MongoDB connection`
* **Tasks**:
  - Install devDependencies (typescript, ts-node-dev, nodemon, @types/...) and dependencies.
  - Setup [tsconfig.json](file:///e:/Book-Club/Backend/tsconfig.json) and basic Express server configurations in [index.ts](file:///e:/Book-Club/Backend/src/index.ts).
  - Configure dotenv support and write Mongoose connection script.

### **Phase 2: Authentication & User Endpoint**
* **Commit Message**: `feat(backend): implement auth controller, JWT signing, and auth middleware`
* **Tasks**:
  - Create [User.ts](file:///e:/Book-Club/Backend/src/models/User.ts) model.
  - Implement [authController.ts](file:///e:/Book-Club/Backend/src/controllers/authController.ts) containing Login logic and password comparison.
  - Add [authMiddleware.ts](file:///e:/Book-Club/Backend/src/middleware/authMiddleware.ts) to intercept routing and restrict access to unauthorized users.

### **Phase 3: Reader Resource CRUD**
* **Commit Message**: `feat(backend): implement reader models and REST routes with audit logs`
* **Tasks**:
  - Implement [Reader.ts](file:///e:/Book-Club/Backend/src/models/Reader.ts) model and schema validations.
  - Write standard REST operations (GET list, GET by ID, POST new, PUT update, DELETE delete) under `src/routes/readerRoutes.ts`.
  - Wire up global audit interceptor to record action logs in MongoDB.

### **Phase 4: Book Catalog CRUD**
* **Commit Message**: `feat(backend): implement book models and search routes with stock tracking`
* **Tasks**:
  - Implement [Book.ts](file:///e:/Book-Club/Backend/src/models/Book.ts) model and schema validations.
  - Add REST operations for Books, including regex-based text search parameters for filtering by ISBN, Author, and Title.

### **Phase 5: Lending Operations & Transactions**
* **Commit Message**: `feat(backend): implement lending controller, returns, and inventory counts`
* **Tasks**:
  - Create [Lending.ts](file:///e:/Book-Club/Backend/src/models/Lending.ts) model.
  - Build lending controller with transactions:
    - Verify Book is in stock (Available copies > 0).
    - Decrement available book copies on lending.
    - Set due date automatically (Issue date + 14 days).
  - Build returns handler:
    - Update Lending record to `RETURNED`.
    - Set return date.
    - Increment available book copies in catalog.

### **Phase 6: Overdue Detection & Email Notifications**
* **Commit Message**: `feat(backend): implement overdue validation and Nodemailer notification engine`
* **Tasks**:
  - Build overdue query filters comparing `dueDate < Date.now()` and status matches `LENT`.
  - Integrate [mailer.ts](file:///e:/Book-Club/Backend/src/utils/mailer.ts) helper.
  - Add API route `POST /api/lending/overdue/:id/notify` that sends an overdue alert email to the specific reader using templates.

### **Phase 7: Seed Scripts & Audit Trail API**
* **Commit Message**: `feat(backend): add database seed helper and audit log endpoints`
* **Tasks**:
  - Write database seeding script [seed.ts](file:///e:/Book-Club/Backend/src/utils/seed.ts) with predefined readers, books, and admin user credentials.
  - Create `/api/audit` router to retrieve system operations histories.
