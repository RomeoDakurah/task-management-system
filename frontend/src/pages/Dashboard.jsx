import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTasks } from "../services/TaskServices";
import { getStatuses } from "../services/ConfigServices";
import WorkspaceSelector from "../components/WorkspaceSelector";
import { useAuth } from "../context/useAuth";

function Dashboard({ workspaceId, setWorkspaceId }) {

    const { isAdminIn } = useAuth();
    const admin = isAdminIn(workspaceId);

    const [tasks, setTasks] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [error, setError] = useState(null);

    // ========================================
    // Load tasks
    // ========================================

    useEffect(() => {

        if (!workspaceId) {
            setTasks([]);
            return;
        }

        async function loadTasks() {

            try {

                const data = await getTasks(workspaceId, {});

                setTasks(data);

            } catch (error) {

                setError(error.message);

            }
        }

        loadTasks();

    }, [workspaceId]);


    // ========================================
    // Load this workspace's status configuration.
    //
    // Every workspace defines its own statuses (Personal might use
    // Open/In Progress/Closed/Cancelled, a support desk might use
    // New/Blocked/Resolved, a classroom might use Not Started/
    // Submitted/Graded). Statuses aren't identified by name — only
    // `is_completed` / `is_cancelled` are meaningful across workspaces
    // — so the dashboard has to load the real configuration rather
    // than assuming any particular status names exist.
    // ========================================

    useEffect(() => {

        if (!workspaceId) {
            setStatuses([]);
            return;
        }

        async function loadStatuses() {

            try {

                const data = await getStatuses(workspaceId);

                setStatuses(data);

            } catch (error) {

                setError(error.message);

            }
        }

        loadStatuses();

    }, [workspaceId]);

    if (error) {
        return <p>Error: {error}</p>;
    }

    const totalTasks = tasks.length;

    const completedStatusIds = new Set(
        statuses.filter((status) => status.is_completed).map((status) => status.id)
    );

    const cancelledStatusIds = new Set(
        statuses.filter((status) => status.is_cancelled).map((status) => status.id)
    );

    const completedTasks = tasks.filter(
        (task) => completedStatusIds.has(task.status_id)
    ).length;

    const cancelledTasks = tasks.filter(
        (task) => cancelledStatusIds.has(task.status_id)
    ).length;

    // "Active" is everything that isn't flagged completed or
    // cancelled — this covers whatever in-between statuses a given
    // workspace happens to define (In Progress, Blocked, Under
    // Review, Submitted, ...) without needing to know their names.
    const activeTasks = totalTasks - completedTasks - cancelledTasks;

    // Per-status counts, in the order the workspace configured them,
    // for the breakdown chart further down the page.
    const statusCounts = statuses.map((status) => ({
        ...status,
        count: tasks.filter((task) => task.status_id === status.id).length
    }));

    const recentTasks = [...tasks]
        .sort((a, b) => b.id - a.id)
        .slice(0, 5);

    return (

        <div className="dashboard">

            {/* Header */}

            <div className="page-header">

                <div>

                    <h1 className="page-title">
                        Dashboard
                    </h1>

                    <p className="page-subtitle">
                        Here's an overview of your tasks.
                    </p>

                </div>

                <WorkspaceSelector
                    workspaceId={workspaceId}
                    setWorkspaceId={setWorkspaceId}
                />

                {admin && (
                    <Link
                        to="/tasks/create"
                        className="primary-button"
                    >
                        Create Task
                    </Link>
                )}

            </div>


            {/* Statistics */}

            <div className="dashboard-stats">

                <div className="stat-card">

                    <span className="stat-label">
                        Total
                    </span>

                    <span className="stat-value">
                        {totalTasks}
                    </span>

                </div>


                <div className="stat-card">

                    <span className="stat-label">
                        Active
                    </span>

                    <span className="stat-value">
                        {activeTasks}
                    </span>

                </div>


                <div className="stat-card">

                    <span className="stat-label">
                        Completed
                    </span>

                    <span className="stat-value status-completed">
                        {completedTasks}
                    </span>

                </div>


                <div className="stat-card">

                    <span className="stat-label">
                        Cancelled
                    </span>

                    <span className="stat-value status-cancelled">
                        {cancelledTasks}
                    </span>

                </div>

            </div>


            {/* Recent Tasks */}

            <div className="dashboard-section">

                <div className="section-header">

                    <div>

                        <h2>
                            Recent Tasks
                        </h2>

                        <p>
                            Your most recently created tasks.
                        </p>

                    </div>

                    <Link
                        to="/tasks"
                        className="view-all-link"
                    >
                        View all
                    </Link>

                </div>


                {recentTasks.length === 0 ? (

                    <div className="dashboard-empty">

                        <h3>
                            No tasks yet
                        </h3>

                        <p>
                            Create your first task to get started.
                        </p>

                        {admin && (
                            <Link
                                to="/tasks/create"
                                className="primary-button"
                            >
                                Create Task
                            </Link>
                        )}

                    </div>

                ) : (

                    <div className="recent-task-list">

                        {recentTasks.map((task) => (

                            <Link
                                key={task.id}
                                to={admin ? `/tasks/${task.id}/edit` : "/tasks"}
                                state={{ task: task }}
                                className="recent-task"
                            >

                                <div className="recent-task-info">

                                    <h3>
                                        {task.title}
                                    </h3>

                                    <p>
                                        {task.category}
                                        {" · "}
                                        {task.group}
                                    </p>

                                </div>


                                <div className="recent-task-meta">

                                    <span className="badge">
                                        {task.status}
                                    </span>

                                    <span
                                        className="badge priority-configured"
                                        style={{ "--priority-index": task.priority_id || 0 }}
                                    >
                                        {task.priority}
                                    </span>

                                </div>

                            </Link>

                        ))}

                    </div>

                )}

            </div>


            {/* Task Overview */}

            <div className="dashboard-section">

                <div className="section-header">

                    <div>

                        <h2>
                            Task Overview
                        </h2>

                        <p>
                            Current distribution across this workspace's statuses.
                        </p>

                    </div>

                </div>


                {statusCounts.length === 0 ? (

                    <p className="dashboard-empty-inline">
                        This workspace has no statuses configured yet.
                    </p>

                ) : (

                    <div className="status-overview">

                        {statusCounts.map((status) => (
                            <StatusBar
                                key={status.id}
                                label={status.name}
                                count={status.count}
                                total={totalTasks}
                                variant={
                                    status.is_completed
                                        ? "completed"
                                        : status.is_cancelled
                                            ? "cancelled"
                                            : "default"
                                }
                            />
                        ))}

                    </div>

                )}

            </div>

        </div>
    );
}


function StatusBar({ label, count, total, variant = "default" }) {

    const percentage =
        total > 0
            ? (count / total) * 100
            : 0;

    return (

        <div className="status-row">

            <div className="status-row-header">

                <span>
                    {label}
                </span>

                <span>
                    {count}
                </span>

            </div>

            <div className="status-bar">

                <div
                    className={`status-bar-fill status-bar-fill-${variant}`}
                    style={{
                        width: `${percentage}%`
                    }}
                />

            </div>

        </div>
    );
}

export default Dashboard;
