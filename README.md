# Task Management System

A configurable full-stack task management application built with **React**, **FastAPI**, and **SQLite**.

The application is designed around a flexible task-management architecture that can support different use cases such as personal task management, business operations, municipal services, education, IT help desks, and project management without requiring a separate application for each use case.

The current version provides task creation, editing, filtering, status management, priorities, categories, groups, due dates, deletion, and a dashboard for viewing task activity.

The long-term goal is to evolve the application into a configurable, multi-workspace task management platform that can be deployed to Azure and support different configurations and users.

---

# Current Features

## Task Management

- Create tasks
- Edit tasks
- Delete tasks
- View task information
- Assign categories
- Assign groups
- Assign priorities
- Assign statuses
- Set optional due dates
- Clear due dates
- Track completion
- Track cancellation

## Task Statuses

Statuses are stored in the database rather than hardcoded into the application.

The current configuration includes:

| ID | Status | Is Completed | Is Cancelled |
|---|---|---:|---:|
| 1 | Open | 0 | 0 |
| 2 | In Progress | 0 | 0 |
| 3 | Completed | 1 | 0 |
| 4 | Cancelled | 0 | 1 |

The `is_completed` and `is_cancelled` fields allow the application to distinguish the meaning of a status without hardcoding specific status names into the task logic.

For example, changing a task to a status where `is_completed = 1` automatically records a completion timestamp.

This design also allows future configurations to define their own workflows.

## Filtering

Tasks can be filtered by:

- Status
- Priority
- Category
- Group

The task list also includes:

- Task count
- Clear filters functionality
- Empty states when no tasks match the current filters

## Dashboard

The dashboard currently provides:

- Total task count
- Open task count
- In-progress task count
- Completed task count
- Recent tasks
- Task status distribution
- Quick access to create tasks
- Quick access to the full task list

## User Interface

The frontend includes:

- Responsive layout
- Sidebar navigation
- Dashboard
- Task grid
- Task cards
- Create Task form
- Edit Task form
- Filtering controls
- Status and priority badges
- Due date display
- Empty states
- Interactive buttons and navigation

---

# Architecture

The application consists of two main parts:

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

The frontend is responsible for the user interface and communicating with the backend API.

The backend handles:

- API routes
- Validation
- Database access
- Task CRUD operations
- Status logic
- Configuration data

The database stores the persistent application data.

---

# Technology Stack

## Frontend

- React
- Vite
- React Router
- JavaScript
- CSS

## Backend

- Python
- FastAPI
- Pydantic
- Uvicorn

## Database

- SQLite
- SQL
- Relational database design
- Primary keys
- Foreign keys
- Lookup/configuration tables

## Development Tools

- Git
- GitHub
- VS Code
- REST APIs
- HTTP/JSON

## Planned Deployment

- Azure
- Azure Static Web Apps or equivalent frontend hosting
- Azure App Service for the FastAPI backend
- PostgreSQL for production database storage

---

# Project Structure

    task-management-system/
    │
    ├── backend/
    │   ├── crud/
    │   │   └── tasks.py
    │   │
    │   ├── routers/
    │   │
    │   ├── schemas/
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
    │   │   │   ├── CreateTask.jsx
    │   │   │   └── ...
    │   │   │
    │   │   ├── pages/
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── Tasks.jsx
    │   │   │   ├── CreateTaskPage.jsx
    │   │   │   └── EditTask.jsx
    │   │   │
    │   │   ├── services/
    │   │   │   ├── TaskServices.js
    │   │   │   └── ConfigServices.js
    │   │   │
    │   │   ├── App.jsx
    │   │   └── ...
    │   │
    │   ├── package.json
    │   └── ...
    │
    └── README.md

---

# Database Design

The application uses a relational database design rather than storing configuration values directly inside task records.

The task table references configuration tables using foreign keys.

Conceptually:

                    ┌──────────────┐
                    │  statuses    │
                    └──────┬───────┘
                           │
                           │
    ┌──────────────┐     ┌─▼─────────┐     ┌──────────────┐
    │ categories   │────▶│   tasks   │◀────│  priorities  │
    └──────────────┘     └────┬──────┘     └──────────────┘
                              │
                              │
                       ┌──────▼───────┐
                       │    groups    │
                       └──────────────┘

This approach provides several advantages.

Instead of storing:

    status = "Completed"

directly inside every task, the task stores:

    status_id = 3

and the status configuration defines what that status means.

This makes the application easier to extend and configure.

---

# Status Logic

Statuses contain metadata describing their behavior.

For example:

    Completed
    is_completed = 1
    is_cancelled = 0

When a task is updated to a completed status, the backend automatically sets:

    completed_at = current timestamp

