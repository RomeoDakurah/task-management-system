import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import {
    getWorkspaceMembers,
    addWorkspaceMember,
    updateMemberRole,
    removeWorkspaceMember
} from "../services/ConfigServices";

function WorkspaceMembers({ workspaceId }) {

    const { user } = useAuth();

    const [members, setMembers] = useState([]);
    const [error, setError] = useState(null);

    // "add" | "edit" | null — mirrors activeForm in WorkspaceSettings
    const [activeForm, setActiveForm] = useState(null);
    const [editingMember, setEditingMember] = useState(null);

    const [emailField, setEmailField] = useState("");
    const [roleField, setRoleField] = useState("user");
    const [submitting, setSubmitting] = useState(false);


    async function loadMembers() {

        if (!workspaceId) {
            return;
        }

        try {
            setError(null);
            const data = await getWorkspaceMembers(workspaceId);
            setMembers(data);
        } catch (err) {
            setError(err.message);
        }
    }


    useEffect(() => {

        loadMembers();
        closeForm();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workspaceId]);


    function openAddForm() {
        setActiveForm("add");
        setEditingMember(null);
        setEmailField("");
        setRoleField("user");
        setError(null);
    }


    function openEditForm(member) {
        setActiveForm("edit");
        setEditingMember(member);
        setEmailField(member.email);
        setRoleField(member.role);
        setError(null);
    }


    function closeForm() {
        setActiveForm(null);
        setEditingMember(null);
        setEmailField("");
        setRoleField("user");
        setError(null);
    }


    async function handleSave() {

        setSubmitting(true);
        setError(null);

        try {

            if (activeForm === "add") {

                await addWorkspaceMember(
                    workspaceId,
                    emailField.trim(),
                    roleField
                );

            } else {

                await updateMemberRole(
                    workspaceId,
                    editingMember.id,
                    roleField
                );

            }

            closeForm();
            await loadMembers();

        } catch (err) {

            setError(err.message);

        } finally {

            setSubmitting(false);

        }
    }


    async function handleRemove(member) {

        const confirmed = window.confirm(
            `Remove ${member.name} from this workspace?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError(null);
            await removeWorkspaceMember(workspaceId, member.id);
            await loadMembers();
        } catch (err) {
            setError(err.message);
        }
    }


    return (

        <section className="settings-section">

            <div className="settings-section-header">

                <div>
                    <h2>Members</h2>
                    <p>Who has access to this workspace, and what they can do.</p>
                </div>

                <button
                    type="button"
                    className="primary-button"
                    onClick={openAddForm}
                >
                    + Add
                </button>

            </div>


            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}


            {activeForm && (

                <div className="status-form-card">

                    <div className="status-form-header">
                        <div>
                            <h2>
                                {activeForm === "add" ? "Add member" : "Edit role"}
                            </h2>
                            <p>
                                {activeForm === "add"
                                    ? "They need an existing TaskFlow account — ask them to sign up first if they don't have one."
                                    : `Change ${editingMember?.name}'s role in this workspace.`}
                            </p>
                        </div>
                    </div>

                    {activeForm === "add" && (
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={emailField}
                                onChange={(e) => setEmailField(e.target.value)}
                                placeholder="teammate@example.com"
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Role</label>
                        <select
                            value={roleField}
                            onChange={(e) => setRoleField(e.target.value)}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

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
                            onClick={handleSave}
                            disabled={
                                submitting ||
                                (activeForm === "add" && !emailField.trim())
                            }
                        >
                            {submitting
                                ? "Saving..."
                                : activeForm === "add"
                                    ? "Add member"
                                    : "Save changes"}
                        </button>

                    </div>

                </div>

            )}


            <div className="settings-list">

                {members.map((member) => {

                    const isSelf = user && member.id === user.id;

                    return (
                        <div className="settings-item" key={member.id}>

                            <span>
                                {member.name} — {member.email} · {member.role}
                            </span>

                            <div className="settings-item-actions">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    disabled={isSelf}
                                    onClick={() => openEditForm(member)}
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    className="danger-button"
                                    disabled={isSelf}
                                    onClick={() => handleRemove(member)}
                                >
                                    Remove
                                </button>

                            </div>

                        </div>
                    );

                })}

                {members.length === 0 && (
                    <p className="empty-state">No members yet.</p>
                )}

            </div>

        </section>
    );
}

export default WorkspaceMembers;
