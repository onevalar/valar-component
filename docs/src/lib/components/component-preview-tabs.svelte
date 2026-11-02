<script lang="ts">
	import AccordionTuner from "$lib/features/workbench/accordion-tuner.svelte";
	import AlertDialogTuner from "$lib/features/workbench/alert-dialog-tuner.svelte";
	import AlertTuner from "$lib/features/workbench/alert-tuner.svelte";
	import AvatarTuner from "$lib/features/workbench/avatar-tuner.svelte";
	import BadgeTuner from "$lib/features/workbench/badge-tuner.svelte";
	import ButtonTuner from "$lib/features/workbench/button-tuner.svelte";
	import CardTuner from "$lib/features/workbench/card-tuner.svelte";
	import CheckboxTuner from "$lib/features/workbench/checkbox-tuner.svelte";
	import ContextMenuTuner from "$lib/features/workbench/context-menu-tuner.svelte";
	import DialogTuner from "$lib/features/workbench/dialog-tuner.svelte";
	import DrawerTuner from "$lib/features/workbench/drawer-tuner.svelte";
	import DropdownMenuTuner from "$lib/features/workbench/dropdown-menu-tuner.svelte";
	import EmptyTuner from "$lib/features/workbench/empty-tuner.svelte";
	import HoverCardTuner from "$lib/features/workbench/hover-card-tuner.svelte";
	import InputGroupTuner from "$lib/features/workbench/input-group-tuner.svelte";
	import InputOtpTuner from "$lib/features/workbench/input-otp-tuner.svelte";
	import InputTuner from "$lib/features/workbench/input-tuner.svelte";
	import ItemTuner from "$lib/features/workbench/item-tuner.svelte";
	import NativeSelectTuner from "$lib/features/workbench/native-select-tuner.svelte";
	import PopoverTuner from "$lib/features/workbench/popover-tuner.svelte";
	import RadioGroupTuner from "$lib/features/workbench/radio-group-tuner.svelte";
	import SelectTuner from "$lib/features/workbench/select-tuner.svelte";
	import SheetTuner from "$lib/features/workbench/sheet-tuner.svelte";
	import SliderTuner from "$lib/features/workbench/slider-tuner.svelte";
	import SwitchTuner from "$lib/features/workbench/switch-tuner.svelte";
	import TableTuner from "$lib/features/workbench/table-tuner.svelte";
	import TabsTuner from "$lib/features/workbench/tabs-tuner.svelte";
	import TextareaTuner from "$lib/features/workbench/textarea-tuner.svelte";
	import ToggleGroupTuner from "$lib/features/workbench/toggle-group-tuner.svelte";
	import ToggleTuner from "$lib/features/workbench/toggle-tuner.svelte";
	import TooltipTuner from "$lib/features/workbench/tooltip-tuner.svelte";
	import { t } from "$lib/i18n/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { cn } from "$lib/utils.js";
	import type { PresetConfig } from "@valar/svelte-cli/preset";
	import type { Component, Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		class: className,
		previewClassName,
		align = "center",
		component,
		example,
		children,
		name,
		hideCode = false,
		tunable = true,
		chromeLessOnMobile = false,
		previewStyle,
		...restProps
	}: HTMLAttributes<HTMLElement> & {
		previewClassName?: string;
		align?: "center" | "start" | "end";
		hideCode?: boolean;
		tunable?: boolean;
		chromeLessOnMobile?: boolean;
		previewStyle?: PresetConfig["style"];
		example?: Snippet;
		component?: Component;
		name: string;
	} = $props();

	let codeVisible = $state(false);
</script>

