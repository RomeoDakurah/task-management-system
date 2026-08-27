"""
Database connection + schema.

This is the single source of truth for the schema — every table is
created here in its final, current form. There is no incremental
migration history to replay: if you need to change the schema, edit
the CREATE TABLE statements below and re-run `python seed.py`, which
rebuilds the database from scratch.

(If this app ever holds real, non-seed data you care about keeping,
that's the point to introduce a proper migration tool instead of
editing this file directly — see the note at the bottom of seed.py.)
"""
import os
import sqlite3

# Resolve the DB path relative to this file, not the process's current
# working directory. Without this, running the app/scripts from a
# different directory - or under gunicorn on Azure, where the working
# directory isn't guaranteed - silently creates/reads a *different*,
# empty database.db. Override with the DATABASE_PATH env var to point
# at persistent storage in deployment (e.g. an Azure App Service mount).
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.environ.get(
    "DATABASE_PATH",
    os.path.join(BASE_DIR, "database.db")
)


def get_connection():
    conn = sqlite3.connect(DATABASE_PATH)

    # Enable foreign key enforcement in SQLite
    conn.execute("PRAGMA foreign_keys = ON")

    return conn


def create_tables():
    conn = get_connection()
    cursor = conn.cursor()

    # ------------------------------------------------------------
    # Workspaces — each workspace is an isolated set of tasks and
    # configuration (statuses/priorities/categories/groups). A user's
    # access and role are entirely determined by workspace_members.
    # ------------------------------------------------------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS workspaces (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS workspace_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',

        FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
        FOREIGN KEY(user_id) REFERENCES users(id),

        UNIQUE(workspace_id, user_id)
    )
    """)

    # ------------------------------------------------------------
    # Users
    # ------------------------------------------------------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL
    )
    """)

    # ------------------------------------------------------------
    # Per-workspace configuration. Every row here belongs to exactly
    # one workspace (workspace_id is NOT NULL) — there is no such
    # thing as global/shared configuration.
    # ------------------------------------------------------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS statuses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        is_completed INTEGER NOT NULL DEFAULT 0,
        is_cancelled INTEGER NOT NULL DEFAULT 0,

        FOREIGN KEY(workspace_id) REFERENCES workspaces(id)
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS priorities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace_id INTEGER NOT NULL,
        name TEXT NOT NULL,

        FOREIGN KEY(workspace_id) REFERENCES workspaces(id)
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace_id INTEGER NOT NULL,
        name TEXT NOT NULL,

        FOREIGN KEY(workspace_id) REFERENCES workspaces(id)
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,

        FOREIGN KEY(workspace_id) REFERENCES workspaces(id)
    )
    """)

    # ------------------------------------------------------------
    # Tasks
    # ------------------------------------------------------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace_id INTEGER NOT NULL,

        title TEXT NOT NULL,
        description TEXT,

        status_id INTEGER NOT NULL,
        priority_id INTEGER NOT NULL,
        category_id INTEGER,
        group_id INTEGER,

        created_at TEXT NOT NULL,
        due_date TEXT,
        completed_at TEXT,
        accepted_at TEXT,

        created_by INTEGER,
        assigned_to INTEGER,

        FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
        FOREIGN KEY(status_id) REFERENCES statuses(id),
        FOREIGN KEY(priority_id) REFERENCES priorities(id),
        FOREIGN KEY(category_id) REFERENCES categories(id),
        FOREIGN KEY(group_id) REFERENCES groups(id),
        FOREIGN KEY(created_by) REFERENCES users(id),
        FOREIGN KEY(assigned_to) REFERENCES users(id)
    )
    """)

    # ------------------------------------------------------------
    # Indexes — tasks are near-always queried filtered by workspace,
    # and frequently by assignee or status within that workspace.
    # ------------------------------------------------------------
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_tasks_workspace ON tasks(workspace_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_statuses_workspace ON statuses(workspace_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_priorities_workspace ON priorities(workspace_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_categories_workspace ON categories(workspace_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_groups_workspace ON groups(workspace_id)")

    conn.commit()
    conn.close()


if __name__ == "__main__":
    create_tables()
    print(f"Schema ready at {DATABASE_PATH}")
