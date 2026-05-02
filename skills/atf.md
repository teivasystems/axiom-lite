
# automated-testing v1.0.0

Comprehensive Automated Test Framework (ATF) guide for creating, managing, and executing automated tests in ServiceNow

Author: Happy Technologies LLC
Category: development
Complexity: advanced
Tags: development, testing, atf, automation, quality, tdd, ci-cd
Platforms: claude-code, claude-desktop, chatgpt, cursor, any

Tools:
  mcp: SN-Create-Record, SN-Query-Table, SN-Update-Record, SN-Execute-Background-Script, SN-Get-Table-Schema
  rest: /api/now/table/sys_atf_test, /api/now/table/sys_atf_test_suite, /api/now/table/sys_atf_step, /api/now/table/sys_atf_test_result, /api/now/table/sys_atf_step_config
  native: Bash, Read

## Procedure

### Phase 1: Create Test Suite

#### Step 1.1: Create the Test Suite

Organize related tests into a suite for easier management and execution.

**Using MCP:**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_test_suite
  data:
    name: "Incident Management Tests"
    description: "Comprehensive tests for incident creation, assignment, resolution, and closure workflows"
    active: true
    run_parallel: false
    application: [app_sys_id]  # Optional: for scoped apps
```

**Using REST API:**
```bash
POST /api/now/table/sys_atf_test_suite
Content-Type: application/json

{
  "name": "Incident Management Tests",
  "description": "Comprehensive tests for incident creation, assignment, resolution, and closure workflows",
  "active": "true",
  "run_parallel": "false"
}
```

#### Step 1.2: Query Existing Test Suites

**Using MCP:**
```
Tool: SN-Query-Table
Parameters:
  table_name: sys_atf_test_suite
  query: active=true
  fields: sys_id,name,description,run_parallel,sys_updated_on
  limit: 50
```

### Phase 2: Create Tests

#### Step 2.1: Create a Basic Test

Each test represents a specific scenario to validate.

**Using MCP:**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_test
  data:
    name: "Create P1 Incident and Verify Auto-Assignment"
    description: "Tests that P1 incidents are automatically assigned to the Critical Incidents team"
    active: true
    type: test_script  # test_script, browser, quick_start
```

**Test Types:**
| Type | Value | Description |
|------|-------|-------------|
| Server Side | test_script | Server-side JavaScript tests |
| Browser | browser | Client-side UI tests |
| Quick Start | quick_start | Guided test creation |

#### Step 2.2: Add Test to Suite

Link the test to your test suite.

**Using MCP:**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_test_suite_test
  data:
    test_suite: [suite_sys_id]
    test: [test_sys_id]
    order: 100  # Execution order (100, 200, 300...)
```

### Phase 3: Create Test Steps

#### Step 3.1: Server-Side Test Steps

Server-side steps execute GlideRecord operations and server-side JavaScript.

**Step: Create Record**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_step
  data:
    test: [test_sys_id]
    order: 100
    active: true
    step_config: [step_config_sys_id]  # "Record - Insert"
    inputs:
      table: incident
      fields:
        short_description: "ATF Test - Server Outage P1"
        description: "Automated test incident for validation"
        priority: 1
        category: hardware
        subcategory: server
    outputs:
      record: inserted_incident  # Variable name for reference
```

**Step: Query Records**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_step
  data:
    test: [test_sys_id]
    order: 200
    active: true
    step_config: [step_config_sys_id]  # "Record - Query"
    inputs:
      table: incident
      query: number=${inserted_incident.number}
    outputs:
      record: queried_incident
```

**Step: Update Record**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_step
  data:
    test: [test_sys_id]
    order: 300
    active: true
    step_config: [step_config_sys_id]  # "Record - Update"
    inputs:
      record: ${inserted_incident}
      fields:
        state: 2  # In Progress
        assigned_to: [user_sys_id]
        work_notes: "ATF: Assigning for testing"
```

