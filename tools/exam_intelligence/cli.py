from __future__ import annotations

import json
from pathlib import Path

import typer

from .audit import audit_question_bank
from .ingestion import ingest_pdf
from .recurrence import compare_questions, recurring_topic_report, semantic_candidates

app = typer.Typer(help="Exam Intelligence: ingestion, auditing and recurrence analysis.")


@app.command()
def audit(bank: Path = typer.Option(Path("data/questions/questions.json"), exists=True),
          apply: bool = typer.Option(False, help="Apply only safe metadata migration for unverified fixed flags.")) -> None:
    report = audit_question_bank(bank, apply_safe_migration=apply)
    typer.echo(json.dumps(report, ensure_ascii=False, indent=2))


@app.command()
def ingest(pdf: Path = typer.Argument(..., exists=True, readable=True),
           source_id: str = typer.Option(..., "--source-id"),
           institution: str = typer.Option(...),
           modality: str = typer.Option(...),
           year: int = typer.Option(...),
           title: str = typer.Option(...),
           source_type: str = typer.Option("USER_PROVIDED"),
           output: Path = typer.Option(Path("data/ingested")),
           ocr: bool = typer.Option(False, help="Run OCRmyPDF before text extraction.")) -> None:
    metadata = {
        "institution": institution, "modality": modality, "year": year,
        "title": title, "sourceType": source_type
    }
    report = ingest_pdf(pdf, source_id, metadata, output, use_ocr=ocr)
    typer.echo(json.dumps({k: v for k, v in report.items() if k != "questions"}, ensure_ascii=False, indent=2))


@app.command()
def compare(bank: Path = typer.Option(Path("data/questions/questions.json"), exists=True),
            output: Path = typer.Option(Path("data/analysis/recurrence-candidates.json")),
            threshold: float = typer.Option(88.0, min=0, max=100),
            semantic: bool = typer.Option(False, help="Run optional embedding-based similarity (downloads a model on first run).")) -> None:
    records = json.loads(bank.read_text(encoding="utf-8"))
    candidates = compare_questions(records, threshold=threshold)
    semantic_matches = semantic_candidates(records) if semantic else []
    topics = recurring_topic_report(records)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps({
        "generatedForReview": True,
        "candidateCount": len(candidates),
        "candidates": [item.model_dump(mode="json") for item in candidates],
        "semanticCandidateCount": len(semantic_matches),
        "semanticCandidates": semantic_matches,
        "topicFrequency": topics
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    typer.echo(f"{len(candidates)} recurrence candidates written to {output}")


if __name__ == "__main__":
    app()