If a task is changed back to a non-completed status, the completion timestamp can be cleared.

Cancelled tasks are handled separately using:

    is_cancelled = 1

This means the application does not need to assume that a specific string such as `"Completed"` or `"Cancelled"` is the only possible status.

---

# REST API

The React frontend communicates with FastAPI through REST endpoints.

The current application includes task operations such as:

    GET     /tasks
    POST    /tasks
    PATCH   /tasks/{task_id}
    DELETE  /tasks/{task_id}

Configuration endpoints provide data such as:

    GET /statuses
    GET /priorities
    GET /categories
    GET /groups

The frontend uses these endpoints to populate dropdowns and filtering controls.

---

# Frontend Data Flow

A typical task update follows this process:

    User changes task
            |
            v
    React form
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

The frontend communicates with the backend through service functions rather than directly placing API calls throughout individual components.

This keeps API communication separated from the user interface.

Task responses contain related information such as:

- Status name
- Priority name
- Category name
- Group name

rather than requiring the frontend to interpret every foreign key itself.

---

# Configurable Application Architecture

One of the primary goals of this project is to avoid building a separate application for every type of task-management scenario.

Instead, the core task-management system remains the same while its configuration changes.

Potential configurations include:

## Personal Task Management

Example categories:

- Groceries
- Chores
- Health
- Personal

Example groups:

- Personal
- Family
- Home

---

## Business Operations

Example categories:

- Operations
- Customer Support
- Finance
- Administration

Example groups:

- Sales
- Operations
- HR
- Management

Possible statuses:

- New
- Assigned
- In Progress
- Waiting on Customer
- Resolved
- Closed
- Cancelled

---

## Municipal Services

Example categories:

- Infrastructure
- Waste Collection
- Roads
- Permits
- Public Services

Possible statuses:

- Submitted
- Under Review
- Assigned
- In Progress
- Waiting on Resident
- Completed
- Cancelled

---

## Education

Example categories:

- Assignments
- Exams
- Projects
- Research

Example groups:

- University
- Courses
- Personal

---

## IT / Help Desk

Example categories:

- Hardware
- Software
- Network
- Security
- Account Access

Possible statuses:

- Submitted
- Assigned
- Investigating
- Waiting for User
- Resolved
- Closed

---

## Project Management

Example categories:

- Features
- Bugs
- Documentation
- Research
- Maintenance

Possible statuses:

- Backlog
- Planned
- In Progress
- Review
- Completed
- Cancelled

---

## Field Operations

Example categories:

- Inspection
- Maintenance
- Repair
- Installation
- Safety

Possible statuses:

- Assigned
- Scheduled
- In Progress
- Completed
- Cancelled

---

## Sales / CRM

Example categories:

- Leads
- Follow-ups
- Customer Requests
- Deals
- Accounts

Possible statuses:

- New
- Contacted
- Qualified
- Proposal
- Won
- Lost

---

# Workspace Architecture

The long-term architecture will introduce the concept of a **Workspace**.

A workspace represents a particular environment or configuration of the application.

For example:

    User
     |
     ├── Personal
     |
     ├── Business Operations
     |
     └── Software Project

Each workspace can have its own:

- Tasks
- Statuses
- Priorities
- Categories
- Groups
- Configuration
- Terminology
- Colors and icons

This allows the same application to support different workflows without duplicating the application code.

For example:

    Personal Workspace
        |
        ├── Open
        ├── In Progress
        ├── Completed
        └── Cancelled

while another workspace could use:

    Business Operations
        |
        ├── New
        ├── Assigned
        ├── In Progress
        ├── Waiting on Customer
        ├── Resolved
        ├── Closed
        └── Cancelled

The task-management logic remains the same.

Only the configuration changes.

---

# Planned Workspace Configuration

The frontend currently requests configuration data independently:

    GET /statuses
    GET /priorities
    GET /categories
    GET /groups

The planned architecture will introduce workspace-aware configuration such as:

    GET /workspaces
    GET /workspaces/{workspace_id}
    GET /workspaces/{workspace_id}/configuration

The backend could provide a complete configuration object:

    {
      "workspace": "Business Operations",
      "statuses": [],
      "priorities": [],
      "categories": [],
      "groups": []
    }

The frontend can then render the application based on the selected workspace rather than relying on hardcoded configuration.

---

# Multi-User Architecture

A future version will introduce authentication and user accounts.

The intended relationship is:

    User
      |
      v
    Workspaces
      |
      v
    Tasks

This would allow users to belong to one or more workspaces.

For example:

    Romeo
     |
     ├── Personal
     │     └── Personal Tasks
     │
     ├── Business Operations
     │     └── Business Tasks
     │
     └── Software Project
           └── Development Tasks

