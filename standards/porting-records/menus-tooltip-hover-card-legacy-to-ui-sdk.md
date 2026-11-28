# Dropdown Menu、Context Menu、Menubar、Tooltip 与 Hover Card：Bits UI / Radix UI / Reka UI → `@ui-sdk` 跨框架底层迁移记录

本文档按 [Valar 跨框架组件转换规范](../COMPONENT_PORTING.md) 1.0 记录阶段二第三批（`Dropdown Menu`、`Context Menu`、`Menubar`、`Tooltip`、`Hover Card`）在 Svelte、React、Vue 三端从旧原语库统一切换至 `@ui-sdk/{svelte,react,vue}` `0.1.0-beta.17` 的实现、差异与验证边界。

## 1. 基本信息与范围

| 项目 | 内容 |
| --- | --- |
| 采用的规范版本 | 1.0 |
| 状态 | 部分实现（三端核心功能、静态类型、单元测试、工作台调参与 Chromium 桌面/窄屏自动化回归通过；真实触屏设备、系统输入法、VoiceOver 读屏、独立消费者工程 tarball 安装以及既有 React/Vue 折叠侧栏提示框位置断言仍按规范标记待补或如实留痕） |
| 日期、执行者及审阅者 | 2026-11-28 · AI 代理执行 · 未独立人工审阅 |
| 用户需求及范围依据 | 用户于 2026-11-27 要求完成阶段二全部主要浮层收敛，将剩余菜单类（`Dropdown Menu`、`Context Menu`、`Menubar`）与悬停提示类（`Tooltip`、`Hover Card`）在 Svelte / React / Vue 三端同步迁至 `@ui-sdk` 原生 Top-Layer，与阶段二前两批的 `Popover`、`Select`、`Dialog`、`Alert Dialog`、`Sheet` 共同运行于同一底层弹层栈 |
| 来源仓库、文件路径 | 本仓库既有实现：`docs/src/lib/registry/ui/{dropdown-menu,context-menu,menubar,tooltip,hover-card,sidebar/sidebar-menu-button.svelte}`（Bits UI）、`packages/react-ui/src/{dropdown-menu,context-menu,menubar,tooltip,hover-card}.tsx`（Radix UI）、`packages/vue-ui/src/ui/{dropdown-menu,context-menu,menubar,tooltip,hover-card}/`（Reka UI） |
| 来源提交 SHA／发布版本 | 基线提交 `d2217f25`（阶段二第二批 `Dialog` + `Alert Dialog` + `Sheet` 迁移完成） |
| 来源及依赖的许可、保留位置 | MIT；`@ui-sdk/core`、`@ui-sdk/svelte`、`@ui-sdk/react`、`@ui-sdk/vue` 及既有第三方许可均保留于仓库 `LICENSE` 与 `upstream-source-manifest.json` |
| 目标框架、运行环境及版本 | Svelte 5（`docs` / `@valar/svelte-ui`）、React 19（`@valar/react-ui`）、Vue 3（`@valar/vue-ui`），Node 24.22.2，pnpm 12.14.0 |
| 原语库和新增依赖的版本、选择理由 | `@ui-sdk/{core,svelte,react,vue}@0.1.0-beta.17`（均为仓库既有 catalog 依赖，未新增第三方包）；通过 `@ui-sdk/{menu,menubar,tooltip,hover-card}` 统一接管菜单树、子菜单、右键与长按触发、悬停延时、键盘导航与 Top-Layer 层级栈 |
| 已有等价组件／组合方案检查 | 直接替换三端正式公开包与 Svelte registry 中的五组原语实现，不保留双份并行实现；Vue `dropdown-menu` 保留 `styledPart` 导出以供尚未迁移的 `navigation-menu` 复用 |
| 支持环境及兼容范围 | 现代支持原生 Popover / Top-Layer API 的桌面与移动浏览器；浅色/深色主题、宽屏（900–1200 px）与窄屏（320–390 px）、减少动态效果（`prefers-reduced-motion: reduce`） |
| 必须保留的能力 | 既有导入路径与子组件名、Valar 表面样式与 `appearance` 变体、三端复选/单选/子菜单/禁用项跳过与快捷键显示、Context Menu 右键/长按/`Shift+F10` 与内嵌 Command 搜索子面板、Menubar 横向切换与窄屏 Sheet 协同、Tooltip 按 `Provider` 隔离延迟与程序化聚焦展开、Hover Card 悬停安全区/短屏滚动/资料链接语义、工作台实时调参与源码回写解析兼容 |
| 有意调整／排除的能力、依据及影响 | Vue 删除不再需要的内部状态壳 `ContextMenuState.vue`；Svelte `TooltipProvider` 将上下文初始化下沉至 `tooltip-provider-scope.svelte` 以兼容工作台静态 props 解析器；`Drawer`、`NavigationMenu`、`Slider`、`NumberField`、`InputOTP`、`Calendar`、`Resizable` 按原定边界留待后续专项评估，不在本批改动 |
| 视觉变更范围及依据 | 保持 1:1 既有 Linear 视觉规范、圆角、内边距、0.5 px 描边、高亮/选中态与内嵌焦点规则，零主动视觉改动 |