**Step: Run Server-Side Script**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_step
  data:
    test: [test_sys_id]
    order: 400
    active: true
    step_config: [step_config_sys_id]  # "Run Server Side Script"
    inputs:
      script: |
        // Custom server-side validation
        var gr = new GlideRecord('incident');
        gr.get('${inserted_incident.sys_id}');

        // Store result for assertion
        outputs.actual_state = gr.state.toString();
        outputs.assigned_group = gr.assignment_group.getDisplayValue();
        outputs.is_valid = (gr.state == 2);
    outputs:
      actual_state: actual_state
      assigned_group: assigned_group
      is_valid: is_valid
```

#### Step 3.2: Client-Side Test Steps

Client-side steps test UI behavior and client scripts.

**Step: Open Form**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_step
  data:
    test: [test_sys_id]
    order: 100
    active: true
    step_config: [step_config_sys_id]  # "Open a new form"
    inputs:
      table: incident
```

**Step: Set Field Value**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_step
  data:
    test: [test_sys_id]
    order: 200
    active: true
    step_config: [step_config_sys_id]  # "Set field value"
    inputs:
      field: priority
      value: 1 - Critical
```

**Step: Click Button**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_step
  data:
    test: [test_sys_id]
    order: 300
    active: true
    step_config: [step_config_sys_id]  # "Click a button"
    inputs:
      button_name: Submit
```

**Step: Validate Field State**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_step
  data:
    test: [test_sys_id]
    order: 400
    active: true
    step_config: [step_config_sys_id]  # "Field state validation"
    inputs:
      field: caller_id
      is_mandatory: true
      is_visible: true
      is_readonly: false
```

#### Step 3.3: UI Test Steps

UI steps interact with the ServiceNow interface.

**Step: Open Record**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_step
  data:
    test: [test_sys_id]
    order: 100
    active: true
    step_config: [step_config_sys_id]  # "Open an existing record"
    inputs:
      table: incident
      sys_id: ${inserted_incident.sys_id}
```

**Step: Navigate to Module**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_step
  data:
    test: [test_sys_id]
    order: 100
    active: true
    step_config: [step_config_sys_id]  # "Navigate to a module"
    inputs:
      module: Incident > Create New
```

### Phase 4: Assertions and Validations

#### Step 4.1: Basic Assertions

**Assert Field Value**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_step
  data:
    test: [test_sys_id]
    order: 500
    active: true
    step_config: [step_config_sys_id]  # "Verify field value"
    inputs:
      record: ${inserted_incident}
      field: state
      expected_value: 2
      operator: =
```

**Assert Record Exists**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_step
  data:
    test: [test_sys_id]
    order: 500
    active: true
    step_config: [step_config_sys_id]  # "Verify record exists"
    inputs:
      table: incident
      query: number=${inserted_incident.number}^active=true
```

**Assert Record Count**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_step
  data:
    test: [test_sys_id]
    order: 500
    active: true
    step_config: [step_config_sys_id]  # "Verify record count"
    inputs:
      table: task
      query: parent=${inserted_incident.sys_id}
      expected_count: 3
      operator: >=
```

#### Step 4.2: Custom Script Assertions

For complex validations, use script assertions.

**Run Server-Side Script with Assertions**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_step
  data:
    test: [test_sys_id]
    order: 500
    active: true
    step_config: [step_config_sys_id]  # "Run Server Side Script"
    inputs:
      script: |
        // Complex assertion logic
        var testPassed = true;
        var messages = [];

        // Get the incident
        var gr = new GlideRecord('incident');
        gr.get('${inserted_incident.sys_id}');

        // Assertion 1: State validation
        if (gr.state != 2) {
          testPassed = false;
          messages.push('Expected state 2, got ' + gr.state);
        }

        // Assertion 2: Assignment validation
        if (gr.assignment_group.nil()) {
          testPassed = false;
          messages.push('Assignment group should not be empty for P1');
        }

        // Assertion 3: SLA attached
        var sla = new GlideRecord('task_sla');
        sla.addQuery('task', gr.sys_id);
        sla.query();
        if (!sla.hasNext()) {
          testPassed = false;
          messages.push('Expected SLA to be attached to P1 incident');
        }

        // Set outputs
        outputs.test_passed = testPassed;
        outputs.validation_messages = messages.join('; ');

        // This will fail the step if assertions fail
        if (!testPassed) {
          throw new Error('Assertions failed: ' + outputs.validation_messages);
        }
