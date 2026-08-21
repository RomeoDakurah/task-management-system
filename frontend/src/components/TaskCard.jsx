import { Link } from "react-router-dom";
import { useState } from "react";
import { updateTask, acceptTask, completeTask, assignTask } from "../services/TaskServices";
import { useAuth } from "../context/useAuth";

function TaskCard({
    task,
    onDelete,
    onTaskUpdated,
    statuses,
    workspaceId,
    members = []
}) {

    const { user, isAdminIn } = useAuth();
    const admin = isAdminIn(workspaceId);
    const isAssignee = task.assigned_to && user && task.assigned_to === user.id;

    const [assigning, setAssigning] = useState(false);

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
            return "priority-default";
        }

        return `priority-${priority.toLowerCase()}`;
    }


    async function changeTaskStatus(statusId) {

        try {

            await updateTask(task.id, {
                status_id: statusId
            });

            if (onTaskUpdated) {
                await onTaskUpdated();
            }

        } catch (error) {

            console.error(
                "Failed to update task status:",
                error
            );

        }
    }


    async function handleAccept() {
        try {
            await acceptTask(task.id);

            if (onTaskUpdated) {
                await onTaskUpdated();
            }
        } catch (error) {
            console.error("Failed to accept task:", error);
        }
    }


    async function handleComplete() {
        try {
            await completeTask(task.id);

            if (onTaskUpdated) {
                await onTaskUpdated();
            }
        } catch (error) {
            console.error("Failed to complete task:", error);
        }
    }


    async function handleAssign(event) {

        const userId = event.target.value;

        if (!userId) {
            return;
        }

        try {
            await assignTask(task.id, Number(userId));

            if (onTaskUpdated) {
                await onTaskUpdated();
            }
        } catch (error) {
            console.error("Failed to assign task:", error);
        } finally {
            setAssigning(false);
        }
    }


    const assignedMember = members.find(
        (m) => m.id === task.assigned_to
    );


    const completedStatus = statuses?.find(
        (status) => status.is_completed
    );

    const cancelledStatus = statuses?.find(
        (status) => status.is_cancelled
    );


    const isCompleted =
        completedStatus &&
        task.status === completedStatus.name;

    const isCancelled =
        cancelledStatus &&
        task.status === cancelledStatus.name;


    return (

        <div
            className={`task-card ${
                isCompleted ? "task-completed" : ""
            } ${
                isCancelled ? "task-cancelled" : ""
            }`}
        >

            {/* Header */}

            <div className="task-card-header">

                <div className="task-title-section">

                    <h3>
                        {task.title}
                    </h3>

                </div>

                {task.priority && (
                    <div
                        className={`task-priority ${getPriorityClass(task.priority)}`}
                    >
                        <span className="priority-dot"></span>
                        {task.priority}
                    </div>
                )}

            </div>


            {/* Description */}

            {task.description && (
                <p className="task-description">
                    {task.description}
                </p>
            )}


            {/* Task metadata */}

            <div className="task-meta">

                {task.status && (
                    <div className="task-status">

                        <span className="meta-label">
                            Status
                        </span>

                        <span className="status-value">
                            {task.status}
                        </span>

                    </div>
                )}


                {task.category && (
                    <div className="task-info">

                        <span className="meta-label">
                            Category
                        </span>

                        <span className="meta-value">
                            {task.category}
                        </span>

                    </div>
                )}


                {task.group && (
                    <div className="task-info">

                        <span className="meta-label">
                            Group
                        </span>

                        <span className="meta-value">
                            {task.group}
                        </span>

                    </div>
                )}

                {isAssignee && (
                    <div className="task-info">
                        <span className="meta-label">
                            Assigned to
                        </span>
                        <span className="meta-value">
                            You
                        </span>
                    </div>
                )}

                {admin && assignedMember && !isAssignee && (
                    <div className="task-info">
                        <span className="meta-label">
                            Assigned to
                        </span>
                        <span className="meta-value">
                            {assignedMember.name}
                        </span>
                    </div>
                )}

            </div>


            {/* Bottom */}

            <div className="task-card-bottom">

                <div className="task-due-date">

                    <span className="due-icon">
                        ◷
                    </span>

                    {task.due_date ? (
                        <span>
                            Due {formatDueDate(task.due_date)}
                        </span>
                    ) : (
                        <span className="no-due-date">
                            No due date
                        </span>
                    )}

                </div>


                <div className="task-actions">

                    {/* Assignee actions — accept/complete their own task */}
                    {isAssignee && !isCompleted && !isCancelled && (
                        <>
                            <button
                                className="complete-button"
                                onClick={handleAccept}
                            >
                                Accept
                            </button>

                            <button
                                className="complete-button"
                                onClick={handleComplete}
                            >
                                Complete
                            </button>
                        </>
                    )}

                    {/* Admin actions — full control over the task */}
                    {admin && (
                        <>

                            {!isCompleted && !isCancelled && members.length > 0 && (

                                assigning ? (
                                    <select
                                        className="assign-select"
                                        autoFocus
                                        defaultValue=""
                                        onChange={handleAssign}
                                        onBlur={() => setAssigning(false)}
                                    >
                                        <option value="" disabled>
                                            Choose member...
                                        </option>

                                        {members.map((member) => (
                                            <option
                                                key={member.id}
                                                value={member.id}
                                            >
                                                {member.name} ({member.role})
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={() => setAssigning(true)}
                                    >
                                        {assignedMember
                                            ? `Reassign`
                                            : "Assign to..."}
                                    </button>
                                )

                            )}

                            {!isCompleted && !isCancelled && (
                                <>

                                    {completedStatus && (
                                        <button
                                            className="complete-button"
                                            onClick={() =>
                                                changeTaskStatus(
                                                    completedStatus.id
                                                )
                                            }
                                        >
                                            Complete
                                        </button>
                                    )}

                                    {cancelledStatus && (
                                        <button
                                            className="cancel-button"
                                            onClick={() =>
                                                changeTaskStatus(
                                                    cancelledStatus.id
                                                )
                                            }
                                        >
                                            Cancel
                                        </button>
                                    )}

                                </>
                            )}


                            <Link
                                className="edit-button"
                                to={`/tasks/${task.id}/edit`}
                                state={{ task: task }}
                            >
                                Edit
                            </Link>


                            <button
                                className="delete-button"
                                onClick={() => onDelete(task.id)}
                            >
                                Delete
                            </button>

                        </>
                    )}

                </div>

            </div>

        </div>
    );
}


export default TaskCard;
