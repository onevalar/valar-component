import { usedComponentSlugs, type UiNode } from "./ui-catalog.js";

type Props = Record<string, unknown>;

const P = (n: UiNode): Props => n.props ?? {};
const list = (n: UiNode): UiNode[] => (Array.isArray(n.children) ? n.children : []);
const str = (n: UiNode): string => (typeof n.children === "string" ? n.children : "");

const GAP = { sm: "gap-2", md: "gap-4", lg: "gap-6" } as const;
const COLUMNS = {
	1: "grid-cols-1",
	2: "grid-cols-1 sm:grid-cols-2",
	3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
	4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
} as const;
const ALIGN = { start: "items-start", center: "items-center", end: "items-end" } as const;

const escapeText = (value: string) =>
	value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll("{", "&#123;")
		.replaceAll("}", "&#125;");

const quote = (value: string) => JSON.stringify(value);

const attr = (name: string, value: unknown): string => {
	if (value === undefined || value === null || value === false) return "";
	if (value === true) return ` ${name}`;
	if (typeof value === "number") return ` ${name}={${value}}`;
	if (typeof value === "string") return ` ${name}=${quote(value)}`;
	return "";
};

const pad = (depth: number) => "\t".repeat(depth);

/**
 * Deterministically converts a validated `UiNode` tree into clean, Valar-compliant Svelte 5 code
 * plus the matching CLI install command. Every output is designed to pass `valar-svelte lint`.
 */