```

#### Step 4.3: Assertion Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `=` | Equals | state = 2 |
| `!=` | Not equals | state != 7 |
| `<` | Less than | priority < 3 |
| `<=` | Less or equal | priority <= 2 |
| `>` | Greater than | age > 0 |
| `>=` | Greater or equal | count >= 1 |
| `contains` | String contains | description contains "error" |
| `starts with` | String prefix | number starts with "INC" |
| `ends with` | String suffix | email ends with "@company.com" |
| `is empty` | Null or empty | assigned_to is empty |
| `is not empty` | Has value | caller_id is not empty |

### Phase 5: Test Data Management

#### Step 5.1: Setup Test Data

Create test data at the beginning of each test.

**Using Data Setup Step**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_step
  data:
    test: [test_sys_id]
    order: 10
    active: true
    step_config: [step_config_sys_id]  # "Run Server Side Script"
    description: "Setup: Create test data"
    inputs:
      script: |
        // Create test user
        var user = new GlideRecord('sys_user');
        user.initialize();
        user.user_name = 'atf_test_user_' + gs.generateGUID().substring(0, 8);
        user.first_name = 'ATF';
        user.last_name = 'Test User';
        user.email = user.user_name + '@test.example.com';
        user.active = true;
        outputs.test_user_sys_id = user.insert();
        outputs.test_user_name = user.user_name;

        // Create test group
        var group = new GlideRecord('sys_user_group');
        group.initialize();
        group.name = 'ATF Test Group ' + gs.generateGUID().substring(0, 8);
        group.active = true;
        outputs.test_group_sys_id = group.insert();
        outputs.test_group_name = group.name;

        gs.info('ATF: Created test user ' + outputs.test_user_name);
        gs.info('ATF: Created test group ' + outputs.test_group_name);
```

#### Step 5.2: Cleanup Test Data

Always clean up test data to prevent accumulation.

**Using Cleanup Step (End of Test)**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_step
  data:
    test: [test_sys_id]
    order: 9999
    active: true
    step_config: [step_config_sys_id]  # "Run Server Side Script"
    description: "Cleanup: Remove test data"
    inputs:
      script: |
        // Cleanup test incident
        if ('${inserted_incident.sys_id}') {
          var inc = new GlideRecord('incident');
          if (inc.get('${inserted_incident.sys_id}')) {
            inc.deleteRecord();
            gs.info('ATF: Cleaned up test incident');
          }
        }

        // Cleanup test user
        if ('${test_user_sys_id}') {
          var user = new GlideRecord('sys_user');
          if (user.get('${test_user_sys_id}')) {
            user.deleteRecord();
            gs.info('ATF: Cleaned up test user');
          }
        }

        // Cleanup test group
        if ('${test_group_sys_id}') {
          var group = new GlideRecord('sys_user_group');
          if (group.get('${test_group_sys_id}')) {
            group.deleteRecord();
            gs.info('ATF: Cleaned up test group');
          }
        }
```

#### Step 5.3: Reusable Data Setup (Data Broker)

For tests that need consistent data across multiple scenarios:

**Query Step Config for Data Broker**
```
Tool: SN-Query-Table
Parameters:
  table_name: sys_atf_step_config
  query: nameLIKEData Broker
  fields: sys_id,name,description,category
