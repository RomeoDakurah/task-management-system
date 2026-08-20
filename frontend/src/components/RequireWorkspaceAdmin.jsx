import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function RequireWorkspaceAdmin({ workspaceId, children }) {

    const { isAdminIn } = useAuth();

    if (!isAdminIn(workspaceId)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export default RequireWorkspaceAdmin;
