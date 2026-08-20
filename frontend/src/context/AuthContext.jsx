import {
    createContext,
    useState,
    useCallback,
    useEffect
} from "react";

import {
    login as apiLogin,
    signup as apiSignup,
    getMyWorkspaces
} from "../services/AuthServices";

import {
    getToken,
    getStoredUser,
    setSession,
    clearSession
} from "../services/api";

const AuthContext = createContext(null);
export { AuthContext };

export function AuthProvider({ children }) {

    const [user, setUser] = useState(() => getStoredUser());
    const [workspaces, setWorkspaces] = useState([]);
    // undetermined until the first /auth/me/workspaces call resolves
    const [workspacesLoaded, setWorkspacesLoaded] = useState(false);

    const isAuthenticated = Boolean(user && getToken());

    const refreshWorkspaces = useCallback(async () => {
        if (!getToken()) {
            setWorkspaces([]);
            setWorkspacesLoaded(true);
            return [];
        }

        const data = await getMyWorkspaces();
        setWorkspaces(data);
        setWorkspacesLoaded(true);
        return data;
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- initial session hydration on mount, not a render loop
            refreshWorkspaces().catch(() => {
                // apiFetch already redirects to /login on 401;
                // anything else just leaves workspaces empty
            });
        } else {
            setWorkspacesLoaded(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function login(email, password) {
        const data = await apiLogin(email, password);
        setSession(data.access_token, data.user);
        setUser(data.user);
        await refreshWorkspaces();
        return data.user;
    }

    async function signup(name, email, password) {
        const data = await apiSignup(name, email, password);
        setSession(data.access_token, data.user);
        setUser(data.user);
        await refreshWorkspaces();
        return data.user;
    }

    function logout() {
        clearSession();
        setUser(null);
        setWorkspaces([]);
    }

    // Role the current user holds in a given workspace, or null if
    // they aren't a member of it at all.
    function roleIn(workspaceId) {
        if (!workspaceId) {
            return null;
        }

        const match = workspaces.find(
            (w) => String(w.id) === String(workspaceId)
        );

        return match ? match.role : null;
    }

    function isAdminIn(workspaceId) {
        return roleIn(workspaceId) === "admin";
    }

    const value = {
        user,
        isAuthenticated,
        workspaces,
        workspacesLoaded,
        refreshWorkspaces,
        login,
        signup,
        logout,
        roleIn,
        isAdminIn
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;
