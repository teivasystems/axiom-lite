# Skill — ATF Test Generation from Requirements
**Casey | axiom-lite | dev390976.service-now.com**

> Use this skill when a Jordan build comment lands and the story has ACs worth automating. Generates a complete test suite — suite, tests, steps, assertions, cleanup — from the story's ACs.

---

## When to generate ATF tests

Read the story's ACs and classify each one:

| AC type | Generate ATF? | Test type |
|---------|--------------|-----------|
| Table CRUD (insert/update/delete) | Yes | Server-side script steps |
| Field validation / business rule | Yes | Server-side script steps |
| Uniqueness / mandatory constraints | Yes | Server-side script steps |
| Form UI behavior / client script | Yes | Browser steps (needs test client) |
| Read-only config, no logic | No | Manual spot-check |
| Integration (external API) | Conditional | Script step + mock or skip |

---

## Generation workflow

```
1. Read story + Sam's architecture comment
2. Map each AC to a test scenario
3. Check ATF plugin is active on PDI
4. Discover step config sys_ids (query sys_atf_step_config once per session)
5. Create suite → create test(s) → create steps → add to suite
6. Run and verify
7. Report in Casey's test results comment
```

---

## Step 1 — analyse ACs and map to scenarios

For each AC, write:
- **GIVEN** the system state
- **WHEN** the action
- **THEN** the assertion
- **CLEANUP** what to undo

Example from AXL-1:

| AC | Scenario | Steps |
|----|----------|-------|
| AC-1 | Table exists with correct fields | Query sys_dictionary for name/code/ga_date/sequence; assert each exists and has correct type |
| AC-2 | 26 records Aspen→Zurich | Count records; assert = 26; spot-check Zurich seq=26, ga_date=2025-09-01 |
| AC-3 | Admin can add a record | Insert new record via GlideRecord; assert insert succeeded; cleanup |

---

## Step 2 — discover step config sys_ids (once per session)

```bash
curl -s -u admin:PASSWORD \
  "https://dev390976.service-now.com/api/now/table/sys_atf_step_config?sysparm_query=active%3Dtrue&sysparm_fields=sys_id,name,category&sysparm_limit=200" \
  | python3 -c "
import sys, json
for r in json.load(sys.stdin)['result']:
    print(r['sys_id'], r.get('category',''), r['name'])
" | sort -k2,2 -k3,3
```

Pin the sys_ids you'll use. The four you need most:
- `Record - Insert`
- `Record - Delete`
- `Run Server Side Script`
- `Impersonate`

---

## Step 3 — create suite

```bash
SUITE=$(curl -s -X POST -u admin:PASSWORD \
  "https://dev390976.service-now.com/api/now/table/sys_atf_test_suite" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"AXL-1 Release Table Tests\", \"description\": \"ATF coverage for AXL-1 ACs\", \"active\": \"true\", \"run_parallel\": \"false\"}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['result']['sys_id'])")
echo "Suite: $SUITE"
```

---

## Step 4 — create test (one per AC scenario)

```bash
TEST=$(curl -s -X POST -u admin:PASSWORD \
  "https://dev390976.service-now.com/api/now/table/sys_atf_test" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"AC-3: Admin can insert and delete a release record\",
    \"description\": \"GIVEN the release table exists WHEN admin inserts a record THEN it persists and can be deleted\",
    \"active\": \"true\"
  }" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['result']['sys_id'])")
echo "Test: $TEST"
```

---

## Step 5 — generate steps with Background Script

Use this pattern when creating many steps for a single test — one Background Script call creates all of them atomically:

```javascript
// Scripts-Background on dev390976
// Replace TEST_ID and SCRIPT_CONFIG with your values

var testId = 'TEST_ID';
var scriptConfig = 'SCRIPT_CONFIG_SYS_ID';  // Run Server Side Script

function addStep(order, description, script) {
    var step = new GlideRecord('sys_atf_step');
    step.initialize();
    step.setValue('test', testId);
    step.setValue('step_config', scriptConfig);
    step.setValue('order', order);
    step.setValue('description', description);
    step.setValue('active', true);
    // Note: actual script input injection varies by step_config —
    // check inputs field format for the specific config first
    step.insert();
}

addStep(100, 'Setup: Insert test release record', '');
addStep(200, 'Assert: Record persists with correct fields', '');
addStep(300, 'Assert: Unique constraint blocks duplicate code', '');
addStep(9999, 'Cleanup: Delete test release records', '');

gs.info('Steps created for test ' + testId);
```

---

## Step 6 — server-side script templates

### Template A — Insert + assert fields

```javascript
// Step 100 — insert
var gr = new GlideRecord('x_9274_axm_lite_sn_release');
gr.initialize();
gr.setValue('name',     'ATF-Test-' + gs.generateGUID().substring(0,6));
gr.setValue('code',     'atf-' + gs.generateGUID().substring(0,6));
gr.setValue('ga_date',  '2099-06-01');
gr.setValue('sequence', 999);
var id = gr.insert();
if (!id) { throw new Error('Insert failed: ' + gr.getLastErrorMessage()); }
outputs.test_sys_id = id;
outputs.test_code   = gr.getValue('code');
```

