# Popover 与 Select：Bits UI / Radix UI / Reka UI → `@ui-sdk` 跨框架底层迁移记录

本文档按 [Valar 跨框架组件转换规范](../COMPONENT_PORTING.md) 1.0 记录阶段二第一批（`Popover` 与 `Select` 联动组）在 Svelte、React、Vue 三端从旧原语库统一切换至 `@ui-sdk/{svelte,react,vue}` `0.1.0-beta.17` 的实现、差异与验证边界。

## 1. 基本信息与范围

| 项目 | 内容 |
| --- | --- |
| 采用的规范版本 | 1.0 |
| 状态 | 部分实现（三端核心功能、类型检查、单元测试、Chromium 桌面/窄屏回归及三端独立外部工程 tarball 安装复验均已通过；真实触屏设备、系统输入法、VoiceOver 读屏待后续真机复核） |
| 日期、执行者及审阅者 | 2026-11-27 · AI 代理执行 · 未独立人工审阅 |
| 用户需求及范围依据 | 用户于 2026-11-27 要求推进阶段二底层收敛，先将强联动的 `Popover` + `Select` 组合在 Svelte / React / Vue 三端同步迁至 `@ui-sdk` 原生 Top-Layer，解决混用栈导致的嵌套关闭顺序冲突，并保持外部 API、Linear 视觉和工作台调参兼容 |
| 来源仓库、文件路径 | 本仓库既有实现：`docs/src/lib/registry/ui/{popover,select}/`（Bits UI）、`packages/react-ui/src/{popover,select}.tsx`（Radix UI）、`packages/vue-ui/src/ui/{popover,select}/`（Reka UI） |
| 来源提交 SHA／发布版本 | 基线提交 `37008f6b` |
| 来源及依赖的许可、保留位置 | MIT；`@ui-sdk/core`、`@ui-sdk/svelte`、`@ui-sdk/react`、`@ui-sdk/vue` 及既有第三方许可均保留于仓库 `LICENSE` 与 `upstream-source-manifest.json` |
| 目标框架、运行环境及版本 | Svelte 5（`docs` / `@valar/svelte-ui`）、React 19（`@valar/react-ui`）、Vue 3（`@valar/vue-ui`），Node 24.22.2，pnpm 12.14.0 |
| 原语库和新增依赖的版本、选择理由 | `@ui-sdk/{core,svelte,react,vue}@0.1.0-beta.17`（均为仓库既有 catalog 依赖，未新增第三方包）；原生 Popover Top-Layer 统一管理两级弹层栈、焦点恢复、碰撞与可用视口高度 |
| 已有等价组件／组合方案检查 | 仓库内此前仅在试验路由接入 `@ui-sdk` Popover 对比；本批直接替换三个正式公开包中的 `Popover` 与 `Select` 原语实现，不再维护双份并行入口 |
| 支持环境及兼容范围 | 现代支持原生 Popover API 的桌面与移动浏览器；浅色/深色主题、宽屏（900–1200 px）与窄屏（320–390 px）、减少动态效果（`prefers-reduced-motion: reduce`） |
| 必须保留的能力 | 既有导入路径与子组件名、Valar 表面样式与 `appearance` 变体（`default`/`surface`/`options`/`settings`）、单选/多选与表单提交重置、长列表分组与键盘滚动、Popover 内嵌 Select 两级 `Escape` 依次关闭并逐层归焦、旧 Dialog 内嵌 UI SDK Popover/Select 不误关外层弹窗、工作台实时调参与内联预览 |
| 有意调整／排除的能力、依据及影响 | `SelectScrollUpButton` / `SelectScrollDownButton` 保留空占位导出以兼容旧调用点，实际滚动由 `SelectContent` 原生滚动容器承接；`Dialog`/`AlertDialog`/`Sheet` 与 `Menu`/`Tooltip`/`HoverCard` 留待阶段二后续批次，不在本批改动 |
| 视觉变更范围及依据 | 保持 1:1 既有 Linear 视觉规范、圆角、内边距、0.5 px 描边、阴影、高亮/选中分离及内嵌焦点规则，零主动视觉改动 |

## 2. 能力对照

