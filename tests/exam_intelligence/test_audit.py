import json

from exam_intelligence.audit import audit_question_bank


def test_safe_migration_unmarks_unverified_fixed_questions(tmp_path):
    bank = tmp_path / "questions.json"
    bank.write_text(json.dumps([{
        "id": "Q1", "isFija": True, "sourceReference": {"document": "Examen 2024"},
        "rawQuestion": "Pregunta", "options": [{"id": "A"}, {"id": "B"}],
        "correctAnswer": "A"
    }]), encoding="utf-8")
    report = audit_question_bank(bank, apply_safe_migration=True)
    migrated = json.loads(bank.read_text(encoding="utf-8"))[0]
    assert report["safeMigrationsApplied"] == 1
    assert migrated["isFija"] is False
    assert migrated["recurrenceStatus"] == "UNVERIFIED"
