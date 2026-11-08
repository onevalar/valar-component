# First Batch：Valar Svelte → Native React Alignment

> 最新集成结论（2026-11-08）：[三框架第一批验收](first-batch-frameworks.md)已完成工作区 30/30、独立 tarball 消费者重复场景 29/29，包含明暗截图、键盘/焦点、图表与分发检查。以下各节保留实现阶段的有界验证历史，“待 parent”不代表该集成检查仍未执行；SSR/hydration、真实触屏/读屏等缺口仍按最终记录保留。本批未提交、推送或发布。

## 1. 基本信息与范围

| 项目               | 内容                                                                                                                  |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| 采用的规范版本     | COMPONENT_PORTING.md 1.0                                                                                              |
| 状态               | 待验证：实现、构建、类型和局部公开行为 smoke 已通过；未独立审阅，未声明跨框架验收通过                                 |
| 日期、执行者       | 2026-11-08；React package/preview implementation agent                                                                |
| 用户需求及范围依据 | 已批准的首批三框架对齐；reuse-first，非重新编写原语                                                                   |
| 来源仓库、文件路径 | shadcn-ui/ui，apps/v4/registry/bases/radix/ui/{button,input,checkbox,select,dialog,calendar,slider,chart,popover}.tsx |
| 来源提交           | 42f3bb63b46a69e52a24bd005cdc9ec15ba7a7b9；本机固定 clone 已核对 HEAD                                                  |
| 许可               | MIT，保留 packages/react-ui/LICENSE 与 NOTICE.md；不引入原站 Next 文档运行时                                          |
| 目标               | React 19.2.3，Node 24.22.2，pnpm 12.14.0，Vite 7，TypeScript 6                                                        |
| 原语和选择         | 安装实测 Radix UI 1.8.1 / react-day-picker 9.14.0 / Recharts 3.8.0；沿用上游原生引擎，不加载 Svelte 运行时            |
| 等价方案检查       | packages/ui 为 Svelte SDK；无现有 React SDK；直接复用固定 React 上游                                                  |
| 视觉范围           | 使用同一 Valar style map 和主题生成器；不复制全局 token；Calendar 36px 几何、popover 月/年选择与现行 Svelte 对齐      |
| 支持范围           | 本地现代浏览器 comparison fixture；跨浏览器、SSR/hydration、独立 tarball 验收待执行                                   |

## 2. 能力对照（实现前合同）

| 来源能力／行为                                               | 目标行为／API                                                          | 实现位置及依赖                                | 差异、理由与影响                                                                                                                                                                                            | 验证证据／缺口                                                                                                      |
| ------------------------------------------------------------ | ---------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Button 原生 props、ref、asChild、variants                    | 保留；增加 shape 与 href；默认 type=button，禁用 link 不导航           | src/button.tsx，Radix Slot/cva                | Valar 有意差异；icon 默认为圆形，可 shape=square                                                                                                                                                            | public-contract.test.ts SSR 属性通过；实际 link 点击待父验收                                                        |
| Input 原生编辑与表单属性                                     | 保留 input props/ref                                                   | src/input.tsx                                 | 无意图差异                                                                                                                                                                                                  | SSR Unicode/form 属性和浏览器填写/重置通过；IME 待验证                                                              |
| Checkbox checked/indeterminate、受控/非受控、表单            | 保留 Radix Root props/ref                                              | src/checkbox.tsx                              | 使用实际 Lucide 图标，不引入 docs IconPlaceholder                                                                                                                                                           | checked 提交和 reset smoke 通过；indeterminate 待验证                                                               |
| Select 全套组合、受控/非受控、键盘与焦点                     | 保留所有上游导出和 Radix props                                         | src/select.tsx                                | 本地化 fixture 标签，原生 string value；默认 popper/start，native side translation 留4px gap，允许覆盖                                                                                                      | 公共导出/初始提交与实际popup定位通过；完整键盘/焦点待验证                                                           |
| Dialog 全套组合、模态、焦点、Portal                          | 保留上游 exports/props；closeLabel 本地化                              | src/dialog.tsx                                | 默认关闭标签“关闭”，调用者可覆盖                                                                                                                                                                            | 公共导出/类型通过；弹层焦点待验证                                                                                   |
| Calendar DayPicker 完整 props、modes、components、formatters | 原生 DayPicker composition；RangeCalendar 使用 range mode              | src/calendar.tsx，src/range-calendar.tsx      | Date/DateRange 替代 Svelte DateValue；dropdown 月3×4、年份每页12个 popover；真实子组件按月/年DOM顺序组合，Intl年份含年；默认年份范围沿用Bits chooser；range使用native resetOnSelect=true默认，允许false覆盖 | SSR、2027-12-17实际选择、显式边界、Tab顺序、range重选/几何及浅/深中段accent computed style通过；完整约束/焦点待验证 |
| Slider native 多 thumb 数组 API                              | 保留；增加 type=single 的 scalar compatibility、thumbLabels、largeStep | src/slider.tsx，Radix                         | scalar 四箭头、Shift/Page 默认2×step、Home/End；使用公开 asChild surface 仅替换 scalar DOM keyboard handler，保留原生 pointer/form 引擎                                                                     | 浏览器四箭头/Shift/PageDown/Home/End、Alt bubbling 通过；多 thumb/拖动待验证                                        |
| Chart config、tooltip、legend、容器和原生图表组合            | 保留实际 Recharts exports/props                                        | src/chart.tsx                                 | fixture 使用真实 LineChart，domain [0,40]，chart-2，null 不连线                                                                                                                                             | 浏览器 path 两段（含0值）通过；tooltip/legend 等待验证                                                              |
| 主题和分发                                                   | 原生 TSX source dist、public subpaths、SDK 自有 theme.css              | scripts/build.ts，共享 scripts/valar-style.ts | build-only Svelte CLI/parity 不属于 runtime                                                                                                                                                                 | 13个 native source/style 产物、公共 imports、CSS扫描与consumer Vite build通过；独立 tarball 未验证                  |

