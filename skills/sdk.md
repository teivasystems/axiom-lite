
# fluent-sdk v1.0.0

Hybrid ServiceNow development using the three-tier approach - NowSDK Fluent for metadata-as-code, MCP REST for runtime operations, and fix scripts as manual fallback

Author: Happy Technologies LLC
Category: development
Complexity: expert
Tags: development, nowsdk, fluent, flows, scoped-apps, metadata-as-code, deployment, catalog, tables, business-rules
Platforms: claude-code, claude-desktop, cursor, any

Tools:
  mcp: SN-Query-Table, SN-Create-Record, SN-Update-Record, SN-Get-Table-Schema, SN-Execute-Background-Script, SN-Create-Fix-Script, SN-Set-Current-Application, SN-Set-Update-Set, SN-Get-Current-Update-Set, SN-Inspect-Update-Set
  cli: now-sdk build, now-sdk deploy, now-sdk auth, now-sdk explain
  native: Bash, Read, Write

## Procedure

### Step 1: Environment Setup

Follow `vendor/now-sdk-setup.md` to verify NowSDK is installed and working:

```bash
# Check Node version (must be 20+)
node --version

# Check SDK version (must be 4.6.0+)
npx @servicenow/sdk --version

# If not installed or outdated:
npm install -g @servicenow/sdk@latest

# Authenticate to your instance
now-sdk auth
# Follow prompts: instance URL, credentials
```

**Verify with explain command:**
```bash
npx @servicenow/sdk explain quickstart --list --format=raw
```

**Then familiarize yourself** with the Fluent API for whatever you're about to build:
```bash
# Example: about to create flows
npx @servicenow/sdk explain Flow --list --peek --format=raw
npx @servicenow/sdk explain Flow --format=raw
```

### Step 2: Determine the Right Tier

Before writing any code, classify the request:

**Route to Tier 1 (Fluent) when:**
- Creating new metadata from scratch (flows, tables, business rules, catalog items)
- Building a scoped application
- Need version-controlled, reproducible deployments
- Flow Designer operations (REST API cannot create flows)
- Complex catalog items with variable sets, pricing, access controls

**Route to Tier 2 (MCP REST) when:**
- Querying or modifying live data
- Managing update sets (inspect, move, clone)
- One-off record updates on existing records
- Running background scripts
- Verifying Tier 1 deployments

**Route to Tier 3 (Fix Script) when:**
- Flow compilation (must happen in UI after deploy)
- UI Policy action linking via `setValue()`
- Complex GlideRecord operations not exposed via REST
- Bulk data operations requiring server-side performance

### Step 3: Scaffold a Fluent Project (Tier 1)

Create the project structure for a new scoped application.

**Project Structure:**
```
my-sn-app/
├── now.config.json          # Scope and instance config
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config (optional)
├── src/
│   └── fluent/
│       ├── generated/
│       │   └── keys.ts      # Auto-generated sys_id mappings
│       ├── tables.now.ts    # Table definitions
│       ├── rules.now.ts     # Business rules
│       ├── flows.now.ts     # Flow definitions
│       ├── catalog.now.ts   # Catalog items
│       ├── acls.now.ts      # Access controls
│       └── *.server.js      # External script files
└── src/
    └── server/              # Server-side TypeScript modules
```

**now.config.json:**
```json
{
  "scope": "x_myapp",
  "scopeId": "<sys_id from instance or generated on first deploy>"
}
```

**package.json:**
```json
{
  "name": "my-sn-app",
  "version": "1.0.0",
  "scripts": {
    "build": "now-sdk build",
    "deploy": "now-sdk deploy",
    "explain": "now-sdk explain"
  },
  "devDependencies": {
    "@servicenow/glide": "catalog:",
    "@servicenow/sdk": "catalog:",
    "typescript": "catalog:"
  }
}
```

### Step 4: Write Fluent Definitions

#### Tables

