---
title: 注册表区块
description: 安装 78 个 Svelte 注册表区块，或打开相应的原生 React 和 Vue 模板。
---

## 安装 Svelte 区块

本清单覆盖 Valar 区块预览索引中的 78 个条目。六个[共享业务场景](/docs/ai-elements)另有文档；不在区块预览索引中的图表示例也不列在这里。

1. 按照 [Svelte 安装指南](/docs/installation)准备 Svelte 5 / Tailwind CSS 4 项目，启动本地 Valar 注册表，并初始化 `components.json`。
2. 点击 **Svelte 安装名与预览**列中的名称查看区块。在 Valar 仓库根目录运行以下命令，将 `BLOCK_ID` 替换为该列中的确切名称。

```sh
pnpm --filter @valar/svelte-cli start add BLOCK_ID --cwd /absolute/path/to/your-app
```

CLI 会复制区块及其注册表依赖。可在文档站查看 `/registry/styles/valar/BLOCK_ID.json`（或仓库 `docs/static/` 下的对应文件），确认文件目标路径和所声明的依赖。单文件示例写入配置的组件目录；对于 SvelteKit，`registry:page` 文件写入 `src/routes`，其他 Svelte 项目则写入组件目录，需自行挂载到路由。不同变体可能共用 `app-sidebar.svelte`、`login-form.svelte` 等文件名；同时安装多个变体时，请先确认 CLI 的覆盖提示。按需替换示例路由、数据及 `/placeholder.svg`、`/favicon.svg` 等站点根目录资源。

**React 和 Vue 链接打开相应区块的原生预览、可复制源码及本地包安装说明。** 下表的行为列说明 Svelte 源区块；原生模板使用目标框架的 API 与示例数据，不保证逐像素一致。Svelte CLI 不安装 React 或 Vue 代码。

## 日历与日期输入

Svelte 文档：[日历](/docs/components/calendar)、[范围日历](/docs/components/range-calendar)和[日期选择器](/docs/components/date-picker)。也可浏览[日历区块](/blocks/calendar)。React 使用 `Date` 和 `from` / `to`；Vue 使用 `DateValue` 和 `start` / `end`。

