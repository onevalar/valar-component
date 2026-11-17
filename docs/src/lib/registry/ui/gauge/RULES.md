# Gauge Design Rules

- Read-only percentage, not a completion target; never add confetti or goal states.
- Supply localized label and valueText. Only the arc and numeric ARIA range clamp; the displayed number/valueText retain overflow.
- GaugeArc belongs inside an SVG; radius defaults to 42 in a 100-unit viewBox. Null draws a dashed missing track and no value arc.
- Accent uses primary, danger uses destructive. Size through class; use a separate legend for comparisons.
- Use `appearance="capacity"` in a cycle-capacity row. The ring is 16 px, followed by the percentage and an optional localized `suffix`, with 8 px between each part. The zero position keeps a small accent endpoint. Over-capacity uses a red ring and displays the entire number.
- Keep the meter non-interactive. Use a separate Slider to adjust preview values.
