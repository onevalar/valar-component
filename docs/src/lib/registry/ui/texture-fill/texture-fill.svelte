<script lang="ts" module>
	import type { FillTexture } from "./canvas.js";
	import type { HTMLAttributes } from "svelte/elements";
	export type TextureFillProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
		value: number;
		texture: FillTexture;
		intro?: boolean;
	};
</script>

<script lang="ts">
	import { untrack } from "svelte";
	import { cn } from "$lib/utils.js";
	import { createTextureFill } from "./canvas.js";
	let { value, texture, intro = false, class: className, ...rest }: TextureFillProps = $props();
	let wrap: HTMLSpanElement;
	let canvas: HTMLCanvasElement;
	let renderer: ReturnType<typeof createTextureFill> | undefined;
	$effect(() => {
		const initial = untrack(() => ({ value, intro }));
		renderer = createTextureFill(wrap, canvas, texture, initial.value, initial.intro);
		return () => {
			renderer?.destroy();
			renderer = undefined;
		};
	});
	$effect(() => {
		renderer?.update(value);
	});
</script>

<span
	bind:this={wrap}
	{...rest}
	data-slot="texture-fill"
	data-texture={texture}
	aria-hidden="true"
	class={cn("block size-full min-w-0 overflow-clip rounded-md bg-muted text-ring", className)}
>
	<canvas bind:this={canvas} class="block size-full"></canvas>
</span>
