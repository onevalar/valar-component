# Segmented Control Design Rules

- Compose ToggleGroup for one nonempty selection; option values must be unique and nonempty. Always provide a localized group label.
- A second click on the chosen segment does not clear it. Arrows/Home/End select and move focus; disabled options are skipped.
- Use string labels and optional Svelte accessory snippets, not React children. Supply value or bind:value and onValueChange as needed.
- It is not a tab-panel or multi-selection API. Existing ToggleGroup handles multiple toggles; Tabs associates panels.
- Options scroll horizontally in narrow containers; never truncate away the only accessible label.
