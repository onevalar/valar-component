# 业务区块与 AI 组合：Svelte → React / Vue

2026-11-27 · 第 7 批 · 代表场景已验，非完整等价转换。采用[转换规范 1.0](../COMPONENT_PORTING.md)，来源 `onevalar/valar-component` 的 `cfd989c9f63156774dbfb3871cc1fa1774e62ee5`，MIT。来源为六个 `docs/src/lib/registry/blocks/*-01` 业务区块、`docs/content/{,zh/}ai-elements/` 及其 registry 示例；普通区块清单以 `docs/src/__registry__/blocks.ts` 与 `docs/static/registry/styles/valar/` 交集为准。目标为 React 19.2.3、Vue 3.5.45、Tailwind 4.3.3 和对应 Valar 原生 SDK 0.1.0；使用 Node 24.22.2、pnpm 12.14.0 和 Chromium。沿用 SDK 的既有依赖和许可。

| 来源 | 必须可观察的代表性行为 | 目标入口与有意差异 | 验证 |
| --- | --- | --- | --- |
| `settings-01` | 设置行、主题值、开关状态、管理员禁用 | 原生设置和表单组件；示例状态不写入宿主设置 | 两端宽／窄屏：切换主题和开关，相邻禁用控件不响应 |
| `new-issue-01` | 紧凑／展开、草稿、附件、连续创建及归焦 | Issue Composer 和本地问题列表；不上传、不写入远端 | 两端宽／窄屏：表单校验、附件和连续创建，键盘关闭及归焦 |
| `my-issues-01` | 视图、组合筛选、分组、创建和详情联动 | 原生 Tabs、Command、Issue Detail／Composer；示例工作区 | 两端浅宽／深窄：组合筛选、空态、分组、详情编辑和创建 |
| `inbox-01` | 已读、暂缓、快捷键、详情同步和窄屏返回 | 原生通知列表和 Issue Detail；本地模拟时间和通知状态 | 两端浅宽／深窄：详情共享、快捷键、到期恢复和优先级筛选 |
| `projects-01` | 列表、看板拖拽、时间线与依赖、创建、保存视图 | 原生表格、卡片、日期控件；示例项目，视图存于本地 | 两端：鼠标／模拟粗指针拖拽、键盘移动归焦、依赖防环、视图重载和深色 375 px |
| `agent-01` | 会话、流式回复、附件、工具步骤和滚动锚点 | 原生消息、Trace、附件和输入；模拟工具和回复，不执行外部副作用 | 两端浅宽／深窄：文件选择、禁用发送、取消流式、会话隔离、Trace 展开和回到底部 |
| 21 个 AI 组合 | 对话、推理步骤、来源与开发产物的各自交互 | 中英文同站文档使用独立可复制的 SDK 组合；沿用基础 Message 等组件，无第二套 SDK | 两端：中英窄／宽屏、流式及取消、键盘焦点、详情展开、链接和文件树选择 |
| 其他 78 个 `valar` 区块 | 可追溯到 Svelte 安装名和目标框架的同用途用法 | [中](../../docs/content/zh/installation/registry-blocks.md)／[英](../../docs/content/installation/registry-blocks.md)清单区分用途匹配、可复用基础和缺项 | 对照 registry 与区块索引逐项核对，125 个不同链接／语言（其中 36 个原生示例入口）；不等于逐个安装或完整移植 |

## 状态与集成设计

场景数据在各示例中管理，SDK 处理表单事件、弹层和焦点，业务后端、会话存储与外部工具由宿主接入。文档使用与独立消费者同源的示例源码，原生 iframe 只加载当前框架的应用，Svelte 仍默认且保留 CLI 与共享包入口。示例 URL 仅承载场景、框架、主题与语言，不承载用户编辑内容。

源码位于 `apps/{react,vue}-preview/src/examples/`，各有 6 个 `*-01`、21 个 `ai-*` 文件，在各自 SDK 上独立运行；不是新增 27 个 SDK 公共组件。文档入口为 `/advanced/<scene>` 和 `/docs/ai-elements/<slug>`（支持 `/zh` 和 `?framework=react`／`vue`）。`pnpm --filter docs build:framework-previews` 为文档生成同源静态预览，源码只在选中原生框架时加载。

## 验收范围

状态、表单、键盘、命名与播报、输入法／国际化、触摸、异步取消、弹层、浅深主题、布局、资源清理及本地素材边界按各组合实际用途判断。文档的 SSR 和 iframe 加载须分别验证；原生预览为客户端挂载，不视为原生组件的 SSR 验收。每类保留具体场景和偏差；类型与工作区运行不能代替两套独立 tarball 消费及 Svelte registry 验证。

My Issues／Inbox 有近似图标、原生下拉和不同的快捷键提示做法；Projects／Agent 模板文本为英文，拖拽反馈与 Svelte 不完全一致。AI 中英文 UI 已覆盖，部分工具输出仍为英文 fixture。典型尺寸复测：Issues 44 px 行、28 px 工具按钮、6 px 相邻间距；Agent 44 px 标题、24 px 附件／发送、8 px 间距，浅色 1320 px 三卡并排，深色 375 px 单列。回到底部按钮会在离底时叠于滚动区域底缘；验收确认回到底部后消失。实机、真实 IME、读屏、原生 SSR、跨浏览器及全状态无障碍仍未验。

## 第 8 批：独立安装与生产回归

