import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    getPriorities,
    getCategories,
    getGroups,
    getStatuses
} from "../services/ConfigServices";
import { updateTask } from "../services/TaskServices";

function EditTask({ workspaceId }) {
    const { taskId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const task = location.state?.task;

    const [statuses, setStatuses] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [categories, setCategories] = useState([]);
    const [groups, setGroups] = useState([]);

    const [form, setForm] = useState({
        title: "",
        description: "",
        status_id: "",
        priority_id: "",
        category_id: "",
        group_id: "",
        due_date: ""
    });

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {

                if (!workspaceId) {
                    throw new Error("Workspace was not provided");
                }
    
                if (!task) {
                    throw new Error("Task data was not provided");
                }

                const [
                    statusData,
                    priorityData,
                    categoryData,
                    groupData
                ] = await Promise.all([
                    getStatuses(workspaceId),
                    getPriorities(workspaceId),
                    getCategories(workspaceId),
                    getGroups(workspaceId)
                ]);

                setStatuses(statusData);
                setPriorities(priorityData);
                setCategories(categoryData);
                setGroups(groupData);

                if (!task) {
                    throw new Error("Task data was not provided");
                }

                const status = statusData.find(
                    (item) => item.name === task.status
                );

                const priority = priorityData.find(
                    (item) => item.name === task.priority
                );

                const category = categoryData.find(
                    (item) => item.name === task.category
                );

                const group = groupData.find(
                    (item) => item.name === task.group
                );

                setForm({
                    title: task.title ?? "",
                    description: task.description ?? "",
                    status_id: status?.id ?? "",
                    priority_id: priority?.id ?? "",
                    category_id: category?.id ?? "",
                    group_id: group?.id ?? "",
                    due_date: task.due_date
                        ? task.due_date.slice(0, 16)
                        : ""
                });

                setLoading(false);

            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        }

        loadData();
    }, [task, workspaceId]);

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((currentForm) => ({
            ...currentForm,
            [name]: value
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError(null);

        try {
            await updateTask(taskId, {
                title: form.title,
                description: form.description,
                status_id: Number(form.status_id),
                priority_id: Number(form.priority_id),
                category_id: Number(form.category_id),
                group_id: Number(form.group_id),
                due_date: form.due_date || null
            });

            navigate("/tasks");

        } catch (error) {
            setError(error.message);
        }
    }

    if (loading) {
        return (
            <div className="create-task-container">
                <p>Loading task...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="create-task-container">
                <div className="error-message">
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="create-task-container">

            <div className="form-card">

                <div className="form-header">
                    <h2>Edit Task</h2>
                    <p>
                        Update the details of your task.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>

                    {/* Title */}

                    <div className="form-group">
                        <label>
                            Title
                        </label>

                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            required
                        />
                    </div>


                    {/* Description */}

                    <div className="form-group">
                        <label>
                            Description
                        </label>

                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                        />
                    </div>


                    <div className="form-divider" />

                    <div className="form-section-title">
                        Task Details
                    </div>


                    {/* Status + Priority */}

                    <div className="form-grid">

                        <div className="form-group">

                            <label>
                                Status
                            </label>

                            <select
                                name="status_id"
                                value={form.status_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">
                                    Select status
                                </option>

                                {statuses.map((status) => (
                                    <option
                                        key={status.id}
                                        value={status.id}
                                    >
                                        {status.name}
                                    </option>
                                ))}
                            </select>

                        </div>


                        <div className="form-group">

                            <label>
                                Priority
                            </label>

                            <select
                                name="priority_id"
                                value={form.priority_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">
                                    Select priority
                                </option>

                                {priorities.map((priority) => (
                                    <option
                                        key={priority.id}
                                        value={priority.id}
                                    >
                                        {priority.name}
                                    </option>
                                ))}
                            </select>

                        </div>

                    </div>


                    {/* Category + Group */}

                    <div className="form-grid">

                        <div className="form-group">

                            <label>
                                Category
                            </label>

                            <select
                                name="category_id"
                                value={form.category_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">
                                    Select category
                                </option>

                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>

                        </div>


                        <div className="form-group">

                            <label>
                                Group
                            </label>

                            <select
                                name="group_id"
                                value={form.group_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">
                                    Select group
                                </option>

                                {groups.map((group) => (
                                    <option
                                        key={group.id}
                                        value={group.id}
                                    >
                                        {group.name}
                                    </option>
                                ))}
                            </select>

                        </div>

                    </div>


                    {/* Due Date */}

                    <div className="form-group">

                        <label>
                            Due date <span>(optional)</span>
                        </label>

                        <div className="date-picker">

                            <input
                                type="text"
                                className="date-display"
                                value={
                                    form.due_date
                                        ? new Date(form.due_date).toLocaleString("en-US", {
                                            hour: "numeric",
                                            minute: "2-digit",
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric"
                                        })
                                        : ""
                                }
                                placeholder="Select date and time"
                                readOnly
                                onClick={() =>
                                    document
                                        .getElementById("hidden-date-picker")
                                        .showPicker()
                                }
                            />

                            <span
                                className="calendar-icon"
                                onClick={() =>
                                    document
                                        .getElementById("hidden-date-picker")
                                        .showPicker()
                                }
                            >
                                📅
                            </span>

                            <input
                                id="hidden-date-picker"
                                type="datetime-local"
                                name="due_date"
                                value={form.due_date}
                                onChange={handleChange}
                                className="hidden-date-input"
                            />

                        </div>

                    </div>


                    {/* Actions */}

                    <div className="form-actions">

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() => navigate("/tasks")}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primary-button"
                        >
                            Save Changes
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default EditTask;