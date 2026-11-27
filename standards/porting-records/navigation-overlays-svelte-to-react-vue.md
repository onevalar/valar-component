# 菜单、弹层与导航：Svelte → React / Vue

2026-11-27 · 第 3 批 · 本地可用，代表场景通过，完整转换仍待验证。采用[转换规范 v1.0](../COMPONENT_PORTING.md)。基线是 `cfd989c9f63156774dbfb3871cc1fa1774e62ee5` 的 `docs/src/lib/registry/ui/<slug>/`、`RULES.md`、文档预览与 E2E。保留 Svelte registry、共享包和文档默认选项。本记录未独立审阅。

React 19.2.3 用 Radix（`radix-ui` 1.8.1）；Vue 3.5.45 用 Reka 2.10.5；两边复用 Valar theme、Dialog、Button、Tooltip、Kbd、Separator 等已有组件。Drawer 使用原生 Vaul 1.1.2／Vaul Vue 0.4.1，保留原引擎的手势与吸附；Sonner 使用 Sonner 2.0.8／Vue Sonner 2.0.9 的原生队列。源码和依赖为 MIT（图标随各包既有许可），见 React `NOTICE.md` 与 Vue `PROVENANCE.md`，后者保留 Vaul Vue 对应源码版本的完整许可。

## 公开能力、差异与代表场景

下表入口分别为 `@valar/{react,vue}-ui/<slug>`，同时从各包根导出。`apps/{react,vue}-preview/src/examples/<slug>` 是预览和 `/docs/components/<slug>?framework=react|vue` 上可复制示例的同一份源码。

| 子路径 | 合同和框架差异 | 实际验证与边界 |
| --- | --- | --- |
| `alert-dialog` | 命名的模态确认、危险及紧凑外观；默认聚焦 Cancel，支持调用者接管。危险操作不自动关闭；等待期间阻止重复激活，是否允许取消由受控状态的宿主决定。不同于 Svelte 的可配点外策略，两个适配均阻止点外误关。 | 320 px Dark：取消、点外、提交与归焦；源夹具验证 pending、失败后重试及成功关闭。未覆盖全部尺寸与受控相互组合。 |
| `context-menu` | 原生点定位和长按，键盘 Shift+F10 使用焦点锚点，子菜单 Escape 一层一层关闭；支持 elevated 容器和自定义 Portal。未复制 Svelte 极窄时偏好下方的定位算法。 | 320–375 px 深色碰撞、独立滚动、方向键进入及两级归焦；源夹具含右键。搜索式子面板的初始输入焦点及真实长按待验。 |
| `drawer` | 保留四向、拖动、归焦、禁用关闭和吸附等 Vaul API，底部显示拖动柄。Vue 默认将焦点送到抽屉容器而非输入框，调用者可覆盖。 | 390 px 下方拖动关闭、右侧关闭、初开焦点与归焦通过。嵌套根能编译；没有逐项测试嵌套、吸附点、软键盘和实机手势。 |
| `dropdown-menu` | 普通项默认关闭，复选／单选默认保持打开，保留半选、组值、显式关闭策略、表面样式和分层 Escape。跨关闭保留选择时由宿主提升模型。 | Chromium 浅色切换复选、菜单保持、刷新关闭并归焦；源夹具另验半选、触发宽度、内容宽度、子菜单碰撞和自定义触发器。 |
| `hover-card` | 聚焦或悬停展示补充信息，带延迟；原始链接在不触发预览时可用。Vue 原语另有 `enableTouch` 选项。 | 宽窄视口的焦点、时序和档案表面；源夹具在 Chromium 触摸仿真中验证链接仍能导航，未测真实手机。 |
| `menubar` | 命名条、相邻菜单方向键移动、快捷键文字和菜单选择；宿主决定快捷键注册和移动端替代导航。 | ArrowDown 入菜单、ArrowRight 跳转、Escape 还原焦点；React 源夹具另验嵌套返回，Vue 未单独验其所有嵌套状态。 |
| `navigation-menu` | 默认共享定位区，可关闭改成联动内联导航；当前项使用 `aria-current`，保留原语布局和交互。宿主负责响应式替代导航。 | 深色 320 px 无横溢、活动链接、Projects 打开；源夹具验证共享／内联两种模式。RTL、垂直以及定位矩阵待验。 |
| `sheet` | Modal 四向、标题／说明／关闭按钮；独立 `SheetPanel` 为命名 region，无遮罩及抢焦，内部 Escape 才请求关闭。全局快捷键、触发器关联和父布局由宿主提供。 | 源夹具测四边几何、闭合归焦及内联滚动；独立消费端验证模态 Tab 限制、两种模式焦点、点外非模态仍可用。 |
| `sidebar` | 桌面固定、移出或图标折叠；移动为独立 Sheet。采用宿主可关的 Ctrl/⌘B：不截获输入框及 contenteditable 后代。仅桌面切换写 `sidebar_state`；读取／初始化由宿主负责。 | 900 px 实际主区回收空间、导航行 28 px、图文间隔 6 px、图标模式 tooltip、编辑热键不被截；320 px Dark 移动面板 288 px，保留 active 语义和还焦，不写桌面 cookie。 |
| `sonner` | 原生 toast API 管理队列、ID 替换、撤销与异步结果。工作区皮肤使用 Valar 密度 token；默认跟随 `html.dark`，可显式覆盖。 | 320 px 下同 ID 只有一条、12 px 圆角、Undo 和实时主题，截图核对标题／说明／按钮。未测试真实播报、所有异步组合或多 host。 |