## 2. 能力对照

| 来源能力／行为 | 目标行为／API | 实现位置及依赖 | 差异、理由与影响 | 验证证据／缺口 |
| --- | --- | --- | --- | --- |
| `Tooltip` 悬停延时、快捷键提示、`Provider` 共享配置与键盘聚焦 | `@ui-sdk/{svelte,react,vue}/tooltip`，保留 `TooltipProvider` / `Tooltip` / `TooltipTrigger` / `TooltipContent` / `TooltipPortal` / `TooltipHint` | `docs/src/lib/registry/ui/tooltip/`、`packages/react-ui/src/tooltip.tsx`、`packages/vue-ui/src/ui/tooltip/` | `@ui-sdk/core/tooltip` 始终挂载隐藏内容以维护 `aria-describedby`，包装层在 `hidden` 态移除 `data-slot="tooltip-content"` 防止严格选择器冲突；补充非指针程序化 `.focus()` 展开兜底；Svelte 侧按 `TooltipProvider` 隔离 warm-group 计时，避免画布中固定展开的样例将同页独立悬停样例的 `700 ms` 延迟坍缩为 `0 ms` | 通过（`workbench` Tooltip 调参、React/Vue 预览；React/Vue 折叠侧栏提示框位置存在迁移前已有的高度差，详见第 6 节） |
| `Hover Card` 悬停预览、安全多边形、短屏滚动与链接资料卡 | `@ui-sdk/{svelte,react,vue}/hover-card`，保留 `HoverCard` / `Trigger` / `Content` / `Portal` | `docs/src/lib/registry/ui/hover-card/`、`packages/react-ui/src/hover-card.tsx`、`packages/vue-ui/src/ui/hover-card/` | 补充非指针程序化 `.focus()` 展开兜底；Svelte `HoverCardTrigger` 沿用既有默认 `role="button"`（由资料卡示例显式剥离为链接语义），保证工作台与文档资料卡契约双端兼容 | 通过（`surfaces-alignment`、`navigation-overlays`、`workbench`） |
| `Dropdown Menu` 菜单项、复选/复选组、单选组、子菜单、禁用跳过与分组标题 | `@ui-sdk/{svelte,react,vue}/menu`，保留全部既有子组件与 `DropdownMenuCheckboxGroup` | `docs/src/lib/registry/ui/dropdown-menu/`、`packages/react-ui/src/dropdown-menu.tsx`、`packages/vue-ui/src/ui/dropdown-menu/` | 三端新增 `IN_MENU_GROUP_KEY` 上下文使组外 `Label`/`GroupHeading` 降级为普通样式 `<div>`（避免 SDK 抛错）；新增 `skipDisabledMenuItems` 在方向键导航时跳过禁用项；Svelte 延迟首帧 `open` 至子 `Content` 同步上报 `modal` 策略，防止工作台固定展开菜单误建消费外部点击的 `pointer` 模态层 | 通过（`dropdown-menu`、`navigation-overlays`、`workbench`） |
| `Context Menu` 右键/触屏长按/`Shift+F10`、嵌套 Command 对话子面板与方向键子菜单 | `@ui-sdk/{svelte,react,vue}/menu`（`MenuContextTrigger`），保留全部子组件 | `docs/src/lib/registry/ui/context-menu/`、`packages/react-ui/src/context-menu.tsx`、`packages/vue-ui/src/ui/context-menu/` | 非 `menu` 角色的自定义子面板（如 Issue 状态 `role="dialog"` + `Command`）在 Svelte 中自动 portal 脱离父 `role="menu"`，避免父菜单原生 `keydown` 截获 `Enter`；区分真实 `Escape` 与 `ArrowLeft` 返回（SDK 两者均上报 `escape-key`），防止子菜单左键返回误触发外层工作台关闭 | 通过（`context-menu-alignment`、`navigation-overlays`、`workbench`） |
| `Menubar` 顶栏横向切换、复选/单选/子菜单与窄屏 Sheet 联动 | `@ui-sdk/{svelte,react,vue}/menubar` + `menu`，保留全部既有子组件 | `docs/src/lib/registry/ui/menubar/`、`packages/react-ui/src/menubar.tsx`、`packages/vue-ui/src/ui/menubar/` | 保留菜单项结构与 `menubar-checkbox-item.svelte` 工作台解析器期望的首个静态类位置；结合第二批 `DialogContent` 嵌套浮层守卫，窄屏下在 Menubar 内部打开 Sheet 后按 `Escape` 仅关闭 Sheet 不误关外层调节器 | 通过（`navigation-overlays`、`p2-editors`、`workbench.test.ts`） |

