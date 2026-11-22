# D07 / B2 引擎设计：`ω^ω` 层的精确 `λ[b]` 归约

| 项目 | 内容 |
|---|---|
| 目标 | 让 `cuboiter`/`expoiter`/`trioterate`/`trixxate`/`aperixxate`/`epsilonate` 对**小 y** 给出与 rule 3 一致的精确值（当前是 marker 近似） |
| 依据 | [`notation-semantics.md`](notation-semantics.md) §3（`λ[b]`） |
| 现状 | 仅 `x=2,y=2 → 4` 有正确快速路径；`aperionate`(ω²)/`iter`(ω^ω) 本身对 `y < maxCols` 已精确 |
| 状态 | B2-a 已实现（`2{λ}y=4`）；B2-b..d 待定 |

> **2026-11-20 更新**：rule 3 已统一为 `n{λ}b = n{λ[b]}b`（见 notation-semantics.md §3），B2-a 相应收缩为 **2-对角线**：`2{λ}2 = 4`；`2{λ}y`（y≥3）随 y 增长（如 `2{ω}3 = 65536`），marker 层的 `2{λ}5` 复现与底数无关的层标记。本文其余部分为统一前的历史设计记录。

---

## 1. 问题

`x{λ}y = x{λ[y]}x`（rule 3）。对 `λ ≤ ω²`，`λ[y]` 是有限 coeffs 序数，现有 `_hyperopFromOrdinal` 能精确级联。

对 `ω^ω` 及以上，`λ[y]` 含 `ω^ω` 项，**不是有限 coeffs**，例如：

```
(ω^ω)[y]      = ω^y
(ω^ω·2)[y]    = ω^ω + ω^y
(ω^(ω+1))[y]  = ω^ω·y
(ω^(ω·2))[y]  = ω^(ω+y)
(ω^(ω²))[y]   = ω^(ω·y)
(ω^(ω^ω))[y]  = ω^(ω^y)
```

现有实现把这些直接编码成 `layer` + marker 行（`_layerMarker`），**跳过了 FS 级联**，因此对有限 y 只是渐近正确。

**已排除的简化**：规则 4 不是 `x{α+β}z = x{α}(x{β}z)`。反例：
`3{ω+1}2 = 3{ω}3 = 3{3}3`（rule 2），而 `3{ω}(3{1}2) = 3{ω}9 = 3{9}3`，不相等。
所以必须显式实现 `λ[b]` 下降。

---

## 2. 要新增的能力

精确计算 `x{λ}y`，其中 `x,y` 为有限、`λ` 属于 `ω^ω` 层（可写成

```
λ = ω^ω·c_ω + (有限 coeffs 尾，各指数 < ω)
```

的「层 + 有限尾」正规形）。需要的操作：

1. **表示**：`(layerTop, tailCoeffs)`，`layerTop` 为顶层 ω 塔（如 `ω^ω`），`tailCoeffs` 为 `[c0,c1,…]`（有限项）。
2. **基数列**：对正规形实现 `λ[b]`（见 §1 表 + 有限尾的标准 FS）。
3. **级联**：`x{λ}y`：
   - 若 `λ` 有限 coeffs（尾）→ 交给 `_hyperopFromOrdinal`（已精确）。
   - 若 `λ` 为极限（顶层 `ω^ω`）→ `x{λ[y]}x`，递归。
   - 若 `λ` 为后继（`c0>0`）→ rule 2：`x{λ-1}` 迭代 `y-1` 次。
   - 顶层 `ω^ω` 且尾为 0 → `x{ω^ω}y = x{ω^y}x`，可用 `iter`（对 `y<maxCols` 精确）。
4. **溢出**：当 `⌊y⌋` 或级联深度超出 `maxCols`/`maxRows`/预算时，回落到现有 marker 近似（保持大数性能）。

---

## 3. 实现策略（二选一）

### S1 · 独立符号序数求值器（推荐用于正确性）

新增一个小型序数正规形 AST（或 `{omegaTower, coeffs}` 结构）+ `fs(λ,b)` + `cascade(x,λ,y)`。求值结束时把结果转成 `MetaNum`。
- 优点：与值的 `layer`/marker 表示解耦，逻辑清晰，易测试。
- 缺点：新增子系统；需要把中间大数转成 `MetaNum`（可能很大，需截断规则）。

### S2 · 扩展现有 marker 级联（推荐用于集成）

复用 `layer` + `_applyOrdinalRows` + `_hyperopFromOrdinal`：
- 新增 `_hyperopLayerPlusTail(x, y, topLayer, tailCoeffs)`；
- 极限情形按 `λ[b]` 递归；有限尾复用 `_hyperopFromOrdinal`；
- marker 作为溢出回落。
- 优点：与现有表示一致，改动集中。
- 缺点：`_ordinalHyperop` 的 `coeffs` 假设（有限）需小心绕开，条件分支多。

**建议**：先按 S2 实现 `cuboiter` 一个层级并验证，再推广；若分支过于复杂再转向 S1。

