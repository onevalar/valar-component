# Dialog、Alert Dialog 与 Sheet：Bits UI / Radix UI / Reka UI → `@ui-sdk` 跨框架底层迁移记录

本文档按 [Valar 跨框架组件转换规范](../COMPONENT_PORTING.md) 1.0 记录阶段二第二批（`Dialog`、`Alert Dialog`、`Sheet` 及其直系组合 `CommandDialog`、`IssueComposer`）在 Svelte、React、Vue 三端从旧原语库统一切换至 `@ui-sdk/{svelte,react,vue}` `0.1.0-beta.17` 的实现、差异与验证边界。

## 1. 基本信息与范围

| 项目 | 内容 |
| --- | --- |
| 采用的规范版本 | 1.0 |
| 状态 | 部分实现（三端核心功能、类型检查、单元测试与 Chromium 桌面/窄屏自动化回归已通过；真实触屏设备、系统输入法、VoiceOver 读屏及独立消费者工程 tarball 安装验证待后续统一补齐） |
| 日期、执行者及审阅者 | 2026-11-27 · AI 代理执行 · 未独立人工审阅 |
| 用户需求及范围依据 | 用户于 2026-11-27 要求继续推进阶段二底层收敛并完成全部主要浮层批次，将 `Dialog`、`Alert Dialog`、`Sheet`（以及依赖它们的 `CommandDialog`、`IssueComposer`）在 Svelte / React / Vue 三端同步迁至 `@ui-sdk` 原生 Top-Layer，彻底消除模态对话框与内嵌弹层（Popover / Select / Menu）的跨库栈冲突 |
| 来源仓库、文件路径 | 本仓库既有实现：`docs/src/lib/registry/ui/{dialog,alert-dialog,sheet}/`（Bits UI）、`packages/react-ui/src/{dialog,alert-dialog,sheet,command,issue-composer}.tsx`（Radix UI）、`packages/vue-ui/src/ui/{dialog,alert-dialog,sheet,command,issue-composer}/`（Reka UI） |
| 来源提交 SHA／发布版本 | 基线提交 `a03a463b`（阶段二第一批 `Popover` + `Select` 迁移完成） |
| 来源及依赖的许可、保留位置 | MIT；`@ui-sdk/core`、`@ui-sdk/svelte`、`@ui-sdk/react`、`@ui-sdk/vue` 及既有第三方许可均保留于仓库 `LICENSE` 与 `upstream-source-manifest.json` |
| 目标框架、运行环境及版本 | Svelte 5（`docs` / `@valar/svelte-ui`）、React 19（`@valar/react-ui`）、Vue 3（`@valar/vue-ui`），Node 24.22.2，pnpm 12.14.0 |
| 原语库和新增依赖的版本、选择理由 | `@ui-sdk/{core,svelte,react,vue}@0.1.0-beta.17`（均为仓库既有 catalog 依赖，未新增第三方包）；通过原生 Top-Layer 与统一层级栈管理遮罩、焦点陷阱、滚动锁定、嵌套弹窗/浮层 `Escape` 逐层关闭与归焦 |
| 已有等价组件／组合方案检查 | 直接替换三端正式公开包与 Svelte registry 中的 `Dialog`、`Alert Dialog`、`Sheet` 原语实现，不保留双份并行实现 |
| 支持环境及兼容范围 | 现代支持原生 Popover / Top-Layer API 的桌面与移动浏览器；浅色/深色主题、宽屏（900–1200 px）与窄屏（320–390 px）、减少动态效果（`prefers-reduced-motion: reduce`） |
| 必须保留的能力 | 既有导入路径与子组件名、Valar 表面样式与 `appearance` 变体（`default`/`editor`/`compact`/`media`/`destructive`）、四方向 `Sheet` 与时间线内嵌面板、表单校验与本地提交、焦点陷阱与取消归焦、弹窗内嵌 Popover/Select/Menu/子 Sheet 逐层按 `Escape` 关闭不误关外层弹窗、工作台内联实时调参与关闭重播 |
| 有意调整／排除的能力、依据及影响 | `DialogPortal` / `AlertDialogPortal` / `SheetPortal` 保留透传容器壳体以兼容既有调用树，实际挂载由 `@ui-sdk` `Content` 的 `inline`/`container` 统一控制；`Drawer`（依赖手势拖拽与 snap-points）与未迁复杂输入仍按阶段规划暂不改动 |
| 视觉变更范围及依据 | 保持 1:1 既有 Linear 视觉规范、圆角、遮罩不透明度、0.5 px 描边、内边距与内嵌焦点规则，零主动视觉改动 |

