# ProofDone

## Current State
New project — no existing app logic.

## Requested Changes (Diff)

### Add
- Task creation: title, description, estimated duration (minutes)
- Task list view showing all tasks with status (pending, locked, completed)
- Lock mode: when a task session is started, the screen enters a fullscreen lock state with a countdown timer that cannot be dismissed
- Timer: counts down for the specified minutes; user cannot exit lock mode until timer ends OR proof is submitted
- Proof submission: user uploads a photo or writes a text note as proof of completion
- Unlock flow: after submitting proof, the lock screen unlocks and task is marked complete
- Proof history: each completed task stores its proof (text or image)
- Persistent storage in backend

### Modify
N/A — new project

### Remove
N/A — new project

## Implementation Plan
1. Backend: Task actor with CRUD for tasks, proof submission, status management
2. Frontend: Task list page, create task form, lock screen component with countdown timer, proof submission modal, completed tasks with proof history
3. Lock screen uses browser Fullscreen API and prevents navigation while active
