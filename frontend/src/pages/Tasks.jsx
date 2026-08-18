import { useEffect, useState } from "react";
import { getTasks, deleteTask } from "../services/TaskServices";
import TaskCard from "../components/taskCard";
import TaskFilters from "../components/TaskFilters";

function Tasks() {

    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState({
        status_id: "",
        priority_id: "",
        category_id: "",
        group_id: ""
    });

    useEffect(() => {
        fetchTasks();
    }, [filters]);

    async function fetchTasks() {

        try {

            const data = await getTasks(filters);

            setTasks(data);

        } catch (error) {

            setError(error.message);

        }
    }

    async function handleStatusChange() {
        await fetchTasks();
    }

    async function handleDelete(taskId) {

        const confirmed = window.confirm(
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

    function clearFilters() {

        setFilters({
            status_id: "",
            priority_id: "",
            category_id: "",
            group_id: ""
        });
    }

    const hasFilters =
        filters.status_id ||
        filters.priority_id ||
        filters.category_id ||
        filters.group_id;

    if (error) {
        return <p>Error: {error}</p>;
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

            </div>

            {/* Filters */}

            <div className="task-filter-header">

                <TaskFilters
                    filters={filters}
                    setFilters={setFilters}
                />

                {hasFilters && (
                    <button
                        className="clear-filters-button"
                        onClick={clearFilters}
                    >
                        Clear filters
                    </button>
                )}

            </div>

            {/* Task count */}

            <div className="task-list-header">

                <span className="task-count">

                    {tasks.length}{" "}
                    {tasks.length === 1 ? "task" : "tasks"}

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

                        <>
                            <p>
                                No tasks match your current filters.
                            </p>

                            <button
                                className="secondary-button"
                                onClick={clearFilters}
                            >
                                Clear filters
                            </button>
                        </>

                    ) : (

                        <>
                            <p>
                                You don't have any tasks yet.
                            </p>
                        </>

                    )}

                </div>

            ) : (

                <div className="task-grid">

                    {tasks.map((task) => (

                        <TaskCard
                            key={task.id}
                            task={task}
                            onDelete={handleDelete}
                            onStatusChange={handleStatusChange}
                        />

                    ))}

                </div>

            )}

        </div>
    );
}

export default Tasks;