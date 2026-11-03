# 共享 UI 工作区：修改一次，项目直接使用

2026-11-03 · 本地开发方案；不依赖远程 MCP，不发布 npm 包。

## 当前提供什么

业务应用与组件库放在同一个 pnpm workspace，以 `@valar/svelte-ui: workspace:*` 引用共享组件。应用不再通过 CLI 各自复制一套组件源码。

- **唯一维护源**仍是 `docs/src/lib/registry/ui/`、`hooks/`、`lib/` 与 `styles/`；没有移动或复制另一套手工维护源。
- `packages/ui/` 将 68 个组件生成成八套可消费样式，展开已有样式与写回覆盖、替换真实 Lucide 图标、解析内部依赖。`dist/` 是忽略的产物，不能手改。
- `apps/playground/` 是独立 SvelteKit 消费应用，仅导入公共包；不加载文档站、编辑器或文档图标 provider。
- 应用默认使用 Nova、neutral 浅／深主题和 Lucide。八套组件样式均有导出；其他基础色板／图标库的包级配置尚未提供。
- 自有包继续 `private`，没有 npm 发布、生产域名或自动部署。组件文档／CLI 安装方式仍保留，但已复制到外部项目的源码不会因此自动同步。

## 立即使用联调项目

使用 `.nvmrc` 的 Node 24.22.2 与 pnpm 12.14.0，在仓库根目录执行：

```sh
pnpm install --frozen-lockfile
pnpm dev:playground
```

安装脚本会先构建包和同步应用。`dev:playground` 先启动原语包监听与 UI 生成监听，等两者本次首次生成完成后才启动消费应用 Vite；已有 `dist` 文件不被当作就绪信号。本机端口为 5188。在 Amp orb 中用 `amp orb services ensure` 启动已配置的监督服务，并打开其输出的 Playground portal，而不是本机地址。

页面包含计数／输入、真实 Dialog 与必填 Questionnaire，可验证浅深主题、表单提交／重置、焦点与键盘行为。

## 接入实际项目

1. 在 `apps/<项目名>/` 创建或迁入 Svelte 5、Tailwind CSS 4 项目。迁移现有业务项目需要单独审阅，不会自动执行。
2. 应用 `package.json` 增加 `"@valar/svelte-ui": "workspace:*"`，然后在根目录运行 `pnpm install`。新应用需自行配置 SvelteKit／Vite／Tailwind 插件；可参照 `apps/playground/`。
3. 在应用主 CSS 中导入 Tailwind 和主题：

```css
@import "tailwindcss";
@import "@valar/svelte-ui/theme.css";
```

主题已声明组件源码扫描、语义颜色、字号／圆角／动效／边框工具类及深色变体，不需要从文档站复制 CSS。深色模式在 `<html>` 添加 `dark`，这样 Portal 内组件也能继承。

4. 从公共子路径导入组件：

```svelte
<script lang="ts">
  import { Button } from "@valar/svelte-ui/button";
  import * as Dialog from "@valar/svelte-ui/dialog";
</script>

<Button>保存</Button>
```

`apps/playground/src/routes/+page.svelte` 展示完整 Dialog 与 Questionnaire 组合。为 AI 开发项目时，明确要求它使用这些包路径，并阅读 `docs/src/lib/registry/ui/<组件>/RULES.md`、`meta.json` 和对应示例；不要让它再次 CLI add 或复制组件到业务项目。这里使用的是普通源码／文件工具，不需要远程 MCP。

5. 开发时保持 UI／原语 watcher 运行，并另启该业务应用的 dev 命令。已有 `dev:playground` 只启动 Playground，不自动启动未来所有应用；可将同样的三进程启动方式用于新应用。

### 选择其他样式

例如应用选择 Rhea 时，组件与主题应配套：

```svelte
<script lang="ts">
  import { Button } from "@valar/svelte-ui/styles/rhea/button";
</script>

<Button>保存</Button>
```

```css
@import "tailwindcss";
@import "@valar/svelte-ui/themes/rhea";
```

可选 `nova`、`vega`、`maia`、`lyra`、`mira`、`luma`、`sera`、`rhea`。无 style 前缀的组件子路径等价于 Nova。单应用建议统一一套样式；未提供运行时整体切换八套样式的功能。

## 修改如何生效

