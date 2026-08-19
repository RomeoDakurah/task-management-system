import sqlite3


conn = sqlite3.connect("database.db")
cursor = conn.cursor()


# ========================================
# Create additional workspaces
# ========================================

cursor.execute("""
INSERT INTO workspaces (name, type)
VALUES ('Business Operations', 'business')
""")

business_workspace_id = cursor.lastrowid


cursor.execute("""
INSERT INTO workspaces (name, type)
VALUES ('Municipal Services', 'municipal')
""")

municipal_workspace_id = cursor.lastrowid


# ========================================
# Add workspace_id to configuration tables
# ========================================

cursor.execute("""
ALTER TABLE statuses
ADD COLUMN workspace_id INTEGER
""")

cursor.execute("""
ALTER TABLE priorities
ADD COLUMN workspace_id INTEGER
""")

cursor.execute("""
ALTER TABLE categories
ADD COLUMN workspace_id INTEGER
""")

cursor.execute("""
ALTER TABLE groups
ADD COLUMN workspace_id INTEGER
""")


# ========================================
# Assign existing configuration to Personal
# ========================================

cursor.execute("""
UPDATE statuses
SET workspace_id = 1
WHERE workspace_id IS NULL
""")

cursor.execute("""
UPDATE priorities
SET workspace_id = 1
WHERE workspace_id IS NULL
""")

cursor.execute("""
UPDATE categories
SET workspace_id = 1
WHERE workspace_id IS NULL
""")

cursor.execute("""
UPDATE groups
SET workspace_id = 1
WHERE workspace_id IS NULL
""")

cursor.execute("""
UPDATE tasks
SET workspace_id = 1
WHERE workspace_id IS NULL
""")


# ========================================
# PERSONAL
# ========================================

# Existing Personal configuration remains assigned to workspace 1.


# ========================================
# BUSINESS OPERATIONS
# ========================================

business_statuses = [
    ("New", 0, 0),
    ("In Progress", 0, 0),
    ("Blocked", 0, 0),
    ("Completed", 1, 0),
    ("Cancelled", 0, 1)
]

for name, is_completed, is_cancelled in business_statuses:
    cursor.execute("""
        INSERT INTO statuses
        (name, is_completed, is_cancelled, workspace_id)
        VALUES (?, ?, ?, ?)
    """, (
        name,
        is_completed,
        is_cancelled,
        business_workspace_id
    ))


business_categories = [
    "Operations",
    "Customers",
    "Finance",
    "Maintenance",
    "Projects"
]

for name in business_categories:
    cursor.execute("""
        INSERT INTO categories
        (name, workspace_id)
        VALUES (?, ?)
    """, (
        name,
        business_workspace_id
    ))


business_priorities = [
    "Low",
    "Normal",
    "High",
    "Urgent"
]

for name in business_priorities:
    cursor.execute("""
        INSERT INTO priorities
        (name, workspace_id)
        VALUES (?, ?)
    """, (
        name,
        business_workspace_id
    ))


# ========================================
# MUNICIPAL SERVICES
# ========================================

municipal_statuses = [
    ("Submitted", 0, 0),
    ("Under Review", 0, 0),
    ("Assigned", 0, 0),
    ("In Progress", 0, 0),
    ("Resolved", 1, 0),
    ("Cancelled", 0, 1)
]

for name, is_completed, is_cancelled in municipal_statuses:
    cursor.execute("""
        INSERT INTO statuses
        (name, is_completed, is_cancelled, workspace_id)
        VALUES (?, ?, ?, ?)
    """, (
        name,
        is_completed,
        is_cancelled,
        municipal_workspace_id
    ))


municipal_categories = [
    "Infrastructure",
    "Roads",
    "Waste",
    "Parks",
    "Public Services"
]

for name in municipal_categories:
    cursor.execute("""
        INSERT INTO categories
        (name, workspace_id)
        VALUES (?, ?)
    """, (
        name,
        municipal_workspace_id
    ))


municipal_priorities = [
    "Low",
    "Normal",
    "High",
    "Urgent"
]

for name in municipal_priorities:
    cursor.execute("""
        INSERT INTO priorities
        (name, workspace_id)
        VALUES (?, ?)
    """, (
        name,
        municipal_workspace_id
    ))


# ========================================
# Commit
# ========================================

conn.commit()
conn.close()

print("Workspace configuration migration completed")