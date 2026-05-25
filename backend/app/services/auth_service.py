from fastapi import Depends, HTTPException, status
from typing import Tuple

# Simple in‑memory whitelist of verified emails and associated roles
VERIFY_WHITELIST = {
    "myselfyfae@gmail.com": "super_admin",
    # Add other demo users as needed
    # e.g., "teacher1@example.com": "teacher",
    # "parent1@example.com": "parent",
    # "kid1@example.com": "kid",
}

def get_current_user(x_user_email: str = None) -> Tuple[str, str]:
    """Very lightweight auth dependency.
    Expects the request to include an ``X-User-Email`` header.
    Returns a tuple ``(email, role)`` if the email is in the whitelist.
    Raises 401 otherwise.
    """
    if not x_user_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-User-Email header",
        )
    role = VERIFY_WHITELIST.get(x_user_email)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User not authorized",
        )
    # Return a minimal user dict for downstream services
    return {"sub": x_user_email, "role": role}
