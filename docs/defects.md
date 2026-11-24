# metanum 当前已知问题登记册

| 项目 | 内容 |
|---|---|
| 性质 | 当前**未修复 / 暂缓 / 限制类**已知问题登记（含验收标准） |
| 基线 | 工作区 `main`（v2.2.0 + hyper_inv 连续实数逆运算），Node 24 |
| 最近盘点 | 2026-11-24（hyper_inv 验收后实测复核） |
| 关联 | [`notation-semantics.md`](notation-semantics.md)、[`engine-design.md`](engine-design.md)、[`../README.md`](../README.md)「Continuous real-valued inverses」 |
| 回归测试 | [`test_mixed.js`](../test_mixed.js)（`npm test`，含 G9 逆运算分组） |

> 2026-11-24 按维护者要求**移除全部已修复条目**：D01–D07、S01、FU-01..FU-05
> 及已关闭的上游 issue #19–#28 不再在本册登记（历史见 git 记录与
> [`d07-engine-design.md`](d07-engine-design.md) §7 的设计记录）。
> 以下每条给出：现象（实测）/ 位置 / 影响 / 验收 / 优先级。
> 优先级：**P2** 正确性、**P3** 显示一致性 / 语义冲突、**P4** 文档、特性、流程。

---

## K01 · `expande(4, 2.5) = 10`：分数高度下底数映射表示级非单调（P2）

**现象**（实测）

```js
MetaNum(4).expande(2.5)     // 10（array [[10]]）
MetaNum(3.5).expande(2.5)   // 巨值，> MetaNum(3).expande(2.5)
MetaNum(2.75).expande(2.5)  // < MetaNum(3).expande(2.5)   // [2.75, 3.5] 区间单调
```

即 `n ↦ n{ω+1}2.5` 在 `n = 4` 处坍缩为 10，与邻域单调性矛盾。

**位置**：`metanum.js` `P.expande` 分数高度 successor 路径（`_hyperopFromOrdinal(x, 2.5, [1,1])`）。

**影响**：正确性存疑；并使根型求逆 `MetaNum(3).expande(2.5).expande_root(2.5)` 无法建立严格夹逼，有界失败（`stagnated` NaN，测试 G9.5.b.expande 记录）。

**验收**
- [ ] 定义 `n{ω+1}(m+f)` 在非整数高度下对底数 `n` 的正确语义（对照 README successor 插值规则），使 `n=4` 不再坍缩为 10；或
- [ ] 若为设计行为，在 `notation-semantics.md` §3 与 README 中显式记录，并把 `expande_root` 在该域的失败分类标为已知限制。

---

## K02 · 分数底数使 `ω^2` 族正向递归爆栈（P2）

**现象**（实测）

```js
MetaNum(2.5).megote(3)        // RangeError: Maximum call stack size exceeded
MetaNum(2.5).multimegote(3)   // 同上
MetaNum(2.5).aperimegote(3)   // 同上
```

**位置**：`metanum.js` `Q._hyperopFromOrdinalRaw` 递归（`megote` = `ω^2+1` 层，分数底数时降层不收敛）。

**影响**：该族的分数底数正向调用与求逆均不可用；测试矩阵该行记 `SKIP`（G9.5.n.megote 等，带原因，不用其他样例替代）。

**验收**
- [ ] 分数底数 `x ∈ (2,3)` 时 `_hyperopFromOrdinalRaw` 有界终止（正确值或受控失败）；或
- [ ] 定义域显式拒绝分数底数并抛受控异常，测试矩阵随之改预期。

---

## K03 · `slog` 闭式近似与主分支实数逆不一致（记录的冲突，P3）

**现象**（实测）

```js
MetaNum(65536).slog()                   // 1.8342488308601794（Lambert-W 闭式近似）
MetaNum.hyper_log(65536, 10, 2)         // 1.6827297550016（主分支实数解，R_rel 达标）
MetaNum(16).slog(2)                     // 3 === MetaNum.hyper_log(16, 2, 2)   // 整数高度一致
```

**状态**：旧严格断言（`test_mixed.js` G8.11：`slog(65536) ≈ 1.8342488308601794`）钉死 slog 的近似契约；按冲突门禁**不单方改旧断言**，保留 slog 并在 README「Continuous real-valued inverses」单列差异。

**影响**：用户可能把 `slog` 当作 `10{2}b=c` 的实数解使用；两者在非整数高度差异显著（≈0.15）。

**验收**
- [ ] 规格层裁决：`slog` 保持独立近似契约（现文档写法），或重新定义 `slog` 为主分支实数逆（需同步改旧断言，走需求复核）。

---

## K04 · `aperiote` 等高层正向在基数 1 处不折叠为 1（P3）

**现象**（实测）

```js
MetaNum(1).aperiote(10)   // 1      ✓
MetaNum(1).aperiote(20)   // W^17 VVU^8 ... 巨值   ✗（应为 1）
MetaNum.arrow(1, 39, 39)  // 同样不折叠            ✗
```

**位置**：`metanum.js` 有限 arrow 层 / 序数引擎对 `x = 1` 的特例只覆盖到低层。

**影响**：`1{α}b = 1` 规则在高 b 的高层失效；影响根型求逆在 `n = 1` 端点的取值（求解器把 `F(1,b) > c` 误判为「目标低于分支像」）。

