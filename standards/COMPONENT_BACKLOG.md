# Valar Svelte 组件补充清单

记录日期：2026-10-31。状态：本轮约定任务已完成并提交（提交 3c8580e），未发布或部署。

本清单承接此前对 React、Vue、Svelte 版组件的对比。用户随后要求“按顺序，全部完成后向我汇报结果”；本轮先修复测试与本地分发，再依次交付 Number Field、Tags Input、Stepper 和 Direction／RTL。完成判断仅针对记录中的能力合同，不声明来源库全 API 等价或全库认证。实际命令、环境、分发路径、浏览器结果和限制见[共享验收记录](porting-records/acceptance-2026-10-31.md)。

开始任何一项前，必须阅读[跨框架组件转换规范](COMPONENT_PORTING.md)，用[转换记录模板](templates/COMPONENT_PORTING_RECORD.md)建立独立记录；重新核对源项目当时的版本、许可、维护状态和本地已有能力，再确定实现方案。本清单不代替固定版本的源码分析。

## 0. 先决修复：已完成

- CLI 测试改为一次性执行；registry 模板测试不再跳过，覆盖从工程外传 `--cwd` 构建。
- `registry build` 按 `--cwd` 解析文件，不再错误地按启动进程的目录寻址。
- addon 生成 Valar 命令，使用本地 CLI，不从 npm 安装未发布的私有包；初始化 registry 不再把消费者的本地 CLI tarball 替换为 npm 依赖。
- fresh orb 的 nvm 加载顺序已修复；固定 Node／pnpm 初始化和重复运行通过。
- 安装说明、组件数量、示例、公共导出及 8 个 style 的 registry 已同步。

## 1. 组件与能力交付

初始核对范围为 `docs/src/lib/registry/ui/` 的组件目录与相关入口；前三项原先没有独立目录，本轮已新增。以下“完成”均指本地实现及约定验收，不代表已发布；用户未要求提交，故以源码路径和验收记录定位，不填写不存在的实现提交 SHA。

| 编号      | 项目                                                                                         | 实施顺序 | 当前状态                           | 交付及验收                                                                                                                  |
| --------- | -------------------------------------------------------------------------------------------- | -------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| VCOMP-001 | Number Field：数值输入                                                                       | 1        | 完成（本地）                       | [源码](../docs/src/lib/registry/ui/number-field/index.ts) · [能力差异与验收](porting-records/number-field-vue-to-svelte.md) |
| VCOMP-002 | Tags Input：标签输入                                                                         | 2        | 完成（本地）                       | [源码](../docs/src/lib/registry/ui/tags-input/index.ts) · [能力差异与验收](porting-records/tags-input-vue-to-svelte.md)     |
| VCOMP-003 | Stepper：步骤流程                                                                            | 3        | 完成（本地）                       | [源码](../docs/src/lib/registry/ui/stepper/index.ts) · [能力差异与验收](porting-records/stepper-vue-to-svelte.md)           |
| VCOMP-004 | Direction／RTL：方向支持                                                                     | 4        | 完成（评估、文档、代表组合与修复） | [用法](../docs/content/direction.md) · [能力缺口与验收](porting-records/direction-bits-ui-to-svelte.md)                     |
| VCOMP-005 | Slider Field：滑块 + 数值输入                                                                | 5        | 完成（本地，Valar 新增）           | [源码](../docs/src/lib/registry/ui/slider-field/index.ts) · [文档](../docs/content/components/slider-field.md)              |
| VCOMP-006 | Color Picker：颜色选择                                                                       | 6        | 完成（本地，Valar 新增）           | [源码](../docs/src/lib/registry/ui/color-picker/index.ts) · [文档](../docs/content/components/color-picker.md)              |
| VCOMP-007 | DialKit 剩余缺口：缓动／弹簧曲线、二维拖动板、时间线、版本缩略图、快捷键、浮动面板、图片选择 | —        | 待办（按需）                       | 对照与规则见[工作台说明](WORKBENCH.md)文末；有实际页面需要时再逐项补                                                        |

VCOMP-005／006 不是跨框架转换，而是为替代 DialKit 控件新增的 Valar 组件，验收以文档页“行为合同”和 `docs/tests/slider-field.test.ts` 为准。

### VCOMP-008 · TokenPlan 所需仪表与组合控件（2026-11-07）