| Svelte 安装名与预览                | Svelte 区块实际行为                                                  | 原生模板                                                                                                  |
| ---------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| [`calendar-01`](/view/calendar-01) | 在单月日历中选择一个日期。                                           | [React](/block-templates/calendar-01?framework=react) · [Vue](/block-templates/calendar-01?framework=vue) |
| [`calendar-02`](/view/calendar-02) | 在同时显示的两个月中选择一个日期。                                   | [React](/block-templates/calendar-02?framework=react) · [Vue](/block-templates/calendar-02?framework=vue) |
| [`calendar-03`](/view/calendar-03) | 在两个月中最多选择五个独立日期。                                     | [React](/block-templates/calendar-03?framework=react) · [Vue](/block-templates/calendar-03?framework=vue) |
| [`calendar-04`](/view/calendar-04) | 在单月日历中选择日期范围。                                           | [React](/block-templates/calendar-04?framework=react) · [Vue](/block-templates/calendar-04?framework=vue) |
| [`calendar-05`](/view/calendar-05) | 在同时显示的两个月中选择日期范围。                                   | [React](/block-templates/calendar-05?framework=react) · [Vue](/block-templates/calendar-05?framework=vue) |
| [`calendar-06`](/view/calendar-06) | 选择至少五天的日期范围。                                             | [React](/block-templates/calendar-06?framework=react) · [Vue](/block-templates/calendar-06?framework=vue) |
| [`calendar-07`](/view/calendar-07) | 在两个月中选择范围，限 2–20 天。                                     | [React](/block-templates/calendar-07?framework=react) · [Vue](/block-templates/calendar-07?framework=vue) |
| [`calendar-08`](/view/calendar-08) | 禁用单月日历中早于指定下限的日期。                                   | [React](/block-templates/calendar-08?framework=react) · [Vue](/block-templates/calendar-08?framework=vue) |
| [`calendar-09`](/view/calendar-09) | 在两个月中选择范围，周末不可选。                                     | [React](/block-templates/calendar-09?framework=react) · [Vue](/block-templates/calendar-09?framework=vue) |
| [`calendar-10`](/view/calendar-10) | 点击日历下方的「今天」按钮，选中本地当天日期。                       | [React](/block-templates/calendar-10?framework=react) · [Vue](/block-templates/calendar-10?framework=vue) |
| [`calendar-11`](/view/calendar-11) | 只允许在六月和七月内选择日期范围。                                   | [React](/block-templates/calendar-11?framework=react) · [Vue](/block-templates/calendar-11?framework=vue) |
| [`calendar-12`](/view/calendar-12) | 切换卡片文案及双月范围日历的语言。                                   | [React](/block-templates/calendar-12?framework=react) · [Vue](/block-templates/calendar-12?framework=vue) |
| [`calendar-13`](/view/calendar-13) | 在年月、仅月份、仅年份三种下拉标题之间切换。                         | [React](/block-templates/calendar-13?framework=react) · [Vue](/block-templates/calendar-13?framework=vue) |
| [`calendar-14`](/view/calendar-14) | 将已预订日期标为不可选，并显示删除线。                               | [React](/block-templates/calendar-14?framework=react) · [Vue](/block-templates/calendar-14?framework=vue) |
| [`calendar-15`](/view/calendar-15) | 在日历每行开头显示 ISO 周数。                                        | [React](/block-templates/calendar-15?framework=react) · [Vue](/block-templates/calendar-15?framework=vue) |
| [`calendar-16`](/view/calendar-16) | 日历卡片下方纵向排列带标签的开始与结束时间输入。                     | [React](/block-templates/calendar-16?framework=react) · [Vue](/block-templates/calendar-16?framework=vue) |
| [`calendar-17`](/view/calendar-17) | 日历卡片下方并排显示开始与结束时间输入。                             | [React](/block-templates/calendar-17?framework=react) · [Vue](/block-templates/calendar-17?framework=vue) |
| [`calendar-18`](/view/calendar-18) | 在响应式断点调整日历单元格尺寸。                                     | [React](/block-templates/calendar-18?framework=react) · [Vue](/block-templates/calendar-18?framework=vue) |
| [`calendar-19`](/view/calendar-19) | 通过从「今天」到「两周后」的预设快速选日期。                         | [React](/block-templates/calendar-19?framework=react) · [Vue](/block-templates/calendar-19?framework=vue) |
| [`calendar-20`](/view/calendar-20) | 选择可用日期和预设会议时段，显示示例预订摘要，不会实际预订。         | [React](/block-templates/calendar-20?framework=react) · [Vue](/block-templates/calendar-20?framework=vue) |
| [`calendar-21`](/view/calendar-21) | 在范围日历单元格内显示工作日与周末的不同价格。                       | [React](/block-templates/calendar-21?framework=react) · [Vue](/block-templates/calendar-21?framework=vue) |
| [`calendar-22`](/view/calendar-22) | 在弹出面板中选择出生日期，禁止未来日期，选中即关闭。                 | [React](/block-templates/calendar-22?framework=react) · [Vue](/block-templates/calendar-22?framework=vue) |
| [`calendar-23`](/view/calendar-23) | 在弹出面板中选择起止日期，并将范围显示在触发按钮上。                 | [React](/block-templates/calendar-23?framework=react) · [Vue](/block-templates/calendar-23?framework=vue) |
| [`calendar-24`](/view/calendar-24) | 弹出式日期选择器旁配一个时间输入。                                   | [React](/block-templates/calendar-24?framework=react) · [Vue](/block-templates/calendar-24?framework=vue) |
| [`calendar-25`](/view/calendar-25) | 选择一个日期，并填写当天的起止时间。                                 | [React](/block-templates/calendar-25?framework=react) · [Vue](/block-templates/calendar-25?framework=vue) |
| [`calendar-26`](/view/calendar-26) | 分别选择入住、退房日期和时间；退房早于入住的日期不可选。             | [React](/block-templates/calendar-26?framework=react) · [Vue](/block-templates/calendar-26?framework=vue) |
| [`calendar-27`](/view/calendar-27) | 按包含首尾日期的区间筛选每日访客柱状图。                             | [React](/block-templates/calendar-27?framework=react) · [Vue](/block-templates/calendar-27?framework=vue) |
| [`calendar-28`](/view/calendar-28) | 在常驻输入框键入日期，或从弹出的日历选取。                           | [React](/block-templates/calendar-28?framework=react) · [Vue](/block-templates/calendar-28?framework=vue) |
| [`calendar-29`](/view/calendar-29) | 用 `chrono-node` 解析 “In 2 days” 等自然语言，与弹出日历同步。       | [React](/block-templates/calendar-29?framework=react) · [Vue](/block-templates/calendar-29?framework=vue) |
| [`calendar-30`](/view/calendar-30) | 使用 `little-date` 格式化弹出面板中选中的日期范围。                  | [React](/block-templates/calendar-30?framework=react) · [Vue](/block-templates/calendar-30?framework=vue) |
| [`calendar-31`](/view/calendar-31) | 在带格式化时段的静态活动列表上方显示所选日期；添加活动按钮仅作展示。 | [React](/block-templates/calendar-31?framework=react) · [Vue](/block-templates/calendar-31?framework=vue) |
| [`calendar-32`](/view/calendar-32) | 在移动端抽屉中选择出生日期，选中后关闭。                             | [React](/block-templates/calendar-32?framework=react) · [Vue](/block-templates/calendar-32?framework=vue) |