**验收**
- [ ] `aperiote(1, b)` 与 `arrow(1, L, b)` 对所有合法 `b` 返回 1；或确认引擎语义并在 README 记录该边界。

---

## K05 · `epsilonate` 对 `y ∈ (1,2)` 存储与 `y+1` 相同的 marker（P3）

**现象**（实测）

```js
MetaNum(10).epsilonate(1.5).eq(MetaNum(10).epsilonate(2.5))   // true
```

**根因**：`P.epsilonate` 用 `m = max(2, ⌊y⌋)` 且保留 `frac = y − ⌊y⌋`，对 `y∈(1,2)` 得到 `m=2, f=y−1`，即编码 `y+1`。

**影响**：该区间的对数型求逆返回 `y+1` 作为复现高度（已如实分类 `approximate + representation-level`，测试 G9.8 记录为「正向既有约定」）。

**验收**
- [ ] 定义 `ε₀` 层对 `y ∈ (1,2)` 的正确编码（`m=1` 区间延拓或显式拒绝）；或文档化为既定约定并保留逆运算的复现值语义。

---

## K06 · 对角字母小参数 / 低精度 mantissa 的 format 往返仅容差级（P3）

**现象**（实测）

```js
format(MetaNum("Aa1.5"))    // "EE1.537E924"           roundtrip eq: false
format(MetaNum("!1Aa1.5"))  // "2.236Aa1"              roundtrip eq: false（容差内）
format(MetaNum("!Aa2.5"))   // "!4.472Aa2"             roundtrip eq: false（容差内）
```

**位置**：`format-metanum.js` `formatBangAaValue` / 通用对角路径；parser 反推 `x = β + log₅(α/2)` 的浮点误差。

**影响**：这批值的 `format` 输出只能容差意义下还原（`notation-semantics.md` §2「已知残余」原样保留）。

**验收**
- [ ] 提高对角 mantissa 有效位或引入精确 token 形覆盖 `x < 2` / 短 mantissa 形状，使往返严格成立；或维持容差契约并在规范中明示（现状）。

---

## K07 · token 深度 > 64 时退回进位近似，不保证往返（P4，设计如此）

`Aaaaa…` 纯对角 token 深度超过 64 个字符时，formatter 退回单字母进位近似（#28 的既定行为），`parse(format(x)).eq(x)` 不再保证。`notation-semantics.md` §2 已记录；无需修复，仅登记。

---

## K08 · 求逆的表示级限制（非缺陷，登记备查，P4）

连续实数逆运算（README「Continuous real-valued inverses」）在以下情形给出**有界失败或表示级分类**，属表示能力边界，均已在 `test_mixed.js` G9 分组如实断言：

- `aperioguate(3, 2.5)` 求逆：正向在表示级非单调（`F(3, 2.49)=F(3, 2.51)=c` 但 `F(3, 2.4709)>c`），无法建立严格 bracket → `stagnated` NaN。
- `iterate(3, 2.000001)` 求逆：双精度分辨率不足 → `stagnated` NaN。
- `root(1e300, 1000, 1)`：闭式候选经 `1.995^1000` 误差放大，正向代入验证失败 → `unrecoverable`（设计允许「丢弃并失败」）。
- 高量级值的 `cmp = 0` 只作「表示级代入一致」报告，数值残差为 `null`，不写 0。

---

## K09 · 测试覆盖缺口（SKIP 登记，P4）

- 正向侧 Infinity 溢出向量无法构造：公开正向饱和为有限 ε-marker（`epsilonate(10, epsilonate(10, 5)) = 1ε9007199254740990`），无稳定复现路径（G9.12.10）。
- secant 候选「实际越界 / 残差恶化被拒」分支只能经 `fallbackCount` 间接覆盖；强制注入需生产 hook，按 12.4 未添加（G9.12.11）。

---

## K10 · `ω^ω` 层 `x ≥ 3` 精确级联不可行（not planned）

`3{ω^ω·2}2 = 3{ω^ω+ω²}3` 级精确级联是天文数字且层 1 行格式无法存储后继链有限部；两次复评均撤回。marker（layer + 行，base 10）保持为**应有的渐近近似**，`2{λ}y = 4`（B2-a）不受影响。详见 [`d07-engine-design.md`](d07-engine-design.md) §7。**不建议在没有明确需求时投入。**

---

## K11 · F01 分隔符记法（feature，暂缓）

用分隔符表示 `ω^ω+n … ω^(ω^ω)` 之间的值——新增记法，非缺陷。待语义规范稳定后单独评估（上游 issue #24）。

---

## K12 · 流程待办（P4）

- [ ] 向 dlsdl/metanum 提 PR（若上游停滞，经 fork 供游戏采纳）。
- [ ] `docs/testing.md`（测试 / 差分测试计划）与 `docs/serialization.md`（序列化兼容契约）仍未撰写（原文档计划 C/D）。

---

## 附：如何复核本册

```bash
node test_mixed.js        # 全套回归（含 G9 逆运算分组；FAIL/ERROR 行会使退出码非 0）
node -e "console.log(require('./metanum.js').epsilonate && require('./metanum.js')(10).epsilonate(1.5).eq(require('./metanum.js')(10).epsilonate(2.5)))"
```

本册每条「现象」均可由上方调用形式直接复现；登记格式沿用旧册（现象 / 位置 / 影响 / 验收 / 优先级）。
