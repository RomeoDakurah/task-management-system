from database import get_connection

# ========================================
# CRUD operations
# ========================================

def create_category(workspace_id, name):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO categories (workspace_id, name)
        VALUES (?, ?)
        """,
        (workspace_id, name)
    )

    conn.commit()

    category_id = cursor.lastrowid

    conn.close()

    return {
        "id": category_id,
        "name": name
    }


def update_category(workspace_id, category_id, name):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE categories
        SET name = ?
        WHERE id = ?
        AND workspace_id = ?
        """,
        (name, category_id, workspace_id)
    )

    conn.commit()

    updated = cursor.rowcount

    conn.close()

    return updated > 0


def delete_category(workspace_id, category_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM categories
        WHERE id = ?
        AND workspace_id = ?
        """,
        (category_id, workspace_id)
    )

    conn.commit()

    deleted = cursor.rowcount

    conn.close()

    return deleted > 0

def create_priority(workspace_id, name):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO priorities (workspace_id, name)
        VALUES (?, ?)
        """,
        (workspace_id, name)
    )

    conn.commit()

    priority_id = cursor.lastrowid

    conn.close()

    return {
        "id": priority_id,
        "name": name
    }


def update_priority(workspace_id, priority_id, name):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE priorities
        SET name = ?
        WHERE id = ?
        AND workspace_id = ?
        """,
        (name, priority_id, workspace_id)
    )

    conn.commit()

    updated = cursor.rowcount

    conn.close()

    return updated > 0


def delete_priority(workspace_id, priority_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM priorities
        WHERE id = ?
        AND workspace_id = ?
        """,
        (priority_id, workspace_id)
    )

    conn.commit()

    deleted = cursor.rowcount

    conn.close()

    return deleted > 0

def create_group(workspace_id, name, group_type):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO groups (workspace_id, name, type)
        VALUES (?, ?, ?)
        """,
        (workspace_id, name, group_type)
    )

    conn.commit()

    group_id = cursor.lastrowid

    conn.close()

    return {
        "id": group_id,
        "name": name,
        "type": group_type
    }


def update_group(workspace_id, group_id, name, group_type):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE groups
        SET name = ?, type = ?
        WHERE id = ?
        AND workspace_id = ?
        """,
        (name, group_type, group_id, workspace_id)
    )

    conn.commit()

    updated = cursor.rowcount

    conn.close()

    return updated > 0


def delete_group(workspace_id, group_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM groups
        WHERE id = ?
        AND workspace_id = ?
        """,
        (group_id, workspace_id)
    )

    conn.commit()

    deleted = cursor.rowcount

    conn.close()

    return deleted > 0

def create_status(
    workspace_id,
    name,
    is_completed=False,
    is_cancelled=False
):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO statuses
        (
            workspace_id,
            name,
            is_completed,
            is_cancelled
        )
        VALUES (?, ?, ?, ?)
        """,
        (
            workspace_id,
            name,
            is_completed,
            is_cancelled
        )
    )

    conn.commit()

    status_id = cursor.lastrowid

    conn.close()

    return {
        "id": status_id,
        "name": name,
        "is_completed": bool(is_completed),
        "is_cancelled": bool(is_cancelled)
    }


def update_status(
    workspace_id,
    status_id,
    name,
    is_completed,
    is_cancelled
):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE statuses
        SET
            name = ?,
            is_completed = ?,
            is_cancelled = ?
        WHERE id = ?
        AND workspace_id = ?
        """,
        (
            name,
            is_completed,
            is_cancelled,
            status_id,
            workspace_id
        )
    )

    conn.commit()

    updated = cursor.rowcount

    conn.close()

    return updated > 0


def delete_status(workspace_id, status_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM statuses
        WHERE id = ?
        AND workspace_id = ?
        """,
        (status_id, workspace_id)
    )

    conn.commit()

    deleted = cursor.rowcount

    conn.close()

    return deleted