<script lang="ts">
	import SearchIcon from "@lucide/svelte/icons/search";
	import TriangleAlertIcon from "@lucide/svelte/icons/triangle-alert";
	import XIcon from "@lucide/svelte/icons/x";
	import * as Accordion from "$lib/registry/ui/accordion/index.js";
	import * as Alert from "$lib/registry/ui/alert/index.js";
	import * as AlertDialog from "$lib/registry/ui/alert-dialog/index.js";
	import * as Avatar from "$lib/registry/ui/avatar/index.js";
	import * as Breadcrumb from "$lib/registry/ui/breadcrumb/index.js";
	import * as Bubble from "$lib/registry/ui/bubble/index.js";
	import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
	import * as Card from "$lib/registry/ui/card/index.js";
	import * as Dialog from "$lib/registry/ui/dialog/index.js";
	import * as Empty from "$lib/registry/ui/empty/index.js";
	import * as Field from "$lib/registry/ui/field/index.js";
	import * as InputGroup from "$lib/registry/ui/input-group/index.js";
	import * as InputOTP from "$lib/registry/ui/input-otp/index.js";
	import * as Item from "$lib/registry/ui/item/index.js";
	import * as Kbd from "$lib/registry/ui/kbd/index.js";
	import * as Message from "$lib/registry/ui/message/index.js";
	import * as PageLayout from "$lib/registry/ui/page-layout/index.js";
	import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
	import * as Select from "$lib/registry/ui/select/index.js";
	import * as Sheet from "$lib/registry/ui/sheet/index.js";
	import * as Table from "$lib/registry/ui/table/index.js";
	import * as Tabs from "$lib/registry/ui/tabs/index.js";
	import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
	import type { UiNode } from "$lib/agent/ui-catalog.js";
	import { Badge } from "$lib/registry/ui/badge/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
	import { Combobox } from "$lib/registry/ui/combobox/index.js";
	import { DatePicker } from "$lib/registry/ui/date-picker/index.js";
	import { Gauge } from "$lib/registry/ui/gauge/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import { NumberField } from "$lib/registry/ui/number-field/index.js";
	import { Progress } from "$lib/registry/ui/progress/index.js";
	import { Separator } from "$lib/registry/ui/separator/index.js";
	import { Skeleton } from "$lib/registry/ui/skeleton/index.js";
	import { SliderField } from "$lib/registry/ui/slider-field/index.js";
	import { StaticSparkline } from "$lib/registry/ui/sparkline/index.js";
	import { Spinner } from "$lib/registry/ui/spinner/index.js";
	import { Stepper } from "$lib/registry/ui/stepper/index.js";
	import { Switch } from "$lib/registry/ui/switch/index.js";
	import { TagsInput } from "$lib/registry/ui/tags-input/index.js";
	import { Textarea } from "$lib/registry/ui/textarea/index.js";

	/**
	 * Draws a validated UI tree (see `ui-catalog.ts`) with the library's own components.
	 * Layout nodes (Stack, Grid, SplitLayout, Heading, Text) are the only things drawn here directly,
	 * and they only use spacing and type steps from the design tokens. Every node sits in its own
	 * error boundary, so one bad node shows a notice instead of blanking the whole answer.
	 */
	let { root }: { root: UiNode } = $props();

	const uid = $props.id();
	let comboValues = $state<Record<string, string[]>>({});
	let otpValues = $state<Record<string, string>>({});
	let searchValues = $state<Record<string, string>>({});
	let filterValues = $state<Record<string, string>>({});

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type Props = Record<string, any>;
	const P = (n: UiNode): Props => n.props ?? {};
	const list = (n: UiNode): UiNode[] => (Array.isArray(n.children) ? n.children : []);
	const str = (n: UiNode): string => (typeof n.children === "string" ? n.children : "");
	const idOf = (path: string) => `${uid}-${path.replaceAll(".", "-")}`;

	const GAP = { sm: "gap-2", md: "gap-4", lg: "gap-6" } as const;
	const COLUMNS = {
		1: "grid-cols-1",
		2: "grid-cols-1 @sm:grid-cols-2",
		3: "grid-cols-1 @sm:grid-cols-2 @2xl:grid-cols-3",
		4: "grid-cols-1 @sm:grid-cols-2 @2xl:grid-cols-4",
	} as const;
	const SPLIT_RATIO = {
		"1:2": "@2xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]",
		"2:1": "@2xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]",
		"1:1": "@2xl:grid-cols-2",
	} as const;
	const ALIGN = { start: "items-start", center: "items-center", end: "items-end" } as const;
	const JUSTIFY = { start: "justify-start", between: "justify-between", end: "justify-end" } as const;
	const TOP_LABELED_FIELDS = new Set([
		"InputField",
		"TextareaField",
		"SelectField",
		"RadioGroupField",
		"SliderField",
		"InputOtpField",
		"NumberField",
		"TagsInputField",
		"DatePickerField",
		"ComboboxField",
	]);
	const hasTopLabeledField = (items: UiNode[]) =>
		items.some((item) => TOP_LABELED_FIELDS.has(item.type));

	function splitHighlight(content: string, query?: string): { text: string; hit: boolean }[] {
		const term = query?.trim();
		if (!term) return [{ text: content, hit: false }];
		const lowerContent = content.toLowerCase();
		const lowerTerm = term.toLowerCase();
		const parts: { text: string; hit: boolean }[] = [];
		let cursor = 0;
		let matchAt = lowerContent.indexOf(lowerTerm, cursor);
		while (matchAt !== -1) {
			if (matchAt > cursor) {
				parts.push({ text: content.slice(cursor, matchAt), hit: false });
			}
			parts.push({ text: content.slice(matchAt, matchAt + term.length), hit: true });
			cursor = matchAt + term.length;
			matchAt = lowerContent.indexOf(lowerTerm, cursor);
		}
		if (cursor < content.length) {
			parts.push({ text: content.slice(cursor), hit: false });
		}
		return parts.length ? parts : [{ text: content, hit: false }];
	}