## 侧边栏局部示例

[Svelte 侧边栏指南](/docs/components/sidebar)演示了这些构件的用法。

| Svelte 安装名与预览                                                      | Svelte 区块实际行为                                                | 原生模板                                                                                                                                        |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| [`demo-sidebar`](/view/demo-sidebar)                                     | 带分组链接、内容区和触发按钮的基础侧边栏。                         | [React](/block-templates/demo-sidebar?framework=react) · [Vue](/block-templates/demo-sidebar?framework=vue)                                     |
| [`demo-sidebar-controlled`](/view/demo-sidebar-controlled)               | 通过外部按钮切换 Provider 的展开状态。                             | [React](/block-templates/demo-sidebar-controlled?framework=react) · [Vue](/block-templates/demo-sidebar-controlled?framework=vue)               |
| [`demo-sidebar-footer`](/view/demo-sidebar-footer)                       | 从侧边栏页脚向上弹出账户菜单。                                     | [React](/block-templates/demo-sidebar-footer?framework=react) · [Vue](/block-templates/demo-sidebar-footer?framework=vue)                       |
| [`demo-sidebar-group`](/view/demo-sidebar-group)                         | 在侧边栏内将链接归入带标签的分组。                                 | [React](/block-templates/demo-sidebar-group?framework=react) · [Vue](/block-templates/demo-sidebar-group?framework=vue)                         |
| [`demo-sidebar-group-action`](/view/demo-sidebar-group-action)           | 点击分组标题旁的按钮并弹出提示。                                   | [React](/block-templates/demo-sidebar-group-action?framework=react) · [Vue](/block-templates/demo-sidebar-group-action?framework=vue)           |
| [`demo-sidebar-group-collapsible`](/view/demo-sidebar-group-collapsible) | 展开或折叠整个侧边栏分组。                                         | [React](/block-templates/demo-sidebar-group-collapsible?framework=react) · [Vue](/block-templates/demo-sidebar-group-collapsible?framework=vue) |
| [`demo-sidebar-header`](/view/demo-sidebar-header)                       | 从侧边栏页眉打开工作区下拉菜单。                                   | [React](/block-templates/demo-sidebar-header?framework=react) · [Vue](/block-templates/demo-sidebar-header?framework=vue)                       |
| [`demo-sidebar-icon`](/view/demo-sidebar-icon)                           | 将工作区侧边栏折叠为图标；布局含团队、项目、子菜单和账户下拉菜单。 | [React](/block-templates/demo-sidebar-icon?framework=react) · [Vue](/block-templates/demo-sidebar-icon?framework=vue)                           |
| [`demo-sidebar-menu`](/view/demo-sidebar-menu)                           | 显示不嵌套的项目链接列表。                                         | [React](/block-templates/demo-sidebar-menu?framework=react) · [Vue](/block-templates/demo-sidebar-menu?framework=vue)                           |
| [`demo-sidebar-menu-action`](/view/demo-sidebar-menu-action)             | 从菜单行的次要操作按钮打开下拉菜单。                               | [React](/block-templates/demo-sidebar-menu-action?framework=react) · [Vue](/block-templates/demo-sidebar-menu-action?framework=vue)             |
| [`demo-sidebar-menu-badge`](/view/demo-sidebar-menu-badge)               | 在链接旁显示计数。                                                 | [React](/block-templates/demo-sidebar-menu-badge?framework=react) · [Vue](/block-templates/demo-sidebar-menu-badge?framework=vue)               |
| [`demo-sidebar-menu-collapsible`](/view/demo-sidebar-menu-collapsible)   | 展开菜单项以显示嵌套链接。                                         | [React](/block-templates/demo-sidebar-menu-collapsible?framework=react) · [Vue](/block-templates/demo-sidebar-menu-collapsible?framework=vue)   |
| [`demo-sidebar-menu-sub`](/view/demo-sidebar-menu-sub)                   | 显示常驻的嵌套子菜单。                                             | [React](/block-templates/demo-sidebar-menu-sub?framework=react) · [Vue](/block-templates/demo-sidebar-menu-sub?framework=vue)                   |

