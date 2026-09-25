---
tags: [prompting, system-prompts]
---

# Prompting Basics

Prompting is how we shape what a language model produces. A well-structured prompt reduces ambiguity and makes outputs more consistent, testable, and easy to debug.

## Core Principles

- **Be explicit about the task.** State the goal, the expected output format, and any constraints up front rather than relying on the model to infer them.
- - **Give context, not just instructions.** Background information (who the output is for, what happens next) helps the model make better judgment calls on edge cases.
  - - **Show, don't just tell.** A single well-chosen example (few-shot) often does more than a paragraph of description.
    - - **Separate instructions from data.** Use clear delimiters (headings, XML-style tags, or fenced blocks) so the model doesn't confuse your instructions with the content it's operating on.
     
      - ## System Prompts vs. User Prompts
     
      - The system prompt sets standing behavior: role, tone, output format, and rules that should hold across an entire conversation or task. The user prompt carries the specific request. Keeping these separate makes behavior easier to reuse and audit — you can swap out a single user request without rewriting the rules that govern every request.
     
      - ## Structuring a Good Prompt
     
      - 1. **Role/context** — who the model is acting as and why.
        2. 2. **Task** — the specific thing to do, stated as a clear instruction.
           3. 3. **Constraints** — format, length, tone, things to avoid.
              4. 4. **Examples** (optional but high-value) — one or two input/output pairs.
                 5. 5. **Output format** — exact structure expected (JSON schema, markdown headings, a fixed template).
                   
                    6. ## Common Failure Modes
                   
                    7. - **Vague success criteria** — if you can't tell what a "good" answer looks like, neither can the model.
                       - - **Conflicting instructions** — contradictions buried in a long prompt get resolved unpredictably.
                         - - **Over-long context with no structure** — dumping raw text without headings or delimiters makes it harder for the model to locate what's relevant.
                           - - **Assuming memory across calls** — unless conversation history is explicitly passed in, each call starts fresh.
                            
                             - ## Iterating on Prompts
                            
                             - Treat prompts like code: version them, test them against a fixed set of representative inputs, and change one variable at a time so you can tell what actually improved the output. Small wording changes can have an outsized effect, especially on instruction-following and format compliance.
                             - 
