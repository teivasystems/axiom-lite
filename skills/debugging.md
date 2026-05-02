
# debugging-techniques v1.0.0

Comprehensive guide to debugging ServiceNow server-side and client-side code

Author: Happy Technologies LLC
Category: development
Complexity: intermediate
Tags: development, debugging, troubleshooting, logs, errors
Platforms: claude-code, claude-desktop, chatgpt, cursor, any

Tools:
  mcp: SN-Query-Table, SN-Execute-Background-Script, SN-Get-Record
  rest: /api/now/table/syslog, /api/now/table/sys_script_execution_history
  native: Bash, Read

## Procedure

### Server-Side Debugging

#### Logging Functions

ServiceNow provides multiple logging functions for server-side scripts. Choose based on log level and visibility requirements.

| Function | Log Level | Use Case |
|----------|-----------|----------|
| `gs.log(message, source)` | Debug | Development/testing - legacy, prefer gs.debug |
| `gs.debug(message)` | Debug | Detailed troubleshooting (requires debug enabled) |
| `gs.info(message)` | Info | Informational messages for normal operations |
| `gs.warn(message)` | Warning | Potential issues that don't stop execution |
| `gs.error(message)` | Error | Errors that need attention |

**Best Practice: Always include context in log messages:**
```javascript
// BAD - No context
gs.info('Record updated');

// GOOD - Full context
gs.info('[IncidentHandler] Incident ' + current.number + ' updated by ' + gs.getUserName() +
        ' - State changed from ' + current.state.getDisplayValue() + ' to ' + previous.state.getDisplayValue());
```

**Querying System Logs:**
```
Tool: SN-Query-Table
Parameters:
  table_name: syslog
  query: source=IncidentHandler^sys_created_onONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()
  fields: sys_created_on,level,message,source
  limit: 50
  order_by: sys_created_on
  order_by_desc: true
```

### Script Debugger

The Script Debugger allows step-by-step execution of server-side scripts.

**Enabling the Script Debugger:**

1. Navigate to **System Diagnostics > Script Debugger**
2. Click **Enable Debugging** for your session
3. Set breakpoints in scripts using the debugger UI
4. Trigger the script (e.g., update a record)
5. Step through code using F10 (step over), F11 (step into), F5 (continue)

**Debugging Business Rules:**
```
Tool: SN-Query-Table
Parameters:
  table_name: sys_script
  query: collection=incident^active=true
  fields: name,order,when,script,condition
  limit: 50
  order_by: order
```

**Key Features:**
- Variable inspection (hover over variables)
- Call stack visualization
- Watch expressions
- Conditional breakpoints

### Session Debug Modules

Enable detailed logging for specific components during your session.

**Common Session Debug Modules:**

| Module | Purpose | Enable Path |
|--------|---------|-------------|
| `Session Debug` | All session debugging | System Diagnostics > Session Debug > All |
| `Business Rules` | Log BR execution | System Diagnostics > Session Debug > Business Rules |
| `SQL` | Log database queries | System Diagnostics > Session Debug > SQL |
| `Security` | ACL debugging | System Diagnostics > Session Debug > Security |
| `Client Scripts` | Log client script data | System Diagnostics > Session Debug > Client Scripts |

**Enable via Script:**
```javascript
// Enable business rule debugging for current session
gs.setProperty('glide.debugger.current.enabled', 'true');
```

### Script Execution History

Track script execution for troubleshooting.

```
Tool: SN-Query-Table
Parameters:
  table_name: sys_script_execution_history
  query: sys_created_onONLast 1 hour@javascript:gs.hoursAgo(1)@javascript:gs.nowDateTime()
  fields: script,execution_time,status,error_message,sys_created_on
  limit: 100
  order_by: sys_created_on
  order_by_desc: true
```
