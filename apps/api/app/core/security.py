from __future__ import annotations

import base64
import hashlib
import hmac
import json
import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from uuid import UUID


PASSWORD_HASH_NAME = "pbkdf2_sha256"
PASSWORD_ITERATIONS = 600_000


class SecurityError(ValueError):
    """Erreur de sécurité liée au token ou au mot de passe."""


@dataclass(frozen=True)
class AccessTokenPayload:
    subject: UUID
    expires_at: datetime


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _b64_encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def _b64_decode(encoded: str) -> bytes:
    padding = "=" * (-len(encoded) % 4)
    return base64.urlsafe_b64decode(f"{encoded}{padding}")


def normalize_email(value: str) -> str:
    return value.strip().lower()


def hash_password(password: str) -> str:
    if len(password) < 8:
        raise SecurityError("Le mot de passe doit contenir au moins 8 caracteres.")

    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        PASSWORD_ITERATIONS,
    )
    return f"{PASSWORD_HASH_NAME}${PASSWORD_ITERATIONS}${_b64_encode(salt)}${_b64_encode(digest)}"


def verify_password(password: str, stored_hash: str | None) -> bool:
    if not stored_hash:
        return False

    try:
        algorithm, iterations, salt, digest = stored_hash.split("$", 3)
        if algorithm != PASSWORD_HASH_NAME:
            return False
        computed = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            _b64_decode(salt),
            int(iterations),
        )
    except (TypeError, ValueError):
        return False

    return hmac.compare_digest(_b64_encode(computed), digest)


def create_access_token(subject: UUID, secret: str, ttl_minutes: int) -> tuple[str, datetime]:
    expires_at = _now_utc() + timedelta(minutes=ttl_minutes)
    body = _b64_encode(
        json.dumps(
            {"sub": str(subject), "exp": int(expires_at.timestamp())},
            separators=(",", ":"),
        ).encode("utf-8")
    )
    signature = _b64_encode(hmac.new(secret.encode("utf-8"), body.encode("ascii"), hashlib.sha256).digest())
    return f"{body}.{signature}", expires_at


def decode_access_token(token: str, secret: str) -> AccessTokenPayload:
    try:
        body, signature = token.split(".", 1)
    except ValueError as exc:
        raise SecurityError("Format de token invalide.") from exc

    expected_signature = _b64_encode(
        hmac.new(secret.encode("utf-8"), body.encode("ascii"), hashlib.sha256).digest()
    )
    if not hmac.compare_digest(signature, expected_signature):
        raise SecurityError("Signature de token invalide.")

    try:
        payload = json.loads(_b64_decode(body))
        expires_at = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        subject = UUID(payload["sub"])
    except (KeyError, ValueError, json.JSONDecodeError) as exc:
        raise SecurityError("Payload de token invalide.") from exc

    if expires_at <= _now_utc():
        raise SecurityError("Token expire.")

    return AccessTokenPayload(subject=subject, expires_at=expires_at)
