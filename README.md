# Task Management System

A configurable full-stack task management application built with **React**, **FastAPI**, and **SQLite**.

The application is designed around a flexible task-management architecture that can support different workflows such as personal task management, business operations, municipal services, education, IT help desks, and project management without requiring a separate application for each use case.

The system is being developed incrementally, with an emphasis on understanding and implementing the underlying architecture rather than relying on hardcoded workflows.

---
# Screenshots

## Dashboard

![TaskFlow Dashboard](https://github.com/RomeoDakurah/task-management-system/blob/main/screenshots/Dashboard.png)

## Task Management

![Task Management](https://github.com/RomeoDakurah/task-management-system/blob/main/screenshots/Tasks.png#:~:text=Tasks.-,png,-Workspace%2DSettings%2D2)

## Workspace Settings

![Workspace Settings](https://github.com/RomeoDakurah/task-management-system/blob/main/screenshots/Workspace-Settings.png#:~:text=Workspace%2DSettings.-,png,-.gitignore)
![](https://github.com/RomeoDakurah/task-management-system/blob/main/README.md#:~:text=Workspace%2DSettings%2D2.-,png,-Workspace%2DSettings.png)

---
# Current Features

## Task Management

* Create tasks
* Edit tasks
* Delete tasks
* View task information
* Assign categories
* Assign groups
* Assign priorities
* Assign statuses
* Set optional due dates
* Clear due dates
* Track completion
* Track cancellation
* Automatically record completion timestamps

## Task Assignment & User Workflow

Tasks can be assigned to workspace members.

* Admins can assign, reassign, edit, complete, cancel, and delete tasks.
* Regular users only see tasks assigned to them.
* An assigned user can accept or decline a task.
* Accepted tasks can then be completed by the assigned user.
* Declining a task removes the assignment and returns it to the workspace's unassigned task pool.
* Task acceptance is tracked separately from task status using `accepted_at`.

The frontend provides separate user views for all assigned tasks, tasks awaiting acceptance, and accepted tasks.

# Workspaces

The application now supports multiple workspaces.

Each workspace maintains its own configuration and tasks.

Examples include:

* Personal
* Business Operations
* Municipal Services

The selected workspace determines which configuration options are available throughout the application.

Workspace-specific configuration includes:

* Statuses
* Priorities
* Categories
* Groups

This allows the same task-management system to support different workflows without hardcoding configuration into the frontend or backend.

---

# Workspace Configuration

Workspace configuration can be managed through the **Workspace Settings** interface.

Users can create, edit, and delete:

* Statuses
* Priorities
* Categories
* Groups

Configuration is associated with the selected workspace.

For example, a Personal workspace might use:

```text
Statuses
- Open
- In Progress
- Completed
- Cancelled

Priorities
- Low
- Medium
- High
- Urgent

Categories
- Groceries
- Chores
- Projects
- Personal
```

while a Municipal Services workspace could use an entirely different workflow.

The application does not require these names to be hardcoded into task logic.

---

# Task Statuses

Statuses are stored in the database rather than being hardcoded into the application.

Each status contains metadata describing its behavior:

```text
is_completed
is_cancelled
```

For example:

```text
Completed
is_completed = 1
is_cancelled = 0
```

and:

```text
Cancelled
is_completed = 0
is_cancelled = 1
```

The frontend dynamically identifies which status represents completion and cancellation for the current workspace.

This means the application does not depend on a hardcoded status ID such as:

```text
status_id = 3
```

or a hardcoded status name such as:

```text
"Completed"
```

Instead, the workspace configuration determines the behavior.

When a task is moved to a status marked `is_completed`, the backend automatically records a completion timestamp.

When a task moves away from a completed status, the completion timestamp can be cleared.

The frontend also uses the configured status metadata to:

* Display the Complete button
* Display the Cancel button
* Hide those buttons when appropriate
* Apply completed/cancelled visual states
* Apply task strikethrough styling

---

# Task Filtering

Tasks can be filtered by workspace-specific configuration.

Available filters include:

* Status
* Priority
* Category
* Group

The filtering interface dynamically loads configuration for the currently selected workspace.

The task list also provides:

* Task count
* Clear filters
* Empty states
* Workspace-specific filtering

---

# Dashboard

The dashboard currently provides:

* Total task count
* Open task count
* In-progress task count
* Completed task count
* Recent tasks
* Task status information
* Quick access to create tasks
* Quick access to the full task list

Dashboard functionality is being developed alongside the underlying workspace architecture.

---

# User Interface

The frontend includes:

* Responsive layout
* Sidebar navigation
* Dashboard
* Workspace selector
* Task grid
* Task cards
* Create Task form
* Edit Task form
* Workspace Settings
* Filtering controls
* Status badges
* Priority badges
* Due date display
* Empty states
* Interactive task actions

Task actions such as Complete and Cancel are dynamically based on the configuration of the selected workspace.

---

# Architecture

The application consists of two main parts:

```text
Frontend
React + Vite
      |
      | REST API
      v
Backend
FastAPI
      |
      v
SQLite Database
```

The frontend is responsible for:

* User interface
* Application state
* Workspace selection
* Configuration management UI
* Task interaction
* API communication

The backend handles:

* API routes
* Request validation
* Database access
* Task CRUD operations
* Status behavior
* Workspace-specific configuration
* Database relationships

The database stores the persistent application data.

---

# Technology Stack

## Frontend

* React
* Vite
* React Router
* JavaScript
* CSS

## Backend

* Python
* FastAPI
* Pydantic
* Uvicorn

## Database

* SQLite
* SQL
* Relational database design
* Primary keys
* Foreign keys
* Lookup/configuration tables

## Development Tools

* Git
* GitHub
* VS Code
* REST APIs
* HTTP/JSON

## Planned Production Stack

* Azure
* Azure Static Web Apps or equivalent frontend hosting
* Azure App Service for the FastAPI backend
* PostgreSQL for production database storage

---

# Project Structure

```text
task-management-system/
│
├── backend/
│   ├── crud/
│   │   ├── tasks.py
│   │   └── ...
│   │
│   ├── routers/
│   │   ├── tasks.py
│   │   └── ...
│   │
│   ├── schemas/
│   │   └── ...
│   │
│   ├── database.py
│   ├── main.py
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskFilters.jsx
│   │   │   ├── WorkspaceSelector.jsx
│   │   │   └── ...
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Tasks.jsx
│   │   │   ├── WorkspaceSettings.jsx
│   │   │   ├── CreateTaskPage.jsx
│   │   │   ├── EditTask.jsx
│   │   │   └── ...
│   │   │
│   │   ├── services/
│   │   │   ├── TaskServices.jsx
│   │   │   ├── ConfigServices.jsx
│   │   │   └── ...
│   │   │
│   │   ├── App.jsx
│   │   └── ...
│   │
│   ├── package.json
│   └── ...
│
└── README.md
```

---

# Database Design

The application uses a relational database design rather than storing configuration values directly inside task records.

Tasks reference configuration tables using foreign keys.

Conceptually:

```text
                       ┌──────────────┐
                       │  workspaces  │
                       └──────┬───────┘
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             v                v                v
       ┌──────────┐     ┌──────────┐     ┌──────────┐
       │ statuses │     │priorities│     │categories│
       └────┬─────┘     └────┬─────┘     └────┬─────┘
            │                │                │
            └────────────────┼────────────────┘
                             │
                       ┌─────▼──────┐
                       │   tasks    │
                       └─────┬──────┘
                             │
                       ┌─────▼──────┐
                       │   groups   │
                       └────────────┘
```

The workspace provides the boundary for configuration and task data.

Instead of storing:

```text
status = "Completed"
```

directly inside a task, the task stores a status reference:

```text
status_id = 20
```

The status record then defines:

```text
name = "Completed"
is_completed = 1
is_cancelled = 0
```

This allows the same task-management logic to operate across different workflows.

---

# Workspace Architecture

A workspace represents a particular environment or workflow configuration.

For example:

```text
Personal
Business Operations
Municipal Services
```

Each workspace can have its own:

```text
Tasks
Statuses
Priorities
Categories
Groups
```

The frontend uses the selected workspace to retrieve the appropriate configuration.

For example:

```text
Personal Workspace
    |
    ├── Open
    ├── In Progress
    ├── Completed
    └── Cancelled
```

Another workspace can use:

```text
Municipal Services
    |
    ├── Submitted
    ├── Under Review
    ├── Assigned
    ├── In Progress
    ├── Resolved
    └── Cancelled
```

The underlying task-management code remains the same.

Only the workspace configuration changes.

---

# REST API

The React frontend communicates with FastAPI through REST endpoints.

Task operations include:

```text
GET     /tasks
POST    /tasks
PATCH   /tasks/{task_id}
DELETE  /tasks/{task_id}
```

Workspace-specific configuration is accessed through workspace-aware endpoints such as:

```text
/workspaces/{workspace_id}/...
```

Configuration operations include retrieving, creating, updating, and deleting:

```text
Statuses
Priorities
Categories
Groups
```

The frontend uses these APIs to dynamically populate:

* Task forms
* Edit forms
* Filters
* Task cards
* Workspace Settings

---

# Frontend Data Flow

A typical task update follows this process:

```text
User changes task
        |
        v
React component
        |
        v
TaskServices
        |
        | PATCH /tasks/{id}
        v
FastAPI
        |
        v
Task CRUD logic
        |
        v
SQLite
        |
        v
Updated task
        |
        v
React refreshes task list
```

The frontend communicates with the backend through service functions rather than placing API calls throughout individual components.

This separates API communication from the user interface.

Task responses include both configuration IDs and human-readable configuration values where required by the frontend.

For example:

```text
status_id
status

priority_id
priority

category_id
category

group_id
group
```

This allows the frontend to both display configuration names and use their IDs when performing updates and filtering.

---

# Configurable Use Cases

The application is designed to support multiple workflows through workspace configuration.

## Personal Task Management

Example categories:

* Groceries
* Chores
* Projects
* Personal

Example groups:

* Personal
* Home
* Family

Possible statuses:

* Open
* In Progress
* Completed
* Cancelled

---

## Business Operations

Example categories:

* Operations
* Customers
* Finance
* Maintenance
* Projects

Possible statuses:

* New
* In Progress
* Blocked
* Completed
* Cancelled

---

## Municipal Services

Example categories:

* Infrastructure
* Roads
* Waste
* Parks
* Public Services

Possible statuses:

* Submitted
* Under Review
* Assigned
* In Progress
* Resolved
* Cancelled

---

## Education

Example categories:

* Assignments
* Exams
* Projects
* Research

Possible groups:

* University
* Courses
* Personal

---

## IT / Help Desk

Example categories:

* Hardware
* Software
* Network
* Security
* Account Access

Possible statuses:

* Submitted
* Assigned
* Investigating
* Waiting for User
* Resolved
* Closed

---

## Project Management

Example categories:

* Features
* Bugs
* Documentation
* Research
* Maintenance

Possible statuses:

* Backlog
* Planned
* In Progress
* Review
* Completed
* Cancelled

---

## Field Operations

Example categories:

* Inspection
* Maintenance
* Repair
* Installation
* Safety

Possible statuses:

* Assigned
* Scheduled
* In Progress
* Completed
* Cancelled

---

## Sales / CRM

Example categories:

* Leads
* Follow-ups
* Customer Requests
* Deals
* Accounts

Possible statuses:

* New
* Contacted
* Qualified
* Proposal
* Won
* Lost

These are examples of potential configurations rather than hardcoded application behavior.

---

# Development Roadmap

## Phase 1 - Core Application

* [x] FastAPI backend
* [x] SQLite database
* [x] Task CRUD operations
* [x] React frontend
* [x] REST API integration
* [x] Categories
* [x] Groups
* [x] Priorities
* [x] Statuses
* [x] Configurable completed/cancelled status behavior
* [x] Completed task handling
* [x] Cancelled task handling
* [x] Completion timestamps
* [x] Due dates
* [x] Task filtering
* [x] Task cards
* [x] Create Task page
* [x] Edit Task page
* [x] Dashboard

## Phase 2 - Workspace Architecture

* [x] Workspace database table
* [x] Workspace selector
* [x] Associate tasks with workspaces
* [x] Associate configuration data with workspaces
* [x] Workspace-specific statuses
* [x] Workspace-specific priorities
* [x] Workspace-specific categories
* [x] Workspace-specific groups
* [x] Workspace Settings
* [x] Add workspace statuses
* [x] Edit workspace statuses
* [x] Configure completed status
* [x] Configure cancelled status
* [x] Add/edit workspace priorities
* [x] Add/edit workspace categories
* [x] Add/edit workspace groups
* [x] Workspace-specific task filtering
* [x] Workspace-specific task status actions

## Phase 3 - UX Improvements

* [x] Responsive layout
* [x] Empty states
* [x] Task counts
* [x] Clear filters
* [x] Improved task cards
* [x] Improved forms
* [x] Improved date/time selection
* [x] Configuration management UI

Planned:

* [ ] Custom delete confirmation modal
* [ ] Configuration deletion constraints
* [ ] Prevent multiple completed statuses per workspace
* [ ] Prevent multiple cancelled statuses per workspace
* [ ] Improved dashboard analytics
* [ ] Overdue task indicators
* [ ] Tasks due today
* [ ] Priority breakdown
* [ ] Completion percentage

## Phase 4 - Authentication

* [ ] User accounts
* [ ] Authentication
* [ ] User/workspace relationships
* [ ] Workspace permissions
* [ ] Multi-user task management

## Phase 5 - Production Deployment

* [ ] Production environment variables
* [ ] Azure frontend deployment
* [ ] Azure backend deployment
* [ ] PostgreSQL migration
* [ ] Production API configuration
* [ ] HTTPS
* [ ] Production database configuration

---

# Running the Project Locally

## Backend

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python3 -m venv .venv
```

Activate the virtual environment:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Set up the database — this creates `database.db` from scratch and
fills it with demo data (4 workspaces, a roster of users, and a
realistic mix of tasks). It's the only setup script you need, and it's
safe to re-run any time (e.g. after `database.db` is deleted, or isn't
included when you zip/export the project) — it always rebuilds the
same demo state from nothing:

```bash
python seed.py
```

All seeded accounts share the password `Password123!` — the script
prints the full list of emails/roles when it finishes. These are demo
accounts only; remove or replace them before this is ever public.

Start the FastAPI development server:

```bash
uvicorn main:app --reload
```

The backend will be available at:

```text
http://127.0.0.1:8000
```

FastAPI documentation is available at:

```text
http://127.0.0.1:8000/docs
```

## Frontend

Open another terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

# Development Approach

The project is being developed incrementally.

Rather than beginning with a large framework or attempting to implement the entire platform at once, the application is being expanded through progressively more complex requirements.

The development progression has been:

```text
Basic Task Management
        |
        v
REST API
        |
        v
Relational Database
        |
        v
Configuration Tables
        |
        v
Dynamic Status Behavior
        |
        v
Workspace Architecture
        |
        v
Workspace-Specific Configuration
        |
        v
Multi-Workspace Task Management
        |
        v
Authentication
        |
        v
Cloud Deployment
```

This approach provides practical experience with both individual technologies and the architectural decisions required to connect them into a complete application.

---

# Goals of the Project

The project is intended to demonstrate practical full-stack development skills, including:

* REST API design
* Backend development with FastAPI
* Relational database design
* SQL
* Foreign key relationships
* CRUD operations
* Pydantic validation
* React development
* React Router
* Frontend state management
* API integration
* Dynamic configuration
* Workspace architecture
* Application architecture
* Cloud deployment
* Git and GitHub
* Authentication
* Multi-user systems

The focus is not simply on building a basic to-do list.

The goal is to build a flexible application architecture that can adapt to different operational workflows while keeping the underlying system reusable.

---

# Future Vision

The long-term goal is to evolve the application into a reusable task and workflow-management platform.

A user or organization should eventually be able to create a workspace and configure it for a specific workflow.

For example:

```text
Create Workspace
       |
       v
Choose Configuration
       |
       ├── Personal
       ├── Business
       ├── Municipal
       ├── Education
       ├── IT Help Desk
       └── Custom
       |
       v
Configure Workspace
       |
       ├── Statuses
       ├── Priorities
       ├── Categories
       └── Groups
       |
       v
Manage Tasks
```

The underlying application remains the same while the configuration determines how tasks are managed.

The eventual goal is to support different users, teams, and organizations through the same core platform while maintaining a clean separation between application logic and workflow configuration.