- React、Vue 分别从真正的本地 tarball 安装到独立 pnpm 项目，依赖落在其自身的 `.pnpm` 中，没有跨框架运行时。类型检查和生产构建通过。两端生产预览通过 Projects 的桌面拖放、键盘归焦、模拟触摸、依赖防环、保存视图，以及六个对话类 AI 组合的实际交互。Vue 消费端将 Tailwind 自动查找改为显式 `@source`，限定示例扫描范围；独立 app 只打包本批组合，不修改仓库的 Vue 预览配置。
- Svelte 独立 SvelteKit 项目装了本地 CLI 和 primitives tarball，再从 Valar registry 添加六个业务区块。使用 Bits UI／svelte-toolbelt 补丁，显式启用 Tailwind Vite 插件，`svelte-check` 0 错误／0 警告，生产构建成功。逐页执行设置开关、创建问题、详情、通知已读、列表切看板和 Agent 流式回复，无页面错误。另从本地 `@valar/svelte-ui` tarball 导入 `blocks/agent-01` 和 `theme.css`，通过 pnpm override 将 primitives 依赖解析到本地 tarball；生产预览中选择 Research，经过 Thinking 后收到流式回复，无页面错误。现有 registry 模板仍有 59 项设计 lint error 和 112 项 warning，本批不修改旧 Svelte 模板以规避检查。
- `pnpm check`、`pnpm build`、`pnpm build:frameworks` 通过。最终 `pnpm test:frameworks` 通过 React 单测 16/16、Vue 单测 8/8 与 146/146 项三框架 Chromium 对照。首次发现四个 React 源码分发模块存在省略扩展名的内部导入，已按包内约定修正并重新打包、独立构建；既有合同测试保留。
- 生产文档 `pnpm --filter docs exec playwright test --config playwright.usage.config.ts` 通过 23/23，含 54 个 iframe 与 SDK 源码入口、Svelte 默认安装项、Inbox 场景切换与浅深主题切换不重载。两条 Projects 断言原先漏掉 `scenario=sample`，修正后已包含在 23 项复跑中。旧 `docs test:consumer` 引用基线中不存在的 Workbench 模块和导出接口而未能运行；上述独立安装并不替代旧脚本中的全部 Avatar、Workbench 与严格第三方类型断言。
- 整站 `pnpm --filter docs test:e2e` 主跑为 227 通过、14 失败、2 跳过（包含修正前的两条 Projects 断言）。Svelte Inbox 暂缓场景串行复跑通过；Button 工作台在默认生产配置复跑通过，外部生产 URL 会使原测试进入开发站「写回组件库」断言。复合 textarea 测试在原提交重复跑 7/8、当前版修正前 2/4；trace 显示 `.first()` 随多个异步示例加载指向不同输入框。指定块首附件示例后，原聚焦与内描边断言重复跑 8/8。
- 在未改动的 `cfd989c` 上重新安装锁定依赖、构建生产文档与 Playground，用同一 Chromium 复现其余 9 条失败：旧 CLI 消费脚本、Dropdown 页面滚动前提、My Issues 富文本、Card settings 的四个背景断言、Chart 工作台入口及 Tabs 的 OKLab 字符串精度。整站没有重新全量通过，复跑数字不与主跑叠加。

## 第 9 批：整站回归修复

- Card 设置卡在生产 CSS 下恢复不透明的浅深表面，保留调用侧覆盖。`/docs/components/card` 的设置场景验了浅色宽屏、深色窄屏、16 px 行内留白、12 px 间距与相邻控件；Svelte `card` registry、`@valar/svelte-ui/card` 和两个原生 SDK 共用该主题来源。
- Chart 文档默认示例恢复交互柱图及调节器；样例使用完整绘图区宽度，默认框不裁切卡片，日期标签按可用宽度疏密。宽屏验默认卡片与数据切换、调节器验两侧独立样式、悬浮提示、表格及保存版本。390 px 回归覆盖日期标签不相交、不越出图表；该用例在修复前的生产产物上失败。图表块仍可通过 Svelte registry `chart-bar-interactive` 获取，Chart 的 SDK 公共 API 不变。
- My Issues 的富文本编辑器先处理 `Ctrl/⌘+Enter` 保存，避免编辑器把选中的粗体文本换成换行。`/zh/advanced/my-issues` 实际按键与共享 Playground `/linear` 都验证了保存；Svelte `issue-detail` registry 和 `@valar/svelte-ui/issue-detail` 共享同一来源。
- 窄屏 Dropdown 测试以实际滚动视口为准；Tabs 按 OKLab 数值核对相同颜色，而非锁定浏览器序列化的最后一位。独立消费脚本使用实际打包的 CLI/primitives、命名条目与本地 Questionnaire JSON，不恢复已撤下的 Workbench 运行时导出；保留严格类型、生产构建、Avatar 换源、表单、Slider、Stepper 和主题检查。
- `pnpm check`、文档与 Playground 生产构建通过。生产定向回归 12/12；最终生产全量单次结果是 **240 通过、2 失败、2 跳过**，包括新增的 Chart 窄屏刻度用例。两项跳过是须显式启用的开发源码写回场景。
- 全量后修复两项失败：CLI 曾从 `file:` 的绝对路径误读版本，现读取已安装 tarball 的包版本；含数字路径的独立安装在修复前稳定失败、修复后通过，且 CLI 依赖安装单测 12/12。评论重开测试现在先等编辑器自动归焦并检查输入确实替换，再使用原 Ctrl+Enter 保存断言，修正后连续通过 8/8。最后在生产配置单独复跑上述两项及 Chart 窄屏刻度，3/3 通过。保留全量单次数字，不把单独复验相加为整站全绿。

## 后续区块与兼容性验收

[第 10–14 批](registry-blocks-svelte-to-react-vue.md)接续交付已映射的 78 个原生区块，并补上 Svelte `calendar-15` 的周数基线。该记录区分源模板差异、浏览器覆盖和须另行补验的实机触摸、真实读屏、系统输入法。
