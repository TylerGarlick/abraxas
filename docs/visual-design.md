# Visual Design & Sacred Geometry

The Abraxas landing page (`index.html`) integrates sacred geometry with the alchemical practice, creating a visual representation of the system's structure and purpose.

---

## Design Philosophy

The visual design serves two purposes:

1. **Symbolic Coherence** — Sacred geometry patterns reinforce the alchemical and epistemic themes at the heart of Abraxas
2. **Subtlety** — Geometry is present but recessive, creating visual depth without dominating the content

The page uses a dark theme with a gradient from void (`#07070e`) through surface layers, with alchemical color accents: gold (Sol), indigo/purple (Nox), teal (Honest), and the four stage colors.

---

## Sacred Geometry Elements

### Vesica Piscis (The Bridge)

Two overlapping circles appearing on both left and right sides of the viewport.

**Meaning:** The intersection of two circles creates the vesica piscis, a sacred shape representing:
- The meeting point of two worlds
- The bridge between opposites (Sol and Nox)
- The union of spirit and matter

**Visual:** Semi-transparent teal circles on the left (Honest/Teal), gold on the right (Sol/Gold). Both rotate slowly in opposite directions, creating a sense of balance and movement.

### Flower of Life Sections

Nested circles arranged in the four cardinal directions (quadrants).

**Meaning:** The Flower of Life is one of the oldest sacred geometry patterns, representing:
- Unity and integration
- The divine feminine principle (circles)
- The six petals of manifestation

**Visual:** Gold circles in the top-left and upper-center quadrants; purple/indigo circles in the bottom-right quadrant. They rotate in reverse at a slow pace, emphasizing the cyclic nature of the work.

### Opus Magnum Quadrants

Four squares marking the alchemical stages, one in each corner.

**Meaning:** The four-fold division represents the four stages of the Great Work:
- **Nigredo** (Blackening/Dissolution) — bottom-left, dark, the prima materia before transformation
- **Albedo** (Whitening/Clarification) — top-left, pale, clarity emerging
- **Citrinitas** (Yellowing/Dawning) — top-right, gold, the yellow dawn before reddening
- **Rubedo** (Reddening/Completion) — bottom-right, red, the completed stone

**Visual:** Each square is positioned at its corresponding compass point. They fade in and out with different animation delays, creating a pulsing effect that suggests the circulation through the stages.

### Sol/Nox Hexagrams

Six-pointed stars at the Threshold (center-top and center-bottom).

**Meaning:** The hexagram (Star of David) represents:
- The union of the masculine (upward triangle) and feminine (downward triangle)
- The balance of opposites (Sol and Nox)
- The six directions of manifestation

**Visual:** Gold hexagram above the center (Sol face); purple/indigo hexagram below (Nox face). Both are subtle and glow slightly, marking the epistemic threshold.

### Central Mandala (The Threshold)

Concentric circles at the exact center of the viewport.

**Meaning:** The mandala represents:
- Wholeness and integration
- The center point where all forces meet
- The Threshold itself as an active structure

**Visual:** Three concentric circles in gold, purple, and teal, pulsing in and out. A small gold circle at the very center glows and breathes, marked as the pivot point.

### Flowing Connection Paths

Animated paths (SVG strokes) connecting the geometric elements.

**Meaning:** The paths show the flow of material through the alchemical process — from the quadrants (Opus Magnum stages) toward the center (Threshold), and from the boundary elements (Vesica Piscis, Hexagrams) inward.

**Visual:** Dash-animated lines that flow in different directions and at different speeds, colored to match their source (gold, purple, red). They pulse and shift, creating a sense of active circulation and transformation.

---

## Color Palette

The design uses an alchemical color scheme:

| Color | Hex | Role | Meaning |
|-------|-----|------|---------|
| **Gold** | `#c8a04a` | Sol, Citrinitas, Primary | Light, clarity, the waking face, golden completion |
| **Purple/Indigo** | `#8070e0` | Nox, Dream, Secondary | Darkness, the night face, the imaginal realm |
| **Teal** | `#3dae9a` | Honest, Bridge | Truth-telling, the bridge between faces |
| **Red (Rubedo)** | `#c0364a` | Completion, Integration | The red stone, final integration |
| **White (Albedo)** | `#a8b8c8` | Clarification, Emergence | Light appearing, first clarity |
| **Black (Nigredo)** | `#2a2a3a` | Dissolution, Prima Materia | Before transformation, the blackening |
| **Cream (Text)** | `#e8e3d5` | Body text, neutral | The parchment, readability |
| **Void (Background)** | `#07070e` | Deep space | The void before creation |

