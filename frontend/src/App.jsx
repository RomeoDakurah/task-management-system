import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import Tasks from "./pages/Tasks";
import CreateTaskPage from "./pages/CreateTaskPage";
import EditTask from "./pages/EditTask";
import Dashboard from "./pages/Dashboard";

function App() {
    return (
        <BrowserRouter>
            <div className="app">

                <aside className="sidebar">

                    <div className="logo">
                        TaskFlow
                    </div>

                    <div className="nav-section">
                        <div className="nav-label">
                            Workspace
                        </div>

                        <NavLink
                            to="/"
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

                        <NavLink
                            to="/tasks/create"
                            className="nav-link"
                        >
                            + Create Task
                        </NavLink>
                    </div>

                </aside>

                <main className="main">
                    <Routes>

                        <Route
                            path="/"
                            element={<Dashboard />}
                        />

                        <Route
                            path="/"
                            element={<Navigate to="/tasks" />}
                        />

                        <Route
                            path="/tasks"
                            element={<Tasks />}
                        />

                        <Route
                            path="/tasks/create"
                            element={<CreateTaskPage />}
                        />

                        <Route
                            path="/tasks/:taskId/edit"
                            element={<EditTask />}
                        />

                    </Routes>
                </main>

            </div>
        </BrowserRouter>
    );
}

export default App;