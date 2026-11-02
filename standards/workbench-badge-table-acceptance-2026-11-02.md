# Badge、基础 Table 组件页编辑器验收

日期：2026-11-02。实现与可查看的运行证据：[Amp 工作线程](https://ampcode.com/threads/T-01a199a9-28fa-709a-8877-6fe766c7497e)。

本批 E6 为两个现有组件接入 `ComponentTuner`，不是跨框架转换，不修改 primitive/API，不扩展旧 Studio。组件页编辑器从23增至 **25／68个**，剩余43个；P1候选全部接入。用户已授权本批完成后一起提交推送，最终提交与GitHub CI状态见工作线程。不发布包或部署站点，不自动启动P2。

## 参数合同与边界

| 组件 | 参数 | 保留的差异与行为 |
| --- | --- | --- |
| Badge | 文字侧水平留白0–24px、图文间距0–16px，步长2；共同圆角档位／样式自带 | 只写 `px-*`，不覆盖起始图标侧 `pl-*`／末尾图标侧 `pr-*` 条件类；不调高度、上下留白、SVG尺寸、字号或六变体语义配色。没有href时仍为span，有href时仍是原生anchor，不伪装成按钮 |
| 基础 Table | 表头高度下限24–64px、表头横向留白0–32px、数据格横向留白0–32px／纵向留白0–24px，均步长2 | 表头高度不是内容截断上限。数据格参数包含页脚；含复选框的表头／数据格保留右侧零留白。保留容器横滚、caption、thead／tbody／tfoot、对齐及分隔线；列定义、排序、筛选、分页和行选择不参数化 |

两个编辑器均从八套flattened registry读取真实基线，无按样式名默认值表。使用独立 `valar.badge-styles.v2`／`valar.table-styles.v2` 存储；全局token只读。预览CSS限制在指定pane，页面版本CSS排除所有编辑器。白名单只新增 `cn-badge`、`cn-table-head`、`cn-table-cell` 的有限几何工具类，不开放颜色、任意CSS或表格容器权限。

Badge画布覆盖六变体×纯文字／起始图标／末尾图标／真实href，共24项；锚点目标包含组件实例与pane标识。Table画布包含有caption和合计页脚的账单表、独立嵌入复选框、固定选中行外观和Empty空状态。复选框不执行行选择或全选，两侧独立状态；数字列右对齐且使用tabular-nums。窄屏保留可读列宽，由真实Table容器局部横滚。

### 八套基线

单位px。Table表头与数据格横向留白在基线相同，数据格纵向留白也相同，故合并为一列。

| 样式 | Badge文字侧／gap／圆角 | Badge高度／图标侧留白 | Table表头高度／留白 |
| --- | --- | --- | --- |
| Nova | 8／4／4xl | 20／6 | 40／8 |
| Vega | 8／4／4xl | 20／6 | 40／8 |
| Lyra | 8／4／none | 20／6 | 40／8 |
| Maia | 8／4／4xl | 20／6 | 48／12 |
| Mira | 8／4／full | 20／6 | 40／8 |
| Luma | 8／4／3xl | 20／6 | 48／12 |
| Rhea | 8／4／2xl | 20／6 | 40／8 |
| Sera | 0／6／none | 自动／0 | 48／12 |

保留Mira较小SVG、Sera自动高度／字距／大写、各Table表头字号及样式差异；没有统一抹平。

## 自动验证

Node24.22.2、pnpm12.14.0。

- `pnpm build:cli`、registry重建通过。
- `pnpm test`：**624通过**（CLI282、parity110、primitives148、registry addon4、docs80）。新增3个永久合同覆盖八套基线、非对称连续写回／安装源码回读、未调样式与语义保留、非法参数和白名单拒绝。
- `pnpm check`：全仓通过；Svelte **0 errors／0 warnings**。
- `NODE_OPTIONS=--max-old-space-size=3072 CI=true pnpm build`：通过。
- 完整生产Playwright：**41通过（2.0分钟）**，包含独立tarball消费者严格check／build。新增Badge与Table合同覆盖调参、对比隔离、保存、Esc归还焦点、原生锚点键盘跳转、嵌入复选框Space与禁用、caption／表头／合计、390px大留白及横滚到金额列。
- 第一次生产E2E启动早于预览站就绪，最先两项报connection refused，其余39项通过；确认预览HTTP200后完整重跑41项通过，不以重试次数隐藏产品失败。
- 本批源码格式、ESLint和 `git diff --check` 通过。
- 临时验证遍历Table全部选项，八套样式共168次连续合并→展开→回读；输出工具类经真实Tailwind编译，并检查preview／page选择器隔离。Badge限定子任务验证1170组合法参数及八套源码回读，由主线程的永久合同、真实写回和浏览器合同交叉核对；不把子任务静态结果冒充运行时验收。临时脚本已删除。

## 开发站实际写回与恢复

通过两个编辑器的“写回组件库…”及确认框实际执行，POST均200，中途不重启开发站：

- Nova Badge：文字侧22px、gap10px、xl圆角；生成registry含 `px-5.5 gap-2.5 rounded-xl`，刷新后无草稿页面计算padding-left为22px，重新打开编辑器基线为22。
- Nova Table：表头54px／横向18px、数据格横向14px／纵向6px；生成registry含 `h-13.5 px-4.5` 与 `px-3.5 py-1.5`，刷新后无草稿表头54px，重新打开基线54；嵌入复选框单元格padding-right仍为0。

写回前保存精确CSS备份；仅在文件仍等于自身写入或原备份时恢复，随后重建registry。最终Valar样式文件和生成registry均无差异，验收用参数未设为新默认值。首次刷新等待5秒不足以覆盖开发站冷编译，延长验证脚本的导航等待后完整通过；没有改产品代码绕过等待。

## 视觉与交互证据

以下文件在工作线程 `.amp/in/artifacts/` 中，已逐张检查。1440px浅色默认、局部深色、1920px并排对比、390px大参数均有两个组件的独立截图；这是Chromium窄视口，不是实体手机或Safari验收。

| 状态 | Badge | Table |
| --- | --- | --- |
| 浅色默认 | `e6-badge-light.png` | `e6-table-light.png` |
| 局部深色（颜色过渡结束） | `e6-badge-dark.png` | `e6-table-dark.png` |
| 并排对比 | `e6-badge-compare.png` | `e6-table-compare.png` |
| 390px最大参数 | `e6-badge-narrow.png` | `e6-table-narrow.png` |

Badge窄屏允许每行链接自然换行，不裁切徽标或撑宽pane。Table保留局部横滚：已执行的E2E验证pane无横溢、容器scrollWidth大于clientWidth、横滚后scrollLeft大于0且金额表头进入视口，不以截图中看不见滚动条推断不能滚动。深色截图等待颜色过渡结束，不交付过渡中正文尚未变亮的捕获。

`e6-badge-interaction.mp4`／`.loop.webp` 展示真实指针经过相邻链接及悬停／点击；`e6-table-interaction.mp4`／`.loop.webp` 展示经过表头和相邻行、切换独立复选框、键盘将纵向留白改为24px后的实时变化。已检查5fps联系表；不把短片未清晰展示的锚点跳转／Esc结束帧称为录像证据，这些行为由已执行的生产E2E验证。

## 后续

P1已无剩余项。P2十九项、P3十五项、P4九项合计43项缺的是组件页编辑器，不是组件本身。按真实页面需要选择下一批，不默认追求68／68；不修改用户自写的 `skills/valar-svelte/guides/`。
