"""
Rebuilds the database from scratch and fills it with demo data:
4 workspaces (Personal, Business Operations, Municipal Services,
University), a roster of users with admin/user roles in each, and a
realistic mix of tasks across statuses/priorities/categories/groups.

This is the ONLY setup script you need to run. It doesn't assume
anything about prior state — if database.db doesn't exist, is empty,
or was just deleted (e.g. because it was excluded from a zip export),
running this recreates it identically every time:

    python seed.py

There's no seed data preserved between runs and no "add to what's
already there" logic — every run wipes database.db and starts over.
That's intentional: this script is for demo/dev data only. If the app
ever holds real data you need to keep, don't run this against that
database — see the note at the bottom of this file.

All seeded accounts share one password: Password123!
(demo-only, obviously — change or remove these before anything here is
public)
"""
import os
from datetime import datetime, timedelta

from database import DATABASE_PATH, create_tables, get_connection

try:
    from auth import hash_password
except ImportError:
    # Falls back to the stdlib `crypt` module's bcrypt (Blowfish) support
    # if the `bcrypt` package isn't installed in this environment. It
    # produces a standard $2b$ hash, identical in format to what the
    # `bcrypt` package itself generates, so it verifies correctly
    # against auth.verify_password() wherever this actually gets run.
    import crypt

    def hash_password(password: str) -> str:
        salt = crypt.mksalt(crypt.METHOD_BLOWFISH, rounds=4096)
        return crypt.crypt(password, salt)

DEMO_PASSWORD = "Password123!"
TODAY = datetime.now()


def iso(dt):
    return dt.strftime("%Y-%m-%d %H:%M:%S")


def days(offset):
    """A timestamp `offset` days from now, as an ISO string."""
    return iso(TODAY + timedelta(days=offset))


# ======================================================================
# Small insert helpers — thin wrappers so the seed data below reads as
# data, not as repeated SQL boilerplate.
# ======================================================================

def add_user(cur, name, email):
    cur.execute(
        "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
        (name, email, hash_password(DEMO_PASSWORD))
    )
    return cur.lastrowid


def add_workspace(cur, name, type_):
    cur.execute(
        "INSERT INTO workspaces (name, type) VALUES (?, ?)",
        (name, type_)
    )
    return cur.lastrowid


def add_member(cur, workspace_id, user_id, role):
    cur.execute(
        "INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, ?)",
        (workspace_id, user_id, role)
    )


def add_status(cur, workspace_id, name, is_completed=0, is_cancelled=0):
    cur.execute(
        """
        INSERT INTO statuses (workspace_id, name, is_completed, is_cancelled)
        VALUES (?, ?, ?, ?)
        """,
        (workspace_id, name, is_completed, is_cancelled)
    )
    return cur.lastrowid


def add_priority(cur, workspace_id, name):
    cur.execute(
        "INSERT INTO priorities (workspace_id, name) VALUES (?, ?)",
        (workspace_id, name)
    )
    return cur.lastrowid


def add_category(cur, workspace_id, name):
    cur.execute(
        "INSERT INTO categories (workspace_id, name) VALUES (?, ?)",
        (workspace_id, name)
    )
    return cur.lastrowid


def add_group(cur, workspace_id, name, type_):
    cur.execute(
        "INSERT INTO groups (workspace_id, name, type) VALUES (?, ?, ?)",
        (workspace_id, name, type_)
    )
    return cur.lastrowid


