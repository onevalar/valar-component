<script lang="ts">
	import { onMount, type Component } from "svelte";
	import { z } from "zod";
	import {
		SONNER_SPEC,
		sonnerPreviewUpdateSchema,
		type SonnerPreviewUpdate,
	} from "$lib/features/workbench/sonner-tuning.js";
	import { FRAME_TOKENS } from "$lib/features/workbench/tuner-frame.js";

	const previews = import.meta.glob<Component>(
		"/src/lib/features/workbench/sonner-preview.svelte",
		{ eager: true, import: "default", query: "?flattened=nova" }
	);
	const SonnerPreview = previews["/src/lib/features/workbench/sonner-preview.svelte"]!;
	const connectSchema = z
		.object({ type: z.literal("valar-sonner-preview"), action: z.literal("connect") })
		.strict();
	let state = $state<SonnerPreviewUpdate>();

	function applied(revision: number) {
		if (state?.revision !== revision) return;
		window.parent.postMessage(
			{ type: "valar-sonner-preview", action: "applied", revision },
			location.origin
		);
	}
	onMount(() => {
		const ready = () =>
			window.parent.postMessage({ type: "valar-sonner-preview", action: "ready" }, location.origin);
		function receive(event: MessageEvent) {
			if (event.source !== window.parent || event.origin !== location.origin) return;
			if (connectSchema.safeParse(event.data).success) {
				ready();
				return;
			}
			const parsed = sonnerPreviewUpdateSchema.safeParse(event.data);
			if (!parsed.success || (state && parsed.data.revision <= state.revision)) return;
			state = parsed.data;
		}
		function escape(event: KeyboardEvent) {
			if (!state || event.key !== "Escape" || event.defaultPrevented) return;
			// Sonner collapses its focused notification list without preventing default.
			// Leave that Escape to upstream; only the surrounding preview requests shell close.
			if (
				(event.target instanceof Element && event.target.closest("[data-sonner-toaster]")) ||
				document.activeElement?.closest("[data-sonner-toaster]")
			) {
				return;
			}
			event.preventDefault();
			window.parent.postMessage(
				{ type: "valar-sonner-preview", action: "request-close" },
				location.origin
			);
		}
		window.addEventListener("message", receive);
		window.addEventListener("keydown", escape);
		ready();
		return () => {
			window.removeEventListener("message", receive);
			window.removeEventListener("keydown", escape);
		};
	});

	$effect(() => {
		if (!state) return;
		const root = document.documentElement;
		root.classList.toggle("dark", state.dark);
		for (const name of FRAME_TOKENS) {
			const value = state.tokens[name];
			if (value === undefined) root.style.removeProperty(name);
			else root.style.setProperty(name, value);
		}
		const stylesheet = document.createElement("style");
		stylesheet.textContent = SONNER_SPEC.previewCss(":root", state.overrides, null);
		document.head.append(stylesheet);
		return () => stylesheet.remove();
	});
</script>

<svelte:head>
	<title>Sonner 独立通知预览</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div
	class="min-h-svh bg-background text-foreground"
	data-preview-ready={state ? "true" : undefined}
	data-preview-revision={state?.revision}
>
	{#if state}
		<SonnerPreview {state} onApplied={applied} />
	{:else}
		<p role="status" class="p-6 text-sm text-muted-foreground">正在等待编辑器预览配置…</p>
	{/if}
</div>
