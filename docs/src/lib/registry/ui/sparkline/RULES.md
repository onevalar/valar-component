# Static Sparkline Design Rules

- Supply ordered calendar slots as finite nonnegative numbers or null. Null breaks the path; zero is an actual baseline point.
- Decorative only: provide an adjacent text summary and exact data when needed.
- Do not synthesize samples, smooth gaps, forecast or animate readings.
- Default viewBox is 72 × 40 and display size 50.4 × 28; native SVG attributes can override size.
- `appearance="project"` adapts Linear’s full-size Project Progress Completed series into Valar’s 104 × 32 compact chart. Use a thin indigo line, a fade to the zero baseline and dots for the last recorded value and isolated samples. Preserve gaps in both line and fill.
- Keep the chart out of the tab order. Interactive controls and readable values belong beside it.
