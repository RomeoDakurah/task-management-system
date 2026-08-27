import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTasks } from "../services/TaskServices";
import WorkspaceSelector from "../components/WorkspaceSelector";
import { useAuth } from "../context/useAuth";

function Dashboard({ workspaceId, setWorkspaceId }) {

    const { isAdminIn } = useAuth();
    const admin = isAdminIn(workspaceId);

    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {

        if (!workspaceId) {
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

    }, [workspaceId, {}]);

    if (error) {
        return <p>Error: {error}</p>;
    }

    const totalTasks = tasks.length;

    const openTasks = tasks.filter(
        (task) => task.status === "Open"
    ).length;

    const inProgressTasks = tasks.filter(
        (task) => task.status === "In Progress"
    ).length;

    const completedTasks = tasks.filter(
        (task) => task.status === "Completed"
    ).length;

    const cancelledTasks = tasks.filter(
        (task) => task.status === "Cancelled"
    ).length;

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
                        Open
                    </span>

                    <span className="stat-value">
                        {openTasks}
                    </span>

                </div>


                <div className="stat-card">

                    <span className="stat-label">
                        In Progress
                    </span>

                    <span className="stat-value">
                        {inProgressTasks}
                    </span>

                </div>


                <div className="stat-card">

                    <span className="stat-label">
                        Completed
                    </span>

                    <span className="stat-value">
                        {completedTasks}
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
                            Current distribution of your tasks.
                        </p>

                    </div>

                </div>


                <div className="status-overview">

                    <StatusBar
                        label="Open"
                        count={openTasks}
                        total={totalTasks}
                    />

                    <StatusBar
                        label="In Progress"
                        count={inProgressTasks}
                        total={totalTasks}
                    />

                    <StatusBar
                        label="Completed"
                        count={completedTasks}
                        total={totalTasks}
                    />

                    <StatusBar
                        label="Cancelled"
                        count={cancelledTasks}
                        total={totalTasks}
                    />

                </div>

            </div>

        </div>
    );
}


function StatusBar({ label, count, total }) {

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
                    className="status-bar-fill"
                    style={{
                        width: `${percentage}%`
                    }}
                />

            </div>

        </div>
    );
}

export default Dashboard;