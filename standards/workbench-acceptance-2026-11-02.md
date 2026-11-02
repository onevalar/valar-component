# Hover Card、Context Menu、Drawer 组件页编辑器验收

日期：2026-11-02。实现及实际运行证据：[Amp 工作线程](https://ampcode.com/threads/T-01a199a9-28fa-709a-8877-6fe766c7497e)。

本批是现有 Svelte 组件接入编辑器，不是跨框架转换，也没有替换 Bits UI／Vaul。组件页编辑器覆盖从 9 个增至 12／68 个；没有扩展旧 Studio。初次验收时为本地改动；2026-11-02 用户授权与后续 Tabs／Card 一并提交推送至 `main`，不发布包或部署站点。当前总覆盖为 **14／68 个**，最终回归结果见 [Tabs／Card 验收记录](workbench-tabs-card-acceptance-2026-11-02.md)，提交及远端结果见上述工作线程的最终回执。

## 参数与交互边界

| 组件         | 可写回参数                                                                                             | 保留的交互／不在参数中的内容                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Hover Card   | 统一内边距、圆角档位、动效档位、缩放、滑入距离                                                         | 真实悬停与打开／关闭延迟；宽度、偏移、延迟仍由调用方提供                                                |
| Context Menu | 面板内边距、最小宽度、面板圆角、菜单项横向／纵向内边距、图文间距、菜单项圆角、动效档位、缩放、滑入距离 | 真实右键、键盘子菜单、禁用项、勾选／单选；参数读写与 Dropdown 共用 `menu-tuning.ts`，触发器与定位不共用 |
| Drawer       | 页眉／页脚内边距、页脚间距、圆角、遮罩                                                                 | 真实 Vaul 拖拽和固定 500ms 进入／退出时序；不提供与运行时不一致的 CSS 时长／位移参数                    |

三者共用 `ComponentTuner` 的版本保存、备份、比较、明暗预览、写回确认和 Esc 焦点归还。全局 token 只读；方向仅用于预览，不写回调用方 API。

- Hover Card 固定展开与真实悬停样例分开；中英文文档重复的 Basic 示例关闭调参入口，避免一页两个编辑器。
- Context Menu 默认展开使用真实触发区作 anchor，右键切回鼠标虚拟 anchor。Shift+F10／菜单键通过真实 ContextMenu Trigger 发出有坐标的事件，再交给 Bits 的菜单键盘处理。GroupHeading 与 Label 共用样式类但不同 slot，预览同时覆盖。
- 390px 画布、主菜单最小宽度 320px 时，原横向子菜单伸至 x=462.6、超出画布右边界373；键盘虚拟 anchor 的主菜单也会越界。修复后窄画布的主菜单与子菜单都向下展开：画布 x=17–373，主菜单 x=41–361、宽320，子菜单 x=232–360、宽128，均完整位于画布中。回归检查同时断言两级菜单的左右边界，此约束只作用于编辑器画布。
- Drawer 保留四方向；maia／mira／luma／rhea 的内缩 `::before` 表面与其余样式的方向边缘圆角分别处理。遮罩、内容、焦点和页面样式均限制在画布／编辑器边界内。

## 可重复的自动验收

使用 `.nvmrc` 的 Node 24.22.2、pnpm 12.14.0。

| 命令                                                                                                                           | 实际结果                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `pnpm test`                                                                                                                    | 605 项通过：CLI 282、parity 110、primitives 148、registry addon 4、docs 61                                |
| `pnpm check`                                                                                                                   | 全仓通过；Svelte 检查 0 errors、0 warnings；124 篇中英文文档匹配                                          |
| `NODE_OPTIONS=--max-old-space-size=3072 CI=true pnpm build`                                                                    | 成功；含 content、registry、搜索数据、生产站点及 llms 构建；保留现有大 chunk 提示，没有通过调高阈值隐藏它 |
| docs 下 `CI=true E2E_BASE_URL=<生产预览地址> PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=<Chromium wrapper> pnpm exec playwright test` | 28 项全量通过，约1.4分钟；包含独立 tarball 安装、严格检查和构建                                           |
| 改动 TS／Svelte 的 Oxfmt、ESLint；`git diff --check`                                                                           | 通过                                                                                                      |

`docs/tests/workbench.test.ts` 扩展现有文件，验证 nova、vega、maia、lyra、mira、luma、sera、rhea 的安装源码读取、参数写回与回读、旧类替换、白名单拒绝。非对称差异包括 Mira 选项纵向内边距 +2px、Lyra 非贴边分隔线、Drawer 内缩表面及自带圆角。

`docs/e2e/workbench.spec.ts` 的三个新用例验证实际渲染值、四方向、Drawer 拖拽关闭／重播、Hover Card 悬停开启／移出关闭、Context Menu 右键／Shift+F10、方向键跳过禁用项并打开子菜单、390px 最大菜单宽度、比较双方状态独立、保存版本及 Esc 归还入口焦点。原有 Dropdown 用例保留回归。

测试跟随真实上游语义：Hover Card Trigger 的可访问角色为 button；Bits 在菜单获得键盘焦点后自动聚焦第一项。悬停退出使用连续真实指针移动，不能用把指针瞬移至 safe-polygon 顶点代替。

最后一处窄画布定位修复后，再次执行 docs 的 `check`（0 errors／0 warnings）、`build:svelte`（成功）和全量 Playwright。预览服务重启后的第一次跑测，首个 Slider 测试因端口尚未就绪报 `ERR_CONNECTION_REFUSED`，其余27项通过；确认 Slider 页面可访问后重跑全量，最终 **28项通过**，不改断言、不增加重试或屏蔽用例。

## 开发站真实写回与恢复

写回前备份原始 Nova 定制 CSS 和整套 Nova registry 文件，修改白名单后重启 docs 开发服务。

| 组件         | 实际写入与安装源码检查                                                                                                                                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Context Menu | 开发接口返回200；面板 `p-2 min-w-64 duration-slow`，菜单项 `px-2.5 py-2 gap-2 data-inset:pl-8.5`，GroupHeading `px-2.5 data-inset:pl-8.5`，子菜单 `p-2 duration-slow` 均进入 `static/registry/styles/nova/context-menu.json` |
| Drawer       | 开发接口返回200；header `p-5.5`、footer `p-7.5 gap-3.5`、overlay `bg-black/40`、四方向边缘 `rounded-*-none` 均进入安装源码                                                                                                   |
| Hover Card   | 通过页面旋钮把内边距10改为22，打开“写回组件库…”并点击“确认写回”；页面重载，安装源码包含 `p-5.5` 且替换原 `p-2.5`                                                                                                             |

写回验证后从备份恢复原 CSS 和 registry，再重建 registry。最终 `git diff` 中无 Nova 定制 CSS／安装 JSON 的试验改动，不把测试值当成产品默认值。

## 视觉与交互证据

以 Chromium 桌面 hover／fine pointer 渲染，DPR=2。检查1440px浅色、深色、390px窄画布；对比模式在1920px检查两栏（共用外壳在较窄宽度上下排列）。这是浏览器窄视口验证，不代表真实手机或 Safari 验证。

截图在 `.amp/in/artifacts/<hover-card|context-menu|drawer>-<light|dark|narrow|compare>.png`，逐张检查。Drawer 截图等待真实500ms动效结束，避免把过渡中的部分出屏误判为最终裁切；Hover Card 窄图使用左侧出现，Drawer 使用左侧，深色 Drawer 使用右侧，Context Menu 窄图包含最大宽度与展开的子菜单。

交互录像 `tuners-interactions.mp4`（30.2秒）与最终四种状态拼图在上述工作线程内展示。录像逐帧检查了真实移动指针、悬停开关、右键／子菜单和快速拖拽关闭；完整原始录像保留为 `tuners-raw.mp4`。运行日志使用本次 orb 的 `/tmp/tuner-final-{check2,test2,build2,e2e}.log`，最后定位修复的复验见 `/tmp/tuner-final-narrow-{check,build,e2e}.log` 与 `/tmp/tuner-final-ready-e2e.log`。截图和运行日志是本次验收证据，不作为组件源码分发。
