import { NavLink, Outlet } from "react-router-dom";

function AppLayout() {

    return (
        <div className="app">

        <aside className="sidebar">

        <div className="logo">
            TaskFlow
        </div>

        <div className="sidebar-content">

            <div className="nav-section">

                <div className="nav-label">
                    Workspace
                </div>

                <NavLink
                    to="/dashboard"
                    className="nav-link"
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/tasks"
                    className="nav-link"
                >
                    Tasks
                </NavLink>

            </div>

            <NavLink
                to="/tasks/create"
                className="create-task-link"
            >
                + Create Task
            </NavLink>

        </div>

        <div className="sidebar-bottom">

            <NavLink
                to="/settings"
                className="nav-link"
            >
                Settings
            </NavLink>

        </div>

        </aside>

            <main className="main">
                <Outlet />
            </main>

        </div>
    );
}

export default AppLayout;