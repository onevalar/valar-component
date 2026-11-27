import assert from "node:assert/strict";
import test from "node:test";
import * as UI from "@valar/react-ui";
import { createElement as h } from "react";
import { renderToStaticMarkup as render } from "react-dom/server";

test("component groups resolve at both root and per-component public paths", async () => {
	const modules = {
		label: ["Label"],
		field: [
			"Field",
			"FieldSet",
			"FieldLegend",
			"FieldGroup",
			"FieldContent",
			"FieldLabel",
			"FieldTitle",
			"FieldDescription",
			"FieldSeparator",
			"FieldError",
		],
		textarea: ["Textarea"],
		switch: ["Switch"],
		tabs: ["Tabs", "TabsList", "TabsTrigger", "TabsContent", "tabsListVariants"],
		kbd: ["Kbd", "KbdGroup"],
		tooltip: [
			"Tooltip",
			"TooltipProvider",
			"TooltipTrigger",
			"TooltipContent",
			"TooltipPortal",
			"TooltipHint",
		],
		"radio-group": ["RadioGroup", "RadioGroupItem"],
		"native-select": ["NativeSelect", "NativeSelectOption", "NativeSelectOptGroup"],
		"input-group": [
			"InputGroup",
			"InputGroupAddon",
			"InputGroupButton",
			"InputGroupInput",
			"InputGroupText",
			"InputGroupTextarea",
		],
		toggle: ["Toggle", "toggleVariants"],
		"toggle-group": ["ToggleGroup", "ToggleGroupItem"],
		"button-group": [
			"ButtonGroup",
			"ButtonGroupSeparator",
			"ButtonGroupText",
			"buttonGroupVariants",
		],
		accordion: ["Accordion", "AccordionTrigger", "AccordionContent"],
		alert: ["Alert", "AlertAction"],
		"aspect-ratio": ["AspectRatio"],
		avatar: ["Avatar", "AvatarFallback", "AvatarGroupCount"],
		badge: ["Badge"],
		breadcrumb: ["Breadcrumb", "BreadcrumbLink", "BreadcrumbPage"],
		card: ["Card", "CardHeader", "CardAction"],
		carousel: ["Carousel", "CarouselItem", "CarouselPrevious", "CarouselNext"],
		collapsible: ["Collapsible", "CollapsibleTrigger", "CollapsibleContent"],
		empty: ["Empty", "EmptyMedia"],
		item: ["Item", "ItemGroup", "ItemSeparator"],
		"page-layout": ["PageLayout", "PageLayoutPropertyList", "PageLayoutPropertyRow"],
		pagination: ["Pagination", "PaginationLink", "PaginationPrevious", "PaginationNext"],
		progress: ["Progress"],
		resizable: ["ResizablePaneGroup", "ResizablePane", "ResizableHandle"],
		"scroll-area": ["ScrollArea", "ScrollAreaScrollbar"],
		skeleton: ["Skeleton"],
		spinner: ["Spinner"],
	} as const satisfies Record<string, readonly (keyof typeof UI)[]>;
	for (const [subpath, names] of Object.entries(modules)) {
		const component = await import(`@valar/react-ui/${subpath}`);
		for (const name of names) {
			assert.ok(UI[name], `missing root export: ${name}`);
			assert.equal(component[name], UI[name], `incorrect ${subpath} export: ${name}`);
		}
	}
});

test("Field preserves native labels/fieldset semantics and emits only useful error content", () => {
	const html = render(
		h(
			UI.FieldSet,
			{ disabled: true },
			h(UI.FieldLegend, { variant: "label" }, "Team profile"),
			h(
				UI.FieldGroup,
				null,
				h(
					UI.Field,
					{ appearance: "settings", orientation: "responsive" },
					h(
						UI.FieldContent,
						null,
						h(UI.FieldLabel, { htmlFor: "description", required: true }, "Description"),
						h(UI.FieldDescription, { id: "note" }, "255 characters"),
						h(UI.FieldError, {
							id: "error",
							errors: [
								{ message: " Missing " },
								{ message: "Missing" },
								{},
								null,
								{ message: " " },
								{ message: "Too short" },
							],
						})
					),
					h(UI.Textarea, {
						id: "description",
						name: "description",
						maxLength: 255,
						required: true,
						readOnly: true,
						appearance: "settings",
						defaultValue: "描述🌱",
						"aria-describedby": "note error",
						"aria-invalid": true,
					})
				),
				h(UI.FieldSeparator, null, "More options"),
				h(UI.FieldTitle, null, "Restricted setting")
			)
		)
	);
	assert.match(html, /<fieldset[^>]+disabled=""/);
	assert.match(html, /<legend[^>]+data-variant="label"/);
	assert.match(
		html,
		/data-slot="field"[^>]+data-appearance="settings"[^>]+data-orientation="responsive"/
	);
	assert.match(
		html,
		/<label(?=[^>]*for="description")[^>]*data-slot="field-label"[^>]*>Description<span[^>]+aria-hidden="true"[^>]*>\*<\/span>/
	);
	assert.match(
		html,
		/role="alert"[^>]*id="error"><ul[^>]*><li>Missing<\/li><li>Too short<\/li><\/ul>/
	);
	assert.match(html, /data-slot="field-separator" data-content="true"/);
	assert.match(
		html,
		/<textarea(?=[^>]*data-appearance="settings")(?=[^>]*maxLength="255")(?=[^>]*readOnly="")(?=[^>]*required="")(?=[^>]*aria-describedby="note error")[^>]*>描述🌱<\/textarea>/
	);
	assert.equal(render(h(UI.FieldError, { errors: [{ message: " " }] })), "");
	assert.match(
		render(h(UI.FieldError, { errors: [{ message: "unused error" }] }, "Own feedback")),
		/>Own feedback<\/div>/
	);
});