## 3. 状态与集成设计

- **状态与转换**：三类菜单统一由 `@ui-sdk` `menu` / `menubar` 驱动开关、高亮与受控/非受控勾选状态；`Tooltip` / `HoverCard` 由各自控制器与状态机管理延时展开、悬停保持与关闭。
- **受控／非受控与事件顺序**：Svelte 使用 `$bindable()` + 显式 `onOpenChange`/`onCheckedChange`/`onValueChange` 写回；React 保持 `open`/`defaultOpen`/`checked`/`value` 受控与非受控契约并修正 SSR 属性顺序（匹配既有 `wave-one-contract.test.ts`）；Vue 使用 `v-model` / `v-model:open` / `v-model:checked`。
- **组合与引用转发**：Svelte 保持 `child` snippet 与 `bind:ref`；React 保持 `asChild`（`Slot.Root`）与 `ref` 合并；Vue 保持 `as`/`as-child` 与显式插槽转发。
- **工作台解析与样式变量桥接**：保留 `tooltip-provider.svelte` 无运行时调用的纯 props 结构、`menubar-checkbox-item.svelte` 首类契约、各 `*-content`/`*-item`/`*-separator` 的首 `cn(...)` 位置以及 `--bits-*` 浮层兼容 CSS 变量，保证 85 项工作台源码往返单测零回归。

## 4. 逐项验收

