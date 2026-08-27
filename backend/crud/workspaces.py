from database import get_connection


def create_workspace(name, type_):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO workspaces (name, type)
        VALUES (?, ?)
        """,
        (name, type_)
    )

    conn.commit()
    workspace_id = cursor.lastrowid
    conn.close()

    return workspace_id


def remove_workspace_member(workspace_id, user_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM workspace_members
        WHERE workspace_id = ?
        AND user_id = ?
        """,
        (workspace_id, user_id)
    )

    conn.commit()
    deleted = cursor.rowcount
    conn.close()

    return deleted > 0


def delete_workspace(workspace_id):
    """Delete a workspace and all data/configuration belonging to it."""
    conn = get_connection()
    cursor = conn.cursor()

    # Tasks must be removed before their referenced configuration rows.
    cursor.execute(
        "DELETE FROM tasks WHERE workspace_id = ?",
        (workspace_id,)
    )

    cursor.execute(
        "DELETE FROM statuses WHERE workspace_id = ?",
        (workspace_id,)
    )

    cursor.execute(
        "DELETE FROM priorities WHERE workspace_id = ?",
        (workspace_id,)
    )

    cursor.execute(
        "DELETE FROM categories WHERE workspace_id = ?",
        (workspace_id,)
    )

    cursor.execute(
        "DELETE FROM groups WHERE workspace_id = ?",
        (workspace_id,)
    )

    cursor.execute(
        "DELETE FROM workspace_members WHERE workspace_id = ?",
        (workspace_id,)
    )

    cursor.execute(
        "DELETE FROM workspaces WHERE id = ?",
        (workspace_id,)
    )

    deleted = cursor.rowcount

    conn.commit()
    conn.close()

    return deleted > 0
