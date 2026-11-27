# 内容、反馈与布局：Svelte → React / Vue

2026-11-27 · 第 2 批 · 本地可用，代表场景通过。采用[转换规范 v1.0](../COMPONENT_PORTING.md)。来源为 `docs/src/lib/registry/ui/<slug>/`、对应 `RULES.md`、示例及共享样式，基线 `cfd989c9f63156774dbfb3871cc1fa1774e62ee5`（MIT）。不改变 Svelte 组件、registry 或 `@valar/svelte-ui`。未独立审阅。

React 19.2.3 / Radix 1.8.1，Vue 3.5.45 / Reka 2.10.5，共享 Tailwind 4.3.3 主题。复用 Button、Separator 和 Lucide；Carousel 复用同版 Embla 8.6.0（React adapter／Vue core），Resizable 用 React Resizable Panels 2.1.9／Reka Splitter。新实现遵守 Valar 合同，不复制 Bits UI 或 PaneForge 运行时；许可与来源见两包 `LICENSE`、`NOTICE.md` / `PROVENANCE.md`。

## 公开能力与验收入口

下表子路径在 `@valar/react-ui/<slug>` 和 `@valar/vue-ui/<slug>` 下分别导出，从各 SDK 根入口也可用。`apps/{react,vue}-preview/src/examples/<slug>` 的同一份源码同时供独立预览与文档的原生用法使用。

| 子路径         | 合同与目标差异                                                                                                                                         | 代表性组合                                             |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| `accordion`    | 默认单项可收起，也可多项；受控、初始值、禁用、方向键／首尾、循环、标题层级、量测动画；隐藏内容的保留方式沿用原语，无完全等同的 Bits `hiddenUntilFound` | 工作区访问／通知／禁用的 Billing，切换时焦点留在触发器 |
| `alert`        | 普通／危险／连接条，标题、描述、操作和可覆盖角色；重试和反馈由宿主安排                                                                                 | 连接状态、错误和重试按钮                               |
| `aspect-ratio` | 1:1 默认，正数比例，可组合媒体；裁切和媒体替代文本由调用者提供                                                                                         | 16:9 封面媒体                                          |
| `avatar`       | 普通 24/32/40、成员 24、订阅者 18、状态标记、堆叠与计数；图片变更后重新尝试，延迟的是 fallback 而非已加载图片，不提供可写的根加载状态                  | 渲染图片、失败首字母、多人和溢出计数                   |
| `badge`        | 七种变体，普通文本或链接，Label 点不参与播报                                                                                                           | 问题标签与可跳转状态                                   |
| `breadcrumb`   | 命名导航、路径、当前项、可换图标分隔与省略项；省略项菜单由宿主组合                                                                                     | 工作区路径与长标题                                     |
| `card`         | 默认／紧凑／设置，标题区 17rem 容器查询；相邻操作按剩余内宽换行                                                                                        | 设置面和带操作的项目卡                                 |
| `carousel`     | Embla 选项、插件、实例与重新初始化，横纵、RTL、原生前后按钮及边界禁用；减少动态效果缩短内置切换，插件自动播放和暂停入口归宿主                          | 项目亮点三卡，方向键／按钮与边界                       |
| `collapsible`  | 受控／非受控、禁用、自定义触发、28 px Properties、150 ms 指示器；立即开合，无 Bits 完成事件                                                            | Properties 面板键盘开合与焦点                          |
| `empty`        | 普通／无任务／筛选无结果，图标和内容插槽；清除、加载和归焦由宿主控制                                                                                   | 空态恢复操作                                           |
| `item`         | 三尺寸、三外观、工作区问题行、媒体、操作及分隔；链接／按钮语义由调用者组合，长标题在自身区域截断                                                       | 问题列表和尾部日期／操作                               |
| `page-layout`  | full/narrow、h1/h2、工具栏、plain/card 区段、settings/detail 属性行                                                                                    | 设置组与窄屏细节                                       |
| `pagination`   | 基于总项数、每页和邻近项的导航，越界显示收敛但不主动发更新；已选及禁用不提交新页，方向键移焦，原生 Enter/Space 选择，不内置路由同步或结果归焦          | 当前页、前后、范围读出和省略项                         |
| `progress`     | 非零起点、夹紧、null 未知状态、项目百分比和减少动态效果；宿主管理任务                                                                                  | 导入进度和未知状态                                     |
| `resizable`    | 原生百分比约束、键盘、拖拽、折叠、保存和恢复；React ref 是引擎句柄，Vue 用面板 ref／组事件，无 PaneForge 式整组原子布局写入；保存格式各引擎独立        | 项目和详情分栏，工作区分隔器与边界                     |
| `scroll-area`  | 纵／横／双向、覆盖式滑块、可命名的可聚焦视口、设置样式、滚动接力控制；Vue 还支持 `glimpse`                                                             | 动态列表和横向项目周次                                 |
| `skeleton`     | 装饰占位，减少动态效果时静止；忙碌状态由内容宿主声明                                                                                                   | 加载中的项目行                                         |
| `spinner`      | 16 px 默认，允许尺寸和名字覆盖，减少动态效果时静止                                                                                                     | 按钮和常驻加载状态                                     |

