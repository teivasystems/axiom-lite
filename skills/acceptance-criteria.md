
# acceptance-criteria v1.0.0

Generate comprehensive acceptance criteria for user stories and features using Given/When/Then format covering functional requirements, edge cases, and testable conditions

Author: Happy Technologies LLC
Category: spm
Complexity: intermediate
Tags: spm, agile, acceptance-criteria, bdd, gherkin, testing, quality, user-stories
Platforms: claude-code, claude-desktop, chatgpt, cursor, any

Tools:
  mcp: SN-Query-Table, SN-Update-Record, SN-Read-Record, SN-NL-Search
  rest: /api/now/table/rm_story, /api/now/table/rm_epic, /api/now/table/rm_sprint, /api/now/table/pm_project, /api/now/table/pm_project_task
  native: Bash

## Procedure

### Step 1: Retrieve the User Story

Fetch the story record to understand the requirement before writing acceptance criteria.

**Using MCP (Claude Code/Desktop):**
```
Tool: SN-Read-Record
Parameters:
  table_name: rm_story
  sys_id: [story_sys_id]
  fields: sys_id,number,short_description,description,acceptance_criteria,story_points,epic,sprint,state,priority,classification,product,assigned_to
```

If you only have the story number, search first:

**Using MCP:**
```
Tool: SN-Query-Table
Parameters:
  table_name: rm_story
  query: number=STY0010001
  fields: sys_id,number,short_description,description,acceptance_criteria,story_points,epic,sprint,state,priority,classification
  limit: 1
```

**Using REST API:**
```bash
GET /api/now/table/rm_story?sysparm_query=number=STY0010001&sysparm_fields=sys_id,number,short_description,description,acceptance_criteria,story_points,epic,sprint,state,priority,classification&sysparm_limit=1&sysparm_display_value=true
```

### Step 2: Gather Context from the Parent Epic

Understanding the broader feature context helps write more complete acceptance criteria.

**Using MCP:**
```
Tool: SN-Query-Table
Parameters:
  table_name: rm_epic
  query: sys_id=[epic_sys_id]
  fields: sys_id,number,short_description,description,state,priority,acceptance_criteria
  limit: 1
```

**Using REST API:**
```bash
GET /api/now/table/rm_epic/[epic_sys_id]?sysparm_fields=sys_id,number,short_description,description,state,priority,acceptance_criteria&sysparm_display_value=true
```

### Step 3: Review Related Stories for Consistency

Query sibling stories under the same epic to ensure criteria are consistent and avoid duplication.

**Using MCP:**
```
Tool: SN-Query-Table
Parameters:
  table_name: rm_story
  query: epic=[epic_sys_id]^sys_id!=[story_sys_id]^ORDERBYpriority
  fields: number,short_description,acceptance_criteria,state,story_points
  limit: 20
```

**Using REST API:**
```bash
GET /api/now/table/rm_story?sysparm_query=epic=[epic_sys_id]^sys_id!=[story_sys_id]^ORDERBYpriority&sysparm_fields=number,short_description,acceptance_criteria,state,story_points&sysparm_limit=20&sysparm_display_value=true
```

### Step 4: Generate Acceptance Criteria

Structure the acceptance criteria using these categories:

**Category 1: Happy Path (Required)**
The primary success scenario that the story describes.

```
Scenario: Successful [action]
  Given [precondition describing the initial state]
  And [additional precondition if needed]
  When [action the user performs]
  And [additional action if needed]
  Then [expected observable outcome]
  And [additional outcome or side effect]
```

**Category 2: Alternative Flows (Required)**
Valid but non-default paths through the feature.

```
Scenario: [Action] with [variation]
  Given [precondition with variation]
  When [action with different input or context]
  Then [expected outcome for this variation]
```

**Category 3: Error Handling (Required)**
How the system responds to invalid input or failure conditions.

```
Scenario: [Action] with invalid [input/state]
  Given [precondition]
  When [action with invalid data]
  Then [error message or validation feedback]
  And [system state remains unchanged]
```

