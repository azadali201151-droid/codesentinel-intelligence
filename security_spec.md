# Security Specification: Nexis Enterprise

## Data Invariants
1. A Workspace must have exactly one Owner.
2. An Audit must belong to exactly one Workspace.
3. Access to an Audit is strictly restricted to members of the parent Workspace.
4. Tier 'enterprise' can only be set by a System Admin (verified against /admins/ collection).
5. Audit Logs are immutable once created.

## The "Dirty Dozen" Payloads (Attack Vectors)

1. **Identity Spoofing**: Attempt to create a workspace with `ownerId` of another user.
2. **Privilege Escalation**: Attempt to update `tier` to 'enterprise' as a regular user.
3. **Cross-Workspace Data Leak**: Attempt to read an audit from `workspace_B` while only being a member of `workspace_A`.
4. **Unauthorized Deletion**: Attempt to delete a workspace as a 'member' (non-owner).
5. **Ghost Audit**: Attempt to create an audit without a `workspaceId` or with a non-existent one.
6. **Shadow Update**: Attempt to modify the `review` (results) of an existing audit by a non-author.
7. **Traceability Erasure**: Attempt to delete an `AuditLog`.
8. **Resource Poisoning**: Create an audit with 5MB of junk code (blocked by limit).
9. **Role Hijacking**: A member attempts to promote themselves to 'admin' in a workspace.
10. **Orphaned Writes**: Creating an audit in a workspace where the user was recently removed (sync lag test).
11. **Malicious PR Injection**: Updating `githubContext` to point to a production repo the user doesn't own.
12. **System Field Injection**: Attempt to set `createdAt` manually to the past.

## Test Runner (Logic Verification)
The `firestore.rules` will be validated against these scenarios.
