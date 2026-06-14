---
name: feedback-no-background-processes
description: Never start background processes; always tell the user what to run and let them run it themselves
metadata:
  type: feedback
---

Never start dev servers, test runners, or any other processes in the background. Always tell the user the command to run and let them execute it manually.

**Why:** User explicitly asked for this — they want full control over what is running on their machine.

**How to apply:** After writing code, provide the commands to run as a code block and say "run this yourself." Never use `run_in_background: true` or background `&` for dev servers. Never use `curl` to verify a server started — just tell the user to open the browser.
