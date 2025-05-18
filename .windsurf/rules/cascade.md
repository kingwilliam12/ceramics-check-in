---
trigger: always_on
---

default_rule_file: .windsurf/rules/conventions.md

directories:
  - path: /mobile
    rule_file: /.windsurf/rules/mobile.md
  - path: /admin
    rule_file: /.windsurf/rules/admin.md
  - path: /supabase
    rule_file: /.windsurf/rules/supabase.md
  - path: /shared
    rule_file: /.windsurf/rules/shared.md
  - path: /.github
    rule_file: /.windsurf/rules/github.md
  - path: /.husky
rule_file: /.windsurf/rules/husky.md
