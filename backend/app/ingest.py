"""
ingest.py — Document loader for the RAG pipeline.

Supports .txt, .pdf and .docx files. Documents are read from the
specified folder at startup and can also be uploaded at runtime
via the /documents/upload endpoint.
"""

import os
import logging
from pathlib import Path

log = logging.getLogger(__name__)

EXCLUDED_FILES = {"qa_input_examples.txt"}
SUPPORTED_EXTENSIONS = {".txt", ".pdf", ".docx"}


def _read_txt(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def _read_pdf(path: str) -> str:
    try:
        from pypdf import PdfReader
    except ImportError:
        log.warning("pypdf not installed — skipping %s", path)
        return ""
    reader = PdfReader(path)
    pages = [page.extract_text() or "" for page in reader.pages]
    return "\n\n".join(pages).strip()


def _read_docx(path: str) -> str:
    try:
        from docx import Document
    except ImportError:
        log.warning("python-docx not installed — skipping %s", path)
        return ""
    doc = Document(path)
    return "\n".join(p.text for p in doc.paragraphs).strip()


def read_file(path: str) -> str:
    """Read a single file based on its extension."""
    ext = Path(path).suffix.lower()
    if ext == ".pdf":
        return _read_pdf(path)
    elif ext == ".docx":
        return _read_docx(path)
    else:
        return _read_txt(path)


def load_documents(folder_path: str):
    """Load all supported documents from a folder."""
    documents = []

    for file in os.listdir(folder_path):
        ext = Path(file).suffix.lower()
        if ext not in SUPPORTED_EXTENSIONS:
            continue
        if file in EXCLUDED_FILES:
            continue

        filepath = os.path.join(folder_path, file)
        try:
            text = read_file(filepath)
            if text.strip():
                documents.append({"text": text, "source": file})
                log.info("Loaded: %s (%d chars)", file, len(text))
            else:
                log.warning("Skipped empty file: %s", file)
        except Exception as e:
            log.error("Failed to load %s: %s", file, e)

    return documents
