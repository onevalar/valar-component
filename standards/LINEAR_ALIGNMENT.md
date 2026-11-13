# Linear 组件对齐清单

2026-11-13 · 清单记录组件源码及本地场景原型。下文的 33 项复查以仓库中的基础组件为准。

逐项使用[组件设计规范](DESIGN.md)中的场景、状态、搭配、间距和验收规则。下表按开发顺序列出完整库存。组内每个组件独立记录状态，已测组中的其他成员仍需各自实测。

## 基础组件整体验收状态

已有 40 项留下实现或场景验收记录。其中 33 项已验收并恢复目录入口，其他 7 项仍标为「部分对齐」。下表记录每项已落实的范围和优先补查项。批次记录保留当时验证过的状态，当前结论以本节为准。

| 组件 | 已落实的范围 | 整体验收优先补查 |
| --- | --- | --- |
| Alert | 离线重连条、常驻提示和操作布局 | 危险提示采用 Valar 语义红，待找到同类 Linear 常驻错误样本 |
| Alert Dialog | 草稿关闭、危险确认、紧凑和图文样式，焦点约束、取消归焦及本地失败重试 | 已验收；真实失败反馈未在 Linear 取样 |
| Avatar | 成员列表 24 px、订阅者 18 px、照片失败与恢复、状态标记、多人换行和溢出计数 | 已验收，多人头像是 Valar 的通用规则 |
| Badge | Issue 分类标签 | 其他状态徽标、图标、长文本及可点击徽标 |
| Breadcrumb | Issue 返回路径、三级父项、当前项语义、长标题裁切和回退归焦 | 已验收 |
| Button | 工作区主次、透明、危险与禁用按钮，紧凑工具栏，内侧焦点和加载保护 | 已验收 |
| Button Group | Issue 工具栏横向胶囊，两个图标操作补齐无障碍名称 | 其他组形态、混合动作和键盘操作 |
| Calendar | 普通与项目月历、今日和选中、内侧焦点、六行网格、翻月和年月下拉 | 已验收 |
| Card | 常规和紧凑密度、设置行与分隔线、浅深表面、长说明与窄屏操作换行 | 已验收 |
| Checkbox | 标签表格浅深色未选、选中及批量计数，全选、半选、表单校验和禁用 | 已验收，半选沿用 Valar 规则 |
| Collapsible | 项目属性开合、普通按钮、禁用、短屏和减少动态效果 | 已验收 |
| Combobox | 可安装基础组件，Issue 属性单选与标签多选、清空、禁用及本地异步反馈 | 已验收 |
| Command | Cmd+K 弹窗和 My issues 紧凑筛选、长结果独立滚动、键盘选择和归焦 | 已验收 |
| Context Menu | Issue 行右键、Status 搜索子面板、Copy 子菜单、危险确认、键盘及触屏 | 已验收，根菜单保留键盘首字搜索 |
| Date Picker | 项目日期和里程碑入口，输入识别精度、范围校验、清除、日历和周期选项 | 已验收 |
| Dialog | 默认与编辑弹窗、滚动、固定操作区、取消、表单校验和本地提交反馈 | 已验收；普通紧凑壳为 Valar 的通用尺寸 |
| Dropdown Menu | 工作区、子菜单、单选、复选、禁用、行尾快捷键、危险确认和窄屏碰撞 | 已验收；半选及显式危险项沿用 Valar 规则 |
| Empty | Assigned、筛选无结果、清除后归焦、普通空态和本地新建入口 | 已验收 |
| Field | 主题与团队设置行、响应式分组、描述和错误关联、受限项语义 | 已验收 |
| Hover Card | Issue 成员资料、进入和离开、边缘碰撞、短屏滚动、键盘和触屏资料入口 | 已验收，通用链接预览沿用 Valar 规则 |
| Input | Profile 和团队标识的浅深外观、聚焦、默认尺寸与输入反馈，另验证文件、只读、禁用、错误和表单重置 | 已验收，内联错误等采用 Valar 规则 |
| Input Group | 设置搜索、团队名称组合、清除归焦、图标菜单、多行与加载状态 | 已验收，异步验证使用本地示例 |
| Item | Issue 行高、标题截断、尾部信息、当前与归档状态、普通列表和操作 | 已验收 |
| Kbd | 标准、菜单和工具提示三种样式均有 Linear 浅深实测。单键、组合键、按钮和输入组有独立示例 | 已验收 |
| Label | 13 px／500 默认标签、输入关联、必填标记、禁用及复选项切换 | 已验收 |
| Popover | 普通表单、工作区浮层和显示选项，独立滚动、嵌套选择、关闭顺序和归焦 | 已验收 |
| Progress | 项目完成百分比读数，横条范围计算、未知进度和减少动态效果 | 通用横条的 Linear 实页外观与动效仍待取样 |
| Resizable | Inbox 分栏分隔器 | 另一轴向、禁用、边界和不同布局 |
| Scroll Area | 设置细滑块、横纵及双向视口、拖动、滚轮、键盘和可选滚动接力控制 | 已验收，双向示例采用 Valar 规则 |
| Select | 设置表面、选项高亮与选值分离，空值、禁用、错误、长列表、分组及多选 | 已验收 |
| Separator | Linear 设置卡片的浅深行间线落实到基础组件和设置页。横向、纵向及装饰语义有独立示例 | 已验收 |
| Sheet | 项目时间线内嵌面板、独立滚动、窄屏堆叠、四方向模态和归焦 | 已验收；快捷键浮动壳另有取样 |
| Sidebar | 工作区选中项、折叠分组、滚动、桌面图标模式与移动抽屉归焦 | 已验收 |
| Sonner | 复制反馈 | 成功、错误、加载、撤销及堆叠 |
| Switch | 常规和紧凑尺寸，轨道颜色、滑块时序、内侧焦点、禁用与等待 | 已验收，等待采用本地示例 |
| Table | Issue 标签密度、排序和选择、无结果、普通表格与页脚、窄屏内滚动和键盘 | 已验收，无结果为 Valar 示例 |
| Tabs | 时间线胶囊切换，键盘手动激活、默认与线型、垂直、禁用和窄屏滚动 | 已验收 |
| Textarea | 团队描述固定 120 px、通用自动增长、只读、禁用、错误关联及字符限制 | 已验收，可见字数是 Valar 示例补充 |
| Toggle Group | 富文本工具栏 | 其他单选和多选用法、禁用及键盘切换 |
| Tooltip | 实测工具栏与底栏的表面及放置，默认 500 ms 悬停、即时开合、四方向定位、长文案换行和快捷键 | 已验收，保留 Valar 的键盘即时提示 |

## 基础组件默认样式复核

复核 33 个已展示组件页的首个示例和组件源码默认值。16 个页首展示场景或混合用法，现以具体用途命名，包括项目日历、资料卡、设置侧栏和标签表格。Button 的独立文字按钮在组件层统一为胶囊，各颜色变体复用同一形状规则。验收同时覆盖常规文字、图标、相连按钮和圆角调节器。

## 33 项基础组件尺寸复核

逐项对照组件源码、已有 Linear 取样和基础组件预览。Chromium 在浅色、深色及 1200／390 px 下测量代表性示例，回归测试另覆盖更窄视口、状态切换和键盘。尺寸以 CSS px 计。只有用途、摆放位置和尺寸档位相同的控件才直接比较。下表标注的是本轮实际核对的范围。

