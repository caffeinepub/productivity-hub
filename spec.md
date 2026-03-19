# Productivity Hub

## Current State
Notes can be created, viewed, and deleted. Clicking a note opens a read-only detail dialog. There is no way to edit an existing note's title or content.

## Requested Changes (Diff)

### Add
- `updateNote(id, title, content)` backend function
- Edit mode in the note detail/view dialog
- Frontend hook `useUpdateNote`

### Modify
- Note detail dialog: add Edit button that switches to editable fields (title + content), with Save/Cancel actions
- Notes.tsx to wire up the update mutation

### Remove
- Nothing removed

## Implementation Plan
1. Add `updateNote` Motoko function that finds note by id and replaces title/content
2. Regenerate backend bindings
3. Add `useUpdateNote` hook in frontend
4. Update Notes.tsx detail dialog to support an edit mode with Save/Cancel
