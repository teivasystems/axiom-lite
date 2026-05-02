/**
 * ATF Test Setup — AXL-1: ServiceNow Release Table
 * Run this script in Scripts-Background on dev390976.service-now.com
 *
 * Creates:
 *   1 suite  — AXL-1: Release Table Tests
 *   3 tests  — one per AC
 *   13 steps — schema validation, seed data, admin CRUD
 *
 * Idempotent: checks for existing suite/tests by name before creating.
 * Safe to re-run.
 */

(function() {

    // ─── 0. Preflight ────────────────────────────────────────────────────────

    var ATF_PLUGIN = 'com.snc.automated_test_framework';
    if (!GlidePluginManager.isActive(ATF_PLUGIN)) {
        gs.error('ATF SETUP: plugin ' + ATF_PLUGIN + ' is NOT active on this instance. Aborting.');
        return;
    }
    gs.info('ATF SETUP: plugin active. Starting setup...');

    var TABLE = 'x_9274_axm_lite_sn_release';

    // ─── 1. Find "Run Server Side Script" step config ────────────────────────

    var stepCfg = new GlideRecord('sys_atf_step_config');
    stepCfg.addQuery('name', 'Run Server Side Script');
    stepCfg.addQuery('active', true);
    stepCfg.setLimit(1);
    stepCfg.query();
    if (!stepCfg.next()) {
        gs.error('ATF SETUP: "Run Server Side Script" step config not found. Cannot continue.');
        return;
    }
    var SCRIPT_CFG = stepCfg.getUniqueValue();
    gs.info('ATF SETUP: step config sys_id = ' + SCRIPT_CFG);

    // ─── 2. Helpers ──────────────────────────────────────────────────────────

    function getOrCreate(table, queryFields, insertFields) {
        var gr = new GlideRecord(table);
        for (var f in queryFields) gr.addQuery(f, queryFields[f]);
        gr.setLimit(1);
        gr.query();
        if (gr.next()) {
            gs.info('ATF SETUP: existing ' + table + ' "' + (queryFields.name || queryFields.test) + '" — skipping');
            return gr.getUniqueValue();
        }
        var rec = new GlideRecord(table);
        rec.initialize();
        var all = Object.assign({}, queryFields, insertFields);
        for (var k in all) rec.setValue(k, all[k]);
        var id = rec.insert();
        gs.info('ATF SETUP: created ' + table + ' sys_id=' + id);
        return id;
    }

    function addStep(testId, order, description, script) {
        // Idempotent: skip if a step with same test+order already exists
        var existing = new GlideRecord('sys_atf_step');
        existing.addQuery('test', testId);
        existing.addQuery('order', order);
        existing.setLimit(1);
        existing.query();
        if (existing.next()) {
            gs.info('ATF SETUP: step order=' + order + ' already exists for test ' + testId + ' — skipping');
            return existing.getUniqueValue();
        }
        var step = new GlideRecord('sys_atf_step');
        step.initialize();
        step.setValue('test',        testId);
        step.setValue('step_config', SCRIPT_CFG);
        step.setValue('order',       order);
        step.setValue('description', description);
        step.setValue('active',      true);
        // Encode script into the inputs JSON expected by Run Server Side Script
        step.setValue('inputs', JSON.stringify({ script: script }));
        var id = step.insert();
        gs.info('ATF SETUP: step ' + order + ' created: ' + description);
        return id;
    }

    // ─── 3. Suite ────────────────────────────────────────────────────────────

    var suiteId = getOrCreate(
        'sys_atf_test_suite',
        { name: 'AXL-1: Release Table Tests' },
        {
            description: 'ATF coverage for AXL-1 ACs — x_9274_axm_lite_sn_release table',
            active: true,
            run_parallel: false
        }
    );

    // ─── 4. Test 1 — AC-1: Table schema ──────────────────────────────────────

    var t1 = getOrCreate(
        'sys_atf_test',
        { name: 'AXL-1_AC1_Schema_AllFieldsExistWithCorrectTypes' },
        {
            description: 'GIVEN the app is deployed WHEN we inspect the dictionary THEN table x_9274_axm_lite_sn_release exists with fields name(string,unique,mandatory), code(string,unique,mandatory), ga_date(date,mandatory), sequence(integer,mandatory)',
            active: true
        }
    );
    getOrCreate('sys_atf_test_suite_test',
        { test_suite: suiteId, test: t1 },
        { order: 100, abort_on_failure: false }
    );

    // Step 100 — table exists
    addStep(t1, 100, 'Assert: table x_9274_axm_lite_sn_release exists in sys_db_object',
        'var gr = new GlideRecord("sys_db_object");\n' +
        'gr.addQuery("name", "x_9274_axm_lite_sn_release");\n' +
        'gr.setLimit(1);\n' +
        'gr.query();\n' +
        'if (!gr.next()) { throw new Error("Table x_9274_axm_lite_sn_release not found in sys_db_object"); }\n' +
        'outputs.table_label = gr.getValue("label");\n' +
        'gs.info("ATF: table found, label=" + outputs.table_label);'
    );

    // Step 200 — all four fields exist
    addStep(t1, 200, 'Assert: fields name, code, ga_date, sequence all present in sys_dictionary',
        'var required = [\n' +
        '  { name: "name",     type: "string",     mandatory: "1", unique: "1" },\n' +
        '  { name: "code",     type: "string",     mandatory: "1", unique: "1" },\n' +
        '  { name: "ga_date",  type: "glide_date", mandatory: "1", unique: "0" },\n' +
        '  { name: "sequence", type: "integer",    mandatory: "1", unique: "0" }\n' +
        '];\n' +
        'var fails = [];\n' +
        'required.forEach(function(f) {\n' +
        '  var d = new GlideRecord("sys_dictionary");\n' +
        '  d.addQuery("name", "x_9274_axm_lite_sn_release");\n' +
        '  d.addQuery("element", f.name);\n' +
        '  d.setLimit(1);\n' +
        '  d.query();\n' +
        '  if (!d.next()) { fails.push("MISSING field: " + f.name); return; }\n' +
        '  if (d.getValue("internal_type") !== f.type)    { fails.push(f.name + ": type want=" + f.type    + " got=" + d.getValue("internal_type")); }\n' +
        '  if (d.getValue("mandatory")     !== f.mandatory) { fails.push(f.name + ": mandatory want=" + f.mandatory + " got=" + d.getValue("mandatory")); }\n' +
        '  if (d.getValue("unique")        !== f.unique)    { fails.push(f.name + ": unique want="    + f.unique    + " got=" + d.getValue("unique")); }\n' +
        '});\n' +
        'if (fails.length) { throw new Error(fails.join(" | ")); }\n' +
        'gs.info("ATF: all 4 fields validated");'
    );

    // ─── 5. Test 2 — AC-2: Seed data ─────────────────────────────────────────

    var t2 = getOrCreate(
        'sys_atf_test',
        { name: 'AXL-1_AC2_SeedData_26RecordsAspenToZurich' },
        {
            description: 'GIVEN the app is deployed WHEN we count records THEN exactly 26 exist with correct sequence and Zurich is last with correct GA date',
            active: true
        }
    );
    getOrCreate('sys_atf_test_suite_test',
        { test_suite: suiteId, test: t2 },
        { order: 200, abort_on_failure: false }
    );

    // Step 100 — exactly 26 records
    addStep(t2, 100, 'Assert: exactly 26 records in release table',
        'var ga = new GlideAggregate("x_9274_axm_lite_sn_release");\n' +
        'ga.addAggregate("COUNT");\n' +
        'ga.query();\n' +
        'ga.next();\n' +
        'var count = parseInt(ga.getAggregate("COUNT"));\n' +
        'outputs.record_count = count;\n' +
        'if (count !== 26) { throw new Error("Expected 26 records, found " + count); }\n' +
        'gs.info("ATF: record count = " + count);'
    );

    // Step 200 — Aspen is seq 1
    addStep(t2, 200, 'Assert: Aspen exists with sequence=1',
        'var gr = new GlideRecord("x_9274_axm_lite_sn_release");\n' +
        'gr.addQuery("code", "aspen");\n' +
        'gr.setLimit(1);\n' +
        'gr.query();\n' +
        'if (!gr.next()) { throw new Error("Aspen record not found"); }\n' +
        'if (gr.getValue("sequence") !== "1") { throw new Error("Aspen sequence: want=1 got=" + gr.getValue("sequence")); }\n' +
        'if (!gr.getValue("ga_date")) { throw new Error("Aspen ga_date is empty"); }\n' +
        'gs.info("ATF: Aspen seq=" + gr.getValue("sequence") + " ga_date=" + gr.getValue("ga_date"));'
    );

    // Step 300 — Zurich is seq 26, correct GA date
    addStep(t2, 300, 'Assert: Zurich exists with sequence=26 and ga_date=2025-09-01',
        'var gr = new GlideRecord("x_9274_axm_lite_sn_release");\n' +
        'gr.addQuery("code", "zurich");\n' +
        'gr.setLimit(1);\n' +
        'gr.query();\n' +
        'if (!gr.next()) { throw new Error("Zurich record not found"); }\n' +
        'var fails = [];\n' +
        'if (gr.getValue("sequence") !== "26")        { fails.push("sequence: want=26 got=" + gr.getValue("sequence")); }\n' +
        'if (gr.getValue("ga_date")  !== "2025-09-01") { fails.push("ga_date: want=2025-09-01 got=" + gr.getValue("ga_date")); }\n' +
        'if (gr.getValue("name")     !== "Zurich")     { fails.push("name: want=Zurich got=" + gr.getValue("name")); }\n' +
        'if (fails.length) { throw new Error(fails.join(" | ")); }\n' +
        'gs.info("ATF: Zurich validated");'
    );

    // Step 400 — sequences are unique and contiguous
    addStep(t2, 400, 'Assert: sequences 1–26 are all present with no gaps or duplicates',
        'var gr = new GlideRecord("x_9274_axm_lite_sn_release");\n' +
        'gr.orderBy("sequence");\n' +
        'gr.query();\n' +
        'var seqs = [];\n' +
        'while (gr.next()) { seqs.push(parseInt(gr.getValue("sequence"))); }\n' +
        'var fails = [];\n' +
        'for (var i = 0; i < seqs.length; i++) {\n' +
        '  if (seqs[i] !== i + 1) { fails.push("Gap/dup at position " + (i+1) + ": found " + seqs[i]); }\n' +
        '}\n' +
        'if (fails.length) { throw new Error(fails.join(" | ")); }\n' +
        'gs.info("ATF: sequences 1–26 contiguous and unique");'
    );

    // Step 500 — no record has a null ga_date
    addStep(t2, 500, 'Assert: all 26 records have a non-null ga_date',
        'var gr = new GlideRecord("x_9274_axm_lite_sn_release");\n' +
        'gr.addNullQuery("ga_date");\n' +
        'gr.query();\n' +
        'var nullCount = gr.getRowCount();\n' +
        'if (nullCount > 0) {\n' +
        '  var names = [];\n' +
        '  while (gr.next()) { names.push(gr.getValue("name")); }\n' +
        '  throw new Error(nullCount + " records have null ga_date: " + names.join(", "));\n' +
        '}\n' +
        'gs.info("ATF: all records have ga_date");'
    );

    // ─── 6. Test 3 — AC-3: Admin CRUD ────────────────────────────────────────

    var t3 = getOrCreate(
        'sys_atf_test',
        { name: 'AXL-1_AC3_AdminCRUD_InsertUpdateDeleteWithoutCodeChange' },
        {
            description: 'GIVEN the table exists WHEN admin inserts, updates, then deletes a record via GlideRecord (simulating form save) THEN all operations succeed without code changes',
            active: true
        }
    );
    getOrCreate('sys_atf_test_suite_test',
        { test_suite: suiteId, test: t3 },
        { order: 300, abort_on_failure: false }
    );

    // Step 100 — insert
    addStep(t3, 100, 'Setup + Assert: insert a new release record',
        'var suffix = gs.generateGUID().substring(0, 6);\n' +
        'var gr = new GlideRecord("x_9274_axm_lite_sn_release");\n' +
        'gr.initialize();\n' +
        'gr.setValue("name",     "ATF-Test-" + suffix);\n' +
        'gr.setValue("code",     "atf-" + suffix);\n' +
        'gr.setValue("ga_date",  "2099-01-01");\n' +
        'gr.setValue("sequence", 99);\n' +
        'var id = gr.insert();\n' +
        'if (!id) { throw new Error("Insert failed: " + gr.getLastErrorMessage()); }\n' +
        'outputs.test_sys_id = id;\n' +
        'outputs.test_code   = "atf-" + suffix;\n' +
        'gs.info("ATF: inserted " + id);'
    );

    // Step 200 — read back and assert
    addStep(t3, 200, 'Assert: inserted record persists with correct field values',
        'var gr = new GlideRecord("x_9274_axm_lite_sn_release");\n' +
        'if (!gr.get(outputs.test_sys_id)) { throw new Error("Record not found after insert: " + outputs.test_sys_id); }\n' +
        'var fails = [];\n' +
        'if (gr.getValue("ga_date")  !== "2099-01-01") { fails.push("ga_date: want=2099-01-01 got=" + gr.getValue("ga_date")); }\n' +
        'if (gr.getValue("sequence") !== "99")         { fails.push("sequence: want=99 got=" + gr.getValue("sequence")); }\n' +
        'if (fails.length) { throw new Error(fails.join(" | ")); }\n' +
        'gs.info("ATF: insert verified");'
    );

    // Step 300 — update
    addStep(t3, 300, 'Assert: update ga_date succeeds',
        'var gr = new GlideRecord("x_9274_axm_lite_sn_release");\n' +
        'if (!gr.get(outputs.test_sys_id)) { throw new Error("Record not found for update"); }\n' +
        'gr.setValue("ga_date", "2099-06-15");\n' +
        'var ok = gr.update();\n' +
        'if (!ok) { throw new Error("Update failed: " + gr.getLastErrorMessage()); }\n' +
        '// Read back to confirm\n' +
        'var check = new GlideRecord("x_9274_axm_lite_sn_release");\n' +
        'check.get(outputs.test_sys_id);\n' +
        'if (check.getValue("ga_date") !== "2099-06-15") {\n' +
        '  throw new Error("ga_date after update: want=2099-06-15 got=" + check.getValue("ga_date"));\n' +
        '}\n' +
        'gs.info("ATF: update verified");'
    );

    // Step 400 — unique constraint: duplicate code must be rejected
    addStep(t3, 400, 'Assert: inserting a duplicate code is rejected (unique constraint)',
        'var dup = new GlideRecord("x_9274_axm_lite_sn_release");\n' +
        'dup.initialize();\n' +
        'dup.setValue("name",     "ATF-Dup-Name");\n' +
        'dup.setValue("code",     outputs.test_code);  // deliberately duplicate\n' +
        'dup.setValue("ga_date",  "2099-01-01");\n' +
        'dup.setValue("sequence", 98);\n' +
        'var dupId = dup.insert();\n' +
        'if (dupId) {\n' +
        '  // Clean up unexpected record before failing\n' +
        '  var del = new GlideRecord("x_9274_axm_lite_sn_release");\n' +
        '  if (del.get(dupId)) { del.deleteRecord(); }\n' +
        '  throw new Error("Duplicate code was accepted — unique constraint not enforced on code field");\n' +
        '}\n' +
        'gs.info("ATF: duplicate code correctly rejected");'
    );

    // Step 9999 — cleanup (always runs)
    addStep(t3, 9999, 'Cleanup: delete all ATF test records (code starts with atf-)',
        'var gr = new GlideRecord("x_9274_axm_lite_sn_release");\n' +
        'gr.addQuery("code", "STARTSWITH", "atf-");\n' +
        'gr.query();\n' +
        'var n = 0;\n' +
        'while (gr.next()) { gr.deleteRecord(); n++; }\n' +
        'gs.info("ATF cleanup: " + n + " test records deleted");'
    );

    // ─── 7. Summary ──────────────────────────────────────────────────────────

    gs.info('═══════════════════════════════════════════════');
    gs.info('ATF SETUP COMPLETE');
    gs.info('Suite    : AXL-1: Release Table Tests  | ' + suiteId);
    gs.info('Test 1   : AC-1 Schema                 | ' + t1);
    gs.info('Test 2   : AC-2 Seed Data              | ' + t2);
    gs.info('Test 3   : AC-3 Admin CRUD             | ' + t3);
    gs.info('Steps    : 13 total (2 + 5 + 5 + cleanup)');
    gs.info('');
    gs.info('To run the suite from Background Script:');
    gs.info('  var r = new sn_atf.ATFTestSuiteRunner();');
    gs.info('  r.setSuite("' + suiteId + '"); r.run();');
    gs.info('Or navigate to: ATF > Test Suites > AXL-1: Release Table Tests > Run');
    gs.info('═══════════════════════════════════════════════');

})();