## 完整侧边栏布局

[侧边栏区块库](/blocks/sidebar)提供完整的 Svelte 布局。

| Svelte 安装名与预览              | Svelte 区块实际行为                                                | 原生模板                                                                                                |
| -------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| [`sidebar-01`](/view/sidebar-01) | 分区链接、版本切换器和搜索表单组成的文档布局。                     | [React](/block-templates/sidebar-01?framework=react) · [Vue](/block-templates/sidebar-01?framework=vue) |
| [`sidebar-02`](/view/sidebar-02) | 带可折叠分区、版本切换器和搜索表单的文档布局。                     | [React](/block-templates/sidebar-02?framework=react) · [Vue](/block-templates/sidebar-02?framework=vue) |
| [`sidebar-03`](/view/sidebar-03) | 带常驻嵌套链接的文档导航。                                         | [React](/block-templates/sidebar-03?framework=react) · [Vue](/block-templates/sidebar-03?framework=vue) |
| [`sidebar-04`](/view/sidebar-04) | 带常驻子菜单的浮动侧边栏。                                         | [React](/block-templates/sidebar-04?framework=react) · [Vue](/block-templates/sidebar-04?framework=vue) |
| [`sidebar-05`](/view/sidebar-05) | 文档侧边栏含搜索框和用加减号展开折叠的子菜单。                     | [React](/block-templates/sidebar-05?framework=react) · [Vue](/block-templates/sidebar-05?framework=vue) |
| [`sidebar-06`](/view/sidebar-06) | 带下拉子菜单和简报订阅卡片的侧边栏。                               | [React](/block-templates/sidebar-06?framework=react) · [Vue](/block-templates/sidebar-06?framework=vue) |
| [`sidebar-07`](/view/sidebar-07) | 可折叠为图标的应用侧边栏，含团队切换器、项目和账户菜单。           | [React](/block-templates/sidebar-07?framework=react) · [Vue](/block-templates/sidebar-07?framework=vue) |
| [`sidebar-08`](/view/sidebar-08) | inset 应用侧边栏，含主导航、次级导航、项目和账户菜单。             | [React](/block-templates/sidebar-08?framework=react) · [Vue](/block-templates/sidebar-08?framework=vue) |
| [`sidebar-09`](/view/sidebar-09) | 在外层侧边栏中并排放置邮件图标栏和消息列表栏，含搜索框和未读开关。 | [React](/block-templates/sidebar-09?framework=react) · [Vue](/block-templates/sidebar-09?framework=vue) |
| [`sidebar-10`](/view/sidebar-10) | 工作区导航含收藏项，页眉操作弹出面板里另有一个紧凑侧边栏。         | [React](/block-templates/sidebar-10?framework=react) · [Vue](/block-templates/sidebar-10?framework=vue) |
| [`sidebar-11`](/view/sidebar-11) | 在侧边栏中显示可递归折叠的文件树。                                 | [React](/block-templates/sidebar-11?framework=react) · [Vue](/block-templates/sidebar-11?framework=vue) |
| [`sidebar-12`](/view/sidebar-12) | 将日历、可折叠的日历列表和账户菜单放入侧边栏。                     | [React](/block-templates/sidebar-12?framework=react) · [Vue](/block-templates/sidebar-12?framework=vue) |
| [`sidebar-13`](/view/sidebar-13) | 在对话框中将设置导航和可滚动内容并排放置。                         | [React](/block-templates/sidebar-13?framework=react) · [Vue](/block-templates/sidebar-13?framework=vue) |
| [`sidebar-14`](/view/sidebar-14) | 将目录侧边栏移到右侧。                                             | [React](/block-templates/sidebar-14?framework=react) · [Vue](/block-templates/sidebar-14?framework=vue) |
| [`sidebar-15`](/view/sidebar-15) | 左侧为工作区导航，大屏幕右侧另有粘性定位的日历栏。                 | [React](/block-templates/sidebar-15?framework=react) · [Vue](/block-templates/sidebar-15?framework=vue) |
| [`sidebar-16`](/view/sidebar-16) | 内容上方有全宽粘性页眉，含侧边栏触发按钮、面包屑和搜索。           | [React](/block-templates/sidebar-16?framework=react) · [Vue](/block-templates/sidebar-16?framework=vue) |

## 登录、注册与验证码

Svelte 区块库：[登录](/blocks/login)、[注册](/blocks/sign-up)和[验证码](/blocks/otp)。这些是界面模板，不是认证后端。React 和 Vue 模板通过 `onSubmit` 交付表单数据，通过 `onAction` 交付第三方登录、找回密码与重发等操作；未接入时只显示本地反馈。

