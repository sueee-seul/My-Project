# UoaSwap: University of Auckland Campus Resource Integration Platform

**🌐 Live Demo:** [https://group-project-404-not-found.vercel.app/](https://group-project-404-not-found.vercel.app/)

UoaSwap is a centralized, user-friendly platform designed specifically for University of Auckland (UoA) students. It integrates a second-hand marketplace with an academic resource-sharing ecosystem to enhance information accessibility and resource efficiency within the student community.

Project Overview
----------------

-   **Objective**: To create a trusted environment where students can trade physical goods, share study materials, and access course information in one place.

-   **Core Value**: Unlike general platforms, UoaSwap is tailored to the UoA academic structure, featuring a points-based economy to incentivize high-quality material sharing.

Key Features
------------

### 1\. User Authentication & Profile

-   **Verified Access**: Secure login via Google OAuth restricted to UoA email addresses, ensuring a trusted student-only environment.

-   **Incentivized Onboarding**: New users receive an initial credit of 1,000 points to encourage immediate engagement.

-   **Profile**: A dedicated section for users to manage their personal information, uploaded materials, and marketplace listings.

### 2\. Administrative Capabilities

-   **Role-Based Access Control (RBAC)**: The system distinguishes between students and administrators to maintain platform integrity.

-   **Admin Dashboard**: Authenticated admins can access a web-based management interface to moderate content and resolve disputes.

-   **Content Moderation**: Features and management pages are conditionally displayed based on the user's role, allowing only authorized users to interact with administrative tools.

### 3\. Material Sharing (Points-Based Economy)

-   **Contribution Loop**: Users earn 500 points by uploading PDF/Docx files accompanied by an Academic Integrity Declaration.

-   **Resource Access**: A sustainable "upload-to-download" cycle where users spend points to access peer-shared materials.

-   **Reporting System**: Enables users to flag low-quality or inappropriate materials. Admins can review these reports to edit or remove the flagged posts to ensure content quality.

### 4\. Campus Marketplace (Cash-Based)

-   **Physical Trade**: Facilitates the exchange of campus essentials such as textbooks, labwear, and electronics.

-   **Offline Completion**: Serves as a communication bridge where transactions are finalized offline via integrated contact details such as WeChat or WhatsApp.

### 5\. Course Hub

-   **Standardized Discovery**: Search for specific courses by code (e.g., CS732) or name.

-   **Dedicated Landing Pages**: Aggregates course metadata, specific study materials, and relevant marketplace listings into a single view.

Technology Stack

-   **Frontend**: React, React Router, Vite, TinyMCE.

-   **Backend**: Node.js, Express.

-   **Database**: MongoDB (NoSQL).

-   **Security**: JWT for stateless authentication and bcryptjs for password encryption.

Installation and Setup
----------------------

### Prerequisites

-   Node.js (v18.x or higher)

-   MongoDB instance

### Setup Instructions

1.  Clone the repository

2.  Install dependencies:

    -   **Backend**: `cd backend && npm install`

    -   **Frontend**: `cd frontend && npm install`

3.  Configure environment variables:

    -   **Backend**: Duplicate the `backend/.env.example` file and rename it to `.env`. Fill in your actual MongoDB connection string and JWT secret.

    -   **Frontend**: Duplicate the `frontend/.env.example` file and rename it to `.env`. Update the `VITE_API_BASE_URL` if needed.

4.  Run the application:

    -   **Backend**: `cd backend && npm start`

    -   **Frontend**: `cd frontend && npm run dev`

Testing
-------

The backend includes automated **unit and integration tests** built with Node.js's native `node:test` module (zero external test dependencies).

### Running Tests

**Backend Tests:**
```bash
cd backend
npm test
```

**Frontend Tests:**
```bash
cd frontend
npm test
```

### Test Coverage

| Module | Test Type | What's Tested |
|---|---|---|
| **Authentication** (`auth.test.js`) | Unit + Integration | Registration validation, login validation, cookie structure, UoA email enforcement |
| **Courses** (`course.test.js`) | Unit + Integration | Route structure, query parameters, error responses, 404 handling |
| **Marketplace** (`marketplace.test.js`) | Integration | 404 handling, authentication-protected CRUD operations |
| **Materials** (`material.test.js`) | Integration | 404 handling, unauthenticated upload/download rejection |

Tests use a custom lightweight test server (`tests/setup.js`) that auto-assigns ports and auto-cleans up after each test run.

Deployment
----------

The application is fully deployed and accessible online:

-   **Live Website**: [https://group-project-404-not-found.vercel.app/](https://group-project-404-not-found.vercel.app/)

-   **Frontend**: Hosted on [Vercel](https://vercel.com) (auto-deploys from `main` branch)

-   **Backend**: Hosted on [Render](https://render.com) (auto-deploys from `main` branch)

-   **Database**: MongoDB Atlas (cloud-hosted NoSQL database)

-   **File Storage**: MongoDB GridFS (cloud-based file storage for user uploads)

Test Accounts
-------------

To test the administrative features and role-based access, you may use the following credentials:

-   **Admin Account**: sky@aucklanduni.ac.nz

-   **Password**: sky123

-   **Access Level**: Full access to the /admin page and management tools.

Team & Management
-----------------

This project was developed using an Agile Scrum-based workflow over a 7-week sprint cycle.

-   **Team Members**: Yuning Fan, Wei Wang, Theresa Zhu, Xiting Li, Junxi Chen, Seul Lee.

-   **Project Documentation**: Please refer to our **GitHub Wiki** for meeting minutes, detailed task breakdowns (WBS), and role assignments.
