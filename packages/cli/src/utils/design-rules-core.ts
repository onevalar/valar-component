// Pure parts of the design rules (no Node APIs), so the docs site can reuse them in its assistant.

export const GLOBAL_RULES = `- 搭页面前先读 Valar 技能包里的设计方法（页面组合、界面文案、动效与反馈），并优先检索页面骨架配方（MCP \`search_patterns\` / \`get_pattern\`）；选单个组件前查说明卡里的“何时用／何时不用”（MCP \`search_components\` / \`get_component\`，或 \`llms-small.txt\` / \`catalog.json\`）。
- 颜色只用语义 token 类（如 \`bg-primary\`、\`text-muted-foreground\`、\`border-border\`），严禁用调色板色值、黑白或十六进制（\`valar/semantic-color\`）。
- 圆角、字号、间距用全局 token 档位，不写 \`h-[37px]\` 这类像素任意值（\`valar/no-arbitrary-px\`）。
- 动效优先保留组件默认过渡；需显式指定时仅用 \`duration-fast／normal／slow\` 与 \`ease-enter／exit／standard\`（\`valar/motion-token\`）。
- 图片必须提供 \`alt\`，纯装饰写 \`alt=""\`（\`valar/image-alt\`）。
- 优先复用已安装组件及其内置 \`variant\` / \`size\`；缺组件用 CLI 安装，不要手写相似控件。
- 完成后运行 \`pnpm exec valar-svelte lint\`，修掉所有 error 再交付。`;

export type LintFinding = {
	file: string;
	line: number;
	rule: string;
	severity: "error" | "warning";
	message: string;
};

const PALETTE =
	"slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const COLOR_UTILITIES =
	"bg|text|border|ring|outline|fill|stroke|from|via|to|decoration|divide|placeholder|caret|accent|shadow";
const RAW_COLOR = new RegExp(
	`(?<![\\w-])(?:[\\w-]+:)*(?:${COLOR_UTILITIES})-(?:(?:${PALETTE})-\\d{2,3}|black|white|\\[#[\\da-fA-F]{3,8}\\])(?:\\/\\d+)?(?![\\w-])`,
	"g"
);
const ARBITRARY_PX =
	/(?<![\w-])(?:[\w-]+:)*(?:min-|max-)?(?:h|w|size|p[xytrbl]?|m[xytrbl]?|gap|rounded|text|leading)-\[\d+(?:\.\d+)?px\](?![\w-])/g;
// Motion uses the global tiers (`duration-fast|normal|slow`, `ease-enter|exit|standard`).
const MOTION_LITERAL =
	/(?<![\w-])(?:[\w-]+:)*(?:duration-(?:\d+|\[[^\]\s]+\])|ease-(?:in|out|in-out|\[[^\]\s]+\]))(?![\w-])/g;
