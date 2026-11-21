from __future__ import annotations

from collections import defaultdict
from itertools import combinations

from rapidfuzz.fuzz import ratio

from .models import RecurrenceCandidate, RecurrenceType, RecurrenceStatus
from .normalization import content_hash, normalize_text


def compare_questions(records: list[dict], *, threshold: float = 88.0) -> list[RecurrenceCandidate]:
    """Create candidates only; automated similarity never marks a question verified."""
    candidates: list[RecurrenceCandidate] = []
    for left, right in combinations(records, 2):
        if not left.get("rawQuestion") or not right.get("rawQuestion"):
            continue
        source_a = str(left.get("sourceReference", {}).get("document", ""))
        source_b = str(right.get("sourceReference", {}).get("document", ""))
        if not source_a or not source_b or source_a == source_b:
            continue
        text_a, text_b = normalize_text(left["rawQuestion"]), normalize_text(right["rawQuestion"])
        similarity = float(ratio(text_a, text_b))
        exact = content_hash(text_a) == content_hash(text_b)
        if not exact and similarity < threshold:
            continue
        candidates.append(RecurrenceCandidate(
            question_a=str(left.get("id", "")), question_b=str(right.get("id", "")),
            source_a=source_a, source_b=source_b,
            recurrence_type=RecurrenceType.EXACT_REPEAT if exact else RecurrenceType.NEAR_DUPLICATE,
            lexical_similarity=similarity, exact_hash_match=exact,
            review_status=RecurrenceStatus.CANDIDATE,
            evidence_note="Coincidencia automática pendiente de revisión humana."
        ))
    return candidates


def recurring_topic_report(records: list[dict]) -> list[dict]:
    exams_by_topic: dict[str, set[str]] = defaultdict(set)
    for record in records:
        topic = str(record.get("topic") or "Sin clasificar")
        source = str(record.get("sourceReference", {}).get("document") or "")
        if source:
            exams_by_topic[topic].add(source)
    return [
        {"topic": topic, "exam_count": len(exams), "exams": sorted(exams)}
        for topic, exams in sorted(exams_by_topic.items(), key=lambda item: (-len(item[1]), item[0]))
    ]


def semantic_candidates(records: list[dict], *, threshold: float = 0.78) -> list[dict]:
    """Compare all eligible records semantically; output is always an unverified review queue."""
    try:
        from sentence_transformers import SentenceTransformer
    except ImportError as exc:
        raise RuntimeError("Install the [semantic] extra for semantic comparison.") from exc

    eligible = [
        item for item in records
        if item.get("id") and item.get("rawQuestion")
        and item.get("sourceReference", {}).get("document")
    ]
    if len(eligible) < 2:
        return []
    model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    vectors = model.encode(
        [normalize_text(item["rawQuestion"]) for item in eligible],
        normalize_embeddings=True, show_progress_bar=False
    )
    candidates: list[dict] = []
    for index, left in enumerate(eligible):
        source_left = left["sourceReference"]["document"]
        for right_index in range(index + 1, len(eligible)):
            right = eligible[right_index]
            if source_left == right["sourceReference"]["document"]:
                continue
            similarity = float(vectors[index] @ vectors[right_index])
            if similarity < threshold:
                continue
            candidates.append({
                "question_a": left["id"], "question_b": right["id"],
                "source_a": source_left, "source_b": right["sourceReference"]["document"],
                "recurrence_type": RecurrenceType.NEAR_DUPLICATE.value,
                "semantic_similarity": round(similarity, 4),
                "review_status": RecurrenceStatus.CANDIDATE.value,
                "evidence_note": "Coincidencia semántica automática; requiere comparación y aprobación humana."
            })
    return candidates
