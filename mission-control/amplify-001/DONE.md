# amplify-001: Amplify Mobile-First Skeleton

## Definition of Done
- [ ] Root layout has proper viewport meta tag for mobile
- [ ] MusicianLayout uses a mobile-friendly bottom nav (not sidebar)
- [ ] Main content has mobile-safe container (padding, max-width)
- [ ] All tap targets are minimum 44x44px
- [ ] Layout loads correctly on a 375px wide screen (iPhone SE size)

## Context
- Repo: tylergarlick/amplify
- Path: src/app/layout.tsx, src/app/(musician)/layout.tsx, src/components/layout/MusicianSidebar.tsx
- Checkout: /tmp/amplify-checkout/
- User: Tyler Garlick (tylergarlick)
- Token: available via env

## Notes
- Next.js mobile web app (not React Native)
- Dark theme, Geist_Mono font
- MusicianLayout currently uses MusicianSidebar (desktop pattern)
- Root layout has no viewport meta — mobile browsers default to desktop width
