# Switch / Checkbox · Bits UI、Radix、Reka → UI SDK

2026-11-27 · **首批正式入口已迁移，定向回归和独立安装通过。** 按[转换规范 1.0](../COMPONENT_PORTING.md)执行。基线为 Valar `6b6fe09`，React 19.2.3 / Vue 3.5.45 / Svelte 5.57.2。UI SDK Core 和三个适配器统一固定 `0.1.0-beta.17`（Apache-2.0）；`0.1.0-beta.18` 只在隔离原型测试，不使用 SDK 演示主题或代理集成。改动在工作区，尚未发布。

## 正式替换与迁移边界

- `@valar/{react,vue,svelte}-ui/{checkbox,switch}` 及 Svelte registry 的 `checkbox`、`switch` 保留原入口和 Valar 主题；三个 `checkbox` 入口新增 `CheckboxGroup` 命名导出。独立控件都用 SDK 处理状态与交互，由原生表单输入保留现有提交与复位语义。React 独立 Switch 复位回初值；已测的 Vue/Svelte 独立 Switch 保留当前值。
- 用 SDK CheckboxGroup 重建组，不读取 Bits UI / Reka 私有组上下文。旧组包裹 Valar Checkbox 的调用须换为 Valar `CheckboxGroup`，给组传 `name`、子项传不同的字符串 `value`。组 `required` 表示至少选一项，复位回 `defaultValue`，提交为同名的多条表单项。若业务要求每一项都必须选，使用独立必填复选框。React/Vue 走 SDK 组与子项，Svelte 通过公开 Core 原语与适配器 parts 接入同一行为。
- 继续保留独立调用的 Enter/Space 区别、半选显示、表单数据及 React 表单 `onChange`；Vue 恢复对象值的括号式表单字段和 `as="span"`。Vue 对象型模型按引用比较，不兼容 Reka 的深相等；任意自定义组件 `asChild`、三端完整 SSR/hydration、实机触屏与读屏尚未验，不以这次回归提升 Linear 基础目录等级。

| 验收入口 | 实测结果 |
| --- | --- |
| `@valar/framework-comparison` 定向 Chromium | 16/16，三端预览中的普通表单与组合，覆盖浅深、宽窄、键盘和复位。 |
| 文档 `checkbox-alignment.spec.ts`／`switch-select-alignment.spec.ts` 定向 Chromium | 5/5，组提交及必填、表格半选和错误、开关普通／紧凑状态及浅深主题的内侧焦点。另查看浅色宽屏初始预览和深色窄屏修改后预览，组与附近控件无裁切。 |
| React／Vue 包合同 | React 包 18 个测试，浏览器 17/17 独立对照；Vue 包 8 个测试，浏览器 41/41 独立对照，另测组的受控值、必填、禁用、复位和全选。 |
| 三端私有 tarball | 同一独立消费者安装三个本地 tarball（Svelte 的私有 primitives 也用本地 tarball）；Vite 生产构建和 Chromium 三端包入口均通过键盘、组必填、`FormData` 与复位。四个 SDK 包均解析到 `beta.17`。 |
| `pnpm --filter docs test:consumer`／`pnpm --filter docs check` | 独立应用用 CLI 实际安装 `checkbox`、`switch`，通过 lint、严格类型检查、生产构建与 Chromium；复选框 14 px、开关 30 px。两个 registry 条目只写实际运行时版本，不把工作区 `catalog:` 带给消费者。文档检查 0 errors / 0 warnings。 |

下一批可并行复用本次的合同和打包验收，先做 Separator/Label、Collapsible/Accordion、Radio Group；之后按 Toggle/Toggle Group、Tabs 推进。Popover 与 Select 仍以弹层族为迁移单元，不能用单组件测试代替嵌套和归焦验收。

## 组件合同和实测差异（早期原型）

