# 🎓 ExamVault

## Centralized Institutional Previous Year Question Paper Repository

**ExamVault** is a secure, responsive, and role-based MERN stack web application designed to solve a common problem faced by college students during examination time — finding Previous Year Question Papers (PYQs).

Students can upload question papers, faculty members can verify them, and approved papers become available to students through a centralized repository.

---

## 📌 Problem Statement

During examination time, students often struggle to find Previous Year Question Papers.

Question papers are usually scattered across:

- WhatsApp groups
- Telegram groups
- Seniors
- Google Drive links
- Personal folders
- Different student communities

This makes it difficult to find the correct paper quickly.

**ExamVault** provides a centralized platform where students can search, preview, download, and contribute Previous Year Question Papers while maintaining authenticity through faculty verification.

---

# ✨ Key Features

### 👨‍🎓 Student

- Secure registration using institutional email
- JWT-based authentication
- Browse approved question papers
- 7-level cascading search/filter system
- PDF preview
- PDF download
- Upload new question papers
- Track uploaded paper status
- Receive notifications
- Bookmark papers
- Responsive mobile-friendly interface

### 👨‍🏫 Faculty

- Secure faculty login
- Subject-based paper verification
- View pending question papers
- Preview uploaded PDF
- Download paper
- Approve paper
- Reject paper with feedback
- Receive new paper notifications
- View previously verified papers

### 👨‍💼 Admin

- Admin dashboard
- View registered users
- Manage students and faculty
- Create departments
- Create subjects
- Assign faculty to subjects
- Multiple faculty can be assigned to one subject
- Manage uploaded papers
- View system statistics
- Override paper moderation status

---

# 🔍 Paper Search System

ExamVault uses a cascading dropdown-based search system instead of relying only on text search.

### Search Flow

```text
Department
     ↓
Semester
     ↓
Section
     ↓
Subject
     ↓
Academic Year
     ↓
Paper Year
     ↓
Exam Type
```

The available subjects are dynamically filtered according to the selected department and semester.

Exam Types

The system currently supports:

CAE-I
CAE-II
ESE
Example
Department: CSE

Semester: 5

Section: A

Subject: DBMS

Academic Year: 2024-25

Paper Year: 2024

Exam Type: ESE
🔐 Authentication & Authorization

ExamVault uses JWT-based authentication with role-based authorization.

Only institutional email addresses are allowed.

Example:

student.cse23@sbjit.edu.in

Personal email addresses such as Gmail, Yahoo, etc. are not accepted.

Roles
Student
   ↓
Faculty
   ↓
Admin

Each role has different permissions and protected routes.

```
###
## 👨‍💻 Developer
Pratik D. Kothare

# Final Year CSE Student
S. B. Jain Institute of Technology, Management & Research, Nagpur

## Full Stack Developer | MERN | AI Enthusiast

### ❤️ Built With Purpose

ExamVault was created to solve a real problem experienced by students during examination time.

Making previous year question papers easier to find, verify, and access.

# Made with ❤️ by Pratik D. Kothare

##📬 Feedback & Contribution

If you have suggestions, feature ideas, or improvements, feel free to contribute to this project.

Your feedback can help make ExamVault better for students and faculty.

⭐ If you find this project useful, consider giving the repository a star!