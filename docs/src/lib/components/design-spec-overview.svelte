<script lang="ts">
	import { page } from "$app/state";
	import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
	import CopyIcon from "@lucide/svelte/icons/copy";
	import { mode } from "mode-watcher";
	import { toast } from "svelte-sonner";
	import * as Card from "$lib/registry/ui/card/index.js";
	import * as Table from "$lib/registry/ui/table/index.js";
	import {
		COLOR_TOKENS,
		DURATION_TOKENS,
		EASE_TOKENS,
		TYPE_SCALE_DEFAULTS,
		VALAR_TOKEN_DEFAULTS,
		oklchToHex,
	} from "$lib/features/workbench/token-overrides.js";
	import { copyText } from "$lib/hooks/use-clipboard.svelte.js";
	import { localeFromPathname, localizeHref } from "$lib/i18n/config.js";
	import { BASE_THEMES } from "$lib/registry/themes.js";
	import { Badge } from "$lib/registry/ui/badge/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import { Separator } from "$lib/registry/ui/separator/index.js";
	import { Switch } from "$lib/registry/ui/switch/index.js";
	import { GLOBAL_RULES } from "../../../../packages/cli/src/utils/design-rules-core.js";

	const locale = $derived(localeFromPathname(page.url.pathname));
	const zh = $derived(locale === "zh");

	const neutralTheme = $derived(BASE_THEMES.find((item) => item.name === "neutral"));
	const lightVars = $derived((neutralTheme?.cssVars?.light ?? {}) as Record<string, string>);
	const darkVars = $derived((neutralTheme?.cssVars?.dark ?? {}) as Record<string, string>);
	const activeVars = $derived(mode.current === "dark" ? darkVars : lightVars);
	const themeVars = $derived(
		((neutralTheme?.cssVars as { theme?: Record<string, string> } | undefined)?.theme ??
			{}) as Record<string, string>
	);

	const COLOR_ROLES: Record<string, { zh: string; en: string }> = {
		background: { zh: "页面主背景", en: "Page background" },
		foreground: { zh: "默认主文字", en: "Primary text" },
		card: { zh: "卡片表面", en: "Card surface" },
		"card-foreground": { zh: "卡片文字", en: "Card text" },
		popover: { zh: "浮层与菜单表面", en: "Popover surface" },
		"popover-foreground": { zh: "浮层文字", en: "Popover text" },
		primary: { zh: "Linear 品牌蓝主色", en: "Linear primary blue" },
		"primary-foreground": { zh: "主色按钮文字", en: "Primary ink" },
		secondary: { zh: "次级控件表面", en: "Secondary surface" },
		"secondary-foreground": { zh: "次级控件文字", en: "Secondary text" },
		muted: { zh: "弱化底色", en: "Muted surface" },
		"muted-foreground": { zh: "辅助说明文字", en: "Muted text" },
		accent: { zh: "悬停与高亮底色", en: "Hover & accent" },
		"accent-foreground": { zh: "高亮文字", en: "Accent text" },
		info: { zh: "信息提示青蓝", en: "Info status" },
		"info-foreground": { zh: "信息底前景字色", en: "Info ink" },
		success: { zh: "完成与正常状态绿", en: "Success status" },
		"success-foreground": { zh: "成功底前景字色", en: "Success ink" },
		warning: { zh: "进行中与风险警告黄", en: "Warning status" },
		"warning-foreground": { zh: "警告底前景字色", en: "Warning ink" },
		destructive: { zh: "危险操作与错误红", en: "Destructive & error" },
		"destructive-foreground": { zh: "危险底前景字色", en: "Destructive ink" },
		blue: { zh: "Linear 蓝（主交互）", en: "Linear blue" },
		teal: { zh: "青蓝标签与提示", en: "Teal label" },
		green: { zh: "翠绿状态与标签", en: "Green label" },
		yellow: { zh: "明黄进行中状态", en: "Yellow label" },
		orange: { zh: "暖橙分诊与积压", en: "Orange triage" },
		red: { zh: "珊瑚红缺陷与阻塞", en: "Red bug label" },
		indigo: { zh: "经典靛紫状态色", en: "Classic indigo" },
		pink: { zh: "柔粉标签色", en: "Pink label" },
		slate: { zh: "蓝灰关闭与取消态", en: "Slate muted state" },
		border: { zh: "细腻分隔线与描边", en: "Subtle borders" },
		input: { zh: "表单输入描边", en: "Input stroke" },
		ring: { zh: "内嵌焦点蓝框", en: "Focus ring blue" },
		sidebar: { zh: "侧边栏导航底色", en: "Sidebar surface" },
		"sidebar-primary": { zh: "侧边栏主强调蓝", en: "Sidebar primary" },
		"sidebar-accent": { zh: "侧边栏当前项底色", en: "Sidebar active" },
		"chart-1": { zh: "图表序列 1 · 品牌蓝", en: "Series 1 · Blue" },
		"chart-2": { zh: "图表序列 2 · 青蓝", en: "Series 2 · Teal" },
		"chart-3": { zh: "图表序列 3 · 翠绿", en: "Series 3 · Green" },
		"chart-4": { zh: "图表序列 4 · 明黄", en: "Series 4 · Yellow" },
		"chart-5": { zh: "图表序列 5 · 靛紫", en: "Series 5 · Indigo" },
	};

	const COLOR_GROUPS = [
		{
			key: "surface",
			zh: "页面与表面",
			en: "Surfaces",
			tokens: ["background", "foreground", "card", "card-foreground", "popover", "popover-foreground"],
		},
		{
			key: "brand",
			zh: "主色与中性层级",
			en: "Primary & Neutral Hierarchy",
			tokens: [
				"primary",
				"primary-foreground",
				"secondary",
				"secondary-foreground",
				"muted",
				"muted-foreground",
				"accent",
				"accent-foreground",
			],
		},
		{
			key: "semantic",
			zh: "语义状态反馈",
			en: "Semantic Feedback",
			tokens: [
				"info",
				"info-foreground",
				"success",
				"success-foreground",
				"warning",
				"warning-foreground",
				"destructive",
				"destructive-foreground",
			],
		},
		{
			key: "spectrum",
			zh: "Linear 标签与状态色板",
			en: "Linear Spectrum & Labels",
			tokens: ["blue", "teal", "green", "yellow", "orange", "red", "indigo", "pink", "slate"],
		},
		{
			key: "stroke",
			zh: "边框与焦点",
			en: "Borders & Focus",
			tokens: ["border", "input", "ring"],
		},
		{
			key: "sidebar",
			zh: "侧边栏与五序列图表",
			en: "Sidebar & Charts",
			tokens: [
				"sidebar",
				"sidebar-primary",
				"sidebar-accent",
				"chart-1",
				"chart-2",
				"chart-3",
				"chart-4",
				"chart-5",
			],
		},
	] as const;

	function swatchReadout(token: string): string {
		const raw = activeVars[token] ?? lightVars[token] ?? darkVars[token];
		if (!raw) return "token";
		const hex = oklchToHex(raw);
		return hex ? `${hex.toUpperCase()} · ${raw}` : raw;
	}

	const TYPE_STEPS = [
		{ key: "text-xs", cls: "text-xs", zh: "辅助说明 / 徽标", en: "Captions & badges" },
		{ key: "text-sm", cls: "text-sm", zh: "默认正文 / 控件", en: "Body & controls" },
		{ key: "text-base", cls: "text-base", zh: "卡片标题 / 强调正文", en: "Card titles" },
		{ key: "text-lg", cls: "text-lg", zh: "区块标题", en: "Section headings" },
		{ key: "text-xl", cls: "text-xl", zh: "页面副标题", en: "Subheadings" },
	] as const;

	const RADIUS_STEPS = [
		{ name: "rounded-sm", expr: "radius × 0.6", cls: "rounded-sm" },
		{ name: "rounded-md", expr: "radius × 0.8", cls: "rounded-md" },
		{ name: "rounded-lg", expr: "var(--radius)", cls: "rounded-lg" },
		{ name: "rounded-xl", expr: "radius × 1.4", cls: "rounded-xl" },
		{ name: "rounded-full", expr: "9999px", cls: "rounded-full" },
	] as const;

	const HEIGHT_ROWS = [
		{ size: "xs", px: "24 px", usageZh: "紧凑工具栏 / 表格内操作", usageEn: "Compact toolbar / inline actions" },
		{ size: "sm", px: "28 px", usageZh: "导航胶囊 / 次级工具栏", usageEn: "Header actions / compact pills" },
		{ size: "default", px: "32 px", usageZh: "标准按钮与单行输入框", usageEn: "Default buttons & inputs" },
		{ size: "lg", px: "36 px", usageZh: "表单主操作 / 搜索框", usageEn: "Primary CTAs" },
	] as const;

	const globalRuleLines = $derived(
		GLOBAL_RULES.split("\n")
			.map((line) => line.replace(/^- /, "").trim())
			.filter(Boolean)
	);

	let focusSwitch = $state(true);
	let motionPlayed = $state(false);

	async function copyToken(value: string) {
		const res = await copyText(value);
		if (res === "success") {
			toast.success(zh ? `已复制 ${value}` : `Copied ${value}`);
		} else {
			toast.error(zh ? "复制失败" : "Copy failed");
		}
	}

	async function copyAiRules() {
		const content = [
			"# Valar Svelte 全局设计规范",
			"",
			"## 语义 Token 约定",
			`- 颜色变量：${COLOR_TOKENS.map((t) => `--${t}`).join("、")}`,
			`- 基础圆角：--radius (${lightVars.radius ?? "0.625rem"})`,
			`- 字号阶梯：${Object.entries(TYPE_SCALE_DEFAULTS)
				.map(([k, v]) => `${k}=${themeVars[k] ?? v}`)
				.join("、")}`,
			`- 动效档位：${DURATION_TOKENS.map((k) => `${k}=${lightVars[k] ?? VALAR_TOKEN_DEFAULTS[k]}`).join("、")}`,
			`- 缓动曲线：${EASE_TOKENS.map((k) => `${k}=${lightVars[k] ?? VALAR_TOKEN_DEFAULTS[k]}`).join("、")}`,
			"",
			"## 全局设计准则",
			GLOBAL_RULES,
		].join("\n");
		const res = await copyText(content);
		if (res === "success") {
			toast.success(zh ? "已复制全局 AI 设计规范" : "Copied global AI guidelines");
		} else {
			toast.error(zh ? "复制失败" : "Copy failed");
		}
	}
