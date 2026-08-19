import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import { useEffect, useState } from "react";

import AppLayout from "./components/AppLayout";

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

                {/* Workspace selection */}

                <Route
                    path="/"
                    element={
                        <WorkspacePage
                            workspaceId={workspaceId}
                            setWorkspaceId={setWorkspaceId}
                        />
                    }
                />



                {/* Main application */}

                <Route element={<AppLayout />}>

                    <Route
                        path="/settings"
                        element={
                            <WorkspaceSettings
                                workspaceId={workspaceId}
                                setWorkspaceId={setWorkspaceId}
                            />
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
                            <CreateTaskPage
                                workspaceId={workspaceId}
                            />
                        }
                    />

                    <Route
                        path="/tasks/:taskId/edit"
                        element={
                            <EditTask
                                workspaceId={workspaceId}
                            />
                        }
                    />

                </Route>

            </Routes>

        </BrowserRouter>
    );
}

export default App;