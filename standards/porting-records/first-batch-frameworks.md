# Valar 三框架第一批：统一外观与原生复用

## 范围与边界

2026-11-08。第一批为 Button、Input、Checkbox、Select、Dialog、Calendar、RangeCalendar、Slider、Chart，共九组。**不是全库 77 组完成，也不是三个框架全部 API、视觉效果和运行环境等价。**

真实触屏、屏幕阅读器、Windows/Linux 实机、SSR/hydration、完整输入法及 RTL 组合、普通动效的跨框架时序尚未验证。无业务账号或系统权限流程。当前为本地 private 包和预览，未提交、推送、发布 npm 或部署。

**当前使用入口是原来的 5186 文档站。** 组件页默认仍为 Svelte 的状态与调节；「使用组件」内选择 Svelte / React / Vue。第一批之外明确标为尚未提供。额外的5212/5213/5214服务已关闭，对比源码仅作为内部验收工具保留。

**整站生产构建未通过，不作可部署结论：** 当前在既有 RulerSlider 的虚拟 CSS 加载时报 `Invalid declaration: HTMLAttributes`。在构建进程内注入 HEAD 的旧组件路由（不导入本次 FrameworkUsage），仍在同一文件以同一错误失败；没有回滚工作区或顺带改动尺子/构建插件。新增入口的开发站运行验收与该整站构建问题分开报告。

遵循 `COMPONENT_PORTING.md` v1.0。React/Vue 直接保留已有原生组件和交互引擎；没有将 Svelte 包装成两个版本，也没有从头重写控件。完整来源、API 和各自验证历史见 [React 记录](first-batch-react.md)、[Vue 记录](first-batch-vue.md)。本记录是最终三方集成结果的归属处。

## 原站三框架使用入口

- 保留现有「状态与调节」「说明与准则」，只新增「使用组件」。Svelte 继续使用原 Markdown 文档，未另造预览。框架选择不把 React/Vue 运行时装入 Svelte 文档站。
- 九组 React/Vue 共18份完整原生示例，经各自真实 tsc/vue-tsc 检查通过；不是把 Svelte 源码换后缀。展示对应的本地打包、安装及主题步骤，图表和 Vue 日期示例列明其直接使用的额外依赖。组件包仍 private、未发布。
- 当前 URL 的 `framework` 参数保留选择，刷新和现有语言切换均有效，其他查询参数不丢失。使用 SvelteKit 的 goto/replaceState 选项保留焦点和滚动位置；不是 shallow replaceState，因为本机版本只更新 page.state、不更新页面使用的 page.url。
- React/Vue 使用页不显示 Svelte 专属 Bits API / 源码按钮；未接入组件显示「尚未提供」，无安装命令或伪示例。
- 复用 Valar SegmentedControl、Tabs、Badge 和 CodeBlock。长代码按容器宽度软换行，复制仍为原始代码；中英文、明暗、320/390/1280px、键盘方向键/Home及切换后焦点实际检查。
- 本轮文档检查0错误/0警告；当前 docs 测试22文件265项通过（包含并行 sidebar 测试，不将其作为本任务新增）。新增原站浏览器回归6/6通过，覆盖默认Svelte、十八个入口、剪贴板、刷新、语言、未提供状态和窄屏代码/页面无横向溢出。
- 实际执行页面中的两条 pack 命令，确认产物位于仓库根 `dist/packages/valar-{react,vue}-ui-0.1.0.tgz`。初次相对路径错误输出至仓库外，已删除这两个临时文件并更正命令，没有保留错误产物。
- 原站明暗12个状态捕获及运行时/HTTP错误检查见 `.amp/in/artifacts/framework-site/`，新增部分换行后的最终图以 `*-final.png` 为准。原站保持运行，未操作 TokenPlan 进程、正式安装或其他本地服务；未提交、推送、发布、部署。

复用现有5186，不新建服务器的回归命令：

```sh
pnpm --filter docs exec playwright test --config playwright.usage.config.ts
```

