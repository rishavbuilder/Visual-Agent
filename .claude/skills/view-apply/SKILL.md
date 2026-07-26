---
name: view-apply
description: Apply all pending visual changes to source code
user-invocable: true
argument-hint: ""
---

Read all JSON files in the `.visual-agent/pending/` folder. For each file:

1. Get the `selector`, `property`, and `newValue` from the JSON
2. Find the source file mentioned in the `file` field (usually `index.html`)
3. Update the CSS/styles in that file:
   - If a `<style>` block exists, add or update the CSS rule for the selector
   - If no `<style>` block exists, create one before `</head>`
4. Delete the JSON file after applying

After applying all changes, report how many changes were applied successfully.

Example change format:
```json
{
  "id": "abc123",
  "selector": "h1",
  "property": "color",
  "newValue": "#e94560",
  "file": "index.html"
}
```