Typography 另提供语义化 JSX / SFC 指南，不是 SDK 子路径。指南保留标题层级、引用、列表、代码和轻量表面，样式沿用各包已接入的主题。

## 实际验证与边界

- React SDK 类型与 **16/16** 测试通过；Vue SDK 类型与 **8/8** 测试通过。React 全部新模块做过按子路径的 SSR 冒烟，Vue 内容例做过部分 SSR；未检验实际 hydration。没有控件参与表单值；有按钮的示例验证原生动作语义，不宣称应用表单、网络校验或保存。
- Chromium 157 / Linux orb：工作区链接的交互夹具覆盖 Carousel 横纵及 RTL、Avatar 加载失败／恢复、Resizable 拖动和持久化、Scroll Area 键盘和拖动。Vue 的六项交互另验 Reka 首帧的 trigger/panel 关联、Enter 折叠后的真实布局提交及滚动轴动态变更；这些发现已修复并复验。Vue 页码在页数 1–50、每个当前页、邻近项 0–4 的 6,375 个非空窗口与来源算法一致。
- Node 24.22.2 / pnpm 12.14.0：执行 `pnpm --filter @valar/{react,vue}-ui pack`（分别打包），在独立 Vite 7 工程从本地 tarball 安装，SDK 解析到各独立 `node_modules/.pnpm` 副本。两边类型检查及生产构建通过；未执行 pnpm 未批准的 esbuild、vue-demi 安装脚本。Vite 仍有体积提示，未做全站性能验收。
- `pnpm --filter @valar/framework-comparison exec playwright test`：独立 tarball 生产预览及 Svelte 对照 **78/78**。新增 `content-layout.spec.ts` **20/20**：18 项示例及 Typography 在 900 px 浅色／320 px 深色正常渲染；验证折叠方向键和焦点、轮播边界、当前页、真假进度值和动画偏好、头像回退、分栏和滚动几何。旧 Vue Radio Group 测试等待 Reka 异步选中再松键；现有快速松键可能只移焦的限制未改。
- `pnpm build:docs` 与最终示例的文档生产重建通过；`pnpm --filter docs check` 为 0 错误、0 警告，中文对照覆盖 134 页。生产文档 `playwright.usage.config.ts` **11/11**，包括两个框架新增的原生示例、Typography、Svelte 默认、框架切换与浅深主题的 320／390／1280 px 布局。
- 折叠面板开／关、深色问题列表、进度状态和分隔器拖动有截图／录制复核。问题列表通过显式单列网格约束长标题（320 px、行高 44 px、日期未被遮挡）；Properties 触发器高 28 px，展开后相邻禁用按钮无重叠。连续拖动前后左分栏约 236→309 px，独立回归另证实键盘操作后的尺寸变更和焦点未丢失。
- 真实触屏、实际读屏播报、跨浏览器、完整 RTL 与 hydration 仍待验证。未加入需要 IME 的编辑控件；相关输入法验收归后续复杂输入批次。图像、持久化和可选插件只接收宿主配置，无遥测或服务端请求逻辑。未提交、推送、发布或部署。
