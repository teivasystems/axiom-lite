
# test-generation v1.0.0

Generate ATF (Automated Test Framework) tests from requirements or existing functionality including test steps, assertions, and test data

Author: Happy Technologies LLC
Category: development
Complexity: advanced
Tags: development, testing, atf, automated-testing, test-framework, test-generation, quality, assertions
Platforms: claude-code, claude-desktop, chatgpt, cursor, any

Tools:
  mcp: SN-Query-Table, SN-Create-Record, SN-Update-Record, SN-NL-Search, SN-Execute-Background-Script, SN-Discover-Table-Schema
  rest: /api/now/table/sys_atf_test, /api/now/table/sys_atf_step, /api/now/table/sys_atf_test_suite_test, /api/now/table/sys_atf_test_result, /api/now/table/sys_atf_step_config, /api/now/table/sys_atf_test_suite
  native: Bash

## Procedure

### Step 1: Analyze the Requirement or Functionality

Identify what needs to be tested and break it into testable scenarios.

**Query existing business rules, client scripts, or workflows for the target table:**

**Using MCP (Claude Code/Desktop):**
```
Tool: SN-Query-Table
Parameters:
  table_name: sys_script
  query: collection=[table_name]^active=true
  fields: sys_id,name,when,filter_condition,script,active,order
  limit: 20
```

**Query existing tests for the same area to avoid duplication:**
```
Tool: SN-Query-Table
Parameters:
  table_name: sys_atf_test
  query: descriptionLIKE[feature_keyword]^ORnameLIKE[feature_keyword]
  fields: sys_id,name,description,status,sys_updated_on,test_suite
  limit: 20
```

**Using REST API:**
```bash
GET /api/now/table/sys_atf_test?sysparm_query=descriptionLIKE[feature_keyword]&sysparm_fields=sys_id,name,description,status,sys_updated_on&sysparm_limit=20&sysparm_display_value=true
```

**Identify available step configurations:**
```
Tool: SN-Query-Table
Parameters:
  table_name: sys_atf_step_config
  query: active=true
  fields: sys_id,name,category,description,batch_order_constraint
  limit: 50
  order_by: category,name
```

### Step 2: Create the Test Record

Generate the test with descriptive metadata.

**Using MCP:**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_test
  fields:
    name: "Validate Incident Priority Calculation Business Rule"
    description: |
      Tests the priority lookup business rule on the incident table.

      Scenarios covered:
      1. Impact=1 + Urgency=1 should set Priority=1 (Critical)
      2. Impact=2 + Urgency=2 should set Priority=3 (Moderate)
      3. Impact=3 + Urgency=3 should set Priority=4 (Low)
      4. Changing Impact should recalculate Priority
      5. Priority field should be read-only after calculation

      Related requirement: REQ-2026-0145
      Related story: STY0015678
    status: design
    active: true
    application: [app_scope_sys_id]
    category: functional
    priority: 2
```

**Using REST API:**
```bash
POST /api/now/table/sys_atf_test
Content-Type: application/json

{
  "name": "Validate Incident Priority Calculation Business Rule",
  "description": "Tests the priority lookup business rule on the incident table.",
  "status": "design",
  "active": "true",
  "category": "functional",
  "priority": "2"
}
```

### Step 3: Generate Test Data Setup Steps

Create steps that prepare the test environment with known data.

**Using MCP:**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_step
  fields:
    test: [test_sys_id]
    step_config: [create_record_step_config_sys_id]
    order: 100
    description: "Create test incident with Impact=1 and Urgency=1"
    active: true
    inputs: |
      {
        "table": "incident",
        "fields": {
          "short_description": "ATF Test - Priority Calculation P1",
          "caller_id": "javascript:gs.getUserID()",
          "impact": "1",
          "urgency": "1",
          "category": "software",
          "assignment_group": "javascript:new GlideRecord('sys_user_group').get('name', 'Service Desk') ? current.sys_id : ''"
        }
      }
    output_variable: test_incident_p1
```

**Using REST API:**
```bash
POST /api/now/table/sys_atf_step
Content-Type: application/json

{
  "test": "[test_sys_id]",
  "step_config": "[create_record_step_config_sys_id]",
  "order": "100",
  "description": "Create test incident with Impact=1 and Urgency=1",
  "active": "true"
}
```

### Step 4: Generate Assertion Steps

Create steps that validate expected outcomes.

**Using MCP:**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_step
  fields:
    test: [test_sys_id]
    step_config: [assert_record_values_step_config_sys_id]
    order: 200
    description: "Assert Priority is set to 1 (Critical) when Impact=1, Urgency=1"
    active: true
    inputs: |
      {
        "table": "incident",
        "sys_id": "{{test_incident_p1.sys_id}}",
        "assertions": [
          {
            "field": "priority",
            "operator": "=",
            "expected": "1"
          }
        ]
      }
