import sqlite3


conn = sqlite3.connect("database.db")
cursor = conn.cursor()

# Create workspaces table
cursor.execute("""
CREATE TABLE IF NOT EXISTS workspaces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL
)
""")

# Create workspace membership table
cursor.execute("""
CREATE TABLE IF NOT EXISTS workspace_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workspace_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',

    FOREIGN KEY(workspace_id)
        REFERENCES workspaces(id),

    FOREIGN KEY(user_id)
        REFERENCES users(id),

    UNIQUE(workspace_id, user_id)
)
""")

# Add workspace_id to existing tasks
cursor.execute("""
ALTER TABLE tasks
ADD COLUMN workspace_id INTEGER
""")

# Create initial workspace
cursor.execute("""
INSERT INTO workspaces (name, type)
VALUES ('Personal', 'personal')
""")

workspace_id = cursor.lastrowid

# Assign all existing tasks to Personal workspace
cursor.execute("""
UPDATE tasks
SET workspace_id = ?
WHERE workspace_id IS NULL
""", (workspace_id,))

conn.commit()
conn.close()

print("Workspace migration completed")