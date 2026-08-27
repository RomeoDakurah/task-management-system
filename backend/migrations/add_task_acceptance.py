"""
Adds explicit task acceptance tracking.

Run once:
    python migrations/add_task_acceptance.py
"""

import sqlite3

conn = sqlite3.connect("database.db")
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(tasks)")
existing_cols = {row[1] for row in cursor.fetchall()}

if "accepted_at" not in existing_cols:
    cursor.execute(
        "ALTER TABLE tasks ADD COLUMN accepted_at TEXT"
    )

conn.commit()
conn.close()

print("Task acceptance migration completed")
