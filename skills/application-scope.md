
# application-scope v1.0.0

Manage scoped application development including setting application context and update set alignment

Author: Happy Technologies LLC
Category: admin
Complexity: intermediate
Tags: admin, scope, application, development, scoped-app
Platforms: claude-code, claude-desktop, cursor, any

Tools:
  mcp: SN-Set-Current-Application, SN-Set-Update-Set, SN-Get-Current-Update-Set, SN-Query-Table, SN-Create-Record
  rest: /api/now/table/sys_app, /api/now/table/sys_update_set
  native: Bash, Read

## Procedure

### Step 1: Identify Target Application

First, find the application you want to work in.

**Using MCP tools:**
```
Tool: SN-Query-Table
Parameters:
  table_name: sys_app
  query: scope!=global^active=true
  fields: sys_id,name,scope,version,vendor
  limit: 50
```

**Expected Response:**
```json
{
  "result": [
    {
      "sys_id": "abc123def456...",
      "name": "My Custom Application",
      "scope": "x_myco_custom_app",
      "version": "1.0.0",
      "vendor": "My Company"
    }
  ]
}
```

**Decision Points:**
- If application exists → Proceed to Step 2
- If application not found → Create new application (see Example 3)
- If choosing between multiple apps → Verify scope prefix matches intended namespace

### Step 2: Set Current Application Scope

Set the application context for all subsequent operations.

**Using MCP tools:**
```
Tool: SN-Set-Current-Application
Parameters:
  app_sys_id: abc123def456...
```

**Important:** This is an automated operation using the sys_trigger mechanism. It executes in approximately 1-2 seconds.

**Verification:**
```
Tool: SN-Query-Table
Parameters:
  table_name: sys_user_preference
  query: user=javascript:gs.getUserID()^name=apps.current_app
  fields: value
```

### Step 3: Verify or Create Application Update Set

Scoped applications should have their own update sets to maintain clean separation.

**Query existing update sets for the application:**
```
Tool: SN-Query-Table
Parameters:
  table_name: sys_update_set
  query: application=abc123def456...^state=in progress
  fields: sys_id,name,state,application
  limit: 10
```

**Decision Points:**
- If suitable update set exists → Use existing (Step 4)
- If no update set or all completed → Create new update set

**Create application-specific update set:**
```
Tool: SN-Create-Record
Parameters:
  table_name: sys_update_set
  data:
    name: "My Custom App - Feature Development v1.1"
    application: abc123def456...
    state: in progress
    description: "Development update set for new features"
```

### Step 4: Set Current Update Set

Align the update set with the application scope.

**Using MCP tools:**
```
Tool: SN-Set-Update-Set
Parameters:
  update_set_sys_id: xyz789ghi012...
```

**Verification:**
```
Tool: SN-Get-Current-Update-Set
Parameters: (none required)
```

**Expected Response:**
```json
{
  "name": "My Custom App - Feature Development v1.1",
  "sys_id": "xyz789ghi012...",
  "state": "in progress",
  "application": "abc123def456..."
}
```

### Step 5: Verify Scope and Update Set Alignment

Confirm both scope and update set are properly set before development.

**Full verification query:**
```
Tool: SN-Query-Table
Parameters:
  table_name: sys_update_set
  query: sys_id=xyz789ghi012...
  fields: sys_id,name,application.name,application.scope
```

**Alignment Checklist:**
- [ ] Application scope matches intended app
- [ ] Update set application field references correct app
- [ ] Update set state is "in progress"
- [ ] User has write access to the scope
