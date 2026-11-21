from __future__ import annotations

import re
import shutil
import subprocess
import tempfile
from pathlib import Path

import fitz

from .models import ExtractedQuestion
from .normalization import normalize_text


def _extract_with_pymupdf(path: Path, source_id: str) -> list[ExtractedQuestion]:
    document = fitz.open(path)
    items: list[ExtractedQuestion] = []
    for page_index, page in enumerate(document, start=1):
        text = page.get_text("text").strip()
        if text:
            items.append(ExtractedQuestion(
                source_id=source_id, page=page_index, raw_text=text,
                normalized_text=normalize_text(text), extraction_method="pymupdf-text"
            ))
    return items


def extract_pdf(path: Path, source_id: str, *, use_ocr: bool = False) -> list[ExtractedQuestion]:
    """Extract page text. OCR and Docling are optional and loaded only when requested."""
    source_path = path
    if use_ocr:
        binary = shutil.which("ocrmypdf")
        if not binary:
            raise RuntimeError("OCRmyPDF binary is not installed. Install the [ocr] extra and system requirements.")
        temp_dir = tempfile.TemporaryDirectory(prefix="exam-intel-")
        ocr_path = Path(temp_dir.name) / f"{path.stem}-ocr.pdf"
        subprocess.run(
            [binary, "--skip-text", "--deskew", "--rotate-pages", str(path), str(ocr_path)],
            check=True, capture_output=True, text=True
        )
        source_path = ocr_path

    pages = _extract_with_pymupdf(source_path, source_id)
    if pages:
        return pages

    try:
        from docling.document_converter import DocumentConverter
    except ImportError as exc:
        raise RuntimeError("PDF has no extractable text. Install the [docling] extra or run OCR.") from exc

    result = DocumentConverter().convert(str(source_path))
    markdown = result.document.export_to_markdown()
    return [ExtractedQuestion(
        source_id=source_id, page=1, raw_text=markdown,
        normalized_text=normalize_text(markdown), extraction_method="docling-markdown"
    )] if markdown.strip() else []


def extract_with_paddle(image_path: Path, source_id: str, page: int = 1) -> ExtractedQuestion:
    """Optional fallback for a single rendered page/image; PaddleOCR 3.x is lazy-loaded."""
    try:
        from paddleocr import PaddleOCR
    except ImportError as exc:
        raise RuntimeError("Install the [paddle] extra to use PaddleOCR.") from exc
    engine = PaddleOCR()
    result = engine.predict(str(image_path))
    fragments: list[str] = []
    for item in result or []:
        payload = getattr(item, "json", None)
        if isinstance(payload, dict):
            data = payload.get("res", payload)
            texts = data.get("rec_texts", []) if isinstance(data, dict) else []
            if texts:
                fragments.extend(str(value) for value in texts)
        elif isinstance(item, dict):
            data = item.get("res", item)
            texts = data.get("rec_texts", []) if isinstance(data, dict) else []
            fragments.extend(str(value) for value in texts)
    text = "\n".join(fragments)
    return ExtractedQuestion(
        source_id=source_id, page=page, raw_text=text,
        normalized_text=normalize_text(text), extraction_method="paddleocr",
        review_status="OCR_REVIEW"
    )


def segment_page_questions(page: ExtractedQuestion) -> list[ExtractedQuestion]:
    """Conservative numbered-question segmentation. Every result remains pending review."""
    starts = list(re.finditer(r"(?m)^\s*(\d{1,3})[.)]\s+", page.raw_text))
    segments: list[ExtractedQuestion] = []
    for index, match in enumerate(starts):
        end = starts[index + 1].start() if index + 1 < len(starts) else len(page.raw_text)
        block = page.raw_text[match.end():end].strip()
        if not block:
            continue
        option_matches = list(re.finditer(r"(?m)^\s*([A-E])[.)]\s+", block))
        stem = block[:option_matches[0].start()].strip() if option_matches else block
        options: list[str] = []
        for option_index, option_match in enumerate(option_matches):
            option_end = option_matches[option_index + 1].start() if option_index + 1 < len(option_matches) else len(block)
            option_text = block[option_match.end():option_end].strip()
            options.append(f"{option_match.group(1)}. {option_text}")
        segments.append(ExtractedQuestion(
            source_id=page.source_id,
            page=page.page,
            original_number=int(match.group(1)),
            raw_text=stem,
            normalized_text=normalize_text(stem),
            options=options,
            extraction_method=page.extraction_method,
            ocr_confidence=page.ocr_confidence,
            review_status="SEGMENTATION_REVIEW"
        ))
    return segments
