<script lang="ts">
	import TriangleAlertIcon from "@lucide/svelte/icons/triangle-alert";
	import * as Accordion from "$lib/registry/ui/accordion/index.js";
	import * as Alert from "$lib/registry/ui/alert/index.js";
	import * as Avatar from "$lib/registry/ui/avatar/index.js";
	import * as Breadcrumb from "$lib/registry/ui/breadcrumb/index.js";
	import * as Card from "$lib/registry/ui/card/index.js";
	import * as Dialog from "$lib/registry/ui/dialog/index.js";
	import * as Empty from "$lib/registry/ui/empty/index.js";
	import * as Field from "$lib/registry/ui/field/index.js";
	import * as Kbd from "$lib/registry/ui/kbd/index.js";
	import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
	import * as Select from "$lib/registry/ui/select/index.js";
	import * as Table from "$lib/registry/ui/table/index.js";
	import * as Tabs from "$lib/registry/ui/tabs/index.js";
	import type { UiNode } from "$lib/agent/ui-catalog.js";
	import { Badge } from "$lib/registry/ui/badge/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import { Progress } from "$lib/registry/ui/progress/index.js";
	import { Separator } from "$lib/registry/ui/separator/index.js";
	import { SliderField } from "$lib/registry/ui/slider-field/index.js";
	import { Spinner } from "$lib/registry/ui/spinner/index.js";
	import { Switch } from "$lib/registry/ui/switch/index.js";
	import { Textarea } from "$lib/registry/ui/textarea/index.js";

	/**
	 * Draws a validated UI tree (see `ui-catalog.ts`) with the library's own components.
	 * Layout nodes (Stack, Grid, Heading, Text) are the only things drawn here directly, and they
	 * only use spacing and type steps from the design tokens. Every node sits in its own error
	 * boundary, so one bad node shows a notice instead of blanking the whole answer.
	 */
	let { root }: { root: UiNode } = $props();

	const uid = $props.id();

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
	const ALIGN = { start: "items-start", center: "items-center", end: "items-end" } as const;
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

		{#if n.type === "Stack"}
			<div
				class="flex {p.direction === 'row' ? 'flex-row flex-wrap' : 'flex-col'} {GAP[
					p.gap as keyof typeof GAP
				] ?? GAP.md} {p.direction === 'row'
					? (ALIGN[p.align as keyof typeof ALIGN] ?? 'items-center')
					: (ALIGN[p.align as keyof typeof ALIGN] ?? '')}"
			>
				{@render nodes(list(n), path)}
			</div>
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
						<Button {...props} variant="outline">{p.triggerLabel}</Button>
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
