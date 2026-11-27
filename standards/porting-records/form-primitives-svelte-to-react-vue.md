# 高复用表单与交互原语：Svelte → React / Vue

2026-11-27 · 第 1 批 · 本地可用，代表场景通过 · [转换规范 v1.0](../COMPONENT_PORTING.md)。Svelte 源码及各自 `RULES.md` 位于 `docs/src/lib/registry/ui/`，基线 `cfd989c9f63156774dbfb3871cc1fa1774e62ee5`（MIT）。默认外观、Linear 对照和各布局尺寸以 [设计规范](../DESIGN.md) 与 [对齐清单](../LINEAR_ALIGNMENT.md#33-项基础组件尺寸复核) 为准。既有 Svelte API、registry 和 `@valar/svelte-ui` 不变。

React 19.2.3 + Radix、Vue 3.5 + Reka 2.10.5；共享 Tailwind 4.3.3 构建期样式。新实现取自 Valar 合同，复用现有 Button、Input、Select、Separator 及原生语义，不带 Bits UI 或 Svelte 运行时。依赖许可见两包 `LICENSE`、`NOTICE.md` / `PROVENANCE.md`。目前以 Linux orb、Node 24.22.2、pnpm 12.14.0、Chromium 157 为验证基线；未独立审阅。

## 能力对照与组合验收

| 公开子路径 | 必要能力及来源差异 | 本批运行验收入口 |
| --- | --- | --- |
| `label` | 原生标签关联、默认／设置外观、必填标记、禁用反馈；标记本身不替代控件必填 | 独立输入关联、禁用和设置标签 |
| `field` | 设置与通用行、垂直／水平／响应式、原生 fieldset、说明及去重错误；关联 ID 和校验由调用方持有 | 主题设置、团队标识错误和窄宽行布局 |
| `textarea` | 原生输入和表单语义，默认增长，设置固定 120 px，字符限制、错误、只读和禁用 | 团队描述与通用备注，Unicode 和多行 |
| `switch` | 30 × 20 和 22 × 14，普通／设置，内焦点与表单值；React `checked/onCheckedChange`，Vue `v-model` | 工作区通知启用、锁定、提交和重置 |
| `tabs` | 默认／线型／胶囊、横纵、自动／手动、禁用、焦点露出；沿用原生焦点与 ID | 手动切换的概览、动态和禁用标签 |
| `kbd` | 原生键帽、默认／内联／紧凑、组合键，不绑定快捷键 | 普通键帽和工具提示组合 |
| `tooltip` | 500 ms 悬停、键盘聚焦、Escape、方向与碰撞、可选箭头、Portal、快捷键提示；使用原生目标框架的组合方式 | 带 Shift+V 的显示选项和邻近按钮 |
| `radio-group` | 默认纵向、方向键移焦与选择、禁用／只读、原生表单代理；目标框架使用各自的受控值 API | 通知方式切换和禁用项 |
| `native-select` | 原生 select／option／optgroup，表单、默认／小尺寸、禁用和多选 | 时区选择及小号禁用项 |
| `input-group` | 四种外观和附加位置，复用单／多行输入和按钮；空白附加区域可移焦，交互子项不抢焦 | 设置搜索的清除和焦点，以及带附加内容的输入 |
| `toggle` | 普通／描边、三种尺寸和 pressed；遵循按钮 keyboard/ARIA | 文本加粗、禁用状态 |
| `toggle-group` | 单选／多选、工具栏、尺寸／变体／间距、方向键与焦点；选中值和空值沿用原语类型 | 富文本工具栏多选和移动焦点 |
| `button-group` | 水平／垂直、普通／胶囊、提示文本和分隔线；只负责布局与分组，不引入 roving focus | Issue 拆分操作、装饰分隔线和 Tab 顺序 |

## 状态、适用性和证据

受控和非受控交给相应原语；文档实例只持有自身演示状态。Field／Label 不隐藏本应由调用方传递的 required、invalid、name 或描述；原生输入和代理表单控件实际进入 `FormData`。Tooltip 的延时是本批内建的异步行为，设置保存和校验为消费者示例，不实现网络流程。

- **适用**：状态和数据（交互原语）、键盘与焦点、无障碍语义、浅／深主题、窄／宽布局和公共导出；具体测试见 `apps/framework-comparison/tests/form-primitives.spec.ts`。
- **未完成全面对齐**：已验 Unicode 多行输入、可访问名称与描述，但未验实际 IME、读屏、触屏实机、完整 RTL、跨浏览器或目标 SDK hydration。两边都验证了已有选中项的方向键切换。React 单独修复并复测了 Radix 在瞬时键入时只移焦不选中的问题；Vue 的瞬时合成按键仍可能只移焦，且 Reka 空组选中行为与 Svelte 可不同。Tooltip 的 portal 和组件组合方式使用各框架原生 API，不提供 Bits UI 特有的 detached trigger 和过渡完成事件。
- **分发与文档**：React/Vue 原生代码分别位于 `apps/{react,vue}-preview/src/examples/`，文档站加载同一份源码的文本；两个目标包沿用 `@valar/{react,vue}-ui/<子路径>`。适用的独立消费测试以打包 tarball 安装后运行，不能以工作区预览替代。

## 第 1 批实测

- React/Vue 以 `pnpm --filter @valar/<框架>-ui pack` 产出 tarball，装入独立 Vite 7 消费项目。两边 `node_modules/@valar/*` 均解析为本地 `.pnpm` 的 tarball 副本，不是工作区软链；两边类型检查和生产构建通过。pnpm 12 提示未批准第三方安装脚本；未执行这些脚本，产物仍完整通过上述检查。
- `pnpm --filter @valar/framework-comparison exec playwright test`：生产消费端与 Svelte 对照 **58/58**。新增 20 项覆盖浅色 900 px / 深色 320 px、标签聚焦、Field 错误关联、文本增长、开关 FormData 与重置、方向键、手动 Tabs、Tooltip 悬停／Escape、搜索清除／归焦和格式组选择；原有 38 项回归全通过。
- 设置卡片对照检出 Vue `FieldGroup` 调用方的 `gap-0` 未覆盖共享 `gap-5`（20 px）；合并 class 后，两框架在两个宽度下均实测 `row-gap: 0px`。设置行、错误、选择状态和 Tooltip 组合已截图复核；Tabs 另有真实指针和键盘录制。适用尺寸记录包括 Switch 30 × 20、Tabs 28 高、当前 Native Select 默认 32 高及拆分操作分隔线 0.5 px。
- `pnpm --filter docs check` 得到 0 错误／警告；`pnpm build:docs` 成功。在文档站生产预览复跑 `playwright.usage.config.ts` **8/8**，包括 26 个新增原生用法入口和既有切换、复制、默认 Svelte、未提供状态。验证未发布或部署。

## 本批基线（不计为本批新增验收）

- `pnpm build`：文档站和 Playground 生产构建成功。旧记录的 Ruler Slider 虚拟 CSS 错误未复现。
- `pnpm --filter @valar/framework-comparison exec playwright test first-batch.spec.ts popover.spec.ts separator.spec.ts`：Svelte 生产预览与既有 React／Vue 独立 tarball 消费端共 **38/38**。
