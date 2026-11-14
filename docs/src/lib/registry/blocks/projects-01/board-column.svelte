<script lang="ts">
	import { useDroppable } from "@dnd-kit-svelte/svelte";
	import type { Status } from "./data.js";
	import type { Snippet } from "svelte";

	let { status, label, children }: { status: Status; label: string; children: Snippet } = $props();
	const { ref, isDropTarget } = useDroppable({ id: () => status });
</script>

<section
	{@attach ref}
	aria-label={label}
	data-project-column={status}
	data-drop-target={isDropTarget.current ? "" : undefined}
	class="w-[min(345px,85vw)] shrink-0 rounded-lg bg-accent/35 px-2 pb-2 data-drop-target:bg-(--project-accent)/10 data-drop-target:ring-1 data-drop-target:ring-(--project-accent)/50 data-drop-target:ring-inset"
>
	{@render children()}
</section>
