<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Collaboration & Git Workflow Rules

- **MANDATORY PULL BEFORE COMMIT / PUSH**:
  This is a shared repository with multiple collaborators. Always pull the latest changes before committing any push to the remote repository:
  ```powershell
  git pull --rebase origin <branch_name>
  ```
  Ensure any conflicts are resolved and tests/builds pass cleanly before committing and pushing.
- **Branching Strategy**: Develop on dedicated feature branches (e.g., `feat/<feature-name>`) rather than pushing directly to `main`.
- **Shell Discipline**: Never chain commands with `&&` or `||` in PowerShell. Run one command per invocation.
