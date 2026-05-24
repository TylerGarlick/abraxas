---
name: docker-health-check
description: >
  Validates Docker container health before proceeding with setup tasks.
  Waits for containers to be "healthy" or "running" status before executing
  migrations, setup scripts, or dependent tasks.
  
  Triggers: When setting up projects with Docker Compose, running migrations,
  or any task that depends on a service being ready.
---

# Docker Health Check Skill

Wait for Docker containers to be healthy before proceeding.

## The Problem

```
Docker container starts → docker-compose up -d → IMMEDIATELY run migration
→ Migration fails because database isn't ready yet → Error
```

## The Solution

Check container health before proceeding:

```bash
#!/bin/bash
# wait-for-health.sh <container_name> [timeout_seconds]

CONTAINER="$1"
TIMEOUT="${2:-60}"
INTERVAL=2
ELAPSED=0

echo "Waiting for $CONTAINER to be healthy..."

while [ $ELAPSED -lt $TIMEOUT ]; do
    # Check if container exists
    if ! docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
        echo "Container $CONTAINER does not exist"
        return 1
    fi
    
    # Get health status
    STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER" 2>/dev/null)
    RUNNING=$(docker inspect --format='{{.State.Running}}' "$CONTAINER" 2>/dev/null)
    
    # If no health check defined, fall back to Running status
    if [ -z "$STATUS" ] && [ "$RUNNING" = "true" ]; then
        echo "$CONTAINER is running"
        return 0
    fi
    
    # Check for healthy status
    if [ "$STATUS" = "healthy" ]; then
        echo "$CONTAINER is healthy!"
        return 0
    fi
    
    echo "  $CONTAINER status: ${STATUS:-none} (waiting...)"
    sleep $INTERVAL
    ELAPSED=$((ELAPSED + INTERVAL))
done

echo "Timeout waiting for $CONTAINER to be healthy"
return 1
```

## Usage in Setup Scripts

```bash
#!/bin/bash
# setup.sh

# Wait for dependencies
./wait-for-health.sh postgres 30
./wait-for-health.sh redis 20

# Now safe to run migrations
bunx prisma migrate dev

# Or run your app
./start.sh
```

## Docker Compose Integration

Add health checks to your docker-compose.yml:

```yaml
services:
  postgres:
    image: postgres:16
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
  
  redis:
    image: redis:7
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5
```

## Wait for Multiple Containers

```bash
#!/bin/bash
# wait-all.sh

CONTAINERS="postgres redis elasticsearch"

for container in $CONTAINERS; do
    ./wait-for-health.sh "$container" 60 || {
        echo "Failed: $container"
        exit 1
    }
done

echo "All containers healthy!"
```

## Integration with Skills

Add to setup skills that use Docker:

```python
def run_setup_with_health_checks():
    """Run setup after verifying Docker services are healthy."""
    containers = ['postgres', 'redis']
    for container in containers:
        result = subprocess.run(
            ['./wait-for-health.sh', container, '60'],
            capture_output=True
        )
        if result.returncode != 0:
            raise RuntimeError(f"Container {container} not healthy")
    
    # Now run migrations
    subprocess.run(['bunx', 'prisma', 'migrate', 'dev'])
```

## Files

- `scripts/wait-for-health.sh` - Main health check script
- `scripts/wait-all.sh` - Wait for multiple containers

## Lessons Learned

From Satchel project setup:
- **Didn't verify PostgreSQL health before proceeding** - Assumed Docker container was ready without checking
- **Redis needs time to initialize** - Even when running, may not accept connections immediately
- **Health checks prevent cascading failures** - Better to fail fast at dependency check than cryptic downstream errors

---

*Created from retrospective: task-retro-satchel-bwn-m7y-n9j-satchel-project-initial-setup.md*
