# UI Builder + Service Portal — Skill Reference
**Jordan | Claude Code | Team AXIOM**
> SDK build loop and deploy cycle: see `CLAUDE.md`. This file covers UI patterns only.

---

## UX Channel Routing — Architectural Decision (D-002)

> **This routing is a signed-off architectural principle. Do not deviate without Alex approving a scope change.**

| User type | Correct channel | Notes |
|---|---|---|
| Employee (self-service) | Employee Center or custom SP portal | EC is SP-based with curated topic cards. Custom SP portal is faster to build. |
| Customer / external user | Customer Service Portal (CSM) | Requires CSM plugin on PDI. Verify during PREP. |
| End user (generic portal) | Custom Service Portal widget | Standard SP widget stack — see patterns below. |
| Manager / fulfiller / agent | UI Builder Workspace | Purpose-built agent experience. Now Assist integrates natively here. |
| Admin / internal tooling | UI Builder or SP (either) | Choose based on build time available. |
| Mobile (any user) | ServiceNow Mobile Studio | **Heavy build — use only if mobile is the explicit pitch differentiator. Default: skip.** |
| Now Assist / Voice AI | Now Assist panel (Workspace or Portal) | Applicable to both channels. See Now Assist section below. |

**Hackathon decision rule at T+0:**
1. Sam identifies the primary user type from Alex's scope lock.
2. Sam maps it to this table and names the channel in `architecture.md` Section 1.
3. Jordan does not start UI work until the channel is named in architecture.md.
4. **Do not start in one channel and switch mid-build** — patterns are incompatible and the time cost is fatal.

---

## Pick One — Do Not Mix

| Tool | Best for | Complexity | Speed to build |
|---|---|---|---|
| **Service Portal** | Employee / end-user self-service, simple forms | Lower | Faster (2–3 hrs) |
| **UI Builder Workspace** | Agent / manager / fulfiller UX, data-heavy views | Higher | Slower (3–5 hrs) |
| **Employee Center** | Curated employee-facing homepage + topic tiles | Medium | Medium (SP base + EC config) |
| **Now Assist panel** | Conversational AI in either channel | Low–Medium | Fast if OOB, slow if custom skill |
| **Mobile** | Mobile-first user journeys | Very high | Do not attempt in hackathon unless scoped explicitly |

**Default recommendation:** SP widget for anything employee/end-user facing. UI Builder for agent/fulfiller views. Employee Center if the pitch explicitly needs a "modern employee portal" look.

---

## Service Portal

### Widget Structure

```javascript
// Server Script — runs on server, populates data object
(function() {
    // data object is shared between server and client
    data.session_id  = $sp.getParameter('session_id') || input.session_id;
    data.items       = [];
    data.session     = {};

    if (!data.session_id) return;

    // Load session
    var sessionGr = new GlideRecord('x_axiom_retroapp_retro_session');
    if (sessionGr.get(data.session_id)) {
        data.session = {
            name:  sessionGr.getValue('name'),
            state: sessionGr.getValue('state')
        };
    }

    // Load items
    var itemGr = new GlideRecord('x_axiom_retroapp_retro_item');
    itemGr.addQuery('session', data.session_id);
    itemGr.orderByDesc('sys_created_on');
    itemGr.setLimit(100);
    itemGr.query();
    while (itemGr.next()) {
        data.items.push({
            sysId:    itemGr.getUniqueValue(),
            content:  itemGr.getValue('content'),
            category: itemGr.getValue('category')
        });
    }
})();
```

```javascript
// Client Controller — AngularJS, runs in browser
function($scope, $http, spUtil) {
    var c = this;

    // data from server is available on c.data
    c.newItem = { content: '', category: 'went_well' };

    c.submitItem = function() {
        if (!c.newItem.content) return;

        // Call server script with input object
        spUtil.update($scope).then(function(response) {
            c.data = response;  // server refreshes data
        });

        // OR use $http for REST calls
        $http.post('/api/x_axiom_retroapp/retro/submit', {
            session_id: c.data.session_id,
            content:    c.newItem.content,
            category:   c.newItem.category
        }).then(function(response) {
            c.newItem.content = '';         // clear input
            spUtil.addInfoMessage('Item submitted!');
        }).catch(function(err) {
            spUtil.addErrorMessage('Submission failed. Try again.');
        });
    };
}
```

### Widget HTML Template