| 维度 | 适用性及理由 | 具体场景与预期 | 实际结果 | 证据／问题 |
| --- | --- | --- | --- | --- |
| 状态与数据 | 适用 | Dropdown/Context/Menubar 单选、复选、子菜单、禁用项；Tooltip 延时与固定展开；HoverCard 资料预览与开关 | 通过 | 三端 Chromium 回归与工作台全过 |
| 表单语义 | 不直接承担表单控件提交；验证组内复选/单选 ARIA 状态 | `aria-checked`（含 `mixed`）、`menuitemradio` 互斥切换 | 通过 | `dropdown-menu`、`context-menu-alignment`、`navigation-overlays`、`p2-editors` |
| 键盘与焦点 | 适用 | 方向键跳过禁用项、`ArrowRight`/`ArrowLeft` 子菜单、`Shift+F10` 聚焦首项、Menubar 左右切栏、Tooltip/HoverCard 聚焦展开、`Escape` 逐层关闭与归焦 | 通过 | `dropdown-menu`、`context-menu-alignment`、`p2-editors`、`workbench`、`navigation-overlays` |
| 无障碍 | 适用 | `role="menu"` / `menubar` / `menuitem*` / `tooltip` / `dialog`、`aria-checked`、`aria-haspopup`、`aria-expanded`、`aria-describedby` | 部分通过 | 自动化 ARIA 断言全过；VoiceOver 实机朗读待补 |
| 输入法与国际化 | 适用 | Context Menu 内嵌 Command 状态搜索与中英文菜单标题 | 部分通过 | 模拟输入通过；真实系统输入法待补 |
| 触摸与指针 | 适用 | 右键定位、触屏长按打开右键菜单、悬停安全多边形移入内容区与离开关闭、外部点击交互 | 部分通过 | Playwright 模拟触屏长按与桌面指针通过；真实触屏设备待补 |
| 异步与生命周期 | 适用 | Tooltip 独立 Provider 延时定时器的建立与 `pointerleave`/卸载清理、工作台重播动画 | 通过 | `workbench` Tooltip / Hover Card / Dropdown / Context Menu 调参 |
| SSR 与 hydration | 适用 | React SSR 契约单测、Vue 服务端渲染单测、SvelteKit 实时 SSR 与生产预览 | 通过 | React 20/20、Vue 9/9 单测、docs SSR |
| 弹层与布局 | 适用 | 320/390 px 窄屏防溢出、Context Menu 子菜单窄屏对齐、Hover Card 短屏内滚动、Tooltip 视口内换行 | 部分通过 | Svelte 全过；React/Vue `navigation-overlays` 折叠侧栏提示框高度断言存在迁移前基线偏差（详见第 6 节） |
| 视觉与适配 | 适用 | Linear 表面色、圆角、内边距、缩进项、通栏分隔线、动效档位、浅深模式、减少动态效果 | 通过 | 样式断言与工作台并排对比通过 |
| 性能与资源 | 适用 | 卸载清理定时器与挂载节点、无 `pageerror` | 通过 | 各 E2E `pageerror` 均为空 |
| 安全与隐私 | 适用 | 无新增危险 HTML 注入或外链请求 | 通过 | 静态审阅 |
| 类型与依赖 | 适用 | `tsc --noEmit`、`vue-tsc --noEmit`、`svelte-check --fail-on-warnings` | 通过 | 三端全部 0 错误 0 警告 |
| 分发与集成 | 适用 | Svelte registry（844 项）、三端共享包构建与预览静态产物 | 部分通过 | 仓库内构建与预览通过；独立外部项目 tarball 安装待统一补验 |

## 5. 验证环境与可重复证据

- **操作系统与浏览器**：macOS，本机 Google Chrome（Playwright Chromium 驱动）。
- **工具链版本**：Node `24.22.2`，pnpm `12.14.0`，Svelte 5 / SvelteKit，React 19，Vue 3，`@ui-sdk/{core,svelte,react,vue}@0.1.0-beta.17`。
- **主题与视口**：浅色/深色、`320 px` / `360 px` / `390 px` / `802 px` / `900 px` / `1200 px` / `1280 px`、`reducedMotion: "reduce"` 与默认动效。
- **独立消费者工程**：待阶段二收尾后统一执行外部临时工程 tarball 安装复验。

