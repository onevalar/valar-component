# Valar Studio 参数工作台

> **2026-11-07 更新**：站点只保留一个组件风格 `valar`（即原 Nova），其余七套（Vega、Maia、Lyra、Mira、Luma、Sera、Rhea）已移除，风格切换入口不再提供。下文凡提到“八套样式”的验收记录均为当时的历史记录，不代表当前状态。

## 主线决定（2026-10-31）

用户于 2026-10-31 确认：**组件文档页内的按需微调是调参能力的主线**。新组件的调参优先以组件页微调的方式接入。
`/workbench` 的 Studio 保留现有功能和回归，暂不继续扩展到新组件；它的长期定位另行决定。
2026-10-31 站点改版后，主导航只保留“组件、设计 token、文档”；Studio、Blocks、Charts、Create 不再出现在导航，但原地址仍可访问，代码未删除。

## 路线图与下一步（2026-11-03 更新，接手前必读）

已确定的方向：

- 调参主线：组件文档页内按需微调；交互采用**全屏编辑器**（Button 已完成，见下文）。
- 参数分层：全局 token（颜色、`--radius`、字号阶梯）只在全局配置页修改；组件页只调本组件参数，全局 token 只读。
- 首页采用“全局 token／组件／调参”三块（方向 C）；主导航只保留组件、设计 token、文档。
- DialKit 继续使用，直到 Valar 具备其全部控件（对照见文末）；缺什么补什么。

| 顺序 | 任务                                | 状态                        | 要点                                              |
| ---- | ----------------------------------- | --------------------------- | ------------------------------------------------- |
| 1    | Button 组件参数写回组件库           | 完成                        | 写入 `styles/valar/style-*.css`，仅本地开发站可写 |
| 2    | 首页方向 C、导航精简                | 完成                        | Studio 等入口隐藏不删                             |
| 3    | Button 全屏编辑器（方向 B）         | 完成                        | DialKit `inline` 模式                             |
| 4    | 补 Slider Field、Color Picker       | 完成                        | 见组件补充清单 VCOMP-005／006                     |
| 5    | 全局 token 配置页（扩展 `/themes`） | 完成                        | 写入 `styles/valar/tokens.json`，仅本地开发站可写 |
| 6    | 动效、边框宽度 token（第二期）      | 完成                        | 时长四档、曲线三档、边框粗细；见下                |
| 7    | 把全屏编辑器推广到第二个组件        | 完成（Dialog）              | 共用外壳 `component-tuner.svelte`；见下           |
| 8    | 组件自带设计规范（AI 友好）         | 完成（样板：Button、Field） | 见下                                              |
| 9    | 组件说明卡（借鉴 Arc）              | 完成（20 个常用组件）       | `ui/<组件>/meta.json`，是 10–12 步的唯一数据源    |
| 10   | 给 AI 读的资料                      | 完成                        | catalog.json、三种 llms.txt、组件页 `.md`         |
| 11   | Valar 可安装技能包                  | 完成（设计方法待用户编写）  | `skills/valar-svelte`；`guides/` 三个文件为占位   |
| 12   | 本地 MCP 服务 `valar-svelte mcp`    | 完成（本地版）              | 线上版等用户准备好服务器后再做                    |
| 13   | 共享 UI 包与独立消费应用            | 完成（本地验收；远端CI另跟进） | 758项单测、全仓检查／构建、92项生产E2E通过；见[接入与验收](SHARED_UI.md) |

