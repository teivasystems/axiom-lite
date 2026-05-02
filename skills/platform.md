# ServiceNow Platform — Skill Reference
\*\*Jordan | Claude Code | axiom-lite\*\*
> SDK build loop and deploy cycle: see `CLAUDE.md`. This file covers platform coding patterns only.

---

## Scoped App Conventions

```javascript
// Table naming: always prefixed with scope
// x_<vendor>_<appname>_<tablename>
// e.g. x_axiom_retroapp_retro_session

// Get current scope name (useful for debugging)
gs.getCurrentScopeName(); // returns e.g. "x_axiom_retroapp"

// Script Include must have "Accessible from: All application scopes"
// if called cross-scope. Set callerAccess = "" for open access.
```

**Never hardcode the scope prefix.** Reference it via `gs.getCurrentScopeName()` or define a constant in a shared Script Include.

---

## GlideRecord — Correct Patterns

```javascript
// QUERY — always setLimit for performance
var gr = new GlideRecord('x_axiom_retroapp_retro_item');
gr.addQuery('session', sessionSysId);   // field = value
gr.addQuery('active', true);
gr.setLimit(100);                        // always set a limit
gr.orderByDesc('sys_created_on');
gr.query();
while (gr.next()) {
    var val = gr.getValue('field_name'); // always use getValue() — returns String
    var el  = gr.field_name;             // GlideElement — use only for .nil() checks
}

// GET by sys_id — single record
var gr = new GlideRecord('incident');
if (gr.get(sysId)) {
    // record found
}

// INSERT
var gr = new GlideRecord('x_axiom_retroapp_retro_item');
gr.initialize();
gr.setValue('session', sessionSysId);
gr.setValue('content', itemText);
gr.setValue('category', 'went_well');
var newSysId = gr.insert(); // returns sys_id string

// UPDATE
var gr = new GlideRecord('x_axiom_retroapp_retro_session');
if (gr.get(sysId)) {
    gr.setValue('state', 'summarised');
    gr.update();
}

// DELETE — use sparingly, prefer deactivation
var gr = new GlideRecord('x_axiom_retroapp_retro_item');
gr.addQuery('session', sessionSysId);
gr.query();
gr.deleteMultiple(); // bulk delete — no while loop needed
```

### getValue() vs direct field access

| Pattern | Returns | Use when |
|---|---|---|
| `gr.getValue('field')` | String always | Reading values for logic / output |
| `gr.field` | GlideElement | Checking `.nil()`, `.getRefRecord()` |
| `gr.field.toString()` | String | Equivalent to getValue |

**Gotcha:** `gr.active` returns a GlideElement, not a boolean. Use `gr.getValue('active') == 'true'`.

---

## sys_id Rules

```javascript
// sys_id is always a 32-char hex string — never cast to int
var id = gr.getUniqueValue();           // preferred: returns sys_id of current record
var id = gr.getValue('sys_id');         // equivalent

// Validate before using
if (!id || id.length !== 32) { /* handle */ }

// Reference fields store the sys_id of the referenced record
var sessionId = gr.getValue('session'); // returns sys_id string, not the record
```

---

## ACLs in Scoped Apps

```javascript
// Roles in scoped apps are prefixed with scope
// e.g. x_axiom_retroapp.user, x_axiom_retroapp.admin

// Check role in server script
if (gs.hasRole('x_axiom_retroapp.admin')) { /* ... */ }

// For Script Includes called from Flow Designer:
// Set "Accessible from" = "All application scopes"
// Do NOT rely on session roles — flows run as system

// Background scripts and scheduled jobs run as system user
// gs.getUserID() returns system user sys_id in these contexts
```

---

## Logging

```javascript
// Scoped apps: use gs.info / gs.warn / gs.error (not gs.log)
gs.info('RetroApp: session created — {0}', sessionSysId);
gs.warn('RetroApp: Claude API timeout for session {0}', sessionSysId);
gs.error('RetroApp: insert failed — {0}', gr.getLastErrorMessage());

// gs.log() works but bypasses scoped logging filters — avoid
```

---

## Zurich / Australia — Platform Gotchas

| Issue | Detail |
|---|---|
| GlideQuery | More mature in Zurich / Australia but GlideRecord is still safer for hackathon — no surprises under time pressure |
| `gr.setWorkflow(false)` | Disables business rules on update — use when doing bulk data ops |
| `gr.autoSysFields(false)` | Prevents sys_updated_on change — use for silent updates |
| Cross-scope Script Includes | Must have `callerAccess = ""` and `Accessible from: All application scopes` |
| Scoped REST APIs | Must define explicit ACL for the endpoint in the scoped app |
| Table creation via now-sdk | Table schema defined in Fluent format — do not create tables via UI during build |
| Now Assist availability | Now Assist is GA and more capable in Zurich / Australia — verify plugin and skill kit versions during PREP |
| UI Builder components | Component library expanded in Zurich / Australia — check Now Design System release notes if a component behaves unexpectedly |

---

## PREP Phase — Plugin Availability Checklist

Run these checks during PREP (dry run), not build night. Discovering a missing plugin during a timed hackathon costs the whole session.

**IntegrationHub REST spoke:**

```javascript
// Scripts-Background on PDI
var gr = new GlideRecord('sys_hub_action_type_definition');
gr.addQuery('action_namespace', 'sn_ih');
gr.addQuery('name', 'CONTAINS', 'REST');
gr.query();
gs.info('IH REST spoke rows: ' + gr.getRowCount());
// Expected: > 0. If 0: flag to Alex, prepare sn_ws fallback.
```

**ATF (Automated Test Framework):**

```javascript
// Scripts-Background on PDI
gs.info('ATF plugin active: ' + GlidePluginManager.isActive('com.snc.test_management'));
// Expected: true. If false: ATF tests cannot run on this PDI.
```

**Note on now-sdk install + ATF:** `now-sdk install` (and `npm run deploy`) does NOT deploy `sys_atf_test` records to the PDI. ATF test definitions live only in local source files and must be set up separately. Skip ATF work if the plugin is inactive on the PDI — it blocks build progress for no benefit.

**Service Portal:**

```javascript
gs.info('Service Portal active: ' + GlidePluginManager.isActive('com.glide.service-portal'));
// Expected: true for widget-based UIs.
```

**Record all results in `runs/<run>/logs/ACTIVITY.log`** under a `[CHECKPOINT]` line. If anything is inactive, escalate to Alex before committing to an architecture that depends on it.

---

## Encoded Query Reference

```javascript
// Build encoded queries for complex conditions
gr.addEncodedQuery('active=true^category=went_well^ORcategory=to_improve');

// Get encoded query from an existing filter (useful for debugging)
// Run in background script: gs.info(gr.getEncodedQuery());
```

---

## Script Include Template (Scoped)

```javascript
var RetroSessionUtils = Class.create();
RetroSessionUtils.prototype = {
    initialize: function() {},

    getItemsForSession: function(sessionSysId) {
        var items = [];
        var gr = new GlideRecord('x_axiom_retroapp_retro_item');
        gr.addQuery('session', sessionSysId);
        gr.setLimit(200);
        gr.query();
        while (gr.next()) {
            items.push({
                sysId:    gr.getUniqueValue(),
                content:  gr.getValue('content'),
                category: gr.getValue('category')
            });
        }
        return items;
    },

    type: 'RetroSessionUtils'
};
```
