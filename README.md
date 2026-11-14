# Valar / Svelte

Valar 是个人组件库系列品牌，Svelte 是当前完整的框架实现。React、Vue 已有本地第一批九组原生组件，尚非完整库，也未发布。

本项目在完整技术基线上独立维护组件、文档、CLI 和 registry。Valar Svelte 已建立独立的品牌和分发配置，并按 Linear 参考逐批调整组件与组合。

## 开发

```sh
source ~/.nvm/nvm.sh
nvm use
npx --yes pnpm@12.14.0 install --frozen-lockfile
npx --yes pnpm@12.14.0 dev
```

当前本地预览为 http://127.0.0.1:5186 。生成内容就绪后可单独启动：

```sh
pnpm --filter docs exec vite dev --host 127.0.0.1 --port 5186 --strictPort
```

## 源码目录

- `docs/src/lib/registry/ui/`：79 个组件目录（含 Issue Composer 与 Issue Detail）。
- `docs/src/lib/registry/examples/`、`blocks/`：示例与组合区块。
- `docs/src/lib/registry/styles/`：唯一的组件风格 `valar`（2026-11-07 起，原上游 Nova；其余七套已移除）。
- `docs/content/`：Valar 文档与组件用法。
- `packages/cli/`：`@valar/svelte-cli`，命令名 `valar-svelte`。
- `packages/primitives/`：`@valar/svelte-primitives`。
- `packages/ui/`：`@valar/svelte-ui`，由唯一 registry 维护源生成的共享组件包。
- `apps/playground/`：只通过共享 UI 包使用组件的独立消费应用。
- `packages/parity/`：内部对照工具。
- `sv-addons/`：内部扩展模板，尚未发布。

## 项目共享组件（初期推荐）

需要频繁修改组件并让项目自动跟进时，将 Svelte 项目放在本 workspace 的 `apps/` 下，通过 `@valar/svelte-ui: workspace:*` 引用，而不是向每个项目复制整套组件源码。

```sh
pnpm dev:playground
```

该命令同时监听组件生成、样式／token 与底层原语，启动独立消费应用。组件编辑器须“写回组件库”后才影响应用；浏览器草稿不会同步。组件风格只有 `valar`（原 Nova），默认 neutral／Lucide。热更新可能重置临时交互状态，已部署项目仍须重新构建发布。

设置页、My issues、新建 Issue、Projects、Inbox 与 Agent 可从 `@valar/svelte-ui/blocks/*` 导入，在 Playground 的 `/linear` 联调。接入步骤、导入示例与验证边界见[共享 UI 工作区说明](standards/SHARED_UI.md)。自有包仍 private，未发布 npm，也未部署。

## 三框架使用入口

本地 `packages/react-ui`、`packages/vue-ui` 复用原生 shadcn/Radix、shadcn-vue/Reka 源码，统一读取既有 Valar 样式维护源；不是重新实现所有底层，也不在 React/Vue 中运行 Svelte。

**继续使用原来的 5186 文档站，不需要另开网站。** 组件页默认仍展示 Svelte 的「状态与调节」；打开「使用组件」，选择 Svelte、React 或 Vue，查看对应的安装、主题和可复制代码。链接里的 `?framework=react` / `vue` / `svelte` 可保留选择，刷新后仍有效。Svelte 使用原有文档。

React/Vue 第一批为 Button、Input、Checkbox、Select、Dialog、Calendar、RangeCalendar、Slider、Chart，共九组。其他组件明确显示「尚未提供」，不会把 Svelte 示例当作 React/Vue 用法。React/Vue 目前仍是 private、未发布包，页面提供本地 tarball 安装步骤，不表示可从 npm 直接下载。

原生接口、真实验收结果、安装和未验证边界见[第一批集成记录](standards/porting-records/first-batch-frameworks.md)。三框架对比应用仅保留为内部验收工具，当前额外的5212/5213/5214服务已关闭，不是使用入口；需要维护者复现时才运行 `build:frameworks` / `preview:frameworks` / `test:frameworks`。不代表全库77组或SSR、触屏、屏幕阅读器已对齐。

仅检查现有文档站的框架选择入口，不启动任何额外服务：

```sh
pnpm --filter docs exec playwright test --config playwright.usage.config.ts
```

## 设计师调参工作台

组件样式、图标、组合与验收见 [Valar Svelte 设计规范](standards/DESIGN.md) 和 [Linear 组件对齐清单](standards/LINEAR_ALIGNMENT.md)。浅深色截图取样见 [中性色规范](standards/NEUTRAL_COLOR_SPEC.md)。

调参主线是组件文档页内的按需微调（2026-10-31 确认）。截至2026-11-03，**68／68个组件已接入全屏编辑器**：67个普通示例入口及Sidebar block入口。支持各组件有限视觉参数的草稿、并排对比、命名版本和本地开发站确认写回；全局token在`/themes`修改，不在组件编辑器中重复定义。接入编辑器不代表所有API或所有业务组合均已验收，也不会自动修改消费者已安装的源码。