This will allow the application to move from a single-user local application toward a multi-user hosted system.

---

# Deployment Plan

The application is currently developed locally but is intended to be deployed to Azure.

The planned architecture is:

                        Internet
                           |
                           v
                  React Frontend
                           |
                           | HTTPS / REST API
                           v
                   FastAPI Backend
                           |
                           v
                      PostgreSQL

Potential Azure services:

    React
      |
      └── Azure Static Web Apps

    FastAPI
      |
      └── Azure App Service

    Database
      |
      └── Azure PostgreSQL

SQLite is appropriate for the current development environment and single-user local application.

For a production multi-user deployment, PostgreSQL will provide a more appropriate database architecture.

---

# Development Roadmap

## Phase 1 - Core Application

- [x] FastAPI backend
- [x] SQLite database
- [x] Task CRUD operations
- [x] React frontend
- [x] REST API integration
- [x] Categories
- [x] Groups
- [x] Priorities
- [x] Configurable statuses
- [x] Completed task handling
- [x] Cancelled task handling
- [x] Due dates
- [x] Task filtering
- [x] Task cards
- [x] Create Task page
- [x] Edit Task page
- [x] Dashboard

## Phase 2 - UX Improvements

- [x] Responsive layout
- [x] Empty states
- [x] Task counts
- [x] Clear filters
- [x] Improved task cards
- [x] Improved forms
- [x] Improved date/time selection

Planned:

- [ ] Custom delete confirmation modal
- [ ] Improved completed/cancelled visual states
- [ ] Improved dashboard analytics
- [ ] Overdue task indicators
- [ ] Tasks due today
- [ ] Priority breakdown
- [ ] Completion percentage

## Phase 3 - Configuration

- [ ] Workspace database table
- [ ] Associate tasks with workspaces
- [ ] Associate configuration data with workspaces
- [ ] Workspace-specific statuses
- [ ] Workspace-specific priorities
- [ ] Workspace-specific categories
- [ ] Workspace-specific groups
- [ ] Workspace selector
- [ ] Personal configuration
- [ ] Business Operations configuration
- [ ] Municipal Services configuration

## Phase 4 - Authentication

- [ ] User accounts
- [ ] Authentication
- [ ] User/workspace relationships
- [ ] Workspace permissions
- [ ] Multi-user task management

## Phase 5 - Production Deployment

- [ ] GitHub repository
- [ ] Production environment variables
- [ ] Azure frontend deployment
- [ ] Azure backend deployment
- [ ] PostgreSQL migration
- [ ] Production API configuration
- [ ] HTTPS
- [ ] Production database configuration

---

# Goals of the Project

The project is intended to demonstrate practical full-stack development skills, including:

- REST API design
- Backend development with FastAPI
- Relational database design
- SQL
- Foreign key relationships
- CRUD operations
- Pydantic validation
- React development
- React Router
- Frontend state management
- API integration
- Dynamic configuration
- Application architecture
- Cloud deployment
- Git and GitHub
- Authentication and multi-user systems

The focus is not simply on building a to-do list.

The goal is to build a flexible application architecture that can adapt to different operational workflows while keeping the underlying system reusable.

---

# Running the Project Locally

## Backend

Navigate to the backend directory:

    cd backend

Create a virtual environment:

    python3 -m venv .venv

Activate the virtual environment:

    source .venv/bin/activate

Install dependencies:

    pip install fastapi uvicorn

Start the FastAPI development server:

    uvicorn main:app --reload

The backend will be available at:

    http://127.0.0.1:8000

FastAPI documentation is available at:

    http://127.0.0.1:8000/docs

## Frontend

Open another terminal and navigate to the frontend:

    cd frontend

Install dependencies:

    npm install

Start the Vite development server:

    npm run dev

The frontend will normally be available at:

    http://localhost:5173

---

# Development Notes

The project is being developed incrementally.

The current implementation intentionally prioritizes understanding the underlying architecture over introducing unnecessary frameworks or abstractions.

The application started as a basic task-management system and is being progressively expanded to demonstrate:

1. Database design
2. Backend API development
3. Frontend development
4. API integration
5. Configurable workflows
6. Cloud deployment
7. Multi-user architecture

The architecture will continue to evolve as new requirements are introduced.

---

# Future Vision

The final goal is a reusable task and workflow platform rather than a single-purpose to-do application.

A user or organization should eventually be able to create a workspace and configure it for their specific workflow.

For example:

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
    Configure
           |
           ├── Statuses
           ├── Priorities
           ├── Categories
           └── Groups
           |
           v
    Start Managing Tasks

The underlying application remains the same while the configuration determines how tasks are managed.

This makes the project a foundation for a broader workflow-management platform that could eventually support different organizations, teams, and operational processes through the same core application.