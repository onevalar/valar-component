---
title: Confirm Action
description: Inline confirmation with asynchronous results, retry and undo.
component: true
---

<script>
  import ComponentPreview from "$lib/components/component-preview.svelte";
  import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="confirm-action-demo"><div></div></ComponentPreview>

## Installation

<PMAddComp name="confirm-action" />

## Contract

`import { ConfirmAction, type ConfirmActionState, type ConfirmActionMode } from '@valar/svelte-ui/confirm-action'`.

Required label:string; optional prompt:string, icon:Snippet. Localizable copy: confirmLabel, cancelLabel, pendingLabel, doneLabel, errorLabel, retryLabel, undoLabel, undoingLabel, cancelledLabel, undoneLabel, holdLabel, countdownLabel. Defaults match the source English delete action, with additional localizable status announcements.

State is idle | confirming | pending | done | error. `defaultState='idle'` initializes uncontrolled state. `state` plus `onStateChange(next)` is controlled: acknowledge requests, do not switch control modes while mounted. `onConfirm` and optional `onUndo` accept void or promises; rejection shows error and Retry repeats the failed operation. `onCancel` observes cancellation. Late completions after external reset/unmount are ignored. Pending work cannot submit twice. Native div attributes and bind:ref forward.

Modes: confirmMode='press' | 'hold' | 'countdown' (press); holdDuration=1000ms, countdown=3 seconds. Cancel/Escape/outside (cancelOnOutsidePress=true) dismiss the question. The opening press has a 280ms safety guard. confirmTimeout=6000ms and resultTimeout=5000ms pause while hovered, focused within or hidden; zero disables timeout. disabled affects all action faces. fullWidth centers/fills the row and expands the idle Button with a minimum 44px hit target. Entry focus remains on Confirm; Shift+Tab reaches Cancel. Pending includes the native Valar Spinner, which stops under reduced motion while visible text and live status remain. No modal or source motion runtime.

State changes have independently authored native size/radius/content feedback (120ms envelope, 80ms incoming content, 60ms outgoing visual), not Arc's animation implementation or parameters. Actions and focus update immediately; animation can be interrupted and never gates input. Real controls remain unscaled and unclipped; the outgoing visual is inert/hidden from accessibility, with one live status. Reduced motion switches directly, including when the preference changes mid-transition. Resize and unmount clear animation. Equal natural geometry is not artificially pulsed. This is an intentional Valar visual adaptation, not an equivalence claim; measured source/target evidence is in the TokenPlan porting record.