**当前进度（2026-11-03）**：文档页全屏编辑器已覆盖 **68／68**（67个普通示例入口＋Sidebar block入口）。E12–E14共25个新增编辑器已统一推送至main：[f62fb33](https://github.com/onevalar/valar-svelte/commit/f62fb33b14de412d8901d40dfec2558368eff81b)，[远端CI全部通过](https://github.com/onevalar/valar-svelte/actions/runs/41600027003)。本轮组件接入已完成，没有剩余组件待接入；后续优先收尾和真实项目试用，不自动新增参数、发布包或部署。用户另授权本地收尾，语言切换接管前丢点击的复现、修正与验证见[E14记录](workbench-remaining-editors-acceptance-2026-11-03.md)。本次收尾已通过本地验收，用户已明确授权提交推送；其远端CI与上述组件接入提交分开跟进，具体交付见Git历史及线程记录。

**共享消费链（2026-11-03）**：用户决定初期先不做远程 MCP，优先让项目跟随组件库修改。新增 private `@valar/svelte-ui` 与 `apps/playground`，唯一维护源仍在 registry；开发监听传播源码、已写回样式／token 和原语变化。默认 Nova／neutral／Lucide，八套组件样式可导入。接入方法与热更新状态／同工作区／部署边界见[共享 UI 说明](SHARED_UI.md)。本任务没有迁移真实业务项目、发布或部署；本批按用户授权统一提交推送，远端CI与本地验收分开跟进。

**历史基础进度（2026-11-01）**：第1–12步、A1–A3、B1–B3及D1–D4已完成并推送。C1–C3仍待用户决定；`skills/valar-svelte/guides/` 的组合、文案、动效内容由用户编写，AI不要动。下文E1–E14过程与“历史：剩余10个”保留各批验收口径，不作为当前待办。

**组件编辑器推广**（2026-11-02）：Hover Card、Context Menu、Drawer 已完成，见[弹层编辑器验收记录](workbench-acceptance-2026-11-02.md)；Tabs、Card 已完成，见[Tabs／Card 验收记录](workbench-tabs-card-acceptance-2026-11-02.md)。这两批已推送至 `main`（[2633f5f](https://github.com/onevalar/valar-svelte/commit/2633f5fd8c96cd7e6ae41a9f6d7b62fcbc257819)），GitHub CI 全部通过。Checkbox、Radio Group、Switch 已完成并推送（[c57b2fc](https://github.com/onevalar/valar-svelte/commit/c57b2fcaee32645ae7e9cf0968ff5fd6f21bb5ac)），GitHub CI 全部通过，见[选择控件验收记录](workbench-selection-controls-acceptance-2026-11-02.md)。Toggle、Toggle Group、Slider（E4）已推送至 `main`（[ad8fde5](https://github.com/onevalar/valar-svelte/commit/ad8fde528a21b668db21774b6eafb2f8d12e6ec4)），GitHub CI 全部通过，见[验收记录](workbench-toggle-slider-acceptance-2026-11-02.md)。Native Select、Input Group、Input OTP（E5）已推送至 `main`（[638bfb4](https://github.com/onevalar/valar-svelte/commit/638bfb4608891b580886dfd344c16e4390404886)），GitHub CI 全部通过，见[验收记录](workbench-input-composites-acceptance-2026-11-02.md)。Badge、基础 Table（E6）已推送至 `main`（[b91209e](https://github.com/onevalar/valar-svelte/commit/b91209e364e2ee825fe2a9f57ae8c820cc5b124c)），GitHub CI 全部通过，见[验收记录](workbench-badge-table-acceptance-2026-11-02.md)。Alert、Empty（E7）已推送至 `main`（[d306978](https://github.com/onevalar/valar-svelte/commit/d3069785c43da9288653d88b1f9fb78385fb24cd)），GitHub CI 全部通过，见[验收记录](workbench-alert-empty-acceptance-2026-11-02.md)。Accordion、Alert Dialog（E8）已推送至 `main`（[493dea9](https://github.com/onevalar/valar-svelte/commit/493dea9985816494a19883eedd49a4ace1bb84a2)），GitHub CI 全部通过，见[验收记录](workbench-accordion-alert-dialog-acceptance-2026-11-02.md)。Avatar、Item（E9）已推送至 `main`（[23f3a4c](https://github.com/onevalar/valar-svelte/commit/23f3a4c066e10980166aa44cdd68f1c757ef7d2d)），GitHub CI 全部通过，见[验收记录](workbench-avatar-item-acceptance-2026-11-02.md)。本批 E10 接入 Number Field、Slider Field，覆盖增至 **33／68 个**；参数、交互、写回与回归证据见[本批验收记录](workbench-number-slider-field-acceptance-2026-11-02.md)和所链工作线程。用户已授权本批验收通过后统一提交推送，不发布包或部署站点。其余组件见下面“剩余 35 个组件的优先级”；不扩大旧 Studio 的覆盖范围，不自动启动下一批。

**历史批次 E11（2026-11-03）**：四组并行完成 Tags Input、Button Group、Breadcrumb、Pagination、Progress、Skeleton、Spinner、Kbd、Menubar、Navigation Menu，该批结束覆盖 **43／68**，剩余 **25**。上段33／68为E10历史快照。647项单元测试、全仓检查、生产构建、59项生产E2E以及十组件真实开发站写回通过，见[本批验收记录](workbench-p2-parallel-acceptance-2026-11-03.md)。按用户授权统一提交推送，不发布或部署，不自动开始下一批。

**历史批次 E12（2026-11-03）**：按用户授权四组并行接入 Calendar、Range Calendar、Command；Carousel、Color Picker；Attachment、Bubble、Message；Code Block、Trace、Stepper，共11项，覆盖增至 **54／68**，当时剩余 **14**。660项单元测试、全仓检查、生产构建、71项生产E2E（2项开发写回按配置跳过）及11组件真实开发站写回通过；默认／比较／390px最大数字参数深色截图和真实指针录像已审阅，见[验收记录](workbench-p3-parallel-acceptance-2026-11-03.md)。现已随E14统一推送，交付与CI见上面的当前进度；不发布或部署。全仓lint另有130个本批未修改文件的既有格式问题，本批代码定向Oxfmt／ESLint通过。

**历史批次 E13（2026-11-03）**：Questionnaire、Chart、Sidebar、Sonner四组完成有限参数编辑器与本地验收，覆盖增至 **58／68**。当时剩余 **10** 项为Collapsible和P4九项，暂缓安排随后被用户的E14要求取代。666项单元测试、全仓check、生产构建、76项生产E2E（2项开发写回默认跳过）、四组件真实UI写回与Sidebar八样式endpoint→registry→CLI add安装回读通过，见[验收记录](workbench-isolated-previews-acceptance-2026-11-03.md)。Sidebar／Sonner用独立document隔离窗口／Portal／通知store，不将同源iframe宣称为storage安全沙箱；Sonner普通Tab不暂停沿用上游现状。现已随E14统一推送，交付与CI见上面的当前进度。

**最新进度 E14（2026-11-03）**：按用户明确要求，四组并行接入Field／Form／Label、Collapsible／Aspect Ratio／Separator、Resizable／Scroll Area、Message Scroller／Marker，文档页编辑器覆盖增至 **68／68**（67项普通示例入口＋Sidebar block入口）。只开放自身有限视觉参数，不保存校验、宽高比、分栏比例或滚动跟随等场景状态，默认外观保持不变。756项单元测试、全仓check、生产构建、90项完整生产E2E（含本批14项，2项开发写回默认跳过）、十组件真实UI写回及实际CLI安装／37份Svelte编译通过，见[验收记录](workbench-remaining-editors-acceptance-2026-11-03.md)。完整回归另记录一次既有语言切换波动，不将单次通过当作已修复。用户随后明确要求“提交推送”，本轮统一交付E12–E14；上述未提交／未授权文字保留为各批验收时的历史快照。不发布包或部署站点。

### 后续任务（按顺序；完成一项就在此更新状态）

| 编号 | 任务                                 | 状态 | 说明                                                                                                                          |
| ---- | ------------------------------------ | ---- | ----------------------------------------------------------------------------------------------------------------------------- |
| A1   | 组件编辑器接入 Popover、Sheet        | 完成 | 与 Dialog 同类（遮罩、动效档位、出现时缩放／滑入距离），照 `dialog-tuning.ts` 做；Sheet 的滑入距离属于组件参数                |
| A2   | 接入 Dropdown Menu、Tooltip          | 完成 | 弹层类收尾；Tooltip 的显示延迟属于组件参数                                                                                    |
| A3   | 接入 Input、Select、Textarea         | 完成 | 高度、圆角档位应与 Button 同一套档位，避免组件之间割裂；当前值量取方式参照 Button                                             |
| E1   | 接入 Hover Card、Context Menu、Drawer | 完成（验收通过） | 共用全屏外壳；八套样式读写、真实交互与窄屏通过，见[验收记录](workbench-acceptance-2026-11-02.md)                              |
| E2   | 接入 Tabs、Card                      | 完成（验收通过） | 八套样式读写、真实交互、明暗与窄屏通过；保留 Tabs 方向／变体差异、Card 双尺寸共享留白联动，见[验收记录](workbench-tabs-card-acceptance-2026-11-02.md) |
| E3   | 接入 Checkbox、Radio Group、Switch  | 完成（验收通过） | 八套样式读写、键盘／标签交互、明暗／窄屏／对比通过；保留图标差值、深色圆点及滑块端点，见[验收记录](workbench-selection-controls-acceptance-2026-11-02.md) |
| E4   | 接入 Toggle、Toggle Group、Slider  | 完成（验收通过） | Toggle 统一共享尺寸，Group 只调拼接几何；Slider 保留 Luma 横纵长边差；617项测试、check、生产构建与36项E2E通过，见[验收记录](workbench-toggle-slider-acceptance-2026-11-02.md) |
| E5   | 接入 Native Select、Input Group、Input OTP | 完成（验收通过） | 复用Button高度档位；Group仅调单行外壳，块状／多行自动高度保留；OTP根gap进入安装源码。621项测试、check、生产构建与39项E2E通过，见[验收记录](workbench-input-composites-acceptance-2026-11-02.md) |
| E6   | 接入 Badge、基础 Table | 完成（验收通过） | Badge保留六变体、高度与图标侧留白；Table只调基础密度，保留语义、复选框留白和局部横滚。624项测试、check、生产构建与41项E2E通过，见[验收记录](workbench-badge-table-acceptance-2026-11-02.md) |
| E7   | 接入 Alert、Empty | 完成（验收通过） | Alert只调自身留白／行距／圆角，保留图标列、Action预留与语义配色；Empty只调外层几何，保留内部层次与控件。完整回归和真实写回见[验收记录](workbench-alert-empty-acceptance-2026-11-02.md) |
| E8   | 接入 Accordion、Alert Dialog | 完成（验收通过） | Accordion只调标题／内容留白，保留展开规则与原动效；Alert Dialog保留小尺寸宽度、确认语义及焦点，Nova页脚随留白／圆角联动。完整回归和真实写回见[验收记录](workbench-accordion-alert-dialog-acceptance-2026-11-02.md) |
| E9   | 接入 Avatar、Item | 完成 | Avatar联动三尺寸、Badge、GroupCount与圆角；Item分三尺寸调留白／gap，保留子控件和列表／链接语义。真实写回同时修复生成registry缓存失效；632项单元测试、全仓检查、生产构建及生产浏览器47项通过，1项显式写回另行通过 |
| E10  | 接入 Number Field、Slider Field | 完成（验收通过） | 最小cn入口不改默认几何；Number Field外框高度与内部控件联动，Slider Field只调组合布局。集成远端Avatar修复后636项测试通过，全仓检查、生产构建及生产浏览器49项通过，1项显式写回按配置跳过；本批两次真实写回另行通过，见[记录](workbench-number-slider-field-acceptance-2026-11-02.md) |
| E11  | 四组并行接入P2十个组件 | 完成（验收通过） | 四组独占实现、主线程统一接入；647项测试、全仓检查、生产构建、59项生产E2E通过，2项开发写回默认跳过；十组件真实写回另行通过，Tags Input写回回归显式执行通过。覆盖43／68，见[记录](workbench-p2-parallel-acceptance-2026-11-03.md)；Collapsible仍不建独立编辑器 |
| E12  | 四组并行接入P3十一个组件 | 完成（已推送，CI通过） | 日期／搜索3项、轮播／取色2项、消息组合3项、代码／轨迹／步骤3项；保留Nova／Rhea真实基线及业务边界。660项测试、check、build、71项生产E2E和11项真实写回通过，覆盖54／68，见[记录](workbench-p3-parallel-acceptance-2026-11-03.md) |
| E13  | Questionnaire、Chart、Sidebar、Sonner四组并行 | 完成（已推送，CI通过） | 有限几何、真实Tooltip、侧栏／通知独立document；666项测试、check、build、76项生产E2E、四组件UI写回及Sidebar八样式CLI安装回读通过，覆盖58／68，见[记录](workbench-isolated-previews-acceptance-2026-11-03.md) |
| E14  | 剩余10组件四组并行接入 | 完成（已推送，CI通过） | 756项单测、全仓check／build、90项完整生产E2E、十组件UI写回及CLI安装通过，覆盖68／68；默认外观与行为边界不变。2项默认跳过与语言切换后续收尾见[记录](workbench-remaining-editors-acceptance-2026-11-03.md) |
| B1   | 给弹层与表单组件补说明卡 `meta.json` | 完成 | 68 个组件全部有卡（新增 48 个，含 code-block 补卡），`REQUIRED_CARDS` 覆盖全部组件，`missingCards` 为空                       |
| B2   | 给弹层与表单组件补 `RULES.md`        | 完成 | 2026-11-01：弹层 12 个、表单 18 个；新增 lint 规则见安装文档“AI 与设计规范”                                                   |
| B3   | 其余组件补说明卡和 `RULES.md`        | 完成 | 2026-11-01：说明卡随 B1 完成；68 个组件全部有 `RULES.md`                                                                      |
| C1   | 用户编写 `guides/` 三份方法          | 用户 | 页面组合、文案、动效；AI 不代写                                                                                               |
| C2   | 线上版 MCP（HTTP）                   | 暂缓 | 2026-11-03 用户决定先使用共享 UI 工作区；远程 MCP 与部署后续另行安排                                                           |
| C3   | 决定 `/workbench` Studio 去留        | 用户 | 已知问题：Studio 的 `global.motionDuration`（默认 180ms）会覆盖全局动效 token；保留则需改为跟随 token，撤掉则删入口与回归测试 |

### 历史：剩余 10 个组件的安排（2026-11-03，E13后、E14前）

**本节保留此前暂缓理由，不是当前待办。用户随后明确要求全部接入，E14已按有限视觉合同完成这10项；当前覆盖68／68，边界与验收见上文和E14记录。**

**口径与价值**：68 个是[组件清单](../docs/src/lib/features/workbench/coverage.ts)中的组件数；58 个已接入文档页全屏编辑器（57项普通预览入口，Sidebar由block预览入口承载），其余10个缺的是编辑器，不代表组件缺失或不能使用。`coverage.ts` 的 `coverage.ready` 仍描述旧 Studio，不能用它统计新编辑器。接入后新增受限实时调参、对比、浏览器版本保存及开发站写回；不自动改变默认外观、增强业务交互或更新消费者已安装的源码。

下表按各组件 `ui/<组件>/meta.json`、`RULES.md`、源码及样式写回路径作工程判断，不是用户使用频率统计，也不承诺效率提升比例或工期。优先考虑可重复使用、参数边界清楚的视觉调整；成本包含八套样式、交互、窄屏和写回的长期回归。**E11完成P2中的十项，E12／E13完成P3全部十五项；未接入的10项为Collapsible和P4九项。它们默认随真实组合场景验收，不自动启动新一批，不追求68／68。**

**P1 两项已接入 E6**：Badge 调文字侧留白／图文间距／圆角；基础 Table 调表头高度下限／横向留白、数据格横纵留白。未扩展为 Data Table，不自动推进到 P2。

#### P2：E7–E11已接入18个，仅Collapsible暂不独立做

| 组件 | 何时值得做／依赖与限制 |
| ---- | ---------------------- |
| `tags-input` | 多值表单出现反复调参需求时优先；当前几何直接写在源码中，须先明确最小样式写回入口，覆盖输入法、长标签换行、删除和校验。Number Field、Slider Field已随E10接入，不再计入剩余项 |
| `collapsible` | 折叠内容没有独立视觉参数时仅做组合验收；不改展开规则，不为面板制造默认样式。Accordion已随E8接入，不再计入剩余项 |
| `button-group`、`breadcrumb`、`pagination` | 操作组、路径与列表页需要统一密度时；先复用 Button 尺寸和现有组合规则，不另造高度体系或把路由／页数写成样式 |
| `menubar`、`navigation-menu` | 有真实桌面工具栏／站点导航页面时再做；菜单参数可复用已有工具，但菜单间方向键、悬停切换、浮层碰撞及移动替代布局仍须独立验收 |
| `progress`、`skeleton`、`spinner` | 加载反馈需要统一轨道、圆角或图标尺寸时；Skeleton 的宽高应匹配使用处的最终内容，Spinner 不把全局动效数值复制成局部 token |
| `kbd` | 多个工具页面确有快捷键标记密度不一致时；收益主要是小幅几何调整，不因实现简单而抢占高价值工作 |

##### P2 推进记录（2026-11-03，除Collapsible外已接入）

原九组19个组件中，前四组8个由E7–E10接入，后四组10个由E11四组并行接入；余下Collapsible不制造独立视觉合同。下表保留原分组理由，5–8组均已完成，验收见E11记录。

| 顺序 | 组件（数量） | 推荐理由与启动边界 |
| ---- | ------------ | ------------------ |
| 1，已完成 E7 | **Alert、Empty（2）** | 已接入有限留白／间距／圆角，不复制内部 Button 旋钮；八套安装回读、真实写回和运行验收见[记录](workbench-alert-empty-acceptance-2026-11-02.md) |
| 2，已完成 E8 | Accordion、Alert Dialog（2） | 已接入有限留白与弹层参数；single／multiple、default／sm、确认／取消、遮罩、焦点和异步失败均独立验收，见[记录](workbench-accordion-alert-dialog-acceptance-2026-11-02.md) |
| 3，已完成 E9 | Avatar、Item（2） | 已接入三档联动头像及三尺寸列表密度，保留子组件与语义；图片失败／恢复、混合头像组、操作／原生链接、写回和回归见[记录](workbench-avatar-item-acceptance-2026-11-02.md) |
| 4，已接入 E10 | Number Field → Slider Field（2） | 已补最小cn写回入口；Number Field复用Button高度档并联动内部控件，Slider Field只调自身列／行间距和数值框宽，不混改数值／本地化行为，见[记录](workbench-number-slider-field-acceptance-2026-11-02.md) |
| 5，已完成 E11 A组 | Tags Input（1） | 最小根样式入口；只调外层密度与换行，不改标签和输入法业务逻辑；表单、版本和真实写回通过 |
| 6，已完成 E11 B组 | Button Group、Breadcrumb、Pagination（3） | 只调拼接端点、组合留白／间距与省略号占位，不改路由、分页数据或Button高度；真实导航与焦点通过 |
| 7，已完成 E11 C组 | Progress、Skeleton、Spinner、Kbd（4） | Skeleton宽高随内容；Spinner新增最小样式入口并保留调用处显式尺寸；Kbd不注册全局快捷键 |
| 8，已完成 E11 D组 | Menubar、Navigation Menu（2） | 保留桌面菜单／两种viewport，方向键、悬停、子菜单、Choice与窄屏Sheet替代布局通过 |
| 暂不独立做 | Collapsible（1） | 当前 Root／Trigger／Content 直接透传 Bits 属性，没有自身 `cn-*` 几何样式；触发按钮沿用 Button、内容布局由调用处负责。先随折叠页面验收，出现重复的独立样式需求后再重新评估，不为面板制造默认样式 |

**E7实际合同**：Alert横向留白0–32px、纵向留白0–24px、标题说明间距0–16px；Empty外层留白8–64px、主区间距0–32px；数值步长均2px，圆角共用档位／“样式自带”。保留Alert图标列、Action右侧预留与定位、Sera标记及语义配色，静态画布显式使用有名称的region而不改组件默认role；Empty保留内部层次、内容最大宽度和子控件。

**E8实际合同**：Accordion标题纵向留白0–32px、标题与内容共同横向留白0–32px、内容底部留白0–40px，步长2，不增加动效旋钮；Alert Dialog默认尺寸宽度档（≥640px）、内边距8–48px、gap4–40px、圆角／样式自带、遮罩0–80%、动效档与90／95／100%缩放，小尺寸宽度不改。

**E9实际合同**：Avatar三尺寸各20–64px、步长4，共同圆角同步Root／after／Image／Fallback／GroupCount；计数SVG为头像一半，Badge为头像四分之一加2px，保留原图标与组重叠。Item三尺寸各横向留白0–32px、纵向留白／gap0–24px，步长2，共同圆角；省略size仍按默认档调整，xs下拉组合的零留白保留。

**E10实际合同**：Number Field外框高度沿用真实Button档位，加减按钮保持外框内正方形，圆角同步逻辑起止侧，数字区横向留白0–16px、步长2；原42px外框不匹配档位时保留样式自带。Slider Field只调列间距0–32px、行间距0–24px（步长2）与数值框宽96–192px（步长8），不复制子控件参数。E10结束时33／68；E11结束时43／68，剩余25。

#### P3：E12／E13已接入全部15个

| 组件 | 启动条件与成本来源 |
| ---- | ------------------ |
| `calendar`、`range-calendar` | **E12已接入**：共用有限几何合同，但使用独立写回锚点和版本；保留多月、范围端点、禁用日期、年月选择和键盘，月数按各自pane宽度决定 |
| `command` | **E12已接入**：只调结果项留白／gap和列表高度；真实过滤、空结果、Loading及Dialog／Popover组合，不复制Input Group参数 |
| `sidebar` | **E13已接入**：只调展开宽度与菜单gap；真实sidebar-07壳用独立document，预览关闭cookie写入，保留Ctrl／⌘+B、767／768断点、真实移动Sheet与嵌套Esc |
| `chart`、`carousel` | **Carousel随E12、Chart随E13接入**：Chart只调真实Tooltip三个外层几何参数，编辑器Container局部PortalTarget；保留图例与语义数据表，不扩大数据／轴／系列配置或宣称点位键盘Tooltip导航 |
| `color-picker`、`sonner` | **Color Picker随E12、Sonner随E13接入**：Sonner只调标准styled通知三个几何变量，独立realm防store串扰，参数变化明确重播；custom／unstyled及调用方inline覆盖保持，普通Tab不暂停是上游现状 |
| `attachment`、`bubble`、`message`、`code-block`、`trace` | **E12已接入**：保留附件条件留白、ghost例外、消息子控件边界，代码两尺寸留白联动、轨迹详情层次；真实消息＋附件、轨迹＋代码组合已验收 |
| `questionnaire`、`stepper` | **Stepper随E12、Questionnaire随E13接入**：Questionnaire只调五个gap／选项留白，真实三题包含required单选、多选、自由回答、末题skip、FormData与reset；不将流程配置伪装成视觉参数 |

#### P4：默认不建独立编辑器，9 个

| 组件 | 默认处理方式／重新评估条件 |
| ---- | -------------------------- |
| `field`、`form`、`label` | 优先在真实表单组合里统一标签／说明／错误与字段间距，延用全局字号体系；若多个表单反复需要同一套密度调整，再设计一个共享合同，而非三个重复面板 |
| `aspect-ratio`、`separator` | 宽高比、方向属于调用处语义或布局，分隔线通常跟随全局边框／颜色；没有额外独立样式需求时不为覆盖率添加旋钮 |
| `resizable`、`scroll-area` | 在分栏／滚动页面验收；只有把手或滚动条几何确有跨页面定制需求时再升级，面板比例、容器尺寸、滚动行为仍由使用处负责 |
| `message-scroller`、`marker` | 在完整消息页处理滚动容器、跳转按钮和系统标记的一致性；滚动锚定／跟随不属于视觉参数。Marker 有自己的变体样式，但先随消息组合评估，不因名称简单就认定没有样式 |

**E13实施与验收记录（2026-11-03）**：四组先验证再实施，主线程统一接线、白名单、写回、安装与生产回归；实际结果见[记录](workbench-isolated-previews-acceptance-2026-11-03.md)。覆盖58／68，剩余P4九项和Collapsible仍维持组合优先、暂不独立建编辑器；不自动开始下一批。本批未授权提交推送。

### 收尾（2026-11-01，均已完成）

| 编号 | 任务                        | 状态 | 说明                                                                                                                                                                                                  |
| ---- | --------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1   | 文档示例与 blocks 通过 lint | 完成 | `valar-svelte lint` 对 `registry/examples`、`registry/blocks` 为 0 错误；原色改语义 token（成功类借用 `chart-2`），按钮尺寸改 `size` 属性，图标按钮补 `aria-label`；删除 Button 的圆角示例            |
| D2   | 组件默认文案中文化          | 完成 | 写死的英文读屏名称、播报和校验文案改为中文默认并可覆盖（`closeLabel`、`label`、`messages` 等）；Calendar、Range Calendar、Number Field 默认 `locale="zh-CN"`；Questionnaire primitive 新增 `messages` |
| D3   | Dropdown Menu 滑入距离      | 完成 | 与 Popover 共用 `tuner.ts` 的 `SLIDE_DISTANCES`、`readSlide`、`slideCss`、`slideClasses`；面板与子菜单同时生效                                                                                        |
| D4   | 编辑器工具函数收拢          | 完成 | 动效档位与标签、缩放档位、“样式自带”、`tierVar`、`sourceWord` 统一放在 `tuner.ts`，各 `*-tuning.ts` 不再各写一份                                                                                      |

### 候选任务（AI 可做，开始前向用户确认）

- 新增“成功／警告”语义色 token，替换示例中借用的 `chart-2`。
- 当前68项均已接入文档页编辑器；以后新增参数或组件仍按实际需求确认范围，不为了覆盖率复制全局token或业务配置。
- Combobox 的高度接入 Button 尺寸档位；Textarea 最小高度（写死在组件源码，需要改源码或换写回方式）。Native Select、Input Group单行与Input OTP已随E5接入档位。
- date-picker 等示例自己写了 `DateFormatter("en-US")`，与已改为中文的日历不一致。

**每接入一个组件的清单**（A1–A3 都按此做，全部做完才算完成）：

1. `docs/src/lib/features/workbench/<组件>-tuning.ts`：导出 `TunerSpec`（类型见 `tuner.ts`）——参数、取值校验、`readBaseline`（读当前值；Dialog 读 registry 源码，Button 量取页面元素）、`previewCss`（实时预览）、`overrideClasses`（写回的工具类）、只读 token 列表、独立的 `storageKey`。全局 token 只能选档位，不能在此修改数值。
2. `<组件>-tuner.svelte`：只写画布，外壳用 `<ComponentTuner spec={…}>`；参照 `dialog-tuner.svelte`。
3. `docs/src/lib/components/component-preview-tabs.svelte`：让该组件文档页的首个示例套上编辑器。
4. `style-overrides.ts` 的 `OVERRIDE_RULES`：为该组件每个 `cn-*` 类登记允许的工具类（颜色和任意输入的 CSS 值不允许）。Card 仅为已有 `--card-spacing` 放行固定模板与有限数值，见 E2，不开放通用自定义属性；Switch 仅为小数轨道高度放行16个固定像素值，见 E3，不开放自由像素输入。改完必须重启开发服务 `amp orb service restart docs`。
5. 测试：`docs/tests/workbench.test.ts` 加当前值读取（至少两套样式，如 nova、vega）、写回后的安装源码、白名单拒绝用例；`docs/e2e/workbench.spec.ts` 加编辑器用例（打开、调参生效、并排对比、保存版本、Esc 归还焦点）。
6. 实测：开发站真实写回一次并检查 `static/registry/styles/<样式>/<组件>.json`，之后用 `git checkout` 恢复 `styles/valar/style-*.css` 与 registry 文件；截图检查 1440、390 宽度和深色。
7. 全量检查：`pnpm test`、`pnpm check`、`NODE_OPTIONS=--max-old-space-size=3072 CI=true pnpm build`、docs 目录下 `CI=true pnpm exec playwright test`。
8. 更新本表状态和“第 7 步的做法”中的组件列表；未经用户同意不提交推送。

第 8 步的做法（推广到其他组件时沿用）：

- 规范写在组件目录的 `RULES.md`（`docs/src/lib/registry/ui/<组件>/RULES.md`），中文、每条可执行，能机器检查的注明规则编号；随 registry 一起安装。
- CLI `add` 后把已装组件的规范与通用规则写进消费者项目 `AGENTS.md` 的托管区块（`packages/cli/src/utils/design-rules.ts`）；`valar-svelte lint` 检查可机械判断的规则，error 使命令失败。
- 新增规则时同时更新：`RULES.md`、`design-rules.ts` 的检查、`packages/cli/test/utils/design-rules.test.ts`、安装文档“AI 与设计规范”。
- 后续：为其余组件补 `RULES.md`（优先表单、弹层）；规范中的数值应与全局 token 和组件参数同源，做完第 5 步后改为从 token 生成，避免两套数字。

第 9–12 步的约定（2026-10-31 用户确认，参照 https://uiarc.dev/docs/ai ）：

- 第 9 步：说明卡放在组件目录（如 `meta.json`，与 `RULES.md` 并列），字段包括用途、关键词、分类、何时用／何时不用、无障碍与响应式注意、相关组件；目录、文档、技能包和 MCP 都从它生成，不在别处另写。先覆盖常用的 15–20 个组件，并加检查：缺说明卡的组件逐项列出，不静默跳过。
- 第 11 步：页面组合、文案、动效方法由用户本人编写，AI 只建立文件结构和入口，不代写这些内容。
- 第 12 步：工具参照 Arc 的 search_components、list_components、get_component、get_install_command、get_skill；只读，数据来自第 9、10 步。先做通过 CLI 在本机启动的版本；线上版需要部署网站和域名，等用户准备好服务器并授权后再做。所有组件免费公开，不做 Arc 的登录与 Pro 令牌机制。

第 7 步的做法（2026-11-01 完成，接入新组件时沿用）：

- **共用外壳**：`docs/src/lib/features/workbench/component-tuner.svelte` 负责全屏编辑器的一切共用部分（顶栏、仅草稿／并排对比、浅深色、DialKit 面板、已修改参数、只读全局 token、命名版本与备份、写回确认）。各组件只提供一份参数说明 `TunerSpec`（类型在 `tuner.ts`）和画布：Button 是 `button-tuning.ts`＋`button-tuner.svelte`（变体矩阵），Dialog 是 `dialog-tuning.ts`＋`dialog-tuner.svelte`（内联渲染真实 Dialog，带“重播进入与退出”）。`parameter-dials.svelte` 按参数说明生成 DialKit 面板；`component-preview-tabs.svelte` 决定哪个示例套上编辑器。各组件共用的档位与解析函数（动效档位、缩放、滑入距离、“样式自带”、`tierVar`、`sourceWord`）放在 `tuner.ts`，新组件直接引用，不要再复制一份。
- **当前值从哪来**：Button 量取页面上真实按钮的尺寸；Dialog 读取当前样式安装出去的 registry 源码（`parseDialogSource`），所以 8 套样式各自显示自己的默认值。
- **E14新增十项**：Field／Form／Label、Collapsible／Aspect Ratio／Separator、Resizable／Scroll Area、Message Scroller／Marker全部复用该外壳；只保存各自有限几何，Form入口在`/docs/forms`。67个普通预览入口加Sidebar block入口覆盖68项，旧Studio的`coverage.ready`不用于统计。参数、真实UI写回、安装与视觉证据见[E14记录](workbench-remaining-editors-acceptance-2026-11-03.md)。
- **Dialog 参数**：宽度档、内边距、内容间距、圆角档位（含“样式自带”）、遮罩不透明度、动效档位（快／中／慢，只选全局 token 的档位）、出现时缩放（组件自己的动效参数）。改内边距时，带“出血”页脚的样式（如 nova）同步调整页脚负边距，页脚仍贴边。
- **写回白名单**：`style-overrides.ts` 的 `OVERRIDE_RULES` 按每个 `cn-*` 类规定允许的工具类；颜色、任意输入的 CSS 值、未登记的类一律拒绝。Card 的 `--card-spacing` 仅接受固定模板和有限数值（见 E2）；Switch 小数轨道高度仅接受16个固定像素值（见 E3），均不是通用任意值入口。合并用 `packages/parity` 的 `mergeClasses`，补足 tailwind-merge 识别不了的 `zoom-in-*`、`duration-*`、`ease-*`。
- **注意**：开发站的写回校验规则在 vite 配置中加载，改了 `style-overrides.ts` 后要重启开发服务（`amp orb service restart docs`），否则新组件写回会提示“参数无效”。
- 测试：`docs/tests/workbench.test.ts`（Dialog 当前值读取、写回后的安装源码、白名单）、`docs/e2e/workbench.spec.ts`（Dialog 编辑器）、`packages/parity/test/inject-style-classes.test.ts`（`mergeClasses`）。
- **A1：Popover、Sheet（2026-11-01）**：`popover-tuning.ts`＋`popover-tuner.svelte`、`sheet-tuning.ts`＋`sheet-tuner.svelte`，当前值同 Dialog 读 registry 源码（`parsePopoverSource`、`parseSheetSource`）。画布内联渲染真实组件，可切换弹出／滑出方向（仅预览，不是参数）并“重播进入与退出”。
  - **Popover 参数**：内边距、内容间距、圆角档位（含“样式自带”）、动效档位、出现时缩放、出现时滑入距离（0–16px）。宽度（`w-72`）与 `sideOffset` 是调用处的属性，不作为样式参数。
  - **Sheet 参数**：左右侧宽度档（≥640px）、页眉页脚内边距、内容间距、遮罩不透明度、动效档位（面板与遮罩同档）、滑入距离（16–96px 或整个面板，组件自己的动效参数）。Sheet 没有圆角。
  - **注意**：上游把 Sheet 的滑入距离（`slide-in-from-right-10`）和遮罩时长（`duration-100`）写死在组件源码里，同类工具类写在样式层无法稳定胜出，所以这两项写回时带 Tailwind 的 `!`（如 `data-[side=right]:data-open:slide-in-from-right-16!`、`duration-slow!`），白名单也只接受带 `!` 的写法；调用方要覆盖它们同样需要 `!`。预览中滑入距离写在 `@layer base` 的 important 规则里，才能盖过已写回的值。`mergeClasses` 增加了按方向轴分组的 slide 分组，连续写回会替换而不是叠加。
  - 测试：`workbench.test.ts`“Popover and Sheet write-back”（当前值读取 nova／vega／lyra／luma／sera、写回后安装源码与回读、连续写回替换、白名单拒绝）、`workbench.spec.ts` 的 Popover／Sheet 编辑器用例、`inject-style-classes.test.ts` 的 slide 分组。
- **Input、Select、Textarea（A3，2026-11-01）**：`input-tuning.ts`、`select-tuning.ts`、`textarea-tuning.ts`＋同名 `-tuner.svelte`，共用的档位在 `control-tiers.ts`。高度只能选 **Button 的尺寸档位**（特小／小／默认／大）：编辑器在探针里渲染四个尺寸的真实 Button 量取高度，控件当前高度等于哪一档就显示哪一档（同高时优先同名尺寸），都不等则显示“样式自带”且不写回；写回时把所选档位换算成当时 Button 的像素高度（`h-*`），Button 以后再改高度时需重新选择。圆角使用 Button 的 `RADIUS_LEVELS`，量取方式与 Button 相同（`readRadiusLevel`），不在档位中的显示“样式自带”。Input：高度档位、圆角档位、横向内边距（`cn-input`）。Select：默认／小两个尺寸的高度档位（默认对应 Button 同名尺寸）、一个圆角档位同时作用于两个尺寸（替换 nova 等小尺寸自带的圆角）、文字侧内边距 `pl-*`（下拉箭头一侧保留上游）（`cn-select-trigger`）。Textarea：圆角档位、横向／纵向内边距（`cn-textarea`）；高度随内容增长，`min-h-16` 写在组件源码中、样式类覆盖不了，所以不提供高度参数。Input、Textarea 文档首个示例的 `max-w-xs` 改为只约束示例本身（`[&_[data-tuning-current]>*]`），否则会把编辑器外壳压窄。
- 测试（A3）：`docs/tests/workbench.test.ts`（nova、vega 的高度档位读取与 Button 写回后的“样式自带”、三个组件写回后的安装源码、白名单拒绝）、`docs/e2e/workbench.spec.ts`（Input 编辑器；Select 与 Textarea 编辑器）。
- **Dropdown Menu**（A2，2026-11-01）：`dropdown-menu-tuning.ts`＋`dropdown-menu-tuner.svelte`（内联渲染真实菜单，含勾选项、缩进项、子菜单）。参数：面板内边距、最小宽度、面板圆角档位、菜单项横向／纵向内边距、图文间距、菜单项圆角档位、动效档位、出现时缩放、出现时滑入距离（0–16px，与 Popover 同一套）；面板参数同时作用于子菜单。当前值读 registry 源码（现共用 `parseMenuSource("dropdown-menu", files)`）。联动：缩进项 `data-inset:pl-*`、勾选／单选项的 `pl-*` 与纵向内边距按样式原有差值随之移动；分隔线在“贴边”样式（`-mx` 等于面板内边距，如 nova）中跟随面板内边距，lyra 等不贴边的样式不动。
- **Tooltip**（A2，2026-11-01）：`tooltip-tuning.ts`＋`tooltip-tuner.svelte`（一个固定展开的提示看样式，一个“悬停试试”看真实延迟，各用独立 Provider）。参数：横向／纵向内边距、圆角档位、显示延迟（ms）、动效档位（含“样式自带 150ms”，上游未设时长）、出现时缩放。**显示延迟**是 Provider 属性而非样式：写回为 `.cn-tooltip-provider { @apply delay-<ms>; }`，`tooltip-provider.svelte` 中的 `"cn-tooltip-provider"` 字符串在安装展开后变成 `"delay-<ms>"` 并作为 `delayDuration` 默认值；未写回时为空串、默认 0（与上游一致），调用方显式传值仍优先。文档页“使用版本”只预览样式，不改页面上提示的延迟。Studio 导出（`export.ts`）的替换锚点相应改为 `delayDuration = styleDelay`。
- 测试补充：`workbench.test.ts` 的 Dropdown Menu／Tooltip 当前值读取（nova、vega、lyra、luma、maia、mira）、写回后的安装源码（含延迟默认值与调用方覆盖）、白名单拒绝；`workbench.spec.ts` 的两个编辑器用例（打开、调参生效、真实延迟、并排对比、保存版本、Esc 归还焦点）。
- **Hover Card、Context Menu、Drawer（E1，2026-11-02）**：均复用 `ComponentTuner`，当前值读取各样式安装出去的 registry 源码。Hover Card：统一内边距、圆角、动效档位、缩放与滑入距离；宽度、偏移和悬停延迟仍是调用属性。文档首例提供入口，重复的 Basic 示例通过 `tunable={false}` 避免重复编辑器。Context Menu：沿用 Dropdown 的面板／菜单项参数，两者共用 `menu-tuning.ts`，不通过字符串替换适配；保留各样式的缩进、选项高度差和贴边分隔线，兼顾 GroupHeading 的独立 slot。默认固定展开，支持真实右键、Shift+F10／菜单键与键盘子菜单；窄画布的子菜单向下展开，避免最大宽度面板把它挤出画布。Drawer：页眉／页脚内边距、页脚间距、圆角与遮罩；区分边缘圆角和 `::before` 内缩表面，方向仅为预览。**不提供 CSS 时长／滑入旋钮**：Vaul 的拖拽释放与清理依赖同一套固定 500ms 时序，不用不一致的 CSS 覆盖伪装为可调。
- **Tabs、Card（E2，2026-11-02）**：读取八套样式的安装源码，不改组件 primitive/API。Tabs：水平列表高度、内容间距、列表内边距／默认变体圆角、标签横纵内边距／圆角；方向或图标侧有差异时显示“样式自带”，显式统一档位同时覆盖相关变体，列表圆角不改变线型下划线。画布包含默认／线型 × 横向／纵向、图标、禁用项和真实键盘切换。Card：默认／小尺寸留白、标题区间距、圆角；通过已有 `--card-spacing` 联动分区 gap、内缩、分隔线与贴边负边距，不把这些拆成互相冲突的 padding。白名单仅对 `cn-card` 放行 `[--card-spacing:--spacing(N)]` 及小尺寸前缀，N 对应 0–48px、步长2px；其他属性、单位和值仍拒绝。圆角同步头部、页脚和首尾图片，rhea 的封顶圆角与 sera 的自带值保留为“样式自带”。
- **Checkbox、Radio Group、Switch（E3，2026-11-02）**：三者均从八套安装源码读取基线，使用真实 Bits UI 控件、Field 标签与独立对比状态。Checkbox 调尺寸／圆角，SVG 保留原方框与图标的2px差（Sera为4px），真实半选、禁用、错误状态均保留；字面圆角显示“样式自带”。Radio Group 调尺寸／组内间距，指示器同步尺寸，圆点按原半尺寸差值联动；保留 Luma／Rhea 深色圆点额外2px、Sera普通圆点偏移−1px，不增加圆角或颜色旋钮。Switch 调默认／小尺寸滑块高度、共同圆角／动效档位：滑块高度变化Δ时，轨道高度＋Δ、轨道宽度＋2Δ、滑块宽度＋Δ，保留原有平移规则、垂直内缩、Luma宽滑块和端点留白。Tailwind 不接受 `h-5.6`，因此非整数轨道高度使用 `h-[Npx]`，白名单仅允许12.4／12.6至26.4／26.6、整数部分步长2的16个值。全局 token 只读；不改 primitive/API。验收与交付状态见[选择控件记录](workbench-selection-controls-acceptance-2026-11-02.md)。
- **Toggle、Toggle Group、Slider（E4，2026-11-02）**：三者从八套安装源码读取基线。Toggle 的小／默认／大高度和文字侧内边距、共同图文间距／圆角同时服务 `toggleVariants` 的 Group Item；保留图标侧留白及拼接组自身端点，不复制共享参数。Toggle Root 补 `data-size`／`data-variant`，不改公开属性或 Bits 行为。Group 只调 `spacing=0` 拼接项文字侧留白与根／横纵首尾圆角，spacing、方向、单多选仍是调用属性。Slider 调横纵轨道粗细、把手短边、轨道／把手圆角；Luma 的长边始终比短边多8px，Sera无圆角类时显示“样式自带”，不把 min／max／step 变成样式旋钮。白名单仅开放有限尺寸／方向圆角类；全局 token 只读，详见[本批记录](workbench-toggle-slider-acceptance-2026-11-02.md)。
- **Native Select、Input Group、Input OTP（E5，2026-11-02）**：复用 `control-tiers.ts` 的Button高度与圆角档位，真实Button探针＋八套registry读取基线。Native Select只调闭合控件的默认／小高度、共同圆角和文字左侧留白，不改系统选项面板。Input Group只调单行外壳高度与内部填充、组合圆角、行内Addon外侧／块状Addon横向留白和Addon内部gap；块状／Textarea保持自动高度和原纵向留白，不复制子Input／Textarea／Button参数。OTP调方槽档位、组间gap、组与首尾圆角，保留Sera组内gap和底线；移除parity对普通class中 `cn-input-otp` 的过时跳过，使组间距真正进入可安装源码。共用外壳入口等待挂载后启用，避免重页面SSR阶段首次点击丢失。详见[本批记录](workbench-input-composites-acceptance-2026-11-02.md)。
- **Badge、基础 Table（E6，2026-11-02）**：复用全屏外壳，读取八套安装源码。Badge只调文字侧横向留白、图文间距、圆角，不覆盖图标侧条件留白、高度、上下留白、字号或六变体配色；保留span／原生href语义及Sera自动高度。Table只调表头高度下限、表头横向留白、数据格横纵留白，保留含复选框单元格的右侧零留白；高度不是内容截断上限。画布包含语义账单／页脚、独立嵌入控件、固定选中行外观和Empty空状态，不实现行选择、排序、筛选或分页。窄屏依旧由Table自身容器横滚。详见[本批记录](workbench-badge-table-acceptance-2026-11-02.md)。
- **Alert、Empty（E7，2026-11-02）**：读取八套真实安装源码，保留全局token只读与独立版本。Alert只调横纵留白、行间距和圆角，用 `gap-y-*` 保留图标横向间距，含Action时仍保留72px右侧预留；静态画布使用命名region，组件默认alert语义不变。Empty只调根留白／gap／圆角，内部Header／Content／Media、最大宽度和Button／Avatar不动。两侧演示状态独立且无外部请求；白名单只新增两个根入口的有限几何类，详见[本批记录](workbench-alert-empty-acceptance-2026-11-02.md)。
- **Accordion、Alert Dialog（E8，2026-11-02）**：两者读取八套真实安装源码。Accordion只调Trigger纵向、Trigger与Content外层共同横向、Content直属inner底部留白，保留内嵌控件、图标与200ms／ease-out原动效。Alert Dialog复用Dialog宽度档位表，但宽度仅作用default；小尺寸宽度、确认语义、Cancel／Action、Header／Media和Footer布局不动，Nova贴边页脚随padding与radius联动。真实确认模式保留焦点圈定、锁滚动、遮罩不关闭、Esc和关闭归焦；本地模拟pending、失败及重试成功，不执行删除或请求。详见[本批记录](workbench-accordion-alert-dialog-acceptance-2026-11-02.md)。
- **Number Field、Slider Field（E10，2026-11-02）**：在原字面默认类之后用独立cn参数提供最小写回锚点，不改八套默认外观；解析器以同一cn归并所有字符串参数，避免只读到旧字面值。Number Field复用Button外框高度档位，内部按钮随可用高度保持正方形，保留边框、逻辑起止侧圆角及数值／本地化／重置；Slider Field只调组合布局，保留子Slider、Number Field的几何与行为。详见[验收记录](workbench-number-slider-field-acceptance-2026-11-02.md)。
- 测试补充（E1）：`workbench.test.ts` 覆盖三组件八套样式的读取、写回安装源码、回读与白名单；`workbench.spec.ts` 覆盖四方向、真实悬停、拖拽、右键／键盘子菜单、390px 最大菜单宽度、比较隔离、保存与 Esc 焦点归还。真实写回及视觉证据见[本批验收记录](workbench-acceptance-2026-11-02.md)。

第 6 步的做法（2026-11-01 完成）：

- **分层**：全局 token 只管“每档多快、用什么曲线、边框多粗”；组件只选档位。组件特有的位移距离、缩放幅度、显示延迟属于组件参数，在组件编辑器中调（Dialog 已有“出现时缩放”）。
- **token**：`motion-duration-fast|normal|slow|interaction`（默认 100／200／300／150ms）、`motion-ease-enter|exit|standard`、`border-width`（1px）。和 `radius` 一样放在主题的 `light` 中、对深浅色都生效；默认值在 `token-overrides.ts` 的 `VALAR_TOKEN_DEFAULTS`，由 `themes.ts` 的 `DEFAULT_BASE_THEMES` 加到每个基础主题（上游主题数据不变），`/themes` 以此为“默认值”比较和恢复。
- **映射**：`packages/cli/src/tailwind.css` 的 `@theme inline` 把它们映射为 `duration-fast` 等工具类、`transition` 的默认时长与曲线、`border` 的默认粗细，并带回退值，旧项目没有这些变量时外观不变；同一文件在“减少动态效果”时把快／中／慢设为 1ms。CLI 写入 CSS 时不再为这些变量生成 `@theme` 镜像（`update-css-vars.ts`）。
- **替换写死值**：上游 `styles/style-*.css` 不改。`packages/parity/src/inject-style-classes.ts` 的 `TOKEN_UTILITIES` 是唯一的对照表（`duration-100→duration-fast`、`200→normal`、`300→slow`、两种快出慢停曲线→`ease-enter`、慢起快走→`ease-exit`、`ease-in-out→ease-standard`），由 `applyTokenUtilities` 在 registry 构建和文档站组件展开时应用。保留写死的：`duration-1000`（输入光标闪烁）、`duration-400`（消息滚动按钮退出）、`ease-linear`（进度、侧边栏宽度）。上游的 `ring-*` 焦点环和卡片描边（`ring-1`）属于各样式的特色，不跟随边框 token。
- **编辑与检查**：`/themes` 的“动效与边框”分组（Slider Field、下拉选曲线）和右侧“动效预览”可重放进入／退出；`valar-svelte lint` 新增警告 `valar/motion-token`，AGENTS.md 规范区块要求只用档位，何时用哪档以用户编写的 `guides/motion.md` 为准。
- 测试：`packages/parity/test/inject-style-classes.test.ts`（对照表）、`docs/tests/token-overrides.test.ts`（格式白名单与默认值）、`packages/cli/test/utils/transformers.test.ts`（CSS 写入）、`design-rules.test.ts`（lint）。

第 9–12 步的做法（2026-10-31 完成）：

- **说明卡**：`docs/src/lib/registry/ui/<组件>/meta.json`，字段与校验在 `docs/src/lib/registry/component-cards.ts`（`title`、`description`、`categories` 六选一，`meta.valar` 下为关键词、何时用、何时不用＋改用组件、无障碍、响应式、相关组件）。`REQUIRED_CARDS` 列出必须有卡的 20 个组件；`docs/tests/component-cards.test.ts` 检查覆盖、引用的组件确实存在。其余组件进入 `catalog.json` 的 `missingCards`，构建日志逐项列出。补卡：新建 `meta.json` 并把组件名加入 `REQUIRED_CARDS`。
- **AI 资料**：`build-registry` 生成 `static/registry/catalog.json`（说明卡＋渲染好的 markdown＋`RULES.md`＋文档链接＋安装命令）和 `static/registry/skills/valar-svelte.json`；`pnpm build` 的 `build:llms` 生成 `llms.txt`（加了 AI 资料入口）、`llms-small.txt`、`llms-full.txt`，组件 `.md` 顶部插入说明卡。文本格式只在 `docs/src/lib/registry/catalog.ts` 中定义。
- **技能包**：`skills/valar-svelte`（由上游 `skills/shadcn-svelte` 改名改写）。`SKILL.md` 开头是 Valar 工作流程：查目录选组件 → `add` → 读 AGENTS.md 规范区块 → `lint`。上游的页面组合建议和组件选择表已删除，选组件只看说明卡。`guides/page-composition.md`、`copywriting.md`、`motion.md` 是占位，**由用户本人编写，AI 不得代写**。
- **MCP**：`packages/cli/src/commands/mcp`＋`src/utils/mcp.ts`，stdio、换行分隔 JSON-RPC，无额外依赖。工具：list_components、search_components、get_component、get_install_command、get_skill，只读。数据来自 `--registry`（URL 或本地目录）、components.json 的 registry 或默认本地站。测试 `packages/cli/test/utils/mcp.test.ts`；用户文档在安装页“给 AI 的组件资料与 MCP”。
- 后续：补齐其余组件说明卡（优先表单、弹层）；用户写好 `guides/` 后，MCP 的 get_skill 自动返回新内容；线上版 MCP（HTTP 传输）等服务器就绪并授权后再做。

第 5 步的做法（全局 token 配置页，`/themes`）：

- 页面左侧编辑一个基础主题（neutral、stone 等 7 个）的颜色 token（浅色、深色分开，按“页面与表面／主次与强调／边框与焦点／图表／侧边栏”分组）、圆角基数 `--radius` 和字号阶梯 `text-xs`～`text-xl`；控件是 Color Picker 和 Slider Field。右侧（窄屏在下方）多组件展示区实时预览草稿，草稿只作用于展示区，不影响站点其他部分。
- 颜色以 OKLCH 存储，Color Picker 使用十六进制，二者在 `docs/src/lib/features/workbench/token-overrides.ts` 换算；带透明度的 token（如深色 `border` 的 10%）改色后保留透明度。
- 写回：确认框列出每项“原值 → 新值”，确认后把**与上游不同的值**整体写入 `docs/src/lib/registry/styles/valar/tokens.json`（按基础主题分节），重建 registry；失败恢复原文件，不自动提交。“恢复上游”后再写回即清空该主题的定制。
- 生效范围：`themes.ts` 把 `tokens.json` 叠加到上游基础主题得到 `BASE_THEMES`，因此 `registry/colors/<主题>.json`、`/init` 预设（`valar-svelte init` 使用）和 `/themes` 预览都会用新值；字号写到 `@theme inline` 的 `--text-*`。文档站自身的外观变量在 `docs/src/app.css`，不随之改变。上游主题数据和 `styles/style-*.css` 保持原样。
- 测试：`docs/tests/token-overrides.test.ts`（换算参考值、输入白名单、合并与序列化）。
- 后续：`RULES.md` 中的数值改为从 token 生成。

## 组件内按需微调：Button 样板

新的建设方向是为现有组件增加按需编辑能力，不重新实现组件，也不扩展 React／Vue。
Button 文档 `/docs/components/button` 的首个示例提供“微调 Button”入口；默认不加载或显示 DialKit 面板。
点击后进入**全屏编辑器**（方向 B，2026-10-31 确认）：顶栏是修改计数、版本名称、保存版本、写回组件库和关闭；左侧画布同时展示 6 个变体 × 4 个尺寸及图标按钮，可切换“仅草稿／并排对比”和浅色／深色；右侧是 **DialKit 2.1.0** 原生 `inline` 嵌入模式面板，加上已修改参数和只读全局 token。
编辑器使用 Valar Dialog，Esc 或关闭按钮退出并把焦点还给“微调 Button”；写回确认使用 Alert Dialog。DialKit 不再浮动，面板自带的 Copy 和版本缩略图（Save version）保留，DialKit 2.1.0 不支持关闭它们。
DialKit 原生缩略图遵循默认的本次会话语义；页面中的命名保存／备份继续负责跨刷新保留，二者不伪装成同一份持久版本。

### 参数分层（2026-10-31 确认）

- **全局 token**：颜色、圆角基数 `--radius`、字号阶梯影响所有组件，组件页只读显示当前值，统一在全局 token 配置页 `/themes` 修改。
- **Button 组件参数**：特小／小／默认／大四个尺寸各自的高度、横向内边距、图文间距（px），以及圆角档位（none～full，具体大小仍由全局圆角基数决定）。
- 尺寸参数作用于该尺寸的所有变体；同档图标按钮跟随高度。带图标一侧的收窄内边距保留上游设定。
- 动效与边框宽度目前没有全局 token，第二期先建立 token 再接入。旧版的单按钮颜色、左右分开的内边距不再提供。

### 写回组件库

- 只在本地开发站（`pnpm dev` 或 orb 的 docs 服务）出现“写回组件库…”；生产构建和预览没有写入接口。
- 确认框列出目标文件和每项“原值 → 新值”。确认后写入 `docs/src/lib/registry/styles/valar/style-<样式>.css`，自动重建 registry 并刷新页面；重建失败会恢复原文件。
- 上游 `styles/style-*.css` 保持原样。构建、文档站和 CLI 安装都会把 Valar 定制文件叠加在上游之上，冲突的工具类以定制为准（如 `h-8` 被 `h-11` 替换）；文件为空时输出与上游完全一致。
- 写入接口只接受 Button 尺寸／间距／圆角档位工具类，拒绝颜色、任意值和其他组件。多次写回会保留之前写入的其他尺寸。
- 写回后的改动和其他源码一样需要提交到 Git 才能保留；不会自动提交、发布或部署。也可以手动编辑定制文件。

### 版本与备份

- 命名版本保存到浏览器 `valar.button-styles.v2`（格式 2，与旧版 v1 不兼容），最多 50 个，同名拒绝覆盖，存储失败保留草稿。
- 对比可选择“当前组件库样式”或历史版本；JSON 备份可在其他浏览器导入，样式不一致时拒绝导入。备份不是安装包。

实现入口：`button-tuning.ts`（参数与类名映射）、`button-tuner.svelte`（画布）、共用外壳 `component-tuner.svelte` 与按需加载的 `parameter-dials.svelte`、`style-overrides.ts`（写入校验与序列化），写入接口在 `docs/vite.config.ts` 的开发服务器中。
单元测试 `docs/tests/workbench.test.ts` 覆盖写回后的安装源码、连续写回保留和非法输入拒绝；浏览器回归 `docs/e2e/workbench.spec.ts` 覆盖实际初值、跨变体影响范围、圆角档位跟随全局基数、只读 token、生产站无写回入口、版本对比恢复与存储失败。

## Studio（`/workbench`）的交付边界

以下各节描述 2026-10-31 之前的 Studio，Studio 已暂停扩展（见文首）；组件页编辑器的进度以“路线图与下一步”为准。

入口：路径 `/workbench`（2026-10-31 起已不在主导航中）。

本轮先打通 Button、Dialog、Tooltip、Accordion 的完整流程，共 65 个全局／组件参数。
这是首批接入，不是四个组件全部 API 参数化，也不是 66 个组件全部完成。
逐项状态以[组件覆盖清单](../docs/src/lib/features/workbench/coverage.ts)和工作台中的“全部组件覆盖清单”为准。
其余 62 个组件尚待接入；不能因为使用全局 token 就标记已接入。

## 设计师使用流程

1. 选择左侧组件；手机上使用“选择组件”下拉框。
2. 在“参数调节”中拖动数值、输入精确数值、选择颜色或切换交互选项。
   数值均标注单位。独立圆角、配色和动效要先关闭对应“继承全局”开关才生效。
   DialKit 的开关文字暂保留 On／Off，分别表示开启／关闭。
3. 在真实组件画布中悬停、按下、打开、关闭或用键盘操作。
   可切换窄画布、深色背景及禁用状态；这些测试状态不作为安装默认值导出。
4. 草稿自动保存在当前浏览器；可撤销／重做最近 50 次参数修改。
   输入版本名称并“保存版本”，可保留最多 20 个具名版本；同名会替换。
   “已存版本”用于恢复，“删除此版本”仅删除本地版本，不修改当前草稿。
5. “导出可安装预设”下载 `valar-preset.json`，包括预设元数据、原生组件源码和 CSS。
   这个文件既可重新“导入”继续编辑，也可交给开发者安装。
   导入失败不会覆盖当前草稿；“重置当前”和“重置全部”均可撤销。

**保存不等于发布。** 当前没有云端账号同步或服务器写入仓库的功能。
浏览器清理、换设备或使用隐私模式可能丢失本地版本，请导出文件备份。
存储不可用时会明确提示；不静默声称已经持久保存。

## 当前参数范围

| 层级      | 首批可调项                                                                                                        |
| --------- | ----------------------------------------------------------------------------------------------------------------- |
| 全局      | 圆角、字号、背景／文字／主色／主色文字、动效时长与缓动                                                            |
| Button    | 继承开关、默认尺寸的高度与横向内边距、主按钮配色、悬停配色与缩放、按压缩放、过渡时长与缓动                        |
| Dialog    | 继承开关、宽度、内边距、圆角、面板背景、遮罩透明度、进入／退出时长、位移、缩放、缓动、Esc／外部点击关闭、关闭图标 |
| Tooltip   | 继承开关、圆角、字号、内边距、背景／文字、显示延迟、首选方向与间隔、进入／退出时长、位移、缩放、缓动              |
| Accordion | 继承开关、圆角、项目间距、边框、标题／内容内边距、展开时长与缓动、单项／多项、禁用                                |

按钮的 outline／ghost 等变体保留自己的配色；icon 等非默认尺寸不被主按钮尺寸覆盖。
Tooltip 的方向是首选方向，碰撞检测仍可能翻转它。
当前缓动为五种 CSS 选项；自由贝塞尔、物理弹簧、时间线以及按状态编辑更多参数仍待扩展。
系统“减少动态效果”始终优先于工作台动画设置。
函数、snippet 和业务校验不伪装成数字参数；后续接入应为它们提供明确的场景控件及能力说明。

## 开发者安装

目标项目需先按安装文档初始化 Svelte 5、Tailwind CSS 4 和 `components.json`，并能访问 Valar registry。
自有包仍为 private，不能从 npm 安装尚未发布的包。可使用仓库 CLI，或打包后的本地 CLI tarball。

从仓库运行：

```sh
pnpm --filter @valar/svelte-cli start add /absolute/path/valar-preset.json --cwd /absolute/path/your-app --yes
```

CLI 按目标项目的别名安装四个原生组件并写入 CSS，不依赖 DialKit 运行时。
交互默认值写入组件源码，调用方显式属性仍可覆盖它们。
Accordion 省略 `type` 时采用预设的默认类型；显式的另一种类型仍保留正确的值类型约束。
若目标项目已有这些组件，应先提交或备份，再审阅覆盖提示，不要盲目使用 `--overwrite`。
导出当前基于 Vega 源码；不声明其他七套样式已经具有相同工作台导出合同。

## 实现与后续覆盖顺序

- [参数合同](../docs/src/lib/features/workbench/model.ts)：中文名称、单位、范围、默认值、继承开关及导入校验。
- [样式生成](../docs/src/lib/features/workbench/styles.ts)：预览和导出共用，包含状态选择器、关键帧与减少动态效果规则。
- [安装文件生成](../docs/src/lib/features/workbench/export.ts)：依赖去重、源码默认值、CSS 和可恢复的元数据。
- 画布使用独立同源 iframe，弹层与样式不污染工作台；消息校验来源及参数合同。
- 主草稿是唯一状态源；切换组件、导入、重置、撤销后重新建立 DialKit 面板，避免使用过期配置。

（Studio 时期的旧顺序，Studio 已暂停扩展：基础展示与布局 → 输入与表单 → 其余弹层与导航 → 日期、图表和复杂组合 → 消息与其他新增组件。当前顺序以文首“路线图与下一步”为准。）
每个组件接入前明确参数及状态合同，完成真实预览、保存恢复、导出和独立安装验证后才更新覆盖状态。
不使用统一 CSS 通配符冒充每个组件已经完成。

## 验收入口

```sh
pnpm test
pnpm check
pnpm build
pnpm --filter docs test:e2e
```

- `docs/tests/workbench.test.ts`：参数范围／注入拒绝、独立导入对象、CSS 与安装文件一致、生成源码编译及 Accordion 类型合同。
- `docs/e2e/workbench.spec.ts`：真实控件编辑、撤销重做、刷新／画布重载、版本恢复、导出再导入、错误输入不覆盖、弹窗焦点及减少动态效果、320／390／768px 与触摸标签页。
- `docs/scripts/check-consumer.ts`：真实 CLI tarball 在工作区外安装下载 JSON，严格检查第三方声明、生产构建，再验证安装后的 58px 按钮、Esc 忽略、650ms Tooltip 延迟／底部方向、多项 Accordion。

2026-10-31 实测：`pnpm test` 共 551 项通过；`pnpm check` 通过，Svelte 检查零错误、零警告；
`NODE_OPTIONS=--max-old-space-size=3072 CI=true pnpm build` 通过；生产预览上的全部 9 项 E2E 通过（含独立消费者）。
桌面默认态、Dialog／Tooltip／Accordion 展开态、手机两个页签的截图已检查；18.7 秒真实指针操作演示已逐帧检查。

浏览器手机验收使用 Chromium Pixel 7 触摸模拟，不等于真实 Android 或 iOS Safari 设备验收。
本记录说明源码与本地运行验收；提交及推送状态以 Git 历史为准，不代表 npm 发布或网站部署。

## DialKit 与 Valar 组件对照（2026-10-31）

规则：Valar 已具备 DialKit 全部控件后才考虑平替；否则继续使用 DialKit，再逐项补足。对照 DialKit 2.1.0 的 15 类控件：开关、下拉、分段、文本、折叠分组、操作按钮 6 项已有；数值滑块（滑块 + 输入）、图片选择 2 项部分具备；颜色、弹簧／缓动曲线、二维拖动板、时间线、版本缩略图、快捷键、浮动面板 7 项缺失。结论：继续使用 DialKit。

本轮补足 **Slider Field**（滑块 + Number Field 组合）与 **Color Picker**（原生色盘 + 十六进制 + 预设，值为 `#rrggbb`），各有文档页、示例、registry 条目和单元测试。剩余缺口按全局 token 配置页等实际需要再补。
