# IntegrationHub + Claude API — Skill Reference
**Jordan | Claude Code | Team AXIOM**
> SDK build loop and deploy cycle: see `CLAUDE.md`. This file covers IntegrationHub REST and Claude API patterns only.

---

## IntegrationHub REST Step — Structure

```
Action type: REST Step  (sn_ih.RESTStep)

Connection:
  Connection alias: Claude API        ← defined in Connections & Credentials
  Base URL: https://api.anthropic.com

Request:
  Method: POST
  Path: /v1/messages
  Headers:
    anthropic-version: 2023-06-01
    content-type: application/json
    x-api-key: [handled by credential alias — do NOT hardcode]

Request Body (JSON):
  {
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 1024,
    "messages": [
      {
        "role": "user",
        "content": "[flow variable: prompt_text]"
      }
    ]
  }

Response:
  Status code → flow variable: api_status_code
  Body        → flow variable: api_response_body  (String)
```

---

## Credential Store Setup

```
Navigation: Connections & Credentials → Credentials

Type:   API Key Credentials
Name:   Claude API Key
Sys scope: x_axiom_<appname>   ← must match your app scope

Field mapping:
  API Key field name: api_key
  Value: sk-ant-...            ← set by Kostya, never in source files
```

```
Navigation: Connections & Credentials → Connection & Credential Aliases

Name:   Claude API
Type:   Connection and Credential
Connection URL: https://api.anthropic.com
Credential: Claude API Key   ← link to credential created above
```

**Scope rule:** The credential alias must be in the same scope as the flow calling it, OR in global scope. If you get a "credential not accessible" error, check the sys_scope on the alias record.

---

## Claude API — Request Shape

```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 1024,
  "system": "You are a helpful retrospective facilitator...",
  "messages": [
    {
      "role": "user",
      "content": "Here are the retrospective items:\n\n{{items}}\n\nPlease summarise..."
    }
  ]
}
```

### Model selection
```
claude-sonnet-4-20250514   ← use this. Fast, capable, cost-effective.
claude-opus-4-20250514     ← only if you need max capability (slower, expensive)
claude-haiku-4-5-20251001  ← for simple classification tasks only
```

### max_tokens guidance
```
Summary generation:       1024  tokens
Action item extraction:    512  tokens
Classification/tagging:    128  tokens
```

---

## Claude API — Response Shape

```json
{
  "id": "msg_01...",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "Here is the retrospective summary:\n\n..."
    }
  ],
  "model": "claude-sonnet-4-20250514",
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 312,
    "output_tokens": 187
  }
}
```

### Parsing the response in a Run Script step

```javascript
(function execute(inputs, outputs) {
    // inputs.api_response_body = raw JSON string from REST step
    // inputs.api_status_code   = HTTP status (200 = success)

    if (inputs.api_status_code != '200') {
        outputs.success      = false;
        outputs.error_detail = 'HTTP ' + inputs.api_status_code + ': ' + inputs.api_response_body;
        return;
    }

    try {
        var response = JSON.parse(inputs.api_response_body);

        // Extract text from content array
        var text = '';
        if (response.content && response.content.length > 0) {
            for (var i = 0; i < response.content.length; i++) {
                if (response.content[i].type === 'text') {
                    text = response.content[i].text;
                    break;
                }
            }
        }

        outputs.summary_text = text;
        outputs.success      = true;
        outputs.input_tokens = response.usage ? response.usage.input_tokens  : 0;
        outputs.output_tokens= response.usage ? response.usage.output_tokens : 0;

    } catch (e) {
        outputs.success      = false;
        outputs.error_detail = 'JSON parse error: ' + e.message;
    }
})(inputs, outputs);
```

---

## Building the Prompt in a Run Script Step

```javascript
(function execute(inputs, outputs) {
    // inputs.items_json = JSON string of retro items array
    // Build the prompt text to pass to the REST step

    var items = JSON.parse(inputs.items_json);

    var sections = {
        went_well:  [],
        to_improve: [],
        action_items: []
    };

    for (var i = 0; i < items.length; i++) {
        var cat = items[i].category;
        if (sections[cat]) sections[cat].push('- ' + items[i].content);
    }

    var prompt =
        'You are facilitating a sprint retrospective. Summarise the following feedback.\n\n' +
        '## Went Well\n'    + (sections.went_well.join('\n')   || '(none)') + '\n\n' +
        '## To Improve\n'   + (sections.to_improve.join('\n')  || '(none)') + '\n\n' +
        '## Action Items\n' + (sections.action_items.join('\n')|| '(none)') + '\n\n' +
        'Produce:\n' +
        '1. A 3-sentence executive summary\n' +
        '2. Top 3 themes from "To Improve"\n' +
        '3. Concrete next steps for each action item\n\n' +
        'Be concise. Plain text, no markdown headers.';

    outputs.prompt_text = prompt;
})(inputs, outputs);
```

