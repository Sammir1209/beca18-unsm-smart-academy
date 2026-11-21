# Exam Intelligence

Python 3.11+ document ingestion and recurrence analysis package, separate from the Vite student application.

## Architecture

- **Student app:** Vite/JavaScript, consumes only reviewed JSON question banks.
- **Admin pipeline:** Python CLI for document intake, OCR, extraction, metadata audit, lexical/semantic recurrence candidates.
- **Review gate:** OCR output, answer keys, classifications and all recurrence candidates require human review before publication.

## Install

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -e ".[dev,docling,ocr]"
```

PaddleOCR is an optional fallback because the runtime needs a compatible inference backend. Install it separately after choosing CPU/GPU:

```bash
python -m pip install -e ".[paddle]"
```

Sentence Transformers is optional and downloads a model on first semantic comparison:

```bash
python -m pip install -e ".[semantic]"
```

OCRmyPDF requires system dependencies (Tesseract and a PDF rasterizer; follow the upstream OS-specific installation guide). Do not install PaddleOCR's full `[all]` dependency set by default: select only required capabilities.

## Commands

```bash
exam-intel audit --bank data/questions/questions.json
exam-intel audit --bank data/questions/questions.json --apply
exam-intel ingest ./exam.pdf --source-id UNSM-ORD-2026-II --institution UNSM --modality ORDINARIO --year 2026 --title "UNSM Ordinario 2026-II" --ocr
exam-intel compare --bank data/questions/questions.json
exam-intel compare --bank data/questions/questions.json --semantic
```

The `--apply` audit migration only clears unsupported `isFija` labels and marks recurrence `UNVERIFIED`. It does not alter question text, alternatives, answer keys or explanations.

## Processing policy

1. Keep the original PDF immutable and calculate its actual SHA-256.
2. Use PyMuPDF for page-preserving text extraction; Docling is the structured-document fallback for PDFs with no usable text layer.
3. Use OCRmyPDF to create a searchable PDF from scans. PaddleOCR is an optional page/image OCR fallback.
4. Never auto-complete illegible text, formulas, graphics or options.
5. RapidFuzz produces exact/near-text candidates. Sentence Transformers is an optional semantic candidate generator.
6. Automated matches are never promoted to fixed questions. Human review is mandatory.
7. Topic frequency counts distinct source documents, not question totals alone.
8. An extracted PDF page is not yet a segmented question. Each question must be reviewed and assigned its original page/number.
9. An item without a verified key is not eligible for a scored official simulation.
10. Do not publish a bank unless modality, source, answer key, options and coverage pass quality gates.

## Why Label Studio is not deployed

Label Studio is a full annotation platform and would add another service and operating surface. The current bank is small enough for a focused review queue in our own admin interface. Reconsider it when multiple reviewers or large-scale labeling justify the extra infrastructure.
