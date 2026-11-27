# 复杂输入与数据：Svelte → React / Vue

2026-11-27 · 第 4 批 · 十项本地可用，代表场景及独立安装已验，完整环境验收待补。采用[转换规范 v1.0](../COMPONENT_PORTING.md)。基线为 `cfd989c9f63156774dbfb3871cc1fa1774e62ee5` 的 `docs/src/lib/registry/ui/`、`RULES.md` 与对应文档。Svelte registry 与共享包保持不变。

## Table 与 Data Table

来源为 Valar `table/`（MIT）、Issue labels 设置表格和 Data Table 指南。React 19.2.3 与 Vue 3.5.45 不需要底层表格依赖：复用真实 HTML table、Valar 样式与现有 Checkbox／Button／Input／Empty。仅 Data Table 指南的消费端引入 TanStack React Table 9.0.0／Vue Table 9.0.0（MIT），与来源 Svelte Table 主版本相同；不把这两个适配器加入 SDK。未独立审阅。

| 来源能力 | 目标行为和有意差异 | 验收计划 |
| --- | --- | --- |
| `Table` 根包装和可选 `scrollLabel` | React 属性／ref 与 Vue 属性／ref 转发给真实 `<table>`；给滚动容器命名才产生 Tab 停点。原生方向键滚动，不写键盘监听。 | 默认与 320 px、宽列、内部水平滚动和页面无溢出；Tab 与箭头测试。 |
| 表头、表体、表尾、单元格、标题 | 保留 `thead/tbody/tfoot/tr/th/td/caption`、scope、span 与 ARIA 等属性；React children／Vue slot。仅表格布局，不模拟 grid 焦点。 | 浏览器核对标题和结构、列标题、表尾以及排序 ARIA。 |
| 设置变体、选择态和相邻控件 | `appearance="settings"` 直接使用同一组 Valar token 与尺寸；宿主写 `data-state="selected"`、列选择控件和可访问状态。 | 32 px 表头、44 px 记录、高对比内焦点、相邻复选和标签、浅／深与 RTL 复核。 |
| Data Table 指南 | 排序、筛选、分页、选中、列显隐由 TanStack 维护；原生 UI 组合，不发布 `data-table` SDK 子路径。 | 非对称排序、筛选到空／重置、跨页选择稳定 ID、列显隐、独立安装与文档复制。 |

适用：公开类型、布局、键盘、选中数据与 SSR 表格结构。表格不是可编辑 grid 或表单控件；指南的筛选是标准 Input，异步分页由调用者配置，默认示例使用本地记录，无网络或持久化。真实读屏、跨环境、完整 RTL 或 hydration 没有证据前标待验。

Chromium `complex-inputs.spec.ts` 的 **4/4** 个表格检查涵盖 320 px 设置表格的键盘横滚、32／44 px 行高、名称与选择，以及两边 Data Table 的排序、筛选、空结果恢复、跨页选中和列显隐。桌面浅色与深色 320 px 预览已目检；表格维持内部横向滚动，选择状态移到滚动区外。

## Command 与 Combobox

来源 `command/`、`combobox/`、相应 RULES、内联／紧凑／弹窗示例和对齐测试；交互参照 Bits UI 2.20.0（MIT）。两端复用已有 Dialog、Popover、Input Group 与 Valar 样式，不新增依赖。React 拒绝 `cmdk@1.1.1`：它以同一 `aria-selected` 标志寻址键盘高亮，不能表达选中的值和当前高亮不同的情况。Reka 2.10.5 没有等价的 Command。

| 来源能力 | 原生行为与差异 | 证据 |
| --- | --- | --- |
| 内联、紧凑筛选、命令弹窗；分组、禁用、空／加载、链接、快捷键提示 | 保留命名子组件；React children／`trigger`，Vue slot／`#trigger`。输入、可见选项和活动 ID 分开，原生链接可导航，调用者决定执行、关闭和快捷键。React 选初始最佳匹配后按 DOM 顺序导航；Vue 按编写顺序；均不复刻 Bits 模糊排序、grid 或实例接口。 | 公开示例的名称、自动聚焦、Unicode 筛选、合成 IME Enter、正常 Enter、关闭归焦；隔离夹具另验链接、禁用、长列表和嵌套。 |
| Combo 单选、多选、清空、选项自定义、关键词及远程状态 | 值为稳定 ID 数组；React `value/onValueChange`，Vue `v-model`。`aria-selected` 表达选中，`aria-activedescendant` 表达键盘高亮。单选关闭归焦，多选仍打开。独立控制 query/open；关闭清空搜索，远程请求、取消、重试和缓存由宿主拥有。无原生表单序列化，跟随来源组合。 | 两边公开预览验单、多选、清空、Escape；隔离 React 8 场景与 Vue 40 检查另外覆盖同名不同 ID、受控选项、异步取消和忙／失败状态。 |

在隔离夹具通过内联／闭合 SSR/hydration 冒烟，不代表打开 Portal、任意 SSR 宿主或真实系统 IME。跨浏览器、实机触屏、读屏、完整 RTL 和大列表性能仍未完全验证。

## 日期与数值