---

## REST Step — Timeout and Error Handling

```
REST Step settings:
  Timeout: 45 seconds   ← LLM responses can be slow; default 30s too short
  Retry:   1 attempt    ← don't retry on failure, handle in error lane

Error lane triggers on:
  - HTTP 4xx / 5xx responses
  - Connection timeout
  - Network error

Always add an error lane. Claude API can return:
  429  Rate limited — back off
  500  Server error — log and set session state = 'error'
  529  Overloaded   — same as 500 for hackathon purposes
```

---

## Security Rules

```
NEVER in source files:    API keys, credentials, tokens
NEVER in Jira:            API keys
NEVER in GitHub:          API keys (even in comments)
NEVER in flow variables:  Persist credential values — REST step handles auth via alias

Correct pattern:
  Credential alias → Connection & Credential Aliases → REST step header injection
  Jordan never sees or handles the key value directly
```

---

## Zurich / Australia — IntegrationHub Gotchas

| Issue | Detail |
|---|---|
| Spoke scope | IntegrationHub REST spoke is in `sn_ih` scope — your flow calls it cross-scope, this is expected |
| Connection alias scope | Must be accessible from your app scope — check "Accessible from" field |
| Request body as flow variable | Build JSON string in a Run Script step, pass as flow variable to REST step body |
| Response body encoding | Always a String — always `JSON.parse()` before accessing fields |
| Empty response | `stop_reason: "max_tokens"` means response was truncated — increase max_tokens |
| IH spoke versions | Zurich / Australia may ship updated spoke versions — if a spoke action shape changes, check the spoke release notes before assuming your config is correct |

---

## IH Availability Check — Do This at PREP, Not Build Night

IntegrationHub (and its REST spoke `sn_ih`) is **not always installed on PDI instances.** If it is missing, the IH REST step will not appear as an action type in Flow Designer and cannot be used in Fluent SDK flows.

**Check during PREP:**

```bash
# Run in Scripts-Background on the PDI
var gr = new GlideRecord('sys_hub_action_type_definition');
gr.addQuery('action_namespace', 'sn_ih');
gr.addQuery('name', 'CONTAINS', 'REST');
gr.query();
gs.info('IH REST step records: ' + gr.getRowCount());
```

If `getRowCount()` returns 0: IntegrationHub REST is not available. Flag to Alex immediately — either request IH installation or approve the fallback pattern below.

**Fallback: sn_ws.RESTMessageV2 in Script Include**

When IH is not available, implement the HTTP call directly in a Script Include and call it from a flow RunScript step or a Fluent RunScript action.

```javascript
// ClaudeDigest.js — direct HTTP pattern (no IH required)
var rm = new sn_ws.RESTMessageV2();
rm.setHttpMethod('POST');
rm.setEndpoint('https://api.anthropic.com/v1/messages');

// Read API key from Connection & Credential Alias (not hardcoded)
try {
    var credUtil = new sn_cc.ConnectionCredentialsUtil();
    var connInfo = credUtil.getCredentialsByConnectionAlias('<alias_sys_id>');
    var apiKey = connInfo.getAttribute('password') || connInfo.getAttribute('api_key') || '';
    rm.setRequestHeader('x-api-key', apiKey);
} catch (credErr) {
    gs.warn('Credential lookup failed: ' + credErr.message);
    // fallback to sys_property — only if alias approach fails
    rm.setRequestHeader('x-api-key', gs.getProperty('x_9274_kudos.claude_api_key', ''));
}

rm.setRequestHeader('anthropic-version', '2023-06-01');
rm.setRequestHeader('content-type', 'application/json');
rm.setRequestBody(JSON.stringify({ model: '...', max_tokens: 512, messages: [...] }));
rm.setHttpTimeout(45000);

var response = rm.execute();
var statusCode = String(response.getStatusCode());
var body = response.getBody();
```

**Reading the credential alias sys_id:**

The `sys_id` of the Connection & Credential Alias record is used to read it programmatically. Kostya creates the alias record in PDI → Connections & Credentials → Connection & Credential Aliases, then provides the sys_id. Pass it as a literal string to `getCredentialsByConnectionAlias()`.

```javascript
// connInfo.getAttribute() field names depend on credential type:
//   API Key credential type: 'api_key' or 'password'
//   Basic Auth: 'user_name', 'password'
// Try both to be safe (attribute name varies by SN version)
var apiKey = connInfo.getAttribute('password') || connInfo.getAttribute('api_key') || '';
```

**Do not use `sn_ws.RESTMessageV2` as the primary architecture choice** — flag the IH gap to Alex and get it approved before build night. `sn_ws` is a fallback when IH is genuinely unavailable, not a preference.
