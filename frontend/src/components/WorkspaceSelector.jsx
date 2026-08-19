import { useEffect, useState } from "react";
import { getWorkspaces } from "../services/ConfigServices";

function WorkspaceSelector({ workspaceId, setWorkspaceId }) {

    const [workspaces, setWorkspaces] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadWorkspaces() {
            try {
                const data = await getWorkspaces();
                setWorkspaces(data);
    
            } catch (error) {
                setError(error.message);
            }
        }
    
        loadWorkspaces();
    }, []);

    function handleChange(event) {
        setWorkspaceId(event.target.value);
    }

    if (error) {
        return (
            <div className="workspace-selector">
                <span>Workspace unavailable</span>
            </div>
        );
    }

    return (
        <div className="workspace-selector">

            <label htmlFor="workspace-select">
                Workspace
            </label>

            <select
                id="workspace-select"
                value={workspaceId}
                onChange={handleChange}
            >

                <option value="" disabled>
                    Select a workspace
                </option>

                {workspaces.map((workspace) => (
                    <option
                        key={workspace.id}
                        value={workspace.id}
                    >
                        {workspace.name}
                    </option>
                ))}
            </select>

        </div>
    );
}

export default WorkspaceSelector;