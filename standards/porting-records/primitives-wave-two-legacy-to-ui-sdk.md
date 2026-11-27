# Separator、Label、Collapsible、Accordion、Radio Group：旧原语 → UI SDK

五项组件在 React、Vue、Svelte 的原入口改用 UI SDK 原语，保留 Valar 样式和主题。本文记录定向验收与兼容边界，不提升既有 Linear 对齐等级。

## 1. 范围与依据

| 项目 | 内容 |
| --- | --- |
| 规范、日期、审阅 | [转换规范 1.0](../COMPONENT_PORTING.md)，2026-11-27，Amp 实施和集成；未独立审阅。 |
| 范围、基线 | 用户要求直接采用 SDK 已有原语，同时保留 Valar 设计；本批仅五项，基线 `6b6fe09` 的 `packages/react-ui/src/`、`packages/vue-ui/src/ui/` 和 `docs/src/lib/registry/ui/`。 |
| 原语和许可 | 使用 SDK 的 `separator`、`label`、`collapsible`、`accordion`、`radio`。Core 和三个适配器统一锁定 `0.1.0-beta.17`（Apache-2.0）；Svelte 输出使用 `svelte-toolbelt@0.10.6` 转换内联样式。未复制 SDK 源码，保留 Valar 及原依赖的许可与来源记录。 |
| 视觉和公共入口 | 不导入 SDK 演示主题，不调整 token 或目录等级。保留三端子路径、Svelte registry 同名条目、中英文文档及项目属性、设置行等既有示例。 |

## 2. 能力与兼容边界

| 旧能力 | 新实现和边界 | 验收证据 |
| --- | --- | --- |
| Separator 横／纵、装饰和可访问语义 | SDK Separator 处理语义，Valar 继续给两轴 0.5 px，并在渲染时转发组合自定义 slot。React `asChild`、Vue `as`、Svelte `child` 均可换渲染元素。装饰线只保留 `data-orientation`，不输出 `aria-orientation`。 | React/Vue 预览、Svelte 文档及三端 tarball。 |
| Label 原生关联、必填、禁用和 Field 组合 | SDK Label 实际渲染 `<label>`；Valar 在适配器渲染时保留 `field-label` 等自定义 slot，否则 SDK 会覆盖它。普通标签保留星号；自订子节点时按子节点约定渲染。 | 浅深 Field 和 Label 文档、三端真实点击聚焦。 |
| Collapsible 受控／默认状态、项目属性、组合触发 | SDK 管理开合；复用 Valar 的 28 px 属性触发、图标、焦点和内容布局。保留原语义属性及绑定，Valar 映射 panel 几何变量和旧状态选择器。 | Chromium 指针、Enter／Space、禁用、浅深宽窄、减少动态和焦点检查。 |
| Accordion 单项／多项、状态和禁用 | SDK 管理开合并用数组表示选中项；Valar 保留单项字符串、多项数组与焦点合同。SDK 不提供方向键和 Home／End；Valar 在当前 Accordion 根内补齐，跳过禁用项，不改变选中面板。 | 三端包键盘和单开、React/Vue 预览、Svelte 窄屏与禁用回归。 |
| Radio Group 互斥、方向、Label、表单 | SDK 管理选值、roving focus 和原生表单；Valar 保留单轴导航和 Enter 不提交。非空 `name` 才参与提交／必填，未选或禁用项不提交。Chromium 仍可能将选中后禁用的选项视为有效；要求提交有效选项时，业务应在禁用时清除该值。Home／End、Vue 旧 `asChild`／可取消 `select`、Vue/Svelte `autocomplete` 文本代理不保留；用 DOM `dir` 代替旧方向 Provider。 | React/Vue 浅宽和深窄、Svelte 文档、三个 tarball 与 CLI 新装；细则见 [Radio Group 规则](../../docs/src/lib/registry/ui/radio-group/RULES.md)。 |

## 3. 逐项验收