```javascript
// Step 200 — assert fields persisted
var gr = new GlideRecord('x_9274_axm_lite_sn_release');
if (!gr.get(outputs.test_sys_id)) { throw new Error('Record not found after insert'); }

var checks = {
    ga_date:  { got: gr.getValue('ga_date'),  want: '2099-06-01' },
    sequence: { got: gr.getValue('sequence'), want: '999' },
};
var fails = [];
for (var f in checks) {
    if (checks[f].got !== checks[f].want) {
        fails.push(f + ': want=' + checks[f].want + ' got=' + checks[f].got);
    }
}
if (fails.length) { throw new Error(fails.join('; ')); }
```

### Template B — Count assertion (AC-2 style)

```javascript
// Assert exactly 26 records exist
var gr = new GlideAggregate('x_9274_axm_lite_sn_release');
gr.addAggregate('COUNT');
gr.query();
gr.next();
var count = parseInt(gr.getAggregate('COUNT'));
if (count !== 26) {
    throw new Error('Expected 26 records, found ' + count);
}
// Spot-check Zurich
var zurich = new GlideRecord('x_9274_axm_lite_sn_release');
zurich.addQuery('code', 'zurich');
zurich.query();
if (!zurich.next()) { throw new Error('Zurich record missing'); }
if (zurich.getValue('sequence') !== '26') {
    throw new Error('Zurich sequence: want=26 got=' + zurich.getValue('sequence'));
}
if (zurich.getValue('ga_date') !== '2025-09-01') {
    throw new Error('Zurich ga_date: want=2025-09-01 got=' + zurich.getValue('ga_date'));
}
```

### Template C — Unique constraint test

```javascript
// Try inserting a duplicate code — expect it to fail or be blocked
var existing = new GlideRecord('x_9274_axm_lite_sn_release');
existing.addQuery('code', 'zurich');
existing.query();
existing.next();
var dupCode = existing.getValue('code');

var dup = new GlideRecord('x_9274_axm_lite_sn_release');
dup.initialize();
dup.setValue('name',     'Duplicate Zurich');
dup.setValue('code',     dupCode);   // duplicate
dup.setValue('ga_date',  '2025-09-01');
dup.setValue('sequence', 100);
var dupId = dup.insert();

// Unique constraint should prevent this
if (dupId) {
    // Clean up the duplicate before failing
    var cleanup = new GlideRecord('x_9274_axm_lite_sn_release');
    if (cleanup.get(dupId)) { cleanup.deleteRecord(); }
    throw new Error('Duplicate code was accepted — unique constraint not enforced');
}
// If insert returned null/false, unique constraint worked correctly
```

### Template D — Cleanup (always order 9999)

```javascript
// Cleanup all records created by this test (identified by code prefix)
var gr = new GlideRecord('x_9274_axm_lite_sn_release');
gr.addQuery('code', 'STARTSWITH', 'atf-');
gr.query();
var n = 0;
while (gr.next()) { gr.deleteRecord(); n++; }
gs.info('ATF cleanup: ' + n + ' test records deleted');
```

---

## Step 7 — add test to suite

```bash
curl -s -X POST -u admin:PASSWORD \
  "https://dev390976.service-now.com/api/now/table/sys_atf_test_suite_test" \
  -H "Content-Type: application/json" \
  -d "{\"test_suite\": \"$SUITE\", \"test\": \"$TEST\", \"order\": \"100\", \"abort_on_failure\": \"false\"}"
```

---

## Step 8 — run and read results

```javascript
// Background Script
var runner = new sn_atf.ATFTestSuiteRunner();
runner.setSuite('SUITE_SYS_ID');
var resultId = runner.run();
gs.info('Result ID: ' + resultId);
```

```bash
# Poll result status
curl -s -u admin:PASSWORD \
  "https://dev390976.service-now.com/api/now/table/sys_atf_test_result/RESULT_ID?sysparm_fields=status,output,start_time,end_time" \
  | python3 -c "import sys,json; d=json.load(sys.stdin)['result']; print(d['status'], d.get('output','')[:300])"
```

---

## Reporting back to Casey's test results

After ATF runs, append to the test results Jira comment:

```
ATF:
  Suite: AXL-1 Release Table Tests
  Tests run: N | Pass: N | Fail: 0
  Result URL: https://dev390976.service-now.com/sys_atf_test_result.do?sys_id=RESULT_ID
```

If ATF plugin is inactive on the PDI, add:
```
ATF: skipped — com.snc.automated_test_framework plugin not active on dev390976
```

---

## Test naming convention

```
<StoryKey>_<AC>_<Scenario>_<ExpectedResult>

AXL-1_AC3_AdminInsert_SucceedsAndPersists
AXL-1_AC2_RecordCount_Equals26
AXL-1_AC1_UniqueCode_BlocksDuplicate
```

---

## Anti-patterns to avoid

- **Hardcoded sys_ids** for users/groups — they differ across PDIs
- **No cleanup step** — test data accumulates and pollutes the instance
- **Assertions on display values** — use `getValue()`, not `getDisplayValue()`, for numeric comparisons
- **abort_on_failure=true on setup steps** — if setup fails, cleanup still must run
- **Testing OOB platform behaviour** — only test what the story built
