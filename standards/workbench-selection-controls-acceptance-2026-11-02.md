# Checkbox、Radio Group、Switch 组件页编辑器验收

日期：2026-11-02。实现与运行证据：[Amp 工作线程](https://ampcode.com/threads/T-01a199a9-28fa-709a-8877-6fe766c7497e)。

本批将现有三个 Svelte 选择控件接入共用 `ComponentTuner`，不是跨框架转换，不替换 Bits UI、不改 primitive/API、不扩展旧 Studio。组件页编辑器从14增至 **17／68个**。2026-11-02 用户授权本批提交推送至 `main`；提交、远端及CI结果见上述工作线程的交付回执，不以本地验收代替远端CI结果。不发布包、不部署站点。

## 参数合同与边界

| 组件 | 参数 | 保留的差异与行为 |
| --- | --- | --- |
| Checkbox | 方框尺寸12–28px、步长2；圆角档位／样式自带 | SVG随方框尺寸联动，保留原2px差值、Sera的4px差值；字面4／5／6px圆角不冒充语义档位；保留选中、真实半选、禁用及错误配色 |
| Radio Group | 单选框尺寸12–28px、间距0–24px，步长2 | Indicator同步大小，dot为半尺寸加原偏移；Sera为−1px，Luma／Rhea深色额外＋2px；不增加圆角或颜色参数 |
| Switch | 默认／小尺寸滑块高度10–24px、步长2；共同圆角、动效档位／样式自带 | 高度变化Δ时轨道高＋Δ、轨道宽＋2Δ、滑块宽＋Δ；保留原垂直内缩、Luma宽滑块及checked平移，不能分别把轨道宽高和端点调坏 |

三者从nova、vega、maia、mira、lyra、luma、rhea、sera的已展开registry读取真实基线，独立 `valar.<component>-styles.v2` 存储。复用草稿、并排对比、局部明暗、命名版本、备份、写回确认及Esc焦点归还。全局颜色、圆角基数、动效时长均只读。

画布使用真实Field标签／说明／错误关联与唯一ID；对比双方、示例之间状态独立。Checkbox保留真实indeterminate绑定；Radio Group原生方向键按orientation切换并跳过禁用项；Switch标签在前，覆盖双尺寸开／关／禁用与错误状态。错误组是固定校验外观示例，不声称选择后自动消除错误。

## 写回发现并修复的问题

开发站真实写回暴露了预览未覆盖的问题：Nova滑块调为20px时，原轨道18.4px应变成22.4px；最初输出 `data-[size=default]:h-5.6`，接口虽返回200，但随后 `/src/app.css` 返回500：`Cannot apply unknown utility class 'data-[size=default]:h-5.6'`。因此仅验证预览像素或registry字符串往返不够。

修复：整数几何继续使用正常spacing工具类，非整数轨道高度使用字面像素 `h-[22.4px]`。白名单仅对Switch轨道接受12.4／12.6至26.4／26.6、整数部分步长2的**16个固定值**；不开放任意像素、宽度任意值、其他单位、CSS表达式或translate覆盖。正常数值工具类仍只允许Tailwind支持的整数／四分之一步长，拒绝 `h-5.6`。现有Switch合同测试增加八样式×八尺寸的真实Tailwind `@apply` 编译，防止再次出现“预览正常、写回后站点不能编译”。

## 自动验证

Node24.22.2、pnpm12.14.0。

| 命令 | 最终结果 |
| --- | --- |
| `pnpm test` | **613通过**：CLI282、parity110、primitives148、registry addon4、docs69 |
| `pnpm check` | 全仓通过；Svelte **0 errors／0 warnings**；124篇中文文档与英文源匹配 |
| `NODE_OPTIONS=--max-old-space-size=3072 CI=true pnpm build` | 全量生产构建成功 |
| docs下 `CI=true E2E_BASE_URL=<生产预览> PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=<桌面指针wrapper> pnpm exec playwright test` | **33通过，1.6分钟**，含独立tarball消费者安装、严格检查与构建 |
| 本批TS／Svelte Oxfmt、ESLint；`git diff --check` | 通过 |

在现有 `workbench.test.ts` 中新增四个合同用例：三组件八样式基线与真实parity注入后回读／连续写回、关联几何与深色圆点保留、非法输入和白名单拒绝；Switch用例同时执行64组双尺寸Tailwind编译。没有按私有helper逐个堆测试。

在现有 `workbench.spec.ts` 新增三个用例，实测标签点击、Space、纵／横向方向键及禁用项跳过、焦点环、尺寸／圆角／间距／动效的计算CSS、对比隔离、深色画布不改变站点主题、390px容器不溢出、命名版本与Esc归还入口焦点。慢动效按真实全局token为300ms；最初测试误写260ms，查明token后修正期望，未修改实现迁就断言。

最终构建后首轮E2E未先重启既有预览进程，出现16失败／17通过；重启预览服务后，同一代码完整33项通过，未放宽断言。构建仍有既有大chunk等提示，未调整阈值掩盖提示。

## 开发站真实落盘与恢复

先备份Nova、Luma、Sera定制CSS；以下写回接口均返回200，检查了生成的安装registry，修复小数工具类后 `/src/app.css` 为200。

- Nova三组件：Checkbox20／md，SVG18；Radio22／gap18，dot11；Switch默认滑块20、轨道22.4×40，小滑块10、轨道12×20，md／slow。重开编辑器读取写回值，Checkbox20／SVG18、Radio22／gap18／dot11、Switch双尺寸实际样式匹配。随后通过界面将Switch默认滑块20调为22，点击“写回组件库…”→“确认写回”，显示“已写回”；安装源更新为轨道24.4px及滑块22px，CSS仍返回200。
- Luma：Radio22／gap18，普通dot11、深色dot13；Switch默认轨道24×52／滑块20×28，小轨道14×24／滑块10×14。浏览器实际检查宽滑块及开关两端2px留白；局部深色圆点实际为13px，浅色为11px。
- Sera：Checkbox22／SVG18；Switch默认轨道24×45／滑块20×20、小轨道16×29／滑块12×12，安装源检查通过。文档站默认只引入四套样式，因此另用临时编译的真实Sera CSS检查原始33×18／14px与25×14／10px几何及两端2px留白，未把Sera永久加入站点样式。调整后几何、回读及连续写回由八样式合同测试验证，不声称八套全部完成浏览器全矩阵。

验收后从备份恢复三个定制CSS并重建registry，`git diff --exit-code -- docs/src/lib/registry/styles/valar docs/static/registry/styles/nova docs/static/registry/styles/luma docs/static/registry/styles/sera` 为空。没有留下试验默认值；临时Sera CSS与脚本均删除。

## 视觉与交互证据

Chromium桌面hover／fine pointer、DPR2；1440×1000浅色／深色、1920×1000双栏对比、390×1000最大参数窄视口均截图检查。窄视口的页面scrollWidth为390，三个草稿pane的clientWidth／scrollWidth均为356／356；Radio横向组只在局部容器滚动。长画布与参数区允许纵向滚动，不要求全部内容塞进一屏。这不是实体手机或Safari验收；既有RTL平移源码未改，RTL不列入本轮已验证范围。

首次Checkbox截图抓到异步图标加载占位方块；DOM随后确认为真实 `lucide-minus`，等待减号加载后重新拍摄全部状态并检查，没有加图标替代实现或颜色覆盖。

截图：`.amp/in/artifacts/{checkbox,radio-group,switch}-{light,dark,narrow,compare}.png`；最终汇总：`.amp/in/artifacts/form-controls-{light,dark,narrow,compare}.jpg`。工作线程展示最终汇总，不展示已替换的中间截图。

真实移动指针录像：`.amp/in/artifacts/form-controls-interaction.mp4`（13.7秒）及同名 `.loop.webp`，展示经过相邻／禁用控件、Checkbox标签与半选切换、Radio选择变化、Switch双尺寸切换。已检查视频及5fps联系表；键盘合同以执行的E2E为准，不把联系表或截图当作键盘操作证明。

本次orb日志：`/tmp/form-controls-{test,check,build}-final.log`、`/tmp/form-controls-e2e-restarted.log`、`/tmp/form-controls-visual-final.log`。这些不是分发源码。
