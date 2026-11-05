---
title: Folio
slug: folio
one_liner: "Ask your documents anything: cited, fact-checked answers from PDF, Word, Excel and PowerPoint files."
tags: [Python, FastAPI, FAISS, Hybrid retrieval, Llama/GPT-OSS]
repo_url: https://github.com/docAlnahiyan/folio
demo_url: https://docnahi-folio.hf.space
icon: doc-chat
thumbnail: ""
date: 2026-11-01
order: 0
---

A document assistant for answers you can trust. Every factual sentence carries a numbered
citation that opens the source passage with the supporting sentence highlighted, and each
answer is checked claim by claim against the passages before you rely on it. When the
documents don't cover part of a question, Folio says so instead of guessing. The live demo
runs on this portfolio's own content, so you can ask it about my research, papers and
projects, or upload a file of your own.

**How it works.** Files are parsed into located sections (page, sheet or slide), split into
sentence-aware chunks and indexed twice: BM25 for exact terms and figures, and dense
embeddings in FAISS for paraphrases. Reciprocal rank fusion merges the two rankings. A
FastAPI server streams the answer with citations, then runs a claim check, conflict
detection and a gap report, all of which fail gracefully if they can't run.

**Also:** cited tables you can copy as CSV, saved chats with search, document scoping
("summarise the CV" reads only the CV), confidence levels, light and dark themes, and an
offline test suite. It runs on Groq's free API (Llama, GPT-OSS) or a local Ollama model.
