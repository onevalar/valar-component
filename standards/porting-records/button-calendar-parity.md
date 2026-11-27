# Button、Calendar 与 RangeCalendar：三框架基线复核

2026-11-26 · 采用[转换规范 v1.0](../COMPONENT_PORTING.md)。本轮处理首批三个失败用例，不是三个组件的全能力验收。来源是仓库 `cfd989c9` 的 Svelte [Button](../../docs/src/lib/registry/ui/button)、[Calendar](../../docs/src/lib/registry/ui/calendar)、[RangeCalendar](../../docs/src/lib/registry/ui/range-calendar)，以及[尺寸与交互复测](../LINEAR_ALIGNMENT.md#33-项基础组件尺寸复核)。保留既有 React/Radix/DayPicker 和 Vue/Reka API、许可证与来源，无新增运行时依赖；固定版本和来源见[首批记录](first-batch-frameworks.md#来源与维护方式)。

| 能力 | 复现与结论 | 本轮改动与公开入口 |
| --- | --- | --- |
| Button 独立文字、图标与焦点 | Svelte 默认文字为胶囊，React 和 Vue 实测均为 10 px 圆角，确属实现差异 | 两边复用同一文字尺寸组合类。`shape="square"`、图标默认主题圆角、显式 `pill` 及组内圆角规则保留。既有 `@valar/{react,vue}-ui/button` 使用示例不变。 |
| Calendar 年月切换 | Svelte 现为「月份／年份」combobox，不再是「选择月份」按钮。React/Vue 旧弹层以按钮网格每次展示 12 年，与实际基线不同 | 两边复用 Valar Select、设置表面和不超过 240 px 的滚动列表；DayPicker 仍控制日期和原生边界，Reka 仍以 `placeholder` 导航。选择年月不提交日期，选择或 Escape 后归焦。`calendar` 和 `range-calendar` 公共子路径与用法示例不变。 |
| Calendar 与 RangeCalendar 几何 | 36 px 来自旧测试，当前三边原本已是 28 px；改正断言后仍复现单月历日期列靠左、范围月历缺少分行 | 单月历下拉布局让星期和日期等列铺开；圆形日期按钮而不是宽列单元格负责选中背景。范围月历按内部宽度给下拉留出单独一行。Svelte 样式、三个 registry 和共享包入口未改。 |

## 验收边界

- Chromium 157，Linux orb，Node 24.22.2，pnpm 12.14.0。按 390 px 的真实对比页测量三个框架的两种月历根宽和日期位置，日期及年月触发器高 28 px，年月间距 8 px，普通月历箭头与下拉无重叠，范围月历在窄列中分行。另检查浅色 900 px 和深色 320 px 的默认、选中、年列表展开状态。图标、相邻箭头、月份和年份顺序保留；打开列表时滚动视口随各原语调整，不要求首屏显示同样的年份段。
- 浏览器用例覆盖 Enter/End 选月、指针选年、Escape、确认后归焦、中文日期/星期、选择 2027 年的日期、长年份列表、范围重选和切换月后保留区间；Button 覆盖默认/描边文字和图标圆角、点击、禁用和表单。React 保留自定义格式、组件覆盖及原生日期边界的静态合同。
- 未做完整变体认证：Button `loading` 不是本轮新增；Calendar 项目日期外观、全部自定义日期边界、多个可见月份、RTL、嵌套日期弹层、触屏、真实读屏与端到端 SSR/hydration 仍待覆盖。未改日期的持久化、异步或表单序列化；不适用输入法组合和外部数据访问。未发布或部署。

## 验收结果

- `pnpm --filter ./apps/framework-comparison exec playwright test`：三框架真实预览全套 38/38，通过原先失败的 Button 外形、Calendar 操作和日期布局断言。浅深主题截图分别复核 Button、单月历选中日期、范围月历及年份展开；React 录屏复核指针经过导航和年月控件、滚动年份后退出、用键盘切换到 12 月且已选日期不变。
- 两个原生包的类型检查通过。React 包合同测试 9/9、原生浏览器回归 1/1；Vue 包合同测试 5/5。React 合同另覆盖自定义年月无障碍名称。
- React/Vue 独立消费应用从打包 tarball 安装而不是引用工作区源码，分别完成类型和生产构建检查，加载构建后的预览执行 Button／Calendar 定向对照 5/5。