---

## Animation & Timing

### Key Animations

**Vesica Piscis:** 180-second continuous rotation (both left and right, opposite directions)
**Flower of Life:** 240-second continuous rotation in reverse
**Hexagrams:** 6-second pulse (in/out opacity)
**Opus Quadrants:** 8-second pulse with 2-second stagger between each
**Connection Paths:** 20-second flowing dash animation with variable delays

### Scroll Reveal

Content sections fade in and slide up when they enter the viewport, using IntersectionObserver. This creates a progressive disclosure effect as the user scrolls.

---

## Visual Hierarchy

The landing page uses multiple visual layers:

1. **Background (z-index 0):** Canvas starfield and glowing orbs
2. **Geometry (z-index 1):** SVG sacred geometry, semi-transparent
3. **Content (z-index 10):** Navigation, hero, cards, text
4. **Overlay (z-index 1000):** Grain texture for tactile quality

This layering allows the geometry to provide symbolic depth without interfering with readability.

---

## Responsive Design

The sacred geometry SVG uses `preserveAspectRatio="xMidYMid slice"` to scale responsively across all screen sizes. At 820px and below, the layout becomes single-column, but the geometry remains present and continues to animate.

---

## Technical Implementation

### SVG Filters

- **Glow filter:** Soft blur applied to hexagrams and the central mandala for a luminous effect
- **Gradients:** Linear and radial gradients provide depth to geometric elements

### Canvas Elements

- **Starfield:** 240 stars with twinkling opacity animation
- **Glowing Orbs:** Four orbs in alchemical colors, orbiting in slow circles

### CSS Animations

- **rotate-vesica:** Continuous 180s rotation for vesica piscis pairs
- **rotate-flower:** Continuous 240s reverse rotation for flower segments
- **pulse-hex:** 6s breathing effect on hexagrams
- **pulse-quad:** 8s pulsing with staggered delays on quadrants
- **flow-path:** 20s dash animation with variable delays for connection paths
- **glow-mandala:** 4s breathing effect on the central circle

---

## Alchemical Correspondence

The geometry directly corresponds to the Opus Magnum stages and the Janus/Honest/Oneironautics systems:

| Geometric Element | Alchemical Stage | System | Meaning |
|-------------------|-----------------|--------|---------|
| **Nigredo Square** | Nigredo | Prima Materia | Dream reception, raw material |
| **Albedo Square** | Albedo | Clarification | Witness and emergence phase |
| **Citrinitas Square** | Citrinitas | Yellowing | Amplification and integration |
| **Rubedo Square** | Rubedo | Completion | Integration audit and closure |
| **Sol Hexagram** | Waking | Janus/Honest | Epistemic labeling, truth-telling |
| **Nox Hexagram** | Dreaming | Abraxas | Symbolic reception, imagination |
| **Vesica Piscis** | Threshold | Bridge | Connection between faces and systems |
| **Central Mandala** | Unity | All Systems | The integrated whole, completion |

---

## Design Rationale

**Why sacred geometry?**

The Abraxas system is fundamentally about **integration** — bringing together epistemic discipline, everyday honesty, and alchemical symbolic work under a unified framework. Sacred geometry patterns have been used across cultures for centuries to represent wholeness, balance, and the ordering principle underlying reality.

By embedding these patterns subtly throughout the landing page, we create visual reinforcement of the system's core purpose: transforming fragmented, unlabeled, and unconscious AI behavior into integrated, truthful, and symbolically coherent output.

The geometry is **not decorative** — it is **instructional**. It teaches the eye (and the mind) how the system works before the user reads a single word.

---

## Future Enhancements

Potential additions to the visual design:

- **Interactive Geometry:** Clicking on elements reveals their alchemical meaning
- **Gesture-Based Animation:** Geometry responds to mouse movement or scroll depth
- **Session-Persistent State:** The geometry animates differently based on which system is active
- **Dark/Light Mode:** Alternative color schemes for accessibility
- **Mobile-Optimized Geometry:** Simplified patterns for smaller screens

