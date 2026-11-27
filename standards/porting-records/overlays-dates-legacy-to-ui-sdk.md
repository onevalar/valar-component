# 弹层、菜单与日期（第 6–8 批）→ UI SDK

采用转换规范 1.0。2026-11-27，未独立审阅。范围：Valar 既有 React、Vue、Svelte 的原入口，底层目标为 `@ui-sdk/* 0.1.0-beta.17`（Apache-2.0）。来源为 `onevalar/valar-component@6b6fe09` 中 `packages/react-ui/src/`、`packages/vue-ui/src/ui/` 和 `docs/src/lib/registry/ui/`，保留包内 MIT 许可和来源说明。分批以真实组合能力为切换门槛，不用全局事件拦截修复不同库的弹层所有权。

## 原合同与调查范围

| 组件 | 必须保留的原能力 | 目标与验证范围 |
| --- | --- | --- |
| Popover、Select | 受控／初值、Portal、自定义锚点、可取消焦点回调、表单与多选、两级 Escape 与归焦 | 对照本地原实现、正反混用和完整 SDK 的弹层组合；已有 React 混用失败证据。 |
| Combobox、Command | 搜索与选值分离、异步列表、输入法、可选链接与滚动、键盘、归焦 | 优先直接 SDK；不能以替换底层为由删除 Valar 组合能力。 |
| Dialog、Alert Dialog、Sheet | 编辑／确认、焦点限制、取消、异步、菜单和子弹层、四边 Sheet、非模态详情 Panel | 模态组成一个迁移边界；默认未通过组合前不切换。 |
| Tooltip、Hover Card | 延迟、位置与碰撞、键盘、Escape、返回到资料链接、可配置 Portal | 核对现有定位与跨层关闭合同。 |
| Dropdown Menu、Context Menu、Menubar、Navigation Menu | 键盘、子菜单、复选／单选、当前链接和 viewport、触屏 | 查直接 SDK 或基于同一 SDK 的菜单组合。 |
| Drawer、Sidebar | 抽屉手势和阈值、方向、锁滚动、桌面折叠、移动 Sheet 与归焦 | 核对 Drawer 及 Tooltip、Sheet、菜单组成的 Sidebar。 |
| Calendar、Range Calendar、Date Picker | 日期类型、周首日、翻月、年月 Select、范围与日期选取、ISO 及粒度和校验 | 核对 SDK 的日历日期模型和日期弹层，不能替换既有期间值。 |
| Color Picker | 32 px 触发器、原生色盘、六位十六进制、草稿输入与错误、预设、表单和归焦 | 直接用 SDK Color Picker 的颜色状态；保留原生色盘及文本草稿；不替换外层 Popover。 |

## 已实现：Color Picker（部分验证）

React/Vue/Svelte 现有 `color-picker` 子路径及 Svelte registry **源**入口不变。使用三端的 `@ui-sdk/<framework>/color-picker` Root 与 Controller，`space="srgb"`、`format="hex"`；SDK 提供表单输入。值输入先在 Valar 层检查是否为 3／6 位 HEX，只有有效色值才传给 SDK。保留受控值、非受控初值（React/Vue）、Svelte 双向绑定及原有值回调。禁用阻止用户修改；不允许无效草稿覆盖现有值。保留原生色盘、预设按钮（含独立 Tab 停靠及 `aria-pressed`）、内描边、文字排版、尺寸与 `contentProps` 的现有 Portal／焦点行为。Svelte 工作台仍通过真实根元素识别预览所属窗口；编辑输入不提前提交 IME 草稿，错误关联到可访问描述。