| 来源能力／行为 | 目标行为／API | 实现位置及依赖 | 差异、理由与影响 | 验证证据／缺口 |
| --- | --- | --- | --- | --- |
| Popover 开关、触发器、关闭按钮、锚点与弹层定位 | `@ui-sdk/{svelte,react,vue}/popover`，保留 `Popover` / `Trigger` / `Content` / `Close` / `Anchor` / `Portal` 与 `asChild`/`child` | `docs/src/lib/registry/ui/popover/`、`packages/react-ui/src/popover.tsx`、`packages/vue-ui/src/ui/popover/` | 兼容 `portalProps`（`disabled` 映射 `inline`，`to`/`container` 映射挂载容器；Svelte 默认非内联挂至 `document.body` 以保持工作台与 `.sample` 隔离契约），内联模式补齐 `data-side`/`data-align` 回退 | 通过（三端 E2E + 工作台） |
| Popover 外部点击、Escape 拦截与焦点钩子 | 保留 `onEscapeKeyDown` / `onInteractOutside` / `onOpenAutoFocus` / `onCloseAutoFocus` | 三端 `Popover` + `PopoverContent` | `@ui-sdk/core` 在触发 `onOpenChange` 前已对原生 `Escape` 调用 `preventDefault()`，包装层改为派发全新可取消事件，避免误拦截关闭；`onOpenAutoFocus`/`onCloseAutoFocus` 映射为懒执行 `initialFocus`/`finalFocus` 回调 | 通过（Combobox、DatePicker、ColorPicker、Popover 回归） |
| Popover 无障碍命名与自定义 `data-slot` | 透传调用方 `aria-label`、`aria-labelledby` 与 `data-slot` | 三端 `PopoverContent` + Vue `DisclosureElement` | 调用方显式提供 `aria-label` 或 `aria-labelledby` 时不再被 SDK 默认的 `${id}-trigger` 覆盖；`data-slot` 允许 `ColorPicker` 等组合组件覆盖为 `color-picker-content` | 通过（Combobox、ColorPicker、DatePicker 三端） |
| Popover 内嵌 Select 两级 `Escape` 与焦点归还 | 同源 `@ui-sdk` 弹层栈自动分层 | 三端 `Popover` + `Select` | 消除此前 Radix/Bits/Reka 与 UI SDK 混用时的双层同关问题；同时在消费 `escape-key` 关闭时调用 `details.event?.stopPropagation()`，避免误关外层尚未迁移的旧 Dialog | 通过（`popover`、`sdk-popover`、`popover-alignment`、`calendar-alignment`、`workbench`） |
| Select 单选/多选、分组、禁用项、高亮与选中分离、长列表滚动 | `@ui-sdk/{svelte,react,vue}/select`，保留既有导出与 `type="single"\|"multiple"` | `docs/src/lib/registry/ui/select/`、`packages/react-ui/src/select.tsx`、`packages/vue-ui/src/ui/select/` | 未传 `<SelectLabel>` 时剥离 SDK 合成的 `*-label` `aria-labelledby` 以保留原生 `<label for>` 与 `aria-label`；新增缩放感知的 `revealHighlightedOption` 观察器，修复 `zoom-in-95` 入场动画期间按 `End` 短滚问题 | 通过（`switch-select-alignment`、三端表单与嵌套选择用例） |
| Vue `DatePicker` 输入校验与受控 `SdkInput` 联动 | 在 `@update:model-value` 同步清理 `error` | `packages/vue-ui/src/ui/date-picker/DatePicker.vue` | 消除原生 `@input` 早于 `@ui-sdk/vue/input` 触发重渲染导致输入值回弹的竞态 | 通过（`complex-inputs` Vue DatePicker） |

## 3. 状态与集成设计

- **状态与转换**：`Popover` 维护 `open`（受控/非受控）、锚点引用与关闭拦截策略上下文；`Select` 维护单选/多选 `value`（空字符串与 SDK `null` 双向映射）、`open` 与高亮项。禁用态阻止打开与提交。
- **受控／非受控与事件顺序**：Svelte 使用 `$bindable` + `onOpenChange`/`onValueChange`；React 使用标准受控/非受控 props；Vue 使用 `v-model` / `v-model:open` + 显式 `update:open` / `update:modelValue`。仅当 `!details.canceled` 时才提交本地绑定更新。
- **组合与引用转发**：Svelte 保持 `child` snippet 与 `bind:ref`；React 保持 `asChild`（`Slot.Root`）与 `ref` 合并；Vue 保持 `as`/`as-child`（`DisclosureElement`）并保护子元素显式 ARIA 命名。
- **CSS 变量桥接**：共享样式 `.cn-popover-viewport` 优先读取 `--available-height` / `--available-width` 并回退旧 `--bits-*` 变量；三端 `PopoverContent` 与 `SelectContent` 同步注入旧前缀兼容变量，保证既有页面自定义样式无需改动。

