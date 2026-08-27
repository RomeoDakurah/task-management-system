from database import get_connection

# Create
def create_task(task, created_by=None):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id
        FROM statuses
        WHERE workspace_id = ?
        ORDER BY id ASC
        LIMIT 1
        """,
        (task.workspace_id,)
    )

    status = cursor.fetchone()

    if status is None:
        conn.close()
        raise ValueError("No statuses configured")

    status_id = status[0]

    cursor.execute(
        """
        INSERT INTO tasks 
        (
            workspace_id,
            title,
            description,
            status_id,
            priority_id,
            created_at,
            category_id,
            group_id,
            due_date,
            created_by
        )
        VALUES (?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?)
        """,
        (
            task.workspace_id,
            task.title,
            task.description,
            status_id,
            task.priority_id,
            task.category_id,
            task.group_id,
            task.due_date,
            created_by
        )
    )

    conn.commit()
    conn.close()

    return {
        "message": "Task created successfully"
    }

# Read
def get_all_tasks(
    workspace_id,
    status_id=None,
    priority_id=None,
    category_id=None,
    group_id=None,
    assigned_to=None
):

    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT
            tasks.id,
            tasks.title,
            tasks.description,
            tasks.status_id,
            statuses.name AS status,
            tasks.priority_id,
            priorities.name AS priority,
            tasks.created_at,
            tasks.completed_at,
            tasks.accepted_at,
            tasks.due_date,
            tasks.category_id,
            categories.name AS category,
            tasks.group_id,
            groups.name AS group_name,
            tasks.assigned_to,
            tasks.created_by

        FROM tasks

        LEFT JOIN categories
            ON tasks.category_id = categories.id

        LEFT JOIN groups
            ON tasks.group_id = groups.id

        LEFT JOIN statuses
            ON tasks.status_id = statuses.id

        LEFT JOIN priorities
            ON tasks.priority_id = priorities.id
    """

    conditions = [
        "tasks.workspace_id = ?"
    ]

    values = [
        workspace_id
    ]


    if status_id:
        conditions.append("tasks.status_id = ?")
        values.append(status_id)

    if priority_id:
        conditions.append("tasks.priority_id = ?")
        values.append(priority_id)

    if category_id:
        conditions.append("tasks.category_id = ?")
        values.append(category_id)

    if group_id:
        conditions.append("tasks.group_id = ?")
        values.append(group_id)

    if assigned_to is not None:
        conditions.append("tasks.assigned_to = ?")
        values.append(assigned_to)


    query += " WHERE " + " AND ".join(conditions)


    cursor.execute(
        query,
        values
    )

    rows = cursor.fetchall()

    conn.close()


    return [
        {
            "id": row[0],
            "title": row[1],
            "description": row[2],

            "status_id": row[3],
            "status": row[4],

            "priority_id": row[5],
            "priority": row[6],

            "created_at": row[7],
            "completed_at": row[8],
            "accepted_at": row[9],
            "due_date": row[10],

            "category_id": row[11],
            "category": row[12],

            "group_id": row[13],
            "group": row[14],
            "assigned_to": row[15],
            "created_by": row[16]
        }
        for row in rows
    ]