| 组件 | 复核结果 |
| --- | --- |
| Alert Dialog | 普通确认壳圆角 12，常规操作高 32、间距 8。草稿确认和带说明的危险确认使用各自已取样的面板内边距。 |
| Avatar | 图片和首字母共用圆形外框。订阅者 18、成员 24，普通尺寸按 24／32／40 分档。 |
| Breadcrumb | 同层路径项沿用相同间距。工作区标题栏高 34、回退操作高 24，长标题在自己的列内截断。 |
| Button | 常规独立文字按钮六个颜色变体同为 32 高、12 横向内边距、6 图文间距及胶囊圆角。图标、相连按钮和图文侧预留对应各自用途。 |
| Calendar | 默认日期格 28、项目日期格 26。同一日历的今天、选中、禁用状态共用格宽，普通年月控件与箭头之间至少留 8。修复自定义单元格示例的裁切，区间月历在窄容器内把箭头与年月选择器分行。 |
| Card | 卡片同为 10 圆角，常规与紧凑留白为 16／12。修复操作区把小按钮强行撑到 32 的问题，短按钮按自身尺寸显示，长标签可换行。容器查询移至标题区，卡片可按内容收窄，避免内嵌日历被裁切。 |
| Checkbox | 未选、选中、半选、错误和禁用均使用 14 × 14、3 圆角。 |
| Collapsible | Properties 折叠按钮在开、关与聚焦状态均使用 28 高、8 横向留白和 3 图文间距。通用触发器继承宿主按钮的尺寸。 |
| Combobox | 单选与多选浮层共用 12 圆角和 36 高搜索行，选项至少 32 高、8 圆角；选中标记预留空间。 |
| Command | 常规内嵌和紧凑搜索结果的单行高度均为 32。紧凑过滤面板和全局命令窗分别使用自己的行内留白和结果密度。 |
| Context Menu | 操作、子菜单和选择行沿用 32 最小高度、8 圆角和 8 图文间距；将起止侧留白改为逻辑方向。 |
| Date Picker | 普通和项目触发器使用 24 高的紧凑动作，项目面板圆角 8、横向留白 16，精度标签高 28。 |
| Dialog | 编辑浮层的内容区、固定操作栏及校验状态沿用相同结构；普通确认和编辑表单按各自用途调整壳体和内边距。 |
| Dropdown Menu | 同 Context Menu 的操作行对齐为 32 最小高度、8 圆角、8／12 起止留白和 8 图文间距，分隔区 12；复选和单选保留 32 的行尾勾选区。 |
| Empty | 默认空态使用 14 圆角、24 内边距；列表空态跟随列表布局。分配为空和筛选无结果沿用同一列表空态壳。 |
| Field | 设置行统一用 16 横向留白和 12 间距。通用表单行用 8 间距，响应式行在窄屏重排。 |
| Hover Card | 资料卡使用 8 圆角、8 横向留白。长内容在浮层内部滚动，通用链接预览使用独立密度。 |
| Input | 普通单行输入高 32、圆角 8、横向留白 12，空、错误、聚焦和只读状态沿用同一外框。 |
| Input Group | 单行默认外框与 Input 同为 32 高、8 圆角。内嵌文字及图标按钮统一使用 24／28 两档，行内控件贴合父框内容区，前后附加项随文字方向镜像。 |
| Item | Issue 行沿用 44 高、8 圆角、16 横向留白及 8 间距。通用内容列表可多行，外框和留白由档位控制。 |
| Kbd | 同一种键帽内对照单键、组合键。标准键帽高 21，菜单快捷键、紧凑键帽和 Tooltip 按其宿主密度显示。 |
| Label | 普通及设置文字标签共用 13 字号及 17 行高，错误和禁用反馈沿用同一布局。 |
| Popover | 普通浮层使用 12 圆角和 10 留白；显示选项面板的分组负责内部留白，嵌套选择器打开后仍能保持外层宽度。 |
| Scroll Area | 两个方向复用滚动条的厚度和滑块圆角规则。设置样式使用细滑块；横向、纵向及双轴滚动视口分别核对。 |
| Select | 普通和设置触发器同为 30 高、8 圆角、6 间距，调节普通尺寸时两者一起调整。小尺寸高 28。 |
| Separator | 横、纵分隔线沿各自轴使用同一线宽；标签间距来自宿主组合。 |
| Sheet | 模态抽屉的四个方向复用同一页眉、页脚留白。时间线内嵌面板使用独立滚动和窄屏堆叠。 |
| Sidebar | 工作区普通和小号导航行对齐为 28 高、8 圆角和 6 图文间距。行尾动作或计数预留 32，计数在行内垂直居中。 |
| Switch | 普通和设置开关均用 30 × 20 轨道、14 滑块；紧凑档为 22 × 14、10 滑块。按压动效只影响过渡中的滑块。 |
| Table | 标签表格的数据行保持 44 高，选中、焦点及排序复用列间距。通用数据行按内容自然增长。 |
| Tabs | 默认、线型、胶囊水平触发器统一为 28 高，列表保持 32 高。胶囊轮廓及线型指示保留各自表现。 |
| Textarea | 默认与设置外框同为 10 圆角。通用多行根据内容增长，设置描述按样本固定 120 高。 |
| Tooltip | 同内容在各放置方向复用 8 圆角和同一内边距，较长内容在可用视口内换行。 |

## 场景原型记录

本次提交包含基础组件与其复查用例。下列场景原型及整页预览记录来自本地开发，相关场景源码另行提交。

| 场景             | 注册表入口                       | 共享包入口                                                                | 当前范围                                                       |
| ---------------- | -------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 设置页           | `settings-01`                    | `@valar/svelte-ui/blocks/settings-01`                                     | 已实现双栏、设置行、主题选择、开关和锁定状态                   |
| My issues        | `my-issues-01`                   | `@valar/svelte-ui/blocks/my-issues-01`                                    | 已实现视图、筛选、分组、排序、详情和空状态，使用示例数据       |
| 新建 Issue       | `new-issue-01`、`issue-composer` | `@valar/svelte-ui/blocks/new-issue-01`、`@valar/svelte-ui/issue-composer` | 区块演示创建流程，组件用 `onCreate` 把草稿和所选文件交给宿主   |
| Issue 详情与编辑 | `issue-detail`、`my-issues-01`   | `@valar/svelte-ui/issue-detail`                                           | 标题、富文本、属性、活动时间线、订阅、回应和线程解决，编辑结果同步列表     |
| Projects         | `projects-01`                    | `@valar/svelte-ui/blocks/projects-01`                                     | 已实现列表、跨列看板、时间线、里程碑、筛选、空状态与项目表单 |
| Inbox            | `inbox-01`                       | `@valar/svelte-ui/blocks/inbox-01`                                        | 已实现通知列表、可配置优先规则、详情导航、已读与暂缓、Issue 编辑与评论      |
| Agent            | `agent-01`                       | `@valar/svelte-ui/blocks/agent-01`                                        | 已实现新对话、示例、附件、模拟流式回复、工具反馈和消息滚动     |
| 浅深配色         | 文档站 `/themes/palette`         | 当前默认主题通过 `@valar/svelte-ui/theme.css` 导入                        | 中性色取样作为参考展示，默认主题迁移待逐项验证                 |

六个区块各自以 registry 为唯一维护源。独立消费应用的 `/linear` 通过共享包导入这些区块，用于确认文档站以外的样式和交互。设置页用到的 Card、Select 与 Switch 变体和 Issue Composer 随组件包生成。区块保留示例状态，业务数据和持久化由消费应用处理。[共享包用法](SHARED_UI.md)

共享包和 Playground 类型检查无错误或警告，Playground 生产构建通过。Chromium 的 3 项消费端测试验证了设置控件尺寸、My issues 创建流程、Issue Composer 展开、窄屏、深色和焦点恢复。临时 SvelteKit 项目通过本地 CLI 一次安装三个区块，生成各自的路由，原首页保留。文档 251 项测试和 CLI 转换器 68 项测试通过。

## 本地预览与进度快照

