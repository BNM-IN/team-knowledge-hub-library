---
tags: [evaluation, golden-set]
---

# Evaluation Basics

Evaluation is how you know whether a model, prompt, or agent is actually working — and whether a change made things better or worse. Without it, iteration is guesswork.

## Why Evaluation Matters

LLM outputs are non-deterministic and quality is often subjective, so "it looks good" is not a reliable signal across many cases. A good evaluation setup turns "does this feel better" into a measurable, repeatable answer, and catches regressions before they reach users.

## Building a Golden Set

A golden set is a fixed collection of representative inputs (and, where possible, expected outputs or scoring criteria) used to test a system consistently over time.

- **Representative** — cover the range of real usage, including common cases and known edge cases, not just the easy ones.
- - **Fixed** — the same set is reused across runs so results are comparable; add to it deliberately, don't let it drift silently.
  - - **Labeled** — each example should have a way to judge correctness: an expected answer, a rubric, or acceptance criteria.
    - - **Sized to the problem** — a few dozen well-chosen examples often reveal more than thousands of unreviewed ones.
     
      - ## Types of Evaluation
     
      - - **Exact match / reference-based** — compare output to a known correct answer. Works well for structured or factual tasks.
        - - **Rubric-based grading** — score outputs against explicit criteria (correctness, completeness, tone, format compliance), often using a second model as a judge.
          - - **Human review** — still the gold standard for subjective quality, especially early on or for high-stakes outputs.
            - - **Automated checks** — schema validation, length limits, banned-content checks — cheap, fast, and good as a first pass before deeper review.
             
              - ## Coverage vs. Correctness
             
              - Two different questions are easy to conflate: did the system find the right information (coverage/retrieval quality), and did it use that information correctly in its answer (correctness/faithfulness). Measuring both separately makes it much easier to tell whether a bad answer is a retrieval problem or a generation problem.
             
              - ## Common Pitfalls
             
              - - **Testing only happy paths** — a golden set with no edge cases or adversarial inputs will miss real failure modes.
                - - **No baseline** — without a stored prior result, you can't tell if a change actually improved things.
                  - - **Overfitting to the golden set** — tuning prompts until they ace a fixed set can hurt generalization to real, unseen inputs. Rotate or expand the set periodically.
                    - - **Ignoring latency and cost** — a technically better answer that's too slow or too expensive isn't actually an improvement in production.
                      - 