```typescript
// src/fluent/tables.now.ts
import {
  Table, StringColumn, IntegerColumn, BooleanColumn,
  DateColumn, ReferenceColumn
} from '@servicenow/sdk/core'

export const x_myapp_request = Table({
  name: 'x_myapp_request',
  schema: {
    title: StringColumn({ mandatory: true, label: 'Title', maxLength: 200 }),
    priority: IntegerColumn({ mandatory: true, label: 'Priority' }),
    active: BooleanColumn({ mandatory: true, label: 'Active', default: true }),
    due_date: DateColumn({ label: 'Due Date' }),
    assigned_to: ReferenceColumn({
      label: 'Assigned To',
      referenceTable: 'sys_user',
    }),
  },
})
```

#### Business Rules

```typescript
// src/fluent/rules.now.ts
import { BusinessRule } from '@servicenow/sdk/core'

export const validatePriority = BusinessRule({
  $id: Now.ID['validate_priority'],
  name: 'Validate Priority on Create',
  active: true,
  table: 'x_myapp_request',
  when: 'before',
  insert: true,
  script: Now.include('./validate-priority.server.js'),
})
```

```javascript
// src/fluent/validate-priority.server.js
(function executeRule(current, previous) {
  if (!current.priority || current.priority < 1 || current.priority > 5) {
    current.priority = 3; // Default to medium
  }
  if (!current.assigned_to && current.priority == 1) {
    gs.addErrorMessage('Critical requests must have an assignee');
    current.setAbortAction(true);
  }
})(current, previous);
```

#### Flows

```typescript
// src/fluent/flows.now.ts
import { action, Flow, wfa, trigger } from '@servicenow/sdk/automation'

export const escalationFlow = Flow(
  {
    $id: Now.ID['request_escalation_flow'],
    name: 'Request Escalation Flow',
    description: 'Escalates high-priority requests when unassigned after creation',
  },
  wfa.trigger(
    trigger.record.created,
    { $id: Now.ID['new_request_trigger'] },
    {
      table: 'x_myapp_request',
      condition: 'priority=1^assigned_toISEMPTY',
      run_flow_in: 'background',
      run_on_extended: 'false',
      run_when_setting: 'both',
      run_when_user_setting: 'any',
      run_when_user_list: [],
    }
  ),
  (params) => {
    // Log the escalation
    wfa.action(
      action.core.log,
      { $id: Now.ID['log_escalation'] },
      {
        log_level: 'warn',
        log_message: `Escalating unassigned critical request: ${wfa.dataPill(params.trigger.current.title, 'string')}`,
      }
    )

    // Look up the on-call manager
    const manager = wfa.action(
      action.core.lookUpRecord,
      { $id: Now.ID['lookup_oncall_manager'] },
      {
        table: 'sys_user',
        conditions: 'active=true^roles=manager',
        sort_type: 'sort_asc',
        if_multiple_records_are_found_action: 'use_first_record',
      }
    )

    // Auto-assign to manager
    wfa.action(
      action.core.updateRecord,
      { $id: Now.ID['assign_to_manager'] },
      {
        table_name: 'x_myapp_request',
        record: wfa.dataPill(params.trigger.current.sys_id, 'reference'),
        values: TemplateValue({
          assigned_to: wfa.dataPill(manager.Record.sys_id, 'reference'),
        }),
      }
    )

    // Send notification
    wfa.action(
      action.core.sendEmail,
      { $id: Now.ID['notify_manager'] },
      {
        table_name: 'x_myapp_request',
        watermark_email: true,
        ah_subject: `Critical Request Escalation: ${wfa.dataPill(params.trigger.current.title, 'string')}`,
        ah_body: `A critical request has been auto-assigned to you.`,
        record: wfa.dataPill(params.trigger.current.sys_id, 'reference'),
        ah_to: wfa.dataPill(manager.Record.email, 'string'),
      }
    )
  }
)
```

#### Catalog Items