```

### Phase 6: Parameterized Tests

#### Step 6.1: Create Test Parameters

Parameters allow running the same test with different inputs.

**Using MCP:**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_parameter
  data:
    test: [test_sys_id]
    name: priority_value
    label: "Priority Value"
    default_value: 3
    type: integer
    hint: "Incident priority (1-5)"
```

**Create Multiple Parameters:**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_parameter
  data:
    test: [test_sys_id]
    name: category
    label: "Category"
    default_value: software
    type: string
    hint: "Incident category"

# Additional parameter
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_parameter
  data:
    test: [test_sys_id]
    name: expected_sla_minutes
    label: "Expected SLA (minutes)"
    default_value: 60
    type: integer
    hint: "Expected SLA resolution time"
```

#### Step 6.2: Use Parameters in Steps

Reference parameters using the ${} syntax.

**Using Parameters in Record Insert**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_step
  data:
    test: [test_sys_id]
    order: 100
    active: true
    step_config: [step_config_sys_id]
    description: "Create incident with parameterized values"
    inputs:
      table: incident
      fields:
        short_description: "ATF Parameterized Test"
        priority: ${priority_value}
        category: ${category}
```

**Using Parameters in Assertions**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_step
  data:
    test: [test_sys_id]
    order: 500
    active: true
    step_config: [step_config_sys_id]
    description: "Verify SLA meets expected time"
    inputs:
      script: |
        var sla = new GlideRecord('task_sla');
        sla.addQuery('task', '${inserted_incident.sys_id}');
        sla.query();

        if (sla.next()) {
          var plannedMinutes = sla.planned_end_time.dateNumericValue() -
                               sla.start_time.dateNumericValue();
          plannedMinutes = plannedMinutes / (1000 * 60);

          outputs.actual_sla_minutes = Math.round(plannedMinutes);
          outputs.expected_sla_minutes = ${expected_sla_minutes};

          if (plannedMinutes > ${expected_sla_minutes}) {
            throw new Error('SLA ' + plannedMinutes + ' mins exceeds expected ' +
                          ${expected_sla_minutes} + ' mins');
          }
        }
```

### Phase 7: Running Tests

#### Step 7.1: Manual Execution

**Run Single Test:**
```
Tool: SN-Execute-Background-Script
Parameters:
  script: |
    var runner = new sn_atf.ATFTestRunner();
    runner.setTest('[test_sys_id]');
    var resultId = runner.run();
    gs.info('ATF: Test execution started. Result ID: ' + resultId);
  description: Run ATF test manually
```

**Run Test Suite:**
```
Tool: SN-Execute-Background-Script
Parameters:
  script: |
    var suiteRunner = new sn_atf.ATFTestSuiteRunner();
    suiteRunner.setSuite('[suite_sys_id]');
    var resultId = suiteRunner.run();
    gs.info('ATF: Suite execution started. Result ID: ' + resultId);
  description: Run ATF test suite
```

#### Step 7.2: Scheduled Execution

Create a scheduled job to run tests regularly.

**Using MCP:**
```
Tool: SN-Create-Record
Parameters:
  table_name: sysauto_script
  data:
    name: "Nightly ATF Regression Suite"
    active: true
    run_type: daily
    time: "02:00:00"
    script: |
      // Run regression test suite nightly
      var suiteRunner = new sn_atf.ATFTestSuiteRunner();
      suiteRunner.setSuite('[regression_suite_sys_id]');

      // Optional: Set parameters
      suiteRunner.setParameter('environment', 'nightly');

      var resultId = suiteRunner.run();

      // Log result
      gs.info('Nightly regression started. Result: ' + resultId);

      // Optional: Send notification on completion
      // (handled by ATF result business rules)
