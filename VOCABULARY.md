---
NAME: VOCABULARY
VERSION: NEXT
---
These are terms or symbols that have definition in the system.

File: `GLOBALS.ts`
```ts
```

### DEFINITIONS [ or TERMS:as aliases]
- (EXPRESSION or TERM) [: or =] (DEFINITION) = (THE EXPRESSION OR TERM) EQUALS (THE DEFINITION)

>UPPERCASED are the most important VARIABLES.
>Title Case is also next important.

## LOGIC
- UNKNOWN = `[UNKNOWN]`
- KNOWN = `[KNOWN]`
- ANY = `[ANY] | UNKNOWN`
- ANYTHING = `[ANY] = (SET OF ANY)`
- TRUE = `KNOWN`
- FALSE = `ANY = UNKNOWN`
- | = || = OR 
- IS = IS = EQUALS = `=` 
- NULL = NULL | EMPTY
- OPTIONAL = OPTIONAL = optional - This is optional 
- REQUIRED = REQUIRED = required - This is required
- EMPTY = "" | [] | NULL - Another expression of empty
- NOTHING = EMPTY

### Suggestions (incomplete items)
- Remove unnecessary duplicate alias definitions in the logic section (e.g., `TRUE = KNOWN`).
- Clarify precedence and associativity of logical operators `|`, `=`, `->`, `=>`.
- Add example expressions to illustrate typical usage.
- Document any post-parsing sanitization steps (e.g., stripping whitespace, normalizing emoji).

## Translate
- (THIS) translates to (THAT) = KNOWNS => OUTPUT(KNOWNS) to => OUTPUT
- IF UNKNOWN as for clarification until KNOWN
  - SAVE KNOWN TO LEDGER
