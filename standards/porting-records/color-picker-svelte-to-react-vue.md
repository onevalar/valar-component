# Color Picker 颜色选择器：Svelte → React / Vue 转换记录

采用[跨框架组件转换规范](../COMPONENT_PORTING.md) 1.0。

## 1. 基本信息与范围

| 项目 | 内容 |
| --- | --- |
| 采用的规范版本 | 1.0 |
| 状态 | 部分实现（桌面浅/深及 320 px 窄屏交互、多格式与表单已验证；实机触屏、真实系统中文输入法与屏幕阅读器待单独验收） |
| 日期、执行者及审阅者 | 2026-11-27，Antigravity；未独立审阅 |
| 用户需求及范围依据 | 用户明确确认进入阶段一 A 项：将升级后的 Svelte 新版颜色选择器同步到 React 与 Vue 两端，消除三端体验割裂 |
| 来源仓库、文件路径 | 本仓库 `docs/src/lib/registry/ui/color-picker/{color.ts,color-picker.svelte,index.ts}` |
| 来源提交 SHA／发布版本 | `1b5600af` |
| 来源及依赖的许可、保留位置 | Valar MIT；底层 `@ui-sdk/{core,react,vue,svelte}@0.1.0-beta.17` 为 Apache-2.0；Popovers 保留各包已有 Radix / Reka MIT 声明 |
| 目标框架、运行环境及版本 | React 19.2.3、Vue 3.5.45、Tailwind CSS 4.3.3、Node 24.22.2、pnpm 12.14.0 |
| 原语库和新增依赖的版本、选择理由 | 无新增第三方依赖；继续复用包内已有的 `@ui-sdk/{react,vue}/color-picker` 与既有 `Popover` 原语，自研纯 TS 色彩计算引擎 |
| 已有等价组件／组合方案检查 | 两端已有基础版 `ColorPicker`（依赖原生 `<input type="color">`、仅 6 位 HEX、无透明度与多格式切换）；本次原地升级，不新增第二套入口 |
| 支持环境及兼容范围 | 与 `@valar/react-ui`、`@valar/vue-ui` 既有范围一致；未改变最低版本或发布配置 |
| 必须保留的能力 | 原公开路径 `@valar/{react,vue}-ui/color-picker`、严格 3/6 位 `normalizeHex`、受控与非受控值、原生表单单值提交、32 px 触发器、浅/深主题与窄屏边界、无效草稿保护与错误描述关联、Escape 归焦、IME 防误提交 |
| 有意调整／排除的能力、依据及影响 | 移除原生 `<input type="color">` 避免二次系统弹窗割裂；`alpha` 默认开启（不透明仍输出 `#rrggbb`，半透明输出 `#rrggbbaa`，可传 `alpha={false}` 关闭）；复制按钮无障碍名称改为固定「复制当前色值」避免与预设色值按钮名称冲突 |
| 视觉变更范围及依据 | 与 Svelte 新版保持一致：二维饱和度/明度色板、吸管按钮（按浏览器能力渐进增强）、实时棋盘格预览、彩虹色相与不透明度滑条、`HEX / RGB / HSL / OKLCH` 格式切换与通道编辑、单层固定高度的「预设色 / 最近使用」切换栏 |

## 2. 能力对照