def add_task(cur, *, workspace_id, title, description, status_id, priority_id,
             category_id, group_id, created_by, assigned_to=None,
             due_date=None, created_at=None, completed_at=None, accepted_at=None):
    cur.execute(
        """
        INSERT INTO tasks (
            workspace_id, title, description, status_id, priority_id,
            category_id, group_id, created_at, due_date, completed_at,
            accepted_at, created_by, assigned_to
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            workspace_id, title, description, status_id, priority_id,
            category_id, group_id, created_at or days(0), due_date,
            completed_at, accepted_at, created_by, assigned_to
        )
    )


# ======================================================================
# Seed
# ======================================================================

def reset_database():
    """Delete the existing DB file (if any) and recreate the schema."""
    if os.path.exists(DATABASE_PATH):
        os.remove(DATABASE_PATH)
    create_tables()


def seed_users(cur):
    users = {}
    users["romeo"] = add_user(cur, "Romeo", "rdakurah1@gmail.com")
    users["demo_user"] = add_user(cur, "User", "user@example.com")

    users["prof_chen"] = add_user(cur, "Dr. Sarah Chen", "s.chen@university.edu")
    users["omar"] = add_user(cur, "Omar Hassan", "omar.hassan@university.edu")
    users["mia"] = add_user(cur, "Mia Torres", "mia.torres@university.edu")

    users["ops_manager"] = add_user(cur, "Jordan Blake", "jordan.blake@example.com")
    users["ops_alex"] = add_user(cur, "Alex Rivera", "alex.rivera@example.com")
    users["ops_priya"] = add_user(cur, "Priya Nair", "priya.nair@example.com")

    users["city_director"] = add_user(cur, "Denise Coleman", "d.coleman@city.gov")
    users["city_crew1"] = add_user(cur, "Marcus Webb", "m.webb@city.gov")
    users["city_crew2"] = add_user(cur, "Lena Ortiz", "l.ortiz@city.gov")
    return users


def seed_personal(cur, u):
    ws = add_workspace(cur, "Personal", "custom")
    add_member(cur, ws, u["romeo"], "admin")
    add_member(cur, ws, u["demo_user"], "user")

    st_open = add_status(cur, ws, "Open")
    st_progress = add_status(cur, ws, "In Progress")
    st_closed = add_status(cur, ws, "Closed", is_completed=1)
    st_cancelled = add_status(cur, ws, "Cancelled", is_cancelled=1)

    pr_high = add_priority(cur, ws, "High")
    pr_med = add_priority(cur, ws, "Medium")
    pr_low = add_priority(cur, ws, "Low")

    cat_home = add_category(cur, ws, "Home")
    cat_groceries = add_category(cur, ws, "Groceries")
    cat_health = add_category(cur, ws, "Health")
    cat_finance = add_category(cur, ws, "Finance")
    cat_learning = add_category(cur, ws, "Learning")

    grp_me = add_group(cur, ws, "Me", "custom")
    grp_family = add_group(cur, ws, "Family", "custom")

    tasks = [
        dict(title="Renew car insurance", description="Policy expires end of month, compare two quotes first.",
             status_id=st_open, priority_id=pr_high, category_id=cat_finance, group_id=grp_me,
             due_date=days(5), created_by=u["romeo"], assigned_to=u["romeo"]),
        dict(title="Weekly grocery run", description="Milk, eggs, bread, produce for the week.",
             status_id=st_progress, priority_id=pr_med, category_id=cat_groceries, group_id=grp_family,
             due_date=days(1), created_by=u["romeo"], assigned_to=u["demo_user"], accepted_at=days(-1)),
        dict(title="Book annual physical", description="Call the clinic and schedule the yearly checkup.",
             status_id=st_open, priority_id=pr_med, category_id=cat_health, group_id=grp_me,
             due_date=days(10), created_by=u["romeo"], assigned_to=u["romeo"]),
        dict(title="Fix leaking kitchen faucet", description="Replace the washer, water's dripping overnight.",
             status_id=st_progress, priority_id=pr_high, category_id=cat_home, group_id=grp_family,
             due_date=days(2), created_by=u["romeo"], assigned_to=u["demo_user"], accepted_at=days(-1)),
        dict(title="Finish online SQL course, module 4", description="Joins and subqueries module.",
             status_id=st_open, priority_id=pr_low, category_id=cat_learning, group_id=grp_me,
             due_date=days(14), created_by=u["romeo"], assigned_to=u["romeo"]),
        dict(title="Pay quarterly estimated taxes", description="Submit via the usual portal before the deadline.",
             status_id=st_closed, priority_id=pr_high, category_id=cat_finance, group_id=grp_me,
             due_date=days(-3), created_by=u["romeo"], assigned_to=u["romeo"],
             completed_at=days(-4), created_at=days(-10)),
        dict(title="Cancel unused gym membership", description="No longer going, cancel before next billing cycle.",
             status_id=st_cancelled, priority_id=pr_low, category_id=cat_finance, group_id=grp_me,
             due_date=days(-1), created_by=u["romeo"], assigned_to=u["romeo"], created_at=days(-8)),
        dict(title="Plan family weekend trip", description="Pick a destination, book a place to stay.",
             status_id=st_open, priority_id=pr_low, category_id=cat_home, group_id=grp_family,
             due_date=days(20), created_by=u["romeo"], assigned_to=u["demo_user"]),
        dict(title="Deep clean the garage", description="Sort, donate, and organize before winter.",
             status_id=st_closed, priority_id=pr_low, category_id=cat_home, group_id=grp_family,
             due_date=days(-7), created_by=u["romeo"], assigned_to=u["demo_user"],
             completed_at=days(-6), accepted_at=days(-9), created_at=days(-12)),
        dict(title="Demo task", description="A starter task to poke around with.",
             status_id=st_open, priority_id=pr_high, category_id=cat_home, group_id=grp_me,
             due_date=days(2), created_by=u["romeo"], assigned_to=u["demo_user"]),
    ]
    for t in tasks:
        add_task(cur, workspace_id=ws, **t)

    return ws


def seed_business(cur, u):
    ws = add_workspace(cur, "Business Operations", "business")
    add_member(cur, ws, u["romeo"], "admin")
    add_member(cur, ws, u["ops_manager"], "admin")
    add_member(cur, ws, u["ops_alex"], "user")
    add_member(cur, ws, u["ops_priya"], "user")

    st_new = add_status(cur, ws, "New")
    st_progress = add_status(cur, ws, "In Progress")
    st_blocked = add_status(cur, ws, "Blocked")
    st_completed = add_status(cur, ws, "Completed", is_completed=1)
    st_cancelled = add_status(cur, ws, "Cancelled", is_cancelled=1)

    pr_low = add_priority(cur, ws, "Low")
    pr_normal = add_priority(cur, ws, "Normal")
    pr_high = add_priority(cur, ws, "High")
    pr_urgent = add_priority(cur, ws, "Urgent")

    cat_ops = add_category(cur, ws, "Operations")
    cat_customers = add_category(cur, ws, "Customers")
    cat_finance = add_category(cur, ws, "Finance")
    cat_maintenance = add_category(cur, ws, "Maintenance")
    cat_projects = add_category(cur, ws, "Projects")

    grp_sales = add_group(cur, ws, "Sales", "department")
    grp_engineering = add_group(cur, ws, "Engineering", "department")
    grp_support = add_group(cur, ws, "Support", "department")
    grp_finance = add_group(cur, ws, "Finance", "department")

    tasks = [
        dict(title="Q3 client renewal outreach", description="Reach out to accounts renewing in the next 30 days.",
             status_id=st_progress, priority_id=pr_high, category_id=cat_customers, group_id=grp_sales,
             due_date=days(7), created_by=u["ops_manager"], assigned_to=u["ops_alex"], accepted_at=days(-2)),
        dict(title="Fix checkout timeout bug", description="Payment step times out under load, ticket #4821.",
             status_id=st_blocked, priority_id=pr_urgent, category_id=cat_ops, group_id=grp_engineering,
             due_date=days(2), created_by=u["ops_manager"], assigned_to=u["ops_priya"], accepted_at=days(-1)),
        dict(title="Prepare monthly financial report", description="Consolidate July numbers for leadership review.",
             status_id=st_new, priority_id=pr_normal, category_id=cat_finance, group_id=grp_finance,
             due_date=days(4), created_by=u["ops_manager"]),
        dict(title="Onboard new support hire", description="Set up accounts, assign shadowing schedule.",
             status_id=st_completed, priority_id=pr_normal, category_id=cat_ops, group_id=grp_support,
             due_date=days(-5), created_by=u["ops_manager"], assigned_to=u["ops_alex"],
             completed_at=days(-4), accepted_at=days(-9), created_at=days(-10)),
        dict(title="Vendor contract renewal — office supplies", description="Renew or re-bid, current contract expires soon.",
             status_id=st_cancelled, priority_id=pr_low, category_id=cat_finance, group_id=grp_finance,
             due_date=days(-2), created_by=u["ops_manager"], created_at=days(-9)),
        dict(title="Server maintenance window", description="Apply patches to production during low-traffic hours.",
             status_id=st_new, priority_id=pr_high, category_id=cat_maintenance, group_id=grp_engineering,
             due_date=days(3), created_by=u["ops_manager"], assigned_to=u["ops_priya"]),
        dict(title="Draft new customer onboarding flow", description="Redesign the welcome-email + setup sequence.",
             status_id=st_progress, priority_id=pr_normal, category_id=cat_projects, group_id=grp_sales,
             due_date=days(12), created_by=u["ops_manager"], assigned_to=u["ops_alex"], accepted_at=days(-3)),
    ]
    for t in tasks:
        add_task(cur, workspace_id=ws, **t)

    return ws


def seed_municipal(cur, u):
    ws = add_workspace(cur, "Municipal Services", "municipal")
    add_member(cur, ws, u["romeo"], "admin")
    add_member(cur, ws, u["city_director"], "admin")
    add_member(cur, ws, u["city_crew1"], "user")
    add_member(cur, ws, u["city_crew2"], "user")

    st_submitted = add_status(cur, ws, "Submitted")
    st_review = add_status(cur, ws, "Under Review")
    st_assigned = add_status(cur, ws, "Assigned")
    st_progress = add_status(cur, ws, "In Progress")
    st_resolved = add_status(cur, ws, "Resolved", is_completed=1)
    st_cancelled = add_status(cur, ws, "Cancelled", is_cancelled=1)

    pr_low = add_priority(cur, ws, "Low")
    pr_normal = add_priority(cur, ws, "Normal")
    pr_high = add_priority(cur, ws, "High")
    pr_urgent = add_priority(cur, ws, "Urgent")

    cat_infrastructure = add_category(cur, ws, "Infrastructure")
    cat_roads = add_category(cur, ws, "Roads")
    cat_waste = add_category(cur, ws, "Waste")
    cat_parks = add_category(cur, ws, "Parks")
    cat_public_services = add_category(cur, ws, "Public Services")

    grp_public_works = add_group(cur, ws, "Public Works", "department")
    grp_parks_rec = add_group(cur, ws, "Parks & Recreation", "department")
    grp_water_util = add_group(cur, ws, "Water & Utilities", "department")
    grp_sanitation = add_group(cur, ws, "Sanitation", "department")

    tasks = [
        dict(title="Pothole repair — Elm Street", description="Resident-reported pothole near the school crossing.",
             status_id=st_assigned, priority_id=pr_high, category_id=cat_roads, group_id=grp_public_works,
             due_date=days(2), created_by=u["city_director"], assigned_to=u["city_crew1"], accepted_at=days(-1)),
        dict(title="Water main break — 5th & Main", description="Reported low pressure and surface water pooling.",
             status_id=st_progress, priority_id=pr_urgent, category_id=cat_infrastructure, group_id=grp_water_util,
             due_date=days(1), created_by=u["city_director"], assigned_to=u["city_crew2"], accepted_at=days(0)),
        dict(title="Downed tree limb — Riverside Park", description="Storm damage blocking the east walking trail.",
             status_id=st_resolved, priority_id=pr_normal, category_id=cat_parks, group_id=grp_parks_rec,
             due_date=days(-3), created_by=u["city_director"], assigned_to=u["city_crew1"],
             completed_at=days(-3), accepted_at=days(-4), created_at=days(-5)),
        dict(title="Missed recycling pickup — Oakwood subdivision", description="Multiple residents reported no pickup this week.",
             status_id=st_review, priority_id=pr_normal, category_id=cat_waste, group_id=grp_sanitation,
             due_date=days(3), created_by=u["city_director"]),
        dict(title="Streetlight outage — Corner of 3rd & Pine", description="Reported out for a week, safety concern at night.",
             status_id=st_submitted, priority_id=pr_high, category_id=cat_infrastructure, group_id=grp_public_works,
             due_date=days(4), created_by=u["city_director"]),
        dict(title="Graffiti removal — Community Center wall", description="Reported by facility staff, needs pressure wash + paint.",
             status_id=st_cancelled, priority_id=pr_low, category_id=cat_public_services, group_id=grp_parks_rec,
             due_date=days(-1), created_by=u["city_director"], created_at=days(-6)),
        dict(title="Playground equipment inspection", description="Quarterly safety inspection, Lincoln Park.",
             status_id=st_assigned, priority_id=pr_normal, category_id=cat_parks, group_id=grp_parks_rec,
             due_date=days(6), created_by=u["city_director"], assigned_to=u["city_crew2"], accepted_at=days(-1)),
        dict(title="Sewer backup — Maple Ave residence", description="Resident reports backup into basement, urgent.",
             status_id=st_progress, priority_id=pr_urgent, category_id=cat_infrastructure, group_id=grp_water_util,
             due_date=days(0), created_by=u["city_director"], assigned_to=u["city_crew1"], accepted_at=days(0)),
    ]
    for t in tasks:
        add_task(cur, workspace_id=ws, **t)

    return ws


def seed_university(cur, u):
    ws = add_workspace(cur, "University", "education")
    add_member(cur, ws, u["romeo"], "admin")
    add_member(cur, ws, u["prof_chen"], "admin")
    add_member(cur, ws, u["omar"], "user")
    add_member(cur, ws, u["mia"], "user")

    st_not_started = add_status(cur, ws, "Not Started")
    st_progress = add_status(cur, ws, "In Progress")
    st_submitted = add_status(cur, ws, "Submitted")
    st_graded = add_status(cur, ws, "Graded", is_completed=1)
    st_cancelled = add_status(cur, ws, "Cancelled", is_cancelled=1)

    pr_low = add_priority(cur, ws, "Low")
    pr_med = add_priority(cur, ws, "Medium")
    pr_high = add_priority(cur, ws, "High")
    pr_critical = add_priority(cur, ws, "Critical")

    cat_assignment = add_category(cur, ws, "Assignment")
    cat_exam = add_category(cur, ws, "Exam")
    cat_reading = add_category(cur, ws, "Reading")
    cat_project = add_category(cur, ws, "Project")
    cat_lab = add_category(cur, ws, "Lab")

    course_cs = add_group(cur, ws, "CS 301: Algorithms", "course")
    course_math = add_group(cur, ws, "MATH 210: Linear Algebra", "course")
    course_engl = add_group(cur, ws, "ENGL 105: Academic Writing", "course")
    course_bio = add_group(cur, ws, "BIOL 150: Intro Biology", "course")

    tasks = [
        dict(title="Problem Set 4 — Dynamic Programming", description="Cover memoization and the knapsack variants from lecture 12.",
             status_id=st_progress, priority_id=pr_high, category_id=cat_assignment, group_id=course_cs,
             due_date=days(3), created_by=u["prof_chen"], assigned_to=u["omar"], accepted_at=days(-1)),
        dict(title="Midterm Exam", description="Covers weeks 1–7: sorting, graphs, greedy algorithms, DP.",
             status_id=st_not_started, priority_id=pr_critical, category_id=cat_exam, group_id=course_cs,
             due_date=days(9), created_by=u["prof_chen"], assigned_to=u["omar"]),
        dict(title="Reading: Chapter 5, Eigenvalues", description="Read and complete the self-check questions.",
             status_id=st_not_started, priority_id=pr_low, category_id=cat_reading, group_id=course_math,
             due_date=days(2), created_by=u["prof_chen"], assigned_to=u["mia"]),
        dict(title="Problem Set 3 — Vector Spaces", description="Sections 3.1–3.4, show all work.",
             status_id=st_graded, priority_id=pr_med, category_id=cat_assignment, group_id=course_math,
             due_date=days(-6), created_by=u["prof_chen"], assigned_to=u["mia"],
             completed_at=days(-5), accepted_at=days(-10), created_at=days(-12)),
        dict(title="Essay draft — Rhetorical Analysis", description="First draft, 1200 words, MLA format.",
             status_id=st_submitted, priority_id=pr_med, category_id=cat_assignment, group_id=course_engl,
             due_date=days(-1), created_by=u["prof_chen"], assigned_to=u["omar"], accepted_at=days(-4)),
        dict(title="Peer review workshop prep", description="Bring two printed copies of your draft to class.",
             status_id=st_cancelled, priority_id=pr_low, category_id=cat_project, group_id=course_engl,
             due_date=days(-2), created_by=u["prof_chen"], assigned_to=u["mia"], created_at=days(-7)),
        dict(title="Lab Report — Cell Structure Microscopy", description="Write up observations from Tuesday's lab session.",
             status_id=st_progress, priority_id=pr_high, category_id=cat_lab, group_id=course_bio,
             due_date=days(4), created_by=u["prof_chen"], assigned_to=u["mia"], accepted_at=days(-2)),
        dict(title="Group Project Proposal — Ecosystem Study", description="One-page proposal outlining research question and methods.",
             status_id=st_not_started, priority_id=pr_med, category_id=cat_project, group_id=course_bio,
             due_date=days(11), created_by=u["prof_chen"], assigned_to=u["omar"]),
        dict(title="Final Project — Pathfinding Visualizer", description="Implement and present a graph search visualizer.",
             status_id=st_not_started, priority_id=pr_high, category_id=cat_project, group_id=course_cs,
             due_date=days(25), created_by=u["prof_chen"], assigned_to=u["omar"]),
    ]
    for t in tasks:
        add_task(cur, workspace_id=ws, **t)

    return ws


def main():
    reset_database()
    conn = get_connection()
    cur = conn.cursor()

    u = seed_users(cur)
    seed_personal(cur, u)
    seed_business(cur, u)
    seed_municipal(cur, u)
    seed_university(cur, u)

    conn.commit()
    conn.close()

    print(f"Database rebuilt at {DATABASE_PATH}\n")
    print(f"All seeded accounts share the password: {DEMO_PASSWORD}\n")
    print("""Personal            rdakurah1@gmail.com (admin), user@example.com (user)
Business Operations  jordan.blake@example.com (admin), alex.rivera@example.com,
                      priya.nair@example.com (user)
Municipal Services    d.coleman@city.gov (admin), m.webb@city.gov, l.ortiz@city.gov (user)
University            s.chen@university.edu (admin), omar.hassan@university.edu,
                      mia.torres@university.edu (user)

Romeo (rdakurah1@gmail.com) is an admin in every workspace above.""")


if __name__ == "__main__":
    main()

# ----------------------------------------------------------------------
# On migrations: this project currently has no persistent/production
# data, so the schema in database.py is edited directly and this script
# rebuilds the database from nothing every time — there's no history to
# preserve. If that stops being true (e.g. this goes live and holds
# real user data), replace this reset-and-reseed approach with a real
# migration tool (e.g. Alembic) *before* making further schema changes,
# so existing data survives a schema update instead of being wiped.
# ----------------------------------------------------------------------
