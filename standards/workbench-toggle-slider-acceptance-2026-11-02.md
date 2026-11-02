# Toggle、Toggle Group、Slider 组件页编辑器验收

日期：2026-11-02。实现与运行证据：[Amp 工作线程](https://ampcode.com/threads/T-01a199a9-28fa-709a-8877-6fe766c7497e)。

本批将三个现有 Svelte 组件接入共用 `ComponentTuner`，不是跨框架转换，不替换 Bits UI、不扩展旧 Studio。组件页编辑器由17增至 **20／68个**；剩余48个的优先级见 [WORKBENCH](WORKBENCH.md#剩余-48-个组件的优先级2026-11-02)。用户已授权本批完成后一起提交推送至 `main`；实际提交、远端CI状态以工作线程交付回执为准，不发布包、不部署站点。

## 参数合同与共享边界

| 组件 | 参数 | 保留的差异与行为 |
| --- | --- | --- |
| Toggle | 小／默认／大高度20–64px、文字侧横向内边距0–48px；共同图文间距0–16px，均步长2；共同圆角档位／样式自带 | 高度联动最小宽度；保留inline-start／end图标侧原留白。Group Item导入同一份 `toggleVariants`，共享高度、图文间距及非拼接项留白／圆角；拼接项保留Group自己的留白／端点 |
| Toggle Group | 拼接项文字侧内边距0–48px、步长2；拼接圆角档位／样式自带 | 仅spacing=0项改留白，图标侧不变；显式圆角同时覆盖根、小尺寸根、outline根和横纵首尾端点，中间保持直角。不重复提供Toggle尺寸／图文间距旋钮 |
| Slider | 轨道粗细2–16px、把手短边12–32px，步长2；轨道／把手圆角档位／样式自带 | 轨道同步横高／纵宽；普通把手为正方形，Luma横向宽／纵向高始终多8px；不把业务min／max／step参数化 |

三者从nova、vega、lyra、maia、mira、luma、rhea、sera已展开的安装registry读取真实基线，独立 `valar.<component>-styles.v2` 存储。全局颜色、圆角基数和动效token只读。复用版本保存、导入导出、对比、局部明暗、写回确认与Esc归还入口焦点。

Toggle Root仅补 `data-size`／`data-variant` 标记，供真实尺寸识别；不新增公开prop或改变Bits行为。八套生成的Toggle registry同步该标记。Group方向、spacing、单选／多选仍是调用属性。三个写回入口只放行各自有限尺寸／方向圆角工具类，不放行任意值、颜色或业务行为。

### 八套基线

尺寸单位px；Toggle高度按小／默认／大排列；Slider按轨道／把手短边排列。

| 样式 | Toggle高度 | Toggle共同圆角 | Group拼接留白／圆角 | Slider几何／圆角 |
| --- | --- | --- | --- | --- |
| Nova | 28／32／36 | 样式自带 | 8／样式自带 | 4／12，full |
| Vega | 32／36／40 | md | 8／md | 6／16，full |
| Lyra | 28／32／36 | none | 8／none | 4／12，none |
| Maia | 32／36／40 | 4xl | 12／样式自带 | 12／16，4xl |
| Mira | 24／28／32 | 样式自带 | 8／样式自带 | 4／12，md |
| Luma | 32／36／40 | 3xl | 12／3xl | 8／16，full；长边＋8 |
| Rhea | 28／32／36 | 2xl | 8／2xl | 4／16，2xl |
| Sera | 36／40／44 | none | 24／none | 2／12，样式自带 |

Nova／Mira的小尺寸封顶圆角不冒充统一档位；Maia Group根4xl与端点3xl不冒充同一值。Sera Slider无rounded工具类，保留为样式自带，不擅加圆角。

## 自动验证

Node24.22.2、pnpm12.14.0。

| 命令 | 结果 |
| --- | --- |
| `pnpm test` | **617通过**：CLI282、parity110、primitives148、registry addon4、docs73 |
| `pnpm check` | 全仓通过；最终Svelte **0 errors／0 warnings**；124篇中文文档与英文源匹配 |
| `NODE_OPTIONS=--max-old-space-size=3072 CI=true pnpm build` | 生产构建成功 |
| docs下 `CI=true E2E_BASE_URL=<生产预览> PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=<桌面指针wrapper> pnpm exec playwright test` | **36通过，1.7分钟**，含独立tarball消费者安装、严格检查与构建 |
| 本批TS／Svelte Oxfmt、ESLint；`git diff --check` | 通过 |

现有 `workbench.test.ts` 新增4个合同用例，覆盖八样式的实际基线、parity写入安装源码后回读／连续替换、共享尺寸与Group边界、图标留白、Luma长边差和白名单拒绝。非对称样本包含Toggle默认46／小22px、Group留白46→2px、Slider32→12px与轨道14→2px，不用同一个实现的输出生成期望。

现有 `workbench.spec.ts` 新增3个浏览器合同：Toggle的Space／Enter、焦点环、三尺寸与Group联动；Group方向键跳过中间禁用项、Space、单／多选、横纵端点和图标侧；Slider横纵键盘、Home／End、区间上下限独立、真实指针拖动及禁用tabindex。三者均覆盖计算CSS、对比状态隔离、深色不改变站点主题、390px无页面溢出、命名保存和Esc归还焦点。

全量首次运行33通过／3失败：前两个在生产预览尚未监听5187时连接被拒；第三个是新增Slider“使用版本”原生select使搜索合同的全页 `getByRole("combobox")` 有两个匹配。修正为搜索dialog内定位，搜索加载／重试／请求合并断言保持不变。以HTTP200确认预览就绪后完整重跑 **36通过**，不靠重试掩盖问题。

构建保留既有大chunk、插件耗时及Node弃用提示，未修改阈值掩盖提示。首次定向E2E缺默认Playwright浏览器时，使用配置已有的 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` 指向orb安装Chrome，不新增浏览器依赖。Group图标侧测试初始误期望8px，核对Nova源码的拼接图标侧 `pl-1.5` 后改为6px，未修改实现迁就断言。

## 开发站真实落盘与恢复

备份Nova、Luma的原始Valar覆盖CSS；经真实 `/__valar/style-overrides` 分三次写入，均返回200，每次 `/src/app.css` 均为200：

- Nova Toggle：默认高度46、最小宽46、文字侧留白22、gap10、共同圆角md；生成registry含 `h-11.5 min-w-11.5 px-5.5`，重开编辑器在无草稿情况下实际高度46px。
- Nova Group：拼接文字侧30px／md；生成registry含横纵首尾方向圆角。重开无草稿时首项右留白30px、左上圆角8px，中间项圆角0；不靠预览CSS证明写回生效。
- Luma Slider：轨道14px、把手横向40×32／纵向32×40、md；生成registry保留 `h-8 w-10 data-vertical:h-10 data-vertical:w-8`，浏览器重开无草稿实际横宽／纵高均40px。此前也验证编辑器草稿从16调到32时长边保持40px。

验收后从精确备份恢复两份覆盖CSS，并重建registry；`git diff -- docs/src/lib/registry/styles/valar` 为空，八套registry只有本批Toggle元数据变化，没有留下试验默认值。完整八样式读写由合同测试覆盖；本轮浏览器重点验收Nova与Luma，不声称八套浏览器全矩阵、Safari、实体手机或RTL均已验收。

## 视觉与交互证据

Chromium、DPR2；1440×1000浅色／局部深色、1920×1000双栏对比、390×1000最大参数窄视口，三个编辑器均已截图并检查。窄视口页面scrollWidth为390，草稿pane无横向溢出；Group横向长组只在局部容器滚动，Toggle可换行，Slider为端点预留把手空间。长画布与参数区允许纵向滚动，不要求所有示例塞进一屏。

视觉复核发现Toggle错误示例使用无边框default变体，虽有aria-invalid但错误边框不可见；仅将画布示例切到已有outline变体并重拍检查，不改组件原错误样式。错误示例仍是固定外观，不声称自动校验。

原始截图：`.amp/in/artifacts/{toggle,toggle-group,slider}-{light,dark,narrow,compare}.png`；最终三组件汇总：`.amp/in/artifacts/toggle-slider-{light,dark,narrow,compare}.jpg`。工作线程只展示最终汇总，不展示已替换的截图。

真实指针录像：`.amp/in/artifacts/toggle-slider-interaction.mp4`（28.4秒）及同名 `.loop.webp`。实际穿过相邻控件、点击Toggle和Group、拖动Slider，最终音量由37变为68；已检查视频及5fps联系表。键盘行为以执行的E2E断言为准，不把视频当作全部键盘合同的证明。

本轮orb日志：`/tmp/e4-{test,check-final,build,e2e-final,visual-write,visual-final}.log`。临时验证脚本不纳入源码；最终交付不含试验覆盖值。
