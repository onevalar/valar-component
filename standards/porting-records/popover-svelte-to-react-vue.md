# Popover：Svelte → React / Vue 转换记录

## 1. 基本信息与范围

| 项目 | 内容 |
| --- | --- |
| 规范、日期与状态 | v1.0 · 2026-11-26 · 部分验收：普通表单、显示选项及嵌套交互通过；见待验范围 |
| 目标 | 使 Popover 成为两个原生包的独立组件，而不只用于日历年月选择；以现有 Svelte 行为和 Valar 设计为基准 |
| 来源 | Valar `cfd989c9f63156774dbfb3871cc1fa1774e62ee5` 的 [组件目录](../../docs/src/lib/registry/ui/popover)、[规则](../../docs/src/lib/registry/ui/popover/RULES.md) 与 [浏览器回归](../../docs/e2e/popover-alignment.spec.ts)，Svelte 5 / Bits UI 2.20.0 |
| 目标与许可 | React 19.2.3 / Radix Popover 1.3.1，Vue 3.5.45 / Reka UI 2.10.5。复用已有包装与 MIT 原语，不新增运行时依赖；固定上游来源和许可见 [React NOTICE](../../packages/react-ui/NOTICE.md) 与 [Vue PROVENANCE](../../packages/vue-ui/PROVENANCE.md) |
| 视觉 | 保留 12 px 圆角、默认 10 px 留白、4 px 锚点间距、工作区实色描边与阴影；显示选项为 330 px 首选宽度、组内 8 × 16 px 留白和 32 px 内容行 |

## 2. 能力对照

| 来源能力 | 目标行为与差异 | 证据及缺口 |
| --- | --- | --- |
| 触发器复合与开关控制 | 保留 `asChild` / `as-child`，React `open` / `defaultOpen` / `onOpenChange`、Vue `v-model:open` / `default-open` | 受控表单（提交关闭）与非受控选项面板开合通过；禁用、初始打开和宿主从外部打开未验 |
| 显式关闭、Escape、外部交互与嵌套归焦 | 导出原生 Close；模态选项、可取消事件及焦点由各引擎管理 | 取消、点击外部、两层 Escape 与键盘归焦通过；模态及取消事件未验 |
| 默认、`surface`、`options` | 共用 Valar 样式，映射 Radix / Reka 定位变量；保留原语的方向和对齐 API | 默认与 `options` 通过；`surface` 的真实 Command 组合、RTL 与全部对齐组合未验 |
| Portal、标题与描述、表单内容 | 默认 Portal；React `portalProps.container` / `false`，Vue `portalProps.to` / `disabled: true`。React 按示例显式关联标题，Vue 的默认名称来自触发器；描述均以 ID 关联 | 默认 Portal 的名称、描述、焦点与表单通过；自定义 Portal、内联与强制挂载未验 |

## 3. 状态与集成设计

- 关闭 → 用户触发或宿主设置 → 打开；内部 Select 打开时优先处理其关闭；退出时按原语规则还原焦点，不在包装层复制或同步开关状态。
- 输入值、提交与重置归宿主；关闭动作默认为非提交按钮。布局差异只使用 Valar 共享样式和原生定位 CSS 变量，保留下层引擎的事件、插槽与定位选项。

## 4. 逐项验收