const BUTTON_LAYOUT = /^(?:[\w-]+:)*-?(?:min-h|h|px|py|size|rounded)(?:-|$)/;
// A red border or ring set directly instead of through `aria-invalid`.
const INVALID_CLASS = /^(?:[\w-]+:)*(?:border|ring|outline)-destructive(?:\/\d+)?$/;
const CHART_LITERAL_COLOR = /\bcolor\s*:\s*["'`](?:#[\da-fA-F]{3,8}|rgba?\(|hsla?\(|oklch\()/g;
const HAS_LABEL = /\s(?:aria-label|aria-labelledby)\s*=|\{\.\.\./;
const ROUNDED_TOKEN = /^(?:[\w-]+:)*rounded(?:-(?!none\b)[\w[\]-]+)?$/;
const SIDE_ACCENT_BORDER =
	/^(?:[\w-]+:)*border-[lrtbse]-(?:[248]|\[[2-9]\d*px\]|primary|destructive|warning|info|success|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3})(?:\/\d+)?$/;
const HOVER_LIFT_TOKEN = /^(?:group-)?hover:(?:-?translate-y-|scale-)/;
const REDUNDANT_PLACEHOLDER = /\splaceholder\s*=\s*(?:"请输入[^"]*"|'请输入[^']*')/g;
const NON_PRIMARY_VARIANT = /\svariant\s*=\s*["'](?!default["'])/;

/** The two ways a component part is written: `Dialog.Content` (namespace import) or `DialogContent`. */
const part = (ns: string, name: string) => [`${ns}.${name}`, `${ns}${name}`];

// Form controls whose label comes from `Field.Label for={id}` or aria-label (`valar/input-label`).
const LABELLED_CONTROLS = [
	"Input",
	"Textarea",
	...part("InputGroup", "Input"),
	...part("InputGroup", "Textarea"),
	"NumberField",
	"TagsInput",
	...part("Select", "Trigger"),
	"NativeSelect",
	...part("NativeSelect", "Root"),
	"Checkbox",
	"Switch",
	...part("RadioGroup", "Item"),
];
// Components that take Button's `size` (`valar/button-size-via-prop`).
const BUTTON_LIKE = [
	"Button",
	...part("AlertDialog", "Action"),
	...part("AlertDialog", "Cancel"),
	...part("InputGroup", "Button"),
	...part("Attachment", "Action"),
];
// Bits UI / Vaul triggers that render their own <button> (`valar/trigger-child-snippet`).
const BUTTON_TRIGGERS = [
	"Dialog",
	"AlertDialog",
	"Sheet",
	"Drawer",
	"Popover",
	"Tooltip",
	"DropdownMenu",
	"Menubar",
	"Collapsible",
	"NavigationMenu",
	"Accordion",
	"Tabs",
	"Select",
].flatMap((ns) => part(ns, "Trigger"));
const NATIVE_FORM: Record<string, string> = {
	input: "Input（复选、单选、范围、颜色分别用 Checkbox、RadioGroup、Slider、ColorPicker）",
	textarea: "Textarea",
	select: "NativeSelect 或 Select",
};

/** Returns the source of each `<Tag ...>` opening tag, skipping `>` inside quotes and `{}`. */
function openingTags(source: string, tag: string): { text: string; index: number }[] {
	const result: { text: string; index: number }[] = [];
	const pattern = new RegExp(`<${tag.replace(".", "\\.")}(?=[\\s/>])`, "g");
	for (const match of source.matchAll(pattern)) {
		let depth = 0;
		let quote = "";
		let i = match.index + match[0].length;
		for (; i < source.length; i++) {
			const char = source[i]!;
			if (quote) {
				if (char === quote) quote = "";
			} else if (char === '"' || char === "'" || char === "`") quote = char;
			else if (char === "{") depth++;
			else if (char === "}") depth--;
			else if (char === ">" && depth === 0) break;
		}
		result.push({ text: source.slice(match.index, i + 1), index: match.index });
	}
	return result;
}

/** The markup between an opening tag and its matching `</Tag>`; empty for `<Tag />`. */
function elementBody(source: string, tag: string, opening: { text: string; index: number }) {
	if (opening.text.endsWith("/>")) return "";
	const start = opening.index + opening.text.length;
	const pattern = new RegExp(`<(/?)${tag.replace(".", "\\.")}(?=[\\s/>])`, "g");
	pattern.lastIndex = start;
	let depth = 1;
	for (const match of source.matchAll(pattern)) {
		if (match.index < start) continue;
		depth += match[1] ? -1 : 1;
		if (depth === 0) return source.slice(start, match.index);
	}
	return source.slice(start);
}

function classTokens(tag: string): string[] {
	const match = /\sclass\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^}]*)\})/.exec(tag);
	const value = match?.[1] ?? match?.[2] ?? match?.[3] ?? "";
	return value.match(/[^\s"'`,()[\]{}]+(?:\[[^\]]*\])?/g) ?? [];
}

/** Checks one file's source. `file` is only used in the findings. */
export function lintSource(file: string, source: string): LintFinding[] {
	const findings: LintFinding[] = [];
	const lineOf = (index: number) => source.slice(0, index).split("\n").length;
	const add = (index: number, rule: string, severity: LintFinding["severity"], message: string) =>
		findings.push({ file, line: lineOf(index), rule, severity, message });

	for (const match of source.matchAll(RAW_COLOR))
		add(
			match.index,
			"valar/semantic-color",
			"error",
			`\`${match[0]}\` 不是语义颜色 token，改用 bg-primary、text-muted-foreground 等`
		);
	for (const match of source.matchAll(ARBITRARY_PX))
		add(
			match.index,
			"valar/no-arbitrary-px",
			"warning",
			`\`${match[0]}\` 是像素任意值，改用对应档位以跟随全局 token`
		);

	for (const match of source.matchAll(MOTION_LITERAL))
		add(
			match.index,
			"valar/motion-token",
			"warning",
			`\`${match[0]}\` 写死了时长或曲线，改用 duration-fast／normal／slow、ease-enter／exit／standard 以跟随全局动效 token`
		);

	// Chart configs are often plain objects in .ts files, so this runs before the markup rules.
	if (/\bChartConfig\b|<Chart\.?Container\b/.test(source))
		for (const match of source.matchAll(CHART_LITERAL_COLOR))
			add(
				match.index,
				"valar/chart-color-token",
				"warning",
				"图表颜色写成了固定色值，改用 var(--chart-1)～var(--chart-5) 等主题 token"
			);

	const sorted = () => findings.sort((a, b) => a.line - b.line);
	if (!file.endsWith(".svelte")) return sorted();
	const tags = (names: string[]) =>
		names.flatMap((name) => openingTags(source, name).map((tag) => ({ name, ...tag })));
	const present = (names: string[]) => tags(names).length > 0;

	for (const tag of tags(BUTTON_LIKE)) {
		const layout = classTokens(tag.text).filter((token) => BUTTON_LAYOUT.test(token));
		if (layout.length)
			add(
				tag.index,
				"valar/button-size-via-prop",
				"error",
				`${tag.name} 的尺寸或圆角 \`${layout.join(" ")}\` 应改用 size 属性或写回组件参数`
			);
		// Attachment.Action defaults to an icon size, so it needs a name unless given a text size.
		const iconOnly = tag.name.startsWith("Attachment")
			? !/\ssize\s*=\s*["'](?!icon)/.test(tag.text)
			: /\ssize\s*=\s*["']icon/.test(tag.text);
		if (iconOnly && !HAS_LABEL.test(tag.text))
			add(tag.index, "valar/icon-button-label", "error", `只有图标的 ${tag.name} 需要 aria-label`);
	}
	for (const tag of tags(part("Attachment", "Trigger")))
		if (!HAS_LABEL.test(tag.text))
			add(
				tag.index,
				"valar/icon-button-label",
				"error",
				`${tag.name} 覆盖整张卡片且没有文字，需要 aria-label 说明点击后做什么`
			);
	for (const tag of openingTags(source, "button"))
		add(tag.index, "valar/use-button-component", "warning", "原生 <button> 改用 Button 组件");
	for (const [name, replacement] of Object.entries(NATIVE_FORM))
		for (const tag of openingTags(source, name))
			if (!/\stype\s*=\s*["']hidden["']/.test(tag.text))
				add(tag.index, "valar/use-form-component", "warning", `原生 <${name}> 改用 ${replacement}`);

	for (const tag of tags(LABELLED_CONTROLS)) {
		if (!/\s(?:id|aria-label|aria-labelledby)\s*=|\s\{id\}|\{\.\.\./.test(tag.text))
			add(
				tag.index,
				"valar/input-label",
				"warning",
				`${tag.name} 需要通过 id 与 Field.Label 关联，或提供 aria-label`
			);
		const invalid = classTokens(tag.text).filter(
			(token) => INVALID_CLASS.test(token) && !token.includes("aria-invalid:")
		);
		if (invalid.length)
			add(
				tag.index,
				"valar/invalid-via-aria",
				"warning",
				`${tag.name} 的错误样式 \`${invalid.join(" ")}\` 改用 aria-invalid="true"，组件已按它显示错误状态`
			);
	}
	// Slider thumbs are spans, which `<label for>` cannot name.
	for (const tag of openingTags(source, "Slider"))
		if (!/\s(?:aria-label|aria-labelledby|thumbLabels)\s*=|\{\.\.\./.test(tag.text))
			add(
				tag.index,
				"valar/input-label",
				"warning",
				"Slider 需要 aria-label、aria-labelledby 或 thumbLabels；Label 的 for 无法关联滑块"
			);

	for (const ns of ["Dialog", "AlertDialog", "Sheet", "Drawer"]) {
		const contents = tags(part(ns, "Content"));
		if (!contents.length) continue;
		if (!present(part(ns, "Title")))
			for (const tag of contents.filter((tag) => !HAS_LABEL.test(tag.text)))
				add(
					tag.index,
					"valar/overlay-title",
					"error",
					`${tag.name} 需要 ${ns}.Title（可加 class="sr-only" 隐藏）作为读屏器读出的名称`
				);
		if (ns === "AlertDialog" && !present(part(ns, "Cancel")))
			add(
				contents[0]!.index,
				"valar/alert-dialog-cancel",
				"warning",
				"AlertDialog 需要 AlertDialog.Cancel：点击遮罩不会关闭，用户必须有取消的出路"
			);
	}
	for (const tag of tags(BUTTON_TRIGGERS)) {
		const body = elementBody(source, tag.name, tag);
		if (/<(?:Button|button|a)(?=[\s/>])/.test(body) && !/\{#snippet child\b/.test(body))
			add(
				tag.index,
				"valar/trigger-child-snippet",
				"error",
				`${tag.name} 本身就是 <button>，里面再放按钮或链接会嵌套交互元素；改用 {#snippet child({ props })} 把 props 传给 Button`
			);
	}
	for (const tag of tags(part("Tooltip", "Content")))
		if (
			/<(?:Button|button|a|Input|input|Select\.Trigger)(?=[\s/>])/.test(
				elementBody(source, tag.name, tag)
			)
		)
			add(
				tag.index,
				"valar/tooltip-no-interactive",
				"warning",
				"Tooltip 内容无法聚焦和点击，可操作的内容改用 Popover"
			);
	for (const tag of tags(["img", ...part("Avatar", "Image")]))
		if (!/\salt\s*=|\s\{alt\}|\{\.\.\./.test(tag.text))
			add(tag.index, "valar/image-alt", "error", `${tag.name} 需要 alt；纯装饰的图片写 alt=""`);

	// Aesthetic & anti-AI-slop guardrails (from maintainer-approved Valar guides).
	for (const tag of tags(part("Card", "Root").concat("Card"))) {
		const body = elementBody(source, tag.name, tag);
		if (/<Card(?:\.Root)?(?=[\s/>])/.test(body))
			add(
				tag.index,
				"valar/no-nested-card",
				"error",
				"禁止卡片套卡片：内层区块改用留白间距或 Separator 分隔"
			);
	}
	for (const match of source.matchAll(/<[A-Za-z][\w.]*(?:[^>"'{}]|"[^"]*"|'[^']*'|\{[^}]*\})*>/g)) {
		const tokens = classTokens(match[0]);
		if (!tokens.length) continue;
		const sideBorder = tokens.find((t) => SIDE_ACCENT_BORDER.test(t));
		if (sideBorder && tokens.some((t) => ROUNDED_TOKEN.test(t)))
			add(
				match.index,
				"valar/no-accent-side-border",
				"error",
				`禁止在圆角矩形中使用单侧高亮边框 \`${sideBorder}\` 作强调或装饰，改用均匀 0.5px 边框或间距/语义底色`
			);
		const hoverLift = tokens.find((t) => HOVER_LIFT_TOKEN.test(t));
		if (hoverLift)
			add(
				match.index,
				"valar/no-hover-lift",
				"warning",
				`避免给普通元素加悬停位移或缩放 \`${hoverLift}\`，悬停仅用轻微底色或描边变化`
			);
	}
	for (const match of source.matchAll(REDUNDANT_PLACEHOLDER))
		add(
			match.index,
			"valar/no-redundant-placeholder",
			"warning",
			"占位符避免写“请输入…”重复废话，改为直接给格式示例（如 name@company.com）"
		);
	const OVERLAY_CONTENT_TAGS = ["Dialog", "AlertDialog", "Sheet", "Drawer"].flatMap((ns) =>
		part(ns, "Content")
	);
	const stripOverlayContents = (markup: string) => {
		let cleaned = markup;
		for (const contentTag of OVERLAY_CONTENT_TAGS) {
			const openings = openingTags(cleaned, contentTag);
			for (let i = openings.length - 1; i >= 0; i--) {
				const opening = openings[i]!;
				const inner = elementBody(cleaned, contentTag, opening);
				const closeTag = `</${contentTag}>`;
				const end = opening.text.endsWith("/>")
					? opening.index + opening.text.length
					: opening.index + opening.text.length + inner.length + closeTag.length;
				cleaned = cleaned.slice(0, opening.index) + cleaned.slice(end);
			}
		}
		return cleaned;
	};
	for (const footerTag of [
		...part("Dialog", "Footer"),
		...part("AlertDialog", "Footer"),
		...part("Sheet", "Footer"),
		...part("Card", "Footer"),
		...part("PageLayout", "Actions"),
	]) {
		for (const tag of openingTags(source, footerTag)) {
			const body = stripOverlayContents(elementBody(source, footerTag, tag));
			const primaryButtons = openingTags(body, "Button").filter(
				(btn) => !NON_PRIMARY_VARIANT.test(btn.text)
			);
			if (primaryButtons.length > 1)
				add(
					tag.index,
					"valar/single-primary-action",
					"warning",
					`${footerTag} 中出现了 ${primaryButtons.length} 个主色按钮；同一操作区最多只放 1 个主操作，其余改用 outline 或 ghost`
				);
		}
	}
	return sorted();
}
