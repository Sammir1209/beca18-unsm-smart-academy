from __future__ import annotations

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
    text = "\\n".join(fragments)
    return ExtractedQuestion(
        source_id=source_id, page=page, raw_text=text,
        normalized_text=normalize_text(text), extraction_method="paddleocr",
        review_status="OCR_REVIEW"
    )
