
# agile-story-generation v1.0.0

Generate user stories from requirements or feature descriptions with acceptance criteria, story point estimation, epic linking, and sprint assignment

Author: Happy Technologies LLC
Category: spm
Complexity: intermediate
Tags: spm, agile, user-stories, scrum, backlog, sprint, epic, story-points
Platforms: claude-code, claude-desktop, chatgpt, cursor, any

Tools:
  mcp: SN-Query-Table, SN-Create-Record, SN-Update-Record, SN-NL-Search
  rest: /api/now/table/rm_story, /api/now/table/rm_epic, /api/now/table/rm_sprint, /api/now/table/rm_release, /api/now/table/pm_project
  native: Bash

## Procedure

### Step 1: Identify the Target Epic and Sprint

Query existing epics in the project to determine where the new stories belong.

**Using MCP (Claude Code/Desktop):**
```
Tool: SN-Query-Table
Parameters:
  table_name: rm_epic
  query: product.sys_id=[product_sys_id]^state!=3
  fields: sys_id,number,short_description,state,priority,story_points_total
  limit: 20
```

**Using REST API:**
```bash
GET /api/now/table/rm_epic?sysparm_query=product.sys_id=[product_sys_id]^state!=3&sysparm_fields=sys_id,number,short_description,state,priority,story_points_total&sysparm_limit=20
```

Query active sprints to find the target sprint for assignment:

**Using MCP:**
```
Tool: SN-Query-Table
Parameters:
  table_name: rm_sprint
  query: release.product.sys_id=[product_sys_id]^state=2
  fields: sys_id,number,short_description,start_date,end_date,story_points,capacity
  limit: 5
```

**Using REST API:**
```bash
GET /api/now/table/rm_sprint?sysparm_query=release.product.sys_id=[product_sys_id]^state=2&sysparm_fields=sys_id,number,short_description,start_date,end_date,story_points,capacity&sysparm_limit=5
```

### Step 2: Analyze the Requirement

Break down the feature description into discrete, independently deliverable user stories. Apply the INVEST criteria:

| Criterion | Description | Validation |
|-----------|-------------|------------|
| **I**ndependent | No dependencies on other stories | Can be developed in isolation |
| **N**egotiable | Details can be discussed | Not over-specified |
| **V**aluable | Delivers user/business value | Clear "so that" clause |
| **E**stimable | Team can size it | Well-understood scope |
| **S**mall | Fits in a single sprint | Typically 1-8 story points |
| **T**estable | Clear pass/fail criteria | Has acceptance criteria |

### Step 3: Generate User Stories

For each identified story, create a record in the `rm_story` table.

**Using MCP:**
```
Tool: SN-Create-Record
Parameters:
  table_name: rm_story
  fields:
    short_description: "As a [persona], I want to [action] so that [benefit]"
    description: |
      ## User Story
      **As a** customer service representative
      **I want to** search for customers by phone number
      **So that** I can quickly locate their account during inbound calls

      ## Details
      - Search should support partial phone number matching
      - Results should display customer name, account number, and status
      - Search should return results within 2 seconds

      ## Technical Notes
      - Leverage existing customer API endpoint
      - Index phone_number field for performance
    story_points: 5
    epic: [epic_sys_id]
    sprint: [sprint_sys_id]
    state: -6
    priority: 2
    acceptance_criteria: |
      Given I am logged in as a service representative
      When I enter a phone number (full or partial) in the search field
      Then matching customer records are displayed within 2 seconds

      Given no matching records exist
      When I search for a phone number
      Then a "No results found" message is displayed

      Given multiple matches are found
      When results are displayed
      Then they are sorted by relevance with exact matches first
    product: [product_sys_id]
    assigned_to: [user_sys_id]
    classification: Enhancement
```

**Using REST API:**
```bash
POST /api/now/table/rm_story
Content-Type: application/json

{
  "short_description": "As a customer service rep, I want to search customers by phone number so I can locate accounts quickly",
  "description": "## User Story\n**As a** customer service representative\n**I want to** search for customers by phone number\n**So that** I can quickly locate their account during inbound calls",
  "story_points": 5,
  "epic": "[epic_sys_id]",
  "sprint": "[sprint_sys_id]",
  "state": "-6",
  "priority": 2,
  "acceptance_criteria": "Given I am logged in as a service representative\nWhen I enter a phone number in the search field\nThen matching customer records are displayed within 2 seconds",
  "product": "[product_sys_id]",
  "classification": "Enhancement"
}
```

### Step 4: Estimate Story Points

Use relative sizing based on team velocity and complexity. Apply the modified Fibonacci scale:

| Points | Effort Level | Example |
|--------|-------------|---------|
| 1 | Trivial | Text change, config update |
| 2 | Simple | Single field addition with validation |
| 3 | Small | New UI component with basic logic |
| 5 | Medium | Feature with multiple integration points |
| 8 | Large | Complex feature spanning multiple modules |
| 13 | Very Large | Consider splitting into smaller stories |

**Update story points after estimation:**

**Using MCP:**
```
Tool: SN-Update-Record
Parameters:
  table_name: rm_story
  sys_id: [story_sys_id]
  fields:
    story_points: 5
    blocked: false
```

**Using REST API:**
```bash
PATCH /api/now/table/rm_story/[story_sys_id]
Content-Type: application/json

{
  "story_points": 5,
  "blocked": false
}
```

### Step 5: Validate Sprint Capacity

Before assigning stories, verify the sprint has remaining capacity.

**Using MCP:**
```
Tool: SN-Query-Table
Parameters:
  table_name: rm_sprint
  query: sys_id=[sprint_sys_id]
  fields: sys_id,short_description,capacity,story_points,start_date,end_date
  limit: 1
```

Calculate remaining capacity: `remaining = capacity - story_points`. Only assign stories if the total story points of new stories fit within the remaining capacity.

### Step 6: Link Stories to Epic and Verify

Query the epic to confirm all stories are linked correctly:

**Using MCP:**
```
Tool: SN-Query-Table
Parameters:
  table_name: rm_story
  query: epic=[epic_sys_id]^ORDERBYpriority
  fields: number,short_description,story_points,state,sprint,assigned_to,priority
  limit: 50
```

**Using REST API:**
```bash
GET /api/now/table/rm_story?sysparm_query=epic=[epic_sys_id]^ORDERBYpriority&sysparm_fields=number,short_description,story_points,state,sprint,assigned_to,priority&sysparm_limit=50
```
