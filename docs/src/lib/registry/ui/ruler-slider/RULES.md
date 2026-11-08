# Ruler Slider Design Rules

- A fixed needle over a native translated tape. Provide label, finite min/max (max > min), positive step/spacing/majorEvery and a synchronous numeric value. Existing Slider cannot express this moving-tape interaction.
- value/bind:value/onValueChange adjusts during drag/coast. onValueCommit runs once on drag settlement, immediately for a tap/key target, or after 120ms of horizontal-wheel inactivity. External updates do not emit callbacks.
- format localizes both the readout and spoken value; unit is visual/spoken, name submits the plain numeric hidden input.
- Drag inversely by spacing/step; catch an in-flight tape, flick to coast, pull past an end to rubber-band and settle. Cancel/lost capture settles without a flick. Vertical wheel input scrolls the page untouched.
- All arrows step; Shift+arrows and PageUp/Down use largeStep (default labelled interval); Home/End reach bounds. Alt/Ctrl/Meta combinations pass through.
- Reduced motion removes inertia/elastic extension/springs but keeps input, snapping and commit semantics. Only animateReadout=false is supported: rolling digits are not provided.
- Disabled controls cannot change or submit. Native form reset is not a value-reset API: reset through the bound value.
