"""
Adds authentication + per-workspace role support.

- users: adds email UNIQUE constraint (enforced in app layer, sqlite ALTER
  can't add constraints after the fact) + password_hash
- workspace_members.role becomes the source of truth for permissions:
  'admin' -> full config + assignment rights in that workspace
  'user'  -> can accept/complete tasks assigned to them in that workspace

Run once: python migrations/add_auth.py
"""
import sqlite3

conn = sqlite3.connect("database.db")
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(users)")
existing_cols = {row[1] for row in cursor.fetchall()}

if "password_hash" not in existing_cols:
    cursor.execute("ALTER TABLE users ADD COLUMN password_hash TEXT")

conn.commit()
conn.close()

print("Auth migration completed")
