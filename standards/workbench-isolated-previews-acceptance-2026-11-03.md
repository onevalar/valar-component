# E13：问卷、图表、侧栏与通知编辑器验收

**当前交付（2026-11-03）**：用户在E14验收后授权提交推送，E12–E14已统一推送至main：[f62fb33](https://github.com/onevalar/valar-svelte/commit/f62fb33b14de412d8901d40dfec2558368eff81b)，[远端CI全部通过](https://github.com/onevalar/valar-svelte/actions/runs/41600027003)。当前覆盖68／68，见[E14记录](workbench-remaining-editors-acceptance-2026-11-03.md)。以下正文保留本批验收时的历史快照，不代表当前仍未提交或仍有组件待接入。未发布包或部署站点。

日期：2026-11-03。[工作线程与视觉证据](https://ampcode.com/threads/T-01a199a9-28fa-709a-8877-6fe766c7497e)。用户授权四组并行、先验证再实施；未授权提交、推送、发布或部署。保留E12本地改动，不扩旧Studio、不修改用户自写guides。本批不是跨框架转换，不替换交互库。

本地验收覆盖由54增至 **58／68**：普通预览入口57项，Sidebar由block入口接入。剩余Collapsible和P4九项仍组合优先，不自动开始下一批，不为68／68制造无意义的独立参数。

## 有限合同与实现边界

| 组件 | 参数 | 保留边界 |
| --- | --- | --- |
| Questionnaire | Root gap 0–32、Choices gap 0–24、Actions gap 0–16、Choice X/Y padding各0–24；整数步长2 | 现有四cn锚点；不复制Input／Button几何，不改required／multiple／流程／答案。保留min-h-11触控下限 |
| Chart | Tooltip X padding 0–24、Y padding及标题／系列区gap各0–16；整数步长2 | 只补slot与独立cn-chart-tooltip-layout，不激活dormant旧cn-chart-tooltip。真实LayerChart Tooltip、图例、摘要、语义表格，不调数据／轴／系列／尺寸／颜色 |
| Sidebar | 展开宽192–384、步长8；菜单gap 0–12、步长1 | Provider新增persistState默认true，预览false；caller显式style > 样式默认变量 > constants。icon／mobile宽、快捷键和回调不改 |
| Sonner | 标准styled通知X padding 0–32、Y padding 0–24、内部gap 0–16；整数步长2 | cn-toast／parity skip不变，补cn-sonner-layout有限变量；不调圆角／位置／时长，不改生产生命周期；custom／unstyled和caller inline样式保留 |

参数单位是默认4px spacing下的标称px；预览和写回工具类都跟随全局spacing。Sidebar宽写rem，菜单gap-px固定1px而不随spacing缩放。全局token只读，strict schema、有限白名单、独立v2 storage、八样式真实flattened基线、空override不生成覆盖。八样式源码回读不等于八套运行预览；当前真实画布使用Nova。

## 独立预览与公共行为

- Questionnaire使用两份真实三题表单，单选／多选／自由回答／校验／末题skip／原生FormData与reset；重复字段不丢失。调参和明暗保留current答案；退出比较再进入时before是新问卷，宿主结果同步重置，不保留悬空当前题。
- Chart仅在编辑器各自Chart.Container上设置PortalTarget，使真实LayerChart Portal保留所属pane、系列变量与Dialog归属。点位Tooltip仍是上游指针模型；不宣称键盘逐点导航，图例按钮和精确数据表提供替代访问。
- Sidebar／Sonner独立根route避开站点Toaster／ModeWatcher实例；各自iframe隔离窗口事件、Portal和通知JS store。共享桥仅传有限geometry与白名单token，source／origin／schema／revision校验；父mount与iframe load主动connect→ready，避免SSR早ready丢失，不轮询、不复制父head。
- Sidebar用真实sidebar-07应用壳。767px为移动Sheet，768px为桌面；Ctrl／⌘+B只作用当前窗口；首个Esc关闭Sheet并归焦子Trigger，第二次Esc请求关闭父编辑器并归焦入口。参数／主题更新保留当前壳身份与折叠状态。
- Sonner channel不能隔离全realm store：前置负控实际复现同id碰撞、无参dismiss-all串站点及卸载残留，因此没有同页堆两个全局Toaster。各iframe创建自己的真实toast，清空和Promise／action／update不串另一侧。
- Sonner纯CSS改padding不会自动重测旧通知高度；预览明确清空本realm并用新id重播，而不是同id更新伪装无生命周期影响。生产通知不重播。无layer CSS仅匹配.cn-toast[data-sonner-toast][data-styled=true]；不使用!important，caller inline仍优先。

## 前置反例与集成修正

1. Sonner首个无条件默认toastOptions.style候选在custom／unstyled路径把padding0改为16、高度16改为48，226项断言中两项失败，因此撤销。最终guarded CSS候选226／226通过，另有5项tuned inline优先级通过，没有放宽失败断言。
2. Sidebar同源iframe不隔离cookie；预览显式persistState=false，cookie哨兵回归通过。没有通过改公共cookie键或constants绕过。
3. 父桥最早只等child主动ready，SSR时可能先于父hydrate发出；补双向握手后首次加载与生产模块加载通过。
4. 生产构建发现flattened插件把Svelte提取CSS请求重读为整份源码，Tailwind报Invalid declaration: mode；resolve/load保留Svelte虚拟子请求所有权，修复后构建通过。
5. 早期开发站Questionnaire／Chart交互失败在稳定生产预览中原断言通过，未改业务行为或删断言；最新500另查实为重建CLI期间Vite缓存暂时缺失的tailwind.css目标，重启服务恢复。不将这一事实当成所有早期失败的已证原因。
6. Sonner页面有两个Show Toast按钮，永久测试按真实“Sonner样式微调”region定位；Sidebar以真实ready／computed样式判断就绪，不依赖整页networkidle。

## 主线程验收与真实写回

环境：Node24.22.2、pnpm12.14.0、Chromium；当前svelte-sonner1.2.1、LayerChart2.0.3。未新增运行依赖。

| 检查 | 实际结果 |
| --- | --- |
| pnpm build:cli | 通过 |
| pnpm check | 全仓通过，Svelte 0 errors／0 warnings；124篇中英文文档合同通过 |
| pnpm test | **666通过**：CLI282、parity110、primitives148、addon4、docs122 |
| NODE_OPTIONS=--max-old-space-size=3072 CI=true pnpm build | 通过；没有部署或发布 |
| 完整生产Playwright | **76 passed（4.3m），2 skipped**；开发写回默认跳过，没有向生产preview写文件 |
| 四组件真实开发站UI写回 | **4项通过**：真实旋钮→确认→POST200→精确CSS→生成registry编译→新文档重开读回基线 |
| Sidebar八样式实际安装链路 | **8项通过**：endpoint200→真实registry重建→CLI add→安装源码344px／gap9回读与Svelte编译、设计规则安装 |
| 默认／比较／390px深色最大参数 | 四组件共12张生产截图；pane不横溢、无pageerror，已审阅 |
| 定向Oxfmt／ESLint、git diff --check | 通过；全仓既有格式问题不在本批顺手重排 |

UI写回使用非对称值：Questionnaire Choice22／4、Chart Tooltip24／2、Sidebar320／7、Sonner30／2，重开基线均相同。Sidebar额外八样式写344／9后使用实际CLI安装，安装得到21.5rem与gap-2.25，persistState默认和guard保留。八个安装目录使用临时Vite项目配置与--no-deps-install／--skip-preflight，验证真实文件／规则落地和编译，**不冒称八套完整消费者应用build／运行**。全仓生产E2E另包含已有独立tarball消费者严格check／build，但其运行合同不是本批四组件。

所有验证结束后仅恢复本次产生的Valar CSS差异并重建registry；没有整体checkout或丢弃E12改动，默认Valar CSS无Git差异。tracked新增registry变化仅八样式Chart／Sidebar／Sonner源接线，Questionnaire复用原锚点。

各组局部证据独立于666项永久测试：A五项临时测试、40次八样式连续回读；B4212次实际computed值对照；C11项临时测试、96轮回读及767／768／独立Sheet；D226项样式、644项模型、28项realm与5项inline覆盖。它们不重复计入主线程通过数。

## 视觉证据与未扩大范围

`.amp/in/artifacts/e13-<questionnaire|chart|sidebar|sonner>-{default|compare|narrow-dark}.png`为最终DPR2截图：默认1440、比较1800、窄屏390。四份e13-<组件>-review.jpg按默认／比较／窄深排列，均已审阅。Questionnaire总览缩图文字较小，另审阅原始默认截图确认说明与按钮清晰；窄屏长内容可滚动，不把截图底边当UI裁切。Chart Tooltip正常遮挡部分图表是浮动提示本身，不改变定位合同。

e13-chart-interaction.mp4（约9.9秒）与同名loop.webp展示真实指针经过邻近类型控件、多个柱位Tooltip、键盘切为折线后再hover；逐帧联系表已审阅。原生下拉弹出层没有完整进入录屏，不把视频当完整下拉交互证明；真实切换和系列隔离由永久E2E断言。截图／录像不替代实际执行过的行为检查。

限制：不宣称实体手机、Safari或读屏播报质量已验收；390px是Chromium窄视口。真实图例／表格替代访问不等于点位键盘Tooltip。Sonner普通Tab聚焦action不暂停计时是上游现状，已文档化并提出独立修复建议，未暗改生产语义。

**同源iframe不是storage安全沙箱**：虽然不挂第二个ModeWatcher，wrapper导入mode-watcher模块时仍可能初始化缺失的mode-watcher-mode／mode-watcher-theme键；已有值不被覆盖，参数／明暗update本身不写storage。父站原本也使用该依赖；本批隔离承诺针对通知store、窗口／Portal和预览主动持久化，不承诺空storage首次导入零写入，不使用未跨浏览器验证的credentialless伪装解决。

## 验收时交付状态（历史）

四组件、共享外壳／有限桥、白名单、永久回归、registry与文档为本地未提交成果；E12改动原样保留。未提交、未推送、未发布、未部署；不自动启动后续10项。
