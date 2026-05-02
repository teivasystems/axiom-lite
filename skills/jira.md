# Skill — Jira Workflow & Comment Conventions

> **Audience:** every persona, every run.
> **Purpose:** make Jira tickets self-explanatory at a glance, so anyone — including the next persona, Kostya, or a judge reviewing process — can understand a ticket's full story without re-reading the repo.
> **Source of truth for handover format:** `playbook/WORKFLOW.md` Section *Jira Handover Comments*. This file extends it with **closure comments** and consolidates all Jira touch points in one place.

---

## 1. Why this skill exists

A ticket without comments is a black box. During the hackathon, time pressure makes us forget who did what, what was learned, and what was skipped. Anyone returning to a Jira ticket after the fact must answer four questions instantly:

1. **Who worked on this?**
2. **What was the outcome?**
3. **Were there blockers or surprises?**
4. **Where is the artifact?**

If the ticket cannot answer those four questions from the comment thread alone, it has failed.

---

## 2. Ticket Creation — Atomic Protocol

Creating a ticket is not a single action. A ticket that exists without a Persona field
and a START comment is incomplete. The three steps below are **one operation** — do not
split them across turns or sessions.

### Required fields at creation

| Field | Value | How to set |
|-------|-------|------------|
| Summary | `[DR] <task name>` (dry run) or `<task name>` (real run) | At creation |
| Issue type | Task | At creation |
| Assignee | Kostya Bazanov (only real account available) | At creation or immediately after |
| **Persona** | Alex / Sam / Morgan / Jordan / Casey / Riley | **Must set before leaving the ticket** |
| Status | Correct initial state (see below) | Transition immediately after creation |

### Initial status by ticket state

| Ticket state | Jira status | Comment required |
|---|---|---|
| Already done when created | Done | Closure comment (see Section 4) |
| Ready to start, persona active | In Progress | START comment (see below) |
| Ready to start, persona not yet active | In Progress | START comment noting "waiting for persona activation" |
| Blocked on a dependency | Blocked | START comment + BLOCKER comment |

**Never leave a ticket in `To Do` / `Backlog` without a comment explaining why it hasn't started.**

### START comment format

```
[AXM-XX] Starting — <one-line description>
PERSONA: <Persona name> (<role>)
STATUS: In Progress — <entry conditions met / blocked / waiting for persona>

Entry conditions met:
  <AXM-YY> (<dependency>) DONE ✅ — <artifact and commit>
  <or: list what is still pending>

Expected output: <file path>
<Any specific instructions, edge cases, or warnings for this persona>

Source artifact: <link to input doc>
Activity log:    <link to ACTIVITY.log>
```

---

## 3. The three comment types

Every Jira ticket gets up to three comment types over its lifetime. Each has a fixed format. Do not improvise.

| Type | When | Direction | Required? |
|------|------|-----------|-----------|
| **START** | When creating ticket or transitioning to `In Progress` | Forward — "starting" | Yes |
| **HANDOVER** | When transitioning to `In Review` or another persona's queue | Forward — "to next" | Yes if not closing |
| **CLOSURE** | When transitioning to `Done` / `Closed` / `Won't Do` | Backward — "what happened" | **Always — no exceptions** |

START and HANDOVER are documented in `WORKFLOW.md`. **This skill file owns the CLOSURE format.**

---

## 4. Closure comment — mandatory format

Every ticket transitioned to `Done`, `Closed`, or `Won't Do` **must** receive a closure comment **before** the status change. No closure comment, no transition.

### Format