- 本地新增 `gauge`、`waffle-chart`、`donut-chart`、`sparkline`、`ruler-slider`、`segmented-control`、`confirm-action`、`tick-meter`、`texture-fill` 九个公共子路径；原生 Svelte 5，复用 ToggleGroup、Button；现有 Slider 补齐键盘合同。RulerSlider 的移动尺带由组件内 RAF 实现，不引入 React/Motion/Arc 运行时。
- 来源为固定 TokenPlan 提交中的免费 MIT 组件及 DitherFill，保留各目录 LICENSE。TickMeter 仅按产品需求独立编写，60 条径向 SVG 线，未读取或搬运 Arc Pro 源码。
- 状态：本地实现及有限运行时验证已交付，**不声明完整来源能力等价**。此前静态尺带方案已被否决并替换：现保留移动尺带、惯性、边界回弹、轻点弹簧、横向滚轮、截住惯性与取消，正常／减少动态效果双侧验证。仅滚动数字不提供，应用明确使用 animateReadout=false。ConfirmAction 已补充独立编写的原生尺寸／圆角／内容反馈，不复制 Arc 动画代码或参数；实测和差异见转换记录 §8。
- 按集成回归补齐 fullWidth 空闲按钮的整行／44px 点击区域、原生 Spinner（减少动态效果时停止）、Confirm 初始焦点与 Shift+Tab 到 Cancel、Space 长按，以及 Slider 全方向／Shift／Page／Home／End 和修饰键穿透。TickMeter 按澄清后的要求夹紧 ARIA 数值，保留超限文字。
- 已通过共享包构建／类型（0 错误及警告）、共享包 2 项测试、docs 205 项测试（相关 49 项）、parity 111 项测试及类型检查、registry 801 项生成与九个组件的许可／依赖闭包断言，以及真实 React/Svelte 双侧 Chromium 147 的 7 个扩展场景（无运行时／资源错误）。应用侧 tarball 安装由主任务独立报告，最新修复需刷新 tarball，未在此重复集成。
- 新增控件未配置工作台调参面板，库存显式列出但不标为调参已覆盖。SSR/hydration、真实触屏与读屏尚未验证；完整记录及复现见[转换记录](porting-records/tokenplan-meters-react-to-svelte.md)。未提交、推送或发布。
- 后续补齐根容器零内缩的 fullWidth 空闲按钮（与区域宽差 <2px）、生成器不再裁掉普通字符串内的 Space，以及 WebKit 默认键盘偏好下 Button 显式 tabindex=0（覆盖值／禁用保持正确）。新一轮 22 项双侧尺带浏览器场景和 16 项确认／焦点组合详见转换记录；来源的滚动中外部重置竞争与 WebKit Cancel 跳过单独记录，不冒充目标回归。
- 2026-11-08 独立 ConfirmAction 形变续作：共享包先构建／类型通过，保留双侧 176 条实际状态时间线，44 项正常动效预算均不慢于未改来源，另有 4 项快速取消／实时减少动态效果验证。容器 120ms、内容进入 80ms／退出 60ms；实测总时长紧凑 121–142ms、整行 121–149ms，来源分别 242–449ms／162–240ms。该项明确为有意视觉适配，**不是等价通过**；保持焦点、单一播报与操作即时响应，证据见转换记录 §8。

前三项优先参考此前讨论的 Vue 版对应组件行为，最终使用适合 Svelte 的原生实现。Direction／RTL 作为跨组件能力评估，不因缺少同名目录就认定完全不支持 RTL，也不机械复制其他框架的 Provider。

### VCOMP-001 · Number Field

- 明确编辑文本与数值模型、空值、默认值、受控／非受控及外部更新。
- 支持约定范围内的 min/max/step、小数、负数、步进和地区格式；说明精度处理方式。
- 保留输入中的负号、小数点等中间状态，明确解析、校验和规范化发生的时机。
- 覆盖粘贴、键盘、禁用／只读、错误提示、无障碍语义和表单提交／重置。
- 首批示例：基础步进、小数与范围限制、空值与无效值、表单集成；金额或百分比格式作为能力评估项，不能未实现就承诺支持。
- 关键验收：连续编辑不会跳值或丢字符，边界和精度符合合同，显示值与提交值有明确关系。

### VCOMP-002 · Tags Input