| 验收维度 | 结果 |
| --- | --- |
| 状态与数据；表单；键盘与焦点；无障碍 | Chromium 覆盖 SDK 预设更新、六位直接提交、短码提交、无效草稿与错误关联、`FormData` 恰好一个 `#rrggbb`、Enter 打开和 Escape 归焦。原生系统色盘的选色、读屏、禁用字段和重置未单独复测。 |
| 输入法与国际化；触摸与指针 | 中文标签、指针预设在浏览器测试范围；系统输入法、RTL、触屏原生色盘未验。 |
| 弹层与布局；视觉与适配 | 三端浅色 900 px、深色 320 px（550 px 高与减少动态效果）；检查 32 px 触发器及弹层左右边界。Svelte 工作台现有回归覆盖并排面板、320／256 px 宽度、页面 Portal、独立表单值与两级焦点。Linear 无对应原生颜色拾取器取样，沿用 Valar 扩展规范。 |
| 异步与生命周期；性能与资源；安全与隐私 | 无异步业务、外部请求或用户 HTML。挂载期间每实例一个 SDK Controller；未作资源基准测量。 |
| SSR 与 hydration；类型与依赖；分发与集成 | 工作区生成后的共享包和文档源均参与验证；未运行独立 tarball/CLI 安装、不重建公开 registry、未做独立 hydration 核对。既有包依赖已含 SDK beta.17；Svelte `meta.json` 明确写明 CLI 依赖。 |

## 仍保留旧默认的原因与后续门槛

以下是源码合同分析，不等于每个 SDK 组件在运行时都已失败。只有 Popover/Select 混用的失败经过实测。

| 组件 | 已核对的 SDK 路径 | 不能直接替换及后续门槛 |
| --- | --- | --- |
| Popover + Select | `popover`, `select` | React SDK 外层 + Radix 内层在焦点进入外来 Portal 时直接关闭；React 反向混用首次 Escape 关闭外层。全 SDK React 普通及自定义 Portal 的选值与两级 Escape 通过；仍须一并适配 Anchor、保留挂载、定位边界、可取消开合焦点及 Select 的表单与多选。见 [React 对照](popover-radix-to-ui-sdk.md)。 |
| Combobox | `combobox` | 直接 SDK 有多选、查询和异步状态，但 Valar 的独立按钮与搜索面板、清空、关闭时归焦、受控选值和候选渲染属于既有合同。要先跑放入旧 Dialog 及菜单中的实际调用，不能通过只换内部 Select 绕过。 |
| Command | `command` | SDK 区分 `query`、高亮 `value`、`onAction`；Valar 还提供链接项、紧凑浮层、弹窗及 IME 键盘保护。需用既有内联、Dialog 与行内菜单组合验证匹配顺序、滚动、组合输入和链接行为。 |
| Dialog | `dialog` | 原样支持旧焦点、Portal、关闭回调以及嵌套 Select、日期和草稿确认，不应只凭单弹层通过切换。 |
| Tooltip | `tooltip` | SDK 自身处理相邻提示的延迟（无 Provider、默认 600 ms），Valar 公开 500 ms Provider、覆盖和禁用、提示的可访问描述与焦点即时显示。先对相邻工具按钮、Sidebar 与其他弹层里的 Escape 做计时和定位回归。 |
| Hover Card | `hover-card` | SDK 默认 600/300 ms 且聚焦也按延迟；既有 Radix/Reka/Bits 有各自 `openDelay`、`closeDelay`、Portal 和外按／Escape 可取消行为。需保留链接触屏入口，核对进入卡片、关闭、溢出滚动及定位。 |
| Alert Dialog | `alert-dialog` | 必须保留初始安全取消焦点、无效遮罩点击、显式 `closeOnAction`／异步重试，且与父 Dialog 和危险项菜单共存。 |
| Dropdown Menu | `menu`／`trigger-menu` | 先证明菜单中禁用、复选、单选、子菜单、只关顶层及菜单触发旧确认框；避免只替换视图变体。 |
| Context Menu | `menu`／`trigger-menu` | 不是可直接换导入的独立子路径；需重现右键／Shift+F10／长按、定位和搜索子面板的焦点边界。 |
| Menubar | `menubar` | 需统一子菜单对象的开合、左右切换和上下移动、单多选、RTL，确认与现有菜单项回调等价。 |
| Navigation Menu | `navigation-menu` | 可单独试点；SDK 无选中值为 `null`，原来用空字符串；不能未经证实更改链接当前标记、受控值、内联与共享 viewport、动画和焦点。 |
| Drawer | `drawer` | SDK 的 `side` / `snapPoints` / `driver` 不等于 Vaul 的方向、拖拽参数和现有快照合同；需测试四向拖动、滚动接力和嵌套/遮罩。暂不切换。 |
| Sheet | `dialog` （模态组合），保留 `Sheet.Panel`（非模态） | SDK 无单独 Sheet 子路径；四边与嵌入的时间线不是同一行为。等待 Dialog 的嵌套、锁滚动、Escape 和归焦合同。 |
| Sidebar | `sheet` 的 Valar 组合、菜单、Tooltip、Collapsible | 无 SDK Sidebar 路径。桌面与移动状态及快捷键保留，移动依赖 Sheet 及菜单，需复验 288 px 抽屉、展开组和菜单归焦。 |
| Calendar | `calendar` | SDK 是 ISO 日期模型。React 公共 DayPicker Dates、`components`、`locale`；Vue/Svelte 使用 `DateValue`，不能直接换类型。须保留年月 Select、窄屏分行、按格自定义、周起始与月份导航。 |
| Range Calendar | `calendar` range mode | 同一 ISO 适配之外，还需证明未完成区间、禁用日期、跨月／受控区间状态与年、月选择器。 |
| Date Picker | `date-picker`（日模式），组合 `calendar`、Popover、输入和 Tabs | SDK 值只有 ISO 日期／两个 ISO 日期／空值，不覆盖 `{ date, grain }` 的日／月／季度／半年／年及交集范围校验。保留现有模型；日模式适配也要等日期网格和弹层合同通过。 |

