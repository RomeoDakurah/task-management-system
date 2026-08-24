import { useEffect, useState } from "react";
import { getTasks, deleteTask } from "../services/TaskServices";
import TaskCard from "../components/TaskCard.jsx";
import TaskFilters from "../components/TaskFilters";
import WorkspaceSelector from "../components/WorkspaceSelector";
import { useAuth } from "../context/useAuth";
import {
    getStatuses,
    getWorkspaceMembers
} from "../services/ConfigServices";


function Tasks({ workspaceId, setWorkspaceId }) {

    const { isAdminIn } = useAuth();
    const admin = isAdminIn(workspaceId);

    const [tasks, setTasks] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [members, setMembers] = useState([]);
    const [error, setError] = useState(null);
    const [taskView, setTaskView] = useState("all");

    const [filters, setFilters] = useState({
        status_id: "",
        priority_id: "",
        category_id: "",
        group_id: ""
    });


    // ========================================
    // Load tasks when workspace or filters change
    // ========================================

    useEffect(() => {

        if (!workspaceId) {
            setTasks([]);
            return;
        }

        fetchTasks();

    }, [workspaceId, filters]);


    // ========================================
    // Load workspace statuses
    // ========================================

    useEffect(() => {

        if (!workspaceId) {
            setStatuses([]);
            return;
        }
    
        fetchStatuses();

        if (admin) {
            fetchMembers();
        } else {
            setMembers([]);
        }

    }, [workspaceId, admin]);


    // ========================================
    // Fetch tasks
    // ========================================

    async function fetchTasks() {

        try {

            setError(null);

            const data =
                await getTasks(
                    workspaceId,
                    filters
                );

            setTasks(data);

        } catch (error) {

            setError(error.message);

        }
    }


    // ========================================
    // Fetch statuses
    // ========================================

    async function fetchStatuses() {

        try {

            const data =
                await getStatuses(
                    workspaceId
                );

            setStatuses(data);

        } catch (error) {

            setError(error.message);

        }
    }

    // ========================================
    // Fetch workspace members (admin only — used
    // for the "Assign to..." control on task cards)
    // ========================================

    async function fetchMembers() {

        try {

            const data = await getWorkspaceMembers(workspaceId);
            setMembers(data);

        } catch {

            // Non-admins get a 403 here, which is expected —
            // just leave the assign control unavailable.
            setMembers([]);

        }
    }

    // ========================================
    // Refresh after status update
    // ========================================

    async function handleTaskUpdated() {

        await fetchTasks();
    
        const statusData = await getStatuses(workspaceId);
    
        setStatuses(statusData);
    }


    // ========================================
    // Delete task
    // ========================================

    async function handleDelete(taskId) {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this task?"
            );

        if (!confirmed) {
            return;
        }

        try {

            await deleteTask(taskId);

            setTasks((currentTasks) =>
                currentTasks.filter(
                    (task) => task.id !== taskId
                )
            );

        } catch (error) {

            setError(error.message);

        }
    }


    const hasFilters =
        filters.status_id ||
        filters.priority_id ||
        filters.category_id ||
        filters.group_id;

    const visibleTasks = admin
        ? tasks
        : tasks.filter((task) => {
            if (taskView === "pending") {
                return !task.accepted_at;
            }

            if (taskView === "accepted") {
                return Boolean(task.accepted_at);
            }

            return true;
        });


    if (error) {
        return (
            <p>
                Error: {error}
            </p>
        );
    }

    return (

        <div>

            {/* Page header */}

            <div className="page-header">

                <div>

                    <h1 className="page-title">
                        Tasks
                    </h1>

                    <p className="page-subtitle">
                        Manage and keep track of your tasks.
                    </p>

                </div>

                <WorkspaceSelector
                    workspaceId={workspaceId}
                    setWorkspaceId={setWorkspaceId}
                />

            </div>


            {!admin && (
                <div
                    className="task-filter-header"
                    style={{ marginBottom: 12 }}
                >
                    <div className="task-actions">
                        <button
                            type="button"
                            className={taskView === "all" ? "complete-button" : "secondary-button"}
                            onClick={() => setTaskView("all")}
                        >
                            All tasks
                        </button>

                        <button
                            type="button"
                            className={taskView === "pending" ? "complete-button" : "secondary-button"}
                            onClick={() => setTaskView("pending")}
                        >
                            Pending
                        </button>

                        <button
                            type="button"
                            className={taskView === "accepted" ? "complete-button" : "secondary-button"}
                            onClick={() => setTaskView("accepted")}
                        >
                            Accepted
                        </button>
                    </div>
                </div>
            )}

            {/* Filters */}

            <div className="task-filter-header">

                <TaskFilters
                    filters={filters}
                    setFilters={setFilters}
                    workspaceId={workspaceId}
                />

            </div>


            {/* Task count */}

            <div className="task-list-header">

                <span className="task-count">

                    {visibleTasks.length}{" "}
                    {visibleTasks.length === 1
                        ? "task"
                        : "tasks"}

                </span>

            </div>


            {/* Task list */}

            {visibleTasks.length === 0 ? (

                <div className="empty-state">

                    <div className="empty-state-icon">
                        ✓
                    </div>

                    <h3>
                        No tasks found
                    </h3>

                    {hasFilters ? (

                        <p>
                            No tasks match your current filters.
                        </p>

                    ) : (

                        <p>
                            You don't have any tasks yet.
                        </p>

                    )}

                </div>

            ) : (

                <div className="task-grid">

                    {visibleTasks.map((task) => (

                        <TaskCard
                            key={task.id}
                            task={task}
                            statuses={statuses}
                            workspaceId={workspaceId}
                            members={members}
                            onDelete={handleDelete}
                            onTaskUpdated={handleTaskUpdated}
                        />

                    ))}

                </div>

            )}

        </div>
    );
}


export default Tasks;