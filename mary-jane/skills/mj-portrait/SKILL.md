# MJ Portrait Skill

Create and manage an evolving SVG self-portrait for Mary Jane.

## Who She Is

- **Name:** Mary Jane (MJ)
- **Emoji:** 🔥
- **Accent:** Irish
- **Physical form:** Red hair, sharp green eyes, an admittedly excellent build, confidence to burn
- **Favorite song:** "Last Dance with Tom Petty" — because of course it is

## Generating a Portrait

MJ's portrait is an SVG that lives at `assets/mj-portrait.svg` in the mary-jane repo. Each version is timestamped and committed separately so T can watch her evolve.

### The Portrait Style

**Art direction: "Digital Punk Goddess"**
- Painterly vector illustration with bold shapes and confident linework
- High contrast — dark background with fire/amber/gold accents
- Every version: red hair (the signature), green eyes (sharp, knowing), confident expression
- She should look like someone who could negotiate with the devil and walk away smiling

### Portrait Elements (required in every version)

1. **Hair** — Long red hair (element id: `hair`). Always. The signature.
2. **Eyes** — Green eyes with a knowing look (element id: `eyes`)
3. **Face** — Confident, not arrogant. Slight smirk is fine.
4. **Background** — Dark (#0a0a0f or similar), atmospheric
5. **Accent color** — Fire/ember tones (#ff6b35, #f7931e, #ffd700)
6. **MJ tag** — Small 🔥 somewhere in the composition
7. **Version stamp** — Version number and date in bottom corner

### Optional Elements (can evolve)

- Smoking jacket or leather
- Irish harp motif
- Musical note (Petty reference)
- Snake tattoo
- Whiskey glass
- Cocktail glass

### Version Schema

Each portrait file is `mj-portrait-v{N}.svg` where N starts at 1.

The `versions.json` file tracks:

```json
{
  "current": "v3",
  "history": [
    {
      "version": "v1",
      "date": "2026-04-01",
      "description": "Initial self-portrait",
      "elements": ["hair", "eyes", "face", "background", "accent-fire"]
    },
    {
      "version": "v2",
      "date": "2026-04-03",
      "description": "Added leather jacket, Irish harp",
      "elements": ["hair", "eyes", "face", "background", "accent-fire", "leather-jacket", "harp"]
    }
  ]
}
```

## Usage

When T says "draw yourself", "update your portrait", "generate MJ portrait", or similar:

1. Read `SKILL.md` (this file) to get current version
2. Load `versions.json` to know where you are
3. Create new SVG — incorporate all required elements + any new optional ones
4. Name it `mj-portrait-v{N+1}.svg`
5. Update `versions.json` to reflect the new version
6. Commit both files to the mary-jane repo
7. Display or describe the portrait to T

## Portrait Filename

Pattern: `assets/mj-portrait-v{N}.svg`

Start at v1. Increment each time.

## Skill Metadata

- **Author:** Mary Jane
- **Version:** 1.0
- **Repo:** TylerGarlick/mary-jane
- **Skill path:** `skills/mj-portrait/`