| 来源能力 | 原生行为与差异 | 证据 |
| --- | --- | --- |
| Date Picker 解析并区分日／月／季度／半年／年、范围内选择、清空和归焦 | 以 `Timeframe` ISO 民用日期字符串与粒度为值；React DayPicker 和 Vue Reka Calendar 只作面板适配，不改变宿主的值格式。精确日期校验真实日历；粗粒度与边界有交集时可选。和来源一样，宿主负责其表单提交。 | 两边示例验无效闰日、下边界外日期、与上边界相交的季度、合成 IME Enter、选择结果、清空和归焦；320 px 深色审阅粒度、日历和页脚。 |
| Number Field 编辑任意中间字符串、步进与原生表单 | 使用已有 Svelte 依赖的地区解析器 `@internationalized/number@3.6.9`（Apache-2.0）。编辑字符串与数字分离；Enter/失焦吸附到由 min 决定的步长网格并限制范围。以未本地化数值提交，支持 HTML 约束、显式 `form`、禁用、省略、只读和可取消重置。 | 公开示例在 `de-DE` 从 `-` 经非法状态到 `1,6 → 1,75 → FormData 1.75`；另测步进和重置。隔离夹具验证只读、禁用、IME 提交、验证失败和重置取消。 |
| Slider Field 轨道、数值框与单位 | 复用同 SDK 的 Slider 与 Number Field。非法或越界草稿保留原已接受值；可解析的越界内容在 Enter/失焦被 Number Field 限幅。单位只用于展示。 | 公开示例验非法和越界草稿不移动滑块，Enter 限幅，滑块方向键回写数字。隔离夹具测量 32 px 控件、4 px 轨道、12 px 相邻间距及较窄 RTL。 |

## 标签、验证码、步骤、颜色与表单

| 来源能力 | 原生行为与差异 | 证据 |
| --- | --- | --- |
| Tags Input 草稿、标签、分隔／粘贴、重复／数量限制、随后删除 | 复用原生输入语义及同名隐藏字段；标签、草稿可分别控制；拒绝的草稿保留，支持键盘与手动删除、重置、禁用和只读。未采用 Reka Tags Input，以保留选区感知粘贴、只读及校验序列化合同。 | 两边示例验重复反馈、合成 IME Enter、增删及删除后焦点。 |
| Input OTP 单输入和装饰槽、选择与粘贴 | 一个真实文本输入支撑 `one-time-code`、原生键盘/选区、正则及粘贴转换器，装饰槽不创建第二个输入；不模拟密码管理器徽标，也不自动在移动光标时选择下一字符进行覆盖。 | 两边示例验真实输入唯一、选中区替换拼接、导入删除及完成提示。操作系统自动填充待验。 |
| Stepper 前进门禁、回退保留、线性或自由模式 | 已访问面板保持挂载；React render function／Vue scoped slot，`beforeChange` 支持异步校验和 `AbortSignal`。受控跳转和变化时抛弃旧校验；只维护步骤，不提交业务数据。 | 两边示例验拒绝越级、错误提示、通过时内容聚焦和回退保留；异步竞态另用隔离夹具。 |
| Color Picker 色块与名称、原生色盘、HEX 草稿／预设 | 复用 SDK Popover；区分编辑中的文本与归一化颜色。精简为 HEX，不将操作系统色盘的跨浏览器外观作为 SDK 合同。跟随来源，只提交已确认的 HEX。 | 两边示例验预设状态、非法 HEX 不提交、缩写展开和 Escape 归焦。 |
| Formsnap／Superforms 表单辅助 | Svelte 原用法保留；`/docs/forms` 和 `/zh/docs/forms` 中的 React/Vue 指南以原生 form、FormData 与 Valar Field、Input 和 Button 组合说明、错误与焦点。不是 SDK `form` 子路径，不扩大示例为服务端校验方案。 | 两边真实表单验错误描述、错误聚焦、Enter 提交和重置；文档切换将保留各框架对应内容。 |

## 验收结果与边界

- Node 24.22.2、pnpm 12.14.0、React 19.2.3、Vue 3.5.45，Linux Chromium。`pnpm --filter @valar/react-ui --filter @valar/vue-ui build` 与两包 `test` 通过（React 16、Vue 8）。用各包 `pnpm pack` 得到 `valar-{react,vue}-ui-0.1.0.tgz`；两个独立 Vite 工程用 `pnpm --ignore-workspace install` 安装 `file:` tarball，模块实路径为独立工程的 `.pnpm`，不是 workspace 链接。两端类型和生产构建通过；Vue 独立夹具按上一批协议用 Tailwind `source(none)` 加 `@source "./"` 将应用侧扫描限定在 `src`，仍导入 SDK 的共享主题和包内样式。
- `@valar/framework-comparison` Chromium **118/118**，包括独立 tarball 预览的 24 项新增与 Svelte 在内的 94 项既有回归。`complex-inputs.spec.ts` 的 Date Picker 断言在修复前两端均为 2 行；布局调整后均为 1 行且 320 px 页面无溢出。Vue Color Picker 改用面板内标签覆盖 Reka 回退名称，选择预设后名称仍是「工作区强调色」。日期夹具还验证了 `Pacific/Apia` 的跳日 `2011-12-30`；目标 `timeframeEnd` 回传含端点的 ISO 字符串，而非 Svelte `CalendarDate`。
- `pnpm --filter docs build:content`、`pnpm --filter docs exec vite build` 和 `pnpm --filter docs check` 通过（134 份双语校验，0 错误／0 警告）。生产预览 15 项文档用法全部通过（14 项同一次；1 项在重启服务就绪后复跑通过），覆盖两框架十项代码、Forms／Data Table、Svelte 默认及窄屏。额外通过 Chromium 触屏模拟的 Forms 导航及搜索用例。Cloudflare adapter 提示部署路由排除项超限；本批未部署。
- 浅／深与窄／宽已抽验；桌面 Chromium 检查焦点／键盘／原生表单、模拟组合输入／选区、嵌套弹层、异步竞态及图文间距。触摸适用于弹层控件等但未做真实设备全覆盖；操作系统 IME、SMS 自动填充、系统色盘、读屏、跨浏览器、完整 RTL、任意宿主的 SSR/hydration 及大列表性能仍待验。异步适用于 Command/Combobox 宿主与 Stepper 门禁；表格/纯数值不自行发请求，组件不引入外部数据服务或跟踪。
