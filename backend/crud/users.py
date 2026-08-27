from database import get_connection


# ========================================
# Users
# ========================================

def create_user(name, email, password_hash):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO users (name, email, password_hash)
        VALUES (?, ?, ?)
        """,
        (name, email, password_hash)
    )

    conn.commit()
    user_id = cursor.lastrowid
    conn.close()

    return user_id


def get_user_by_email(email):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, name, email, password_hash
        FROM users
        WHERE email = ?
        """,
        (email,)
    )

    row = cursor.fetchone()
    conn.close()

    if row is None:
        return None

    return {
        "id": row[0],
        "name": row[1],
        "email": row[2],
        "password_hash": row[3]
    }


def get_user_by_id(user_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, name, email
        FROM users
        WHERE id = ?
        """,
        (user_id,)
    )

    row = cursor.fetchone()
    conn.close()

    if row is None:
        return None

    return {
        "id": row[0],
        "name": row[1],
        "email": row[2]
    }


# ========================================
# Workspace membership / roles
#
# Role is per-workspace: the same user can be 'admin' in one workspace
# and 'user' in another. A user with no row in workspace_members for a
# given workspace has no access to it at all.
# ========================================

def add_workspace_member(workspace_id, user_id, role="user"):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO workspace_members (workspace_id, user_id, role)
        VALUES (?, ?, ?)
        ON CONFLICT(workspace_id, user_id)
        DO UPDATE SET role = excluded.role
        """,
        (workspace_id, user_id, role)
    )

    conn.commit()
    conn.close()


def get_workspace_role(workspace_id, user_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT role
        FROM workspace_members
        WHERE workspace_id = ?
        AND user_id = ?
        """,
        (workspace_id, user_id)
    )

    row = cursor.fetchone()
    conn.close()

    return row[0] if row else None


def get_user_workspaces(user_id):
    """All workspaces this user belongs to, with their role in each."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT workspaces.id, workspaces.name, workspaces.type, workspace_members.role
        FROM workspace_members
        JOIN workspaces
            ON workspace_members.workspace_id = workspaces.id
        WHERE workspace_members.user_id = ?
        ORDER BY workspaces.id
        """,
        (user_id,)
    )

    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "id": row[0],
            "name": row[1],
            "type": row[2],
            "role": row[3]
        }
        for row in rows
    ]


def get_workspace_members(workspace_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT users.id, users.name, users.email, workspace_members.role
        FROM workspace_members
        JOIN users
            ON workspace_members.user_id = users.id
        WHERE workspace_members.workspace_id = ?
        ORDER BY users.name
        """,
        (workspace_id,)
    )

    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "role": row[3]
        }
        for row in rows
    ]