| 组件与能力 | Valar 基线 | SDK `/switch` / `/checkbox` 候选与处理 |
| --- | --- | --- |
| Switch：默认按钮在表单内的 Enter | 三端切换一次，不提交 | 三端未切换而提交；局部 `keydown` 保留调用方取消，再触发按钮点击，恢复该用例。不是推荐在表单或 document 全局拦截。 |
| Switch：提交、表单归属与复位 | 内联 `name/value` 随状态进入表单；外部 `form` 样例仅 React/Vue 提交。React 受控样例复位会通知宿主回到初值；React 的 `type="submit"` 能提交。 | 普通值匹配；Svelte 外部关联开始提交值。React 受控样例复位后保持选中；`type="submit"` 的指针激活不提交。局部 Enter 处理不修复这些差异。 |
| Switch：React 表单合成 `onChange` | 点击切换一次，父表单收到一次变更。 | 表单收到零次。Core 写入隐藏输入后发原生 `input`/`change`，不等价于 Radix 的输入桥；仅改 `onCheckedChange` 载荷不能保住父表单监听。 |
| Checkbox：默认按钮在表单内的 Enter | 三端不切换，也不提交；Space 将半选切到选中。 | Enter 不切换但会提交；局部 `preventDefault()` 恢复默认按钮的用例。Space 半选转选中通过。 |
| Checkbox：处于半选时的 `FormData` | 对照用例 Vue 提交 `subscribe=weekly`，React/Svelte 不提交。 | 三端都不提交半选值；不能在保留旧合同的情况下静默统一。 |
| Checkbox：半选初始值，选中后按 Reset | React 回到半选；Vue/Svelte 在该用例中仍为选中。 | 三端回到半选。比较的是具体初值、Space 后状态及复位顺序，不概括为所有受控模式。 |
| 两者：类型、引用与自定义渲染 | React 的 button ref，Checkbox `asChild` / children；Vue `as/asChild` 和 slot，Switch 还含非布尔 `trueValue/falseValue`；Svelte `bind:ref`、Checkbox 分离的 `checked/indeterminate` 绑定与回调。 | 不能把 SDK `render` 或布尔／半选模型原样暴露。尚未实现 Valar 参数、插槽和元素引用的完整映射。 |

## 实现边界与验收

- 先以 Valar 对外语义为预期，判断是否有 SDK 公开能力能配置键盘、事件桥、序列化及复位。不把内部 Core 路径、React DOM 私有状态或反复补发事件带进组件。半选提交与外部 `form` 如需有意统一，另记破坏性影响；本批不改变现状。
- 已执行：三端默认和半选 ARIA、Enter、Space、原生表单值及重置；React 的指针、取消默认 Enter、合成表单事件与受控重置。键盘最小适配通过，表中其余差异仍在。现有公用预览增加 Enter 回归。
- 尚未验收候选：表单 required／disabled／重复字段名、受控值动态变更和完整事件顺序、标签关联与 ref、自定义渲染、真实触屏和读屏、RTL、SSR/hydration、布局／焦点／浅深主题／窄屏和包体。界面铺开后在设置行与表格半选场景量相邻间距、验证无裁切和内侧焦点。没有文本输入法、弹层定位、网络或数据传输需要在这两个控件中实现。
- 分发未替换：Svelte 文档及 registry `switch`、`checkbox` 和 `@valar/svelte-ui/<slug>`，React/Vue `@valar/{react,vue}-ui/<slug>` 与使用示例全部沿用原实现。已验证的是 SDK 四件套的隔离 npm 安装；**不是**三端 Valar tarball 或 Svelte CLI 安装验收。候选保住合同后才加入正式依赖、在 registry 产物写实际精确版本，再测三个独立消费端。

## 可复验证据

| 检查 | 实际结果 |
| --- | --- |
| `node .amp/in/orb-backup/valar-sdk-controls/check.mjs`，Chromium，每个版本三端 × 原实现、裸 SDK、加局部键盘处理共 9 个配置 | `beta.17` 及 `SDK_PROBE_URL=http://127.0.0.1:5333` 的 `beta.18` 观察日志逐行一致。日志位于试验目录与 `.amp/in/orb-backup/ui-sdk-beta18/chromium.log`。脚本通过表示复现预期的通过和失败，不表示候选等价。 |
| `pnpm list @ui-sdk/core --depth 3 --ignore-workspace`，`beta.18` 的独立目录 | 三个适配器均解析到同一 `0.1.0-beta.18` Core。Switch / Checkbox 三端公开声明与 `beta.17` 未见差异；未批准安装随包 agent skills。 |
| `pnpm install --lockfile-only --frozen-lockfile --offline`，工作区 | 14 个项目通过；工作区保持 `beta.17`。 |
| `pnpm --filter @valar/framework-comparison test`，定向运行 `first-batch.spec.ts` 的表单用例和 `form-primitives.spec.ts` 的 Switch 用例 | 16/16 通过。Checkbox 三端、Switch React/Vue，覆盖浅深和宽窄视口；验证原 Valar 的 Enter、Space、提交和重置。 |

