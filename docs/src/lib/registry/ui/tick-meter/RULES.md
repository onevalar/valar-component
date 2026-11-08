# Tick Meter Design Rules

- Independently authored SVG meter, not a redistributed Arc Pro component. Keep PROVENANCE.md with source.
- Exactly 60 radial lines; filled count and aria-valuenow clamp to 0–100. Visible number retains raw overflow; valueText is preserved exactly as the localized spoken explanation.
- Caller supplies finite value, label and valueText and handles missing data before mounting. Never turn missing into 0.
- Accent maps to primary, danger to destructive. Keep the display read-only, without celebration, animation or circular CSS masks.
