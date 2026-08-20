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
