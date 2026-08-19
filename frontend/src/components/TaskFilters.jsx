import { useEffect, useState } from "react";
import {
    getStatuses,
    getPriorities,
    getCategories,
    getGroups
} from "../services/ConfigServices";

function TaskFilters({ filters, setFilters, workspaceId }) {

    const [statuses, setStatuses] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [categories, setCategories] = useState([]);
    const [groups, setGroups] = useState([]);

    useEffect(() => {

        if (!workspaceId) {
            setStatuses([]);
            setPriorities([]);
            setCategories([]);
            setGroups([]);
            return;
        }
    
        async function loadFilters() {
    
            try {
    
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
    
                console.error(
                    "Failed to load filter data:",
                    error
                );
    
            }
        }
    
        loadFilters();
    
    }, [workspaceId]);

    function handleChange(event) {

        const { name, value } = event.target;

        setFilters((currentFilters) => ({
            ...currentFilters,
            [name]: value
        }));
    }

    function clearFilters() {

        setFilters({
            status_id: "",
            priority_id: "",
            category_id: "",
            group_id: ""
        });

    }

    const hasActiveFilters =
        filters.status_id ||
        filters.priority_id ||
        filters.category_id ||
        filters.group_id;

    return (
        <div className="filters">

            <div className="filter-header">
                <span className="filter-title">
                    Filter by
                </span>

                {hasActiveFilters && (
                    <button
                        type="button"
                        className="clear-filters"
                        onClick={clearFilters}
                    >
                        Clear filters
                    </button>
                )}
            </div>

            <div className="filter-controls">

                <select
                    name="status_id"
                    value={filters.status_id}
                    onChange={handleChange}
                >
                    <option value="">
                        Status
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

                <select
                    name="priority_id"
                    value={filters.priority_id}
                    onChange={handleChange}
                >
                    <option value="">
                        Priority
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

                <select
                    name="category_id"
                    value={filters.category_id}
                    onChange={handleChange}
                >
                    <option value="">
                        Category
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

                <select
                    name="group_id"
                    value={filters.group_id}
                    onChange={handleChange}
                >
                    <option value="">
                        Group
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
    );
}

export default TaskFilters;