2026-11-12 · 本轮完成到 Issue 订阅、回应与线程解决。文档站的「设计 token」页（`/zh/themes`）汇集各场景入口。基础组件页用于查看单项用法和默认状态，工作区的组合样式和交互在各自的场景页中验收。

| 场景 | 本地预览路径 | 查看方式 |
| --- | --- | --- |
| Issue 详情与协作 | `/zh/themes/my-issues` | 打开 VLR-103，查看活动区的订阅、表情回应、解决及展开线程 |
| Inbox | `/zh/themes/inbox` | 在显示选项调整优先筛选，打开 VLR-206 后用 J/K 切换通知 |
| Projects | `/zh/themes/projects` | 用右上角显示选项切换列表、看板或时间线 |
| 新建 Issue | `/zh/themes/new-issue` | 打开新建问题弹窗，查看字段和展开态 |
| 设置页 | `/zh/themes/settings` | 查看设置行、开关和浅深主题 |
| Agent | `/zh/themes/agent` | 发起示例对话，查看输入、流式回复及工具反馈 |
| 配色 | `/zh/themes/palette` | 对照浅色与深色的参考中性色 |

本次在 My issues 实测订阅、添加表情、解决并展开线程，展开后回应计数保留。示例交互状态在当前页面会话内保留，刷新后重置。最近一批的文档站生产构建、251 项文档测试、11 项浏览器回归和 CLI 安装验证均已通过。

## 基础组件默认样式 · 第一批

Card、Select、Switch、Dropdown Menu、Popover 和 Tooltip 的 Linear 风格已进入普通用法。可从 `/zh/docs/components` 打开对应页面，在示例里使用，并通过「样式调节器」调节同一组件的默认参数。样式由同一份 registry 源码同步到组件注册表和共享包。设置主题、紧凑尺寸及已有工作区组合仍有各自的配置。

验收：浅色和深色逐页打开默认示例，验证圆角、浮层底色、选项行高、键盘选值和焦点、子菜单、开关、悬停提示及减少动态效果。19 项浏览器测试通过，涵盖普通示例、调节器和共享包工作区；251 项文档测试及共享包测试通过。

Card 登录示例也使用共享的 Input。基础 Input 的普通焦点已对齐为 1 px 蓝紫描边，可在 Card 和 Input 示例直接试用。

全库焦点样式已统一为边框变色或内描边。覆盖表单、复合输入、按钮、键盘选项、滑块、菜单、通知、区块和文档调节器。组件注册表与共享包使用相同的样式源码。 Chromium 已在浅深主题验证按钮、组合输入、开关、滑块、验证码和原生链接，并验证通知操作与共享包的 11 项工作区回归。

## 基础组件默认样式 · 第二批

- Input 的浅深底色、边框色和 32 px 高度、8 px 默认圆角来自设置表单截图 L4、D4。Valar 保留 1 px 默认边框及现有主题占位色与聚焦色。
- Separator 的浅深默认色采用设置卡片行分隔线样本，横竖线均保留 1 px。
- Button 的 `icon-sm` 已按工具栏记录落实 28 px 控件、14 px 默认图标及 150 ms 颜色与透明度过渡。其他尺寸和状态待逐项核对。

验收覆盖三项基础组件的 Chromium 浅深预览、Input 无聚焦外环与调节器、Separator 横竖尺寸，以及 Button 减少动态效果。注册表已重新生成，251 项文档测试和 2 项共享包测试通过。

## 基础组件 · 第三批

- [Badge](/zh/docs/components/badge) 新增 `label` 变体。在 Linear My issues 已应用分类上实测浅深色、圆点、胶囊尺寸和颜色过渡。CLI 入口为 `badge`，共享包入口为 `@valar/svelte-ui/badge`。
- [Textarea](/zh/docs/components/textarea) 的默认浅深表面取自 Linear 团队设置的描述框，同页设置示例采用实测的 120 px 高度和 16 px 留白。CLI 入口为 `textarea`，共享包入口为 `@valar/svelte-ui/textarea`。
- Views 的 Issues／Projects 与项目详情的 Overview／Issues 是跨路由链接，继续作为导航样式参考。页内 Tabs 的对照样本仍待确认。

Chromium 在浅深主题验证 Badge 标签、旧变体高度和减少动态效果，以及 Textarea 的设置尺寸、自动增长、聚焦描边和窄屏。Input Group 的多行输入仍由容器提供表面和边框。注册表与共享包已生成，251 项文档测试和 2 项共享包测试通过，类型检查无错误或警告。

## 基础组件 · 第四批

- [Kbd](/zh/docs/components/kbd) 默认外观采用 Linear 快捷键面板实测值。键帽保持原生语义，工作台支持 21 px 高度和 3 px 组间距。注册表入口 `kbd`，共享包入口 `@valar/svelte-ui/kbd`。
- [Checkbox](/zh/docs/components/checkbox) 默认方框和选中色采用 Linear Issue labels 行选择样本，保留内描边焦点及原有表单状态。注册表入口 `checkbox`，共享包入口 `@valar/svelte-ui/checkbox`。
- [Tabs](/zh/docs/components/tabs) 新增 `capsule` 样式，对照 Projects 时间线的 Health／Leads 同页切换。基础页可试用手动激活，方向键移动焦点，Space 切换面板。注册表入口 `tabs`，共享包入口 `@valar/svelte-ui/tabs`。
- Radio Group 的独立浅深样本待补，记录已核对的候选页面和交互差异。

Chromium 已在浅深主题验证三个基础预览，覆盖键帽尺寸、复选框键盘选中与内描边，以及 Tabs 的手动激活、减少动态效果和窄屏。Checkbox 调节器浏览器回归、251 项文档测试与 2 项共享包测试通过，类型检查无错误或警告。注册表和共享包已同步。

## 基础组件 · 第五批

- [Button Group](/zh/docs/components/button-group) 新增横向 `pill`，按 Issue 顶栏实测实现共享外壳、细分隔线和菜单打开态。示例可以选择编码工具并触发本地反馈。注册表入口 `button-group`，共享包入口 `@valar/svelte-ui/button-group`。
- [Toggle Group](/zh/docs/components/toggle-group) 新增 `appearance="toolbar"`，以富文本工具栏为参考。基础页可分别或同时切换加粗与斜体，并看到文本变化。注册表入口 `toggle-group`，共享包入口 `@valar/svelte-ui/toggle-group`。
- [Command](/zh/docs/components/command) 的弹窗按 Linear Cmd+K 的浅深样本调整。预览可筛选、用方向键移动高亮、用 Enter 执行、用 Escape 关闭并归焦；内联和 Popover 调用沿用原来的通用样式。注册表入口 `command`，共享包入口 `@valar/svelte-ui/command`。

Chromium 在浅深主题验证分体菜单与选值反馈、格式按钮多选及内描边、命令高亮和无匹配反馈，以及 390 px 窄屏命令面板。Command List 补上 Bits UI Viewport，并新增浏览器回归，检查搜索框与当前选项的关联及执行后归焦。251 项文档测试、2 项共享包测试和命令面板回归通过，类型检查无错误或警告。注册表和共享包已同步。

## 基础组件 · 第六批

- [Context Menu](/zh/docs/components/context-menu) 默认菜单采用 Linear 问题行样本。预览支持右键、Shift+F10、状态子菜单和本地选值。注册表入口 `context-menu`，共享包入口 `@valar/svelte-ui/context-menu`。
- [Combobox](/zh/docs/components/combobox) 以 Linear 负责人面板为参考，示例包含搜索、当前值勾选、独立的键盘高亮与无匹配反馈。组合使用注册表 `popover`、`command` 和对应共享包入口。
- [Empty](/zh/docs/components/empty) 新增 `appearance="issue-list"`，按 Assigned 空列表实现标题和动作间距。使用 Valar 插图，基础页可创建本地示例问题。注册表入口 `empty`，共享包入口 `@valar/svelte-ui/empty`。

