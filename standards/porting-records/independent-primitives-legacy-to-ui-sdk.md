# 独立原语：Valar → UI SDK beta.17 转换记录

## 1. 基本信息与范围

采用[跨框架组件转换规范](../COMPONENT_PORTING.md) 1.0。2026-11-27；未独立审阅。基线为 Valar `6b6fe0914df11a1c2ab1d7eacd31a86eb7a3bb67`，另含工作区既有变更。Svelte 源在 `docs/src/lib/registry/ui/<slug>`，React 在 `packages/react-ui/src/<slug>.tsx`，Vue 在 `packages/vue-ui/src/ui/<slug>`。遵循 UI SDK `@ui-sdk/{core,svelte,react,vue}` `0.1.0-beta.17` 包内公开子入口、`docs/components`、`dist` 源码和类型定义。SDK 以 Apache-2.0 分发，未复制 SDK 源码；既有 Valar 和上游许可保留。不改变最低支持版本、样式 token 或发布范围。

状态：**部分实现**。七个组件的常用路径接入 SDK，兼容性路径有意保留。三端源码交互通过，Svelte 已验证生成 registry 的独立安装及部分代表用例，不把分发验证等同于覆盖每个组件合同。

## 2. 能力对照（迁移前合同）

| 原能力 | SDK 对照与门槛 |
| --- | --- |
| Button：文字胶囊／图标／相连按钮、按钮与链接、可取消点击、Svelte 外部 loading 保持焦点 | SDK 执行动作与原生按钮禁用；保留外部 loading 及链接与组合路径的原合同，不能令禁用链接恢复导航。 |
| Avatar：真实图片、加载失败后缩写并可恢复、延迟、图片属性、大小与成员色 | SDK 原生图像和回退；核对 Bits 在根部的受控状态／加载后延迟，以及 Radix/Reka 在图像上的事件和回退延迟。 |
| Progress：`0` 默认值、空进度、非零最小值、clamp、项目百分比 | SDK root、value 和 indicator；保持 Valar 状态属性、样式和退化范围。 |
| Pagination：受控／非受控页码、count/perPage、两端分页、链接与不导航的本地按钮、键盘移焦 | SDK 负责分页状态；按框架保留公开 slot、链接语义、键盘和禁用合同。 |
| Scroll Area：滚轮/键盘/拖动、两轴、hover/always/auto/scroll、滚动接力、viewport ref | SDK viewport/content/bar/thumb；核对轴向、轨道显示和脱离主题样式后的安装。 |
| Slider：scalar/多滑块、步进、拖动与 commit、表单值、标记与 RTL | SDK 以嵌套 `input[type=range]` 处理无障碍，不能直接改变提交载荷、原公开步骤和组合焦点。 |
| Input：原生属性、文件、数字、绑定/重置、只读禁用 | SDK 文本控制；文件和数值绑定不可降级为字符串或普通文本值。 |
| Textarea：换行、默认自动增长、设置外观固定、提交与重置 | SDK 原生 Textarea；保留 Valar 的 `field-sizing` 与设置高度。 |
| Number Field：locale、编辑草稿与无效文本、键盘、原生表单校验、排除长按连加 | SDK `number-input` 会在 commit 对草稿做规范化，内置按钮会长按连加；有实质差异时保留原路径。 |
| Input OTP：单一输入、按位显示、长度、外部 refs、模式、重置粘贴与完成回调 | SDK `otp-input`；核对模式是逐字符过滤还是整串接受，及默认筛选、回调、光标和表单约束。 |

## 3. 实现、状态与集成

| 组件 | SDK 接入及保留的合同 |
| --- | --- |
| Button | 三端普通 `<button>` 使用 SDK press、原生 `submit`／`reset` 和 Promise pending（保留焦点、阻止重复）； Valar 的原 `href`、Radix/Reka `asChild`、Svelte 显式 `loading` 路径保留。 |
| Avatar | SDK 判断真实图片的加载、失败与恢复。Svelte 保留未加载图像和已加载回退的 DOM／ref，用 `display:none` 保持已有可见性合同；Bits 保留可写加载状态、完整状态回调序列、图片加载后的 `delayMs`、根 `child`。React/Vue 保留外观、属性与组合入口，并映射回退延迟及加载通知。SDK 从一张成功图片切换源时保留 `loaded` 直到新请求结束。 |
| Progress | SDK 提供 `aria-valuemin/max/now`、状态与指示器／数值片段；Valar 保留 project 百分比、未知进度的 35% 指示器、退化范围 0%、兼容数据属性和选型样式。 |
| Pagination | SDK 负责页状态、实际边界和 Svelte 导航组件。React/Vue 保留原页码展示算法和 `asChild`／slot，调用真实 SDK 页码 API；三端保留 Valar 的键盘移焦和当前项指示。Svelte 的两个公开步进按钮名都接到同一 SDK 路径。 |
| Scroll Area | SDK 负责 viewport、两轴溢出、测量、拖动与隐藏；保持 Valar 厚度和内焦点提示。Vue `type="glimpse"` 和 CSP `nonce` 仍走 Reka（SDK beta.17 不支持）。SDK 非溢出轨道可为已挂载的隐藏节点；`forceMount` 保留轨道盒子，不承诺恢复旧库的节点生命周期。 |
| Input | 文本型使用 SDK 字符串值及原生控件；文件、数字与其他非文本类型保留原生路径，避免改变 `FileList`、数字绑定或布尔选中态。 |
| Textarea | SDK 文本状态、原生提交和重置、默认自动增长；设置外观仍不自动增长。Vue 受控 `modelValue` 也是重置的目标，避免表单重置清空仍由外部控制的值。 |