---

## 4. 测试策略

1. **对照精确引擎**：对 `x=3,4,5`、小 `y`，把新结果与
   `aperionate`（ω²）、`iter`（ω^ω）一致；对 ω^ω·2 及以上无现成精确参照，则用
   rule 3 手算的 `x{λ[b]}x` 链做断言。
2. **坍缩边界**：`2{λ}y`（任意 `y` 中有可坍缩者）、`x{λ}1 = x`。
3. **单调性**：`x{λ}y` 对 `y`、对 `λ` 层单调不降。
4. **不回归**：`test_mixed.js` 1006 条、`test.js` 61 条全过；大 `y` 仍走 marker（性能）。
5. **冻结向量**：把每个方法的若干 `(x,y)` 结果写进 `test.js`。

---

## 5. 分期

- **B2-a**：`cuboiter`（`ω^ω·2`）精确化（小 `y`），验证 + 冻结向量。
- **B2-b**：`expoiter`/`trioterate`/`trixxate` 同类推广。
- **B2-c**：`aperixxate`/`epsilonate`（`ω^(ω^ω)`/ε 层）。
- **B2-d**：把 marker 明确降级为「大 `y` 近似」，并在规范中标注适用范围。

每期都以「不回归 `test_mixed`/`test.js`」为门槛。

---

## 6. 风险评估

- 本改动触及库的最核心求值路径，且中间值可能极大，**是本次修复中风险最高的部分**。
- 游戏《失控 AI 增量》只用大数，marker 近似已覆盖红线；B2 是**正确性投资**，不阻塞 D01–D06。
- 建议：B2-a 先行，若工作量/风险超预期，则把 B2-b..d 拆为独立 issue。

---

## 7. 实现记录

### B2-a（已落地）

**结论**：`x≥3` 的精确级联不可行（`3{ω^ω·2}2 = 3{ω^ω+ω²}3` 是天文数字，且 `_hyperopFromOrdinal` 中间步骤本身就爆炸）。因此 B2-a 把可精确的部分做到位，其余保持 marker。

**可精确的不变量**：对任意极限/后继层 `λ` 与整数 `y≥2`，

```
2{λ}y = 2{λ[y]}2 = … = 2{2}2 = 2² = 4
```

（有限层不成立：`2{1}3=8`。）

**实现**：
1. `_hyperopFromOrdinal` / `_ordinalHyperop`：当 `x=2 && y.isint() && y≥2 && cf 含 ω 项` → 返回 4。
2. 8 个 marker 方法（`iter/itermult/cuboiter/expoiter/trioterate/trixxate/aperixxate/epsilonate`）的同款守卫（它们不经过引擎）。

**效果**：`2{λ}y = 4` 对 10 个方法、`y ∈ {2,3,4,5,1000}` 全部成立；`test_mixed` 1006/0、`test.js` 61/0。

**仍未做**：B2-b..d（`x≥3` 精确化）。如上所述，这需要先解决“中间序数不可表示”的根本限制，**不建议在没有明确需求时投入**。

### B2-b..d 复评（2026-10-16，按 issue #22 要求再次尝试后撤回）

实现了 §2 的 S2 求值器（层 1 CNF `λ = Σ ω^(ord_i)·c_i + tail`，ord 为有限 coeffs，
走 rule 2/rule 3 级联，底层委托 `_hyperopFromOrdinal` 与 `iterate`），接线到
itermult/cuboiter/expoiter/trioterate/trixxate/aperixxate/epsilonate 后**撤回**，
原因有两层，均为表示法的根本限制而非实现细节：

1. **层 1 行格式无法表达后继链的有限部变化**。层 1 的值编码为
   `10{ Σ_i ω^(ord_i)·count_i + Σ_j ω^j·r_j }10`（README L17）——CNF 的有限尾
   只能进 `r0`，而行 `[count, a1..ak]` 的 ord 只承载 ω 指数部分。rule 2 链
   `x{λ}y = x{λ-1}^(y-1)(x)` 经过的各级 `ω^ω·c + (m-j)` 只差有限常数项，
   在行格式中不可区分（会折叠成同一行/同一 r0），所以精确级联**无法存储**。
   这正是 §1 结论“需要中间序数正规形”的具体含义。
2. **朴素递归会深度爆炸**。把 rule 2 链写成循环时，第二次应用的参数已是巨大值，
   其后继计数超出任何合理预算；退回 marker 近似后，各级 marker 收敛到同一形状，
   **破坏了 `iter<itmu<cube<expo<tria<trix<apix` 的严格增长**（trixxate(3,2) 与
   apixxate(3,2) 曾给出同一 array）——比不修复更糟。

**结论**：在引入“中间序数正规形 + 预算截断”（§3 的 S1）之前，B2-b..d 不可行；
marker（layer+行，base 10）保持为应有的渐近近似，`2{λ}y=4`（B2-a）不受影响。
复评代码已全部撤回，`test.js`/`test_mixed.js` 维持全绿。
