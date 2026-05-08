# Team Task Manager

A full-stack collaborative project management application that helps teams organize, track, and manage their tasks efficiently. Built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- **User Authentication**: Secure signup and login with JWT-based authentication
- **Project Management**: Create, view, and manage multiple projects
- **Task Tracking**: Create tasks with priorities, statuses, and due dates
- **Team Collaboration**: Add team members to projects and assign tasks
- **Dashboard**: Visual overview of project statistics and task status
- **Role-Based Access**: Admin and member roles for project management
- **Responsive Design**: Modern UI built with Tailwind CSS

## Tech Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

## Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/team-task-manager.git
cd team-task-manager
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Configure your `.env` file:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

```bash
# Start the backend server
npm run dev
```

The backend server will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend application will run on `http://localhost:5173`

## Usage

1. **Sign Up**: Create a new account on the signup page
2. **Login**: Access your account with your credentials
3. **Create Project**: Start by creating a new project
4. **Add Members**: Invite team members to collaborate on your project
5. **Create Tasks**: Add tasks with titles, descriptions, priorities, and due dates
6. **Assign Tasks**: Assign tasks to team members
7. **Track Progress**: Monitor task status (Todo, In Progress, Done)
8. **View Dashboard**: Check project statistics and overall progress

## Project Structure

```
team-task-manager/
├── backend/
│   ├── config/          # Database configuration
│   ├── middleware/      # Authentication middleware
│   ├── models/          # Mongoose models
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   └── dashboard.js
│   ├── server.js        # Entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── context/     # React context (Auth)
    │   ├── pages/       # Page components
    │   ├── services/    # API service
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    └── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user

### Projects
- `GET /api/projects` - Get all user projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add member to project

### Tasks
- `GET /api/tasks/project/:projectId` - Get all tasks for a project
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Dashboard
- `GET /api/dashboard/:projectId` - Get project statistics

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/team-task-manager
JWT_SECRET=your_secret_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (Optional)
```env
VITE_API_URL=http://localhost:5000/api
```

## Deployment

### Backend Deployment (Railway/Render/Heroku)
1. Push your code to GitHub
2. Connect your repository to your hosting platform
3. Set environment variables in the platform dashboard
4. Deploy the backend

### Frontend Deployment (Vercel/Netlify)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to your hosting platform
3. Configure the API base URL for production environment