```html
<!-- Categories are fixed for retro: went_well, to_improve, action_item -->
<div class="retro-submit">
  <h3>{{c.data.session.name}}</h3>

  <!-- Category selector -->
  <div class="btn-group" role="group">
    <button type="button"
      ng-class="{'btn-primary': c.newItem.category === 'went_well', 'btn-default': c.newItem.category !== 'went_well'}"
      class="btn"
      ng-click="c.newItem.category = 'went_well'">
      ✅ Went Well
    </button>
    <button type="button"
      ng-class="{'btn-warning': c.newItem.category === 'to_improve', 'btn-default': c.newItem.category !== 'to_improve'}"
      class="btn"
      ng-click="c.newItem.category = 'to_improve'">
      🔧 To Improve
    </button>
  </div>

  <!-- Input -->
  <textarea ng-model="c.newItem.content"
    placeholder="Add your feedback..."
    class="form-control"
    rows="3">
  </textarea>

  <button ng-click="c.submitItem()"
    ng-disabled="!c.newItem.content"
    class="btn btn-primary">
    Submit
  </button>

  <!-- Item list -->
  <div ng-repeat="item in c.data.items">
    <span class="label" ng-class="{'label-success': item.category === 'went_well', 'label-warning': item.category === 'to_improve'}">
      {{item.category}}
    </span>
    {{item.content}}
  </div>
</div>
```

### spUtil — Key Methods

```javascript
spUtil.update($scope)               // re-run server script, refresh data
spUtil.addInfoMessage('text')       // green toast notification
spUtil.addErrorMessage('text')      // red toast notification
spUtil.refresh()                    // full page refresh (use sparingly)
$sp.getParameter('param_name')      // read URL query parameter (server side)
```

---

## Service Portal — Portal Page Setup

```
Navigation: Service Portal → Pages → New

Page ID:  retro_submit    ← used in URL: /sp?id=retro_submit&session_id=...
Title:    Submit Retro Item
Layout:   1 column

Add widget to page:
  Widget: [your widget name]
  Options: {}               ← pass static options here if needed
```

**URL pattern for anonymous access:**
```
https://<instance>.service-now.com/sp?id=retro_submit&session_id=<sys_id>
```

---

## UI Builder (If Chosen Over Service Portal)

### Core Concepts

```
Experience  → top-level app (e.g. "Retro Facilitator")
Page        → route within the experience (e.g. "/session/{id}")
Component   → reusable UI block on a page
Data resource → data binding (Table API, Scripted, Flow trigger)
```

### Page Parameters

```javascript
// Define page parameters in page properties
// Parameter name: session_id
// Type: String

// Access in component event handler:
@context.props.session_id
// OR in data resource:
{session_id: @context.props.session_id}
```

### Data Resource — Table API

```
Data resource type: Look up records
Table: x_axiom_retroapp_retro_item
Conditions: session | is | @context.props.session_id
Fields: content, category, sys_created_on
Order by: sys_created_on desc
Limit: 100
```

### Client State Parameters

```javascript
// Client state = local UI state (like React state)
// NOT persisted, NOT in URL

// Define in page: clientState.selectedCategory = 'all'

// Use in component binding:
@state.selectedCategory

// Update via event handler (UB Action):
Set value: clientState.selectedCategory = 'went_well'
```

### Component Events → Flow Trigger

```
On button click → Trigger flow
Flow: Submit Retro Item
Inputs:
  session_id → @context.props.session_id
  content    → @state.inputContent
  category   → @state.selectedCategory
On success: Refresh data resource
On error:   Show error toast
```

---

## Zurich / Australia — UI Gotchas

| Issue | Detail |
|---|---|
| UI Builder scope | Experience must be created in your scoped app scope |
| Service Portal scope | Portal and pages are typically in global scope — widgets in your app scope |
| Anonymous access | Service Portal supports it natively; UI Builder requires explicit role assignment |
| Mobile | Service Portal is more mobile-friendly out of the box |
| Component library | UI Builder uses Now Design System (NDS) components — Zurich / Australia NDS may have new components; check release notes before assuming a component doesn't exist |
| Deployment | UI Builder pages deploy via now-sdk Fluent format in `src/fluent/` |
| Portal widgets | Deploy as XML via `src/fluent/` — widget server/client/HTML/CSS in separate fields |
| Now Assist sidebar | GA in Zurich / Australia Workspaces — enable via Workspace config, no custom code required for OOB summarisation |
| Employee Center version | EC receives UX updates per release — verify theme and topic card config against the actual Zurich / Australia EC version on the PDI during PREP |

---

## Employee Center

Employee Center (EC) is the standard ServiceNow employee self-service experience. It runs on top of Service Portal but with a specific theme, homepage tiles, and topic-based navigation.

**When to choose EC over a custom SP portal:**
- The pitch framing is "modern employee experience" — EC looks polished out of the box
- You want curated topic cards (e.g., "IT Help", "HR Requests") with no custom layout work
- The primary user is an employee on a desktop or mobile browser

**Hackathon build pattern:**
- EC homepage and branding: configure in Platform UI (no SDK deployment required)
- Custom content: create SP widgets in your scoped app, embed on an EC page
- EC-specific components (topic cards, featured content) are configured in `Employee Center > Pages` — not Fluent SDK

**Plugin check (PREP):**
```javascript
gs.info('Employee Center active: ' + GlidePluginManager.isActive('com.sn_hr_core'));
// Also check: sn_employee_center plugin
```

**Gotcha:** EC uses its own theme — do not try to apply the default SP theme or a custom bootstrap theme to an EC page. Style via EC branding settings only.

---

## UI Builder Workspaces