| 修改位置／操作                        | 消费应用的结果                                                     |
| ------------------------------------- | ------------------------------------------------------------------ |
| 编辑 `registry/ui/`、`hooks/`、`lib/` | watcher 重新生成共享包，Vite 自动更新引用它的应用                  |
| 组件编辑器点击“写回组件库”            | 写入 `styles/valar/style-*.css`，对应样式重新生成并更新应用        |
| 全局 token 页写回                     | 写入 `styles/valar/tokens.json`，当前包选用的 neutral 主题重新生成 |
| 只改编辑器草稿／保存浏览器版本        | **不会**更新应用；尚未写到维护源                                   |
| 修改 `packages/primitives/src/lib/`   | 原语 watcher 更新输出，UI 的底层交互随之更新                       |
| 修改业务应用的组合、文案、状态        | 只影响该应用；不会反向修改库                                       |

生成器仅改写内容实际变化的文件，并删除已移除的源码产物。源码解析失败时保留上一次可用输出并在终端报错；修复后保存会重试。看到旧界面时先检查 watcher 日志，不要把失败的生成当作同步成功。

**热更新不承诺保留所有临时状态。** Svelte 模块导出或组件结构变化可能重挂载父组件，导致输入／计数重置；配置变更、重新安装、build／check 的同步步骤也可能整页刷新。共享依赖解决的是修改传播，不是业务状态持久化，不应以 dev 热更新代替保存用户数据。

**“立即更新”只适用于正在开发的同一工作区。** 另一份 checkout 需要先同步代码；已上线应用仍须重新构建并按其发布流程部署，不会远程热替换。新增第三方依赖／修改导出后也需要安装或重启；本方案不承诺跨项目 API 破坏性修改自动兼容。

## 构建与验收

```sh
pnpm build:cli
pnpm test
pnpm check
pnpm build
pnpm --filter docs test:e2e
```

`build` 同时构建文档站和 Playground；`build:playground` 可单独构建消费端及它的工作区依赖。生产 E2E 会另启 5190 端口的 Playground 预览。未来业务应用需自行配置构建／部署；不假设根命令已经覆盖它们。

执行安装／生产构建前先停止相同应用的开发进程，完成后重新启动。完整原语打包与 SvelteKit 同步会批量改写开发服务器正在使用的文件，不作为普通保存的 HMR 场景支持。生产预览也应在构建完成后新启动；若使用 `E2E_BASE_URL` 复用旧服务，应先重启它，避免旧服务内存中的入口引用已经移除的构建资源。本轮实际遇到旧入口 404，重启后相同入口均恢复 200。

本轮本地验证：

- `pnpm install --frozen-lockfile --ignore-scripts` 校验通过，另行执行 `pnpm build:cli`、`pnpm test`（758项）、`pnpm check`、`pnpm build` 均通过；新 UI 包检查八套生成源码为零错误／零警告。新增与改动的代码文件定向 ESLint／Oxfmt 通过。
- 公共导出覆盖 68 × 8；生成源码均可编译，内部导入闭合，第三方运行时依赖均声明。
- 隔离 watcher 测试验证源码、样式、token、增删文件、无变化输出不改时间戳，以及错误后保留输出／恢复。
- 真实开发页面：Button 源码标记自动变化；Nova 高度／横向留白从 32／10px 改为 56／28px；neutral 圆角从 10 改为 16px、文字从 14 改为 18px；Questionnaire 原语标记自动变化。全部临时探针已还原，维护源没有留下参数变化。
- Button 模块更新实际重置了应用计数／输入，document 标记仍保留；token 还原与 Questionnaire 原语标记更新时输入／计数保留。不将这两次保留推广为所有 HMR 的保证。
- 额外修改 Questionnaire 的 `.svelte.ts` 状态逻辑输出标记，真实消费 DOM 自动更新，计数／document 标记保留，必填校验继续工作，浏览器错误为空；还原同样自动生效。
- 启动编排等两层 watcher 本次首次生成完成后才开放 Vite；真实冷启动后首次计数点击生效，浏览器错误为空。监督服务使用 `.nvmrc` 的 Node 24.22.2。
- 完整生产回归使用 `CI=1 E2E_BASE_URL=… pnpm --filter docs test:e2e --reporter=list`：**92 passed、2 skipped（4.9m）**。两项显式开发写回按原配置跳过，没有降低断言或新增跳过。此前复用旧预览的一轮为82通过、10失败、2跳过；修正预览生命周期后完整重跑，最终92通过。
- 新生产消费端用例验证计数／输入、Dialog 焦点约束与 Escape／关闭归焦、必填错误／FormData 提交／重置、深色与 390px 窄屏边界，且不请求文档站运行时、浏览器错误为空。浅色、深色弹层、窄屏截图与真实指针交互录像均已审阅；窄屏证据来自 Chromium，不是真手机。

范围限制：八套源码生成／类型检查不是全部 68 个组件的业务场景运行验收；本轮消费端实际运行 Button、Input、Label、Dialog、Questionnaire。现有文档站与组件回归继续保留。本次没有接入真实业务项目、发布包或部署。