## 2. 能力对照

| 来源能力／行为 | 目标行为／API | 实现位置及依赖 | 差异、理由与影响 | 验证证据／缺口 |
| --- | --- | --- | --- | --- |
| `Dialog` 开关、遮罩、关闭按钮、标题/描述绑定与滚动内容 | `@ui-sdk/{svelte,react,vue}/dialog`，保留 `Dialog` / `Trigger` / `Content` / `Overlay` / `Close` / `Title` / `Description` / `Header` / `Footer` / `Portal` 与 Vue `DialogScrollContent` | `docs/src/lib/registry/ui/dialog/`、`packages/react-ui/src/dialog.tsx`、`packages/vue-ui/src/ui/dialog/` | 支持 `portalProps={{ disabled: true }}` 映射为 `inline`，并在内联模式下补充同级 `data-slot="dialog-overlay"` 保证工作台样式预览与对比视图一致；显式 `aria-label` 时移除 SDK 合成的 `aria-labelledby` 避免命名冲突 | 通过（三端 E2E、`linear-dialogs`、`workbench`） |
| `Alert Dialog` 不可误点外部关闭、默认聚焦取消按钮与危险确认 | `@ui-sdk/{svelte,react,vue}/alert-dialog`，保留 `Action` / `Cancel` / `Header` / `Media` / `Footer` 与紧凑/图文样式 | `docs/src/lib/registry/ui/alert-dialog/`、`packages/react-ui/src/alert-dialog.tsx`、`packages/vue-ui/src/ui/alert-dialog/` | 保留默认 `dismissible={false}` 语义（点击外部不关闭），同步支持 `onEscapeKeyDown` / `onInteractOutside` / `escapeKeydownBehavior` 策略钩子，确保取消或关闭后焦点准确回到触发按钮 | 通过（`linear-dialogs`、`navigation-overlays`、`workbench`） |
| `Sheet` 四方向滑出抽屉、非模态内嵌面板与窄屏响应 | 基于 `@ui-sdk/{svelte,react,vue}/dialog` 构建，保留 `side="top\|right\|bottom\|left"`、`showCloseButton` 与时间线内嵌变体 | `docs/src/lib/registry/ui/sheet/`、`packages/react-ui/src/sheet.tsx`、`packages/vue-ui/src/ui/sheet/` | 四方向表面类与过渡动画完全沿用既有 Valar token；作为内嵌工作台预览（如窄屏 Menubar Sheet）时，通过父级 `Dialog` 的嵌套浮层守卫确保内部按 `Escape` 只关当前抽屉不误关外层调节器 | 通过（`sheet-alignment`、`navigation-overlays`、`workbench`、`p2-editors`） |
| `CommandDialog` 与 `IssueComposer` 模态容器接入 | 复用迁移后的三端 `Dialog` | `packages/react-ui/src/{command,issue-composer}.tsx`、`packages/vue-ui/src/ui/{command/CommandDialog,issue-composer/IssueComposer}.vue`、Svelte registry 自动继承 | 移除旧 Radix/Reka 对话框事件适配差异，保持快捷键打开、搜索输入聚焦、底部操作区与归焦行为一致 | 通过（`command-alignment`、`conversation-business`、`complex-inputs`） |
| 嵌套浮层 `Escape` 逐层关闭与协同 | 同源 `@ui-sdk` 层级栈 + `valar-dialog-parent-escape` 协作通道 | 三端 `Dialog` / `AlertDialog` / `Sheet` 与 `Popover` / `Select` / `Menu` | 当内嵌控件配置 `escapeKeydownBehavior="defer-otherwise-ignore"`（如工作台画布中的固定展开样例）时，可将 `Escape` 显式委托回外层调节器对话框；反之若当前焦点位于内嵌浮层（如窄屏 Sheet）内，外层 Dialog 的键盘守卫不越权关闭 | 通过（`workbench`、`p2-editors`、`linear-dialogs`、`sheet-alignment`） |