| 来源能力／行为 | 目标行为／API | 实现位置及依赖 | 差异、理由与影响 | 验证证据／缺口 |
| --- | --- | --- | --- | --- |
| 32 px 触发器 + 棋盘格色块 + 色值 + 透明度百分比角标 | React `ColorPicker` / Vue `ColorPicker` 同结构，触发器无障碍名保持 `<label> <current>` | `packages/react-ui/src/color-picker.tsx`、`packages/vue-ui/src/ui/color-picker/ColorPicker.vue` | 无实质差异；角标仅在 `alpha && alphaPercent < 100` 显示 | Playwright 浅色 900 px、深色 320 px 实测通过 |
| 二维 SV 色板（指针捕获拖动 + 方向键/Shift/Home/End） | 三端一致 `role="slider"`、`data-slot="color-picker-area"`，无彩色保留上一次色相 | 两端组件 + 各自纯 TS `color` 模块 | 无差异；纯黑白下不会重置色相 | Playwright 键盘交互与表单联动通过；真机触屏待验 |
| 色相滑条 & 不透明度滑条 | `data-slot="color-picker-hue"` 与 `data-slot="color-picker-alpha"`；`alpha=false` 隐藏不透明度 | 同上 | 无差异；`#rrggbbaa` 直接通过 `@ui-sdk/*` 提交到原生表单 | Playwright 实测 `#rrggbbaa` 提交与触发器 `%` 角标通过 |
| 多格式切换与复制（HEX / RGB / HSL / OKLCH） | 切换格式实时换算并编辑通道；HEX 支持粘贴 `rgb()`/`hsl()`/`oklch()`；一键复制 1.5 s 反馈 | 同上 | 复制按钮 `aria-label` 统一为「复制当前色值」，悬停 `title` 展示完整色值，避免与预设色按钮无障碍名碰撞 | Playwright 四格式切换、通道编辑及 OKLCH 粘贴提交通过 |
| 吸管取色（EyeDropper API） | 挂载后检测 `"EyeDropper" in window` 渐进显示，SSR 阶段不渲染以保证 hydration 一致 | 同上 | 仅支持 EyeDropper 的浏览器显示 | React SSR 渲染通过；真实吸管系统交互需人工实机点测 |
| 预设色与最近使用单层切换栏 | 同一底栏切换「预设色」与「最近使用（localStorage）」，面板高度固定无纵向滚动条 | 同上 | React/Vue 与 Svelte 均默认 `showRecent=true`，可显式关闭 | Playwright 验证点击切换、零溢出与零滚动条通过 |
| 纯 TS 色彩引擎导出 | 保持严格 `normalizeHex`，新增 `normalizeHexColor`、`parseColorInput`、`formatColor`、HSV/HSL/OKLCH 换算与 `isLightColor` | `packages/react-ui/src/color-picker-color.ts`、`packages/vue-ui/src/ui/color-picker/color.ts` | 无差异，三端共用同一数学模型 | React/Vue 单元测试通过 |

## 3. 状态与集成设计

- **单一数据源**：受控值（React `value` / Vue `modelValue`）与非受控内部值归一化为 `current`，交给 `@ui-sdk/{react,vue}/color-picker` 的 Controller 同步状态与隐藏表单字段；文本草稿 `draft` 与 `current` 分离，无效输入不覆盖提交值。
- **色相保持**：本地维护 `hue` 状态，仅当当前颜色存在色度差（非纯黑白灰）时随外部颜色同步更新，防止拖到黑/白边角时色相归零跳变。
- **SSR 与副作用清理**：`EyeDropper` 检测与 `localStorage` 最近色读取仅在客户端挂载阶段执行；复制反馈定时器在卸载时清理。
- **原生框架惯例**：React 采用 `value`/`defaultValue`/`onValueChange` 与 `React.useId()`；Vue 采用 `v-model`（`modelValue` + `update:modelValue` + `valueChange`）、`useId()` 与 `PopoverContent as-child` 保持既有 dialog 命名覆盖逻辑。

## 4. 逐项验收