## 3. 状态与集成设计

- 原生 primitives 继续拥有状态转换；React controlled 使用 value/onValueChange、checked/onCheckedChange、open/onOpenChange、DayPicker selected/onSelect。未承诺运行时切换控制模式。
- Preview 只从公共包导入；共用 framework-neutral fixture，状态彼此独立。
- Reset 触发实际 form reset，然后 remount fixture key 恢复受控值与原语内部状态；不是用假输出代替 reset。
- `reportReady("react")` 只在 React mount effect 后调用，使用 parent 所有的固定 origin 协议。
- 交互及键盘/focus/portal 由 Radix/DayPicker 负责，定制限于声明的 Valar 差异。
- 无网络、异步业务校验或分析服务；Chart 数据为固定公共 fixture。

## 4. 逐项验收

| 维度             | 适用性及理由                                | 场景                                                        | 实际结果                                                                                                                   |
| ---------------- | ------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 状态与数据       | 适用：所有交互控件                          | 默认/受控/外部更新/空值/禁用/reset                          | 局部通过：fixture 初值及外部原生 reset；其余未验证                                                                         |
| 表单语义         | 适用：input/checkbox/select/slider          | FormData、required/disabled、submit/reset                   | 局部通过：真实 FormData、disabled字段排除和 reset；required/invalid未验证                                                  |
| 键盘与焦点       | 适用                                        | 四箭头/Shift/Page/Home/End、Tab/Escape、dialog trap/restore | 局部通过：scalar 四箭头、Shift+Right、PageDown、Home/End，Alt+Left 不 prevent 且冒泡，caption月→年Tab顺序；其余未验证      |
| 无障碍           | 适用                                        | labels、thumb labels、states、焦点和辅助技术                | 未验证                                                                                                                     |
| 输入法与国际化   | 适用                                        | 中文输入、日期 locale、长文本、RTL                          | 局部通过：Unicode填写与中文caption格式；IME/长文本/RTL未验证                                                               |
| 触摸与指针       | 适用                                        | slider drag、calendar 点击、弹层外点击、取消                | 局部通过：calendar月/年选择、range点击；其余未验证                                                                         |
| 异步与生命周期   | 适用：原语 listener/Portal 清理；无业务请求 | remount、重复打开/关闭、StrictMode                          | 未验证                                                                                                                     |
| SSR 与 hydration | 适用：SDK 可被 SSR consumer 导入            | 无浏览器全局访问、稳定 ID、hydrate                          | 局部通过：公共 root 导入及 Button/Input/Calendar/RangeCalendar server render；hydration 未验证                             |
| 弹层与布局       | 适用                                        | caption/select/dialog portal、定位、嵌套、scroll lock       | 局部通过：实际caption popover及Select popper/start、4px gap；嵌套/scroll lock/dialog未验证                                 |
| 视觉与适配       | 适用                                        | 浅/深、36px calendar、响应式、缩放、reduced-motion          | 局部通过：真实day36×36px、390窄屏range额外12px几何、浅/深range accent、reduce preference smoke；双主题截图和完整对比未验证 |
| 性能与资源       | 适用                                        | 高频 slider 交互、chart resize、卸载资源                    | 未验证                                                                                                                     |
| 安全与隐私       | 适用：链接与 ChartStyle CSS config          | disabled links、可信开发者 config；无外传                   | 未验证                                                                                                                     |
| 类型与依赖       | 适用                                        | 公共类型、完整导出、直接依赖闭包                            | 通过：SDK 与 preview tsc，无运行时 Svelte imports；所有原上游 export 保留                                                  |
| 分发与集成       | 适用                                        | dist imports、CSS 扫描、独立打包消费者                      | 局部通过：public dist consumer Vite build；脱离 workspace 的 tarball 未验证                                                |

