# Frontend Development Guide: Book-Club Library App

This document outlines the architecture, layout, design system, and phase-wise implementation plan for the **Book-Club** React frontend. 

---

## 🛠️ Technology Stack
- **Framework**: React (Vite template for fast HMR)
- **Language**: TypeScript (for strong typing and code completion)
- **Styling**: Tailwind CSS (customized utility classes with harmonious colors)
- **Icons**: Lucide React
- **Routing**: React Router DOM (v6)
- **API Client**: Axios

---

## 📁 Directory Structure
All frontend code will reside in the `Frontend/` folder, structured as follows:

```
Frontend/
├── public/                 # Static assets (favicons, logos)
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Button.tsx      # Premium interactive button (with loading states)
│   │   ├── Input.tsx       # Standardized form input fields with error messages
│   │   ├── Sidebar.tsx     # Navigation sidebar (collapsible on mobile)
│   │   ├── Navbar.tsx      # Top header containing profile and page titles
│   │   ├── Modal.tsx       # Centralized modal overlay for CRUD forms
│   │   └── Table.tsx       # Search-ready, paginated dynamic table component
│   ├── pages/              # View pages (rendered via React Router)
│   │   ├── Login.tsx       # Authentication screen (glassmorphism style)
│   │   ├── Dashboard.tsx   # Analytics, statistics, and overdue alerts
│   │   ├── Books.tsx       # Book catalog management (CRUD)
│   │   ├── Readers.tsx     # Reader registration management (CRUD)
│   │   ├── Lending.tsx     # Lending catalog and new transaction form
│   │   └── OverdueList.tsx # List of overdue books with email triggers
│   ├── services/           # API call handlers (Axios abstraction)
│   │   └── api.ts          # Axios base client with JWT auto-injection
│   ├── hooks/              # Custom React hooks
│   │   └── useAuth.ts      # Authentication context wrapper
│   ├── App.tsx             # Main router and page layout wrapper
│   ├── index.css           # Global CSS variables & Tailwind directives
│   └── main.tsx            # Application entrypoint
├── package.json            # Node dependencies and scripts
├── tailwind.config.js      # Custom theme, spacing, and transition details
├── tsconfig.json           # TypeScript configuration
└── README.md               # Quick setup and run instructions
```

---

## 🎨 Design System & Aesthetics
To create a premium look that satisfies coursework criteria:
- **Harmony Color Palette**: Sleek dark slate backgrounds (`bg-slate-900`/`bg-slate-950`) combined with emerald/teal highlights for positive actions and amber/rose for alerts.
- **Glassmorphism**: Login screens and sidebar menus leverage semi-transparent backgrounds with backdrop filters (`backdrop-blur-md bg-white/10`).
- **Micro-Animations**: Custom transitions on hover, focus, and state switches (e.g., loading spinner on buttons, card-pop transitions on load).

---

## 🚀 Phase-Wise Frontend Implementation (Git Commit Plan)

Use the following breakdown to construct your commits and prove a clean, step-by-step development process:

### **Phase 1: Foundation & Project Scaffold**
* **Commit Message**: `feat(frontend): initialize React-TS-Tailwind boilerplate and core layouts`
* **Tasks**:
  - Set up Vite template with React & TypeScript.
  - Install Tailwind CSS and verify configuration.
  - Set up directory folders (`components`, `pages`, `services`, `hooks`).
  - Implement base components: [Button.tsx](file:///e:/Book-Club/Frontend/src/components/Button.tsx), [Input.tsx](file:///e:/Book-Club/Frontend/src/components/Input.tsx).
  - Configure `index.css` with core HSL variables.

### **Phase 2: Authentication Shell**
* **Commit Message**: `feat(frontend): implement Login screen, useAuth hook, and API client interceptor`
* **Tasks**:
  - Create [api.ts](file:///e:/Book-Club/Frontend/src/services/api.ts) setting up a global Axios instance. Add request interceptor to append JWT header from `localStorage`.
  - Create `useAuth` context provider in [useAuth.ts](file:///e:/Book-Club/Frontend/src/hooks/useAuth.ts) to manage JWT verification, token decoding, and redirecting logic.
  - Build a beautiful, responsive [Login.tsx](file:///e:/Book-Club/Frontend/src/pages/Login.tsx) containing loading states and form validations.

### **Phase 3: Dashboard & Layout Shell**
* **Commit Message**: `feat(frontend): create Dashboard analytics page and Sidebar navigation`
* **Tasks**:
  - Build [Sidebar.tsx](file:///e:/Book-Club/Frontend/src/components/Sidebar.tsx) and [Navbar.tsx](file:///e:/Book-Club/Frontend/src/components/Navbar.tsx) with toggle states for responsive mobile views.
  - Create [Dashboard.tsx](file:///e:/Book-Club/Frontend/src/pages/Dashboard.tsx) displaying key metrics: Total Books, Registered Readers, Active Borrows, Overdue items.
  - Display a "Recent Activities" log section inside the dashboard.

### **Phase 4: Reader Management Client**
* **Commit Message**: `feat(frontend): build Reader management CRUD page with search & filter`
* **Tasks**:
  - Build [Readers.tsx](file:///e:/Book-Club/Frontend/src/pages/Readers.tsx) containing table displays, edit triggers, and deletion confirmation dialogs.
  - Design modal-based form for adding/editing readers, integrating input validation (Name, Phone, Email format).
  - Add real-time text filter to search readers by ID or Name.

### **Phase 5: Book Catalog Client**
* **Commit Message**: `feat(frontend): build Book management CRUD page with stock controls`
* **Tasks**:
  - Design [Books.tsx](file:///e:/Book-Club/Frontend/src/pages/Books.tsx) displaying title, ISBN, author, genre, total vs available copies.
  - Create Add/Edit book forms with automated stock checking representation (cannot lend more than available).
  - Build client-side search bar filtering the catalog by Title, Author, or ISBN.

### **Phase 6: Lending, Returns & Overdue Panel**
* **Commit Message**: `feat(frontend): build lending forms and overdue lists with email trigger action`
* **Tasks**:
  - Build [Lending.tsx](file:///e:/Book-Club/Frontend/src/pages/Lending.tsx) featuring:
    - Autocomplete select dropdown for registered readers.
    - Autocomplete select dropdown for in-stock books.
    - Dynamic calculation showing Return Due Date (Default: 14 days).
  - Build [OverdueList.tsx](file:///e:/Book-Club/Frontend/src/pages/OverdueList.tsx) showing overdue borrowers with:
    - Highlighted remaining/overdue days badge.
    - Action button to send direct email alert (Nodemailer-backed).
    - Status changes on successful returns.

### **Phase 7: Final Polish & Audit Logs**
* **Commit Message**: `feat(frontend): style audit trail and finalize responsive design audits`
* **Tasks**:
  - Implement a read-only audit log dashboard for staff tracking system updates (deletions, loans, status changes).
  - Verify complete responsiveness using Chrome DevTools (ensure no layout overflows at 320px width).
