# Mission‑Control Task Aggregator

**Purpose** – Creates or updates a single master `tasks.json` file under the Mission‑Control repository that contains all tasks from the ten repositories you specified.  The skill:

1. Scans each repo for a `tasks.json` at the root or inside `skills/tasks`.
2. Pulls the `tasks` array from each found file.
3. Merges those arrays into a single master list.
4. Writes that list to `mission‑control/tasks.json`.
5. Performs a `git pull --rebase mission‑control master`, stages the file, commits with a date‑stamped message, and pushes to the Mission‑Control remote.

No bootstrap/reference files are touched.

**Usage**
Run:
```
/mission‑control‑task‑aggregator
```
Or schedule it in cron.