## 4. 逐项验收

| 维度 | 适用性及理由 | 具体场景与预期 | 实际结果 | 证据／问题 |
| --- | --- | --- | --- | --- |
| 状态与数据 | 适用 | Popover 表单提交/取消、Select 单选/多选/重置、ColorPicker HEX/透明度/预设、DatePicker 边界校验 | 通过 | React/Vue 54 项 + Svelte 20 项 Chromium 回归通过 |
| 表单语义 | 适用 | 原生表单校验、`FormData` 提交、必填报错清除、`<label>` 关联与 reset | 通过 | `switch-select-alignment`、`popover`、`sdk-color-picker`、`complex-inputs` |
| 键盘与焦点 | 适用 | `Enter`/`Space`/`Arrow`/`Home`/`End`/`Escape`、两级 `Escape` 依次关闭、内嵌焦点可见、不误关外层旧 Dialog | 通过 | `popover`、`sdk-popover`、`popover-alignment`、`combobox-alignment`、`calendar-alignment`、`workbench` |
| 无障碍 | 适用 | `role="dialog"`/`listbox`/`combobox`/`option`、`aria-activedescendant`、`aria-selected`、`aria-expanded`、`aria-labelledby`/`aria-label` | 部分通过 | 自动化 ARIA 断言全部通过；VoiceOver 实机朗读未验证 |
| 输入法与国际化 | 适用 | Combobox / Command / DatePicker / ColorPicker 中文输入与 `isComposing` 期间按 `Enter` 不误提交 | 部分通过 | 模拟 `isComposing` 回归通过；真实 macOS/Windows 系统输入法未验证 |
| 触摸与指针 | 适用 | 外部点击关闭、选项悬停与点击、颜色板指针拖拽 | 部分通过 | 桌面鼠标/模拟指针通过；真实移动触屏设备未验证 |
| 异步与生命周期 | 适用 | Combobox 异步检索与失败重试、打开关闭卸载清理 `MutationObserver` | 通过 | `combobox-alignment`、工作台编辑与重播动画 |
| SSR 与 hydration | 适用 | SvelteKit SSR 渲染、React/Vue 服务端单测与生产包水合 | 通过 | `@valar/react-ui` 20 项单测、`@valar/vue-ui` 9 项单测、docs 实时 SSR |
| 弹层与布局 | 适用 | 320/390 px 窄屏防溢出、碰撞翻转、短屏内滚动、长列表 `End` 滚入视口、内联工作台预览 | 通过 | 浅/深 × 窄/宽视口回归全过 |
| 视觉与适配 | 适用 | Linear 表面色、圆角、内边距、高亮与选中区分、浅深模式、减少动态效果 | 通过 | 样式断言（圆角、内边距、背景色、动效时长）与工作台调参通过 |
| 性能与资源 | 适用 | 卸载时释放观察器与监听，无 console/pageerror | 通过 | 各 E2E `pageerror` 均为空数组 |
| 安全与隐私 | 适用 | 无新增危险 HTML 注入或外链请求 | 通过 | 静态审阅 |
| 类型与依赖 | 适用 | `tsc --noEmit`、`vue-tsc --noEmit`、`svelte-check --fail-on-warnings` | 通过 | 三端全部 0 错误 0 警告 |
| 分发与集成 | 适用 | Registry 产物重建（844 项）、三端包构建与预览静态产物、三端独立工程本地 tarball 安装构建与浏览器实测 | 通过 | 阶段三已完成 Svelte/React/Vue 独立外部工程 tarball 安装、类型检查、生产构建及三级嵌套浮层实测 |

## 5. 验证环境与可重复证据

