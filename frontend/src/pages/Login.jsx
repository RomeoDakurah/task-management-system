import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const redirectTo = location.state?.from || "/";

    async function handleSubmit(event) {
        event.preventDefault();

        setError(null);
        setSubmitting(true);

        try {
            await login(email, password);
            navigate(redirectTo, { replace: true });
        } catch (err) {
            setError(err.message || "Failed to log in");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="workspace-page">

            <div className="workspace-hero">
                <div className="workspace-brand">TaskFlow</div>
                <h1>Welcome back</h1>
                <p className="workspace-subtitle">
                    Log in to see your workspaces and tasks.
                </p>
            </div>

            <div className="workspace-card">

                <form onSubmit={handleSubmit}>

                    {error && (
                        <div className="auth-error">{error}</div>
                    )}

                    <div className="auth-field">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="workspace-continue"
                        disabled={submitting}
                    >
                        <span>{submitting ? "Logging in..." : "Log in"}</span>
                        <span className="continue-arrow">→</span>
                    </button>

                </form>

                <div className="auth-switch">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </div>

            </div>

        </div>
    );
}

export default Login;
