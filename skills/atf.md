# Skill — Automated Test Framework (ATF)
**Casey | axiom-lite | &lt;YOUR_INSTANCE&gt;.service-now.com**

> Run ATF checks after every Jordan build comment. Prefer server-side tests over browser tests — faster, more reliable, no test client needed.

---

## ATF architecture

```
Test Suite
  └─ Test 1 (one scenario)
       ├─ Step 100: Setup    — create isolated test data
       ├─ Step 200: Action   — trigger the thing being tested
       ├─ Step 300: Assert   — verify the outcome
       └─ Step 9999: Cleanup — delete test data (runs even on failure)
```

---

## Plugin check — run before any ATF work

```javascript
// Scripts-Background on <YOUR_INSTANCE>
gs.info('ATF active: ' + GlidePluginManager.isActive('com.snc.automated_test_framework'));
// Expected: true — if false, ATF cannot run on this PDI
```

---

## Key tables

| Table | Purpose |
|-------|---------|
| `sys_atf_test_suite` | Suite containers |
| `sys_atf_test` | Individual test definitions |
| `sys_atf_step` | Ordered steps within a test |
| `sys_atf_step_config` | Step type definitions (query these to get sys_ids) |
| `sys_atf_test_suite_test` | Suite ↔ test relationships |
| `sys_atf_test_result` | Execution results |
| `sys_atf_step_result` | Per-step results |
| `sys_atf_parameter` | Test parameters |

---

## Step 0 — discover step config sys_ids

Step configs vary by instance. Always query before hardcoding.

```bash
# Get all active step configs
curl -s -u <INSTANCE_USER>:<INSTANCE_PASSWORD> \
  "https://<YOUR_INSTANCE>.service-now.com/api/now/table/sys_atf_step_config?sysparm_query=active%3Dtrue&sysparm_fields=sys_id,name,category&sysparm_limit=200&sysparm_display_value=true" \
  | python3 -c "import sys,json; [print(r['sys_id']['value'], r['category']['display_value'] if isinstance(r['category'],dict) else r['category'], r['name']['display_value'] if isinstance(r['name'],dict) else r['name']) for r in json.load(sys.stdin)['result']]"
```

Essential step configs to note:
| Step config name | Category | Use for |
|-----------------|----------|---------|
| Record - Insert | Record | Create test record |
| Record - Query | Record | Find record by query |
| Record - Update | Record | Modify record fields |
| Record - Delete | Record | Remove record |
| Run Server Side Script | Script | Custom logic + assertions |
| Impersonate | Security | Test as different user |
| Log Message | Debug | Output diagnostic info |
| Wait | Flow | Pause for async ops |

---

## Create a test suite (REST)

```bash
curl -s -X POST -u <INSTANCE_USER>:<INSTANCE_PASSWORD> \
  "https://<YOUR_INSTANCE>.service-now.com/api/now/table/sys_atf_test_suite" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AXL Release Table Tests",
    "description": "ATF tests for x_<prefix>_<app>_<table> table",
    "active": "true",
    "run_parallel": "false"
  }' | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['result']['sys_id'])"
```

---

## Create a test (REST)

```bash
curl -s -X POST -u <INSTANCE_USER>:<INSTANCE_PASSWORD> \
  "https://<YOUR_INSTANCE>.service-now.com/api/now/table/sys_atf_test" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Verify release record can be created and read",
    "description": "AC-1 + AC-3: table exists, fields correct, admin can CRUD",
    "active": "true"
  }' | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['result']['sys_id'])"
```

---

## Create test steps (REST)

### Setup — create test record

```bash
curl -s -X POST -u <INSTANCE_USER>:<INSTANCE_PASSWORD> \
  "https://<YOUR_INSTANCE>.service-now.com/api/now/table/sys_atf_step" \
  -H "Content-Type: application/json" \
  -d '{
    "test": "TEST_SYS_ID",
    "step_config": "RECORD_INSERT_CONFIG_SYS_ID",
    "order": "100",
    "description": "Setup: Insert test release record",
    "active": "true"
  }'
```

### Action / Assert — server-side script

Use "Run Server Side Script" for anything needing GlideRecord logic or complex assertions:

```javascript
// Step script (inputs.script field value)
var gr = new GlideRecord('x_<prefix>_<app>_<table>');
gr.initialize();
gr.setValue('name',     'ATF Test Release');
gr.setValue('code',     'atf-test');
gr.setValue('ga_date',  '2099-01-01');
gr.setValue('sequence', 99);
var sysId = gr.insert();

if (!sysId) {
    throw new Error('Insert failed: ' + gr.getLastErrorMessage());
}

outputs.test_record_sys_id = sysId;
outputs.test_record_number = gr.getValue('name');
```

### Assert field value

```javascript
// Assert step script
var gr = new GlideRecord('x_<prefix>_<app>_<table>');
gr.get(outputs.test_record_sys_id);  // from previous step output

var assertions = [
    { field: 'name',     expected: 'ATF Test Release',  actual: gr.getValue('name') },
    { field: 'code',     expected: 'atf-test',          actual: gr.getValue('code') },
    { field: 'sequence', expected: '99',                actual: gr.getValue('sequence') },
];

var failures = [];
assertions.forEach(function(a) {
    if (a.actual !== a.expected) {
        failures.push(a.field + ': expected "' + a.expected + '", got "' + a.actual + '"');
    }
});

if (failures.length > 0) {
    throw new Error('Assertion failures: ' + failures.join('; '));
}
```