## 3. 状态与集成设计

- **状态与转换**：`Dialog`、`AlertDialog`、`Sheet` 统一维护受控/非受控 `open` 状态与关闭策略上下文（`interactOutsideBehavior`、`escapeKeydownBehavior`、`onInteractOutside`、`onEscapeKeydown`）；`AlertDialog` 默认锁定外部点击关闭。
- **受控／非受控与事件顺序**：Svelte 使用 `$bindable()` + `onOpenChange`；React 使用受控/非受控 `open` / `defaultOpen` / `onOpenChange`；Vue 使用 `v-model:open` + `update:open`。仅在 `!details.canceled` 时提交绑定写回。
- **组合与引用转发**：Svelte 保留 `child` snippet 与 `bind:ref`；React 保留 `asChild`（`Slot.Root`）与 `ref` 透传；Vue 保留 `as`/`as-child` 与 `DisclosureElement` 属性合并。
- **模态焦点与滚动锁定**：默认模态打开时由 `@ui-sdk/core` 统一管理焦点陷阱、背景 `inert` 与滚动锁定；内联预览或显式 `modal={false}` 场景不冻结宿主页面，确保工作台左侧面板持续可操作。

## 4. 逐项验收

| 维度 | 适用性及理由 | 具体场景与预期 | 实际结果 | 证据／问题 |
| --- | --- | --- | --- | --- |
| 状态与数据 | 适用 | Dialog 编辑提交/校验失败/取消、AlertDialog 草稿确认与删除重试、Sheet 四方向开合与状态保留、CommandDialog 与 IssueComposer | 通过 | 三端 Chromium 回归与工作台调参全过 |
| 表单语义 | 适用 | 弹窗内原生表单必填校验、错误提示关联与重置 | 通过 | `linear-dialogs`、`conversation-business` |
| 键盘与焦点 | 适用 | 初始聚焦、Tab 焦点循环、Escape 逐层关闭、嵌套 Select/Popover/Sheet 不误关外层 Dialog、关闭归焦至原触发器 | 通过 | `linear-dialogs`、`sheet-alignment`、`command-alignment`、`p2-editors`、`workbench` |
| 无障碍 | 适用 | `role="dialog"` / `alertdialog`、`aria-modal`、`aria-labelledby` / `aria-describedby` / `aria-label` | 部分通过 | 自动化 ARIA 断言全过；VoiceOver 实机朗读待补 |
| 输入法与国际化 | 适用 | 弹窗与 Command 搜索中文输入及 `isComposing` 期间按 `Escape`/`Enter` 不误关误提交 | 部分通过 | 模拟 `isComposing` 守卫生效；真实系统输入法待补 |
| 触摸与指针 | 适用 | 遮罩点击关闭（Dialog/Sheet）与阻止关闭（AlertDialog）、内嵌操作点击 | 部分通过 | 桌面指针与模拟移动视口通过；真实触屏设备待补 |
| 异步与生命周期 | 适用 | 异步提交状态保持、工作台重播退出/进入动画与卸载清理 | 通过 | `linear-dialogs`、`workbench` |
| SSR 与 hydration | 适用 | SvelteKit SSR、React/Vue 服务端单测与生产预览水合 | 通过 | React 20/20、Vue 9/9 单测、docs SSR 实时预览 |
| 弹层与布局 | 适用 | 320/390 px 窄屏、短视口滚动、固定页眉页脚、时间线内嵌 Sheet、四向抽屉边界 | 通过 | `sheet-alignment`、`linear-dialogs`、`navigation-overlays` |
| 视觉与适配 | 适用 | Linear 表面色、圆角、遮罩不透明度、0.5 px 描边、浅深模式、减少动态效果 | 通过 | 样式断言与工作台对比面板通过 |
| 性能与资源 | 适用 | 卸载释放监听与无 `pageerror` | 通过 | 各 E2E `pageerror` 均为空 |
| 安全与隐私 | 适用 | 无新增危险 HTML 注入或外链请求 | 通过 | 静态审阅 |
| 类型与依赖 | 适用 | `tsc --noEmit`、`vue-tsc --noEmit`、`svelte-check --fail-on-warnings` | 通过 | 三端 0 错误 0 警告 |
| 分发与集成 | 适用 | Svelte registry、共享包及 React/Vue 预览产物构建 | 部分通过 | 仓库内构建与预览全过；独立外部工程 tarball 安装待补 |