```

**Create a server-side script step for complex assertions:**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_step
  fields:
    test: [test_sys_id]
    step_config: [run_server_side_script_step_config_sys_id]
    order: 300
    description: "Validate priority matrix lookup logic"
    active: true
    inputs: |
      {
        "script": "var gr = new GlideRecord('incident');\ngr.get('{{test_incident_p1.sys_id}}');\n\nvar expectedPriority = '1';\nvar actualPriority = gr.getValue('priority');\n\nstepResult.setOutputMessage('Expected: ' + expectedPriority + ', Actual: ' + actualPriority);\nstepResult.assertEqual({\n  name: 'Priority calculation for Impact=1, Urgency=1',\n  shouldbe: expectedPriority,\n  value: actualPriority\n});"
      }
```

### Step 5: Generate Multiple Test Scenarios

Create comprehensive test coverage using batch step generation.

**Using MCP:**
```
Tool: SN-Execute-Background-Script
Parameters:
  description: Generate ATF test steps for all priority matrix combinations
  script: |
    var testId = '[test_sys_id]';
    var createStepConfig = '[create_record_step_config_sys_id]';
    var assertStepConfig = '[assert_record_values_step_config_sys_id]';
    var cleanupStepConfig = '[delete_record_step_config_sys_id]';

    // Priority matrix: Impact x Urgency = Priority
    var matrix = [
      { impact: 1, urgency: 1, expected_priority: 1, label: 'Critical' },
      { impact: 1, urgency: 2, expected_priority: 2, label: 'High' },
      { impact: 1, urgency: 3, expected_priority: 2, label: 'High' },
      { impact: 2, urgency: 1, expected_priority: 2, label: 'High' },
      { impact: 2, urgency: 2, expected_priority: 3, label: 'Moderate' },
      { impact: 2, urgency: 3, expected_priority: 3, label: 'Moderate' },
      { impact: 3, urgency: 1, expected_priority: 2, label: 'High' },
      { impact: 3, urgency: 2, expected_priority: 3, label: 'Moderate' },
      { impact: 3, urgency: 3, expected_priority: 4, label: 'Low' }
    ];

    var stepOrder = 100;
    var createdSteps = 0;

    matrix.forEach(function(combo) {
      var varName = 'incident_i' + combo.impact + '_u' + combo.urgency;

      // Create record step
      var create = new GlideRecord('sys_atf_step');
      create.initialize();
      create.test = testId;
      create.step_config = createStepConfig;
      create.order = stepOrder;
      create.description = 'Create incident: Impact=' + combo.impact + ', Urgency=' + combo.urgency;
      create.active = true;
      create.insert();
      stepOrder += 50;
      createdSteps++;

      // Assert step
      var assert = new GlideRecord('sys_atf_step');
      assert.initialize();
      assert.test = testId;
      assert.step_config = assertStepConfig;
      assert.order = stepOrder;
      assert.description = 'Assert Priority=' + combo.expected_priority + ' (' + combo.label + ') for Impact=' + combo.impact + ', Urgency=' + combo.urgency;
      assert.active = true;
      assert.insert();
      stepOrder += 50;
      createdSteps++;
    });

    gs.info('Created ' + createdSteps + ' ATF steps for ' + matrix.length + ' priority combinations');
```

### Step 6: Add Cleanup (Teardown) Steps

Ensure test data is cleaned up after execution.

**Using MCP:**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_step
  fields:
    test: [test_sys_id]
    step_config: [delete_record_step_config_sys_id]
    order: 9000
    description: "Cleanup: Delete test incidents created during test"
    active: true
    inputs: |
      {
        "table": "incident",
        "query": "short_descriptionSTARTSWITHATF Test - Priority Calculation"
      }
```

### Step 7: Organize Into Test Suites

Add the test to an appropriate test suite for batch execution.

**Using MCP:**
```
Tool: SN-Query-Table
Parameters:
  table_name: sys_atf_test_suite
  query: active=true^nameLIKEregression^ORnameLIKEincident
  fields: sys_id,name,description,active,scheduled,run_condition
  limit: 10
```

**Add test to suite:**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_test_suite_test
  fields:
    test_suite: [suite_sys_id]
    test: [test_sys_id]
    order: 500
    abort_on_failure: false
```

**Using REST API:**
```bash
POST /api/now/table/sys_atf_test_suite_test
Content-Type: application/json

{
  "test_suite": "[suite_sys_id]",
  "test": "[test_sys_id]",
  "order": "500",
  "abort_on_failure": "false"
}
```

### Step 8: Review Test Results

Analyze results after test execution.

**Using MCP:**
```
Tool: SN-Query-Table
Parameters:
  table_name: sys_atf_test_result
  query: test=[test_sys_id]^ORDERBYDESCstart_time
  fields: sys_id,test,status,start_time,end_time,duration,output,run_by,failure_reason
  limit: 10
```

**Get step-level results:**
```
Tool: SN-Query-Table
Parameters:
  table_name: sys_atf_step_result
  query: test_result=[result_sys_id]
  fields: sys_id,step,step.description,status,output,start_time,end_time,failure_reason
  limit: 50
  order_by: step.order
```

**Using REST API:**
```bash
GET /api/now/table/sys_atf_test_result?sysparm_query=test=[test_sys_id]^ORDERBYDESCstart_time&sysparm_fields=sys_id,test,status,start_time,end_time,duration,output,failure_reason&sysparm_limit=10&sysparm_display_value=true
```