### 阻止直接替换的合同差异

以下三个组件及其 meta 未变更。测试使用 SDK 与 Valar 真正渲染的控件，不根据文档推测结果。

| 未迁移 | beta.17 源码与 Chromium 实测（同一页面、各自表单） | 重新评估条件 |
| --- | --- | --- |
| Slider | `core/dist/components/slider/slider-api.js` 的 `formatRange` 序列化为一个 `20/80`，`slider.js` 用两个内部 `<input type="range">`，一个隐藏字段提交。相同 Svelte Valar `[20,80]` 控件读到两个 `<span role="slider">`，该场景没有 `range` 字段；React 底层表单也不是 SDK 斜杠格式。只替换单值分支也会改变焦点节点和关联的 Slider Field 交互合同，未另造双轨表单桥接。 | SDK 可保留 thumb 事件/引用契约及按当前框架控制原生序列化方式，再逐一验证 scalar、range、RTL 和提交。 |
| Number Field | `number-input-api.js` 的 `beforeinput` 筛掉不能成为数值的插入，`commitText` 回退无法解析的草稿，按量按钮使用 `bindRepeatPresses`。以 3 开始，输入 `-` 后 Tab：SDK 显示 `3`，无无效状态；Valar 仍显示 `-` 且 `aria-invalid="true"`。 | SDK 能保留无效草稿、可访问错误和原生提交阻断，并允许关闭长按连加。 |
| Input OTP | `otp-input-api.js` 的 `cleanCode` 逐字符过滤，`otp-input.js` 加完整长度限制；没有 Valar 任意整值检查及 `pasteTransformer` 的等价入口。四位控件输入 `12`：SDK `checkValidity()` 为 `false`，Valar 同值（允许数字部分输入的模式）为 `true`。 | SDK 支持整串模式、兼容部分值的 HTML 校验及选择区粘贴转换，而不是重写其编辑/选区引擎。 |

第 5 批的组合另行处理：Field 继续组合已迁 Label；Input Group 继续组合已迁 Input／Textarea／Button，三端保留相邻控件，React 显式转发组合的 `data-slot` 防止被 SDK 默认值覆盖。Slider Field 保留 Slider 和 Number Field 的提交／无效草稿合同。Tags Input 仍是现有原生文本输入加标签列表；SDK Token Input 以 contenteditable 编辑 token，表单、输入法和粘贴合同尚无等价验证，不直接替换。

## 4. 逐项验收

| 维度 | 结果及范围 |
| --- | --- |
| 状态、表单与键盘 | 通过：三框架各两组 Chromium 验证 Button 异步防重复和焦点、Input/Textarea payload 和 reset、Avatar 错误到真实图片恢复、Progress 可访问读数、Pagination 键盘移焦及来回切页、Scroll Area 两轴和拖动几何。额外验证 Svelte Input 双向绑定及 Vue 受控 Textarea reset。 |
| 文档集成和视觉 | 通过：Button 的 32px 和键盘内焦点、Input 设置变体与原生 file/readonly/disabled/form、头像 18px/24px 和后备字号、Scroll Area 深浅色拇指及两轴滚动；Avatar/Scroll Area 覆盖 1200px 与 360px。工作台 Pagination/Progress 真实操作在成功运行时达成预期。部分共享开发服务运行出现 Svelte Lucide 优化模块 hydration 异常或预览一度缺失，不能据此宣称 SSR 全面通过。 |
| 类型与依赖 | 通过：限定这七个入口的 React `tsc`、Vue `vue-tsc`、Svelte `svelte-check`，SDK 源依赖为固定的 beta.17。较早 React 包范围检查拦在生成 `dist/avatar.tsx` 的过时类型；不是源码范围的验证结果。 |
| 触摸、IME、国际化、辅助技术、性能 | 未验证；未替换需要这些边界的 Slider、Number Field 与 OTP。 |
| 分发与安装 | Svelte `build:registry`、独立 `test:consumer` 通过：严格类型、生产构建，Avatar 反复换源时原根与图像 DOM 保持，错误／清空隐藏图片并显示回退。React／Vue 分发包检查通过；不把安装覆盖解释为七个入口的完整独立行为矩阵。 |

## 5. 可复现证据与交付

- Node 24.22.2、pnpm 12.14.0、Linux orb、Chromium 157.0.8103.78；Playwright 的源码直连测试在 `.amp/in/orb-backup/independent-primitives/`（`smoke.mjs`、三框架 fixtures、`Blockers.svelte` 与目标 TS 配置）。主题为明亮 900px 和暗色 390px；不把临时 harness 当成独立安装验收。
- 实际文档运行：`docs/e2e/{button-alignment,input-alignment,surfaces-alignment,p2-editors}.spec.ts` 选取负责范围，预热后 16/17，通过单独复跑 Progress 后补齐此场景。为实际 Scroll Area 预览添加了拇指尺寸必须正且小于轨道的回归检查，避免错误占满滚动条导致无法拖动。
- `pnpm --filter docs exec vitest run --maxWorkers=1 tests/avatar.test.ts tests/workbench-scroll-editors.test.ts`：10/10 通过，覆盖旧头像状态回调的行为以及当前 Scroll Area 源码的样式写回、两轴各自厚度和滑块圆角。
- 第 11 批生成 registry 时将 `catalog:` 解析为安装的精确版本，未安装时立即报错，避免向独立消费者输出不可用的 workspace catalog。`avatar/context.ts` 已随生成的条目提供。后续真机、全部工作台变体及七个入口各自的三端消费者合同仍待逐项验收。
