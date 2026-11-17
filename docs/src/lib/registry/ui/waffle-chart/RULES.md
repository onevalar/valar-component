# Waffle Chart Design Rules

- Supply finite data and an accessible label. Positive totals allocate exactly 100 whole cells. For zero or empty data, the frame stays visible with no filled cells.
- Largest-remainder cells are approximate; keep exact values in a nearby accessible legend.
- Colors come from caller-owned semantic series tokens; never use color as the only explanation.
- Read-only: do not imply that cells are buttons or add hover-only information.
