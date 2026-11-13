<script lang="ts">
	import AccordionTuner from "$lib/features/workbench/accordion-tuner.svelte";
	import AlertDialogTuner from "$lib/features/workbench/alert-dialog-tuner.svelte";
	import AlertTuner from "$lib/features/workbench/alert-tuner.svelte";
	import AspectRatioTuner from "$lib/features/workbench/aspect-ratio-tuner.svelte";
	import AttachmentTuner from "$lib/features/workbench/attachment-tuner.svelte";
	import AvatarTuner from "$lib/features/workbench/avatar-tuner.svelte";
	import BadgeTuner from "$lib/features/workbench/badge-tuner.svelte";
	import BreadcrumbTuner from "$lib/features/workbench/breadcrumb-tuner.svelte";
	import BubbleTuner from "$lib/features/workbench/bubble-tuner.svelte";
	import ButtonGroupTuner from "$lib/features/workbench/button-group-tuner.svelte";
	import ButtonTuner from "$lib/features/workbench/button-tuner.svelte";
	import CalendarTuner from "$lib/features/workbench/calendar-tuner.svelte";
	import CardTuner from "$lib/features/workbench/card-tuner.svelte";
	import CarouselTuner from "$lib/features/workbench/carousel-tuner.svelte";
	import ChartTuner from "$lib/features/workbench/chart-tuner.svelte";
	import CheckboxTuner from "$lib/features/workbench/checkbox-tuner.svelte";
	import CodeBlockTuner from "$lib/features/workbench/code-block-tuner.svelte";
	import CollapsibleTuner from "$lib/features/workbench/collapsible-tuner.svelte";
	import ColorPickerTuner from "$lib/features/workbench/color-picker-tuner.svelte";
	import CommandTuner from "$lib/features/workbench/command-tuner.svelte";
	import ContextMenuTuner from "$lib/features/workbench/context-menu-tuner.svelte";
	import DialogTuner from "$lib/features/workbench/dialog-tuner.svelte";
	import DrawerTuner from "$lib/features/workbench/drawer-tuner.svelte";
	import DropdownMenuTuner from "$lib/features/workbench/dropdown-menu-tuner.svelte";
	import EmptyTuner from "$lib/features/workbench/empty-tuner.svelte";
	import FieldTuner from "$lib/features/workbench/field-tuner.svelte";
	import FormTuner from "$lib/features/workbench/form-tuner.svelte";
	import HoverCardTuner from "$lib/features/workbench/hover-card-tuner.svelte";
	import InputGroupTuner from "$lib/features/workbench/input-group-tuner.svelte";
	import InputOtpTuner from "$lib/features/workbench/input-otp-tuner.svelte";
	import InputTuner from "$lib/features/workbench/input-tuner.svelte";
	import ItemTuner from "$lib/features/workbench/item-tuner.svelte";
	import KbdTuner from "$lib/features/workbench/kbd-tuner.svelte";
	import LabelTuner from "$lib/features/workbench/label-tuner.svelte";
	import MarkerTuner from "$lib/features/workbench/marker-tuner.svelte";
	import MenubarTuner from "$lib/features/workbench/menubar-tuner.svelte";
	import MessageScrollerTuner from "$lib/features/workbench/message-scroller-tuner.svelte";
	import MessageTuner from "$lib/features/workbench/message-tuner.svelte";
	import NativeSelectTuner from "$lib/features/workbench/native-select-tuner.svelte";
	import NavigationMenuTuner from "$lib/features/workbench/navigation-menu-tuner.svelte";
	import NumberFieldTuner from "$lib/features/workbench/number-field-tuner.svelte";
	import PaginationTuner from "$lib/features/workbench/pagination-tuner.svelte";
	import PopoverTuner from "$lib/features/workbench/popover-tuner.svelte";
	import ProgressTuner from "$lib/features/workbench/progress-tuner.svelte";
	import QuestionnaireTuner from "$lib/features/workbench/questionnaire-tuner.svelte";
	import RadioGroupTuner from "$lib/features/workbench/radio-group-tuner.svelte";
	import RangeCalendarTuner from "$lib/features/workbench/range-calendar-tuner.svelte";
	import ResizableTuner from "$lib/features/workbench/resizable-tuner.svelte";
	import ScrollAreaTuner from "$lib/features/workbench/scroll-area-tuner.svelte";
	import SelectTuner from "$lib/features/workbench/select-tuner.svelte";
	import SeparatorTuner from "$lib/features/workbench/separator-tuner.svelte";
	import SheetTuner from "$lib/features/workbench/sheet-tuner.svelte";
	import SkeletonTuner from "$lib/features/workbench/skeleton-tuner.svelte";
	import SliderFieldTuner from "$lib/features/workbench/slider-field-tuner.svelte";
	import SliderTuner from "$lib/features/workbench/slider-tuner.svelte";
	import SonnerTuner from "$lib/features/workbench/sonner-tuner.svelte";
	import SpinnerTuner from "$lib/features/workbench/spinner-tuner.svelte";
	import StepperTuner from "$lib/features/workbench/stepper-tuner.svelte";
	import SwitchTuner from "$lib/features/workbench/switch-tuner.svelte";
	import TableTuner from "$lib/features/workbench/table-tuner.svelte";
	import TabsTuner from "$lib/features/workbench/tabs-tuner.svelte";
	import TagsInputTuner from "$lib/features/workbench/tags-input-tuner.svelte";
	import TextareaTuner from "$lib/features/workbench/textarea-tuner.svelte";
	import ToggleGroupTuner from "$lib/features/workbench/toggle-group-tuner.svelte";
	import ToggleTuner from "$lib/features/workbench/toggle-tuner.svelte";
	import TooltipTuner from "$lib/features/workbench/tooltip-tuner.svelte";
	import TraceTuner from "$lib/features/workbench/trace-tuner.svelte";
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
		bare = false,
		chromeLessOnMobile = false,
		previewStyle,
		...restProps
	}: HTMLAttributes<HTMLElement> & {
		previewClassName?: string;
		align?: "center" | "start" | "end";
		hideCode?: boolean;
		tunable?: boolean;
		/** Only the example (and its tuner): no outer border, no code, compact sizing. */
		bare?: boolean;
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

{#snippet Framed()}
	{#if bare}
		<div
			class={cn(
				"flex max-h-[28rem] min-h-32 w-full items-center justify-center overflow-auto rounded-xl border p-6",
				name === "calendar-custom-days" && "max-h-none px-2 py-4"
			)}
		>
			{@render PreviewExample()}
		</div>
	{:else}
		{@render PreviewExample()}
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
		bare
			? "relative flex flex-col"
			: "group relative mt-4 mb-12 flex flex-col overflow-hidden rounded-2xl border",
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
				bare && "min-h-0 overflow-visible p-0 sm:p-0",
				tunable &&
					[
						"accordion-demo",
						"aspect-ratio-demo",
						"collapsible-demo",
						"field-demo",
						"form-demo",
						"label-demo",
						"marker-demo",
						"message-scroller-demo",
						"resizable-demo",
						"scroll-area-demo",
						"separator-demo",
						"alert-dialog-demo",
						"alert-demo",
						"avatar-demo",
						"attachment-demo",
						"bubble-demo",
						"calendar-demo",
						"carousel-demo",
						"chart-bar-interactive",
						"questionnaire-demo",
						"sonner-demo",
						"code-block-demo",
						"color-picker-demo",
						"command-demo",
						"message-demo",
						"range-calendar-demo",
						"stepper-demo",
						"trace-demo",
						"item-demo",
						"number-field-demo",
						"empty-demo",
						"tags-input-demo",
						"button-group-demo",
						"breadcrumb-demo",
						"pagination-demo",
						"progress-demo",
						"skeleton-demo",
						"spinner-demo",
						"kbd-demo",
						"menubar-demo",
						"navigation-menu-demo",
						"badge-demo",
						"table-demo",
						"button-demo",
						"card-demo",
						"checkbox-demo",
						"radio-group-demo",
						"switch-demo",
						"toggle-demo",
						"toggle-group-demo",
						"slider-field-demo",
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
				{@render Framed()}
			{:else if name === "accordion-demo"}
				<AccordionTuner>{@render PreviewExample()}</AccordionTuner>
			{:else if name === "aspect-ratio-demo"}
				<AspectRatioTuner>{@render PreviewExample()}</AspectRatioTuner>
			{:else if name === "collapsible-demo"}
				<CollapsibleTuner>{@render PreviewExample()}</CollapsibleTuner>
			{:else if name === "field-demo"}
				<FieldTuner>{@render PreviewExample()}</FieldTuner>
			{:else if name === "form-demo"}
				<FormTuner>{@render PreviewExample()}</FormTuner>
			{:else if name === "label-demo"}
				<LabelTuner>{@render PreviewExample()}</LabelTuner>
			{:else if name === "marker-demo"}
				<MarkerTuner>{@render PreviewExample()}</MarkerTuner>
			{:else if name === "message-scroller-demo"}
				<MessageScrollerTuner>{@render PreviewExample()}</MessageScrollerTuner>
			{:else if name === "resizable-demo"}
				<ResizableTuner>{@render PreviewExample()}</ResizableTuner>
			{:else if name === "scroll-area-demo"}
				<ScrollAreaTuner>{@render PreviewExample()}</ScrollAreaTuner>
			{:else if name === "separator-demo"}
				<SeparatorTuner>{@render PreviewExample()}</SeparatorTuner>
			{:else if name === "alert-dialog-demo"}
				<AlertDialogTuner>{@render PreviewExample()}</AlertDialogTuner>
			{:else if name === "alert-demo"}
				<AlertTuner>{@render PreviewExample()}</AlertTuner>
			{:else if name === "avatar-demo"}
				<AvatarTuner>{@render PreviewExample()}</AvatarTuner>
			{:else if name === "attachment-demo"}
				<AttachmentTuner>{@render PreviewExample()}</AttachmentTuner>
			{:else if name === "bubble-demo"}
				<BubbleTuner>{@render PreviewExample()}</BubbleTuner>
			{:else if name === "calendar-demo"}
				<CalendarTuner>{@render PreviewExample()}</CalendarTuner>
			{:else if name === "carousel-demo"}
				<CarouselTuner>{@render PreviewExample()}</CarouselTuner>
			{:else if name === "chart-bar-interactive"}
				<ChartTuner>{@render PreviewExample()}</ChartTuner>
			{:else if name === "questionnaire-demo"}
				<QuestionnaireTuner>{@render PreviewExample()}</QuestionnaireTuner>
			{:else if name === "sonner-demo"}
				<SonnerTuner>{@render PreviewExample()}</SonnerTuner>
			{:else if name === "code-block-demo"}
				<CodeBlockTuner>{@render PreviewExample()}</CodeBlockTuner>
			{:else if name === "color-picker-demo"}
				<ColorPickerTuner>{@render PreviewExample()}</ColorPickerTuner>
			{:else if name === "command-demo"}
				<CommandTuner>{@render PreviewExample()}</CommandTuner>
			{:else if name === "message-demo"}
				<MessageTuner>{@render PreviewExample()}</MessageTuner>
			{:else if name === "range-calendar-demo"}
				<RangeCalendarTuner>{@render PreviewExample()}</RangeCalendarTuner>
			{:else if name === "stepper-demo"}
				<StepperTuner>{@render PreviewExample()}</StepperTuner>
			{:else if name === "trace-demo"}
				<TraceTuner>{@render PreviewExample()}</TraceTuner>
			{:else if name === "item-demo"}
				<ItemTuner>{@render PreviewExample()}</ItemTuner>
			{:else if name === "number-field-demo"}
				<NumberFieldTuner>{@render PreviewExample()}</NumberFieldTuner>
			{:else if name === "slider-field-demo"}
				<SliderFieldTuner>{@render PreviewExample()}</SliderFieldTuner>
			{:else if name === "tags-input-demo"}
				<TagsInputTuner>{@render PreviewExample()}</TagsInputTuner>
			{:else if name === "button-group-demo"}
				<ButtonGroupTuner>{@render PreviewExample()}</ButtonGroupTuner>
			{:else if name === "breadcrumb-demo"}
				<BreadcrumbTuner>{@render PreviewExample()}</BreadcrumbTuner>
			{:else if name === "pagination-demo"}
				<PaginationTuner>{@render PreviewExample()}</PaginationTuner>
			{:else if name === "progress-demo"}
				<ProgressTuner>{@render PreviewExample()}</ProgressTuner>
			{:else if name === "skeleton-demo"}
				<SkeletonTuner>{@render PreviewExample()}</SkeletonTuner>
			{:else if name === "spinner-demo"}
				<SpinnerTuner>{@render PreviewExample()}</SpinnerTuner>
			{:else if name === "kbd-demo"}
				<KbdTuner>{@render PreviewExample()}</KbdTuner>
			{:else if name === "menubar-demo"}
				<MenubarTuner>{@render PreviewExample()}</MenubarTuner>
			{:else if name === "navigation-menu-demo"}
				<NavigationMenuTuner>{@render PreviewExample()}</NavigationMenuTuner>
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
				{@render Framed()}
			{/if}
		</div>
	</div>
	{#if !hideCode && !bare}
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