## 5. 验证环境与可重复证据

- macOS Darwin 27.2.0 arm64；Node 路径 `/Users/anvalar/.nvm/versions/node/v24.22.2/bin`，仅 command-local PATH。
- 原 clone SHA 已通过 `git rev-parse HEAD` 核对。未运行 dependency install（由 parent 负责）。
- 已安装版本：React/DOM 19.2.3、Radix UI 1.8.1、DayPicker 9.14.0、Recharts 3.8.0、cn 0.5.0、CVA 0.7.1、Lucide 0.474.0、tsx 4.21.0、TS 6.0.3、Vite 7.3.6、plugin-react 5.2.0、Geist 5.2.8。
- 局部浏览器 smoke 使用 headless Chrome 156.0.8078.80（本机已有），Playwright 来自 parent comparison tooling，reduce preference。输入法、辅助技术、独立 tarball consumer 尚未执行。
- 所有命令均使用 command-local Node24 PATH，没有自行安装、提交、推送或修改 root/lock/shared 文件。
- Preview：`npx --yes pnpm@12.14.0 --config.verifyDepsBeforeRun=false --filter @valar/react-preview dev`，端口5213；query `theme=light|dark&disabled=1`，浏览器 reduced-motion preference。

| 实际命令／步骤                                                                                                           | 结果（2026-11-08）                                                                         | 证据                                                                            |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| 在 packages/react-ui 执行 `node --import tsx scripts/build.ts`                                                           | 通过，13个 self-contained source/style 产物                                                | packages/react-ui/dist                                                          |
| 在 packages/react-ui 执行 `node node_modules/typescript/bin/tsc --noEmit`                                                | 通过                                                                                       | tsconfig.json、public test imports                                              |
| 在 packages/react-ui 执行 `node --import tsx --test test/*.test.ts`                                                      | 最终修正后通过，9/9，无跳过                                                                | test/public-contract.test.ts                                                    |
| 在 apps/react-preview 执行 `node node_modules/typescript/bin/tsc --noEmit` 后 `node node_modules/vite/bin/vite.js build` | 最终修正后通过；初次 font bare side-effect TS2882 已改为实际 index.css 后通过              | dist；Vite 明确警告单一 JS chunk 790.47kB（gzip247.10kB），未隐藏警告或调高阈值 |
| 本机 preview smoke：打开月份、选12月、打开年份、Escape                                                                   | 通过，月12项、年12项；选择实际改变 displayed month                                         | 公开组件真实 DOM；未留截图，不作为视觉证据                                      |
| 修正前 smoke：slider focus 后 Right/Up/Left/Down/Shift+Right/PageDown/Home/End                                           | 当时依次40/43/40/37/43/37/-20/80；parent发现最后80与Bits的79不符，已用下述公开回归修正     | 真实 output 更新，无 mock；不可作为End对齐验收                                  |
| 修正前 smoke：body keydown listener + Alt+Left                                                                           | 当时值保持80，body 收到 ArrowLeft 且 defaultPrevented=false                                | 未停止冒泡或篡改 KeyboardEvent                                                  |
| 修正前 smoke：填写名称🌱、勾选同意、提交                                                                                 | 当时JSON 为 {name:"名称🌱",agree:"on",provider:"claude",quota:"80"}；修正后回归提交quota79 | 原生 FormData                                                                   |
| 从页面外执行 `document.querySelector('form').reset()`                                                                    | name清空、checkbox false、slider37、form{}、calendar回11月12日；pageerror=[]               | 原生 reset 事件 + fixture key remount                                           |

