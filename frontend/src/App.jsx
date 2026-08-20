import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import { useEffect, useState } from "react";

import AppLayout from "./components/AppLayout";
import RequireAuth from "./components/RequireAuth";
import RequireWorkspaceAdmin from "./components/RequireWorkspaceAdmin";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import WorkspacePage from "./pages/WorkspacePage";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import CreateTaskPage from "./pages/CreateTaskPage";
import EditTask from "./pages/EditTask";
import WorkspaceSettings from "./pages/WorkspaceSettings";

function App() {

    const [workspaceId, setWorkspaceId] = useState(
        () => localStorage.getItem("workspaceId") || ""
    );

    useEffect(() => {

        if (workspaceId) {
            localStorage.setItem("workspaceId", workspaceId);
        }

    }, [workspaceId]);

    return (
        <BrowserRouter>

            <Routes>

                {/* Auth */}

                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Workspace selection */}

                <Route
                    path="/"
                    element={
                        <RequireAuth>
                            <WorkspacePage
                                workspaceId={workspaceId}
                                setWorkspaceId={setWorkspaceId}
                            />
                        </RequireAuth>
                    }
                />



                {/* Main application */}

                <Route
                    element={
                        <RequireAuth>
                            <AppLayout workspaceId={workspaceId} />
                        </RequireAuth>
                    }
                >

                    <Route
                        path="/settings"
                        element={
                            <RequireWorkspaceAdmin workspaceId={workspaceId}>
                                <WorkspaceSettings
                                    workspaceId={workspaceId}
                                    setWorkspaceId={setWorkspaceId}
                                />
                            </RequireWorkspaceAdmin>
                        }
                    />

                    <Route
                        path="/dashboard"
                        element={
                            <Dashboard
                                workspaceId={workspaceId}
                                setWorkspaceId={setWorkspaceId}
                            />
                        }
                    />

                    <Route
                        path="/tasks"
                        element={
                            <Tasks
                                workspaceId={workspaceId}
                                setWorkspaceId={setWorkspaceId}
                            />
                        }
                    />

                    <Route
                        path="/tasks/create"
                        element={
                            <RequireWorkspaceAdmin workspaceId={workspaceId}>
                                <CreateTaskPage
                                    workspaceId={workspaceId}
                                />
                            </RequireWorkspaceAdmin>
                        }
                    />

                    <Route
                        path="/tasks/:taskId/edit"
                        element={
                            <RequireWorkspaceAdmin workspaceId={workspaceId}>
                                <EditTask
                                    workspaceId={workspaceId}
                                />
                            </RequireWorkspaceAdmin>
                        }
                    />

                </Route>

            </Routes>

        </BrowserRouter>
    );
}

export default App;
