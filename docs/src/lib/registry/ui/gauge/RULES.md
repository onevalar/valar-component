# Gauge Design Rules

- Read-only percentage, not a completion target; never add confetti or goal states.
- Supply localized label and valueText. Only the arc and numeric ARIA range clamp; the displayed number/valueText retain overflow.
- GaugeArc belongs inside an SVG; radius defaults to 42 in a 100-unit viewBox. Null draws a dashed missing track and no value arc.
- Accent uses primary, danger uses destructive. Size through class; use a separate legend for comparisons.
