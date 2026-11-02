# Accordion、Alert Dialog 组件页编辑器验收

日期：2026-11-02。实现、截图与运行证据：[Amp 工作线程](https://ampcode.com/threads/T-01a199a9-28fa-709a-8877-6fe766c7497e)。

本批E8接入两个现有组件的全屏编辑器，不是跨框架转换，不修改primitive/API或默认外观，不扩展旧Studio。覆盖从27增至 **29／68个**，剩余39个（P2十五、P3十五、P4九）。用户授权验收后统一提交推送；最终提交及GitHub CI状态见工作线程。不发布包或部署站点，不修改用户自写guides，不自动启动下一批。

## 参数合同与边界

| 组件 | 参数 | 保留的差异与行为 |
| ---- | ---- | ---------------- |
| Accordion | 标题纵向留白0–32px；标题与内容共同横向留白0–32px；内容底部留白0–40px，步长2 | 横向同步Trigger与Content外层，底部只改Content直属inner。保留段落间距、内嵌控件、图标、边框、圆角和展开规则。不增加动效旋钮：八套Content均沿用accordion-down／up，无独立duration类，tw-animate-css回退200ms／ease-out |
| Alert Dialog | default宽度sm／md／lg／xl／2xl（仅≥640px）；padding8–48px、gap4–40px，步长2；圆角档位／样式自带；遮罩0–80%、步长10；快／中／慢全局时长档；90／95／100%缩放 | 小尺寸宽度原样保留（一般320px，Mira256px）；Nova贴边页脚负边距、padding与底部圆角随主体联动。保留Header／Media／Title／Description、按钮样式、Footer响应式排列及确认语义 |

两者使用真实八套flattened registry lazy loader，独立storageKey为 `valar.accordion-styles.v2`／`valar.alert-dialog-styles.v2`。当前值不是样式名默认值表；缺失或不兼容的必要源码明确拒绝。preview CSS限定pane，page CSS排除所有编辑器，空草稿不生成覆盖，全局token只读。白名单只新增有限几何／动效类，不开放任意CSS、语义配色或子按钮权限。Alert Dialog直接复用Dialog现有宽度表，仅将原 `WIDTH_REM` 导出，没有另造宽度体系。

Accordion画布包含single／multiple、初始展开、多段长文、本地锚点、内嵌Button、禁用项；每pane／模式状态独立，标记按钮只更新本地反馈。Alert Dialog默认内联展示，可切default／sm和真实确认流程；Portal禁用仅为保持主题与草稿作用域，真实模式保留焦点圈定、锁滚动、遮罩不关闭、Esc关闭及归还Trigger焦点。内联模式不锁焦点，Esc交给编辑器。首次确认等待600ms并模拟失败，期间Spinner与两个按钮禁用；重试成功后关闭。关闭／销毁清理计时器，不发请求或删除数据。

### 八套真实基线

单位px；Alert Dialog时长均fast、缩放均95%。

| 样式 | Accordion标题Y／共同X／底部 | Alert Dialog宽度／padding／gap／圆角／遮罩 |
| ---- | --------------------------- | ----------------------------------------- |
| Nova | 10／0／10 | sm／16／16／xl／10% |
| Vega | 16／0／16 | lg／24／24／xl／10% |
| Lyra | 10／0／10 | sm／16／16／none／10% |
| Maia | 16／16／16 | md／24／24／4xl／80% |
| Mira | 8／8／16 | sm／16／12／xl／80% |
| Luma | 16／16／16 | md／24／24／4xl／30% |
| Rhea | 16／16／16 | md／24／24／样式自带／30% |
| Sera | 16／0／16 | md／24／24／none／20% |

## 自动验证

使用Node24.22.2、pnpm12.14.0。

- `pnpm build:cli`：通过。
- `pnpm test`：**630通过**（CLI282、parity110、primitives148、registry addon4、docs86）。新增3个永久合同覆盖八套真实基线、非对称连续写回／安装源码回读、未调部件与语义保留、非法参数和白名单拒绝。
- `pnpm check`：全仓通过；Svelte **0 errors／0 warnings**。
- `NODE_OPTIONS=--max-old-space-size=3072 CI=true pnpm build`：通过。
- 完整生产Playwright：**45通过（2.2分钟）**，包括独立tarball消费者严格check／build。新增两个合同验证打开、实时参数、对比隔离、保存版本、Esc归还焦点与关闭后的page CSS。
- Accordion运行合同覆盖方向键、Home／End跳过disabled，Enter／Space、single／multiple和内嵌Button；390px最大横向留白无画布溢出。
- Alert Dialog运行合同覆盖default宽度与sm320px不变、Nova页脚联动、焦点循环、遮罩不关闭、Cancel／Esc归焦、pending禁用与Spinner、失败保持、重试成功关闭、pane隔离。390px最大padding48／gap40无画布横向溢出。
- 新增两项在开发站也通过（20.5秒）；本批源码局部Oxfmt、ESLint及 `git diff --check` 通过。

限定Accordion子任务只负责两个编辑器文件；主线程负责Alert Dialog、共享接入、永久合同、浏览器、真实写回与全仓回归。子任务额外24次八样式连续回读和194次编译不代替运行验收，未保留临时harness。

## 开发站真实写回与恢复

通过两个编辑器的“写回组件库…”确认框执行，POST均200；检查安装用registry、刷新后的无草稿页面和重开编辑器基线：

- Nova Accordion：标题Y22px、共同X14px、底部30px。registry含 `px-3.5`，页面标题padding-left14px、padding-top22px，重开基线22。
- Nova Alert Dialog：padding26px、gap18px、遮罩40%、default宽度lg、slow。registry含 `data-[size=default]:sm:max-w-lg`，页面真实确认框padding26px、max-width512px，Nova页脚margin-left−26px，重开基线26。

临时验收 **1通过（1.1分钟）**。首次脚本在写回页面重载后、重新水合完成前点击普通Show Dialog，trace显示点击紧邻Vite重新连接，确认框未打开；补上已有“微调”入口启用的就绪等待后完整通过，没有修改产品行为。结束后仅在CSS等于原文或自身预计写入时恢复，避免覆盖并发写入；精确恢复原CSS并重建registry，Valar样式及生成registry均无Git差异。验收值未设为新默认，临时测试已删除。

## 视觉与交互证据

工作线程 `.amp/in/artifacts/` 保存最终截图并逐张检查。全部DPR2；390px为Chromium窄视口模拟，不是实体手机或Safari验收。长画布／参数栏允许纵向滚动，不要求全部内容同屏；“写回组件库…”省略号是已有按钮文案。

| 状态 | Accordion | Alert Dialog |
| ---- | --------- | ------------ |
| 1440浅色默认 | `e8-accordion-light.png` | `e8-alert-dialog-light.png` |
| 局部深色 | `e8-accordion-dark.png` | `e8-alert-dialog-dark.png` |
| 1920并排对比 | `e8-accordion-compare.png` | `e8-alert-dialog-compare.png` |
| 390最大参数 | `e8-accordion-narrow.png` | `e8-alert-dialog-narrow.png`（sm、padding48／gap40，内容scrollWidth与clientWidth均320px） |
| 小尺寸／确认失败 | 不适用 | `e8-alert-dialog-small.png`／`e8-alert-dialog-error.png` |

深色切换与加入对比侧会触发原组件过渡／进入动画；捕获结束状态时等待动画结束，最终截图标题与确认框文字均清晰。两个交互录像为 `e8-accordion-interaction.mp4`、`e8-alert-dialog-interaction.mp4`（附loop.webp），使用真实移动指针并检查帧；精确行为及数值以执行过的E2E／DOM断言为准，不把低分辨率联系表当作文字证明。

## 后续

下一候选Avatar、Item，仍须用户确认。其余优先级已同步[工作台路线图](WORKBENCH.md)；不为68／68覆盖率制造无必要的旋钮。
