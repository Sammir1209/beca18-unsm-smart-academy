from __future__ import annotations

import hashlib
import re
import unicodedata


def normalize_text(value: str) -> str:
    value = unicodedata.normalize("NFKC", value).lower()
    value = value.replace("\u00ad", "")
    value = re.sub(r"\s+", " ", value)
    value = re.sub(r"[^\w\s%.,+*/=()√π-]", " ", value, flags=re.UNICODE)
    return re.sub(r"\s+", " ", value).strip()


def content_hash(value: str) -> str:
    return hashlib.sha256(normalize_text(value).encode("utf-8")).hexdigest()


def file_sha256(path: str) -> str:
    digest = hashlib.sha256()
    with open(path, "rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()
