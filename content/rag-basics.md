---
tags: [rag, retrieval]
---
# RAG basics

## What retrieval-augmented generation is
Retrieval-augmented generation (RAG) answers a question by first searching a knowledge base for relevant passages, then giving those passages to a language model as context. The model is instructed to answer only from what it was given, and to cite which passage supported each claim. This keeps answers grounded in your own content instead of only the model's training data, and lets you point to a source when a claim looks wrong.

## Why chunk documents
Embedding an entire document as one vector loses precision: a long file covers many subtopics, and averaging them together produces a vague embedding that does not match specific questions well. Splitting content into smaller chunks, each embedded separately, lets retrieval find the specific passage that actually answers the question rather than the whole document it came from.

## Choosing a chunk size
A common starting point is 500 to 1000 tokens per chunk with some overlap between neighboring chunks, so a fact near a chunk boundary is not lost. Splitting by heading first, then by size within a section, tends to keep related sentences together better than a fixed-size sliding window with no regard for document structure.

## Retrieval and ranking
At query time, the question is embedded with the same model used for the documents, and the knowledge base is searched by vector similarity (commonly cosine similarity). Only the top few matches above a minimum similarity threshold are kept, so an unrelated or low-confidence match does not get treated as a citation.
