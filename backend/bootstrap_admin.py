"""
One-off bootstrap script — run once to make yourself admin everywhere.
Not part of the app; delete after running.

Usage: python bootstrap_admin.py you@example.com
"""
import sys
from crud.users import get_user_by_email, add_workspace_member
from crud.tasks import get_all_workspaces

if len(sys.argv) != 2:
    print("Usage: python bootstrap_admin.py you@example.com")
    sys.exit(1)

email = sys.argv[1]

user = get_user_by_email(email)

if user is None:
    print(f"No account found for {email} — sign up first via POST /auth/signup")
    sys.exit(1)

workspaces = get_all_workspaces()

if not workspaces:
    print("No workspaces exist yet.")
    sys.exit(0)

for ws in workspaces:
    add_workspace_member(ws["id"], user["id"], role="admin")
    print(f"  admin -> {ws['name']} (id={ws['id']})")

print(f"\nDone. {email} is now admin in {len(workspaces)} workspace(s).")
