# Abraxas Skills Data Access Audit

## Current Data Access Patterns

### GraphQL Users
- `provenance-audit`: Uses `http://localhost:4000/graphql` via axios.

### Direct Database (ArangoDB) Users
These skills bypass the GraphQL server and interface directly with ArangoDB (often via `DBManager` or internal HTTP calls).

| Skill | Data Handled | Access Method |
| :--- | :--- | :--- |
| `sovereign_anchor` | Genesis Blocks, fragments | `DBManager` / `infra.mcp.main.db_manager` |
| `soter` | SoterDB, Risk scores | Direct ArangoDB via `SoterDB` |
| `retrospectives` | Retrospective assessments | Direct ArangoDB |
| `pipeline-dispatcher` | Dispatch events, `SovereignNodes`, `SovereignEdges` | Direct ArangoDB HTTP calls |
| `metanoia` | Modification ledger | Direct ArangoDB |
| `stochasmos` | Intervention provenance | Direct ArangoDB |
| `ledger` | Task documents, dependency edges | Direct ArangoDB |
| `epistemic_atlas` | Map of meaning (fragments/edges) | Direct ArangoDB |

### Filesystem (FS/JSON) Users
These skills use local files (JSON/Text) for state and storage.

| Skill | Data Handled | Access Method |
| :--- | :--- | :--- |
| `hermes` | Track records, backlog, mission control state | `fs.readFileSync`, `fs.writeFileSync` (JSON) |
| `sovereign-boot` | History, Genesis files | `fs.readFileSync` |
| `secrets-manager` | Secret store, audit logs | `fs.readFileSync`, `fs.writeFileSync` (JSON/TXT) |
| `logos-math` | Math logs | `fs.readFileSync` |
| `plan` | Session state | `fs.readFileSync` (JSON) |
| `ethos` | Sources list | `fs.readFileSync` |
| `dianoia` | History/Session data | `fs.readFileSync` (JSON) |

## Migration Plan: Transition to GraphQL

### Objective
Consolidate all data access through the GraphQL server to ensure unified schema enforcement, auditing, and decoupled infrastructure.

### Phase 1: Schema Extension (High Priority)
Create GraphQL types, queries, and mutations to cover the "missing" data patterns identified above.

#### Proposed Schema Additions

**1. Ledger & Tasking (from `ledger`)**
- `type Task { id: ID!, title: String, status: String, ... }`
- `query getTasks(filter: TaskFilter): [Task]`
- `mutation updateTask(id: ID!, status: String): Task`
- `mutation createDependency(from: ID!, to: ID!): Edge`

**2. Sovereign Brain & Anchors (from `sovereign_anchor`, `epistemic_atlas`)**
- `type Fragment { id: ID!, content: String, immutable: Boolean, ... }`
- `query getFragment(id: ID!): Fragment`
- `mutation createGenesisBlock(content: String!, meta: JSON): Fragment`

**3. Soter & Risk Management (from `soter`)**
- `type RiskScore { entityId: ID!, score: Float, timestamp: DateTime }`
- `query getRiskScore(entityId: ID!): RiskScore`
- `mutation updateRiskScore(entityId: ID!, score: Float!): RiskScore`

**4. Hermes & Mission Control (from `hermes`)**
- `type TrackRecord { id: ID!, state: JSON, ... }`
- `query getTrackRecords: [TrackRecord]`
- `mutation saveTrackRecord(input: TrackRecordInput!): TrackRecord`

**5. Infrastructure (from `secrets-manager`)**
- `type SecretMetadata { key: String!, createdAt: DateTime }`
- *Note: Secrets storage and retrieval are EXCLUDED from GraphQL to prevent exposure of sensitive .env and credential data.*

### Phase 2: Skill Refactoring (Incremental)
Refactor skills to replace `DBManager` or `fs` calls with a standardized `GraphQLClient`.

1. **Implement `AbraxasGraphQLClient`**: A shared utility for all skills to handle auth, retries, and typing.
2. **Migrate `Sovereign Anchor`**: First priority due to its "Genesis" nature.
3. **Migrate `Ledger`**: Critical for task flow.
4. **Migrate `Hermes` & `Soter`**: Move state from JSON files to GraphQL-backed storage.

### Phase 3: Verification & Cleanup
- Run `provenance-audit` across all migrated skills.
- Remove `infra.mcp.db_manager` dependencies from skill logic.
- Delete legacy JSON storage files once data is migrated to the DB via GraphQL.

## Mapping: Existing Skills $\to$ Proposed GraphQL Operations

| Skill | Legacy Access | Proposed GraphQL Operation |
| :--- | :--- | :--- |
| `sovereign_anchor` | `db.collection("fragments").get()` | `query getFragment` / `mutation createGenesisBlock` |
| `ledger` | ArangoDB Documents/Edges | `query getTasks` / `mutation updateTask` |
| `soter` | `SoterDB` calls | `query getRiskScore` / `mutation updateRiskScore` |
| `hermes` | `index.json`, `backlog.json` | `mutation saveTrackRecord` / `query getBacklog` |
| `secrets-manager` | `STORE_FILE` (JSON) | *Excluded from GraphQL for security* |
| `pipeline-dispatcher` | HTTP ArangoDB | `mutation recordDispatchEvent` |
| `retrospectives` | Direct ArangoDB | `mutation saveRetro` / `query getRetros` |