def get_task_by_id(task_id):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            tasks.id,
            tasks.title,
            tasks.description,
            tasks.status_id,
            statuses.name AS status,
            tasks.priority_id,
            priorities.name AS priority,
            tasks.created_at,
            tasks.completed_at,
            tasks.accepted_at,
            tasks.due_date,
            tasks.category_id,
            categories.name AS category,
            tasks.group_id,
            groups.name AS group_name,
            tasks.workspace_id,
            tasks.assigned_to,
            tasks.created_by

        FROM tasks

        LEFT JOIN categories
            ON tasks.category_id = categories.id

        LEFT JOIN groups
            ON tasks.group_id = groups.id

        LEFT JOIN statuses
            ON tasks.status_id = statuses.id

        LEFT JOIN priorities
            ON tasks.priority_id = priorities.id

        WHERE tasks.id = ?
        """,
        (task_id,)
    )

    row = cursor.fetchone()

    conn.close()

    if row is None:
        return None

    return {
        "id": row[0],
        "title": row[1],
        "description": row[2],
        "status_id": row[3],
        "status": row[4],
        "priority_id": row[5],
        "priority": row[6],
        "created_at": row[7],
        "completed_at": row[8],
        "accepted_at": row[9],
        "due_date": row[10],
        "category_id": row[11],
        "category": row[12],
        "group_id": row[13],
        "group": row[14],
        "workspace_id": row[15],
        "assigned_to": row[16],
        "created_by": row[17]
    }

# Update
def update_task(task_id, task_update):

    conn = get_connection()
    cursor = conn.cursor()

    # Get the workspace this task belongs to
    cursor.execute(
        """
        SELECT workspace_id
        FROM tasks
        WHERE id = ?
        """,
        (task_id,)
    )

    task = cursor.fetchone()

    if task is None:
        conn.close()
        return False

    workspace_id = task[0]

    fields = []
    values = []

    if task_update.title is not None:
        fields.append("title = ?")
        values.append(task_update.title)

    if task_update.description is not None:
        fields.append("description = ?")
        values.append(task_update.description)

    if task_update.status_id is not None:

        cursor.execute(
            """
            SELECT is_completed, is_cancelled
            FROM statuses
            WHERE id = ?
            AND workspace_id = ?
            """,
            (
                task_update.status_id,
                workspace_id
            )
        )

        status = cursor.fetchone()

        if status is None:
            conn.close()
            raise ValueError("Status not found for this workspace")

        is_completed = status[0]

        fields.append("status_id = ?")
        values.append(task_update.status_id)

        if is_completed:
            fields.append("completed_at = datetime('now')")
        else:
            fields.append("completed_at = NULL")

    if task_update.priority_id is not None:
        fields.append("priority_id = ?")
        values.append(task_update.priority_id)

    if task_update.category_id is not None:
        fields.append("category_id = ?")
        values.append(task_update.category_id)

    if task_update.group_id is not None:
        fields.append("group_id = ?")
        values.append(task_update.group_id)

    if "due_date" in task_update.model_fields_set:
        fields.append("due_date = ?")
        values.append(task_update.due_date)

    if not fields:
        conn.close()
        return False

    values.append(task_id)

    query = f"""
        UPDATE tasks
        SET {", ".join(fields)}
        WHERE id = ?
    """

    cursor.execute(
        query,
        values
    )

    conn.commit()

    updated = cursor.rowcount

    conn.close()

    return updated > 0

# Assign
def assign_task(task_id, assigned_to):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE tasks
        SET
            assigned_to = ?,
            accepted_at = NULL
        WHERE id = ?
        """,
        (assigned_to, task_id)
    )

    conn.commit()
    updated = cursor.rowcount
    conn.close()

    return updated > 0


def get_task_assignee(task_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT assigned_to
        FROM tasks
        WHERE id = ?
        """,
        (task_id,)
    )

    row = cursor.fetchone()
    conn.close()

    if row is None:
        return None

    return row[0]


def accept_task(task_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE tasks
        SET accepted_at = datetime('now')
        WHERE id = ?
        """,
        (task_id,)
    )

    conn.commit()
    updated = cursor.rowcount
    conn.close()

    return updated > 0


def decline_task(task_id, status_id=None):
    conn = get_connection()
    cursor = conn.cursor()

    if status_id is None:
        cursor.execute(
            """
            UPDATE tasks
            SET
                assigned_to = NULL,
                accepted_at = NULL
            WHERE id = ?
            """,
            (task_id,)
        )
    else:
        cursor.execute(
            """
            UPDATE tasks
            SET
                assigned_to = NULL,
                accepted_at = NULL,
                status_id = ?,
                completed_at = NULL
            WHERE id = ?
            """,
            (status_id, task_id)
        )

    conn.commit()
    updated = cursor.rowcount
    conn.close()

    return updated > 0


# Delete
def delete_task(task_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM tasks
        WHERE id = ?
        """,
        (task_id,)
    )

    conn.commit()

    deleted = cursor.rowcount

    conn.close()

    return deleted

# ========================================
# Workspace configuration
# ========================================

def get_all_statuses(workspace_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, name, is_completed, is_cancelled
        FROM statuses
        WHERE workspace_id = ?
        ORDER BY id
    """, (workspace_id,))

    rows = cursor.fetchall()

    conn.close()

    return [
        {
            "id": row[0],
            "name": row[1],
            "is_completed": bool(row[2]),
            "is_cancelled": bool(row[3])
        }
        for row in rows
    ]


def get_all_priorities(workspace_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, name
        FROM priorities
        WHERE workspace_id = ?
        ORDER BY id
    """, (workspace_id,))

    rows = cursor.fetchall()

    conn.close()

    return [
        {
            "id": row[0],
            "name": row[1]
        }
        for row in rows
    ]


def get_all_categories(workspace_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, name
        FROM categories
        WHERE workspace_id = ?
        ORDER BY id
    """, (workspace_id,))

    rows = cursor.fetchall()

    conn.close()

    return [
        {
            "id": row[0],
            "name": row[1]
        }
        for row in rows
    ]


def get_all_groups(workspace_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, name, type
        FROM groups
        WHERE workspace_id = ?
        ORDER BY id
    """, (workspace_id,))

    rows = cursor.fetchall()

    conn.close()

    return [
        {
            "id": row[0],
            "name": row[1],
            "type": row[2]
        }
        for row in rows
    ]

def get_all_workspaces():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, name, type
        FROM workspaces
        ORDER BY id
    """)

    rows = cursor.fetchall()

    conn.close()

    return [
        {
            "id": row[0],
            "name": row[1],
            "type": row[2]
        }
        for row in rows
    ]