export function uiNodeToSvelte(root: UiNode): {
	code: string;
	installCommand: string;
	components: string[];
} {
	const namespaceImports = new Map<string, string>();
	const namedImports = new Map<string, Set<string>>();
	const scriptLines: string[] = [];
	let fieldSeq = 0;
	let varSeq = 0;

	const useNs = (alias: string, slug: string) => {
		namespaceImports.set(alias, `$lib/components/ui/${slug}/index.js`);
	};
	const useNamed = (symbol: string, slug: string) => {
		const path = `$lib/components/ui/${slug}/index.js`;
		let set = namedImports.get(path);
		if (!set) {
			set = new Set();
			namedImports.set(path, set);
		}
		set.add(symbol);
	};
	const nextFieldId = () => `field-${++fieldSeq}`;
	const nextVar = (prefix: string) => `${prefix}${++varSeq}`;

	const renderNotes = (p: Props, depth: number): string[] => {
		const out: string[] = [];
		if (typeof p.description === "string" && p.description) {
			out.push(`${pad(depth)}<Field.Description>${escapeText(p.description)}</Field.Description>`);
		}
		if (typeof p.error === "string" && p.error) {
			out.push(`${pad(depth)}<Field.Error>${escapeText(p.error)}</Field.Error>`);
		}
		return out;
	};

	const renderPropertyRow = (
		n: UiNode,
		depth: number,
		inheritedLayout?: "settings" | "detail"
	): string => {
		useNs("PageLayout", "page-layout");
		const p = P(n);
		const children = list(n);
		const rowLayout =
			p.layout === "detail" || p.layout === "settings"
				? p.layout
				: (inheritedLayout ??
					(p.value !== undefined && !children.length && typeof p.checked !== "boolean"
						? "detail"
						: "settings"));
		const rowAttrs = [
			rowLayout === "detail" ? attr("layout", "detail") : "",
			attr("label", p.label),
			attr("description", p.description),
		].join("");

		if (children.length) {
			const inner = children.map((child) => renderNode(child, depth + 1)).join("\n");
			return `${pad(depth)}<PageLayout.PropertyRow${rowAttrs}>\n${inner}\n${pad(depth)}</PageLayout.PropertyRow>`;
		}
		if (typeof p.checked === "boolean") {
			useNamed("Switch", "switch");
			const stateName = nextVar("setting");
			scriptLines.push(`let ${stateName} = $state(${p.checked});`);
			return [
				`${pad(depth)}<PageLayout.PropertyRow${rowAttrs}>`,
				`${pad(depth + 1)}<Switch aria-label=${quote(String(p.label ?? ""))} bind:checked={${stateName}}${attr("disabled", p.disabled)} />`,
				`${pad(depth)}</PageLayout.PropertyRow>`,
			].join("\n");
		}
		if (p.value !== undefined) {
			return `${pad(depth)}<PageLayout.PropertyRow${rowAttrs}>${escapeText(String(p.value))}</PageLayout.PropertyRow>`;
		}
		return `${pad(depth)}<PageLayout.PropertyRow${rowAttrs} />`;
	};

	const renderNode = (n: UiNode, depth: number): string => {
		const p = P(n);
		const children = list(n);
		const renderChildren = (d = depth + 1) => children.map((c) => renderNode(c, d)).join("\n");

		switch (n.type) {
			case "PageLayout": {
				useNs("PageLayout", "page-layout");
				const widthAttr = p.width === "narrow" ? ' width="narrow"' : "";
				if (!children.length) return `${pad(depth)}<PageLayout.Root${widthAttr} />`;
				return `${pad(depth)}<PageLayout.Root${widthAttr}>\n${renderChildren()}\n${pad(depth)}</PageLayout.Root>`;
			}
			case "PageHeader": {
				useNs("PageLayout", "page-layout");
				const lines = [
					`${pad(depth)}<PageLayout.Header>`,
					`${pad(depth + 1)}<PageLayout.Title>${escapeText(String(p.title ?? ""))}</PageLayout.Title>`,
				];
				if (children.length) {
					lines.push(`${pad(depth + 1)}<PageLayout.Actions>`);
					lines.push(renderChildren(depth + 2));
					lines.push(`${pad(depth + 1)}</PageLayout.Actions>`);
				}
				lines.push(`${pad(depth)}</PageLayout.Header>`);
				return lines.join("\n");
			}
			case "PageToolbar": {
				useNs("PageLayout", "page-layout");
				if (!children.length) return `${pad(depth)}<PageLayout.Toolbar />`;
				return `${pad(depth)}<PageLayout.Toolbar>\n${renderChildren()}\n${pad(depth)}</PageLayout.Toolbar>`;
			}
			case "PageSection": {
				useNs("PageLayout", "page-layout");
				const flushSettingsList =
					children.length === 1 &&
					children[0]?.type === "PropertyList" &&
					children[0]?.props?.layout !== "detail";
				const cardClass = flushSettingsList ? "" : ' class="gap-4 p-4"';
				if (p.surface === "card") {
					const innerCard = [
						`${pad(p.title ? depth + 1 : depth)}<PageLayout.Section surface="card"${cardClass}>`,
						...(children.length ? [renderChildren(p.title ? depth + 2 : depth + 1)] : []),
						`${pad(p.title ? depth + 1 : depth)}</PageLayout.Section>`,
					].join("\n");
					if (p.title) {
						return [
							`${pad(depth)}<PageLayout.Section>`,
							`${pad(depth + 1)}<PageLayout.SectionTitle>${escapeText(String(p.title))}</PageLayout.SectionTitle>`,
							innerCard,
							`${pad(depth)}</PageLayout.Section>`,
						].join("\n");
					}
					return innerCard;
				}
				const lines = [`${pad(depth)}<PageLayout.Section>`];
				if (p.title) {
					lines.push(
						`${pad(depth + 1)}<PageLayout.SectionTitle>${escapeText(String(p.title))}</PageLayout.SectionTitle>`
					);
				}
				if (children.length) lines.push(renderChildren());
				lines.push(`${pad(depth)}</PageLayout.Section>`);
				return lines.join("\n");
			}
			case "PropertyList": {
				useNs("PageLayout", "page-layout");
				const listLayout = p.layout === "detail" ? "detail" : "settings";
				const rows = children
					.map((child) =>
						child.type === "PropertyRow"
							? renderPropertyRow(child, depth + 1, listLayout)
							: renderNode(child, depth + 1)
					)
					.join("\n");
				return [
					`${pad(depth)}<PageLayout.PropertyList layout=${quote(listLayout)}>`,
					...(rows ? [rows] : []),
					`${pad(depth)}</PageLayout.PropertyList>`,
				].join("\n");
			}
			case "PropertyRow":
				return renderPropertyRow(n, depth);

			case "Stack": {
				const dir = p.direction === "row" ? "flex-row flex-wrap" : "flex-col";
				const gapCls = GAP[(p.gap as keyof typeof GAP) ?? "md"] ?? GAP.md;
				const alignCls =
					p.direction === "row"
						? (ALIGN[p.align as keyof typeof ALIGN] ?? "items-center")
						: (ALIGN[p.align as keyof typeof ALIGN] ?? "");
				const cls = ["flex", dir, gapCls, alignCls].filter(Boolean).join(" ");
				if (!children.length) return `${pad(depth)}<div class=${quote(cls)}></div>`;
				return `${pad(depth)}<div class=${quote(cls)}>\n${renderChildren()}\n${pad(depth)}</div>`;
			}
			case "Grid": {
				const cols = COLUMNS[(p.columns as keyof typeof COLUMNS) ?? 2] ?? COLUMNS[2];
				const gapCls = GAP[(p.gap as keyof typeof GAP) ?? "md"] ?? GAP.md;
				const cls = `grid ${cols} ${gapCls}`;
				if (!children.length) return `${pad(depth)}<div class=${quote(cls)}></div>`;
				return `${pad(depth)}<div class=${quote(cls)}>\n${renderChildren()}\n${pad(depth)}</div>`;
			}
			case "Heading":
				return p.level === 3
					? `${pad(depth)}<h3 class="text-base font-medium">${escapeText(str(n))}</h3>`
					: `${pad(depth)}<h2 class="text-lg font-semibold">${escapeText(str(n))}</h2>`;
			case "Text":
				return p.tone === "muted"
					? `${pad(depth)}<p class="text-sm text-muted-foreground">${escapeText(str(n))}</p>`
					: `${pad(depth)}<p class="text-sm">${escapeText(str(n))}</p>`;
			case "Separator":
				useNamed("Separator", "separator");
				return `${pad(depth)}<Separator />`;

			case "Button": {
				useNamed("Button", "button");
				const attrs = [
					attr("variant", p.variant),
					attr("size", p.size),
					attr("href", p.href),
					attr("disabled", p.disabled),
				].join("");
				return `${pad(depth)}<Button${attrs}>${escapeText(str(n))}</Button>`;
			}
			case "Badge":
				useNamed("Badge", "badge");
				return `${pad(depth)}<Badge${attr("variant", p.variant)}>${escapeText(str(n))}</Badge>`;
			case "Alert":
				useNs("Alert", "alert");
				return `${pad(depth)}<Alert.Root${attr("variant", p.variant)}>\n${renderChildren()}\n${pad(depth)}</Alert.Root>`;
			case "AlertTitle":
				useNs("Alert", "alert");
				return `${pad(depth)}<Alert.Title>${escapeText(str(n))}</Alert.Title>`;
			case "AlertDescription":
				useNs("Alert", "alert");
				return `${pad(depth)}<Alert.Description>${escapeText(str(n))}</Alert.Description>`;
			case "Progress":
				useNamed("Progress", "progress");
				return `${pad(depth)}<Progress${attr("value", p.value)}${attr("max", p.max ?? 100)}${attr("aria-label", p.label)} />`;
			case "Spinner":
				useNamed("Spinner", "spinner");
				return `${pad(depth)}<Spinner />`;
			case "Kbd":
				useNs("Kbd", "kbd");
				return `${pad(depth)}<Kbd.Root>${escapeText(str(n))}</Kbd.Root>`;
			case "Avatar": {
				useNs("Avatar", "avatar");
				const lines = [`${pad(depth)}<Avatar.Root>`];
				if (typeof p.src === "string" && p.src) {
					lines.push(
						`${pad(depth + 1)}<Avatar.Image${attr("src", p.src)}${attr("alt", p.alt ?? "")} />`
					);
				}
				lines.push(
					`${pad(depth + 1)}<Avatar.Fallback>${escapeText(String(p.fallback ?? ""))}</Avatar.Fallback>`,
					`${pad(depth)}</Avatar.Root>`
				);
				return lines.join("\n");
			}
			case "Empty": {
				useNs("Empty", "empty");
				const lines = [
					`${pad(depth)}<Empty.Root>`,
					`${pad(depth + 1)}<Empty.Header>`,
					`${pad(depth + 2)}<Empty.Title>${escapeText(String(p.title ?? ""))}</Empty.Title>`,
				];
				if (typeof p.description === "string" && p.description) {
					lines.push(
						`${pad(depth + 2)}<Empty.Description>${escapeText(p.description)}</Empty.Description>`
					);
				}
				lines.push(`${pad(depth + 1)}</Empty.Header>`);
				if (children.length) {
					lines.push(
						`${pad(depth + 1)}<Empty.Content>`,
						renderChildren(depth + 2),
						`${pad(depth + 1)}</Empty.Content>`
					);
				}
				lines.push(`${pad(depth)}</Empty.Root>`);
				return lines.join("\n");
			}
			case "Breadcrumb": {
				useNs("Breadcrumb", "breadcrumb");
				const items = Array.isArray(p.items)
					? (p.items as { label: string; href?: string }[])
					: [];
				const lines = [`${pad(depth)}<Breadcrumb.Root>`, `${pad(depth + 1)}<Breadcrumb.List>`];
				items.forEach((item, index) => {
					if (index > 0) lines.push(`${pad(depth + 2)}<Breadcrumb.Separator />`);
					lines.push(`${pad(depth + 2)}<Breadcrumb.Item>`);
					if (item.href && index < items.length - 1) {
						lines.push(
							`${pad(depth + 3)}<Breadcrumb.Link href=${quote(item.href)}>${escapeText(item.label)}</Breadcrumb.Link>`
						);
					} else {
						lines.push(
							`${pad(depth + 3)}<Breadcrumb.Page>${escapeText(item.label)}</Breadcrumb.Page>`
						);
					}
					lines.push(`${pad(depth + 2)}</Breadcrumb.Item>`);
				});
				lines.push(`${pad(depth + 1)}</Breadcrumb.List>`, `${pad(depth)}</Breadcrumb.Root>`);
				return lines.join("\n");
			}

			case "Card":
				useNs("Card", "card");
				return `${pad(depth)}<Card.Root${attr("size", p.size)}>\n${renderChildren()}\n${pad(depth)}</Card.Root>`;
			case "CardHeader":
				useNs("Card", "card");
				return `${pad(depth)}<Card.Header>\n${renderChildren()}\n${pad(depth)}</Card.Header>`;
			case "CardTitle":
				useNs("Card", "card");
				return `${pad(depth)}<Card.Title>${escapeText(str(n))}</Card.Title>`;
			case "CardDescription":
				useNs("Card", "card");
				return `${pad(depth)}<Card.Description>${escapeText(str(n))}</Card.Description>`;
			case "CardAction":
				useNs("Card", "card");
				return `${pad(depth)}<Card.Action>\n${renderChildren()}\n${pad(depth)}</Card.Action>`;
			case "CardContent":
				useNs("Card", "card");
				return `${pad(depth)}<Card.Content class="flex flex-col gap-4">\n${renderChildren()}\n${pad(depth)}</Card.Content>`;
			case "CardFooter":
				useNs("Card", "card");
				return `${pad(depth)}<Card.Footer class="flex-wrap gap-2">\n${renderChildren()}\n${pad(depth)}</Card.Footer>`;

			case "InputField": {
				useNs("Field", "field");
				useNamed("Input", "input");
				const id = nextFieldId();
				const invalid = Boolean(p.error);
				const inputAttrs = [
					attr("id", id),
					p.type && p.type !== "text" ? attr("type", p.type) : "",
					attr("placeholder", p.placeholder),
					attr("value", p.value),
					attr("disabled", p.disabled),
					attr("required", p.required),
					invalid ? ' aria-invalid="true"' : "",
				].join("");
				return [
					`${pad(depth)}<Field.Field${invalid ? ' data-invalid="true"' : ""}>`,
					`${pad(depth + 1)}<Field.Label for=${quote(id)}>${escapeText(String(p.label ?? ""))}</Field.Label>`,
					`${pad(depth + 1)}<Input${inputAttrs} />`,
					...renderNotes(p, depth + 1),
					`${pad(depth)}</Field.Field>`,
				].join("\n");
			}
			case "TextareaField": {
				useNs("Field", "field");
				useNamed("Textarea", "textarea");
				const id = nextFieldId();
				const invalid = Boolean(p.error);
				const taAttrs = [
					attr("id", id),
					attr("placeholder", p.placeholder),
					attr("value", p.value),
					attr("disabled", p.disabled),
					attr("required", p.required),
					invalid ? ' aria-invalid="true"' : "",
				].join("");
				return [
					`${pad(depth)}<Field.Field${invalid ? ' data-invalid="true"' : ""}>`,
					`${pad(depth + 1)}<Field.Label for=${quote(id)}>${escapeText(String(p.label ?? ""))}</Field.Label>`,
					`${pad(depth + 1)}<Textarea${taAttrs} />`,
					...renderNotes(p, depth + 1),
					`${pad(depth)}</Field.Field>`,
				].join("\n");
			}
			case "CheckboxField": {
				useNs("Field", "field");
				useNamed("Checkbox", "checkbox");
				const id = nextFieldId();
				const invalid = Boolean(p.error);
				return [
					`${pad(depth)}<Field.Field orientation="horizontal"${invalid ? ' data-invalid="true"' : ""}>`,
					`${pad(depth + 1)}<Checkbox${attr("id", id)}${attr("checked", p.checked)}${attr("disabled", p.disabled)} />`,
					`${pad(depth + 1)}<Field.Content>`,
					`${pad(depth + 2)}<Field.Label for=${quote(id)}>${escapeText(String(p.label ?? ""))}</Field.Label>`,
					...renderNotes(p, depth + 2),
					`${pad(depth + 1)}</Field.Content>`,
					`${pad(depth)}</Field.Field>`,
				].join("\n");
			}
			case "SwitchField": {
				useNs("Field", "field");
				useNamed("Switch", "switch");
				const id = nextFieldId();
				const invalid = Boolean(p.error);
				return [
					`${pad(depth)}<Field.Field orientation="horizontal"${invalid ? ' data-invalid="true"' : ""}>`,
					`${pad(depth + 1)}<Switch${attr("id", id)}${attr("checked", p.checked)}${attr("disabled", p.disabled)} />`,
					`${pad(depth + 1)}<Field.Content>`,
					`${pad(depth + 2)}<Field.Label for=${quote(id)}>${escapeText(String(p.label ?? ""))}</Field.Label>`,
					...renderNotes(p, depth + 2),
					`${pad(depth + 1)}</Field.Content>`,
					`${pad(depth)}</Field.Field>`,
				].join("\n");
			}
			case "SelectField": {
				useNs("Field", "field");
				useNs("Select", "select");
				const id = nextFieldId();
				const invalid = Boolean(p.error);
				const options = Array.isArray(p.options)
					? (p.options as { value: string; label: string }[])
					: [];
				const stateName = nextVar("selected");
				const optsName = `${stateName}Options`;
				scriptLines.push(`const ${optsName} = ${JSON.stringify(options)};`);
				scriptLines.push(
					`let ${stateName} = $state(${typeof p.value === "string" ? quote(p.value) : '""'});`
				);
				return [
					`${pad(depth)}<Field.Field${invalid ? ' data-invalid="true"' : ""}>`,
					`${pad(depth + 1)}<Field.Label for=${quote(id)}>${escapeText(String(p.label ?? ""))}</Field.Label>`,
					`${pad(depth + 1)}<Select.Root type="single" bind:value={${stateName}} items={${optsName}}${attr("disabled", p.disabled)}>`,
					`${pad(depth + 2)}<Select.Trigger${attr("id", id)}${invalid ? ' aria-invalid="true"' : ""}>`,
					`${pad(depth + 3)}<Select.Value placeholder=${quote(String(p.placeholder ?? "请选择"))} />`,
					`${pad(depth + 2)}</Select.Trigger>`,
					`${pad(depth + 2)}<Select.Content>`,
					`${pad(depth + 3)}{#each ${optsName} as option (option.value)}`,
					`${pad(depth + 4)}<Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>`,
					`${pad(depth + 3)}{/each}`,
					`${pad(depth + 2)}</Select.Content>`,
					`${pad(depth + 1)}</Select.Root>`,
					...renderNotes(p, depth + 1),
					`${pad(depth)}</Field.Field>`,
				].join("\n");
			}
			case "RadioGroupField": {
				useNs("Field", "field");
				useNs("RadioGroup", "radio-group");
				const id = nextFieldId();
				const options = Array.isArray(p.options)
					? (p.options as { value: string; label: string; description?: string }[])
					: [];
				const lines = [
					`${pad(depth)}<Field.Set>`,
					`${pad(depth + 1)}<Field.Legend variant="label">${escapeText(String(p.label ?? ""))}</Field.Legend>`,
				];
				if (typeof p.description === "string" && p.description) {
					lines.push(
						`${pad(depth + 1)}<Field.Description>${escapeText(p.description)}</Field.Description>`
					);
				}
				lines.push(
					`${pad(depth + 1)}<RadioGroup.Root${attr("value", p.value)}${attr("disabled", p.disabled)}>`
				);
				options.forEach((opt, index) => {
					const optId = `${id}-${index}`;
					lines.push(
						`${pad(depth + 2)}<Field.Field orientation="horizontal">`,
						`${pad(depth + 3)}<RadioGroup.Item value=${quote(opt.value)} id=${quote(optId)} />`,
						`${pad(depth + 3)}<Field.Content>`,
						`${pad(depth + 4)}<Field.Label for=${quote(optId)}>${escapeText(opt.label)}</Field.Label>`
					);
					if (opt.description) {
						lines.push(
							`${pad(depth + 4)}<Field.Description>${escapeText(opt.description)}</Field.Description>`
						);
					}
					lines.push(`${pad(depth + 3)}</Field.Content>`, `${pad(depth + 2)}</Field.Field>`);
				});
				lines.push(`${pad(depth + 1)}</RadioGroup.Root>`);
				if (typeof p.error === "string" && p.error) {
					lines.push(`${pad(depth + 1)}<Field.Error>${escapeText(p.error)}</Field.Error>`);
				}
				lines.push(`${pad(depth)}</Field.Set>`);
				return lines.join("\n");
			}
			case "SliderField": {
				useNamed("SliderField", "slider-field");
				const attrs = [
					attr("label", p.label),
					attr("min", p.min),
					attr("max", p.max),
					attr("step", p.step),
					attr("value", p.value),
					attr("unit", p.unit),
				].join("");
				return `${pad(depth)}<SliderField${attrs} />`;
			}
			case "InputOtpField": {
				useNs("Field", "field");
				useNs("InputOTP", "input-otp");
				const id = nextFieldId();
				const len = p.maxlength === 4 ? 4 : 6;
				const stateName = nextVar("otp");
				scriptLines.push(
					`let ${stateName} = $state(${typeof p.value === "string" ? quote(p.value) : '""'});`
				);
				const invalid = Boolean(p.error);
				return [
					`${pad(depth)}<Field.Field${invalid ? ' data-invalid="true"' : ""}>`,
					`${pad(depth + 1)}<Field.Label for=${quote(id)}>${escapeText(String(p.label ?? ""))}</Field.Label>`,
					`${pad(depth + 1)}<InputOTP.Root${attr("id", id)} maxlength={${len}} bind:value={${stateName}}${attr("disabled", p.disabled)}>`,
					`${pad(depth + 2)}{#snippet children({ cells })}`,
					`${pad(depth + 3)}<InputOTP.Group>`,
					`${pad(depth + 4)}{#each cells as cell (cell)}`,
					`${pad(depth + 5)}<InputOTP.Slot {cell} />`,
					`${pad(depth + 4)}{/each}`,
					`${pad(depth + 3)}</InputOTP.Group>`,
					`${pad(depth + 2)}{/snippet}`,
					`${pad(depth + 1)}</InputOTP.Root>`,
					...renderNotes(p, depth + 1),
					`${pad(depth)}</Field.Field>`,
				].join("\n");
			}
			case "NumberField": {
				useNs("Field", "field");
				useNamed("NumberField", "number-field");
				const id = nextFieldId();
				const invalid = Boolean(p.error);
				const attrs = [
					attr("id", id),
					attr("defaultValue", p.defaultValue),
					attr("min", p.min),
					attr("max", p.max),
					attr("step", p.step),
					attr("disabled", p.disabled),
					attr("required", p.required),
				].join("");
				return [
					`${pad(depth)}<Field.Field${invalid ? ' data-invalid="true"' : ""}>`,
					`${pad(depth + 1)}<Field.Label for=${quote(id)}>${escapeText(String(p.label ?? ""))}</Field.Label>`,
					`${pad(depth + 1)}<NumberField${attrs} />`,
					...renderNotes(p, depth + 1),
					`${pad(depth)}</Field.Field>`,
				].join("\n");
			}
			case "TagsInputField": {
				useNs("Field", "field");
				useNamed("TagsInput", "tags-input");
				const id = nextFieldId();
				const invalid = Boolean(p.error);
				const defaultVal = Array.isArray(p.defaultValue)
					? ` defaultValue={${JSON.stringify(p.defaultValue)}}`
					: "";
				const attrs = [
					attr("id", id),
					defaultVal,
					attr("placeholder", p.placeholder),
					attr("max", p.max),
					attr("disabled", p.disabled),
				].join("");
				return [
					`${pad(depth)}<Field.Field${invalid ? ' data-invalid="true"' : ""}>`,
					`${pad(depth + 1)}<Field.Label for=${quote(id)}>${escapeText(String(p.label ?? ""))}</Field.Label>`,
					`${pad(depth + 1)}<TagsInput${attrs} />`,
					...renderNotes(p, depth + 1),
					`${pad(depth)}</Field.Field>`,
				].join("\n");
			}
			case "DatePickerField": {
				useNs("Field", "field");
				useNamed("DatePicker", "date-picker");
				const invalid = Boolean(p.error);
				return [
					`${pad(depth)}<Field.Field${invalid ? ' data-invalid="true"' : ""}>`,
					`${pad(depth + 1)}<Field.Label>${escapeText(String(p.label ?? ""))}</Field.Label>`,
					`${pad(depth + 1)}<DatePicker${attr("label", p.label)}${attr("placeholder", p.placeholder ?? p.label)} locale="zh-CN" />`,
					...renderNotes(p, depth + 1),
					`${pad(depth)}</Field.Field>`,
				].join("\n");
			}
			case "ComboboxField": {
				useNs("Field", "field");
				useNamed("Combobox", "combobox");
				const invalid = Boolean(p.error);
				const options = Array.isArray(p.options)
					? (p.options as { id: string; label: string }[])
					: [];
				const stateName = nextVar("combo");
				const optsName = `${stateName}Options`;
				scriptLines.push(`const ${optsName} = ${JSON.stringify(options)};`);
				scriptLines.push(`let ${stateName} = $state<string[]>([]);`);
				return [
					`${pad(depth)}<Field.Field${invalid ? ' data-invalid="true"' : ""}>`,
					`${pad(depth + 1)}<Field.Label>${escapeText(String(p.label ?? ""))}</Field.Label>`,
					`${pad(depth + 1)}<Combobox${attr("label", p.label)}${attr("placeholder", p.placeholder ?? "搜索并选择…")} options={${optsName}}${attr("multiple", p.multiple)}${attr("disabled", p.disabled)} value={${stateName}} onSelect={(id) => (${stateName} = ${p.multiple ? `${stateName}.includes(id) ? ${stateName}.filter((item) => item !== id) : [...${stateName}, id]` : `[id]`})} />`,
					...renderNotes(p, depth + 1),
					`${pad(depth)}</Field.Field>`,
				].join("\n");
			}

			case "Table": {
				useNs("Table", "table");
				const columns = Array.isArray(p.columns)
					? (p.columns as { key: string; label: string; align?: "start" | "end" }[])
					: [];
				const rows = Array.isArray(p.rows) ? (p.rows as Record<string, unknown>[]) : [];
				const lines = [`${pad(depth)}<Table.Root>`];
				if (typeof p.caption === "string" && p.caption) {
					lines.push(`${pad(depth + 1)}<Table.Caption>${escapeText(p.caption)}</Table.Caption>`);
				}
				lines.push(`${pad(depth + 1)}<Table.Header>`, `${pad(depth + 2)}<Table.Row>`);
				for (const col of columns) {
					const cls = col.align === "end" ? ' class="text-end"' : "";
					lines.push(`${pad(depth + 3)}<Table.Head${cls}>${escapeText(col.label)}</Table.Head>`);
				}
				lines.push(
					`${pad(depth + 2)}</Table.Row>`,
					`${pad(depth + 1)}</Table.Header>`,
					`${pad(depth + 1)}<Table.Body>`
				);
				for (const row of rows) {
					lines.push(`${pad(depth + 2)}<Table.Row>`);
					for (const col of columns) {
						const cls = col.align === "end" ? ' class="text-end tabular-nums"' : "";
						lines.push(
							`${pad(depth + 3)}<Table.Cell${cls}>${escapeText(String(row[col.key] ?? ""))}</Table.Cell>`
						);
					}
					lines.push(`${pad(depth + 2)}</Table.Row>`);
				}
				lines.push(`${pad(depth + 1)}</Table.Body>`, `${pad(depth)}</Table.Root>`);
				return lines.join("\n");
			}
			case "Tabs": {
				useNs("Tabs", "tabs");
				const panels = children.filter((child) => child.type === "TabPanel");
				const defaultVal =
					typeof p.defaultValue === "string"
						? p.defaultValue
						: String(panels[0]?.props?.value ?? "");
				const lines = [
					`${pad(depth)}<Tabs.Root value=${quote(defaultVal)}>`,
					`${pad(depth + 1)}<Tabs.List>`,
				];
				for (const panel of panels) {
					const pp = P(panel);
					lines.push(
						`${pad(depth + 2)}<Tabs.Trigger value=${quote(String(pp.value ?? ""))}>${escapeText(String(pp.label ?? ""))}</Tabs.Trigger>`
					);
				}
				lines.push(`${pad(depth + 1)}</Tabs.List>`);
				for (const panel of panels) {
					const pp = P(panel);
					const panelChildren = list(panel);
					lines.push(
						`${pad(depth + 1)}<Tabs.Content value=${quote(String(pp.value ?? ""))}>`,
						`${pad(depth + 2)}<div class="flex flex-col gap-4 pt-2">`
					);
					if (panelChildren.length) {
						lines.push(panelChildren.map((c) => renderNode(c, depth + 3)).join("\n"));
					}
					lines.push(`${pad(depth + 2)}</div>`, `${pad(depth + 1)}</Tabs.Content>`);
				}
				lines.push(`${pad(depth)}</Tabs.Root>`);
				return lines.join("\n");
			}
			case "TabPanel": {
				useNs("Tabs", "tabs");
				const val = String(p.value ?? "tab");
				return [
					`${pad(depth)}<Tabs.Content value=${quote(val)}>`,
					`${pad(depth + 1)}<div class="flex flex-col gap-4 pt-2">`,
					...(children.length ? [renderChildren(depth + 2)] : []),
					`${pad(depth + 1)}</div>`,
					`${pad(depth)}</Tabs.Content>`,
				].join("\n");
			}
			case "Accordion": {
				useNs("Accordion", "accordion");
				const accType = p.type === "multiple" ? "multiple" : "single";
				const lines = [`${pad(depth)}<Accordion.Root type=${quote(accType)}>`];
				children.forEach((item, index) => {
					const ip = P(item);
					const itemChildren = list(item);
					lines.push(
						`${pad(depth + 1)}<Accordion.Item value=${quote(`item-${index}`)}>`,
						`${pad(depth + 2)}<Accordion.Trigger>${escapeText(String(ip.title ?? ""))}</Accordion.Trigger>`,
						`${pad(depth + 2)}<Accordion.Content>`,
						`${pad(depth + 3)}<div class="flex flex-col gap-4">`
					);
					if (itemChildren.length) {
						lines.push(itemChildren.map((c) => renderNode(c, depth + 4)).join("\n"));
					}
					lines.push(
						`${pad(depth + 3)}</div>`,
						`${pad(depth + 2)}</Accordion.Content>`,
						`${pad(depth + 1)}</Accordion.Item>`
					);
				});
				lines.push(`${pad(depth)}</Accordion.Root>`);
				return lines.join("\n");
			}
			case "AccordionItem": {
				useNs("Accordion", "accordion");
				return [
					`${pad(depth)}<Accordion.Item value="item-0">`,
					`${pad(depth + 1)}<Accordion.Trigger>${escapeText(String(p.title ?? ""))}</Accordion.Trigger>`,
					`${pad(depth + 1)}<Accordion.Content>`,
					`${pad(depth + 2)}<div class="flex flex-col gap-4">`,
					...(children.length ? [renderChildren(depth + 3)] : []),
					`${pad(depth + 2)}</div>`,
					`${pad(depth + 1)}</Accordion.Content>`,
					`${pad(depth)}</Accordion.Item>`,
				].join("\n");
			}
			case "Dialog": {
				useNs("Dialog", "dialog");
				useNamed("Button", "button");
				const triggerVariant = String(p.triggerVariant ?? "outline");
				const triggerSize = String(p.triggerSize ?? "sm");
				const lines = [
					`${pad(depth)}<Dialog.Root>`,
					`${pad(depth + 1)}<Dialog.Trigger>`,
					`${pad(depth + 2)}{#snippet child({ props })}`,
					`${pad(depth + 3)}<Button {...props} variant=${quote(triggerVariant)} size=${quote(triggerSize)}>${escapeText(String(p.triggerLabel ?? ""))}</Button>`,
					`${pad(depth + 2)}{/snippet}`,
					`${pad(depth + 1)}</Dialog.Trigger>`,
					`${pad(depth + 1)}<Dialog.Content>`,
					`${pad(depth + 2)}<Dialog.Header>`,
					`${pad(depth + 3)}<Dialog.Title>${escapeText(String(p.title ?? ""))}</Dialog.Title>`,
				];
				if (typeof p.description === "string" && p.description) {
					lines.push(
						`${pad(depth + 3)}<Dialog.Description>${escapeText(p.description)}</Dialog.Description>`
					);
				}
				lines.push(`${pad(depth + 2)}</Dialog.Header>`);
				if (children.length) {
					lines.push(
						`${pad(depth + 2)}<div class="flex flex-col gap-4">`,
						renderChildren(depth + 3),
						`${pad(depth + 2)}</div>`
					);
				}
				lines.push(`${pad(depth + 1)}</Dialog.Content>`, `${pad(depth)}</Dialog.Root>`);
				return lines.join("\n");
			}
			case "AlertDialog": {
				useNs("AlertDialog", "alert-dialog");
				useNamed("Button", "button");
				const isDestructive = p.destructive !== false;
				const triggerVariant = String(p.triggerVariant ?? (isDestructive ? "destructive" : "outline"));
				const appearance = isDestructive ? "danger" : "confirmation";
				const actionVariant = isDestructive ? ' variant="destructive"' : "";
				return [
					`${pad(depth)}<AlertDialog.Root>`,
					`${pad(depth + 1)}<AlertDialog.Trigger>`,
					`${pad(depth + 2)}{#snippet child({ props })}`,
					`${pad(depth + 3)}<Button {...props} variant=${quote(triggerVariant)} size="sm">${escapeText(String(p.triggerLabel ?? ""))}</Button>`,
					`${pad(depth + 2)}{/snippet}`,
					`${pad(depth + 1)}</AlertDialog.Trigger>`,
					`${pad(depth + 1)}<AlertDialog.Content appearance=${quote(appearance)} focusCancel>`,
					`${pad(depth + 2)}<AlertDialog.Header>`,
					`${pad(depth + 3)}<AlertDialog.Title>${escapeText(String(p.title ?? ""))}</AlertDialog.Title>`,
					`${pad(depth + 3)}<AlertDialog.Description>${escapeText(String(p.description ?? ""))}</AlertDialog.Description>`,
					`${pad(depth + 2)}</AlertDialog.Header>`,
					`${pad(depth + 2)}<AlertDialog.Footer>`,
					`${pad(depth + 3)}<AlertDialog.Cancel>${escapeText(String(p.cancelLabel ?? "取消"))}</AlertDialog.Cancel>`,
					`${pad(depth + 3)}<AlertDialog.Action${actionVariant}>${escapeText(String(p.confirmLabel ?? ""))}</AlertDialog.Action>`,
					`${pad(depth + 2)}</AlertDialog.Footer>`,
					`${pad(depth + 1)}</AlertDialog.Content>`,
					`${pad(depth)}</AlertDialog.Root>`,
				].join("\n");
			}
			case "Sheet": {
				useNs("Sheet", "sheet");
				useNamed("Button", "button");
				const triggerVariant = String(p.triggerVariant ?? "outline");
				const side = String(p.side ?? "right");
				const lines = [
					`${pad(depth)}<Sheet.Root>`,
					`${pad(depth + 1)}<Sheet.Trigger>`,
					`${pad(depth + 2)}{#snippet child({ props })}`,
					`${pad(depth + 3)}<Button {...props} variant=${quote(triggerVariant)} size="sm">${escapeText(String(p.triggerLabel ?? ""))}</Button>`,
					`${pad(depth + 2)}{/snippet}`,
					`${pad(depth + 1)}</Sheet.Trigger>`,
					`${pad(depth + 1)}<Sheet.Content side=${quote(side)}>`,
					`${pad(depth + 2)}<Sheet.Header>`,
					`${pad(depth + 3)}<Sheet.Title>${escapeText(String(p.title ?? ""))}</Sheet.Title>`,
				];
				if (typeof p.description === "string" && p.description) {
					lines.push(
						`${pad(depth + 3)}<Sheet.Description>${escapeText(p.description)}</Sheet.Description>`
					);
				}
				lines.push(`${pad(depth + 2)}</Sheet.Header>`);
				if (children.length) {
					lines.push(
						`${pad(depth + 2)}<div class="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">`,
						renderChildren(depth + 3),
						`${pad(depth + 2)}</div>`
					);
				}
				lines.push(`${pad(depth + 1)}</Sheet.Content>`, `${pad(depth)}</Sheet.Root>`);
				return lines.join("\n");
			}
			case "ItemList": {
				useNs("Item", "item");
				return [
					`${pad(depth)}<Item.Group${attr("aria-label", p.label)} class="divide-y-[0.5px] divide-border border-y-[0.5px] border-border">`,
					...(children.length ? [renderChildren()] : []),
					`${pad(depth)}</Item.Group>`,
				].join("\n");
			}
			case "ItemRow": {
				useNs("Item", "item");
				const lines = [
					`${pad(depth)}<div role="listitem">`,
					`${pad(depth + 1)}<Item.Root size="sm"${p.disabled ? ' aria-disabled="true"' : ""}>`,
					`${pad(depth + 2)}<Item.Content>`,
					`${pad(depth + 3)}<div class="flex min-w-0 items-center gap-2">`,
				];
				if (typeof p.meta === "string" && p.meta) {
					lines.push(
						`${pad(depth + 4)}<span class="shrink-0 text-xs tabular-nums text-muted-foreground">${escapeText(p.meta)}</span>`
					);
				}
				lines.push(
					`${pad(depth + 4)}<Item.Title class="truncate">${escapeText(String(p.title ?? ""))}</Item.Title>`,
					`${pad(depth + 3)}</div>`
				);
				if (typeof p.description === "string" && p.description) {
					lines.push(
						`${pad(depth + 3)}<Item.Description>${escapeText(p.description)}</Item.Description>`
					);
				}
				lines.push(`${pad(depth + 2)}</Item.Content>`);
				if (children.length) {
					lines.push(
						`${pad(depth + 2)}<Item.Actions>`,
						renderChildren(depth + 3),
						`${pad(depth + 2)}</Item.Actions>`
					);
				}
				lines.push(`${pad(depth + 1)}</Item.Root>`, `${pad(depth)}</div>`);
				return lines.join("\n");
			}
			case "Gauge": {
				useNamed("Gauge", "gauge");
				const value = Number(p.value ?? 0);
				const tone = String(p.tone ?? (value > 100 ? "danger" : "accent"));
				const valueText = String(p.valueText ?? `已使用 ${Math.round(value)}%`);
				return [
					`${pad(depth)}<div class="flex flex-wrap items-center gap-3">`,
					`${pad(depth + 1)}<Gauge value={${value}} label=${quote(String(p.label ?? ""))} valueText=${quote(valueText)} tone=${quote(tone)} class="w-20 shrink-0" />`,
					`${pad(depth + 1)}<div class="flex min-w-0 flex-col gap-0.5">`,
					`${pad(depth + 2)}<span class="text-sm font-medium text-foreground">${escapeText(String(p.label ?? ""))}</span>`,
					`${pad(depth + 2)}<span class="text-xs tabular-nums text-muted-foreground">${escapeText(valueText)}</span>`,
					`${pad(depth + 1)}</div>`,
					`${pad(depth)}</div>`,
				].join("\n");
			}
			case "Sparkline": {
				useNamed("StaticSparkline", "sparkline");
				const seriesName = nextVar("series");
				scriptLines.push(`const ${seriesName} = ${JSON.stringify(p.values ?? [])};`);
				const lines = [
					`${pad(depth)}<div class="flex items-center gap-3">`,
					`${pad(depth + 1)}<StaticSparkline values={${seriesName}} width="96" height="40" class="shrink-0" />`,
					`${pad(depth + 1)}<div class="flex min-w-0 flex-col gap-0.5">`,
					`${pad(depth + 2)}<span class="text-xs text-muted-foreground">${escapeText(String(p.label ?? ""))}</span>`,
				];
				if (typeof p.value === "string" && p.value) {
					lines.push(
						`${pad(depth + 2)}<span class="text-sm font-medium tabular-nums text-foreground">${escapeText(p.value)}</span>`
					);
				}
				lines.push(`${pad(depth + 1)}</div>`, `${pad(depth)}</div>`);
				return lines.join("\n");
			}
			case "Skeleton": {
				useNamed("Skeleton", "skeleton");
				const variant = String(p.variant ?? "row");
				const lineCount = Number(p.lines ?? (variant === "card" ? 1 : 3));
				if (variant === "card") {
					return [
						`${pad(depth)}<div class="flex flex-col gap-3 rounded-lg border-[0.5px] border-border p-4">`,
						`${pad(depth + 1)}<Skeleton class="h-4 w-1/3" />`,
						`${pad(depth + 1)}<Skeleton class="h-8 w-1/2" />`,
						`${pad(depth + 1)}<Skeleton class="h-3 w-2/3" />`,
						`${pad(depth)}</div>`,
					].join("\n");
				}
				if (variant === "text") {
					const rows = Array.from({ length: lineCount }, (_, idx) =>
						`${pad(depth + 1)}<Skeleton class=${quote(idx === lineCount - 1 ? "h-4 w-2/3" : "h-4 w-full")} />`
					);
					return [`${pad(depth)}<div class="flex flex-col gap-2">`, ...rows, `${pad(depth)}</div>`].join("\n");
				}
				const rows = Array.from(
					{ length: lineCount },
					() => `${pad(depth + 1)}<Skeleton class="h-10 w-full rounded-md" />`
				);
				return [`${pad(depth)}<div class="flex flex-col gap-2.5">`, ...rows, `${pad(depth)}</div>`].join("\n");
			}
			case "Stepper": {
				useNamed("Stepper", "stepper");
				const stepsName = nextVar("steps");
				scriptLines.push(`const ${stepsName} = ${JSON.stringify(p.steps ?? [])};`);
				return `${pad(depth)}<Stepper steps={${stepsName}}${attr("orientation", p.orientation)} />`;
			}
			case "ToggleGroup": {
				useNs("ToggleGroup", "toggle-group");
				const options = Array.isArray(p.options)
					? (p.options as { value: string; label: string }[])
					: [];
				const defaultVal =
					typeof p.defaultValue === "string" ? p.defaultValue : String(options[0]?.value ?? "");
				const lines = [
					`${pad(depth)}<ToggleGroup.Root type="single" variant="outline" value=${quote(defaultVal)}${attr("aria-label", p.label)}>`,
				];
				for (const opt of options) {
					lines.push(
						`${pad(depth + 1)}<ToggleGroup.Item value=${quote(opt.value)}>${escapeText(opt.label)}</ToggleGroup.Item>`
					);
				}
				lines.push(`${pad(depth)}</ToggleGroup.Root>`);
				return lines.join("\n");
			}
			default:
				return `${pad(depth)}<!-- ${escapeText(n.type)} -->`;
		}
	};

	const markup = renderNode(root, 0);

	const importLines: string[] = [
		...[...namespaceImports.entries()]
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([alias, path]) => `\timport * as ${alias} from "${path}";`),
		...[...namedImports.entries()]
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([path, symbols]) => `\timport { ${[...symbols].sort().join(", ")} } from "${path}";`),
	];

	const scriptParts: string[] = [];
	if (importLines.length) scriptParts.push(importLines.join("\n"));
	if (scriptLines.length) {
		scriptParts.push(scriptLines.map((line) => `\t${line}`).join("\n"));
	}

	const code = scriptParts.length
		? `<script lang="ts">\n${scriptParts.join("\n\n")}\n</script>\n\n${markup}\n`
		: `${markup}\n`;

	const components = usedComponentSlugs(root);
	const installCommand = components.length ? `pnpm exec valar-svelte add ${components.join(" ")}` : "";
	return { code, installCommand, components };
}
