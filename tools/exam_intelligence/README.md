# Exam Intelligence

Independent Python pipeline for trusted exam document ingestion and historical recurrence analysis.

## Install

Use Python 3.11+ and a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -e ".[dev,docling,ocr,semantic]"
```

PaddleOCR is intentionally optional because it requires an inference backend and platform-specific installation. Install it separately after selecting CPU/GPU runtime:

```bash
python -m pip install -e ".[paddle]"
```

OCRmyPDF also requires system tools such as Tesseract and a PDF rasterizer. Follow the upstream OS-specific installation guide.

## Commands

```bash
exam-intel audit --bank data/questions/questions.json
exam-intel audit --bank data/questions/questions.json --apply
exam-intel ingest ./exam.pdf --source-id UNSM-ORD-2026-II --institution UNSM --modality ORDINARIO --year 2026 --title "UNSM Ordinario 2026-II" --ocr
exam-intel compare --bank data/questions/questions.json
```

## Safety and publication rules

- Original PDFs are immutable; calculate and store a real SHA-256 checksum.
- Extraction is page-level only. It does not claim question segmentation or key verification.
- OCR output always requires review; formulas and image-dependent questions must be checked visually.
- Similarity creates review candidates only. No automatic fixed-question promotion.
- Topic frequency is counted by distinct source document, not raw question count.
- Only a separately reviewed/approved dataset may be published to the student application.
- Do not use source files unless their provenance and usage conditions are recorded.