- **操作系统与浏览器**：macOS，本机 Google Chrome（Playwright Chromium 驱动）。
- **工具链版本**：Node `24.22.2`，pnpm `12.14.0`，Svelte 5 / SvelteKit，React 19，Vue 3，`@ui-sdk/{core,svelte,react,vue}@0.1.0-beta.17`。
- **主题与视口**：浅色/深色、`320 px` / `390 px` / `802 px` / `900 px` / `1200 px`、`reducedMotion: "reduce"` 与默认动效。
- **独立消费者工程**：本批尚未执行独立临时工程 tarball 安装，留待阶段二完成主要浮层组后统一补做。

| 实际命令／人工步骤 | 预期 | 实际结果与日期 | 测试文件、日志、截图等证据位置 |
| --- | --- | --- | --- |
| `@valar/svelte-ui` 构建 + `docs build:registry` + `docs svelte-check --fail-on-warnings` | 0 错误 0 警告 | 通过（2026-11-27，844 项 registry） | 终端构建与检查日志 |
| `@valar/react-ui` `check` + `test`；`@valar/vue-ui` `build` + `check` + `test`；`docs build:framework-previews` | 0 错误、单测全过 | 通过（2026-11-27，React 20/20、Vue 9/9） | 终端构建与测试日志 |
| React & Vue Playwright：`popover`、`sdk-popover`、`sdk-color-picker`、`complex-inputs`、`conversation-business` | 全部通过 | 通过（2026-11-27，54/54） | `apps/framework-comparison/tests/` |
| Svelte Docs Playwright：`popover-alignment`、`switch-select-alignment`、`combobox-alignment`、`date-picker`、`calendar-alignment`、`workbench`（Color Picker/Popover/Select） | 全部通过 | 通过（2026-11-27，20/20 + 4/4） | `docs/e2e/` |

## 6. 交付与结论

- **实现、公共类型及导出**：
  - Svelte：`docs/src/lib/registry/ui/popover/`、`docs/src/lib/registry/ui/select/`、`docs/src/lib/registry/styles/style-valar.css`
  - React：`packages/react-ui/src/popover.tsx`、`packages/react-ui/src/select.tsx`
  - Vue：`packages/vue-ui/src/ui/popover/`、`packages/vue-ui/src/ui/select/`、`packages/vue-ui/src/ui/collapsible/DisclosureElement.ts`、`packages/vue-ui/src/ui/date-picker/DatePicker.vue`
- **示例、文档及分发配置**：更新 `apps/framework-comparison/tests/sdk-popover.spec.ts` 移除旧混用失败分支；重建 `docs` registry（844 项）及 `docs/static/framework-previews/{react,vue}`。
- **来源和许可保留**：沿用既有 `LICENSE` 与 `upstream-source-manifest.json`。
- **已知差异与限制**：外层为旧 Bits/Radix/Reka Dialog 时，依赖本批在 `escape-key` 关闭时调用 `stopPropagation()` 防止误关外层；当焦点不在弹层内而直接按 `Escape` 时，旧文档级监听仍可能先触发，待阶段二第二批将 `Dialog`/`AlertDialog`/`Sheet` 同步迁至 `@ui-sdk` 后将彻底统一由单一弹层栈接管。
- **未验证项目与下一步**：真实移动触屏、系统输入法、VoiceOver 读屏及独立消费者工程 tarball 安装待补齐；下一批推进阶段二第二批（`Dialog`、`AlertDialog`、`Sheet` 三端迁移）。
- **完成判断及依据**：标记为 **部分实现**（三端代码迁移、构建类型检查、单元测试与桌面/窄屏 Chromium 自动化回归全部通过，按规范如实保留真机/读屏/独立安装包待验证边界）。
- **后续更新必须保留的定制与回归场景**：
  1. `Popover` 包装层派发全新可取消 `Escape`/`InteractOutside` 事件，以及消费 `escape-key` 时的 `stopPropagation()`；
  2. `PopoverContent` 保留调用方显式 `aria-label`、`aria-labelledby`、`data-slot` 与内联模式 `data-side`/`data-align`；
  3. `SelectTrigger` 剥离无对应标签元素的合成 `*-label` `aria-labelledby`；
  4. `SelectContent` 缩放感知高亮滚入视口观察器（避免 `zoom-in-95` 动画期短滚）。