Chromium 已在浅深主题验证右键菜单、键盘子菜单、负责人搜索和选值归焦，以及空状态的创建动作。目录和搜索的中英文一致性、Context Menu 调节器回归、251 项文档测试和 2 项共享包测试通过。注册表和共享包已同步。

## 基础组件 · 第七批

- [Dialog](/zh/docs/components/dialog) 的 `appearance="editor"` 对应 Linear 紧凑 Issue 编辑壳。预览可编辑标题与描述，保存本地结果，关闭后归焦。注册表 `dialog`，共享包 `@valar/svelte-ui/dialog`。
- [Alert Dialog](/zh/docs/components/alert-dialog) 的 `appearance="confirmation"` 对应关闭草稿的确认层。基础示例提供继续编辑、保存和丢弃三项本地操作，初始聚焦继续编辑。注册表 `alert-dialog`，共享包 `@valar/svelte-ui/alert-dialog`。
- [Input Group](/zh/docs/components/input-group) 的 `appearance="settings-search"` 对应设置侧栏搜索框，可筛选、显示无结果和清除。注册表 `input-group`，共享包 `@valar/svelte-ui/input-group`。
- [Field](/zh/docs/components/field) 与 [Label](/zh/docs/components/label) 的 `appearance="settings"` 取自 Interface theme 设置行。Field 的示例包含说明、可操作的 Select 和窄屏排布。Label 的示例可点击关联标签聚焦输入。注册表 `field`、`label`，共享包 `@valar/svelte-ui/field`、`@valar/svelte-ui/label`。

Chromium 在浅深模式验证五项基础预览，涵盖编辑与确认后的归焦、窄屏弹窗、设置搜索无结果和清除、字段说明及标签点击。中英文目录与搜索回归、251 项文档测试和 2 项共享包测试通过，类型检查无错误或警告。注册表和共享包已同步。

## 基础组件 · 第八批

- [Sheet](/zh/docs/components/sheet) 新增 `details`，使用 Projects 右侧详情卡样式。预览支持键盘打开、关闭和归焦。Linear 的详情是工作区内侧栏，Valar 示例是模态 Sheet。注册表 `sheet`，共享包 `@valar/svelte-ui/sheet`。
- [Hover Card](/zh/docs/components/hover-card) 新增 `profile`，对应 Issue 活动作者资料卡。预览支持从触发器移入卡片，也可经链接访问资料。注册表 `hover-card`，共享包 `@valar/svelte-ui/hover-card`。
- [Table](/zh/docs/components/table) 新增 `settings`，以 Issue labels 为样本。预览支持名称排序、逐行选择与全选。注册表 `table`，共享包 `@valar/svelte-ui/table`。
- [Avatar](/zh/docs/components/avatar) 新增 `subscriber`，预览可切换头像照片和缩写。注册表 `avatar`，共享包 `@valar/svelte-ui/avatar`。
- [Scroll Area](/zh/docs/components/scroll-area) 新增 `settings`，使用设置侧栏的浅深滑块色。预览支持滚轮、键盘和拖动滑块。注册表 `scroll-area`，共享包 `@valar/svelte-ui/scroll-area`。

Chromium 在浅深模式验证五项基础预览，覆盖 Sheet 的键盘关闭、归焦和窄屏，Hover Card 的悬停及资料链接，Table 的排序和选择，Avatar 的照片回退，以及 Scroll Area 的键盘、滚轮和拖动。中英文目录与搜索回归、251 项文档测试和 2 项共享包测试通过。注册表和共享包已同步。

## 基础组件 · 第九批

- [Sidebar](/zh/docs/components/sidebar) 的 `appearance="workspace"` 使用工作区导航实测尺寸、配色和选中状态。可切换视图、展开或收起 Workspace 分组。桌面图标折叠和窄屏 Sheet 为 Valar 提供的交互。
- [Breadcrumb](/zh/docs/components/breadcrumb) 的 `appearance="workspace"` 来自从 My issues 打开 Issue 的顶栏。可返回示例列表并重新打开问题。
- [Collapsible](/zh/docs/components/collapsible) 的 `appearance="properties"` 来自 Projects 右侧详情。可用鼠标和键盘切换属性区，箭头旋转 150 ms，减少动态效果时即时切换。
- [Item](/zh/docs/components/item) 的 `appearance="issue-row"` 来自 My issues 的 Created 列表。编号、状态、标题和日期排成一行，可点击或按 Enter 打开示例详情。
- **Skeleton 待取样。** 降速重载 Inbox 捕捉到 `Loading…` 提示，My issues、Projects 和 Agent 的低速导航中也未确认骨架占位。待取得样本后再改样式、验收并开放目录入口。

Chromium 在浅深模式验证四项基础预览，覆盖导航选中及窄屏侧栏关闭归焦、面包屑往返、属性折叠和问题行键盘打开。四项外观通过同名注册表和共享包入口提供。

## 基础组件 · 第十批

- [Resizable](/zh/docs/components/resizable) 的 `appearance="workspace"` 取样于 Inbox 双栏。预览支持鼠标、触屏和键盘调宽，分隔线按实测延迟淡入。注册表 `resizable`，共享包 `@valar/svelte-ui/resizable`。
- [Sonner](/zh/docs/components/sonner) 的 `appearance="workspace"` 取样于复制 Issue ID 的通知。预览支持复制示例编号、重复触发合并、键盘关闭及自动消失。注册表 `sonner`，共享包 `@valar/svelte-ui/sonner`。
- [Calendar](/zh/docs/components/calendar) 的 `appearance="project-date"` 取样于 Projects 目标日期。可翻月、用方向键移焦和选择日期，可检查今天、外月和禁用日期。注册表 `calendar`，共享包 `@valar/svelte-ui/calendar`。
- **Skeleton、Spinner、Radio Group 继续待取样。** Issue 冷启动出现文字加载提示，搜索未捕捉到独立 Spinner；Preferences、团队 General 和 Triage 未见独立 Radio Group。三项保留原组件和待对齐状态。

Chromium 在浅深主题验收三项独立预览，包含窄屏触屏、复制反馈及日期键盘选择，旧调节器覆盖分栏、通知和通用月历。注册表和共享包已同步。

## 基础组件 · 第十一批

- [Alert](/zh/docs/components/alert) 的 `appearance="connection"` 来自 Linear 断网后的常驻提示。可模拟重试仍离线、恢复后提示消失，并用键盘操作。注册表 `alert`，共享包 `@valar/svelte-ui/alert`。
- [Progress](/zh/docs/components/progress) 的 `appearance="project"` 来自 Projects 列表的完成度读数，实测从 0% 变化至 100%。可用独立滑块驱动示例，读数通过 `progressbar` 提供无障碍进度。注册表 `progress`，共享包 `@valar/svelte-ui/progress`。
- **Skeleton、Spinner 和 Radio Group 继续待取样。** 最近删除列表和 Agent 会话切换未确认骨架占位。Agent 生成阶段出现带动效的 `Thinking…` 文字，重连未出现独立 Spinner。GitHub 导入助手的团队选择使用下拉菜单。

Chromium 在浅深主题和窄屏验收重试、恢复、归焦、进度端点与键盘更新。原有 Alert 和 Progress 的样式调节器继续可用，注册表和共享包已同步。

## 基础组件发布范围

[发布清单](../docs/src/lib/basic-component-visibility.ts)控制中英文基础组件目录、导航、站内搜索和相关组件。完成组件整体验收后，将文档 slug 移入已对齐清单，并在上表记录验收证据。部分对齐和待对齐的直达页提供预览和状态标记。注册表、共享包和组合示例使用完整组件源。

## 基础组件 · Date Picker