```typescript
// src/fluent/catalog.now.ts
import {
  CatalogItem, VariableSet, SingleLineTextVariable,
  MultiLineTextVariable, SelectBoxVariable, ReferenceVariable,
  RequestedForVariable
} from '@servicenow/sdk/core'

const requestInfoVarSet = VariableSet({
  $id: Now.ID['request_info_varset'],
  title: 'Request Details',
  description: 'Core information for the request',
  internalName: 'request_info_varset',
  type: 'singleRow',
  layout: 'normal',
  order: 100,
  displayTitle: true,
  version: 1,
  variables: {
    requestTitle: SingleLineTextVariable({
      question: 'Request Title',
      mandatory: true,
      order: 100,
    }),
    requestDescription: MultiLineTextVariable({
      question: 'Description',
      mandatory: true,
      order: 200,
    }),
    requestPriority: SelectBoxVariable({
      question: 'Priority',
      mandatory: true,
      order: 300,
      choices: {
        critical: { label: '1 - Critical' },
        high: { label: '2 - High' },
        medium: { label: '3 - Medium' },
        low: { label: '4 - Low' },
      },
      defaultValue: 'medium',
    }),
  },
  name: 'Request Details',
})

export const newRequestCatalogItem = CatalogItem({
  $id: Now.ID['new_request_catalog_item'],
  name: 'New Service Request',
  shortDescription: 'Submit a new service request',
  description: 'Use this form to submit a service request. Critical requests trigger automatic escalation.',
  catalogs: ['e0d08b13c3330100c8b837659bba8fb4'], // Service Catalog
  categories: ['d258b953c611227a0146101fb1be7c31'], // Hardware (or your category)
  variableSets: [{ variableSet: requestInfoVarSet, order: 100 }],
  executionPlan: '523da512c611228900811a37c97c2014',
  variables: {
    requestedFor: RequestedForVariable({
      order: 1,
      question: 'Requested For',
    }),
    assignmentGroup: ReferenceVariable({
      order: 2,
      question: 'Assignment Group',
      referenceTable: 'sys_user_group',
    }),
  },
})
```

### Step 5: Build and Deploy (Tier 1)

```bash
# Build the project (validates TypeScript, generates metadata)
now-sdk build

# Deploy to instance (creates/updates scoped app and all metadata)
now-sdk deploy
```

### Step 6: Verify with MCP Tools (Tier 2)

After Fluent deployment, use MCP tools to verify everything landed correctly.

```
Tool: SN-Query-Table
Parameters:
  table_name: sys_update_xml
  query: application=<app_sys_id>
  fields: sys_id,type,name,sys_created_on
  limit: 50
```

```
Tool: SN-Get-Table-Schema
Parameters:
  table_name: x_myapp_request
```

```
Tool: SN-Query-Table
Parameters:
  table_name: sys_script
  query: collection=x_myapp_request^active=true
  fields: name,when,active
```

### Step 7: Handle Fallthrough to Fix Scripts (Tier 3)

For operations that neither Fluent nor REST can handle, generate fix scripts.

**Flow Compilation (post-deploy):**
```
Tool: SN-Create-Fix-Script
Parameters:
  name: "Compile Escalation Flow"
  description: "Compile the request escalation flow after Fluent deployment"
  script: |
    // Navigate to Flow Designer and compile:
    // 1. Open Flow Designer
    // 2. Find "Request Escalation Flow"
    // 3. Click "Activate" to compile and enable
    //
    // This step cannot be automated - Flow Designer compilation
    // requires the UI runtime environment.
    gs.info('Manual step: Compile flow in Flow Designer UI');
```

**UI Policy Action Linking (if needed):**
```
Tool: SN-Execute-Background-Script
Parameters:
  script: |
    var gr = new GlideRecord('sys_ui_policy_action');
    gr.addQuery('ui_policy', '<ui_policy_sys_id>');
    gr.addQuery('catalog_variable', '');
    gr.query();
    while (gr.next()) {
      gr.catalog_variable = 'IO:<variable_sys_id>';
      gr.update();
    }
  description: "Link UI Policy actions to catalog variables"
  execution_method: trigger
```

**Bulk Data Operations:**
```
Tool: SN-Create-Fix-Script
Parameters:
  name: "Seed Sample Data"
  description: "Create initial sample records for testing"
  script: |
    var records = [
      { title: 'Test Request 1', priority: 1 },
      { title: 'Test Request 2', priority: 3 },
      { title: 'Test Request 3', priority: 5 }
    ];
    records.forEach(function(data) {
      var gr = new GlideRecord('x_myapp_request');
      gr.initialize();
      gr.title = data.title;
      gr.priority = data.priority;
      gr.active = true;
      gr.insert();
    });
    gs.info('Created ' + records.length + ' sample records');
```
