import { useEffect, useState } from "react";
import WorkspaceSelector from "../components/WorkspaceSelector";

import {
    getStatuses,
    createStatus,
    updateStatus,
    deleteStatus,

    getPriorities,
    createPriority,
    updatePriority,
    deletePriority,

    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,

    getGroups,
    createGroup,
    updateGroup,
    deleteGroup
} from "../services/ConfigServices";


function WorkspaceSettings({ workspaceId, setWorkspaceId }) {

    const [statuses, setStatuses] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [categories, setCategories] = useState([]);
    const [groups, setGroups] = useState([]);

    const [error, setError] = useState(null);

    const [activeForm, setActiveForm] = useState(null);
    const [editingItem, setEditingItem] = useState(null);

    const [formName, setFormName] = useState("");

    const [statusForm, setStatusForm] = useState({
        name: "",
        is_completed: false,
        is_cancelled: false
    });


    // ========================================
    // Load configuration
    // ========================================

    async function loadConfiguration() {

        if (!workspaceId) {
            return;
        }

        try {

            setError(null);

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

        } catch (error) {

            setError(error.message);

        }
    }


    useEffect(() => {

        loadConfiguration();

    }, [workspaceId]);


    // ========================================
    // Open add form
    // ========================================

    function handleAdd(type) {

        setActiveForm(type);
        setEditingItem(null);
        setFormName("");
        setError(null);

        if (type === "status") {

            setStatusForm({
                name: "",
                is_completed: false,
                is_cancelled: false
            });

        }
    }


    // ========================================
    // Open edit form
    // ========================================

    function handleEdit(type, item) {

        setActiveForm(type);
        setEditingItem(item);
        setError(null);

        if (type === "status") {

            setStatusForm({
                name: item.name,
                is_completed: item.is_completed,
                is_cancelled: item.is_cancelled
            });

        } else {

            setFormName(item.name);

        }
    }


    // ========================================
    // Close form
    // ========================================

    function closeForm() {

        setActiveForm(null);
        setEditingItem(null);
        setFormName("");

        setStatusForm({
            name: "",
            is_completed: false,
            is_cancelled: false
        });

        setError(null);
    }


    // ========================================
    // Save status
    // ========================================

    async function handleSaveStatus() {

        if (!statusForm.name.trim()) {
            return;
        }

        if (
            statusForm.is_completed &&
            statusForm.is_cancelled
        ) {

            setError(
                "A status cannot be both completed and cancelled."
            );

            return;
        }

        try {

            setError(null);

            if (editingItem) {

                await updateStatus(
                    workspaceId,
                    editingItem.id,
                    {
                        name: statusForm.name.trim(),
                        is_completed: statusForm.is_completed,
                        is_cancelled: statusForm.is_cancelled
                    }
                );

            } else {

                await createStatus(
                    workspaceId,
                    {
                        name: statusForm.name.trim(),
                        is_completed: statusForm.is_completed,
                        is_cancelled: statusForm.is_cancelled
                    }
                );
            }

            closeForm();

            await loadConfiguration();

        } catch (error) {

            setError(error.message);

        }
    }


    // ========================================
    // Save priority/category/group
    // ========================================

    async function handleSaveConfiguration() {

        if (!formName.trim()) {
            return;
        }

        try {

            setError(null);

            if (activeForm === "priority") {

                if (editingItem) {

                    await updatePriority(
                        workspaceId,
                        editingItem.id,
                        {
                            name: formName.trim()
                        }
                    );

                } else {

                    await createPriority(
                        workspaceId,
                        {
                            name: formName.trim()
                        }
                    );
                }
            }


            if (activeForm === "category") {

                if (editingItem) {

                    await updateCategory(
                        workspaceId,
                        editingItem.id,
                        {
                            name: formName.trim()
                        }
                    );

                } else {

                    await createCategory(
                        workspaceId,
                        {
                            name: formName.trim()
                        }
                    );
                }
            }


            if (activeForm === "group") {

                if (editingItem) {

                    await updateGroup(
                        workspaceId,
                        editingItem.id,
                        {
                            name: formName.trim(),
                            type: editingItem.type
                        }
                    );

                } else {

                    await createGroup(
                        workspaceId,
                        {
                            name: formName.trim(),
                            type: "custom"
                        }
                    );
                }
            }

            closeForm();

            await loadConfiguration();

        } catch (error) {

            setError(error.message);

        }
    }


    // ========================================
    // Delete configuration
    // ========================================

    async function handleDelete(type, item) {

        const confirmed = window.confirm(
            `Delete "${item.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {

            setError(null);

            if (type === "status") {

                await deleteStatus(
                    workspaceId,
                    item.id
                );

            }

            if (type === "priority") {

                await deletePriority(
                    workspaceId,
                    item.id
                );

            }

            if (type === "category") {

                await deleteCategory(
                    workspaceId,
                    item.id
                );

            }

            if (type === "group") {

                await deleteGroup(
                    workspaceId,
                    item.id
                );

            }

            await loadConfiguration();

        } catch (error) {

            setError(error.message);

        }
    }


    // ========================================
    // Render configuration section
    // ========================================

    function renderSection(title, type, items) {

        return (
            <section className="settings-section">

                <div className="settings-section-header">

                    <div>

                        <h2>
                            {title}
                        </h2>

                        <p>
                            Manage the options available
                            in this workspace.
                        </p>

                    </div>

                    <button
                        type="button"
                        className="primary-button"
                        onClick={() => handleAdd(type)}
                    >
                        + Add
                    </button>

                </div>


                <div className="settings-list">

                    {items.map((item) => (

                        <div
                            className="settings-item"
                            key={item.id}
                        >

                            <span>
                                {item.name}
                            </span>

                            <div className="settings-item-actions">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() =>
                                        handleEdit(
                                            type,
                                            item
                                        )
                                    }
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    className="danger-button"
                                    onClick={() =>
                                        handleDelete(
                                            type,
                                            item
                                        )
                                    }
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    ))}


                    {items.length === 0 && (

                        <p className="empty-state">
                            No {title.toLowerCase()} configured.
                        </p>

                    )}

                </div>

            </section>
        );
    }


    // ========================================
    // No workspace selected
    // ========================================

    if (!workspaceId) {

        return (
            <div className="empty-state">

                <h2>
                    No workspace selected
                </h2>

                <p>
                    Select a workspace before managing
                    its configuration.
                </p>

            </div>
        );
    }


    // ========================================
    // Main page
    // ========================================

    return (
        <div className="settings-page">

            <div className="page-header">

                <div>

                    <h1 className="page-title">
                        Workspace Settings
                    </h1>

                    <p className="page-subtitle">
                        Customize how tasks are organized
                        in this workspace.
                    </p>

                </div>


                <div className="workspace-setting-selector">

                    <WorkspaceSelector
                        workspaceId={workspaceId}
                        setWorkspaceId={setWorkspaceId}
                    />

                </div>

            </div>


            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}


            {/* ========================================
                Configuration form
            ======================================== */}

            {activeForm && (

                <div className="status-form-card">

                    <div className="status-form-header">

                        <div>

                            <h2>
                                {editingItem
                                    ? `Edit ${activeForm}`
                                    : `Add ${activeForm}`}
                            </h2>

                            <p>
                                Configure this option
                                for your workspace.
                            </p>

                        </div>

                    </div>


                    <div className="form-group">

                        <label>
                            {activeForm === "status"
                                ? "Status name"
                                : activeForm === "priority"
                                    ? "Priority name"
                                    : activeForm === "category"
                                        ? "Category name"
                                        : "Group name"}
                        </label>

                        <input
                            type="text"
                            value={
                                activeForm === "status"
                                    ? statusForm.name
                                    : formName
                            }
                            onChange={(event) => {

                                if (activeForm === "status") {

                                    setStatusForm((current) => ({
                                        ...current,
                                        name: event.target.value
                                    }));

                                } else {

                                    setFormName(
                                        event.target.value
                                    );

                                }

                            }}
                            placeholder={
                                activeForm === "status"
                                    ? "e.g. In Progress"
                                    : activeForm === "priority"
                                        ? "e.g. High"
                                        : activeForm === "category"
                                            ? "e.g. Work"
                                            : "e.g. Personal"
                            }
                        />

                    </div>


                    {activeForm === "status" && (

                        <div className="status-options">

                            <label className="status-option">

                                <input
                                    type="checkbox"
                                    checked={
                                        statusForm.is_completed
                                    }
                                    onChange={(event) =>
                                        setStatusForm((current) => ({
                                            ...current,

                                            is_completed:
                                                event.target.checked,

                                            is_cancelled:
                                                event.target.checked
                                                    ? false
                                                    : current.is_cancelled
                                        }))
                                    }
                                />

                                <div>

                                    <strong>
                                        Completed status
                                    </strong>

                                    <p>
                                        Tasks using this status
                                        will be considered
                                        completed.
                                    </p>

                                </div>

                            </label>


                            <label className="status-option">

                                <input
                                    type="checkbox"
                                    checked={
                                        statusForm.is_cancelled
                                    }
                                    onChange={(event) =>
                                        setStatusForm((current) => ({
                                            ...current,

                                            is_cancelled:
                                                event.target.checked,

                                            is_completed:
                                                event.target.checked
                                                    ? false
                                                    : current.is_completed
                                        }))
                                    }
                                />

                                <div>

                                    <strong>
                                        Cancelled status
                                    </strong>

                                    <p>
                                        Tasks using this status
                                        will be considered
                                        cancelled.
                                    </p>

                                </div>

                            </label>

                        </div>

                    )}


                    <div className="form-actions">

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={closeForm}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="primary-button"
                            onClick={
                                activeForm === "status"
                                    ? handleSaveStatus
                                    : handleSaveConfiguration
                            }
                            disabled={
                                activeForm === "status"
                                    ? !statusForm.name.trim()
                                    : !formName.trim()
                            }
                        >
                            {editingItem
                                ? "Save changes"
                                : `Add ${activeForm}`}
                        </button>

                    </div>

                </div>

            )}


            {renderSection(
                "Statuses",
                "status",
                statuses
            )}


            {renderSection(
                "Priorities",
                "priority",
                priorities
            )}


            {renderSection(
                "Categories",
                "category",
                categories
            )}


            {renderSection(
                "Groups",
                "group",
                groups
            )}

        </div>
    );
}


export default WorkspaceSettings;

