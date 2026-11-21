from __future__ import annotations

import json
from collections import Counter
from pathlib import Path


def audit_question_bank(path: Path, *, apply_safe_migration: bool = False) -> dict:
    questions = json.loads(path.read_text(encoding="utf-8"))
    findings: list[dict] = []
    migrated = 0
    for item in questions:
        if item.get("isFija") is True and item.get("recurrenceStatus") != "VERIFIED":
            findings.append({"id": item.get("id"), "issue": "FIXED_WITHOUT_RECURRENCE_EVIDENCE"})
            if apply_safe_migration:
                item["isFija"] = False
                item["recurrenceStatus"] = "UNVERIFIED"
                item["recurrenceEvidence"] = []
                migrated += 1
        if not item.get("sourceReference", {}).get("document"):
            findings.append({"id": item.get("id"), "issue": "MISSING_SOURCE_DOCUMENT"})
        if not item.get("rawQuestion"):
            findings.append({"id": item.get("id"), "issue": "MISSING_QUESTION_TEXT"})
        if not item.get("options") or len(item.get("options", [])) < 2:
            findings.append({"id": item.get("id"), "issue": "INCOMPLETE_OPTIONS"})
        if not item.get("correctAnswer"):
            findings.append({"id": item.get("id"), "issue": "MISSING_ANSWER_KEY"})
    if apply_safe_migration:
        path.write_text(json.dumps(questions, ensure_ascii=False, indent=2) + "\\n", encoding="utf-8")
    return {
        "totalQuestions": len(questions),
        "byInstitutionAndType": dict(Counter(f"{q.get('institution')}/{q.get('examType')}" for q in questions)),
        "fixedFlags": sum(bool(q.get("isFija")) for q in questions),
        "findings": findings,
        "safeMigrationsApplied": migrated
    }