### Cleanup (order 9999 — always runs)

```javascript
// Cleanup step script
var gr = new GlideRecord('x_<prefix>_<app>_<table>');
gr.addQuery('code', 'atf-test');
gr.query();
while (gr.next()) {
    gr.deleteRecord();
}
gs.info('ATF cleanup: deleted test release records');
```

---

## Add test to suite (REST)

```bash
curl -s -X POST -u <INSTANCE_USER>:<INSTANCE_PASSWORD> \
  "https://<YOUR_INSTANCE>.service-now.com/api/now/table/sys_atf_test_suite_test" \
  -H "Content-Type: application/json" \
  -d '{
    "test_suite": "SUITE_SYS_ID",
    "test": "TEST_SYS_ID",
    "order": "100",
    "abort_on_failure": "false"
  }'
```

---

## Run a test (Background Script)

```javascript
// Scripts-Background on <YOUR_INSTANCE>
var runner = new sn_atf.ATFTestRunner();
runner.setTest('TEST_SYS_ID');
var resultId = runner.run();
gs.info('ATF result ID: ' + resultId);
```

## Run a suite (Background Script)

```javascript
var runner = new sn_atf.ATFTestSuiteRunner();
runner.setSuite('SUITE_SYS_ID');
var resultId = runner.run();
gs.info('ATF suite result ID: ' + resultId);
```

---

## Query results (REST)

```bash
# Latest results for a test
curl -s -u <INSTANCE_USER>:<INSTANCE_PASSWORD> \
  "https://<YOUR_INSTANCE>.service-now.com/api/now/table/sys_atf_test_result?sysparm_query=test%3DTEST_SYS_ID%5EORDERBYDESCstart_time&sysparm_fields=sys_id,status,start_time,end_time,duration,output&sysparm_limit=5&sysparm_display_value=true"

# Step-level results for a failed test
curl -s -u <INSTANCE_USER>:<INSTANCE_PASSWORD> \
  "https://<YOUR_INSTANCE>.service-now.com/api/now/table/sys_atf_step_result?sysparm_query=test_result%3DRESULT_SYS_ID%5Estatus%3Dfailure&sysparm_fields=step.description,status,output,failure_reason&sysparm_limit=50"
```

---

## Impersonation — test as non-admin

```javascript
// Add an Impersonate step before the action steps
// Step config: "Impersonate"
// After the test, add another Impersonate step with stop_impersonation=true

// OR in a server-side script step:
var runner = new sn_atf.ATFTestRunner();
runner.setTest('TEST_SYS_ID');
runner.setImpersonateUser('USER_SYS_ID');
runner.run();
```

---

## Test data — isolation rules

- **Always use unique data:** suffix names with `gs.generateGUID().substring(0, 8)` or a known marker like `'ATF-' + tableName`
- **Never reference live users or groups by sys_id** — they may not exist on every PDI
- **Cleanup step order must be 9999** — set `abort_on_failure=false` on all earlier steps so cleanup still runs
- **Orphan sweep** (run if cleanup fails):

```javascript
// Scripts-Background
var gr = new GlideRecord('x_<prefix>_<app>_<table>');
gr.addQuery('code', 'STARTSWITH', 'atf-');
gr.addQuery('sys_created_on', '<', gs.daysAgo(1));
gr.query();
var n = 0;
while (gr.next()) { gr.deleteRecord(); n++; }
gs.info('ATF orphan sweep: deleted ' + n + ' records');
```

---

## Assertion operators (Verify field value step)

| Operator | Example |
|----------|---------|
| `=` | state = 2 |
| `!=` | state != 7 |
| `<`, `<=`, `>`, `>=` | sequence >= 1 |
| `contains` | name contains "Zurich" |
| `starts with` | code starts with "z" |
| `is empty` / `is not empty` | assigned_to is empty |

---

## Casey's ATF trigger rule

| Situation | Action |
|-----------|--------|
| Story has ≥ 2 ACs involving table reads/writes | Write server-side ATF test |
| Story involves business rule, flow, or script include | Write server-side ATF test |
| Story involves form UI behavior | Write browser ATF test (note: needs test client) |
| Simple read-only config, no logic | Skip ATF, manual check sufficient |
| ATF plugin inactive on PDI | Skip ATF, note in test results comment |

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Test stuck at "Pending" | ATF runner not scheduled or test client missing | Check `sys_atf_schedule` table; for server tests no client needed |
| `${variable}` appears literally | Variable not set by prior step | Check step order and output variable name |
| Cleanup skipped on failure | `abort_on_failure=true` on a step | Set `abort_on_failure=false` on all non-final steps |
| Browser test fails randomly | Timing / page load race | Add Wait step before UI interaction |
| `sn_atf is not defined` | ATF plugin inactive | Check plugin: `GlidePluginManager.isActive('com.snc.automated_test_framework')` |