| 维度 | 适用性及理由 | 具体场景与预期 | 实际结果 | 证据／问题 |
| --- | --- | --- | --- | --- |
| 状态与数据 | 适用 | 受控/非受控、预设/色板/滑条/多格式通道更新、无效草稿不污染状态 | 通过 | `sdk-color-picker.spec.ts` 8 项 + React/Vue 单元测试 |
| 表单语义 | 适用 | 原生 `FormData` 提交恰好一个 `#rrggbb` 或 `#rrggbbaa`、非法输入错误关联 | 通过 | `sdk-color-picker.spec.ts` 实测 `FormData.getAll("accent")` |
| 键盘与焦点 | 适用 | Enter 打开、色板/色相/不透明度方向键与 Shift 步进、Enter 提交不误触表单、Escape 关闭并归焦触发器 | 通过 | `sdk-color-picker.spec.ts` 8 项全部通过 |
| 无障碍 | 适用 | 触发器名称、滑条 `aria-valuenow/valuetext`、错误 `aria-describedby`、自适应对比度勾选 | 部分通过 | 浏览器 ARIA 属性实测通过；真实屏幕阅读器（VoiceOver）未测 |
| 输入法与国际化 | 适用 | 中文标签、`compositionstart/end` 防 IME 组合期间误提交 | 部分通过 | 代码与英文/中文字符路径通过；真实系统中文输入法待实机验 |
| 触摸与指针 | 适用 | 指针捕获拖拽、点选色块与切换标签 | 部分通过 | 桌面指针与点击通过；真实触屏设备待验 |
| 异步与生命周期 | 适用 | 吸管取消保护、复制定时器卸载清理、禁用时关闭弹层 | 通过 | 源码与浏览器检查通过 |
| SSR 与 hydration | 适用 | 服务端渲染不访问 `window`/`localStorage`，输出一致 | 部分通过 | React `renderToStaticMarkup` 单测通过；Vue 独立 SSR 未单跑 |
| 弹层与布局 | 适用 | 900 px 浅色与 320 px 深色弹层均在视口内，零纵向/横向溢出 | 通过 | `sdk-color-picker.spec.ts` 几何与 `scrollHeight/scrollWidth` 断言通过 |
| 视觉与适配 | 适用 | 浅色/深色主题、棋盘格透明度背景、内嵌焦点、零外扩聚焦环 | 通过 | 真实 Chrome 截图核对与样式构建通过 |
| 性能与资源 | 适用 | 无新增第三方依赖，仅内置轻量纯 TS 色彩计算 | 通过 | React/Vue 构建产物与预览构建通过 |
| 安全与隐私 | 适用 | 仅写入当前域名 `localStorage` 最近色列表，无外部请求与 HTML 注入 | 通过 | 源码审查通过 |
| 类型与依赖 | 适用 | 严格 TS / `vue-tsc` 零错误、无跨框架隐藏依赖 | 通过 | `react-ui check`、`vue-ui check` 及分发依赖闭合测试通过 |
| 分发与集成 | 适用 | 文档站 React/Vue 实时预览与示例源码同步更新 | 部分通过 | `docs build:framework-previews` 通过；独立外部 tarball 消费者未单跑本组件新用例 |

## 5. 验证环境与可重复证据

- 操作系统：macOS；浏览器：Google Chrome（经 Playwright 驱动）；Node 24.22.2、pnpm 12.14.0。
- 实际执行与结果：
  - `pnpm --filter @valar/react-ui check && pnpm --filter @valar/react-ui test`：通过（0 类型错误，20/20 测试通过）。
  - `pnpm --filter @valar/vue-ui check && pnpm --filter @valar/vue-ui test`：通过（0 类型错误，9/9 测试通过）。
  - `pnpm --filter docs build:framework-previews`：通过（React 与 Vue 预览产物重新生成）。
  - `pnpm --filter @valar/framework-comparison exec playwright test tests/sdk-color-picker.spec.ts`（指向 `http://localhost:5174/framework-previews/{react,vue}/index.html`）：8/8 通过（覆盖 React/Vue 浅色 900 px 与深色 320 px 的基础合同 + 新版色板/色相/透明度/四格式/最近使用/零溢出回归）。

## 6. 交付与结论

- **实现与导出**：`packages/react-ui/src/{color-picker.tsx,color-picker-color.ts}`、`packages/vue-ui/src/ui/color-picker/{ColorPicker.vue,color.ts,index.ts}`，同步微调 Svelte `docs/src/lib/registry/ui/color-picker/color-picker.svelte` 复制按钮无障碍名称避免与预设色按钮碰撞。
- **示例与文档预览**：`apps/react-preview/src/examples/color-picker.tsx`、`apps/vue-preview/src/examples/color-picker.vue` 及重新生成的文档站三端预览。
- **已知未验项**：真实手机触屏拖拽、真实系统中文输入法、屏幕阅读器（VoiceOver）播报及独立外部 tarball 消费者回归。
- **结论**：状态记为**部分实现（核心交互与三端对齐已验收通过，真机与辅助技术待后续统一验收）**。
