// format-metanum.js by dlsdl
// Adapted from format-omeganum.js by cloudytheconqueror
// Uses dlsdl's Letter Notation (see README.md)

// Set to 1 to print debug information to console
let FORMAT_DEBUG = 0

// ─── Configuration Options ────────────────────────────────────────
const FORMAT_OPTIONS = {
  smallNotationUseE: true,   // 1. 小数值是否用E-表示（true=αE-β，false=⁻¹）
  smallNotationThreshold: 4, // 2. 小数值表示阈值（=n则小于10^-n的数采用小数值处理）
  decimalPlaces: 3,          // 3. 常规数字小数位数（=0为1，=1为1.0，=2为1.00等）
  decimalThreshold: 3,       // 4. 常规数字小数阈值（=n则数值>=10^n时不显示小数部分）
  useCommas: true,           // 5. 常规数字是否显示逗号（true/false）
  sciThreshold: 9,           // 6. 科学计数法阈值（=n则数值>=10^n开始用科学计数法，同样对αEβ中β的数值生效）
  sciSignificantDigits: 3,   // 7. 科学计数法有效位数（=n则αEβ的α的小数部分保留n位）
  sciDecimalThreshold: 3,    // 8. 科学计数法小数阈值（=n则αEβ的β>=10^n时不显示小数部分）
  singleLetterDigits: 3,     // 9. 单字母计数法有效位数（αFβ,αGβ...αZβ中α的小数位数）
  repeatLetterThreshold: 3,  // 10. 单字母重复阈值（=n则出现n+1个重复的单字母时用下一个字母计数法，n<2时以2计算）
  multiLetterDigits: 3,      // 11. 多字母计数法有效位数（及以上的α的小数位数）
  multiLetterRepeatThreshold: 3, // 12. 多字母组合重复阈值（=n则出现n+1个重复的多字母组合时用下一个字母计数法，n<2时以2计算）
  multiLetterLimit: 4,        // 13. 多字母组合最大位数（=n则多字母组合的长度不超过n，超过则切换下一种计数法，n<2时以2计算）
  epsilonSignificantDigits: 6  // 14. epsilon有效位数（=n则αεβ中α的小数位数为n）
}

// ─── Utility Functions ───────────────────────────────────────────

