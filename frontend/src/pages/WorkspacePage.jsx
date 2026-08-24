import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { createWorkspace, deleteWorkspace } from "../services/ConfigServices";

function WorkspacePage({ workspaceId, setWorkspaceId }) {

    const { workspaces, workspacesLoaded, refreshWorkspaces, isAdminIn } = useAuth();

    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const navigate = useNavigate();

    function handleContinue() {

        if (!workspaceId) {
            return;
        }

        navigate("/dashboard");

    }

    async function handleCreateWorkspace(event) {
        event.preventDefault();

        if (!newName.trim()) {
            return;
        }

        setError(null);
        setSubmitting(true);

        try {
            const created = await createWorkspace(newName.trim(), "custom");
            await refreshWorkspaces();
            setWorkspaceId(String(created.id));
            setNewName("");
            setCreating(false);
        } catch (err) {
            setError(err.message || "Failed to create workspace");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDeleteWorkspace() {
        const selectedWorkspace = workspaces.find(
            (workspace) => String(workspace.id) === String(workspaceId)
        );

        if (!selectedWorkspace || !isAdminIn(workspaceId)) {
            return;
        }

        const confirmed = window.confirm(
            `Delete "${selectedWorkspace.name}"? This will permanently delete its tasks, members, and configuration.`
        );

        if (!confirmed) {
            return;
        }

        setError(null);
        setSubmitting(true);

        try {
            await deleteWorkspace(workspaceId);

            const remaining = await refreshWorkspaces();

            setWorkspaceId(
                remaining.length > 0
                    ? String(remaining[0].id)
                    : ""
            );

            if (remaining.length === 0) {
                navigate("/");
            }
        } catch (err) {
            setError(err.message || "Failed to delete workspace");
        } finally {
            setSubmitting(false);
        }
    }

    if (!workspacesLoaded) {
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

    if (workspaces.length === 0 && !creating) {
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
                        You're not a member of any workspace yet
                    </h2>

                    <p>
                        Create your own workspace to get started — you'll
                        automatically be its admin. If a teammate already
                        has one set up, ask them to add you by email from
                        their Workspace Settings instead.
                    </p>

                    <button
                        className="workspace-continue"
                        style={{ marginTop: 16 }}
                        onClick={() => setCreating(true)}
                    >
                        <span>Create a workspace</span>
                        <span className="continue-arrow">→</span>
                    </button>

                </div>

            </div>
        );
    }

    if (creating) {
        return (
            <div className="workspace-page">

                <div className="workspace-hero">
                    <div className="workspace-brand">TaskFlow</div>
                    <h1>Name your workspace</h1>
                    <p className="workspace-subtitle">
                        You'll be its admin, with full configuration
                        and task-assignment access.
                    </p>
                </div>

                <div className="workspace-card">

                    <form onSubmit={handleCreateWorkspace}>

                        {error && (
                            <div className="auth-error">{error}</div>
                        )}

                        <div className="auth-field">
                            <label htmlFor="workspace-name">
                                Workspace name
                            </label>
                            <input
                                id="workspace-name"
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="e.g. Marketing Team"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="workspace-continue"
                            disabled={submitting}
                        >
                            <span>
                                {submitting ? "Creating..." : "Create workspace"}
                            </span>
                            <span className="continue-arrow">→</span>
                        </button>

                    </form>

                    {workspaces.length > 0 && (
                        <div className="auth-switch">
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setCreating(false);
                                }}
                            >
                                Back to my workspaces
                            </a>
                        </div>
                    )}

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
                                    {workspace.name} ({workspace.role})
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

                <div className="auth-switch">
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            setCreating(true);
                        }}
                    >
                        + Create a new workspace
                    </a>
                </div>

                {isAdminIn(workspaceId) && (
                    <div
                        style={{
                            marginTop: 24,
                            paddingTop: 20,
                            borderTop: "1px solid #e5e7eb"
                        }}
                    >
                        {error && (
                            <div className="auth-error" style={{ marginBottom: 12 }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="button"
                            className="danger-button"
                            onClick={handleDeleteWorkspace}
                            disabled={submitting}
                        >
                            {submitting ? "Deleting..." : "Delete workspace"}
                        </button>
                    </div>
                )}

            </div>

        </div>
    );
}

export default WorkspacePage;
