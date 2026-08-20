import { useAuth } from "../context/useAuth";

function WorkspaceSelector({ workspaceId, setWorkspaceId }) {

    const { workspaces, workspacesLoaded } = useAuth();

    function handleChange(event) {
        setWorkspaceId(event.target.value);
    }

    if (!workspacesLoaded) {
        return (
            <div className="workspace-selector">
                <span>Loading...</span>
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
                        {workspace.name} ({workspace.role})
                    </option>
                ))}
            </select>

        </div>
    );
}

export default WorkspaceSelector;
