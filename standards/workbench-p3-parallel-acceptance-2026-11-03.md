# P3 十一组件四组并行编辑器验收（E12）

**交付补记（2026-11-03）**：用户在E14验收后明确要求“提交推送”，本轮统一交付E12–E14。下文未提交／未授权及剩余组件安排为本批验收时的历史快照；最新覆盖68／68，见[E14记录](workbench-remaining-editors-acceptance-2026-11-03.md)。不发布包或部署站点。

日期：2026-11-03。[实现、截图、录像与交付状态所在工作线程](https://ampcode.com/threads/T-01a199a9-28fa-709a-8877-6fe766c7497e)。用户授权四组并行实施，未授权本批提交、推送、发布或部署。本记录为本地验收结果；不是跨框架转换，不替换交互库，不扩展旧 Studio，不修改用户自写 guides。

覆盖由43增至 **54／68**；剩余14项为 Sidebar／Chart／Sonner／Questionnaire、P4九项及 Collapsible。缺少编辑器不代表缺少组件，不追求68／68，不自动开始下一批。

## 并行边界与参数合同

四组只写独占编辑器及最小源码入口，主线程负责共享入口、精确白名单、永久测试、registry、真实写回和统一浏览器验收。子任务静态报告不替代主线程运行结果。

| 组  | 组件                     | 有限参数及保留边界                                                                                                                           |
| --- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| A   | Calendar、Range Calendar | 格子24／28／32／36px、padding 0–16px步长2、圆角档位；独立后置几何锚点与存储，不写共享 `cn-calendar`，保留真实Lyra 28px基线与Range字面padding |
| A   | Command                  | Item横留白0–24px、纵留白／gap 0–16px，步长2；List高度160–384px、步长16。只调自身，不复制Input Group或Dialog参数                              |
| B   | Carousel                 | 间距0–32px、步长2；横纵Content负margin与Item padding成对且方向独立，不改basis、Embla行为、按钮几何或自动播放                                 |
| B   | Color Picker             | 根gap 0–16px、内容gap 4–24px（步长2）、面板宽224–320px（步长16）；不调色值、原生色盘、Popover圆角或子控件尺寸                                |
| C   | Attachment               | 三尺寸padding各0–16px、步长2及外层共同圆角；Content横向额外2px、Media条件优先，无内容时不引入留白，保留Media／Action几何                     |
| C   | Bubble                   | 横留白0–32px、纵留白／组gap 0–24px、步长2及圆角；ghost仍零留白、无圆角，不套普通80%宽度限制                                                  |
| C   | Message                  | 行／正文／组gap各0–32px、步长2；不复制Avatar／Bubble参数，保留Header／Footer的ghost零留白                                                    |
| D   | Code Block               | default／sm横留白各8–32px、步长2；Header／Footer／Content／Line及Line负margin联动，不改纵留白、行号槽、diff或浮动操作                        |
| D   | Trace                    | 根gap与详情上间距各0–24px、步长2；不改树线、图标、状态、折叠或动效                                                                           |
| D   | Stepper                  | 根gap 0–32px、trigger padding 8–24px、步长2；仅补后置锚点，不改门禁、取消、挂载和键盘合同                                                    |

圆角沿用现有档位及“样式自带”。全部strict schema、独立v2 storage、空覆盖no-op、八套实际flattened registry懒加载、全局token只读、pane限定CSS；普通页面CSS排除所有组件编辑器，白名单不接受任意CSS或颜色。

Attachment／Bubble／Message／Code Block／Trace画布实际采用Rhea，与文档首例一致；其他为Nova。Vite安装源码导入、基线读取、页面选择和写回目标一致，没有为测试偷偷统一Nova。

## 整合时解决的问题

- Calendar家族补各自根slot及独立后置几何入口，保留默认类在前、调用处class最后。多月根据各pane实测宽度决定，不能只凭浏览器宽度使比较画布溢出。
- Carousel仅激活当前方向锚点，间距变化后复核Embla重测、尾页禁用和拖动。方向切换重建预览，不声称源码本来支持纵向Up／Down；保留现有Left／Right。
- Color Picker新增带类型的 `contentProps` 与专属 `color-picker-content` slot；生产消费者默认Portal不变，调用处class最后优先。编辑器内使用真实内联面板，避免碰撞翻转覆盖另一pane，保留关闭和归焦。
- Color Picker归属检测只认真实 `[role="dialog"][data-component-tuner]`，不误把普通页面sample视为编辑器；专属归属标记随Portal面板保留，使页面保存宽度能命中普通Portal且不污染两pane。中英文文档及永久E2E覆盖该合同。
- 保存后刷新不自动选中版本是既有设计。测试显式选择已保存版本，没有为满足错误假设改变公共外壳。
- 开发站registry生成／HMR会使代码画布hydration变慢。真实写回脚本等待确认后的主框架导航、networkidle及挂载，避免点击旧页面；没有放宽正式E2E超时或改业务行为。

## 主线程运行验收

十一组件逐项真实UI确认写回，POST200；核对精确Nova／Rhea Valar CSS、生成安装源码、刷新重开后的基线及后续草稿。前八项和最后三项分批完成；代码组初次受开发热更新重载影响超时，补齐导航等待后重跑三项全过。结束后恢复原Valar CSS并重建registry，默认CSS无Git差异；tracked生成变化仅八样式Calendar／Range Calendar／Carousel／Color Picker／Stepper源码接线。

运行交互包含日期选择／键盘／边界禁用及真实范围端点和中段；Command过滤／空结果／Loading及浮层组合；轮播横纵、键盘、最大gap后CDP触摸事件拖动；Picker短码／完整输入、预设、FormData、双pane不同宽度和值、普通页面Portal及嵌套Esc；附件重试／移除／恢复及局部横滚末项；消息／气泡组合和反应；代码流式追加／替换／真实剪贴板空行与复制状态2秒恢复；Trace嵌套、真实Dialog Esc归焦；Stepper校验、失败重试、pending取消和RTL／纵向键盘。

两pane状态、计时器和版本分别隔离；保存刷新后版本存在，显式选择后恢复。Picker打开时外部值更新不会替换现有hex编辑草稿，是原有行为；重开会刷新草稿，本批未扩大其语义。

## 自动回归

环境：Node24.22.2、pnpm12.14.0。保留13项新增源码合同、12项新增常规浏览器合同；源码合同覆盖八样式连续合并、安装回读、编译、空草稿及非法输入，浏览器合同覆盖公开交互而非仅静态样式。

| 命令／场景                                                  | 实际结果                                                                       |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `pnpm build:cli`                                            | 通过                                                                           |
| `pnpm test`                                                 | **660通过**：CLI282、parity110、primitives148、addon4、docs116                 |
| `pnpm check`                                                | 全仓通过；Svelte **0 errors／0 warnings**；124篇中英文合同通过                 |
| `NODE_OPTIONS=--max-old-space-size=3072 CI=true pnpm build` | 生产构建通过，未部署／发布                                                     |
| 完整生产Playwright                                          | **71 passed (3.4m)，2 skipped**；两项显式开发写回按配置不向生产preview写入     |
| 开发站真实写回                                              | **11项通过**，含重开基线及后续草稿；结束后恢复默认CSS并重建registry            |
| 补充真实浏览器脚本                                          | **7项通过**：Calendar、Range、Carousel、Attachment、Trace、Code Block、Stepper |
| 十一组件默认／比较／390px深色最大数字参数                   | 状态隔离、布局及零pageerrors检查通过；每状态截图已审阅                         |
| 本批定向ESLint／Oxfmt、`git diff --check`                   | 通过                                                                           |
| `pnpm lint`                                                 | **未通过**：130个本批未修改文件的既有格式问题；未为凑绿重排无关文件            |

四组临时harness另覆盖有限值全集、真实Tailwind工具类、八样式连续安装回读及客户端／服务端编译。A报告736例、B报告352轮、C报告1128例、D报告3928组合及1248轮单参数回读；这些是各组静态证据，不计入660项永久测试或71项生产E2E。

## 视觉证据与限制

工作线程 `.amp/in/artifacts/` 保留33张最终生产截图：`e12-<slug>-default.png`（1440px）、`-compare.png`（1800px）、`-narrow-dark.png`（390px、全部数字参数最大），均DPR2。四组审阅拼图 `e12-{a,b,c,d}-review.jpg` 每行一个组件，列为默认／比较／窄深；另直接复核Trace默认、Code比较、Stepper窄深。

真实指针短片 `e12-color-picker-interaction.mp4` 约6.9秒，依次经过邻近控件、打开Picker、选择预设并Esc归焦；全片联系表和末帧已审阅。循环预览为同名 `.loop.webp`。片尾没有完整展示重新打开，不把它当重开证明；重开、值和事件次数由独立DOM断言验证。

Attachment组允许局部横滚，不为截图改成wrap；范围日历跨周分段背景为原有合同。未验收操作系统原生色盘、实体手机或Safari。CDP触摸为Chromium模拟，不是实体设备验收。截图和录像不能替代执行过的交互断言。

## 交付状态

四组实现、共享接入、registry、测试和文档均为**本地未提交改动**。没有自动沿用E11的提交推送授权，没有发布或部署。后续14项仍按真实需要确认，Sidebar先设计应用壳、窗口快捷键、同源cookie及移动Sheet隔离，P4九项和Collapsible维持暂不独立建编辑器的决定。
