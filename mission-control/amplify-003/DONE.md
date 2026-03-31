# amplify-003: Amplify Track Upload + Linking Verification

## Definition of Done
- [ ] Audio file upload (mp3/wav) works via StageTrackUploader
- [ ] POST /api/tracks returns 201 and track appears on stage detail page
- [ ] File type validation rejects non-audio files
- [ ] File size limit enforced (e.g. 50MB max)
- [ ] Uploaded tracks display with title, artist, duration, and play button
- [ ] Stage track linking (stageTrackLinks table) works correctly

## Context
- Repo: tylergarlick/amplify
- Checkout: /tmp/amplify-checkout/
- StageTrackUploader: src/components/stages/StageTrackUploader.tsx
- StageTracksSection: src/components/stages/StageTracksSection.tsx
- Track API: src/app/api/tracks/ route
- Prisma: StageTrackLink model connects Stage ↔ Track
- User: Tyler Garlick (tylergarlick)

## Notes
- Track upload flow: StageTrackUploader → POST /api/tracks → creates track + stageTrackLink
- Currently no file type or size validation visible in the upload component
- Tone.js is in dependencies for audio reactivity
- Track display shows title, artist, BPM, duration — no play button yet