```
[CLOSED] AXM-XX — <one-line outcome>

WORKED BY:     <Persona>  (and <Persona> if collaborative)
DURATION:      <e.g. 35 min, or T+1:20 → T+1:55>
RESOLUTION:    Done | Won't Do | Superseded by AXM-YY

KEY TAKEAWAYS:
  - <takeaway 1 — really concise, one line>
  - <takeaway 2>
  - <takeaway 3 — max 5 bullets, fewer is better>

BLOCKERS HIT:
  - <blocker + how it was resolved>   OR   None

ARTIFACT:      <repo-relative path>   OR   N/A
ARTIFACT_URL:  <full GitHub URL>      OR   N/A
COMMIT:        <short SHA>            OR   N/A

FOLLOW-UPS:
  - <new ticket if any, e.g. AXM-YY>  OR   None

HANDOVER LOG:  <link to HANDOVERS.md entry if applicable>
```

### Field rules

- **WORKED BY** — list every persona who *touched* the ticket, not just the closer. If Sam started and Jordan finished, both appear.
- **KEY TAKEAWAYS** — the single most important field. Write what the next person (or judge) needs to know in one scan. Decisions made, patterns chosen, things that didn't work. **Maximum 5 bullets, each one line.** If you need more, you're writing a report — write it in the artifact, not the comment.
- **BLOCKERS HIT** — write `None` explicitly. Never leave it blank or write `N/A`. A `None` is information; a blank field is ambiguity.
- **RESOLUTION** — `Won't Do` is a valid and honest outcome. Use it when a ticket is closed without delivering its original scope (descoped, infeasible, replaced).
- **FOLLOW-UPS** — if closing this ticket created new work, link the new ticket. This is how scope changes stay traceable.

---

## 5. Worked examples

### Example A — Standard close (delivered)

```
[CLOSED] AXM-03 — Architecture doc complete, all 11 sections covered

WORKED BY:     Sam
DURATION:      45 min (T+0:30 → T+1:15)
RESOLUTION:    Done

KEY TAKEAWAYS:
  - 4 tables defined; sprint_retro is the parent record
  - Claude integration via IntegrationHub REST step — credential alias `claude_api`
  - Build sequence: tables → flows → script include → UI (in this order)
  - Zurich / Australia gotcha: scoped app cannot read sys_user.email without ACL — flagged for Jordan

BLOCKERS HIT:
  - PDI capability for Now Assist unclear → confirmed via spike, available in Zurich / Australia PDI

ARTIFACT:      runs/2026-05_creatorcon/docs/architecture.md
ARTIFACT_URL:  https://github.com/teivasystems/axiom-hackathon/blob/main/runs/2026-05_creatorcon/docs/architecture.md
COMMIT:        a3f1e9c

FOLLOW-UPS:    None

HANDOVER LOG:  HANDOVERS.md#H-002
```

### Example B — Won't Do (descoped)

```
[CLOSED] AXM-12 — Won't Do — feature descoped after Alex scope-lock

WORKED BY:     Morgan, Alex
DURATION:      ~10 min (analysis only)
RESOLUTION:    Won't Do

KEY TAKEAWAYS:
  - Multi-language support out of scope for hackathon — too large for 8h window
  - Wireframe sketch retained in Figma "Parking Lot" page for post-hackathon
  - English-only confirmed in scope lock

BLOCKERS HIT:    None

ARTIFACT:      N/A
ARTIFACT_URL:  N/A
COMMIT:        N/A

FOLLOW-UPS:
  - None during hackathon. Post-event: revisit if app is productionised.

HANDOVER LOG:  N/A
```

### Example C — Collaborative close

```
[CLOSED] AXM-09 — Claude API integration working end-to-end

WORKED BY:     Jordan (build), Casey (test), Sam (review)
DURATION:      1h 10min across BUILD phase
RESOLUTION:    Done

KEY TAKEAWAYS:
  - claude-sonnet-4-5 model used; max_tokens 1024 sufficient for retro summary
  - Response parsing requires filter on type === "text" — see integration.md
  - 1 of 5 test calls timed out at 8s; retry logic added (max 2 retries)
  - Token cost per retro run: ~$0.02 — acceptable for demo

BLOCKERS HIT:
  - Initial 401s due to credential alias not in scoped app ACL → Sam updated ACL, resolved

ARTIFACT:      src/server/script_includes/claude_client.js
ARTIFACT_URL:  https://github.com/teivasystems/axiom-hackathon/blob/main/src/server/script_includes/claude_client.js
COMMIT:        7b29d4a

FOLLOW-UPS:
  - AXM-22 — add structured-output JSON mode (post-hackathon nice-to-have)

HANDOVER LOG:  HANDOVERS.md#H-007
```