结论：`beta.18` 不解决已观测的兼容差异，不升级，不用薄包装器替换正式组件。

## 原生表单桥复验

React 原型只使用 `@ui-sdk/core/{switch,checkbox}` 和 `@ui-sdk/react/primitive` 的公开能力。Core 处理切换，Valar 兼容层使用真实的复选 input 处理 `FormData`、原生校验与复位；默认按钮动作交给浏览器，显式提交不会被 SDK `press` 的 `preventDefault()` 吞掉。表单事件区分用户点击、稍后接受的受控值和直接修改外部 props，不读取 React DOM 私有状态。`node .amp/in/orb-backup/react-toggle-bridge/check.mjs` 得到 **17/17** 对照点一致，比较了 ARIA 状态、实际表单数据、焦点和事件顺序。包括半选、重复字段名、外部表单、阻止冒泡及取消、受控和非受控重置、必填、禁用、`asChild` 与引用样例。它尚未替换 React 共享包。

Vue 原型使用公开的 `usePrimitive`／`usePart`、SDK Thumb／Indicator 和原生复选 input。`node .amp/in/orb-backup/vue-toggle-bridge/check.mjs` 在两版各匹配 **38/41** 个对照点，覆盖半选提交及复位、非布尔 Switch 模型、外部表单、重复名字、必填、禁用、事件和浅宽／深窄计算样式。3 个失败点来自两个兼容差异：对象 `value` 原先提交 `structured[channel]=email` 和 `structured[frequency]=weekly`，原型提交 `structured=[object Object]`；`as="span"` 原型仍渲染按钮，改变焦点与 Space 行为。两版隔离构建及 `vue-tsc` 通过；`asChild`、引用、Reka Group 与其方向键焦点管理等仍未验收。

Svelte 原型使用同一 Core 和公开 Svelte 适配器。`node .amp/in/orb-backup/svelte-toggle-bridge/check.mjs` 在 `beta.17` 和 `beta.18` 各通过 **47/48** 项：15 项独立控件合同和 32 项计算样式对照（1280／390 px，浅／深，含选中、半选、禁用、必填和焦点）；裸 SDK 负控在两版均复现。运行脚本因 1 项组互操作失败而返回非零。两版隔离原型均通过 Vite 构建和 `svelte-check --fail-on-warnings`；计算样式对照不等于实际组合布局验收。

**Svelte 旧复选组阻止直接切换。** 用 `name="options" value={["first"]}` 的 Bits UI `Checkbox.Group` 包裹 `<Checkbox value="first" />`，旧 Valar 初始选中并提交 `options=first`；SDK 版初始未选中且没有该表单项。旧组件通过 Bits UI 内部 `CheckboxGroupContext` 继承 `name`、值、必填、只读和禁用状态。Bits UI 2.20.0 的包导出不包含该模块，`import.meta.resolve("bits-ui/dist/bits/checkbox/checkbox.svelte.js")` 返回 `ERR_PACKAGE_PATH_NOT_EXPORTED`；也检查了当时最新的 npm tarball 2.22.0，Checkbox 仍只导出 `Root`、`Group`、`GroupLabel`。Valar 没有导出自己的 `Checkbox.Group`，但沿用的根 props 类型明确描述了这种组合。不能靠读取私有上下文、扫描 DOM 属性或静默丢弃表单值来迁移。UI SDK 自带的 CheckboxGroup 也不是可直接替换的组：它的 `required` 要求至少选一项，旧 Bits UI 把 `required` 继承到每个子项。

这些是独立原型的历史结果。正式替换采用本记录开头的 Valar `CheckboxGroup` 迁移路线，不支持与旧复选组混用。
