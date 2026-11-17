<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> = $props();
	const classes = $derived(
		cn(
			"flow-root min-w-0 text-[15px]/[22.5px] font-[450] wrap-anywhere",
			"[--valar-prose-body:lch(20%_1_282)] [--valar-prose-heading:lch(10%_0_282)] [--valar-prose-link:lch(50%_80_288.43)] [--valar-prose-code:lch(20%_50_286.91_/_5%)] [--valar-prose-rule:lch(86.5%_0_282)]",
			"dark:[--valar-prose-body:lch(90.826%_1.425_272)] dark:[--valar-prose-heading:lch(100%_0_272)] dark:[--valar-prose-link:lch(80%_80_288.43)] dark:[--valar-prose-code:rgb(255_255_255_/_7.5%)] dark:[--valar-prose-rule:lch(20.032%_1.93_272)]",
			"text-[color:var(--valar-prose-body)] [&_p]:tracking-[-0.1px] [&_p+p]:mt-[22px]",

			"[&_:is(h1,h2,h3,h4)]:font-semibold [&_:is(h1,h2,h3,h4)]:text-[color:var(--valar-prose-heading)]",
			"[&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:text-[22px]/[29.6px] [&_h1]:tracking-[-0.07px]",
			"[&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:text-[19px]/[28px] [&_h2]:tracking-[0.05px]",
			"[&_h3]:mt-6 [&_h3]:mb-1.5 [&_h3]:text-[17px]/[24px] [&_h3]:tracking-[0.1px]",
			"[&_h4]:mt-[22px] [&_h4]:mb-1.5 [&_h4]:text-[15px]/[24px]",

			"[&_blockquote]:relative [&_blockquote]:mt-[22px] [&_blockquote]:ps-4",
			"[&_blockquote]:before:absolute [&_blockquote]:before:inset-y-0 [&_blockquote]:before:start-0 [&_blockquote]:before:w-1 [&_blockquote]:before:rounded-[2px] [&_blockquote]:before:bg-[color:var(--valar-prose-rule)]",
			"[&_:is(ol,ul)]:my-4 [&_:is(ol,ul)]:ps-6 [&_ol]:list-decimal [&_ul]:list-disc [&_li+li]:mt-1.5 [&_blockquote+ul]:mt-[22px]",
			"[&_hr]:my-[22px] [&_hr]:border-t [&_hr]:border-[color:var(--valar-prose-rule)]",
			"[&>_:first-child]:mt-0 [&>_:last-child]:mb-0",

			"[&_a[href]]:text-[color:var(--valar-prose-link)] [&_a[href]]:no-underline [&_a[href]]:underline-offset-2",
			"[&_a[href]:hover]:underline [&_a[href]:focus-visible]:underline [&_a[href]:focus-visible]:outline-none",
			"[&_code:not(pre_code)]:rounded-[0.2em] [&_code:not(pre_code)]:bg-[color:var(--valar-prose-code)] [&_code:not(pre_code)]:px-[0.25em] [&_code:not(pre_code)]:py-[0.5px] [&_code:not(pre_code)]:font-mono [&_code:not(pre_code)]:text-[0.9375em]/[1.3]",
			className,
		),
	);
</script>

<article bind:this={ref} data-slot="typography" class={classes} {...restProps}>
	{@render children?.()}
</article>
