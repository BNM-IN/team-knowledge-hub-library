---
name: slide-skill
description: Turns meeting notes, minutes, or a meeting summary into a VP-ready leadership deck built with the Gamma connector, enforcing a fixed executive slide spine, assertion headlines, evidence-on-every-slide rules, and the Meridian brand (navy + amber, Inter, confidential footer). Use this whenever the user wants a presentation, deck, slides, review, readout, update, QBR, or "something to show leadership" built from notes, minutes, a summary, a status update, or raw numbers — including when they just paste notes and say "make a deck out of this", and even if they never say the words "Gamma", "executive", or "brand".
---

# Slide Skill — Meeting notes to a VP-ready Meridian deck

Notes go in. A brief goes to Gamma. A deck comes out that a VP can read in four minutes and act on.

The whole point of this skill is that the deck's quality does not depend on how well-organised the notes were. The notes are raw material: a list of things people said. The deck is an argument: a verdict, the evidence for it, the causes, and what happens next. Converting one into the other is the work — do not just reformat the notes into slides.

Two things are non-negotiable on every deck: the **quality standard** and the **Meridian brand**. Both are below.

---

## Workflow

Follow these in order. Do not skip straight to the Gamma call — the extraction and gap-check steps are what stop the deck from being padded or invented.

### Step 1 — Build the evidence ledger

Read the notes and pull out, verbatim, every:

- **number** (metric, target, prior period, date, amount, percentage, count)
- **name** (person, team, customer, product, system)
- **date** (deadline, milestone, period)
- **decision or ask** (anything that needs leadership to approve, fund, unblock, or choose)

Keep this ledger to yourself — it is working material, not output. Every claim in the deck must trace back to a line in it. If a claim can't, it doesn't go in the deck.

Normalise units as you go (1.97Cr, 22%, 14 days) but never round in a way that changes the story.

### Step 2 — Find the verdict

Before writing any slide, answer in one sentence: *what does leadership need to conclude from this?*

That sentence becomes The Bottom Line. Everything else in the deck either supports it, explains it, or acts on it. If you can't write that sentence from the notes, the notes are too thin — say so to the user before building anything (see "When the notes are thin").

### Step 3 — Map to the spine and check for gaps

Map ledger items onto the slide spine below. Then list what's missing: any spine section with no evidence behind it, any metric with no target or prior period to compare against, any action with no owner or no date.

**Do not invent the missing pieces.** Carry them forward — they get flagged on the deck itself and reported to the user in Step 6.

### Step 4 — Write the slide brief

Write the full deck as text, slide by slide, using the brief template below. This is the artefact you hand to Gamma, and it has to be complete: Gamma is told to preserve your text rather than rewrite it, so whatever you write is what the VP reads.

Write the headline first for each slide, then the bullets. If you find yourself writing the bullets first and then summarising them into a title, you'll end up with a topic label instead of an assertion.

### Step 5 — Run the quality gate

Check the brief against the gate checklist below, line by line, and fix what fails. Do this before calling Gamma, not after. A deck that fails the gate wastes a generation and the user's time.

### Step 6 — Build it in Gamma, then report

Call the Gamma connector exactly as specified in "Calling Gamma". Then give the user:

1. The deck link.
2. The list of flagged gaps — each one as "slide N needs X, which wasn't in the notes".
3. Nothing else. No summary of the deck they can already open, no offer to tweak it (Gamma's generate tool can't edit an existing deck; edits happen in the Gamma editor).

---

## The slide spine

Use this order. Skip a section only when the notes genuinely contain nothing for it. Never pad a section to keep the sequence intact — an eight-slide deck that earns every slide beats a twelve-slide deck with two filler slides.

| # | Slide | What it does |
|---|-------|--------------|
| 1 | **Title** | Deck title, date, presenter line, tagline |
| 2 | **The Bottom Line** | The verdict, 3 bullets max, before any context |
| 3 | **Context** | What this deck covers, 1–2 lines only |
| 4 | **Results vs. Target** | Headline numbers, each against target or prior period, with the delta |
| 5 | **What's Working / What's Not** | Each point stated as a claim, not a heading |
| 6 | **Why** | Root causes behind slide 5 |
| 7 | **Actions & Owners** | What we're doing, who owns it, by when |
| 8 | **Asks** | Decisions or help needed from leadership |
| 9 | **Next Steps & Timeline** | Sequence and dates |
| 10 | **Summary** | Table of owners and deadlines |

The verdict comes second, not last. A VP who stops reading after slide 2 should already know the answer; slides 3–10 exist to defend it.

If slides 5 and 6 are both thin, merge them into one slide that states each problem and its cause together. If Actions and Next Steps carry the same content, merge them and keep the Summary table.

---

## Deck quality standard

These apply to every deck, every time.

**Slide count: 8–12. Never more than 12.** If the content overflows, consolidate rather than extend. A thirteenth slide means two slides were making the same point.