</script>

<div class="flex flex-col gap-6">
	<Card.Root>
		<Card.Header class="flex flex-row flex-wrap items-center justify-between gap-3">
			<div>
				<Card.Title>{zh ? "表面与语义色彩体系" : "Surfaces & semantic colors"}</Card.Title>
				<Card.Description>
					{zh
						? "全站统一读取全局语义变量；点击色卡可复制对应的 CSS 变量名。"
						: "All components read semantic tokens. Select any swatch to copy its CSS variable."}
				</Card.Description>
			</div>
			<Button href={localizeHref("/themes/palette", locale)} variant="outline" size="sm">
				{zh ? "Linear 完整色板对照表" : "Full Linear palette"}
				<ArrowRightIcon />
			</Button>
		</Card.Header>
		<Card.Content class="space-y-5">
			{#each COLOR_GROUPS as group (group.key)}
				<div class="space-y-2.5">
					<h3 class="text-xs font-semibold text-muted-foreground">
						{zh ? group.zh : group.en}
					</h3>
					<div class="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3">
						{#each group.tokens as token (token)}
							{@const role = COLOR_ROLES[token]}
							<Button
								type="button"
								variant="outline"
								shape="square"
								class="h-auto justify-start gap-3 rounded-lg p-2.5 text-left font-normal"
								onclick={() => copyToken(`var(--${token})`)}
							>
								<span
									aria-hidden="true"
									class="size-7 shrink-0 rounded-md border-[0.5px] border-border"
									style:background-color={`var(--${token})`}
								></span>
								<span class="min-w-0 flex-1">
									<span class="flex items-baseline justify-between gap-2">
										<span class="truncate font-mono text-xs font-medium text-foreground">
											--{token}
										</span>
										{#if role}
											<span class="shrink-0 text-[11px] text-muted-foreground">
												{zh ? role.zh : role.en}
											</span>
										{/if}
									</span>
									<span class="block truncate font-mono text-[11px] text-muted-foreground">
										{swatchReadout(token)}
									</span>
								</span>
							</Button>
						{/each}
					</div>
				</div>
			{/each}
		</Card.Content>
	</Card.Root>

	<div class="grid gap-6 lg:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title>{zh ? "排版与字号阶梯" : "Typography scale"}</Card.Title>
				<Card.Description>
					{zh
						? "全站优先使用 Inter Variable 与 Geist Mono Variable；正文与控件默认 13–14 px，字重采用 400 / 450 / 500 / 600，数字列表强制等宽对齐。"
						: "Inter Variable & Geist Mono Variable; consistent scale from text-xs to text-xl with tabular-nums."}
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				{#each TYPE_STEPS as step (step.key)}
					<div class="flex items-baseline justify-between gap-3 border-b-[0.5px] border-border pb-2.5 last:border-b-0 last:pb-0">
						<div class="min-w-0">
							<p class="{step.cls} font-medium truncate">
								{zh ? step.zh : step.en}
							</p>
							<p class="font-mono text-[11px] text-muted-foreground">
								.{step.cls} · {themeVars[step.key] ?? TYPE_SCALE_DEFAULTS[step.key]}
							</p>
						</div>
						<span class="font-mono text-xs text-muted-foreground tabular-nums">1,280</span>
					</div>
				{/each}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>{zh ? "圆角与标准控件高度" : "Radius & control heights"}</Card.Title>
				<Card.Description>
					{zh
						? "所有圆角均基于全局 --radius 派生，按钮与表单输入沿用统一的 24 / 28 / 32 / 36 px 四档高度。"
						: "Radii derive from --radius; buttons and inputs share 24 / 28 / 32 / 36 px tiers."}
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-5">
				<div class="flex flex-wrap gap-2.5">
					{#each RADIUS_STEPS as item (item.name)}
						<div class="flex items-center gap-2 rounded-lg border-[0.5px] border-border px-2.5 py-1.5">
							<span class="size-5 border-[0.5px] border-border bg-muted {item.cls}" aria-hidden="true"></span>
							<div class="text-xs">
								<div class="font-mono font-medium">{item.name}</div>
								<div class="text-[11px] text-muted-foreground">{item.expr}</div>
							</div>
						</div>
					{/each}
				</div>
				<Separator />
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>{zh ? "档位" : "Tier"}</Table.Head>
							<Table.Head>{zh ? "高度" : "Height"}</Table.Head>
							<Table.Head>{zh ? "适用场景" : "Usage"}</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each HEIGHT_ROWS as row (row.size)}
							<Table.Row>
								<Table.Cell class="font-mono text-xs">{row.size}</Table.Cell>
								<Table.Cell class="font-mono text-xs tabular-nums">{row.px}</Table.Cell>
								<Table.Cell class="text-xs text-muted-foreground">
									{zh ? row.usageZh : row.usageEn}
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
		</Card.Root>
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title>{zh ? "内侧焦点与动效规则" : "Inner focus & motion"}</Card.Title>
				<Card.Description>
					{zh
						? "全库禁止在组件外部绘制扩散聚焦环；焦点通过边框变色或内描边表达，可直接 Tab 测试。"
						: "Focus indicators stay inside component bounds via border color or inset outline."}
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="flex flex-wrap items-center gap-3 rounded-lg border-[0.5px] border-border p-3">
					<Input
						class="max-w-48"
						placeholder={zh ? "聚焦查看边框变色" : "Focus to see border highlight"}
						aria-label={zh ? "焦点示例输入框" : "Focus sample input"}
					/>
					<Button size="sm">{zh ? "内描边按钮" : "Inner focus"}</Button>
					<Switch
						bind:checked={focusSwitch}
						aria-label={zh ? "焦点示例开关" : "Focus sample switch"}
					/>
				</div>
				<div class="space-y-2">
					<div class="flex items-center justify-between gap-2">
						<span class="text-xs font-medium text-muted-foreground">
							{zh ? "全局动效档位预览" : "Motion tier preview"}
						</span>
						<Button
							size="xs"
							variant="outline"
							aria-pressed={motionPlayed}
							onclick={() => (motionPlayed = !motionPlayed)}
						>
							{motionPlayed ? (zh ? "收回" : "Reset") : zh ? "播放曲线" : "Play"}
						</Button>
					</div>
					{#each [
						{ label: "fast", cls: "duration-fast" },
						{ label: "normal", cls: "duration-normal" },
						{ label: "slow", cls: "duration-slow" },
					] as row (row.label)}
						<div class="flex items-center gap-3 text-xs">
							<span class="w-14 font-mono text-muted-foreground">{row.label}</span>
							<div class="relative h-5 flex-1 rounded-md border-[0.5px] border-border bg-muted">
								<div
									class={[
										"absolute top-1/2 size-3 -translate-y-1/2 rounded-sm bg-primary transition-[left]",
										row.cls,
										motionPlayed ? "left-[calc(100%-1rem)] ease-enter" : "left-1 ease-exit",
									]}
								></div>
							</div>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row flex-wrap items-center justify-between gap-2">
				<div>
					<Card.Title>{zh ? "全局 AI 设计总则" : "Global AI design rules"}</Card.Title>
					<Card.Description>
						{zh
							? "AI 生成与校验界面时自动遵循的底层约束，可一键复制给外部工具。"
							: "Shared rules enforced by the assistant and CLI lint checks."}
					</Card.Description>
				</div>
				<Button variant="outline" size="sm" onclick={copyAiRules}>
					<CopyIcon />
					{zh ? "复制全局设计规范（给 AI）" : "Copy AI Guidelines"}
				</Button>
			</Card.Header>
			<Card.Content>
				<ul class="space-y-2.5 text-xs leading-relaxed text-muted-foreground">
					{#each globalRuleLines as line, index (index)}
						<li class="flex items-start gap-2">
							<Badge variant="secondary" class="mt-0.5 shrink-0 font-mono text-[10px]">
								{index + 1}
							</Badge>
							<span class="text-foreground">{line}</span>
						</li>
					{/each}
				</ul>
			</Card.Content>
		</Card.Root>
	</div>
</div>