</script>

{#snippet nodes(items: UiNode[], path: string)}
	{#each items as child, i (i)}
		{@render node(child, `${path}-${i}`)}
	{/each}
{/snippet}

{#snippet notes(p: Props)}
	{#if p.description}<Field.Description>{p.description}</Field.Description>{/if}
	{#if p.error}<Field.Error>{p.error}</Field.Error>{/if}
{/snippet}

{#snippet caption(p: Props, id: string)}
	<Field.Content>
		<Field.Label for={id}>{p.label}</Field.Label>
		{@render notes(p)}
	</Field.Content>
{/snippet}

{#snippet propertyRow(n: UiNode, path: string, inheritedLayout?: "settings" | "detail")}
	{@const p = P(n)}
	{@const children = list(n)}
	{@const rowLayout =
		p.layout === "detail" || p.layout === "settings"
			? p.layout
			: inheritedLayout ??
				(p.value !== undefined && !children.length && typeof p.checked !== "boolean"
					? "detail"
					: "settings")}
	<PageLayout.PropertyRow label={p.label} description={p.description} layout={rowLayout}>
		{#if children.length}
			{@render nodes(children, path)}
		{:else if typeof p.checked === "boolean"}
			<Switch aria-label={p.label} checked={p.checked} disabled={p.disabled} />
		{:else if p.value !== undefined}
			{p.value}
		{/if}
	</PageLayout.PropertyRow>
{/snippet}

{#snippet chatMessage(n: UiNode, inheritedHighlight?: string)}
	{@const p = P(n)}
	{@const isSelf = p.role === "self"}
	{@const align = isSelf ? "end" : "start"}
	{@const fallback = String(p.avatar ?? p.sender ?? "?").slice(0, 2)}
	{@const parts = splitHighlight(String(p.content ?? ""), p.highlight ?? inheritedHighlight)}
	<div
		class={p.active
			? "rounded-lg bg-accent/55 p-2.5 ring-1 ring-inset ring-primary/35"
			: undefined}
		data-active-message={p.active ? "true" : undefined}
	>
		<Message.Root {align}>
			<Message.Avatar class="self-start">
				<Avatar.Root>
					<Avatar.Fallback>{fallback}</Avatar.Fallback>
				</Avatar.Root>
			</Message.Avatar>
			<Message.Content class="gap-1">
				<Message.Header class="gap-2">
					<span>{p.sender}</span>
					{#if p.time}
						<span class="font-normal tabular-nums">{p.time}</span>
					{/if}
					{#if p.meta}
						<Badge variant={p.active ? "default" : "secondary"}>{p.meta}</Badge>
					{/if}
				</Message.Header>
				<Bubble.Root {align} variant={isSelf ? "muted" : "outline"}>
					<Bubble.Content>
						{#each parts as seg, idx (idx)}
							{#if seg.hit}
								<mark class="rounded-xs bg-primary/20 px-0.5 font-medium text-foreground"
									>{seg.text}</mark
								>
							{:else}
								{seg.text}
							{/if}
						{/each}
					</Bubble.Content>
				</Bubble.Root>
			</Message.Content>
		</Message.Root>
	</div>
{/snippet}

{#snippet node(n: UiNode, path: string)}
	{@const p = P(n)}
	{@const id = idOf(path)}
	<svelte:boundary>
		{#snippet failed()}
			<Alert.Root variant="destructive">
				<TriangleAlertIcon />
				<Alert.Title>这个组件无法显示</Alert.Title>
				<Alert.Description>{n.type}</Alert.Description>
			</Alert.Root>
		{/snippet}

		{#if n.type === "PageLayout"}
			<PageLayout.Root width={p.width}>{@render nodes(list(n), path)}</PageLayout.Root>
		{:else if n.type === "PageHeader"}
			<PageLayout.Header>
				<PageLayout.Title tag="h2">{p.title}</PageLayout.Title>
				{#if list(n).length}
					<PageLayout.Actions>{@render nodes(list(n), path)}</PageLayout.Actions>
				{/if}
			</PageLayout.Header>
		{:else if n.type === "PageToolbar"}
			{@const children = list(n)}
			{@const hasLabeled = hasTopLabeledField(children)}
			<PageLayout.Toolbar
				class="{hasLabeled ? 'items-end' : 'items-center'} {children.length === 2
					? 'justify-between'
					: 'justify-start'} [&>[data-slot=field]]:w-full [&>[data-slot=field]]:@sm:w-64 [&>[data-slot=input-group]]:w-full [&>[data-slot=input-group]]:@sm:w-64"
			>
				{@render nodes(children, path)}
			</PageLayout.Toolbar>
		{:else if n.type === "PageSection"}
			{@const children = list(n)}
			{@const flushSettingsList =
				children.length === 1 &&
				children[0]?.type === "PropertyList" &&
				children[0]?.props?.layout !== "detail"}
			{#if p.surface === "card"}
				{#if p.title}
					<PageLayout.Section surface="plain">
						<PageLayout.SectionTitle>{p.title}</PageLayout.SectionTitle>
						<PageLayout.Section surface="card" class={flushSettingsList ? "" : "gap-4 p-4"}>
							{@render nodes(children, path)}
						</PageLayout.Section>
					</PageLayout.Section>
				{:else}
					<PageLayout.Section surface="card" class={flushSettingsList ? "" : "gap-4 p-4"}>
						{@render nodes(children, path)}
					</PageLayout.Section>
				{/if}
			{:else}
				<PageLayout.Section surface="plain">
					{#if p.title}<PageLayout.SectionTitle>{p.title}</PageLayout.SectionTitle>{/if}
					{@render nodes(children, path)}
				</PageLayout.Section>
			{/if}
		{:else if n.type === "PropertyList"}
			{@const listLayout = p.layout === "detail" ? "detail" : "settings"}
			<PageLayout.PropertyList layout={listLayout}>
				{#each list(n) as child, i (i)}
					{#if child.type === "PropertyRow"}
						{@render propertyRow(child, `${path}-${i}`, listLayout)}
					{:else}
						{@render node(child, `${path}-${i}`)}
					{/if}
				{/each}
			</PageLayout.PropertyList>
		{:else if n.type === "PropertyRow"}
			{@render propertyRow(n, path)}
		{:else if n.type === "Stack"}
			{@const children = list(n)}
			{@const isRow = p.direction === "row"}
			{@const defaultRowAlign = hasTopLabeledField(children) ? "items-end" : "items-center"}
			<div
				class="flex {isRow ? 'flex-row flex-wrap' : 'flex-col'} {GAP[
					p.gap as keyof typeof GAP
				] ?? GAP.md} {isRow
					? (ALIGN[p.align as keyof typeof ALIGN] ?? defaultRowAlign)
					: (ALIGN[p.align as keyof typeof ALIGN] ?? '')} {isRow && p.justify
					? (JUSTIFY[p.justify as keyof typeof JUSTIFY] ?? '')
					: ''} {isRow && children.length > 1
					? '[&>[data-slot=field]]:w-full [&>[data-slot=field]]:@sm:w-60 [&>[data-slot=input-group]]:w-full [&>[data-slot=input-group]]:@sm:w-64'
					: ''}"
			>
				{@render nodes(children, path)}
			</div>
		{:else if n.type === "SplitLayout"}
			{@const children = list(n)}
			{@const ratioCls =
				SPLIT_RATIO[p.ratio as keyof typeof SPLIT_RATIO] ?? SPLIT_RATIO["1:2"]}
			{#if p.divided}
				<div
					class="grid grid-cols-1 items-start divide-y-[0.5px] divide-border {ratioCls} @2xl:divide-x-[0.5px] @2xl:divide-y-0"
				>
					{#each children as child, i (i)}
						<div
							class={i === 0
								? "min-w-0 pb-4 @2xl:pr-4 @2xl:pb-0"
								: "min-w-0 pt-4 @2xl:pt-0 @2xl:pl-4"}
						>
							{@render node(child, `${path}-${i}`)}
						</div>
					{/each}
				</div>
			{:else}
				<div
					class="grid grid-cols-1 items-start {GAP[p.gap as keyof typeof GAP] ?? GAP.md} {ratioCls}"
				>
					{#each children as child, i (i)}
						<div class="min-w-0">{@render node(child, `${path}-${i}`)}</div>
					{/each}
				</div>
			{/if}
		{:else if n.type === "Grid"}
			<div
				class="grid {COLUMNS[p.columns as keyof typeof COLUMNS] ?? COLUMNS[2]} {GAP[
					p.gap as keyof typeof GAP
				] ?? GAP.md}"
			>
				{@render nodes(list(n), path)}
			</div>
		{:else if n.type === "Heading"}
			{#if p.level === 3}
				<h3 class="text-base font-medium">{str(n)}</h3>
			{:else}
				<h2 class="text-lg font-semibold">{str(n)}</h2>
			{/if}
		{:else if n.type === "Text"}
			<p class="text-sm {p.tone === 'muted' ? 'text-muted-foreground' : ''}">{str(n)}</p>
		{:else if n.type === "Separator"}
			<Separator />
		{:else if n.type === "Button"}
			<Button variant={p.variant} size={p.size} href={p.href} disabled={p.disabled}>{str(n)}</Button
			>
		{:else if n.type === "ButtonGroup"}
			{@const children = list(n)}
			{@const groupVariant = p.variant ?? "pill"}
			<ButtonGroup.Root variant={groupVariant} aria-label={p.label}>
				{#each children as child, i (i)}
					{#if i > 0 && groupVariant === "pill"}
						<ButtonGroup.Separator />
					{/if}
					{@render node(child, `${path}-${i}`)}
				{/each}
			</ButtonGroup.Root>
		{:else if n.type === "SearchInput"}
			{@const curVal = searchValues[path] ?? p.value ?? ""}
			<InputGroup.Root class="w-full @sm:w-64">
				<InputGroup.Addon>
					<SearchIcon />
				</InputGroup.Addon>
				<InputGroup.Input
					type="search"
					aria-label={p.label}
					placeholder={p.placeholder}
					value={curVal}
					disabled={p.disabled}
					class="[&::-webkit-search-cancel-button]:appearance-none"
					oninput={(event) => (searchValues[path] = event.currentTarget.value)}
				/>
				{#if (curVal && !p.disabled) || p.actionLabel}
					<InputGroup.Addon align="inline-end">
						{#if curVal && !p.disabled}
							<InputGroup.Button
								size="icon-xs"
								variant="ghost"
								aria-label="清除搜索"
								onclick={() => (searchValues[path] = "")}
							>
								<XIcon />
							</InputGroup.Button>
						{/if}
						{#if p.actionLabel}
							<InputGroup.Button size="xs" variant="secondary" disabled={p.disabled}>
								{p.actionLabel}
							</InputGroup.Button>
						{/if}
					</InputGroup.Addon>
				{/if}
			</InputGroup.Root>
		{:else if n.type === "FilterSelect"}
			{@const curVal = filterValues[path] ?? p.value}
			<Select.Root
				type="single"
				value={curVal}
				onValueChange={(value) => (filterValues[path] = value)}
				items={p.options}
				disabled={p.disabled}
			>
				<Select.Trigger size="sm" aria-label={p.label}>
					<Select.Value placeholder={p.placeholder ?? p.label} />
				</Select.Trigger>
				<Select.Content>
					{#each p.options as option (option.value)}
						<Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		{:else if n.type === "Badge"}
			<Badge variant={p.variant}>{str(n)}</Badge>
		{:else if n.type === "Alert"}
			<Alert.Root variant={p.variant}>{@render nodes(list(n), path)}</Alert.Root>
		{:else if n.type === "AlertTitle"}
			<Alert.Title>{str(n)}</Alert.Title>
		{:else if n.type === "AlertDescription"}
			<Alert.Description>{str(n)}</Alert.Description>
		{:else if n.type === "Progress"}
			<Progress value={p.value} max={p.max ?? 100} aria-label={p.label} />
		{:else if n.type === "Spinner"}
			<Spinner />
		{:else if n.type === "Kbd"}
			<Kbd.Root>{str(n)}</Kbd.Root>
		{:else if n.type === "Avatar"}
			<Avatar.Root>
				{#if p.src}<Avatar.Image src={p.src} alt={p.alt ?? ""} />{/if}
				<Avatar.Fallback>{p.fallback}</Avatar.Fallback>
			</Avatar.Root>
		{:else if n.type === "Empty"}
			<Empty.Root>
				<Empty.Header>
					<Empty.Title>{p.title}</Empty.Title>
					{#if p.description}<Empty.Description>{p.description}</Empty.Description>{/if}
				</Empty.Header>
				{#if list(n).length}<Empty.Content>{@render nodes(list(n), path)}</Empty.Content>{/if}
			</Empty.Root>
		{:else if n.type === "Breadcrumb"}
			<Breadcrumb.Root>
				<Breadcrumb.List>
					{#each p.items as item, i (i)}
						{#if i > 0}<Breadcrumb.Separator />{/if}
						<Breadcrumb.Item>
							{#if item.href && i < p.items.length - 1}
								<Breadcrumb.Link href={item.href}>{item.label}</Breadcrumb.Link>
							{:else}
								<Breadcrumb.Page>{item.label}</Breadcrumb.Page>
							{/if}
						</Breadcrumb.Item>
					{/each}
				</Breadcrumb.List>
			</Breadcrumb.Root>
		{:else if n.type === "Card"}
			<Card.Root size={p.size}>{@render nodes(list(n), path)}</Card.Root>
		{:else if n.type === "CardHeader"}
			<Card.Header>{@render nodes(list(n), path)}</Card.Header>
		{:else if n.type === "CardTitle"}
			<Card.Title>{str(n)}</Card.Title>
		{:else if n.type === "CardDescription"}
			<Card.Description>{str(n)}</Card.Description>
		{:else if n.type === "CardAction"}
			<Card.Action>{@render nodes(list(n), path)}</Card.Action>
		{:else if n.type === "CardContent"}
			<Card.Content class="flex flex-col gap-4">{@render nodes(list(n), path)}</Card.Content>
		{:else if n.type === "CardFooter"}
			<Card.Footer class="flex-wrap gap-2">{@render nodes(list(n), path)}</Card.Footer>
		{:else if n.type === "InputField"}
			<Field.Field data-invalid={p.error ? true : undefined}>
				<Field.Label for={id}>{p.label}</Field.Label>
				<Input
					{id}
					type={p.type ?? "text"}
					placeholder={p.placeholder}
					value={p.value}
					disabled={p.disabled}
					required={p.required}
					aria-invalid={p.error ? true : undefined}
				/>
				{@render notes(p)}
			</Field.Field>
		{:else if n.type === "TextareaField"}
			<Field.Field data-invalid={p.error ? true : undefined}>
				<Field.Label for={id}>{p.label}</Field.Label>
				<Textarea
					{id}
					placeholder={p.placeholder}
					value={p.value}
					disabled={p.disabled}
					required={p.required}
					aria-invalid={p.error ? true : undefined}
				/>
				{@render notes(p)}
			</Field.Field>
		{:else if n.type === "CheckboxField"}
			<Field.Field orientation="horizontal" data-invalid={p.error ? true : undefined}>
				<Checkbox {id} checked={p.checked} disabled={p.disabled} />
				{@render caption(p, id)}
			</Field.Field>
		{:else if n.type === "SwitchField"}
			<Field.Field orientation="horizontal" data-invalid={p.error ? true : undefined}>
				<Switch {id} checked={p.checked} disabled={p.disabled} />
				{@render caption(p, id)}
			</Field.Field>
		{:else if n.type === "SelectField"}
			<Field.Field data-invalid={p.error ? true : undefined}>
				<Field.Label for={id}>{p.label}</Field.Label>
				<Select.Root type="single" value={p.value} items={p.options} disabled={p.disabled}>
					<Select.Trigger {id} aria-invalid={p.error ? true : undefined}>
						<Select.Value placeholder={p.placeholder ?? "请选择"} />
					</Select.Trigger>
					<Select.Content>
						{#each p.options as option (option.value)}
							<Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				{@render notes(p)}
			</Field.Field>
		{:else if n.type === "RadioGroupField"}
			<Field.Set>
				<Field.Legend variant="label">{p.label}</Field.Legend>
				{#if p.description}<Field.Description>{p.description}</Field.Description>{/if}
				<RadioGroup.Root value={p.value} disabled={p.disabled}>
					{#each p.options as option, i (option.value)}
						<Field.Field orientation="horizontal">
							<RadioGroup.Item value={option.value} id="{id}-{i}" />
							<Field.Content>
								<Field.Label for="{id}-{i}">{option.label}</Field.Label>
								{#if option.description}<Field.Description>{option.description}</Field.Description
									>{/if}
							</Field.Content>
						</Field.Field>
					{/each}
				</RadioGroup.Root>
				{#if p.error}<Field.Error>{p.error}</Field.Error>{/if}
			</Field.Set>
		{:else if n.type === "SliderField"}
			<SliderField
				label={p.label}
				min={p.min}
				max={p.max}
				step={p.step}
				value={p.value}
				unit={p.unit}
			/>
		{:else if n.type === "InputOtpField"}
			{@const len = p.maxlength === 4 ? 4 : 6}
			<Field.Field data-invalid={p.error ? true : undefined}>
				<Field.Label for={id}>{p.label}</Field.Label>
				<InputOTP.Root
					{id}
					maxlength={len}
					value={otpValues[path] ?? p.value ?? ""}
					onValueChange={(value) => (otpValues[path] = value)}
					disabled={p.disabled}
				>
					{#snippet children({ cells })}
						<InputOTP.Group>
							{#each cells as cell (cell)}
								<InputOTP.Slot {cell} />
							{/each}
						</InputOTP.Group>
					{/snippet}
				</InputOTP.Root>
				{@render notes(p)}
			</Field.Field>
		{:else if n.type === "NumberField"}
			<Field.Field data-invalid={p.error ? true : undefined}>
				<Field.Label for={id}>{p.label}</Field.Label>
				<NumberField
					{id}
					defaultValue={p.defaultValue}
					min={p.min}
					max={p.max}
					step={p.step}
					disabled={p.disabled}
					required={p.required}
				/>
				{@render notes(p)}
			</Field.Field>
		{:else if n.type === "TagsInputField"}
			<Field.Field data-invalid={p.error ? true : undefined}>
				<Field.Label for={id}>{p.label}</Field.Label>
				<TagsInput
					{id}
					defaultValue={p.defaultValue}
					placeholder={p.placeholder}
					max={p.max}
					disabled={p.disabled}
				/>
				{@render notes(p)}
			</Field.Field>
		{:else if n.type === "DatePickerField"}
			<Field.Field data-invalid={p.error ? true : undefined}>
				<Field.Label>{p.label}</Field.Label>
				<DatePicker label={p.label} placeholder={p.placeholder ?? p.label} locale="zh-CN" />
				{@render notes(p)}
			</Field.Field>
		{:else if n.type === "ComboboxField"}
			<Field.Field data-invalid={p.error ? true : undefined}>
				<Field.Label>{p.label}</Field.Label>
				<Combobox
					label={p.label}
					placeholder={p.placeholder ?? "搜索并选择…"}
					options={p.options}
					multiple={p.multiple}
					disabled={p.disabled}
					value={comboValues[path] ?? []}
					onSelect={(optId) => {
						const cur = comboValues[path] ?? [];
						comboValues[path] = p.multiple
							? cur.includes(optId)
								? cur.filter((x) => x !== optId)
								: [...cur, optId]
							: [optId];
					}}
				/>
				{@render notes(p)}
			</Field.Field>
		{:else if n.type === "Table"}
			<Table.Root>
				{#if p.caption}<Table.Caption>{p.caption}</Table.Caption>{/if}
				<Table.Header>
					<Table.Row>
						{#each p.columns as column (column.key)}
							<Table.Head class={column.align === "end" ? "text-end" : ""}
								>{column.label}</Table.Head
							>
						{/each}
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each p.rows as row, i (i)}
						<Table.Row>
							{#each p.columns as column (column.key)}
								<Table.Cell class={column.align === "end" ? "text-end tabular-nums" : ""}>
									{row[column.key] ?? ""}
								</Table.Cell>
							{/each}
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		{:else if n.type === "Tabs"}
			{@const panels = list(n)
				.filter((child) => child.type === "TabPanel")
				.map((child) => ({ node: child, ...(child.props as { value: string; label: string }) }))}
			<Tabs.Root value={p.defaultValue ?? panels[0]?.value}>
				<Tabs.List>
					{#each panels as panel (panel.value)}
						<Tabs.Trigger value={panel.value}>{panel.label}</Tabs.Trigger>
					{/each}
				</Tabs.List>
				{#each panels as panel, i (panel.value)}
					<Tabs.Content value={panel.value}>
						<div class="flex flex-col gap-4 pt-2">
							{@render nodes(list(panel.node), `${path}-${i}`)}
						</div>
					</Tabs.Content>
				{/each}
			</Tabs.Root>
		{:else if n.type === "Accordion"}
			<Accordion.Root type={p.type ?? "single"}>
				{#each list(n) as item, i (i)}
					<Accordion.Item value="item-{i}">
						<Accordion.Trigger>{item.props?.title}</Accordion.Trigger>
						<Accordion.Content>
							<div class="flex flex-col gap-4">{@render nodes(list(item), `${path}-${i}`)}</div>
						</Accordion.Content>
					</Accordion.Item>
				{/each}
			</Accordion.Root>
		{:else if n.type === "Dialog"}
			<Dialog.Root>
				<Dialog.Trigger>
					{#snippet child({ props })}
						<Button
							{...props}
							variant={p.triggerVariant ?? "outline"}
							size={p.triggerSize ?? "sm"}
						>
							{p.triggerLabel}
						</Button>
					{/snippet}
				</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>{p.title}</Dialog.Title>
						{#if p.description}<Dialog.Description>{p.description}</Dialog.Description>{/if}
					</Dialog.Header>
					<div class="flex flex-col gap-4">{@render nodes(list(n), path)}</div>
				</Dialog.Content>
			</Dialog.Root>
		{:else if n.type === "AlertDialog"}
			{@const isDestructive = p.destructive !== false}
			{@const triggerVariant = p.triggerVariant ?? (isDestructive ? "destructive" : "outline")}
			<AlertDialog.Root>
				<AlertDialog.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant={triggerVariant} size="sm">{p.triggerLabel}</Button>
					{/snippet}
				</AlertDialog.Trigger>
				<AlertDialog.Content appearance={isDestructive ? "danger" : "confirmation"} focusCancel>
					<AlertDialog.Header>
						<AlertDialog.Title>{p.title}</AlertDialog.Title>
						<AlertDialog.Description>{p.description}</AlertDialog.Description>
					</AlertDialog.Header>
					<AlertDialog.Footer>
						<AlertDialog.Cancel>{p.cancelLabel ?? "取消"}</AlertDialog.Cancel>
						<AlertDialog.Action variant={isDestructive ? "destructive" : "default"}>
							{p.confirmLabel}
						</AlertDialog.Action>
					</AlertDialog.Footer>
				</AlertDialog.Content>
			</AlertDialog.Root>
		{:else if n.type === "Sheet"}
			<Sheet.Root>
				<Sheet.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant={p.triggerVariant ?? "outline"} size="sm">
							{p.triggerLabel}
						</Button>
					{/snippet}
				</Sheet.Trigger>
				<Sheet.Content side={p.side ?? "right"}>
					<Sheet.Header>
						<Sheet.Title>{p.title}</Sheet.Title>
						{#if p.description}<Sheet.Description>{p.description}</Sheet.Description>{/if}
					</Sheet.Header>
					<div class="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
						{@render nodes(list(n), path)}
					</div>
				</Sheet.Content>
			</Sheet.Root>
		{:else if n.type === "ItemList"}
			<Item.Group aria-label={p.label} class="divide-y-[0.5px] divide-border border-y-[0.5px] border-border">
				{@render nodes(list(n), path)}
			</Item.Group>
		{:else if n.type === "ItemRow"}
			<div role="listitem">
				<Item.Root
					size="sm"
					class={p.active ? "bg-accent/70" : undefined}
					aria-current={p.active ? "true" : undefined}
					aria-disabled={p.disabled ? "true" : undefined}
				>
					<Item.Content>
						<div class="flex min-w-0 items-center gap-2">
							{#if p.meta}
								<span class="shrink-0 text-xs tabular-nums text-muted-foreground">{p.meta}</span>
							{/if}
							<Item.Title class="truncate">{p.title}</Item.Title>
						</div>
						{#if p.description}<Item.Description>{p.description}</Item.Description>{/if}
					</Item.Content>
					{#if list(n).length}
						<Item.Actions>{@render nodes(list(n), path)}</Item.Actions>
					{/if}
				</Item.Root>
			</div>
		{:else if n.type === "MessageList"}
			<div role="log" aria-label={p.label ?? "对话记录"} class="flex flex-col gap-4">
				{#each list(n) as child, i (i)}
					{#if child.type === "ChatMessage"}
						{@render chatMessage(child, p.highlight)}
					{:else}
						{@render node(child, `${path}-${i}`)}
					{/if}
				{/each}
			</div>
		{:else if n.type === "ChatMessage"}
			{@render chatMessage(n)}
		{:else if n.type === "Gauge"}
			{@const gaugeTone = p.tone ?? (Number(p.value) > 100 ? "danger" : "accent")}
			{@const gaugeValueText = p.valueText ?? `已使用 ${Math.round(Number(p.value))}%`}
			<div class="flex flex-wrap items-center gap-3">
				<Gauge
					value={p.value}
					label={p.label}
					valueText={gaugeValueText}
					tone={gaugeTone}
					class="w-20 shrink-0"
				/>
				<div class="flex min-w-0 flex-col gap-0.5">
					<span class="text-sm font-medium text-foreground">{p.label}</span>
					<span class="text-xs tabular-nums text-muted-foreground">{gaugeValueText}</span>
				</div>
			</div>
		{:else if n.type === "Sparkline"}
			<div class="flex items-center gap-3">
				<StaticSparkline values={p.values} width="96" height="40" class="shrink-0" />
				<div class="flex min-w-0 flex-col gap-0.5">
					<span class="text-xs text-muted-foreground">{p.label}</span>
					{#if p.value}
						<span class="text-sm font-medium tabular-nums text-foreground">{p.value}</span>
					{/if}
				</div>
			</div>
		{:else if n.type === "Skeleton"}
			{@const lineCount = Number(p.lines ?? (p.variant === "card" ? 1 : 3))}
			{#if p.variant === "card"}
				<div class="flex flex-col gap-3 rounded-lg border-[0.5px] border-border p-4">
					<Skeleton class="h-4 w-1/3" />
					<Skeleton class="h-8 w-1/2" />
					<Skeleton class="h-3 w-2/3" />
				</div>
			{:else if p.variant === "text"}
				<div class="flex flex-col gap-2">
					{#each Array.from({ length: lineCount }) as _, idx (idx)}
						<Skeleton class={idx === lineCount - 1 ? "h-4 w-2/3" : "h-4 w-full"} />
					{/each}
				</div>
			{:else}
				<div class="flex flex-col gap-2.5">
					{#each Array.from({ length: lineCount }) as _, idx (idx)}
						<Skeleton class="h-10 w-full rounded-md" />
					{/each}
				</div>
			{/if}
		{:else if n.type === "Stepper"}
			<Stepper steps={p.steps} orientation={p.orientation} />
		{:else if n.type === "ToggleGroup"}
			<ToggleGroup.Root
				type="single"
				variant="outline"
				value={p.defaultValue ?? p.options[0]?.value}
				aria-label={p.label}
			>
				{#each p.options as opt (opt.value)}
					<ToggleGroup.Item value={opt.value}>{opt.label}</ToggleGroup.Item>
				{/each}
			</ToggleGroup.Root>
		{:else}
			<Alert.Root>
				<TriangleAlertIcon />
				<Alert.Title>暂时无法显示</Alert.Title>
				<Alert.Description>这个版本还不认识组件类型 {n.type}。</Alert.Description>
			</Alert.Root>
		{/if}
	</svelte:boundary>
{/snippet}

<!-- Grids respond to the width of this box, not the window, so they also fit the narrow side panel. -->
<div class="@container w-full">
	{@render node(root, "r")}
</div>