---

## 6. Closure ↔ logs ↔ HANDOVERS.md

A closure is a logged event. The flow is:

1. **Write the closure comment** in Jira (use the format above).
2. **Append to `runs/[run]/logs/ACTIVITY.log`**:
   ```
   YYYY-MM-DDTHH:MM:SSZ | [CLOSED] | <Persona> | AXM-XX | <one-line outcome>
   ```
3. **If closure follows a handover**, the matching `HANDOVERS.md` entry's `STATUS` field is updated from `Complete` to `Closed` and the closure comment URL is appended.
4. **Transition the Jira ticket** — only after steps 1–3 are done.

Order matters. The Jira transition is the *last* action, not the first.

---

## 7. What must never go in a closure comment

- ❌ "See the artifact" with no link
- ❌ "Done" with no takeaways
- ❌ Long prose paragraphs — bullets only, max 5
- ❌ Personal commentary ("this was hard", "good job team") — comments are operational, not social
- ❌ Information that contradicts the artifact — if the takeaway and the artifact disagree, fix the artifact, then write the takeaway
- ❌ Secrets, tokens, internal URLs, credentials of any kind

---

## 8. Closure for tickets you're taking over

You may inherit a ticket someone else started. Two scenarios:

**Scenario A — You finish it.**
You write the closure comment. `WORKED BY` lists both you *and* the original starter. Takeaways must cover the full ticket lifetime, not just your portion.

**Scenario B — You close it without finishing the original scope.**
Use `RESOLUTION: Won't Do` or `RESOLUTION: Superseded by AXM-YY`. State explicitly in `KEY TAKEAWAYS` what was done, what wasn't, and why. Never silently shrink scope.

---

## 9. Closure-comment quality checklist

Before posting, scan your draft against this list. If any answer is "no," fix it before posting.

- [ ] Outcome stated in the first line, in plain English
- [ ] `WORKED BY` lists every persona who touched the ticket
- [ ] `KEY TAKEAWAYS` is ≤ 5 bullets, each one line
- [ ] `BLOCKERS HIT` is either populated or explicitly says `None`
- [ ] Artifact link works and points to the committed file (not a branch that may disappear)
- [ ] Commit SHA is included for any ticket that produced code or a doc
- [ ] Follow-up tickets exist for any deferred work
- [ ] No secrets, credentials, or internal-only URLs

If all eight pass, post the comment, then transition the ticket.

---

## 10. Casey's audit role

Casey audits closure comments at the end of each phase (PREP, BUILD, POLISH).

If a ticket is `Done` and the closure comment is missing or fails the checklist, Casey:

1. Reopens the ticket (transition back to `In Review`).
2. Pings the owning persona to fix.
3. Logs `[AUDIT_FAIL]` in `ACTIVITY.log` with the ticket ID.

A clean Jira board at submission time is part of the deliverable. Judges will look.

---

## 11. Quick reference — paste-able template

Keep this nearby. Copy, fill, post.

```
[CLOSED] AXM-XX — <outcome>

WORKED BY:
DURATION:
RESOLUTION:    Done | Won't Do | Superseded by AXM-YY

KEY TAKEAWAYS:
  -
  -
  -

BLOCKERS HIT:
  -

ARTIFACT:
ARTIFACT_URL:
COMMIT:

FOLLOW-UPS:
  -

HANDOVER LOG:
```

---

*Casey — QA & Documentation*
*Skill applies to: every persona, every ticket, every run.*
*Conflicts with WORKFLOW.md? WORKFLOW.md wins for START and HANDOVER. This file wins for CLOSURE.*
