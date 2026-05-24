# Link Checker

Validates links in content.

## Usage

```
You: "MJ check links in this article" [paste content]
MJ: Reports broken or problematic links
```

## Link Issues Detected

| Issue | Description |
|-------|-------------|
| Broken | 404 or 5xx response |
| Redirect | Chain of 3+ redirects |
| Missing Rel | No rel="nofollow" on external |
| Insecure | HTTP on sensitive pages |

## Tips

- Some false positives possible (firewalls, auth)
- Redirect warnings are suggestions, not errors
- Re-check after content updates
