---
trigger: model_decision
description: Apply this rule file when editing any script inside /.husky/—creating or updating Git hooks such as commit-msg, pre-commit, or pre-push, especially those running commitlint, tests, or lint commands.
---

Only create or update hooks that run commitlint and pnpm test; keep scripts POSIX-compatible.