- 分离输入文本与已选标签，定义受控更新、添加／删除事件及值序列化。
- 明确重复、空值、数量上限、分隔符、粘贴多项和自定义校验规则。
- 覆盖中文输入法确认、Backspace 删除、方向键导航、删除后的焦点、禁用／只读。
- 首批示例：基础标签、校验与数量限制、表单提交；候选建议作为后续组合能力评估，不默认捆绑自动完成组件。
- 关键验收：输入法 Enter 不误加标签，键盘可完成添加与删除，外部更新和表单值一致。

### VCOMP-003 · Stepper

- 定义当前、完成、错误、禁用／不可到达的步骤状态，以及受控当前步骤。
- 明确线性／自由导航、下一步校验、异步等待、失败、重复点击和回退行为。
- 定义步骤与内容的语义关联、焦点转移，以及动态增删步骤后的当前项处理。
- 首批示例：基础流程、带校验的多步表单、异步失败与重试；验证窄屏、横向／纵向布局的适用方案。
- 关键验收：不能绕过必需校验，旧异步结果不能错误推进，回退时的数据保留责任明确，不把静态进度展示当作流程实现。

### VCOMP-004 · Direction／RTL

- 核查目标版本原语对 `dir`、上下文和嵌套覆盖的支持，先写能力缺口报告。
- 检查逻辑方向样式、图标、方向键、弹层对齐、滚动与混合方向内容。
- 验证页面方向与局部方向的继承、动态切换及 SSR 首屏一致性；保留代码块等确需 LTR 的局部内容。
- 交付方向用法文档与代表性组件示例；只有发现封装缺口才新增组件，避免两套方向状态相互冲突。
- 关键验收：选择具有不同交互的代表性组件，证明视觉方向、键盘行为和弹层位置符合各自语义；不以全局加一条 `direction: rtl` 作为完成依据。

## 2. 已有对应项：先核对能力，不重复新增

这些项目已核对本地入口、底层接口和现有示例，未发现需要为名称对齐重复新增一套组件的依据。此项是源码／接口审查，不是三个现有系统的全面运行时回归；存在对应实现不代表来源行为完全等价。

| 对比项    | 本地对应实现                                                                                                | 本轮核对结果                                                                                                                                                          |
| --------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pin Input | [Input OTP](../docs/src/lib/registry/ui/input-otp/input-otp.svelte)，Bits UI 2.20.0 PinInput                | RootProps 原样透传，底层具备 pasteTransformer、maxlength、onComplete、one-time-code；已有 pattern/controlled/disabled/form 示例，不重复新增。真实自动填充与读屏未验证 |
| Toast     | [Sonner](../docs/src/lib/registry/ui/sonner/index.ts)，svelte-sonner 1.2.1                                  | ToasterProps 透传、队列及 dismiss/action/promise 由原依赖提供，底层 polite live region；已有 types/promise 示例，不引入第二套通知系统。真实播报未验证                 |
| Form      | [Form](../docs/src/lib/registry/ui/form/index.ts)，另有 [Field](../docs/src/lib/registry/ui/field/index.ts) | Formsnap/Superforms 管状态、校验与 ARIA，Field 管布局；Control/FieldErrors 透传语义，已有 forms 指南，不列为缺失组件。不声明所有业务表单均已验收                      |

选择来源时还要核对其是否已废弃、改名或被替代；不要为了补齐历史名称而新增已被替代的设计。

## 3. 每项的实施与完成规则

1. 领取待办时将状态改为“分析中”，记录执行者、来源固定版本及转换记录链接。不要仅凭本清单开始翻译模板或 CSS。
2. 分析阶段明确完整能力范围、目标原语选择、依赖与有意差异；不未经说明删减本清单中的目标。
3. 实现阶段同步组件、公共类型和导出、registry、示例与使用文档；遵循仓库当时的语言和主题约定。
4. 按转换规范逐项验收，并通过实际分发路径在独立消费者中验证。测试记录保存在转换记录中，本清单只维护摘要和入口。
5. 必要能力或验证仍缺失时写“部分实现”或“待验证”；只有满足约定范围才改为“完成”，附实现提交和验收记录。有意不做的项目记录理由和范围依据。

后续出现新的跨框架差异时追加稳定编号，先区分“真实缺失、已有等价实现、能力差异、待评估”，再安排工作。不要把本清单当成上游组件目录永远不变的完整快照。
