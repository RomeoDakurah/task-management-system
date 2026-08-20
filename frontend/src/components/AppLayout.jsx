import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function AppLayout({ workspaceId }) {

    const { user, isAdminIn, logout } = useAuth();
    const navigate = useNavigate();

    const admin = isAdminIn(workspaceId);

    function handleLogout() {
        logout();
        navigate("/login", { replace: true });
    }

    return (
        <div className="app">

        <aside className="sidebar">

        <div className="logo">
            TaskFlow
        </div>

        {user && (
            <div className="sidebar-user">
                <span className="sidebar-user-name">
                    {user.name}
                    {admin && (
                        <span
                            className="role-badge role-badge-admin"
                            style={{ marginLeft: 8 }}
                        >
                            Admin
                        </span>
                    )}
                </span>

                <button
                    className="sidebar-logout"
                    onClick={handleLogout}
                >
                    Log out
                </button>
            </div>
        )}

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

            {admin && (
                <NavLink
                    to="/tasks/create"
                    className="create-task-link"
                >
                    + Create Task
                </NavLink>
            )}

        </div>

        {admin && (
            <div className="sidebar-bottom">

                <NavLink
                    to="/settings"
                    className="nav-link"
                >
                    Settings
                </NavLink>

            </div>
        )}

        </aside>

            <main className="main">
                <Outlet />
            </main>

        </div>
    );
}

export default AppLayout;
