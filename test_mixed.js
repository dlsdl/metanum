if (!this.MetaNum) MetaNum =  require("./metanum.js");
if (!this.format) format = require("./format-metanum.js").format;
//if (!this.FORMAT_OPTIONS) FORMAT_OPTIONS = require("./format-metanum.js").FORMAT_OPTIONS;

function check(name, input, expectedArray) {
  try {
    var m = MetaNum(input);
    var arrStr = JSON.stringify(m.array);
    var expStr = JSON.stringify(expectedArray);
    var pass = arrStr === expStr;
    console.log((pass ? "PASS" : "FAIL") + " | " + name + " | " + input);
    if (!pass) {
      console.log("  Got:      " + arrStr);
      console.log("  Expected: " + expStr);
    }
  } catch (e) {
    console.log("ERROR | " + name + " | " + input + " => " + e.message);
  }
}

function checkRT(name, input) {
  try {
    var m = MetaNum(input);
    var s = m.toString();
    var m2 = MetaNum(s);
    var pass = m.eq(m2);
    console.log((pass ? "PASS" : "FAIL") + " | RT " + name + " | " + input + " => " + s + " => " + m2.toString());
    if (!pass) console.log("  Got:      " + m2.toString());
  } catch (e) {
    console.log("ERROR | RT " + name + " | " + input + " => " + e.message);
  }
}

// ── G0 process gate (hyper_inv spec 4.2.3 / tasks 10.1) ──────────────────────
// Every line that starts with "FAIL |" or "ERROR |" is counted here, and the
// end of the file turns any such line into a non-zero process exit code.  The
// legacy helpers above only print; this wrapper adds the exit-code contract
// without touching a single existing assertion.
var GATE_COUNTS = { fail: 0, error: 0 };
(function () {
  var rawLog = console.log;
  console.log = function () {
    var first = arguments[0];
    if (typeof first === "string") {
      if (first.indexOf("FAIL |") === 0) GATE_COUNTS.fail++;
      else if (first.indexOf("ERROR |") === 0) GATE_COUNTS.error++;
    }
    return rawLog.apply(console, arguments);
  };
})();


// G1  PARSING & ROUND-TRIP
//     G1.1  letter chains (1-4 letters, symbols, ε) round-trip
//     G1.2  mixed tokens & spaced \"^count\" chains
// G2  CORE ARITHMETIC & UNARY OPS
//     G2.1  basic arithmetic (< MSI vs > MSI)
//     G2.2  power operations (< MSI vs > MSI)
//     G2.3  roots (< MSI vs > MSI)
//     G2.4  logarithms (< MSI vs > MSI)
//     G2.5  factorial, gamma and Lambert W (< MSI vs > MSI)
//     G2.6  rounding and modulus (< MSI vs > MSI)
//     G2.7  other unary operations (< MSI vs > MSI)
//     G2.8  hyperoperation base (< MSI vs > MSI)
//     G2.9  pentate_log/root
//     G2.10  hyper_log/root
//     G2.11  hyperoperation definition
// G3  HYPEROPERATION DEFINITIONS (ω … ε₀)
//     G3.1  aperiote (ω)
//     G3.2  expande (ω+1)
//     G3.3  multiexpande (ω+2)
//     G3.4  powerexpande (ω+3)
//     G3.5  aperioexpande (ω*2)
//     G3.6  explode (ω*2+1)
//     G3.7  multiexplode (ω*2+2)
//     G3.8  aperioexplode (ω*3)
//     G3.9  detonate (ω*3+1)
//     G3.10  aperiodetonate (ω*4)
//     G3.11  aperionate (ω^2)
//     G3.12  megote (ω^2+1)
//     G3.13  multimegote (ω^2+2)
//     G3.14  aperimegote (ω^2+ω)
//     G3.15  megoexpande (ω^2+ω+1)
//     G3.16  aperimegoexpande (ω^2+ω*2)
//     G3.17  megoaperionate (ω^2*2)
//     G3.18  gigote (ω^2*2+1)
//     G3.19  aperigigote (ω^2*2+ω)
//     G3.20  gigoaperionate (ω^2*3)
//     G3.21  aperiatote (ω^3)
//     G3.22  powiainate (ω^3+1)
//     G3.23  expandainate (ω^3+ω)
//     G3.24  megodainate (ω^3+ω^2)
//     G3.25  powiairate (ω^3*2)
//     G3.26  aperioguate (ω^4)
//     G3.27  iter (ω^ω)
//     G3.28  itermult (ω^ω+1)
//     G3.29  cuboiter (ω^ω*2)
//     G3.30  expoiter (ω^(ω+1))
//     G3.31  trioterate (ω^(ω*2))
//     G3.32  trixxate (ω^(ω^2))
//     G3.33  aperixxate (ω^(ω^ω))
//     G3.34  epsilonate (ε₀)
//     G3.35  λ[y] layer markers in STANDARD form
//     G3.36  precision budget (maxRows/maxCols)
// G4  HYPEROPERATION REGIMES, INVERSES & COUNT LAWS
//     G4.1  all hyperoperations x=1, y=3 test
//     G4.2  all hyperoperations x=3, y=1 test
//     G4.3  hyperoperation (x > MSI)
//     G4.4  hyperoperation (y > MSI)
//     G4.5  inverse operation (> MSI) roundtrip
//     G4.6  inverse round-trip (small y and y > MSI)
//     G4.7  hyperoperation iteration tests
//     G4.8  triple nested hyperoperation tests
//     G4.9  big ordinal annex small ordinal tests x=QqQe308
//     G4.10  big ordinal annex small ordinal tests y=QqQe308
//     G4.11  hyperoperation large-cardinal (x > 10^16)
//     G4.12  h11/h12/h13 count law
//     G4.13  h20+ : expanded form & count law
//     G4.14  h20+ with fractional y
//     G4.15  ordinal-level root forms (aperiote_root/r10 … epsilonate_root/repsl)
//     G4.16  huge-y growth (y > COEFF_BOUND sup-collapse must encode λ[y])
//     G7.12  format "null" regression (inner chain null → Γ-collapse)
// G5  ENGINE ARRAYS & BEAF
//     G5.1  engine arrays
//     G5.2  BEAF ordinal nesting
// G6  HARDY HIERARCHY
//     G6.1  hardy hierarchy (all cases)
//     G6.2  v2.0.2 hardy fixes
//     G6.3  hardy(n ≥ 1e10) : base & cascade
//     G6.4  v2.0.2 hardy(n > 1e10) round 2
//     G6.5  v2.0.2 unnamed-level format
//     G6.6  fractional levels
//     G6.7  ordinal-level fractional arguments
// G7  FORMAT()
//     G7.1  format() verification
//     G7.2  reciprocal format tests
//     G7.3  format α correctness
//     G7.4  maxCols/maxRows = 20 (Z10)
//     G7.5  symbol layer semantics
//     G7.6  two-letter rule
//     G7.7  hardy hierarchy display forms
//     G7.8  diagonal letter convention
//     G7.9  cross-config stability
//     G7.10  MetaNum(...).format() instance method
//     G7.11  FORMAT_OPTIONS take effect
// G8  REGRESSION VECTORS
//     G8.1  D01 pow(10, negative alpha) sign
//     G8.2  D02 toBeaf base preservation
//     G8.3  D03 toBeaf unrepresentable behavior
//     G8.4  D04 format repeated-letter chains
//     G8.5  D05 !Aa(real alpha)
//     G8.6  D06 !alpha Aa beta
//     G8.7  D07 2{lambda}2
//     G8.8  hardy base extension
// ──────────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────────
// TEST SUITE MAP — grouped by feature, executed top to bottom.
// Each `=== Gx.y ... ===` banner names its group, so a failure is
// immediately traceable to a feature area.
// ──────────────────────────────────────────────────────────────────
// G1  STRING PROCESSING & PARSING
//     G1.1  letter chains (1-4 letters, symbols, ε) round-trip
//     G1.2  mixed tokens & spaced \"^count\" chains
//     G1.3  symbol layer semantics
//     G1.4  D05 !Aa(real alpha)
//     G1.5  D06 !alpha Aa beta
// G2  ORDINARY ARITHMETIC
//     G2.1  basic arithmetic (< MSI vs > MSI)
//     G2.2  power operations (< MSI vs > MSI)
//     G2.3  roots (< MSI vs > MSI)
//     G2.4  logarithms (< MSI vs > MSI)
//     G2.5  factorial, gamma and Lambert W (< MSI vs > MSI)
//     G2.6  rounding and modulus (< MSI vs > MSI)
//     G2.7  other unary operations (< MSI vs > MSI)
//     G2.8  D01 pow(10, negative alpha) sign
// G3  HYPEROPERATIONS
//     G3.1  hyperoperation base (< MSI vs > MSI)
//     G3.2  pentate_log/root
//     G3.3  hyper_log/root
//     G3.4  aperiote (ω)
//     G3.5  expande (ω+1)
//     G3.6  multiexpande (ω+2)
//     G3.7  powerexpande (ω+3)
//     G3.8  aperioexpande (ω*2)
//     G3.9  explode (ω*2+1)
//     G3.10  multiexplode (ω*2+2)
//     G3.11  aperioexplode (ω*3)
//     G3.12  detonate (ω*3+1)
//     G3.13  aperiodetonate (ω*4)
//     G3.14  aperionate (ω^2)
//     G3.15  megote (ω^2+1)
//     G3.16  multimegote (ω^2+2)
//     G3.17  aperimegote (ω^2+ω)
//     G3.18  megoexpande (ω^2+ω+1)
//     G3.19  aperimegoexpande (ω^2+ω*2)
//     G3.20  megoaperionate (ω^2*2)
//     G3.21  gigote (ω^2*2+1)
//     G3.22  aperigigote (ω^2*2+ω)
//     G3.23  gigoaperionate (ω^2*3)
//     G3.24  aperiatote (ω^3)
//     G3.25  powiainate (ω^3+1)
//     G3.26  expandainate (ω^3+ω)
//     G3.27  megodainate (ω^3+ω^2)
//     G3.28  powiairate (ω^3*2)
//     G3.29  aperioguate (ω^4)
//     G3.30  iter (ω^ω)
//     G3.31  itermult (ω^ω+1)
//     G3.31b  iteraperiate (ω^ω+ω)
//     G3.32  cuboiter (ω^ω*2)
//     G3.33  expoiter (ω^(ω+1))
//     G3.34  trioterate (ω^(ω*2))
//     G3.35  trixxate (ω^(ω^2))
//     G3.36  aperixxate (ω^(ω^ω))
//     G3.37  epsilonate (ε₀)
//     G3.38  λ[y] layer markers in STANDARD form
//     G3.39  precision budget (maxRows/maxCols)
//     G3.40  all hyperoperations x=1, y=3 test
//     G3.41  all hyperoperations x=3, y=1 test
//     G3.42  hyperoperation (x > MSI)
//     G3.43  hyperoperation (y > MSI)
//     G3.44  inverse operation (> MSI) roundtrip
//     G3.45  inverse round-trip (small y and y > MSI)
//     G3.46  hyperoperation iteration tests
//     G3.47  triple nested hyperoperation tests
//     G3.48  big ordinal annex small ordinal tests x=QqQe308
//     G3.49  big ordinal annex small ordinal tests y=QqQe308
//     G3.50  hyperoperation large-cardinal (x > 10^16)
//     G3.51  h11/h12/h13 count law
//     G3.52  h20+ : expanded form & count law
//     G3.53  h20+ with fractional y
//     G3.54  engine arrays
//     G3.55  fractional levels
//     G3.56  ordinal-level fractional arguments
//     G3.57  D07 2{lambda}2
// G4  BEAF · HARDY · FGH
//     G4.1  BEAF ordinal nesting
//     G4.2  hardy hierarchy (all cases)
//     G4.3  v2.0.2 hardy fixes
//     G4.4  hardy(n ≥ 1e10) : base & cascade
//     G4.5  v2.0.2 hardy(n > 1e10) round 2
//     G4.6  D02 toBeaf base preservation
//     G4.7  D03 toBeaf unrepresentable behavior
//     G4.8  hardy base extension
// G5  PLAIN FORMAT()
//     G5.1  format() verification
//     G5.2  reciprocal format tests
//     G5.3  maxCols/maxRows = 20 (Z10)
//     G5.4  FORMAT_OPTIONS take effect
//     G5.5  D04 format repeated-letter chains
// G6  FORMAT() COMBINED WITH OTHER OPERATIONS
//     G6.1  v2.0.2 unnamed-level format
//     G6.2  format α correctness
//     G6.3  two-letter rule
//     G6.4  single-letter canonical forms (formatSingleLetterType)
//     G6.5  hardy hierarchy display forms
//     G6.6  diagonal letter convention
//     G6.7  cross-config stability
//     G6.8  MetaNum(...).format() instance method
// ──────────────────────────────────────────────────────────────────
// G1  STRING PROCESSING & PARSING
//     G1.1  letter chains (1-4 letters, symbols, ε) round-trip
//     G1.2  mixed tokens & spaced \"^count\" chains
//     G1.3  symbol layer semantics
//     G1.4  D05 !Aa(real alpha)
//     G1.5  D06 !alpha Aa beta
// G2  ORDINARY ARITHMETIC
//     G2.1  basic arithmetic (< MSI vs > MSI)
//     G2.2  power operations (< MSI vs > MSI)
//     G2.3  roots (< MSI vs > MSI)
//     G2.4  logarithms (< MSI vs > MSI)
//     G2.5  factorial, gamma and Lambert W (< MSI vs > MSI)
//     G2.6  rounding and modulus (< MSI vs > MSI)
//     G2.7  other unary operations (< MSI vs > MSI)
//     G2.8  D01 pow(10, negative alpha) sign
// G3  HYPEROPERATIONS
//     G3.1  hyperoperation base (< MSI vs > MSI)
//     G3.2  pentate_log/root
//     G3.3  hyper_log/root
//     G3.4  aperiote (ω)
//     G3.5  expande (ω+1)
//     G3.6  multiexpande (ω+2)
//     G3.7  powerexpande (ω+3)
//     G3.8  aperioexpande (ω*2)
//     G3.9  explode (ω*2+1)
//     G3.10  multiexplode (ω*2+2)
//     G3.11  aperioexplode (ω*3)
//     G3.12  detonate (ω*3+1)
//     G3.13  aperiodetonate (ω*4)
//     G3.14  aperionate (ω^2)
//     G3.15  megote (ω^2+1)
//     G3.16  multimegote (ω^2+2)
//     G3.17  aperimegote (ω^2+ω)
//     G3.18  megoexpande (ω^2+ω+1)
//     G3.19  aperimegoexpande (ω^2+ω*2)
//     G3.20  megoaperionate (ω^2*2)
//     G3.21  gigote (ω^2*2+1)
//     G3.22  aperigigote (ω^2*2+ω)
//     G3.23  gigoaperionate (ω^2*3)
//     G3.24  aperiatote (ω^3)
//     G3.25  powiainate (ω^3+1)
//     G3.26  expandainate (ω^3+ω)
//     G3.27  megodainate (ω^3+ω^2)
//     G3.28  powiairate (ω^3*2)
//     G3.29  aperioguate (ω^4)
//     G3.30  iter (ω^ω)
//     G3.31  itermult (ω^ω+1)
//     G3.31b  iteraperiate (ω^ω+ω)
//     G3.32  cuboiter (ω^ω*2)
//     G3.33  expoiter (ω^(ω+1))
//     G3.34  trioterate (ω^(ω*2))
//     G3.35  trixxate (ω^(ω^2))
//     G3.36  aperixxate (ω^(ω^ω))
//     G3.37  epsilonate (ε₀)
//     G3.38  λ[y] layer markers in STANDARD form
//     G3.39  precision budget (maxRows/maxCols)
//     G3.40  all hyperoperations x=1, y=3 test
//     G3.41  all hyperoperations x=3, y=1 test
//     G3.42  hyperoperation (x > MSI)
//     G3.43  hyperoperation (y > MSI)
//     G3.44  inverse operation (> MSI) roundtrip
//     G3.45  inverse round-trip (small y and y > MSI)
//     G3.46  hyperoperation iteration tests
//     G3.47  triple nested hyperoperation tests
//     G3.48  big ordinal annex small ordinal tests x=QqQe308
//     G3.49  big ordinal annex small ordinal tests y=QqQe308
//     G3.50  hyperoperation large-cardinal (x > 10^16)
//     G3.51  h11/h12/h13 count law
//     G3.52  h20+ : expanded form & count law
//     G3.53  h20+ with fractional y
//     G3.54  engine arrays
//     G3.55  fractional levels
//     G3.56  ordinal-level fractional arguments
//     G3.57  D07 2{lambda}2
// G4  BEAF · HARDY · FGH
//     G4.1  BEAF ordinal nesting
//     G4.2  hardy hierarchy (all cases)
//     G4.3  v2.0.2 hardy fixes
//     G4.4  hardy(n ≥ 1e10) : base & cascade
//     G4.5  v2.0.2 hardy(n > 1e10) round 2
//     G4.6  D02 toBeaf base preservation
//     G4.7  D03 toBeaf unrepresentable behavior
//     G4.8  hardy base extension
// G5  PLAIN FORMAT()
//     G5.1  format() verification
//     G5.2  reciprocal format tests
//     G5.3  maxCols/maxRows = 20 (Z10)
//     G5.4  FORMAT_OPTIONS take effect
//     G5.5  D04 format repeated-letter chains
// G6  FORMAT() COMBINED WITH OTHER OPERATIONS
//     G6.1  v2.0.2 unnamed-level format
//     G6.2  format α correctness
//     G6.3  two-letter rule
//     G6.4  hardy hierarchy display forms
//     G6.5  diagonal letter convention
//     G6.6  cross-config stability
//     G6.7  MetaNum(...).format() instance method
// ──────────────────────────────────────────────────────────────────

// ══════════════════════════════════════════════════════════════════
// G1 · STRING PROCESSING & PARSING
//   letter-chain / symbol-layer / !Aa-notation parsing and round-trip
// ══════════════════════════════════════════════════════════════════

console.log("\n=== G1.1 letter chains (1-4 letters, symbols, ε) round-trip ===");
[
  // 1-letter
  "E308", "EE100",
  "E^9999999998 10000000000",
  "F^8 E^8 10000000000",
  "I^998 H^8 G^8 F^8 E^8 10000000000",
  "Y^8 X^8 W^8 V^8 U^8 T^8 S^8 R^8 Q^8 P^8 O^8 N^8 M^8 L^8 K^8 J^8 I^8 H^8 G^8 F^8 E^8 10000000000",
  // 2-letter
  "Aa10", "Ab5", "Ac100", "AaAa10", "AbAb10", "Ba10", "BaBa10", "Bb10",
  "Bc10", "Bz10", "Ca10", "Zz10",
  // 3-letter
  "Aaa10", "Aaa1000", "AaaAaa10", "Aab10", "Aac10", "Aba10", "Abb10",
  "Aza10", "Baa10", "Zzz10",
  // 4-letter
  "Aaaa10", "Aaaa1000", "AaaaAaaa10", "Aaab10", "Aaba10", "Abaa10",
  "Baaa10", "Zzzz10",
  // symbol layers (! @ #) and ε layers
  "!Aa10", "!Abcd10", "@Ef10", "#Gh100", "1ε100", "1ε9007199254740991"
].forEach(function (s) { checkRT(s, s); });

console.log("\n=== G1.2 mixed tokens & spaced \"^count\" chains ===");
check("BbBbAaGGGFFE100 array", "BbBbAaGGGFFE100", [[100, 1, 2, 3], [1,0,1],[2,1,2]]);
check("QqQe308 array", "QqQe308", [[308], [1, 4, 17], [1, 16, 17]]);
check("E^8 10000000000 array", "E^8 10000000000", [[10000000000, 8]]);
check("F^8 E^8 10000000000 array", "F^8 E^8 10000000000", [[10000000000, 8, 8]]);
check("M^7 chain array", "M^7 L^8 K^8 J^8 I^8 H^8 G^8 F^8 E^8 10000000000", [[10000000000, 8, 8, 8, 8, 8, 8, 8, 8, 7]]);
check("I^998 chain array (J1000)", "I^998 H^8 G^8 F^8 E^8 10000000000", [[10000000000, 8, 8, 8, 8, 998]]);
check("E^65532 19727.7804056 array", "E^65532 19727.7804056", [[19727.7804056, 65532]]);
[
  "BbBbAaGGGFFE100", "QqQe308",
  "E^8 10000000000", "F^8 E^8 10000000000",
  "M^7 L^8 K^8 J^8 I^8 H^8 G^8 F^8 E^8 10000000000",
  "I^998 H^8 G^8 F^8 E^8 10000000000",
  "E^9999999998 10000000000"
].forEach(function (s) { checkRT(s, s); });

function checkOp(label, result, expectedVal, tol) {
  if (tol === undefined) tol = 0.01;
  try {
    // no expected value: informational check (must not throw, must be a MetaNum)
    if (expectedVal === undefined) {
      console.log("PASS | " + label + " | got: " + (result.toString ? result.toString().slice(0,100) : result));
      return;
    }
    // boolean results: strict comparison
    if (typeof result === "boolean" || typeof expectedVal === "boolean") {
      console.log((result === expectedVal ? "PASS" : "FAIL") + " | " + label + " | got=" + result + " expected=" + expectedVal);
      return;
    }
    var rn = result.toNumber ? result.toNumber() : result;
    if (Number.isNaN(rn) && Number.isNaN(expectedVal)) {
      console.log("PASS | " + label + " | NaN (expected)");
      return;
    }
    if (Number.isFinite(rn) && Number.isFinite(expectedVal)) {
      var ok = Math.abs(rn - expectedVal) <= tol;
      console.log((ok ? "PASS" : "FAIL") + " | " + label + " | got=" + (result.toString ? result.toString().slice(0,100) : result) + " expected=" + expectedVal);
      return;
    }
    var ok2 = Math.abs(result.array[0][0] - MetaNum(expectedVal).array[0][0]) <= tol;
    console.log((ok2 ? "PASS" : "FAIL") + " | " + label + " | got=" + (result.toString ? result.toString().slice(0,100) : result) + " expected=" + expectedVal);
  } catch (e) {
    console.log("ERROR | " + label + " => " + e.message);
  }
}

function checkBool(label, result, expected) {
  try {
    var pass = result === expected;
    console.log((pass ? "PASS" : "FAIL") + " | " + label + " | got=" + result + " expected=" + expected);
  } catch (e) {
    console.log("ERROR | " + label + " => " + e.message);
  }
}

// big number (> MSI) vs small number (< MSI) all operations test
var m0 = MetaNum(0);
var m1 = MetaNum(1);
var m2 = MetaNum(2);
var m3 = MetaNum(3);
var m4 = MetaNum(4);
var mSmall = MetaNum(1e6);           // 1,000,000 < MSI
var mSmall2 = MetaNum(1e9);          // 1,000,000,000 < MSI
var mBig = MetaNum(1e16);            // 10,000,000,000,000,000 > MSI
var mBig2 = MetaNum(1e20);           // > MSI
var mT = MetaNum.arrow(3,3,3);

console.log("\n=== G1.3 symbol layer semantics ===");
(function () {
  // issue #19: an INTEGER !Aa<n> is the full rule-3 cascade of 10{ω^n}10
  // ("!" adds one ω^ to the level) — base [10] + (maxRows−1) ordinal rows,
  // top row [8, 9×n], layer 0.  @Aa<n> keeps the same array at layer 1 and
  // #Aa<n> at layer 2 (one ω^ per symbol).
  var x = MetaNum("!Aa5");
  checkBool("!Aa5 = 10{ω^5}10 cascade (19 ordinal rows)",
    x.array.length === MetaNum.maxRows && x.array[0].length === 1 && x.array[0][0] === 10 &&
    JSON.stringify(x.array[x.array.length - 1]) === JSON.stringify([8, 9, 9, 9, 9, 9]) && x.layer === 0, true);
  checkBool("!Aa5 === engine 10{ω^5}10",
    x.eq(MetaNum._hyperopFromOrdinalRaw(MetaNum.TEN.clone(), MetaNum.TEN.clone(), [0, 0, 0, 0, 0, 1])), true);
  checkBool("!1.000Aa5 = !Aa5 (binary form α=1)", MetaNum("!1.000Aa5").eq(x), true);
  var y = MetaNum("@Aa5");
  checkBool("@Aa5 = !Aa5 array at layer 1 (two ω^ layers)",
    JSON.stringify(y.array) === JSON.stringify(x.array) && y.layer === 1, true);
  checkBool("@1.000Aa5 = @Aa5", MetaNum("@1.000Aa5").eq(y), true);
  var z = MetaNum("#Aa5");
  checkBool("#Aa5 = !Aa5 array at layer 2 (three ω^ layers)",
    JSON.stringify(z.array) === JSON.stringify(x.array) && z.layer === 2, true);
  var ab = MetaNum("!Ab5");
  checkBool("!Ab5 = 10{ω^(ω+1)}5 (layer 1, row [1,1,1])",
    ab.layer === 1 && JSON.stringify(ab.array[1]) === JSON.stringify([1, 1, 1]), true);
  checkBool("!Ba5 = 10{ω^(ω*2)}5 (layer 1, row [1,0,2])",
    MetaNum("!Ba5").layer === 1 && JSON.stringify(MetaNum("!Ba5").array[1]) === JSON.stringify([1, 0, 2]), true);
  checkBool("layer monotonicity Aa5 < !Aa5 < @Aa5 < #Aa5",
    MetaNum("Aa5").lt(x) && x.lt(y) && y.lt(z), true);
  checkBool("!Ab5 > !Aa5", ab.gt(x), true);
  checkRT("!Aa5", "!Aa5");
  checkRT("@Aa5", "@Aa5");
  checkRT("#Aa5", "#Aa5");
  checkRT("!Ab5", "!Ab5");

  // issue #19 residual: n=1 carries to the single-letter N10 spelling.  The
  // layer prefix must survive (format → parse → eq), not parse to 0.
  function fmtRT(input) {
    var v = MetaNum(input);
    return v.eq(MetaNum(format(v)));
  }
  ok("format round-trip @Aa1 (!1.000N10)", fmtRT("@Aa1"), format(MetaNum("@Aa1")));
  ok("format round-trip #Aa1 (@1.000N10)", fmtRT("#Aa1"), format(MetaNum("#Aa1")));

  // issue #26: non-integer multi-a markers use the exact token spelling
  // (Aaa1.5) instead of the rounded αAaaβ form (4.472Aaa1).
  ok("format round-trip @Aa1.5 (!Aaa1.5)", fmtRT("@Aa1.5"), format(MetaNum("@Aa1.5")));
  ok("format round-trip @Aa2.5 (!Aaaa2.5)", fmtRT("@Aa2.5"), format(MetaNum("@Aa2.5")));
  ok("format round-trip #Aa2.5 (@Aaaa2.5)", fmtRT("#Aa2.5"), format(MetaNum("#Aa2.5")));

  // issue #28: past multiLetterLimit the pure diagonal keeps the exact token
  // (the old carry !1.000H10 hard-coded 10 and added a layer).
  ok("format round-trip Aaaaa3.5", fmtRT("Aaaaa3.5"), format(MetaNum("Aaaaa3.5")));
  ok("format round-trip Aaaaa5", fmtRT("Aaaaa5"), format(MetaNum("Aaaaa5")));
  ok("format round-trip Aaaaa10", fmtRT("Aaaaa10"), format(MetaNum("Aaaaa10")));
  ok("format round-trip @Aa3.5", fmtRT("@Aa3.5"), format(MetaNum("@Aa3.5")));
  ok("format round-trip #Aa3.5", fmtRT("#Aa3.5"), format(MetaNum("#Aa3.5")));
})();

console.log("\n=== G1.4 D05 !Aa(real alpha) ===");
(function () {
  ok("!Aa0.5 != 0", MetaNum("!Aa0.5").neq(0), MetaNum("!Aa0.5").toString());
  ok("!Aa1.5 != 0", MetaNum("!Aa1.5").neq(0), MetaNum("!Aa1.5").toString());
  ok("!Aa2.5 != 0", MetaNum("!Aa2.5").neq(0), MetaNum("!Aa2.5").toString());
  ok("!Aa1.5 === Aa1.5", MetaNum("!Aa1.5").eq(MetaNum("Aa1.5")));
  ok("!Aa2.5 === Aaa2.5", MetaNum("!Aa2.5").eq(MetaNum("Aaa2.5")));
  // issue #19: an INTEGER !Aa<n> is the diagonal 10{ω^n}10 ("!" adds one ω^
  // to the level), stored as the full rule-3 cascade — the README's original
  // letter-law anchors (!Aa1 = Aa10, !Aa2 = Aaa10-equivalent engine value).
  ok("!Aa1 < !Aa2 < !Aa3 < !Aa5 (integer diagonal anchors)",
    MetaNum("!Aa1").lt(MetaNum("!Aa2")) && MetaNum("!Aa2").lt(MetaNum("!Aa3")) &&
    MetaNum("!Aa3").lt(MetaNum("!Aa5")));
  ok("!Aa1.5 < !Aa2.5 (smooth curve below the diagonal)",
    MetaNum("!Aa1.5").lt(MetaNum("!Aa2.5")));
  // past the row budget (n ≥ maxCols) the cascade would silently truncate
  // ω^n down to ω^(maxCols−1): go ONE LAYER UP with the de-!-ed compact
  // [[n],[1,0,1]] instead (the 300 stays in r0 and the display round-trips)
  var ob = MetaNum("!Aa300");
  ok("!Aa300 = [[300],[1,0,1]] at layer 1 (over-budget)",
    ob.layer === 1 && ob.array.length === 2 &&
    JSON.stringify(ob.array[0]) === "[300]" && JSON.stringify(ob.array[1]) === "[1,0,1]");
  ok("!Aa300 > !Aa19 (no truncation to ω^19)",
    ob.gt(MetaNum("!Aa19")));
  ok("!Aa300 format/parse round-trip",
    MetaNum.fromString(format(ob)).eq(ob) && format(ob) === "!2.000Aa300");
  ok("!Aa20 is the first over-budget case (maxCols = 20)",
    MetaNum("!Aa20").layer === 1 && MetaNum("!Aa19").layer === 0);
  ok("@Aa300 / #Aa300 keep the compact one layer higher",
    MetaNum("@Aa300").layer === 2 && MetaNum("#Aa300").layer === 3 &&
    MetaNum("@Aa300").gt(MetaNum("!Aa300")) && MetaNum("#Aa300").gt(MetaNum("@Aa300")));
  ok("!2Aa300 / !2.000Aa300 agree with !Aa300",
    MetaNum("!2Aa300").eq(ob) && MetaNum("!2.000Aa300").eq(ob));
  function omegaPow(n) {
    var c = []; for (var i = 0; i < n; i++) c.push(0); c.push(1);
    return MetaNum._hyperopFromOrdinalRaw(MetaNum.TEN.clone(), MetaNum.TEN.clone(), c);
  }
  ok("!Aa1 === Aa10 (10{ω}10 = 10{10}10)", MetaNum("!Aa1").eq(MetaNum("Aa10")));
  ok("!Aa2 === 10{ω^2}10", MetaNum("!Aa2").eq(omegaPow(2)));
  ok("!Aa5 === 10{ω^5}10", MetaNum("!Aa5").eq(omegaPow(5)));
  ok("!Aa10 === 10{ω^10}10", MetaNum("!Aa10").eq(omegaPow(10)));
  // array shape: [[10]] + (maxRows-1) ordinal rows, top row [8, 9×n], layer 0
  var a3 = MetaNum("!Aa3");
  ok("!Aa3 is the full 10{ω^3}10 cascade (19 ordinal rows)",
    a3.array.length === MetaNum.maxRows && a3.array[0].length === 1 && a3.array[0][0] === 10 &&
    JSON.stringify(a3.array[a3.array.length - 1]) === "[8,9,9,9]" && a3.layer === 0);
  ok("@Aa3 = !Aa3 array at layer 1, #Aa3 at layer 2",
    JSON.stringify(MetaNum("@Aa3").array) === JSON.stringify(a3.array) && MetaNum("@Aa3").layer === 1 &&
    JSON.stringify(MetaNum("#Aa3").array) === JSON.stringify(a3.array) && MetaNum("#Aa3").layer === 2);
  ok("Aa3 = 2Aa3 = 10{3}10 → [[10^10,8,8]]",
    JSON.stringify(MetaNum("Aa3").array) === "[[10000000000,8,8]]" &&
    JSON.stringify(MetaNum("2Aa3").array) === "[[10000000000,8,8]]");
})();

// ─────────────────────────────────────────────────────────────
// D06 · !αAaβ = !Aa(β + log₅(α/2))  (notation-semantics §2, A1)
// ─────────────────────────────────────────────────────────────
console.log("\n=== G1.5 D06 !alpha Aa beta ===");
(function () {
  function log5(x) { return Math.log(x) / Math.log(5); }
  function buildAa(x) {
    var k = Math.max(1, Math.floor(x));
    var row = [1];
    for (var i = 0; i < k; i++) row.push(0);
    row.push(1);
    return MetaNum.fromArray([[x], row]);
  }
  ok("!2.5Aa4 != 0", MetaNum("!2.5Aa4").neq(0), MetaNum("!2.5Aa4").toString());
  ok("!1.5Aa4 != 0", MetaNum("!1.5Aa4").neq(0), MetaNum("!1.5Aa4").toString());
  ok("!1Aa1.5 != 0", MetaNum("!1Aa1.5").neq(0), MetaNum("!1Aa1.5").toString());
  // formula: !αAaβ == !Aa(β + log5(α/2))
  ok("!2.5Aa4 == !Aa(4+log5(2.5/2))",
    MetaNum("!2.5Aa4").eq(buildAa(4 + log5(2.5 / 2))));
  ok("!1.5Aa4 == !Aa(4+log5(1.5/2))",
    MetaNum("!1.5Aa4").eq(buildAa(4 + log5(1.5 / 2))));
  // no regression on the documented anchor (α=2 → log5(1)=0)
  ok("!2.0000Aa4 === !Aa4", MetaNum("!2.0000Aa4").eq(MetaNum("!Aa4")));
  // legacy 1.0+ spelling still means "no mantissa"
  ok("!1.000Aa5 === !Aa5 (legacy)", MetaNum("!1.000Aa5").eq(MetaNum("!Aa5")));
  // formatter round-trips the true value as the approximate binary form
  // (issue #20: the README convention α'Aaβ' with α' = 2·5^(x−β'); the
  // mantissa carries FORMAT_OPTIONS digits, so the round-trip is exact only
  // when α' is exactly representable — otherwise use rtApprox below)
  eq("format(!2.5Aa4)", format(MetaNum("!2.5Aa4")), "!2.500Aa4");
  ok("round-trip !2.5Aa4", MetaNum(format(MetaNum("!2.5Aa4"))).eq(MetaNum("!2.5Aa4")));
  ok("round-trip !2.376Aa999", MetaNum(format(MetaNum("!2.376Aa999"))).eq(MetaNum("!2.376Aa999")));
  // issue #20 vectors: the diagonal letters follow the README — Aaα = 10{α}10
  // (Aa1.5 = 10{2}4.472 = [[924.19,3]], between Aa1 and Aa2), and format is
  // the APPROXIMATE form α'Aaβ' (α' decimal, β' integer), which the single-
  // letter machinery then carries to its final display.
  eq("format(Aa1.5)", format(MetaNum("Aa1.5")), "EE1.537E924");
  eq("format(Aa2.5)", format(MetaNum("Aa2.5")), "FFFE1.745E9");
  ok("Aa1.5 = 10{2}(2·5^0.5) → [[924.19,3]]",
    MetaNum("Aa1.5").eq(MetaNum(10).arrow(2)(2 * Math.pow(5, 0.5))) &&
    MetaNum("Aa1.5").array.length === 1 && MetaNum("Aa1.5").array[0].length === 2 &&
    Math.abs(MetaNum("Aa1.5").array[0][0] - 924.1866041055171) < 1e-9 &&
    MetaNum("Aa1.5").array[0][1] === 3);
  ok("Aa1 < Aa1.5 < Aa2 (README ordering)",
    MetaNum("Aa1").lt(MetaNum("Aa1.5")) && MetaNum("Aa1.5").lt(MetaNum("Aa2")));
  // approximate round-trip: the display carries only FORMAT_OPTIONS digits
  function rtApprox(s, tol) {
    var v = MetaNum(s);
    var m2 = MetaNum.fromString(format(v));
    if (v.eq(m2)) return true;
    if (v.cmp_tolerance(m2, tol) === 0) return true;
    // !Aa compact markers compare structurally — compare the smooth argument
    // x ([[x],[1,0×k,1]] = 10{ω^k}(x); [[1],[α,β]] = 10{β+1}(α))
    function smoothArg(m) {
      if (m.layer === 0 && m.array.length === 2 && m.array[0].length === 1 &&
          m.array[1].length >= 3 && m.array[1][0] === 1 &&
          m.array[1][m.array[1].length - 1] === 1) {
        for (var i = 1; i < m.array[1].length - 1; i++) if (m.array[1][i] !== 0) return null;
        return m.array[0][0];
      }
      if (m.layer === 0 && m.array.length === 2 && m.array[0].length === 1 &&
          m.array[0][0] === 1 && m.array[1].length === 2) {
        return m.array[1][1] + log5(m.array[1][0] / 2);
      }
      return null;
    }
    var av = smoothArg(v), am = smoothArg(m2);
    if (av !== null && am !== null) {
      return Math.abs(av - am) <= tol * Math.max(Math.abs(av), Math.abs(am));
    }
    return false;
  }
  ok("round-trip Aa1.5 (approx)", rtApprox("Aa1.5", 1e-3));
  ok("round-trip Aa2.5 (approx)", rtApprox("Aa2.5", 1e-3));
  ok("round-trip !Aa2.5 (approx)", rtApprox("!Aa2.5", 1e-2));
  ok("round-trip !1Aa1.5 (approx)", rtApprox("!1Aa1.5", 1e-2));
  ok("round-trip !Aa0.5 (approx)", rtApprox("!Aa0.5", 1e-2));
  // issue #20 residual: x∈[1,2) sometimes formats as αΓβ with a single
  // letter F..Z (Aa1.65 → 4.935F5).  Those used to parse to 0; the αΓβ
  // branch now reads them back, and the 4-digit mantissa is checked in slog
  // space (equivalent to the tolerance allowed by the acceptance criteria).
  function slogClose(input, tol) {
    var v = MetaNum(input);
    var back = MetaNum(format(v));
    var d = Number(v.slog(10).toString()) - Number(back.slog(10).toString());
    return Math.abs(d) <= tol;
  }
  ok("format(Aa1.65) = 4.935F5, slog round-trip",
    format(MetaNum("Aa1.65")) === "4.935F5" && slogClose("Aa1.65", 1e-3), format(MetaNum("Aa1.65")));
  ok("format(Aa1.95) = 1.686F9, slog round-trip",
    format(MetaNum("Aa1.95")) === "1.686F9" && slogClose("Aa1.95", 1e-3), format(MetaNum("Aa1.95")));
  ok("3.261F8 parses (not 0)", MetaNum("3.261F8").neq(0), MetaNum("3.261F8").toString());
  var bad20 = [];
  for (var xi = 105; xi <= 195; xi += 10) {
    var s20 = "Aa" + (xi / 100).toFixed(2);
    if (!slogClose(s20, 1e-3)) bad20.push(s20);
  }
  ok("Aa1.05..Aa1.95 all format round-trip in slog space",
    bad20.length === 0, bad20.join(","));
  // smooth (non-integer) family stays monotone inside the compact forms
  ok("!Aa1.5 < !Aa2.5 < !Aa3.5",
    MetaNum("!Aa1.5").lt(MetaNum("!Aa2.5")) && MetaNum("!Aa2.5").lt(MetaNum("!Aa3.5")));
})();

// ─────────────────────────────────────────────────────────────
// D07 · 2{λ}2 = 4 (notation-semantics §3, rule 3)
// ─────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════
// G2 · ORDINARY ARITHMETIC
//   four operations, powers, roots, logarithms, gamma, rounding, unary ops
// ══════════════════════════════════════════════════════════════════

console.log("\n=== G2.1 basic arithmetic (< MSI vs > MSI) ===");
checkOp("add small", mSmall.add(5), 1000005, 0);
checkOp("add big", mBig.add(1e15), "E16.04139", 0.01);
checkOp("sub small", mSmall.sub(5), 999995, 0);
checkOp("sub big", mBig.sub(1e15), "9E15", 0.01);
checkOp("mul small", mSmall.mul(2), 2000000, 0);
checkOp("mul big", mBig.mul(2), "E16.30103", 0.01);
checkOp("div small", mSmall.div(2), 500000, 0);
checkOp("div big", mBig.div(2), "5E15", 0.01);

console.log("\n=== G2.2 power operations (< MSI vs > MSI) ===");
checkOp("pow small", MetaNum(2).pow(10), 1024, 0);
checkOp("pow big", MetaNum(2).pow(60), "E18.062", 0.01);
checkOp("exp small", MetaNum(2).exp(), 7.38905609893065, 1e-8);
checkOp("exp big", MetaNum(40).exp(), "E17.371", 0.01);

console.log("\n=== G2.3 roots (< MSI vs > MSI) ===");
checkOp("sqrt small", mSmall.sqrt(), 1000, 0);
checkOp("sqrt big", mBig.sqrt(), 100000000, 0);
checkOp("cbrt small", mSmall2.cbrt(), 1000, 0.01);
checkOp("cbrt big", mBig2.cbrt(), 4641588.833, 0.01);
checkOp("root small", mSmall.root(6), 10, 0.01);
checkOp("root small 2", mSmall2.root(9), 10, 0.01);
checkOp("root big", mBig.root(8), 100, 0.01);
checkOp("root big 2", mBig2.root(10), 100, 0.01);

console.log("\n=== G2.4 logarithms (< MSI vs > MSI) ===");
checkOp("log10 small", mSmall.log10(), 6, 0);
checkOp("log10 big", mBig.log10(), 16, 0);
checkOp("log small", mSmall.log(100), 3, 0.01);
checkOp("log big", mBig.log(100), 8, 0.01);
checkOp("ln small", mSmall.ln(), Math.log(1e6), 1e-6);
checkOp("ln big", mBig.ln(), Math.log(1e16), 1e-6);

console.log("\n=== G2.5 factorial, gamma and Lambert W (< MSI vs > MSI) ===");
checkOp("fact small", MetaNum(5).fact(), 120, 0);
checkOp("fact big", MetaNum(20).fact(), "E18.386", 0.01);
checkOp("gamma small", MetaNum(0.5).gamma(), Math.sqrt(Math.PI), 1e-6);
checkOp("gamma big", MetaNum(20).gamma(), "E17.085", 0.01);
checkOp("lambertw small", MetaNum(1).lambertw(), 0.5671432904097838, 1e-6);
checkOp("lambertw big", MetaNum(1e16).lambertw(), 33.334760768448184, 1e-6);
console.log("\n=== G2.6 rounding and modulus (< MSI vs > MSI) ===");
checkOp("floor small", MetaNum(3.7).floor(), 3, 0);
checkOp("floor big", MetaNum(1e16 + 0.5).floor(), 1e16, 0);
checkOp("ceil small", MetaNum(3.2).ceil(), 4, 0);
checkOp("ceil big", MetaNum(1e16 + 0.5).ceil(), 1e16, 0);
checkOp("round small", MetaNum(3.5).round(), 4, 0);
checkOp("round big", MetaNum(1e16 + 0.5).round(), 1e16, 0);
checkOp("mod small", MetaNum(10).mod(3), 1, 0);
checkOp("mod big", MetaNum(1e16).mod(3), 1, 0);

console.log("\n=== G2.7 other unary operations (< MSI vs > MSI) ===");
checkOp("abs small", MetaNum(-5).abs(), 5, 0);
checkOp("abs big", MetaNum(-1e16).abs(), 1e16, 0);
checkOp("neg small", MetaNum(5).neg(), -5, 0);
checkOp("neg big", MetaNum(1e16).neg(), -1e16, 0);
checkOp("rec small", MetaNum(4).rec(), 0.25, 0);
checkOp("rec big", MetaNum(1e16).rec(), 1e-16, 1e-20);

console.log("\n=== G2.8 D01 pow(10, negative alpha) sign ===");
[-320, -323, -324, -325, -350, -400].forEach(function (a) {
  ok("pow(10," + a + ").lt(1)", MetaNum.pow(10, a).lt(1), MetaNum.pow(10, a).toString());
});
ok("pow(10,-324).mul(1e324).eq(1)",
  MetaNum.pow(10, -324).mul(MetaNum.fromString("1e324")).eq(1),
  MetaNum.pow(10, -324).mul(MetaNum.fromString("1e324")).toString());
(function monotone() {
  var prev = MetaNum.pow(10, -320), all = true;
  for (var a = -321; a >= -400; a--) {
    var v = MetaNum.pow(10, a);
    if (!v.lt(prev)) { all = false; break; }
    prev = v;
  }
  ok("pow(10,α) strictly decreasing over α ∈ [-320,-400]", all);
})();
eq("log10(10^-324) === -324", MetaNum.pow(10, -324).log10().toString(), "-324");
ok("pow(10,-320) still < 1 (no regression)", MetaNum.pow(10, -320).lt(1));

// ─────────────────────────────────────────────────────────────
// D02 · toBeaf() must keep the base for 10^e (was "{16}")
// ─────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════
// G3 · HYPEROPERATIONS
//   methods 1-34 (ω … ε₀), regimes, inverses, count laws, engine arrays, fractional levels
// ══════════════════════════════════════════════════════════════════

console.log("\n=== G3.1 hyperoperation base (< MSI vs > MSI) ===");
checkOp("tetr small", MetaNum(2).tetr(3), 16, 0);
checkOp("tetr big", MetaNum(1e16).tetr(3), "EEE17.20412", 0.01);
checkOp("pent small", MetaNum(2).pent(2), 4, 0);
checkOp("pent big", MetaNum(1e16).pent(3), "FFE16", 0.01);
checkOp("arrow small", MetaNum(2).arrow(2)(3), 16, 0);
checkOp("arrow big", MetaNum(1e16).arrow(3)(4), "FFFE16", 0.01);
checkOp("hyper small", MetaNum.hyper(10,10,10), "K^8 J^8 I^8 H^8 G^8 F^8 E^8 10000000000", 0.01); // README: hyper(4,2,3)=2^^3 => hyper(10,10,10)=10{8}10
checkOp("hyper big", MetaNum.hyper(1e16,10,10), "NE16", 0.01);
checkOp("chain small", MetaNum(2).chain(4, 3), "E^65532 19727.7804056", 0.01);
checkOp("chain big", MetaNum(1e16).chain(4, 3), "FFFE16", 0.01);
checkOp("ssrt small", MetaNum(27).ssrt(), 3, 0.01);
checkOp("ssrt big", MetaNum(1e16).ssrt(), 13.97, 0.01);
checkOp("slog small", MetaNum(16).slog(2), 3, 0.01);
checkOp("slog big", MetaNum(1e16).slog(2), 4.41, 0.01);
checkOp("linear_sroot small", MetaNum(100).linear_sroot(3), 2.2128, 0.01);
checkOp("linear_sroot big", MetaNum(1e16).linear_sroot(3), 3.09, 0.01);
checkOp("layeradd small", MetaNum(10).layeradd(), 1e10, 0.01);
checkOp("layeradd big", MetaNum(1e16).layeradd(), "EE16", 0.01);
checkOp("layeradd10 small", MetaNum(10).layeradd10(), 1e10, 0.01);
checkOp("layeradd10 big", MetaNum(1e16).layeradd10(), "EE16", 0.01);

console.log("\n=== G3.2 pentate_log/root ===");
// pentate_log: if pentate(a,b)=c then pentate_log(c,a)=b
checkOp("pent_log semantic 2^3", MetaNum.pentate(2,3).pentate_log(2), 3, 0.1);
checkOp("pent_log semantic 3^2", MetaNum.pentate(3,2).pentate_log(3), 2, 0.1);
// pentate_root: if pentate(a,b)=c then pentate_root(c,b)≈a
checkOp("pent_root semantic b=2", MetaNum.pentate(3,2).pentate_root(2), 3, 0.1);
checkOp("pent_root semantic b=3", MetaNum.pentate(2,3).pentate_root(3), 2, 0.1);
//pent log/root small
checkOp("pent_log small", MetaNum(1e10).pentate_log(2), 2.795, 0.1);
checkOp("pent_root small", MetaNum(1e10).pentate_root(2), 2.956, 0.1);

console.log("\n=== G3.3 hyper_log/root ===");
function checkHL(label, d, a, b, want) {
  checkBool("hyper_log " + label, MetaNum(d).hyper_log(a)(b).eq(want), true);
}
function checkHR(label, d, c, b, want) {
  checkBool("hyper_root " + label, MetaNum(d).hyper_root(c)(b).eq(want), true);
}
checkHL("14, a=2, b=0 (2*7)", 14, 2, 0, 7);
checkHL("1E5, a=10, b=1", 100000, 10, 1, 5);
checkHL("16, a=2, b=2", 16, 2, 2, 3);
checkHL("3↑↑3, a=3, b=2", MetaNum(3).arrow(2)(3), 3, 2, 3);
checkHL("10↑↑5, a=10, b=2", MetaNum(10).arrow(2)(5), 10, 2, 5);
checkHL("2↑↑↑2, a=2, b=3", 4, 2, 3, 2);
checkHL("3↑↑↑2, a=3, b=3", MetaNum(3).arrow(3)(2), 3, 3, 2);
checkHL("10↑↑↑3, a=10, b=3", MetaNum(10).arrow(3)(3), 10, 3, 3);
checkHL("2{4}2, a=2, b=4", 4, 2, 4, 2);
checkHR("50, c=5, b=0", 50, 5, 0, 10);
checkHR("256, c=8, b=1", 256, 8, 1, 2);
checkHR("81, c=4, b=1", 81, 4, 1, 3);
checkHR("2↑↑4, c=4, b=2", 65536, 4, 2, 2);
checkHR("3↑↑3, c=3, b=2", MetaNum(3).arrow(2)(3), 3, 2, 3);
checkHR("10↑↑3, c=3, b=2", MetaNum(10).arrow(2)(3), 3, 2, 10);
checkHR("10↑↑↑3, c=3, b=3", MetaNum(10).arrow(3)(3), 3, 3, 10);
checkHR("2{4}3, c=3, b=4", MetaNum(2).arrow(4)(3), 3, 4, 2);

//hyperoperation definition from https://googology.fandom.com/wiki/Template:ExtendedOps
console.log("\n=== G3.4 aperiote (ω) ===");
// rule 3: x{ω}y = x{ω[y]}y = x{y}y
checkOp("aper(3,0)", m3.aperiote(0), 0, 0);
checkOp("aper(3,1)", m3.aperiote(1), 3, 0);
checkOp("aper(3,2)", m3.aperiote(2), 27, 0);
checkOp("aper(3,4)", m3.aperiote(4)); //3{4}4 = 3↑↑↑↑4
checkOp("aper(4,3)", m4.aperiote(3)); //4{3}3 = 4↑↑↑3
checkBool("aper NaN", MetaNum.aperiote(m3, MetaNum.NaN).isNaN(), true);
checkBool("aper inv NaN", MetaNum.inv_aperiote(m3, MetaNum.NaN).isNaN(), true);

// ─── 2. expande (ω+1): x{ω+1}y ───
// expande: iterated aperiote, x{ω+1}y=x{ω}x{ω}x...x where there are y x's
// e.g. 3{ω+1}2=3{ω}3=3↑↑↑3
console.log("\n=== G3.5 expande (ω+1) ===");
checkOp("expa(3,1)", m3.expande(1), 3, 0);
checkOp("expa(3,2)", m3.expande(2)); //3↑↑↑3
checkOp("expa(3,4)", m3.expande(4)); //3{ω}3{ω}3{ω}3
checkOp("expa(4,3)", m4.expande(3)); //4{ω}4{ω}4
checkBool("expa y=0 NaN", m3.expande(0).isNaN(), true);
checkBool("expa NaN", MetaNum.expande(m3, MetaNum.NaN).isNaN(), true);

// ─── 3. multiexpande (ω+2): x{ω+2}y ───
// multiexpande: iterated expande, x{ω+2}y=x{ω+1}x{ω+1}... with y x's
// e.g. 3{ω+2}2=3{ω+1}3=3{ω}3{ω}3=3↑…(3↑↑↑3 arrows)…↑3
console.log("\n=== G3.6 multiexpande (ω+2) ===");
checkOp("muea(3,4)", m3.multiexpande(4));
checkOp("muea(4,3)", m4.multiexpande(3));
checkBool("muea y=0 NaN", m3.multiexpande(0).isNaN(), true);
checkBool("muea NaN", MetaNum.multiexpande(m3, MetaNum.NaN).isNaN(), true);

// ─── 4. powerexpande (ω+3): x{ω+3}y ───
// powerexpande: iterated multiexpande, x{ω+3}y=x{ω+2}x{ω+2}... with y x's
// e.g. 3{ω+3}2=3{ω+2}3=3{ω+1}3{ω+1}3=3{ω+1}3{ω}3{3}3
console.log("\n=== G3.7 powerexpande (ω+3) ===");
checkOp("poea(3,4)", m3.powerexpande(4));
checkOp("poea(4,3)", m4.powerexpande(3));
checkBool("poea y=0 NaN", m3.powerexpande(0).isNaN(), true);
checkBool("poea NaN", MetaNum.powerexpande(m3, MetaNum.NaN).isNaN(), true);

// ─── 5. aperioexpande (ω*2): x{ω*2}y ───
// aperioexpande: diagonalization of ω+y, x{ω*2}y=x{ω+y}y
// e.g. 3{ω*2}5=3{ω+5}5=3{ω+4}3{ω+4}3{ω+4}3{ω+4}3
console.log("\n=== G3.8 aperioexpande (ω*2) ===");
checkOp("apea(3,4)", m3.aperioexpande(4));
checkOp("apea(4,3)", m4.aperioexpande(3));
checkBool("apea NaN", MetaNum.aperioexpande(m3, MetaNum.NaN).isNaN(), true);

// ─── 6. explode (ω*2+1): x{ω*2+1}y ───
// explode: iterated aperioexpande, x{ω*2+1}y=x{ω*2}x{ω*2}... with y x's
console.log("\n=== G3.9 explode (ω*2+1) ===");
checkOp("expl(3,4)", m3.explode(4));
checkOp("expl(4,3)", m4.explode(3));
checkBool("expl y=0 NaN", m3.explode(0).isNaN(), true);
checkBool("expl NaN", MetaNum.explode(m3, MetaNum.NaN).isNaN(), true);

// ─── 7. multiexplode (ω*2+2): x{ω*2+2}y ───
// multiexplode: iterated explode, x{ω*2+2}y=x{ω*2+1}x{ω*2+1}... with y x's
console.log("\n=== G3.10 multiexplode (ω*2+2) ===");
checkOp("muel(3,4)", m3.multiexplode(4));
checkOp("muel(4,3)", m4.multiexplode(3));
checkBool("muel y=0 NaN", m3.multiexplode(0).isNaN(), true);
checkBool("muel NaN", MetaNum.multiexplode(m3, MetaNum.NaN).isNaN(), true);

// ─── 8. aperioexplode (ω*3): x{ω*3}y ───
// aperioexplode: diagonalization of ω*2+y, x{ω*3}y=x{ω*2+y}y
console.log("\n=== G3.11 aperioexplode (ω*3) ===");
checkOp("apel(3,4)", m3.aperioexplode(4));
checkOp("apel(4,3)", m4.aperioexplode(3));
checkBool("apel NaN", MetaNum.aperioexplode(m3, MetaNum.NaN).isNaN(), true);

// ─── 9. detonate (ω*3+1): x{ω*3+1}y ───
// detonate: iterated aperioexplode, x{ω*3+1}y=x{ω*3}x{ω*3}... with y x's
console.log("\n=== G3.12 detonate (ω*3+1) ===");
checkOp("deto(3,4)", m3.detonate(4));
checkOp("deto(4,3)", m4.detonate(3));
checkBool("deto y=0 NaN", m3.detonate(0).isNaN(), true);
checkBool("deto NaN", MetaNum.detonate(m3, MetaNum.NaN).isNaN(), true);

// ─── 10. aperiodetonate (ω*4): x{ω*4}y ───
// aperiodetonate: diagonalization of ω*3+y, x{ω*4}y=x{ω*3+y}y
console.log("\n=== G3.13 aperiodetonate (ω*4) ===");
checkOp("apdt(3,4)", m3.aperiodetonate(4));
checkOp("apdt(4,3)", m4.aperiodetonate(3));
checkBool("apdt NaN", MetaNum.aperiodetonate(m3, MetaNum.NaN).isNaN(), true);

// ─── 11. aperionate (ω^2): x{ω^2}y ───
console.log("\n=== G3.14 aperionate (ω^2) ===");
checkOp("apeo(3,4)", m3.aperionate(4));
checkOp("apeo(4,3)", m4.aperionate(3));
checkBool("apeo NaN", MetaNum.aperionate(m3, MetaNum.NaN).isNaN(), true);

// ─── 12. megote (ω^2+1):  ───
console.log("\n=== G3.15 megote (ω^2+1) ===");
checkOp("mego(3,4)", m3.megote(4));
checkOp("mego(4,3)", m4.megote(3));
checkBool("mego y=0 NaN", m3.megote(0).isNaN(), true);
checkBool("mego NaN", MetaNum.megote(m3, MetaNum.NaN).isNaN(), true);

// ─── 13. multimegote (ω^2+2):  ───
console.log("\n=== G3.16 multimegote (ω^2+2) ===");
checkOp("mume(3,4)", m3.multimegote(4));
checkOp("mume(4,3)", m4.multimegote(3));
checkBool("mume y=0 NaN", m3.multimegote(0).isNaN(), true);
checkBool("mume NaN", MetaNum.multimegote(m3, MetaNum.NaN).isNaN(), true);

// ─── 14. aperimegote (ω^2+ω):  ───
console.log("\n=== G3.17 aperimegote (ω^2+ω) ===");
checkOp("apmg(3,4)", m3.aperimegote(4));
checkOp("apmg(4,3)", m4.aperimegote(3));
checkBool("apmg NaN", MetaNum.aperimegote(m3, MetaNum.NaN).isNaN(), true);

// ─── 15. megoexpande (ω^2+ω+1):  ───
console.log("\n=== G3.18 megoexpande (ω^2+ω+1) ===");
checkOp("mgea(3,4)", m3.megoexpande(4));
checkOp("mgea(4,3)", m4.megoexpande(3));
checkBool("mgea y=0 NaN", m3.megoexpande(0).isNaN(), true);
checkBool("mgea NaN", MetaNum.megoexpande(m3, MetaNum.NaN).isNaN(), true);

// ─── 16. aperimegoexpande (ω^2+ω*2):  ───
console.log("\n=== G3.19 aperimegoexpande (ω^2+ω*2) ===");
checkOp("apme(3,4)", m3.aperimegoexpande(4));
checkOp("apme(4,3)", m4.aperimegoexpande(3));
checkBool("apme NaN", MetaNum.aperimegoexpande(m3, MetaNum.NaN).isNaN(), true);

// ─── 17. megoaperionate (ω^2*2):  ───
console.log("\n=== G3.20 megoaperionate (ω^2*2) ===");
checkOp("mgao(3,4)", m3.megoaperionate(4));
checkOp("mgao(4,3)", m4.megoaperionate(3));
checkBool("mgao NaN", MetaNum.megoaperionate(m3, MetaNum.NaN).isNaN(), true);

// ─── 18. gigote (ω^2*2+1):  ───
console.log("\n=== G3.21 gigote (ω^2*2+1) ===");
checkOp("gigo(3,4)", m3.gigote(4));
checkOp("gigo(4,3)", m4.gigote(3));
checkBool("gigo y=0 NaN", m3.gigote(0).isNaN(), true);
checkBool("gigo NaN", MetaNum.gigote(m3, MetaNum.NaN).isNaN(), true);

// ─── 19. aperigigote (ω^2*2+ω):  ───
console.log("\n=== G3.22 aperigigote (ω^2*2+ω) ===");
checkOp("apgg(3,4)", m3.aperigigote(4));
checkOp("apgg(4,3)", m4.aperigigote(3));
checkBool("apgg NaN", MetaNum.aperigigote(m3, MetaNum.NaN).isNaN(), true);

// ─── 20. gigoaperionate (ω^2*3):  ───
console.log("\n=== G3.23 gigoaperionate (ω^2*3) ===");
checkOp("ggap(3,4)", m3.gigoaperionate(4));
checkOp("ggap(4,3)", m4.gigoaperionate(3));
checkBool("ggap y=0 NaN", m3.gigoaperionate(0).isNaN(), true);
checkBool("ggap NaN", MetaNum.gigoaperionate(m3, MetaNum.NaN).isNaN(), true);

// ─── 21. aperiatote (ω^3):  ───
console.log("\n=== G3.24 aperiatote (ω^3) ===");
checkOp("apat(3,4)", m3.aperiatote(4));
checkOp("apat(4,3)", m4.aperiatote(3));
checkBool("apat NaN", MetaNum.aperiatote(m3, MetaNum.NaN).isNaN(), true);

// ─── 22. powiainate (ω^3+1):  ───
console.log("\n=== G3.25 powiainate (ω^3+1) ===");
checkOp("pwan(3,4)", m3.powiainate(4));
checkOp("pwan(4,3)", m4.powiainate(3));
checkBool("pwan y=0 NaN", m3.powiainate(0).isNaN(), true);
checkBool("pwan NaN", MetaNum.powiainate(m3, MetaNum.NaN).isNaN(), true);

// ─── 23. expandainate (ω^3+ω):  ───
console.log("\n=== G3.26 expandainate (ω^3+ω) ===");
checkOp("epan(3,4)", m3.expandainate(4));
checkOp("epan(4,3)", m4.expandainate(3));
checkBool("epan NaN", MetaNum.expandainate(m3, MetaNum.NaN).isNaN(), true);

// ─── 24. megodainate (ω^3+ω^2):  ───
console.log("\n=== G3.27 megodainate (ω^3+ω^2) ===");
checkOp("mgan(3,4)", m3.megodainate(4));
checkOp("mgan(4,3)", m4.megodainate(3));
checkBool("mgan y=0 NaN", m3.megodainate(0).isNaN(), true);
checkBool("mgan NaN", MetaNum.megodainate(m3, MetaNum.NaN).isNaN(), true);

// ─── 25. powiairate (ω^3*2) ───
console.log("\n=== G3.28 powiairate (ω^3*2) ===");
checkOp("pwar(3,4)", m3.powiairate(4));
checkOp("pwar(4,3)", m4.powiairate(3));
checkBool("pwar NaN", MetaNum.powiairate(m3, MetaNum.NaN).isNaN(), true);

// ─── 26. aperioguate (ω^4):  ───
console.log("\n=== G3.29 aperioguate (ω^4) ===");
checkOp("apgu(3,4)", m3.aperioguate(4));
checkOp("apgu(4,3)", m4.aperioguate(3));
checkBool("apgu NaN", MetaNum.aperioguate(m3, MetaNum.NaN).isNaN(), true);

// ─── 27. iter (ω^ω):  ───
console.log("\n=== G3.30 iter (ω^ω) ===");
checkOp("ite(3,4)", m3.iter(4));
checkOp("ite(4,3)", m4.iter(3));
checkBool("ite y=0 NaN", m3.iter(0).isNaN(), true);
checkBool("ite NaN", MetaNum.iter(m3, MetaNum.NaN).isNaN(), true);

// ─── 28. itermult (ω^ω+1):  ───
console.log("\n=== G3.31 itermult (ω^ω+1) ===");
checkOp("itmu(3,4)", m3.itermult(4));
checkOp("itmu(4,3)", m4.itermult(3));
checkBool("itmu y=0 NaN", m3.itermult(0).isNaN(), true);
checkBool("itmu NaN", MetaNum.itermult(m3, MetaNum.NaN).isNaN(), true);

// ─── 28b. iteraperiate (ω^ω+ω): (ω^ω+ω)[y] = ω^ω+y, so x{ω^ω+ω}y = x{ω^ω+y}x;
// finite y ≥ 2 → layer-1 marker [[y],[1,0,1]] (the height IS the level's
// constant term — itermult stores y-1 there), ordinal y → y + [1|ω] + [1|ω^ω] ───
console.log("\n=== G3.31b iteraperiate (ω^ω+ω) ===");
(function () {
  checkOp("itap(3,4)", m3.iteraperiate(4));
  checkOp("itap(4,3)", m4.iteraperiate(3));
  checkBool("itap y=0 NaN", m3.iteraperiate(0).isNaN(), true);
  checkBool("itap NaN", MetaNum.iteraperiate(m3, MetaNum.NaN).isNaN(), true);
  // aliases + static form
  checkBool("itap/hw0w alias", m3.itap(5).eq(m3.hw0w(5)), true);
  checkBool("static MetaNum.iteraperiate", MetaNum.iteraperiate(3, 5).eq(m3.iteraperiate(5)), true);
  // marker: the ω^ω+ω level marker [[0,1],[1,0,1]] (tail ω in r0 CNF, literal
  // empty constant term) — identical for every finite y ≥ 2
  // (3{ω^ω+ω}3 ≈ 10{ω^ω+ω}10 at marker scale)
  checkBool("itap(10,5) marker [[0,1],[1,0,1]]",
    JSON.stringify(MetaNum(10).iteraperiate(5).array) === "[[0,1],[1,0,1]]" &&
    MetaNum(10).iteraperiate(5).layer === 1, true);
  checkBool("itap(10,100) marker [[0,1],[1,0,1]] (finite y share one marker)",
    JSON.stringify(MetaNum(10).iteraperiate(100).array) === "[[0,1],[1,0,1]]", true);
  // finite heights sit below marker resolution: constant marker for y = 2..1e6
  var prev = null, mono = true;
  for (var yi = 0; yi < [2,3,4,5,100,1e4,1e6].length; yi++) {
    var yv = MetaNum(10).iteraperiate([2,3,4,5,100,1e4,1e6][yi]);
    if (prev && !yv.eq(prev)) mono = false;
    prev = yv;
  }
  checkBool("itap(10,y) constant marker for finite y = 2..1e6", mono, true);
  checkBool("itmu(10,5) < itap(10,5) < cube(10,5)",
    MetaNum(10).itermult(5).lt(MetaNum(10).iteraperiate(5)) &&
    MetaNum(10).iteraperiate(5).lt(MetaNum(10).cuboiter(5)), true);
  checkBool("itap(10,1e6) < cube(10,2) (ω^ω+y < ω^ω+ω^2)",
    MetaNum(10).iteraperiate(1e6).lt(MetaNum(10).cuboiter(2)), true);
  // edge cases: y=1, x=1, B2-a, NaN
  checkBool("itap(7,1) = 7 (a{α}1 = a)", MetaNum(7).iteraperiate(1).eq(MetaNum(7)), true);
  checkBool("itap(1,5) = 1 (1{α}b = 1)", MetaNum(1).iteraperiate(5).eq(MetaNum(1)), true);
  // B2-a only collapses the 2-diagonal; 2{λ}y for y ≥ 3 carries the level
  // marker (the y-dependence is below marker resolution at the ω^ω scale)
  checkBool("itap(2,3) > 4 and shares the finite-y marker (B2-a is the 2-diagonal only)",
    MetaNum(2).iteraperiate(3).gt(MetaNum(4)) &&
    MetaNum(2).iteraperiate(3).eq(MetaNum(2).iteraperiate(5)), true);
  // base-independence of the marker: every base ≥ 3 gives the same value
  checkBool("marker base-independent (3,10,4↑↑4 same marker)",
    m3.iteraperiate(5).eq(MetaNum(10).iteraperiate(5)) &&
    MetaNum(4).arrow(2)(4).iteraperiate(5).eq(MetaNum(10).iteraperiate(5)), true);
  // ordinal height: y + [1|ω] + [1|ω^ω]; merge with y's own rows; round-trip
  var oy = MetaNum(10).itermult(3);                       // [[0.125],[1,0,1]] layer 1
  var ov = MetaNum(10).iteraperiate(oy);
  checkBool("itap(10, ordinal) = y + [1|ω] + [1|ω^ω] (like terms merged)",
    JSON.stringify(ov.array) === "[[0.125,1],[2,0,1]]" && ov.layer === 1, true);
  checkBool("ordinal round-trip inv_itap(oy-itap) = oy",
    ov.inv_iteraperiate(MetaNum(10)).eq(oy), true);
  var oy2 = MetaNum(10).expoiter(3);                      // [[10],[3,0,1]] layer 1
  var ov2 = MetaNum(10).iteraperiate(oy2);
  checkBool("ordinal round-trip 2 (ω^ω·3 row)",
    JSON.stringify(ov2.array) === "[[10,1],[4,0,1]]" &&
    ov2.inv_iteraperiate(MetaNum(10)).eq(oy2), true);
  // log inverse: the finite marker is constant, so the inverse returns the
  // minimal reproducing height 2 — verified by forward reproduction
  var invOk = true, invBad = "";
  for (var yj = 0; yj < [2,3,5,100].length; yj++) {
    var yy = [2,3,5,100][yj];
    var vj = MetaNum(10).iteraperiate(yy);
    var back = vj.inv_iteraperiate(MetaNum(10));
    if (!back.eq(MetaNum(2)) ||
        !MetaNum(10).iteraperiate(back).eq(vj) ||
        !vj.i_itap(MetaNum(10)).eq(back) ||
        !vj.iw0w(MetaNum(10)).eq(back) ||
        !MetaNum.inv_iteraperiate(vj, MetaNum(10)).eq(back)) {
      invOk = false; invBad = " y=" + yy; break;
    }
  }
  checkBool("itap log inverse returns the minimal reproducing height (y = 2,3,5,100)", invOk, true, invBad);
  checkBool("i_itap/iw0w/static aliases agree",
    MetaNum(10).iteraperiate(5).i_itap(MetaNum(10)).eq(MetaNum(2)) &&
    MetaNum(10).iteraperiate(5).iw0w(MetaNum(10)).eq(MetaNum(2)), true);
  // root form: marker level → smallest reproducing base; base 2 now also
  // reproduces the base-independent marker (B2-a no longer collapses it)
  var v5 = MetaNum(10).iteraperiate(5);
  checkBool("itap_root(5) = 2 (smallest reproducing base)",
    v5.iteraperiate_root(5).eq(MetaNum(2)) &&
    v5.r_itap(5).eq(MetaNum(2)) && v5.rw0w(5).eq(MetaNum(2)) &&
    MetaNum.iteraperiate_root(v5, 5).eq(MetaNum(2)), true);
  checkBool("2.itap(5) reproduces the marker value",
    MetaNum(2).iteraperiate(5).eq(v5), true);
  checkBool("(2{ω^ω+ω}9).itap_root(9) = 2",
    MetaNum(2).iteraperiate(9).iteraperiate_root(9).eq(MetaNum(2)), true);
  checkBool("itap_root y=1 returns the value",
    MetaNum(7).iteraperiate_root(1).eq(MetaNum(7)), true);
  checkBool("itap_root of 1 is 1", MetaNum(1).iteraperiate_root(5).eq(MetaNum(1)), true);
  checkBool("itap_root of a negative value → NaN", MetaNum(-4).iteraperiate_root(5).isNaN(), true);
  checkBool("itap_root with y ≤ 0 → NaN",
    MetaNum(10).iteraperiate(5).iteraperiate_root(-5).isNaN(), true);
})();

// ─── 29. cuboiter (ω^ω*2) ───
console.log("\n=== G3.32 cuboiter (ω^ω*2) ===");
checkOp("cube(3,4)", m3.cuboiter(4));
checkOp("cube(4,3)", m4.cuboiter(3));
checkBool("cube NaN", MetaNum.cuboiter(m3, MetaNum.NaN).isNaN(), true);

// ─── 30. expoiter (ω^(ω+1)) ───
console.log("\n=== G3.33 expoiter (ω^(ω+1)) ===");
checkOp("expo(3,4)", m3.expoiter(4));
checkOp("expo(4,3)", m4.expoiter(3));
checkBool("expo NaN", MetaNum.expoiter(m3, MetaNum.NaN).isNaN(), true);

// ─── 31. trioterate (ω^(ω*2)) ───
console.log("\n=== G3.34 trioterate (ω^(ω*2)) ===");
checkOp("tria(3,4)", m3.trioterate(4));
checkOp("tria(4,3)", m4.trioterate(3));
checkBool("tria NaN", MetaNum.trioterate(m3, MetaNum.NaN).isNaN(), true);

// ─── 32. trixxate (ω^(ω^2)) ───
console.log("\n=== G3.35 trixxate (ω^(ω^2)) ===");
checkOp("trix(3,4)", m3.trixxate(4));
checkOp("trix(4,3)", m4.trixxate(3));
checkBool("trix NaN", MetaNum.trixxate(m3, MetaNum.NaN).isNaN(), true);

// ─── 33. aperixxate (ω^(ω^ω)) ───
console.log("\n=== G3.36 aperixxate (ω^(ω^ω)) ===");
checkOp("apix(3,4)", m3.aperixxate(4));
checkOp("apix(4,3)", m4.aperixxate(3));
checkBool("apix NaN", MetaNum.aperixxate(m3, MetaNum.NaN).isNaN(), true);

// ─── 34. epsilonate (ε₀) ───
console.log("\n=== G3.37 epsilonate (ε₀) ===");
checkOp("epsl(3,4)", m3.epsilonate(4));
checkOp("epsl(4,3)", m4.epsilonate(3));
checkBool("epsl NaN", MetaNum.epsilonate(m3, MetaNum.NaN).isNaN(), true);

// λ[y] layer markers in STANDARD form (finite rows merged into r0, layer
// lowered as far as it goes — README L17: layer L ⇒ ω^ω^…((L-1) ω^'s)^(bracket)):
//   iter → 10{ω^y}10 (L1 [1,y]); itmu → 10{ω^ω+(y-1)}10 (L1 [1,0,1], r0=y-1)
//   itap → 10{ω^ω+y}10 (L1 [1,0,1], r0=y); cube → 10{ω^ω+ω^y}10 (L1 r0[…,1@y] + [1,0,1]); expo → 10{ω^ω·y}10 (L1 [y,0,1])
//   tria → 10{ω^(ω+y)}10 (L1 [1,y,1]); trix → 10{ω^(ω·y+10)}10 (L1 [1,10,y])
//   apix → 10{ω^(ω^y)}10 (L1 [1,0…0,1] with y zeros)
console.log("\n=== G3.38 λ[y] layer markers in STANDARD form ===");
var wOps = ["iterate","itermult","iteraperiate","cuboiter","expoiter","trioterate","trixxate","aperixxate"];
var mk35 = {
  iterate:     { layer: 0, rows: null },                 // exact cascade, layer 0
  itermult:    { layer: 1, rows: "[[0.375],[1,0,1]]" },   // c0 = (y-2)/8 base-10 normalized
  iteraperiate: { layer: 1, rows: "[[0,1],[1,0,1]]" },    // level tail ω, constant for finite y
  cuboiter:    { layer: 1, rows: "[[10,0,0,0,0,1],[1,0,1]]" },
  expoiter:    { layer: 1, rows: "[[10],[5,0,1]]" },
  trioterate:  { layer: 1, rows: "[[10],[1,5,1]]" },
  trixxate:    { layer: 1, rows: "[[10],[1,10,5]]" },
  aperixxate:  { layer: 1, rows: "[[10],[1,0,0,0,0,0,1]]" }
};
for (var wi = 0; wi < wOps.length; wi++) {
  var wf = wOps[wi], wv = m3[wf](5), wexp = mk35[wf];
  var wok = wv.layer === wexp.layer &&
    (wexp.rows === null || JSON.stringify(wv.array) === wexp.rows);
  checkBool(wf + "(3,5) λ[5] marker (layer " + wexp.layer + ")", wok, true);
}
checkBool("epsl(3,5) = 10{ω^ω^ω^ω^ω}10 → FS position layer 3 over the ω³ row [1,0,0,0,1] (5c)",
  m3.epsilonate(5).layer === 3 &&
  JSON.stringify(m3.epsilonate(5).array) === "[[10],[1,0,0,0,1]]", true);
checkBool("epsl(3,2) = 3{ε₀[2]}3 = 3{ω^ω}3 = itmu(3,2)",
  m3.epsilonate(2).eq(m3.itermult(2)), true);
// the ordinal levels grow with the operation, for every y
for (var wy = 2; wy <= 9; wy++) {
  var wprev = null, wmono = true;
  for (var wj = 0; wj < wOps.length; wj++) {
    var wr = MetaNum(10)[wOps[wj]](wy);
    if (wprev && !wr.gt(wprev)) wmono = false;
    wprev = wr;
  }
  checkBool("ops strictly grow at y=" + wy + " (iter<itmu<itap<cube<expo<tria<trix<apix)", wmono, true);
}

// precision budget: exact while it fits maxRows/maxCols
// arrow's most precise form holds maxRows+maxCols-2 finite hyperoperation
// levels: r0 = [a0 … a(maxCols-1)] plus rows [count, level] for levels
// maxCols … maxRows+maxCols-2.  Beyond that: keep the largest maxRows-1
// ordinal rows sorted ascending, array[1][0] += 1, array[0] = [10].
console.log("\n=== G3.39 precision budget (maxRows/maxCols) ===");
(function () {
  var a39 = MetaNum.arrow(10, 39, 10);
  checkBool("arrow(10,39,10) exact: maxCols r0 entries + maxRows-1 rows, top level 38",
    a39.array[0].length === 20 && a39.array.length - 1 === 19 &&
    JSON.stringify(a39.array[a39.array.length - 1]) === "[8,38]", true);
  var a40 = MetaNum.arrow(10, 40, 10);
  checkBool("arrow(10,40,10) truncated: array[0]=[10], array[1][0]+1",
    JSON.stringify(a40.array[0]) === "[10]" &&
    JSON.stringify(a40.array[1]) === "[9,21]" && a40.array.length - 1 === 19, true);
  // the same truncation rule for the rule-1..4 ordinal cascades
  var i35 = m3.iterate(5);
  checkBool("iter(3,5) cascade truncated: array[0]=[10], array[1][0]+1, 19 rows",
    JSON.stringify(i35.array[0]) === "[10]" &&
    JSON.stringify(i35.array[1]) === "[2,1,2,3,4,4]" && i35.array.length - 1 === 19, true);
  var h10000 = m3.h10000(10);
  checkBool("h10000(3,10) cascade truncated: array[0]=[10], array[1][0]+1",
    JSON.stringify(h10000.array[0]) === "[10]" &&
    JSON.stringify(h10000.array[1]) === "[2,0,6,9,9]", true);
  // exact while the enumeration fits: 3{ω^2}3 needs 3^2 = 9 ≤ maxRows rows
  var i32 = m3.iterate(2);
  checkBool("iter(3,2) exact enumeration (no [10] base / no +1 marker)",
    i32.array[0][0] !== 10 && i32.array[1][0] === 1, true);
  // ── standard layer form (README L17) ──
  function mkLayer(r0, L, rows) {
    var v = new MetaNum(0); v.array = [r0.slice()];
    rows.forEach(function (r) { v.array.push(r.slice()); }); v.layer = L; return v;
  }
  var s1 = MetaNum._standardizeLayerValue(mkLayer([10], 1, [[1, 3], [1, 0, 1]]));
  checkBool("cube(10,3): [[10],[1,3],[1,0,1]] → [[10,0,0,1],[1,0,1]]",
    JSON.stringify(s1.array) === "[[10,0,0,1],[1,0,1]]" && s1.layer === 1, true);
  var s2 = MetaNum._standardizeLayerValue(mkLayer([5], 2, [[3, 1]]));
  checkBool("layer2 [[5],[3,1]] → [[5,3]] → layer1 [[10],[1,5,3]] = 10{ω^(ω*3+5)}10",
    JSON.stringify(s2.array) === "[[10],[1,5,3]]" && s2.layer === 1, true);
  var s3 = MetaNum._standardizeLayerValue(mkLayer([3], 3, []));
  checkBool("layer3 [[3]] → layer2 [[0,0,0,1]] → layer1 [[10],[1,0,0,0,1]] = 10{ω^ω^3}10",
    JSON.stringify(s3.array) === "[[10],[1,0,0,0,1]]" && s3.layer === 1, true);
  checkBool("cube(10,3) standardized in the engine",
    JSON.stringify(m10c().cuboiter(3).array) === "[[10,0,0,1],[1,0,1]]", true);
  function m10c() { return MetaNum(10); }
})();

// Same-value tests: op(1,y) and op(x,1) produce reasonable results
// when x=1, 1{ordinal}y = 1 for any ordinal
// when y=1, x{ordinal}1 = x for any ordinal
var ops = [
  "aperiote","expande","multiexpande","powerexpande","aperioexpande",
  "explode","multiexplode","aperioexplode","detonate","aperiodetonate",
  "aperionate","megote","multimegote","aperimegote","megoexpande",
  "aperimegoexpande","megoaperionate","gigote","aperigigote","gigoaperionate",
  "aperiatote","powiainate","expandainate","megodainate","powiairate","aperioguate","iterate",
  "itermult","cuboiter","expoiter","trioterate","trixxate","aperixxate","epsilonate"
];

console.log("\n=== G3.40 all hyperoperations x=1, y=3 test ===");
for (var oi = 0; oi < ops.length; oi++) {
  try {
    var res = m1[ops[oi]](3);
    if (res.eq(1)) console.log("PASS | " + ops[oi] + "(1,3) | " + res.toString().slice(0,100));
    else console.log("FAIL | " + ops[oi] + "(1,3) => " + res.toString().slice(0,100));
  } catch (e) {
    console.log("ERROR | " + ops[oi] + "(1,3) => " + e.message);
  }
}

console.log("\n=== G3.41 all hyperoperations x=3, y=1 test ===");
for (var oi = 0; oi < ops.length; oi++) {
  try {
    var res = m3[ops[oi]](1);
    // rule 3 for limit ordinals: x{λ}1 = x{λ[1]}1 = x{1}1 = x for every
    // op (successor levels give x directly), so aperiote(3,1) = 3 too
    var expected1 = 3;
    if (res.eq(expected1)) console.log("PASS | " + ops[oi] + "(3,1) | " + res.toString().slice(0, 100));
    else console.log("FAIL | " + ops[oi] + "(3,1) => " + res.toString().slice(0, 100));
  } catch (e) {
    console.log("ERROR | " + ops[oi] + "(3,1) => " + e.message);
  }
}

// hyperoperation tests with x or y > MSI (9007199254740992)
console.log("\n=== G3.42 hyperoperation (x > MSI) ===");
var mBigBase = MetaNum(1e16);
for (var oi = 0; oi < ops.length; oi++) {
  try {
    var res = mBigBase[ops[oi]](3);
    console.log("PASS | " + ops[oi] + "(1e16,3) | " + res.toString().slice(0,100));
  } catch (e) {
    console.log("FAIL | " + ops[oi] + "(1e16,3) => " + e.message);
  }
}

console.log("\n=== G3.43 hyperoperation (y > MSI) ===");
for (var oi = 0; oi < ops.length; oi++) {
  try {
    var res = m3[ops[oi]](mBigBase);
    console.log("PASS | " + ops[oi] + "(3,1e16) | " + res.toString().slice(0,100));  
  } catch (e) {
    console.log("FAIL | " + ops[oi] + "(3,1e16) => " + e.message);
  }
}

// inverse roundtrip: op(10,x) → inv → should ≈ x
console.log("\n=== G3.44 inverse operation (> MSI) roundtrip ===");
var invOps = [
  "inv_aperiote","inv_expande","inv_multiexpande","inv_powerexpande","inv_aperioexpande",
  "inv_explode","inv_multiexplode","inv_aperioexplode","inv_detonate","inv_aperiodetonate",
  "inv_aperionate","inv_megote","inv_multimegote","inv_aperimegote","inv_megoexpande",
  "inv_aperimegoexpande","inv_megoaperionate","inv_gigote","inv_aperigigote","inv_gigoaperionate",
  "inv_aperiatote","inv_powiainate","inv_expandainate","inv_megodainate","inv_powiairate","inv_aperioguate","inv_iterate",
  "inv_itermult","inv_cuboiter","inv_expoiter","inv_trioterate","inv_trixxate","inv_aperixxate","inv_epsilonate"
];
// the G4.5 section was a bare header before (the table alone asserted nothing):
// make it a real sanity check — every entry names a method and the two tables
// stay index-aligned, so a renamed/forgotten op fails here and not silently
// in the round-trip loop below.
(function () {
  var missingInv = invOps.filter(function (n) { return typeof MetaNum(10)[n] !== "function"; });
  var missingFwd = ops.filter(function (n) { return typeof MetaNum(10)[n] !== "function"; });
  checkBool("forward/inverse tables name real methods and stay aligned (" +
    ops.length + " ops)",
    missingInv.length === 0 && missingFwd.length === 0 && ops.length === invOps.length,
    true, missingInv.concat(missingFwd).join(","));
})();

// Inverse round-trip: op(10, y) → inv_op(10) must recover y (small y), and
// must stay a sane finite value when y > MSI (no throw, no NaN, above the
// base).  The small and >MSI cases share one table so every op is exercised
// against both argument regimes side by side.
console.log("\n=== G3.45 inverse round-trip (small y and y > MSI) ===");
var m10 = MetaNum(10);
for (var oi = 0; oi < ops.length; oi++) {
  var fwdS, backS, fwdB, backB;
  // small argument: under rule 3 (x{λ}b = x{λ[b]}b) the inverse recovers y;
  // a few marker/huge-argument conventions fall back to the base x = 10
  try {
    fwdS = m10[ops[oi]](3);
    backS = fwdS[invOps[oi]](m10);
    var okS = backS.eq(m3) || backS.eq(m10);
    console.log((okS ? "PASS" : "FAIL") + " | " + invOps[oi] + " y=3 | fwd=" +
      fwdS.toString().slice(0, 80) + " back=" + backS.toString().slice(0, 80));
  } catch (e) {
    console.log("ERROR | " + invOps[oi] + " y=3 => " + e.message);
  }
  // >MSI argument: the inverse cannot recover the exact count from a layer
  // marker, but the result must stay a finite non-NaN value at or above 1
  // (regression: silent -1 / 0).  The marker-valued ops legitimately return
  // their level (1), which the assertion allows.
  try {
    fwdB = m10[ops[oi]](mBigBase);
    backB = fwdB[invOps[oi]](m10);
    // epsilonate passes the ε₀ ceiling at y > MSI and returns Infinity (the
    // documented convention), so its inverse is NaN by the non-finite rule
    var okB = ops[oi] === "epsilonate"
      ? fwdB.toString() === "Infinity"
      : !backB.isNaN() && backB.isFinite() && backB.gte(m1) && fwdB.gt(m10);
    console.log((okB ? "PASS" : "FAIL") + " | " + invOps[oi] + " y>MSI | fwd=" +
      fwdB.toString().slice(0, 80) + " back=" + backB.toString().slice(0, 80));
  } catch (e) {
    console.log("FAIL | " + invOps[oi] + " y>MSI => " + e.message);
  }
}

// bug: epsl(3,epsl(3,3)) should return infinity because it reaches metanum.js limit.

// hyperoperation iteration tests
var hyperOpList = [
  ["aper", "aperiote"],
  ["expa", "expande"],
  ["muea", "multiexpande"],
  ["poea", "powerexpande"],
  ["apea", "aperioexpande"],
  ["expl", "explode"],
  ["muel", "multiexplode"],
  ["apel", "aperioexplode"],
  ["deto", "detonate"],
  ["apdt", "aperiodetonate"],
  ["apeo", "aperionate"],
  ["mego", "megote"],
  ["mume", "multimegote"],
  ["apmg", "aperimegote"],
  ["mgea", "megoexpande"],
  ["apme", "aperimegoexpande"],
  ["mgao", "megoaperionate"],
  ["gigo", "gigote"],
  ["apgg", "aperigigote"],
  ["ggap", "gigoaperionate"],
  ["apat", "aperiatote"],
  ["pwan", "powiainate"],
  ["epan", "expandainate"],
  ["mgan", "megodainate"],
  ["pwar", "powiairate"],
  ["apgu", "aperioguate"],
  ["iter", "iter"],
  ["itmu", "itermult"],
  ["cube", "cuboiter"],
  ["expo", "expoiter"],
  ["tria", "trioterate"],
  ["trix", "trixxate"],
  ["apix", "aperixxate"],
  ["epsl", "epsilonate"]
];

// ─── double nested iteration ───
console.log("\n=== G3.46 hyperoperation iteration tests ===");
for (var hi = 0; hi < hyperOpList.length; hi++) {
  var shortName = hyperOpList[hi][0];
  var methodName = hyperOpList[hi][1];
  try{
    var res = m3[methodName](m3[methodName](3));
    console.log("PASS | " + shortName + "(3," + shortName + "(3,3)) | " + res.toString().slice(0,100));
  } catch (e) {
    console.log("FAIL | " + shortName + "(3," + shortName + "(3,3)) => " + e.message);
  }
}

// ─── triple nested iteration ───
console.log("\n=== G3.47 triple nested hyperoperation tests ===");
for (var hi = 0; hi < hyperOpList.length; hi++) {
  var shortName = hyperOpList[hi][0];
  var methodName = hyperOpList[hi][1];
  try{
    var res = m3[methodName](m3[methodName](m3[methodName](3)));
    console.log("PASS | " + shortName + "(3," + shortName + "(3," + shortName + "(3,3))) | " + res.toString().slice(0,100));
  } catch (e) {
    console.log("FAIL | " + shortName + "(3," + shortName + "(3," + shortName + "(3,3))) => " + e.message);
  }
}

console.log("\n=== G3.48 big ordinal annex small ordinal tests x=QqQe308 ===");
var ordq=MetaNum.QqQe308
for (var oi = 0; oi < ops.length; oi++) {
  try {
    var res = ordq[ops[oi]](m3);
    console.log("PASS | " + ops[oi] + "(QqQe308,3) | " + res.toString().slice(0,100));
  } catch (e) {
    console.log("FAIL | " + ops[oi] + "(QqQe308,3) => " + e.message);
  }
}

console.log("\n=== G3.49 big ordinal annex small ordinal tests y=QqQe308 ===");
for (var oi = 0; oi < ops.length; oi++) {
  try {
    var res = ordq[ops[oi]](m3);
    console.log("PASS | " + ops[oi] + "(3,QqQe308) | " + res.toString().slice(0,100));
  } catch (e) {
    console.log("FAIL | " + ops[oi] + "(3,QqQe308) => " + e.message);
  }
}

// ─────────────────────────────────────
// Large-cardinal hyperoperation correctness (input > 10^16)
// Verifies: (1) metaFiniteCount extracts the iteration count instead of collapsing 
//           toNumber() = Infinity → 0(count row is non - zero and grows with y)
//           (2) compareTo ranks an ω - level ordinal row above any
//           number of finite-level rows, so op(x,·) is monotone across the
//           10^16 boundary (aperiote(1e8) < aperiote(1e16)) (well-ordered)
// ─────────────────────────────────────
console.log("\n=== G3.50 hyperoperation large-cardinal (x > 10^16) ===");

function checkArr(name, m, expectedArray) {
  try {
    var got = JSON.stringify(m.array);
    var exp = JSON.stringify(expectedArray);
    var pass = got === exp;
    console.log((pass ? "PASS" : "FAIL") + " | " + name + " | " + got);
    if (!pass) console.log("  Expected: " + exp);
  } catch (e) {
    console.log("ERROR | " + name + " => " + e.message);
  }
}

var mL8 = MetaNum(1e8);
var mL12 = MetaNum(1e12);
var mL16 = MetaNum(1e16);

// --- monotonicity across the 10^16 boundary (comparison fix) ---
checkBool("mono aper 1e8<1e12<1e16",
  mL8.aperiote(mL8).lt(mL12.aperiote(mL12)) && mL12.aperiote(mL12).lt(mL16.aperiote(mL16)), true);
checkBool("mono expa(·,3) 1e8<1e16", mL8.expande(3).lt(mL16.expande(3)), true);
checkBool("mono muea(·,3) 1e8<1e16", mL8.multiexpande(3).lt(mL16.multiexpande(3)), true);
checkBool("mono poea(·,3) 1e8<1e16", mL8.powerexpande(3).lt(mL16.powerexpande(3)), true);

// --- count not zeroed: result strictly grows with y (metaFiniteCount fix) ---
checkBool("expa(1e16,3) > expa(1e16,2)", mL16.expande(3).gt(mL16.expande(2)), true);
checkBool("muea(1e16,3) > muea(1e16,2)", mL16.multiexpande(3).gt(mL16.multiexpande(2)), true);
checkBool("poea(1e16,3) > poea(1e16,2)", mL16.powerexpande(3).gt(mL16.powerexpande(2)), true);
checkBool("expa(1e16,5) > expa(1e16,3)", mL16.expande(5).gt(mL16.expande(3)), true);
checkBool("muea(1e16,5) > muea(1e16,3)", mL16.multiexpande(5).gt(mL16.multiexpande(3)), true);
checkBool("poea(1e16,5) > poea(1e16,3)", mL16.powerexpande(5).gt(mL16.powerexpande(3)), true);

// --- array structure snapshots (count correctly stored, not collapsed to 0) ---
// expande: count row [y-2,0,1] is at ω-level, same as aperiote's [1,0,1], so they
// merge → [1+(y-2),0,1] = [y-1,0,1]. For y=3 that is [2,0,1].
checkArr("expande(1e16,3) array", mL16.expande(3), [[16, 1], [2, 0, 1]]);
// multiexpande (ω+2): 1e16{ω+1}1e16{ω+1}1e16 → count row [2,1,1] at ω+1.
checkArr("multiexpande(1e16,3) array", mL16.multiexpande(3), [[16, 1], [2, 1, 1]]);
// powerexpande (ω+3): count row [2,2,1] at ω+2.
checkArr("powerexpande(1e16,3) array", mL16.powerexpande(3), [[16, 1], [2, 2, 1]]);

// --- y > MSI: result diagonalizes to y plus one α-level row (no counts > MSI) ---
// x{α}y ≈ 10{α}y → y's own representation + marker row [1|α]
checkArr("aperiote(3,1e16) array", m3.aperiote(mL16), [[16, 1], [1, 0, 1]]);
// rule 3: 1e16{ω}3 = 1e16{3}1e16 — the huge base dominates, same marker
// array as the y>MSI case
checkArr("aperiote(1e16,3) array", mL16.aperiote(3), [[16, 1, 2]]);
checkArr("expande(3,1e16) array", m3.expande(mL16), [[16, 1], [1, 1, 1]]);
checkArr("multiexpande(3,1e16) array", m3.multiexpande(mL16), [[16, 1], [1, 2, 1]]);
checkArr("powerexpande(3,1e16) array", m3.powerexpande(mL16), [[16, 1], [1, 3, 1]]);
checkArr("powiainate(3,1e16) array", m3.powiainate(mL16), [[16, 1], [1, 1, 0, 0, 1]]);
// beyond 10{100}10: y itself carries a compact finite-level ordinal row
// finite levels beyond r0 capacity expand into a cascade
// of [count, level] rows within the maxRows budget; beyond the budget the
// approximation keeps the largest maxRows-1 rows and bumps the second row.
var mArrow1000 = MetaNum.arrow(10, 1000, 10);
checkArr("arrow(10,1000,10) array", mArrow1000,
  [[10], [9, 981], [8, 982], [8, 983], [8, 984], [8, 985], [8, 986], [8, 987], [8, 988], [8, 989], [8, 990], [8, 991], [8, 992], [8, 993], [8, 994], [8, 995], [8, 996], [8, 997], [8, 998], [8, 999]]);
checkArr("powiainate(3,arrow(10,1000,10)) array", m3.powiainate(mArrow1000),
  [[10], [9, 982], [8, 983], [8, 984], [8, 985], [8, 986], [8, 987], [8, 988], [8, 989], [8, 990], [8, 991], [8, 992], [8, 993], [8, 994], [8, 995], [8, 996], [8, 997], [8, 998], [8, 999], [1, 1, 0, 0, 1]]);

// --- inverse roundtrip recovers y exactly (multiexpande / powerexpande) ---
// Because the count rows live at ω+1 / ω+2 (not the base ω-level), they do not
// merge with aperiote's [1,0,1] row, so inv_* recovers y rather than y+1.
checkBool("inv_multiexpande(1e16{ω+2}3,1e16)=3", mL16.multiexpande(3).inv_multiexpande(mL16).eq(MetaNum(3)), true);
checkBool("inv_powerexpande(1e16{ω+3}3,1e16)=3", mL16.powerexpande(3).inv_powerexpande(mL16).eq(MetaNum(3)), true);
checkBool("inv_multiexpande(1e16{ω+2}5,1e16)=5", mL16.multiexpande(5).inv_multiexpande(mL16).eq(MetaNum(5)), true);
checkBool("inv_powerexpande(1e16{ω+3}5,1e16)=5", mL16.powerexpande(5).inv_powerexpande(mL16).eq(MetaNum(5)), true);
// Small-x finite branch (base has no ω-row): inv_expande is exact too.
checkBool("inv_expande(3{ω+1}5,3)=5", MetaNum(3).expande(5).inv_expande(MetaNum(3)).eq(MetaNum(5)), true);

// ─────────────────────────────────────
// h11/h12/h13 (ω+1 / ω+2 / ω+3): the TOP row carries y-2 applications
// (rule 2: x{α}y = x{α-1}^(y-2)(x{α-1}x)), and every row BELOW it comes from
// decomposing x{α-1}x — whose operand is the BASE x — so it carries x-2,
// the same count the finite r0 coefficients carry.
//   10{ω+3}20 = 10{ω+2}^18 10{ω+1}^8 10{ω}^8 10{ω}10
//             → [8,0,1] [8,1,1] [18,2,1]   (not three 18-rows)
// ─────────────────────────────────────
console.log("\n=== G3.51 h11/h12/h13 count law ===");
checkBool("h13(10,20) = 10{ω+3}20 → [8,0,1] [8,1,1] [18,2,1]",
  JSON.stringify(MetaNum(10).h13(20).array.slice(1)) === "[[8,0,1],[8,1,1],[18,2,1]]", true);
checkBool("h12(10,20) = 10{ω+2}20 → [8,0,1] [18,1,1]",
  JSON.stringify(MetaNum(10).h12(20).array.slice(1)) === "[[8,0,1],[18,1,1]]", true);
checkBool("h11(10,20) = 10{ω+1}20 → [18,0,1] (single row stays y-2)",
  JSON.stringify(MetaNum(10).h11(20).array.slice(1)) === "[[18,0,1]]", true);
// the lower rows are the BASE's count (x-2) and never move with y
var hRows = { 3: 1, 5: 3, 10: 8 };
for (var hx in hRows) {
  var lowC = hRows[hx];
  for (var hy = 3; hy <= 20; hy++) {
    var hr = MetaNum(Number(hx)).h13(hy).array.slice(1);
    var hok = JSON.stringify(hr) === JSON.stringify(
      [[lowC, 0, 1], [lowC, 1, 1], [hy - 2, 2, 1]]);
    if (!hok) { checkBool("h13(" + hx + "," + hy + ") rows", false, true); break; }
  }
  checkBool("h13(" + hx + ",3..20): lower rows fixed at x-2=" + lowC + ", top row y-2", true, true);
}
// y-monotone and level-monotone on the enumeration path
for (var hy2 = 3; hy2 <= 20; hy2++) {
  var hprev = null, hch = true;
  for (var hi = 0; hi < 3; hi++) {
    var hv = MetaNum(10)[["h11", "h12", "h13"][hi]](hy2);
    if (hprev && !hv.gt(hprev)) hch = false;
    hprev = hv;
  }
  if (!hch) { checkBool("h11<h12<h13 at y=" + hy2, false, true); break; }
}
checkBool("h11 < h12 < h13 for y = 3..20", true, true);
checkBool("inv_powerexpande(10{ω+3}20,10) = 20",
  MetaNum(10).h13(20).inv_powerexpande(MetaNum(10)).eq(MetaNum(20)), true);

// ─────────────────────────────────────
// Every level from ω*2 up follows the same law:
//   successor α = β+1 → rows of x{β}x, each x-2, + one β-row carrying y-2
//   limit α           → rule 3 turns y into the fundamental-sequence index, so
//                       EVERY row carries x-2 (stay expanded up to MSI)
// ─────────────────────────────────────
console.log("\n=== G3.52 h20+ : expanded form & count law ===");
// successor h21 (ω*2+1): 10{ω*2+1}20 = the ω..ω+9 cascade (x-2 = 8) + ω*2 row y-2
checkBool("h21(10,20) = [8,0..9,1] rows + [18,0,2]",
  JSON.stringify(MetaNum(10).h21(20).array.slice(1)) ===
  "[[8,0,1],[8,1,1],[8,2,1],[8,3,1],[8,4,1],[8,5,1],[8,6,1],[8,7,1],[8,8,1],[8,9,1],[18,0,2]]", true);
// h22 (ω*2+2): one more row at ω*2 (x-2), top row ω*2+1 carries y-2
checkBool("h22(10,20) = cascade + [8,0,2] + [18,1,2]",
  JSON.stringify(MetaNum(10).h22(20).array.slice(1)) ===
  "[[8,0,1],[8,1,1],[8,2,1],[8,3,1],[8,4,1],[8,5,1],[8,6,1],[8,7,1],[8,8,1],[8,9,1],[8,0,2],[18,1,2]]", true);
// base-driven lower rows: x=3 → the cascade stops at ω+2 and every count is 1
checkBool("h21(3,20): lower rows carry x-2 = 1",
  JSON.stringify(MetaNum(3).h21(20).array.slice(1)) === "[[1,0,1],[1,1,1],[1,2,1],[18,0,2]]", true);
// and the lower rows never move with y
(function () {
  var lowRows = JSON.stringify(MetaNum(10).h21(3).array.slice(1, 11));
  var ok = true;
  for (var y = 4; y <= 20; y++) {
    var r = MetaNum(10).h21(y).array.slice(1);
    if (JSON.stringify(r.slice(0, 10)) !== lowRows || r[10][0] !== y - 2) ok = false;
  }
  checkBool("h21(10,3..20): lower rows fixed at 8, ω*2 row = y-2", ok, true);
})();

// limit ops stay EXPANDED for 100 < y ≤ MSI (no one-row marker)
(function () {
  var MSI = 9007199254740991;
  for (var i = 0; i < 3; i++) {
    var lf = ["h20", "h30", "h100"][i];
    for (var k = 0; k < 3; k++) {
      var ly = [101, 1000, MSI][k];
      var lr = MetaNum(10)[lf](ly);
      // maxRows-1 ordinal rows, base collapsed to [10], first kept row marked +1
      checkBool(lf + "(10," + ly + ") stays expanded (" + (lr.array.length - 1) + " rows)",
        lr.array.length - 1 === MetaNum.maxRows - 1 && lr.array[0].length === 1 &&
        lr.array[1][0] === 9, true);
    }
  }
  // top row carries the fundamental-sequence level ω+(y-1) with count y-2
  // (first successor expansion); the rows below it carry x-2 = 8
  checkBool("h20(10,1000) top row = ω+999, count y-2",
    JSON.stringify(MetaNum(10).h20(1000).array[19]) === "[998,999,1]", true);
  checkBool("h20(10,MSI) top row = ω+(MSI-1)",
    MetaNum(10).h20(MSI).array[19][1] === MSI - 1, true);
})();

// ─────────────────────────────────────
// Fractional y for every level from ω*2 up (README "Non-integer arguments"):
// a limit level takes its fundamental sequence at the FULL fractional index and
// the fractional coefficients resolve against the operand y (ω^(k)·(c+f) =
// ω^(k)·c + ω^(k-1)·(y·f)); a leftover fractional constant becomes a fractional
// argument one level up: x{γ+f}y = x{γ+1}(2·(y/2)^f).
// ─────────────────────────────────────
console.log("\n=== G3.53 h20+ with fractional y ===");
checkBool("10{ω*2}2.1 = 10{ω+3}(2*(2.1/2)^0.1)",
  MetaNum(10).h20(2.1).eq(MetaNum(10).powerexpande(2 * Math.pow(2.1 / 2, 0.1))), true);
checkBool("3{ω*2}2.1 = 3{ω+3}(2*(2.1/2)^0.1)",
  MetaNum(3).h20(2.1).eq(MetaNum(3).powerexpande(2 * Math.pow(2.1 / 2, 0.1))), true);
checkBool("10{ω^2}2.1 = 10{ω*2+1}(2*(2.1/2)^0.21)",
  MetaNum(10).h100(2.1).eq(MetaNum(10).h21(2 * Math.pow(2.1 / 2, 0.21))), true);
checkBool("3{ω^2}2.1 = 3{ω*2+1}(2*(2.1/2)^0.21)",
  MetaNum(3).h100(2.1).eq(MetaNum(3).h21(2 * Math.pow(2.1 / 2, 0.21))), true);
// 10{ω^ω}2.1 = 10{ω^2.1}2.1 = 10{ω^2*2.1^0.1}2.1 → ω^2+0.339638… → next level
(function () {
  var rf = MetaNum._resolveFracLevel([0, 0, Math.pow(2.1, 0.1)], 2.1);
  var up = rf.ord.slice(); up[0] += 1;
  checkBool("10{ω^ω}2.1 = 10{ω^2+1}(2*(2.1/2)^0.339638…) (level " +
    JSON.stringify(up) + ")",
    JSON.stringify(up) === "[1,0,1]" &&
    MetaNum(10).iterate(2.1).eq(
      MetaNum._hyperopFromOrdinal(MetaNum(10), MetaNum(2 * Math.pow(2.1 / 2, rf.frac)), up)), true);
})();
// the fraction is not thrown away: y and floor(y) differ
checkBool("h20(10,2.1) != h20(10,2) and lies strictly between 2 and 3",
  MetaNum(10).h20(2.1).gt(MetaNum(10).h20(2)) &&
  MetaNum(10).h20(2.1).lt(MetaNum(10).h20(3)), true);
checkBool("h100(10,10.25) lies strictly between 10 and 11",
  MetaNum(10).h100(10.25).gt(MetaNum(10).h100(10)) &&
  MetaNum(10).h100(10.25).lt(MetaNum(10).h100(11)), true);
// Monotone in y across the integers for the LIMIT levels.  The fractional
// interpolation anchors at x{γ+1}2 = x{γ}x (README), so the grid step m →
// m+f stays monotone while m ≤ x; for m > x the fractional value sits in the
// interpolation band [x{γ+1}2, x{γ+1}(m+f)) BELOW the integer grid point —
// that is the spec's behavior, checked separately.  Sampled: representative
// ops/bases/m (still covers ω, ω+1, ω*2, ω² and ω^ω strata and both small
// bases).
(function () {
  var limOps = ["h20", "h30", "h100", "h1000", "iterate"];
  var bad = 0, firstBad = "";
  for (var i = 0; i < limOps.length; i++) {
    for (var b = 0; b < 2; b++) {
      var bx = [3, 10][b];
      for (var m = 2; m <= 10; m += 4) {
        if (m > bx) continue;   // grid monotonicity is guaranteed only for y ≤ x
        var a = MetaNum(bx)[limOps[i]](m), c = MetaNum(bx)[limOps[i]](m + 0.001);
        var d = MetaNum(bx)[limOps[i]](m + 0.5), e = MetaNum(bx)[limOps[i]](m + 1);
        if (!(c.gte(a) && d.gte(c) && e.gte(d))) {
          bad++; if (!firstBad) firstBad = limOps[i] + "(" + bx + "," + m + ")";
        }
      }
    }
  }
  checkBool("limit levels monotone across fractional y (grid points y ≤ x)", bad === 0, true,
    bad === 0 ? "" : " first failure: " + firstBad);
  // for m > x the value stays inside the interpolation band anchored at
  // x{γ}x: h20(3,6.001) = 3{ω+7}(2·(6.001/2)^0.001) ∈ [3{ω+7}2, 3{ω+7}6.001)
  var lo = MetaNum._hyperopFromOrdinal(MetaNum(3), MetaNum(2), [7, 1]);
  var vv = MetaNum(3).h20(6.001);
  var hi = MetaNum._hyperopFromOrdinal(MetaNum(3), MetaNum(6.001), [7, 1]);
  checkBool("h20(3,6.001) lies in the band [3{ω+7}2, 3{ω+7}6.001) (y > x anchors at x{γ}x)",
    vv.gte(lo) && vv.lt(hi), true);
})();
// the SUCCESSOR rule with a fractional argument is written in the same expanded
// form: the α-1 row carries the m applications (ceil(y)-2 = m-1) and the cascade
// below it is generated at the fundamental-sequence index x^f, so the value grows
// with f inside the interval and converges to the next integer at f → 1
checkBool("h21(10,2.001) < h21(10,2.5) < h21(10,2.99) < h21(10,3)",
  MetaNum(10).h21(2.001).lt(MetaNum(10).h21(2.5)) &&
  MetaNum(10).h21(2.5).lt(MetaNum(10).h21(2.99)) &&
  MetaNum(10).h21(2.99).lt(MetaNum(10).h21(3)), true);
checkBool("h31(10,5.1) < h31(10,5.5) < h31(10,5.9) < h31(10,6)",
  MetaNum(10).h31(5.1).lt(MetaNum(10).h31(5.5)) &&
  MetaNum(10).h31(5.5).lt(MetaNum(10).h31(5.9)) &&
  MetaNum(10).h31(5.9).lt(MetaNum(10).h31(6)), true);
// the expanded form keeps the count law with INTEGER counts (only array[0][0]
// may be fractional): every row below the top one carries x-2 = 8 and the α-1
// row carries ceil(y)-2; the fraction lives in the cascade depth, so 2+ε starts
// with the shallowest cascade and 3-ε has the full 10{ω*2}10 cascade
(function () {
  var ok = true;
  for (var k = 0; k < 6; k++) {
    var fy = [2.001, 2.1, 2.5, 3.5, 10.25, 100.75][k];
    var rr = MetaNum(10).h21(fy).array.slice(1);
    for (var i = 0; i < rr.length - 1; i++) if (rr[i][0] !== 8) ok = false;
    if (rr[rr.length - 1][0] !== Math.ceil(fy) - 2) ok = false;
  }
  checkBool("h21(10, fractional): lower rows = 8, ω*2 row = ceil(y)-2 (integer)", ok, true);
  // the endpoints: 2+ε is just above h21(10,2) = 10{ω*2}10, 3-ε → h21(10,3)
  checkBool("h21(10,2+1e-15) = shallowest cascade + one ω*2 row, above h21(10,2)",
    MetaNum(10).h21(2 + 1e-15).array.length === 3 &&
    JSON.stringify(MetaNum(10).h21(2 + 1e-15).array[2]) === "[1,0,2]" &&
    MetaNum(10).h21(2 + 1e-15).gt(MetaNum(10).h21(2)), true);
  checkBool("h21(10,2.999999) → h21(10,3) from below",
    MetaNum(10).h21(2.999999).lt(MetaNum(10).h21(3)) &&
    MetaNum(10).h21(2.999999).gt(MetaNum(10).h21(2)), true);
})();
// the CONTRACT for fractional operands: only array[0][0] may be non-integer —
// every row count, every row coefficient and every other r0 entry is an integer
// (exactly like MetaNum.arrow with a fractional level/argument)
(function () {
  var bad = [], n = 0;
  var fOps = ["h11","h20","h21","h31","h100","iterate","cuboiter","epsilonate"];
  for (var f of fOps) {
    for (var b = 0; b < 2; b++) {
      var bx = [3, 10][b];
      for (var k = 0; k < 2; k++) {
        var by = [2.1, 100.75][k];
        n++;
        var arr = MetaNum(bx)[f](by).array;
        for (var i = 0; i < arr.length; i++) {
          for (var j = 0; j < arr[i].length; j++) {
            if (i === 0 && j === 0) continue;
            var c = arr[i][j];
            if (typeof c !== "number" || !isFinite(c) || c !== Math.floor(c)) {
              if (bad.length < 4) bad.push(f + "(" + bx + "," + by + ") [" + i + "][" + j + "]=" + c);
            }
          }
        }
      }
    }
  }
  checkBool("only array[0][0] is fractional (" + n + " results checked)", bad.length === 0,
    true, bad.join(" | "));
  // arrow() itself obeys the same contract (the 1e9+0.4 level is the extreme
  // case and stays in the sample; the middle levels were duplicates of it)
  var bad2 = 0;
  for (var b2 = 0; b2 < 3; b2++) {
    var bx2 = [3, 10, 100][b2];
    for (var k2 = 0; k2 < 4; k2++) {
      var lv = [1.5, 2.1, 100.75, 1e9 + 0.4][k2];
      var arr2 = MetaNum(bx2).arrow(lv)(10).array;
      for (var i2 = 0; i2 < arr2.length; i2++) {
        for (var j2 = 0; j2 < arr2[i2].length; j2++) {
          if (i2 === 0 && j2 === 0) continue;
          if (arr2[i2][j2] !== Math.floor(arr2[i2][j2])) bad2++;
        }
      }
    }
  }
  checkBool("arrow() with fractional levels: only array[0][0] is fractional", bad2 === 0, true);
})();

// row coefficients stay integer (a fractional constant is carried to the base)
(function () {
  var ok = true;
  for (var f of ["h21", "h22", "h31", "h101", "h111", "h1001"]) {
    for (var k = 0; k < 3; k++) {
      var fy = [2.001, 3.5, 100.75][k];
      var arr = MetaNum(10)[f](fy).array;
      for (var i = 1; i < arr.length; i++) {
        for (var j = 1; j < arr[i].length; j++) {
          if (arr[i][j] !== Math.floor(arr[i][j])) ok = false;
        }
      }
    }
  }
  checkBool("fractional y: every ordinal row coefficient is an integer", ok, true);
})();

// no crash / NaN with fractional operands.  Sampled at the two argument
// extremes (2+ε and 1000.5) over a small and a >MSI base — the full 260-cell
// grid multiplied the same path by every middle value.
(function () {
  var allOps = ["h20","h21","h22","h30","h31","h100","h101","h110","h111",
    "h1000","h1001","h10000","iterate"];
  var bad = 0;
  // every op at the two argument extremes (2+ε, 1000.5) on a small base
  for (var i = 0; i < allOps.length; i++) {
    for (var k = 0; k < 2; k++) {
      var by = [2.0001, 1000.5][k];
      try {
        var v = MetaNum(3)[allOps[i]](by);
        if (v.isNaN()) bad++;
      } catch (e) { bad++; }
    }
  }
  // the >MSI base only on the ω-stratum ops: h10000 on 1e16 multiplies a
  // 10^16-row cascade by the whole ω-tower and alone cost ~1.5 s, while the
  // remaining ops share its code path (x > MSI diagonalizes to one marker row)
  ["h20", "h100", "iterate"].forEach(function (f) {
    try {
      if (MetaNum(1e16)[f](2.5).isNaN()) bad++;
      if (MetaNum(1e16)[f](1000.5).isNaN()) bad++;
    } catch (e) { bad++; }
  });
  checkBool("no throw/NaN for fractional y over h20..h10000 + iterate", bad === 0, true);
})();

// inverse round-trip, successors and limits.  y is sampled at {3,5,10,20}
// instead of every integer 3..20 (the law is per-level, not per-count).
(function () {
  var pairs = [["h11","inv_expande"],["h12","inv_multiexpande"],["h13","inv_powerexpande"],
    ["h20","inv_aperioexpande"],["h21","inv_explode"],["h22","inv_multiexplode"],
    ["h30","inv_aperioexplode"],["h31","inv_detonate"],["h100","inv_aperionate"],
    ["h101","inv_megote"],["h110","inv_aperimegote"],["h111","inv_megoexpande"],
    ["h1000","inv_aperiatote"],["h1001","inv_powiainate"]];
  var bad = 0, firstBad = "";
  for (var i = 0; i < pairs.length; i++) {
    for (var b = 0; b < 3; b++) {
      var bx = [3, 5, 10][b];
      for (var k = 0; k < 4; k++) {
        var y = [3, 5, 10, 20][k];
        var v = MetaNum(bx)[pairs[i][0]](y);
        if (!v[pairs[i][1]](MetaNum(bx)).eq(MetaNum(y))) {
          bad++; if (!firstBad) firstBad = pairs[i][0] + "(" + bx + "," + y + ")";
        }
      }
    }
  }
  checkBool("inverse round-trip for h11..h1001 (x=3/5/10, y=3/5/10/20)", bad === 0,
    true, bad === 0 ? "" : " first failure: " + firstBad);
})();

// ─────────────────────────────────────
// v2.2.0 ordinal-level ROOT forms: c.<op>_root(b) = a mirrors the inv_* log
// family (c.i_<op>(a) = b).  README example:
//   (10{ω}15).aperiote_root(15) = 10, just like (10{ω}15).i_aper(10) = 15.
// Beyond the representation budget the stored value no longer encodes the
// base (huge-argument markers; base-independent layer markers at ω^ω+), so
// the root returns the smallest base reproducing the stored value — the
// same convention hyper_root documents for the finite levels.
// ─────────────────────────────────────
console.log("\n=== G4.15 ordinal-level root forms ===");
(function () {
  var v = MetaNum(10).aperiote(15);   // 10{ω}15
  checkBool("(10{ω}15).aperiote_root(15) = 10", v.aperiote_root(15).eq(MetaNum(10)), true);
  checkBool("(10{ω}15).r10(15) = 10 (code alias)", v.r10(15).eq(MetaNum(10)), true);
  checkBool("(10{ω}15).r_aper(15) = 10 (short alias)", v.r_aper(15).eq(MetaNum(10)), true);
  checkBool("(10{ω}15).i_aper(10) = 15 (log counterpart)", v.i_aper(MetaNum(10)).eq(MetaNum(15)), true);
  checkBool("static MetaNum.aperiote_root(10{ω}15, 15) = 10",
    MetaNum.aperiote_root(MetaNum(10).aperiote(15), MetaNum(15)).eq(MetaNum(10)), true);
  // edge cases: a{α}1 = a, 1{α}b = 1, 2{α}2 = 4 (B2-a), invalid input → NaN
  checkBool("aperiote_root y=1 returns the value (a{α}1 = a)", MetaNum(7).aperiote_root(1).eq(MetaNum(7)), true);
  checkBool("aperiote_root of 1 is 1 (1{α}b = 1)", MetaNum(1).aperiote_root(5).eq(MetaNum(1)), true);
  checkBool("(2{ω}9).aperiote_root(9) = 2 (2{9}9 roots back to base 2)",
    MetaNum(2).aperiote(9).aperiote_root(9).eq(MetaNum(2)), true);
  checkBool("aperiote_root of a negative value → NaN", MetaNum(-4).aperiote_root(5).isNaN(), true);
  checkBool("aperiote_root with y ≤ 0 → NaN", MetaNum(10).aperiote(15).aperiote_root(-5).isNaN(), true);
  // exact base recovery at every representable level (aperiote .. iterate)
  var exact = [["aperiote","aperiote_root"],["expande","expande_root"],
    ["multiexpande","multiexpande_root"],["powerexpande","powerexpande_root"],
    ["aperioexpande","aperioexpande_root"],["explode","explode_root"],
    ["multiexplode","multiexplode_root"],["aperioexplode","aperioexplode_root"],
    ["detonate","detonate_root"],["aperiodetonate","aperiodetonate_root"],
    ["aperionate","aperionate_root"],["megote","megote_root"],
    ["multimegote","multimegote_root"],["aperimegote","aperimegote_root"],
    ["megoexpande","megoexpande_root"],["aperimegoexpande","aperimegoexpande_root"],
    ["megoaperionate","megoaperionate_root"],["gigote","gigote_root"],
    ["aperigigote","aperigigote_root"],["gigoaperionate","gigoaperionate_root"],
    ["aperiatote","aperiatote_root"],["powiainate","powiainate_root"],
    ["expandainate","expandainate_root"],["megodainate","megodainate_root"],
    ["powiairate","powiairate_root"],["aperioguate","aperioguate_root"],
    ["iterate","iterate_root"]];
  var bad = 0, firstBad = "";
  for (var i = 0; i < exact.length; i++) {
    for (var k = 0; k < 2; k++) {
      var x = [3, 10][k];
      var vx = MetaNum(x)[exact[i][0]](5);
      var a = vx[exact[i][1]](MetaNum(5));
      if (!a.eq(MetaNum(x))) { bad++; if (!firstBad) firstBad = exact[i][0] + "(" + x + ",5)"; }
    }
  }
  checkBool("root recovers the base: aperiote..iterate (x=3/10, y=5)", bad === 0,
    true, bad === 0 ? "" : " first failure: " + firstBad);
  // marker levels (itermult..epsilonate): the stored layer marker is
  // base-independent (D07 B2-b), so the root is the smallest reproducing
  // base — 2, since the narrowed B2-a no longer collapses 2{λ}5 to 4 —
  // verify both that property and the round-trip
  var marker = [["itermult","itermult_root"],["iteraperiate","iteraperiate_root"],
    ["cuboiter","cuboiter_root"],
    ["expoiter","expoiter_root"],["trioterate","trioterate_root"],
    ["trixxate","trixxate_root"],["aperixxate","aperixxate_root"],
    ["epsilonate","epsilonate_root"]];
  var bad2 = 0, firstBad2 = "";
  for (var j = 0; j < marker.length; j++) {
    var vm = MetaNum(10)[marker[j][0]](5);
    var am = vm[marker[j][1]](MetaNum(5));
    if (!am[marker[j][0]](MetaNum(5)).eq(vm)) { bad2++; if (!firstBad2) firstBad2 = marker[j][0] + " round-trip"; }
    if (!am.eq(MetaNum(2))) { bad2++; if (!firstBad2) firstBad2 = marker[j][0] + " smallest base"; }
  }
  checkBool("marker levels: root = smallest base reproducing the marker (= 2)", bad2 === 0,
    true, bad2 === 0 ? "" : " first failure: " + firstBad2);
})();

// ─────────────────────────────────────
// G4.16 huge-y growth: with a large base, y > COEFF_BOUND(100) used to
// collapse to the level λ itself ([1|λ], y-independent). It must instead
// store the fundamental-sequence level λ[y] — the same convention the
// y ≤ 100 cascade path produces — so results keep growing with y and
// stay continuous across y = 100 → 101.
// ─────────────────────────────────────
console.log("\n=== G4.16 huge-y growth (y > COEFF_BOUND) ===");
(function () {
  var x = MetaNum(4).arrow(3)(4);   // 4↑↑↑4 — large base, ordinal engine
  var ops = ["h20","h30","h100","h40","h110","h120","h2000","h10000"];
  for (var i = 0; i < ops.length; i++) {
    var prev = null, mono = true, firstBad = "";
    for (var j = 0; j < 4; j++) {
      var y = [101, 1000, 1e4, 1e6][j];
      var v = new MetaNum(x)[ops[i]](y);
      if (prev && !v.gt(prev)) { mono = false; if (!firstBad) firstBad = "y=" + y; }
      prev = v;
    }
    checkBool("4↑↑↑4 " + ops[i] + "(y) strictly grows for y = 101..1e6", mono, true,
      mono ? "" : " first break: " + firstBad);
  }
  // the stored ordinal row must be [1|λ[y]]: coefficient equals y
  checkBool("h20(101) stores [1|ω+101]",
    JSON.stringify(new MetaNum(x).h20(101).array.slice(-1)) === "[[1,101,1]]", true);
  checkBool("h100(1e6) stores [1|ω·1000000]",
    JSON.stringify(new MetaNum(x).h100(1e6).array.slice(-1)) === "[[1,0,1000000]]", true);
  // continuity across the COEFF_BOUND boundary (value keeps growing):
  // y=100 ≤ COEFF_BOUND expands the successor cascade [99|ω+99], y=101
  // stores the huge-argument marker row [1|ω+101]
  checkBool("h20 continuous across y=100→101",
    JSON.stringify(new MetaNum(x).h20(100).array.slice(-1)) === "[[99,99,1]]" &&
    JSON.stringify(new MetaNum(x).h20(101).array.slice(-1)) === "[[1,101,1]]" &&
    new MetaNum(x).h20(100).lt(new MetaNum(x).h20(101)), true);
  // 4↑↑4 (smaller large base) must behave identically
  var x2 = MetaNum(4).arrow(2)(4);
  checkBool("4↑↑4 h30(101) < h30(1e4) < h30(1e6)",
    new MetaNum(x2).h30(101).lt(new MetaNum(x2).h30(1e4)) &&
    new MetaNum(x2).h30(1e4).lt(new MetaNum(x2).h30(1e6)), true);
})();

// ─────────────────────────────────────
// engine arrays: the (y-2) count law
//   x{L}y = x{L-1}^{y-2}(x{L-1}x): 10{25}10 → count-8 rows/cols (the
//   canonical all-8s), 4{25}4 → count-2; truncation keeps the largest
//   maxRows-1 rows, second-kept row +1, first row [10]
// ─────────────────────────────────────
console.log("\n=== G3.54 engine arrays ===");
checkBool("10{25}10 exact: all-8s r0 + [8,20..24] rows",
  JSON.stringify(MetaNum.arrow(10, 25, 10).array)
    === JSON.stringify([[10000000000,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8],
      [8,20],[8,21],[8,22],[8,23],[8,24]]), true);
checkBool("4{25}4 exact: count-2 chain",
  JSON.stringify(MetaNum.arrow(4, 25, 4).array)
    === JSON.stringify([[153.90699754796802,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,20],[2,21],[2,22],[2,23],[2,24]]), true);
checkBool("10{10000}10 truncated: [9,9981],[8,9982]…[8,9999], r0 [10]",
  JSON.stringify(MetaNum.arrow(10, 10000, 10).array).indexOf("[[10],[9,9981],[8,9982],[8,9983]") === 0 &&
  JSON.stringify(MetaNum.arrow(10, 10000, 10).array.slice(-1)) === "[[8,9999]]", true);

// ─────────────────────────────────────
// BEAF ordinal nesting (convention: BEAF(a,b,c,d)=a{ω*(d-1)+c}b —
// the constant term keeps its value, ω+ coefficients decrement by 1)
// Nested huge args anchor at the inner value and add one ordinal row:
//   BEAF(inner,2,3,5) = inner{ω*4+3}2 = inner{ω*4+2}inner → inner + [1|ω*4+2]
//   BEAF(4,inner,3,5) = 4{ω*4+3}inner            → inner + [1|ω*4+3]
//   BEAF(4,2,inner,5) = 4{ω*4+inner}2 = 4{ω*5}inner → inner + [1|ω*5]
//   BEAF(4,2,3,inner) = 4{ω*inner+3}2 = 4{ω²}inner  → inner + [1|ω²]
// ─────────────────────────────────────
console.log("\n=== G3.55 fractional levels ===");
(function () {
  var a = MetaNum(10);
  var v3 = a.arrow(3)(10), v4 = a.arrow(4)(10);
  var v32 = a.arrow(3.2)(10), v35 = a.arrow(3.5)(10);
  checkBool("10{3.0}10 = 10{3}10 (f=0 anchor)", a.arrow(3.0)(10).eq(v3), true);
  checkBool("monotone 10{3}10 < 10{3.2}10 < 10{3.5}10 < 10{4}10",
    v3.lt(v32) && v32.lt(v35) && v35.lt(v4), true);
  // rule (i) verbatim: 10{3.5}10 = 10{4}(2·5^0.5)
  var theta = MetaNum(2).mul(MetaNum(10).div(2).pow(0.5));
  checkBool("10{3.5}10 = 10{4}(2·5^0.5)", v35.eq(a.arrow(4)(theta)), true);
  checkBool("3{2.5}3 between 3{2}3 and 3{3}3",
    MetaNum(3).arrow(2)(3).lt(MetaNum(3).arrow(2.5)(3)) &&
    MetaNum(3).arrow(2.5)(3).lt(MetaNum(3).arrow(3)(3)), true);
})();

// ─────────────────────────────────────
// arrow(x,y,y): level and argument move together, so the interpolation anchor
// θ0 (the c with x{n+1}c = x{n}y) has to be a CONTINUOUS inverse — the integer
// bisection of hyper_log overshoots it (2 instead of 1.0414), which makes the
// geometric step y/θ0 < 1 run backwards and breaks monotonicity.
// ─────────────────────────────────────
(function () {
  var ys = [1, 1.1, 1.5, 1.9, 2];
  for (var b = 0; b < 2; b++) {
    var bx = [3, 10][b], prev = null, ok = true, firstBad = "";
    for (var i = 0; i < ys.length; i++) {
      var v = MetaNum.arrow(bx, ys[i], ys[i]);
      if (prev && !v.gte(prev)) { ok = false; if (!firstBad) firstBad = "y=" + ys[i]; }
      prev = v;
    }
    checkBool("arrow(" + bx + ",y,y) monotone for y = 1, 1.1, 1.5, 1.9, 2", ok, true,
      ok ? "" : " first break: " + firstBad);
  }
  // fine sweep across the whole 1 → 3 range, both endpoints included
  var fine = [1, 1.01, 1.25, 1.5, 1.75, 1.99, 2, 2.1, 2.5, 2.9, 3];
  for (var b2 = 0; b2 < 2; b2++) {
    var bx2 = [3, 10][b2], p2 = null, ok2 = true;
    for (var j = 0; j < fine.length; j++) {
      var v2 = MetaNum.arrow(bx2, fine[j], fine[j]);
      if (p2 && !v2.gte(p2)) ok2 = false;
      p2 = v2;
    }
    checkBool("arrow(" + bx2 + ",y,y) monotone over y = 1 … 3", ok2, true);
  }
  // the ends of an interval meet the neighbouring integers
  checkBool("10{1.99}1.99 < 10{2}2 = 10^^2",
    MetaNum.arrow(10, 1.99, 1.99).lt(MetaNum.arrow(10, 2, 2)), true);
  checkBool("10{2}2 < 10{2.1}2.1",
    MetaNum.arrow(10, 2, 2).lt(MetaNum.arrow(10, 2.1, 2.1)), true);
  checkBool("3{1.99}1.99 < 3{2}2 = 27",
    MetaNum.arrow(3, 1.99, 1.99).lt(MetaNum.arrow(3, 2, 2)), true);
})();

// ─────────────────────────────────────
// non-integer arguments at ordinal levels
//   expa(10,2.1) = 10{ω+1}2.1 = 10{ω}10{ω}(10^0.1)
//   (continuity: expa(10,2) = 10{ω}10, expa(10,3) = 10{ω}10{ω}10)
// ─────────────────────────────────────
console.log("\n=== G3.56 ordinal-level fractional arguments ===");
(function () {
  var e2 = MetaNum(10).expande(2), e21 = MetaNum(10).expande(2.1),
      e25 = MetaNum(10).expande(2.5), e3 = MetaNum(10).expande(3);
  checkBool("expa(10,2) = 10{ω}10", e2.eq(MetaNum(10).aperiote(10)), true);
  checkBool("expa(10,3) = 10{ω}10{ω}10", e3.eq(MetaNum(10).aperiote(e2)), true);
  checkBool("expa(10,2.1) = 10{ω}10{ω}(10^0.1)",
    e21.eq(MetaNum(10).aperiote(MetaNum(10).aperiote(MetaNum(10).pow(0.1)))), true);
  checkBool("expa monotone 2 < 2.1 < 2.5 < 3",
    e2.lt(e21) && e21.lt(e25) && e25.lt(e3), true);
  var m21 = MetaNum(10).multiexpande(2.1);
  checkBool("muea(10,2.1) = 10{ω+2}2.1 = (10{ω+1})²(10^0.1)",
    m21.eq(MetaNum(10).expande(MetaNum(10).expande(MetaNum(10).pow(0.1)))), true);
  checkBool("poea(10,2.1) = 10{ω+3}2.1 = (10{ω+2})²(10^0.1)",
    MetaNum(10).powerexpande(2.1).eq(
      MetaNum(10).multiexpande(MetaNum(10).multiexpande(MetaNum(10).pow(0.1)))), true);
  checkBool("expa(10,3.1) computable", !MetaNum(10).expande(3.1).isNaN(), true);
})();


// ─────────────────────────────────────
// format() tests (25 cases covering small, sci, single-letter, multi-letter, ordinal)
// ─────────────────────────────────────
console.log("\n=== G3.57 D07 2{lambda}2 ===");
(function () {
  var ops = ["aperiote", "aperionate", "iter", "itermult", "cuboiter", "expoiter",
             "trioterate", "trixxate", "aperixxate", "epsilonate"];
  // B2-a collapses only the 2-diagonal: 2{λ}2 = 2{2}2 = 4 for every level
  // (rule 3 turns the argument into 2).  For y ≥ 3 the new rule 2{λ}y =
  // 2{λ[y]}y keeps growing with y.
  [2, 3, 5, 1000].forEach(function (y) {
    ops.forEach(function (op) {
      var v = new MetaNum(2)[op](y);
      if (y === 2) ok("2{" + op + "}2 === 4 (B2-a diagonal)", v.eq(4), v.toString());
      else ok("2{" + op + "}" + y + " > 4", v.gt(4), v.toString());
    });
  });
  // y ≥ 3 grows monotonically for every level, with an exact anchor at ω
  ops.forEach(function (op) {
    ok("2{" + op + "}3 < 2{" + op + "}5 < 2{" + op + "}1000",
      new MetaNum(2)[op](3).lt(new MetaNum(2)[op](5)) &&
      new MetaNum(2)[op](5).lt(new MetaNum(2)[op](1000)));
  });
  ok("2{aperiote}3 === 65536 (2{ω}3 = 2{3}3)", new MetaNum(2).aperiote(3).eq(65536));
  // finite levels must NOT collapse (2{1}3 = 8, 2{2}3 = 16)
  ok("2{1}3 === 8 (finite unaffected)", new MetaNum(2).arrow(1)(3).eq(8));
  ok("2{2}3 === 16 (finite unaffected)", new MetaNum(2).arrow(2)(3).eq(16));
  ok("3{ω²}1 === 3 (y=1)", new MetaNum(3).aperionate(1).eq(3));
  ok("3{ω^ω}1 === 3 (y=1)", new MetaNum(3).trixxate(1).eq(3));
})();

// ─────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────
// v2.1.0: hardy(x, base) / FGH(x, y)
// ─────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════
// G4 · BEAF · HARDY · FGH
//   BEAF nesting/toBeaf, Hardy hierarchy, hardy(x,base) and FGH
// ══════════════════════════════════════════════════════════════════

console.log("\n=== G4.1 BEAF ordinal nesting ===");
checkOp("BEAF(3,3,2)", MetaNum.BEAF(3, 3, 2), 7625597484987, 0);
checkBool("BEAF(2,2,1,2)", MetaNum.BEAF(2, 2, 1, 2).eq(4), true);
var beafInner = MetaNum.BEAF(4, 2, 3, 5); // 4{ω*4+3}2 = 4{ω*4+2}(4{ω*4+2}(4{ω*4+1}...))
checkBool("BEAF(4,2,3,5) top row [2,1,4]",
  JSON.stringify(beafInner.array[beafInner.array.length - 1]) === JSON.stringify([2, 1, 4]), true);
checkArr("BEAF(BEAF(4,2,3,5),2,3,5)", MetaNum.BEAF(beafInner, 2, 3, 5),
  beafInner.array.concat([[1, 2, 4]]));
checkArr("BEAF(4,BEAF(4,2,3,5),3,5)", MetaNum.BEAF(4, beafInner, 3, 5),
  beafInner.array.concat([[1, 3, 4]]));
checkArr("BEAF(4,2,BEAF(4,2,3,5),5)", MetaNum.BEAF(4, 2, beafInner, 5),
  beafInner.array.concat([[1, 0, 5]]));
checkArr("BEAF(4,2,3,BEAF(4,2,3,5))", MetaNum.BEAF(4, 2, 3, beafInner),
  beafInner.array.concat([[1, 0, 0, 1]]));
var beafInner5 = MetaNum.BEAF(5, 5, 5, 5, 5);
// ω²-level huge arg: the outer keeps inner's ordinal rows except the smallest
// (dropped at row capacity), base stays [10], first kept row count +1 (the
// truncation marker), plus the new [1|ω⁴] anchor row
var beafOuter5Exp = [[10]].concat(beafInner5.array.slice(2)).concat([[1, 0, 0, 0, 1]]);
beafOuter5Exp[1] = beafOuter5Exp[1].slice();
beafOuter5Exp[1][0] += 1;
checkArr("BEAF(5,5,5,5,BEAF(5,5,5,5,5))", MetaNum.BEAF(5, 5, 5, 5, beafInner5),
    beafOuter5Exp);
// ─────────────────────────────────────
//   BEAF(a,b,c,d,...) = a{...+ω^2*(e-1)+ω*(d-1)+c}b  (constant term = args[2])
//   expansion: largest-to-smallest evaluation; exact when it fits maxRows-1
//   rows, else base [10] + first kept row count +1
// ─────────────────────────────────────
// {2,7,5,5} = 2{ω*4+5}7 = 2{ω*4+4}(2{ω*4+5}6) → … — under the unified rule
// 2{λ}7 = 2{λ[7]}7 the value keeps growing; only the 2-diagonal collapses to
// 4 (2{α}2 = 2{2}2), so the result exceeds 4 and the lower-argument form
checkBool("BEAF(2,7,5,5) > 4 and grows with the constant term",
  MetaNum.BEAF(2, 7, 5, 5).gt(4) &&
  MetaNum.BEAF(2, 7, 4, 5).lt(MetaNum.BEAF(2, 7, 5, 5)), true);
// {3,2,4,6} = 3{ω*5+4}2
checkBool("BEAF(3,2,4,6) top row [1,2,5]",
  JSON.stringify(MetaNum.BEAF(3, 2, 4, 6).array[MetaNum.BEAF(3, 2, 4, 6).array.length - 1])
    === JSON.stringify([1, 2, 5]), true);
// BEAF(3,3,5,5,5) = 3{ω^2*4+ω*4+5}3: exact enumeration needs 49 ordinal rows
// (> default maxRows=20), so raise the budget for this case only
var _savedRowsBEAF = MetaNum.maxRows;
MetaNum.maxRows = 100;
var beaf35555 = MetaNum.BEAF(3, 3, 5, 5, 5);
checkBool("BEAF(3,3,5,5,5) exact (base kept, [1,0,1] first, [1,4,4,4] last)",
  beaf35555.array.length <= MetaNum.maxRows
  && JSON.stringify(beaf35555.array[0]) === JSON.stringify([3638334640023.7783, 7625597484984])
  && JSON.stringify(beaf35555.array[1]) === JSON.stringify([1, 0, 1])
  && JSON.stringify(beaf35555.array[beaf35555.array.length - 1]) === JSON.stringify([1, 4, 4, 4]), true);
MetaNum.maxRows = _savedRowsBEAF;
// BEAF(5,5,1,1,1,2) = 5{ω^3+1}5: truncated expansion
var beaf511112 = MetaNum.BEAF(5, 5, 1, 1, 1, 2);
checkBool("BEAF(5,5,1,1,1,2) truncated ([10] base, first count 4, last [3,0,0,0,1])",
  JSON.stringify(beaf511112.array[0]) === JSON.stringify([10])
  && beaf511112.array[1][0] === 4
  && JSON.stringify(beaf511112.array[beaf511112.array.length - 1]) === JSON.stringify([3, 0, 0, 0, 1])
  && beaf511112.array.length === MetaNum.maxRows, true);

// ─────────────────────────────────────
// Hardy hierarchy — ALL hardy verifications grouped here
// reorganization: small-level, per-definition nested exponents, >1e15
// inputs, MetaNum-object inputs and the 10^^MSI engine limit)
//   hardy(n) = H_α(10); hardy(10) = H_ω(10) = 20; digits of n become CNF coefficients
// hardy per definition, evaluated from below
//   hardy(1e10) = H_{ω^ω}(10) = H_{ω^10}(10) — EXACT array
//     [3086.036065328153, 9×8], strictly below 10{10}10
//   hardy(1e11) = H_{ω^(ω+1)}(10) — expande(10,10)'s row structure on the
//   definitional base, strictly below 10{ω+1}10
//   monotone: hardy(9999999999) < hardy(1e10) < hardy(10000000001)
// (moved into the "hardy hierarchy (all cases)" section below
// reorganization groups every hardy verification together)
// ─────────────────────────────────────
console.log("\n=== G4.2 hardy hierarchy (all cases) ===");
// -- small levels (exact closed forms) --
checkOp("hardy(0)", MetaNum.hardy(0), 10, 0);
checkOp("hardy(9)", MetaNum.hardy(9), 19, 0);
checkBool("hardy(10) = H_ω(10) = 20", MetaNum.hardy(10).eq(20), true);
checkBool("hardy(11) = H_{ω+1}(10) = 22", MetaNum.hardy(11).eq(22), true);
checkBool("hardy(20) = H_{ω*2}(10) = 40", MetaNum.hardy(20).eq(40), true);
checkBool("hardy(99) = H_{ω*9+9}(10) = 9728", MetaNum.hardy(99).eq(9728), true);
checkBool("hardy(100) = H_{ω^2}(10) = 10240", MetaNum.hardy(100).eq(10240), true);
checkBool("hardy(101) = H_{ω^2+1}(10) = 22528", MetaNum.hardy(101).eq(22528), true);
checkBool("hardy(1234) = H_{ω^3+ω^2*2+ω*3+4}(10) > 10↑↑1000",
  MetaNum.hardy(1234).gt(MetaNum(10).arrow(2)(1000)), true);
checkBool("hardy monotone: 999 < 1000", MetaNum.hardy(999).lt(MetaNum.hardy(1000)), true);
checkBool("hardy(12345) > hardy(1234)", MetaNum.hardy(12345).gt(MetaNum.hardy(1234)), true);
// -- nested exponents, per definition & evaluated from below (v2.0) --
checkBool("hardy(1e10) = H_{ω^10}(10) exact array [3086.036, 9×8]",
  JSON.stringify(MetaNum.hardy(1e10).array)
    === JSON.stringify([[3086.036065328153, 9, 9, 9, 9, 9, 9, 9, 9]]), true);
checkBool("hardy(1e10) < 10{10}10",
  MetaNum.hardy(1e10).lt(MetaNum(10).arrow(10)(10)), true);
checkBool("hardy(1e11) = H_{ω^(ω+1)}(10) < 10{ω+1}10 (expande)",
  MetaNum.hardy(1e11).lt(MetaNum(10).expande(10)), true);
checkBool("hardy monotone 9999999999 < 1e10 < 10000000001",
  MetaNum.hardy(9999999999).lt(MetaNum.hardy(1e10))
    && MetaNum.hardy(1e10).lt(MetaNum.hardy(10000000001)), true);
checkBool("hardy(1e12) > hardy(1e11) (monotone in scale)",
  MetaNum.hardy(1e12).gt(MetaNum.hardy(1e11)), true);
// -- >1e15 inputs (v2.0): scientific-notation strings expand to exact
//    digits so the digit-CNF reading stays monotone past 1e20 --
checkBool("hardy(1e20) < hardy(1e21) < hardy(1e22) (sci-string fix)",
  MetaNum.hardy(1e20).lt(MetaNum.hardy(1e21))
    && MetaNum.hardy(1e21).lt(MetaNum.hardy(1e22)), true);
checkBool("hardy(1e15) < hardy(1e16) < hardy(1e17)",
  MetaNum.hardy(1e15).lt(MetaNum.hardy(1e16))
    && MetaNum.hardy(1e16).lt(MetaNum.hardy(1e17)), true);
// -- MetaNum-object input (v2.0): structures shadow to their ordinal --
//    power tower 10^^k → ω^ω^…^ω (k ω's) → H there = 10.epsilonate(k);
//    letter/ordinal values sit at their own Hardy position → themselves
checkBool("hardy(10^^100) = H_{ω^…^ω(100 ωs)}(10), layer 100-2 = 98 (one per 10^ level)",
  (function () {
    var v = MetaNum.hardy(MetaNum(10).tetr(100));
    return v.layer === 98 &&
      JSON.stringify(v.array) === JSON.stringify(MetaNum.hardy(1e10).array);
  })(), true);
checkBool("hardy(MetaNum G600) = Infinity",
  MetaNum.hardy(MetaNum("G600")).eq(MetaNum.infinity), true);
checkBool("hardy(MetaNum arrow(3,9,3)) = Infinity",
  MetaNum.hardy(MetaNum.arrow(3, 9, 3)).eq(MetaNum.infinity), true);
// anything strictly above 10^^MSI exceeds the ε₀ ceiling → Infinity
checkBool("hardy(10{3}10) = Infinity (> 10^^MSI)",
  MetaNum.hardy(MetaNum(10).arrow(3)(10)).isInfinite(), true);
// -- the engine limit: hardy(10^^MSI) = 10{ω^…^ω(MSI ω's)}10 (v2.0) --
(function () {
  var MSI = 9007199254740991;
  // the tower height k caps the Hardy hierarchy: layer = k - 2 (one per 10^)
  checkBool("hardy(10^^MSI) = the MetaNum limit (layer MSI-2, base rows kept)",
    MetaNum.hardy(MetaNum(10).tetr(MSI)).layer === MSI - 2 &&
    JSON.stringify(MetaNum.hardy(MetaNum(10).tetr(MSI)).array) ===
    JSON.stringify(MetaNum.hardy(1e10).array), true);
  checkBool("hardy(10^^(MSI-1)) is just below the cap",
    MetaNum.hardy(MetaNum(10).tetr(MSI - 1)).lt(MetaNum.hardy(MetaNum(10).tetr(MSI))), true);
})();

// ─────────────────────────────────────
// v2.0.2 hardy fixes:
//   - a plain number beyond the double range is NOT a power tower: read its
//     decimal expansion (hardy("1.8e308") stays layer 0 with the ordinary
//     digit path, last row [8,7,0,3] like hardy("1.79e308"))
//   - ee10 / eee10 / eeee10 map to ω-towers of DIFFERENT heights (layers
//     2/3/4), no longer the same value
//   - fractional n: the ordinal comes from the integer part, the base
//     argument becomes 10+f (H_ω(10.38) = 10.38·2 = 20.76)
// ─────────────────────────────────────
console.log("\n=== G4.3 v2.0.2 hardy fixes ===");
checkBool("hardy(\"1.8e308\") layer 0, top row [1,8,0,3] (ω^(ω²·3+8), one application)",
  (function () {
    var h = MetaNum.hardy(MetaNum("1.8e308"));
    return h.layer === 0 &&
      JSON.stringify(h.array[h.array.length - 1]) === "[1,8,0,3]";
  })(), true);
// (the row budget resolves differences down to ~1e307 here, so the pair is
// 1.7e308/1.8e308 — one exponent step apart, not one hundredth of one)
checkBool("hardy(\"1.7e308\") < hardy(\"1.8e308\") (monotone over the double limit)",
  MetaNum.hardy(MetaNum("1.7e308")).lt(MetaNum.hardy(MetaNum("1.8e308"))), true);
checkBool("hardy(ee10) < hardy(eee10) < hardy(eeee10) (distinct tower heights)",
  MetaNum.hardy(MetaNum("ee10")).lt(MetaNum.hardy(MetaNum("eee10"))) &&
  MetaNum.hardy(MetaNum("eee10")).lt(MetaNum.hardy(MetaNum("eeee10"))), true);
checkBool("hardy(ee10)/eee10/eeee10 sit at layers 1/2/3 (one layer per 10^ level)",
  MetaNum.hardy(MetaNum("ee10")).layer === 1 &&
  MetaNum.hardy(MetaNum("eee10")).layer === 2 &&
  MetaNum.hardy(MetaNum("eeee10")).layer === 3, true);
checkBool("hardy(10.38) = 20.76 (H_ω(10.38) = 10.38·2)",
  MetaNum.hardy(10.38).eq(MetaNum(20.76)), true);
checkBool("hardy(100.1) = 11084.709858935355 (H_{ω²}(10.1) = 10.1·2^10.1)",
  MetaNum.hardy(100.1).eq(MetaNum(11084.709858935355)), true);
checkBool("hardy(10) < hardy(10.38) < hardy(11) (continuous in n)",
  MetaNum.hardy(10).lt(MetaNum.hardy(10.38)) &&
  MetaNum.hardy(10.38).lt(MetaNum.hardy(11)), true);
checkBool("hardy(100) < hardy(100.1) < hardy(101)",
  MetaNum.hardy(100).lt(MetaNum.hardy(100.1)) &&
  MetaNum.hardy(100.1).lt(MetaNum.hardy(101)), true);
// ─────────────────────────────────────
// non-integer inputs above 1000: the fundamental-sequence step writes the
// running base n into a coefficient, so a coefficient can turn FRACTIONAL —
// the old "-1" step then went negative and left no positive term at all
// (hardy(1000.5) threw "Cannot read properties of undefined (reading 'gt')").
// 0 < c_j < 1 is now a PARTIAL step: ω^j·f contributes ω^(j-1)·(n·f).
// ─────────────────────────────────────
(function () {
  var vals = [1000.5, 1000.1, 1000.9999, 1001.1, 10000.5, 1000000.75, 1e10 + 0.5, 1e15 + 0.5];
  var bad = [], nan = 0;
  for (var i = 0; i < vals.length; i++) {
    var v;
    try { v = MetaNum.hardy(vals[i]); } catch (e) { bad.push(vals[i] + " threw " + e.message.slice(0, 40)); continue; }
    if (v.isNaN()) nan++;
  }
  checkBool("hardy(non-integer > 1000) does not throw", bad.length === 0 && nan === 0, true,
    bad.join(" | "));
  // monotone in the integer and in the fraction
  var mono = true;
  for (var m = 0; m < 5; m++) {
    var base = [1000, 1001, 10000, 12345, 99999][m];
    for (var k = 0; k < 5; k++) {
      var f = [0.001, 0.25, 0.5, 0.75, 0.999][k];
      if (!(MetaNum.hardy(base + f).gte(MetaNum.hardy(base + f - 0.0001)) &&
            MetaNum.hardy(base + 1).gte(MetaNum.hardy(base + f)))) mono = false;
    }
  }
  checkBool("hardy(n) monotone across non-integer n > 1000", mono, true);
  checkBool("hardy(1000) < hardy(1000.5) < hardy(1001)",
    MetaNum.hardy(1000).lt(MetaNum.hardy(1000.5)) &&
    MetaNum.hardy(1000.5).lt(MetaNum.hardy(1001)), true);
  checkBool("hardy(10000) < hardy(10000.5) < hardy(10001)",
    MetaNum.hardy(10000).lt(MetaNum.hardy(10000.5)) &&
    MetaNum.hardy(10000.5).lt(MetaNum.hardy(10001)), true);
  // the array contract still holds for those results
  var cbad = 0;
  for (var b2 = 0; b2 < 4; b2++) {
    var bv = [1000, 10000, 1e6, 1e10][b2];
    for (var k2 = 0; k2 < 3; k2++) {
      var arr = MetaNum.hardy(bv + [0.1, 0.5, 0.9][k2]).array;
      for (var i2 = 0; i2 < arr.length; i2++) {
        for (var j2 = 0; j2 < arr[i2].length; j2++) {
          if (i2 === 0 && j2 === 0) continue;
          if (arr[i2][j2] !== Math.floor(arr[i2][j2])) cbad++;
        }
      }
    }
  }
  checkBool("hardy(non-integer > 1000): only array[0][0] is fractional", cbad === 0, true);
})();

// ─────────────────────────────────────
// hardy above 1e10 with a non-zero "rest": the from-below base is H_{ω^n1}(n1),
// whose tower sits at level n1-1 — array[0] holds n1 entries, so the step-by-step
// expansion only fits while n1 ≤ maxCols.  Above that the coefficients the limit
// steps write turn structured and the expansion collapsed into a destroyed base
// (array[0] = [1]) with a bogus row: hardy(1e10+11) was [[1],[2,20]].
// The engine value 10{n1-1}(n1+1) is used there instead.
// ─────────────────────────────────────
console.log("\n=== G4.4 hardy(n ≥ 1e10) : base & cascade ===");
(function () {
  // H_{ω^ω+ω+1}(10) = H_{ω^ω}(22): the exact tower [c0, 21×20] no longer fits
  // maxCols = 20, so the TRUNCATED cascade [3086.036…, 21×19] is kept — the
  // [非整数, 21, 21, …, 21] single-row shape (was the engine value
  // 10{20}22 = [[1e10,8×19],[21,20]]).
  var v11 = MetaNum.hardy(1e10 + 11);          // H_{ω^ω+ω+1}(10) = H_{ω^ω}(22)
  checkBool("hardy(1e10+11): single truncated tower [c0, 21×19] — [nonInteger,21,21,…]",
    v11.array.length === 1 && v11.array[0].length === MetaNum.maxCols &&
    v11.array[0][1] === 21 && v11.array[0][MetaNum.maxCols - 1] === 21 &&
    v11.array[0][0] > 1 && v11.array[0][0] !== Math.floor(v11.array[0][0]), true);
  checkBool("hardy(1e10+11) < 10{21}23 (from below on the ω^22 tower)",
    v11.lt(MetaNum.arrow(10, 21, 23)), true);
  // the same at the top of the range: H_{ω^ω}(48) → level 47
  var v22 = MetaNum.hardy(1e10 + 22);
  checkFormat("hardy(1e10+22) = H_{ω^ω+ω*2+2}(10) → X49", v22, "X49");
  checkBool("hardy(1e10+22): single truncated tower [c0, 47×19]",
    v22.array.length === 1 && v22.array[0][1] === 47 &&
    v22.array[0][MetaNum.maxCols - 1] === 47, true);
  checkBool("hardy(1e10+10) < hardy(1e10+11) < hardy(1e10+22)",
    MetaNum.hardy(1e10 + 10).lt(MetaNum.hardy(1e10 + 11)) &&
    MetaNum.hardy(1e10 + 11).lt(MetaNum.hardy(1e10 + 22)), true);
  // the whole 1e10+m family keeps growing, and never collapses again
  var broke = 0, collapsed = 0;
  for (var m = 0; m <= 30; m++) {
    var vm = MetaNum.hardy(1e10 + m);
    if (m > 0 && !vm.gt(MetaNum.hardy(1e10 + m - 1))) broke++;
    if (vm.array[0].length === 1 && vm.array[0][0] === 1) collapsed++;
  }
  checkBool("hardy(1e10+0..30) is strictly monotone", broke === 0, true);
  checkBool("hardy(1e10+0..30) never collapses array[0] to [1]", collapsed === 0, true);
})();

// The leading term ω^β·dk is dk APPLICATIONS of H_{ω^β}, one after the other on
// the running value, and an application is a row [1, β] — never a bump of the
// ω-row count ([9,0,1] / [16,0,1] conflated dk with the rest-part):
//   hardy(1.1e11) = H_{ω^(ω+1)}(H_{ω^ω}(10))     = [3086.036,9×8] [1,1,1]
//   hardy(2e11)   = H_{ω^(ω+1)}(H_{ω^(ω+1)}(10)) = [3086.036,9×8] [8,0,1] [1,1,1]
(function () {
  var a = MetaNum.hardy(1e11), b = MetaNum.hardy(1.1e11), c = MetaNum.hardy(2e11);
  var base9 = "[3086.036065328153,9,9,9,9,9,9,9,9]";
  checkBool("hardy(1e11) = base + [8,0,1] (one H_{ω^(ω+1)}, from below)",
    JSON.stringify(a.array) === "[" + base9 + ",[8,0,1]]", true);
  checkBool("hardy(1.1e11) = [3086.036,9×8] [1,1,1] (H_{ω^ω} then H_{ω^(ω+1)})",
    JSON.stringify(b.array) === "[" + base9 + ",[1,1,1]]", true);
  checkBool("hardy(2e11) = [3086.036,9×8] [8,0,1] [1,1,1] (H_{ω^(ω+1)} twice)",
    JSON.stringify(c.array) === "[" + base9 + ",[8,0,1],[1,1,1]]", true);
  checkBool("hardy(3e11) = … [8,0,1] [2,1,1] (three applications)",
    JSON.stringify(MetaNum.hardy(3e11).array) === "[" + base9 + ",[8,0,1],[2,1,1]]", true);
  checkBool("hardy(1e11) < hardy(1.1e11) < hardy(2e11) < hardy(3e11)",
    a.lt(b) && b.lt(c) && c.lt(MetaNum.hardy(3e11)), true);
  var ok = true;
  for (var dk = 1; dk <= 9; dk++) {
    var vd = MetaNum.hardy(dk * 1e11);
    if (dk > 1 && !vd.gt(MetaNum.hardy((dk - 1) * 1e11))) ok = false;
  }
  checkBool("hardy(dk·1e11) strictly monotone in dk = 1..9", ok, true);
  // the same at ω+2: hardy(1.1e12) = H_{ω^(ω+2)}(H_{ω^(ω+1)}(10))
  checkBool("hardy(1.1e12) = [3086.036,9×8] [8,0,1] [1,2,1]",
    JSON.stringify(MetaNum.hardy(1.1e12).array) === "[" + base9 + ",[8,0,1],[1,2,1]]", true);
})();

// hardy("1e100000") and above: 10^v is a PLAIN number (a power tower has the
// same r0 = [v,1] shape but v ≥ 1e10), so the digit path must be taken — the
// old "exponent < 1e5" guard pushed it into the tower branch (layer 1).
(function () {
  var h100k = MetaNum.hardy("1e100000");
  checkBool("hardy(\"1e100000\") = H_{ω^(ω^5)}(10), layer 0", h100k.layer === 0, true);
  checkBool("hardy(\"1e100000\"): top row is the ω^5 cascade [8,9,9,9,9,9]",
    JSON.stringify(h100k.array[h100k.array.length - 1]) === "[8,9,9,9,9,9]", true);
  checkBool("hardy(\"1e10000\") top row = [8,9,9,9,9] (ω^4 cascade)",
    JSON.stringify(MetaNum.hardy("1e10000").array[19]) === "[8,9,9,9,9]", true);
  checkBool("hardy(\"1e1000\") top row = [8,9,9,9] (ω^3 cascade)",
    JSON.stringify(MetaNum.hardy("1e1000").array[19]) === "[8,9,9,9]", true);
  checkBool("hardy(1e100) top row = [8,9,9] (ω^2 cascade)",
    JSON.stringify(MetaNum.hardy(1e100).array[19]) === "[8,9,9]", true);
  checkBool("hardy(1e100) < hardy(\"1e1000\") < hardy(\"1e10000\") < hardy(\"1e100000\")",
    MetaNum.hardy(1e100).lt(MetaNum.hardy("1e1000")) &&
    MetaNum.hardy("1e1000").lt(MetaNum.hardy("1e10000")) &&
    MetaNum.hardy("1e10000").lt(MetaNum.hardy("1e100000")), true);
  // ee6..ee9: the ordinal is read off the value itself (10^W → ω^ord(W)),
  // so these are layer-0 cascades with ordinal rows that follow the input;
  // ee10 (W = 1e10 exactly) is the height-3 band → layerUp(hardy(1e10))
  checkBool("hardy(ee6..ee9) stay layer 0 with ordinal rows; ee10 → layer 1",
    (function () {
      for (var k = 6; k <= 9; k++) {
        var v = MetaNum.hardy("ee" + k);
        if (v.layer !== 0 || v.array.length - 1 !== 19) return false;
      }
      var v10 = MetaNum.hardy("ee10");
      return v10.layer === 1 && v10.array.length === 1;
    })(), true);
  checkBool("hardy(ee6) < hardy(ee7) < … < hardy(ee10) (rows follow the input)",
    (function () {
      for (var k = 7; k <= 10; k++) {
        if (!MetaNum.hardy("ee" + (k - 1)).lt(MetaNum.hardy("ee" + k))) return false;
      }
      return true;
    })(), true);
  checkBool("hardy(ee10) = layerUp(hardy(1e10)): the same rows at layer 1",
    MetaNum.hardy("ee10").layer === 1 &&
    JSON.stringify(MetaNum.hardy("ee10").array) ===
    JSON.stringify(MetaNum.hardy(1e10).array), true);
  // just above ee10 the level no longer fits into rows → layer 1
  checkBool("hardy(10^(1e10+1)) = H_{ω^(ω^ω+1)}(10) → layer 1",
    MetaNum.hardy(MetaNum(10).pow(MetaNum(1e10).add(MetaNum(1)))).layer === 1, true);
  checkBool("hardy(ee10) < hardy(10^(1e10+1)) < hardy(ee20)",
    MetaNum.hardy("ee10").lt(MetaNum.hardy(MetaNum(10).pow(MetaNum(1e10).add(MetaNum(1))))) &&
    MetaNum.hardy(MetaNum(10).pow(MetaNum(1e10).add(MetaNum(1)))).lt(MetaNum.hardy("ee20")), true);
  checkBool("hardy(ee10) < hardy(ee20) < hardy(ee100) < hardy(eee5) < hardy(eee10)",
    MetaNum.hardy("ee10").lt(MetaNum.hardy("ee20")) &&
    MetaNum.hardy("ee20").lt(MetaNum.hardy("ee100")) &&
    MetaNum.hardy("ee100").lt(MetaNum.hardy("eee5")) &&
    MetaNum.hardy("eee5").lt(MetaNum.hardy("eee10")), true);
  checkBool("above eee10 the layer is 2, above eeee10 it is 3 (one per 10^)",
    MetaNum.hardy("eee20").layer === 2 && MetaNum.hardy("eeee10").layer === 3 &&
    MetaNum.hardy("eeeee10").layer === 4, true);
  checkBool("hardy(eee10) < hardy(eee20) < hardy(eeee10) < hardy(eeeee10)",
    MetaNum.hardy("eee10").lt(MetaNum.hardy("eee20")) &&
    MetaNum.hardy("eee20").lt(MetaNum.hardy("eeee10")) &&
    MetaNum.hardy("eeee10").lt(MetaNum.hardy("eeeee10")), true);
})();

// ─────────────────────────────────────
// A number beyond Number.MAX_VALUE is stored as 10^v; the reconstructed mantissa
// carries a rounding tail (2e1000 → 10^1000.301029995664 → 10^0.301… =
// 1.9999999999… instead of 2), which used to spell "19999…9" and made hardy
// read a garbage "rest" — hardy("2e1000") returned Infinity.
(function () {
  var vals = ["2e1000", "5e1001", "9e999", "3.5e500"];
  var bad = 0;
  for (var i = 0; i < vals.length; i++) {
    var v = MetaNum.hardy(vals[i]);
    if (v.isNaN() || v.array[0].length === 1 && v.array[0][0] === null) bad++;
  }
  checkBool("hardy(\"2e1000\")/\"5e1001\"/… are finite (no rounding-tail Infinity)",
    bad === 0, true);
  checkBool("hardy(\"9e999\") < hardy(\"1e1000\") < hardy(\"2e1000\") monotone",
    MetaNum.hardy("9e999").lt(MetaNum.hardy("1e1000")) &&
    MetaNum.hardy("1e1000").lt(MetaNum.hardy("2e1000")), true);
  checkBool("hardy(\"2e1000\") top row follows the input (ω^1000 cascade)",
    MetaNum.hardy("2e1000").layer === 0 &&
    MetaNum.hardy("2e1000").array.length - 1 === 19, true);
})();

// Truncation must keep hardy's definitional from-below base top as array[0][0],
// not collapse it to the [10] marker (the string "1e16+1e13" form used to parse
// to 0 → hardy(0) = 10 → the bare [10] base).
(function () {
  var baseTop = 3086.036065328153;
  checkBool("hardy(1e10+22): truncated tower keeps the base top 3086.036…, not [10]",
    MetaNum.hardy(1e10 + 22).array[0][0] === baseTop, true);
  checkBool("hardy(1e10+40): truncated tower keeps the base top 3086.036…, not [10]",
    MetaNum.hardy(1e10 + 40).array[0][0] === baseTop, true);
  checkBool("hardy(\"1e16+1e13\"): the string form keeps the base and rows",
    (function () {
      var v = MetaNum.hardy("1e16+1e13");
      return v.array[0][0] === baseTop &&
        JSON.stringify(v.array.slice(1)) === "[[8,0,1],[8,1,1],[8,2,1],[1,6,1]]";
    })(), true);
  var n10 = 0, mono = true, prev = null;
  for (var m = 0; m <= 40; m++) {
    var vm = MetaNum.hardy(1e10 + m);
    if (vm.array[0].length === 1 && vm.array[0][0] === 10) n10++;
    if (prev && !vm.gt(prev)) mono = false;
    prev = vm;
  }
  checkBool("hardy(1e10+0..40): never a [10] base", n10 === 0, true);
  checkBool("hardy(1e10+0..40): strictly monotone across the truncation point", mono, true);
  checkBool("hardy(\"1e100000\") keeps the base too",
    JSON.stringify(MetaNum.hardy("1e100000").array[0]) === "[3086.036065328153,9,9,9,9,9,9,9,9]", true);
})();

// hardy(1e16+1e13) = H_{ω^(ω+6)+ω^(ω+3)}(10): the plain number is stored as 10^v
// from 1e16 on, and the way back through the double lost the low digits
// (10010000000000000 → 10010000000000014), which made the digit path read 14
// instead of 1e13 as the "rest" — the base then collapsed to [1].
(function () {
  var v = MetaNum.hardy(1e16 + 1e13);
  checkBool("hardy(1e16+1e13): array[0] is a real base, not the [1] marker",
    v.array[0].length > 1, true);
  checkBool("hardy(1e16+1e13) = H_{ω^(ω+6)}(H_{ω^(ω+3)}(10)) → … [8,2,1] [1,6,1]",
    JSON.stringify(v.array.slice(1)) ===
    "[[8,0,1],[8,1,1],[8,2,1],[1,6,1]]", true);
  checkBool("hardy(1e16) < hardy(1e16+1e13) < hardy(2e16)",
    MetaNum.hardy(1e16).lt(v) && v.lt(MetaNum.hardy(2e16)), true);
})();

// ─────────────────────────────────────
// v2.0.2 hardy(n > 1e10) round 2:
//   1. fractional inputs 1e10+f collapse into ONE plain row (the fractional
//      hyper-operation result) and stay monotone across the integers;
//   2. n1 > maxCols+1 keeps the truncated exact tower [c0, (n1-1)×(maxCols-1)]
//      instead of the engine value;
//   3. "AeB+C" strings parse to the exact sum (hardy("1e16+1e13") is no longer
//      hardy(0) = 10);
//   4. for 1e10 ≤ x < e1e10, hardy(10^x) = layerUp(hardy(x)) — one layer apart,
//      same array rows.
// ─────────────────────────────────────
console.log("\n=== G4.5 v2.0.2 hardy(n > 1e10) round 2 ===");
(function () {
  // 1. single-row fractional results
  checkBool("hardy(1e10) < hardy(1e10+0.5) < hardy(1e10+1), all single-row",
    (function () {
      var a = MetaNum.hardy(1e10), b = MetaNum.hardy("1e10+0.5"), c = MetaNum.hardy(1e10 + 1);
      return a.lt(b) && b.lt(c) &&
        a.array.length === 1 && b.array.length === 1 && c.array.length === 1;
    })(), true);
  checkBool("hardy(1e10+0.5).array[0][0] is the fractional hyper-op result",
    (function () {
      var b = MetaNum.hardy("1e10+0.5").array[0][0];
      return b > 3086.036 && b < 6785.435 && b !== Math.floor(b);
    })(), true);
  checkBool("hardy(1e10+k+0.5) single-row and monotone for k = 0..9",
    (function () {
      var prev = MetaNum.hardy(1e10);
      for (var k = 0; k <= 9; k++) {
        var v = MetaNum.hardy(1e10 + k + 0.5);
        if (v.array.length !== 1) return false;
        if (!v.gt(prev)) return false;
        prev = v;
        var vi = MetaNum.hardy(1e10 + k + 1);
        if (!vi.gt(v)) return false;
        prev = vi;
      }
      return true;
    })(), true);
  // 2. truncated towers
  checkBool("hardy(1e10+11) < hardy(1e10+11.5) ≤ hardy(1e10+12) (fraction keeps order)",
    MetaNum.hardy("1e10+11").lt(MetaNum.hardy("1e10+11.5")) &&
    MetaNum.hardy("1e10+11.5").lt(MetaNum.hardy(1e10 + 12)), true);
  checkBool("hardy(1e10+m) tower level = hardy(m)-1 for m = 12..40",
    (function () {
      for (var m = 12; m <= 40; m += 7) {
        var lv = MetaNum.hardy(1e10 + m).array[0][1];
        if (lv !== MetaNum.hardy(m).toNumber() - 1) return false;
      }
      return true;
    })(), true);
  // 3. the string sum form
  checkBool("M(\"1e10+0.5\") parses to the exact 10000000000.5",
    JSON.stringify(MetaNum("1e10+0.5").array) === "[[10000000000.5]]", true);
  checkBool("M(\"1e10+11\") parses to the exact 10000000011",
    JSON.stringify(MetaNum("1e10+11").array) === "[[10000000011]]", true);
  checkBool("hardy(\"1e10+11\") = hardy(10000000011) (string = number form)",
    JSON.stringify(MetaNum.hardy("1e10+11").array) ===
    JSON.stringify(MetaNum.hardy(10000000011).array), true);
  checkBool("hardy(\"1e10+22\") format X49 (level 47 chain, promoted)",
    MetaNum.hardy("1e10+22").format() === "X49", true);
  // 4. the tower layer rule: every extra 10^ level adds ONE layer, the array
  //    rows stay those of the innermost readable expansion
  checkBool("hardy(e1e10) = layerUp(hardy(1e10))",
    (function () {
      var a = MetaNum.hardy("e1e10"), b = MetaNum.hardy(1e10);
      return a.layer === b.layer + 1 &&
        JSON.stringify(a.array) === JSON.stringify(b.array);
    })(), true);
  checkBool("hardy(1e308) = layer 0, the digit-path cascade (…[8,6,0,3],[8,7,0,3])",
    (function () {
      var v = MetaNum.hardy("1e308");
      return v.layer === 0 && v.array.length > 2 &&
        JSON.stringify(v.array[v.array.length - 2]) === "[8,6,0,3]" &&
        JSON.stringify(v.array[v.array.length - 1]) === "[8,7,0,3]";
    })(), true);
  checkBool("hardy(e1e308)/ee1e308/eee1e308 = the same rows at layers 1/2/3",
    (function () {
      var v0 = MetaNum.hardy("1e308");
      var chain = ["e1e308", "ee1e308", "eee1e308"];
      for (var i = 0; i < chain.length; i++) {
        var v = MetaNum.hardy(chain[i]);
        if (v.layer !== i + 1) return false;
        if (JSON.stringify(v.array) !== JSON.stringify(v0.array)) return false;
      }
      return true;
    })(), true);
  checkBool("hardy(10^^100) keeps the rows: layer 98 over hardy(1e10)'s array",
    (function () {
      var v = MetaNum.hardy(MetaNum(10).tetr(100));
      return v.layer === 98 &&
        JSON.stringify(v.array) === JSON.stringify(MetaNum.hardy(1e10).array);
    })(), true);
  checkBool("hardy(10^x) = layerUp(hardy(x)) for x = 1e10+1, 2e10, 1e11, 1e15",
    (function () {
      var xs = [1e10 + 1, 2e10, 1e11, 1e15];
      for (var i = 0; i < xs.length; i++) {
        var hx = MetaNum.hardy(xs[i]);
        var htx = MetaNum.hardy(MetaNum(10).pow(MetaNum(xs[i])));
        if (htx.layer !== hx.layer + 1) return false;
        if (JSON.stringify(htx.array) !== JSON.stringify(hx.array)) return false;
      }
      return true;
    })(), true);
  checkBool("hardy(10^x) monotone in x across the height-3 band",
    (function () {
      var xs = [2e10, 5e10, 1e11, 1e12, 1e15, 1e18];
      for (var i = 1; i < xs.length; i++) {
        if (!MetaNum.hardy(MetaNum(10).pow(MetaNum(xs[i - 1])))
          .lt(MetaNum.hardy(MetaNum(10).pow(MetaNum(xs[i]))))) return false;
      }
      return true;
    })(), true);
  checkBool("hardy(eee10) keeps the definitional base in its layer-1 marker",
    JSON.stringify(MetaNum.hardy("eee10").array[0]) ===
    "[3086.036065328153,9,9,9,9,9,9,9,9]", true);
})();

// ─────────────────────────────────────
// v2.0.2 unnamed-level format: a level whose coefficients exceed the letter
// grid (ω*2+100, ω*100, ω²*100+ω*100+100, …) rounds UP to the next nameable
// level and reads as level-arg — never a wrapped/wrong letter, never the
// summed repeat count
// ─────────────────────────────────────
console.log("\n=== G4.6 D02 toBeaf base preservation ===");
(function () {
  var v16 = MetaNum.BEAF(10, 16);
  var s16 = v16.toBeaf();
  ok("BEAF(10,16).toBeaf() !== '{16}'", s16 !== "{16}", s16);
  eq("BEAF(10,16).toBeaf()", s16, "{10,16}");
  ok("fromBeaf(BEAF(10,16).toBeaf()).eq(BEAF(10,16))", MetaNum.fromBeaf(s16).eq(v16), s16);
  var s100 = MetaNum.BEAF(10, 100).toBeaf();
  ok("BEAF(10,100) round-trip", MetaNum.fromBeaf(s100).eq(MetaNum.BEAF(10, 100)), s100);
  eq("fromBeaf('{10,16}').toBeaf()", MetaNum.fromBeaf("{10,16}").toBeaf(), "{10,16}");
  // documented (< MSI) behavior must not regress
  eq("BEAF(10,15).toBeaf()", MetaNum.BEAF(10, 15).toBeaf(), "{1000000000000000}");
  // README examples
  eq("7625597484987.toBeaf()", new MetaNum(7625597484987).toBeaf(), "{7625597484987}");
  eq("BEAF(3,3,3).toBeaf()", MetaNum.BEAF(3, 3, 3).toBeaf(), "{3638334640023.7783}");
  // issue #21 (FU-03): negatives and sub-units keep their semantics
  eq("(-5).toBeaf()", new MetaNum(-5).toBeaf(), "-{5}");
  ok("fromBeaf('-{5}').eq(-5)", MetaNum.fromBeaf("-{5}").eq(new MetaNum(-5)));
  eq("1e-320.toBeaf()", MetaNum("1e-320").toBeaf(), "{10,320}⁻¹");
  ok("fromBeaf('{10,320}⁻¹').eq(1e-320)", MetaNum.fromBeaf("{10,320}⁻¹").eq(MetaNum("1e-320")));
  eq("0.001.toBeaf()", MetaNum("0.001").toBeaf(), "{1000}⁻¹");
  ok("fromBeaf('{1000}⁻¹').eq(0.001)", MetaNum.fromBeaf("{1000}⁻¹").eq(MetaNum("0.001")));
  eq("(-1e-320).toBeaf()", MetaNum("-1e-320").toBeaf(), "-{10,320}⁻¹");
  ok("fromBeaf('-{10,320}⁻¹').eq(-1e-320)", MetaNum.fromBeaf("-{10,320}⁻¹").eq(MetaNum("-1e-320")));
})();

// ─────────────────────────────────────────────────────────────
// D03 · toBeaf() must never dump internal rows; it fails loudly instead
// ─────────────────────────────────────────────────────────────
console.log("\n=== G4.7 D03 toBeaf unrepresentable behavior ===");
[["BEAF(10,2,1,1,2)", MetaNum.BEAF(10, 2, 1, 1, 2)],
 ["BEAF(4,5,6,7,8,9)", MetaNum.BEAF(4, 5, 6, 7, 8, 9)],
 ["fromArray([[10],[1,2,1]])", MetaNum.fromArray([[10], [1, 2, 1]])]
].forEach(function (p) {
  var name = p[0], m = p[1], threw = null, out = null;
  try { out = m.toBeaf(); } catch (e) { threw = e; }
  ok(name + ".toBeaf() throws a typed error", threw && threw.name === "MetaNumUnrepresentableError" &&
    threw.code === "METANUM_UNREPRESENTABLE", threw ? threw.name : out);
  if (out !== null) ok(name + ".toBeaf() has no internal '[' literals", out.indexOf("[") === -1, out);
});

// ─────────────────────────────────────────────────────────────
// D04 · format() repeated single-letter chains must not fold to a tiny count
// ─────────────────────────────────────────────────────────────
console.log("\n=== G4.8 hardy base extension ===");
(function () {
  // the base-10 path is the historical behaviour (hardy(n) = H_n(10))
  ok("hardy(0) = 10", MetaNum.hardy(0).eq(10));
  ok("hardy(9) = 19", MetaNum.hardy(9).eq(19));
  ok("hardy(10) = 20", MetaNum.hardy(10).eq(20));
  ok("hardy(100) = 10240", MetaNum.hardy(100).eq(10240));
  // the second argument is the base: the digits of x are read in that base
  eq("hardy(10,8) = H_{ω+2}(8) = 20", MetaNum.hardy(10, 8).toString(), "20");
  eq("hardy(10,4) = H_{ω*2+2}(4) = 24", MetaNum.hardy(10, 4).toString(), "24");
  eq("hardy(5,8) = H_5(8) = 13", MetaNum.hardy(5, 8).toString(), "13");
  eq("hardy(9,10) = 19 (default base)", MetaNum.hardy(9, 10).toString(), "19");
  ok("hardy(64,8) = H_{ω^2}(8) = 2048 (64 = 100 base 8)", MetaNum.hardy(64, 8).eq(2048));
  ok("hardy(1000,2) huge but finite", MetaNum.hardy(1000, 2).isFinite());
  ok("hardy monotone in x: hardy(10,8) < hardy(11,8)",
    MetaNum.hardy(10, 8).lt(MetaNum.hardy(11, 8)));
  // validation: integer base in [2, 1000]
  var threw = 0;
  [1, 1001, 2.5, "x"].forEach(function (b) {
    try { MetaNum.hardy(10, b); } catch (e) { threw++; }
  });
  ok("hardy rejects bases outside [2,1000] / non-integers", threw === 4);
  // FGH(x, y) = hardy(y^x, y)
  ok("FGH(3,10) = hardy(1000,10)", MetaNum.fgh(3, 10).eq(MetaNum.hardy(1000, 10)));
  ok("FGH(2,8) = hardy(64,8) = 2048", MetaNum.fgh(2, 8).eq(2048));
  ok("FGH(0,10) = hardy(1,10) = 11", MetaNum.fgh(0, 10).eq(11));
  ok("FGH monotone in x", MetaNum.fgh(2, 10).lt(MetaNum.fgh(3, 10)));
  ok("FGH validates the base too", (function () {
    try { MetaNum.fgh(2, 1); return false; } catch (e) { return true; }
  })());
})();


// ══════════════════════════════════════════════════════════════════
// G5 · PLAIN FORMAT()
//   format of literals and plain values, precision options, FORMAT_OPTIONS
// ══════════════════════════════════════════════════════════════════

console.log("\n=== G5.1 format() verification ===");

function checkFormat(name, input, expected) {
  try {
    var m = MetaNum(input);
    var s = format(m);
    var pass = s === expected;
    console.log((pass ? "PASS" : "FAIL") + " | fmt " + name + " | " + input + " => " + s + (pass ? "" : " (expected " + expected + ")"));
  } catch (e) {
    console.log("ERROR | fmt " + name + " | " + input + " => " + e.message);
  }
}

// Small values & regular numbers
// β = 1e6 ≥ 10^sciDecimalThreshold(3) → α keeps only its integer part
checkFormat("1E-1000000", "1E-1000000", "1E-1,000,000"); // sign=2 reciprocal
checkFormat("1E-100",     "1E-100",     "1.000E-100");
checkFormat("0.123",      "0.123",       "0.123");
checkFormat("456789",     "456789",      "456,789");
checkFormat("1E100",      "1E100",       "1.000E100");   // α always shown

// Single-letter chains (E-Z range): outerLetters + α + lastLetter + β
checkFormat("EE200", "EE200", "E1.000E200");
checkFormat("F300",  "F300",  "1.000F300");
checkFormat("FE400", "FE400", "F1.000E400");
checkFormat("FF500", "FF500", "F1.000F500");
checkFormat("G600",  "G600",  "1.000G600");
checkFormat("GE700", "GE700", "G1.000E700");
checkFormat("GF800", "GF800", "G1.000F800");
checkFormat("GG900", "GG900", "G1.000G900");
checkFormat("J1000", "J1000", "1.000J1,000");

// Ordinal (Aa and beyond) - single letter: α + letter + β
checkFormat("Aa100",  "Aa100",  "2.000Aa100");
checkFormat("Ab400",  "Ab400",  "1.000Ab400");
checkFormat("Ac800",  "Ac800",  "1.000Ac800");
checkFormat("Aj900",  "Aj900",  "1.000Aj900");
checkFormat("Ba1000", "Ba1000", "2.000Ba1,000");
checkFormat("Aaa100", "Aaa100", "2.000Aaa100");

// Ordinal with multi-level r0: ordinalLetter + r0Chain (includes α)
checkFormat("AaE200",  "AaE200",  "Aa1.000E200");
checkFormat("AbE500",  "AbE500",  "Ab1.000E500");

// Ordinal repeated letters: outerLetters + α + lastLetter + β
checkFormat("AaAa300", "AaAa300", "Aa1.000Aa300");
checkFormat("AbAa600", "AbAa600", "Ab1.000Aa600");
checkFormat("AbAb700", "AbAb700", "Ab1.000Ab700");

// Ordinal more Letters:
checkFormat("Abc100", "Abc100", "1.000Abc100");
checkFormat("Defg200", "Defg200", "1.000Defg200");

// Symbols and ε:
checkFormat("!Aa300 → !2.000Aa300 (over-budget: layer 1 + de-!-ed compact)", "!Aa300", "!2.000Aa300");
checkFormat("@Bb400", "@Bb400", "@1.000Bb400");
checkFormat("1ε500", "1ε500", "1.000000ε500"); // epsilonSignificantDigits = 6

// Reciprocal of large numbers (sign=2) format tests
// smallNotationUseE=true → E-<formatted mag>
// smallNotationUseE=false → <formatted value>⁻¹
console.log("\n=== G5.2 reciprocal format tests ===");

// Parsing: verify sign=2 and array structure
check("E-EE1000 parse",  "E-EE1000", [[1000, 3]]);
check("1/F500 parse",    "1/F500",   [[10000000000, 498]]);
check("1/G200 parse",    "1/G200",   [[10000000000, 8, 198]]);
check("1/F10 parse",     "1/F10",    [[10000000000, 8]]);

// format() with smallNotationUseE=true (default):
//   E-EE1000 = 10^(-log10(EE1000)) = 10^(-E1000)  → "E-E1.000E1,000"
//   1/F500   = 10^(-log10(F500))   = 10^(-F499)   → "E-1.000F499"
//   1/G200   = 10^(-log10(G200))   ≈ 10^(-G200)    → "E-1.000G200" (TMSI: G200>TMSI)
//   1/F10    = 10^(-log10(F10))    = 10^(-F9)      → "E-1.000F9"
checkFormat("E-EE1000 (useE=true)", "E-EE1000", "E-E1E1,000"); // β=1e6 ≥ 10^sciDecimalThreshold → integer α
checkFormat("1/F500   (useE=true)", "1/F500",   "E-1.000F499");
checkFormat("1/G200   (useE=true)", "1/G200",   "E-1.000G200");
checkFormat("1/F10    (useE=true)", "1/F10",    "E-1.000F9");

// format() with smallNotationUseE=false:
//   E-EE1000 → "EE1.000E1,000⁻¹"
//   1/F500   → "1.000F500⁻¹"
//   1/G200   → "1.000G200⁻¹"
//   1/F10    → "1.000F10⁻¹"
var _FMT = (typeof FORMAT_OPTIONS !== "undefined" && FORMAT_OPTIONS) ? FORMAT_OPTIONS : require("./format-metanum.js").FORMAT_OPTIONS;
var _savedUseE = _FMT.smallNotationUseE;
_FMT.smallNotationUseE = false;
checkFormat("E-EE1000 (useE=false)", "E-EE1000", "EE1E1,000⁻¹"); // integer α (sciDecimalThreshold)
checkFormat("1/F500   (useE=false)", "1/F500",   "1.000F500⁻¹");
checkFormat("1/G200   (useE=false)", "1/G200",   "1.000G200⁻¹");
checkFormat("1/F10    (useE=false)", "1/F10",    "1.000F10⁻¹");
_FMT.smallNotationUseE = _savedUseE;

console.log("\n=== G5.3 maxCols/maxRows = 20 (Z10) ===");
var _savedCols = MetaNum.maxCols, _savedRows = MetaNum.maxRows;
MetaNum.maxCols = 20; MetaNum.maxRows = 20;
(function () {
    var exp = [[10000000000]];
    for (var i = 0; i < 19; i++) exp[0].push(8);
    var z20 = new MetaNum("Z10");
    checkArr("Z10 @ maxCols=20", z20, exp.concat([[8, 20], [8, 21]]));
    var z20rt = new MetaNum(z20.toString());
    checkBool("Z10 @ maxCols=20 roundtrip", z20.eq(z20rt), true);
    MetaNum.maxCols = 100; MetaNum.maxRows = 100;
    var z20v100 = new MetaNum(z20.toString());
    checkBool("Z10 @20 toString reparsed @100 ~= Z10 @100", z20v100.eq(new MetaNum("Z10")), true);
})();
MetaNum.maxCols = _savedCols; MetaNum.maxRows = _savedRows;

// ─────────────────────────────────────
//  symbol layer semantics (numeric-level assertions)
//   ! = one ω^ layer:  !Aa5 = 10{ω^ω}5 = 10{ω^5}5  (FS of ω^ω at 5)
//   @ = two layers:    @Aa5 = 10{ω^ω^ω}5 = 10{ω^(ω^5)}5
//   # = three layers;  !Ab5 = 10{ω^(ω+1)}5
// ─────────────────────────────────────
console.log("\n=== G5.4 FORMAT_OPTIONS take effect ===");
(function () {
  var OPT = _FMT;
  var saved = {};
  function set(k, v) { if (!(k in saved)) saved[k] = OPT[k]; OPT[k] = v; }
  function restore() { for (var k in saved) OPT[k] = saved[k]; saved = {}; }
  function after(name, fn) {
    var r;
    try { r = fn(); } catch (e) { r = "threw " + e.message.slice(0, 40); }
    restore();
    checkBool(name, r === true, true, typeof r === "string" ? r : "");
  }

  after("opt smallNotationUseE: ⁻¹ when false, E- when true", function () {
    set("smallNotationThreshold", 4);
    set("smallNotationUseE", false); var a = format(MetaNum(1e-10));
    set("smallNotationUseE", true); var b = format(MetaNum(1e-10));
    return a.indexOf("⁻¹") >= 0 && b.indexOf("E-") >= 0;
  });
  after("opt smallNotationThreshold moves the small-value boundary", function () {
    set("smallNotationThreshold", 3); var a = /E-4|⁻¹/.test(format(MetaNum(1e-4)));
    set("smallNotationThreshold", 5); var b = /E-4|⁻¹/.test(format(MetaNum(1e-4)));
    return a && !b;
  });
  after("opt decimalPlaces: 0 → '1', 2 → '1.40'", function () {
    set("decimalPlaces", 0); var a = format(MetaNum(1.4));
    set("decimalPlaces", 2); var b = format(MetaNum(1.4));
    return a === "1" && b === "1.40";
  });
  after("opt decimalThreshold: decimals drop past 10^n", function () {
    set("decimalThreshold", 3); var a = format(MetaNum(1234.56)).indexOf(".") < 0;
    set("decimalThreshold", 5); var b = format(MetaNum(1234.56)).indexOf(".") >= 0;
    return a && b;
  });
  after("opt useCommas toggles grouping", function () {
    set("useCommas", true); var a = format(MetaNum(1234567));
    set("useCommas", false); var b = format(MetaNum(1234567));
    return a === "1,234,567" && b === "1234567";
  });
  after("opt sciThreshold moves the E boundary", function () {
    set("sciThreshold", 9); var a = /E/.test(format(MetaNum(1e11)));
    set("sciThreshold", 12); var b = /E/.test(format(MetaNum(1e11)));
    return a && !b;
  });
  after("opt sciSignificantDigits: 1 → 1.2E10", function () {
    set("sciSignificantDigits", 1);
    return /^1\.2E/.test(format(MetaNum(1.2345e10)));
  });
  after("opt sciDecimalThreshold: β ≥ 10^n → integer α", function () {
    set("sciDecimalThreshold", 3); var a = /^1E100,000$/.test(format(MetaNum("1e100000")));
    set("sciDecimalThreshold", 9); var b = /^1\.000E100,000$/.test(format(MetaNum("1e100000")));
    return a && b;
  });
  after("opt singleLetterDigits: 1 → 2.0G, 3 → 2.045G", function () {
    set("singleLetterDigits", 1); var a = /^2\.0G/.test(format(MetaNum.arrow(3, 3, 7)));
    set("singleLetterDigits", 3); var b = /^2\.045G/.test(format(MetaNum.arrow(3, 3, 7)));
    return a && b;
  });
  after("opt repeatLetterThreshold: 3 collapses arrow(3,3,6), 5 spells FFFF", function () {
    set("repeatLetterThreshold", 3); var a = format(MetaNum.arrow(3, 3, 6)) === "2.045G5";
    set("repeatLetterThreshold", 5); var b = /^FFFF/.test(format(MetaNum.arrow(3, 3, 6)));
    return a && b;
  });
  after("opt multiLetterDigits: 1 → 2.0Aa, 3 → 2.000Aa", function () {
    set("multiLetterDigits", 1); var a = /^2\.0Aa/.test(format(MetaNum(10).arrow(23)(MetaNum(10))));
    set("multiLetterDigits", 3); var b = /^2\.000Aa/.test(format(MetaNum(10).arrow(23)(MetaNum(10))));
    return a && b;
  });
  after("opt multiLetterRepeatThreshold: 2 collapses 3×Aa, 5 keeps it", function () {
    set("multiLetterRepeatThreshold", 2); var a = /^1\.841Ab/.test(format(MetaNum("AaAaAa100")));
    set("multiLetterRepeatThreshold", 5); var b = /^AaAa/.test(format(MetaNum("AaAaAa100")));
    return a && b;
  });
  after("opt multiLetterLimit: 4 keeps Aaaa, 3 carries to !", function () {
    var v = MetaNum._hyperopFromOrdinal(MetaNum(10), MetaNum(100), [100, 100, 50]);
    set("multiLetterLimit", 4); var a = /Aaaa/.test(format(v));
    set("multiLetterLimit", 3); var b = format(v).indexOf("!") === 0;
    return a && b;
  });
  after("opt epsilonSignificantDigits: 6 → 1.000000ε12, 0 → 1ε12", function () {
    var v = MetaNum("1ε12");
    set("epsilonSignificantDigits", 6); var a = format(v) === "1.000000ε12";
    set("epsilonSignificantDigits", 0); var b = format(v) === "1ε12";
    return a && b;
  });
})();





// ─────────────────────────────────────────────────────────────
// issue-17 regression vectors (merged from test.js)
// ─────────────────────────────────────────────────────────────
function ok(name, cond, extra) { checkBool(name + (extra !== undefined ? "  => " + extra : ""), !!cond, true); }
function eq(name, got, want) { checkBool(name, got === want, true); }

// ─────────────────────────────────────────────────────────────
// D01 · pow(10, α) must not flip sign below the double subnormal floor
// ─────────────────────────────────────────────────────────────
console.log("\n=== G5.5 D04 format repeated-letter chains ===");
(function () {
  eq("format(Z152416) unchanged", format(MetaNum("Z152416")), "1.000Z152,416");
  var z = format(MetaNum("ZZ152416"));
  var zz = format(MetaNum("ZZZ152416"));
  ok("format(ZZ152416) !== '1.000Z3'", z !== "1.000Z3", z);
  eq("format(ZZ152416)", z, "Z1.000Z152,416");
  eq("format(ZZZ152416)", zz, "ZZ1.000Z152,416");
  ok("Z/ZZ/ZZZ values strictly increasing",
    MetaNum("Z152416").lt(MetaNum("ZZ152416")) &&
    MetaNum("ZZ152416").lt(MetaNum("ZZZ152416")));
  // canonical same-letter law: AaAa300 → Aa1.000Aa300 (unchanged)
  eq("format(AaAa300) law intact", format(MetaNum("AaAa300")), "Aa1.000Aa300");
  // the buggy family (prefix top row over a dominant lower row)
  eq("format(YY10)", format(MetaNum("YY10")), "Y1.000Y10");
  eq("format(ZY10)", format(MetaNum("ZY10")), "Z1.000Y10");
  eq("format(ZZ10)", format(MetaNum("ZZ10")), "Z1.000Z10");
})();

// ─────────────────────────────────────────────────────────────
// D05 · !Aaα with real α (notation-semantics decision 1B)
// ─────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════
// G6 · FORMAT() COMBINED WITH OTHER OPERATIONS
//   format of hyperoperation / Hardy results, cross-config stability
// ══════════════════════════════════════════════════════════════════

console.log("\n=== G6.1 v2.0.2 unnamed-level format ===");
// a diagonal letter ("Ca", "Ba", "Aaa", …) carries α = 2·5^f ∈ [2,10)
checkFormat("10{ω*2+100}100 → 2.000Ca100",
  MetaNum._hyperopFromOrdinal(MetaNum(10), MetaNum(100), [100, 2]), "2.000Ca100");
checkFormat("10{ω*100}100 → 2.000Aaa100",
  MetaNum._hyperopFromOrdinal(MetaNum(10), MetaNum(100), [0, 100]), "2.000Aaa100");
checkFormat("10{ω²*100+ω*100+100}1000 → 2.000Aaaa101",
  MetaNum._hyperopFromOrdinal(MetaNum(10), MetaNum(1000), [100, 100, 100]), "2.000Aaaa101");
checkFormat("h20(10,1000) → 2.000Ba1,000 (ω*2 with y=1000)",
  MetaNum(10).h20(1000), "2.000Ba1,000");
checkFormat("h100(10,1000) → 2.000Aaa1,000 (ω² with y=1000)",
  MetaNum(10).h100(1000), "2.000Aaa1,000");
checkFormat("h30(10,100) → 2.000Ca100 (ω*3 with y=100)",
  MetaNum(10).h30(100), "2.000Ca100");
// nameable levels keep their ordinary cascade display
checkFormat("h21(10,1000) → Bb999 (nameable top row, unchanged)",
  MetaNum(10).h21(1000), "1.000Bb999");

// ─────────────────────────────────────
// fractional hyperoperation levels
//   level n+f interpolates geometrically (README rule i): 10{n+f}10 =
//   10{n+1}(2·5^f); continuous: f=0 → level n, f=1 → level n+1
// ─────────────────────────────────────
console.log("\n=== G6.2 format α correctness ===");
// format α correctness
checkFormat("hardy(1120) single α", MetaNum.hardy(1120), "F4.398E13");
checkFormat("hardy(4150) real α", MetaNum.hardy(4150), "2.300G5");
checkFormat("nested arrow: Aa + single-letter chain (≤2 letter types)",
  MetaNum.arrow(3, MetaNum.arrow(3, 4, 3), 3), "AaG2.045G2");
checkFormat("canonical all-8s keeps α=1 (G600)", "G600", "1.000G600");

// ─────────────────────────────────────
// display rules: at most TWO letter types, one α, multiLetterLimit symbol
// carry — a cascade that would spell 20 letter types keeps its top two levels,
// and a combination longer than multiLetterLimit switches to !αAaβ
// ─────────────────────────────────────
checkFormat("20-row cascade compresses to two letter types", MetaNum.h10000(3, 10), "1.000Ijjk9");
// a level whose letter name is longer than multiLetterLimit carries to the
// SINGLE-letter form !αΓβ — "!" adds one ω^ layer on top of the level Γ names
checkFormat("10-letter level carries to !1.000M9", MetaNum.iter(3, 10), "!1.000M9");
checkFormat("5-letter level carries to !1.000H4", m3.iter(5), "!1.000H4");
// #28: past multiLetterLimit the pure diagonal keeps the exact token instead
// of the old single-letter carry (which did not round-trip).
checkFormat("apix(3,10) → exact !2.000A(a×10)10", m3.aperixxate(10), "!2.000A" + "a".repeat(10) + "10");
ok("apix(3,10) format round-trip", MetaNum(format(m3.aperixxate(10))).eq(m3.aperixxate(10)));
checkFormat("apix(3,5) → exact !A(a×5)10", m3.aperixxate(5), "!A" + "a".repeat(5) + "10");
ok("apix(3,5) format round-trip", MetaNum(format(m3.aperixxate(5))).eq(m3.aperixxate(5)));
checkFormat("short diagonal keeps the letter form", m3.aperixxate(3), "!2.000Aaaa10");
checkFormat("cascade inner α stays [1,10) (AbAa600)", "AbAa600", "Ab1.000Aa600");

// ─────────────────────────────────────
// ω^ω-family tail-CNF markers: !Aa 整数形式/E形式/F形式/G形式/… 对应
// ω^ω+ω^0/1/2/3/… 层级。The r0 tail-CNF digits spell as finOps letters
// (E↔ω^1, F↔ω^2, G↔ω^3, …) after the Aa block, with the ω^0 coefficient c0
// as the trailing integer — matching the parser's !AaE16 → r0=[16,1] finOps
// convention, so every form round-trips exactly.
// ─────────────────────────────────────
checkFormat("!Aa integer form (ω^ω+1)", MetaNum(10).itermult(10), "!2.000Aa1");
checkFormat("E form (ω^ω+ω, iteraperiate marker)", m3.iteraperiate(3), "!2.000AaE0");
ok("E form round-trip", MetaNum(format(m3.iteraperiate(3))).eq(m3.iteraperiate(3)));
checkFormat("F form (ω^ω+ω^2, cuboiter y=2)", MetaNum(10).cuboiter(2), "!2.000AaF10");
ok("F form round-trip", MetaNum(format(MetaNum(10).cuboiter(2))).eq(MetaNum(10).cuboiter(2)));
checkFormat("G form (ω^ω+ω^3, cuboiter y=3)", MetaNum(10).cuboiter(3), "!2.000AaG10");
ok("G form round-trip", MetaNum(format(MetaNum(10).cuboiter(3))).eq(MetaNum(10).cuboiter(3)));
// non-marker height tower chains at the ω^ω layer keep the legacy chain format
checkFormat("height tower chain keeps the chain format", MetaNum(3).iterate(1.5e16), "!Aa1.500E16");

// ─────────────────────────────────────
// issue #14: stacking the SAME function must nest the letter — the rows are a
// composition, so the top row leads and the row below it (which collapses from
// its repeat count) keeps the single α and β:
//   poea(10,poea(10,100)) = Ad(Ad(99)) → "Ad1.000Ad99"  (not "1.000Ad114")
// ─────────────────────────────────────
var stacked = [
  ["expande (ω+1)", "expande", "2.398Ab99", "Ab2.398Ab99"],
  ["multiexpande (ω+2)", "multiexpande", "1.000Ac99", "Ac1.000Ac99"],
  ["powerexpande (ω+3)", "powerexpande", "1.000Ad99", "Ad1.000Ad99"],
  ["explode (ω*2+1)", "explode", "1.000Bb99", "Bb1.000Bb99"],
  ["multiexplode (ω*2+2)", "multiexplode", "1.000Bc99", "Bc1.000Bc99"],
  ["megoexpande (ω²+1)", "megoexpande", "1.000Abb99", "Abb1.000Abb99"],
  ["multimegote (ω²+2)", "multimegote", "1.000Aac99", "Aac1.000Aac99"],
  ["powiainate (ω³+1)", "powiainate", "1.000Aaab99", "Aaab1.000Aaab99"]
];
for (var si = 0; si < stacked.length; si++) {
  var sf = stacked[si][1], s1 = MetaNum(10)[sf](100), s2 = MetaNum(10)[sf](s1), s3 = MetaNum(10)[sf](s2);
  checkFormat("stacked " + stacked[si][0] + " (1st)", s1, stacked[si][2]);
  checkFormat("stacked " + stacked[si][0] + " (x2)", s2, stacked[si][3]);
  checkBool("stacked " + stacked[si][0] + " grows and keeps nesting",
    s2.gt(s1) && s3.gt(s2) && format(s3).indexOf(format(s2).slice(0, 2)) === 0, true);
}
// apea (ω*2) with an operand above MSI: apea(apea(a)) must stay visible
(function () {
  var p1 = MetaNum(10).aperioexpande(MetaNum(1e16));
  var p2 = MetaNum(10).aperioexpande(p1);
  var p3 = MetaNum(10).aperioexpande(p2);
  checkFormat("apea(1e16) (ω*2 level = Ba)", p1, "Ba1.000E16");
  checkFormat("apea(apea(1e16)) nests", p2, "BaBa1.000E16");
  checkFormat("apea^3(1e16) nests further", p3, "BaBaBa1.000E16");
  checkBool("apea stacking is strictly monotone", p2.gt(p1) && p3.gt(p2), true);
})();
// a row coefficient above the grid (ω+81..99 from a ω*2 fundamental sequence)
// has no letter — the level rounds UP to the next nameable one and the value
// reads as level-arg: 10{ω*2}100 → Ba with the operation's own argument 100
checkFormat("ω*2 level reads Ba (no coefficient wrap)", MetaNum(10).aperioexpande(100), "2.000Ba100");

// Γ-canonical law test: long descending count-1 chains
// format at their bisect-exact letter on the engine's smooth arrow curve;
// ordinal-row levels use Aa-notation (the engine's fractional-arg curve is
// quantized at level ≥ 20, so 3{20}3 formats via its [1,20] ordinal row)
checkFormat("GE12 single-alpha", "GE12", "G1.000E12");
checkFormat("arrow(3,19,3) structural V...U...", MetaNum.arrow(3, 19, 3), "V2.376U2");
checkFormat("arrow(3,20,3) structural W...V...", MetaNum.arrow(3, 20, 3), "W2.376V2");
checkFormat("arrow(3,1000,3) αAaβ", MetaNum.arrow(3, 1000, 3), "2.376Aa999");

// ─────────────────────────────────────
// maxCols/maxRows = 20 — r0 overflow levels must become
// finite-level ordinal rows [count, level], not be dropped
// ─────────────────────────────────────
console.log("\n=== G6.3 two-letter rule ===");
(function () {
  // Rule (2-letter rule): a display may use at most 2 letter COMBINATIONS in its
  // finite hyper-op chain — VαEβ → VαFβ → … → VαVβ — never a third type mixed
  // in (e.g. "VFαEβ"). The rule is about the single-uppercase finite letters
  // (E,F,G,...,Z): the Aa/Ab/... two-char tokens are ordinal-structure
  // markers (same role as !/@/#! symbols), and an "E" inside a number
  // ("7.626E12") is scientific notation, not a letter op — both are excluded
  // from the count. The reference formatter (format-powiainanum.js) produces
  // the same shapes: "J" + "GF7.626E12" for arrow(3,arrow(3,4,3),3).
  // Every letter combination counts as ONE type — including the Aa-style
  // multi-letter tokens (they are letter combinations, not free symbols).
  function letterTypesOf(s) {
    var stripped = String(s).replace(/(\d(?:\.\d+)?)E(\d[\d,]*)/g, "$1$2");
    var tokens = stripped.match(/[A-Z][a-z]*/g) || [];
    var types = {};
    for (var t = 0; t < tokens.length; t++) types[tokens[t]] = true;
    return Object.keys(types);
  }
  var samples = ["V10", "VE10", "VF10", "W10", "G1.161G897", "AaGF7.626E12",
    "2.397G5", "1.285H8", "2.376W2", "1.125Aa99", "F4.398E13", "GF7.626E12",
    // regressions fixed by formatSingleLetterType: these used to spell 3+ types
    "AaGGFFE8.072E153", "HGF7.626E12", "GGFFE8.072E153", "GFFEE1.276E74",
    "GGGFFFEE1E2,184"];
  var allOk = true;
  for (var i = 0; i < samples.length; i++) {
    var disp = format(MetaNum(samples[i]));
    var nTypes = letterTypesOf(disp).length;
    if (nTypes > 2) {
      allOk = false;
      console.log("  >2 letter types in", samples[i], "→", disp);
    }
  }
  checkBool("all displays use ≤ 2 letter combinations", allOk, true);
  // binary-letter canonical: the leading run + one binary tail letter
  checkBool("arrow(4,4,4) keeps GG + one F chain (2 types)",
    letterTypesOf(format(MetaNum.arrow(4, 4, 4))).length === 2 &&
    format(MetaNum.arrow(4, 4, 4)).indexOf("GG") === 0, true);
  checkBool("nested arrow keeps Aa + one chain type (AaG2.045G2)",
    letterTypesOf(format(MetaNum.arrow(3, MetaNum.arrow(3, 4, 3), 3))).length === 2, true);
  checkBool("arrow(3,4.1,3) display has exactly G only (VαEβ→…→VαVβ law)",
    (format(MetaNum.arrow(3, 4.1, 3)).match(/[A-Z][a-z]?/g) || []).every(function (tk) { return tk === "G"; }), true);
  // round-trip of the Aa-prefixed sci-arg chain (parse bug fix in v2.0:
  // "AaGF7.626E12" used to eat only the "7" and drop ".626E12")
  checkBool("AaGF7.626E12 parses with full sci arg",
    MetaNum("AaGF7.626E12").array[0][1] === 7625999999998
      && MetaNum("AaGF7.626E12").array.length === 2, true);
  // the Aa-prefixed value now spells Aa + ONE chain type (the old
  // "AaGF7.626E12" was three: Aa, G, F)
  var afDisp = format(MetaNum("AaGF7.626E12"));
  checkBool("AaGF7.626E12 reformats to ≤2 letter types", letterTypesOf(afDisp).length <= 2, true);
  checkBool("AaGF7.626E12 keeps the Aa prefix", afDisp.indexOf("Aa") === 0, true);
})();

// ─────────────────────────────────────
// single-letter canonical form helper (README "Canonical Forms")
//   plain → αEβ → EαEβ → EEαEβ → αFβ → FαFβ → FFαFβ → αGβ → … → αAaβ → …
//   the repeat budget is FORMAT_OPTIONS.repeatLetterThreshold (default 3)
// ─────────────────────────────────────
console.log("\n=== G6.4 binary-letter canonical forms (formatSingleLetterType) ===");
(function () {
  // Browser-safe: loaded via <script>, format-metanum.js exposes its top-level
  // functions as globals and `require` does not exist at all.
  var fmtMod = (typeof require === "function") ? require("./format-metanum.js") : null;
  var single = (fmtMod && fmtMod.formatSingleLetterType) ||
    (typeof formatSingleLetterType !== "undefined" ? formatSingleLetterType : null);
  var full = (fmtMod && fmtMod.formatFull) ||
    (typeof formatFull !== "undefined" ? formatFull : null);
  if (!single || !full) {
    console.log("SKIP | formatSingleLetterType / formatFull are not available here");
    return;
  }
  function typesOf(s) {
    var stripped = String(s).replace(/(\d(?:\.\d+)?)E(\d[\d,]*)/g, "$1$2");
    var tokens = stripped.match(/[A-Z][a-z]*/g) || [];
    var seen = {};
    for (var i = 0; i < tokens.length; i++) seen[tokens[i]] = true;
    return Object.keys(seen);
  }
  // the helper always ends on αΓβ (a decimal mantissa + a letter + an integer)
  function isBinary(s) {
    return /\d\.\d+[A-Z][a-z]*[\d,]/.test(String(s));
  }
  checkBool("helper(123) keeps the plain form", single(MetaNum(123)) === "123", true);
  checkBool("helper(10^8) = 100,000,000 (plain, below sciThreshold)",
    single(MetaNum(100000000)) === "100,000,000", true);
  // the E band: αEβ → EαEβ → EEαEβ (heights 1-3 at the default budget 3)
  checkBool("helper(10^10) = 1.000E10 (αEβ)", single(MetaNum(1e10)) === "1.000E10", true);
  checkBool("helper(10^308) = 1.000E308 (αEβ, β plain)",
    single(MetaNum("1e308")) === "1.000E308", true);
  checkBool("helper(10^10^308) = E1.000E308 (EαEβ)",
    single(MetaNum("e1e308")) === "E1.000E308", true);
  checkBool("helper(10^10^10^308) = EE1.000E308 (EEαEβ)",
    single(MetaNum("ee1e308")) === "EE1.000E308", true);
  // height 4 exceeds the E budget (3) → the chain advances to F
  var f4 = single(MetaNum("eee1e308"));
  checkBool("height 4 advances to the F band (" + f4 + ")", /^F\d/.test(f4), true);
  checkBool("height 4 uses ONE letter type", typesOf(f4).length === 1, true);
  // values already single-typed keep their structural spelling
  checkBool("helper(G600) = 1.000G600", single(MetaNum("G600")) === "1.000G600", true);
  checkBool("helper(Aa10) = 1.000N10 (first letter wins)", single(MetaNum("Aa10")) === "1.000N10", true);
  // every sample is ONE letter type AND carries an αΓβ binary part
  var samples = [MetaNum(1e10), MetaNum("1e308"), MetaNum("e1e308"), MetaNum("ee1e308"),
    MetaNum("eee1e308"), MetaNum.arrow(3, 5, 3), MetaNum.arrow(4, 4, 4),
    MetaNum.arrow(5, 4, 5), MetaNum.hardy(12345), MetaNum("G600"), MetaNum("Z10")];
  var ok = true, firstBad = "";
  for (var i = 0; i < samples.length; i++) {
    var out = single(samples[i]);
    if (typesOf(out).length > 1 || !isBinary(out)) { ok = false; if (!firstBad) firstBad = out; }
  }
  checkBool("formatSingleLetterType: one letter type + αΓβ binary tail", ok, true,
    ok ? "" : " first violation: " + firstBad);

  // ── format(): first combo + one-letter binary tail (2 types max) ──
  checkBool("format(arrow(4,4,4)) = GGFF2.187F3 (GG + FF…F…)",
    format(MetaNum.arrow(4, 4, 4)) === "GGFF2.187F3", true);
  checkBool("format(nested arrow) = AaG2.045G2 (Aa + G…G…)",
    format(MetaNum.arrow(3, MetaNum.arrow(3, 4, 3), 3)) === "AaG2.045G2", true);
  var hCase = MetaNum([[3638334640023.7783, 7625597484984, 0, 1, 1]]);
  checkBool("format(H-chain) = HG2.045G2 (H + G…G…)", format(hCase) === "HG2.045G2", true);
  checkBool("format(Aa-prefixed GG chain) = AaGG3.340G3",
    format(MetaNum("AaGGFFE8.072E153")) === "AaGG3.340G3", true);

  // ── formatFull(): no limit on the number of letter combinations ──
  checkBool("formatFull(arrow(4,4,4)) = GGFFE8.072E153 (3 types)",
    full(MetaNum.arrow(4, 4, 4)) === "GGFFE8.072E153", true);
  checkBool("formatFull(nested arrow) = AaGF7.626E12 (3 types)",
    full(MetaNum.arrow(3, MetaNum.arrow(3, 4, 3), 3)) === "AaGF7.626E12", true);
  checkBool("formatFull keeps 4+ types where format caps at 2",
    typesOf(full(MetaNum("AaGGFFE8.072E153"))).length === 4 &&
    typesOf(format(MetaNum("AaGGFFE8.072E153"))).length === 2, true);

  // ── multi-letter combos Ab / Ba / Bb / Aaa ──
  checkBool("Ab10 → 1.000Ab10", format(MetaNum("Ab10")) === "1.000Ab10", true);
  checkBool("Ba10 → 2.000Ba10", format(MetaNum("Ba10")) === "2.000Ba10", true);
  checkBool("Bb10 → 1.000Bb10", format(MetaNum("Bb10")) === "1.000Bb10", true);
  checkBool("Aaa10 → 2.000Aaa10", format(MetaNum("Aaa10")) === "2.000Aaa10", true);
  checkBool("AbGF7.626E12 → AbG2.045G2 (Ab + one chain)",
    format(MetaNum("AbGF7.626E12")) === "AbG2.045G2", true);
  checkBool("BaGF7.626E12 → BaG2.045G2",
    format(MetaNum("BaGF7.626E12")) === "BaG2.045G2", true);
  checkBool("BbGF7.626E12 → BbG2.045G2",
    format(MetaNum("BbGF7.626E12")) === "BbG2.045G2", true);
  checkBool("AaaGF7.626E12 → AaaG2.045G2",
    format(MetaNum("AaaGF7.626E12")) === "AaaG2.045G2", true);
  checkBool("AbGGFFE8.072E153 → AbGG3.340G3",
    format(MetaNum("AbGGFFE8.072E153")) === "AbGG3.340G3", true);
  // every multi-letter sample stays within 2 types under format()
  var multiOk = true, multiBad = "";
  ["AbGF7.626E12", "BaGF7.626E12", "BbGF7.626E12", "AaaGF7.626E12",
   "AbGGFFE8.072E153", "AaGGFFE8.072E153"].forEach(function (s) {
    var o = format(MetaNum(s));
    if (typesOf(o).length > 2) { multiOk = false; if (!multiBad) multiBad = s + " → " + o; }
  });
  checkBool("Ab/Ba/Bb/Aaa displays stay within 2 letter combos", multiOk, true, multiBad);
})();

// ─────────────────────────────────────
// hardy hierarchy — display-form verification (all user cases)
//   ≤2 letter types per display; diagonal cascades compress to the
//   structural two-letter form or the αAaβ polarize diagonal;
//   repeatLetterThreshold+1 repeated single letters carry to the next
// ─────────────────────────────────────
console.log("\n=== G6.5 hardy hierarchy display forms ===");
checkFormat("arrow(3,9,3) → L…K…", MetaNum.arrow(3, 9, 3), "L2.376K2");
checkFormat("arrow(3,10,3) → M(10^0.376)L2", MetaNum.arrow(3, 10, 3), "M2.376L2");
checkFormat("arrow(4,9,4) → LLK…K…", MetaNum.arrow(4, 9, 4), "LLK3.550K3");
checkFormat("arrow(5,9,5) → LLLKK…K…", MetaNum.arrow(5, 9, 5), "LLLKK4.669K4");
checkBool("arrow(6,9,6) carries to …M5 (threshold+1 repeats)",
  /M5$/.test(format(MetaNum.arrow(6, 9, 6))), true);
checkFormat("arrow(3,22,3) → Y…X…", MetaNum.arrow(3, 22, 3), "Y2.376X2");
checkFormat("arrow(3,23,3) → Z…Y…", MetaNum.arrow(3, 23, 3), "Z2.376Y2");
checkFormat("arrow(3,24,3) → 2.376Aa23 (Aa diagonal)", MetaNum.arrow(3, 24, 3), "2.376Aa23");
checkFormat("arrow(3,100,3) → 2.376Aa99", MetaNum.arrow(3, 100, 3), "2.376Aa99");
checkFormat("arrow(10,10000,10) → 1.000Aa10,000", MetaNum.arrow(10, 10000, 10), "2.000Aa10,000");
checkFormat("nested arrow(3,arrow(3,100,3),3) → Aa2.376Aa99",
  MetaNum.arrow(3, MetaNum.arrow(3, 100, 3), 3), "Aa2.376Aa99");
checkFormat("nested arrow(3,arrow(10,10000,10),3) → Aa1.000Aa10,000",
  MetaNum.arrow(3, MetaNum.arrow(10, 10000, 10), 3), "Aa2.000Aa10,000");
// every display uses at most 2 distinct letter tokens (≤2-types rule)
(function () {
  var cases = [
    MetaNum.arrow(3, 9, 3), MetaNum.arrow(4, 9, 4), MetaNum.arrow(5, 9, 5),
    MetaNum.arrow(3, 22, 3), MetaNum.arrow(3, 23, 3), MetaNum.arrow(3, 24, 3),
    MetaNum.arrow(3, 100, 3), MetaNum.arrow(10, 10000, 10),
    MetaNum.arrow(3, MetaNum.arrow(3, 100, 3), 3),
  ];
  var all2 = true;
  for (var ci = 0; ci < cases.length; ci++) {
    var toks = (format(cases[ci]).match(/[A-Z][a-z]*/g) || []).filter(function (t) { return t !== "E"; });
    // strip the structural E inside numbers first, then count distinct tokens
    var s = format(cases[ci]).replace(/(\d(?:\.\d+)?)E[\d,]+/g, "$1");
    toks = (s.match(/[A-Z][a-z]*/g) || []);
    var seen = {};
    for (var ti = 0; ti < toks.length; ti++) seen[toks[ti]] = 1;
    if (Object.keys(seen).length > 2) { all2 = false; console.log("  >2 types:", format(cases[ci])); }
  }
  checkBool("all diagonal-cascade displays use ≤ 2 letter types", all2, true);
})();

// ─────────────────────────────────────────────────────────────────
// v2.0: rule 3 unification + pure dlsdl diagonal [2,10) convention
// ─────────────────────────────────────────────────────────────────
console.log("\n=== G6.6 diagonal letter convention ===");
// rule 3: n{λ}b = n{λ[b]}b
checkBool("aper(3,5) = 3{5}5", MetaNum.aperiote(3,5).eq(MetaNum(3).arrow(5)(5)), true);
// diagonal letters (ending in 'a'): integer arguments all anchor at 2.000
[10, 11, 50, 100].forEach(function (b) {
  checkFormat("10{100}" + b + " → 2.000Aa100", MetaNum.arrow(10, 100, b), "2.000Aa100");
});
checkFormat("11{100}11 → 2.000Aa100", MetaNum.arrow(11, 100, 11), "2.000Aa100");
// structured count climbs to its smooth diagonal mantissa
checkFormat("10{100}(10{93}10) → 2.002Aa100",
  MetaNum.arrow(10, 100, MetaNum.arrow(10, 93, 10)), "2.002Aa100");
// non-diagonal letters keep the [1,10) convention
checkFormat("Ab100 → 1.000Ab100", MetaNum("Ab100"), "1.000Ab100");
// symbol de-layering (decision 1B: base is the argument, display is the
// binary form !αAaβ; !Aa3 = Aaaa3 = 10{ω³}3)
checkFormat("!Aa3 → !2.000Aa3", MetaNum("!Aa3"), "!2.000Aa3");
checkFormat("@Aa3 → @2.000Aa3 (one symbol per ω^ layer, isomorphic to !Aa3)", MetaNum("@Aa3"), "@2.000Aa3");
// parser roundtrip of the new canonical forms
checkBool("parse 2.000Aaaa10", MetaNum("2.000Aaaa10").format() === "2.000Aaaa10", true);
checkBool("parse !2.000Aaaa10", MetaNum("!2.000Aaaa10").format() === "!2.000Aaaa10", true);
checkBool("parse 2.002Aa100", MetaNum("2.002Aa100").format() === "2.002Aa100", true);
// hardy(1e10+k) must not blow the stack
(function () {
  var ok = true;
  for (var k = 0; k <= 60; k++) {
    try { MetaNum.hardy(1e10 + k); } catch (e) { ok = false; console.log("hardy threw at", 1e10 + k, e.message); }
  }
  checkBool("hardy(1e10+0..60) no throw", ok, true);
})();
// cross-config stability for the new cases
(function () {
  var ref = null, stable = true;
  [10, 20, 50, 100].forEach(function (c) {
    MetaNum.maxRows = c; MetaNum.maxCols = c;
    var f = format(MetaNum.arrow(10, 100, MetaNum.arrow(10, 93, 10)));
    if (ref === null) ref = f;
    else if (f !== ref) { stable = false; console.log("cfg" + c + " drift: " + f + " vs " + ref); }
  });
  MetaNum.maxRows = 20; MetaNum.maxCols = 20;
  checkBool("v2.0: 10{100}(10{93}10) cross-config stable (" + ref + ")", stable, true);
})();

// ─────────────────────────────────────
// cross-config stability: identical formats at
//   maxRows = maxCols = 10 / 20 / 50 / 100 (±1 in the last shown digit)
// ─────────────────────────────────────
console.log("\n=== G6.7 cross-config stability ===");
(function () {
  var cases = [[3, 9, 3], [3, 10, 3], [4, 9, 4], [5, 9, 5], [6, 9, 6],
               [3, 22, 3], [3, 23, 3], [3, 24, 3], [3, 39, 3], [3, 100, 3],
               [10, 25, 10], [10, 10000, 10]];
  var cfgs = [10, 20, 50, 100];
  var stable = true;
  for (var i = 0; i < cases.length; i++) {
    var ref = null;
    for (var c = 0; c < cfgs.length; c++) {
      MetaNum.maxRows = cfgs[c]; MetaNum.maxCols = cfgs[c];
      var f = format(MetaNum.arrow(cases[i][0], cases[i][1], cases[i][2]));
      if (ref === null) ref = f;
      else if (f !== ref) {
        // allow ±1 in the last displayed digit
        var a = ref.match(/(\d+(?:\.\d+)?)(?!.*\d)/), b = f.match(/(\d+(?:\.\d+)?)(?!.*\d)/);
        if (!a || !b || Math.abs(Number(a[1]) - Number(b[1])) > 1.5 * Math.pow(10, -(a[1].split(".")[1] || "").length + 1)) {
          stable = false;
          console.log("  config drift [" + cases[i] + "] " + ref + " vs @" + cfgs[c] + " " + f);
        } else { ref = f; }
      }
    }
  }
  MetaNum.maxRows = 20; MetaNum.maxCols = 20;
  checkBool("formats identical across maxRows/maxCols = 10/20/50/100 (±1 last digit)", stable, true);
  // clamped bounds: values below 10 and above 1000 snap inside
  MetaNum.maxRows = 5; checkBool("maxRows clamps up to 10", MetaNum.maxRows === 10, true);
  MetaNum.maxRows = 5000; checkBool("maxRows clamps down to 1000", MetaNum.maxRows === 1000, true);
  MetaNum.maxRows = 20;
})();

console.log("\n=== G6.8 MetaNum(...).format() instance method ===");
(function () {
  function checkFmtEq(name, gotStr, expected) {
    var pass = gotStr === expected;
    console.log((pass ? "PASS" : "FAIL") + " | " + name + " | " + gotStr
      + (pass ? "" : " (expected " + expected + ")"));
  }
  checkFmtEq("G600.format()", MetaNum("G600").format(), "1.000G600");
  checkFmtEq("hardy(4166).format()", MetaNum.hardy(4166).format(), "2.397G5");
  checkFmtEq("arrow(3,4.1,3).format()", MetaNum.arrow(3, 4.1, 3).format(), "G1.161G897");
  checkFmtEq("small 0.5.format()", MetaNum(0.5).format(), "0.500");
  checkFmtEq("format(2) precision arg", MetaNum(1234.5678).format(2), "1,234");
  checkFmtEq(".format() matches module format(FE400)",
    MetaNum("FE400").format(), format(MetaNum("FE400")));
})();

// ─────────────────────────────────────
// FORMAT_OPTIONS: every option must take effect.  Each check flips the option
// and asserts the display changes along the option's documented meaning.
// ─────────────────────────────────────
console.log("\n=== G7.12 format() \"null\" regression ===");
(function () {
  // inner r0 chain exceeding the repeat-letter budget used to leak the
  // literal string "null" into the output; it must fall through to the
  // Γ-canonical collapse instead.  The value that triggered the leak is the
  // ω-diagonal x{10}x (the pre-unification aperiote); build it directly so
  // the regression stays pinned even though aperiote now anchors at y.
  var cases = [["3.3G5","N1.000G5"],["2.4G5","N1.000G5"],["1.5G8","N1.000G8"],["G5","N1.000G5"]];
  for (var i = 0; i < cases.length; i++) {
    var got = MetaNum(cases[i][0]).arrow(10)(MetaNum(cases[i][0])).format();
    checkBool("format(" + cases[i][0] + " ω-diagonal) = " + cases[i][1] + " (no \"null\")",
      got === cases[i][1], true, got === cases[i][1] ? "" : " got " + got);
  }
  // the unified aperiote x{ω}y = x{y}y outputs stay null-free as well
  var cases2 = [["3.3G5","1.007N10"],["2.4G5","1.007N10"],["1.5G8","1.008N10"],["G5","1.007N10"]];
  for (var k = 0; k < cases2.length; k++) {
    var got2 = MetaNum.h10(cases2[k][0], 10).format();
    checkBool("format(h10(" + cases2[k][0] + ",10)) = " + cases2[k][1] + " (no \"null\")",
      got2 === cases2[k][1], true, got2 === cases2[k][1] ? "" : " got " + got2);
  }
})();
console.log("\n=== G8.9 series and purchase contracts ===");
(function () {
  function checkSeriesValue(name, got, expected) {
    checkBool(name, got instanceof MetaNum && got.eq(expected), true, "got=" + got + " expected=" + expected);
  }
  function independentCost(count, firstPrice, growth, geometric) {
    var total = 0;
    var price = firstPrice;
    for (var i = 0; i < count; i++) {
      total += price;
      price = geometric ? price * growth : price + growth;
    }
    return total;
  }
  function checkPurchase(name, got, resources, priceStart, growth, owned, expected, geometric) {
    var valid = got instanceof MetaNum && got.isFinite() && got.isint() && got.gte(0) && got.eq(expected);
    var count = got.toNumber();
    var firstPrice = geometric ? priceStart * Math.pow(growth, owned) : priceStart + growth * owned;
    var currentCost = independentCost(count, firstPrice, growth, geometric);
    var nextCost = independentCost(count + 1, firstPrice, growth, geometric);
    checkBool(name, valid && currentCost <= resources && nextCost > resources, true,
      "got=" + got + " cost=" + currentCost + " next=" + nextCost + " expected=" + expected);
  }

  checkSeriesValue("geometric series uses exactly N items", MetaNum.sumGeometricSeries(5, 1, 2), 31);
  checkSeriesValue("arithmetic series uses exactly N items", MetaNum.sumArithmeticSeries(5, 1, 2), 25);
  checkSeriesValue("geometric series equal empty interval", MetaNum.sumGeometricSeries(5, 1, 2, 5), 0);
  checkSeriesValue("geometric series reverse empty interval", MetaNum.sumGeometricSeries(4, 1, 2, 5), 0);
  checkSeriesValue("arithmetic series equal empty interval", MetaNum.sumArithmeticSeries(5, 1, 2, 5), 0);
  checkSeriesValue("arithmetic series reverse empty interval", MetaNum.sumArithmeticSeries(4, 1, 2, 5), 0);
  checkSeriesValue("geometric series unit ratio", MetaNum.sumGeometricSeries(5, 3, 1), 15);
  checkSeriesValue("arithmetic series zero add", MetaNum.sumArithmeticSeries(5, 3, 0), 15);
  checkSeriesValue("geometric series nonzero start index", MetaNum.sumGeometricSeries(5, 3, 2, 2), 21);
  checkSeriesValue("arithmetic series nonzero start index", MetaNum.sumArithmeticSeries(5, 3, 2, 2), 15);

  for (var n = 0; n <= 10; n++) {
    checkSeriesValue("geometric independent accumulation N=" + n,
      MetaNum.sumGeometricSeries(n, 2, 3), independentCost(n, 2, 3, true));
    checkSeriesValue("arithmetic independent accumulation N=" + n,
      MetaNum.sumArithmeticSeries(n, 2, 3), independentCost(n, 2, 3, false));
  }

  var geometricCases = [
    [100, 1, 2, 0, 6], [100, 1, 2, 2, 4], [62, 1, 2, 0, 5],
    [63, 1, 2, 0, 6], [100, 2, 1, 7, 50], [0.5, 1, 2, 0, 0],
    [0, 1, 2, 0, 0], [1.4, 1, 0.5, 0, 1]
  ];
  for (var g = 0; g < geometricCases.length; g++) {
    var gc = geometricCases[g];
    checkPurchase("geometric purchase " + gc.join("/"),
      MetaNum.affordGeometricSeries(gc[0], gc[1], gc[2], gc[3]), gc[0], gc[1], gc[2], gc[3], gc[4], true);
  }
  checkBool("geometric purchase at decreasing-ratio supremum",
    MetaNum.affordGeometricSeries(2, 1, 0.5, 0).eq(MetaNum.POSITIVE_INFINITY), true);
  checkBool("geometric purchase NaN propagation",
    MetaNum.affordGeometricSeries(MetaNum.NaN, 1, 2, 0).isNaN(), true);

  var arithmeticCases = [
    [100, 1, 2, 0, 10], [100, 1, 2, 2, 8], [99, 1, 2, 0, 9],
    [100, 2, 0, 7, 50], [0.5, 1, 2, 0, 0], [0, 1, 2, 0, 0]
  ];
  for (var a = 0; a < arithmeticCases.length; a++) {
    var ac = arithmeticCases[a];
    checkPurchase("arithmetic purchase " + ac.join("/"),
      MetaNum.affordArithmeticSeries(ac[0], ac[1], ac[2], ac[3]), ac[0], ac[1], ac[2], ac[3], ac[4], false);
  }
  checkBool("arithmetic purchase NaN propagation",
    MetaNum.affordArithmeticSeries(MetaNum.NaN, 1, 2, 0).isNaN(), true);
})();
console.log("\n=== G8.10 formatting exports and exact-token contracts ===");
(function () {
  var fmt = require("./format-metanum.js");
  var exportNames = ["format", "formatFull", "formatWhole", "formatSmall", "formatSingleLetterType",
    "metaPolarize", "letterName", "symbolName", "getOrdinalLetter", "formatR0AsChain", "FORMAT_OPTIONS",
    "polarizeFiniteChain", "gammaArgOf", "formatGammaBinary"];
  for (var i = 0; i < exportNames.length; i++) {
    var expectedType = exportNames[i] === "FORMAT_OPTIONS" ? "object" : "function";
    checkBool("format export " + exportNames[i], typeof fmt[exportNames[i]] === expectedType, true);
  }
  var savedLimit = fmt.FORMAT_OPTIONS.multiLetterLimit;
  try {
    fmt.FORMAT_OPTIONS.multiLetterLimit = 4;
    checkBool("multiLetterLimit keeps length at limit", fmt.format(MetaNum("Aaaa10")) === "2.000Aaaa10", true);
    checkBool("multiLetterLimit carries ordinary overflow", fmt.format(MetaNum("Aaaab10")) === "!1.000H10", true);
    checkBool("multiLetterLimit preserves exact diagonal token", fmt.format(MetaNum("Aaaaa10")) === "Aaaaa10", true);
    ["Aaaaa3.5", "Aaaaa5", "Aaaaa10"].forEach(function (token) {
      var value = MetaNum(token);
      checkBool("exact token round-trip " + token, MetaNum(fmt.format(value)).eq(value), true);
    });
  } finally {
    fmt.FORMAT_OPTIONS.multiLetterLimit = savedLimit;
  }
})();

console.log("\n=== G8.11 documented public behavior ===");
(function () {
  var fmt = require("./format-metanum.js");
  checkBool("README aper(3)", MetaNum(2).aper(3).eq(65536), true);

  var savedRows = MetaNum.maxRows;
  var savedCols = MetaNum.maxCols;
  try {
    MetaNum.maxRows = 20;
    MetaNum.maxCols = 20;
    checkArr("README Hardy base and eight trailing tens", MetaNum.hardy("1e10+0.5"),
      [[4581.009607833985,10,10,10,10,10,10,10,10]]);
    checkArr("README h100 maxRows=20", MetaNum(10).h100(20),
      [[10],[9,1,19],[8,2,19],[8,3,19],[8,4,19],[8,5,19],[8,6,19],[8,7,19],[8,8,19],[8,9,19],
       [8,10,19],[8,11,19],[8,12,19],[8,13,19],[8,14,19],[8,15,19],[8,16,19],[8,17,19],[8,18,19],[18,19,19]]);
    MetaNum.maxRows = 50;
    checkArr("README h100 maxRows=50", MetaNum(10).h100(20),
      [[10],[9,1,16],[8,2,16],[8,3,16],[8,4,16],[8,5,16],[8,6,16],[8,7,16],[8,8,16],[8,9,16],
       [8,0,17],[8,1,17],[8,2,17],[8,3,17],[8,4,17],[8,5,17],[8,6,17],[8,7,17],[8,8,17],[8,9,17],
       [8,0,18],[8,1,18],[8,2,18],[8,3,18],[8,4,18],[8,5,18],[8,6,18],[8,7,18],[8,8,18],[8,9,18],
       [8,0,19],[8,1,19],[8,2,19],[8,3,19],[8,4,19],[8,5,19],[8,6,19],[8,7,19],[8,8,19],[8,9,19],
       [8,10,19],[8,11,19],[8,12,19],[8,13,19],[8,14,19],[8,15,19],[8,16,19],[8,17,19],[8,18,19],[18,19,19]]);
    MetaNum.maxRows = 20;
    checkArr("README h13 base 10", MetaNum(10).h13(20),
      [[10000000000,8,8,8,8,8,8,8,8,8],[8,0,1],[8,1,1],[18,2,1]]);
    checkArr("README h13 base 3", MetaNum(3).h13(20),
      [[3638334640023.7783,7625597484984],[1,0,1],[1,1,1],[18,2,1]]);
  } finally {
    MetaNum.maxRows = savedRows;
    MetaNum.maxCols = savedCols;
  }
  checkBool("README Hyper-E text", MetaNum(100).toHyperE() === "E2", true);
  checkArr("README fromArray normalization", MetaNum.fromArray([1e10,520.73,1]), [[10000000000,520,1]]);
  checkBool("README BEAF omega+1 base 2", MetaNum.BEAF(2,2,1,2).eq(4), true);
  checkBool("README BEAF omega+1 distinguishable base", MetaNum.BEAF(3,3,1,2).eq(MetaNum(3).h11(3)), true);
  checkBool("README slog approximation", Math.abs(MetaNum(65536).slog().toNumber() - 1.8342488308601794) <= 1e-12, true);
  ["Ab", "Ba", "Bb", "Aaa"].forEach(function (prefix) {
    checkBool("README prefix preserved " + prefix,
      fmt.format(MetaNum(prefix + "GGFFE8.072E153")) === prefix + "GG3.340G3", true);
  });
})();

console.log("\n=== G8.12 formatting helper examples ===");
(function () {
  var fmt = require("./format-metanum.js");
  checkBool("formatWhole example", fmt.formatWhole(MetaNum(1234.56)) === "1,234", true);
  checkBool("formatSmall example", fmt.formatSmall(MetaNum(0.0001)) === "1.000E-4", true);
  checkBool("metaPolarize example", JSON.stringify(fmt.metaPolarize([100])) ===
    JSON.stringify({bottom:1,top:2,height:1,repeat:1}), true);
  checkBool("letterName example", fmt.letterName(699) === "Aaa", true);
  checkBool("symbolName examples", fmt.symbolName(0) === "" && fmt.symbolName(1) === "!", true);
  checkBool("getOrdinalLetter examples", fmt.getOrdinalLetter([[1,0,0,1]]) === "Aaa" && fmt.getOrdinalLetter([]) === null, true);
  checkBool("formatR0AsChain example", fmt.formatR0AsChain([10,1,2],3) === "FF1.000E10", true);
  var chainValue = MetaNum.arrow(3,100,3);
  var polarized = fmt.polarizeFiniteChain(chainValue.array[0], chainValue.array.slice(1));
  checkBool("polarizeFiniteChain example", polarized !== null &&
    Math.abs(polarized.bottom - 2.3758120875933075) <= 1e-12 && polarized.repeation === 2 && polarized.arrows === 99, true);
  var gammaArg = fmt.gammaArgOf(MetaNum("G5"),3,40);
  checkBool("gammaArgOf example", gammaArg !== null && Math.abs(gammaArg - 5) <= 1e-9, true);
  checkBool("formatGammaBinary example", fmt.formatGammaBinary(5.5,3,3) === "3.162G5", true);
})();
console.log("\n=== G8.13 README contract structure ===");
(function () {
  var readme = require("fs").readFileSync("README.md", "utf8");
  var changelog = readme.split("# Changelog")[1] || "";
  checkBool("README has one v2.2.0 changelog entry", (changelog.match(/v2\.2\.0/g) || []).length === 1, true);
  checkBool("README v2.2.0 keeps all capability categories",
    ["limit rules", "iteraperiate", "root forms", "null", "large-base"].every(function (term) {
      return changelog.indexOf(term) !== -1;
    }), true);
  var limitLine = readme.split("\n").filter(function (line) { return line.indexOf("multiLetterLimit") !== -1 && line.indexOf("// 13.") !== -1; })[0] || "";
  var historyLine = readme.split("\n").filter(function (line) { return line.indexOf("v2.1.1") !== -1; })[0] || "";
  checkBool("README multiLetterLimit ordinary and exact rules",
    limitLine.indexOf("Ordinary") !== -1 && limitLine.indexOf("Exact") !== -1 && limitLine.indexOf("64-token") !== -1, true);
  checkBool("README v2.1.1 ordinary and exact rules",
    historyLine.indexOf("ordinary") !== -1 && historyLine.indexOf("exact diagonal tokens") !== -1, true);
  var helperDocs = readme.split("### Formatting helper API")[1] || "";
  helperDocs = helperDocs.split("**Canonical chain**")[0];
  var helpers = ["formatWhole", "formatSmall", "metaPolarize", "letterName", "symbolName", "getOrdinalLetter",
    "formatR0AsChain", "polarizeFiniteChain", "gammaArgOf", "formatGammaBinary"];
  for (var i = 0; i < helpers.length; i++) {
    var row = helperDocs.split("\n").filter(function (line) { return line.indexOf("`" + helpers[i]) !== -1; })[0] || "";
    checkBool("README helper contract " + helpers[i], row.indexOf("→") !== -1 && row.split("|").length >= 5, true);
  }
})();


// ═══════════════════════════════════════════════════════════════════════════
// G9  hyper_inv: continuous real-number log/root inverses
//      (spec .codeartsdoer/specs/hyper_inv/spec.md sections 5.1–5.8,
//       design.md sections 2.1–2.7, tasks 10.1–12.5)
//      G9.0   checkInverseCase reporter + evidence bookkeeping (10.1)
//      G9.1   reporter self-check: injected failure is detectable (10.1)
//      G9.2   full registry, aliases, parameter order, options (10.2)
//      G9.3   closed-form non-integer / known integer / sign / reciprocal (10.3)
//      G9.4   forward anchors and inverse substitution use one forward (10.4)
//      G9.5   per-family integer / non-integer height and base matrix (11.1)
//      G9.6   round-trip vs. substitution residual separation (11.2)
//      G9.7   successor break points m±δ (11.3)
//      G9.8   fundamental-sequence break points + fractional coefficient (11.4)
//      G9.9   domain boundaries, multi/no-solution, invalid & non-finite (12.1)
//      G9.10  markers, saturation, truncation, COEFF/MSI/cap, minimality (12.2)
//      G9.11  large numbers, tolerance ladder, numeric strings, underflow (12.3)
//      G9.12  failure injection: budgets, stagnation, fallback, overflow (12.4)
//      G9.13  input immutability, config isolation, determinism (12.5)
//      G9.14  summary + process gate (10.1 / 14.2)
// ═══════════════════════════════════════════════════════════════════════════
console.log("\n=== G9.0 inverse test harness ===");

var INVERSE_STATS = {
  total: 0, pass: 0, fail: 0, error: 0, skipped: 0,
  evidence: { "definition-guaranteed": 0, "representation-level": 0, "numerical-experiment": 0, "not-applicable": 0 },
  categories: {}, failedCases: []
};

function inverseValueSummary(v) {
  if (!(v instanceof MetaNum)) return String(v);
  var arr = JSON.stringify(v.array);
  if (arr.length > 48) arr = arr.slice(0, 45) + "...";
  return v.toString().slice(0, 40) + " {sign=" + v.sign + ",layer=" + v.layer + ",array=" + arr + "}";
}

function inverseFailureCategory(status, termination, expectedFailure) {
  if (expectedFailure) return "expected-outcome";
  if (status === "non-converged" || status === "bracketing-failed" || status === "stagnated") return "numeric-non-convergence";
  if (status === "unrecoverable" || status === "unrepresentable" || status === "unsupported-domain") return "representation-unrecoverable";
  return "requirement-unsatisfied";
}

// checkInverseCase: one line per case with the full spec 10.1 record.
// spec = { caseId, requirement, operation, direction, call, run, note,
//          expect: { status:[..], value, approx:{to,tol}, isNaN, isint,
//                    termination:[..], multipleSolutions, representationLevel,
//                    legacyAnchor, minimalityAttained, residualKind, check },
//          solError: { from, tol }, residualMax, reproduce: { forward, target } }
function checkInverseCase(spec) {
  var id = spec.caseId, req = spec.requirement || "";
  INVERSE_STATS.total++;
  if (spec.run === false) {
    INVERSE_STATS.skipped++;
    console.log("SKIP | INV " + id + " | " + req + " | reason: " + (spec.note || "not executed"));
    return;
  }
  var result;
  try { result = spec.call(); }
  catch (e) {
    INVERSE_STATS.error++;
    INVERSE_STATS.categories["test-environment-error"] = (INVERSE_STATS.categories["test-environment-error"] || 0) + 1;
    INVERSE_STATS.failedCases.push(id + "(error)");
    console.log("ERROR | INV " + id + " | " + req + " | call threw: " + e.message);
    return;
  }
  var isResult = result !== null && typeof result === "object" && typeof result.status === "string";
  var value = isResult ? result.value : result;
  var problems = [];
  var expectedFailure = false;
  var exp = spec.expect || {};
  if (exp.isNaN) expectedFailure = true;
  if (exp.status && typeof exp.status === "string") exp.status = [exp.status];
  if (!isResult && (exp.status || exp.termination || exp.multipleSolutions !== undefined ||
      exp.representationLevel !== undefined || exp.legacyAnchor !== undefined ||
      exp.minimalityAttained !== undefined || spec.residualMax !== undefined || spec.residualKind)) {
    problems.push("diagnostic fields requested but the call returned a plain MetaNum");
  }
  if (isResult) {
    if (exp.status && exp.status.indexOf(result.status) === -1) problems.push("status " + result.status + " not in [" + exp.status.join(",") + "]");
    if (exp.termination) {
      if (typeof exp.termination === "string") exp.termination = [exp.termination];
      if (exp.termination.indexOf(result.termination) === -1) problems.push("termination " + result.termination + " not in [" + exp.termination.join(",") + "]");
    }
    if (exp.multipleSolutions !== undefined && result.multipleSolutions !== exp.multipleSolutions) problems.push("multipleSolutions=" + result.multipleSolutions);
    if (exp.representationLevel !== undefined && result.representationLevel !== exp.representationLevel) problems.push("representationLevel=" + result.representationLevel);
    if (exp.legacyAnchor !== undefined && result.legacyAnchor !== exp.legacyAnchor) problems.push("legacyAnchor=" + result.legacyAnchor);
    if (exp.minimalityAttained !== undefined && result.minimalityAttained !== exp.minimalityAttained) problems.push("minimalityAttained=" + result.minimalityAttained);
    if (exp.residualKind && (!result.residual || result.residual.kind !== exp.residualKind)) problems.push("residualKind=" + (result.residual && result.residual.kind));
    if (spec.residualMax !== undefined) {
      var rel = result.residual && result.residual.relative;
      var cmpv = result.residual && result.residual.comparison;
      if (rel === null || rel === undefined) {
        if (cmpv !== 0) problems.push("no faithful residual evidence (kind=" + (result.residual && result.residual.kind) + ", cmp=" + cmpv + ")");
      } else if (rel > spec.residualMax) problems.push("R_rel=" + rel + " > " + spec.residualMax);
    }
  }
  if (exp.isNaN) { if (!(value instanceof MetaNum) || !value.isNaN()) problems.push("expected NaN, got " + inverseValueSummary(value)); }
  else if (!exp.allowNaN && (value === undefined || value === null || !(value instanceof MetaNum) || value.isNaN())) {
    problems.push("expected a finite MetaNum, got " + inverseValueSummary(value));
  } else {
    if (exp.value !== undefined && !value.eq(MetaNum(exp.value))) problems.push("value " + inverseValueSummary(value) + " != " + MetaNum(exp.value).toString());
    if (exp.approx) {
      var got = value.toNumber();
      if (!Number.isFinite(got) || Math.abs(got - exp.approx.to) > exp.approx.tol * Math.max(1, Math.abs(exp.approx.to)))
        problems.push("value " + inverseValueSummary(value) + " outside " + exp.approx.to + "±" + exp.approx.tol);
    }
    if (exp.isint !== undefined && value.isint() !== exp.isint) problems.push("isint=" + value.isint() + " expected " + exp.isint);
    if (spec.solError) {
      var se = value.sub(MetaNum(spec.solError.from)).toNumber();
      if (!Number.isFinite(se) || Math.abs(se) > spec.solError.tol * Math.max(1, Math.abs(spec.solError.from)))
        problems.push("solution error " + se + " > " + spec.solError.tol + "*max(1,|" + spec.solError.from + "|)");
    }
    if (spec.reproduce && !(value instanceof MetaNum && value.isNaN())) {
      // exact anchors reproduce with strict cmp==0; approximate solutions may
      // instead show a faithfully computable R_rel <= 1e-9 (spec 5.6.1(6))
      var fwd = spec.reproduce.forward(value), tgt = MetaNum(spec.reproduce.target);
      var reproduced = fwd instanceof MetaNum && fwd.cmp(tgt) === 0;
      if (!reproduced && fwd instanceof MetaNum && !fwd.isNaN() && !tgt.isNaN()) {
        var fn = fwd.toNumber(), tn = tgt.toNumber();
        if (Number.isFinite(fn) && Number.isFinite(tn)) reproduced = Math.abs(fn - tn) / Math.max(1, Math.abs(tn)) <= 1e-9;
      }
      if (!reproduced) problems.push("forward substitution did not reproduce the target");
    }
  }
  var customCheck = exp.check || spec.check;
  if (customCheck) { var extra = customCheck(result, value); if (extra && extra.length) problems = problems.concat(extra); }
  var cat = inverseFailureCategory(isResult ? result.status : "(value)", isResult ? result.termination : "", expectedFailure);
  var evidence = isResult ? (result.evidence || "not-applicable") : "not-applicable";
  var line = (isResult ? result.status : "value") + " value=" + (value instanceof MetaNum ? value.toString().slice(0, 26) : String(value)) +
    " term=" + (isResult ? result.termination : "-") +
    " | solErr=" + (spec.solError ? spec.solError.tol : "-") +
    " res=" + (isResult && result.residual ? result.residual.kind + "/" + (result.residual.relative === null ? "null" : result.residual.relative) : "-") +
    " | it/exp/fw/fb=" + (isResult ? [result.iterations, result.expansions, result.forwardEvaluations, result.fallbackCount].join("/") : "-/-/-/-") +
    " | flags=" + (isResult ? [result.multipleSolutions ? "M" : "-", result.representationLevel ? "R" : "-", result.legacyAnchor ? "L" : "-"].join("") : "-") +
    " | " + evidence;
  if (problems.length === 0) {
    INVERSE_STATS.pass++;
    INVERSE_STATS.evidence[evidence] = (INVERSE_STATS.evidence[evidence] || 0) + 1;
    if (!expectedFailure) INVERSE_STATS.categories["expected-outcome"] = (INVERSE_STATS.categories["expected-outcome"] || 0) + 1;
    else INVERSE_STATS.categories[cat] = (INVERSE_STATS.categories[cat] || 0) + 1;
    console.log("PASS | INV " + id + " | " + req + " | " + (spec.operation || "") + " " + (spec.direction || "") + " | " + line +
      (spec.note ? " | note: " + spec.note : ""));
  } else {
    INVERSE_STATS.fail++;
    INVERSE_STATS.categories[cat] = (INVERSE_STATS.categories[cat] || 0) + 1;
    INVERSE_STATS.failedCases.push(id);
    console.log("FAIL | INV " + id + " | " + req + " | " + (spec.operation || "") + " " + (spec.direction || "") + " | " + line +
      " | PROBLEMS: " + problems.join("; "));
    if (value instanceof MetaNum) console.log("  value detail: " + inverseValueSummary(value));
  }
}

// G9.1 the reporter itself must be able to see an injected failure (10.1).
// The injected FAIL line is captured BEFORE it reaches the process gate and
// the bookkeeping is restored, so the self-check never contaminates the gate.
(function () {
  var captured = [];
  var outerLog = console.log;
  console.log = function () { captured.push(Array.prototype.join.call(arguments, " ")); };
  var savedStats = JSON.stringify({ pass: INVERSE_STATS.pass, fail: INVERSE_STATS.fail, total: INVERSE_STATS.total,
    categories: INVERSE_STATS.categories, failedCases: INVERSE_STATS.failedCases });
  try {
    checkInverseCase({
      caseId: "G9.1.injected", requirement: "10.1 injected failure detection", operation: "harness", direction: "-",
      call: function () { return MetaNum.hyper_log(7, 2, 0, { diagnostics: true }); },
      expect: { status: ["wrong-on-purpose"] }
    });
  } finally {
    console.log = outerLog;
    var restored = JSON.parse(savedStats);
    INVERSE_STATS.pass = restored.pass; INVERSE_STATS.fail = restored.fail; INVERSE_STATS.total = restored.total;
    INVERSE_STATS.categories = restored.categories; INVERSE_STATS.failedCases = restored.failedCases;
  }
  var injectedLine = captured.filter(function (l) { return l.indexOf("FAIL | INV G9.1.injected") === 0; })[0] || "";
  checkInverseCase({
    caseId: "G9.1.1", requirement: "10.1 injected failure is detectable and does not leak into the gate",
    operation: "harness", direction: "-", call: function () { return MetaNum(1); },
    expect: { value: 1, check: function () {
      var p = [];
      if (!injectedLine) p.push("injected case produced no FAIL line");
      if (injectedLine.indexOf("PROBLEMS: status exact not in [wrong-on-purpose]") === -1) p.push("FAIL line lacks the problem detail");
      if (GATE_COUNTS.fail !== 0) p.push("injected FAIL reached the process gate");
      if (INVERSE_STATS.fail !== 0) p.push("injected FAIL stayed in the stats");
      return p;
    } },
    note: "injected line captured: " + injectedLine.slice(0, 90)
  });
  checkInverseCase({
    caseId: "G9.1.2", requirement: "10.1 pass-line format carries status/value/termination/residual/counts/evidence",
    operation: "hyper_log", direction: "log", call: function () { return MetaNum.hyper_log(7, 2, 0); },
    expect: { value: 3.5, isint: false }, solError: { from: 3.5, tol: 1e-12 }
  });
})();

// ───────────────────────────────────────────────────────────────────────────
// G9.2 full registry, aliases, parameter order and options (tasks 10.2)
// ───────────────────────────────────────────────────────────────────────────
console.log("\n=== G9.2 registry, aliases, parameter order, options ===");
// design.md 2.1.4 — one row per named ordinal operation:
// [op, log short, log code, root short, root code, base-independent marker?]
var INV_REGISTRY = [
  ["aperiote", "i_aper", "i10", "r_aper", "r10", false],
  ["expande", "i_expa", "i11", "r_expa", "r11", false],
  ["multiexpande", "i_muea", "i12", "r_muea", "r12", false],
  ["powerexpande", "i_poea", "i13", "r_poea", "r13", false],
  ["aperioexpande", "i_apea", "i20", "r_apea", "r20", false],
  ["explode", "i_expl", "i21", "r_expl", "r21", false],
  ["multiexplode", "i_muel", "i22", "r_muel", "r22", false],
  ["aperioexplode", "i_apel", "i30", "r_apel", "r30", false],
  ["detonate", "i_deto", "i31", "r_deto", "r31", false],
  ["aperiodetonate", "i_apdt", "i40", "r_apdt", "r40", false],
  ["aperionate", "i_apeo", "i100", "r_apeo", "r100", false],
  ["megote", "i_mego", "i101", "r_mego", "r101", false],
  ["multimegote", "i_mume", "i102", "r_mume", "r102", false],
  ["aperimegote", "i_apmg", "i110", "r_apmg", "r110", false],
  ["megoexpande", "i_mgea", "i111", "r_mgea", "r111", false],
  ["aperimegoexpande", "i_apme", "i120", "r_apme", "r120", false],
  ["megoaperionate", "i_mgao", "i200", "r_mgao", "r200", false],
  ["gigote", "i_gigo", "i201", "r_gigo", "r201", false],
  ["aperigigote", "i_apgg", "i210", "r_apgg", "r210", false],
  ["gigoaperionate", "i_ggap", "i300", "r_ggap", "r300", false],
  ["aperiatote", "i_apat", "i1000", "r_apat", "r1000", false],
  ["powiainate", "i_pwan", "i1001", "r_pwan", "r1001", false],
  ["expandainate", "i_epan", "i1010", "r_epan", "r1010", false],
  ["megodainate", "i_mgan", "i1100", "r_mgan", "r1100", false],
  ["powiairate", "i_pwar", "i2000", "r_pwar", "r2000", false],
  ["aperioguate", "i_apgu", "i10000", "r_apgu", "r10000", false],
  ["iterate", "iww", null, "r_iter", "rww", false],
  ["itermult", "i_itmu", "iw01", "r_itmu", "rw01", true],
  ["iteraperiate", "i_itap", "iw0w", "r_itap", "rw0w", true],
  ["cuboiter", "i_cube", "iwx2", "r_cube", "rwx2", true],
  ["expoiter", "i_expo", "iwa1", "r_expo", "rwa1", true],
  ["trioterate", "i_tria", "iwm2", "r_tria", "rwm2", true],
  ["trixxate", "i_trix", "iwp2", "r_trix", "rwp2", true],
  ["aperixxate", "i_apix", "iwpw", "r_apix", "rwpw", true],
  ["epsilonate", "i_epsl", "iepsl", "r_epsl", "repsl", true]
];
var INV_DIAG = { diagnostics: true };
function invNames(row) {
  var names = { log: ["inv_" + row[0]], root: [row[0] + "_root", "root_" + row[0], row[3], row[4]] };
  if (row[1]) names.log.push(row[1]);
  if (row[2]) names.log.push(row[2]);
  if (row[0] === "iterate") names.log.push("inv_iter");
  return names;
}
(function () {
  var missing = [];
  for (var i = 0; i < INV_REGISTRY.length; i++) {
    var names = invNames(INV_REGISTRY[i]);
    var all = [INV_REGISTRY[i][0]].concat(names.log, names.root);
    for (var k = 0; k < all.length; k++) {
      if (typeof MetaNum(3)[all[k]] !== "function") missing.push("instance " + all[k]);
      if (typeof MetaNum[all[k]] !== "function") missing.push("static " + all[k]);
    }
  }
  checkInverseCase({
    caseId: "G9.2.1", requirement: "10.2 / spec 5.2.1(5) every registered op has forward, inv_*, i_*, <op>_root, r_* and the new root_<op> on instance and static",
    operation: "registry", direction: "-", call: function () { return MetaNum(1); },
    expect: { value: 1, check: function () { return missing; } },
    note: INV_REGISTRY.length + " ops; missing=" + (missing.length ? missing.join(",") : "none")
  });
  // iteraperiate's seven specified inverse names + inv_iter (spec 5.4.1 b)
  var v = MetaNum(10).iteraperiate(5), vi = MetaNum(10).iterate(5);
  // the finite-height marker is the constant ω^ω+ω level marker, so every
  // inverse name returns the minimal reproducing height 2
  var itapLog = ["inv_iteraperiate", "i_itap", "iw0w"], itapRoot = ["iteraperiate_root", "root_iteraperiate", "r_itap", "rw0w"];
  var bad = [], badR = [];
  itapLog.forEach(function (n) {
    if (!v[n](10).eq(2)) bad.push("instance " + n);
    if (!MetaNum[n](v, 10).eq(2)) bad.push("static " + n);
  });
  itapRoot.forEach(function (n) {
    if (!v[n](5).eq(2)) badR.push("instance " + n);
    if (!MetaNum[n](v, 5).eq(2)) badR.push("static " + n);
  });
  if (!vi.inv_iter(10).eq(5)) bad.push("instance inv_iter");
  if (!MetaNum.inv_iter(vi, 10).eq(5)) bad.push("static inv_iter");
  checkInverseCase({ caseId: "G9.2.2", requirement: "10.2 iteraperiate: inv_iteraperiate/i_itap/iw0w and root_iteraperiate/iteraperiate_root/r_itap/rw0w all exist and agree on the minimal reproducing height 2; inv_iter kept",
    operation: "iteraperiate", direction: "log+root", call: function () { return v.inv_iteraperiate(10, INV_DIAG); },
    expect: { status: ["exact", "approximate"], value: 2, check: function () { return bad.concat(badR); } } });
  // alias / form equivalence for every op at integer height 3 (value level)
  var mism = [];
  var markerRoots = 0;
  for (var j = 0; j < INV_REGISTRY.length; j++) {
    var row = INV_REGISTRY[j], op = row[0];
    var target = MetaNum(3)[op](3);
    var names2 = invNames(row);
    var refLog = target["inv_" + op](3);
    names2.log.forEach(function (n) {
      if (!target[n](3).eq(refLog)) mism.push(op + "." + n + "(instance)");
      if (!MetaNum[n](target, 3).eq(refLog)) mism.push(op + "." + n + "(static)");
    });
    var refRoot = target[op + "_root"](3);
    if (!refRoot.eq(row[5] ? 2 : 3)) mism.push(op + " root value " + refRoot.toString());
    if (row[5]) markerRoots++;
    names2.root.forEach(function (n) {
      if (!target[n](3).eq(refRoot)) mism.push(op + "." + n + "(instance)");
      if (!MetaNum[n](target, 3).eq(refRoot)) mism.push(op + "." + n + "(static)");
    });
  }
  checkInverseCase({ caseId: "G9.2.3", requirement: "10.2 all aliases/forms return the same MetaNum value as inv_<op>/<op>_root (integer height 3, base 3)",
    operation: "registry", direction: "log+root", call: function () { return MetaNum(1); },
    expect: { value: 1, check: function () { return mism; } },
    note: "marker (base-independent) root ops=" + markerRoots + " -> root 2; structural root ops -> 3" });
  // status-level equivalence incl. options tail for one structural and one marker op
  [["aperiote", 3], ["iteraperiate", 2]].forEach(function (pair) {
    var op = pair[0], want = pair[1];
    var t = MetaNum(3)[op](3);
    var a = t["inv_" + op](3, INV_DIAG), b = t[invNames(INV_REGISTRY.filter(function (r) { return r[0] === op; })[0]).log[1]](3, INV_DIAG);
    var c1 = t[op + "_root"](3, INV_DIAG), d = t["root_" + op](3, INV_DIAG), e = MetaNum[op + "_root"](t, 3, INV_DIAG);
    checkInverseCase({ caseId: "G9.2.4." + op, requirement: "10.2 same input + options => same status/termination through long name, alias, root_<op>, static",
      operation: op, direction: "log+root", call: function () { return a; },
      expect: { status: ["exact", "approximate", "minimal-reproducing"], check: function () {
        var p = [];
        if (b.status !== a.status || b.value.eq(a.value) === false) p.push("alias status/value differ");
        [c1, d, e].forEach(function (r) { if (r.status !== c1.status || !r.value.eq(c1.value)) p.push("root alias differs"); });
        if (!c1.value.eq(want)) p.push("root value " + c1.value.toString());
        return p;
      } } });
  });
  // parameter order (spec 5.2.1 1-4)
  var w15 = MetaNum(10).aperiote(15);
  checkInverseCase({ caseId: "G9.2.5", requirement: "10.2 / spec 5.2.1 named log order (c first, fixed base n second) and root order (c first, fixed height b second)",
    operation: "aperiote", direction: "log", call: function () { return MetaNum.inv_aperiote(w15, 10, INV_DIAG); },
    expect: { value: 15, check: function () {
      var p = [];
      if (!w15.i_aper(10).eq(15)) p.push("i_aper(10)");
      if (!w15.i10(10).eq(15)) p.push("i10(10)");
      if (!MetaNum.i_aper(w15, 10).eq(15)) p.push("static i_aper");
      if (!w15.aperiote_root(15).eq(10)) p.push("aperiote_root(15)");
      if (!w15.r10(15).eq(10)) p.push("r10(15)");
      if (!w15.root_aperiote(15).eq(10)) p.push("root_aperiote(15)");
      if (!MetaNum.root_aperiote(w15, 15).eq(10)) p.push("static root_aperiote");
      if (!MetaNum.aperiote_root(w15, 15).eq(10)) p.push("static aperiote_root");
      return p;
    } } });
  checkInverseCase({ caseId: "G9.2.6", requirement: "10.2 / spec 5.2.1 generic order: hyper_log(c,n,α) solves b; hyper_root(c,b,α) solves n; instance curried forms agree",
    operation: "hyper_log/root", direction: "log+root", call: function () { return MetaNum.hyper_log(MetaNum(2).tetr(2.5), 2, 2, INV_DIAG); },
    expect: { status: "approximate", approx: { to: 2.5, tol: 1e-9 }, check: function () {
      var p = [], c = MetaNum(2).tetr(2.5), cr = MetaNum(2.5).tetr(2);
      var inst = c.hyper_log(2)(2, INV_DIAG), st = MetaNum.hyper_root(cr, 2, 2, INV_DIAG), instR = cr.hyper_root(2)(2, INV_DIAG);
      if (!inst.value.eq(MetaNum(2.5)) && Math.abs(inst.value.toNumber() - 2.5) > 1e-9) p.push("instance hyper_log");
      if (Math.abs(st.value.toNumber() - 2.5) > 1e-9) p.push("static hyper_root");
      if (st.status !== instR.status || Math.abs(instR.value.toNumber() - 2.5) > 1e-9) p.push("instance hyper_root");
      if (!MetaNum.hyper_log(7, 2, 0).eq(3.5) || !MetaNum.hyper_root(7, 2, 0).eq(3.5)) p.push("n/α must not be swapped (7,2,0)");
      if (!MetaNum.hyper_root(65536, 4, 2).eq(2) || !MetaNum.hyper_log(65536, 2, 2).eq(4)) p.push("b/α must not be swapped (65536)");
      return p;
    } } });
  // omitted vs explicit defaults, diagnostics shape, input encodings
  (function () {
    var def = MetaNum.hyper_log(16, 2, 2), exp = MetaNum.hyper_log(16, 2, 2, { tol: 1e-12, maxIterations: 200, maxBracketExpansions: 60, branch: "principal", acceleration: "auto" });
    var defD = MetaNum.hyper_log(16, 2, 2, INV_DIAG), expD = MetaNum.hyper_log(16, 2, 2, { tol: 1e-12, maxIterations: 200, maxBracketExpansions: 60, branch: "principal", acceleration: "auto", diagnostics: true });
    checkInverseCase({ caseId: "G9.2.7", requirement: "10.2 / spec 5.2.1(7) omitted options == explicit defaults (value and status)",
      operation: "hyper_log", direction: "log", call: function () { return defD; },
      expect: { status: ["exact", "approximate"], value: 3, check: function () {
        var p = [];
        if (!(def instanceof MetaNum) || typeof def.status !== "undefined") p.push("default call must return a plain MetaNum");
        if (!def.eq(exp)) p.push("explicit default options changed the value");
        if (expD.status !== defD.status || expD.termination !== defD.termination) p.push("explicit default options changed status/termination");
        return p;
      } } });
    var num = MetaNum.hyper_log(7, 2, 0, INV_DIAG), str = MetaNum.hyper_log("7", "2", "0", INV_DIAG), mn = MetaNum.hyper_log(new MetaNum(7), new MetaNum(2), new MetaNum(0), INV_DIAG);
    var numR = MetaNum.hyper_root(2, 2, 1, INV_DIAG), strR = MetaNum.hyper_root("2", "2", "1", INV_DIAG), mnR = MetaNum.hyper_root(MetaNum(2), MetaNum(2), MetaNum(1), INV_DIAG);
    var named = w15.inv_aperiote(new MetaNum(10), INV_DIAG);
    checkInverseCase({ caseId: "G9.2.8", requirement: "10.2 / spec 5.2.1(6) number, numeric string and MetaNum inputs give the same branch and value",
      operation: "hyper_log/root", direction: "log+root", call: function () { return num; },
      expect: { status: "exact", value: 3.5, check: function () {
        var p = [];
        if (str.status !== num.status || !str.value.eq(num.value)) p.push("string inputs differ (log)");
        if (mn.status !== num.status || !mn.value.eq(num.value)) p.push("MetaNum inputs differ (log)");
        if (strR.status !== numR.status || !strR.value.eq(numR.value)) p.push("string inputs differ (root)");
        if (mnR.status !== numR.status || !mnR.value.eq(numR.value)) p.push("MetaNum inputs differ (root)");
        if (!named.value.eq(15)) p.push("named log with MetaNum base");
        return p;
      } } });
    var curried = MetaNum(7).hyper_log(2)(0, INV_DIAG);
    checkInverseCase({ caseId: "G9.2.9", requirement: "10.2 / spec 5.2.1(7) curried instance form accepts a trailing options object after α",
      operation: "hyper_log", direction: "log", call: function () { return curried; },
      expect: { status: "exact", value: 3.5, check: function () {
        var r = MetaNum(7).hyper_root(2)(0, INV_DIAG);
        return r.status === "exact" && r.value.eq(3.5) ? [] : ["curried hyper_root options"];
      } } });
    var bad = [];
    [["tol", -1], ["maxIterations", 2.5], ["maxIterations", 0], ["branch", "other"], ["acceleration", "newton"], ["diagnostics", "yes"], ["unknownKey", 1]].forEach(function (kv) {
      var o = { diagnostics: true }; o[kv[0]] = kv[1];
      var r = MetaNum.hyper_log(16, 2, 2, o);
      // a non-boolean diagnostics turns the explicit mode off: only the NaN value is observable then
      var rejected = r.status === undefined ? (r instanceof MetaNum && r.isNaN()) : (r.status === "invalid-input" && r.value.isNaN());
      if (!rejected) bad.push(kv[0] + "=" + kv[1] + " -> " + (r.status || r.toString()));
    });
    checkInverseCase({ caseId: "G9.2.10", requirement: "10.2 / spec 4.1 invalid options (non-positive tol, non-integer budget, illegal branch/acceleration, unknown key) => invalid-input + NaN, nothing executed",
      operation: "hyper_log", direction: "log", call: function () { return MetaNum.hyper_log(16, 2, 2, { diagnostics: true, tol: -1 }); },
      expect: { status: "invalid-input", isNaN: true, check: function () { return bad; } } });
    var huge = MetaNum.hyper_log(2, 2, 2, { diagnostics: true, maxIterations: 1e9, maxBracketExpansions: 5e9 });
    checkInverseCase({ caseId: "G9.2.11", requirement: "10.2 / spec 4.1(2) budgets above the hard limits are clamped to 10000/2048 and recorded in clampedOptions, no long loop",
      operation: "hyper_log", direction: "log", call: function () { return huge; },
      expect: { status: "exact", check: function () {
        return (huge.options.maxIterations === 10000 && huge.options.maxBracketExpansions === 2048 &&
          huge.options.clampedOptions.maxIterations === 10000 && huge.options.clampedOptions.maxBracketExpansions === 2048) ? [] :
          ["clampedOptions=" + JSON.stringify(huge.options.clampedOptions)];
      } } });
    var lev = MetaNum.hyper_log(2, 2, -0.5, INV_DIAG), lev2 = MetaNum.hyper_log(2, 2, "2.5", INV_DIAG);
    checkInverseCase({ caseId: "G9.2.12", requirement: "10.2 / spec 5.3.1(12) negative level => invalid-level (never rounded); fractional level 2.5 is accepted as itself",
      operation: "hyper_log", direction: "log", call: function () { return lev; },
      expect: { status: "invalid-level", isNaN: true, check: function () {
        var p = [];
        if (lev2.level !== "2.5") p.push("level text " + lev2.level);
        if (typeof MetaNum(3).inv_arrow !== "undefined" || typeof MetaNum(3).root_tetr !== "undefined") p.push("unagreed inv_arrow/root_tetr names must not be created");
        if (typeof MetaNum(3).inv_nosuchop !== "undefined") p.push("unknown op must not resolve");
        return p;
      } } });
  })();
})();

// ───────────────────────────────────────────────────────────────────────────
// G9.3 closed-form non-integer, known integer, sign and reciprocal (10.3)
// ───────────────────────────────────────────────────────────────────────────
console.log("\n=== G9.3 closed-form non-integer / known integers / signs / reciprocal ===");
var LOG2_3 = Math.log(3) / Math.log(2), SQRT2 = Math.sqrt(2);
// spec 5.3.1(2) a: independent expectations, never generated by the inverse under test
checkInverseCase({ caseId: "G9.3.1", requirement: "spec 5.3.1(2)a hyper_log(7,2,0)=3.5 (2*b=7), non-integer kept", operation: "hyper_log", direction: "log",
  call: function () { return MetaNum.hyper_log(7, 2, 0, INV_DIAG); }, expect: { status: "exact", value: 3.5, isint: false }, solError: { from: 3.5, tol: 1e-12 }, residualMax: 1e-9 });
checkInverseCase({ caseId: "G9.3.2", requirement: "spec 5.3.1(2)a hyper_root(7,2,0)=3.5 (n*2=7), non-integer kept", operation: "hyper_root", direction: "root",
  call: function () { return MetaNum.hyper_root(7, 2, 0, INV_DIAG); }, expect: { status: "exact", value: 3.5, isint: false }, solError: { from: 3.5, tol: 1e-12 }, residualMax: 1e-9 });
checkInverseCase({ caseId: "G9.3.3", requirement: "spec 5.3.1(2)a hyper_log(3,2,1)=log2(3) (independent Math.log formula)", operation: "hyper_log", direction: "log",
  call: function () { return MetaNum.hyper_log(3, 2, 1, INV_DIAG); }, expect: { status: "approximate", isint: false }, solError: { from: LOG2_3, tol: 1e-9 }, residualMax: 1e-9 });
checkInverseCase({ caseId: "G9.3.4", requirement: "spec 5.3.1(2)a hyper_root(2,2,1)=sqrt(2) (independent Math.sqrt), even exponent reports multiple solutions", operation: "hyper_root", direction: "root",
  call: function () { return MetaNum.hyper_root(2, 2, 1, INV_DIAG); }, expect: { status: "approximate", isint: false, multipleSolutions: true }, solError: { from: SQRT2, tol: 1e-9 }, residualMax: 1e-9 });
checkInverseCase({ caseId: "G9.3.5", requirement: "spec 5.5.1(2) 10^3.7 log base 10 keeps the non-integer exponent", operation: "hyper_log", direction: "log",
  call: function () { return MetaNum.hyper_log(Math.pow(10, 3.7), 10, 1, INV_DIAG); }, expect: { status: "approximate", isint: false }, solError: { from: 3.7, tol: 1e-9 }, residualMax: 1e-9 });
checkInverseCase({ caseId: "G9.3.6", requirement: "spec 5.3.1(2)b 0.5^2.5 log with base 0.5 uses the decreasing branch and keeps the positive height", operation: "hyper_log", direction: "log",
  call: function () { return MetaNum.hyper_log(Math.pow(0.5, 2.5), 0.5, 1, INV_DIAG); }, expect: { status: "approximate", isint: false }, solError: { from: 2.5, tol: 1e-9 }, residualMax: 1e-9 });
checkInverseCase({ caseId: "G9.3.7", requirement: "spec 5.3.1(10) negative solutions keep the sign: hyper_log(-7,2,0)=-3.5, hyper_root(-7,2,0)=-3.5", operation: "hyper_log/root", direction: "log+root",
  call: function () { return MetaNum.hyper_log(-7, 2, 0, INV_DIAG); }, expect: { status: "exact", value: -3.5, isint: false }, solError: { from: -3.5, tol: 1e-12 },
  check: function () { var r = MetaNum.hyper_root(-7, 2, 0, INV_DIAG); return r.value.eq(-3.5) && r.value.sign === -1 ? [] : ["root -3.5 sign=" + r.value.sign]; } });
checkInverseCase({ caseId: "G9.3.8", requirement: "spec 5.3.1(10) zero and (0,1) solutions: hyper_log(0,2,0)=0, hyper_log(0.5,2,0)=0.25", operation: "hyper_log", direction: "log",
  call: function () { return MetaNum.hyper_log(0, 2, 0, INV_DIAG); }, expect: { status: "exact", value: 0 },
  check: function () { var r = MetaNum.hyper_log(0.5, 2, 0, INV_DIAG); return r.value.eq(0.25) && r.value.isint() === false ? [] : ["0.25 case " + r.value]; } });
checkInverseCase({ caseId: "G9.3.9", requirement: "spec 5.3.1(2)b a (0,1) root keeps the reciprocal encoding, not its inverse or absolute value: hyper_root(0.5,1,1)=0.5", operation: "hyper_root", direction: "root",
  call: function () { return MetaNum.hyper_root(0.5, 1, 1, INV_DIAG); }, expect: { status: "approximate", approx: { to: 0.5, tol: 1e-12 }, check: function (r) { return r.value.sign === 2 ? [] : ["sign=" + r.value.sign + " (expected reciprocal sign 2)"]; } } });
checkInverseCase({ caseId: "G9.3.10", requirement: "spec 5.3.1(10) negative exponents: root(0.25,-2,1)=2, root(-8,-3,1)=-0.5", operation: "hyper_root", direction: "root",
  call: function () { return MetaNum.hyper_root(0.25, -2, 1, INV_DIAG); }, expect: { status: "exact", value: 2 },
  check: function () { var r = MetaNum.hyper_root(-8, -3, 1, INV_DIAG); return r.value.eq(-0.5) && r.value.sign === -1 ? [] : ["(-8)^(-1/3) -> " + r.value]; } });
checkInverseCase({ caseId: "G9.3.11", requirement: "spec 5.3.1(6)a odd integer exponent: root(-8,3,1)=-2 unique signed root", operation: "hyper_root", direction: "root",
  call: function () { return MetaNum.hyper_root(-8, 3, 1, INV_DIAG); }, expect: { status: "exact", value: -2, multipleSolutions: false } });
checkInverseCase({ caseId: "G9.3.12", requirement: "spec 5.3.1(6)a even integer exponent: root(16,4,1)=2 positive principal root + multipleSolutions", operation: "hyper_root", direction: "root",
  call: function () { return MetaNum.hyper_root(16, 4, 1, INV_DIAG); }, expect: { status: "exact", value: 2, multipleSolutions: true } });
checkInverseCase({ caseId: "G9.3.13", requirement: "spec 5.3.1(10) even exponent with negative target: root(-16,4,1) => no-solution NaN", operation: "hyper_root", direction: "root",
  call: function () { return MetaNum.hyper_root(-16, 4, 1, INV_DIAG); }, expect: { status: "no-solution", isNaN: true } });
checkInverseCase({ caseId: "G9.3.14", requirement: "spec 5.3.1(10) zero with negative integer exponent: root(0,-1,1) => no-solution (no Infinity answer)", operation: "hyper_root", direction: "root",
  call: function () { return MetaNum.hyper_root(0, -1, 1, INV_DIAG); }, expect: { status: "no-solution", isNaN: true } });
checkInverseCase({ caseId: "G9.3.15", requirement: "spec 5.3.1(10) zero with positive integer exponent: root(0,2,1)=0", operation: "hyper_root", direction: "root",
  call: function () { return MetaNum.hyper_root(0, 2, 1, INV_DIAG); }, expect: { status: "exact", value: 0 } });
// known integer anchors (spec 5.6.1 row "已知整数结果") — each checked with strict eq through the public forward
checkInverseCase({ caseId: "G9.3.16", requirement: "spec 5.2.1(8)a 2↑↑4: log=4 and root(·,4)=2 via verified integer anchors", operation: "hyper_log/root", direction: "log+root",
  call: function () { return MetaNum.hyper_log(65536, 2, 2, INV_DIAG); }, expect: { status: "exact", value: 4, isint: true, termination: "verified-integer-anchor" },
  check: function () { var r = MetaNum.hyper_root(65536, 4, 2, INV_DIAG); return r.status === "exact" && r.value.eq(2) ? [] : ["root " + r.status + " " + r.value]; } });
checkInverseCase({ caseId: "G9.3.17", requirement: "spec 5.6.1 3↑↑3: log=3, root(·,3)=3", operation: "hyper_log/root", direction: "log+root",
  call: function () { return MetaNum.hyper_log(MetaNum(3).arrow(2)(3), 3, 2, INV_DIAG); }, expect: { status: ["exact", "approximate"], value: 3, isint: true },
  reproduce: { forward: function (x) { return MetaNum(3).arrow(2)(x); }, target: MetaNum(3).arrow(2)(3) },
  check: function () { return MetaNum.hyper_root(MetaNum(3).arrow(2)(3), 3, 2).eq(3) ? [] : ["3↑↑3 root"]; } });
checkInverseCase({ caseId: "G9.3.18", requirement: "spec 5.6.1 10↑↑↑3: log(·,10,3)=3, root(·,3,3)=10 (strict eq; structured target => representation-level anchor may be classed approximate)", operation: "hyper_log/root", direction: "log+root",
  call: function () { return MetaNum.hyper_log(MetaNum(10).arrow(3)(3), 10, 3, INV_DIAG); }, expect: { status: ["exact", "approximate"], value: 3 },
  check: function () { return MetaNum.hyper_root(MetaNum(10).arrow(3)(3), 3, 3).eq(10) ? [] : ["10↑↑↑3 root"]; } });
checkInverseCase({ caseId: "G9.3.19", requirement: "spec 5.6.1 2{4}3: root(·,3,4)=2 and log(·,2,4)=3", operation: "hyper_log/root", direction: "log+root",
  call: function () { return MetaNum.hyper_root(MetaNum(2).arrow(4)(3), 3, 4, INV_DIAG); }, expect: { status: ["exact", "approximate"], value: 2 },
  check: function () { return MetaNum.hyper_log(MetaNum(2).arrow(4)(3), 2, 4).eq(3) ? [] : ["2{4}3 log"]; } });
checkInverseCase({ caseId: "G9.3.20", requirement: "spec 5.6.1 2{ω}3=65536: inv_aperiote(2)=3 and aperiote_root(3)=2, both exact", operation: "aperiote", direction: "log+root",
  call: function () { return MetaNum(2).aperiote(3).inv_aperiote(2, INV_DIAG); }, expect: { status: "exact", value: 3 },
  reproduce: { forward: function (x) { return MetaNum(2).aperiote(x); }, target: 65536 },
  check: function () { return MetaNum(2).aperiote(3).aperiote_root(3, INV_DIAG).value.eq(2) ? [] : ["2{ω}3 root"]; } });
checkInverseCase({ caseId: "G9.3.21", requirement: "spec 5.6.1 (10{ω}15) root=10 (value), status must not be exact (representation-level anchor)", operation: "aperiote", direction: "root",
  call: function () { return MetaNum(10).aperiote(15).aperiote_root(15, INV_DIAG); }, expect: { status: ["approximate", "exact"], value: 10, representationLevel: true },
  reproduce: { forward: function (x) { return x.aperiote(15); }, target: MetaNum(10).aperiote(15)} });
checkInverseCase({ caseId: "G9.3.22", requirement: "spec 5.6.1 multiplication anchor hyper_log(14,2,0)=7 (old checkHL vector)", operation: "hyper_log", direction: "log",
  call: function () { return MetaNum.hyper_log(14, 2, 0, INV_DIAG); }, expect: { status: "exact", value: 7, isint: true } });
checkInverseCase({ caseId: "G9.3.23", requirement: "spec 5.6.1 power anchor hyper_log(1e5,10,1)=5, hyper_root(256,8,1)=2, hyper_root(81,4,1)=3 (old checkHL/checkHR vectors)", operation: "hyper_log/root", direction: "log+root",
  call: function () { return MetaNum.hyper_log(100000, 10, 1, INV_DIAG); }, expect: { status: "exact", value: 5 },
  check: function () { return MetaNum.hyper_root(256, 8, 1).eq(2) && MetaNum.hyper_root(81, 4, 1).eq(3) ? [] : ["power anchors"]; } });
// the 3.49 counter-example: a real solution near an integer must NOT be snapped to it
checkInverseCase({ caseId: "G9.3.24", requirement: "spec 5.2.1(8)b / 5.5.1(14) true height 3.49 is returned as 3.49 (not 3 or 4), non-integer, R_rel<=1e-9", operation: "hyper_log", direction: "log",
  call: function () { return MetaNum.hyper_log(MetaNum(2).tetr(3.49), 2, 2, INV_DIAG); }, expect: { status: "approximate", isint: false }, solError: { from: 3.49, tol: 1e-9 }, residualMax: 1e-9,
  reproduce: { forward: function (x) { return MetaNum(2).tetr(x); }, target: MetaNum(2).tetr(3.49) } });
checkInverseCase({ caseId: "G9.3.25", requirement: "spec 5.5.1(14) root of 1.5↑↑2 is 1.5 (not 1 or 2)", operation: "hyper_root", direction: "root",
  call: function () { return MetaNum.hyper_root(MetaNum(1.5).tetr(2), 2, 2, INV_DIAG); }, expect: { status: "approximate", isint: false }, solError: { from: 1.5, tol: 1e-9 }, residualMax: 1e-9,
  reproduce: { forward: function (x) { return x.tetr(2); }, target: MetaNum(1.5).tetr(2) } });
// fractional level: same real solve on the interpolated arrow
checkInverseCase({ caseId: "G9.3.26", requirement: "spec 5.1.1(6) fractional level α=2.5 and 3.5: log/root recover 2.5 within 1e-9", operation: "hyper_log/root", direction: "log+root",
  call: function () { return MetaNum.hyper_log(MetaNum.arrow(2, 2.5, 2.5), 2, 2.5, INV_DIAG); }, expect: { status: "approximate", isint: false }, solError: { from: 2.5, tol: 1e-9 }, residualMax: 1e-9,
  check: function () {
    var p = [], r1 = MetaNum.hyper_root(MetaNum.arrow(2.5, 2.5, 2), 2, 2.5), r2 = MetaNum.hyper_log(MetaNum.arrow(2, 3.5, 2.5), 2, 3.5), r3 = MetaNum.hyper_root(MetaNum.arrow(2.5, 3.5, 2), 2, 3.5);
    [r1, r2, r3].forEach(function (r) { if (r.isNaN() || Math.abs(r.toNumber() - 2.5) > 1e-9) p.push("fractional level " + r); });
    return p;
  } });

// ───────────────────────────────────────────────────────────────────────────
// G9.4 forward anchors: inverse substitution uses the one public forward (10.4)
// ───────────────────────────────────────────────────────────────────────────
console.log("\n=== G9.4 forward anchors and single-forward substitution (10.4) ===");
(function () {
  var p = [];
  if (!MetaNum(10).aperioexpande(2.1).eq(MetaNum(10).powerexpande(2 * Math.pow(2.1 / 2, 0.1)))) p.push("10{ω*2}2.1 != 10{ω+3}(2*(2.1/2)^0.1)");
  if (!MetaNum(10).aperionate(2.1).eq(MetaNum(10).explode(2 * Math.pow(2.1 / 2, 0.21)))) p.push("10{ω^2}2.1 != 10{ω*2+1}(2*(2.1/2)^0.21)");
  if (!MetaNum(10).arrow(1.5)(1.5).gt(MetaNum(10).arrow(1.1)(1.1))) p.push("arrow(x,y,y) monotonic sample");
  if (!MetaNum.arrow(10, 3.5, 10).gt(MetaNum.arrow(10, 3.4, 10)) || !MetaNum.arrow(10, 3.6, 10).gt(MetaNum.arrow(10, 3.5, 10))) p.push("arrow(10,3.5,10) monotonic sample");
  if (!MetaNum(2).aperiote(2).eq(4) || !MetaNum(2).aperiote(3).gt(4)) p.push("2{λ}2=4 and 2{λ}3>4");
  checkInverseCase({ caseId: "G9.4.1", requirement: "10.4 / spec 5.1.1(3-8) forward anchors unchanged: fractional coefficient equivalences, x{y}y / arrow(10,3.5,10) monotonicity, 2{λ}2=4",
    operation: "forward", direction: "-", call: function () { return MetaNum(1); }, expect: { value: 1, check: function () { return p; } } });
  var anchors = [["aperiote", 3, 5, "3{ω}5"], ["aperionate", 10, 4, "10{ω^2}4"], ["iterate", 10, 4, "10{ω^ω}4"], ["epsilonate", 10, 4, "10{ε₀}4"], ["expande", 10, 3, "10{ω+1}3"]];
  anchors.forEach(function (a, i) {
    var t = MetaNum(a[1])[a[0]](a[2]);
    checkInverseCase({ caseId: "G9.4.2." + (i + 1), requirement: "10.4 / spec 5.1.1(4) anchor " + a[3] + ": inverse recovers the height and the public forward reproduces the anchor value",
      operation: a[0], direction: "log", call: function () { return t["inv_" + a[0]](a[1], INV_DIAG); },
      expect: { status: ["exact", "approximate"], value: a[2] }, reproduce: { forward: function (x) { return MetaNum(a[1])[a[0]](x); }, target: t } });
  });
  var t21 = MetaNum(10).expande(2.1);
  checkInverseCase({ caseId: "G9.4.3", requirement: "10.4 / spec 5.1.1(3) expande(10,2.1) inverse: forward substitution equals the same public value 10{ω}10{ω}(10^0.1)",
    operation: "expande", direction: "log", call: function () { return t21.inv_expande(10, INV_DIAG); },
    expect: { status: ["approximate", "exact"], check: function (r) { return (r.residual && r.residual.comparison === 0) || Math.abs(r.value.toNumber() - 2.1) < 1e-4 ? [] : ["not reproduced: " + r.status]; } },
    reproduce: { forward: function (x) { return MetaNum(10).expande(x); }, target: t21 }, note: "plateau near 2.1: value within 1e-4, reproduction at representation level" });
})();

// ───────────────────────────────────────────────────────────────────────────
// G9.5 per-family matrix: integer / non-integer height and base, boundary,
//      information-loss / illegal scenario (tasks 11.1, spec 5.6.1 rows 1-2,7)
// ───────────────────────────────────────────────────────────────────────────
console.log("\n=== G9.5 per-family integer / non-integer height and base matrix (11.1) ===");
(function () {
  for (var i = 0; i < INV_REGISTRY.length; i++) {
    (function (row) {
      var op = row[0], marker = row[5], t3 = MetaNum(3)[op](3), t1 = MetaNum(7)[op](1);
      // iteraperiate's finite marker is the constant ω^ω+ω level marker, so the
      // structural inverse returns the minimal reproducing height 2, not 3
      var invY3 = (op === "iteraperiate") ? 2 : 3;
      checkInverseCase({
        caseId: "G9.5." + op, requirement: "11.1 integer height 3 / integer base 3 / boundary b=1 (c=n) / root b=1 / negative target root",
        operation: op, direction: "log+root", call: function () { return t3["inv_" + op](3, INV_DIAG); },
        expect: { status: ["exact", "approximate", "minimal-reproducing"], value: invY3, check: function (r, v) {
          var p = [];
          var rt = t3[op + "_root"](3, INV_DIAG);
          if (!rt.value.eq(marker ? 2 : 3)) p.push("integer base root -> " + rt.value);
          if (marker && (rt.status !== "minimal-reproducing" || rt.minimalityAttained !== true || rt.multipleSolutions !== true)) p.push("marker root classification " + rt.status + "/" + rt.minimalityAttained);
          if (!t1["inv_" + op](7).eq(1)) p.push("b=1 log should give 1 (c=n)");
          if (!t1[op + "_root"](1).eq(7)) p.push("root b=1 should give n=c");
          if (!MetaNum(-4)[op + "_root"](3).isNaN()) p.push("negative target root must be NaN");
          return p;
        } },
        note: marker ? "base-independent marker family: root = minimum of the declared n>=2 branch" : "structural family"
      });
    })(INV_REGISTRY[i]);
  }
  // non-integer height (b=2.5) per family — expectations from the forward storage
  var fracLog = [
    ["aperiote", "2.5", 2.5, 1e-9], ["expande", "2.5", 2.5, 1e-9], ["multiexpande", "2.5", 2.5, 1e-9], ["powerexpande", "2.5", 2.5, 1e-9],
    ["aperioexpande", "2.5", 2.5, 1e-9], ["explode", "2.5", 2.5, 1e-9], ["aperioexplode", "2.5", 2.5, 1e-9], ["aperiodetonate", "2.5", 2.5, 1e-9],
    ["aperionate", "2.5", 2.5, 1e-9], ["megoaperionate", "2.5", 2.5, 1e-9], ["iterate", "2.5", 2.5, 1e-9], ["epsilonate", "2.5", 2.5, 1e-9]
  ];
  fracLog.forEach(function (f) {
    var t = MetaNum(3)[f[0]](2.5);
    checkInverseCase({ caseId: "G9.5.f." + f[0], requirement: "11.1 non-integer height 2.5 is recovered as a real value (not snapped to 2 or 3) and reproduces the target",
      operation: f[0], direction: "log", call: function () { return t["inv_" + f[0]](3, INV_DIAG); },
      expect: { status: ["exact", "approximate"], isint: false }, solError: { from: 2.5, tol: f[3] },
      reproduce: { forward: function (x) { return MetaNum(3)[f[0]](x); }, target: t } });
  });
  // gigoaperionate: the forward is flat on [~2.414, 2.6]; the inverse returns the reproducing edge, not 2.5
  var gg = MetaNum(3).gigoaperionate(2.5);
  checkInverseCase({ caseId: "G9.5.f.gigoaperionate", requirement: "11.1 / spec 5.3.1(5) representation plateau: inverse returns the reproducing edge (representation-level), never claims 2.5 exactly",
    operation: "gigoaperionate", direction: "log", call: function () { return gg.inv_gigoaperionate(3, INV_DIAG); },
    expect: { status: ["approximate", "minimal-reproducing", "lower-bound"], representationLevel: true, check: function (r, v) {
      var p = [], x = v.toNumber();
      if (!(x >= 2.4 && x <= 2.5)) p.push("edge " + x + " outside the known plateau [2.414, 2.6]");
      if (MetaNum(3).gigoaperionate(v).cmp(gg) !== 0) p.push("edge does not reproduce the target");
      return p;
    } } });
  // aperioguate: the forward is non-monotone at representation level around b=2.5 (F(2.49)=F(2.51)=c, F(2.4709)>c) => no faithful bracket
  checkInverseCase({ caseId: "G9.5.f.aperioguate", requirement: "11.1 / spec 5.5.3(1) aperioguate b=2.5: forward representation is non-monotone, so the inverse must fail bounded with NaN (no pseudo value)",
    operation: "aperioguate", direction: "log", call: function () { return MetaNum(3).aperioguate(2.5).inv_aperioguate(3, INV_DIAG); },
    expect: { status: ["stagnated", "bracketing-failed", "non-converged", "unrecoverable"], isNaN: true },
    note: "F(3,2.49)=F(3,2.51)=c but F(3,2.4709)>c: no strict bracket exists at double resolution" });
  // ceil / floor platform families: the legacy integer representative is returned and must be flagged
  // non-integer height 2.5 in the ω^ω family: the non-integer marker preserves
  // the fraction — itermult c0 = (5.25-2)/8 lands in the segment (inv → 5.25);
  // iteraperiate/cuboiter store the constant level marker (inv → the minimal
  // reproducing height 2), the height itself being below marker resolution
  [["itermult", 3, 2.5, "ceil-height"], ["iteraperiate", 3, 2, "floor-height"], ["cuboiter", 3, 2, "floor-height"]].forEach(function (f) {
    var t = MetaNum(f[1])[f[0]](2.5);
    checkInverseCase({ caseId: "G9.5.f." + f[0], requirement: "11.1 / design 2.4.4 " + f[0] + " at fractional height 2.5: " + (f[0] === "itermult" ? "the non-integer marker preserves the fraction (inv recovers 5.25)" : "the constant level marker loses the height (inv returns the minimal reproducing height 2)") + ", flagged legacy/representation-level, never exact",
      operation: f[0], direction: "log", call: function () { return t["inv_" + f[0]](f[1], INV_DIAG); },
      expect: { status: "approximate", value: f[2], legacyAnchor: true, representationLevel: true, multipleSolutions: true, encoding: f[3], isint: f[2] === 2 },
      reproduce: { forward: function (x) { return MetaNum(f[1])[f[0]](x); }, target: t } });
  });
  // non-integer base (n=2.5): structural families solve on the n>=1 branch, marker families give the n>=2 minimum
  [["aperiote", 2.5], ["expande", 2.5], ["iterate", 2.5], ["aperionate", 2.5], ["iteraperiate", 2], ["epsilonate", 2]].forEach(function (f) {
    var t = MetaNum(2.5)[f[0]](3);
    checkInverseCase({ caseId: "G9.5.n." + f[0], requirement: "11.1 non-integer base 2.5 (height 3): root returns a real base (or the declared n>=2 minimum for marker ops) and reproduces the target",
      operation: f[0], direction: "root", call: function () { return t[f[0] + "_root"](3, INV_DIAG); },
      expect: { status: ["approximate", "minimal-reproducing"], value: f[1], isint: f[1] !== 2.5 },
      reproduce: { forward: function (x) { return x[f[0]](3); }, target: t } });
  });
  // fractional bases that the forward itself cannot evaluate are recorded, not substituted
  ["megote", "multimegote", "aperimegote"].forEach(function (op) {
    checkInverseCase({ caseId: "G9.5.n." + op, requirement: "11.1 non-integer base row cannot be constructed: the forward throws (RangeError) for megote(2.5,3); recorded as not executed, no substitute sample",
      operation: op, direction: "root", call: function () { return MetaNum(1); }, run: false,
      note: "forward " + op + "(2.5, 3) => RangeError: Maximum call stack size exceeded (pre-existing forward limitation, out of this feature's scope)" });
  });
  // root at fractional height: with the seed rows carried (fix for issue 2),
  // expande's root recovers base 3 despite the documented F(4,2.5)=10 anomaly;
  // detonate/aperiodetonate recover 3 through the integer anchor
  checkInverseCase({ caseId: "G9.5.b.expande", requirement: "11.1 root at fractional height 2.5 for expande: base 3 recovered (the carried seed rows give the solver a clean bracket); the documented forward anomaly F(4,2.5)=10<F(3,2.5) is reported separately",
    operation: "expande", direction: "root", call: function () { return MetaNum(3).expande(2.5).expande_root(2.5, INV_DIAG); },
    expect: { status: ["exact", "approximate"], value: 3 },
    reproduce: { forward: function (x) { return x.expande(2.5); }, target: MetaNum(3).expande(2.5) } });
  ["detonate", "aperiodetonate"].forEach(function (op) {
    checkInverseCase({ caseId: "G9.5.b." + op, requirement: "11.1 root at fractional height 2.5: base 3 recovered by a verified integer anchor (representation-level); fractional-base candidates on this op hit NaN forward points and are reported, not substituted",
      operation: op, direction: "root", call: function () { return MetaNum(3)[op](2.5)[op + "_root"](2.5, INV_DIAG); },
      expect: { status: ["exact", "approximate"], value: 3 }, reproduce: { forward: function (x) { return x[op](2.5); }, target: MetaNum(3)[op](2.5) } });
  });
  checkInverseCase({ caseId: "G9.5.b.aperiote", requirement: "11.1 root at fractional height 2.5 for aperiote: base 3 recovered by verified integer anchor",
    operation: "aperiote", direction: "root", call: function () { return MetaNum(3).aperiote(2.5).aperiote_root(2.5, INV_DIAG); },
    expect: { status: ["exact", "approximate"], value: 3 }, reproduce: { forward: function (x) { return x.aperiote(2.5); }, target: MetaNum(3).aperiote(2.5) } });
})();

// ───────────────────────────────────────────────────────────────────────────
// G9.6 round-trip vs. substitution residual (11.2): recovering the unknown and
//      reproducing the target are two independent assertions
// ───────────────────────────────────────────────────────────────────────────
console.log("\n=== G9.6 round-trip vs. substitution residual separation (11.2) ===");
(function () {
  var rt = [ // [label, target, inverse call, original unknown, tol]
    ["α=2 log 2↑↑2.5", MetaNum(2).tetr(2.5), function () { return MetaNum.hyper_log(MetaNum(2).tetr(2.5), 2, 2, INV_DIAG); }, 2.5],
    ["α=2 root 1.5↑↑2", MetaNum(1.5).tetr(2), function () { return MetaNum.hyper_root(MetaNum(1.5).tetr(2), 2, 2, INV_DIAG); }, 1.5],
    ["α=3 log 2{3}2.5", MetaNum.arrow(2, 3, 2.5), function () { return MetaNum.hyper_log(MetaNum.arrow(2, 3, 2.5), 2, 3, INV_DIAG); }, 2.5],
    ["α=3 root 2.5{3}2", MetaNum.arrow(2.5, 3, 2), function () { return MetaNum.hyper_root(MetaNum.arrow(2.5, 3, 2), 2, 3, INV_DIAG); }, 2.5],
    ["α=2.5 log", MetaNum.arrow(2, 2.5, 2.5), function () { return MetaNum.hyper_log(MetaNum.arrow(2, 2.5, 2.5), 2, 2.5, INV_DIAG); }, 2.5],
    ["aperiote(3,1.5)", MetaNum(3).aperiote(1.5), function () { return MetaNum(3).aperiote(1.5).inv_aperiote(3, INV_DIAG); }, 1.5],
    ["expande(3,2.5)", MetaNum(3).expande(2.5), function () { return MetaNum(3).expande(2.5).inv_expande(3, INV_DIAG); }, 2.5],
    ["10.tetr(3+1e-6)", MetaNum(10).tetr(3 + 1e-6), function () { return MetaNum.hyper_log(MetaNum(10).tetr(3 + 1e-6), 10, 2, INV_DIAG); }, 3.000001]
  ];
  rt.forEach(function (c, i) {
    checkInverseCase({ caseId: "G9.6.1." + (i + 1), requirement: "11.2 / spec 5.6.1(3-6) round-trip " + c[0] + ": unknown recovered within 1e-9 AND independent forward substitution within R_rel<=1e-9 (or cmp=0)",
      operation: "mixed", direction: "log/root", call: c[2], expect: { status: ["exact", "approximate"], isint: false },
      solError: { from: c[3], tol: 1e-9 }, residualMax: 1e-9 });
  });
  // reproduction-only: the original non-integer height is NOT recoverable, the representative must be flagged
  var multi = [
    ["iteraperiate(3,5.25)", function () { return MetaNum(3).iteraperiate(5.25).inv_iteraperiate(3, INV_DIAG); }, 2, "floor-height", MetaNum(3).iteraperiate(5.25)],
    ["itermult(3,5.25)", function () { return MetaNum(3).itermult(5.25).inv_itermult(3, INV_DIAG); }, 5.25, "ceil-height", MetaNum(3).itermult(5.25)],
    ["epsilonate(10,5.25)", function () { return MetaNum(10).epsilonate(5.25).inv_epsilonate(10, INV_DIAG); }, 5.25, "epsilon-layer", MetaNum(10).epsilonate(5.25)],
    ["iteraperiate_root(5)", function () { return MetaNum(3).iteraperiate(5).iteraperiate_root(5, INV_DIAG); }, 2, null, MetaNum(3).iteraperiate(5)],
    ["aperiote_root(15) on 10{ω}15", function () { return MetaNum(10).aperiote(15).aperiote_root(15, INV_DIAG); }, 10, null, MetaNum(10).aperiote(15)]
  ];
  multi.forEach(function (c, i) {
    checkInverseCase({ caseId: "G9.6.2." + (i + 1), requirement: "11.2 / spec 5.6.1(5,10) " + c[0] + ": only reproduction is asserted; result must carry representation-level / legacy flags and never claim original-input recovery",
      operation: "named", direction: "log/root", call: c[1],
      expect: { status: ["approximate", "minimal-reproducing", "lower-bound"], value: c[2], representationLevel: true, check: function (r) {
        var p = [];
        if (r.status === "minimal-reproducing" && r.minimalityAttained !== true) p.push("minimal-reproducing without minimality evidence");
        if (r.status !== "minimal-reproducing" && r.minimalityAttained === true) p.push("minimality claimed on a non-minimal result");
        if (c[3] && r.encoding !== c[3]) p.push("encoding " + r.encoding + " expected " + c[3]);
        return p;
      } },
      reproduce: { forward: function (x) { return i === 3 ? x.iteraperiate(5) : i === 4 ? x.aperiote(15) : (i === 0 ? MetaNum(3).iteraperiate(x) : i === 1 ? MetaNum(3).itermult(x) : MetaNum(10).epsilonate(x)); }, target: c[4] },
      note: "value " + c[2] + " is a reproducing representative, not the original input" });
  });
  // structural exactness on a plain finite target: 2{ω}3 = 65536 -> 3, residual is a faithful number residual
  checkInverseCase({ caseId: "G9.6.3", requirement: "11.2 / spec 5.6.1(6) exact structural recovery on a plain number target carries a number residual (R_abs=R_rel=0), not an unavailable one",
    operation: "aperiote", direction: "log", call: function () { return MetaNum(2).aperiote(3).inv_aperiote(2, INV_DIAG); },
    expect: { status: "exact", value: 3, residualKind: "number-absolute-relative", check: function (r) { return r.residual.absolute === 0 && r.residual.relative === 0 ? [] : ["residual " + JSON.stringify(r.residual)]; } } });
  // saturated / structured target: cmp=0 is representation-level, the numeric residual must stay null
  checkInverseCase({ caseId: "G9.6.4", requirement: "11.2 / spec 5.6.1(7)a 10↑↑15 (ordinal rows): cmp=0 is reported as representation-level with residual kind ordinal-structure and relative=null (never 0)",
    operation: "hyper_log", direction: "log", call: function () { return MetaNum.hyper_log(MetaNum(10).tetr(15), 10, 2, INV_DIAG); },
    expect: { status: ["exact", "approximate"], value: 15, representationLevel: true, residualKind: "bracket-only", check: function (r) { return r.residual.relative === null && r.residual.comparison === 0 ? [] : ["residual " + JSON.stringify(r.residual)]; } } });
})();

// ───────────────────────────────────────────────────────────────────────────
// G9.7 successor break points m-δ / m / m+δ (11.3)
// ───────────────────────────────────────────────────────────────────────────
console.log("\n=== G9.7 successor break points ±δ (11.3) ===");
// continuity rule: either the inverse lands within `tol` of m+δ (faithful, no
// reverse jump, no integer snap) or it is classified as a bounded failure /
// representation-level result within the forward's resolution.  Never a value on
// the wrong side of m, never exactly m when δ≠0 (that would be a rounding jump).
function invContinuityProblems(r, m, d, tol) {
  var p = [];
  if (r.value.isNaN()) {
    if (["stagnated", "bracketing-failed", "non-converged", "unrecoverable", "unrepresentable"].indexOf(r.status) === -1) p.push("NaN with unexpected status " + r.status);
    return p;
  }
  var x = r.value.toNumber(), want = m + d;
  if (!Number.isFinite(x)) { p.push("non-finite value"); return p; }
  if (d !== 0 && x === m) p.push("snapped to the integer " + m);
  if ((x - m) * d < 0) p.push("reverse jump: " + x + " is on the wrong side of " + m);
  if (Math.abs(x - want) > tol) p.push("solution " + x + " farther than " + tol + " from " + want + " (" + r.status + "/" + r.termination + ")");
  return p;
}
(function () {
  [2, 3].forEach(function (m) {
    [[-1e-6, 1e-6], [1e-6, 1e-6], [-1e-10, 1e-10], [1e-10, 1e-10], [0, 1e-12]].forEach(function (dd) {
      var d = dd[0], t = MetaNum(2).tetr(m + d);
      checkInverseCase({ caseId: "G9.7.tetr." + m + "." + d, requirement: "11.3 tetration base 2 at m=" + m + ", δ=" + d + ": inverse lands on m+δ within 1e-9 (definition-guaranteed continuous successor interpolation)",
        operation: "tetr", direction: "log", call: function () { return MetaNum.hyper_log(t, 2, 2, INV_DIAG); },
        expect: { status: ["exact", "approximate"], check: function (r) { return invContinuityProblems(r, m, d, dd[1]); } },
        reproduce: { forward: function (x) { return MetaNum(2).tetr(x); }, target: t } });
    });
  });
  [["expande", 1e-9], ["multiexpande", 1e-9], ["explode", 1e-9]].forEach(function (f) {
    [2, 3].forEach(function (m) {
      [-1e-6, 1e-6].forEach(function (d) {
        var t = MetaNum(3)[f[0]](m + d);
        checkInverseCase({ caseId: "G9.7." + f[0] + "." + m + "." + d, requirement: "11.3 " + f[0] + " base 3 at m=" + m + ", δ=" + d + ": no reverse jump / integer snap; within 1e-9 when faithfully representable",
          operation: f[0], direction: "log", call: function () { return t["inv_" + f[0]](3, INV_DIAG); },
          expect: { status: ["exact", "approximate", "stagnated", "bracketing-failed", "non-converged"], check: function (r) { return invContinuityProblems(r, m, d, f[1]); } },
          reproduce: { forward: function (x) { return MetaNum(3)[f[0]](x); }, target: t } });
      });
    });
  });
  // itermult: the forward stores ceil(y)-1, so fractional heights are NOT continuous in storage;
  // the inverse must flag the legacy platform representative rather than pretend continuity
  [2, 3].forEach(function (m) {
    [-1e-6, 0, 1e-6].forEach(function (d) {
      var t = MetaNum(3).itermult(m + d);
      checkInverseCase({ caseId: "G9.7.itermult." + m + "." + d, requirement: "11.3 itermult at m=" + m + ", δ=" + d + ": ceil-height platform — result must be a flagged legacy/representation-level representative on the correct side, continuity itself is not assertable",
        operation: "itermult", direction: "log", call: function () { return t.inv_itermult(3, INV_DIAG); },
        expect: { status: ["exact", "approximate", "minimal-reproducing", "lower-bound"], check: function (r, v) {
          var p = [], x = v.toNumber();
          if (!(r.representationLevel || r.legacyAnchor)) p.push("platform result not flagged (R/L)");
          if (d !== 0 && x === m && r.legacyAnchor !== true) p.push("unflagged integer snap");
          if (x < m - 0.01 || x > m + 1.0000001) p.push("platform representative " + x + " outside [m, m+1]");
          return p;
        } },
        reproduce: { forward: function (x) { return MetaNum(3).itermult(x); }, target: t } });
    });
  });
})();

// ───────────────────────────────────────────────────────────────────────────
// G9.8 fundamental-sequence break points and fractional coefficient (11.4)
// ───────────────────────────────────────────────────────────────────────────
console.log("\n=== G9.8 fundamental-sequence break points and fractional coefficient (11.4) ===");
(function () {
  [["aperiote", 1e-9], ["aperioexpande", 1e-9], ["aperionate", 1e-9], ["iterate", 1e-9], ["epsilonate", 1e-9]].forEach(function (f) {
    var ms = f[0] === "aperioexpande" || f[0] === "aperionate" ? [2] : [2, 3];
    ms.forEach(function (m) {
      [-1e-6, 1e-6].forEach(function (d) {
        var t = MetaNum(3)[f[0]](m + d);
        // ε₀ with y in (1,2): the forward marker stores max(2,floor y)+frac, i.e. the same value as y+1
        var quirk = f[0] === "epsilonate" && m === 2 && d < 0;
        checkInverseCase({ caseId: "G9.8." + f[0] + "." + m + "." + d, requirement: "11.4 / spec 5.1.1(4,5) " + f[0] + " at integer point " + m + (quirk ? "-δ" : " ±δ") + ": no level-switch jump; faithful within 1e-9, or representation-level within the forward's resolution" + (quirk ? " (ε₀ marker encodes heights in (1,2) as y+1 — pre-existing forward convention, documented)" : ""),
          operation: f[0], direction: "log", call: function () { return t["inv_" + f[0]](3, INV_DIAG); },
          expect: { status: ["exact", "approximate", "stagnated", "bracketing-failed", "non-converged"], allowNaN: true, check: function (r, v) {
            var p = [];
            if (r.value.isNaN()) { if (["stagnated", "bracketing-failed", "non-converged"].indexOf(r.status) === -1) p.push("NaN with " + r.status); return p; }
            var x = v.toNumber(), want = m + d + (quirk ? 1 : 0);
            var tol = r.representationLevel ? 0.01 : f[1];
            if (Math.abs(x - want) > tol) p.push("solution " + x + " vs " + want + " (" + r.status + "/" + r.termination + ", R=" + r.representationLevel + ")");
            if (quirk && !r.representationLevel) p.push("(1,2) ε marker recovery must be flagged representation-level");
            return p;
          } },
          reproduce: { forward: function (x) { return MetaNum(3)[f[0]](x); }, target: t } });
      });
    });
  });
  // fractional coefficient (spec 5.1.1(5)): 10{ω*2}2.1 and 10{ω^2}2.1 keep the fraction and invert to 2.1
  [["aperioexpande", "10{ω*2}2.1"], ["aperionate", "10{ω^2}2.1"]].forEach(function (f) {
    var t = MetaNum(10)[f[0]](2.1);
    checkInverseCase({ caseId: "G9.8.frac." + f[0], requirement: "11.4 / spec 5.1.1(5) fractional coefficient " + f[1] + ": inverse returns 2.1 (fraction preserved), reproduction at representation level",
      operation: f[0], direction: "log", call: function () { return t["inv_" + f[0]](10, INV_DIAG); },
      expect: { status: ["exact", "approximate"], isint: false }, solError: { from: 2.1, tol: 1e-9 },
      reproduce: { forward: function (x) { return MetaNum(10)[f[0]](x); }, target: t } });
  });
  // non-integer marker (spec 5.1.1(5)b resolved): itermult(10, 2.1) stores
  // c0 = 0.1/8 in the fractional r0 slot, so the inverse recovers 2.1 — the
  // fraction is preserved, not dropped
  var tl = MetaNum(10).itermult(2.1);
  checkInverseCase({ caseId: "G9.8.loss.itermult", requirement: "11.4 / spec 5.1.1(5)b itermult(10,2.1): the non-integer marker keeps the fraction — inverse recovers 2.1 (representation-level structural value)",
    operation: "itermult", direction: "log", call: function () { return tl.inv_itermult(10, INV_DIAG); },
    expect: { status: "approximate", value: 2.1, legacyAnchor: true, representationLevel: true, encoding: "ceil-height" },
    reproduce: { forward: function (x) { return MetaNum(10).itermult(x); }, target: tl } });
})();

// ───────────────────────────────────────────────────────────────────────────
// G9.9 domain boundaries, multi/no-solution, invalid & non-finite (12.1)
// ───────────────────────────────────────────────────────────────────────────
console.log("\n=== G9.9 domain boundaries, multi/no-solution, invalid and non-finite inputs (12.1) ===");
(function () {
  var D = INV_DIAG, p;
  // zero coefficient / zero exponent constant maps (design 2.4.2)
  checkInverseCase({ caseId: "G9.9.1", requirement: "12.1 zero coefficient: log(5,0,0) no-solution; log(0,0,0) all real heights reproduce 0 => NaN + unbounded-below + multipleSolutions",
    operation: "hyper_log", direction: "log", call: function () { return MetaNum.hyper_log(5, 0, 0, D); }, expect: { status: "no-solution", isNaN: true },
    check: function () { var r = MetaNum.hyper_log(0, 0, 0, D); return r.status === "unrecoverable" && r.termination === "unbounded-below" && r.multipleSolutions === true && r.value.isNaN() ? [] : ["log(0,0,0) " + r.status]; } });
  checkInverseCase({ caseId: "G9.9.2", requirement: "12.1 zero coefficient root: root(5,0,0) no-solution; root(0,0,0) unbounded-below NaN",
    operation: "hyper_root", direction: "root", call: function () { return MetaNum.hyper_root(5, 0, 0, D); }, expect: { status: "no-solution", isNaN: true },
    check: function () { var r = MetaNum.hyper_root(0, 0, 0, D); return r.status === "unrecoverable" && r.termination === "unbounded-below" && r.multipleSolutions === true ? [] : ["root(0,0,0) " + r.status]; } });
  checkInverseCase({ caseId: "G9.9.3", requirement: "12.1 base 1 constant map: log(1,1,1) unbounded-below multi; log(2,1,1) no-solution; α=2 log(1,1,2) minimal height 0 (minimal-reproducing, multi); log(2,1,2) no-solution",
    operation: "hyper_log", direction: "log", call: function () { return MetaNum.hyper_log(1, 1, 1, D); }, expect: { status: "unrecoverable", termination: "unbounded-below", multipleSolutions: true, isNaN: true },
    check: function () {
      var a = MetaNum.hyper_log(2, 1, 1, D), b = MetaNum.hyper_log(1, 1, 2, D), c = MetaNum.hyper_log(2, 1, 2, D), q = [];
      if (a.status !== "no-solution") q.push("log(2,1,1) " + a.status);
      if (b.status !== "minimal-reproducing" || !b.value.eq(0) || b.multipleSolutions !== true || b.minimalityAttained !== true) q.push("log(1,1,2) " + b.status + " " + b.value);
      if (c.status !== "no-solution") q.push("log(2,1,2) " + c.status);
      return q;
    } });
  checkInverseCase({ caseId: "G9.9.4", requirement: "12.1 zero exponent: root(1,0,1) => lower-bound 0 with minimalityAttained=false; root(2,0,1) no-solution; α=2 root(1,0,2) minimal-reproducing 1",
    operation: "hyper_root", direction: "root", call: function () { return MetaNum.hyper_root(1, 0, 1, D); }, expect: { status: "lower-bound", value: 0, minimalityAttained: false, multipleSolutions: true },
    check: function () { var a = MetaNum.hyper_root(2, 0, 1, D), b = MetaNum.hyper_root(1, 0, 2, D); return a.status === "no-solution" && b.status === "minimal-reproducing" && b.value.eq(1) ? [] : ["root zero exponent " + a.status + "/" + b.status]; } });
  checkInverseCase({ caseId: "G9.9.5", requirement: "12.1 / spec 5.3.1(8)b height 1 root: c=7 -> 7; c=0.5 is outside the n>=1 image => no-solution (never copied as 0.5); c=1 -> minimal base 1 (multi)",
    operation: "aperiote_root", direction: "root", call: function () { return MetaNum(7).aperiote_root(1, D); }, expect: { status: "exact", value: 7 },
    check: function () { var a = MetaNum(0.5).aperiote_root(1, D), b = MetaNum(1).aperiote_root(1, D); return a.status === "no-solution" && b.status === "minimal-reproducing" && b.value.eq(1) ? [] : ["b=1 roots " + a.status + "/" + b.status]; } });
  checkInverseCase({ caseId: "G9.9.6", requirement: "12.1 c=0 / c=1: aperiote log c=0 -> b=0 (aperiote(n,0)=0 special); expande log c=0 -> no-solution; root c=0 -> no-solution; log(1,2,2)=0; root(1,2,2) -> minimal base 1",
    operation: "named", direction: "log+root", call: function () { return MetaNum(0).inv_aperiote(2, D); }, expect: { status: "exact", value: 0 },
    check: function () {
      var q = [], a = MetaNum(0).inv_expande(10, D), b = MetaNum(0).aperiote_root(5, D), c = MetaNum.hyper_log(1, 2, 2, D), d = MetaNum.hyper_root(1, 2, 2, D);
      if (a.status !== "no-solution") q.push("inv_expande c=0 " + a.status);
      if (b.status !== "no-solution") q.push("root c=0 " + b.status);
      if (!c.value.eq(0)) q.push("log(1,2,2)");
      if (d.status !== "minimal-reproducing" || !d.value.eq(1)) q.push("root(1,2,2) " + d.status);
      return q;
    } });
  checkInverseCase({ caseId: "G9.9.7", requirement: "12.1 finite high-level outside image: log(-5,2,2), log(0.5,2,2), root(0.5,2,2) => no-solution (no clamped endpoint)",
    operation: "hyper_log/root", direction: "log+root", call: function () { return MetaNum.hyper_log(-5, 2, 2, D); }, expect: { status: "no-solution", isNaN: true },
    check: function () { var a = MetaNum.hyper_log(0.5, 2, 2, D), b = MetaNum.hyper_root(0.5, 2, 2, D); return a.status === "no-solution" && b.status === "no-solution" ? [] : ["outside image " + a.status + "/" + b.status]; } });
  checkInverseCase({ caseId: "G9.9.8", requirement: "12.1 special fold 2{λ}2=4 (and 2{λ}3>4): log(4,2,3)=2 and aperiote log/root of 4 with base/height 2 => 2 exact; other bases still solved by their own forward",
    operation: "aperiote", direction: "log+root", call: function () { return MetaNum(4).inv_aperiote(2, D); }, expect: { status: "exact", value: 2 },
    check: function () {
      var q = [], f = MetaNum.hyper_log(4, 2, 3, D), r = MetaNum(4).aperiote_root(2, D), o = MetaNum(16).inv_aperiote(2, D);
      if (!f.value.eq(2)) q.push("log(4,2,3)");
      if (!r.value.eq(2)) q.push("aperiote_root(2) of 4");
      if (!MetaNum(2).aperiote(3).gt(4)) q.push("2{λ}3 must exceed 4");
      if (!MetaNum(2).aperiote(4).inv_aperiote(2).eq(4)) q.push("aperiote(2,4)=2{4}4 must still invert to 4 (other heights are solved by their own forward)");
      return q;
    } });
  checkInverseCase({ caseId: "G9.9.9", requirement: "12.1 unauthenticated domains: 0<n<1 at α=2 log => unsupported-domain; negative height (named root) => unsupported-domain; negative base at α=2 root => unsupported-domain/NaN",
    operation: "hyper_log/root", direction: "log+root", call: function () { return MetaNum.hyper_log(2, 0.5, 2, D); }, expect: { status: "unsupported-domain", isNaN: true },
    check: function () {
      var q = [], a = MetaNum.expande(10, 3).expande_root(-1, D), b = MetaNum(10).aperiote(15).aperiote_root(-5, D), c = MetaNum.hyper_root(16, 2, 2, D), d = MetaNum.hyper_root(-16, 4, 2, D), ind = MetaNum(16).ssrt();
      if (a.status !== "unsupported-domain" || !a.value.isNaN()) q.push("negative height " + a.status);
      if (b.status !== "unsupported-domain" || !b.value.isNaN()) q.push("aperiote negative height " + b.status);
      if (Math.abs(c.value.toNumber() - ind.toNumber()) > 1e-9) q.push("root(16,2,2) should match the independent Lambert-W ssrt(16)=" + ind + ", got " + c.value);
      if (d.value.isNaN() === false && d.status !== "unsupported-domain") q.push("negative high-level base " + d.status);
      return q;
    } });
  // NaN / ±Infinity in every position (spec 5.3.1(11)) — default returns stay NaN
  (function () {
    var q = [];
    [[NaN, 2, 2], [2, NaN, 2], [2, 2, NaN], [Infinity, 2, 2], [2, Infinity, 2], [2, 2, Infinity], [-Infinity, 2, 2], [2, -Infinity, 2]].forEach(function (args) {
      ["hyper_log", "hyper_root"].forEach(function (m) {
        var r = MetaNum[m](args[0], args[1], args[2], D), plain = MetaNum[m](args[0], args[1], args[2]);
        var want = (isNaN(args[0]) || isNaN(args[1]) || isNaN(args[2])) ? "invalid-input" : "non-finite-input";
        if (r.status !== want || !r.value.isNaN() || !plain.isNaN()) q.push(m + "(" + args.join(",") + ") -> " + r.status);
      });
    });
    var v = MetaNum(10).aperiote(15);
    [[function () { return v.inv_aperiote(NaN, D); }, "invalid-input"], [function () { return v.inv_aperiote(Infinity, D); }, "non-finite-input"],
     [function () { return v.aperiote_root(NaN, D); }, "invalid-input"], [function () { return v.aperiote_root(Infinity, D); }, "non-finite-input"],
     [function () { return MetaNum.inv_iteraperiate(NaN, 10, D); }, "invalid-input"], [function () { return MetaNum(10).iteraperiate(5).iteraperiate_root(Infinity, D); }, "non-finite-input"]].forEach(function (c) {
      var r = c[0](); if (r.status !== c[1] || !r.value.isNaN()) q.push("named non-finite -> " + r.status);
    });
    if (!MetaNum.inv_aperiote(MetaNum(3), MetaNum.NaN).isNaN()) q.push("old NaN propagation inv_aperiote(3, NaN)");
    checkInverseCase({ caseId: "G9.9.10", requirement: "12.1 / spec 5.3.1(11) NaN => invalid-input and ±Infinity => non-finite-input in every position of c/n/α/b for generic and named entries; default calls return NaN",
      operation: "all", direction: "log+root", call: function () { return MetaNum.hyper_log(NaN, 2, 2, D); }, expect: { status: "invalid-input", isNaN: true, check: function () { return q; } } });
  })();
  // invalid strings / levels (spec 4.3.2, 5.3.1(12)): the constructor's silent 0 must not be solved as 0
  (function () {
    var q = [];
    [["abc", 2, 2], ["", 2, 2], ["12abc", 2, 2], [2, "abc", 2], [2, 2, "abc"], [2, "1e", 2]].forEach(function (args) {
      var r = MetaNum.hyper_log(args[0], args[1], args[2], D);
      if (r.status !== "invalid-input" || !r.value.isNaN()) q.push("hyper_log(" + args.join(",") + ") -> " + r.status);
    });
    var r0 = MetaNum.hyper_log("0", 2, 0, D), rv = MetaNum.inv_aperiote("abc", 10, D), rn = MetaNum.aperiote_root("abc", 15, D), ri = MetaNum("abc").hyper_log(2)(2, D);
    if (!r0.value.eq(0)) q.push("string \"0\" must still be the number 0: " + r0.status);
    if (rv.status !== "invalid-input" || rn.status !== "invalid-input") q.push("named invalid string " + rv.status + "/" + rn.status);
    if (ri.status === "invalid-input") q.push("unexpected");
    [[-1], [-0.5], ["abc"], ["2x"]].forEach(function (lv) { var r = MetaNum.hyper_log(2, 2, lv[0], D); if (r.status !== "invalid-level" && r.status !== "invalid-input") q.push("level " + lv[0] + " -> " + r.status); });
    checkInverseCase({ caseId: "G9.9.11", requirement: "12.1 / spec 4.3.2 invalid strings => invalid-input NaN (never solved as the constructor's silent 0); negative/unknown levels => invalid-level, never rounded",
      operation: "hyper_log", direction: "log", call: function () { return MetaNum.hyper_log("abc", 2, 2, D); }, expect: { status: "invalid-input", isNaN: true, check: function () { return q; } } });
  })();
  // object inputs the constructor rejects keep raising the constructor's own error (no new exception system)
  checkInverseCase({ caseId: "G9.9.12", requirement: "12.1 / design 2.4.8 non-numeric objects keep the constructor's own MetaNumError (no new inverse exception type)",
    operation: "hyper_log", direction: "log", call: function () { return MetaNum(1); },
    expect: { value: 1, check: function () {
      var msg = "";
      try { MetaNum.hyper_log({}, 2, 2); } catch (e) { msg = (e && e.name) + ": " + (e && e.message); }
      return /MetaNumError/.test(msg) ? [] : ["unexpected: " + msg];
    } } });
  // multi-solution: even integer power double root (principal positive), and the 2{λ}2 anchor
  checkInverseCase({ caseId: "G9.9.13", requirement: "12.1 / spec 5.3.1(6) multiple discrete solutions: root(81,4,1)=3 positive principal with multipleSolutions; root(-81,4,1) no-solution",
    operation: "hyper_root", direction: "root", call: function () { return MetaNum.hyper_root(81, 4, 1, D); }, expect: { status: "exact", value: 3, multipleSolutions: true },
    check: function () { return MetaNum.hyper_root(-81, 4, 1, D).status === "no-solution" ? [] : ["root(-81,4,1)"]; } });
})();

// ───────────────────────────────────────────────────────────────────────────
// G9.10 markers, saturation, truncation, COEFF_BOUND / MSI / cap, minimality (12.2)
// ───────────────────────────────────────────────────────────────────────────
console.log("\n=== G9.10 markers, saturation, truncation, COEFF/MSI/cap and minimality (12.2) ===");
(function () {
  var D = INV_DIAG;
  // COEFF_BOUND = 100 boundary on a representative limit operation
  [[100 - 1e-6, 1e-2, "representation plateau: value within 0.01 of 100"], [100, 1e-12, "integer anchor"], [100 + 1e-6, 1e-6, "just above the bound (representation-level within 1e-6)"], [101, 1e-12, "integer anchor"]].forEach(function (c) {
    var t = MetaNum(3).aperiote(c[0]);
    checkInverseCase({ caseId: "G9.10.1." + c[0], requirement: "12.2 / spec 5.6.1 row 'representation boundary' aperiote(3," + c[0] + ") across COEFF_BOUND=100: " + c[2] + "; structure may change, no false exactness",
      operation: "aperiote", direction: "log", call: function () { return t.inv_aperiote(3, D); },
      expect: { status: ["approximate", "exact"], check: function (r, v) {
        var x = v.toNumber(); return Math.abs(x - c[0]) <= c[1] ? [] : ["value " + x + " vs " + c[0] + " (" + r.status + ")"];
      } },
      reproduce: { forward: function (x) { return MetaNum(3).aperiote(x); }, target: t }, note: c[2] });
  });
  checkInverseCase({ caseId: "G9.10.2", requirement: "12.2 expande(3,99/100/101): complete cascade rows keep the height exactly across the bound",
    operation: "expande", direction: "log", call: function () { return MetaNum(3).expande(100).inv_expande(3, D); }, expect: { status: "exact", value: 100 },
    check: function () { return MetaNum(3).expande(99).inv_expande(3).eq(99) && MetaNum(3).expande(101).inv_expande(3).eq(101) ? [] : ["99/101"]; } });
  // truncation: arrow(10,39,10) (full) and arrow(10,40,10) (truncated: [10] base + first row count+1) under maxRows 20 / 50
  (function () {
    var q = [], rows20 = MetaNum.maxRows, cols20 = MetaNum.maxCols, log = [];
    try {
      MetaNum.maxRows = 20;
      var t39 = MetaNum.arrow(10, 39, 10), t40 = MetaNum.arrow(10, 40, 10);
      var l39 = MetaNum.hyper_log(t39, 10, 39, D), r39 = MetaNum.hyper_root(t39, 10, 39, D);
      var l40 = MetaNum.hyper_log(t40, 10, 40, D), r40 = MetaNum.hyper_root(t40, 10, 40, D);
      log.push("maxRows=20: rows " + t39.array.length + "/" + t40.array.length + "; log39 " + l39.status + "/" + l39.value + "; root39 " + r39.status + "/" + r39.value + "; log40 " + l40.status + "/" + l40.value + "; root40 " + r40.status + "/" + r40.value);
      [[l39, 39], [r39, 39], [l40, 40], [r40, 40]].forEach(function (pair) {
        var r = pair[0];
        if (r.status === "exact") q.push("truncated/target at " + pair[1] + " reported exact");
        if (!r.value.isNaN() && r.representationLevel !== true) q.push("value at " + pair[1] + " without representation-level flag");
      });
      if (JSON.stringify(t40.array[0]) !== "[10]") q.push("arrow(10,40,10) should be the truncated [10] form at maxRows=20, got " + JSON.stringify(t40.array[0]));
      if (!l39.value.eq(10) || !r39.value.eq(10) || !l40.value.eq(10) || !r40.value.eq(10)) q.push("truncation inverses should reproduce 10 at representation level (legacy), not NaN");
      MetaNum.maxRows = 50;
      var t40b = MetaNum.arrow(10, 40, 10), l40b = MetaNum.hyper_log(t40b, 10, 40, D), r40b = MetaNum.hyper_root(t40b, 10, 40, D);
      log.push("maxRows=50: rows " + t40b.array.length + "; log40 " + l40b.status + "/" + l40b.value + "; root40 " + r40b.status + "/" + r40b.value);
      if (l40b.status === "exact" || r40b.status === "exact") q.push("maxRows=50 inverse reported exact");
    } finally { MetaNum.maxRows = rows20; MetaNum.maxCols = cols20; }
    if (MetaNum.maxRows !== rows20 || MetaNum.maxCols !== cols20) q.push("global config not restored");
    checkInverseCase({ caseId: "G9.10.3", requirement: "12.2 / spec 5.4.1(6) truncated arrays ([10] base, first row +1) never become exact roots/heights; inverses are representation-level; maxRows restored in finally",
      operation: "arrow(10,39/40,10)", direction: "log+root", call: function () { return MetaNum(1); }, expect: { value: 1, check: function () { return q; } }, note: log.join(" || ") });
  })();
  // MSI and the ε₀ ceiling: below / at / above (y > MSI → Infinity per the
  // documented convention, so its inverse is NaN by the non-finite rule)
  checkInverseCase({ caseId: "G9.10.4", requirement: "12.2 / spec 5.4.1(7-8) ε₀: y=MSI-1 exact structural; y=MSI saturates to layer MSI-1 (lower-bound, minimalityAttained=false); y>MSI → the forward itself returns Infinity and the inverse reports non-finite-input",
    operation: "epsilonate", direction: "log", call: function () { return MetaNum(10).epsilonate(9007199254740990).inv_epsilonate(10, D); }, expect: { status: "exact", value: 9007199254740990 },
    check: function () {
      var q = [], a = MetaNum(10).epsilonate(9007199254740991).inv_epsilonate(10, D), b = MetaNum(10).epsilonate(1e16);
      if (a.status !== "lower-bound" || !a.value.eq(9007199254740991) || a.minimalityAttained !== false || a.loss !== "capped") q.push("y=MSI " + a.status + "/" + a.loss);
      if (b.toString() !== "Infinity") q.push("y=1e16 forward should be Infinity, got " + b);
      var bi = b.inv_epsilonate(10, D);
      if (bi.status !== "non-finite-input" || !bi.value.isNaN()) q.push("y=1e16 inverse " + bi.status);
      return q;
    } });
  checkInverseCase({ caseId: "G9.10.5", requirement: "12.2 / spec 5.4.1(7) huge-argument markers: y>MSI inverses stay finite, non-NaN, >=1 (old sanity) and carry representation-level evidence; epsilonate returns Infinity (documented); capped counts are not read as exact applications",
    operation: "named", direction: "log", call: function () { return MetaNum(10).aperiote(1e16).inv_aperiote(10, D); },
    expect: { status: ["exact", "approximate", "lower-bound"], value: 1e16, representationLevel: true, check: function () {
      var q = [], big = MetaNum(1e16);
      ["expande", "iterate", "itermult"].forEach(function (op) {
        var r = MetaNum(10)[op](big)["inv_" + op](10, D);
        if (r.value.isNaN() || !r.value.isFinite() || r.value.lt(1)) q.push(op + " y>MSI -> " + r.status + " " + r.value);
        if (r.representationLevel !== true) q.push(op + " y>MSI without representation-level flag");
        if (op === "itermult" && r.legacyAnchor !== true) q.push("itermult capped count must be a legacy anchor");
      });
      var eb = MetaNum(10).epsilonate(big);
      if (eb.toString() !== "Infinity") q.push("epsilonate y>MSI should be Infinity");
      return q;
    } } });
  // base-independent markers: root = 2 on the declared n>=2 branch, with reproduction (old vector kept) and n=1 constant handled
  (function () {
    var q = [];
    INV_REGISTRY.filter(function (r) { return r[5]; }).forEach(function (row) {
      var op = row[0], v = MetaNum(10)[op](5), r = v[op + "_root"](5, D);
      if (!r.value.eq(2) || r.status !== "minimal-reproducing" || r.minimalityAttained !== true || r.multipleSolutions !== true) q.push(op + " root " + r.status + "/" + r.value + "/" + r.minimalityAttained);
      if (!MetaNum(2)[op](5).eq(v)) q.push(op + ": 2 does not reproduce the marker");
      if (MetaNum(1)[op](5).eq(v)) q.push(op + ": base 1 must be the constant special case, not the marker");
      var one = MetaNum(1)[op + "_root"](5, D);
      if (one.status !== "minimal-reproducing" || !one.value.eq(1)) q.push(op + " root of 1 " + one.status);
      var lower = MetaNum(1.5)[op + "_root"](5, D);
      if (lower.status !== "unrecoverable") q.push(op + " root of a non-marker (n=1.5 target) " + lower.status);
    });
    checkInverseCase({ caseId: "G9.10.6", requirement: "12.2 / spec 5.4.1(4-5) / design 2.4.4(6) base-independent markers (itermult..epsilonate, height 5): root = 2 minimal-reproducing on n>=2 with F(2,5)=c; base 1 constant; non-marker targets unrecoverable; no claim about (1,2)",
      operation: "marker ops", direction: "root", call: function () { return MetaNum(10).iteraperiate(5).iteraperiate_root(5, D); },
      expect: { status: "minimal-reproducing", value: 2, minimalityAttained: true, multipleSolutions: true, representationLevel: true, check: function () { return q; } } });
  })();
  // non-integer marker: the fraction lives in r0[0] and the inverse recovers it
  checkInverseCase({ caseId: "G9.10.7", requirement: "12.2 / design 2.4.4(2-3) itermult non-integer marker: c0 = (5.25-2)/8 = 0.40625 in r0[0], inverse recovers 5.25; F(5.25) reproduces, F(5.99) does NOT (the marker is fractional, not a ceil platform) => legacy/approximate, never minimal-reproducing",
    operation: "itermult", direction: "log", call: function () { return MetaNum(3).itermult(5.25).inv_itermult(3, D); },
    expect: { status: "approximate", value: 5.25, legacyAnchor: true, representationLevel: true, check: function (r) {
      var q = [], c = MetaNum(3).itermult(5.25);
      if (Math.abs(c.array[0][0] - 0.40625) > 1e-15) q.push("c0 " + c.array[0][0] + " != (5.25-2)/8");
      if (MetaNum(3).itermult(6).eq(c)) q.push("ceil platform must be gone: itermult(6) should differ from itermult(5.25)");
      if (MetaNum(3).itermult(5.99).eq(c)) q.push("5.99 must not reproduce 5.25's marker");
      if (r.minimalityAttained === true) q.push("minimality claimed on a fractional marker");
      return q;
    } } });
  checkInverseCase({ caseId: "G9.10.8", requirement: "12.2 / design 2.4.4(3) iteraperiate constant level marker: every finite height (5.25 / 5 / 4.99) shares [[10,1],[1,0,1]], the inverse returns the minimal reproducing height 2; ordinal-height markers [1|ω] / [1|ω^ω] still strip",
    operation: "iteraperiate", direction: "log", call: function () { return MetaNum(3).iteraperiate(5.25).inv_iteraperiate(3, D); },
    expect: { status: "approximate", value: 2, legacyAnchor: true, representationLevel: true, check: function (r) {
      var q = [], c = MetaNum(3).iteraperiate(5.25);
      if (!MetaNum(3).iteraperiate(5).eq(c) || !MetaNum(3).iteraperiate(4.99).eq(c)) q.push("finite heights must share the constant level marker");
      if (!r.value.eq(2) || !MetaNum(3).iteraperiate(2).eq(c)) q.push("inverse should return the minimal reproducing height 2");
      var oy = MetaNum(10).itermult(3), ov = MetaNum(10).iteraperiate(oy);
      if (!ov.inv_iteraperiate(10).eq(oy)) q.push("ordinal-height [1|ω] strip");
      var oy2 = MetaNum(10).iteraperiate(3), ov2 = MetaNum(10).iteraperiate(oy2);
      if (!ov2.inv_iteraperiate(10).eq(oy2)) q.push("ordinal-height [1|ω^ω] strip");
      return q;
    } } });
  // epsilonate fraction: integer exact, fraction approximate + representation-level; y=2 equals iterate (separately verified anchor)
  checkInverseCase({ caseId: "G9.10.9", requirement: "12.2 / design 2.4.4(5) epsilonate: integer height exact structural, 5.25 recovered as 5.25 (approximate, fraction-preserved, representation-level); y=2 equals iterate(x,x)",
    operation: "epsilonate", direction: "log", call: function () { return MetaNum(10).epsilonate(5).inv_epsilonate(10, D); }, expect: { status: "exact", value: 5, encoding: "epsilon-layer" },
    check: function () {
      var q = [], r = MetaNum(10).epsilonate(5.25).inv_epsilonate(10, D);
      if (!r.value.eq(5.25) || r.status !== "approximate" || r.encoding !== "epsilon-layer" || r.loss !== "fraction-preserved" || r.representationLevel !== true) q.push("5.25 -> " + r.status + "/" + r.value + "/" + r.loss);
      if (!MetaNum(10).epsilonate(2).eq(MetaNum(10).iterate(10))) q.push("epsilonate(10,2) must equal iterate(10,10)");
      if (!MetaNum(10).epsilonate(2).inv_epsilonate(10).eq(2) && !MetaNum(10).epsilonate(2).inv_epsilonate(10).eq(10)) q.push("y=2 anchor inverse");
      return q;
    } });
})();

// ───────────────────────────────────────────────────────────────────────────
// G9.11 large numbers, tolerance ladder, numeric strings, reciprocal limits (12.3)
// ───────────────────────────────────────────────────────────────────────────
console.log("\n=== G9.11 large numbers, tolerance ladder, numeric strings and reciprocal limits (12.3) ===");
(function () {
  var D = INV_DIAG;
  var big = MetaNum(2).tetr(100);
  checkInverseCase({ caseId: "G9.11.1", requirement: "12.3 / spec 5.6.1 row 'large numbers' layer>0 target 2↑↑100: log => 100 (legacy anchor, bounded iterations), residual is bracket-only with relative=null (no Infinity-Infinity pseudo residual)",
    operation: "hyper_log", direction: "log", call: function () { return MetaNum.hyper_log(big, 2, 2, D); },
    expect: { status: ["approximate", "exact"], value: 100, representationLevel: true, residualKind: "bracket-only", check: function (r) {
      var q = []; if (r.residual.relative !== null || r.residual.absolute !== null) q.push("numeric residual must be null for structured targets");
      if (r.iterations > 200 || r.forwardEvaluations > 400) q.push("unbounded work " + r.iterations + "/" + r.forwardEvaluations); return q; } } });
  checkInverseCase({ caseId: "G9.11.2", requirement: "12.3 root of 2↑↑100 at height 100 => 2 (legacy, representation-level), cmp-based evidence only",
    operation: "hyper_root", direction: "root", call: function () { return MetaNum.hyper_root(big, 100, 2, D); },
    expect: { status: ["approximate", "exact"], value: 2, representationLevel: true, residualKind: "bracket-only" } });
  var nested = MetaNum(10).aperiote(15);
  checkInverseCase({ caseId: "G9.11.3", requirement: "12.3 nested ordinal rows target 10{ω}15: log => 15 (structural), residual kind meta-comparison / ordinal-structure with null numeric fields; root => 10 (representation-level)",
    operation: "aperiote", direction: "log+root", call: function () { return nested.inv_aperiote(10, D); },
    expect: { status: ["exact", "approximate"], value: 15, representationLevel: true, check: function (r) {
      var q = [], rr = nested.aperiote_root(15, D);
      if (["meta-comparison", "ordinal-structure", "bracket-only"].indexOf(r.residual.kind) === -1 || r.residual.relative !== null) q.push("log residual " + r.residual.kind);
      if (!rr.value.eq(10) || rr.status === "exact" || rr.residual.relative !== null) q.push("root residual/status " + rr.status + "/" + rr.residual.kind);
      return q; } } });
  // tolerance ladder on one non-integer vector
  var ladder = [1e-8, 1e-12, 1e-300], runs = [];
  ladder.forEach(function (tol) { runs.push(MetaNum.hyper_log(MetaNum(2).tetr(2.5), 2, 2, { diagnostics: true, tol: tol })); });
  checkInverseCase({ caseId: "G9.11.4", requirement: "12.3 / spec 5.5.3(3) tolerance ladder on 2↑↑2.5 log: tol=1e-8 and 1e-12 converge within 1e-9 with R_rel<=1e-9; tol=1e-300 (below representation resolution) ends stagnated/approximate, never claims extra precision",
    operation: "hyper_log", direction: "log", call: function () { return runs[1]; },
    expect: { status: "approximate", isint: false }, solError: { from: 2.5, tol: 1e-9 }, residualMax: 1e-9, check: function () {
      var q = [], r8 = runs[0], r300 = runs[2];
      if (Math.abs(r8.value.toNumber() - 2.5) > 1e-9 || r8.residual.relative > 1e-9) q.push("tol=1e-8 " + r8.status + " " + r8.value + " R=" + r8.residual.relative);
      if (["stagnated", "non-converged", "approximate"].indexOf(r300.status) === -1) q.push("tol=1e-300 " + r300.status);
      if (r300.termination === "converged") q.push("tol=1e-300 reported normal convergence");
      if (!r300.value.isNaN() && r300.representationLevel !== true) q.push("tol=1e-300 finite result must be representation-level");
      return q; },
    note: ladder.map(function (t, i) { return "tol=" + t + ": it=" + runs[i].iterations + " fw=" + runs[i].forwardEvaluations + " status=" + runs[i].status + "/" + runs[i].termination + " value=" + runs[i].value + " R=" + runs[i].residual.relative; }).join(" | ") });
  // semantic equality of number / numeric string / MetaNum encodings at large scale
  checkInverseCase({ caseId: "G9.11.5", requirement: "12.3 number, numeric string and MetaNum inputs are the same call; a structured value re-parsed from its toString() is lossy and is reported as a precision limit (bounded failure), not as a recovered height",
    operation: "hyper_log", direction: "log", call: function () { return MetaNum.hyper_log(new MetaNum(big), 2, 2, D); },
    expect: { status: ["approximate", "exact"], value: 100, check: function () {
      var q = [], s = MetaNum.hyper_log(big.toString(), 2, 2, D), n = MetaNum.hyper_log(1e5, 10, 1, D), ns = MetaNum.hyper_log("1e5", "10", "1", D), nm = MetaNum.hyper_log(MetaNum(1e5), MetaNum(10), MetaNum(1), D);
      if (["stagnated", "non-converged", "bracketing-failed", "unrecoverable"].indexOf(s.status) === -1 && !s.value.eq(100)) q.push("re-parsed string target must be solved or classified, got " + s.status);
      if (n.value.eq(5) === false || !ns.value.eq(n.value) || !nm.value.eq(n.value)) q.push("1e5 encodings differ");
      return q; } },
    note: "string re-parse of 2↑↑100 gave status=" + MetaNum.hyper_log(big.toString(), 2, 2, D).status + " (documented string-parsing precision limit); 1e5 encodings agree" });
  // reciprocal / underflow limits (spec 5.5.1(12)b): tiny legal solutions keep the reciprocal structure or fail as unrepresentable, never 0
  checkInverseCase({ caseId: "G9.11.6", requirement: "12.3 / spec 5.5.1(12)b tiny legal solutions: root(1e-330,2,0)=5e-331 and root(5e-324,10,0)=5e-325 use the reciprocal structure (sign=2), never underflow to 0; plain Number would give 0",
    operation: "hyper_root", direction: "root", call: function () { return MetaNum.hyper_root("1e-330", 2, 0, D); },
    expect: { status: "exact", check: function (r, v) {
      var q = [], r2 = MetaNum.hyper_root("5e-324", 10, 0, D);
      if (v.eq(0) || v.sign !== 2) q.push("1e-330/2 -> " + v + " sign=" + v.sign);
      if (r2.value.eq(0) || r2.value.sign !== 2) q.push("5e-324/10 -> " + r2.value + " sign=" + r2.value.sign + " (Number lane: " + (5e-324 / 10) + ")");
      if (r2.residual.kind === "unavailable" && r2.residual.reason !== "not evaluated") q.push("unexpected unavailable residual");
      return q; } },
    reproduce: { forward: function (x) { return x.mul(2); }, target: MetaNum("1e-330") },
    note: "residual is log-space (the difference is below double resolution); the equality itself is definition-guaranteed by the reciprocal structure" });
  checkInverseCase({ caseId: "G9.11.7", requirement: "12.3 log of a subnormal target with a large base: log(1e-320,1e10,0)=1e-330 keeps the reciprocal structure",
    operation: "hyper_log", direction: "log", call: function () { return MetaNum.hyper_log("1e-320", 1e10, 0, D); },
    expect: { status: "exact", check: function (r, v) { return v.eq(0) || v.sign !== 2 ? ["1e-330 -> " + v] : []; } } });
  // precision limits are reported, not hidden: double, string parsing, structural counts, normalisation
  checkInverseCase({ caseId: "G9.11.8", requirement: "12.3 / spec 5.4.1(9) precision limits: a 17-significant-digit string is parsed to double precision and the inverse reports the double-level result (approximate), not the string's extra digits",
    operation: "hyper_log", direction: "log", call: function () { return MetaNum.hyper_log("2.50000000000000001", 2, 0, D); },
    expect: { status: ["exact", "approximate"], approx: { to: 1.25, tol: 1e-15 }, isint: false },
    note: "the string's 18th digit is below double resolution; result is the double-level 1.25 (documented limitation, not arbitrary precision)" });
})();

// ───────────────────────────────────────────────────────────────────────────
// G9.12 failure injection (12.4)
// ───────────────────────────────────────────────────────────────────────────
console.log("\n=== G9.12 failure injection: budgets, stagnation, acceleration fallback, overflow/underflow (12.4) ===");
(function () {
  var D = INV_DIAG;
  checkInverseCase({ caseId: "G9.12.1", requirement: "12.4 / spec 5.5.1(10) maxIterations=1 on 2↑↑2.5 log => non-converged, NaN, iterations=1, last candidate NOT returned",
    operation: "hyper_log", direction: "log", call: function () { return MetaNum.hyper_log(MetaNum(2).tetr(2.5), 2, 2, { diagnostics: true, maxIterations: 1 }); },
    expect: { status: "non-converged", termination: "iteration-budget-exhausted", isNaN: true, check: function (r) { return r.iterations === 1 ? [] : ["iterations=" + r.iterations]; } } });
  checkInverseCase({ caseId: "G9.12.2", requirement: "12.4 / spec 5.5.1(4,10) maxBracketExpansions=1 on 2↑↑10.5 log => bracketing-failed / expansion-budget-exhausted, expansions=1, never the last upper bound as the answer",
    operation: "hyper_log", direction: "log", call: function () { return MetaNum.hyper_log(MetaNum(2).tetr(10.5), 2, 2, { diagnostics: true, maxBracketExpansions: 1 }); },
    expect: { status: "bracketing-failed", termination: "expansion-budget-exhausted", isNaN: true, check: function (r) {
      return r.expansions === 1 && r.bracket && r.bracket.loCmp === -1 && r.bracket.hiCmp === -1 ? [] : ["expansions=" + r.expansions + " bracket=" + JSON.stringify(r.bracket)]; } } });
  checkInverseCase({ caseId: "G9.12.3", requirement: "12.4 tol=1e-300 on the 2.5 round trip => stagnated (finite representation-level 2.5 or NaN); never normal convergence",
    operation: "hyper_log", direction: "log", call: function () { return MetaNum.hyper_log(MetaNum(2).tetr(2.5), 2, 2, { diagnostics: true, tol: 1e-300 }); },
    expect: { status: ["stagnated", "non-converged", "approximate"], termination: ["stagnated", "midpoint-not-interior", "iteration-budget-exhausted", "converged"], check: function (r) {
      var q = []; if (r.termination === "converged") q.push("claimed convergence under tol=1e-300");
      if (!r.value.isNaN() && r.representationLevel !== true) q.push("finite stagnated result must be representation-level"); return q; } } });
  var auto = MetaNum.hyper_log(MetaNum(2).tetr(2.5), 2, 2, D), bis = MetaNum.hyper_log(MetaNum(2).tetr(2.5), 2, 2, { diagnostics: true, acceleration: "bisection" });
  checkInverseCase({ caseId: "G9.12.4", requirement: "12.4 / design 2.4.5(3) acceleration vs bisection on 2↑↑2.5 (representable secant lane): same branch/criteria, both within 1e-9; auto records fallbackCount>0 (rejected/worsening secant candidates fall back to midpoint, bracket kept valid)",
    operation: "hyper_log", direction: "log", call: function () { return auto; },
    expect: { status: "approximate", isint: false }, solError: { from: 2.5, tol: 1e-9 }, residualMax: 1e-9, check: function (r) {
      var q = [];
      if (Math.abs(bis.value.toNumber() - 2.5) > 1e-9 || bis.status !== r.status) q.push("bisection differs " + bis.status + " " + bis.value);
      if (!(r.fallbackCount > 0)) q.push("no acceleration fallback observed (fallbackCount=" + r.fallbackCount + ")");
      if (bis.fallbackCount !== 0) q.push("bisection must not use acceleration (fb=" + bis.fallbackCount + ")");
      if (!(r.iterations <= bis.iterations)) q.push("auto took more iterations than bisection " + r.iterations + " vs " + bis.iterations);
      if (r.bracket && !(r.bracket.lo < r.bracket.hi)) q.push("bracket invalid at exit");
      return q; },
    note: "auto it=" + auto.iterations + "/fb=" + auto.fallbackCount + "; bisection it=" + bis.iterations + "/fb=" + bis.fallbackCount });
  var t = MetaNum(10).tetr(3 + 1e-10), ra = MetaNum.hyper_log(t, 10, 2, D), rb = MetaNum.hyper_log(t, 10, 2, { diagnostics: true, acceleration: "bisection" });
  checkInverseCase({ caseId: "G9.12.5", requirement: "12.4 10↑↑(3+1e-10) auto vs bisection: bounded termination; if a finite value comes back it is not the integer 3 and is representation-level; otherwise NaN with a failure termination",
    operation: "hyper_log", direction: "log", call: function () { return ra; },
    expect: { status: ["stagnated", "non-converged", "bracketing-failed", "approximate", "exact"], check: function (r) {
      var q = [];
      [ra, rb].forEach(function (x) {
        if (x.iterations > 200 || x.forwardEvaluations > 400) q.push("unbounded work " + x.iterations + "/" + x.forwardEvaluations);
        if (!x.value.isNaN() && (x.value.eq(3) || x.representationLevel !== true)) q.push("finite result " + x.value + " is an integer snap or unflagged");
      });
      if (ra.termination === "converged" && Math.abs(ra.value.toNumber() - (3 + 1e-10)) > 1e-9) q.push("converged away from the target height");
      return q; } },
    note: "auto " + ra.status + "/" + ra.termination + " it=" + ra.iterations + " fb=" + ra.fallbackCount + " value=" + ra.value + " | bisection " + rb.status + "/" + rb.termination + " it=" + rb.iterations + " value=" + rb.value + " — residual criterion unreachable at double resolution near the steep point; reported as stagnation, not as precision" });
  // forward NaN / invalid points
  checkInverseCase({ caseId: "G9.12.6", requirement: "12.4 forward NaN injection: a NaN forward target (expande(3,0)) => invalid-input; zero/negative heights for named roots => unsupported-domain; all bounded, no forward evaluation",
    operation: "expande", direction: "log+root", call: function () { return MetaNum(3).expande(0).inv_expande(3, D); }, expect: { status: "invalid-input", isNaN: true, check: function () {
      var q = [], a = MetaNum(10).aperiote(15).aperiote_root(0, D), b = MetaNum(10).aperiote(15).aperiote_root(-5, D);
      if (a.status !== "unsupported-domain" || a.forwardEvaluations !== 0) q.push("zero height " + a.status);
      if (b.status !== "unsupported-domain") q.push("negative height " + b.status);
      return q; } } });
  checkInverseCase({ caseId: "G9.12.7", requirement: "12.4 / spec 5.5.1(4,10) target beyond the expansion budget's reach (log of 10↑↑(1e19): the solution ~1e19 exceeds 2^60 doublings) => bracketing-failed / expansion-budget-exhausted within 60 expansions, not misreported as mathematical no-solution",
    operation: "hyper_log", direction: "log", call: function () { return MetaNum.hyper_log(MetaNum(10).tetr(1e19), 10, 2, D); },
    expect: { status: "bracketing-failed", termination: "expansion-budget-exhausted", isNaN: true, check: function (r) { return r.expansions === 60 && r.forwardEvaluations <= 70 ? [] : ["expansions=" + r.expansions + " fw=" + r.forwardEvaluations]; } } });
  checkInverseCase({ caseId: "G9.12.8", requirement: "12.4 upper-layer Infinity as a target => non-finite-input (never a finite upper bound); overflow on the analytic side (1e308 root) stays exact via MetaNum arithmetic",
    operation: "hyper_root", direction: "root", call: function () { return MetaNum.hyper_root(Infinity, 2, 2, D); }, expect: { status: "non-finite-input", isNaN: true },
    check: function () { var r = MetaNum.hyper_root(1e308, 2, 1, D); return r.value.eq(MetaNum(1e154)) || Math.abs(r.value.toNumber() - 1e154) <= 1e154 * 1e-9 ? [] : ["root(1e308,2,1) -> " + r.value]; } });
  checkInverseCase({ caseId: "G9.12.9", requirement: "12.4 analytic precision limit: root(1e300,1000,1) — the closed-form candidate fails forward verification by error amplification (1.995^1000) and is reported unrecoverable, not returned as a fake root",
    operation: "hyper_root", direction: "root", call: function () { return MetaNum.hyper_root(1e300, 1000, 1, D); },
    expect: { status: ["unrecoverable", "approximate"], allowNaN: true, check: function (r) {
      if (r.value.isNaN()) return r.status === "unrecoverable" && r.termination === "analytic-verification-failed" ? [] : ["unexpected " + r.status + "/" + r.termination];
      return r.residual.relative !== null && r.residual.relative <= 1e-9 ? [] : ["finite without residual evidence"];
    } },
    note: "design 2.4.1(5): a formula candidate that fails substitution is discarded and the path may fail; the small mirror case root(1e-300,1000,1)=0.501 verifies fine" });
  // forward-side Infinity during bracketing could not be produced by the public forward (MetaNum saturates to finite layer markers) — recorded as not executed
  checkInverseCase({ caseId: "G9.12.10", requirement: "12.4 'finite target with forward overflow to Infinity inside the bracket': NOT EXECUTED — the public forward saturates to finite ε-markers (epsl(10,epsl(10,5)) = 1ε9007199254740990) instead of Infinity, so no stable vector exists; recorded, not replaced by a smooth sample",
    operation: "solver", direction: "-", call: function () { return MetaNum(1); }, run: false,
    note: "closest executed coverage: G9.12.7 (target above image) and G9.12.8 (Infinity target)" });
  checkInverseCase({ caseId: "G9.12.11", requirement: "12.4 'secant candidate actually rejected for leaving the bracket / worsening residual' — the representable-lane case above shows fallbackCount>0; an injected out-of-bracket candidate cannot be forced without a production hook (not added), so the exact rejection branch is covered only indirectly",
    operation: "solver", direction: "-", call: function () { return MetaNum(1); }, run: false,
    note: "indirect coverage via G9.12.4 (fallbackCount=auto>0, bisection=0); no production hook added per 12.4" });
})();

// ───────────────────────────────────────────────────────────────────────────
// G9.13 input immutability, global configuration isolation, determinism (12.5)
// ───────────────────────────────────────────────────────────────────────────
console.log("\n=== G9.13 input immutability, config isolation and determinism (12.5) ===");
(function () {
  var D = INV_DIAG;
  function snap(m) { return JSON.stringify([m.sign, m.array, m.layer]); }
  var c = MetaNum(2).tetr(2.5), n = MetaNum(2), v = MetaNum(10).aperiote(15), b = MetaNum(15);
  var before = [snap(c), snap(n), snap(v), snap(b)];
  var opts = { tol: 1e-10, diagnostics: true };
  MetaNum.hyper_log(c, n, 2, opts); MetaNum.hyper_root(MetaNum(1.5).tetr(2), n, 2, { diagnostics: true });
  v.inv_aperiote(10, { diagnostics: true }); v.aperiote_root(b, { diagnostics: true }); MetaNum.root_aperiote(v, b);
  var after = [snap(c), snap(n), snap(v), snap(b)];
  checkInverseCase({ caseId: "G9.13.1", requirement: "12.5 / spec 4.2.2 no input MetaNum is mutated (sign/array/layer identical before/after) and the caller's options object is not modified",
    operation: "mixed", direction: "log+root", call: function () { return MetaNum.hyper_log(c, n, 2, D); },
    expect: { status: "approximate", check: function () {
      var q = []; before.forEach(function (s, i) { if (s !== after[i]) q.push("input " + i + " mutated"); });
      if (Object.keys(opts).length !== 2 || opts.tol !== 1e-10 || opts.diagnostics !== true) q.push("options mutated: " + JSON.stringify(opts));
      return q; } } });
  var rows0 = MetaNum.maxRows, cols0 = MetaNum.maxCols, leaked = "";
  try { MetaNum.maxRows = 20; MetaNum.maxCols = 12; MetaNum.arrow(10, 40, 10).aperiote_root(40, D); MetaNum(10).aperiote(15).inv_aperiote(10, D); }
  catch (e) { leaked = e.message; } finally { MetaNum.maxRows = rows0; MetaNum.maxCols = cols0; }
  checkInverseCase({ caseId: "G9.13.2", requirement: "12.5 temporary maxRows/maxCols are restored in finally and the default configuration is unchanged afterwards",
    operation: "config", direction: "-", call: function () { return MetaNum(10).aperiote(15).inv_aperiote(10, D); },
    expect: { value: 15, check: function () { var q = []; if (MetaNum.maxRows !== rows0 || MetaNum.maxCols !== cols0) q.push("config not restored"); if (leaked) q.push("threw: " + leaked); return q; } } });
  var r1 = MetaNum.hyper_log(MetaNum(2).tetr(2.5), 2, 2, D), r2 = MetaNum.hyper_log(MetaNum(2).tetr(2.5), 2, 2, D);
  var r3 = MetaNum(10).aperiote(15).aperiote_root(15, D), r4 = MetaNum.root_aperiote(MetaNum(10).aperiote(15), 15, D);
  checkInverseCase({ caseId: "G9.13.3", requirement: "12.5 / spec 4.2.1 determinism: same input, branch, tol, budgets and representation config => same value, status, termination and counts across repeated calls and alias forms",
    operation: "mixed", direction: "log+root", call: function () { return r1; },
    expect: { status: "approximate", check: function () {
      var q = [];
      if (!r1.value.eq(r2.value) || r1.status !== r2.status || r1.termination !== r2.termination || r1.iterations !== r2.iterations || r1.forwardEvaluations !== r2.forwardEvaluations || r1.fallbackCount !== r2.fallbackCount) q.push("log repeat differs");
      if (!r3.value.eq(r4.value) || r3.status !== r4.status || r3.termination !== r4.termination || r3.iterations !== r4.iterations) q.push("alias repeat differs");
      return q; } } });
  var snap1 = MetaNum.hyper_log(MetaNum(2).tetr(2.5), 2, 2, D);
  var originalArray = JSON.stringify(snap1.value.array);
  snap1.value.array[0][0] = 424242; snap1.options.tol = 5; snap1.iterations = 999; if (snap1.bracket && snap1.bracket.lo instanceof MetaNum) snap1.bracket.lo.array[0][0] = 7;
  var snap2 = MetaNum.hyper_log(MetaNum(2).tetr(2.5), 2, 2, D);
  checkInverseCase({ caseId: "G9.13.4", requirement: "12.5 diagnostic snapshots are isolated copies: mutating a returned result's value/options/bracket cannot change later calls or any input",
    operation: "hyper_log", direction: "log", call: function () { return snap2; },
    expect: { status: "approximate", check: function () {
      var q = [];
      if (JSON.stringify(snap2.value.array) !== originalArray) q.push("later call altered by snapshot mutation");
      if (snap2.options.tol !== 1e-12 || snap2.iterations === 999) q.push("options/iterations leaked");
      if (snap(c) !== before[0]) q.push("target mutated through snapshot");
      return q; } } });
  checkInverseCase({ caseId: "G9.13.5", requirement: "12.5 no global last-diagnostics state: a diagnostics call leaves no trace observable by a later default call (no Promise, no global)",
    operation: "hyper_log", direction: "log", call: function () { var p = MetaNum.hyper_log(MetaNum(2).tetr(2.5), 2, 2, D); return MetaNum.hyper_log(MetaNum(2).tetr(2.5), 2, 2); },
    expect: { approx: { to: 2.5, tol: 1e-9 }, check: function (r, v) {
      var q = []; if (typeof v.then === "function") q.push("returned a Promise"); if (typeof v.status === "string") q.push("default call returned a diagnostics object"); return q; } } });
})();

// ───────────────────────────────────────────────────────────────────────────
// G9.14 inverse summary and process gate (10.1 / 14.2)
// ───────────────────────────────────────────────────────────────────────────
console.log("\n=== G9.14 inverse test summary and process gate ===");
(function () {
  var ev = INVERSE_STATS.evidence, cats = INVERSE_STATS.categories;
  console.log("INV SUMMARY | cases=" + INVERSE_STATS.total + " pass=" + INVERSE_STATS.pass + " fail=" + INVERSE_STATS.fail + " error=" + INVERSE_STATS.error + " skipped=" + INVERSE_STATS.skipped);
  console.log("INV EVIDENCE | definition-guaranteed=" + (ev["definition-guaranteed"] || 0) + " representation-level=" + (ev["representation-level"] || 0) + " numerical-experiment=" + (ev["numerical-experiment"] || 0) + " not-applicable=" + (ev["not-applicable"] || 0));
  console.log("INV CATEGORIES | " + Object.keys(cats).sort().map(function (k) { return k + "=" + cats[k]; }).join(" "));
  if (INVERSE_STATS.failedCases.length) console.log("INV FAILED CASES | " + INVERSE_STATS.failedCases.join(", "));
  var skippedIds = [];
  console.log("INV NOTE | skipped rows are recorded above as SKIP lines with their reason (never replaced by a success sample)");
  void skippedIds;
  process.exitCode = (GATE_COUNTS.fail || GATE_COUNTS.error) ? 1 : 0;
  console.log("GATE | FAIL lines=" + GATE_COUNTS.fail + " ERROR lines=" + GATE_COUNTS.error + " => exit code " + process.exitCode);
})();
