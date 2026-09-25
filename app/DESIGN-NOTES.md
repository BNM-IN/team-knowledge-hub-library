# UI Design Reference — NoteHive

Design source: teammate's Claude Artifact (UI mockup, internally titled "PRD form setup (Copy)", branded **NoteHive**).

This is a design reference only — not yet integrated/built into this app. Captured here so the design intent is preserved in the repo.

## Brand / product name
NoteHive

## Nav
- Header: "NoteHive" wordmark
- - Nav links: "How it works", "Groups"
  - - CTA: "Sign in" button
   
    - ## Hero
    - - Heading: "Learn from what your group already knows."
      - - Subtext: "Ask a question and get a short answer from a shared library and your peers' notes. Every point is cited, and every peer is credited."
        - - Badge: "For people learning together"
         
          - ## Example UI card (Q&A result pattern)
          - - Tag: "All knowledge"
            - - Question: "How should I chunk PDFs for RAG?"
              - - Answer snippet: "Split text into chunks of roughly 500-800 tokens with about 100 tokens of overlap[2]. Split on headings and paragraphs before counti..."
                - - Citation card: "Peer note · Source 2" — "Chunk size for PDFs" attributed to "Riya · RAG study group", with a "+ Join..." button
                 
                  - ## Why this matters for KH · core
                  - This directly parallels our own ask/citation design intent: answers should cite sources and credit the teammate/peer who contributed the underlying note, same pattern as the "Peer note · Source N" citation card above. When the app/ frontend gets built, this is the design system + interaction pattern to follow (or adapt from) for the ask flow and citation rendering.
                  - 