必要时用 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` 指向已安装的 Chromium；或用 `E2E_BASE_URL` 指定已有文档站。该配置不会启动对比/独立消费者服务。检查日志为 `.amp/in/framework-site-{check-final,unit-final,browser-final,lint,build,build-baseline}.log`；生产构建失败记录如首页所述，不算通过。

## 来源与维护方式

- Svelte：当前 `@valar/svelte-ui` 公共入口，Svelte 5 runes、Bits UI、LayerChart。只修复本批实测发现的 Chart.Tooltip 空值错误，见下文；其他既有组件行为不改。
- React：固定 shadcn-ui/ui `42f3bb63b46a69e52a24bd005cdc9ec15ba7a7b9` 的 Radix 源树；React/Radix/DayPicker/Recharts 原生组合。MIT 许可及来源保留在 `packages/react-ui/LICENSE`、`NOTICE.md`。
- Vue：固定 unovue/shadcn-vue `d1bf1b3a2d1a824b19f32d7253a28a43797b8253` 的 Reka 源树；Vue/Reka/Unovis 原生组合。MIT 许可及来源保留在 `packages/vue-ui/LICENSE`、`PROVENANCE.md`。
- `scripts/valar-style.ts` 只在构建期读取既有 Valar 样式、token 和主题；三个包共享维护源，不复制三套 token。Vue 对已核对的原生状态属性和定位变量作窄范围映射。
- React/Vue 分发源码与自包含主题 CSS，各自保留原生 props/callbacks 或 props/emits/slots；运行时不导入 Svelte。Svelte 原主题生成输出保持不变。
- 四处原有 code-block 示例改动，以及收尾期间出现的 sidebar 相关并行修改，不属于本任务，未改写或并入本批实现。

实际安装环境：macOS Darwin 27.2.0 arm64、Node 24.22.2、pnpm 12.14.0、Playwright 1.62.0、Chromium 147.0.7727.15；zh-CN、Asia/Shanghai、Geist 5.2.8。Svelte 5.57.2 / Bits 2.20.0 / LayerChart 2.0.3；React/DOM 19.2.3 / Radix 1.8.1 / DayPicker 9.14.0 / Recharts 3.8.0；Vue 3.5.45 / Reka 2.10.5 / Unovis 1.8.0 / internationalized-date 3.12.0；三边 Tailwind 4.3.3。这些是本机安装事实，不沿用盘点阶段上游锁文件的版本推断。

受控安装后 `install --frozen-lockfile --ignore-scripts` 通过；对比原有 importer 的依赖基础版本号没有变化，锁文件主要新增两套原生依赖及相应 peer 组合。Svelte 主题输出与调整生成器前逐字节一致，没有借此次对齐改全局主题。

## 能力合同

| 组件          | 本批保留和验证的可观察合同                                        | 原生接口及范围限制                                                                                          |
| ------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Button        | 默认/outline/胶囊/圆形图标、32px 默认高度、点击、禁用、不意外提交 | 各框架原生 children/slot/snippet；不是全变体组合认证                                                        |
| Input         | 同一字体/尺寸/主题、中文和 Unicode 值、表单提交/重置、禁用省略    | 各框架原生受控接口；真实输入法和全部 validation 待验                                                        |
| Checkbox      | 键盘 Space、选中反馈、状态及表单值、禁用                          | 原生 checked/modelValue；不强求 DOM 相同                                                                    |
| Select        | 原生选项键盘导航、End/Enter、提交、弹层、重置、禁用               | 默认 popper/start；焦点与 aria-activedescendant 两种实现都按实际活动项等待                                  |
| Dialog        | 中文关闭、焦点进入/循环、Escape、恢复触发按钮、弹层布局           | 原生 Portal/Teleport；未验证全部嵌套宿主                                                                    |
| Calendar      | 36px 日期、中文月/年选择、12 选项、点击/键盘更新日期、重置        | React Date、Svelte/Vue DateValue；日期不是自动表单字段                                                      |
| RangeCalendar | 原生两次点击生成新区间、范围选中反馈、中文标题、重置              | React DateRange 与其他框架原生范围对象；保留各自原语                                                        |
| Slider        | 标量四箭头/Shift/Page/Home/End、步进边界、修饰键穿透、提交/重置   | min=-20,max=80,step=3 的最后合法步为79；Svelte/Vue示例显式隐藏字段，Reka原生name使用数组序列化；多thumb待验 |
| Chart         | 实际图表、固定0–40轴、chart-2、零值、null缺口、原生tooltip        | LayerChart/Recharts/Unovis，不强求SVG结构、刻度算法和默认过渡完全相同                                       |

## 内部原生验收对比（历史入口）

首次集成验收使用5212（父页面；`/svelte.html` 是真实 Svelte）、5213（React）、5214（Vue）。用户确认只使用原5186后，已关闭这三个服务。以下保留维护者按需复现方法，不作为用户入口。共享 `standards/comparisons/frameworks/fixtures.ts`、布局 CSS、Geist，状态彼此独立。预览页面不是截图或重写的静态壳。

父页面支持明暗、禁用、匹配宽度与统一重置。ready 消息验证 origin、event.source、协议和框架；页面挂载后才发 ready。iframe 只隔离样式/运行时，不代表已经验证任意真实应用的嵌套弹层。

```sh
source ~/.nvm/nvm.sh
nvm use
npx --yes pnpm@12.14.0 install --frozen-lockfile
npx --yes pnpm@12.14.0 --config.verifyDepsBeforeRun=false build:frameworks
npx --yes pnpm@12.14.0 --config.verifyDepsBeforeRun=false preview:frameworks
# 另一终端；必要时用 VALAR_TEST_BROWSER 指定已安装的 Chromium。
npx --yes pnpm@12.14.0 --config.verifyDepsBeforeRun=false test:frameworks
```

预览命令保持运行，Ctrl+C 一并停止本命令启动的三个服务。不停止其他项目和 TokenPlan 应用。

## 集成验收

通过只限下表实际场景，不表示九组全部能力等价。未删除断言、增加跳过或改用静态替身。

| 领域                 | 已执行结果及边界                                                                                                                                                          | 证据                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 构建、类型、SDK 单测 | 三 SDK/三预览生产构建和六包类型检查通过；Svelte 2、React 9、Vue 5 项 SDK 测试通过；Svelte 检查为 0 错误/0 警告                                                            | `.amp/in/first-batch-build-final.log`、`first-batch-check-final.log`、`first-batch-svelte-tests.log` 等日志 |
| 既有文档测试         | 本批运行时的 21 文件、205 项通过；不冒认之后并行添加的 sidebar 测试                                                                                                       | `.amp/in/first-batch-docs-tests-final.log`                                                                  |
| 状态与表单           | 30 项生产浏览器检查通过：三边明暗 × 390/900、同一初值、点击/编辑、禁用字段排除、真实 FormData、原生 reset + 受控状态恢复                                                  | `apps/framework-comparison/tests/first-batch.spec.ts`；`first-batch-workspace-browser.json`                 |
| 键盘、焦点和语义     | Select 方向/End/Enter、Checkbox Space、Dialog 初始焦点/Shift+Tab/Escape/恢复、Calendar 键盘和未来年、Slider 数值键和修饰键通过；React 额外公开浏览器用例 1/1              | 同上；`.amp/in/first-batch-react-browser-final.log`；不是读屏验收                                           |
| 中文和输入法         | 中文日期、月/年顺序、12 项选择、Unicode 直接填写通过；真实输入法组合、RTL、所有长文本场景未验证                                                                           | 同一公共 fixture 和浏览器测试                                                                               |
| 指针、触摸           | 日期/区间两点重选、弹层和 Slider 指针点击通过；触屏、拖动取消、多 thumb 未验证                                                                                            | 同一浏览器测试；不以窄视口冒充真手机                                                                        |
| 数据与图表           | 0/9 悬停、null 断线及空值列悬停、不保留过期读数、不抛错通过；React 数字刻度不越出 SVG                                                                                     | 明暗六项图表用例；`first-batch-chart-null-{before,after}.log`                                               |
| 弹层与布局           | 原生 Portal/Teleport、月份 Popover、Select start 对齐及 4px 间距通过；任意宿主嵌套、所有滚动锁组合未验证                                                                  | 公开浏览器用例和最终截图                                                                                    |
| 视觉与主题           | 同一字体/token；明暗四类基础控件高度/圆角/字体/颜色/内距一致；390px 视口扣除实际原生滚动条留白及两侧24px内距后，日历填满内容区，日期36×36px、三边布局逐项一致，无横向溢出 | 30 项中的跨框架测量；`.amp/in/artifacts/frameworks-final/`                                                  |
| 动效与生命周期       | 浏览器验收使用 reduced-motion；表单 remount、父页重置和切主题通过；普通动效等价、资源泄漏/压力测试未验证                                                                  | 不从截图推断时长或“没有泄漏”                                                                                |
| SSR/hydration        | React 局部 server-render 合同测试通过；真实 SSR 宿主、水合和其他框架服务端场景未验证                                                                                      | React 记录及首页边界                                                                                        |
| 安全与隐私           | 保留可信开发者 ChartConfig 边界；ready 检查来源窗口/origin/协议/框架，错误发送者被拒绝；截图轮次无运行时/资源错误                                                         | 对比页源码、父页用例、`frameworks-final/rendered.json`                                                      |
| 分发与依赖           | 两个最新 tarball 在工作区外真实安装、公共导入、许可、非仓库 symlink、无 Svelte 运行时依赖、类型/生产构建通过；同套浏览器场景切到独立消费者 29/29                          | `first-batch-consumers-final.log`、`first-batch-consumer-browser.json`；29 项是重复执行，不是新增 29 项能力 |
| 性能与资源           | React/Recharts 与 Vue/Unovis 的真实大 chunk 警告保留；没有调高阈值隐藏。未建立性能预算，不承诺体积/速度等价                                                               | Vite 构建日志；演示页体积不是单个控件体积                                                                   |

最终图像包括明暗总览，以及三边选中/Select 打开、Dialog、月份网格、图表零值、禁用状态，共 32 张原始捕获；截图轮次的运行时及资源错误均为空。截图必须实际审阅，不能只根据生成文件数量判定外观正确。

收尾复核加强了两处测试条件：Tooltip 必须已显示当前目标数值且 opacity=1，不能把上一点内容或透明容器当作悬停就绪；日历宽度按真实内容区断言，而非假定原生滚动条永不占宽。后者首次硬编码342px失败时，实测三边都是html/body 379px、原生stable gutter 11px、日历331px；没有改组件或共享CSS消除留白，36px日期和三边完整几何一致断言保留。此前342px是无占宽留白时的记录，不是所有系统的固定合同。修订后的完整两套浏览器结果见上述JSON。

## 独立消费者复现

1. 在工作区完成 SDK build，再分别执行 `--filter @valar/react-ui pack --pack-destination <临时目录>/packs` 和 Vue 对应命令。必须使用最新 tarball，不复用旧 node_modules 链接。
2. 在仓库外新建 `apps/react-preview`、`apps/vue-preview`；仅复制各 preview 的 `src`、`index.html`、`vite.config.ts`、`tsconfig.json` 和共用 `standards/comparisons/frameworks`，不复制 node_modules 或 dist。
3. 由 preview manifest 生成消费者清单：SDK workspace 引用替换成 `file:<对应 tgz>`，其余直接依赖固定为本次实际安装版本。执行 `install --ignore-scripts`，再分别执行 `check`、`build`。检查 SDK realpath 位于临时消费者内，并存在 LICENSE、相对源码与主题入口。
4. 启动两份消费者生产预览 5313/5314；在组件库执行以下命令，沿用真实 Svelte 基准并比较独立消费的 React/Vue。父页面仍固定 5213/5214，因此只排除那一条父页集成检查，其余 29 项原断言原样保留。

```sh
VALAR_REACT_URL=http://127.0.0.1:5313/ \
VALAR_VUE_URL=http://127.0.0.1:5314/ \
npx --yes pnpm@12.14.0 --config.verifyDepsBeforeRun=false \
  --filter @valar/framework-comparison test --grep-invert 'comparison runs three isolated'