**Category 4: Edge Cases (Recommended)**
Boundary conditions, empty states, and extremes.

```
Scenario: [Action] at boundary condition
  Given [boundary precondition]
  When [action at limit]
  Then [expected behavior at boundary]
```

**Category 5: Performance and Security (As Applicable)**
Non-functional requirements that must be testable.

```
Scenario: [Action] performance requirement
  Given [load or data volume condition]
  When [action is performed]
  Then [response time or throughput requirement is met]
```

### Step 5: Validate Criteria Quality

Review each criterion against the quality checklist:

| Quality Check | Description | Pass Criteria |
|--------------|-------------|---------------|
| **Testable** | Can be verified with a clear pass/fail | No ambiguous terms like "quickly" or "user-friendly" |
| **Independent** | Each scenario stands on its own | No dependencies between scenarios |
| **Specific** | Contains concrete values | Uses exact numbers, messages, states |
| **Complete** | Covers all requirement aspects | Happy path + errors + edge cases |
| **Concise** | No redundant scenarios | Each scenario tests a unique condition |
| **Consistent** | Matches story scope | Does not exceed or fall short of the story |

### Step 6: Update the Story Record

Write the finalized acceptance criteria back to the story.

**Using MCP:**
```
Tool: SN-Update-Record
Parameters:
  table_name: rm_story
  sys_id: [story_sys_id]
  fields:
    acceptance_criteria: |
      Scenario: Successful customer search by phone number
        Given I am logged in as a customer service representative
        And I am on the customer search screen
        When I enter a complete phone number "555-0123" in the search field
        And I click the Search button
        Then matching customer records are displayed within 2 seconds
        And results show customer name, account number, and account status
        And results are sorted by relevance with exact matches first

      Scenario: Partial phone number search
        Given I am logged in as a customer service representative
        When I enter a partial phone number "555" in the search field
        And I click the Search button
        Then all customers with phone numbers containing "555" are displayed
        And a maximum of 50 results are shown with pagination

      Scenario: No matching results
        Given I am logged in as a customer service representative
        When I enter a phone number with no matching records
        And I click the Search button
        Then a message "No customers found matching the provided phone number" is displayed
        And the search field retains the entered value

      Scenario: Invalid phone number format
        Given I am logged in as a customer service representative
        When I enter non-numeric characters "abc-defg" in the phone search field
        And I click the Search button
        Then a validation message "Please enter a valid phone number" is displayed
        And no search query is executed

      Scenario: Empty search field submission
        Given I am logged in as a customer service representative
        When I click the Search button without entering a phone number
        Then a validation message "Phone number is required" is displayed

      Scenario: Search performance under load
        Given the customer database contains over 1 million records
        When I search for a phone number
        Then results are returned within 3 seconds
```

**Using REST API:**
```bash
PATCH /api/now/table/rm_story/[story_sys_id]
Content-Type: application/json

{
  "acceptance_criteria": "Scenario: Successful customer search by phone number\n  Given I am logged in as a customer service representative\n  And I am on the customer search screen\n  When I enter a complete phone number \"555-0123\" in the search field\n  And I click the Search button\n  Then matching customer records are displayed within 2 seconds\n  And results show customer name, account number, and account status\n\nScenario: No matching results\n  Given I am logged in as a customer service representative\n  When I enter a phone number with no matching records\n  Then a message \"No customers found\" is displayed"
}
```

### Step 7: Bulk Update Stories Missing Acceptance Criteria

Find stories in the backlog that lack acceptance criteria and need refinement.

**Using MCP:**
```
Tool: SN-Query-Table
Parameters:
  table_name: rm_story
  query: epic=[epic_sys_id]^acceptance_criteriaISEMPTY^state=-6
  fields: sys_id,number,short_description,description,story_points,priority
  limit: 25
```

**Using REST API:**
```bash
GET /api/now/table/rm_story?sysparm_query=epic=[epic_sys_id]^acceptance_criteriaISEMPTY^state=-6&sysparm_fields=sys_id,number,short_description,description,story_points,priority&sysparm_limit=25&sysparm_display_value=true
```