test("Native Select owns actual options, names and native multi-selection", () => {
	const html = render(
		h(
			UI.NativeSelect,
			{
				id: "zone",
				name: "zone",
				size: "sm",
				defaultValue: "local",
				required: true,
				className: "w-full",
			},
			h(UI.NativeSelectOption, { value: "" }, "Choose a timezone"),
			h(
				UI.NativeSelectOptGroup,
				{ label: "Common" },
				h(UI.NativeSelectOption, { value: "local" }, "Local")
			)
		)
	);
	assert.match(
		html,
		/<div[^>]+data-slot="native-select-wrapper"[^>]+class="[^"]*w-full[^>]*><select/
	);
	assert.match(html, /<select(?=[^>]*data-size="sm")(?=[^>]*name="zone")(?=[^>]*required="")/);
	assert.match(
		html,
		/<optgroup[^>]+label="Common"><option[^>]+value="local"[^>]+selected="">Local<\/option>/
	);
	assert.match(html, /<svg[^>]+data-slot="native-select-icon"[^>]+aria-hidden="true"/);
	const multiple = render(
		h(
			UI.NativeSelect,
			{ multiple: true, defaultValue: ["a", "b"] },
			h(UI.NativeSelectOption, { value: "a" }, "Alpha"),
			h(UI.NativeSelectOption, { value: "b" }, "Beta")
		)
	);
	assert.equal((multiple.match(/selected=""/g) ?? []).length, 2);
	assert.doesNotMatch(multiple, /<svg/);
});

test("Switch, Radio Group and Toggle render native interaction state, not placeholder shells", () => {
	const switchHtml = render(
		h(
			"form",
			null,
			h(UI.Switch, {
				defaultChecked: true,
				size: "sm",
				appearance: "settings",
				name: "email",
				value: "on",
				required: true,
			})
		)
	);
	assert.match(
		switchHtml,
		/<button(?=[^>]*role="switch")(?=[^>]*aria-checked="true")(?=[^>]*data-size="sm")/
	);
	assert.match(switchHtml, /<span[^>]+data-slot="switch-thumb"/);
	assert.match(
		switchHtml,
		/<input(?=[^>]*type="checkbox")(?=[^>]*name="email")(?=[^>]*checked="")(?=[^>]*required="")/
	);
	const radio = render(
		h(
			UI.RadioGroup,
			{ readOnly: true, name: "delivery", defaultValue: "email", "aria-label": "Delivery" },
			h(UI.RadioGroupItem, { value: "email", "aria-label": "Email" }),
			h(UI.RadioGroupItem, { value: "digest", "aria-label": "Digest", disabled: true })
		)
	);
	assert.match(radio, /role="radiogroup"[^>]+aria-orientation="vertical"[^>]+aria-readonly="true"/);
	assert.match(radio, /role="radio"[^>]+aria-checked="true"[^>]+aria-label="Email"/);
	assert.match(
		radio,
		/role="radio"[^>]+aria-checked="false"[^>]+disabled=""[^>]+aria-label="Digest"/
	);
	assert.match(
		render(
			h(UI.Toggle, { defaultPressed: true, size: "lg", variant: "outline", "aria-label": "Bold" })
		),
		/<button(?=[^>]*aria-pressed="true")(?=[^>]*data-variant="outline")(?=[^>]*data-size="lg")/
	);
});

