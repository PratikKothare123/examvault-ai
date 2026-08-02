# ExamVault - Centralized Institutional Previous Year Question Paper Repository

**ExamVault** is a secure, high-performance, and mobile-responsive MERN stack web application built for managing and retrieving Previous Year Question Papers (PYQs) for academic institutions.

---

## 🔑 Pre-Seeded Browser Login Credentials

You can test the application in the browser immediately using these pre-seeded institutional accounts:

| User Role | Institutional Email ID | Password | Access Rights & Responsibilities |
| :--- | :--- | :--- | :--- |
| **Student** | `student.cse23@sbjit.edu.in` | `StudentPassword123!` | Search sessional/ESE papers via 7-level cascading filters, preview PDF documents inline, download original files, and submit new PDF question papers for moderation. |
| **Faculty** | `faculty.cse@sbjit.edu.in` | `FacultyPassword123!` | Moderates question papers linked to assigned subjects (`CS601`, `CS602`). Approve submissions or Reject with mandatory feedback. |
| **Admin** | `admin.cse@sbjit.edu.in` | `AdminPassword123!` | Accesses Admin Dashboard console, views real-time system metrics, modifies user roles, and overrides paper moderation states. |

---

## 🚀 Key Architectural Features

- **7-Level Cascading Search**: Fast non-text dynamic dropdown search (Department $\rightarrow$ Semester $\rightarrow$ Section $\rightarrow$ Subject $\rightarrow$ Academic Year $\rightarrow$ Exam Year $\rightarrow$ Exam Type).
- **Inline Glassmorphic PDF Previewer**: Modal PDF viewer allowing instant streaming of question papers without triggering page reloads.
- **Faculty Moderation Inbox**: Automatic subject-isolated routing enforcing that faculty members can only review papers belonging to their active subject assignments.
- **Security & Validation Controls**:
  - **Institutional Domain Regex**: Enforces `@sbjit.edu.in` emails during registration.
  - **Magic Bytes Inspection**: Validates binary `%PDF-` signature to block disguised binary uploads.
  - **NoSQL & XSS Sanitizer**: Strips NoSQL injection operators (`$`, `.`) and script tags from payloads.
  - **Granular Rate Limiters**: Auth (5 req/15min), Upload (10 req/hr), General API (100 req/15min).
- **Structured Logging & Diagnostics**: Streams HTTP logs via Morgan into Winston (`logs/error.log` & `logs/combined.log`).

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js, MongoDB (Mongoose ORM), JWT Authentication, Multer, Cloudinary API, Winston, Morgan, Helmet.
- **Frontend**: React (Vite engine), Vanilla CSS design tokens, Lucide React Icons.

---

## 📦 Setup & Installation

### 1. Backend Setup
```bash
cd Backend
npm install
node scripts/seedDatabase.js
npm run dev
```

### 2. Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```

---
