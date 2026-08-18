import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getPriorities,
    getCategories,
    getGroups
} from "../services/ConfigServices";
import { createTask } from "../services/TaskServices";

function CreateTask({ onTaskCreated }) {
    const [priorities, setPriorities] = useState([]);
    const [categories, setCategories] = useState([]);
    const [groups, setGroups] = useState([]);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        description: "",
        category_id: "",
        group_id: "",
        priority_id: "",
        due_date: "" || null
    });

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        async function loadOptions() {
            try {
                const [
                    priorityData,
                    categoryData,
                    groupData
                ] = await Promise.all([
                    getPriorities(),
                    getCategories(),
                    getGroups()
                ]);

                setPriorities(priorityData);
                setCategories(categoryData);
                setGroups(groupData);
            } catch (error) {
                setError(error.message);
            }
        }

        loadOptions();
    }, []);

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
        setSuccess(false);

        try {
            await createTask({
                title: form.title,
                description: form.description,
                category_id: Number(form.category_id),
                group_id: Number(form.group_id),
                priority_id: Number(form.priority_id),
                due_date: form.due_date
            });

            setForm({
                title: "",
                description: "",
                category_id: "",
                group_id: "",
                priority_id: "",
                due_date: ""
            });

            setSuccess(true);

            if (onTaskCreated) {
                onTaskCreated();
            }

            navigate("/tasks");

        } catch (error) {
            setError(error.message);
        }
    }

    return (
        <div className="create-task-container">
    
            <div className="form-card">
    
                <div className="form-header">
                    <div>
                        <h2>Create a new task</h2>
                        <p>
                            Add the details below to organize your work.
                        </p>
                    </div>
                </div>
    
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
    
                <form onSubmit={handleSubmit}>
    
                    <div className="form-group">
                        <label>Task title</label>
    
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="e.g. Finish project documentation"
                            required
                        />
                    </div>
    
                    <div className="form-group">
                        <label>Description</label>
    
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Add some details about this task..."
                        />
                    </div>
    
                    <div className="form-divider" />
    
                    <div className="form-section-title">
                        Task details
                    </div>
    
                    <div className="form-grid">
    
                        <div className="form-group">
                            <label>Category</label>
    
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
                            <label>Group</label>
    
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
    
                        <div className="form-group">
                            <label>Priority</label>
    
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
                                        document.getElementById("hidden-date-picker").showPicker()
                                    }
                                />

                                <span
                                    className="calendar-icon"
                                    onClick={() =>
                                        document.getElementById("hidden-date-picker").showPicker()
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
    
                    </div>
    
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
                            Create Task
                        </button>
    
                    </div>
    
                </form>
    
            </div>
    
        </div>
    );
}

export default CreateTask;