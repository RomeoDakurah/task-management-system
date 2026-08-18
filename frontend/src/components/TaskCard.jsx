import { Link } from "react-router-dom";
import { updateTask } from "../services/TaskServices";

function TaskCard({ task, onDelete, onStatusChange }) {

    function formatDueDate(date) {

        if (!date) {
            return null;
        }

        return new Date(date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });
    }

    function getPriorityClass(priority) {

        if (!priority) {
            return "badge";
        }

        return `badge priority-${priority.toLowerCase()}`;
    }

    async function handleStatusChange(statusId) {

        try {
            await updateTask(task.id, {
                status_id: statusId
            });
    
            if (onStatusChange) {
                await onStatusChange();
            }
    
        } catch (error) {
            console.error("Failed to update task status:", error);
        }
    }

    const isCompleted = task.status === "Completed";
    const isCancelled = task.status === "Cancelled";

    return (
        <div
            className={`task-card ${
                isCompleted ? "task-completed" : ""
            } ${
                isCancelled ? "task-cancelled" : ""
            }`}
        >

            <div className="task-card-header">

                <h3>
                    {task.title}
                </h3>

                {task.priority && (
                    <span className={getPriorityClass(task.priority)}>
                        {task.priority}
                    </span>
                )}

            </div>

            {task.description && (
                <p className="task-description">
                    {task.description}
                </p>
            )}

            <div className="task-meta">

                {task.status && (
                    <span className="badge status-badge">
                        {task.status}
                    </span>
                )}

                {task.category && (
                    <span className="badge">
                        {task.category}
                    </span>
                )}

                {task.group && (
                    <span className="badge">
                        {task.group}
                    </span>
                )}

            </div>

            <div className="task-card-bottom">

                {task.due_date ? (
                    <div className="task-due-date">
                        <span className="due-icon">◷</span>
                        Due {formatDueDate(task.due_date)}
                    </div>
                ) : (
                    <div className="task-due-date no-due-date">
                        No due date
                    </div>
                )}

                <div className="task-actions">

                    {!isCompleted && !isCancelled && (
                        <>
                            <button
                                className="complete-button"
                                onClick={() => handleStatusChange(3)}
                            >
                                Complete
                            </button>

                            <button
                                className="cancel-button"
                                onClick={() => handleStatusChange(4)}
                            >
                                Cancel
                            </button>
                        </>
                    )}

                    <Link
                        to={`/tasks/${task.id}/edit`}
                        state={{ task: task }}
                    >
                        <button className="edit-button">
                            Edit
                        </button>
                    </Link>

                    <button
                        className="delete-button"
                        onClick={() => onDelete(task.id)}
                    >
                        Delete
                    </button>

                </div>

            </div>

        </div>
    );
}

export default TaskCard;