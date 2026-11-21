from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from .extractors import extract_pdf
from .normalization import file_sha256


def ingest_pdf(path: Path, source_id: str, metadata: dict, output_dir: Path, *, use_ocr: bool = False) -> dict:
    output_dir.mkdir(parents=True, exist_ok=True)
    digest = file_sha256(str(path))
    pages = extract_pdf(path, source_id, use_ocr=use_ocr)
    manifest = {
        "sourceId": source_id,
        "metadata": metadata,
        "localPath": str(path),
        "documentSha256": digest,
        "acquisitionStatus": "EXTRACTED" if pages else "DOWNLOADED",
        "extractedAt": datetime.now(timezone.utc).isoformat(),
        "pageCountExtracted": len(pages),
        "questions": [item.model_dump(mode="json") for item in pages],
        "qualityGate": {
            "approvedForQuestionBank": False,
            "reason": "Extracción por página; segmentación, claves y revisión humana pendientes."
        }
    }
    destination = output_dir / f"{source_id}.json"
    destination.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    return manifest
