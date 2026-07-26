---
description: Show pending visual changes count and details
---

Check the `.visual-agent/pending/` folder for any JSON files.

Report:
- How many pending changes exist
- For each change: the selector, property, newValue, and timestamp
- Suggest running /view-apply to apply changes or /view-discard to discard them

If no folder or files exist, report that there are no pending changes.
