from __future__ import annotations

from enum import StrEnum
from pathlib import Path
from pydantic import BaseModel, Field, HttpUrl


class SourceType(StrEnum):
    OFFICIAL = "OFFICIAL"
    SECONDARY = "SECONDARY"
    USER_PROVIDED = "USER_PROVIDED"


class AcquisitionStatus(StrEnum):
    DISCOVERED = "DISCOVERED"
    DOWNLOADED = "DOWNLOADED"
    EXTRACTED = "EXTRACTED"
    REVIEWED = "REVIEWED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class RecurrenceType(StrEnum):
    EXACT_REPEAT = "EXACT_REPEAT"
    NEAR_DUPLICATE = "NEAR_DUPLICATE"
    SAME_PROBLEM_PATTERN = "SAME_PROBLEM_PATTERN"
    RECURRING_TOPIC = "RECURRING_TOPIC"
    EXAM_BLUEPRINT_PATTERN = "EXAM_BLUEPRINT_PATTERN"


class RecurrenceStatus(StrEnum):
    UNVERIFIED = "UNVERIFIED"
    CANDIDATE = "CANDIDATE"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"


class ExamSource(BaseModel):
    source_id: str
    institution: str
    modality: str
    year: int
    period: str | None = None
    title: str
    source_type: SourceType
    url: HttpUrl | None = None
    local_path: str | None = None
    document_sha256: str | None = None
    acquisition_status: AcquisitionStatus = AcquisitionStatus.DISCOVERED
    consulted_at: str | None = None
    usage_notes: str | None = None


class ExtractedQuestion(BaseModel):
    source_id: str
    page: int
    original_number: int | None = None
    raw_text: str
    normalized_text: str
    options: list[str] = Field(default_factory=list)
    extraction_method: str
    ocr_confidence: float | None = Field(default=None, ge=0, le=1)
    review_status: str = "OCR_REVIEW"


class RecurrenceCandidate(BaseModel):
    question_a: str
    question_b: str
    source_a: str
    source_b: str
    recurrence_type: RecurrenceType
    lexical_similarity: float = Field(ge=0, le=100)
    exact_hash_match: bool
    review_status: RecurrenceStatus = RecurrenceStatus.CANDIDATE
    evidence_note: str


def resolve_local_path(value: str) -> Path:
    path = Path(value).expanduser().resolve()
    if not path.is_file():
        raise FileNotFoundError(f"Exam document not found: {path}")
    return path