test("Tabs retain inactive panel children and expose paired aria IDs", () => {
	const html = render(
		h(
			UI.Tabs,
			{ defaultValue: "one", activationMode: "manual", disabled: true },
			h(
				UI.TabsList,
				{ variant: "capsule", "aria-label": "Sections" },
				h(UI.TabsTrigger, { value: "one" }, "One"),
				h(UI.TabsTrigger, { value: "two" }, "Two")
			),
			h(UI.TabsContent, { value: "one" }, "First contents"),
			h(UI.TabsContent, { value: "two" }, "Second contents")
		)
	);
	const trigger = html.match(
		/<button(?=[^>]*aria-selected="true")(?=[^>]*disabled="")(?=[^>]*aria-controls="([^"]+)")(?=[^>]* id="([^"]+)")[^>]*>One<\/button>/
	);
	assert.ok(trigger);
	assert.ok(html.includes(`aria-labelledby="${trigger[2]}" id="${trigger[1]}"`));
	assert.match(html, /role="tabpanel"[^>]+hidden=""[^>]*>Second contents<\/div>/);
});

test("Tooltip, Kbd and Toggle Group compose real Radix and native markup", () => {
	const tooltip = render(
		h(
			UI.TooltipProvider,
			null,
			h(
				UI.Tooltip,
				{ defaultOpen: true },
				h(UI.TooltipTrigger, null, "Help"),
				h(
					UI.TooltipContent,
					{ portalProps: false, appearance: "surface", side: "bottom" },
					"Keyboard help",
					h(
						UI.KbdGroup,
						null,
						h(UI.Kbd, { appearance: "compact" }, "⌘"),
						h(UI.Kbd, { appearance: "compact" }, "K")
					)
				)
			)
		)
	);
	assert.match(tooltip, /<button[^>]+data-slot="tooltip-trigger"[^>]+type="button"/);
	assert.match(
		tooltip,
		/role="tooltip"[^>]+data-slot="tooltip-content"[^>]+data-appearance="surface"/
	);
	assert.match(
		tooltip,
		/<kbd[^>]+data-slot="kbd-group"[^>]*><kbd[^>]+data-appearance="compact"[^>]*>⌘<\/kbd>/
	);
	assert.doesNotMatch(tooltip, /data-slot="tooltip-arrow"/);
	const group = render(
		h(
			UI.ToggleGroup,
			{
				type: "multiple",
				defaultValue: ["bold"],
				appearance: "toolbar",
				"aria-label": "Formatting",
			},
			h(UI.ToggleGroupItem, { value: "bold" }, "Bold"),
			h(UI.ToggleGroupItem, { value: "italic" }, "Italic")
		)
	);
	assert.match(group, /role="group"[^>]+data-appearance="toolbar"[^>]+data-spacing="1\.5"/);
	assert.match(
		group,
		/<button(?=[^>]*aria-pressed="true")(?=[^>]*data-state="on")[^>]*>Bold<\/button>/
	);
	assert.match(
		group,
		/<button(?=[^>]*aria-pressed="false")(?=[^>]*data-state="off")[^>]*>Italic<\/button>/
	);
});

test("Input Group and Button Group keep native controls and slots for shared focus and joined styles", () => {
	const html = render(
		h(
			UI.InputGroup,
			{ appearance: "composer", "aria-busy": true },
			h(UI.InputGroupTextarea, {
				name: "comment",
				"aria-label": "Comment",
				"aria-invalid": true,
				defaultValue: "comment",
			}),
			h(
				UI.InputGroupAddon,
				{ align: "block-end" },
				h(UI.InputGroupText, null, "7/255"),
				h(UI.InputGroupButton, { size: "icon-xs", "aria-label": "Attach" }),
				h(UI.InputGroupButton, { type: "submit" }, "Send")
			)
		)
	);
	assert.match(html, /data-slot="input-group" data-appearance="composer" role="group"/);
	assert.match(
		html,
		/<textarea(?=[^>]*data-slot="input-group-control")(?=[^>]*aria-invalid="true")[^>]*>comment/
	);
	assert.match(html, /data-align="block-end"/);
	assert.match(
		html,
		/<button(?=[^>]*data-size="icon-xs")(?=[^>]*type="button")(?=[^>]*aria-label="Attach")/
	);
	assert.match(html, /<button[^>]+type="submit"[^>]*>Send/);
	const group = render(
		h(
			UI.ButtonGroup,
			{ variant: "pill", "aria-label": "Actions" },
			h(UI.ButtonGroupText, { asChild: true }, h("span", null, "To:")),
			h(UI.InputGroupInput, { name: "address", "aria-label": "Address" }),
			h(UI.ButtonGroupSeparator, null),
			h(UI.Button, { size: "icon-sm", "aria-label": "Next" })
		)
	);
	assert.match(
		group,
		/data-slot="button-group" data-variant="pill" data-orientation="horizontal" role="group"/
	);
	assert.match(group, /<span[^>]+data-slot="button-group-text"[^>]*>To:/);
	assert.match(group, /<input[^>]+data-slot="input-group-control"/);
	assert.match(group, /data-orientation="vertical" role="none" data-slot="button-group-separator"/);
});