**One idea per slide.** If a slide's headline needs an "and", it's two slides — or one of the two ideas isn't worth a slide.

**Assertion headlines.** This is the rule that most changes how the deck reads. The slide title states the takeaway as a claim, with the number in it.

| Don't | Do |
|---|---|
| SMB Numbers | SMB conversion fell from 34% to 22% in Q1 |
| Pipeline Update | Pipeline covers 1.4x of Q2 target, short of the 3x norm |
| Hiring | Two of five open roles filled; ramp slips to May |
| Key Challenges | Onboarding drop-off, not lead quality, is driving the miss |

A reader should be able to read only the ten titles and understand the entire argument.

**Evidence on every slide.** Every claim is backed by a specific number or name from the notes. "Results improved" is not a claim — "renewals rose from 78% to 86%" is. If a bullet has no number, no name, and no date in it, it either needs one or it needs deleting.

**Density limits.** Max 5 bullets per slide. Max ~12 words per bullet. No paragraphs, no sub-bullets, no sentences that wrap to a third line. White space is a feature, not wasted space.

**Data framing.** A metric alone means nothing. Always show it against its target or prior period, and state the delta explicitly: "1.97Cr vs 2.4Cr target — 18% miss". Not "revenue was 1.97Cr".

**Tone: written for a VP.** Direct, decision-first, no hedging. Cut "we believe", "it seems", "somewhat", "in order to", "going forward". Say what happened, why, and what you want from them.

**No filler slides.** No "Thank you", no "Questions?", no agenda slide listing the slides. The Bottom Line does the job an agenda pretends to do.

**Never invent a number.** If a needed number is missing from the notes, flag it on the slide rather than estimating it. Write it as `[TBC: Q1 target not in notes]` in the bullet — visible, obviously unfinished, impossible to present by accident. Then repeat it in the Step 6 report. A flagged gap is a small embarrassment; an invented number that a VP checks is a large one.

---

## The Meridian brand

Fixed for every deck built with this skill.

| Element | Value |
|---|---|
| Company | Meridian |
| Primary colour | Deep navy `#1B2A4A` — titles, structure, dividers |
| Accent colour | Warm amber `#E8A33D` — key numbers and takeaways only |
| Font | Clean modern sans-serif (Inter or nearest equivalent) |
| Footer | `Meridian - Confidential` on every slide |
| Title-slide tagline | `Clarity. Momentum. Results.` |
| Look | Minimal, generous white space, executive. Not playful. |

Use amber sparingly. If every number is highlighted, none of them are — reserve it for the one figure per slide that carries the point.

**How brand reaches Gamma.** Gamma applies colour and type through themes, not through hex values passed in the API call. So the brand is enforced in three places at once, and all three are needed:

1. `get_themes`, then pick the closest minimal / professional / dark-navy theme and pass its `themeId`.
2. `additionalInstructions`, carrying the explicit colour, font and layout direction.
3. `cardOptions.headerFooter`, carrying the literal footer text.

Be honest with the user about the ceiling here: a stock theme gets close to `#1B2A4A` / `#E8A33D` but usually won't match exactly. Exact brand colours need a custom Meridian theme saved in the Gamma workspace. Once that theme exists, use its `themeId` instead of picking one from the list, and this section becomes exact rather than approximate. Say this once, at the end, not as a caveat before the work.

---

## The slide brief template

Write the brief in exactly this shape. Separate every slide with `---` on its own line — this is what tells Gamma where one slide ends and the next begins.

```
# [Assertion headline with the number in it]

- [Claim with evidence, ≤12 words]
- [Claim with evidence, ≤12 words]
- [Claim with evidence, ≤12 words]

---

# [Next assertion headline]
...
```

Worked fragment:

```
# Q1 revenue closed at 1.97Cr against a 2.4Cr target - an 18% miss

- Enterprise delivered 1.42Cr, 4% above its 1.36Cr target
- SMB delivered 0.55Cr against 1.04Cr - the entire gap
- Miss is concentrated in Feb and Mar, not January

---

# SMB conversion fell from 34% to 22% after the February pricing change

- Lead volume held at 2,100/month - demand is not the issue
- Drop-off sits at checkout, not at demo booking
- Enterprise conversion unchanged at 41% over the same period
```

Title slide takes this shape:

```
# [Deck title]

- [Date]
- Presented by [Name, Role]
- Clarity. Momentum. Results.
```

Summary slide is a markdown table, not bullets:

```
# Five actions, four owners, all closing by 30 June

| Action | Owner | Due |
|---|---|---|
| Roll back SMB checkout pricing | Priya Nair | 12 Apr |
| Rebuild onboarding email flow | Dan Okafor | 30 Apr |
```

---

## Quality gate

Run every line before calling Gamma. Fix failures in the brief; do not proceed with a known failure.

