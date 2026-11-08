# Confirm Action Design Rules

- Inline confirmation is for focused reversible/destructive actions; complex consent belongs in AlertDialog.
- Localize label, prompt, confirmLabel, cancelLabel, pendingLabel, doneLabel, errorLabel, retryLabel and optional undo/countdown/hold/status labels.
- State: idle → confirming → pending (promise) → done/error. Retry repeats the failed operation. Pending cannot submit twice; Undo is offered only when onUndo exists.
- Cancel, Escape and outside press dismiss the question. Disabled applies to every face, not only the initial button.
- Timeouts pause on hover, focus within or hidden document; zero disables them. Controlled state requires acknowledging onStateChange; control mode must not change while mounted.
- Existing Valar Button supplies native onclick semantics; no modal focus trap or source motion runtime is introduced.
- Independently authored state-shape feedback uses measured native Web Animations: 120ms size/physical-radius envelope, 80ms incoming content and 60ms outgoing visual. Retarget interrupted paint; actions/events/focus never await animation. Real controls remain unscaled and unclipped. Outgoing visuals are inert/aria-hidden, never extra live regions or focus targets. This is a Valar visual adaptation, not a copy or equivalence claim.
- Reduced motion switches directly, including a preference change during flight. Resize/unmount cancel and clean up the envelope, content styles and outgoing visual. Equal natural state geometry is not artificially pulsed; content still transitions normally.
- fullWidth idle has no root border/padding inset: the actual button spans the containing zone (<2px width difference) and is at least 44px tall. Confirmation keeps Confirm-first focus; Shift+Tab reaches Cancel. Pending retains a visible Spinner that stops under reduced motion. Hold uses the real Space key (" "), never the empty string; early release cancels.