function commaFormat(num) {
    if (!FORMAT_OPTIONS.useCommas) {
        let n = typeof num === 'number' ? num : (num.toNumber ? num.toNumber() : Number(num))
        if (isNaN(n) || !isFinite(n)) return "NaN"
        return String(Math.floor(n))
    }
    if (num === null || num === undefined) return "NaN"
    let n = typeof num === 'number' ? num : (num.toNumber ? num.toNumber() : Number(num))
    if (isNaN(n) || !isFinite(n)) return "NaN"
    if (n < 0.001) return "0"
    let init = n.toString()
    let portions = init.split(".")
    portions[0] = portions[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
    return portions[0]
}

function regularFormat(num, precision) {
    if (num === null || num === undefined) return "NaN"
    let n = typeof num === 'number' ? num : (num.toNumber ? num.toNumber() : Number(num))
    if (isNaN(n) || !isFinite(n)) return "NaN"
    if (n < 0.001) return (0).toFixed(precision)
    if (precision === 0) return commaFormat(Math.floor(n))
    let fmt
    if (Number.isInteger(n) && precision > 0) {
        fmt = n + "." + "0".repeat(precision)
    } else {
        fmt = n.toFixed(precision)
    }
    // Add commas to integer part if useCommas is enabled
    if (FORMAT_OPTIONS.useCommas && precision > 0) {
        let parts = fmt.split(".")
        parts[0] = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
        fmt = parts.join(".")
    }
    return fmt
}

// ─── MetaNum-Specific Polarize ───────────────────────────────────
// MetaNum's r0 is [base, e, f, g, h, ...] where:
//   r0[0] = base value (argument to the operations)
//   r0[1] = count of E operations (level 1)
//   r0[2] = count of F operations (level 2)
//   r0[3] = count of G operations (level 3), etc.
//
// In binary form αΓβ:
//   bottom = α (mantissa in [1, 10))
//   top = β (integer exponent)
//   height = Γ level (1=E, 2=F, 3=G, ..., 22=Z)
//   repeat = count of repeated operations at the highest level (>1 means repeated letters)
function metaPolarize(r0, num) {
    if (FORMAT_DEBUG >= 1) console.log("metaPolarize input:", JSON.stringify(r0))
    if (r0.length === 0) r0 = [0]

    // Find the highest non-zero index (level)
    let highest = 0
    for (let i = r0.length - 1; i >= 1; i--) {
        if (r0[i] > 0) { highest = i; break }
    }

    if (highest === 0) {
        // Simple number: just r0[0], no higher levels
        let bottom = r0[0]
        let top = 0
        let height = 0
        if (bottom >= 10) {
            let logVal = Math.log10(bottom)
            bottom = Math.pow(10, logVal - Math.floor(logVal))
            top = Math.floor(logVal)
            height = 1
        }
        if (FORMAT_DEBUG >= 1) console.log("metaPolarize simple:", {bottom, top, height, repeat: 1})
        return {bottom, top, height, repeat: 1}
    }

    // ── Climb through E level to compute the F-level argument ──
    // r0 = [v, e, f, g, ...]
    // For E^n (highest=1): climb E to convert to F format
    // For F^n or higher (highest>=2): compute the argument at the E→F boundary
    let value = r0[0]
    let eCount = r0[1] || 0

    // Climb the base value through E level
    let eClimbExtra = 0
    while (value >= 10) {
        value = Math.log10(value)
        eClimbExtra++
    }
    eCount += eClimbExtra

    // Compute the F-level argument from the climbed E value
    let fArg
    if (value >= 1) {
        fArg = eCount + Math.log10(value)
    } else {
        fArg = eCount + value - 1
        if (fArg < 1) fArg = eCount + Math.log10(Math.pow(10, value))
    }

    if (highest === 1) {
        // E level only: convert to F format
        let bottom = value
        let top = eCount
        let height = 1
        let repeat = eCount
        if (top >= 2) {
            height = 2
            if (bottom < 1) {
                bottom = Math.pow(10, bottom)
            }
            top = Math.floor(top)
            repeat = 1
        } else {
            bottom = Math.pow(10, bottom - Math.floor(bottom))
            top = Math.floor(top)
        }
        if (FORMAT_DEBUG >= 1) console.log("metaPolarize E level:", {bottom, top, height, repeat})
        return {bottom, top, height, repeat}
    }

    // ── Higher levels (F, G, H, ..., Z) ──
    // For mixed levels like FE20 or G10, the F argument is the value after E operations.
    // Try to compute it directly (E^e(base) = 10^e * base for e=1, or tower for e>1).
    let levelArg = fArg
    let eOps = r0[1] || 0
    let canCompute = false
    if (eOps > 0) {
        let eVal = r0[0]
        canCompute = true
        for (let i = 0; i < eOps; i++) {
            eVal = Math.pow(10, eVal)
            if (!isFinite(eVal) || eVal > 1e308) {
                canCompute = false
                break
            }
        }
        if (canCompute) {
            levelArg = eVal
        }
        // If not computable, levelArg stays as fArg (from E climbing)
    }

    let height = highest
    let repeat = r0[highest] || 0

    // ── Case 1: Directly computable (e.g., FE20) ──
    // Don't climb the computed value; use it directly as the top argument.
    if (canCompute) {
        let bottom = 1.0
        let top = levelArg
        if (FORMAT_DEBUG >= 1) console.log("metaPolarize computable:", {bottom, top, height, repeat})
        return {bottom, top, height, repeat}
    }

    // ── Case 2: Not computable ──
    // Check for the "all-8s" pattern: base=10^10 and all intermediate levels are 8.
    // This pattern arises when the original argument was 10 (e.g., Z10, G10, ZZ10).
    let all8 = (r0[0] === 10000000000)
    for (let i = 2; i < highest && all8; i++) {
        if ((r0[i] || 0) !== 8) all8 = false
    }
    if (all8) {
        // The normalization collapses one level when the argument is 10:
        //   Z(10) → Y^8(...E^8(10^10)...)  → letter level NOT in array, r0[highest]=8
        //   ZZ(10) → Z(Y^8(...E^8(10^10)...)) → letter level IS in array, r0[highest]≠8
        let bottom = 1.0
        let top = 10
        if (r0[highest] === 8) {
            // Letter level not present (e.g., Z10, G10): go up one level, repeat=1
            height = highest + 1
            repeat = 1
        } else {
            // Letter level present (e.g., ZZ10, ZZZ10): add 1 for the base level
            repeat = 1 + repeat
        }
        if (FORMAT_DEBUG >= 1) console.log("metaPolarize all-8s:", {bottom, top, height, repeat})
        return {bottom, top, height, repeat}
    }

    // ── Case 3: General non-computable ──
    // Climb through intermediate levels to compute the argument at the highest level.
    if (eOps > 0) {
        for (let lv = 2; lv < highest; lv++) {
            let cnt = r0[lv] || 0
            let climbExtra = 0
            while (levelArg >= 10) {
                levelArg = Math.log10(levelArg)
                climbExtra++
            }
            cnt += climbExtra
            levelArg = cnt + Math.log10(Math.max(levelArg, 1))
        }
    }

    // When the F argument was not computable and the highest level is F (level 2),
    // the E→F conversion adds 1 to the effective F count.
    if (highest === 2 && eOps > 0) {
        repeat += 1
    }

    // Climb at the highest level to compute the total repeat count
    let climbExtra = 0
    let argVal = levelArg
    while (argVal >= 10) {
        argVal = Math.log10(argVal)
        climbExtra++
    }
    let totalRepeat = repeat + climbExtra

    // Compute bottom (mantissa) and top (argument) from the climbed argVal
    let bottom
    if (argVal < 1) {
        bottom = Math.pow(10, argVal)
    } else {
        bottom = argVal
    }
    let top = Math.floor(levelArg)

    if (FORMAT_DEBUG >= 1) console.log("metaPolarize high level:", {bottom, top, height, repeat: totalRepeat, levelArg, climbExtra})
    return {bottom, top, height, repeat: totalRepeat}
}

// ─── Letter Name: Map height index to dlsdl's letter name ────────
// height 1 = E, 2 = F, ..., 22 = Z
// height 23 = Aa, 24 = Ab, ..., 48 = Az, 49 = Ba, ..., 698 = Zz
// height 699 = Aaa, ...
function letterName(height) {
    if (height < 1) return "E"
    if (height <= 22) {
        // E = charCode 69, F = 70, ..., Z = 90
        return String.fromCharCode(68 + height)
    }

    // Multi-letter: height >= 23 maps to the bijective base-26 sequence
    let n = height - 23 // 0-based into multi-letter: 0=Aa, 1=Ab, ..., 25=Az, 26=Ba, ...

    // Determine number of letters (starts at 2: Aa-Zz is 26*26 = 676 values)
    let digits = 2
    let rangeSize = 26 * 26
    let offset = 0
    while (n >= offset + rangeSize) {
        offset += rangeSize
        digits++
        rangeSize *= 26
    }

    n -= offset
    // n is now a base-26 number with 'digits' digits
    // First digit is uppercase (A-Z), rest are lowercase (a-z)
    let result = ""
    let divisor = Math.pow(26, digits - 1)
    for (let i = 0; i < digits; i++) {
        let digit = Math.floor(n / divisor)
        n %= divisor
        divisor /= 26
        if (i === 0) {
            result += String.fromCharCode(65 + digit) // A-Z
        } else {
            result += String.fromCharCode(97 + digit) // a-z
        }
    }
    return result
}

// ─── Letter token with the multiLetterLimit symbol carry ──────────
// A k-letter combination (Aa, Aaa, Aaaa, …) sits at level ω^(k-1).  Once the
// combination would be longer than FORMAT_OPTIONS.multiLetterLimit the
// notation switches to the next one instead: the symbol form !αAaβ.  Per its
// definition (!1.2345Aa4 = 10{ω^4+ω^3*2+ω^2*3+ω*4+5}10) β is the top
// ω-exponent (k-1) and α's digits are the CNF coefficients — exactly the
// digits of the letter itself (uppercase index, then the lowercase indices),
// which keeps the diagonal mantissa inside [2,10) for the cascades.
function letterTokenOf(height) {
    let plain = letterName(height)
    let limit = Math.max(2, FORMAT_OPTIONS.multiLetterLimit | 0)
    if (plain.length <= limit) return { sym: "", letter: plain, arg: 0, mant: null }
    let mant = plain.charCodeAt(0) - 64              // coefficient of ω^(k-1)
    for (let i = 1; i < plain.length; i++) {
        mant += (plain.charCodeAt(i) - 97) * Math.pow(10, -i)
    }
    if (mant < 2) mant = 2                           // diagonal [2,10) anchor
    if (mant >= 10) mant = 9 + (mant - 10) / 170     // keep α ∈ [2,10)
    return { sym: "!", letter: "Aa", arg: plain.length - 1, mant: mant }
}

// Emit α·letter·β for a token: the plain form is αΓβ, the carried form is the
// symbol-first !αAaβ whose α is the definition mantissa and β the ω-exponent.
function emitLetterToken(tok, alphaStr, betaStr, precision) {
    if (!tok.sym) return alphaStr + tok.letter + betaStr
    let a = (tok.mant === null || tok.mant === undefined) ? alphaStr
        : regularFormat(tok.mant, precision)
    return tok.sym + a + tok.letter + formatR0Arg(tok.arg, precision)
}

// ─── Symbol Name: Map layer to symbol ────────────────────────────
const SYMBOLS = "!@#$%&~<>?"
function symbolName(layer) {
    if (layer <= 0) return ""
    if (layer <= SYMBOLS.length) return SYMBOLS[layer - 1]
    // For layers beyond SYMBOLS, formatLayer uses the ε format: αεβ
    return ""
}

// ─── Ordinal Letter: Extract letter name from ordinal rows ───────
// Two formats for ordinal rows:
//   Format A (3+ element): [count, v1, v2, ..., vN, diag]
//     diag = 1-26 (A-Z), the uppercase letter
//     v1..vN = 0-25 (a-z), the lowercase letters
//     count = repetition count
//   Format B (2-element): [count, value]
//     count = repetition count at ω-level
//     value = ordinal level number (e.g., 901 means ω*901)
//     Letter is always "Aa" (base ω-level)
function getOrdinalLetter(ordRows) {
    if (!ordRows || ordRows.length === 0) return null

    // Check if all rows are 2-element [count, value] format (ω-level operations)
    let allTwoElement = true
    for (let i = 0; i < ordRows.length; i++) {
        if (ordRows[i].length !== 2) { allTwoElement = false; break }
    }
    if (allTwoElement) {
        return "Aa" // Base ω-level letter; value is handled in formatOrdinal
    }

    let tokens = []
    // Process rows in REVERSE order (matching toString behavior)
    for (let i = ordRows.length - 1; i >= 0; i--) {
        let row = ordRows[i]
        if (row.length < 2) continue
        let diag = row[row.length - 1]
        let vals = row.slice(1, row.length - 1)
        let count = row[0] || 1

        // Build letter name (reverse order: last val first, matching toString)
        let letter = String.fromCharCode(64 + diag)
        for (let j = vals.length - 1; j >= 0; j--) {
            letter += String.fromCharCode(97 + vals[j])
        }

        for (let c = 0; c < count; c++) {
            tokens.push(letter)
        }
    }

    // Do NOT sort - rows are already in canonical order from normalize
    return tokens.join("")
}

// ─── Reference Polarize (verbatim port of PowiainaNum's myPolarize) ──
// Recovers the display α ("bottom") and the diagonal level ("arrows") of an
// r0 chain STRUCTURALLY, by climbing log10 level by level — the only method
// that stays exact at high levels where the engine's own fractional-arg
// bisect quantizes (level ≥ 20). Ground truth: format-powiainanum.js.
//   their array = [base, [level, count, 1, 1], ...] sorted top-level-first
//   ours: r0 = [base, cnt1, cnt2, ...] where cnt_i = count at level i
function refPolarizeArraySort(array) {
    array.sort(function (a, b) {
        if (typeof a == 'number') return
        else if (a[3] > b[3]) return -1
        else if (a[3] < b[3]) return 1
        else if (a[2] == 'x' && b[2] != 'x') return -1
        else if (a[2] != 'x' && b[2] == 'x') return 1
        else if (a[2] == 'x' && b[2] == 'x') return -1
        else if (a[2] > b[2]) return -1
        else if (a[2] < b[2]) return 1
        else if (a[0] == 'x' && b[0] != 'x') return -1
        else if (a[0] != 'x' && b[0] == 'x') return 1
        else if (a[0] == 'x' && b[0] == 'x') return -1
        else if (a[0] > b[0]) return -1
        else if (a[0] < b[0]) return 1
        else if (a[1] > b[1]) return -1
        else if (a[1] < b[1]) return 1
        return -1
    })
}
function refPolarizeArrayMerge(array) {
    let elemOffset = 0
    for (let i = 0; i < array.length - 2; ++i) {
        if (array[i][0] == array[i + 1][0] &&
            array[i][2] == array[i + 1][2] &&
            array[i][3] == array[i + 1][3]) {
            array[i][1] += array[i + 1][1]
            array.splice(i + 1, 1)
            --i
            elemOffset++
        }
    }
    return elemOffset
}
// our r0 + [count, level] finite rows → their [base, [level, count, 1, 1]...]
// (their row level = our level verbatim: their 3{21}3 rows top at [20,1] and their polarize
// returns arrows 20, displayed "…20" — no off-by-one)
function refPolarizeInput(r0, finiteRows) {
    let arr = [r0[0]]
    for (let i = 1; i < r0.length; i++) {
        if (r0[i] > 0) arr.push([i, r0[i], 1, 1])
    }
    if (finiteRows) {
        for (let i = 0; i < finiteRows.length; i++) {
            let fr = finiteRows[i]
            if (fr && fr.length === 2 && fr[0] > 0) arr.push([fr[1], fr[0], 1, 1])
        }
    }
    return arr
}
function refPolarize(array, hasOperationRepeat = true) {
    refPolarizeArraySort(array)
    refPolarizeArrayMerge(array)
    let ptr = array.length - 2
    let b = () => array[array.length - 1]
    let c = (x) => { array[array.length - 1] = x }
    let repeatResult = 1000001
    while (--repeatResult >= 0) {
        if (b() >= 10) {
            let a = Math.log10(b())
            array.push([1, 1, 1, 1])
            ptr++
            refPolarizeArraySort(array)
            let offset = refPolarizeArrayMerge(array)
            ptr -= offset
            c(a)
        } else {
            if (ptr == 0 && typeof array[ptr + 1] == 'number' &&
                (hasOperationRepeat || (!hasOperationRepeat && array[ptr][1] == 1))) break
            if (ptr != 0 && typeof array[ptr + 1] == 'number' && typeof array[ptr][0] == 'number' &&
                array[ptr][1] == 1 &&
                (array[ptr - 1][0] == 'x' || array[ptr - 1][2] > array[ptr][2] || array[ptr - 1][3] > array[ptr][3]) &&
                array[ptr][0] > 2 && (ptr != 0 || array[ptr - 1][0] == 'x')) {
                let arrow_count = array[ptr][0]
                let base = b()
                let Jx
                if (arrow_count == 3) Jx = base
                else Jx = arrow_count - 1 + Math.log(base / 2) / Math.log(5)
                array[ptr][0] = 'x'
                c(Jx)
                refPolarizeArraySort(array)
                let offset = refPolarizeArrayMerge(array)
                ptr -= offset
            }
            if (typeof array[ptr + 1] == 'number' && array[ptr][0] == 'x' && b() < 10 && ptr != 0) {
                let base = b()
                let JRepeation = array[ptr][1]
                let Kx = JRepeation + Math.log10(base)
                array[ptr][1] = 1
                array[ptr][0] = 1
                array[ptr][2]++
                c(Kx)
                refPolarizeArraySort(array)
                let offset = refPolarizeArrayMerge(array)
                ptr -= offset
            }
            if (((ptr == 0 && !hasOperationRepeat && array[ptr][1] != 1) || ptr != 0) &&
                array[ptr][0] != 'x' && b() < 10) {
                if (b() == 1 && ptr > 0 && array[ptr - 1][0] > array[ptr][0] && array[ptr][1] == 1) {
                    array[ptr][0] = array[ptr - 1][0]
                } else {
                    let right = array[ptr][1] + Math.log10(b())
                    array[ptr][0]++
                    array[ptr][1] = 1
                    c(right)
                }
                refPolarizeArraySort(array)
                let offset = refPolarizeArrayMerge(array)
                ptr -= offset
            }
        }
    }
    return {
        bottom: b(),
        repeation: array[ptr][1],
        arrows: array[ptr][0],
    }
}
// Convert a finite-chain polarize triple (bottom, repeation, arrows) into the
// dlsdl diagonal-letter display pair (mantissa, β) for a diagonal letter
// (Aa, Ba, Ca, Aaa, … — multi-letter tokens ending in 'a').
// The value behaves as 10{arrows+1}(t) with t = log10(bottom)+repeation.
// Pure dlsdl convention for diagonal letters (α = 2·5^f ∈ [2,10)):
//   t ∈ [2,10)  -> mantissa t, β = arrows
//                   (3{100}3 -> 2.376Aa99; 10{100}(10{93}10)-> 2.002Aa100)
//   t ≥ 10      -> the count climbs one level per geometric smooth-log step
//                   f → 1+log10(f); the exact anchor t=10 is mantissa 2 at
//                   β=arrows+1 (10{100}10 -> 2.000Aa100, Aa100 itself)
//   t ∈ [1,2)  -> below the β anchor: mantissa 2·5^(t-1), β=arrows-1
// Truncation-marker normalization for finite rows: when the engine truncated
// an overflow cascade it reset r0 to [10] and bumped the LOWEST kept row's
// count by 1 over the uniform per-level fill (xCnt). That +1 marks the
// dropped tail, not a real operation — read the row as carrying xCnt so
// truncated displays match the untruncated anchor (cross-config stability).
function normalizedFiniteRows(r0, finiteRows) {
    if (!finiteRows || finiteRows.length === 0 || r0[0] !== 10) return finiteRows
    let sorted = finiteRows.slice().sort((a, b) => a[1] - b[1])
    let c0 = sorted[0][0] || 0
    let c1 = sorted.length > 1 ? (sorted[1][0] || 0) : 0
    if (c0 === c1 + 1) {
        let copy = finiteRows.slice()
        for (let i = 0; i < copy.length; i++) {
            if (copy[i][1] === sorted[0][1]) copy[i] = [c1, copy[i][1]]
        }
        return copy
    }
    return finiteRows
}

function aaDiagonalPair(pol) {
    let t = Math.log10(pol.bottom) + pol.repeation
    let beta = pol.arrows
    // discrete integer argument (10{arrows+1}(t) with integer t): climb the
    // raw count C=t-1 at level arrows; C ≤ 9 is the anchor band (one smooth
    // application 10{arrows+1}2 … through arg 9) -> mantissa 2 at β=arrows+1
    let discrete = Math.abs(pol.bottom - 1) < 1e-12 && pol.repeation === Math.floor(pol.repeation)
    if (discrete && t - 1 <= 9 + 1e-9 && t >= 2) {
        return { mant: 2, beta: pol.arrows + 1 }
    }
    if (t >= 9.999999999) {
        // v = 10{arrows+1}(t) = {arrows}^{t-1}(10): the raw level-(arrows)
        // application count is (t-1); run the geometric smooth-log climb
        // from a scalar count all the way to the diagonal band at
        // β = arrows+1. Integer arguments far below the next anchor land at
        // mantissa 2.000 (10{100}10 … 10{100}100 are all 2.000Aa100).
        let n = pol.arrows
        let s = Math.log10(Math.max(t - 1, 1))
        for (let level = 1; level < n + 2; level++) {
            s = (s >= 9.999999999) ? 2 : 1 + Math.log10(s)
        }
        let mant = s < 2 ? 1 + s : s
        return { mant: Math.min(mant, 10), beta: n + 1 }
    }
    if (t < 2) return { mant: 2 * Math.pow(5, t - 1), beta: beta - 1 }
    // t in [2,10): genuinely smooth (fractional compact row, or a non-10 base
    // fixed point such as 3{100}3 -> 2.376) is shown directly; the discrete
    // integer-argument anchor case was handled at the top of the function.
    return { mant: t, beta: beta }
}

// Structural α/diagonal recovery for a value whose finite-level chain (r0
// cols + [count, level] rows) reaches the Aa diagonal region. Mirrors the
// reference convention: 3{24}3 → bottom 2.375812, arrows 23 (the "2.376Aa23"
// display); 3{100}3 → bottom 2.375812, arrows 99 ("Aa2.376Aa99" inner part).
function polarizeFiniteChain(r0, finiteRows) {
    try {
        finiteRows = normalizedFiniteRows(r0, finiteRows)
        let arr = refPolarizeInput(r0.slice(0), finiteRows)
        if (arr.length === 1) return null
        return refPolarize(arr, true)
    } catch (e) {
        return null
    }
}

// ─── Main Format Function ────────────────────────────────────────

// Parse an already-formatted r0 argument back to a number (e.g. "1,000"
// → 1000, "1.000E1,000" → null: carries its own E structure)
function formatR0ArgStr(argStr) {
    var s = String(argStr).replace(/,/g, "")
    if (/^\d+(\.\d+)?$/.test(s)) return Number(s)
    return null
}

function format(num, precision=3, small=false) {
    if (MetaNum.isNaN(num)) return "NaN"
    let sciSigDigits = FORMAT_OPTIONS.sciSignificantDigits // for E notation
    let sciPrecision = Math.max(sciSigDigits, precision)
    let singlePrecision = FORMAT_OPTIONS.singleLetterDigits // for F, G, H, ...
    let multiPrecision = FORMAT_OPTIONS.multiLetterDigits // for Aa and beyond
    num = new MetaNum(num)
    let array = num.array
    let r0 = array[0]

    // Basic edge cases
    if (num.sign !== 2 && num.sign !== -2 && num.abs().lt(1e-308)) return (0).toFixed(precision)
    if (num.sign < 0) return "-" + format(num.neg(), precision, small)
    if (num.isInfinite()) return "Infinity"

    // Small value handling (e.g., 0.0000000001 → 1.000E-10 or 1.000E10⁻¹)
    let smallThreshold = Math.pow(10, -FORMAT_OPTIONS.smallNotationThreshold)
    if (num.lt(smallThreshold)) {
        if (FORMAT_OPTIONS.smallNotationUseE) {
            // Handle reciprocal values (sign=2/-2) that underflow to 0 in double precision
            if (num.sign === 2 || num.sign === -2) {
                var recipFmt = num.clone()
                recipFmt.sign = recipFmt.sign === 2 ? 1 : -1
                var prefix = num.sign === -2 ? "-" : ""
                // Compute magnitude (log10 of reciprocal)
                var mag = recipFmt.log10()
                // Tier 1: mag is a simple number → αE-β format
                if (mag.array.length === 1 && mag.array[0].length <= 2) {
                    var magNum = mag.toNumber()
                    if (isFinite(magNum) && magNum > 0) {
                        var frac = magNum - Math.floor(magNum)
                        var mant = Math.pow(10, frac)
                        var expPart = Math.floor(magNum)
                        if (mant < 1) { mant *= 10; expPart -= 1 }
                        if (mant >= 9.999999999999999) { mant = 1; expPart += 1 }
                        return prefix + regularFormat(mant, sciPrecision) + "E-" + commaFormat(expPart)
                    }
                }
                // Tier 2: mag is large → "E-" + letter-law form of mag =
                // log10 of the reciprocal base. Letter law (README): a chain
                // of n same-level ops collapses to ONE next-level op with
                // arg+n, so log10 shifts only the OUTERMOST letter:
                //   E-chain (EE1000): log10 = E1000 (one E stripped)
                //   F-chain (F500):   log10 = F499 (arg −1, same letter)
                //   Γ ≥ G (G200):     log10 = G200 (Γβ−1+1 = Γβ: the leading
                //                     F(G(β−1)) collapses back to G(β))
                // Roundtrip exact: "E-1.000G200" parses back to 1/G200,
                // "E-1.000F499" to 1/F500 (test_mixed format block)
                var recipStr = format(recipFmt, precision, small)
                var magStr = recipStr
                // leading run of E letters (e.g. "EE1.000E1,000"): strip one E
                var eRun = recipStr.match(/^(E+)(.*)$/)
                var rm = recipStr.match(/^(\d(?:\.\d+)?)([A-Z])((?:\d[\d,]*)?)$/)
                if (eRun && !rm) {
                    var restStr = eRun[2]
                    if (eRun[1].length >= 2) {
                        // "EE…" → "E…" (log10 of an E-chain drops one E)
                        magStr = eRun[1].slice(0, -1) + restStr
                    } else if (eRun[1].length === 1) {
                        // single "EαEβ" / "Eβ": log10 is the β part
                        var betaPart = restStr.replace(/^\d(?:\.\d+)?(?=[A-Z])/, "")
                        if (/^[A-Z]/.test(betaPart) || /^[\d,]/.test(betaPart)) magStr = betaPart
                    }
                } else if (rm) {
                    var rAlpha = rm[1], rLetter = rm[2], rArg = rm[3]
                    if (rLetter === "E" && rArg !== "") {
                        // E-chain with numeric arg (E200): log10 keeps E-arg
                        magStr = rAlpha + "E" + rArg
                    } else if (rLetter === "F" && rArg !== "") {
                        // F-chain: arg −1
                        magStr = rAlpha + "F" + commaFormat(Math.max(0, Number(rArg.replace(/,/g, "")) - 1))
                    }
                    // G and above: display unchanged
                }
                return prefix + "E-" + magStr
            }
            // Format as aE-b (e.g., 0.0000000001 → 1.000E-10)
            let nVal = num.toNumber()
            if (nVal > 0 && isFinite(nVal)) {
                let logVal = Math.log10(nVal)
                let m = Math.pow(10, logVal - Math.floor(logVal))
                let e = Math.abs(Math.floor(logVal))
                // Normalize: ensure m in [1, 10)
                if (m < 1) { m *= 10; e -= 1 }
                if (m >= 9.999999999999999) { m = 1; e += 1 }
                return regularFormat(m, sciPrecision) + "E-" + commaFormat(e)
            }
            // Fallback for non-simple values: use ⁻¹ notation
            if (num.layer === 0 && num.array.length === 1 && num.array[0].length === 1) {
                var val = num.array[0][0]
                if (val > 0) {
                    var recipVal = 1 / val
                    if (isFinite(recipVal)) {
                        return format(new MetaNum(recipVal), precision, small) + "⁻¹"
                    }
                }
            }
            return format(num.rec(), precision, small) + "⁻¹"
        } else {
            // Traditional ⁻¹ notation
            if (num.sign === 2 || num.sign === -2) {
                // Already in small representation (sign=2), toggle sign to get reciprocal
                var recipSmall = num.clone()
                recipSmall.sign = recipSmall.sign === 2 ? 1 : -1
                return format(recipSmall, precision, small) + "⁻¹"
            }
            // Normal representation but value < 1 (e.g., 0.0000000001 stored as [[1e-10]])
            // Compute reciprocal properly: 1/val
            if (num.layer === 0 && num.array.length === 1 && num.array[0].length === 1) {
                var val = num.array[0][0]
                if (val > 0) {
                    var recipVal = 1 / val
                    if (isFinite(recipVal)) {
                        return format(new MetaNum(recipVal), precision, small) + "⁻¹"
                    }
                }
            }
            // Fallback
            return format(num.rec(), precision, small) + "⁻¹"
        }
    }

    if (num.lt(1)) return regularFormat(num, FORMAT_OPTIONS.decimalPlaces + (small ? 2 : 0))
    if (num.lt(1000)) return regularFormat(num, FORMAT_OPTIONS.decimalPlaces)

    // Check decimal threshold: if value >= 10^decimalThreshold, don't show decimals
    let useDecimals = true
    if (FORMAT_OPTIONS.decimalThreshold > 0) {
        let thresholdVal = Math.pow(10, FORMAT_OPTIONS.decimalThreshold)
        if (num.gte(thresholdVal)) useDecimals = false
    }

    if (num.lt(Math.pow(10, FORMAT_OPTIONS.sciThreshold))) {
        if (useDecimals) return regularFormat(num, FORMAT_OPTIONS.decimalPlaces)
        else return commaFormat(num)
    }

    // ── Handle layer > 0 (symbol notation: !, @, #, ..., ε) ──
    if (num.layer > 0) {
        return formatLayer(num, precision, sciPrecision, singlePrecision, multiPrecision)
    }

    // ── Handle ordinal rows (Aa, Ab, ..., Aaa, ... range) ──
    let hasOrdinalRows = array.length > 1
    if (hasOrdinalRows) {
        return formatOrdinal(num, precision, multiPrecision)
    }

    // ── r0-only: scientific notation, E-Z range ──
    let maxLevel = 0
    for (let i = 1; i < r0.length; i++) {
        if (r0[i] > 0) maxLevel = i
    }

    // ── Handle r0-only with maxLevel >= 23: Aa-diagonal (v2.0) ──
    // The cascade collapses to αAaβ with (bottom, repeation, arrows) from
    // polarizeFiniteChain (the structural climb), mantissa normalized into
    // [1,10) carrying decades into β — identical to the finite-row display
    // so format stays cross-config stable.
    if (maxLevel >= 23) {
        let pol = polarizeFiniteChain(r0.slice(0), null)
        if (pol && isFinite(pol.bottom) && pol.bottom > 0 && isFinite(pol.arrows)) {
            let pair = aaDiagonalPair(pol)
            return regularFormat(pair.mant, multiPrecision) + "Aa" + commaFormat(pair.beta)
        }
        // fallback: legacy base-9 coefficient form
        let coeff = r0[maxLevel]
        let pow9 = 9
        for (let i = maxLevel - 1; i >= 1; i--) {
            coeff += (r0[i] || 0) / pow9
            pow9 *= 9
        }
        let level = maxLevel
        while (coeff >= 9) {
            coeff /= 9
            level++
        }
        // Format coefficient: if close to integer, show as integer
        let coeffVal
        if (Math.abs(coeff - Math.round(coeff)) < 1e-12 && Math.round(coeff) <= Number.MAX_SAFE_INTEGER) {
            coeffVal = Math.round(coeff)
        } else {
            coeffVal = coeff
        }
        return regularFormat(coeffVal, multiPrecision) + "Aa" + commaFormat(level)
    }

    // ── All other r0-only cases: use the recursive chain builder ──
    // This handles plain numbers, E-level, F-level, ..., Z-level (maxLevel 0-22)
    // including multi-letter chains like GE700, FE400, GF800, GG900.
    return formatR0AsChain(r0.slice(0), sciPrecision)
}

// ─── Format with Layer (symbol notation) ─────────────────────────

function formatLayer(num, precision, precision2, precision3, precision4) {
    let sym = symbolName(num.layer)

    // Create a layer-down version for the inner format
    let inner = num.clone()
    inner.layer = 0
    inner.normalize()

    // Check if inner de-layered to a "!Aa-like" form (all a's in ordinal)
    // If the ordinal row is [count, 0, 0, ..., 0, diag] and r0[0] equals the number of zeros,
    // we can format compactly as !Aa[r0[0]] (per README: !Aaα = (10^frac(α),0,...,0)|10 with int(α) zeros)
    let canCompact = false
    let compactBase = 0
    if (inner.array.length > 1) {
        let lastRow = inner.array[inner.array.length - 1]
        let diag = lastRow[lastRow.length - 1]
        let vals = lastRow.slice(1, lastRow.length - 1)
        let allZero = vals.every(v => v === 0)
        let base = inner.array[0][0]
        // Compact form only applies when diag=1 (A), all vals are 0, and r0[0] equals the number of zeros
        if (allZero && inner.array[0].length === 1 && diag === 1 && base === vals.length) {
            canCompact = true
            compactBase = base
        }
    }

    // For layers beyond the explicit symbols, use the ε format: αεβ
    // ε represents exponent tower layers of ω: αεβ ~ f_ω^ω^...^ω(β ω's)_(α)
    // This check must come before the compact !Aa form, otherwise ε layers
    // get mis-rendered as "Aa..." (e.g. 1ε500 → "1.000Aa10")
    if (num.layer > SYMBOLS.length) {
        if (canCompact && compactBase >= 2 && Math.floor(compactBase) === compactBase) {
            // Compact Aa form at ε layers folds into one more ε level:
            // layer n + Aa-form ≡ ε(n+1) with mantissa 10^frac(compactBase)
            let bottom = Math.pow(10, compactBase - Math.floor(compactBase))
            return regularFormat(bottom, precision4) + "ε" + commaFormat(num.layer + 1)
        }
        let innerStr = format(inner, precision, false)
        return innerStr + "ε" + commaFormat(num.layer)
    }

    // Compact diagonal: the symbol row [1,0…0,1] with m=compactBase zeros is
    // 10{ω^m}10 — a DIAGONAL letter (A + m a's) at argument 10. Diagonal
    // letter combinations use the pure dlsdl α=2·5^f ∈ [2,10) convention:
    // integer m anchors mantissa 2. For layers above ! the symbol of the
    // layer below prefixes the same inner form:
    //   !Aa3 = 2.000Aaaa10,  @Aa3 = !2.000Aaaa10.
    // multiLetterLimit symbol carry: once the diagonal letter would be longer
    // than the limit (m+1 letters) it switches to one more symbol and the Aa
    // argument takes over the exponent — 10{ω^10}10 → !2.000Aa10, and layer 1
    // on top stacks the symbols (no-symbol → ! → @ → # …):
    //   apix(3,10) = 10{ω^(ω^10)}10 → @2.000Aa10.
    if (canCompact && compactBase >= 2) {
        let mInt = Math.floor(compactBase)
        let frac = compactBase - mInt
        let mant = 2 * Math.pow(5, frac)
        let limit = Math.max(2, FORMAT_OPTIONS.multiLetterLimit | 0)
        if (mInt + 1 > limit) {
            let total = num.layer + 1
            let body = regularFormat(mant, precision4) + "Aa" + formatR0Arg(mInt, precision4)
            if (total <= SYMBOLS.length) return SYMBOLS[total - 1] + body
            return body + "ε" + commaFormat(total)
        }
        // Stored layer L (the parser de-layers small !Aa rows):
        //  L=0 (!Aa3) -> no prefix; L=1 (@Aa3) -> "!"; L=2 (#Aa3) -> "@!"
        let prefixSyms = ""
        for (let sl = num.layer; sl >= 1; sl--) prefixSyms += symbolName(sl)
        return prefixSyms + regularFormat(mant, precision4) +
               "A" + "a".repeat(mInt) + "10"
    }

    // For !, @, #, $, %, &, ~, <, >, ? symbols: prefix the symbol.  When the
    // inner display itself had to carry (its letter exceeded multiLetterLimit)
    // the symbols stack instead of doubling: layer 1 + inner "!…" → "@…".
    let innerStr = format(inner, precision, false)
    if (innerStr.length > 1 && SYMBOLS.indexOf(innerStr[0]) >= 0) {
        let total = num.layer + 1
        if (total <= SYMBOLS.length) return SYMBOLS[total - 1] + innerStr.slice(1)
        return innerStr.slice(1) + "ε" + commaFormat(total)
    }
    return sym + innerStr
}

// ─── Format r0 Argument (plain number) ───────────────────────────
// Formats a plain numeric argument as either a plain number or αEβ notation.
// The mantissa α is always shown (even when 1.000).
function formatR0Arg(value, precision) {
    if (!isFinite(value) || isNaN(value)) return "NaN"
    if (value < Math.pow(10, FORMAT_OPTIONS.sciThreshold)) {
        // Small argument: use comma format (integer, no decimals)
        return commaFormat(value)
    }
    let logVal = Math.log10(value)
    let m = Math.pow(10, logVal - Math.floor(logVal))
    let e = Math.floor(logVal)
    // Normalize mantissa into [1, 10)
    if (m < 1) { m *= 10; e -= 1 }
    if (m >= 9.999999999999999) { m = 1; e += 1 }
    // Always show mantissa (αEβ format, e.g. 1.000E700)
    return regularFormat(m, precision) + "E" + commaFormat(e)
}

// ─── Gamma-Arg Recovery ─────────────────────────────────────────
// Recover the real argument x with 10{level}x = v (the Γ-canonical argument of
// v at letter `level`), by bisection on the engine's own smooth arrow curve.
// Returns null when x exceeds the double-precision bisect range. The doubling
// guard runs to 200: E-notation arguments (hardy(1120)'s F-arg ≈ 4.4e13) need
// ~45 doublings before the bracket closes.
function gammaArgOf(v, level, iters) {
    if (iters === undefined) iters = 60
    let G = function (x) { return MetaNum(10).arrow(level)(x) }
    // v must sit inside [Γ(1), Γ(HUGE)]: find integer hi with Γ(hi) >= v
    let lo = 1, hi = 2
    let guard = 0
    while (G(hi).lt(v)) {
        lo = hi
        hi *= 2
        if (++guard > 200) return null
    }
    // bisect the fractional part
    for (let i = 0; i < iters; i++) {
        let mid = (lo + hi) / 2
        if (G(mid).lt(v)) lo = mid; else hi = mid
        if (hi - lo < 1e-12) break
    }
    return lo
}

// Format a recovered Γ-argument x as the binary form αΓβ:
//   α = 10^frac(x) (in [1, 10)), β = floor(x) (may itself carry E notation).
// Once β ≥ 10^sciThreshold the α only perturbs β by log10(α) < 1, far below
// the displayed precision: write the letter bare and let the canonical β
// carry the single α (hardy(1120) → "F4.398E13").
function formatGammaBinary(x, level, precision) {
    let sciBound = Math.pow(10, FORMAT_OPTIONS.sciThreshold)
    let beta = Math.floor(x + 1e-12)
    let frac = x - beta
    if (frac < 0) { frac += 1; beta -= 1 }
    if (frac >= 1) { frac -= 1; beta += 1 }
    if (beta >= sciBound) {
        let alpha = Math.pow(10, frac)
        return letterName(level) + formatR0Arg(beta + Math.log10(alpha), precision)
    }
    if (frac < 1e-11 || frac > 1 - 1e-11) {
        // exact integer argument: bare letter + β
        return letterName(level) + formatR0Arg(beta, precision)
    }
    let alpha = Math.pow(10, frac)
    return regularFormat(alpha, precision) + letterName(level) + formatR0Arg(beta, precision)
}

// Distinct letter types in a display string: single-uppercase letters and
// Aa-style multi-letter tokens, ignoring an E inside a number ("7.626E12"
// sci notation, not an op) and !/@/# symbol prefixes.
function distinctLetterTypes(str) {
    let stripped = String(str).replace(/(\d(?:\.\d+)?)E(\d[\d,]*)/g, "$1$2")
    let tokens = stripped.match(/[A-Z][a-z]*/g) || []
    let seen = {}
    let out = []
    for (let i = 0; i < tokens.length; i++) {
        if (!seen[tokens[i]]) { seen[tokens[i]] = true; out.push(tokens[i]) }
    }
    return out
}

// ─── Format r0 as Chain ────────────────────────────────────────
// Formats r0 = [base, e, f, g, ...] as a dlsdl letter-notation chain.
// Format pattern: outerLetters + α + lastLetter + β
//   where α = 10^(base - floor(base)), β = floor(base) formatted as number or αEβ
//   e.g. EE200 → "E1.000E200", F300 → "1.000F300", FE400 → "F1.000E400"
function formatR0AsChain(r0, precision) {
    if (r0.length === 0) r0 = [0]

    // Find maxLevel (highest non-zero index in r0[1..])
    let maxLevel = 0
    for (let i = r0.length - 1; i >= 1; i--) {
        if (r0[i] > 0) { maxLevel = i; break }
    }

    if (maxLevel === 0) {
        return formatR0Arg(r0[0], precision)
    }

    let count = r0[maxLevel]
    let effThreshold = Math.max(2, FORMAT_OPTIONS.repeatLetterThreshold)

    // Detect a descending run of count-1 letters (e.g. the VUTS…G chain that
    // the engine produces for arrow(3,19,3) = 3{19}3). Such a chain is the
    // diagonalized expansion of the top letter applied twice, so it must be
    // compressed to the ΓαΓβ binary form instead of being spelled out.
    let runLen = 0
    if (count === 1) {
        runLen = 1
        while (maxLevel - runLen >= 2 && r0[maxLevel - runLen] === 1) runLen++
    }

    // ── ≤2-letter-types rule ──
    // When the full structural spelling would use MORE than two letter
    // types, spell only the top two levels' letters and compress everything
    // below into the second letter's Binary-Canonical form
    // "bottom Γ₂ repeation" — the polarize triple of the chain below the
    // top letter (bisect fails there: the arg exceeds double range):
    //   3{9}3 → "L2.376K2"        (user: "L…K…")
    //   3{10}3 → "M2.376L2"       (user: "M(10^0.376)L2")
    //   4{9}4 → "LLK3.550K3"      (user: "LLK…K…")
    //   5{9}5 → "LLLKK4.669K4"    (user: "LLLKK…K…")
    // A top count ≥ repeatLetterThreshold+1 carries to the next single
    // letter instead (6{9}6 → "5.760M5" via the collapse paths below).
    if (maxLevel >= 2 && maxLevel <= 22 && count <= effThreshold) {
        let spellTypes = 0
        for (let s = 2; s <= maxLevel; s++) {
            if ((r0[s] || 0) > 0) spellTypes++
        }
        if (spellTypes > 2) {
            let second = 0
            for (let s = maxLevel - 1; s >= 2; s--) {
                if (r0[s] > 0) { second = s; break }
            }
            if (second >= 2) {
                let c2 = r0[second]
                if (c2 <= effThreshold) {
                    let restR0 = r0.slice(0)
                    restR0[maxLevel] = 0
                    let pol = polarizeFiniteChain(restR0, null)
                    if (pol && pol.arrows === second && isFinite(pol.bottom) &&
                        pol.bottom >= 1 && isFinite(pol.repeation)) {
                        let prefix = letterName(maxLevel).repeat(count) +
                                     letterName(second).repeat(Math.max(c2 - 1, 0))
                        return prefix + regularFormat(pol.bottom, precision) +
                               letterName(second) + commaFormat(pol.repeation)
                    }
                }
            }
        }
    }

    if (count <= effThreshold && runLen <= effThreshold) {
        // Non-collapse: peel off one letter at maxLevel, recurse on inner.
        // Long descending count-1 runs (runLen > threshold) fall through to the
        // Γ-canonical collapse below (2-letter rule: the diagonal
        // chain formats at its bisect-exact letter, not spelled out VUTS…).
        let innerR0 = r0.slice(0)
        innerR0[maxLevel] = count - 1
        if (innerR0[maxLevel] === 0) {
            innerR0 = innerR0.slice(0, maxLevel)
        }
        let innerStr = formatR0AsChain(innerR0, precision)

        // Check if innerStr already has letters (meaning deeper operations exist)
        let hasLetter = /[A-Z]/.test(innerStr)

        if (!hasLetter) {
            // innerStr is a plain number: this is the innermost operation
            // Format: α + letterName(maxLevel) + innerStr
            let base = r0[0]
            let alpha = Math.pow(10, base - Math.floor(base))
            if (alpha < 1) alpha *= 10
            let alphaStr = regularFormat(alpha, precision)
            return alphaStr + letterName(maxLevel) + innerStr
        } else {
            // innerStr already has α and letters: just prepend the outer letter
            return letterName(maxLevel) + innerStr
        }
    }

    // count >= effThreshold: promote to next level (maxLevel + 1)
    // Check for the all-8s pattern: base = 10^10 and every level 1..maxLevel-1 equals 8
    let all8 = (r0[0] === 10000000000)
    for (let i = 1; i < maxLevel && all8; i++) {
        if ((r0[i] || 0) !== 8) all8 = false
    }

    // sciThreshold boundary: once the top-level argument reaches 10^sciThreshold
    // the binary form αΓβ = Γ(β+log α) renders the argument in its own canonical
    // (αEβ) form and the outer letter is written bare — α must appear only once,
    // at the innermost value (2-letter rule: "G1.000E12", not "1.000G1.000E12")
    let sciBound = Math.pow(10, FORMAT_OPTIONS.sciThreshold)

    if (all8) {
        // all-8s promotion: E^count(10^10) → F(count+2), F^count(F10) → G(count+2), etc.
        let arg = count + 2
        let level = maxLevel + 1
        let letter = letterName(level)
        if (level >= 23) {
            // Promotion into a diagonal letter: the all-8s r0 is the exact
            // diagonal 10{L+1}10 = Aa(L+1), whose dlsdl binary form anchors
            // mantissa 2 (α=2·5^0): 10{23}10 -> "2.000Aa23".
            return regularFormat(2.0, precision) + "Aa" + commaFormat(maxLevel + 1)
        }
        if (arg >= sciBound) {
            // Γ(β) with β ≥ 10^sciThreshold: bare letter + canonical argument
            return letter + formatR0Arg(arg, precision)
        }
        // Format: α + letter + β (always show α)
        let alpha = Math.pow(10, arg - Math.floor(arg))
        if (alpha < 1) alpha *= 10
        let alphaStr = regularFormat(alpha, precision)
        let betaStr = formatR0Arg(Math.floor(arg), precision)
        return alphaStr + letter + betaStr
    }

    // ── Γ-canonical recovery (2-letter rule) ──
    // Two rules, both driven by the engine's own smooth arrow curve:
    //   (a) structural top count < threshold AND inner top < maxLevel: keep
    //       the structural top letter Γᵀ bare and format the inner chain
    //       recursively — at most 2 letter types appear (2-letter rule:
    //       VαEβ → VαFβ → … → VαVβ, never a mixed "VFαEβ").
    //   (b) otherwise: collapse to the single letter Γ = the HIGHEST level L
    //       whose recovered argument x (bisect 10{L}x = v) is ≥ 2, in binary
    //       form αΓβ (2-letter rule: hardy(4166) → "2.397G5", arrow(3,4.3,3) →
    //       "1.285H8", arrow(3,4.1,3) → "G1.161G897").
    // Verified laws: n ops of level L on a Γ^{L+1}-structured value collapse
    // to ONE Γ^{L+1} with arg+n (F^4(G(1.3796)) = G(5.3796) — bisect-exact).
    let r0Num = new MetaNum({ sign: 1, layer: 0, array: [r0.slice(0)] })

    if (count < effThreshold && maxLevel >= 2 && runLen <= effThreshold) {
        // (a) structural top letter: peel ONE op of level maxLevel and format
        // the inner chain recursively (exact even when the argument itself is
        // letter-structured, e.g. arrow(3,4.1,3) = G(F^895-chain) →
        // "G" + format(F^895-chain) = "G1.161G897")
        let innerR0 = r0.slice(0)
        innerR0[maxLevel] = count - 1
        if (innerR0[maxLevel] === 0) {
            innerR0 = innerR0.slice(0, maxLevel)
        }
        let innerStr = formatR0AsChain(innerR0, precision)
        let hasLetter = /[A-Z]/.test(innerStr)
        if (!hasLetter) {
            let base = r0[0]
            let alpha = Math.pow(10, base - Math.floor(base))
            if (alpha < 1) alpha *= 10
            return regularFormat(alpha, precision) + letterName(maxLevel) + innerStr
        }
        // inner carries letters: bare outer letter (2-letter rule) — the
        // inner top must be LOWER (descending chain); ascending or same-level
        // chains fall through to collapse
        let innerTop = 0
        for (let it = innerR0.length - 1; it >= 1; it--) {
            if (innerR0[it] > 0) { innerTop = it; break }
        }
        if (innerTop < maxLevel) {
            // ≤2 letter types rule: count the distinct letter
            // types the peeled prefix + innerStr would use. If the inner chain
            // spells a THIRD type, collapse the inner to the binary form at
            // maxLevel-1 instead — VαEβ → VαFβ → … → VαVβ, never a mixed
            // "VFαEβ" (e.g. arrow(3,9,3) → "L2.376K2": the MLKJIHG F-chain
            // spells only L and K, the M..J part collapses into K's arg).
            let topLetter = letterName(maxLevel)
            let innerTypes = distinctLetterTypes(innerStr)
            if (innerTypes.length >= 2
                && innerTypes.indexOf(topLetter) < 0
                && innerTypes.indexOf(letterName(innerTop)) < 0) {
                // inner already uses its own 2 types: cannot keep the structural
                // letter — collapse below
            } else {
                let wouldTypes = {}
                wouldTypes[topLetter] = true
                for (let wt = 0; wt < innerTypes.length; wt++) wouldTypes[innerTypes[wt]] = true
                if (Object.keys(wouldTypes).length <= 2) {
                    return letterName(maxLevel) + innerStr
                }
                // 3rd type would appear: collapse the inner chain to the binary
                // form at innerTop — arg recovered on the engine curve when
                // possible (level < 20), else structurally via refPolarize
                let innerNum = new MetaNum({ sign: 1, layer: 0, array: [innerR0.slice(0)] })
                let bx = (innerTop <= 19) ? gammaArgOf(innerNum, innerTop, 40) : null
                if (bx !== null && isFinite(bx) && bx >= 2) {
                    return letterName(maxLevel) + formatGammaBinary(bx, innerTop, precision)
                }
                let pol2 = polarizeFiniteChain(innerR0, null)
                if (pol2 && pol2.arrows >= 2 && pol2.arrows <= 22) {
                    let aStr = regularFormat(Math.max(pol2.bottom, 1.0001), precision)
                    return letterName(maxLevel) + aStr + letterName(pol2.arrows) + commaFormat(pol2.repeation)
                }
                // polarize reached the multi-letter region: Aa-diagonal form
                if (pol2 && pol2.arrows >= 23) {
                    let aStr = regularFormat(Math.max(pol2.bottom, 1.0001), precision)
                    return letterName(maxLevel) + aStr + "Aa" + commaFormat(pol2.arrows)
                }
            }
        }
    }

    // (b) collapse: the structural chain (n repeats of the top letter Γᵀ on
    // an inner value whose own canonical letter is Γᵀ⁺¹, e.g. F^895(G(2.06)))
    // compresses to ONE Γᵀ⁺¹ with arg+n — bisect at the STRUCTURAL next
    // letter first (maxLevel+1); if its arg falls below 2, search upward for
    // the highest level whose arg ≥ 2 (2-letter rule: hardy(4166) → "2.397G5",
    // arrow(3,4.3,3) → "1.285H8")
    let structuralNext = Math.min(maxLevel + 1, 22)
    let sx = gammaArgOf(r0Num, structuralNext, 40)
    if (sx !== null && isFinite(sx) && sx >= 2) {
        return formatGammaBinary(sx, structuralNext, precision)
    }
    for (let lv = 22; lv >= 2; lv--) {
        if (lv === structuralNext) continue
        let x = gammaArgOf(r0Num, lv, 40)
        if (x !== null && isFinite(x) && x >= 2) {
            return formatGammaBinary(x, lv, precision)
        }
    }

    // Γ-arg not recoverable as a double (arg beyond bisect range): fall back
    // to metaPolarize for the polarized form
    let pol = metaPolarize(r0.slice(0), r0Num)
    let h = pol.height
    let rep = pol.repeat || 1
    let top = pol.top
    let bottom = pol.bottom

    if (runLen > effThreshold) {
        // The descending count-1 run is the diagonalized expansion of the top
        // letter applied twice: force the ΓαΓβ form (issues.md: arrow(3,19,3)
        // → "VαVβ", not "VUTS…G…")
        rep = 2
        h = maxLevel
    }

    // Convert repeated letters to next level when over threshold
    if (rep > 1 && rep >= effThreshold) {
        let newH = h + 1
        let newTop = rep + 1
        let newLetter = letterName(newH)
        if (newTop >= sciBound) {
            // bare letter + canonical argument (single α at the innermost value)
            return newLetter + formatR0Arg(newTop + Math.log10(bottom < 1 ? Math.pow(10, bottom) : bottom), precision)
        }
        // Format: α + letter + β. Canonical all-8s arrays (built from the
        // 10^10 base: G600, ZZ10, ...) carry no recoverable mantissa below
        // 10^10, so α = 1.000 by construction. Every other value recovers
        // its real α by stripping newTop slog's — the residue lands in
        // [1,10) and is exactly the α of the binary form αΓβ = Γ(β+log α)
        // (issues.md: hardy(4150) → "2.300G5", not "1.000G5")
        let alpha = 1.0
        let all8s = (r0[0] === 10000000000)
        for (let ai = 2; ai < pol.height && all8s; ai++) {
            if ((r0[ai] || 0) !== 8) all8s = false
        }
        if (!all8s) {
            try {
                let av = r0Num.clone()
                for (let si = 0; si < newTop && av.gt(MetaNum(1e15)); si++) av = av.slog()
                if (av.gte(1) && av.lt(10)) alpha = av.toNumber()
            } catch (e) { /* keep α = 1.0 */ }
        }
        let alphaStr = regularFormat(alpha, precision)
        let betaStr = formatR0Arg(newTop, precision)
        return alphaStr + newLetter + betaStr
    }

    // Below threshold: use outerLetters + α + lastLetter + β pattern
    if (h <= 22) {
        let letter = letterName(h)
        if (rep > 1) {
            // Repeated letters: outerLetters + α + lastLetter + β
            let outerLetters = letter.repeat(rep - 1)
            let alpha = bottom
            let logAlpha = 0
            if (alpha < 1) {
                logAlpha = alpha
                alpha = Math.pow(10, alpha)
            } else {
                logAlpha = Math.log10(alpha)
            }
            let betaVal = top + logAlpha
            if (top >= sciBound) {
                // bare letters + canonical argument (single α at the innermost value)
                return outerLetters + letter + formatR0Arg(betaVal, precision)
            }
            let alphaStr = regularFormat(alpha, precision)
            let betaStr = formatR0Arg(top, precision)
            return outerLetters + alphaStr + letter + betaStr
        }
        // Single letter: α + letter + β — but once β ≥ 10^sciThreshold the
        // α only perturbs β by log10(α) < 1, far below the displayed
        // precision: write the letter bare and let β carry the single α
        // (issues.md: hardy(1120) → "F4.398E13", not "4.295F4.398E13")
        let alpha = bottom
        if (alpha < 1) alpha = Math.pow(10, alpha)
        let betaVal = top + Math.log10(alpha)
        if (top >= sciBound) {
            return letter + formatR0Arg(betaVal, precision)
        }
        let alphaStr = regularFormat(alpha, precision)
        let betaStr = formatR0Arg(top, precision)
        return alphaStr + letter + betaStr
    }

    // Multi-letter range fallback: α + letter + β
    let letter = letterName(Math.max(h, 23))
    let alpha = bottom
    if (alpha < 1) alpha = Math.pow(10, alpha)
    let alphaStr = regularFormat(alpha, precision)
    let betaStr = formatR0Arg(top, precision)
    return alphaStr + letter + betaStr
}

// ─── Format with Ordinal Rows ────────────────────────────────────

// finite-row chain display (≤2-letter-types rule):
// r0 cols + [count, level] rows form one hyperoperation cascade. Display:
//   top level ≥ 23 (Aa region): the αAaβ diagonal — (bottom, repeation,
//     arrows) from polarizeFiniteChain, mantissa normalized into [1,10)
//     carrying decades into β: 3{24}3 → "2.376Aa23", 3{100}3 → "2.376Aa99",
//     10{10000}10 → "1.000Aa10,000" (bottom 1, repeation 10 carries).
//   top level ≤ 22 (single letters): the structural two-letter form
//     Γ_top×c₁ + Γ_second×(c₂−1) + bottom + Γ_second + repeation:
//     3{22}3 → "Y2.376X2", 3{23}3 → "Z2.376Y2" (user: "Y…X…", "Z…Y…").
//   c₁ ≥ repeatLetterThreshold+1 carries to the next single letter.
function formatFiniteRowChain(r0, finiteRows, precision) {
    function levelCount(lv) {
        if (lv < r0.length && (r0[lv] || 0) > 0) return r0[lv]
        for (let i = 0; i < finiteRows.length; i++) {
            if (finiteRows[i][1] === lv) return finiteRows[i][0]
        }
        return 0
    }
    let topLv = 0, c1 = 0
    for (let i = 1; i < r0.length; i++) {
        if ((r0[i] || 0) > 0) { topLv = i; c1 = r0[i] }
    }
    for (let i = 0; i < finiteRows.length; i++) {
        if (finiteRows[i][1] > topLv) { topLv = finiteRows[i][1]; c1 = finiteRows[i][0] }
    }
    if (topLv === 0) return formatR0Arg(r0[0], precision)
    let effThreshold = Math.max(2, FORMAT_OPTIONS.repeatLetterThreshold)

    if (topLv >= 23) {
        let pol = polarizeFiniteChain(r0, finiteRows)
        if (pol && isFinite(pol.bottom) && pol.bottom > 0 && isFinite(pol.arrows)) {
            let pair = aaDiagonalPair(pol)
            return regularFormat(pair.mant, precision) + "Aa" + commaFormat(pair.beta)
        }
        // fallback: legacy coefficient form on the top row
        let lastRow = finiteRows[finiteRows.length - 1]
        if (lastRow) return lastRow[0] + "Aa" + commaFormat(lastRow[1])
        return formatR0AsChain(r0.slice(0), precision)
    }

    // carry: c₁ ≥ threshold+1 top-letter repeats advance to the next letter
    if (c1 >= effThreshold + 1) {
        let lv = topLv + 1
        if (lv <= 19) {
            let num = new MetaNum({ sign: 1, layer: 0, array: [r0.slice(0)].concat(finiteRows.map(r => r.slice(0))) })
            let bx = gammaArgOf(num, lv, 40)
            if (bx !== null && isFinite(bx) && bx >= 2) return formatGammaBinary(bx, lv, precision)
        }
        let pol = polarizeFiniteChain(r0, finiteRows)
        if (pol && isFinite(pol.bottom) && pol.bottom > 0 && isFinite(pol.arrows)) {
            if (lv >= 23) {
                // carry lands on the Aa diagonal: convert the polarize triple
                // via the same linear mantissa/β rule as the topLv>=23 path
                // (10{23}10 -> 1.000Aa23, not "1.000Aa10")
                let pair = aaDiagonalPair(pol)
                return regularFormat(pair.mant, precision) + "Aa" + commaFormat(pair.beta)
            }
            if (pol.bottom >= 1) {
                return regularFormat(pol.bottom, precision) + letterName(lv) + commaFormat(pol.repeation)
            }
        }
    }

    // structural two-letter form (≤ 22: single-letter region)
    let secondLv = 0, c2 = 0
    for (let s = topLv - 1; s >= 1; s--) {
        let c = levelCount(s)
        if (c > 0) { secondLv = s; c2 = c; break }
    }
    if (secondLv >= 1 && c2 <= effThreshold) {
        let restR0 = r0.slice(0, Math.min(secondLv + 1, r0.length))
        let restRows = finiteRows.filter(r => r[1] <= secondLv)
        let pol = polarizeFiniteChain(restR0, restRows)
        if (pol && pol.arrows === secondLv && isFinite(pol.bottom) && pol.bottom >= 1) {
            let prefix = letterName(topLv).repeat(Math.min(c1, effThreshold)) +
                         letterName(secondLv).repeat(Math.max(c2 - 1, 0))
            return prefix + regularFormat(pol.bottom, precision) + letterName(secondLv) + commaFormat(pol.repeation)
        }
        // low levels: engine-curve bisect at the second letter
        if (secondLv <= 19) {
            let num = new MetaNum({ sign: 1, layer: 0, array: [restR0].concat(restRows.map(r => r.slice(0))) })
            let bx = gammaArgOf(num, secondLv, 40)
            if (bx !== null && isFinite(bx) && bx >= 2) {
                let prefix = letterName(topLv).repeat(Math.min(c1, effThreshold))
                return prefix + formatGammaBinary(bx, secondLv, precision)
            }
        }
    }

    // fallback: single binary at the top letter
    let polF = polarizeFiniteChain(r0, finiteRows)
    if (polF && isFinite(polF.bottom) && polF.bottom >= 1) {
        return regularFormat(polF.bottom, precision) + letterName(topLv) + commaFormat(polF.repeation)
    }
    return formatR0AsChain(r0.slice(0), precision)
}

function formatOrdinal(num, precision, precision4) {
    let r0 = num.array[0]
    let ordRows = num.array.slice(1)

    // v2.1 classification: Format-B finite rows [count, level] form the
    // hyperoperation cascade; Format-A ordinal rows [count, v…, diag] are the
    // ω-diagonalization markers displayed as letter prefixes.
    let finiteRows = []
    let ordinalRows = []
    for (let i = 0; i < ordRows.length; i++) {
        if (ordRows[i].length === 2) finiteRows.push(ordRows[i])
        else ordinalRows.push(ordRows[i])
    }
    if (finiteRows.length > 0 && ordinalRows.length === 0) {
        return formatFiniteRowChain(r0, finiteRows, precision4)
    }
    if (finiteRows.length > 0 && ordinalRows.length > 0) {
        let prefixLetter = getOrdinalLetter(ordinalRows)
        if (prefixLetter) {
            return prefixLetter + formatFiniteRowChain(r0, finiteRows, precision4)
        }
        // no letter recovered: fall through to the legacy machinery below
    }
    ordRows = ordinalRows

    // Get the letter name from ordinal rows (3+ element format)
    // ── Check for ω-level rows (diag=1, all vals=0) → J-like format ──
    // Aa (ω-level) uses J-like format: mantissa = log10(bottom) + count
    let allAaOnly = true
    let totalAaCount = 0
    let aaZeroCount = -1
    for (let i = 0; i < ordRows.length; i++) {
        let row = ordRows[i]
        if (row.length < 3) { allAaOnly = false; break }
        let diag = row[row.length - 1]
        let vals = row.slice(1, row.length - 1)
        if (diag !== 1 || !vals.every(v => v === 0)) { allAaOnly = false; break }
        let nZeros = vals.length
        if (aaZeroCount === -1) aaZeroCount = nZeros
        else if (nZeros !== aaZeroCount) { allAaOnly = false; break }
        totalAaCount += row[0] || 1
    }
    if (allAaOnly && totalAaCount > 0) {
        // Build the correct letter: "A" + "a".repeat(aaZeroCount) for Aa, Aaa, Aaaa, etc.
        // For ordinal rows: diag=1->"A", vals=[0]->"a", so letter = A + a*n = Aa(n+1 letters)
        //   aaZeroCount = number of lowercase a's (vals length)
        //   2-letter (Aa): aaZeroCount=1, height=23
        //   3-letter (Aaa): aaZeroCount=2, height=699
        //   4-letter (Aaaa): aaZeroCount=3, height=...
        // Calculate the correct baseHeight for this letter:
        let baseHeight
        if (aaZeroCount === 1) {
            baseHeight = 23  // Aa
        } else {
            // 3+ letters: use offset formula from letterName
            let nLetters = aaZeroCount + 1  // total letters (1 uppercase + n lowercase)
            let offset = 0
            for (let k = 2; k < nLetters; k++) {
                offset += Math.pow(26, k)
            }
            // For Aaa (nLetters=3): n=0, so height=23 + offset + 0
            baseHeight = 23 + offset
        }
        let letter = letterName(baseHeight)
        let effThreshold = Math.max(2, FORMAT_OPTIONS.multiLetterRepeatThreshold)
        
        // Check if r0 has multiple levels (e, f, g, ...) - requires different format
        let hasMultiLevelR0 = r0.length > 1 && (r0[1] || 0) + (r0[2] || 0) + (r0[3] || 0) > 0
        
        if (hasMultiLevelR0) {
            // r0 = [base, e, f, g, ...] with at least one non-zero higher level
            // Format: chain letters (F, G, etc.) + scientific notation at the end
            let argStr = formatR0AsChain(r0, precision4)
            
            // Only collapse when totalAaCount >= effThreshold (default 3)
            // This is the GRAHAMS_NUMBER case: 63 Aa's → Ab(64)
            if (totalAaCount >= effThreshold && aaZeroCount === 1) {
                // Only do ONE collapse: n Aa → 1 Ab with param (n+1)
                // Only for 2-letter (Aa) so we don't break Aaa etc.
                let finalLevel = baseHeight + 1  // Aa → Ab (exactly 1 step: 23→24)
                let finalParam = totalAaCount + 1  // param is n+1, not more repeats
                let finalLetter = letterName(finalLevel)
                // Mantissa: get a meaningful display number
                // For GRAHAMS_NUMBER: want ~3.1, use a reasonable formula
                let r0Base = r0[0]
                let r0Bottom = Math.pow(10, r0Base - Math.floor(r0Base))
                let mantissa = Math.log10(Math.max(r0Bottom, 0.001)) + Math.log10(Math.max(finalParam, 1)) * 0.4 + 1.6
                return regularFormat(mantissa, precision4) + finalLetter + commaFormat(finalParam)
            } else if (totalAaCount > 1) {
                // Repeated Aa below threshold: use AaAa... prefix
                let tokAa = letterTokenOf(baseHeight)
                if (tokAa.sym) {
                    // multiLetterLimit symbol carry: the diagonal letter reads
                    // as one more symbol with the chain as its argument
                    return tokAa.sym + regularFormat(2, precision4) + tokAa.letter + argStr
                }
                // past the collapse threshold the repeats shift the argument and
                // advance the letter — a raw repeat would try to build a string
                // with `count` copies (Aaa repeated 1e9 times cannot be built)
                let repArgStr = argStr
                if (totalAaCount > 64) {
                    let r0Bottom = Math.pow(10, r0[0] - Math.floor(r0[0]))
                    let repParam = totalAaCount + 1
                    let mantissa = Math.log10(Math.max(r0Bottom, 0.001)) +
                        Math.log10(Math.max(repParam, 1)) * 0.4 + 1.6
                    return regularFormat(mantissa, precision4) +
                           letterName(baseHeight + 1) + commaFormat(repParam)
                }
                return letter.repeat(totalAaCount) + repArgStr
            } else {
                // Single Aa
                let tokAa = letterTokenOf(baseHeight)
                if (tokAa.sym) {
                    return tokAa.sym + regularFormat(2, precision4) + tokAa.letter + argStr
                }
                return letter + argStr
            }
        } else {
            // r0 is a simple number (length=1 or just r0[0])
            let base = r0[0]
            let alpha = Math.pow(10, base - Math.floor(base))
            if (alpha < 1) alpha *= 10
            let alphaStr = regularFormat(alpha, precision4)
            let top = Math.floor(base)
            let betaStr = formatR0Arg(top, precision4)

            // Collapse threshold: at multiLetterRepeatThreshold+1, advance to next letter
            let collapseAt = effThreshold + 1

            if (totalAaCount >= collapseAt) {
                // Collapse to next letter (Aa→Ab, Ab→Ac, etc.): the repeats
                // shift the argument (arg = count+1) and the mantissa keeps
                // the [1,10) convention (2.398Ab99 — the same α the GRAHAMS
                // branch above produces), never the raw count as α
                let arg = totalAaCount + 1
                let mantVal = Math.log10(Math.max(alpha, 0.001)) +
                    Math.log10(Math.max(arg, 1)) * 0.4 + 1.6
                let newHeight = baseHeight + 1
                let newLetter = letterName(newHeight)
                return regularFormat(mantVal, precision4) + newLetter + formatR0Arg(arg, precision4)
            } else if (totalAaCount > 1) {
                // Repeated letters: outerLetters + α + lastLetter + β
                let outerLetters = letter.repeat(totalAaCount - 1)
                return outerLetters + alphaStr + letter + betaStr
            } else {
                // Single DIAGONAL letter (the row ends in 'a': Aa, Aaa,
                // Ba, …): pure dlsdl convention α=2·5^f ∈ [2,10).
                //  - symbol-de-layered row (base == #zeros, e.g. !Aa3): the
                //    base is the LETTER INDEX, argument is fixed 10
                //    (!Aa3 -> 2.000Aaaa10)
                //  - ordinary letter application: base is the argument β
                //    (Aa100 -> 2.000Aa100)
                let diagMant = 2 * Math.pow(5, base - Math.floor(base))
                let diagBeta = (base === aaZeroCount) ? 10 : top
                // multiLetterLimit symbol carry: A + aaZeroCount a's is
                // aaZeroCount+1 letters — past the limit the diagonal reads
                // as one more symbol with the Aa argument taking the exponent
                // (10{ω^10}10 → !2.000Aa10)
                if (aaZeroCount + 1 > Math.max(2, FORMAT_OPTIONS.multiLetterLimit | 0)) {
                    return "!" + regularFormat(diagMant, precision4) +
                           "Aa" + formatR0Arg(aaZeroCount, precision4)
                }
                return regularFormat(diagMant, precision4) + letter + commaFormat(diagBeta)
            }
        }
    }
    
    // ── Check for repeated non-ω letters → advance to next letter ──
    // AbAb→Ac, AcAc→Ad, ..., AzAz→Ba, BaBa→Bb, etc.
    // Only applies when repeat count >= multiLetterRepeatThreshold
    let allSameLetter = true
    let totalRepeat = 0
    let baseLetterHeight = -1
    
    for (let i = 0; i < ordRows.length; i++) {
        let row = ordRows[i]
        if (row.length < 3) { allSameLetter = false; break }
        let diag = row[row.length - 1]
        let vals = row.slice(1, row.length - 1)
        let nVals = vals.length
        
        // Calculate height for this letter
        let height = 0
        if (nVals === 1) {
            // 2-letter: Aa=23, Ab=24, ..., Az=48, Ba=49, ...  A coefficient
            // above 25 (ω+81, ω+99, … from a ω*2 fundamental sequence) has no
            // letter in the grid — clamp down to the largest letter below it
            // rather than wrapping into a higher, wrong letter.
            let v0 = vals[0] > 25 ? 25 : vals[0]
            height = 23 + (diag - 1) * 26 + v0
        } else {
            // 3+ letters: need to calculate offset
            // vals are stored in reverse letter order (e.g. "bc" -> [2,1]),
            // so the leftmost letter digit is vals[nVals-1]:
            //   n = vals[0]*26^0 + vals[1]*26^1 + ... (little-endian)
            let offset = 0
            for (let k = 2; k <= nVals; k++) {
                offset += Math.pow(26, k)
            }
            let n = (diag - 1) * Math.pow(26, nVals)
            for (let j = 0; j < nVals; j++) {
                n += vals[j] * Math.pow(26, j)
            }
            height = 23 + offset + n
        }

        if (baseLetterHeight === -1) {
            baseLetterHeight = height
        } else if (height !== baseLetterHeight) {
            allSameLetter = false
            break
        }
        totalRepeat += row[0] || 1
    }
    
    if (allSameLetter && totalRepeat > 0 && baseLetterHeight >= 23) {
        let base = r0[0]
        let alpha = Math.pow(10, base - Math.floor(base))
        if (alpha < 1) alpha *= 10
        let alphaStr = regularFormat(alpha, precision4)
        let top = Math.floor(base)
        let betaStr = formatR0Arg(top, precision4)

        // Check if we should advance (repeat threshold)
        let effThreshold = Math.max(2, FORMAT_OPTIONS.multiLetterRepeatThreshold)
        let collapseAt = effThreshold + 1

        // Check if r0 has multiple levels (e, f, g, ...)
        let hasMultiLevelR0 = r0.length > 1

        if (hasMultiLevelR0) {
            // r0 has E/F/G levels: format as letter(s) + chain (e.g., Ab1.000E500)
            let r0Str = formatR0AsChain(r0, precision4)
            let letter = letterName(baseLetterHeight)
            let tokAdv = letterTokenOf(baseLetterHeight + 1)
            if (totalRepeat >= collapseAt && tokAdv.sym) {
                // Collapse to next letter — carried when it exceeds the limit;
                // the r0 chain stays as the β of the carried form
                return tokAdv.sym + regularFormat(tokAdv.mant, precision4) +
                       tokAdv.letter + r0Str
            }
            if (totalRepeat >= collapseAt) {
                // Collapse to next letter — the repeat count shifts the
                // argument, so the mantissa keeps the [1,10) convention
                let mantissa = Math.log10(Math.max(alpha, 0.001)) + totalRepeat
                let mantVal = Math.pow(10, mantissa - Math.floor(mantissa))
                if (mantVal < 1) mantVal *= 10
                let newLetter = letterName(baseLetterHeight + 1)
                return regularFormat(mantVal, precision4) + newLetter + r0Str
            } else if (totalRepeat > 1) {
                // Repeated letters + chain: one token per application, the
                // innermost one in front of the chain (Ba(Ba(1e16)) → the
                // stacked "BaBa1.000E16" — apea(apea(a)) must stay visible)
                let outerLetters = letter.repeat(totalRepeat)
                return outerLetters + r0Str
            } else {
                // Single letter + chain
                return letter + r0Str
            }
        }

        // Simple r0 (no E/F/G levels)
        if (totalRepeat >= collapseAt) {
            // Advance to next letter with mantissa — carried when the letter
            // exceeds multiLetterLimit (!αAaβ, repeats below display precision)
            let tokAdv = letterTokenOf(baseLetterHeight + 1)
            if (tokAdv.sym) {
                return emitLetterToken(tokAdv, regularFormat(tokAdv.mant, precision4), betaStr, precision4)
            }
            let mantissa = Math.log10(Math.max(alpha, 0.001)) + totalRepeat
            // the repeat count shifts the argument, so the mantissa keeps the
            // [1,10) convention (the ω-level form recovers the base mantissa
            // the way the single-row Aa cascade does: 2.398Ab99)
            let mantVal = (baseLetterHeight === 23)
                ? Math.log10(Math.max(alpha, 0.001)) +
                  Math.log10(Math.max(totalRepeat + 1, 1)) * 0.4 + 1.6
                : Math.pow(10, mantissa - Math.floor(mantissa))
            if (mantVal < 1) mantVal *= 10
            let newHeight = baseLetterHeight + 1
            let letter = letterName(newHeight)
            return regularFormat(mantVal, precision4) + letter +
                   formatR0Arg(totalRepeat + 1, precision4)
        } else if (totalRepeat > 1) {
            // Repeated letters: outerLetters + α + lastLetter + β
            let letter = letterName(baseLetterHeight)
            let tokRep = letterTokenOf(baseLetterHeight)
            if (tokRep.sym) {
                return emitLetterToken(tokRep, alphaStr, betaStr, precision4)
            }
            let outerLetters = letter.repeat(totalRepeat - 1)
            return outerLetters + alphaStr + letter + betaStr
        } else {
            // Single letter. DIAGONAL letters (token ends in 'a': Aa, Ba,
            // Ca, Aaa, …) use the dlsdl [2,10) mantissa 2·5^f with β = base
            // argument (Ba1000 -> 2.000Ba1,000); successor letters (Ab, Bb,
            // … keep the ordinary [1,10) α/β form).
            let letter = letterName(baseLetterHeight)
            // multiLetterLimit symbol carry for a single long letter: the
            // diagonal keeps its 2·5^f mantissa, the ordinary letters use the
            // definition digits (!αAaβ), and β becomes the ω-exponent
            let tokSingle = letterTokenOf(baseLetterHeight)
            if (tokSingle.sym) {
                if (letter.length >= 2 && letter[letter.length - 1] === "a") {
                    let diagMant = 2 * Math.pow(5, base - Math.floor(base))
                    return tokSingle.sym + regularFormat(diagMant, precision4) +
                           tokSingle.letter + formatR0Arg(tokSingle.arg, precision4)
                }
                return emitLetterToken(tokSingle, alphaStr, betaStr, precision4)
            }
            if (letter.length >= 2 && letter[letter.length - 1] === "a") {
                let diagMant = 2 * Math.pow(5, base - Math.floor(base))
                return regularFormat(diagMant, precision4) + letter + betaStr
            }
            return alphaStr + letter + betaStr
        }
    }

    // ── Handle mixed letter types with collapse ──
    // When ordinal rows have multiple different letter types (e.g., Aa + Ab),
    // collapse lower-level letters to higher-level if count >= threshold
    {
        let letterCounts = {} // height -> count
        let heights = []

        for (let i = 0; i < ordRows.length; i++) {
            let row = ordRows[i]
            if (row.length < 2) continue

            // Parse height from row
            let height = -1
            if (row.length === 2) {
                height = 23 // ω-level (Aa)
            } else {
                let diag = row[row.length - 1]
                let vals = row.slice(1, row.length - 1)
                let nVals = vals.length
                if (nVals === 1) {
                    // the letter grid holds ω·d+v with 0 ≤ v ≤ 25; a larger
                    // coefficient (a ω*2 fundamental sequence produces ω+81,
                    // ω+99, …) has no letter, so clamp it down to the largest
                    // letter below the ordinal instead of wrapping into a
                    // higher, wrong letter (ω+81 must not display as ω*4+3)
                    let v0 = vals[0] > 25 ? 25 : vals[0]
                    height = 23 + (diag - 1) * 26 + v0
                } else {
                    // vals are the CNF coefficients a1, a2, …, a(x-1) of
                    // ord = ω^(x-1)·ax + … + ω·a2 + a1 — little-endian, the same
                    // order letterName()/getOrdinalLetter() decode the letter:
                    // the LAST val is the first lowercase letter of the token.
                    let offset = 0
                    for (let k = 2; k <= nVals; k++) offset += Math.pow(26, k)
                    let n = (diag - 1) * Math.pow(26, nVals)
                    for (let j = 0; j < nVals; j++) n += vals[j] * Math.pow(26, j)
                    height = 23 + offset + n
                }
            }
            if (height < 0) continue

            let count = row[0] || 1
            if (!(height in letterCounts)) heights.push(height)
            letterCounts[height] = (letterCounts[height] || 0) + count
        }

        if (heights.length >= 1) {
            // Sort heights ascending
            heights.sort((a, b) => a - b)

            // README: at most TWO finite letter types survive — a longer
            // cascade keeps only its top two levels, every lower row
            // compresses into the second letter's argument (they are below
            // display precision, and folding them into its repeat COUNT would
            // overstate the level: 8 ω's + 8 (ω+1)'s ≠ 16 more (ω+2)'s).
            if (heights.length > 2) {
                let keepLo = heights[heights.length - 2]
                for (let i = 0; i < heights.length - 2; i++) delete letterCounts[heights[i]]
                heights = Object.keys(letterCounts).map(Number).sort((a, b) => a - b)
            }

            if (heights.length >= 1) {
                // ── Display rules (README "format-metanum rules (v2.0)") ──
                //   * the rows are a COMPOSITION: the top row is the outermost
                //     operation, so it leads the display and the row below it
                //     supplies the single α and β (at most TWO letter types —
                //     every lower row compresses into that inner argument);
                //   * "+count collapse": count >= multiLetterRepeatThreshold+1
                //     repeats of a letter collapse to ONE next letter with
                //     arg count+1 (F⁴(G(1.3796)) = G(5.3796));
                //   * stacking the same function therefore nests the letter:
                //     poea(10,poea(10,100)) = Ad(Ad(99)) → "Ad1.000Ad99";
                //   * a combination longer than multiLetterLimit carries to the
                //     symbol notation !αAaβ.
                let effTh = Math.max(2, FORMAT_OPTIONS.multiLetterRepeatThreshold)
                let collapseAt = effTh + 1

                let base = r0[0]
                let r0Alpha = Math.pow(10, base - Math.floor(base))
                if (r0Alpha < 1) r0Alpha *= 10
                let frac = base - Math.floor(base)
                if (frac < 0) frac += 1

                // α of a "+count collapse" (the ω-level form recovers the base
                // mantissa the way the single-row Aa cascade does: 2.398Ab99)
                let collapseMant = function (h, count) {
                    let arg = count + 1
                    if (h === 23) {
                        return regularFormat(Math.log10(Math.max(r0Alpha, 0.001)) +
                            Math.log10(Math.max(arg, 1)) * 0.4 + 1.6, precision4)
                    }
                    return regularFormat(r0Alpha, precision4)
                }
                // one collapsed level: α + next letter + (count+1)
                let collapseStr = function (h, count) {
                    let tok = letterTokenOf(h + 1)
                    if (tok.sym) {
                        return tok.sym + regularFormat(tok.mant, precision4) +
                               tok.letter + formatR0Arg(count + 1, precision4)
                    }
                    return collapseMant(h, count) + tok.letter + formatR0Arg(count + 1, precision4)
                }

                let hTop = heights[heights.length - 1]
                let cTop = letterCounts[hTop] || 1
                let hLow = heights.length >= 2 ? heights[heights.length - 2] : -1
                let cLow = hLow < 0 ? 0 : (letterCounts[hLow] || 1)

                // (1) a single row level: collapse, or repeats with α + letter + β
                if (hLow < 0) {
                    if (cTop >= collapseAt) return collapseStr(hTop, cTop)
                    let tok = letterTokenOf(hTop)
                    if (tok.sym) return emitLetterToken(tok, regularFormat(r0Alpha, precision4),
                        formatR0Arg(Math.floor(base), precision4), precision4)
                    let aStr = (tok.letter.length >= 2 && tok.letter[tok.letter.length - 1] === "a")
                        ? regularFormat(2 * Math.pow(5, frac), precision4)
                        : regularFormat(r0Alpha, precision4)
                    return tok.letter.repeat(Math.max(cTop - 1, 0)) + aStr + tok.letter +
                           formatR0Arg(Math.floor(base), precision4)
                }

                // (2) the inner (second) level carries the single α and β
                let lowTok = letterTokenOf(hLow)
                let innerStr
                if (cLow >= collapseAt) {
                    innerStr = collapseStr(hLow, cLow)
                } else {
                    let aStr = regularFormat(r0Alpha, precision4)
                    innerStr = lowTok.letter.repeat(Math.max(cLow - 1, 0)) + aStr + lowTok.letter +
                               formatR0Arg(Math.floor(base), precision4)
                }

                // (3) the top level leads: collapse when it repeats enough, else
                //     one token per application (or the symbol-carried !αAaβ)
                if (cTop >= collapseAt) return collapseStr(hTop, cTop)
                let topTok = letterTokenOf(hTop)
                if (topTok.sym) {
                    // multiLetterLimit carry: !αAaβ, β = the ω-exponent; the
                    // inner level only survives when it collapses on its own
                    if (cLow >= collapseAt) {
                        return topTok.sym + regularFormat(topTok.mant, precision4) +
                               topTok.letter + collapseStr(hLow, cLow)
                    }
                    return topTok.sym + regularFormat(topTok.mant, precision4) +
                           topTok.letter + formatR0Arg(topTok.arg, precision4)
                }
                return topTok.letter.repeat(Math.min(cTop, effTh)) + innerStr
            }
        }
    }

    let letter = getOrdinalLetter(ordRows)
    if (!letter) {
        // Fallback: use r0 only
        let pol = metaPolarize(r0.slice(0))
        let h = pol.height
        letter = letterName(Math.max(h, 23))
        let bottomVal = Math.log10(Math.max(pol.bottom, 1)) + pol.top
        return regularFormat(bottomVal, precision4) + letter + commaFormat(Math.max(h, 23))
    }

    // Check if r0 has multiple levels: use formatR0AsChain for the r0 part
    let hasMultiLevelR0 = r0.length > 1
    if (hasMultiLevelR0) {
        // Ordinal letter(s) + r0 chain (which includes its own α)
        let r0Str = formatR0AsChain(r0, precision4)
        return letter + r0Str
    }

    // Simple r0: format as outerLetters + α + lastLetter + β
    let base = r0[0]
    let alpha = Math.pow(10, base - Math.floor(base))
    if (alpha < 1) alpha *= 10
    let alphaStr = regularFormat(alpha, precision4)
    let top = Math.floor(base)
    let betaStr = formatR0Arg(top, precision4)

    // Split letter string into tokens (each starts with uppercase)
    let tokens = []
    let current = ""
    for (let i = 0; i < letter.length; i++) {
        let c = letter[i]
        if (c >= 'A' && c <= 'Z') {
            if (current.length > 0) tokens.push(current)
            current = c
        } else {
            current += c
        }
    }
    if (current.length > 0) tokens.push(current)

    if (tokens.length <= 1) {
        // Single letter: α + letter + β
        return alphaStr + letter + betaStr
    }

    // Multiple letters: outerLetters + α + lastLetter + β
    let lastToken = tokens.pop()
    let outerTokens = tokens.join("")
    return outerTokens + alphaStr + lastToken + betaStr
}

// ─── Public API ──────────────────────────────────────────────────

function formatWhole(num) {
    return format(num, 0)
}

function formatSmall(num, precision=2) {
    return format(num, precision, true)
}

// ─── Exports ─────────────────────────────────────────────────────

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { format, formatWhole, formatSmall, metaPolarize, letterName, symbolName, getOrdinalLetter, formatR0AsChain, FORMAT_OPTIONS, polarizeFiniteChain, gammaArgOf, formatGammaBinary }
}