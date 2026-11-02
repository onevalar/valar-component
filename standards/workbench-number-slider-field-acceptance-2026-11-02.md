# Number Field、Slider Field 组件页编辑器验收

日期：2026-11-02。实现、截图、录像及最终提交链接：[Amp 工作线程](https://ampcode.com/threads/T-01a199a9-28fa-709a-8877-6fe766c7497e)。

本批 E10 为现有两个组件接入全屏编辑器，不是跨框架转换，不替换交互库、不改公开 API，不扩展旧 Studio。覆盖 **33／68**，剩余35（P2十一、P3十五、P4九）。用户授权验收后统一提交推送；不发布包、部署、修改用户自写 guides 或自动开始下一批。

## 参数与源码接入合同

| 组件 | 可调参数 | 联动与保留边界 |
| ---- | -------- | -------------- |
| Number Field | 外框高度沿用真实 Button 的 xs／sm／default／lg 档位或样式自带；共同圆角档位或样式自带；数字区横向留白0–16px、步长2 | 外框、input、加减按钮联动；按钮在外框内保持正方形，圆角同步逻辑起止侧。保留数值、边界、步长、本地化、readonly、disabled、校验、表单和重置 |
| Slider Field | 列间距0–32px、行间距0–24px、步长2；数值框宽96–192px、步长8 | 只调组合布局，不复制子Slider的轨道、把手和Number Field的高度／圆角；保留双向同步、无效输入保留上值和表单校验 |

两个原组件只补最小cn锚点。默认字面工具类保留，锚点使用其后的独立字符串参数，如 `cn("w-32", "cn-slider-field-value")`，调用处class仍在最后。不能把cn锚点放回默认类同一字符串：格式化排序可能把它前置，安装展开后旧字面工具类会反压新值。解析器按原组件使用的cn归并全部字符串参数后读取最终几何，而非只读第一个字面量。

真实八套flattened registry采用lazy loader，不按样式名猜基线。独立存储键为 `valar.number-field-styles.v2`／`valar.slider-field-styles.v2`；全局token只读，空草稿不输出覆盖，preview限指定pane，page CSS排除所有编辑器。白名单只放行本批几何，不开放颜色、自由CSS、数值业务属性或子Slider权限。

### 原始几何与高度决定

八套源码的Number Field内部input和加减按钮均40px，数字区横向留白8px、圆角md。外框保留border及40px最小高度；当前1px上下边框下，真实外框是 **42px而非40px**。编辑器以Button探针量取档位，并从Number Field探针量取上下边框和；原42px不匹配档位时显示“样式自带”，不偷偷统一默认值。

显式选择高度后，根写入 `h-N min-h-N`，input写入 `h-full`，按钮写入 `size-full w-auto aspect-square`，依赖实际可用高度而非复制固定像素差。Nova选default后外框32px、input／按钮30px，按钮宽30px；再选xs后外框24px、按钮22px，均经真实DOM验证。圆角使用逻辑首尾属性，不把左右方向写死。

八套Slider Field基线均为列间距12px、行间距8px、数值框宽128px。

## 真实画布与交互

Number Field包括数量边界、负小数、de-DE欧元、百分比、readonly、disabled、外部aria-invalid、真实FormData提交与reset。Slider Field包括宽度80、负偏移−2.5、无单位比例0.5、禁用64以及真实表单反馈。每pane分别保存值、提交状态和唯一ID，使用真实组件，不自造键盘／粘贴处理或模拟slider。

浏览器断言验证：Home／End边界与禁用按钮、ArrowUp／ArrowRight、−1.26按步长提交为−1.3、`1.234,56 €`提交纯数字1234.56、25%提交0.25、禁用字段不提交、reset恢复初始值。Slider无效999或清空时仍保留有效80，方向键变82，负偏移提交−2.75。对比两侧状态与样式独立，保存版本作用普通页面，Esc返回入口焦点。

390px最大参数下两画布均满足 `scrollWidth <= clientWidth`。Slider轨道高度仍4px，Number Field原外框仍42px，证明组合布局不改子控件几何。此为Chromium窄视口，不是实体手机或Safari验收。

## 开发站真实写回

两个真实编辑器确认框发起POST，均200；检查磁盘Valar CSS、安装registry、无草稿刷新后的页面及重开编辑器基线：

- Nova Number Field：外框32px、数字区留白12px；普通页面和重开基线吻合。已安装后继续草稿选xs、留白14px，外框24px、按钮22px、留白14px，证明新草稿不被已安装工具类压住。
- Nova Slider Field：列26px、行18px、宽176px；普通页面和重开基线吻合。已安装后继续草稿宽104px，真实数值框104px。

临时验收2项通过（1.1分钟）；结束后精确恢复Valar CSS并重建registry。默认CSS没有Git差异；16份tracked生成registry仅保留本批cn接线的源码变化，未保留验收时几何定制。临时验收脚本已删除，不作为长期测试成本保留。

## 自动回归

使用Node24.22.2、pnpm12.14.0。

| 检查 | 实际结果 |
| ---- | -------- |
| `pnpm build:cli` | 通过 |
| `pnpm test` | 本批初验634通过；保留远端Avatar修复并更新依赖后重跑，**636通过**：CLI282、parity110、primitives148、registry addon4、docs92 |
| `pnpm check` | 全仓通过，Svelte **0 errors／0 warnings** |
| 局部Oxfmt／ESLint、`git diff --check` | 通过 |
| `NODE_OPTIONS=--max-old-space-size=3072 CI=true pnpm build` | 通过，未发布／部署 |
| 完整生产Playwright | **49 passed (2.3m)，1 skipped**；跳过需显式开启的开发站Avatar写回测试，不向生产preview写入 |
| 本批开发站浏览器合同 | 2 passed (20.5s) |
| 本批临时视觉与真实写回 | 2 passed (1.1m)，恢复默认后删除脚本 |

保留两项安装合同和两项浏览器合同。安装合同覆盖八套样式、连续非对称写回／回读、编译、未知／越界输入拒绝及Slider Field的子控件源码保持。完整生产回归还覆盖独立tarball安装、消费者严格检查／构建、已有组件和已安装样式合同。

Slider Field子任务负责最小源码接线及两个编辑器文件；其静态harness另验证24次八套安装回读／编译和2873个合法参数组合。主线程完成Number Field、入口／白名单、永久合同、真实浏览器、写回恢复、生产回归及整合；子任务静态报告不代替主线程的运行验收。

## 视觉与录像证据

最终截图DPR2并逐张检查；局部深色只改变画布，参数面板仍跟随站点主题。对比在1920px，默认浅色与局部深色在1440px，窄屏390px并滚到真实画布。文件均位于工作线程的 `.amp/in/artifacts/`，可直接审阅的图片／录像链接见工作线程与验收artifact。

| 状态 | Number Field | Slider Field |
| ---- | ------------ | ------------ |
| 默认浅色 | `e10-number-field-light.png` | `e10-slider-field-light.png` |
| 局部深色 | `e10-number-field-dark.png` | `e10-slider-field-dark.png` |
| 并排对比 | `e10-number-field-compare.png` | `e10-slider-field-compare.png` |
| 窄屏最大参数 | `e10-number-field-narrow.png` | `e10-slider-field-narrow.png` |
| 真实移动指针交互 | `e10-number-field-interaction.mp4`，6.6秒 | `e10-slider-field-interaction.mp4`，5.8秒 |

录像经过邻近控件；Number Field展示加减交互，Slider Field展示真实拖动及按钮同步，末帧slider／input均148。录像及联系表帧已检查；本地化输入与表单由前述浏览器合同覆盖，不以短片代替。截图用于展示外观，精确尺寸和行为由执行过的DOM断言验证。

录制工具第一次恢复浏览器会话为空页，重新打开实际页面后重录；失败片段不作为证据。没有为自动化改变产品行为。临时preview、包装器和debug文件在收尾移除；文档开发服务保留用于用户审阅。

## 后续与交付

首次推送因远端main新增[Avatar动态换源修复](https://github.com/onevalar/valar-svelte/commit/dc8c5fd4add81b75d1d168fda9bcb3aa082314bf)而拒绝。已无冲突变基，完整保留其源码、依赖补丁、文档及测试；依照新lockfile安装依赖后重跑集成验收，不覆盖远端历史。

集成后的生产构建通过。首次集成浏览器回归为48通过、1跳过、1失败：首项Slider测试在导航时收到 `ERR_CONNECTION_REFUSED`，尚未进入组件断言，预览服务随后就绪。确认目标页面HTTP200后完整重跑，最终 **49 passed (2.3m)，1 skipped**，包括独立消费者的同实例Avatar换源检查；没有改产品或测试断言，也未配置测试重试。

路线图同步到[WORKBENCH](WORKBENCH.md)。下一候选Tags Input，仍需用户确认，不自动推进。代码及本记录按授权一起提交推送；最终提交链接、CI后续及可审媒体见工作线程。当前验证是orb内构建与运行验收，不代表部署，也不自动升级消费者已安装的组件。
