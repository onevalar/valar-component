# 第 9–10 批：Valar 旧实现 → UI SDK beta.17

## 1. 基本信息与范围

- 规范：[1.0](../COMPONENT_PORTING.md)。2026-11-27，Amp；未独立审阅。状态：部分实现，未完成独立消费与视觉验收。
- 来源：本仓库 `6b6fe0914df11a1c2ab1d7eacd31a86eb7a3bb67` 中 `packages/react-ui/src`、`packages/vue-ui/src/ui`、`docs/src/lib/registry/ui`、`packages/primitives/src/lib` 的同名组件。Valar MIT；Ruler Slider 保留原 MIT (Elia Kuratli) 文件及源码声明。UI SDK `@ui-sdk/{core,react,vue,svelte}@0.1.0-beta.17` 为 Apache-2.0。
- Node 24.22.2 / pnpm 12.14.0；React 19.2、Vue 3.5、Svelte 5.57。不变更兼容范围、视觉规则及共享发布配置。

## 2. 能力对照

| 组件 | 当前合同与 SDK 对照 | 方案 |
| --- | --- | --- |
| Carousel | Embla 8.6 API、插件、响应式选项与自定义选择器；SDK 为独立的 1-based page/controller，不是 Embla API | 普通轮播可用 SDK，保留明确需要 Embla 的场景 |
| Resizable | 显式命令、分栏事件、分栏顺序及精确分隔器热区 | 保留原实现。beta.17 `dist/components/resizable/resizable-handles.js` 固定 fine/coarse 为 10/24px，没有 handle 级覆盖；当前 React workspace 为 3/3、Vue 为 3/15，且允许调用方传 `hitAreaMargins`。直接迁移会扩大相邻控件的截获范围，面板引用和事件合同也不能原样映射。 |
| Message Scroller | 消息 ID 与锚点、补历史、视口和虚拟列表，额外处理跟随、动态高度 | Core stick-to-bottom 只涵盖跟随及 next-growth prepend，不能换掉模型 |
| Ruler Slider | 固定针、移动等距刻度、惯性滑动、可选非步长终点 | SDK Slider 的绝对指针映射、步长终点与可视移动拇指不兼容；共用 Core motion 数学 |
| Attachment | 已有附件卡片与外部触发器，不持有文件或上传队列 | SDK Button 可接管原生卡片触发器，保留预览／下载链接组合 |
| Button Group | 普通 `group`、每个操作独立 Tab，支持链接和菜单 | 组合已迁移的 Valar Separator；不以 roving toolbar 更改合同 |
| Item | 可渲染原生链接／按钮的展示行，不自持选择状态 | 组合已迁移的 Valar Separator；不增加 listbox 行为 |
| Trace | 原生触发器、关联的可展开区域、离场动画和 reduced-motion | 组合 SDK Collapsible，避免混用两套 context |
| Questionnaire | 动态题集、原生表单、单／多选及文本、必填与跳过、焦点管理 | 保留专用模型。没有 SDK 问卷；单独用 RadioGroup／Checkbox 会更换原生答案注册、复合名称与验证／提交关系，不能作为等价替换。 |
| Stepper | 可达性、线性门禁、异步取消、外部控制与内容聚焦 | 保留流程模型，不替换为 Tabs；使用 Core 共用 IME 检查 |

## 3. 状态与集成设计

- Carousel：无 Embla 配置时由 SDK 管理页数、指针、出入视口、按钮边界和视口键盘导航；Valar 控件继续支持方向键。额外提供 `opts`、`plugins`、`setApi`（Vue 也接受 `@init-api` 或 `engine="embla"`）时，使用真实 Embla；独立 SDK controller 不模拟 `selectedScrollSnap`、`reInit`、插件接口或自定义选择器。明确建议挂载时选定引擎，切换会重建子树。SDK render 覆盖内容与视口的 `data-slot`，保留 Valar CSS／工作台定位入口。
- Ruler Slider：`@ui-sdk/core/gesture` 实际求解弹簧位移和速度并计算拖过边界的阻力；保留 Valar 对 RAF、拖动采样、滚轮惯性、固定指针、步长和提交的所有权。Core `slider-api.js` 的绝对轨道和步长归一化不替代固定指针及非步长终点。
- Trace：Root／Trigger 通过已迁移 Valar Collapsible 创建同一 SDK 实例，Panel 使用 SDK 测量、ARIA、退出可见期；保留 Valar 内层断行、颜色、动画及外层 hook。Attachment 的原生触发按钮使用 SDK Button，链接／自定义子元素和相邻预览／下载操作不变；SDK FileInput 负责接收和存储文件，不是附件表面。
- Button Group 与 Item Separator 使用三框架已有 Valar Separator 的 SDK 行为。Button Group 样式改为匹配 SDK 的 `data-orientation`；不引入 toolbar roving focus。Item 仍是无选择状态的被动行，可用原有链接／按钮；不引入 listbox 行为。
- Message Scroller：保留已有模型；`dist/foundation/lists/stick-to-bottom.d.ts` 只提供 `following/atBottom/unseen`、`connect`、`release`、`prepend` 和末尾滚动。没有逐条记录 ID、锚点位置／可见性、spacer、虚拟列表定位。再接入它会引入另一套 observer 和滚动写入。React/Svelte 的跳转按钮已经组合迁移后的 Valar Button。
- Stepper：SDK Core `isComposing` 同时覆盖 `isComposing` 与旧版 `keyCode=229`，不改变受控值、异步取消、校验和焦点时序。Questionnaire 不将原生答案和提交代理给不匹配的 SDK 选项模型；未改变已有表单或公开模型。