## 可重复证据

- E2B Linux、Chromium `157.0.8103.78`；pnpm `12.14.0`、React `19.2.3`、Vue `3.5.45`、Svelte `5.57.2`。启动时 shell 实际 Node 为 `26.13.1`，不是仓库固定的 `24.22.2`；后者用于重新运行独立弹层探针及文档测试命令。
- [Color Picker 浏览器门槛](../../apps/framework-comparison/tests/sdk-color-picker.spec.ts)：`pnpm --filter @valar/framework-comparison exec playwright test sdk-color-picker.spec.ts sdk-popover.spec.ts popover.spec.ts` 通过 16/16（Color Picker 6，Popover 原实现 4，React 对照 6；对照含声明的混用失败）。本地用 `VALAR_REACT_URL`、`VALAR_VUE_URL` 指向原生预览，`VALAR_SVELTE_COLOR_URL` 指向 comparison 的 Vite dev（仅开发夹具），`VALAR_TEST_BROWSER` 指向 Chromium。文档源 `workbench.spec.ts -g 'Color Picker editor contains'` 最终单跑通过 1/1；此前并行复跑进程以 137 终止。
- React 包 `check`、Vue 与 Svelte 共享包源码生成通过；Vue 包 `check` 只报告同工作区的 `dist/ui/toggle/Toggle.vue` 中 `modelValue` 的 `null` 类型错误，未改该文件。未跑生产构建。
- React 混用／完整 SDK 的对照为已有 `sdk-popup-family-probe`。Vue 和 Svelte 诊断夹具在 orb 的 `.amp/in/orb-backup/wave68-popover-{vue,svelte}/`，脚本 `wave68-overlay-check.mjs` 用键盘打开、逐级 Escape、指针打开并选中 Lead，输出触发器展开状态、列表可视性、焦点和选值。未添加全局事件修补。
- Vue 和 Svelte 原实现与全 SDK 的代表性组合均通过：第一下 Escape 只关 Select 并归焦 Grouping；第二下关 Popover 并归焦 Display options；指针选值保留外层。Vue 两种混用均在打开内层时失去外层。Svelte 旧外层＋SDK Select 在首次 Escape 关闭外层，指针可更新值但外层仍退出；SDK 外层＋旧 Select 在打开内层或首次 Escape 时关闭外层，指针选择未提交。这里只证明实际双层交互，不证明两组件所有对外属性兼容。
- 第 11 批集成复验：已重新生成 Svelte registry，整站 `pnpm build`、React/Vue 包类型检查及 docs `svelte-check` 通过；Color Picker 工作台用例在生产产物通过。未逐端独立安装并验收 Color Picker，也未重新验证实机或读屏。其余弹层和日期组件不记作已迁，不改变基础目录等级；下一步是三端成组切换 Popover＋Select 并完成公开合同及独立分发验证。
