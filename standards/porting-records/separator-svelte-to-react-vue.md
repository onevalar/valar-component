# Separator：Svelte → React / Vue 转换记录

## 1. 基本信息与范围

2026-11-26 · 转换规范 v1.0 · 本地可用，浏览器和独立 tarball 验收通过；边界见下。来源是 Valar `cfd989c9` 的 [Svelte Separator](../../docs/src/lib/registry/ui/separator) 与 [组件规则](../../docs/src/lib/registry/ui/separator/RULES.md)。React 19.2.3 使用包内已有的 Radix Separator 1.2.0，Vue 3.5.45 使用已有的 Reka UI 2.10.5；不增加运行时依赖。包装按本仓库 MIT 分发，依赖的 MIT 许可不变。

## 2. 能力与状态

| 来源行为 | 目标合同 | 差异及理由 |
| --- | --- | --- |
| 默认横向，父行内可纵向拉伸 | 框架原语接受 `orientation`，横向铺满，纵向沿交叉轴拉伸 | 样式读取 Radix / Reka 的 `data-orientation` |
| 默认具备 separator 角色，可仅装饰 | `decorative` 默认 false；为 true 时无分隔语义 | 保留原语语义；水平的 ARIA 方向可省略（默认水平） |
| 浅／深细线与局部覆盖 | 0.5 CSS px，黑色 8.8%／白色 8.3%，支持 `--valar-separator` | 样式沿用 Svelte 组件的主题变量 |
| 局部组合、属性与元素引用 | React `asChild` / `ref`，Vue `as-child` / `as` 与公开组件 ref | 不复制 Svelte snippet API |

不持有状态、数据、焦点或副作用；分隔线不可交互，由宿主布局决定长边尺寸。

## 3. 验收与分发

| 维度 | 实测结果及边界 |
| --- | --- |
| 布局及视觉 | 通过：两边浅色 900 px／深色 320 px；水平和垂直均 0.5 CSS px，竖线拉伸至父行高度，浅深颜色和局部颜色覆盖生效。另查看了 320 px 的两主题实际截图。 |
| 无障碍 | 通过：默认与纵向均有 `separator` 角色，竖向有 `aria-orientation="vertical"`；装饰线仍可见、不占语义，Popover 的两条分组线均为装饰。真实读屏未验。 |
| 状态、表单、键盘、指针、输入法、异步、性能与安全 | 不适用额外行为：组件无输入、状态、焦点、监听、数据访问或异步流程，无新运行时依赖。 |
| SSR、嵌入与国际化边界 | 未验：SSR 与 hydration、元素引用及 `asChild` 转发、真实 RTL 场景。 |
| 类型和分发 | 通过：原生 SDK、预览、独立 tarball 消费项目类型与生产构建；Svelte `separator.json` 正常响应。 |

- 公共入口：`@valar/react-ui/separator`、`@valar/vue-ui/separator`，两者也从包根导出。现有文档 `/zh/docs/components/separator?framework=react` 和 `?framework=vue` 使用两个实际预览的 `SeparatorExample`；Svelte `separator` registry 和 `@valar/svelte-ui/separator` 未改动。组合对照为 Linear 设置卡片的浅深 0.5 px 描边，实际原生组合在 Popover 的选择器、复选行和动作区之间使用（分隔线本身无图标或交互态）。
- [Separator 用例](../../apps/framework-comparison/tests/separator.spec.ts) 4/4，本地预览和独立消费预览各执行一次；[Popover 用例](../../apps/framework-comparison/tests/popover.spec.ts) 的装饰语义断言也通过。浏览器、命令及 tarball 隔离方式见 [Popover 转换记录](popover-svelte-to-react-vue.md#5-验证环境与可重复证据)。