```

#### Step 7.3: Run with Impersonation

Test as different users to validate role-based access.

**Using MCP:**
```
Tool: SN-Execute-Background-Script
Parameters:
  script: |
    var runner = new sn_atf.ATFTestRunner();
    runner.setTest('[test_sys_id]');
    runner.setImpersonateUser('[user_sys_id]');  // Run as this user
    var resultId = runner.run();
    gs.info('ATF: Test running as impersonated user. Result: ' + resultId);
  description: Run ATF test with user impersonation
```

### Phase 8: Test Results Analysis

#### Step 8.1: Query Test Results

**Get Latest Test Results:**
```
Tool: SN-Query-Table
Parameters:
  table_name: sys_atf_test_result
  query: test=[test_sys_id]^ORDERBYDESCsys_created_on
  fields: sys_id,status,start_time,end_time,duration,message
  limit: 10
```

**Get Suite Execution Results:**
```
Tool: SN-Query-Table
Parameters:
  table_name: sys_atf_test_suite_result
  query: test_suite=[suite_sys_id]^ORDERBYDESCsys_created_on
  fields: sys_id,status,start_time,end_time,test_count,pass_count,fail_count,skip_count
  limit: 5
```

#### Step 8.2: Analyze Failed Steps

**Get Step-Level Results for Failed Test:**
```
Tool: SN-Query-Table
Parameters:
  table_name: sys_atf_step_result
  query: test_result=[test_result_sys_id]^status=failure
  fields: sys_id,step_config,status,message,output
  limit: 50
```

#### Step 8.3: Aggregate Test Metrics

**Using MCP:**
```
Tool: SN-Execute-Background-Script
Parameters:
  script: |
    // Aggregate test metrics for the last 7 days
    var startDate = gs.daysAgo(7);

    var metrics = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      error: 0,
      passRate: 0,
      avgDuration: 0
    };

    var ga = new GlideAggregate('sys_atf_test_result');
    ga.addQuery('sys_created_on', '>', startDate);
    ga.addAggregate('COUNT');
    ga.addAggregate('COUNT', 'status');
    ga.addAggregate('AVG', 'duration');
    ga.groupBy('status');
    ga.query();

    while (ga.next()) {
      var status = ga.status.toString();
      var count = parseInt(ga.getAggregate('COUNT'));
      metrics.total += count;

      if (status === 'success') metrics.passed = count;
      else if (status === 'failure') metrics.failed = count;
      else if (status === 'skipped') metrics.skipped = count;
      else metrics.error += count;
    }

    metrics.passRate = metrics.total > 0 ?
      Math.round((metrics.passed / metrics.total) * 100) : 0;

    gs.info('ATF Metrics (Last 7 Days): ' + JSON.stringify(metrics, null, 2));
  description: Generate ATF test metrics
```

### Phase 9: CI/CD Integration

#### Step 9.1: REST API for CI/CD

ServiceNow provides REST APIs for ATF integration.

**Start Test Suite via REST:**
```bash
POST /api/sn_cicd/testsuite/run
Content-Type: application/json

