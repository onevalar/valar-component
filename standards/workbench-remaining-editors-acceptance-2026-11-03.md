# E14：剩余十组件编辑器验收记录

**当前交付（2026-11-03）**：用户在本批验收后授权提交推送，E12–E14已统一推送至main：[f62fb33](https://github.com/onevalar/valar-svelte/commit/f62fb33b14de412d8901d40dfec2558368eff81b)，[远端CI全部通过](https://github.com/onevalar/valar-svelte/actions/runs/41600027003)。68／68组件编辑器接入完成。用户随后授权收尾并明确要求提交推送，验收见文末；收尾单独提交，其远端CI不沿用上述组件接入提交的结果。未发布包或部署站点。

日期：2026-11-03。工作线程：[E14](https://ampcode.com/threads/T-01a199a9-28fa-709a-8877-6fe766c7497e)。汇总：[并行成果与可视证据](https://ampcode.com/artifacts/e14-f12dd56b-85f0-4b4d-9bee-aaad9e8cf688)。

用户明确要求剩余10个组件继续接入，并授权并行实施，取代E13后的暂缓独立编辑器安排。四组独占实现，主线程统一集成入口、有限写回白名单、registry及运行验收；保留E12／E13成果，不扩旧Studio、不改用户编写的guides。

## 合同与边界

| 组 | 组件 | 可保存参数 | 不进入样式版本的内容 |
| --- | --- | --- | --- |
| A | Field | groupGap 0–48、fieldGap 0–32、contentGap 0–24，步长2 | 子Input／Checkbox大小、字号、校验规则；保留直接嵌套组的原gap例外 |
| A | Form | Field／ElementField内部itemSpacing 0–24，步长2 | 标签排版、子控件尺寸、业务schema；实际Formsnap／Superforms本地校验和reset |
| A | Label | 图文gap 0–24，步长2 | 全局字号、关联ID和子控件大小；不覆盖Field.Label调用方自带gap |
| B | Collapsible | 内容paddingX／paddingY 0–32，步长2 | 展开／禁用状态；默认0留白，不新增默认背景或边框 |
| B | Aspect Ratio | 圆角档位、clipping style／hidden／visible | 宽高比仅为场景；默认不设置圆角或裁切，圆角不隐式开启裁切 |
| B | Separator | 横向／纵向粗细1–8，步长1 | 方向、语义／装饰模式和全局边框色；1px档保持固定像素 |
| C | Resizable | 左右／上下分栏线宽1–4，步长1 | 分栏比例、方向、容器尺寸；保留原触摸命中区、把手与PaneForge键盘行为 |
| C | Scroll Area | 双向滚动条厚度6–24，步长2；滑块圆角档位 | 容器尺寸、滚动方向和位置；实际Bits滚动区域可键盘聚焦 |
| D | Message Scroller | Content gap／paddingX／paddingY 0–48，步长2 | 跟随、锚定、容器和消息子控件；历史／追加／新回合／本地stream为独立场景状态 |
| D | Marker | 三变体gap及border底部留白0–24，步长2 | 状态、日期、图标、全局排版；保留分隔伪线与真实child链接 |

Spacing数字为4px全局spacing基准下的标称px，预览和写回均跟随实际spacing，不把绝对像素预览冒充token工具类。全局token只读。十组件各有独立`valar.<component>-styles.v2`存储，严格校验有限值与partial overrides；缺少源或必要几何时抛错，不回退Nova。

## 集成决策

- 全部复用`ComponentTuner`，接入文档首例，支持草稿／对比、明暗、命名版本、恢复与开发站确认写回。Form使用现有`/docs/forms`，不创建平行表单文档。
- 仅在必要位置追加或后置几何锚点，调用方class仍放最后；不修改primitive或交互库。Label使用独立`cn-label-layout`，避免合并Sera旧`cn-label`时丢失`leading-relaxed`。Aspect Ratio、Collapsible和Separator使用独立geometry入口，避免激活旧映射造成默认外观变化。
- Message Scroller／Marker画布沿用文档Rhea，其余八个使用Nova；Vite转换规则为消息画布传递Rhea上下文。**八套源码读写通过，不代表八套画布均在浏览器运行。**
- 组件清单68项，普通示例有67个Tuner分支，Sidebar仍由独立block入口承载。`coverage.ready`描述旧Studio，不用它冒充文档编辑器覆盖。

## 验证

最终构建／单测／检查明确使用Node **24.22.2**、pnpm **12.14.0**。

| 检查 | 实际结果 |
| --- | --- |
| `pnpm build:cli` | 通过 |
| `pnpm test` | **756通过**：CLI282、parity110、primitives148、addon4、docs212；本批新增90项 |
| `pnpm check` | 全仓通过；docs／primitives为0 errors、0 warnings；124份中英合同通过 |
| `NODE_OPTIONS=--max-old-space-size=3072 CI=true pnpm build` | 通过，生成生产预览与registry |
| 定向Oxfmt／ESLint及`git diff --check` | 本批实现文件通过；不声称全仓lint消除了E12记录的既有格式问题 |
| 新增生产浏览器合同 | **14项通过**，覆盖十组件几何、版本恢复、对比与窄屏；Form校验／reset隔离、Label关联、折叠键盘／禁用、Separator语义、分栏键盘、滚动PageDown与消息stream |
| Node24构建的完整生产浏览器回归 | **90 passed、2 skipped，4.7分钟**；两个开发写回用例按配置跳过，本批十项真实UI写回另行执行 |
| 十组件开发站真实UI写回 | **10项通过**：真实确认POST200、精确CSS、重建registry、重开读取新基线；之后精确恢复本次测试写入并重建 |
| 实际CLI add | Nova安装8项、Rhea安装2项；**37个安装后的Svelte文件编译通过**；RULES与AGENTS托管规则落地 |
| 视觉 | 默认1440、改参并排1800、390px深色最大数字参数，共30张DPR2截图逐组审阅；真实指针Form录屏及5fps联系表已审阅 |

CLI验证使用独立临时Vite项目、`--no-deps-install --skip-preflight`，验证真实源码／规则安装与编译，**不冒称本批十组件分别构建并运行了十个独立消费者应用**。完整浏览器套件另包含既有独立tarball消费者严格check／build合同。

完整生产浏览器回归曾为89通过、2项开发写回默认跳过、1项语言切换波动：同构建前一轮语言切换通过，后一轮点击后仍停留英文页。未改该产品路径或放宽i18n断言，原因尚未证实，已另行建议修复。最终指定Node24构建后的完整回归为**90通过、2跳过**，不将这一轮通过宣称为已修复语言切换波动。

### 失败诊断与修正

1. 开发站初轮8通过／5失败，伴随新依赖优化及多次reload；不将所有失败直接归因于HMR。稳定生产中保留原断言，Field／Form／Scroller均通过。
2. Marker测试初次使用小写`border`定位，而实际DialKit可访问名为`Border`；仅修正测试定位，原几何／版本断言保持并通过。
3. Forms新增版本选择器后，旧移动搜索合同的全页`combobox`定位匹配两个元素。定位限定到搜索dialog，保留搜索／导航和缩小视窗的原断言。
4. 临时写回脚本初次在成功写回并自动导航后读取response body，Chromium已释放该body。改为确认响应状态、精确磁盘内容及重开基线；没有绕过端点、取消重建或掩盖生产失败。脚本对自身生成的精确CSS做所有权检查后恢复，不整体还原工作树。

## 可视与运行证据

截图路径统一为`.amp/in/artifacts/e14-<component>-default.png`、`-compare.png`、`-narrow-dark.png`；component为上表十个slug。窄屏是Chromium viewport验证，不是真手机。深色仅应用于画布，白色工具外壳沿用共享编辑器设计；高内容场景允许内部／纵向滚动。

- 默认、对比、深色截图和录屏见[汇总](https://ampcode.com/artifacts/e14-f12dd56b-85f0-4b4d-9bee-aaad9e8cf688)。
- 交互录像：`.amp/in/artifacts/e14-form-interaction.mp4`及同名`.loop.webp`，展示真实错误、输入、成功提交与对比侧独立状态；静态截图不代替交互断言。
- 真实写回值：Field46、Form22、Label22、Collapsible30、Aspect Ratio xl＋hidden、Separator7、Resizable3、Scroll Area22、Message Scroller46、Marker22。其他参数未自动写入。

所有临时验证脚本、fixture与安装目录在验收后清理；没有删除或恢复其他批次成果。组件接入成果已提交推送，未发布或部署。

## 接入完成后的本地收尾（2026-11-03）

用户要求先收尾，不新增组件或参数、不决定旧Studio去留、不代写guides、不发布或部署。README、路线图及E12／E13交付记录已区分当前状态与历史快照；68／68为文档页编辑器覆盖，不是旧Studio覆盖或所有API全面认证。

语言切换：在未修改的生产构建上暂停脚本响应，页面SSR语言按钮仍enabled；真实点击后URL不变，放行脚本并完成接管后URL仍不变，第二次点击才切换成功。该实验稳定复现了此前失败的表现，证实存在接管前丢点击的路径；由于原失败trace已被后续测试清理，不宣称已追溯证明原偶发失败只能由这一原因造成。

修正仅让现有语言按钮在onMount前disabled，接管完成后启用；保留原goto、noScroll和URL翻译逻辑。既有语言切换E2E加入脚本响应闸门，确认SSR禁用，再放行并执行原双向切换、文档标题、html语言及query／hash保留断言。该用例在旧构建上因“预期disabled，实际enabled”失败，没有增加超时、重试或放宽原断言。

修正后使用Node24.22.2／pnpm12.14.0完成：

| 检查 | 收尾结果 |
| --- | --- |
| `pnpm test` | **756通过**，原有测试数不变 |
| `pnpm check` | 全仓通过，Svelte **0 errors、0 warnings**；124篇中文合同通过 |
| `NODE_OPTIONS=--max-old-space-size=3072 CI=true pnpm build` | 生产构建通过 |
| 生产`playwright test e2e/i18n.spec.ts --repeat-each=10 --workers=2` | **30 passed（30.6s）**；重试仍为0 |
| 完整生产`playwright test` | **90 passed、2 skipped（4.8分钟）**；两项开发写回默认跳过 |
| 延迟接管补充检查 | 1280px英文页及390px中文页均先disabled，再首次有效点击切换；路径、query、hash保留，无pageerror |
| 定向Oxfmt／ESLint、`git diff --check` | 通过；未重排全仓既有格式问题 |

最终页头截图`.amp/in/artifacts/finalize-i18n-ready.png`（默认可用）与`finalize-i18n-pending.png`（接管前禁用）均已审阅；2560px图宽来自1280px视窗DPR2。真实指针录像`finalize-i18n-interaction.mp4`及同名`.loop.webp`完整显示经过邻近控件、英文→中文→英文；录像和5fps联系表已检查。query／hash与禁用合同由DOM断言验证，不以录像代替。390px为Chromium窄视窗，不是真手机。

本次收尾共7个文件，用户在验收后明确要求提交推送，单独交付；具体提交及CI结果见Git历史和工作线程记录。未发布、未部署。旧Studio、guides及正式分发安排仍由用户决定。