| Svelte 安装名与预览            | Svelte 区块实际行为                                                 | 原生模板                                                                                              |
| ------------------------------ | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| [`login-01`](/view/login-01)   | 居中的邮箱与密码登录卡片，含找回密码链接和 Google 按钮。            | [React](/block-templates/login-01?framework=react) · [Vue](/block-templates/login-01?framework=vue)   |
| [`login-02`](/view/login-02)   | 邮箱、密码和 GitHub 按钮旁有大屏插图。                              | [React](/block-templates/login-02?framework=react) · [Vue](/block-templates/login-02?framework=vue)   |
| [`login-03`](/view/login-03)   | 柔和底色上的品牌卡片，Apple / Google 按钮排列在邮箱和密码字段上方。 | [React](/block-templates/login-03?framework=react) · [Vue](/block-templates/login-03?framework=vue)   |
| [`login-04`](/view/login-04)   | 同一张分栏卡片内含邮箱、密码、三个第三方按钮和插图。                | [React](/block-templates/login-04?framework=react) · [Vue](/block-templates/login-04?framework=vue)   |
| [`login-05`](/view/login-05)   | 无卡片、仅填写邮箱的登录页，提供 Apple 和 Google 选项。             | [React](/block-templates/login-05?framework=react) · [Vue](/block-templates/login-05?framework=vue)   |
| [`signup-01`](/view/signup-01) | 居中的注册卡片，含姓名、邮箱、密码及确认字段和 Google 按钮。        | [React](/block-templates/signup-01?framework=react) · [Vue](/block-templates/signup-01?framework=vue) |
| [`signup-02`](/view/signup-02) | 姓名、邮箱、密码及确认字段和 GitHub 按钮旁有插图。                  | [React](/block-templates/signup-02?framework=react) · [Vue](/block-templates/signup-02?framework=vue) |
| [`signup-03`](/view/signup-03) | 品牌注册卡片内并排显示密码和确认字段。                              | [React](/block-templates/signup-03?framework=react) · [Vue](/block-templates/signup-03?framework=vue) |
| [`signup-04`](/view/signup-04) | 分栏卡片内有邮箱、成对密码字段、三个第三方按钮与插图。              | [React](/block-templates/signup-04?framework=react) · [Vue](/block-templates/signup-04?framework=vue) |
| [`signup-05`](/view/signup-05) | 无卡片、仅填写邮箱的注册页，提供 Apple 和 Google 选项。             | [React](/block-templates/signup-05?framework=react) · [Vue](/block-templates/signup-05?framework=vue) |
| [`otp-01`](/view/otp-01)       | 居中的验证码卡片，包含一组六格、验证和重发控件。                    | [React](/block-templates/otp-01?framework=react) · [Vue](/block-templates/otp-01?framework=vue)       |
| [`otp-02`](/view/otp-02)       | 验证码分为三组，每组两格，大屏旁边有插图。                          | [React](/block-templates/otp-02?framework=react) · [Vue](/block-templates/otp-02?framework=vue)       |
| [`otp-03`](/view/otp-03)       | 柔和底色上的品牌验证码卡片，包含一组六格。                          | [React](/block-templates/otp-03?framework=react) · [Vue](/block-templates/otp-03?framework=vue)       |
| [`otp-04`](/view/otp-04)       | 在带插图的分栏卡片中放置两组三格及验证和重发控件。                  | [React](/block-templates/otp-04?framework=react) · [Vue](/block-templates/otp-04?framework=vue)       |
| [`otp-05`](/view/otp-05)       | 无卡片的品牌表单，含两组大尺寸输入格及验证和重发控件。              | [React](/block-templates/otp-05?framework=react) · [Vue](/block-templates/otp-05?framework=vue)       |

## 仪表板与组件展示

| Svelte 安装名与预览                            | Svelte 区块实际行为                                                                            | 原生模板                                                                                                              |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| [`dashboard-01`](/view/dashboard-01)           | 将 inset 侧边栏、指标卡、按时段筛选的面积图、可选行和拖动排序的数据表及详情抽屉组合成一页。    | [React](/block-templates/dashboard-01?framework=react) · [Vue](/block-templates/dashboard-01?framework=vue)           |
| [`new-components-01`](/view/new-components-01) | 在响应式网格中展示字段与外观设置、嵌套按钮组和输入组、选项卡片、提示词表单、空状态和加载图标。 | [React](/block-templates/new-components-01?framework=react) · [Vue](/block-templates/new-components-01?framework=vue) |