| 维度 | 结果与证据 |
| --- | --- |
| 状态与数据 | 通过：受控提交、取消不写入、重开读取已保存值；选项变更关闭后保留，Reset 还原三项。其余受控边界待验。 |
| 表单语义 | 通过：`required` 阻止空提交；中文值通过 Enter 作为原生表单值保存；取消不提交。 |
| 键盘与焦点 | 通过：Enter 展开并聚焦字段，按 Space 切换复选框，内层 Escape 后归焦 Select，外层 Escape/Done 后归焦触发器。模态焦点约束未验。 |
| 无障碍 | 通过：浏览器验证具名 dialog、描述、控件名称、展开和选中状态；真实读屏未验。 |
| 输入法与国际化 | 中文值读写通过；IME 组合输入、长标签和 RTL 未验。 |
| 触摸与指针 | 鼠标点击、外部关闭通过；真实触屏未验。 |
| 异步与生命周期 | 不适用异步提交：原语不持有异步表单状态；演示为本地同步数据。强制挂载未验。 |
| SSR 与 hydration | 原生包的 SSR/hydration 未验；文档框架切换、刷新通过不等于组件 SSR 通过。 |
| 弹层与布局 | 通过：900 px 下 330 px、320 px 下 304 px；锚点间隔 4 px，边缘留 8 px；184 px 短屏的面板可滚动且键盘可到 Done。自定义容器及内联未验。 |
| 视觉与适配 | 浅深色、默认与 options、复选选中及嵌套通过。实测透明 Select 会露出下方分隔线；复用 Valar 实色表面后重测通过。减少动态效果下 options 无动画；普通动效时序未验。 |
| 性能与资源 | 无新增运行时依赖；预览大 chunk 警告保留，不承诺性能等价。 |
| 安全与隐私 | 不适用富文本、外部请求和敏感输入；示例仅保留本地状态。 |
| 类型与依赖 | 通过：两个 SDK 和两个预览类型检查，SDK 与预览生产构建。 |
| 分发与集成 | 通过：现有 docs 的 React/Vue 使用入口及实际 tarball 消费（见下）。Svelte registry 的 `popover.json` 正常响应。 |

## 5. 验证环境与可重复证据

- 2026-11-26，Linux orb，Chromium 157.0.8103.78，Node 24.22.2，pnpm 12.14.0。原生检查使用浅色 900 × 540、深色 320 × 540，另缩高到 184 px；视觉用 2× 截图和真实指针录屏。
- `pnpm --filter @valar/framework-comparison exec playwright test popover.spec.ts separator.spec.ts`：本地预览 8/8（各 4 项）。可用 `VALAR_TEST_BROWSER` 指向 Chromium；结果见 [Popover](../../apps/framework-comparison/tests/popover.spec.ts) 和 [Separator](../../apps/framework-comparison/tests/separator.spec.ts) 用例。
- 预热 docs 上，[framework-usage](../../docs/e2e/framework-usage.spec.ts) 6/6，[Svelte Popover 回归](../../docs/e2e/popover-alignment.spec.ts) 4/4。`pnpm --filter docs check`：134 篇中文文档通过，搜索索引 5,028 条，`svelte-check` 0 错误、0 警告。
- 独立消费者：两包均以 `pnpm --filter @valar/<框架>-ui pack --pack-destination <独立目录>` 生成 `0.1.0.tgz`。在两个独立安装根执行 `pnpm install --ignore-scripts`，实际路径分别位于各自的 `node_modules/.pnpm`，没有工作区链接；许可、主题、公开组件导入、类型检查和 Vite 7.3.6 生产构建均通过。独立 Vue fixture 显式限定 Tailwind 扫描范围（`source(none)`，`@source "./"`，包主题仍自行声明包内源）。在 5313/5314 启动这两个生产预览，设 `VALAR_REACT_URL` / `VALAR_VUE_URL` 后以同一命令复跑 8/8。
- 全量框架对比 35/38；失败来自首批 Button 圆角不等、Calendar Svelte 月份触发器和 36／28 px 日期格差异。本批未改这些组件或相关断言。
- `pnpm --filter docs build:svelte`：整站生产构建结束（退出码 0，峰值 RSS 约 7.19 GiB），未部署。Cloudflare adapter 警告 `_routes.json` 超限并省略 1,609 条排除规则，可能增加函数调用；本批未改部署配置。

## 6. 交付与结论

- 同一文档站 `/zh/docs/components/popover?framework=react` 或 `?framework=vue` 提供对应安装与示例，取自两个实际运行的 `PopoverExample`。公共包入口为 `@valar/react-ui/popover`、`@valar/vue-ui/popover`；Svelte registry `popover` 和 `@valar/svelte-ui/popover` 保持不变。
- 已通过约定的普通表单和显示选项场景，仍为部分验收；不把其他弹层组合、日历中的间接调用或文档可见性计为完整转换。
