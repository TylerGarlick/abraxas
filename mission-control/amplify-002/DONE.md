# amplify-002: Amplify Stage Creation E2E + StageMap Wiring

## Definition of Done
- [ ] /musician/stages/new creates a stage in the database and redirects to stage detail
- [ ] Stage appears on /musician/stages list after creation
- [ ] StageMap component is wired to a real route (/explore or /musician/stages map view)
- [ ] Stages created by the musician show on the map
- [ ] API route POST /api/stages returns 201 with stage data

## Context
- Repo: tylergarlick/amplify
- Checkout: /tmp/amplify-checkout/
- Stage creation API: src/app/api/stages/route.ts (POST handler exists)
- Stage creation form: src/app/(musician)/musician/stages/new/page.tsx
- Stage detail page: src/app/(musician)/musician/stages/[id]/page.tsx
- StageMap component: src/components/ar/StageMap.tsx (freshly committed, not yet wired)
- User: Tyler Garlick (tylergarlick)

## Notes
- Prisma schema has Stage + Territory models
- POST /api/stages also creates a Territory record
- GPS coordinates (lat/lng/alt/radius) required for stage creation
- StageMap was just added — needs to be wired to /explore or a new /musician/stages/map route