## 验收维度

- **状态与数据、键盘和焦点、弹层与布局：适用，代表场景通过。** React 用受控 props／回调，Vue 用原生模型与插槽；内联和模态的 focus policy 分开。菜单或 Sheet 内的嵌套组件先处理自己的 Escape。确认和通知动作得由宿主写入实际数据。
- **表单与输入法：**本批没有独立新表单值；弹层容纳可编辑内容，Sidebar 已验编辑时不拦截热键。含搜索输入的菜单、IME、完整 RTL 和地区适配尚未验证，不能以基础键盘结果代替。
- **无障碍、触摸与视觉：适用。** DOM 名称、状态、焦点、浅／深样本、移动尺寸与 Chromium 指针拖动有测试；真实 Safari／Firefox、设备手势、辅助技术播报、完整缩放主题与动效矩阵尚未验证。菜单预览可以覆盖静态背景；侧栏折叠提示不得盖住相邻的表单标签。
- **生命周期与资源：适用，部分验证。** 源夹具测试等待中的重复激活、失败和重试；宿主负责真实网络取消和回退。SSR/hydration、队列压力、长期资源及细粒度体积尚未验证。新增示例不请求外部资源、不处理用户机密或持久化业务数据；桌面折叠只写固定布尔偏好。

## 可复跑证据

- Node 24.22.2、pnpm 12.14.0、Chromium 157、Linux orb。React SDK 类型与单测 **16/16**、Vue SDK 类型与单测 **8/8**；Vue 独立类型检查捕获并修复嵌套 Drawer 事件宏和 Sidebar 尺寸 prop 声明。`pnpm --filter docs check` 为 0 错误、0 警告，134 篇中文文档对照通过。
- 各 SDK `pnpm --filter @valar/<框架>-ui pack`，独立 Vite 工程用 `pnpm --dir <独立工程> --ignore-workspace` 从本地 tarball 安装；解析到各自的 `node_modules/.pnpm` 而非 monorepo 软链。React/Vue 类型及 Vite 生产构建通过。
- `pnpm --filter @valar/framework-comparison exec playwright test`：使用两个 tarball 的生产预览和现有 Svelte 对照，**94/94**（其中 `navigation-overlays.spec.ts` **16/16**）。侧栏示例的最后一轮布局调整后，两端生产消费端重建，16 项弹层与导航测试再通过，包含提示不遮挡 Issue title 和键盘触发刷新。独立源夹具额外覆盖 React 7 组、Vue 8 组原语；14 个菜单和弹层用例另于 320×350 运行。
- `pnpm --filter docs build:svelte` 最终示例生产重建通过；`pnpm --filter docs exec playwright test --config playwright.usage.config.ts` 在该产物通过 **13/13**，其中两组覆盖本批 20 个原生入口，另含原 Svelte 默认、切换、复制和窄屏回归。
- 实际捕获并复核侧栏默认／图标折叠／320 px 深色移动样本、菜单层叠和深色 toast。Dropdown Menu 指针录制经过相邻选项，勾选后不关闭，点击刷新才关闭且状态计数变成 1。

本批不改变基础组件目录原有 Linear 验收等级，不声明完整设备／变体对齐。未提交、推送、发布或部署。下一批从 Command 与依赖它的 Combobox 开始，继续复杂输入、表格与表单示例。