## 6. 交付与结论

- 实现、公共导出和构建：`packages/react-ui/`；真实 fixture：`apps/react-preview/`。
- 来源及 MIT 保留：`packages/react-ui/LICENSE`、`NOTICE.md`，生成 source 保留来源 header。
- 共享 helper、fixtures、fixture CSS、对照 shell、依赖安装和最终跨框架 acceptance 由 parent 所有。
- 已知API差异：原生 Date/DateRange；calendar 不自带表单 name 提交。原先年在月前的差异已按parent要求通过真实组件DOM组合修正。DayPicker年份dropdown和navigation共用边界（Bits的chooser边界与无限制箭头独立），更大窗口需显式startMonth/endMonth。完整模式/约束、无障碍、视觉对照与独立 tarball 检查仍待 parent。
- 尚未执行的适用项目均为验证缺口，不得据编译通过宣称 parity 或完整转换。

## 7. Parent Browser Findings 的有界修正

- Scalar keyboard End 和上界步进现在停在最后一个允许的 min-anchored step：-20/80/3 →79；native array/multi-thumb键盘分支未改。
- Disabled Slider root不传name，避免Radix仍将隐藏input提交；没有替换pointer/form engine。
- 复查实际DOM：11/13日td原来透明，button为muted；中段td与button改为native range_middle/data-range-middle下的accent，端点仍primary。已对浅/深11–13日（含today）逐格验证computed style。
- Caption用公开DropdownNav组合实际native children，month先于year，Tab顺序一致；year用Intl numeric格式得到2026年，caller components/formatters保留最终覆盖权。
- Parent发现2026年12月后被DayPicker默认endMonth截断。已读Bits2.20的getDefaultYears：latest=max(initial view,current year)，默认latest-100至latest+10，旧view早于下限则改initial-10。Calendar仅在含年份dropdown且无显式边界时使用该范围；startMonth/endMonth及deprecated from/to边界仍优先。SSR验证两种calendar的默认未来年与显式限界，真实点击结果为2027-12-17，未改parent预期。
- RangeCalendar仅默认native resetOnSelect=true；已读安装版types/props.d.ts与selection/useRange.js，最低依赖改为^9.14.0；调用者可传false恢复DayPicker扩展已选区间行为。没有另写range算法。
- RangeCalendar按实际Svelte root/month/header/grid source采用p-3、36px header、mt-4与head/body gap-1：12px差由padding增加8px与grid gap增加4px组成。公开className/classNames/components最终覆盖保留，Calendar默认不变；无fixture CSS补丁。390px实际回归确认padding12/grid margin16/gap4/day36，range section比Calendar高12px。
- SelectContent默认native popper/start，上游side translation保留4px gap，caller覆盖仍有效；未加入Select End/Enter竞态补丁。
- Preview使用data favicon，无/favicon.ico请求。
- `test/public-regression.browser.ts`通过真实公共preview验证：End79、再次Right仍79、FormData79、Home-20；两个calendar的month/year文字和DOM/Tab顺序；真实2027-12-17选择与12项caption popovers；390px range几何；完整range点击18→新起点、22→完成、20→再次新起点；Select实际start对齐及4px gap；disabled真实FormData为{}；浅/深range中段accent；无pageerror/无favicon请求。
- 该回归使用本包显式声明的开发依赖 `@playwright/test` 1.62.0，正常公共导入，不引用 pnpm 内部路径；不作为 SDK 运行时依赖。运行：保持5213preview运行，在packages/react-ui执行`node --import tsx --test test/public-regression.browser.ts`，或scoped `test:browser`；可设置VALAR_TEST_BROWSER/VALAR_REACT_PREVIEW_URL。
- 最终scoped命令使用Node24.22.2与`npx --yes pnpm@12.14.0 --config.verifyDepsBeforeRun=false --filter <package> <script>`：react-ui check/test/test:browser、react-preview build通过。公开source/SSR合同测试9/9，公开browser回归1/1。窄屏回归最初在Select入场动画尚未结束时立即测x失败；改为与y同样语义poll定位（不改组件/不降低容差），重跑通过。完整production跨框架验收仍由parent执行；parent负责同步DayPicker最低版本的lockfile specifier。
