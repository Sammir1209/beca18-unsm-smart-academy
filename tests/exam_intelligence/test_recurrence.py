from exam_intelligence.normalization import content_hash, normalize_text
from exam_intelligence.recurrence import compare_questions


def test_normalization_ignores_case_and_spacing():
    assert normalize_text("  HOLA   Mundo ") == normalize_text("hola mundo")


def test_hash_is_stable_after_normalization():
    assert content_hash("A + B") == content_hash("a   + b")


def test_exact_recurrence_is_candidate_not_verified():
    questions = [
        {"id": "A", "rawQuestion": "¿Cuánto es 2 + 2?", "sourceReference": {"document": "Examen 2024"}},
        {"id": "B", "rawQuestion": "¿Cuánto es 2 + 2?", "sourceReference": {"document": "Examen 2025"}}
    ]
    result = compare_questions(questions)
    assert len(result) == 1
    assert result[0].exact_hash_match is True
    assert result[0].review_status.value == "CANDIDATE"


def test_same_exam_is_not_counted_as_recurrence():
    questions = [
        {"id": "A", "rawQuestion": "Pregunta A", "sourceReference": {"document": "Examen 2024"}},
        {"id": "B", "rawQuestion": "Pregunta A", "sourceReference": {"document": "Examen 2024"}}
    ]
    assert compare_questions(questions) == []