| 维度 | 结果与证据 |
| --- | --- |
| 状态与数据 | 通过：折叠开合和禁用、Accordion 单开切换、Radio 箭头跳过禁用并更新选中。 |
| 表单语义 | 通过：Label 触发对应控件、Radio 提交选中值，折叠触发不提交。独立包和 CLI 都使用真实表单。 |
| 键盘与焦点 | 通过：Collapsible Enter／Space 保持触发器焦点，Accordion 方向键／Home／End 导航，Radio roving focus。 |
| 无障碍 | 通过定向 DOM：关联名称、`aria-expanded`、单选组和装饰分隔线不进入可访问树。读屏实机未验证。 |
| 输入法与国际化 | 无 IME 交互；中英文文档同步。RTL 及跨平台读屏未作完整覆盖。 |
| 触摸与指针 | Chromium 宽窄视口验证点击和相邻状态；实机触屏未验证。 |
| 异步与生命周期 | 无异步业务；SDK 管理面板开合与隐藏，减少动态下实测。面板内表单持久化、自定义挂载和浏览器页内查找未做完整组合覆盖。 |
| SSR 与 hydration | 独立 SvelteKit 生产构建和文档导航通过定向检查；三端完整 SSR/hydration 矩阵未验证。 |
| 弹层与布局 | 无新增弹层。项目属性的 28 px 高、3 px 图标间距、展开后与下方控件不遮挡已量测。 |
| 视觉与适配 | 已检查浅深 Label 必填／禁用、Radio 选中／禁用、横纵分隔、项目属性和窄屏 Accordion；不是对所有场景重新做 Linear 整体验收。 |
| 性能与资源 | 未跑基准；没有同时挂载旧交互原语和 SDK 交互原语。 |
| 安全与隐私 | 不适用：本地展示和表单行为，无新网络、存储或权限。 |
| 类型与依赖 | CLI 独立 Svelte 严格检查 0 errors / 0 warnings；registry 显式写可安装运行时版本，不输出 `catalog:`。 |
| 分发与集成 | 通过：同一独立 Vite 消费者以三个本地 tarball 导入五个公共子路径；独立 CLI 从 registry 安装同名五项并构建。 |

## 4. 可重复验收和交付边界

- Linux orb，Node 24.22.2、pnpm 12.14.0、Chrome for Testing 157.0.8103.78、React 19.2.3、Vue 3.5.45、Svelte 5.57.2。`pnpm build:cli` 和 `pnpm --filter docs build:registry` 生成本地分发物；仓库的 `framework-comparison` 定向测试覆盖 `content-layout.spec.ts`、`form-primitives.spec.ts`、`separator.spec.ts`（16 项）。
- Svelte 文档定向浏览器回归：Label／Field 和 Separator 6 项、项目属性与 Accordion 6 项、样式工作台 3 项、Radio 选择卡 1 项。工作台的安装样式、默认参数与运行时合同覆盖 `tests/workbench-layout-editors.test.ts` 和 `tests/workbench.test.ts`，共 93 项均通过。切换原语时更新了工作台读取 Accordion、Collapsible、Separator 默认样式的入口。
- `pnpm --filter docs test:consumer` 创建独立应用，用本地 CLI 和 registry 安装，严格检查、生产构建和 Chromium 通过。Radio 另有三框架源码合同 `.amp/in/orb-backup/radio/browser-check.sh`（每端 24 个断言），覆盖父值同步、拒绝选值、必填、外置表单、复位、只读和方向键。
- 各包用 `pnpm pack` 生成 tarball，不链接 workspace 组件；隔离消费者 `.amp/in/orb-backup/sdk-wave2-smoke` 的 `check.mjs` 构建后实测三端：点标签聚焦、纵分隔线 0.5 px、单选跳过禁用后 `FormData` 为 `b`、折叠开合及焦点、Accordion 方向键与单开。应用固定 React/Vue/Svelte 和对应 SDK 运行时；Svelte primitives 也由本地 tarball 安装。
- React 的 Radix Slot／方向上下文和 Vue 的 Reka 类型／方向与 ref 辅助仍用于兼容旧入口；不再使用旧库实现五项的开合、选中或分隔语义。SDK 生成的默认 DOM ID 不作为 Valar API。其余未迁移组件的旧原语依赖不在本批移除。升级 SDK 时重跑组合 slot、窄屏折叠、单选表单和独立安装；上述兼容缺口不视为完成。