Workspaces are role-specific agent experiences built in UI Builder. They are the correct channel for managers, fulfillers, and agents who need a structured work queue + record detail view.

**Core workspace anatomy:**
```
Workspace
├── List view        — filtered record queue (e.g. open tickets assigned to me)
├── Record view      — detail pane with related data and actions
├── Activity feed    — timeline of updates / notes
└── Now Assist panel — AI sidebar (if Now Assist is in scope)
```

**When to choose Workspace over SP:**
- The primary user is a manager, agent, or fulfiller (not a self-service submitter)
- You need a work-queue list view + record detail side-by-side
- Now Assist AI sidebar is part of the pitch

**Fluent SDK deployment:**
```typescript
// Workspace experiences deploy as UIBuilder artifacts
// Define in src/fluent/experiences/<name>.now.ts
// Use Now.ID['exp0'], Now.ID['page0'], etc.
```

**Plugin check (PREP):**
```javascript
gs.info('UI Builder active: ' + GlidePluginManager.isActive('com.glide.ui-builder'));
// Workspaces require UI Builder — always present on Zurich / Australia PDI
```

**Gotcha:** Workspace data resources use the Table API or a scripted data resource — they do not call Script Includes directly. Pass data via a REST API endpoint or Scripted Data Resource defined in your scoped app.

---

## Now Assist / Voice AI

Now Assist is ServiceNow's platform-native GenAI experience. It can be embedded in both Service Portal (via a chatbot/virtual agent panel) and Workspaces (as a native AI sidebar).

**Applicable UX targets:**

| Context | Now Assist role |
|---|---|
| Workspace sidebar | Summarise record, suggest next actions, generate responses |
| Service Portal | Virtual Agent chatbot (NLU-driven conversation flows) |
| Voice AI | Spoken interface on top of Virtual Agent — additional plugin required |

**For hackathon — two realistic options:**

**Option A: Out-of-box Now Assist in Workspace (lowest effort)**
- Enable Now Assist on the workspace
- Configure which record types it has context for
- No custom skill required — uses OOB summarisation and Q&A
- Build time: ~1 hour configuration, no code

**Option B: Custom Now Assist skill (medium effort)**
- Define a prompt template that calls your data (e.g. kudos history)
- Wire via Now Assist Skill Kit
- Exposes a new capability in the Now Assist panel ("Summarise team kudos")
- Build time: 2–3 hours including testing

**Option C: Virtual Agent topic (for SP chatbot)**
- Define a conversation topic with NLU triggers
- Script actions using Flow Designer
- Build time: 2–3 hours minimum; skip if SP widget covers the same use case

**Plugin check (PREP):**
```javascript
gs.info('Now Assist active: ' + GlidePluginManager.isActive('com.glide.now_assist'));
gs.info('Virtual Agent active: ' + GlidePluginManager.isActive('com.glide.cs.va'));
gs.info('Voice AI active: ' + GlidePluginManager.isActive('com.glide.itsm.voice'));
```

**Gotcha:** Now Assist and Virtual Agent are separate plugins. Now Assist = AI sidebar / skill kit. Virtual Agent = NLU chatbot flow builder. Do not conflate them in the architecture doc — name the specific plugin.

**Voice AI — hackathon verdict:** Do not scope Voice AI unless the pitch is explicitly about voice. It requires an additional plugin, telephony configuration, and test infrastructure that cannot be validated in a single session.

---

## Mobile

ServiceNow mobile apps are built in Mobile Studio, a dedicated GUI tool separate from UI Builder and Service Portal.

**Hackathon verdict: default to not scoping mobile.**

| Consideration | Detail |
|---|---|
| Build tool | Mobile Studio (no SDK Fluent deployment) |
| App types | Mobile Agent, Mobile Onboarding, Now Mobile (custom) |
| Build time | Minimum 3–4 hours for a functional custom view |
| Testing | Requires physical device or simulator setup |
| Pitch value | High visual impact, but risky to demo if not fully tested |

**Only scope mobile if:**
- The pitch concept is fundamentally mobile-first (e.g. field worker, on-the-go approval)
- Alex has explicitly approved it as a scope item
- Build time estimate leaves ≥3 hours for mobile after all other components are done

If scoped: flag to Sam for architecture doc update and request a dedicated `playbook/skills/mobile.md` before build night.

---

## Decision Checklist at T+0

```
[ ] What is the primary user type?
    → Employee / end-user self-service      → Employee Center or custom SP widget
    → Customer / external user              → Customer Service Portal (verify CSM plugin in PREP)
    → Agent / fulfiller / manager           → UI Builder Workspace
    → Any user with AI conversational UX    → Now Assist (which option? A/B/C above)
    → Mobile-primary journey                → Mobile Studio (flag to Alex first)

[ ] Is the primary user anonymous (no login)?     → custom SP portal only (not EC)
[ ] Do we need Now Assist AI?                     → Workspace (OOB) or VA topic (SP)
[ ] Less than 3 hours for UI?                     → Service Portal only. No UI Builder.
[ ] Mobile in scope?                              → Alex approval required first.
```
