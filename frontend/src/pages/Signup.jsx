import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Signup() {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const { signup } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(event) {
        event.preventDefault();

        setError(null);
        setSubmitting(true);

        try {
            await signup(name, email, password);
            navigate("/", { replace: true });
        } catch (err) {
            setError(err.message || "Failed to sign up");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="workspace-page">

            <div className="workspace-hero">
                <div className="workspace-brand">TaskFlow</div>
                <h1>Create your account</h1>
                <p className="workspace-subtitle">
                    Sign up, then create or join a workspace to get started.
                </p>
            </div>

            <div className="workspace-card">

                <form onSubmit={handleSubmit}>

                    {error && (
                        <div className="auth-error">{error}</div>
                    )}

                    <div className="auth-field">
                        <label htmlFor="name">Name</label>
                        <input
                            id="name"
                            type="text"
                            autoComplete="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

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
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={8}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="workspace-continue"
                        disabled={submitting}
                    >
                        <span>{submitting ? "Creating account..." : "Sign up"}</span>
                        <span className="continue-arrow">→</span>
                    </button>

                </form>

                <div className="auth-switch">
                    Already have an account? <Link to="/login">Log in</Link>
                </div>

            </div>

        </div>
    );
}

export default Signup;
