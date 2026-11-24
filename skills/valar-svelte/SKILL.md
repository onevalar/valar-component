---
name: valar-svelte
description: 使用 Valar Svelte 组件库自主构建或修改 Svelte／SvelteKit 界面——先选页面骨架、再按“何时用／不用”选组件、按维护者设计方法与单组件 RULES.md 编写并用 lint 检查。适用于含 components.json 的项目、提到 Valar／valar-svelte、“添加组件”或需要写 UI 的任务。
user-invocable: false
allowed-tools: Bash(pnpm exec valar-svelte *), Bash(npx valar-svelte *)
---

# Valar Svelte

Valar Svelte 的组件以源码形式通过 CLI 安装进项目，每个组件附带选型说明卡和设计规范 `RULES.md`。构建页面时按下面的渐进式流程执行，不凭记忆拼凑，也不要一次性把所有组件规范全量塞进上下文。

> **CLI：** `valar-svelte` 以本地 tarball 安装在项目中，通过包运行器执行：`pnpm exec valar-svelte`（或 `npx valar-svelte`）。

## 工作流程（必须遵守）

1. **读项目上下文**：读取 `components.json`（`aliases`、`style`、`iconLibrary`）并列出 `aliases.ui` 下已安装组件。
2. **读维护者设计方法**（构建或重构整页前必读）：
   - [guides/page-composition.md](./guides/page-composition.md) — 页面组合（间距优先、扁平克制、宽度分档、容器边界、反 AI 味红线）
   - [guides/copywriting.md](./guides/copywriting.md) — 界面文案（中性标题自解释、工具语气、按钮动词、一句话封顶、排版细节）
   - [guides/motion.md](./guides/motion.md) — 动效与反馈（短促克制、全局动效档位、禁用装饰动画、就地反馈优先）
   - [guides/verification.md](./guides/verification.md) — 独立视觉与合规验收（机器质检 + 浏览器黑盒 6 项自查）
3. **先选页面骨架，再按需选组件**：
   - 有 Valar MCP（`pnpm exec valar-svelte mcp`）时：先调 `search_patterns` / `get_pattern` 选定标准页面骨架（整页布局优先使用 `page-layout` 固化宽窄分档、页头、工具栏、间距分区与设置/属性行），再调 `search_components` / `get_component` 按“何时用／何时不用”确定所需单组件。
   - 无 MCP 时：读 `http://127.0.0.1:5186/llms-small.txt`（含页面骨架与组件“不适用→改用”索引）或 `http://127.0.0.1:5186/registry/catalog.json`；单个组件文档在 `/docs/components/<name>.md`。
4. **安装缺失组件**：运行 `pnpm exec valar-svelte add <name...>`，禁止导入未安装的组件。
5. **按需读取本次涉及组件的 `RULES.md` 编写**：项目 `AGENTS.md` 中的 Valar 区块只提供通用底线与已装组件规范的路径索引，仅打开本次任务实际用到的组件 `RULES.md` 精读。
6. **独立验收并修复**：按 [guides/verification.md](./guides/verification.md) 先运行 `pnpm exec valar-svelte lint` 修掉所有 error，再在真实浏览器里完成宽窄屏与浅深主题黑盒自检后交付。

## 高频编码约定（精简速览）

- **导入方式**：多部位组件用命名空间导入（`import * as Dialog from "$lib/components/ui/dialog"` → `Dialog.Content`）；单组件目录用具名导入（`import { Button } from "$lib/components/ui/button"`）。路径严格跟随 `components.json` 的 `aliases`。
- **样式边界**：`class` 只做布局，不覆盖组件配色与字号；只用语义色 token（不写 `bg-blue-500`、`bg-white` 或手写 `dark:`）；间距用 `flex`/`gap-*`（不用 `space-y-*`）；等宽高用 `size-*`；条件类名用 `cn()`；弹层不手写 `z-index`。
- **表单与图标**：表单统一用 `Field.FieldGroup` + `Field.Field`；错误态用 `data-invalid` + `aria-invalid`；按钮内图标加 `data-icon="inline-start" | "inline-end"` 且不额外加 `size-4`/`w-4 h-4`；加载态用 `<Button disabled><Spinner data-icon="inline-start" />…</Button>`。
- **结构完整性**：`Dialog`/`Sheet`/`Drawer` 必须带 `Title`；`AlertDialog` 必须带 `Cancel`；`Avatar` 必须带 `Fallback`；列表项必须包在对应 `Group` 内；`Trigger` 内嵌 `Button` 使用 `{#snippet child({ props })}`。

## 按需查阅详细参考（仅遇到相关问题时读取）

- [rules/forms.md](./rules/forms.md) — 表单、InputGroup、ToggleGroup、校验与禁用正反例
- [rules/composition.md](./rules/composition.md) — 弹层选型、Card、Tabs、Empty、Alert、Toast、Skeleton 正反例
- [rules/icons.md](./rules/icons.md) — `data-icon` 与图标库约定
- [rules/styling.md](./rules/styling.md) — 语义色、变体、间距与主题样式正反例
- [cli.md](./cli.md) — CLI 命令（`init` / `add` / `apply` / `update` / `lint` / `mcp`）与参数
- [customization.md](./customization.md) — 主题变量、圆角与扩展变体