{
  "test_suite_sys_id": "[suite_sys_id]",
  "browser_name": "Chrome",
  "browser_version": "latest"
}
```

**Check Test Progress:**
```bash
GET /api/sn_cicd/progress/[result_id]
```

**Get Test Results:**
```bash
GET /api/sn_cicd/testsuite/results/[result_id]
```

#### Step 9.2: Integration with Jenkins

**Jenkins Pipeline Example:**
```groovy
pipeline {
  agent any

  environment {
    SN_INSTANCE = 'https://dev123.service-now.com'
    SN_CREDENTIALS = credentials('servicenow-api')
  }

  stages {
    stage('Run ATF Tests') {
      steps {
        script {
          // Start test suite
          def response = httpRequest(
            url: "${SN_INSTANCE}/api/sn_cicd/testsuite/run",
            httpMode: 'POST',
            authentication: 'servicenow-api',
            contentType: 'APPLICATION_JSON',
            requestBody: """
              {
                "test_suite_sys_id": "${params.TEST_SUITE_ID}",
                "browser_name": "Chrome"
              }
            """
          )

          def result = readJSON text: response.content
          env.RESULT_ID = result.result.sys_id
        }
      }
    }

    stage('Wait for Results') {
      steps {
        script {
          def status = 'running'
          while (status == 'running') {
            sleep 30
            def response = httpRequest(
              url: "${SN_INSTANCE}/api/sn_cicd/progress/${env.RESULT_ID}",
              authentication: 'servicenow-api'
            )
            def progress = readJSON text: response.content
            status = progress.result.status
          }
        }
      }
    }

    stage('Evaluate Results') {
      steps {
        script {
          def response = httpRequest(
            url: "${SN_INSTANCE}/api/sn_cicd/testsuite/results/${env.RESULT_ID}",
            authentication: 'servicenow-api'
          )
          def results = readJSON text: response.content

          if (results.result.status != 'success') {
            error "ATF tests failed: ${results.result.fail_count} failures"
          }
        }
      }
    }
  }
}
```

#### Step 9.3: Integration with GitHub Actions

**GitHub Actions Workflow:**
```yaml
name: ServiceNow ATF Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  atf-tests:
    runs-on: ubuntu-latest

    steps:
      - name: Run ATF Test Suite
        id: run-tests
        run: |
          RESPONSE=$(curl -s -X POST \
            -u "${{ secrets.SN_USERNAME }}:${{ secrets.SN_PASSWORD }}" \
            -H "Content-Type: application/json" \
            -d '{"test_suite_sys_id":"${{ vars.ATF_SUITE_ID }}"}' \
            "${{ vars.SN_INSTANCE }}/api/sn_cicd/testsuite/run")

          RESULT_ID=$(echo $RESPONSE | jq -r '.result.sys_id')
          echo "result_id=$RESULT_ID" >> $GITHUB_OUTPUT

      - name: Wait for Completion
        run: |
          STATUS="running"
          while [ "$STATUS" = "running" ]; do
            sleep 30
            RESPONSE=$(curl -s \
              -u "${{ secrets.SN_USERNAME }}:${{ secrets.SN_PASSWORD }}" \
              "${{ vars.SN_INSTANCE }}/api/sn_cicd/progress/${{ steps.run-tests.outputs.result_id }}")
            STATUS=$(echo $RESPONSE | jq -r '.result.status')
            echo "Test status: $STATUS"
          done

      - name: Get Results
        run: |
          RESPONSE=$(curl -s \
            -u "${{ secrets.SN_USERNAME }}:${{ secrets.SN_PASSWORD }}" \
            "${{ vars.SN_INSTANCE }}/api/sn_cicd/testsuite/results/${{ steps.run-tests.outputs.result_id }}")

          STATUS=$(echo $RESPONSE | jq -r '.result.status')
          PASS=$(echo $RESPONSE | jq -r '.result.pass_count')
          FAIL=$(echo $RESPONSE | jq -r '.result.fail_count')

          echo "Results: $PASS passed, $FAIL failed"

          if [ "$STATUS" != "success" ]; then
            echo "::error::ATF tests failed"
            exit 1
          fi
```

### Phase 10: Advanced Patterns

#### Step 10.1: Page Object Pattern for UI Tests

Create reusable step configurations for common UI operations.

**Query Available Step Configs:**
```
Tool: SN-Query-Table
Parameters:
  table_name: sys_atf_step_config
  query: active=true
  fields: sys_id,name,category,description
  limit: 100