首页按“全局 token／组件／调参”三块展示，主导航只保留组件、设计 token（`/themes`）、文档。

**旧Studio**（`/workbench`）保留现有功能，暂不扩展、不在主导航展示，去留待决定。它提供中文参数面板与真实组件画布，支持草稿、具名版本、撤销重做、导入及可安装预设导出，手机上可切换预览和参数页签。

旧Studio仅接入Button、Dialog、Tooltip、Accordion，其覆盖统计不是新文档页编辑器的覆盖率。设计师操作、开发者安装、能力边界和后续安排见[工作台说明](standards/WORKBENCH.md)。浏览器版本保存不等于源码写回；开发写回不等于发布或部署。

## 分发状态

全部自有工作区包保持 private，尚未发布到 npm。默认 registry 为 `http://127.0.0.1:5186/registry`；可以通过目标项目 components.json 或 REGISTRY_URL 指定新的 Valar 地址。未配置生产域名。

从仓库根目录向目标项目安装组件：

```sh
pnpm --filter @valar/svelte-cli start add button --cwd /absolute/path/to/your-app --no-deps-install
```

目标项目先按站内安装说明初始化 Svelte 5、Tailwind CSS 4 和 components.json。自有运行时包通过 `pnpm --filter @valar/svelte-cli pack` 与 `pnpm --filter @valar/svelte-primitives pack` 生成本地 tarball 后安装；不能从 npm 下载尚未发布的包。随后安装组件实际需要的第三方依赖。

## 核验命令

```sh
pnpm build:cli
pnpm --filter @valar/svelte-cli check
pnpm --filter docs check
pnpm build
```

### 浏览器与独立安装回归

```sh
pnpm --filter docs exec playwright install --with-deps chromium
pnpm build
pnpm --filter docs test:e2e
```

浏览器回归会启动临时生产预览服务器，检查 Slider 的可访问名称、表单重置和 Enter 提交、Stepper 异步失败／取消、搜索按需加载与失败重试，以及 320／390／768px 文档布局与触摸导航。最后一项会打包实际 CLI，在工作区之外创建 SvelteKit 消费者，执行 init／add、严格第三方类型检查、生产构建和浏览器表单检查，结束后清理临时项目。不会发布包或部署。消费者显式带入类型补丁与 pnpm 兼容配置，步骤见站内安装说明的“严格检查第三方类型”。

复用已运行的文档站时可设置 `E2E_BASE_URL`；单独执行消费者检查时使用 `pnpm --filter docs test:consumer`，通过 `REGISTRY_URL` 指定正在运行的 registry。默认地址仍是本地开发 registry。

自有 GitHub CI 在 main push 和 pull request 时执行冻结安装、单元测试、工作区类型检查、整站构建和上述浏览器／消费者回归；只读仓库权限，没有发布或部署步骤。

本轮手机适配、无障碍、持续回归、类型兼容与加载优化的结果和限制见[六项优化验收记录](standards/porting-records/optimization-2026-10-31.md)。

## 来源与归档

技术基线来自 shadcn-svelte 的 main 提交 `fe4b0ad3b8b30c6745346db008c3307b5afeabb1`，于 2026-10-30 导入全部 6,132 个跟踪文件。原始文件摘要见 `upstream-source-manifest.json`，原始说明见 `UPSTREAM_README.md`。品牌独立不改变上游 MIT 许可及版权要求，相关声明继续保留。

`_archive/initial-starter/` 保留早期四组件工程；`_archive/upstream-branding/` 保留上游宣传历史、品牌素材和自动工作流。这些目录不属于运行中的站点或 pnpm workspace。

上游广告、赞助、社群、统计入口已移除；原作者宣传不再作为 Valar 页面内容。第三方依赖的技术文档链接仍按实际使用保留。上游发布、部署工作流已退出活动目录。本版本作为 Valar Svelte 后续深度定制的 Git 基础版本保存；尚未发布 npm 包或部署网站。

## 本轮验证（2026-10-30）

- CLI 与基础包构建、整站生产构建通过；CLI 与文档类型检查通过（文档零错误、零警告）。
- 11 项分发前置检查测试通过；冻结锁文件离线校验通过。
- 本地 CLI 从 Valar registry 向临时目标项目成功安装 Button。
- 首页、文档、Button、Dialog、更新记录和配置页抽查通过；Dialog 开关、手机宽度和深色切换通过。
- 抽查网络请求未发现上游广告、统计或 registry 请求。
- 462 个基础组件文件除内部包命名空间替换外未变化，导入基线为 8 套组件样式 CSS（现仅保留 `valar`，即原 Nova），许可证文件保持原样。