- [ ] Slide count is between 8 and 12
- [ ] Every slide title is a claim, contains a number or a named subject, and is not a topic label
- [ ] Reading the titles alone tells the whole story
- [ ] Every bullet contains a number, a name, or a date
- [ ] No slide has more than 5 bullets; no bullet exceeds ~12 words
- [ ] Every metric appears against a target or prior period, with the delta stated
- [ ] Every action has an owner and a date, or is flagged `[TBC: ...]`
- [ ] The Bottom Line is on slide 2 and is 3 bullets or fewer
- [ ] No thank-you, questions, or agenda slide
- [ ] No number appears that isn't traceable to the notes
- [ ] Footer text, tagline and brand instruction are in the Gamma call

---

## Calling Gamma

The user has asked for Gamma by name through this skill, so call the connector directly. First `Gamma:get_themes` to choose a theme, then `Gamma:generate` with these parameters:

| Parameter | Value | Why |
|---|---|---|
| `inputText` | The complete brief, all slides, `---` separated | Gamma must receive the full text, never a summary |
| `cardSplit` | `inputTextBreaks` | Your `---` breaks become the slide boundaries |
| `textMode` | `preserve` | Stops Gamma rewriting your assertion headlines into topic labels |
| `numCards` | Your actual slide count (8–12) | Prevents Gamma expanding past the limit |
| `format` | `presentation` | |
| `themeId` | Closest navy / minimal / professional theme from `get_themes` | Brand colour and type |
| `title` | The deck title | |
| `cardOptions.dimensions` | `16x9` | |
| `cardOptions.headerFooter.bottomLeft` | `{ type: "text", value: "Meridian - Confidential" }` | Footer on every slide |
| `cardOptions.headerFooter.hideFromFirstCard` | `false` | Footer appears on the title slide too |
| `textOptions.amount` | `brief` | Holds the density limits |
| `textOptions.audience` | `executives` | |
| `textOptions.tone` | `direct, executive, decision-first` | |
| `imageOptions.source` | `themeAccent` | Keeps the deck on-brand and text-led. Use `noImages` if the user wants it starker |

`textMode: preserve` is the single most important parameter. Without it Gamma treats your brief as a prompt and regenerates the copy, which reintroduces exactly the vague headlines this skill exists to prevent.

Pass this as `additionalInstructions`:

```
Brand: Meridian. Use deep navy #1B2A4A for slide titles, headings and structural
elements. Use warm amber #E8A33D only to highlight the single key number or
takeaway on each slide — never for body text. Use a clean modern sans-serif
(Inter or nearest available). Minimal executive layout with generous white space:
no decorative flourishes, no playful illustrations, no gradients. Keep every
slide title exactly as written — they are assertion headlines and must not be
shortened, softened, or converted into topic labels. Do not add slides, do not
add a thank-you or questions slide, and do not expand the bullets.
```

Then share the returned `gammaUrl`.

---

## When the notes are thin

Some notes cannot support a leadership deck. Say so rather than generating a deck that looks authoritative and says nothing — a confident-looking empty deck is worse than no deck, because someone will present it.

The bar: you need at least a verdict, one metric with a comparison point, and one action. Below that, tell the user plainly what's missing and what to add, and offer to build once they have it.

Above that bar but still thin: build the deck, let it run short (8 slides is fine, 6 is fine if that's what the evidence supports), and flag every gap on the slide with `[TBC: ...]`.

Never solve thin notes by adding a methodology slide, a background slide, or a "key themes" slide. That's padding wearing a suit.

---

## Worked example

**Notes in:**

> Q1 sales call, 3 April. Rev came in 1.97Cr vs 2.4Cr plan. Enterprise fine — 1.42Cr, plan was 1.36. SMB is the problem, 0.55 vs 1.04 plan. Priya thinks it's the Feb pricing change, conversion went 34% to 22%. Leads are fine, still ~2100/mo. Dan says drop-off is at checkout not demo. Renewals actually up, 78 to 86%. Two of five open SMB reps hired, ramp now May not March. Priya to roll back SMB pricing by 12 Apr. Dan rebuilding onboarding emails, end of April. Need Finance sign-off on the rollback — that's a VP call. Q2 target not set yet.

**Deck out:** 9 slides.

Titles alone:

1. Q1 Business Review — Meridian — 3 April 2026
2. SMB pricing, not demand, cost us the Q1 target
3. Q1 revenue: 1.97Cr against a 2.4Cr plan
4. Enterprise beat plan by 4%; SMB missed by 47%
5. SMB conversion fell from 34% to 22% after the February pricing change
6. Renewals rose from 78% to 86% — retention is not the problem
7. Rollback and onboarding rebuild both close before 30 April
8. We need Finance sign-off on the SMB pricing rollback by 12 April
9. Four actions, two owners, all closing by 30 April

Note what happened: the verdict was inferred, not quoted. The two strong positives (Enterprise, renewals) were kept because they sharpen the diagnosis rather than soften it. Hiring became a line on the actions slide instead of its own slide, because it couldn't carry one. And the missing Q2 target got flagged on slide 7 as `[TBC: Q2 target not set in notes]` rather than estimated.
