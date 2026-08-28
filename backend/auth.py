"""
Auth primitives: password hashing + JWT issue/verify.

Requires: pip install bcrypt pyjwt
"""
import os
import sys
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone

# In production, set this via an environment variable and never commit it.
# Padded to 32+ bytes so PyJWT doesn't warn about a short HMAC key even
# in local dev — this is still a well-known, public value; it's not a
# substitute for setting TASKFLOW_SECRET_KEY.
_DEV_DEFAULT_SECRET = "dev-secret-change-me-before-deploying-anywhere-real"
SECRET_KEY = os.environ.get("TASKFLOW_SECRET_KEY", _DEV_DEFAULT_SECRET)

# Fail loudly rather than silently signing tokens with a well-known key.
# ENVIRONMENT should be set to "production" in the Azure App Service
# configuration (Application settings), alongside a real TASKFLOW_SECRET_KEY.
if SECRET_KEY == _DEV_DEFAULT_SECRET and os.environ.get("ENVIRONMENT") == "production":
    sys.exit(
        "TASKFLOW_SECRET_KEY is not set. Refusing to start in production "
        "with the default development secret key."
    )

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(
        password.encode("utf-8"),
        password_hash.encode("utf-8")
    )


def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    payload = {
        "sub": str(user_id),
        "exp": expire
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return int(payload["sub"])
    except jwt.PyJWTError:
        return None