```

当时已停止这两个临时服务并删除临时消费者；5212/5213/5214曾保留供复查，现也按用户的新方向关闭。无需运行它们即可使用5186的框架选择入口。

## 差异判定与修正

- 不用改 fixture CSS 掩盖差异。实测发现的 Select 定位、日历标题/导航/范围底色、Slider 最后合法步和禁用字段提交，在原生 SDK 中修正。
- Select 的原生焦点调度不同：测试等待实际活动选项而非无等待地连续按键，不删除操作或放宽选择结果。
- React RangeCalendar 使用 DayPicker 已有 `resetOnSelect`，不重新编写范围选择引擎。
- 日期类型、表单序列化和图表原生接口是明确的 API 适配，不宣称可直接交换调用代码。
- **基准缺陷修复，而非原样等价**：Svelte Chart.Tooltip 原来只排除 undefined，鼠标从9移到周三的 null 列时抛 `toLocaleString` 错误并留下旧9。保留真实公共悬停的失败证据后，改为同时排除 null/undefined、保留0；相同用例及明暗六项图表检查通过。规则同步在 Chart/RULES.md。
- React 图表默认隐藏刻度线但仍预留 6px 长度；窄轴使40左侧被裁掉。配置现成 `tickSize=0` 和 4px 文字间距，保留引擎和绘图区，新增实际数字边界断言。不是把40改写成10，也不以降低截图要求掩盖裁切。
- Vue 初轮焦点失败来自测试冻结 Date.now，触发 Vue 自身事件时间戳守卫；改用同一初始日期且正常走时的 `setSystemTime`，原操作通过，未修改 Vue 引擎。LayerChart 同版本 peer 副本原先拆开上下文，比较应用 dedupe 同一 runtime 后真实 Tooltip 正常；未用假 Tooltip 替代。
- 原生图表的绘图区/轴排布和普通动效仍有差异，DayPicker 的 chooser/navigation 共用边界与 Bits 不同；扩大日期窗口需显式传原生边界。这些不计为全部效果/API 等价。
- 全库剩余组件、CLI/registry/调参器三框架复制、发布与部署不属于本批。