## 4. 逐项验收

| 维度 | 场景 | 结果与证据 |
| --- | --- | --- |
| 状态与数据 | Carousel 首屏、切页、离屏状态；Stepper 校验、回退、外部更新 | 通过：三框架 Chromium 默认 Carousel 与真实 Embla API；Svelte 六项 Stepper 测试通过。动态引擎切换与自定义插件未验证。 |
| 表单语义 | Attachment 原生 `type`、事件；Questionnaire 原生表单不变 | 通过：三框架 Attachment 按 Enter 发出 native submit。独立消费者、reset、受控字段及错误情况未验证。 |
| 键盘与焦点 | Carousel 控件、视口 Home；Trace Enter/Space；Stepper 方向键与 IME | 通过：Chromium 三框架的 Home、Trace Enter/Space；Svelte Stepper 正常方向键与遗留 IME 对照。其余组合待验证。 |
| 无障碍 | Carousel 边界 disabled／离屏 aria-hidden；Trace trigger/panel ID | 通过：三框架浏览器 DOM；未测试屏幕阅读器。 |
| 输入法与国际化 | Stepper 不截获组合事件；Carousel RTL／纵向 | 通过：Svelte jsdom 模拟 229；真实 IME、轮播 RTL 与纵向未验证。 |
| 触摸与指针 | Carousel 下一页确实滚动；Ruler 输入与拖拽；Resizable 保留触区 | 通过：三框架点击后 scrollLeft 由 0 到 300；触屏拖拽、Ruler 真实手势和边界布局未验证。 |
| 异步与生命周期 | Stepper 停止陈旧校验；Trace 出场／焦点；Carousel 重建和销毁 | 通过：Svelte Stepper 六项回归；未验证 Trace 常规动效与 Carousel 引擎动态切换。 |
| SSR／hydration、布局 | SSR 与客户端 id；横纵布局及多项／响应式、与相邻控件的间距 | 未验证。浏览器源夹具只使用固定 300px，不能作为产品布局证据。 |
| 视觉与适配 | 原 Valar token、浅深主题、窄屏及实际预览／相邻布局 | 未验证；没有新增外部焦点环，代码保留 Valar 样式 hooks。 |
| 性能与资源 | Ruler RAF、长列表与虚拟化未受回归 | 未验证性能；不在同一 Message Scroller 上并行运行第二套 observer。 |
| 安全与隐私 | 使用同样的宿主数据、附件链接和表单作用域 | 不适用新增数据路径：不添加上传、网络或持久化。 |
| 类型、依赖与分发 | 组件源码类型、安装 registry/tarball 后的用户工程 | 通过：三框架范围内源码类型检查。独立消费者、迁移后的产物和导航未验证。 |

## 5. 验证环境与证据

- Linux x64 orb、Node 24.22.2、pnpm 12.14.0、Chromium 157 headless。源夹具直接挂载三个框架的组件，无打包产物；使用 reduced motion、宽 300px 轮播。`.amp/in/orb-backup/batches9-10/` 下的 Vite 夹具配套 `batches9-10-smoke.mjs`。下一页后确实滚动到 300px、初始上一页为 `aria-disabled`、下一张解除隐藏，Home 回到首张；真实 Embla `internalEngine().slideRegistry.length` 返回 3；Trace Enter 打开、Space 关闭且关联 ID 正确；Attachment 保留 `data-slot` 且 Enter 提交原生 form。
- `pnpm --dir docs exec vitest run tests/stepper.test.ts --maxWorkers=1`：六项通过，新增 legacy IME 拦截与普通方向键对照。
- `tsc --noEmit` (React)、`vue-tsc --noEmit` (Vue)、`svelte-check --tsconfig` (Svelte)：用 `.amp/in/orb-backup/batches9-10-{react,vue,svelte}.json` 分别限定变更源码，均通过；Svelte 0 错误、0 警告。Core Ruler 数值对照：90 个弹簧位移／速度样本、5 个越界样本与旧公式误差均小于 `1e-9`。
- `docs/e2e/sdk-carousel-stepper.spec.ts` 在实际文档站验证了 SDK Carousel、真实 Embla API、Stepper IME。390 px 下复现第二张的视口可见比例只有 0.935：SDK 按外层 slide 盒子吸附，原 Embla 的负边距和 slide 内部补边造成第二张右侧裁切。三端 SDK 路径改用轨道的 16 px `gap`；Embla 路径保持原布局。回归要求第二张显示至少 99%、两箭头完全在视口内。960 px 浅色首张与 390 px 深色第二张检查了圆角、箭头和相邻边界，箭头中心命中本身。工作台 registry 往返测试覆盖 SDK 与 Embla 的同步间距调整。

## 6. 交付与下一步

- 交付源在 React `packages/react-ui/src/`、Vue `packages/vue-ui/src/ui/`、Svelte `docs/src/lib/registry/ui/`；Carousel 双语文档和示例、局部 registry 依赖与回归用例在 `docs/`。保留 Ruler 源码声明及其旧 MIT 文本。
- 状态：部分实现。保留 Resizable、Message Scroller、Questionnaire 的专用合同，Item 仅通过已迁移组件组合。第 11 批重建了 registry，Svelte 独立消费者覆盖 Stepper／Questionnaire；其余本批三端的独立行为矩阵未完整执行。后续验收集中于纵向／RTL／部分可见 Carousel、附件的相邻操作、Trace reduced-motion 与退出动画、实机触控和分发。