```

**Common Step Configs:**
| Category | Step Config | Purpose |
|----------|------------|---------|
| Record | Record - Insert | Create new record |
| Record | Record - Query | Find existing record |
| Record | Record - Update | Modify record |
| Record | Record - Delete | Remove record |
| Form | Open a new form | Navigate to new form |
| Form | Open an existing record | Navigate to record |
| Form | Set field value | Populate field |
| Form | Click a button | Trigger button action |
| Assertion | Verify field value | Assert field content |
| Script | Run Server Side Script | Execute custom logic |

#### Step 10.2: Test Data Factory Pattern

Create a script include for generating test data.

**Using MCP:**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_script_include
  data:
    name: ATFTestDataFactory
    api_name: global.ATFTestDataFactory
    active: true
    client_callable: false
    description: "Factory for creating consistent ATF test data"
    script: |
      var ATFTestDataFactory = Class.create();
      ATFTestDataFactory.prototype = {

        initialize: function() {
          this.createdRecords = [];
        },

        createTestIncident: function(options) {
          options = options || {};

          var gr = new GlideRecord('incident');
          gr.initialize();
          gr.short_description = options.short_description ||
            'ATF Test Incident ' + gs.generateGUID().substring(0, 8);
          gr.description = options.description || 'Created by ATF Test';
          gr.priority = options.priority || 3;
          gr.category = options.category || 'software';
          gr.caller_id = options.caller_id || gs.getUserID();

          var sysId = gr.insert();
          this.createdRecords.push({ table: 'incident', sys_id: sysId });

          return sysId;
        },

        createTestUser: function(options) {
          options = options || {};
          var username = 'atf_' + gs.generateGUID().substring(0, 8);

          var gr = new GlideRecord('sys_user');
          gr.initialize();
          gr.user_name = options.user_name || username;
          gr.first_name = options.first_name || 'ATF';
          gr.last_name = options.last_name || 'User';
          gr.email = options.email || username + '@test.example.com';
          gr.active = true;

          var sysId = gr.insert();
          this.createdRecords.push({ table: 'sys_user', sys_id: sysId });

          return sysId;
        },

        createTestGroup: function(options) {
          options = options || {};

          var gr = new GlideRecord('sys_user_group');
          gr.initialize();
          gr.name = options.name || 'ATF Group ' + gs.generateGUID().substring(0, 8);
          gr.active = true;

          var sysId = gr.insert();
          this.createdRecords.push({ table: 'sys_user_group', sys_id: sysId });

          return sysId;
        },

        cleanup: function() {
          // Delete in reverse order to handle dependencies
          for (var i = this.createdRecords.length - 1; i >= 0; i--) {
            var record = this.createdRecords[i];
            var gr = new GlideRecord(record.table);
            if (gr.get(record.sys_id)) {
              gr.deleteRecord();
            }
          }
          this.createdRecords = [];
        },

        type: 'ATFTestDataFactory'
      };
```

**Using Factory in Test:**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_step
  data:
    test: [test_sys_id]
    order: 10
    step_config: [run_script_config_sys_id]
    description: "Setup: Create test data using factory"
    inputs:
      script: |
        var factory = new ATFTestDataFactory();

        // Create test data
        outputs.incident_sys_id = factory.createTestIncident({
          priority: 1,
          short_description: 'Critical Server Issue'
        });

        outputs.user_sys_id = factory.createTestUser({
          first_name: 'Test',
          last_name: 'Admin'
        });

        // Store factory for cleanup
        outputs.factory = factory;
```

#### Step 10.3: Conditional Test Execution

Skip tests based on conditions.

**Using MCP:**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_atf_step
  data:
    test: [test_sys_id]
    order: 5
    step_config: [run_script_config_sys_id]
    description: "Pre-check: Verify test prerequisites"
    inputs:
      script: |
        // Check if required plugin is active
        var plugin = new GlideRecord('v_plugin');
        plugin.addQuery('id', 'com.snc.change_management');
        plugin.addQuery('state', 'active');
        plugin.query();

        if (!plugin.hasNext()) {
          // Skip this test if plugin not installed
          outputs.skip_test = true;
          outputs.skip_reason = 'Change Management plugin not active';

          // This will mark test as skipped, not failed
          stepResult.setStatus('skipped');
          stepResult.setMessage('Prerequisites not met: ' + outputs.skip_reason);
        }
```
