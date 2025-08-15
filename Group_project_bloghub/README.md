# Final project - A personal blogging system - Patrick Starr

This repository contains a starting point for your team's final project. We look forward to seeing your progress and your final results this semester!

Your team should update this README to include the information required, as presented in the project handout available on Canvas.

Your team members are:
Emily Oram, Seul Lee, Qiannan Liu, Zhou Su, Hanxin Zhang

Example User:

Username: helloworld

Password: hello

## Development Environment Setup & Commit Guidelines

It is important each team member has the right development environment setup on their computer.
Please update this with any other processes your group is following.

Extensions to install:

- [VSCode Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [VSCode Svelete](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)
- _Add other optional extensions here :)_

Commands to run before commits:

- In Backend `npm run format` to double check code is formatted
- In Frontend `npm run format` to double check code is formatted

All commits MUST have a brief descriptive message

## Git

> [!IMPORTANT]
> It is always easier to merge files that are either new files, or files that no one else has changed. Create new modules / components to reduce the chance of Git Conflicts! However expect conflicts to occur as part of normal development.

> [!TIP]
> The below assumes you have experience with GIT Pull requests, if not please address this.

All groups MUST use Pull Requests (PR) with at least 1 peer review for merging code into main, this is to improve code quality and to give team members an opportunity to understand your code in case they need to use it.

If team-members don't need to use PR, then they should be working on feature branches and get latest commits in main by merging main into their feature branch (`git merge main`, or `git rebase main`).

> [!TIP]
> Consider a branch naming convention `feature/<some-meaningful-feature-name>`

Correct and **timely** execution of the PR process with evidence of good code review can contribute **significantly** to a better codebase and team member collaboration.

$IMAGE

# BlogHub - Blogging Platform

This is a blogging platform project using SvelteKit frontend and Node.js backend.

## Project Structure

- `frontend/` - SvelteKit frontend application
- `backend/` - Node.js + Express backend API
- `admin-client/` - Java admin client

## Database Connection

The project uses SQLite database, with the database file located at `backend/project-database.db`.

### Database Table Structure

- `Users` - User information
- `Articles` - Article content
- `Comments` - Comments
- `Tags` - Article tags
- `Likes` - Like records
- `Subscriptions` - Subscription relationships
- `Notifications` - Notifications

## Starting the Application

### 1. Start Backend Server

```bash
cd backend
npm install
npm run dev
```

Backend server will start at http://localhost:3000

### 2. Start Frontend Server

```bash
cd frontend
npm install
npm run dev
```

Frontend application will start at http://localhost:5173

## API Endpoints

### Article Related
- `GET /api/articles` - Get all articles
- `GET /api/articles/:id` - Get specific article
- `POST /api/articles` - Create new article
- `PATCH /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article

### User Related
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get specific user
- `POST /api/login` - User login
- `POST /api/register` - User registration

### Comment Related
- `GET /api/comments/articles/:id` - Get article comments
- `POST /api/comments` - Add comment
- `DELETE /api/comments/:id` - Delete comment

### Like Related
- `POST /api/likes` - Like article
- `GET /api/likes/:id/count` - Get like count
- `GET /api/likes/:id/status` - Check like status

## Environment Variables

### Backend (.env)
```
PORT = 3000
DB_FILENAME = project-database.db
DB_INIT_SCRIPT = src/sql/init-db.sql
FRONTEND_ORIGIN = http://localhost:5173
JWT_KEY=GROUP7ISAWESOME%
```

### Frontend (.env)
```
PUBLIC_API_BASE_URL=http://localhost:3000/api
PUBLIC_IMAGES_URL=http://localhost:3000/images
```

## Features

- ✅ User registration and login
- ✅ Article creation, editing, deletion
- ✅ Comment system
- ✅ Like functionality
- ✅ Tag system
- ✅ User subscriptions
- ✅ Notification system
- ✅ Responsive design

## Technology Stack

### Frontend
- SvelteKit
- CSS3
- JavaScript ES6+

### Backend
- Node.js
- Express.js
- SQLite3
- JWT authentication
- bcrypt password encryption

## Database Connection Status

✅ Backend database connected
✅ Frontend API calls configured
✅ Data flow established

Now you can visit http://localhost:5173 to use the complete blogging platform functionality!
