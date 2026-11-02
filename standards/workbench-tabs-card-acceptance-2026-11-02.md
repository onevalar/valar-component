# Tabs、Card 组件页编辑器验收

日期：2026-11-02。实现与运行证据：[Amp 工作线程](https://ampcode.com/threads/T-01a199a9-28fa-709a-8877-6fe766c7497e)。

本批把现有 Svelte Tabs、Card 接入共用 `ComponentTuner`，不是跨框架转换，不替换 Bits UI 或修改组件 API，不扩展旧 Studio。组件页编辑器从 12 增至 **14／68 个**。2026-11-02 用户授权记录进度并提交推送；本批与前批 Hover Card／Context Menu／Drawer 的实现、测试及验收记录一并交付至 `main`，不发布包或部署站点。提交及远端结果见上述工作线程的最终回执；下一批候选 Checkbox／Radio Group／Switch 尚未开始。

## 参数合同与取舍

| 组件 | 参数 | 保留的行为与边界 |
| --- | --- | --- |
| Tabs | 水平列表高度32／36／40px、列表与内容间距4–24px、列表内边距3／4px、默认列表圆角、标签横向内边距4–16px／纵向0–8px、标签圆角 | 默认／线型 × 横向／纵向；图标、禁用项、真实方向键导航；列表圆角只作用于默认变体，不改线型下划线 |
| Card | 默认／小尺寸留白0–48px、标题区间距0–24px（数字步长2px）、圆角档位 | `--card-spacing` 继续联动分区gap、内缩、分隔线和贴边负边距；保留各样式页脚处理、图片顶部零内边距、语义颜色与字体 |

- 两者从当前样式的已展开 registry 源码读取参数；覆盖 nova、vega、maia、mira、lyra、luma、rhea、sera，不用统一硬编码值冒充当前值。
- Tabs 的方向／图标侧参数有差异时显示“样式自带”，不误报为统一数字；只有显式选统一档位才同步覆盖方向和图标侧规则。各示例及对比双方的 Tabs 选择状态独立，触发器／内容ID唯一。窄画布使用局部横向滚动而不是换行。
- Card 默认与小尺寸独立。预览只改默认留白时排除小尺寸，避免未分层的预览 CSS 把小尺寸自己的变量覆盖。圆角同步头部、页脚和首尾图片；rhea 封顶圆角与 sera 自带值显示“样式自带”。
- 为保留 Card 的已有联动，白名单只对 `cn-card` 接受固定 `[--card-spacing:--spacing(N)]` 模板及小尺寸前缀，N 只对应0–48px、步长2px。其他自定义属性、自由CSS值、颜色、未登记部件仍拒绝；不是开放任意值入口。
- 共用外壳提供草稿、并排比较、浅深色、命名版本、导入导出、写回确认和 Esc 焦点归还；全局 token 只读。

## 自动验证

使用 Node24.22.2、pnpm12.14.0。

| 命令 | 结果 |
| --- | --- |
| `pnpm test` | **609通过**：CLI282、parity110、primitives148、registry addon4、docs65 |
| `pnpm check` | 全仓通过；Svelte 0 errors／0 warnings；124篇中文文档与英文源匹配 |
| `NODE_OPTIONS=--max-old-space-size=3072 CI=true pnpm build` | 全量生产构建成功；最后补 each key 后再次 `pnpm --filter docs build:svelte` 成功 |
| docs 下 `CI=true E2E_BASE_URL=<生产预览> PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=<桌面指针wrapper> pnpm exec playwright test` | **30通过，1.4分钟**；含独立消费者tarball安装、严格检查与构建 |
| 本批TS／Svelte的 Oxfmt、ESLint；`git diff --check` | 通过 |

`workbench.test.ts` 在既有文件中增加两组件各一组读写合同与一组拒绝用例：八套基线、安装源码与连续写回替换，Card 不破坏变量与条件布局，Tabs 不漏掉纵向／图标侧覆盖。首次 Tabs 单元断言错把第二段 `cn()` 字符串的下划线类当成第一段内容；改为检查完整安装源码，未修改组件去迁就测试。

新增两个浏览器用例：Tabs 验证四种组合的实际高度／间距／圆角、方向键切换内容并跳过禁用项、线型伪元素可见、对比状态隔离、390px与版本保存；Card 验证两尺寸独立、头部／页脚／贴边内容联动、390／768px最大留白、对比输入隔离、版本保存。两者均验证局部画布浅→深→浅的文字颜色、站点根主题不被改动，以及Esc归还入口焦点。补充颜色断言后再次执行全部生产预览E2E，仍为 **30通过，1.4分钟**。生产预览无写文件入口。

构建保留现有大chunk、浏览器外部化 `node:dns/promises` 和Cloudflare路由exclude数量提示；未通过调整阈值或部署来隐藏提示。

## 开发站真实写回

先备份原始Nova定制CSS及Card／Tabs安装JSON。两个开发接口均返回HTTP200，检查 `docs/static/registry/styles/nova/{card,tabs}.json` 并重新打开编辑器确认回读。

- Card：默认22、小尺寸10、标题区间距12、圆角md。安装源保留 `gap-(--card-spacing)`、`py-(--card-spacing)`、图片首项零顶部内边距及页脚条件；新增变量替换旧16／12。随后通过页面旋钮把默认22调至26，打开写回确认并点击“确认写回”；页面显示“已写回”，安装源码只有新6.5 spacing值、不再保留旧5.5，小尺寸仍为10。
- Tabs：水平高度40、内容间距14、列表内边距4、默认列表圆角sm、标签内边距14／6、标签圆角lg。回读旋钮全部匹配；实际横向列表40px，纵向列表保持自适应高度；默认列表圆角6px，线型仍0px；两方向列表内边距均4px。

完成后从备份恢复原文件并重建registry。`git diff --exit-code -- docs/src/lib/registry/styles/valar/style-nova.css docs/static/registry/styles/nova` 为空，不留下试验默认值。

## 视觉与交互证据

Chromium桌面hover／fine pointer、DPR2。检查1440px浅／深色、390px窄画布，1920px双栏对比；这是窄视口而非真实手机／Safari验收。

初次深色截图抓在颜色过渡期间，输入文字和未选中标签暂时仍是浅色画布的深文字。复查CSS声明及实际计算色，等待过渡完成后均恢复正确：Card输入文字为 `oklch(0.985 0 0)`，Tabs未选中文字为 `oklch(0.708 0 0)`。重新截图并逐张检查，没有添加多余的颜色覆盖；Tabs选中下划线可见。右侧全局token是打开编辑器时读取的站点主题值，不是局部深色画布值。

截图保存在 `.amp/in/artifacts/{tabs,card}-{light,dark,narrow,compare}.png`，汇总图为 `.amp/in/artifacts/tabs-card-{light,dark,narrow,compare}.jpg`，与交互录像在工作线程展示。录像使用真实移动指针，经过相邻／禁用标签后切换标签、方向键跳过禁用项、修改列表高度，随后调整Card留白；双栏对比通过独立截图与E2E验收，不声称该录像展示了双栏。不把静态截图或生成图当成交互验证。

日志：`/tmp/tabs-card-test2.log`、`/tmp/tabs-card-allcheck.log`、`/tmp/tabs-card-build.log`、`/tmp/tabs-card-build-final.log`、`/tmp/tabs-card-e2e-full.log`、`/tmp/tabs-card-e2e-final.log`。这些是本次orb运行记录，不作为组件源码分发。