## 5. 验证环境与可重复证据

- **操作系统与浏览器**：macOS，本机 Google Chrome（Playwright Chromium 驱动）。
- **工具链版本**：Node `24.22.2`，pnpm `12.14.0`，Svelte 5 / SvelteKit，React 19，Vue 3，`@ui-sdk/{core,svelte,react,vue}@0.1.0-beta.17`。
- **主题与视口**：浅色/深色、`320 px` / `390 px` / `802 px` / `900 px` / `1200 px`、`reducedMotion: "reduce"` 与默认动效。
- **独立消费者工程**：待阶段二收尾后与其余批次统一安排外部临时工程 tarball 安装复验。

| 实际命令／人工步骤 | 预期 | 实际结果与日期 | 测试文件、日志、截图等证据位置 |
| --- | --- | --- | --- |
| `@valar/react-ui` `check` + `test`；`@valar/vue-ui` `build` + `check` + `test`；`@valar/svelte-ui` `build` + `docs build:registry` + `svelte-check --fail-on-warnings` | 0 错误 0 警告、单测全过 | 通过（2026-11-27，React 20/20、Vue 9/9、844 项 registry） | 终端构建与检查日志（提交 `d2217f25`） |
| Svelte Docs Playwright：`linear-dialogs`、`sheet-alignment`、`command-alignment`、`workbench`（Dialog / Alert Dialog / Sheet）、`p2-editors`（Menubar 窄屏 Sheet） | 全部通过 | 通过（2026-11-27 / 2026-11-28） | `docs/e2e/` |
| React & Vue Playwright：`navigation-overlays`（AlertDialog / Sheet / MobileSidebar）、`conversation-business`、`complex-inputs` | 对话框与抽屉相关用例全部通过 | 通过（2026-11-27） | `apps/framework-comparison/tests/` |

## 6. 交付与结论

- **实现、公共类型及导出**：
  - Svelte：`docs/src/lib/registry/ui/dialog/`、`docs/src/lib/registry/ui/alert-dialog/`、`docs/src/lib/registry/ui/sheet/`
  - React：`packages/react-ui/src/dialog.tsx`、`packages/react-ui/src/alert-dialog.tsx`、`packages/react-ui/src/sheet.tsx`、`packages/react-ui/src/command.tsx`、`packages/react-ui/src/issue-composer.tsx`
  - Vue：`packages/vue-ui/src/ui/dialog/`、`packages/vue-ui/src/ui/alert-dialog/`、`packages/vue-ui/src/ui/sheet/`、`packages/vue-ui/src/ui/command/CommandDialog.vue`、`packages/vue-ui/src/ui/issue-composer/IssueComposer.vue`
- **示例、文档及分发配置**：重建 `docs` registry（844 项）与三端预览产物。
- **来源和许可保留**：沿用既有 `LICENSE` 与 `upstream-source-manifest.json`。
- **已知差异与限制**：Svelte `DialogContent` 的 `onkeydown` 包含嵌套内联浮层（`sheet-content`、`popover-content`、各类 `*-menu-content`、`select-content`、`tooltip-content`、`hover-card-content`）守卫，防止内联子浮层处理 `Escape` 时冒泡关闭外层模态框。
- **未验证项目与下一步**：真机触屏、系统中文输入法、VoiceOver 实机朗读及独立消费者工程 tarball 安装待统一补验；下一批为阶段二第三批（`Tooltip`、`Hover Card`、`Dropdown Menu`、`Context Menu`、`Menubar`）。
- **完成判断及依据**：标记为 **部分实现**（三端迁移、静态检查、单测与桌面/窄屏自动化回归均已通过，按规范如实保留真机/读屏/独立安装待验证项）。
- **后续更新必须保留的定制与回归场景**：
  1. `DialogContent` 内联模式保留独立 `dialog-overlay` 渲染，以及 `Escape` 嵌套浮层守卫；
  2. `Dialog` / `AlertDialog` / `Sheet` 的 `valar-dialog-parent-escape` 协作上下文，支持工作台画布固定样例将 `Escape` 委托给外层调节器；
  3. 显式 `aria-label` 优先于 SDK 自动生成的 `aria-labelledby`。
