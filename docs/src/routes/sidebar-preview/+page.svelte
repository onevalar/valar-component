<script lang="ts">
	import { onMount, tick, type Component } from "svelte";
	import { z } from "zod";
	import {
		SIDEBAR_SPEC,
		sidebarPreviewUpdateSchema,
		type SidebarPreviewUpdate,
	} from "$lib/features/workbench/sidebar-tuning.js";
	import { FRAME_TOKENS } from "$lib/features/workbench/tuner-frame.js";

	// Explicit Nova module, including all nested UI/context helpers. The glob's typed query
	// avoids pretending that TypeScript resolves Vite's virtual .svelte?flattened module name.
	const previews = import.meta.glob<Component>(
		"/src/lib/features/workbench/sidebar-preview.svelte",
		{ eager: true, import: "default", query: "?flattened=nova" }
	);
	const SidebarPreview = previews["/src/lib/features/workbench/sidebar-preview.svelte"]!;
	let state = $state<SidebarPreviewUpdate>();
	const connectSchema = z
		.object({ type: z.literal("valar-sidebar-preview"), action: z.literal("connect") })
		.strict();

	onMount(() => {
		function ready() {
			window.parent.postMessage(
				{ type: "valar-sidebar-preview", action: "ready" },
				location.origin
			);
		}
		async function receive(event: MessageEvent) {
			if (event.source !== window.parent || event.origin !== location.origin) return;
			// The parent's onload connect also recovers a ready emitted before its listener mounted.
			if (connectSchema.safeParse(event.data).success) {
				ready();
				return;
			}
			const parsed = sidebarPreviewUpdateSchema.safeParse(event.data);
			if (!parsed.success || (state && parsed.data.revision <= state.revision)) return;
			state = parsed.data;
			await tick();
			if (state?.revision === parsed.data.revision) {
				window.parent.postMessage(
					{ type: "valar-sidebar-preview", action: "applied", revision: state.revision },
					location.origin
				);
			}
		}
		function escape(event: KeyboardEvent) {
			// Bits consumes overlay Escape at document level before this window bubble listener.
			if (!state || event.key !== "Escape" || event.defaultPrevented) return;
			event.preventDefault();
			window.parent.postMessage(
				{ type: "valar-sidebar-preview", action: "request-close" },
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
		stylesheet.textContent = SIDEBAR_SPEC.previewCss(":root", state.overrides, null);
		document.head.append(stylesheet);
		return () => stylesheet.remove();
	});
</script>

<svelte:head>
	<title>Sidebar 应用壳预览</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div
	class="min-h-svh bg-background text-foreground"
	data-preview-ready={state ? "true" : undefined}
	data-preview-revision={state?.revision}
>
	{#if state}
		<SidebarPreview />
	{:else}
		<p role="status" class="p-6 text-sm text-muted-foreground">正在等待编辑器预览配置…</p>
	{/if}
</div>
