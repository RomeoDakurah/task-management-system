import sqlite3


DATABASE_PATH = "database.db"


def get_connection():
    conn = sqlite3.connect(DATABASE_PATH)

    # Enable foreign key enforcement in SQLite
    conn.execute("PRAGMA foreign_keys = ON")

    return conn


def create_tables():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS statuses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        is_completed INTEGER NOT NULL DEFAULT 0,
        is_cancelled INTEGER NOT NULL DEFAULT 0
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS priorities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status_id INTEGER NOT NULL,
        priority_id INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        completed_at TEXT,
        due_date TEXT,

        category_id INTEGER,
        group_id INTEGER,

        created_by INTEGER,
        assigned_to INTEGER,

        FOREIGN KEY(status_id)
            REFERENCES statuses(id),

        FOREIGN KEY(priority_id)
            REFERENCES priorities(id),

        FOREIGN KEY(category_id)
            REFERENCES categories(id),

        FOREIGN KEY(group_id)
            REFERENCES groups(id),

        FOREIGN KEY(created_by)
            REFERENCES users(id),

        FOREIGN KEY(assigned_to)
            REFERENCES users(id)
    )
    """)

    conn.commit()
    conn.close()


if __name__ == "__main__":
    create_tables()