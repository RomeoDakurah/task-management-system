import { useEffect, useState } from "react";
import { getTasks, deleteTask } from "../services/TaskServices";
import TaskCard from "../components/taskCard.jsx";
import TaskFilters from "../components/TaskFilters";
import WorkspaceSelector from "../components/WorkspaceSelector";
import {
    getStatuses,
    getPriorities,
    getCategories,
    getGroups
} from "../services/ConfigServices";


function Tasks({ workspaceId, setWorkspaceId }) {

    const [tasks, setTasks] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [categories, setCategories] = useState([]);
    const [groups, setGroups] = useState([]);
    const [error, setError] = useState(null);

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
            setPriorities([]);
            setCategories([]);
            setGroups([]);
            return;
        }
    
        fetchStatuses();
        fetchConfiguration();
    
    }, [workspaceId]);


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
    // Fetch configuration data (priorities, categories, groups)
    // ========================================

    async function fetchConfiguration() {

        try {
    
            const [
                priorityData,
                categoryData,
                groupData
            ] = await Promise.all([
                getPriorities(workspaceId),
                getCategories(workspaceId),
                getGroups(workspaceId)
            ]);
    
            setPriorities(priorityData);
            setCategories(categoryData);
            setGroups(groupData);
    
        } catch (error) {
    
            setError(error.message);
    
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

                    {tasks.length}{" "}
                    {tasks.length === 1
                        ? "task"
                        : "tasks"}

                </span>

            </div>


            {/* Task list */}

            {tasks.length === 0 ? (

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

                    {tasks.map((task) => (

                        <TaskCard
                            key={task.id}
                            task={task}
                            statuses={statuses}
                            workspaceId={workspaceId}
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