{#snippet ExampleFallback()}
	{#if component}
		{@const Component = component}
		<Component />
	{:else}
		<p class="text-sm text-muted-foreground">
			{t("docs.componentNotFound", { name })}
		</p>
	{/if}
{/snippet}

{#snippet PreviewExample()}
	{#if example}
		{@render example()}
	{:else}
		{@render ExampleFallback()}
	{/if}
{/snippet}

<div
	data-slot="component-preview"
	class={cn(
		"group relative mt-4 mb-12 flex flex-col overflow-hidden rounded-2xl border",
		className
	)}
	{...restProps}
>
	<div data-slot="preview" data-llm-ignore>
		<div
			data-align={align}
			data-chromeless={chromeLessOnMobile}
			class={cn(
				"preview relative flex min-h-72 w-full min-w-0 justify-center overflow-x-auto p-4 data-[align=center]:items-center data-[align=end]:items-start data-[align=start]:items-start data-[chromeless=true]:h-auto data-[chromeless=true]:p-0 sm:p-10 sm:data-[align=end]:items-end",
				previewStyle && `style-${previewStyle}`,
				previewClassName,
				tunable &&
					[
						"accordion-demo",
						"alert-dialog-demo",
						"alert-demo",
						"avatar-demo",
						"item-demo",
						"empty-demo",
						"badge-demo",
						"table-demo",
						"button-demo",
						"card-demo",
						"checkbox-demo",
						"radio-group-demo",
						"switch-demo",
						"toggle-demo",
						"toggle-group-demo",
						"slider-demo",
						"tabs-demo",
						"dialog-demo",
						"drawer-demo",
						"hover-card-demo",
						"context-menu-demo",
						"popover-demo",
						"sheet-demo",
						"input-demo",
						"input-group-demo",
						"input-otp-demo",
						"native-select-demo",
						"select-demo",
						"textarea-demo",
						"dropdown-menu-demo",
						"tooltip-demo",
					].includes(name) &&
					"p-0 sm:p-0"
			)}
		>
			{#if !tunable}
				{@render PreviewExample()}
			{:else if name === "accordion-demo"}
				<AccordionTuner>{@render PreviewExample()}</AccordionTuner>
			{:else if name === "alert-dialog-demo"}
				<AlertDialogTuner>{@render PreviewExample()}</AlertDialogTuner>
			{:else if name === "alert-demo"}
				<AlertTuner>{@render PreviewExample()}</AlertTuner>
			{:else if name === "avatar-demo"}
				<AvatarTuner>{@render PreviewExample()}</AvatarTuner>
			{:else if name === "item-demo"}
				<ItemTuner>{@render PreviewExample()}</ItemTuner>
			{:else if name === "empty-demo"}
				<EmptyTuner>{@render PreviewExample()}</EmptyTuner>
			{:else if name === "badge-demo"}
				<BadgeTuner>{@render PreviewExample()}</BadgeTuner>
			{:else if name === "table-demo"}
				<TableTuner>{@render PreviewExample()}</TableTuner>
			{:else if name === "button-demo"}
				<ButtonTuner>{@render PreviewExample()}</ButtonTuner>
			{:else if name === "card-demo"}
				<CardTuner>{@render PreviewExample()}</CardTuner>
			{:else if name === "checkbox-demo"}
				<CheckboxTuner>{@render PreviewExample()}</CheckboxTuner>
			{:else if name === "radio-group-demo"}
				<RadioGroupTuner>{@render PreviewExample()}</RadioGroupTuner>
			{:else if name === "switch-demo"}
				<SwitchTuner>{@render PreviewExample()}</SwitchTuner>
			{:else if name === "toggle-demo"}
				<ToggleTuner>{@render PreviewExample()}</ToggleTuner>
			{:else if name === "toggle-group-demo"}
				<ToggleGroupTuner>{@render PreviewExample()}</ToggleGroupTuner>
			{:else if name === "slider-demo"}
				<SliderTuner>{@render PreviewExample()}</SliderTuner>
			{:else if name === "tabs-demo"}
				<TabsTuner>{@render PreviewExample()}</TabsTuner>
			{:else if name === "dialog-demo"}
				<DialogTuner>{@render PreviewExample()}</DialogTuner>
			{:else if name === "drawer-demo"}
				<DrawerTuner>{@render PreviewExample()}</DrawerTuner>
			{:else if name === "hover-card-demo"}
				<HoverCardTuner>{@render PreviewExample()}</HoverCardTuner>
			{:else if name === "context-menu-demo"}
				<ContextMenuTuner>{@render PreviewExample()}</ContextMenuTuner>
			{:else if name === "popover-demo"}
				<PopoverTuner>{@render PreviewExample()}</PopoverTuner>
			{:else if name === "sheet-demo"}
				<SheetTuner>{@render PreviewExample()}</SheetTuner>
			{:else if name === "input-demo"}
				<InputTuner>{@render PreviewExample()}</InputTuner>
			{:else if name === "input-group-demo"}
				<InputGroupTuner>{@render PreviewExample()}</InputGroupTuner>
			{:else if name === "input-otp-demo"}
				<InputOtpTuner>{@render PreviewExample()}</InputOtpTuner>
			{:else if name === "native-select-demo"}
				<NativeSelectTuner>{@render PreviewExample()}</NativeSelectTuner>
			{:else if name === "select-demo"}
				<SelectTuner>{@render PreviewExample()}</SelectTuner>
			{:else if name === "textarea-demo"}
				<TextareaTuner>{@render PreviewExample()}</TextareaTuner>
			{:else if name === "dropdown-menu-demo"}
				<DropdownMenuTuner>{@render PreviewExample()}</DropdownMenuTuner>
			{:else if name === "tooltip-demo"}
				<TooltipTuner>{@render PreviewExample()}</TooltipTuner>
			{:else}
				{@render PreviewExample()}
			{/if}
		</div>
	</div>
	{#if !hideCode}
		<div
			data-slot="code"
			data-code-visible={codeVisible}
			class="relative overflow-hidden **:data-rehype-pretty-code-figure:m-0! **:data-rehype-pretty-code-figure:rounded-t-none **:data-rehype-pretty-code-figure:border-t data-[code-visible=false]:**:data-rehype-pretty-code-figure:max-h-28 data-[code-visible=false]:**:data-rehype-pretty-code-figure:overflow-hidden **:data-[slot=copy-button]:right-4 **:data-[slot=copy-button]:hidden data-[code-visible=true]:**:data-[slot=copy-button]:flex data-[code-visible=true]:[&_pre]:max-h-72"
		>
			{@render children?.()}
			{#if !codeVisible}
				<div class="absolute inset-0 flex items-center justify-center pb-4">
					<div
						class="absolute inset-0"
						style="background: linear-gradient(to top, var(--color-code), color-mix(in oklab, var(--color-code) 60%, transparent), transparent)"
					></div>
					<Button
						type="button"
						size="sm"
						variant="outline"
						class="relative z-10 rounded-lg bg-background text-foreground shadow-none hover:bg-muted dark:bg-background dark:text-foreground dark:hover:bg-muted"
						onclick={() => {
							codeVisible = true;
						}}
					>
						{t("docs.viewCode")}
					</Button>
				</div>
			{/if}
		</div>
	{/if}
</div>