| 实际命令／人工步骤 | 预期 | 实际结果与日期 | 测试文件、日志、截图等证据位置 |
| --- | --- | --- | --- |
| `@valar/react-ui` `check` + `test`；`@valar/vue-ui` `build` + `check` + `test`；`docs build:framework-previews` | 0 错误、单测全过 | 通过（2026-11-27，React 20/20、Vue 9/9） | 终端构建与测试日志 |
| `@valar/svelte-ui` `build` + `docs build:registry` + `docs svelte-check --fail-on-warnings` + `vitest run tests/workbench.test.ts` | 0 错误 0 警告、工作台解析单测全过 | 通过（2026-11-28，844 项 registry、85/85 单测） | 终端构建与检查日志 |
| React & Vue Playwright：`popover`、`sdk-popover`、`sdk-color-picker`、`complex-inputs`、`conversation-business`、`form-primitives`、`navigation-overlays` | 除既有折叠侧栏提示框位置基线项外全部通过 | 88/90 通过（2026-11-27，仅 2 项迁移前既有侧栏提示框垂直位置断言未过） | `apps/framework-comparison/tests/` |
| Svelte Docs Playwright：`dropdown-menu`、`context-menu-alignment`、`surfaces-alignment`（Hover Card）、`p2-editors`（Menubar）、`workbench`（全套浮层调节器） | 全部通过 | 通过（2026-11-28） | `docs/e2e/` |

## 6. 交付与结论

- **实现、公共类型及导出**：
  - Svelte：`docs/src/lib/registry/ui/{dropdown-menu,context-menu,menubar,tooltip,hover-card}/`、`docs/src/lib/registry/ui/sidebar/sidebar-menu-button.svelte`、`docs/src/lib/registry/ui/dialog/dialog-content.svelte`
  - React：`packages/react-ui/src/{dropdown-menu,context-menu,menubar,tooltip,hover-card}.tsx`
  - Vue：`packages/vue-ui/src/ui/{dropdown-menu,context-menu,menubar,tooltip,hover-card}/`
- **示例、文档及分发配置**：重建 `docs` registry（844 项）、`@valar/svelte-ui` 及三端静态预览。
- **来源和许可保留**：沿用既有 `LICENSE` 与 `upstream-source-manifest.json`。
- **已知差异与限制**：
  1. `apps/framework-comparison/tests/navigation-overlays.spec.ts:170`（React 与 Vue 折叠侧栏触发器 Tooltip 底部与下方标题顶部间距：`107.5 <= 101`）在迁移前 Radix/Reka 基线上即已存在（原为 `110.5 <= 101`），属侧栏布局与字体行高基线问题而非本批迁移引入；
  2. 非本批范围的复杂交互原语（`Drawer`、`NavigationMenu`、`Slider`、`NumberField`、`InputOTP`、`Calendar`、`Resizable`）继续沿用原稳定底座。
- **未验证项目与下一步**：真实触屏设备、系统中文输入法、VoiceOver 读屏及独立消费者工程 tarball 安装待统一补齐；至此阶段二三大浮层与菜单批次（Popover/Select、Dialog/AlertDialog/Sheet、Menus/Tooltip/HoverCard）全部完成三端向 `@ui-sdk` 的底层收敛，下一阶段可推进文档/组件收尾与独立安装包全量验收。
- **完成判断及依据**：标记为 **部分实现**（三端实现、静态类型、单测与绝大多数桌面/窄屏自动化回归已通过，按规范如实保留真机/读屏/独立安装待验项及 2 项既有侧栏提示框基线断言）。
- **后续更新必须保留的定制与回归场景**：
  1. 三端 `TooltipContent` 在 `hidden` 态隐藏 `data-slot="tooltip-content"`，以及 `Tooltip` / `HoverCard` 的非指针程序化 `.focus()` 展开兜底；
  2. Svelte `Tooltip` 按 `TooltipProvider` 隔离 warm-group 延时与 `pointerleave` 退出，且保持 `tooltip-provider.svelte` 无运行时调用以兼容工作台解析器；
  3. 三端菜单的 `skipDisabledMenuItems` 禁用项跳过逻辑与组外 `Label`/`GroupHeading` 降级；
  4. Svelte `DropdownMenu` / `ContextMenu` 延后首帧 `open` 等待 `Content` 同步上报 `modal` 策略，以及子菜单区分真实 `Escape` 与 `ArrowLeft`（两者均上报 `escape-key`）；
  5. Svelte `ContextMenuSubContent` 对非 `menu` 角色（如 `role="dialog"` + `Command`）自动 portal，防止父菜单截获 `Enter`。
