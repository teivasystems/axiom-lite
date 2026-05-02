# axiom-lite

A lightweight AI-native development workflow built around a single Jira story.

---

## How it works

One Jira story. Four personas. Everything tracked as comments on the ticket.

```
Kostya → Alex    writes user story + acceptance criteria → creates Jira story
       → Sam     adds architecture notes as Jira comment → assigns Jordan + Casey
       → Casey   adds test criteria as Jira comment
       → Jordan  builds, commits, posts build summary as Jira comment
       → Casey   tests, posts results, closes or reopens story
```

No separate log files. No run folders. No pitch. No retrospective process.  
The story is the thread.

---

## Repository structure

```
axiom-lite/
├── CLAUDE.md                  ← all four personas in one file (Jordan's workspace)
├── README.md                  ← this file
├── .claude/
│   ├── settings.json          ← Claude Code permissions
│   └── settings.local.json    ← Jira MCP credentials (not committed — see example)
├── skills/                    ← ServiceNow reference files (load as needed)
│   ├── platform.md
│   ├── flows.md
│   ├── integration.md
│   ├── ui.md
│   └── jira.md
└── app/                       ← now-sdk app
    ├── now.config.json        ← scope assigned by AES — never guess the prefix
    ├── package.json
    └── src/
        ├── fluent/
        └── server/
```

---

## Setup

**1. Clone and configure Jira credentials**

Copy `.claude/settings.local.json.example` to `.claude/settings.local.json` and fill in:
- `JIRA_INSTANCE_URL`
- `JIRA_USER_EMAIL`
- `JIRA_API_KEY`

**2. Initialise the now-sdk app**

After Kostya creates the app in AES and confirms the scope prefix:

```bash
cd app
now-sdk init \
  --appName "<Display Name>" \
  --scopeName "<x_vendor_appname>" \
  --template typescript.basic \
  --auth <your-auth-profile>
npm run build
npm run deploy
```

**3. Start a story**

```
"Be Alex. New requirement: [one sentence]"
```

---

## Personas

| Persona | Role | Works in |
|---|---|---|
| Alex | Writes the user story and acceptance criteria | Claude Code (via CLAUDE.md) |
| Sam | Adds architecture notes to the Jira story | Claude Code (via CLAUDE.md) |
| Casey | Writes test criteria; runs tests; closes story | Claude Code (via CLAUDE.md) |
| Jordan | Builds the feature, commits, updates Jira | Claude Code (via CLAUDE.md) |

Switch personas by telling Claude Code which one to be.  
All Jira operations use the Jira MCP server configured in `.claude/settings.local.json`.

---

## Platform

ServiceNow Now Platform (Zurich / Australia) · now-sdk 4.6.0 · TypeScript strict mode
