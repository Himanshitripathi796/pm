## 6) Example workflows

### A) Admin creates project + adds members
1. Admin logs in.
2. Opens `/projects`, submits `ProjectForm`.
3. API `POST /api/projects` creates project with `createdBy=admin`.
4. Admin adds members using `POST /api/projects/:id/members`.
5. Members now see project in `/projects`.

### B) Admin creates and assigns task
1. In `/projects/:id`, admin opens `TaskForm`.
2. Submits `title` / `description` / `assignedTo` / `status` / `dueDate`.
3. API validates project membership and assignee validity.
4. Task is created and list query invalidated/refetched.

### C) Member updates task status
1. Member sees assigned task on dashboard/project detail.
2. Changes status via `PATCH /api/tasks/:id/status`.
3. API verifies assigned ownership (or admin role).
4. Dashboard stats update via React Query cache invalidation.

### D) Dashboard filtering
1. User selects project and status filters.
2. Frontend calls `GET /api/tasks?projectId=...&status=...`.
3. Server applies role-aware query.
4. UI recomputes totals + overdue from filtered result set.