日期选择器已从 Projects 表单迁入基础组件。独立预览在 `/zh/docs/components/date-picker`，CLI 安装入口为 `date-picker`，共享包入口为 `@valar/svelte-ui/date-picker`。项目创建、项目排期和里程碑日期使用同一组件。

## 基础组件逐项复核 · 2026-11-13

- 逐页打开已有记录的 40 个基础组件。Chromium 覆盖 1200 px 浅色桌面和 390 px 深色窄屏共 80 次预览。修复发现的无障碍命名问题后，40 页窄屏复扫未发现页面横向溢出或扫描范围内的未命名控件。页面可运行与组件整体验收分别记录。
- 此轮扫描覆盖页面横向溢出和控件命名。相邻控件间距按 [布局验收](DESIGN.md#布局验收) 另行记录。已复测 Calendar 年月标题及出生日期示例。Calendar 页「自定义单元格尺寸」中的 Range Calendar 曾在 320 px 下出现约 22 px 重叠。现按月历容器宽度分行，星期与日期列对齐，年月下拉复用 Valar Select。布局修复通过后，Range Calendar 的整体验收继续待复核。
- Kbd 取样覆盖帮助菜单、快捷键弹窗和 Inbox 工具提示。浏览器验证菜单可用键盘打开、选择，紧凑键帽随工具提示出现和关闭，按钮及输入组中的按键确实触发对应动作。
- Separator 对照 Preferences 设置行取样。浏览器验证浅深配色、0.5 px 横竖尺寸与装饰语义。Inbox 分栏线的配色属于 Resizable 布局样本。
- Tooltip 对照 Inbox 顶部的显示选项和底栏的聊天历史，保留基础组件四方向定位。浏览器验证悬停延迟、开合、碰撞翻转、禁用按钮提示、窄屏长文案、快捷键与 Escape 归焦。Valar 保留键盘聚焦时的即时说明，Linear 的 Add filter 样本只在指针悬停时显示提示。
- Input 复测 Profile 的边框、占位及内侧焦点。Chromium 验证 Input 和 Textarea 在浅深主题下可选择只读值、无法改写只读内容、禁用控件无法编辑，并可通过控件定位对应错误说明。
- Alert 的通用外壳取自 Linear Triage 设置的常驻提示，长文案和操作在窄屏可换行。仍待验证常驻危险提示。Progress 已修正非零最小值的计算，支持进度未知、边界和减少动态效果。额度与统计页缺少可取样横条。
- 保留表中尚未完成的实页样本和状态复核。Skeleton、Spinner 和 Radio Group 继续等待独立参考。

## 基础组件整体验收 · 表单

2026-11-13 · 复测 Linear Preferences、团队 General、新建团队和设置搜索。颜色、间距、搭配和可复现的状态记录在[设计规范](DESIGN.md#表单状态与组合复测)。

| 组件 | 基础组件入口 | 浏览器验收 |
| --- | --- | --- |
| Input | `/zh/docs/components/input`、`@valar/svelte-ui/input` | 32 px 输入、标识符限制、标签聚焦、内侧错误焦点、纠错、文件选择、只读、禁用、提交及重置 |
| Textarea | `/zh/docs/components/textarea`、`@valar/svelte-ui/textarea` | 默认增长、设置外观固定高度与滚动、255 字符限制、只读、禁用、错误恢复、键盘和表单操作 |
| Field | `/zh/docs/components/field`、`@valar/svelte-ui/field` | 设置行几何、说明与错误的可访问关联、标签配合 Select 和 Input、受限行标题、窄屏堆叠 |
| Label | `/zh/docs/components/label`、`@valar/svelte-ui/label` | 原生关联、浅深文字、点击聚焦、必填标记、禁用和复选框键盘切换 |
| Input Group | `/zh/docs/components/input-group`、`@valar/svelte-ui/input-group` | 清除及 Escape、无匹配、组合图标、边界内焦点、只读、禁用、异步反馈和多行输入。Agent 的发送按钮禁用时，输入区域仍正常显示 |

浅深色及桌面和窄屏检查通过，CLI 注册表和共享包已同步。实页未观察到独立的原生只读、禁用与内联错误样式，相关状态沿用 Valar 规则。

## 基础组件整体验收 · 按钮与选择控件

2026-11-13 · 已复测 Teams、Preferences、Issue labels、新建 Issue／Project 和 Projects 时间线，见[设计规范](DESIGN.md#按钮选择与页内切换复测)。

| 组件 | 基础组件入口 | 浏览器验收 |
| --- | --- | --- |
| Button | `/zh/docs/components/button`、`@valar/svelte-ui/button` | 常用变体和尺寸、悬停、键盘激活、加载阻止重复提交、禁用链接、减少动态效果 |
| Checkbox | `/zh/docs/components/checkbox`、`@valar/svelte-ui/checkbox` | 标签点击、Space、全选与半选、禁用、错误关联和修正后的表单值 |
| Switch | `/zh/docs/components/switch`、`@valar/svelte-ui/switch` | 常规与紧凑尺寸、滑块端点和时序、开启／关闭焦点、禁用与异步保存 |
| Select | `/zh/docs/components/select`、`@valar/svelte-ui/select` | 触发器和设置面板、选项高亮与选择、Escape 归焦、禁用、错误、分组滚动、多选提交及重置 |
| Tabs | `/zh/docs/components/tabs`、`@valar/svelte-ui/tabs` | 默认、胶囊、线型和垂直，手动与自动激活，禁用跳过、Home／End、窄屏溢出和减少动态效果 |

悬停、等待、半选或禁用状态中缺少直接对应样本的细节沿用 Valar 规则。

## 基础组件整体验收 · 弹层与菜单

2026-11-13 · 复测 Linear 项目时间线、快捷键、工作区菜单和测试 Issue，测量及差异见[设计规范](DESIGN.md#弹层选项和项目侧栏复测)。

| 组件 | 基础组件入口 | 浏览器验收 |
| --- | --- | --- |
| Alert Dialog | `/zh/docs/components/alert-dialog`、`@valar/svelte-ui/alert-dialog` | 默认、危险、紧凑和图文，遮罩点击不误关、键盘焦点、取消归焦及本地异步重试 |
| Dialog | `/zh/docs/components/dialog`、`@valar/svelte-ui/dialog` | 默认和编辑、内滚动与固定操作区、窄屏关闭、校验和本地保存 |
| Sheet | `/zh/docs/components/sheet`、`@valar/svelte-ui/sheet` | 时间线非模态面板的标签、滚动、外部操作与键盘离开；四方向模态和减少动态效果 |
| Popover | `/zh/docs/components/popover`、`@valar/svelte-ui/popover` | 普通表单、显示选项、嵌套选择、重置、点击外部关闭、Escape 归焦及碰撞 |
| Dropdown Menu | `/zh/docs/components/dropdown-menu`、`@valar/svelte-ui/dropdown-menu` | 指针和键盘高亮、单选、复选、半选、禁用、长菜单滚动、子菜单归焦和删除确认 |

各组件在浅色、深色、桌面和窄屏进行 Chromium 验收。Valar 的焦点提示沿用内描边、边框或底色。危险确认示例使用 `focusCancel` 聚焦取消，等待与失败使用本地流程。保留原有可调参数和安装入口。

## 基础组件整体验收 · 搜索与日期

2026-11-13 · 复测 Linear 的 Issue 行、属性选择和项目日期表单，实测尺寸及行为见[设计规范](DESIGN.md#搜索菜单与项目日期复测)。

| 组件 | 基础组件入口 | 浏览器验收 |
| --- | --- | --- |
| Context Menu | `/zh/docs/components/context-menu`、`@valar/svelte-ui/context-menu` | 右键、Shift+F10、触屏长按、窄屏碰撞、状态查询、子菜单关闭归焦、危险确认和选项标记 |
| Combobox | `/zh/docs/components/combobox`、`@valar/svelte-ui/combobox` | 单选、多选、别名、禁用、已选和当前高亮分开、清空、本地失败重试及 Issue 属性更新 |
| Command | `/zh/docs/components/command`、`@valar/svelte-ui/command` | 全局命令和紧凑筛选、分组、长列表滚动、搜索栏保持可见、无匹配和键盘归焦 |
| Calendar | `/zh/docs/components/calendar`、`@valar/svelte-ui/calendar` | 周一开始、今日和选中外观、方向键选日、翻月、年月浮层限高、窄屏和逐层关闭归焦 |
| Date Picker | `/zh/docs/components/date-picker`、`@valar/svelte-ui/date-picker` | 直接输入精度、无效日期和范围提示、精度键盘切换、清除、关闭归焦及项目与里程碑编辑 |

组件页和组合均使用生成后的基础组件。无匹配、等待、失败和重试中未能从 Linear 取得的细节按 Valar 规则实现。Calendar 和 Date Picker 的限制、周期范围规则及错误提示也在本地验证。

## 基础组件整体验收 · 容器、表格与成员信息

2026-11-13 · 从 Linear 设置卡片、Issue 活动、标签与成员列表复测。取样与 Valar 设计决策分别记录在[设计规范](DESIGN.md#设置容器与成员信息复测)。

| 组件 | 基础组件入口 | 浏览器验收 |
| --- | --- | --- |
| Card | `/zh/docs/components/card`、`@valar/svelte-ui/card` | 16／12 px 密度、设置行间距、图像卡片动作位置、窄屏堆叠、键盘切换与重置 |
| Hover Card | `/zh/docs/components/hover-card`、`@valar/svelte-ui/hover-card` | 197 × 175 px 资料布局、边缘定位、移入卡片、Escape、减少动态效果、键盘和触屏资料入口 |
| Table | `/zh/docs/components/table`、`@valar/svelte-ui/table` | 32／44 px 表头和数据行、键盘排序与选择、筛选无结果、表格内部横向滚动 |
| Avatar | `/zh/docs/components/avatar`、`@valar/svelte-ui/avatar` | 18／24 px 实测外观、图片和缩写互换、状态标记、组计数与窄屏 |
| Scroll Area | `/zh/docs/components/scroll-area`、`@valar/svelte-ui/scroll-area` | 设置细滑块、内侧焦点、滚轮、键盘、拖动、横向和双向滚动 |

浅深主题分别在 1200 px 和 360 px 宽的 Chromium 文档页验收，另用 360 × 290 px 检查资料卡内部滚动。22 项组件与触屏回归及 1 项中英文目录和搜索回归通过；251 项文档单元测试、2 项共享包测试通过。五项注册表和共享包由同一份源码生成；组件目录及搜索恢复这五个入口。

## 基础组件整体验收 · 导航与列表状态

2026-11-13 · 复测 Linear 的工作区导航、My issues 和 Projects 时间线详情，取样见[设计规范](DESIGN.md#导航属性展开和空列表复测)。

| 组件 | 基础组件入口 | 浏览器验收 |
| --- | --- | --- |
| Sidebar | `/zh/docs/components/sidebar`、`@valar/svelte-ui/sidebar` | 192／48 px 桌面布局、分组折叠、内滚动、移动抽屉关闭和归焦 |
| Breadcrumb | `/zh/docs/components/breadcrumb`、`@valar/svelte-ui/breadcrumb` | 三级路径、当前项、长标题裁切和键盘导航 |
| Collapsible | `/zh/docs/components/collapsible`、`@valar/svelte-ui/collapsible` | 项目属性、常规按钮、锁定、焦点和减少动态效果 |
| Item | `/zh/docs/components/item`、`@valar/svelte-ui/item` | 44 px Issue 行、编号与日期、长标题、详情焦点和归档状态 |
| Empty | `/zh/docs/components/empty`、`@valar/svelte-ui/empty` | Assigned 与筛选无结果样式、清除筛选、焦点回到筛选入口 |

1200 px 与 360 px 宽度下的浅深主题均已通过。Issue 详情、My issues 列表和项目详情分别接入 Breadcrumb、Item／Empty 和 Collapsible。图标折叠、归档不可用行和示例插图按 Valar 规则实现。

下一批复核 Badge、Button Group、Toggle Group、Resizable 和 Sonner。优先对照 Issue 标签与工具栏、富文本操作、Inbox 分栏和复制反馈。

## 组合待办 · Projects 时间线直接操作

1. 核对时间线拖动改期、里程碑多选和重叠聚合。
2. 核对在时间线拖动创建依赖及共享视图权限。
3. Inbox 右键操作、自定义暂缓日期及真实通知验证保留在后续验收。

## 现有组件

| 区域               | Valar 组件目录                                                                                                                                             | 参考界面或下一项实测                                                              | 进度                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 基础操作           | `button`、`button-group`、`kbd`                                                                                                                            | 新建 Issue、项目工具栏、快捷键提示；核对图标按钮、按钮群、待提交和危险操作        | Button 的 icon-sm、Button Group 的 pill 与 Kbd 默认外观已落实                                                           |
| 设置与导航容器     | `sidebar`、`card`、`item`、`separator`、`scroll-area`、`breadcrumb`                                                                                        | 工作区导航、Issue 顶栏与列表、Preferences；继续核对设置行和侧栏拖动                  | Card 和 Separator 默认外观已调整；Sidebar、Item、Scroll Area 与 Breadcrumb 提供实测外观                       |
| 输入与表单         | `field`、`form`、`label`、`input`、`input-group`、`textarea`、`switch`、`checkbox`、`radio-group`、`select`、`native-select`                               | Preferences、创建表单、筛选器；补校验、只读、禁用、选项面板及焦点                 | Input、Textarea、Select、Switch 和 Checkbox 已调整默认外观；Combobox、Input Group、Field 与 Label 已提供实测场景，Radio Group 待实测         |
| 导航切换           | `tabs`、`toggle`、`toggle-group`、`navigation-menu`、`menubar`、`pagination`                                                                               | My issues、Projects 列表视图切换、工具栏、分页；区分跨路由链接与页内面板          | 页内 Tabs 的 capsule 与 Toggle Group 的 toolbar 已落实                                          |
| 弹层               | `dialog`、`issue-composer`、`alert-dialog`、`popover`、`tooltip`、`hover-card`、`dropdown-menu`、`context-menu`、`sheet`、`drawer`、`command`              | 新建 Issue、帮助菜单、快捷键提示、右键菜单、快速操作；逐项核对碰撞、焦点和开合    | Dropdown Menu、Popover、Tooltip、Command 弹窗和 Context Menu 已调整；Dialog、Alert Dialog、Sheet 与 Hover Card 已提供实测外观 |
| 列表与状态         | `table`、`avatar`、`badge`、`marker`、`alert`、`empty`、`skeleton`、`spinner`、`progress`、`sonner`                                                        | Issues、Projects、Inbox、项目更新与异步反馈；补加载、错误、选中、空状态和状态图标 | Badge 分类标签、Empty 问题列表、Table 设置表格与 Avatar 订阅者变体已落实 |
| 折叠、日期和尺寸   | `accordion`、`collapsible`、`calendar`、`range-calendar`、`resizable`、`slider`、`slider-field`、`number-field`、`tags-input`、`color-picker`、`input-otp` | 项目属性折叠、日期选择、可调侧栏、标签编辑；逐项确认同类参考或按 Valar 扩展处理       | Collapsible 提供项目属性外观，其余候选待实测                                 |
| 内容、编辑与 Agent | `attachment`、`bubble`、`message`、`message-scroller`、`code-block`、`questionnaire`、`trace`                                                              | Agent 聊天、Issue 描述、附件与代码；补消息状态、滚动、反馈与工具内容              | Issue 详情与富文本编辑、Agent 对话组合已实现                              |
| 统计与 Valar 扩展  | `chart`、`gauge`、`waffle-chart`、`donut-chart`、`sparkline`、`ruler-slider`、`tick-meter`、`texture-fill`、`stepper`、`aspect-ratio`、`carousel`          | 对照图表、时间线与步骤场景。无已确认参考的组件沿用统一的表面、密度和状态规范      | 待确认对应，按设计规范适配                                                |

## 组合与能力缺口

| Linear 场景                | 现有 Valar 基础                                                           | 需要补查或补充                                                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Settings 页面和设置行      | Sidebar、Card、Field、Separator、Select、Switch                           | `settings-01` 已实现双栏、说明、关闭／开启、锁定行、滚动与窄屏重排                                                                                               |
| My issues 及项目列表工具栏 | Button、Tabs、Popover、Command、Select、Empty、Issue Composer             | `my-issues-01` 已实现四个视图、状态与优先级筛选、排序、分组和空状态。`projects-01` 已实现项目列表、可拖拽状态看板、时间线和组合筛选。跨 URL 导航、高级筛选与保存视图待覆盖     |
| 新建 Issue／项目的编辑弹窗 | Issue Composer、Dialog、Button、Switch、Popover、Command、Input、Textarea | `new-issue-01` 已实现新建 Issue 的布局、校验、状态和优先级、附件选择与连续创建。`projects-01` 包含团队、状态、负责人和日期的项目创建表单。富文本与额外字段待覆盖 |
| Agent 对话及示例卡片       | Bubble、Message、Message Scroller、Card、Button、Attachment               | `agent-01` 已实现新对话、附件、模拟流式回复、工具反馈和消息滚动。真实服务接入与外部集成待对应场景                                                                |
| Linear 风格图标            | Valar 现有可配置 iconLibrary                                              | 工具栏、关闭和输入图标已核对尺寸、位置和状态色。更细的几何差异留在后续场景                                                                                       |

优先交付可验证的页面组合。确认某个能力缺失时，在此登记场景、完整状态、接口与验收证据，再新增组件。已经能由现有组件组合的场景优先补示例及搭配规范。

## Switch 首批对齐记录

2026-11-11。对齐 Preferences 常规开关和新建 Issue 底部的紧凑开关。Valar 继续通过 `size="default"` 和 `size="sm"` 使用相同的原语，保留两档可调尺寸和受控状态。已同步组件规范和生成的 registry。

- 常规轨道 30 × 20 px、滑块 14 × 14 px、两端内缩 3 px。紧凑轨道 22 × 14 px、滑块 10 × 10 px、两端内缩 2 px。轨道背景和透明度过渡为 150 ms `ease-out`。
- 在文档站用 Chromium 检查两档尺寸、两端位置、Space 切换、禁用语义、RTL、深色和减少动态效果。文档 250 项测试和类型检查通过。
- 轨道配色、焦点轮廓及双边错时的滑块形变仍待对齐。当前使用 Valar 的主题颜色和单段位移动效。

## 设置页组合验收

2026-11-11。`settings-01` 是可安装的 registry 区块，文档站在 `/themes/settings` 提供中英文预览。以 Linear Preferences 为参考，组合 Sidebar、Card、Field、Separator、Select 和 Switch。应用侧可从该区块复用布局与主题变量。

- 桌面设置栏宽 204 px，导航行高 28 px、圆角 8 px。内容列上限为 640 px，设置行内边距 16 px、间距 12 px，卡片圆角 10 px。窄屏示例将导航置顶，窄内容列使用垂直设置行。
- Select 设置触发器高 30 px、圆角 8 px，浮层圆角 12 px、选项高 32 px。设置区内的 Portal 继承浅深主题。使用方向键移动高亮，Escape 归焦，选值更新示例配色。
- `Switch appearance="settings"` 使用设置区的开关色和 1 px 焦点轮廓。滑块通过两个逻辑方向的边缘位置形成形变，两个过渡都是 100 ms `ease-out`，一侧延迟 50 ms，状态反向时交换。减少动态效果时滑块与轨道直接到达目标状态。
- Chromium 验收覆盖 1280 px 桌面和 375 px 窄屏、浅深主题、下拉选项高亮、Escape 归焦、Space 切换、禁用与减少动态效果。核验 `settings-01` registry 产物、组件依赖和共享 UI 构建。文档 250 项测试通过，类型检查零错误、零警告。
- 设置外观适用于本组合。未采集的窄屏 Linear 布局属于 Valar 适配。Select 浮层开合沿用 Valar 动效，精确时序留待后续对齐。

## My issues 组合验收

2026-11-12。`my-issues-01` 是可安装的 registry 区块。文档站在 `/themes/my-issues` 提供中英文预览，区块自身也可以通过 `/view/my-issues-01` 打开。

- 登录后的 Linear 工作区四个视图均为空。实测覆盖导航胶囊、筛选菜单与条件栏、显示菜单、空状态与详情占位。带数据的行字段来自 Linear 官方 My issues 截图，示例问题、行高及插图由 Valar 实现。[Linear My issues](https://linear.app/docs/my-issues)
- 四个胶囊支持方向键切换。状态和优先级可组合筛选，并可逐项移除或一起清除。显示菜单支持状态分组、创建时间与优先级排序、隐藏已完成问题。点击问题行显示详情。
- 「我订阅的」提供初始空视图。筛选无结果时可重置。空视图与标题栏均可打开新建对话框，创建的示例记录进入「我创建的」，并恢复到可见的焦点入口。
- Chromium 验收覆盖浅深主题、1280 px 桌面、375 px 窄屏和上述交互。文档 250 项测试、类型检查和生产构建通过。核验了中英文预览与区块页面的预渲染产物。
- 预览使用单页 Tabs、会话内示例数据及窄屏重排。Linear 的跨路由视图、看板、高级筛选和保存视图留待对应场景。

## 新建 Issue 组合验收

2026-11-12。`new-issue-01` 是可安装的 registry 区块，在 `/themes/new-issue` 和 `/zh/themes/new-issue` 提供独立预览。My issues 标题栏和空状态共用 `issue-composer`。

- 以登录后的 Linear 新建 Issue 弹窗为参考，记录紧凑和展开布局、标题与描述的字号、属性选项和底部操作顺序。尺寸、颜色和状态见[设计规范](DESIGN.md#新建-issue-组合)。
- 预览支持自动聚焦、输入校验、键盘选项、附件选择、展开收起、连续创建与提交后归焦。已创建的示例保存在当前页面，My issues 列表可查看表单提交结果。
- Chromium 覆盖 1042 × 853 px 桌面与 375 × 812 px 窄屏、浅深主题、减少动态效果、菜单焦点和草稿恢复。文档 250 项测试、类型检查和生产构建通过。
- 多行描述采用纯文本。其余元数据菜单、富文本、附件上传和弹窗进退场的精确时序待对应场景覆盖。

## Projects 验收

- 文档站 `/zh/themes/projects` 和 `/themes/projects` 提供示例数据、空工作区和单团队三种入口，Playground `/linear` 从共享包导入 Projects。CLI 的 `projects-01` 将页面及相对依赖写入独立路由目录。
- 列表与状态看板使用同一份项目和筛选数据。状态、优先级、负责人和所属团队支持组合筛选。新建项目支持列状态预填、多团队、负责人、开始日期和目标日期，保存后更新当前预览。
- 已实测内容和 Valar 适配边界见[设计规范](DESIGN.md#projects-列表看板与项目表单)。
- Chromium 验证筛选清除、看板列状态预填、日期和负责人选择、草稿丢弃与归焦，以及 375 px 窄屏、深色和减少动态效果。中英文文档路由、空工作区与单团队场景已核对。
- 文档站与 Playground 生产构建通过，类型检查零错误、零警告。文档 251 项测试、共享包生成测试与 4 项消费端浏览器测试通过。CLI 在临时 SvelteKit 项目写入 5 个区块文件和日期依赖，已编译 Svelte 文件并核对原首页保留。

## Issue 详情与编辑验收

- 在 `/zh/themes/my-issues` 点击问题行或列表工具栏的详情按钮。两个入口都使用 `issue-detail`，Playground 的 My issues 标签页通过共享包使用同一实现。
- 标题和描述使用独立草稿，支持显式保存、取消和键盘快捷键。属性、标签和项目由选项菜单直接更新，当前列表筛选会按编辑结果重新计算。
- 参考实测与 Valar 的适配边界见[设计规范](DESIGN.md#issue-详情与编辑)。
- Chromium 验证了宽屏属性栏、375 px 窄屏、深色、富文本保存和回读、取消、链接输入、属性即时更新、列表归焦和负责人筛选。共享包 5 项浏览器用例与文档 251 项测试通过。
- 文档站与 Playground 生产构建通过。临时 SvelteKit 项目通过 CLI 安装 My issues、Issue Detail 和 Tiptap 依赖，安装后的 Svelte 源码可编译。

## Inbox 验收

- 文档站在 `/themes/inbox` 和 `/zh/themes/inbox` 提供带数据和空收件箱两种场景。Playground 的 Inbox 标签页通过共享包导入，CLI 入口为 `inbox-01`。
- 登录实测覆盖空列表、未读空状态、筛选、显示选项和宽窄屏。带数据的列表参考官方截图，通知详情使用现有 Issue Detail。新增优先来源与问题优先级配置、详情导航和通知快捷操作。示例数据保存在当前预览。[设计规范](DESIGN.md#inbox-通知中心)
- Chromium 消费端 6 项用例通过。Inbox 验收覆盖快捷搜索、组合筛选、已读切换、暂缓后重新显示、优先视图、Issue 编辑同步、375 px 窄屏、深色和返回归焦。文档 251 项测试、共享包生成测试及两端生产构建通过。
- 本轮 Chromium 回归验证优先来源切换、恢复默认规则、J 切换详情、U 标为未读和 H 暂缓。推进模拟时间后，暂缓通知重新出现在原列表，并保留未读状态。Inbox、工作区浮层和 Issue 协作的 4 项回归通过。
- CLI 在临时 SvelteKit 项目写入 `src/routes/inbox-01/` 和所需依赖声明，原首页保留。安装后 107 个 Svelte 文件通过编译检查。

## Agent 对话验收

- 文档站提供 `/zh/themes/agent` 和 `/themes/agent`，区块预览在 `/view/agent-01`。Playground 的 Agent 标签从共享包导入，registry 安装名为 `agent-01`。
- 登录实测了示例卡片触发、新对话与历史、文件上传、流式回复、停止、只读搜索工具步骤与跳到最新消息。预览采用本地数据，浅色与窄屏的实现边界见[设计规范](DESIGN.md#agent-对话)。
- Chromium 消费端 7 项用例通过。Agent 用例覆盖示例发送、文件选择与移除、带附件发送、输入换行、流式回复、展开工具反馈、跳到最新、停止、会话隔离和恢复、375 px 窄屏、深色和减少动态效果。
- 文档 251 项测试和共享包生成测试通过，两端类型检查无错误或警告，文档站与 Playground 的生产构建通过。CLI 在临时 SvelteKit 项目写入 `src/routes/agent-01/` 及所需依赖声明，保留原首页。生成后的 107 个 Svelte 文件通过编译检查。

## 共用菜单、Tooltip 与图标验收

- Projects、Inbox、新建 Issue、Issue Detail 与 Agent 使用共用浮层外观。筛选菜单、显示选项、Issue 属性菜单、通知操作和附件菜单均可从现有预览试用。
- Tooltip 使用同一工作区延迟、无箭头提示面板和快捷键键帽。按键、碰撞、尺寸、主题与参考界面的适配记录见[设计规范](DESIGN.md#共用菜单tooltip-与图标)。
- 8 项消费端 Chromium 用例通过。共用浮层用例验证延迟、快捷键、32 px 选项、8／12 px 圆角、Escape 归焦、375 px 边界、深色选中和减少动态效果。文档 251 项测试通过，文档与共享包类型检查无错误或警告，文档站与 Playground 生产构建通过。
- 临时 SvelteKit 项目通过 CLI 安装 Agent 区块及 Tooltip、Kbd 依赖。安装后的 115 个 Svelte 文件通过编译检查。

## Issue 活动与评论验收

- 在 Linear 的合成测试问题中实测首次创建记录、发表、编辑保存、放弃草稿和线程回复。设计与预览范围见[设计规范](DESIGN.md#issue-活动与评论)。
- Issue Detail 的 `activity` 属性由宿主管理。My issues 和 Inbox 接入同一组件，评论、回复和属性变更按问题 ID 保留在各自的预览会话。组件注册表和共享包入口继续使用 `issue-detail`。
- 共享包的 Chromium 回归覆盖评论格式和附件、键盘提交、放弃确认与焦点恢复、线程归属、状态变更，以及深色窄屏下同一问题的通知间切换。临时 SvelteKit 应用通过 CLI 安装更新后的 Inbox，130 个 Svelte 文件通过编译检查。

## Projects 时间线与跨列拖拽验收

- 在 Linear 中验证了缩放菜单、回到今天、带日期的项目与里程碑、无匹配项目时保留日期标尺，以及把合成项目拖到空的 Planned 列。 [设计规范](DESIGN.md#projects-时间线与跨列拖拽)
- 本地入口为 `/zh/themes/projects`，注册表入口为 `projects-01`，共享包为 `@valar/svelte-ui/blocks/projects-01`。列表、看板、时间线和详情共用项目状态及筛选，数据在当前预览会话内保留。
- 共享包的 Chromium 回归覆盖拖拽取消、鼠标与触屏跨列、键盘移动、焦点恢复、筛选空状态、缩放与回到今天、里程碑及 375 px 深色窄屏。临时 SvelteKit 项目通过 CLI 安装区块与拖拽依赖，原首页保留，114 个 Svelte 文件通过编译检查。

## Projects 排期、依赖线与保存视图验收

- 在项目详情编辑或清除开始与目标日期，三个视图使用同一份项目数据。在时间线里程碑浮层修改日期，菱形标记随即移动。
- 添加前置项目后时间线显示依赖线，改期时自动更新冲突状态。选择器排除循环依赖。保存的视图通过浏览器本地存储保留筛选、排序和显示选项。
- Chromium 验证基础组件的日和季度输入、双向日期限制与归焦，并验证项目和里程碑改期、依赖冲突和循环防护、重载后恢复视图，以及时间线与看板回归。5 项相关浏览器用例通过。

## Issue 订阅、回应与线程解决验收

- 使用已登录 Linear 的测试 Issue，验证自己的订阅切换、订阅者选择器、搜索并移除回应、折叠和展开已解决线程，以及重新打开。操作后恢复测试 Issue 的原状态。[设计规范](DESIGN.md#issue-订阅回应与线程解决)
- 通过 `issue-detail` 注册表入口和 `@valar/svelte-ui/issue-detail` 共享包使用。在 `/zh/themes/my-issues` 打开 VLR-103，或在 `/zh/themes/inbox` 打开 VLR-206 试用。订阅、回应和解决状态保存在当前预览会话。
- 共享包的 Chromium 回归验证订阅列表、订阅者搜索、键盘选表情、移除回应后的焦点、从回复解决线程、重新打开及 375 px 深色 Inbox 的同 Issue 状态。通过 CLI 安装 Inbox 区块与 Issue Detail，134 个 Svelte 文件通过编译检查。
