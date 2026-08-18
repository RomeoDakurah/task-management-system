from database import get_connection

conn = get_connection()
cursor = conn.cursor()

# Add users
cursor.execute("""
INSERT INTO users (name, email)
VALUES (?, ?)
""", (
    "Romeo",
    "romeo@example.com"
))


# Add groups
cursor.execute("""
INSERT INTO groups (name, type)
VALUES (?, ?)
""", (
    "Municipal Operations",
    "municipal"
))

cursor.execute("""
INSERT INTO groups (name, type)
VALUES (?, ?)
""", (
    "Personal",
    "personal"
))

cursor.execute("""
INSERT INTO groups (name, type)
VALUES (?, ?)
""", (
    "University",
    "education"
))


# Add categories
cursor.execute("""
INSERT INTO categories (name)
VALUES (?)
""", (
    "Infrastructure",
))

cursor.execute("""
INSERT INTO categories (name)
VALUES (?)
""", (
    "Groceries",
))

cursor.execute("""
INSERT INTO categories (name)
VALUES (?)
""", (
    "Homework",
))

cursor.execute("""
INSERT INTO categories (name)
VALUES (?)
""", (
    "Chores",
))

# Add statuses
cursor.executemany("""
INSERT INTO statuses (name, is_completed, is_cancelled)
VALUES (?, ?, ?)
""", [
    ("Open", 0, 0),
    ("In Progress", 0, 0),
    ("Completed", 1, 0),
    ("Cancelled", 0, 1)
])

# Add priorities
cursor.executemany("""
INSERT INTO priorities (name)
VALUES (?)
""", [
    ("Low",),
    ("Normal",),
    ("High",),
    ("Urgent",)
])

conn.commit()

conn.close()

print("Seed data added successfully")