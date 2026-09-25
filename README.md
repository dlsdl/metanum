# MetaNum

[![NPM](https://img.shields.io/npm/v/metanum.svg)](https://www.npmjs.com/package/metanum)

- MetaNum v2.0 by dlsdl

A huge number library holding up to X↑↑X&9e15.

This reaches level f<sub>ε₀</sub>, which is the limit of well-defined expressions in BEAF, hence the name.

MetaNum provides a robust implementation of hierarchical number representation based on ordinal arithmetic. It can handle numbers far beyond standard JavaScript Number limits, using a sophisticated multi-dimensional array structure to represent ordinal numbers up to ε₀ (ω^ω^ω^……with ω floors). Internally, each MetaNum instance is represented as:

- **sign**: 1 (positive), -1 (negative), 2 (reciprocal positive), -2 (reciprocal negative)
- **array**: 2-dimensional array `[[r0, r1, r2, ...,rn], [acount, a1, a2, ...,ax], [bcount, b1, b2, ...,by], ...,[mcount, m1, m2, ...,mz]]` where the first row holds the base value and finite hyper-operation exponents and subsequent rows hold ordinal terms, ordinal terms are sorted by levels from small to big
- **layer**: Non-negative integer representing the ω exponent tower height of hyperoperation level(ω^ω^……(ω polynomial) with layer ω^'s)

Using extended arrow operations(see #Mathematical Background), a metanum number can be represented as \[none(sign=1)|-(sign=-1)|1/(sign=2)|-1/(sign=-2)] \[mcount(10{ω^(z-1)\*mz+...+ω^2\*m3+ω\*m2+m1})'s ... bcount(10{ω^(y-1)\*by+...+ω^2\*b3+ω\*b2+b1})'s acount(10{ω^(x-1)\*ax+...+ω^2\*a3+ω\*a2+a1})'s rn(10{n})'s ... r3(10{3})'s r2(10{2})'s r1(10{1})'s r0 (layer=0)|10{ω^ω^...(layer-1 ω^'s) (ω^(ω^(z-1)\*mz+...+ω^2\*m3+ω\*m2+m1)\*mcount+...+ω^(ω^(y-1)\*by+...+ω^2\*b3+ω\*b2+b1)\*bcount+ω^(ω^(x-1)\*ax+...+ω^2\*a3+ω\*a2+a1)\*acount+ω^n\*rn+...+ω^3\*r3+ω^2\*r2+ω\*r1+r0)}10 (layer>=1)]

In Fast Growing Hierarchy, a metanum number is nearly `f_ω^ω^…(layer-1 ω^'s)…(ω^(ω^(z-1)*mz+…+ω^2*m3+ω^*m2+m1)*mcount+…+ω^(ω^(y-1)*by+…+ω^2*b3+ω*b2+b1)*bcount+ω^(ω^(x-1)*ax+…+ω^2*a3+ω*a2+a1)*acount+ω^n*rn+…+ω^3*r3+ω^2*r2+ω*r1+r0)[10](layer>=1)` or `f^mcount_(ω^(z-1)*mz+…+ω^2*m3+ω^*m2+m1)[…[f^bcount_(ω^(y-1)*by+…+ω^2*b3+ω^*b2+b1)[f^acount_(ω^(x-1)*ax+…+…ω^2*a3+ω*a2+a1)[rn 10{n}'s … r3 10^^^'s r2 10^^'s r1 10^'s r0]]…](layer=0)`

## Installation

```bash
npm install metanum
```

## Creating Instances

```javascript
// From a plain number
const a = new MetaNum(428571);
const b = MetaNum.fromNumber(-2.71828);

// From a string (supports scientific notation, hyper-operations, letter notation, brackets, etc.)
const c = new MetaNum("1.797e308");
const d = MetaNum.fromString("1F5");            // tetration: 10^^5
const e = MetaNum.fromString("E100#2");           // Hyper-E: 10^10^100 (googolplex)
const f = MetaNum.fromString("GF^2 E^3 123");     // letter notation
const g = MetaNum.fromString("Aa100");            // letter notation
const h = MetaNum.fromString("[[10], [1, 3]]");   // bracket notation

// From an array
const i = MetaNum.fromArray([2.71828, 1, 2]);        // array=[[2.71828, 1, 2]], =10^^10^^10^2.71828
const j = MetaNum.fromArray([10], 1, 1);          // layer 1

// From an object / JSON
const k = MetaNum.fromJSON('{"sign":1,"array":[[428571]],"layer":0}');
const l = MetaNum.fromObject({ sign: 1, array: [[1, 2]], layer: 0 });

// From BigInt
const m = MetaNum.fromBigInt(10n ** 100n);

// From Hyper-E notation
const n = MetaNum.fromHyperE("EE100");
```

## Constants

```javascript
MetaNum.MAX_SAFE_INTEGER   // 9007199254740991
MetaNum.E                  // log10(MSI)=15.954589770191
MetaNum.POSITIVE_INFINITY  // Infinity
MetaNum.NEGATIVE_INFINITY  // -Infinity
MetaNum.GRAHAMS_NUMBER     // Graham's number (approximation)
MetaNum.TRITRI             // 3↑↑↑3 = 3^^^3
MetaNum.QqQe308            // QqQe308 (for incremental games)
```

## Basic Usage

```javascript
// Arithmetic
const sum = MetaNum.add(15, 27);           // 42 (static)
const diff = new MetaNum(27).sub(15);      // 12 (instance)
const product = new MetaNum(15).mul(27);   // 405
const quotient = new MetaNum(27).div(15);  // 1.8

// Power & roots
new MetaNum(2).pow(10);          // 1024
new MetaNum(100).sqrt();         // 10
new MetaNum(27).cbrt();          // 3
new MetaNum(8).root(3);          // 2
new MetaNum(10).exp();           // e^10

// Logarithms
new MetaNum(100).log10();               // 2
new MetaNum(8).log(2);                  // 3
new MetaNum(Math.E).ln();               // 1

// Comparison
const x = new MetaNum(10), y = new MetaNum(20);
x.lt(y);     // true
x.gt(y);     // false
x.eq(y);     // false
x.lte(y);    // true
x.gte(y);    // false
x.neq(y);    // true
x.min(y);    // 10
x.max(y);    // 20

// Comparison with tolerance
x.eq_tolerance(new MetaNum(10.0001), 1e-3);  // true
x.cmp_tolerance(y, 1e-7);                     // -1

// Sign checks
x.ispos();   // true
x.isneg();   // false
x.isNaN();   // false
x.isFinite(); // true
x.isint();   // true

// Rounding
new MetaNum(3.7).floor();   // 3
new MetaNum(3.2).ceil();    // 4
new MetaNum(3.5).round();   // 4

// Reciprocal & absolute
new MetaNum(4).rec();       // 0.25
new MetaNum(-5).abs();      // 5
new MetaNum(5).neg();       // -5

// Factorial & Gamma
new MetaNum(5).fact();      // 120
new MetaNum(0.5).gamma();   // Γ(0.5) = √π

// Modulo
new MetaNum(10).mod(3);     // 1

// Lambert W function
new MetaNum(1).lambertw();  // Ω ≈ 0.5671
```

## Hyper-Operations (Tetration & Beyond)

```javascript
// Tetration: a^^b
new MetaNum(2).tetr(3);         // 2^^3 = 2^2^2 = 16
new MetaNum(2).tetr(4);         // 2^^4 = 65536
MetaNum.tetr(2, 5);             // 2^^5

// With payload (offset)
new MetaNum(10).tetr(2, new MetaNum(5));  // 10^^2 with payload 5

// Pentation: a^^^b
new MetaNum(2).pent(3);         // 2^^^3

// General arrow notation: a↑^n b
new MetaNum(2).arrow(3)(4);     // 2↑↑↑4 (pentation)
MetaNum.arrow(3, 4, 3);         // 3↑↑↑↑3 = g_1

// Chain notation
new MetaNum(2).chain(4, 3);     // 2→4→3

// Aperiation: a↑^a a
new MetaNum(2).aper(3);         // 2↑↑↑2 = 4
```

## Super-logarithm & Super-root

```javascript
// Super-logarithm (inverse of tetration)
new MetaNum(16).slog(2);        // slog_2(16) = 3
new MetaNum(65536).slog();      // slog_10(65536) ≈ 2

// Super-square-root
new MetaNum(27).ssrt();         // ssqrt(27)

// Linear super-root
new MetaNum(100).linear_sroot(3); // ³ss̅r̅t̅(100)

// Layer arithmetic
new MetaNum(10).layeradd(3);    // add 3 layers of exponentiation
new MetaNum(10).layeradd10(3);  // 10^^3 (explicit base 10)

// General hyperoperation inverses: if a{b}c = d then
// d.hyper_log(a)(b) = c and d.hyper_root(c)(b) = a
MetaNum(14).hyper_log(2)(0);          // 2*7 = 14 → 7
MetaNum(100000).hyper_log(10)(1);     // 10^5 → 5
MetaNum(65536).hyper_log(2)(2);       // 2↑↑4 → 4 (slog)
MetaNum(65536).hyper_root(4)(2);      // 2↑↑4 → 2 (base recovery)
MetaNum(10).arrow(3)(3).hyper_root(3)(3); // 10↑↑↑3 → 10
```

## Hyper-Operations up to ε₀

These functions represent iterated diagonalizations at increasing ordinal levels from ω to ε₀:

```javascript
const x = new MetaNum(10);

// Level ω: diagonalize ω*y (→ a↑^a a)
x.aperiote(3);            // aper(3) = h10

// Level ω+1: iterate aperiote
x.expande(3);             // expa(3) = h11

// Level ω+2: iterate expande
x.multiexpande(3);        // muea(3) = h12

// Level ω+3: iterate multiexpande
x.powerexpande(3);        // poea(3) = h13

// Level ω*2: diagonalize ω+y
x.aperioexpande(3);       // apea(3) = h20

// Level ω*2+1: iterate aperioexpande
x.explode(3);             // expl(3) = h21

// Level ω*2+2: iterate explode
x.multiexplode(3);        // muel(3) = h22

// Level ω*3: diagonalize ω*2+y
x.aperioexplode(3);       // apel(3) = h30

// Level ω*3+1: iterate aperioexplode
x.detonate(3);            // deto(3) = h31

// Level ω*4: diagonalize ω*3+y
x.aperiodetonate(3);      // apdt(3) = h40

// Level ω^2: diagonalize ω*y
x.aperionate(3);          // apeo(3) = h100

// Level ω^2+1: iterate aperionate
x.megote(3);              // mego(3) = h101

// Level ω^2+2: iterate megote
x.multimegote(3);         // mume(3) = h102

// Level ω^2+ω: diagonalize ω^2+y
x.aperimegote(3);         // apmg(3) = h110

// Level ω^2+ω+1: iterate aperimegote
x.megoexpande(3);         // mgea(3) = h111

// Level ω^2+ω*2: diagonalize ω^2+ω+y
x.aperimegoexpande(3);    // apme(3) = h120

// Level ω^2*2: diagonalize ω^2+ω*y
x.megoaperionate(3);    // mgao(3) = h200

// Level ω^2*2+1: iterate megoaperionate
x.gigote(3);              // gigo(3) = h201

// Level ω^2*2+ω: diagonalize ω^2*2+y
x.aperigigote(3);         // apgg(3) = h210

// Level ω^2*3: diagonalize ω^2*2+ω*y
x.gigoaperionate(3);      // ggap(3) = h300

// Level ω^3: diagonalize ω^2*y
x.aperiatote(3);        // apat(3) = h1000

// Level ω^3+1: iterate aperiatote
x.powiainate(3);          // pwan(3) = h1001

// Level ω^3+ω: diagonalize ω^3+y
x.expandainate(3);        // epan(3) = h1010

// Level ω^3+ω^2: diagonalize ω^3+ω*y
x.megodainate(3);         // mgan(3) = h1100

// Level ω^3*2: diagonalize ω^3+ω^2*y
x.powiairate(3);          // pwar(3) = h2000

// Level ω^4: diagonalize ω^3*y
x.aperioguate(3);         // apgu(3) = h10000

// Level ω^ω: diagonalize ω^x (layer 1 transition)
x.iterate(3);                // iter(3) = hww

// Level ω^ω+1: iterate ω^ω level operations
x.itermult(3);            // itmu(3) = hw01

// Level ω^ω*2: (ω^ω)*2 = ω^ω + ω^base
x.cuboiter(3);            // cube(3) = hwx2

// Level ω^(ω+1): ω^(ω+1) = ω^ω*ω → ω^(ω*y)
x.expoiter(3);            // expo(3) = hwa1

// Level ω^(ω*2): ω^(ω*2) = ω^(ω+base)
x.trioterate(3);          // tria(3) = hwm2

// Level ω^(ω^2): diagonalize ω^(ω*y) (layer 2)
x.trixxate(3);            // trix(3) = hwp2

// Level ω^(ω^ω): diagonalize ω^(ω^y) (layer 3)
x.aperixxate(3);          // apix(3) = hwpw

// Level ε₀ = ω↑↑ω: diagonalize ω↑↑y (layer 4)
x.epsilonate(3);          // epsl(3) = hepsl
```

### The ω^ω … ε₀ operations follow rule 3 exactly

Every operation above is evaluated with the unified limit rule
`n{λ}b = n{λ[b]}n` — the final operand is the **base** n, never b. Whenever the
reduced level λ[y] still fits a Cantor-normal-form coefficient row the whole
fundamental-sequence cascade is evaluated:

```javascript
MetaNum(3).iterate(5);     // 3{ω^ω}5 = 3{ω^5}3 = 3{ω^4*3}3 = …
                           // … = 3{ω^4*2+ω^3*2+ω^2*2+ω*2+2}3 → top row [1,2,2,2,2,2]
```

Levels ≥ ω^ω have no finite coefficient row, so the result is stored as the
compact **layer marker** of λ[y] (see the representation rule above: layer L ⇒
`10{ω^ω^…((L-1) ω^'s)…^(bracket)}10`):

so the encoded ordinals grow with the operation
(`iter < itmu < cube < expo < tria < trix < apix < epsl`) and with y, and
`epsilonate(MSI)` is exactly the library's ε-tower cap.

## Inverse Operations

Each expansion operation has a corresponding inverse for decrementing ordinal structure:

```javascript
x.i_aper(z)     // i10 = inverse of aperiote
x.i_expa(z)     // i11 = inverse of expande
x.i_muea(z)     // i12 = inverse of multiexpande
x.i_poea(z)     // i13 = inverse of powerexpande
x.i_apea(z)     // i20 = inverse of aperioexpande
x.i_expl(z)     // i21 = inverse of explode
x.i_muel(z)     // i22 = inverse of multiexplode
x.i_apel(z)     // i30 = inverse of aperioexplode
x.i_deto(z)     // i31 = inverse of detonate
x.i_apdt(z)     // i40 = inverse of aperiodetonate
x.i_apeo(z)     // i100 = inverse of aperionate
x.i_mego(z)     // i101 = inverse of megote
x.i_mume(z)     // i102 = inverse of multimegote
x.i_apmg(z)     // i110 = inverse of aperimegote
x.i_mgea(z)     // i111 = inverse of megoexpande
x.i_apme(z)     // i120 = inverse of aperimegoexpande
x.i_mgao(z)     // i200 = inverse of megoaperionation
x.i_gigo(z)     // i201 = inverse of gigote
x.i_apgg(z)     // i210 = inverse of aperigigote
x.i_ggap(z)     // i300 = inverse of gigoaperionate
x.i_apat(z)     // i1000 = inverse of aperiatotion
x.i_pwan(z)     // i1001 = inverse of powiainate
x.i_epan(z)     // i1010 = inverse of expandainate
x.i_mgan(z)     // i1100 = inverse of megodainate
x.i_pwar(z)     // i2000 = inverse of powiairate
x.i_apgu(z)     // i10000 = inverse of aperioguate
x.i_iter(z)      // iww = inverse of iter
x.i_itmu(z)     // iw01 = inverse of itermult
x.i_cube(z)     // iwx2 = inverse of cuboiter
x.i_expo(z)     // iwa1 = inverse of expoiter
x.i_tria(z)     // iwm2 = inverse of trioterate
x.i_trix(z)     // iwp2 = inverse of trixxate
x.i_apix(z)     // iwpw = inverse of aperixxate
x.i_epsl(z)     // iepsl = inverse of epsilonate
```

### Fractional hyperoperation levels

Levels interpolate geometrically (README rule (i)); `x{n+f}y = x{n+1}(θf)`
with `θf` continuous between `x{n}y` (f=0) and `x{n+1}y` (f=1). For the
canonical diagonal this is exactly `10{n+f}10 = 10{n+1}(2·5^f)`:

```javascript
MetaNum(10).arrow(3.5)(10);   // 10{3.5}10 = 10{4}(2·5^0.5)
MetaNum(10).arrow(3.2)(10);   // monotone between 10{3}10 and 10{4}10
```

### Non-integer arguments at ordinal levels

The same continuity applies to the ω-and-above operations. Successor levels
follow `x{α}(m+f) = x{α-1}` applied m times to `x^f`; the ω level matches
`aperiote` exactly, so composition identity holds verbatim:

```javascript
MetaNum(10).expande(2.1);      // 10{ω+1}2.1 = 10{ω}10{ω}(10^0.1)
MetaNum(10).expande(2);        // 10{ω}10 (continuous at the integers)
MetaNum(10).multiexpande(2.1); // (10{ω+1})²(10^0.1)
```

**Limit levels take the fundamental sequence at the full (fractional) `y`**, so
the fraction is never dropped (`h20(10,2.1)` ≠ `h20(10,2)`). The sequence can
then carry fractional coefficients, which resolve against the base x because on
the diagonal ω reads as x:

- ω^(k)·(c+f) = ω^(k)·c + ω^(k-1)·(x·f), applied top-down (ω^0.1 = x^0.1), so
  only the constant term can still be fractional;
- a leftover fractional constant γ+f is one level of interpolation:
  **x{γ+f}x = x{γ+1}(2·(x/2)^f)** — continuous at f=0 because x{γ+1}2 = x{γ}x.

**Successor levels** keep `x{α}(m+f) = x{α-1}` applied m times to `x^f`, and they
are stored in the same **expanded** form as the integer arguments: the α-1 row
carries the m applications (`ceil(y)-2 = m-1`) and the cascade below it is
generated at the fundamental-sequence index `x^f`, so the value grows with f
inside the interval and converges to the next integer as f → 1:

```javascript
MetaNum(10).h21(2.0001);  // Ba2.218Ab9     f → 0: cascade bottoming at ω
MetaNum(10).h21(2.5);     // Ba1.772Ad9     the cascade deepens with f
MetaNum(10).h21(2.99);    // Ba2.447Aj9  →  converges to h21(10,3) = Ba1.000Ak9
```

For the ω+1 / ω+2 / ω+3 levels the applications after the first still have an
operand inside MSI, so those are evaluated directly by the rule (that is the
`10{ω}10{ω}(10^0.1)` composition above) — which is also the exact identity.
An iteration count beyond direct evaluation diagonalizes through the engine's
huge-argument convention (y plus one α-level marker row). Then we have:

10{ω\*2}2.1=10{ω+2.1}10=10{ω+3}2\*5^0.1 (because 10{ω+2}10=10{ω+3}2)

3{ω\*2}2.1=3{ω+2.1}3=3{ω+3}2\*1.5^0.1

10{ω^2}2.1=10{ω\*2.1}10=10{ω\*2+10\*0.1}10=10{ω\*2+1}10

3{ω^2}2.1=3{ω\*2.1}3=3{ω\*2+3\*0.1}10=3{ω\*2+0.3}3=3{ω\*2+1}2\*1.5^0.3

10{ω^ω}2.1=10{ω^2.1}10=10{ω^2\*10^0.1}10=10{ω^2\*1.258925}10=10{ω^2\*1+ω\*2+5.8925}10=10{ω^2\*1+ω\*2+6}2*5^0.8925

3{ω^ω}2.1=3{ω^2.1}3=3{ω^2\*3^0.1}3=3{ω^2\*1.116123}3=3{ω^2\*1+1.045107}3=3{ω^2\*1+2}2*1.5^0.045107

## BEAF Operations

Bowers' Exploding Array Function (BEAF) is supported via ordinal arithmetic for 3+ arguments:

```javascript
// BEAF(a,b,c,d,e,f,...) = a{...+ω^3*(f-1)+ω^2*(e-1)+ω*(d-1)+c}b
// (the constant term keeps its value; ω-and-above coefficients decrement by 1)

// 3-entry: {a,b,c} = a↑^c b (standard up-arrow notation)
MetaNum.BEAF(3, 3, 2);       // 3↑↑3 = 7625597484987
MetaNum.BEAF(3, 3, 3);       // 3↑↑↑3 = tritri

// 4-entry: {a,b,c,d} = a(ω*(d-1)+c level operation)b
MetaNum.BEAF(2, 2, 1, 2);    // 2{ω}2
MetaNum.BEAF(3, 3, 3, 3);    // 3{ω*2+3}3

// 5+ entry: ordinal arithmetic
MetaNum.BEAF(10, 2, 1, 1, 2); // 10{ω^2}2
MetaNum.BEAF(3, 3, 3, 3, 2);  // 3{ω^2+ω*2+3}3
MetaNum.BEAF(4, 5, 6, 7, 8, 9);  // 4{ω^3*8+ω^2*7+ω*6+6}5

// Ordinal expansion order and truncation (maxRows = 100 by default):
// the expansion evaluates from the largest ordinal down and keeps the largest
// maxRows-1 ordinal rows.  Without truncation the expansion is exact, e.g.
// BEAF(3,3,5,5,5) = 3{ω^2*4+ω*4+5}3 enumerates all 50 sub-ordinals.
// When the expansion exceeds the row budget the base defaults to [10] and the
// first kept row's count is incremented by 1 as a truncation marker, e.g.
// BEAF(5,5,1,1,1,2) = 5{ω^3+1}5 → [[10],[4,2,0,1],...,[3,0,0,0,1]].

// nested BEAF: {a,{b,c,d,e},f,g,h}
// An argument exceeding MSI supremum-collapses (use fundamental sequences rules):
// ω*i+HUGE ≈ ω*(i+1), ω^i*HUGE ≈ ω^(i+1), etc.
// (lower coefficients are swallowed), and the result anchors at that argument's value.
MetaNum.BEAF(4, MetaNum.BEAF(4, 2, 3, 5), 3, 5); // 4{ω*4+3}4{ω*4+3}2

// Parse BEAF string notation
MetaNum.fromBeaf("{3,3,3}");         // 3↑↑↑3
MetaNum.fromBeaf("{3,3,3,3}");       // 3{ω*2+3}3
MetaNum.fromBeaf("{10,2,1,1,2}");    // 10{ω^2}2

// Convert to BEAF string
new MetaNum(7625597484987).toBeaf();  // "{7625597484987}"
MetaNum.BEAF(3,3,3).toBeaf();        // "{3638334640023.7783}"
```

## Hardy Hierarchy

`MetaNum.hardy(n)` evaluates the Hardy hierarchy `H_α(10)` where the ordinal α
is built from the decimal digits of n (base 10, `hardy(1234) = H_{ω³+ω²·2+ω·3+4}(10)`):

```javascript
MetaNum.hardy(10);    // H_ω(10) = 20
MetaNum.hardy(11);    // H_{ω+1}(10) = 22
MetaNum.hardy(100);   // H_{ω²}(10) = 10240
MetaNum.hardy(1234);  // H_{ω³+ω²·2+ω·3+4}(10), exact for small levels and
                      // engine-collapsed (F_j = H^{ω^j}) for deep segments
```

Recursion rules: `H_0(n) = n`, `H_{α+1}(n) = H_α(n+1)` (only +1, never
iterated), `H_λ(n) = H_{λ[n]}(n)` with the CNF fundamental sequences.

### Hardy beyond ω^ω

For n ≥ 1e10 the leading exponent k ≥ 10 is itself converted to a base-10
ordinal, so `hardy(1e11) = H_{ω^(ω+1)}(10)` sits at the `10{ω+1}10` scale
(via `H_{ω^β}(n) = F_β(n)`), not the flat `10{11}10` scale. The value is
evaluated per the definition (from below), so it is strictly BELOW the
matching engine hyper-op:

```javascript
MetaNum.hardy(1e10);  // = H_{ω^ω}(10) = H_{ω^10}(10), array exactly
                      //   [3086.036065328153, 9,9,9,9,9,9,9,9] — below 10{10}10
MetaNum.hardy(1e11);  // = H_{ω^(ω+1)}(10) — below 10{ω+1}10 (expande(10,10))
```

More generally, with n = dk·10^kExp + rest: α = ω^ord(kExp)·dk + ord(rest) is
built recursively (n1 = H_ord(rest)(10), base = H_{ω^n1}(n1) when n1 is a
small finite), and the rows of 10{ω+c}(9+dk) are mirrored onto that base for
kExp ≥ 11. hardy is monotone across this range:
`hardy(9999999999) < hardy(1e10) < hardy(10000000001)`.

hardy(1e20) = H_{ω^(ω*2)}(10), hardy(1e100)=H_{ω^(ω^2)}(10), hardy(e1e10)=H_{ω^(ω^ω)}(10), and so on.

### hardy input extensions

```javascript
MetaNum.hardy(1e21);            // >1e20 scientific strings expand to exact
                               //   digits — the reading stays monotone:
                               //   hardy(1e20) < hardy(1e21) < hardy(1e22)
MetaNum.hardy(MetaNum(10).tetr(100));
                               // power towers shadow to ω^ω^…^ω (k ω's):
                               //   hardy(10^^k) = 10.epsilonate(k)
MetaNum.hardy(MetaNum(10).tetr(Number.MAX_SAFE_INTEGER));
                               // hardy(10^^MSI) = the MetaNum limit exactly:
                               //   10{ω^ω^…^ω(MSI ω's)}10 (the ε-tower cap)
MetaNum.hardy(MetaNum("G600")) // MetaNum-object > 10^^MSI should return Infinity
MetaNum.hardy(MetaNum.arrow(3, 9, 3)) // = Infinity (3{9}3 is far above 10^^MSI)
```

`MetaNum.infinity` (alias of `MetaNum.POSITIVE_INFINITY`) is the value returned
once the input passes the ε₀ ceiling: any MetaNum beyond `10^^MSI` — e.g. `G600`
(= 10{3}600), `3{9}3`, or a power tower taller than `10^^MSI` — has no Hardy
level inside the library, so `hardy` yields Infinity. Below the ceiling the
tower height still reads exactly: `hardy(10^^(MSI-1)) = 10.epsilonate(MSI-1)`.

## Layer & Serialization

```javascript
// Layer manipulation
new MetaNum(10).layerUp();     // promote to layer+1
new MetaNum(10).layerDown();   // demote to layer-1

// Output formats
new MetaNum(123).toString();               // "123"
new MetaNum(1e308).toString();             // "E308"
new MetaNum(100).toNumber();               // 100
new MetaNum(100).valueOf();                // "100"
new MetaNum(100).toFixed(2);               // "100.00"
new MetaNum(100).toExponential(2);         // "1.00e+2"
new MetaNum(100).toPrecision(3);           // "100"
new MetaNum(100).toHyperE();               // "100"
new MetaNum(100).toStringWithDecimalPlaces(4); // "100.0000"
new MetaNum(100).toJSON();                 // {sign:1, array:[[100]], layer:0}
new MetaNum(100).format();                 // letter notation (format-metanum.js),
                                           // e.g. MetaNum.hardy(4166).format() → "2.397G5"
                                           // optional args: format(precision, small)
```

## Utility Functions

```javascript
// Binomial coefficient
new MetaNum(10).choose(3);     // C(10,3) = 120

// Hyper-operation
MetaNum.hyper(4, 2, 3);        // 2^^3 = 16  (n=4 means tetration)

// Geometric series
MetaNum.sumGeometricSeries(5, 1, 2);       // 1+2+4+8+16 = 31
MetaNum.affordGeometricSeries(100, 1, 2, 0);

// Arithmetic series
MetaNum.sumArithmeticSeries(5, 1, 2);      // 1+3+5+7+9 = 25
MetaNum.affordArithmeticSeries(100, 1, 2, 0);

// Configuration
MetaNum.config({ maxRows: 50, maxCols: 50, maxArrow: 1e6, debug: 1 });
```

# Mathematical Background

The library implements the extended arrow operation which is a hierarchy of functions indexed by ordinal numbers. The representation uses Cantor normal form for ordinals, where:

- ω represents the first infinite ordinal
- ω^ω represents ω raised to the power of ω
- ε₀ is the limit of ω, ω^ω, ω^ω^ω, ...

For more information, see: <https://en.wikipedia.org/wiki/Ordinal_arithmetic>

## Definition

Let n and b be natural numbers, and α be a countable ordinal

- rule 1: If α=0, n{α}b=n×b
- rule 2: If α is a successor ordinal, then n{α}b =n if b=1, =n{α-1}n{α}(b-1) if b>1
- rule 3: If α is a limit ordinal, then n{α}b=n{α\[b]}n
- rule 4: Operations are calculated from right to left

where α\[b] denotes the b-th element of the fundamental sequence assign to the limit ordinal of α, see also fundamental sequences for limit ordinals written in Cantor normal form:

- ω\[n]=n
- ω^(α+1)\[n]=ω^α×n where ω^α×n=ω^α+ω^α+...+ω^α with n ω^α's
- ω^α\[n]=ω^(α\[n]) if and only if α is a limit ordinal
- (ω^(α_1)+ω^(α_2)+...+ω^(α_k))\[n]=ω^(α_1)+ω^(α_2)+...+ω^(α_k)\[n], where α_1>=α_2>=...>=α_k
- ε₀\[0]=1 and ε₀\[n+1]=ω^ε₀\[n]

### The application count of each ordinal row

Expanding rules 2-3 all the way down shows that **only the top row depends on
the argument b** — every row below it is produced by decomposing with the base
n as the operand:

- successor α: n{α}b = n{α-1}^(b-2) (n{α-1}n), so the α-1 row carries **b-2**
  applications and every lower row (which comes from n{α-1}n, n{α-2}n, …
  whose operand is n) carries **n-2**;
- limit α: rule 3 first rewrites n{α}b = n{α\[b]}n, so the operand is n at
  every level and **all** rows carry **n-2**.

```javascript
MetaNum(10).h13(20);   // 10{ω+3}20 = 10{ω+2}^18 10{ω+1}^8 10{ω}^8 10{ω}10
// array → [[1e10,8,8,8,8,8,8,8,8], [8,0,1], [8,1,1], [18,2,1]]
//            ω+2 row = 18 = y-2,  ω+1 and ω rows = 8 = x-2
MetaNum(10).h12(20);   // 10{ω+2}20 → [8,0,1] [18,1,1]
MetaNum(3).h13(20);    // 3{ω+3}20  → [1,0,1] [1,1,1] [18,2,1]   (x-2 = 1)
```

The same n-2 count is what the finite r0 coefficients carry (10{10}10 → all-8s),
so a row below the top one never moves when b changes.

The law is uniform for **every** level from ω+1 to ω^4:

| kind | rows | top row count | lower rows |
|---|---|---|---|
| successor α = β+1 | rows of n{β}n, then one β-row | **b-2** | **n-2** |
| limit α | rows of n{α\[b]}n | **n-2** | **n-2** |

```javascript
MetaNum(10).h21(20);   // 10{ω*2+1}20 = 10{ω*2}^18 (10{ω*2}10)
// 10{ω*2}10 = 10{ω+10}10 → the ω..ω+9 cascade, every count x-2 = 8
// array → [[…,8,…], [8,0,1] … [8,9,1], [18,0,2]]
MetaNum(10).h22(20);   // … + [8,0,2] + [18,1,2]   (ω*2 row = 8, ω*2+1 row = 18)
MetaNum(3).h21(20);    // 3{ω*2+1}20 → [1,0,1] [1,1,1] [1,2,1] [18,0,2]  (x-2 = 1)
```

A limit operation stays **expanded** for every argument up to MSI: rule 3 turns
b into a fundamental-sequence index, so 100 < b ≤ MSI still yields the largest
`maxRows-1` fundamental-sequence rows (with the standard truncation marker)
instead of collapsing to a one-row marker — `h20(10,1000)` keeps 19 rows whose
top one is ω+999, and `h20(10,MSI)` keeps rows up to ω+(MSI-1).

## Examples

642663{0}178187=642663×178187=114514191981

10{1}5=10{0}10{1}4=10{0}10{0}10{1}3=10{0}10{0}10{0}10{1}2=10{0}10{0}10{0}10{0}10{1}1=10×10×10×10×10=10^5=100000

10{2}4=10{1}10{2}3=10{1}10{1}10{2}2=10{1}10{1}10{1}10{2}1=10{1}10{1}10{1}10=10^(10^(10000000000))

10{3}3=10{2}10{2}10=10{2} 9(10{1})'s 10=10↑↑(10^10^10^10^10^10^10^10^10000000000)

3{ω}5=3{5}3=3{4}3{5}2=3{4}3{4}3=3{4}3{3}3{3}3=3{4}3{3}3{2}3{2}3=3{4}3{3}3{2}3{1}3{1}3=3↑↑↑↑3↑↑↑3↑↑7625597484987

5{ω+1}4=5{ω}5{ω+1}3=5{ω}5{ω}5{ω+1}2=5{ω}5{ω}5{ω}5{ω+1}1=5{ω}5{ω}5{ω}5=5{ω}5{ω}5{5}5=5{ω}5{5{5}5}5=5{5{5{5}5}5}5

4{ω+2}3=4{ω+1}4{ω+1}4=4{ω+1}4{ω}4{ω}4{ω}4=4{ω+1}4{4{4{4}4}4}4=4{ω}4{ω}... with 4{4{4{4}4}4}4 4's

10{ω×2}10=10{ω+10}10=9(10{ω+9})'s 10=8(10{ω+9})'s 9(10{ω+8})'s 10=8(10{ω+9})'s 8(10{ω+8})'s ... 8(10{ω+1})'s 8(10{ω})'s 8(10{9})'s ... 8(10{1})'s 10000000000

10{ω^2}4=10{(ω^2)[4]}10=10{ω×4}10=10{(ω×4)[10]}10=10{ω×3+10}10=10{ω×3+9}10{ω×3+10}9=...=10{ω×3+9} 8(10{ω×3+8})'s ... 8(10{ω×3+1})'s 8(10{ω×3})'s 8(10{ω×2+9})'s ... 8(10{ω})'s ... 8(10{1})'s 10000000000

10{ω^ω}4=10{(ω^ω)[4]}10=10{ω^4}10=10{(ω^4)[10]}10=10{ω^3×10}10=... (every limit step ends on the base 10; successor steps iterate) ... 8(10{1})'s 10000000000

10{ω^(ω^2)}4=10{(ω^(ω^2))[4]}10=10{ω^(ω×ω)}10=10{ω^(ω×4)}10=10{ω^(ω×3+10)}10=... (rule 3: each FS step ends on the base 10)

10{ε₀}4=10{ε₀[4]}10=10{ω^(ω^(ω^ω))}10=10{ω^(ω^(ω^10))}10=... (ε₀[n+1]=ω^(ε₀[n]), final operand 10)

# dlsdl's Letter Notation

Modified from PsiCubed's letter notation(<https://googology.fandom.com/wiki/User_blog:PsiCubed2/My_Letter_Notation>)

The idea here is to extend the PsiCubed's letter notation to much larger numbers reach level ε0 of FGH or HH. The properties we wish to preserve here are:

(1) Any number has a unique standard representation in the system.

(2) Given the standard representation of two numbers, one can immediately tell which one is larger without any calculations.

## The format of the proposed notation

Our final notation will look like this:

\[symbol]\[letter]\[number]

where \[symbol] can be one of the following: empty,!,@,#,$,%,&,……

where \[letter] can be one of the following: E,F,G,H,……,Aa,Ab,Ac,……,Ba,Bb,……,Aaa,……

and \[number] can be any positive real number (nonintegers included).

## Single letter notation

### The First Levels: A Continuous version of Knuth Arrows

Let α be a positive real number, β be a positive integer, we'll define (use extended arrow operation):

Eα = 10^α = 10{1}α

Fα = EEEE...EEE(10^frac(α)) with int(α) E's = 10{2}α

Gα = FFFF...FFF(10^frac(α)) with int(α) F's = 10{3}α

Hα = GGGG...GGG(10^frac(α)) with int(α) G's = 10{4}α

then we'll have I,J,K,... to Z ,each with the same definition as Hα.

Note that according to these definitions we have:

(1) For α≤1: Eα = Fα = Gα = Hα = ... = Zα = 10^α

(2) For any integer β: Eβ = 10{1}β, Fβ = 10{2}β, Gβ = 10{3}β, Hβ = 10{4}β

the γ-th letter β represents 10(γ-4 arrows)β = 10{γ-4}β

So the above definitions are indeed an extention of Knuth arrows to nonintegers.

### Letter-Canonical Forms

If α is a number greater than 1 and Γ is a one of the letters E,F,G,H,...,Z then there is a unique number β such that:

α = Γβ.

And we call "Γβ" the Γ-Canonical Form of the number α.

For example, the E-Canonical form of 1000 is E3:

E3 = 10^3 = 1000.

And the F-Canonical form of 1000 is about F1.47712:

F1.47712 = E(10^0.47712) ≈ E3 = 10^3 = 1000.

### Binary-Letter-Canonical Forms

To recreate ordinary scientific notation, we'll define a binary version of the letter functions like this:

Let Γ be one of the letters E,F,G,H,...,Z, β be a nonnegative integer and α be a real number between 1 and 10. Then:

αΓβ = Γ(β+log(α))

For Example:

7E3 = E(3+log(7)) = 10^(3+log(7)) = 7\*10^3 = 7000

7F3 = F(3+log(7)) = EEE(10^log(7)) = EEE7 = 10^10^10^7

So αEβ is nothing more than ordinary scientific notation.

And αFβ is a power tower of β 10's topped by an α.

And again, given any specific letter (E,F,G,H,...,Z), ANY number greater than 1 has a unique representation as αΓβ (with 1≤α<10). So we can call this the Binary-Γ-Canonical Form of α.

## Multi letter notation

### Defining Aa - The First Diagonalization

In the previous section we've defined a finite sequence of functions, so we can diagonalize over them:

let 10{1}α = Eα, 10{2}α = Fα, 10{3}α = Gα, ..., 10{22}α = Zα.

we had: Aaα = 10{α}10.

So Aa has ω hyper-operation level, comparable to f\_ω\_(n) in FGH.

Then, we'll give a definition for non-integer 10{α}10 and amend the definition of Aa:

- Aaα = 10{α}10 = 10{int(α)+1}2\*5^frac(α)

The seemingly complex expression simply gives us a smooth geometric curve between 2 and 10. This ensures that Aa would be continuous, given the identity 10{β}10 = 10{β+1}2.

For example, Aa10 = 2Aa10 = 10{10}2 = 2Aa10, Aa10.5 = 10{10}2\*5^0.5 = 10{10}4.472 = 4.472Aa10

### Ab,Ac,Ad,...,Az and their Universal Binary-Letter-Canonical Forms

The definitions of Ab,Ac,Ad,...,Az are simple enough:

Abα = AaAa...AaAa(10^frac(α)) with int(α) Aa's = 10{ω+1}α

Acα = AbAb...AbAb(10^frac(α)) with int(α) Ab's = 10{ω+2}α

then we have Ad,Ae,...,Az, each with the same definition as Ab and Ac.

And that's it. So A(the β+1-th lowercase letter)α is 10{ω+β}α, comparable to f\_ω+β\_(n) in the FGH.

Again we have Ab0=Ac0=Ad0=...=Az0=1, Ab1=Ac1=Ad1=...=Az1=10, Aa10=Ab2, Ab10=Ac2, ... and Ab,Ac,Ad,...,Az are all continuous. So any number greater than 1 has a unique Ab to Az Canonical Form.

Moreover, since Aa10=Ab2, we can extend our definition of the "Universal Binary-Letter-Canonical Form" up to Az:

(1) Set a threshold number θ (such as 100, that's 1E2)

(2) if the number <θ then we write down the scientific notation of this number.

(3) Otherwise, we write Γα = 10^frac(α)Γint(α) for letter combinations (E~Z, Ab~Az) or = 2*5^frac(α)Γint(α) for Aa, and 2≤α<θ. If there is more than one possible choice, we choose the letter combination which comes first in order.

Examples: 

10{20}10 = X10 = Y2 = Aa20, so we write it as 1X10.

10{30}10 = Aa30, so we write it as 2Aa30.

10{ω+1}10 = Ab10 = Ac2, so we write it as 1Ab10.

### Defining from Ba to Bz

We already know how to do recursion (F,G,H,I,...,Z) and simple diagonalization (Aa) in our continuous system, so we can easily extend our system up to ω\*2 level. In order to track our progress, we'll define:

- 10{α}10 = Aaα, 10{ω+β+1}α = 10{ω+β}10{ω+β}...10^frac(α) with int(α) 10{ω+β}'s

And define Baα in a way similar to Aaα:

Baα = 10{ω+α}10 = 10{ω+int(α)+1}2\*5^frac(α)

This gives rise to writing numbers in Ba Canonical form and extend the Universal Binary-Letter-Canonical Form up to Ba10, which have ω\*2 level.

Then we can define Bb,Bc, Bd,...,Bz with recursions in a similar way. Bbα = BaBa...BaBa(10^frac(α)) with int(α) Ba's = 10{ω\*2+1}α, and Bcα = BbBb...BbBb(10^frac(α)) with int(α) Bb's = 10{ω\*2+2}α, etc. So B(the β+1-th lowercase letter)α is 10{ω\*2+β}α.

### A Supporting Extended Arrow Operation and Aaa

We can, of-course, repeat what we did in the previous section as many times as we wish and get the following ω^2-level notation (β,γ ≥ 0 are integers, and α≥0 is real):

(i) 10{1}α = 10^α

(ii) 10{ω\*β+γ+1}α = 10{ω\*β+γ}10{ω\*β+γ}...10^frac(α) with int(α) 10{ω\*β+γ}'s

(iii) 10{ω\*β+α}10 = 10{ω\*β+int(α)+1}2\*5^frac(α)

(iv) 10{ω\*(β+1)}α = 10{ω\*β+α}10

Note that {ω\*β+γ} is a valid extended arrow operation. Also, in this new notation we can write Baα = 10{ω+α}10, Bbα = 10{ω\*2+1}α,... Bzα = 10{ω\*2+25}α.

We can extend to more uppercase letters: Caα = 10{ω\*2+α}10, Cbα = 10{ω\*3+1}α, ..., Zaα = 10{ω\*25+α}10, ..., and finally Zzα = 10{ω\*26+25}α.

So we have Qq1.000Qe308 = 10{ω17+16}10{ω17+4}308

And with this new supporting notation we can now to define:

- Aaaα = 10{ω\*int(α)+10\*frac(α)}10

Containing a very neat trick that allows us to do the double-diagonalization with a single number: Aaa1.5 = 10{ω+5}10, Aaa2.5 = 10{ω\*2+5}10

At any rate, it isn't too difficult to see that Aaa behaves "nicely" and allows us to speak of Aaa Canonical Forms of any number. And since Aaa1=Aa10, Aaa2=Ba10, ..., Aaa26=Za10, this also enables us to write the Unversal Binary-Letter-Canonical Form of any number below 10{ω^2}10.

## Symbol and letter notation

### Arrays with more than two variables, and !Aa

Extended arrow operations can be easily extended, like so:

(i) 10{1}α = 10^α

(ii) 10{...+ω^3\*β+ω^2\*γ+ω\*δ+ν+1}α = 10{...+ω^3\*β+ω^2\*γ+ω\*δ+ν}10{...+ω^3\*β+ω^2\*γ+ω\*δ+ν}...10^frac(α) with int(α) 10{...+ω^3\*β+ω^2\*γ+ω\*δ+ν}'s

(iii) 10{...+ω^3\*β+ω^2\*γ+ω\*δ+α}10 = 10{...+ω^3\*β+ω^2\*γ+ω\*δ+int(α+1)}2\*5^frac(α)

(iv) 10{(...+ω^3\*β+ω^2\*γ+ω\*δ+μ+1)\*ω^κ}α = 10{(...+ω^4\*β+ω^3\*γ+ω^2\*δ+ω\*μ+α)\*ω^(κ-1)}10

(v) 10{(...+ω^3\*β+ω^2\*γ+ω\*δ+α)\*ω^κ}10 = 10{(...+ω^4\*β+ω^3\*γ+ω^2\*δ+ω\*int(α)+frac(α)\*10)\*ω^κ}10

The first 4 rules are a simple and direct extention of the {ω\*β+γ} notation.

Rule (v) is an interesting one, though. It basically tells us that if we have an ordinal which ends with ω^n\*0 terms, then the digits of the fractional part of α are to be distributed among the terms. For example:

- 10{ω^6\*114+ω^5\*514+ω^4\*1.9198}10 = 10{ω^6\*114+ω^5\*514+ω^4+ω^3\*9+ω^2+ω\*9+8}10.

Now, all that is left to do is to define !Aa, which has ω^ω level.

- !Aaα = 10{ω^int(α)\*frac(α)}10

Then we have !Aa2 = Aaa10, !Aa3 = Aaaa10,... Just like the previous letters, any number can be written as !Aaα. Here, it is actually the binary form of !αAaβ = !Aa(β+logα) which has the most intuitive meaning:

In terms of the extended arrow operation, β tells us ω^β is in the ordinal and the digits of α tell us its coefficient and what residue ordinals are. Actually, !αAaβ has a more ω^ layer compare to αAaβ in ordinal level. For example, !1.2345Aa4 = 10{ω^4+ω^3\*2+ω^2\*3+ω\*4+5}10 and 10{4}10 < 1.2345Aa4 < 10{4}10{4}10

And in terms of ordinals, β gives us the maximum power of ω and the digits of α give us the coefficents of the various powers of ω, these neat relations are also true for β=1 and α≥2.

### Higher dimensional arrays and @Aa

With the definition of the extended arrow operation and the symbol !, one can easily define new operations up to ω^ω^ω level. 

By adding ! before a letter notation, it adds a ω^ layer (likes the same ordinal but changes from HH to FGH). Aa represents ω level, so !Aa represents ω^ω level. Then we can define !Ab (ω^(ω+1)), !Ac, !Ad, ..., !Az with the same meaning as !Aa, and !Ba (ω^(ω\*2)), !Bb, !Bc, ..., !Bz, !Aaa, etc. Comparing these with the previous letters, we can see that notations with ! symbol have a more ω^ than those without ! symbol. Fractional number of rows, columns, etc.. are defined in the same way.

Now, all that is left to do is to define @Aa, which has ω^ω^ω level.

- @Aaα = 10{ω^(ω^int(α)\*frac(α))}10

### Nested arrays and more symbols

The Definiton of more symbols is similar to the definition of @Aa.

- \#Aaα \~ 10{ω^ω^(ω^int(α)\*frac(α))}10

- \$Aaα \~ 10{ω^ω^ω^(ω^int(α)\*frac(α))}10

Then we can define (the β-th symbol or symbol combination)Aaα = 10{ω^ω^...^(ω^int(α)\*frac(α))(β ω's)}10

### Definition of the final letter: ε

ε represents exponent tower layers of ω.

- αεβ \~ 10{ω^ω^...^(ω^int(α)\*frac(α))(β ω's)}10

### Using dlsdl's letter notation, the biggest number we can define in Metanum is about ε9.007E15

# format-metanum

## Description

Implementation of dlsdl's letter notation for large number library, currently metanum.js

## format options

```javascript
  smallNotationUseE         // 1. for small value notations, true then use αE-β，false then use number⁻¹
  smallNotationThreshold    // 2. =n then value < 10^-n uses small notation
  decimalPlaces             // 3. for normal notations, =0 is 1，=1 is 1.0，=2 is 1.00 etc.
  decimalThreshold          // 4. =n then value >= 10^n do not show decimal part
  useCommas                 // 5. whether to show commas in normal numbers (true/false)
  sciThreshold              // 6. =n then value >= 10^n use scientific notation, same for β in αEβ
  sciSignificantDigits      // 7. =n then α has n decimal places in αEβ
  sciDecimalThreshold       // 8. =n then β >= 10^n in αEβ only show integer part of α
  singleLetterDigits        // 9. α's decimal places in αFβ,αGβ...αZβ
  repeatLetterThreshold     // 10. =n then n repeated single letters use next letter notation, n<2 then use 2
  multiLetterDigits         // 11. α's decimal places in αAaβ,αAbβ...αAzβ and above
  multiLetterRepeatThreshold// 12. =n then n repeated multi letter combinations use next letter notation, n<2 then use 2
  multiLetterLimit          // 13. =n then length of multi letter combinations does not exceed n, exceed then switch to next notation (length of Aa is 2, Aaa is 3, Aaaa is 4...), n<2 then use 2
  epsilonSignificantDigits  // 14. α's decimal places in αεβ
```

## Cases

- 0 ~ 10^-smallNotationThreshold: E- format(αE-β=α×10^-β; E-αEβ=10^-(α×10^β); E-……=10^-……)(smallNotationUseE true) or ……⁻¹(reciprocal)
- 10^-smallNotationThreshold ~ 10^decimalThreshold: decimal format (decimalPlaces digits)
- 10^decimalThreshold ~ 10^sciThreshold: comma format(useCommas true) or integer format
- 10^sciThreshold ~ 10^(10^sciThreshold): exponential as well as αEβ format
- 10^(10^sciThreshold) ~ 10^^(repeatLetterThreshold+1): n E's αEβformat(EαEβ, EEαEβ, EEEαEβ……)
- 10^^(repeatLetterThreshold+1) ~ 10^^(10^sciThreshold): αFβ format
- 10^^(10^sciThreshold) ~ 10^^(10^^(repeatLetterThreshold+1)): FαEβ, FEαEβ, FEEαEβ…… format
- 10^^(10^^(repeatLetterThreshold+1)) ~ 10^^^(repeatLetterThreshold+1): FαFβ, FFαFβ, FFFαFβ…… format
- 10^^^(repeatLetterThreshold+1) ~ 10^^^(10^sciThreshold): αGβ format
- 10^^^(10^sciThreshold) ~ 10^^^(10^^(repeatLetterThreshold+1)): GαEβ, GEαEβ,…… format
- 10^^^(10^^(repeatLetterThreshold+1)) ~ 10{4}(repeatLetterThreshold+1): GαGβ, GGαGβ,…… format
- 10{4}(repeatLetterThreshold+1) ~ 10{5}(repeatLetterThreshold+1): αHβ, HαEβ, HEαEβ, HαFβ, HFαFβ, HαGβ, HGαGβ, HαHβ, HHαHβ,…… format

…………

- 10{22}(repeatLetterThreshold+1) ~ 10{23}(repeatLetterThreshold+1): αZβ format; ZαEβ, ZEαEβ, ……, ZαZβ, ZZαZβ,…… format
- 10{23}(repeatLetterThreshold+1) ~ 10{10^sciThreshold}10(=10{ω}(10^sciThreshold)): αAaβ format
- 10{ω}(10^sciThreshold) ~ 10{ω+1}(multiLetterRepeatThreshold+1): AaαEβ, ……, AaαAaβ, AaAaαAaβ…… format
- 10{ω+1}(multiLetterRepeatThreshold+1) ~ 10{ω+1}(10^sciThreshold): αAbβ format
- 10{ω+1}(10^sciThreshold) ~ 10{ω+2}(multiLetterRepeatThreshold+1): AbαEβ, ……, AbαAbβ, AbAbαAbβ…… format
- 10{ω+2}(multiLetterRepeatThreshold+1) ~ 10{ω+2}(10^sciThreshold): αAcβ format

…………

- 10{ω+25}(multiLetterRepeatThreshold+1) ~ 10{ω+25}(10^sciThreshold): αAzβ format
- 10{ω+25}(10^sciThreshold) ~ 10{ω+26}(multiLetterRepeatThreshold+1): AzαEβ to AzαAzβ, AzAzαAzβ…… format
- 10{ω+26}(multiLetterRepeatThreshold+1) ~ 10{ω+10^sciThreshold}10(=10{ω×2}(10^sciThreshold)): αBaβ format
- 10{ω×2}(10^sciThreshold) ~ 10{ω×2}(multiLetterRepeatThreshold+1): BaαEβ to BaαBaβ, BaBaαBaβ…… format

…………

- 10{ω×2+26}(multiLetterRepeatThreshold+1) ~ 10{ω×2+10^sciThreshold}10(=10{ω×3}(10^sciThreshold)): αCaβ format
- 10{ω×3}(10^sciThreshold) ~ 10{ω×3}(multiLetterRepeatThreshold+1): CaαEβ to CaαCaβ, CaCaαCaβ…… format

…………

- 10{ω×26+25}(multiLetterRepeatThreshold+1) ~ 10{ω×26+25}(10^sciThreshold): αZzβ format
- 10{ω×26+25}(10^sciThreshold) ~ 10{ω×26+26}(multiLetterRepeatThreshold+1): ZzαEβ to ZzαZzβ, ZzZzαZzβ…… format
- 10{ω×26+26}(multiLetterRepeatThreshold+1) ~ 10{ω×(10^sciThreshold)}10(=10{ω^2}(10^sciThreshold)): αAaaβ format
- 10{ω^2}(10^sciThreshold) ~ 10{ω^2}(multiLetterRepeatThreshold+1): AaaαEβ to AaaαAaaβ, AaaAaaαAaaβ…… format

…………

- 10{……+ω^3×26+ω^2×26+ω×26+26}10 ~ 10{ω^ω}(10^sciThreshold): !αAaβ format
- 10{ω^ω}(10^sciThreshold) ~ 10{ω^(……ω^3×26+ω^2×26+ω×26+26)}10: !AaαEβ, !αAbβ, !αAaaβ…… format
- 10{ω^(……+ω^3×26+ω^2×26+ω×26+26)}10 ~ 10{ω^ω^ω}(10^sciThreshold): @αAaβ format
- 10{ω^ω^ω}(10^sciThreshold) ~ 10{ω^ω^(……ω^3×26+ω^2×26+ω×26+26)}10: @AaαEβ, @αAbβ, @αAaaβ…… format
- 10{ω^ω^(……+ω^3×26+ω^2×26+ω×26+26)}10 ~ 10{ω^ω^ω^ω}(10^sciThreshold): #αAaβ format
- 10{ω^ω^ω^ω}(10^sciThreshold) ~ 10{ω^ω^ω^(……ω^3×26+ω^2×26+ω×26+26)}10: #AaαEβ, #αAbβ, #αAaaβ…… format

…………

- 10{ω^ω^……^ω}10 ~ 10{ω^ω^…(10^sciThreshold  ω^'s)…^ω}10: αεβformat
- 10{ω^ω^…(10^sciThreshold ω^'s)…^ω}10 ~ limit of metanum.js: εαEβformat

### format-metanum rules (v2.0)

- **Γ-canonical α/β (bisect law)**: the true α and β of a value v at letter Γ
  are recovered by bisecting 10{L}x = v on the engine's own smooth arrow curve
  (Γ = E,F,G,... single letters, L = level). α = 10^frac(x), β = floor(x):
  `format(arrow(3,4.1,3))` → `G1.161G897`,
  `format(arrow(3,4.3,3))` → `1.285H8`,
  `format(hardy(4166))` → `2.397G5`.
- **+count collapse**: n operations of level L applied to a Γ^{L+1}-structured
  value collapse to ONE Γ^{L+1} with arg + n (F⁴(G(1.3796)) = G(5.3796)),
  which is why single-letter chains like `G1.161G897` appear.
- **α appears at most once**, attached to the innermost value:
  `format(GE12)` → `G1.000E12`; hardy(1120) → `F4.398E13`. Once the innermost β reaches
  10^sciThreshold the letter goes bare and β carries its own sci form.
- **At most 2 finite letter types** may appear in a display's hyper-op chain
  (VαEβ → VαFβ → … → VαVβ, never another like VFαEβ)
  (AaαEβ → AaαFβ → … → AaαZβ → AaαAaβ, never another like AaFαEβ)
  A cascade that would spell more than two letter types spells only its top two levels
  and compresses the rest into the second letter's binary form.
  "bottom Γ repeation": 3{9}3 → `L2.376K2`, 3{10}3 → `M2.376L2`,
  4{9}4 → `LLK3.550K3`, 5{9}5 → `LLLKK4.669K4`; repeatLetterThreshold+1 top
  repeats carry to the next letter instead (6{9}6 → `5.760M5`), and levels
  22→21, 23→22 stay two-letter (`Y2.376X2`, `Z2.376Y2`), level ≥ 23 cascades
  display as the αΓβ polarize diagonal. Diagonal letter combinations
  (multi-letter tokens whose last lowercase letter is `a`: Aa, Ba, Ca, Aaa,
  Aaaa, …) use the **pure dlsdl α=2·5^f ∈[2,10) convention**; the other
  letters (Ab, Bb, …) keep the ordinary α∈[1,10) convention. The polarize
  triple t = log₁₀(bottom)+repeation maps as: t∈[2,10) smooth → α=t,
  β=arrows; discrete integer arguments (10{L}b with 2≤b≤100) all sit at the
  α=2 anchor of the next β; a structured argument climbs the geometric
  smooth-log steps f→1+log10(f) to its diagonal mantissa. Examples:
  3{24}3 → `2.376Aa23`, 3{100}3 → `2.376Aa99`,
  10{100}10 … 10{100}100 → `2.000Aa100`, 10{23}10 → `2.000Aa23`,
  10{100}(10{93}10) → `2.002Aa100`, 10{10000}10 → `2.000Aa10,000`;
  nested ordinals prefix the ω-row letter:
  3{3{100}3}3 → `Aa2.376Aa99`, 3{10{10000}10}3 → `Aa2.000Aa10,000`.
  Symbol de-layering follows the same convention: !Aa3 = 10{ω³}10 →
  `2.000Aaaa10` (layer 0), @Aa3 = 10{ω^(ω³)}10 → `!2.000Aaaa10`.
- **multiLetterLimit symbol carry**: a multi-letter combination of k letters
  sits at level ω^(k-1).  Once it would be longer than multiLetterLimit the
  notation switches to the next one instead of growing another letter: the
  symbol form !αAaβ, whose β is exactly that ω-exponent and whose α digits are
  the CNF coefficients per the !-form definition
  (!1.2345Aa4 = 10{ω^4+ω^3*2+ω^2*3+ω*4+5}10).  With limit 4 the successor of
  Zzzz is `!…Aa4` — never Aaaaa — and a 10-letter level displays as a short
  `!2.222Aa9`: `format(iter(3,5))` → `!2.222Aa4`,
  `format(iter(3,10))` → `!2.222Aa9`.
  **Every symbol-prefixed format carries too** — the symbols stack
  (no-symbol → ! → @ → # …), so a layer-1 value whose diagonal letter would
  exceed the limit reads as one more symbol with the Aa argument taking the
  exponent: `format(apix(3,10))` → `@2.000Aa10`
  (= 10{ω^(ω^10)}10), `format(apix(3,5))` → `@2.000Aa5`; past the symbol
  table the ε form takes over (`format(epsilonate(3,15))` → `1.000Ak10ε14`).
  Diagonal combinations in symbol forms keep the pure dlsdl α = 2·5^f ∈ [2,10)
  mantissa (integer exponents anchor 2.000).
- **Cascade compression**: the ordinal rows are a COMPOSITION, so the top row
  leads the display and the row below it (which collapses from its repeat count)
  keeps the single α and β — a 20-row cascade keeps its top two levels:
  `format(h10000(3,10))` → `Iccc1.000Iccb10`.
- **Stacking the same function nests the letter** (issue #14): `n{α}(n{α}y)` is
  one more application of the same level on top of the inner value, so the
  letter appears twice. `poea(10,poea(10,100))` = Ad(Ad(99)) → `Ad1.000Ad99`
  (before: the rows were folded into one letter, `1.000Ad114`), and the same
  holds for ω+1, ω+2, ω*2+1, ω*2+2, ω²+1, ω²+2, ω³+1 —
  `Ab2.398Ab99`, `Ac1.000Ac99`, `Bb1.000Bb99`, `Bc1.000Bc99`,
  `Abb1.000Abb99`, `Aac1.000Aac99`, `Aaab1.000Aaab99`; with an operand above
  MSI, `apea(apea(1e16))` → `BaBa1.000E16`.
- **A coefficient above 25 has no letter in the grid** (the letters hold
  ω·d+v with 0 ≤ v ≤ 25), so a ω*2 fundamental-sequence row (ω+81, ω+99, …)
  clamps down to the largest letter below it instead of wrapping into a higher,
  wrong letter: `format(apea(10,100))` → `1.000Ba154` (the ω*2 level), not the
  wrapped ω*4+3 letter.
  Formats are identical at maxRows=maxCols=10/20/50/100.

### Precision budget (maxRows / maxCols)

Every hyperoperation is stored EXACTLY while it fits the array budget and
approximately once it does not:

- exact capacity = maxRows+maxCols−2 finite hyperoperation levels:
  `arrow(x,L,z)` holds `r0 = [a0, a1, …, a(maxCols-1)]` (levels 0…maxCols−1)
  plus the ordinal rows `[a(level+1), level]` for levels
  maxCols … maxRows+maxCols−2 (maxRows−1 rows), so
  `arrow(10,39,10)` is exact at maxRows=maxCols=20 (r0 of 20 entries, 19 rows,
  top level 38) and `arrow(10,40,10)` is the first truncated value.
- beyond the budget the expansion follows the truncation rule: keep the
  LARGEST maxRows−1 ordinal rows in array[1]…array[maxRows−1] sorted ascending,
  increment array[1][0] by 1 (the dropped lower chain collapses into one extra
  operation there) and default array[0] to [10].  This applies to arrow, BEAF
  and the rule-1…4 ordinal cascades alike
  (`iter(3,5)` → `[[10],[2,2,2,0,2,2],…,[1,2,2,2,2,2]]`).
- layer ≥ 1 results are stored in STANDARD form: an ordinal row [count, k]
  whose level is the finite k merges into r0 (r0[k] += count) and the layer
  drops as far as it can, since a layer-L bracket β that is a finite
  ω-polynomial equals the layer-(L−1) value with the single row [1|β]:
  `cube(10,3)` `[[10],[1,3],[1,0,1]]` → `[[10,0,0,1],[1,0,1]]`;
  layer2 `[[5],[3,1]]` → `[[5,3]]` → layer1 `[[10],[1,5,3]]` = 10{ω^(ω*3+5)}10;
  layer3 `[[3]]` → layer2 `[[0,0,0,1]]` → layer1 `[[10],[1,0,0,0,1]]`
  = 10{ω^ω^3}10.

# Changelog

- 2026-9-15 v2.0: Add hyper-root & hyper-log, hardy function, fractional hyperoperation inputs, fix BEAF operation level and format
- 2026-8-18 v1.4 Support hyper operation >MSI and fix format-metanum bugs
- 2026-7-31 v1.3 Add format-metanum.js, fix basic operations, hyper operations and BEAF bugs
- 2026-7-9 v1.2 Add more hyper operations up to ε₀, add BEAF operation and fix bugs
- 2026-6-3 v1.1 Add support for very small numbers ,add more hyper operations and fix bugs
- 2026-5-23 v1.0 Rewritten and add even more hyper operations
- 2026-2-24 v0.4 Add hyper operations and extend fromString
- 2026-2-11 v0.3 Reconstruct code and correct calculating functions
- 2026-2-6 v0.2 New Metanum data structure with Cantor normal form
- 2026-2-1 v0.1 First commit

