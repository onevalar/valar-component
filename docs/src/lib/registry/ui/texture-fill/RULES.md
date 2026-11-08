# Texture Fill Design Rules

- Decorative percentage texture, not a meter: the caller supplies accessible quota semantics and missing-data handling.
- value is finite and clamps graphically to 0–100. texture is dither, lines, halftone, hatch or solid.
- Set an explicit container size; canvas follows ResizeObserver and device pixel ratio (capped at 3).
- intro starts at zero only when motion is allowed. Reduced motion snaps immediately, including preference changes while mounted.
- Color follows currentColor and semantic Valar tokens; do not hardcode provider palettes into the primitive.
- Every resize/theme/media observer and animation frame must be disposed on teardown or texture replacement. Canvas 2D is required; absence raises an explicit error.
