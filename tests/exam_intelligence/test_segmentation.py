from exam_intelligence.extractors import segment_page_questions
from exam_intelligence.models import ExtractedQuestion


def test_segment_numbered_questions_and_options_without_inventing_key():
    page = ExtractedQuestion(
        source_id="UNSM-2026-I", page=2,
        raw_text="1. ¿Cuánto es 2 + 2?\nA) 3\nB) 4\nC) 5\n\n2. ¿Cuánto es 3 + 3?\nA) 5\nB) 6\nC) 7",
        normalized_text="",
        extraction_method="test"
    )
    questions = segment_page_questions(page)
    assert [item.original_number for item in questions] == [1, 2]
    assert questions[0].options == ["A. 3", "B. 4", "C. 5"]
    assert questions[1].options == ["A. 5", "B. 6", "C. 7"]
    assert all(item.review_status == "SEGMENTATION_REVIEW" for item in questions)
