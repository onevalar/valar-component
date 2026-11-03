<script lang="ts" generics="V extends TunerValues">
	import { onMount, tick } from "svelte";
	import { z } from "zod";
	import { FRAME_TOKENS, frameTokensSchema } from "./tuner-frame.js";
	import type { TunerCanvasState, TunerValues } from "./tuner.js";

	let {
		component,
		state: canvasState,
		width,
	}: {
		component: "sidebar" | "sonner";
		state: TunerCanvasState<V>;
		width?: number;
	} = $props();

	let frame: HTMLIFrameElement;
	let ready = $state(false);
	let applied = $state(0);
	let revision = 0;
	let last = "";
	const messageType = $derived(`valar-${component}-preview`);
	const response = z.discriminatedUnion("action", [
		z.object({ type: z.string(), action: z.literal("ready") }).strict(),
		z.object({ type: z.string(), action: z.literal("request-close") }).strict(),
		z
			.object({
				type: z.string(),
				action: z.literal("applied"),
				revision: z.number().int().positive(),
			})
			.strict(),
	]);

	onMount(() => {
		function receive(event: MessageEvent) {
			if (event.origin !== location.origin || event.source !== frame.contentWindow) return;
			const parsed = response.safeParse(event.data);
			if (!parsed.success || parsed.data.type !== messageType) return;
			if (parsed.data.action === "ready") {
				last = "";
				ready = true;
				send();
			} else if (parsed.data.action === "applied") {
				if (parsed.data.revision === revision) applied = revision;
			} else if (ready && document.hasFocus()) {
				canvasState.requestClose();
			}
		}
		window.addEventListener("message", receive);
		connect();
		return () => window.removeEventListener("message", receive);
	});

	function connect() {
		// SSR frames may finish loading before their parent hydrates. Initiate the same
		// handshake on mount and on navigation rather than relying on one early ready.
		frame?.contentWindow?.postMessage({ type: messageType, action: "connect" }, location.origin);
	}

	function send() {
		if (!ready || !frame?.contentWindow) return;
		const computed = getComputedStyle(frame);
		const tokens = frameTokensSchema.parse(
			Object.fromEntries(FRAME_TOKENS.map((name) => [name, computed.getPropertyValue(name).trim()]))
		);
		const next = {
			style: canvasState.style,
			dark: canvasState.dark,
			overrides: canvasState.overrides,
			tokens,
		};
		const serialized = JSON.stringify(next);
		if (serialized === last) return;
		last = serialized;
		frame.contentWindow.postMessage(
			// JSON also unwraps Svelte state proxies before the structured-clone boundary.
			{ type: messageType, action: "update", revision: ++revision, ...JSON.parse(serialized) },
			location.origin
		);
	}

	$effect(() => {
		// Read reactive inputs before the tick; inherited dark tokens settle with the figure.
		void canvasState.overrides;
		void canvasState.dark;
		void canvasState.style;
		void ready;
		let active = true;
		tick().then(() => {
			if (active) send();
		});
		return () => {
			active = false;
		};
	});
</script>

<div class="max-w-full overflow-x-auto">
	{#if !ready}<p role="status" class="p-3 text-xs text-muted-foreground">正在载入独立预览…</p>{/if}
	<iframe
		bind:this={frame}
		onload={connect}
		src="/{component}-preview"
		title="{component === 'sidebar' ? 'Sidebar 应用壳' : 'Sonner 通知'}独立预览"
		class="block h-[640px] max-w-none border-0"
		style:width={width ? `${width}px` : "100%"}
		data-preview-frame={component}
		data-preview-applied={applied}
	></iframe>
</div>
