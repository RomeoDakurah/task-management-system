import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getWorkspaces } from "../services/ConfigServices";

function WorkspacePage({ workspaceId, setWorkspaceId }) {

    const [workspaces, setWorkspaces] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {

        async function loadWorkspaces() {

            try {

                const data = await getWorkspaces();

                setWorkspaces(data);

            } catch (error) {

                setError(error.message);

            } finally {

                setLoading(false);

            }
        }

        loadWorkspaces();

    }, []);

    function handleContinue() {

        if (!workspaceId) {
            return;
        }

        navigate("/dashboard");

    }

    if (loading) {
        return (
            <div className="workspace-page">

                <div className="workspace-card">

                    <div className="workspace-loading">
                        Loading your workspaces...
                    </div>

                </div>

            </div>
        );
    }

    if (error) {
        return (
            <div className="workspace-page">

                <div className="workspace-card">

                    <div className="workspace-icon">
                        !
                    </div>

                    <h1>
                        Unable to load TaskFlow
                    </h1>

                    <p>
                        We couldn't retrieve your workspaces.
                        Please try again later.
                    </p>

                </div>

            </div>
        );
    }

    if (workspaces.length === 0) {
        return (
            <div className="workspace-page">

                <div className="workspace-hero">

                    <div className="workspace-brand">
                        TaskFlow
                    </div>

                    <h1>
                        Welcome to TaskFlow
                    </h1>

                    <p className="workspace-subtitle">
                        Organize your work, keep track of your tasks,
                        and stay on top of what matters.
                    </p>

                </div>

                <div className="workspace-card empty-workspace">

                    <div className="workspace-icon">
                        —
                    </div>

                    <h2>
                        No workspaces available
                    </h2>

                    <p>
                        There are currently no workspaces available
                        for you to access.
                    </p>

                </div>

            </div>
        );
    }

    return (
        <div className="workspace-page">

            <div className="workspace-hero">

                <div className="workspace-brand">
                    TaskFlow
                </div>

                <h1>
                    Welcome to TaskFlow
                </h1>

                <p className="workspace-subtitle">
                    Organize your work, manage your tasks,
                    and keep everything in one place.
                </p>

            </div>


            <div className="workspace-card">

                <div className="workspace-card-icon">
                    <span>⌂</span>
                </div>

                <div className="workspace-card-header">

                    <h2>
                        Choose a workspace
                    </h2>

                    <p>
                        Select where you want to work today.
                    </p>

                </div>

                <div className="workspace-select-container">

                    <label htmlFor="workspace-select">
                        Your workspace
                    </label>

                    <div className="workspace-select-wrapper">

                        <select
                            id="workspace-select"
                            value={workspaceId}
                            onChange={(event) =>
                                setWorkspaceId(event.target.value)
                            }
                        >
                            <option value="">
                                Select a workspace
                            </option>

                            {workspaces.map((workspace) => (
                                <option
                                    key={workspace.id}
                                    value={workspace.id}
                                >
                                    {workspace.name}
                                </option>
                            ))}
                        </select>

                    </div>

                </div>

                <button
                    className="workspace-continue"
                    onClick={handleContinue}
                    disabled={!workspaceId}
                >
                    <span>Continue</span>
                    <span className="continue-arrow">→</span>
                </button>

            </div>


            <div className="workspace-overview">

                <div className="overview-header">

                    <h2>
                        Everything you need to stay organized
                    </h2>

                    <p>
                        TaskFlow keeps your work structured and easy
                        to manage.
                    </p>

                </div>


                <div className="overview-grid">

                    <div className="overview-item">

                        <div className="overview-icon">
                            ✓
                        </div>

                        <h3>
                            Manage tasks
                        </h3>

                        <p>
                            Create, edit, organize, and track
                            tasks from one place.
                        </p>

                    </div>


                    <div className="overview-item">

                        <div className="overview-icon">
                            ≡
                        </div>

                        <h3>
                            Stay organized
                        </h3>

                        <p>
                            Use categories, groups, priorities,
                            and statuses to keep your work structured.
                        </p>

                    </div>


                    <div className="overview-item">

                        <div className="overview-icon">
                            ◷
                        </div>

                        <h3>
                            Track progress
                        </h3>

                        <p>
                            See what's open, in progress, completed,
                            or still waiting for attention.
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default WorkspacePage;