//Author: dlsdl v2.0
//v2.0: Add hyper-root & hyper-log, hardy function, fractional hyperoperation inputs, fix BEAF operation level and format
//Code snippets and templates from OmegaNum.js

;(function (globalScope) {
  "use strict";

  var MetaNum = {
    maxRows: 20,
    maxCols: 20,
    serializeMode: 0,
    debug: 0
  },

  external = true,

  metaNumError = "[MetaNumError] ",
  invalidArgument = metaNumError + "Invalid argument: ",

  MAX_SAFE_INTEGER = 9007199254740991,
  MAX_E = Math.log10(MAX_SAFE_INTEGER),

  P = {},
  Q = {},
  R = {};

  R.ZERO = 0;
  R.ONE = 1;
  R.NEGATIVE_ONE = -1;
  R.TWO = 2;
  R.TEN = 10;
  R.E = Math.E;
  R.LN2 = Math.LN2;
  R.LN10 = Math.LN10;
  R.LOG2E = Math.LOG2E;
  R.LOG10E = Math.LOG10E;
  R.PI = Math.PI;
  R.SQRT1_2 = Math.SQRT1_2;
  R.SQRT2 = Math.SQRT2;
  R.MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
  R.MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER;
  R.NaN = NaN;
  R.POSITIVE_INFINITY = Infinity;
  R.NEGATIVE_INFINITY = -Infinity;
  R.infinity = Infinity;              // alias of POSITIVE_INFINITY
  R.E_MAX_SAFE_INTEGER = "E" + MAX_SAFE_INTEGER;
  R.EE_MAX_SAFE_INTEGER = "EE" + MAX_SAFE_INTEGER;
  R.TETRATED_MAX_SAFE_INTEGER = "F" + MAX_SAFE_INTEGER;
  R.PENTATED_MAX_SAFE_INTEGER = "G" + MAX_SAFE_INTEGER;
  R.TRITRI = "[[3638334640023.7783, 7625597484984]]";
  R.GRAHAMS_NUMBER = "[[3638334640023.7783,7625597484984,0,1],[63,0,1]]";
  R.TERR3 = "[[10],[1,374389,2],[1,374387,2],[1,374385,2],[1,374383,2],[1,374381,2],[1,374379,2],[1,374377,2],[1,374375,2],[1,374373,2],[1,374371,2]]";
  R.QqQe308 = "QqQe308";

  function cmpArr(a, b) {
    var al = a.length;
    while (al > 0 && a[al - 1] === 0) al--;
    var bl = b.length;
    while (bl > 0 && b[bl - 1] === 0) bl--;
    if (al !== bl) return al > bl ? 1 : -1;
    for (var i = al - 1; i >= 0; i--) {
      if (a[i] > b[i]) return 1;
      if (a[i] < b[i]) return -1;
    }
    return 0;
  }

  function isZeroArr(arr) {
    if (!arr || arr.length === 0) return true;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] !== 0) return false;
    }
    return true;
  }

  function deepCloneArray(arr) {
    var result = [];
    for (var i = 0; i < arr.length; i++) {
      result[i] = arr[i].slice(0);
    }
    return result;
  }

  var debugMessageSent = false;

  var f_gamma = function (n) {
    if (!isFinite(n)) return n;
    if (n < -50) {
      if (n == Math.trunc(n)) return Number.NEGATIVE_INFINITY;
      return 0;
    }
    var scal1 = 1;
    while (n < 10) {
      scal1 = scal1 * n;
      ++n;
    }
    n -= 1;
    var l = 0.9189385332046727;
    l += (n + 0.5) * Math.log(n);
    l -= n;
    var n2 = n * n;
    var np = n;
    l += 1 / (12 * np);
    np *= n2;
    l -= 1 / (360 * np);
    np *= n2;
    l += 1 / (1260 * np);
    np *= n2;
    l -= 1 / (1680 * np);
    np *= n2;
    l += 1 / (1188 * np);
    np *= n2;
    l -= 691 / (360360 * np);
    np *= n2;
    l += 7 / (1092 * np);
    np *= n2;
    l -= 3617 / (122400 * np);
    return Math.exp(l) / scal1;
  };

  var f_logGamma = function (n) {
    if (!isFinite(n) || n <= 0) return NaN;
    var scalLog = 0;
    while (n < 10) {
      scalLog += Math.log(n);
      ++n;
    }
    n -= 1;
    var l = 0.9189385332046727;
    l += (n + 0.5) * Math.log(n);
    l -= n;
    var n2 = n * n;
    var np = n;
    l += 1 / (12 * np);
    np *= n2;
    l -= 1 / (360 * np);
    np *= n2;
    l += 1 / (1260 * np);
    np *= n2;
    l -= 1 / (1680 * np);
    np *= n2;
    l += 1 / (1188 * np);
    np *= n2;
    l -= 691 / (360360 * np);
    np *= n2;
    l += 7 / (1092 * np);
    np *= n2;
    l -= 3617 / (122400 * np);
    return (l - scalLog) / Math.LN10;
  };

  var OMEGA = 0.56714329040978387299997;

  var f_lambertw = function (z, tol, principal) {
    if (tol === undefined) tol = 1e-10;
    if (principal === undefined) principal = true;
    var w;
    if (!Number.isFinite(z)) return z;
    if (principal) {
      if (z === 0) return z;
      if (z === 1) return OMEGA;
      if (z < 10) w = 0;
      else w = Math.log(z) - Math.log(Math.log(z));
    } else {
      if (z === 0) return -Infinity;
      if (z <= -0.1) w = -2;
      else w = Math.log(-z) - Math.log(-Math.log(-z));
    }
    for (var i = 0; i < 100; ++i) {
      var wn = (z * Math.exp(-w) + w * w) / (w + 1);
      if (Math.abs(wn - w) < tol * Math.abs(wn)) return wn;
      w = wn;
    }
    throw Error("Iteration failed to converge: " + z);
  };

  var d_lambertw = function (z, tol, principal) {
    if (tol === undefined) tol = 1e-10;
    if (principal === undefined) principal = true;
    z = new MetaNum(z);
    var w;
    if (!z.isFinite()) return z;
    if (principal) {
      if (z.eq(MetaNum.ZERO)) return z;
      if (z.eq(MetaNum.ONE)) return new MetaNum(OMEGA);
      w = MetaNum.ln(z);
    } else {
      if (z.eq(MetaNum.ZERO)) return MetaNum.NEGATIVE_INFINITY.clone();
      w = MetaNum.ln(z.neg());
    }
    for (var i = 0; i < 100; ++i) {
      var ew = w.neg().exp();
      var wewz = w.sub(z.mul(ew));
      var dd = w.add(MetaNum.ONE).sub(w.add(2).mul(wewz).div(MetaNum.mul(2, w).add(2)));
      if (dd.eq(MetaNum.ZERO)) return w;
      var wn = w.sub(wewz.div(dd));
      if (MetaNum.abs(wn.sub(w)).lt(MetaNum.abs(wn).mul(tol))) return wn;
      w = wn;
    }
    throw Error("Iteration failed to converge: " + z);
  };

  var decimalPlaces = function (value, places) {
    var len = places + 1;
    var numDigits = Math.ceil(Math.log10(Math.abs(value)));
    if (numDigits < 100) numDigits = 0;
    var rounded = Math.round(value * Math.pow(10, len - numDigits)) * Math.pow(10, numDigits - len);
    return parseFloat(rounded.toFixed(Math.max(len - numDigits, 0)));
  };

  var log10PosBigInt = function (input) {
    var exp = BigInt(64);
    while (input >= BigInt(1) << exp) exp *= BigInt(2);
    var expdel = exp / BigInt(2);
    while (expdel > BigInt(0)) {
      if (input >= BigInt(1) << exp) exp += expdel;
      else exp -= expdel;
      expdel /= BigInt(2);
    }
    var cutbits = exp - BigInt(54);
    var firstbits = input >> cutbits;
    return Math.log10(Number(firstbits)) + Math.LOG10E / Math.LOG2E * Number(cutbits);
  };

  var LONG_STRING_MIN_LENGTH = 17;

  var log10LongString = function (str) {
    return Math.log10(Number(str.substring(0, LONG_STRING_MIN_LENGTH))) + (str.length - LONG_STRING_MIN_LENGTH);
  };

  P.normalize = function () {
    var b;
    var x = this;

    if (!x.array || !Array.isArray(x.array) || x.array.length === 0) {
      x.array = [[0]];
    }
    if (x.sign !== 1 && x.sign !== -1 && x.sign !== 2 && x.sign !== -2) {
      // For invalid signs, try to interpret: negative → -1, positive → 1
      var s = Number(x.sign);
      if (isNaN(s)) s = 1;
      x.sign = s < 0 ? -1 : 1;
    }
    if (typeof x.layer !== 'number' || !isFinite(x.layer) || x.layer < 0) {
      x.layer = 0;
    }
    x.layer = Math.floor(x.layer);

    for (var i = 0; i < x.array.length; i++) {
      if (!Array.isArray(x.array[i])) {
        x.array[i] = [x.array[i]];
      }
    }

    if (x.array[0] && x.array[0].length > 0) {
      if (isNaN(x.array[0][0])) {
        x.array = [[NaN]];
        x.sign = 1;
        x.layer = 0;
        return x;
      }
      if (!isFinite(x.array[0][0])) {
        x.array = [[x.array[0][0] === Infinity ? Infinity : -Infinity]];
        x.sign = 1;
        x.layer = 0;
        return x;
      }
    }

    var r0 = x.array[0];
    for (var i = 0; i < r0.length; i++) {
      if (r0[i] === null || r0[i] === undefined) {
        r0[i] = 0;
        continue;
      }
      if (i !== 0 && !Number.isInteger(r0[i])) r0[i] = Math.floor(r0[i]);
    }

    var small = isSmall(x);

    // Convert very small values to reciprocal representation (sign=2/-2)
    // When r0 = [base, 1] and base < -308, value = 10^base < 10^-308 (underflows)
    // Store as reciprocal: r0 = [-base, 1] with sign=2
    if (!small && x.layer === 0) {
      // Check for E-level only (r0[1] >= 1, no higher levels)
      var hasHigherLevel = false;
      for (var hl = 2; hl < r0.length; hl++) {
        if (r0[hl] > 0) { hasHigherLevel = true; break; }
      }
      if (!hasHigherLevel && r0.length >= 2 && r0[1] === 1 && r0[0] < -308 && isFinite(r0[0])) {
        // E notation with very negative exponent: 10^(negative) → reciprocal of 10^(positive)
        r0[0] = -r0[0];
        x.sign = (x.sign === -1) ? -2 : 2;
        small = true;
      } else if (r0.length === 1 && r0[0] > 0 && r0[0] < 1e-308) {
        // Very tiny number: convert to reciprocal via log10
        var logRecip = -Math.log10(r0[0]);
        if (isFinite(logRecip) && logRecip > 0) {
          r0[0] = logRecip;
          r0[1] = 1;
          x.sign = (x.sign === -1) ? -2 : 2;
          small = true;
        }
      }
    }

    do {
      b = false;

      while (r0.length > 1 && r0[r0.length - 1] === 0) {
        r0.pop();
        b = true;
      }

      // Normalize r0[0] only for non-small values
      if (!small && x.layer === 0 && r0[0] > MAX_SAFE_INTEGER) {
        r0[1] = (r0[1] || 0) + 1;
        r0[0] = Math.log10(r0[0]);
        b = true;
      }

      while (!small && x.layer === 0 && r0.length > 1 && r0[0] < MAX_E && r0[1]) {
        r0[0] = Math.pow(10, r0[0]);
        r0[1]--;
        b = true;
      }

      // Intermediate zero compression: [base, 0, ..., n] → [1, base, ..., n-1]
      // This ensures F^n(base) = F^{n-1}(E^{base}(1)) for canonical representation
      // e.g., [10, 0, 2] → [1, 10, 1], then expands to [10^10, 8, 1]
      //       [10, 9, 1] → [10^10, 8, 1] (via E-expansion), same result
      if (!small && x.layer === 0 && r0.length > 2 && !r0[1]) {
        for (var i = 2; !r0[i]; ++i) continue;
        r0[i - 1] = r0[0];
        r0[0] = 1;
        r0[i]--;
        b = true;
      }

      for (var i = 1; i < r0.length; i++) {
        if (!small && r0[i] > MAX_SAFE_INTEGER) {
          r0[i + 1] = (r0[i + 1] || 0) + 1;
          r0[0] = r0[i] + 1;
          for (var j = 1; j <= i; j++) r0[j] = 0;
          b = true;
        }
      }

      while (x.array.length > 1 && isZeroArr(x.array[x.array.length - 1])) {
        x.array.pop();
        b = true;
      }

      if (x.array.length > MetaNum.maxRows) {
        // Truncation keeps the base row and the largest maxRows-1 ordinal rows;
        // only the smallest ordinal rows are sacrificed.  The transient
        // _ordTrunc flag lets the hyperoperation entry points detect the
        // overflow and apply the issues.md truncation marker (array[1][0]+1,
        // array[0] = [10]) — clone() does not copy it.
        x._ordTrunc = true;
        x.array = [x.array[0]].concat(x.array.slice(x.array.length - (MetaNum.maxRows - 1)));
        b = true;
      }

      // r0 wider than maxCols: convert the overflow levels (>= maxCols) into
      // finite-level ordinal rows [count, level] instead of dropping them.
      // Deferred until the r0 cascade has settled so that high-level counts
      // can still decompose into lower levels (e.g. "Z10" must fully expand
      // into its level chain before levels >= maxCols freeze into rows).
      if (r0.length > MetaNum.maxCols && !b) {
        var r0Settled = !(r0[0] > MAX_SAFE_INTEGER)
          && !(r0[1] && r0[0] < MAX_E)
          && !(!r0[1] && r0.length > 2);
        if (r0Settled) {
          var pushedOverflow = false;
          for (var ov = MetaNum.maxCols; ov < r0.length; ov++) {
            if (r0[ov] > 0) {
              x.array.push([r0[ov], ov]);
              r0[ov] = 0;
              pushedOverflow = true;
            }
          }
          if (pushedOverflow) b = true;
        }
      }

      for (var i = 0; i < x.array.length; i++) {
        if (i > 0 && x.array[i].length > MetaNum.maxCols) {
          x.array[i] = x.array[i].slice(0, MetaNum.maxCols);
          b = true;
        }
      }

      if (x.array.length === 0) {
        x.array = [[0]];
        b = true;
      }

      for (var i = 0; i < x.array.length; i++) {
        for (var j = 0; j < x.array[i].length; j++) {
          if (x.array[i][j] === null || x.array[i][j] === undefined) {
            x.array[i][j] = 0;
            b = true;
          }
          if ((i > 0 || j > 0) && (!isFinite(x.array[i][j]) || isNaN(x.array[i][j]))) {
            x.array[i][j] = 0;
            b = true;
          }
        }
      }

      for (var i = 1; i < x.array.length; i++) {
        var row = x.array[i];
        while (row.length > 0 && row[row.length - 1] === 0) {
          row.pop();
          b = true;
        }
      }

      if (x.array.length > 2) {
        var rows2plus = x.array.slice(1);
        rows2plus.sort(function (a, b) { return cmpArr(a, b); });
        var orderChanged = false;
        for (var i = 0; i < rows2plus.length; i++) {
          if (cmpArr(rows2plus[i], x.array[i + 1]) !== 0) {
            orderChanged = true;
            break;
          }
        }
        if (orderChanged) {
          for (var i = 0; i < rows2plus.length; i++) {
            x.array[i + 1] = rows2plus[i].slice(0);
          }
          b = true;
        }
      }

      for (var i = x.array.length - 1; i > 1; i--) {
        var rowA = x.array[i];
        var rowB = x.array[i - 1];
        if (rowA.length === rowB.length && rowA.length >= 2) {
          var same = true;
          for (var k = 1; k < rowA.length; k++) {
            if (rowA[k] !== rowB[k]) { same = false; break; }
          }
          if (same) {
            rowB[0] += rowA[0];
            x.array.splice(i, 1);
            b = true;
          }
        }
      }

    } while (b);

    if (!x.array.length || !x.array[0]) {
      x.array = [[0]];
      x.sign = isSmall(x) ? 2 : 1;
    }

    // Normalize zero sign: 0 is always positive
    if (x.array.length === 1 && x.array[0].length === 1 && x.array[0][0] === 0 && (x.sign === -1 || x.sign === -2)) {
      x.sign = x.sign === -2 ? 2 : 1;
    }

    // Layer is managed explicitly by layerUp/layerDown, not computed from array.
    // Do not recompute layer here - preserve the value set by the caller/parser.

    return x;
  };

  var standardizeMessageSent = false;
  P.standardize = function () {
    if (!standardizeMessageSent) console.warn(metaNumError + "'standardize' method is being deprecated in favor of 'normalize' and will be removed in the future!"), standardizeMessageSent = true;
    return this.normalize();
  };

  P.absoluteValue = P.abs = function () {
    var x = this.clone();
    // sign=1→1, sign=-1→1, sign=2→2, sign=-2→2
    x.sign = x.sign === 2 || x.sign === -2 ? 2 : 1;
    return x;
  };
  Q.absoluteValue = Q.abs = function (x) {
    return new MetaNum(x).abs();
  };

  P.negate = P.neg = function () {
    var x = this.clone();
    // 1↔-1, 2↔-2
    x.sign = x.sign === 1 ? -1 : x.sign === -1 ? 1 : x.sign === 2 ? -2 : 2;
    return x.normalize();
  };
  Q.negate = Q.neg = function (x) {
    return new MetaNum(x).neg();
  };

  P.compareTo = P.cmp = function (other) {
    if (!(other instanceof MetaNum)) other = new MetaNum(other);

    if (this.array[0] && isNaN(this.array[0][0])) return NaN;
    if (other.array[0] && isNaN(other.array[0][0])) return NaN;

    var tInf = this.array[0] && this.array[0][0] === Infinity;
    var oInf = other.array[0] && other.array[0][0] === Infinity;

    if (tInf && !oInf) return this.sign;
    if (!tInf && oInf) return -other.sign;
    if (tInf && oInf) {
      if (this.sign !== other.sign) return this.sign;
      return 0;
    }

    var tAllZero = (this.array.length === 1 && this.array[0].length === 1 && this.array[0][0] === 0);
    var oAllZero = (other.array.length === 1 && other.array[0].length === 1 && other.array[0][0] === 0);
    if (tAllZero && oAllZero) return 0;

    // Small value comparison (similar to PowiainaNum)
    var tSmall = isSmall(this);
    var oSmall = isSmall(other);
    var tNormSign = toNormalizedSign(this.sign);
    var oNormSign = toNormalizedSign(other.sign);

    if (tNormSign !== oNormSign) return tNormSign;

    // If one is small and the other is not
    // Special case: if the non-small value is zero, the small value's sign determines the result
    if (tSmall && !oSmall) {
      if (oAllZero) return tNormSign; // small positive > 0, small negative < 0
      return tNormSign === 1 ? -1 : 1;
    }
    if (oSmall && !tSmall) {
      if (tAllZero) return -oNormSign; // 0 < small positive, 0 > small negative
      return tNormSign === 1 ? 1 : -1;
    }

    var m = tNormSign;
    // If both are small, reverse comparison
    if (tSmall && oSmall) m = -m;

    if (this.layer !== other.layer) {
      return (this.layer > other.layer ? 1 : -1) * m;
    }

    var tRows = this.array.length;
    var oRows = other.array.length;
    while (tRows > 1 && isZeroArr(this.array[tRows - 1])) tRows--;
    while (oRows > 1 && isZeroArr(other.array[oRows - 1])) oRows--;

    // Compare ordinal rows (index >= 1) as Cantor normal form. Rows are kept
    // sorted by level ascending, so the leading (highest-level) term is last and
    // dominates: a single ω-level row (length >= 3, e.g. [1,0,1]) is larger than
    // any number of finite-level rows (length 2, e.g. [count, finiteLevel]),
    // because 10{ω}10 is infinite while 10{n}10 is finite. Deciding by row count
    // alone would wrongly rank 99 finite-level rows above 1 ω-level row, so we
    // descend from the top, cancelling equal leading rows, and decide at the
    // first row whose level/count differs (cmpArr encodes level then count).
    var i = tRows - 1;
    var j = oRows - 1;
    while (i >= 1 || j >= 1) {
      var aRow = (i >= 1) ? this.array[i] : null;
      var bRow = (j >= 1) ? other.array[j] : null;
      if (aRow === null) return -1 * m; // other has a higher-level term this lacks
      if (bRow === null) return 1 * m;
      var c = cmpArr(aRow, bRow);
      if (c !== 0) return c * m;
      i--;
      j--;
    }
    // All ordinal rows matched; compare the base row (index 0).
    return cmpArr(this.array[0], other.array[0]) * m;
  };
  Q.compare = Q.cmp = function (x, y) {
    return new MetaNum(x).cmp(y);
  };

  P.greaterThan = P.gt = function (other) {
    return this.cmp(other) > 0;
  };
  Q.greaterThan = Q.gt = function (x, y) {
    return new MetaNum(x).gt(y);
  };

  P.greaterThanOrEqualTo = P.gte = function (other) {
    return this.cmp(other) >= 0;
  };
  Q.greaterThanOrEqualTo = Q.gte = function (x, y) {
    return new MetaNum(x).gte(y);
  };

  P.lessThan = P.lt = function (other) {
    return this.cmp(other) < 0;
  };
  Q.lessThan = Q.lt = function (x, y) {
    return new MetaNum(x).lt(y);
  };

  P.lessThanOrEqualTo = P.lte = function (other) {
    return this.cmp(other) <= 0;
  };
  Q.lessThanOrEqualTo = Q.lte = function (x, y) {
    return new MetaNum(x).lte(y);
  };

  P.equalsTo = P.equal = P.eq = function (other) {
    return this.cmp(other) === 0;
  };
  Q.equalsTo = Q.equal = Q.eq = function (x, y) {
    return new MetaNum(x).eq(y);
  };

  P.notEqualsTo = P.notEqual = P.neq = function (other) {
    return this.cmp(other) !== 0;
  };
  Q.notEqualsTo = Q.notEqual = Q.neq = function (x, y) {
    return new MetaNum(x).neq(y);
  };

  P.minimum = P.min = function (other) {
    return this.lt(other) ? this.clone() : new MetaNum(other);
  };
  Q.minimum = Q.min = function (x, y) {
    return new MetaNum(x).min(y);
  };

  P.maximum = P.max = function (other) {
    return this.gt(other) ? this.clone() : new MetaNum(other);
  };
  Q.maximum = Q.max = function (x, y) {
    return new MetaNum(x).max(y);
  };

  P.compareTo_tolerance = P.cmp_tolerance = function (other, tolerance) {
    if (!(other instanceof MetaNum)) other = new MetaNum(other);
    return this.eq_tolerance(other, tolerance) ? 0 : this.cmp(other);
  };
  Q.compare_tolerance = Q.cmp_tolerance = function (x, y, tolerance) {
    return new MetaNum(x).cmp_tolerance(y, tolerance);
  };

  P.greaterThan_tolerance = P.gt_tolerance = function (other, tolerance) {
    if (!(other instanceof MetaNum)) other = new MetaNum(other);
    return !this.eq_tolerance(other, tolerance) && this.gt(other);
  };
  Q.greaterThan_tolerance = Q.gt_tolerance = function (x, y, tolerance) {
    return new MetaNum(x).gt_tolerance(y, tolerance);
  };

  P.greaterThanOrEqualTo_tolerance = P.gte_tolerance = function (other, tolerance) {
    if (!(other instanceof MetaNum)) other = new MetaNum(other);
    return this.eq_tolerance(other, tolerance) || this.gt(other);
  };
  Q.greaterThanOrEqualTo_tolerance = Q.gte_tolerance = function (x, y, tolerance) {
    return new MetaNum(x).gte_tolerance(y, tolerance);
  };

  P.lessThan_tolerance = P.lt_tolerance = function (other, tolerance) {
    if (!(other instanceof MetaNum)) other = new MetaNum(other);
    return !this.eq_tolerance(other, tolerance) && this.lt(other);
  };
  Q.lessThan_tolerance = Q.lt_tolerance = function (x, y, tolerance) {
    return new MetaNum(x).lt_tolerance(y, tolerance);
  };

  P.lessThanOrEqualTo_tolerance = P.lte_tolerance = function (other, tolerance) {
    if (!(other instanceof MetaNum)) other = new MetaNum(other);
    return this.eq_tolerance(other, tolerance) || this.lt(other);
  };
  Q.lessThanOrEqualTo_tolerance = Q.lte_tolerance = function (x, y, tolerance) {
    return new MetaNum(x).lte_tolerance(y, tolerance);
  };

  P.equalsTo_tolerance = P.equal_tolerance = P.eq_tolerance = function (other, tolerance) {
    if (!(other instanceof MetaNum)) other = new MetaNum(other);
    if (tolerance == null) tolerance = 1e-7;
    if (this.isNaN() || other.isNaN() || this.isFinite() != other.isFinite()) return false;
    if (toNormalizedSign(this.sign) !== toNormalizedSign(other.sign)) return false;
    if (this.layer !== other.layer) return false;
    var a, b, tR = this.array.length, oR = other.array.length;
    if (tR <= 1 && oR <= 1) {
      a = this.array[0] ? this.array[0][0] || 0 : 0;
      b = other.array[0] ? other.array[0][0] || 0 : 0;
      return Math.abs(a - b) <= tolerance * Math.max(Math.abs(a), Math.abs(b));
    }
    if (Math.abs(tR - oR) > 1) return false;
    for (var i = Math.max(tR, oR) - 1; i >= 0; i--) {
      var tRow = this.array[i] || [0];
      var oRow = other.array[i] || [0];
      if (cmpArr(tRow, oRow) !== 0) return false;
    }
    return true;
  };
  Q.equalsTo_tolerance = Q.equal_tolerance = Q.eq_tolerance = function (x, y, tolerance) {
    return new MetaNum(x).eq_tolerance(y, tolerance);
  };

  P.notEqualsTo_tolerance = P.notEqual_tolerance = P.neq_tolerance = function (other, tolerance) {
    return !this.eq_tolerance(other, tolerance);
  };
  Q.notEqualsTo_tolerance = Q.notEqual_tolerance = Q.neq_tolerance = function (x, y, tolerance) {
    return new MetaNum(x).neq_tolerance(y, tolerance);
  };

  P.isPositive = P.ispos = function () {
    return this.gt(MetaNum.ZERO);
  };
  Q.isPositive = Q.ispos = function (x) {
    return new MetaNum(x).ispos();
  };

  P.isNegative = P.isneg = function () {
    return this.lt(MetaNum.ZERO);
  };
  Q.isNegative = Q.isneg = function (x) {
    return new MetaNum(x).isneg();
  };

  P.isNaN = function () {
    return this.array[0] && isNaN(this.array[0][0]);
  };
  Q.isNaN = function (x) {
    return new MetaNum(x).isNaN();
  };

  P.isFinite = function () {
    if (!this.array[0]) return true;
    return isFinite(this.array[0][0]);
  };
  Q.isFinite = function (x) {
    return new MetaNum(x).isFinite();
  };

  P.isInfinite = function () {
    return this.array[0] && this.array[0][0] === Infinity;
  };
  Q.isInfinite = function (x) {
    return new MetaNum(x).isInfinite();
  };

  P.layerUp = function () {
    var x = this.clone();
    if (x.isNaN()) return x;

    var actualRows = x.array.length;
    while (actualRows > 1 && isZeroArr(x.array[actualRows - 1])) actualRows--;

    if (actualRows <= 1) return x;

    var maxRow = x.array[actualRows - 1];
    x.array[0] = maxRow.slice(0);
    x.array = [x.array[0]];
    var savedLayer = x.layer + 1;
    x.layer = savedLayer;
    x.normalize();
    x.layer = savedLayer;
    return x;
  };
  Q.layerUp = function (x) {
    return new MetaNum(x).layerUp();
  };

  P.layerDown = function () {
    var x = this.clone();
    if (x.isNaN() || x.layer <= 0) return x;

    var hasRowsAfter = false;
    for (var i = 1; i < x.array.length; i++) {
      if (!isZeroArr(x.array[i])) {
        hasRowsAfter = true;
        break;
      }
    }

    if (hasRowsAfter) return x;

    if (x.array.length < 2) x.array.push([0]);
    x.array[1] = x.array[0].slice(0);
    x.array[0] = [0];
    var savedLayer = x.layer - 1;
    x.layer = savedLayer;
    x.normalize();
    x.layer = savedLayer;
    return x;
  };
  Q.layerDown = function (x) {
    return new MetaNum(x).layerDown();
  };

  function isSimple(x) {
    return x.layer === 0 && x.array.length === 1 &&
           x.array[0].length === 1 && isFinite(x.array[0][0]) &&
           Math.abs(x.array[0][0]) <= MAX_SAFE_INTEGER;
  }

  function isSmall(x) {
    return x.sign === 2 || x.sign === -2;
  }

  function isNumeric(x) {
    return x.layer === 0 && x.array.length === 1 &&
           x.array[0].length === 1 && isFinite(x.array[0][0]);
  }

  function toNormalizedSign(s) {
    // Map sign=2/-2 to the corresponding normal sign for the array data
    return s === 2 ? 1 : s === -2 ? -1 : s;
  }

  function hyperLevel(n, val) {
    var arr = new Array(n + 1);
    for (var i = 0; i <= n; i++) arr[i] = 0;
    arr[0] = val;
    arr[n] = 1;
    return new MetaNum([arr]);
  }

  // Threshold values 10{n}val depend only on (n, val) and are only ever used
  // in read-only comparisons — cache them: rebuilding an r0 of length n+1 on
  // every arrow call cost ~1.8ms each (several per call, ~70% of the
  // structured fast path).
  var hyperLevelSafeCache = {};
  function hyperLevelSafe(n, val) {
    var key = n + "|" + val;
    var cached = hyperLevelSafeCache[key];
    if (cached) return cached;
    var arr = new Array(n + 1);
    for (var i = 0; i <= n; i++) arr[i] = 0;
    arr[0] = val;
    arr[n] = 1;
    var oldMaxCols = MetaNum.maxCols;
    MetaNum.maxCols = Math.max(oldMaxCols, n + 1);
    var r = new MetaNum([arr]);
    MetaNum.maxCols = oldMaxCols;
    if (n >= 0 && n <= 100000) hyperLevelSafeCache[key] = r;
    return r;
  }

  function addOrdinalRow(metaNum, count, rawLevel) {
    // Add an ordinal row [count, raw_level] to the MetaNum
    // If there's already an ordinal row with the same level, merge counts
    var x = metaNum.clone();
    if (typeof rawLevel !== 'number' || !isFinite(rawLevel) || rawLevel < 0) {
      return x;
    }
    if (count <= 0) return x;
    // Try to merge with existing row at the same level
    for (var i = 1; i < x.array.length; i++) {
      var row = x.array[i];
      if (row.length === 2 && row[1] === rawLevel) {
        row[0] += count;
        return x;
      }
    }
    if (x.array.length < MetaNum.maxRows) {
      x.array.push([count, rawLevel]);
    }
    return x;
  }

  // Like toNumber(), but returns the actual finite JS value for E-notation
  // numbers (e.g. 10^16 stored as [[16,1]]) instead of Infinity. This is used
  // by hyperoperation functions (expande/multiexpande/powerexpande) to compute
  // iteration counts `count = y - 2` when y is a large-but-finite MetaNum.
  // toNumber() returns Infinity whenever r0.length > 1 (E-notation) or the
  // array has ordinal rows, which is too conservative for count extraction:
  // 10^16 is a perfectly finite JS number. We only return Infinity for genuine
  // ordinals (layer>0 or array.length>1) or values too large for any JS number
  // (tetration+ or 10^(>=309)); the caller falls back to the ordinal branch.
  function metaFiniteCount(y) {
    if (y.isNaN()) return NaN;
    if (y.layer > 0) return Infinity;            // ω^ω^... tower
    if (y.array.length > 1) return Infinity;     // has ordinal rows
    var r0 = y.array[0];
    if (r0.length === 1) return r0[0];           // plain finite number
    if (r0.length === 2 && r0[1] === 1) {
      // E-notation: value = 10^r0[0], finite JS number when r0[0] <= 308
      var v = Math.pow(10, r0[0]);
      return isFinite(v) ? v : Number.MAX_VALUE; // 10^(>=309): cap at MAX_VALUE
    }
    // r0[1] >= 2 (tetration+) or r0.length >= 3: too large, cap at MAX_VALUE
    return Number.MAX_VALUE;
  }

  P.plus = P.add = function (other) {
    var x = this.clone();
    other = new MetaNum(other);

    if (x.sign === -1) return x.neg().add(other.neg()).neg();
    if (x.sign === -2) return x.neg().add(other.neg()).neg();
    if (other.sign === -1) return x.sub(other.neg());
    if (other.sign === -2) return x.sub(other.neg());
    if (x.eq(MetaNum.ZERO)) return other;
    if (other.eq(MetaNum.ZERO)) return x;
    if (x.isNaN() || other.isNaN()) return MetaNum.NaN.clone();
    if (x.isInfinite() && other.isInfinite() && x.eq(other.neg())) return MetaNum.NaN.clone();
    if (x.isInfinite()) return x;
    if (other.isInfinite()) return other;

    // Layer swallowing: an ω-tower plus a layer-0 value is the tower; two
    // towers keep the larger one (ordinal addition, same layer).
    var domAdd = layerDominant(x, other);
    if (domAdd !== null) return domAdd.clone().normalize();

    // For simple numbers, use direct numeric addition
    if (isSimple(x) && isSimple(other)) {
      var directSum = x.toNumber() + other.toNumber();
      if (isFinite(directSum)) return new MetaNum(directSum);
    }

    var xIsSmall = isSmall(x);
    var oIsSmall = isSmall(other);

    var p = x.min(other);
    var q = x.max(other);
    var t;

    // If one is normal huge and other is small: huge dominates
    if (xIsSmall !== oIsSmall) {
      // One is small, one is normal → the normal (non-small) dominates
      return oIsSmall ? x.clone() : other.clone();
    }

    if (xIsSmall && oIsSmall) {
      // Both small: add as reciprocals, then reciprocalize result
      var xInv = x.clone(); xInv.sign = 1; // small positive → large positive
      var oInv = other.clone(); oInv.sign = 1;
      var sumInv = xInv.add(oInv);
      var result = sumInv.rec();
      return result;
    }

    // Normal (non-small) addition
    if (q.gt(MetaNum.E_MAX_SAFE_INTEGER) || q.div(p).gt(MetaNum.MAX_SAFE_INTEGER)) {
      t = q;
    } else if (!q.array[0][1]) {
      t = new MetaNum(x.toNumber() + other.toNumber());
    } else if (q.array[0][1] === 1) {
      var a = p.array[0][1] ? p.array[0][0] : Math.log10(p.array[0][0]);
      t = new MetaNum([a + Math.log10(Math.pow(10, q.array[0][0] - a) + 1), 1]);
    }

    return t;
  };
  Q.plus = Q.add = function (x, y) {
    return new MetaNum(x).add(y);
  };

  P.minus = P.sub = function (other) {
    var x = this.clone();
    other = new MetaNum(other);

    if (x.sign === -1 || x.sign === -2) return x.neg().sub(other.neg()).neg();
    if (other.sign === -1 || other.sign === -2) return x.add(other.neg());
    if (x.isNaN() || other.isNaN()) return MetaNum.NaN.clone();
    if (x.isInfinite() && other.isInfinite()) return MetaNum.NaN.clone();
    if (x.isInfinite()) return x;
    if (other.isInfinite()) return other.neg();
    if (x.eq(other)) return MetaNum.ZERO.clone();
    if (other.eq(MetaNum.ZERO)) return x;

    var p = x.min(other);
    var q = x.max(other);
    var n = other.gt(x);
    var t;

    // For very large q, subtraction of small values is negligible
    if (q.gt(MetaNum.E_MAX_SAFE_INTEGER)) {
      t = q.clone();
      t = n ? t.neg() : t;
    } else if (q.div(p).gt(MetaNum.MAX_SAFE_INTEGER)) {
      t = q.clone();
      t = n ? t.neg() : t;
    } else if (!q.array[0][1]) {
      t = new MetaNum(x.toNumber() - other.toNumber());
    } else if (q.array[0][1] === 1) {
      var a = p.array[0][1] ? p.array[0][0] : Math.log10(p.array[0][0]);
      t = new MetaNum([a + Math.log10(Math.pow(10, q.array[0][0] - a) - 1), 1]);
      t = n ? t.neg() : t;
    }

    return t;
  };
  Q.minus = Q.sub = function (x, y) {
    return new MetaNum(x).sub(y);
  };

  P.times = P.mul = function (other) {
    var x = this.clone();
    other = new MetaNum(other);

    var xNS = toNormalizedSign(x.sign);
    var oNS = toNormalizedSign(other.sign);
    var resultNormSign = xNS * oNS;

    if (resultNormSign === -1) return x.abs().mul(other.abs()).neg();
    if (x.sign === -2 || x.sign === -1) return x.abs().mul(other.abs());
    if (x.isNaN() || other.isNaN()) return MetaNum.NaN.clone();
    if (x.eq(MetaNum.ZERO) && other.isInfinite()) return MetaNum.NaN.clone();
    if (x.isInfinite() && other.eq(MetaNum.ZERO)) return MetaNum.NaN.clone();
    if (other.eq(MetaNum.ZERO)) return MetaNum.ZERO.clone();
    if (other.eq(MetaNum.ONE)) return x.clone();
    if (x.eq(MetaNum.ZERO)) return MetaNum.ZERO.clone();
    if (x.eq(MetaNum.ONE)) return other.clone();
    if (x.isInfinite()) return x;
    if (other.isInfinite()) return other;

    if (x.max(other).gt(MetaNum.EE_MAX_SAFE_INTEGER)) return x.max(other);

    // Layer swallowing: multiplying a tower (layer≥1) by any layer-0 value
    // leaves the tower unchanged; two towers keep the larger one.
    var domMul = layerDominant(x, other);
    if (domMul !== null) return domMul.clone().normalize();

    if (isSimple(x) && isSimple(other) && !isSmall(x) && !isSmall(other)) {
      var nx = x.array[0][0];
      var ny = other.array[0][0];
      var n = nx * ny;
      if (isFinite(n) && n !== 0 && Math.abs(n) <= MAX_SAFE_INTEGER) {
        if (Math.abs(n) < 1) return new MetaNum(1 / Math.abs(n)).rec();
        return new MetaNum(n);
      }
    }

    // General case: result = 10^(log10(x) + log10(y))
    var logSum = x.log10().add(other.log10());
    // If logSum is negative (result < 1), compute as reciprocal of positive power
    if (logSum.sign === -1) {
      var posLog = logSum.abs();
      var posResult = MetaNum.pow(MetaNum.TEN, posLog);
      return posResult.rec();
    }
    return MetaNum.pow(MetaNum.TEN, logSum);
  };
  Q.times = Q.mul = function (x, y) {
    return new MetaNum(x).mul(y);
  };

  P.divide = P.div = function (other) {
    var x = this.clone();
    other = new MetaNum(other);

    var xNS = toNormalizedSign(x.sign);
    var oNS = toNormalizedSign(other.sign);
    var resultNormSign = xNS * oNS;

    if (resultNormSign === -1) return x.abs().div(other.abs()).neg();
    if (x.sign === -2 || x.sign === -1) return x.abs().div(other.abs());
    if (x.isNaN() || other.isNaN()) return MetaNum.NaN.clone();
    if (x.isInfinite() && other.isInfinite()) return MetaNum.NaN.clone();
    if (x.eq(MetaNum.ZERO) && other.eq(MetaNum.ZERO)) return MetaNum.NaN.clone();
    if (other.eq(MetaNum.ZERO)) return MetaNum.POSITIVE_INFINITY.clone();
    if (other.eq(MetaNum.ONE)) return x.clone();
    if (x.eq(other)) return MetaNum.ONE.clone();
    if (x.isInfinite()) return x;
    if (other.isInfinite()) return MetaNum.ZERO.clone();

    if (x.max(other).gt(MetaNum.EE_MAX_SAFE_INTEGER)) {
      // Only shortcut if the result would be dominated by one operand
      if (x.gt(other)) return x.clone();
      // Otherwise compute properly (result is a small value)
      var logDiff = x.log10().sub(other.log10());
      if (logDiff.sign === -1) {
        return MetaNum.pow(MetaNum.TEN, logDiff.abs()).rec();
      }
      return MetaNum.pow(MetaNum.TEN, logDiff);
    }

    if (x.eq(MetaNum.ZERO)) return MetaNum.ZERO.clone();
    if (isSimple(x) && isSimple(other) && !isSmall(x) && !isSmall(other)) {
      var nx = x.array[0][0];
      var ny = other.array[0][0];
      var n = nx / ny;
      if (isFinite(n) && n !== 0 && Math.abs(n) <= MAX_SAFE_INTEGER) {
        if (Math.abs(n) < 1) return new MetaNum(1 / Math.abs(n)).rec();
        return new MetaNum(n);
      }
    }

    // General case: result = 10^(log10(x) - log10(y))
    var logDiff = x.log10().sub(other.log10());
    // If logDiff is negative (result < 1), compute as reciprocal of positive power
    if (logDiff.sign === -1) {
      var posLog = logDiff.abs();
      var posResult = MetaNum.pow(MetaNum.TEN, posLog);
      return posResult.rec();
    }
    var result = MetaNum.pow(MetaNum.TEN, logDiff);
    var fp = result.floor();
    if (result.sub(fp).abs().lt(new MetaNum(1e-9))) return fp;
    return result;
  };
  Q.divide = Q.div = function (x, y) {
    return new MetaNum(x).div(y);
  };

  P.reciprocate = P.rec = function () {
    if (this.isNaN()) return MetaNum.NaN.clone();
    if (this.eq(MetaNum.ZERO)) return MetaNum.NaN.clone();
    if (this.isInfinite()) return MetaNum.ZERO.clone();
    // Handle exponential format: rec(10^m) = 10^(-m)
    if (this.layer === 0 && this.array.length === 1 && this.array[0].length > 1 && !isSmall(this)) {
      var r0 = this.array[0].slice(0);
      r0[0] = -r0[0];
      var result = new MetaNum();
      result.array = [r0];
      result.sign = this.sign;
      result.layer = 0;
      result.normalize = P.normalize;
      return result.normalize();
    }
    var x = this.clone();
    // Toggle between large and small: 1↔2, -1↔-2
    x.sign = x.sign === 1 ? 2 : x.sign === 2 ? 1 : x.sign === -1 ? -2 : -1;
    return x.normalize();
  };
  Q.reciprocate = Q.rec = function (x) {
    return new MetaNum(x).rec();
  };

  P.toPower = P.pow = function (other) {
    var x = this.clone();
    other = new MetaNum(other);
    if (x.isNaN() || other.isNaN()) return MetaNum.NaN.clone();
    if (x.sign === -1 || x.sign === -2) {
      var absPow = this.abs().pow(other);
      if (other.isint()) {
        return other.mod(2).eq(0) ? absPow : absPow.neg();
      }
      return MetaNum.NaN.clone();
    }
    if (other.eq(MetaNum.ZERO)) return MetaNum.ONE.clone();
    if (x.eq(MetaNum.ZERO)) return MetaNum.ZERO.clone();
    if (x.eq(MetaNum.ONE)) return MetaNum.ONE.clone();
    if (other.eq(MetaNum.ONE)) return x.clone();
    if (x.isInfinite() || other.isInfinite()) return x;
    if (isSimple(x) && isSimple(other)) {
      var powVal = Math.pow(x.toNumber(), other.toNumber());
      if (Number.isFinite(powVal) && Math.abs(powVal) <= MAX_SAFE_INTEGER && powVal !== 0) return new MetaNum(powVal);
    }
    if (x.eq(MetaNum.TEN) && !isSmall(other)) {
      if (other.layer > 0 || other.array.length > 1) return other;
      var newRow0 = other.array[0].slice(0);
      newRow0[1] = (newRow0[1] || 0) + 1;
      return new MetaNum(newRow0);
    }
    // For small exponents: 10^small approaches 1 from above
    if (isSimple(x) && isSimple(other) && isSmall(other)) {
      var smallPow = Math.pow(x.toNumber(), other.toNumber());
      if (Number.isFinite(smallPow)) return new MetaNum(smallPow);
    }
    // For very small exponents on 10, return approximately 1
    if (x.eq(MetaNum.TEN) && isSmall(other)) {
      // 10^(very small) ≈ 1 + small*ln(10), which rounds to 1 for our purposes
      return MetaNum.ONE.clone();
    }
    var logResult = x.log10().mul(other);
    if (logResult.sign === -1 || logResult.sign === -2) {
      var posResult = MetaNum.pow(10, logResult.neg());
      posResult.sign = posResult.sign === 1 ? 2 : posResult.sign === 2 ? 1 : posResult.sign === -1 ? -2 : -1;
      return posResult.normalize();
    }
    return MetaNum.pow(10, logResult);
  };
  Q.toPower = Q.pow = function (x, y) {
    return new MetaNum(x).pow(y);
  };

  P.exponential = P.exp = function () {
    if (this.isNaN()) return MetaNum.NaN.clone();
    if (this.sign === -1 || this.sign === -2) return this.abs().exp().rec();
    if (isSimple(this) && !isSmall(this)) {
      var ev = Math.exp(this.array[0][0]);
      if (Number.isFinite(ev)) return new MetaNum(ev);
    }
    return MetaNum.pow(Math.E, this);
  };
  Q.exponential = Q.exp = function (x) {
    return new MetaNum(x).exp();
  };

  P.squareRoot = P.sqrt = function () {
    return this.root(2);
  };
  Q.squareRoot = Q.sqrt = function (x) {
    return new MetaNum(x).sqrt();
  };

  P.cubeRoot = P.cbrt = function () {
    return this.root(3);
  };
  Q.cubeRoot = Q.cbrt = function (x) {
    return new MetaNum(x).cbrt();
  };

  P.root = function (other) {
    var x = this.clone();
    other = new MetaNum(other);
    if (x.isNaN() || other.isNaN()) return MetaNum.NaN.clone();
    if (x.isInfinite()) return x;
    if (other.eq(MetaNum.ZERO)) return MetaNum.POSITIVE_INFINITY.clone();
    if (x.sign === -1 || x.sign === -2) {
      if (other.mod(2).eq(MetaNum.ONE)) return x.abs().root(other).neg();
      return MetaNum.NaN.clone();
    }
    if (isNumeric(x) && isNumeric(other)) return new MetaNum(Math.pow(x.array[0][0], 1 / other.array[0][0]));
    // Handle E^m format (iterated exponentiation levels)
    if (x.layer === 0 && x.array.length === 1 && x.array[0].length > 1 && isNumeric(other)) {
      var r0 = x.array[0];
      var n = other.array[0][0];
      var m = r0[1]; // number of 10^ wrappings: 1=E, 2=EE, >=3=F or higher
      var newR0;
      if (m === 1) {
        // E^1: value = 10^r0[0]. root_n = 10^(r0[0]/n)
        newR0 = r0.slice(0);
        newR0[0] = r0[0] / n;
      } else if (m === 2) {
        // E^2 (EE): value = 10^(10^r0[0])
        // root_n = 10^((10^r0[0])/n)
        // If 10^r0[0] is computable as JS number, unwrap one level: E((10^r0[0])/n)
        var powVal = Math.pow(10, r0[0]);
        if (isFinite(powVal) && powVal > 0 && powVal / n > 0) {
          newR0 = [powVal / n, 1]; // drop to E-level
        } else {
          // Too large: use identity a/b = 10^(log10(a) - log10(b)) inside one 10^
          // root_n(10^(10^x)) = 10^(10^(x - log10(n)))
          newR0 = r0.slice(0);
          newR0[0] = r0[0] - Math.log10(n);
        }
      } else {
        // E^m with m >= 3 (F, G, ... level)
        // V = 10^U where U = E^(m-1)(r0[0]).  V^(1/n) = 10^(U/n)
        // U = 10^V', so U/n = 10^V'/n = 10^(V' - log10(n))  when V' is still a pure tower
        // Since m >= 3, we can subtract log10(n) from r0[0] at level m-2, but we only have
        // a flat r0; the best uniform approximation is to subtract log10(n) from the base.
        newR0 = r0.slice(0);
        newR0[0] = r0[0] - Math.log10(n);
        if (newR0[0] <= 0) {
          // subtraction would collapse the bottom: try to unwrap one level instead
          // approximate: reduce the level by 1 and replace r0[0] by (10^r0[0] / n) if computable
          // if not computable, just keep the small value (log-scale effects dominate anyway)
          var powVal2 = Math.pow(10, r0[0]);
          if (isFinite(powVal2) && powVal2 / n > 0) {
            newR0 = [powVal2 / n, m - 1];
          }
        }
      }
      var result = new MetaNum();
      result.array = [newR0];
      result.sign = 1;
      result.layer = 0;
      result.normalize = P.normalize;
      return result.normalize();
    }
    return x;
  };
  Q.root = function (x, y) {
    return new MetaNum(x).root(y);
  };

  P.generalLogarithm = P.log10 = function () {
    if (this.isNaN() || this.sign === -1 || this.sign === -2) return MetaNum.NaN.clone();
    if (this.isInfinite()) return this;
    if (isSmall(this)) {
      // Small value: log10 is negative of what it would be for the normal value
      var n = this.clone();
      n.sign = 1; // Convert to normal positive for computation
      var result = n.log10();
      // Result should be negative (because log10 of a small number is negative)
      // Need to handle this carefully - after conversion, the result is the magnitude
      // which we need to negate
      return result.neg();
    }
    if (this.eq(MetaNum.ZERO)) return MetaNum.NEGATIVE_INFINITY.clone();
    if (isNumeric(this)) {
      var lv = Math.log10(this.array[0][0]);
      if (Number.isFinite(lv)) return new MetaNum(lv);
    }
    if (this.layer === 0 && this.array.length === 1 && this.array[0].length > 1) {
      var r0 = this.array[0];
      if (r0[1] > 0) {
        var newR0 = r0.slice(0);
        newR0[1]--;
        return new MetaNum(newR0);
      }
      return this;
    }
    return this;
  };
  Q.generalLogarithm = Q.log10 = function (x) {
    return new MetaNum(x).log10();
  };

  P.logarithm = P.logBase = P.log = function (base) {
    var x = this.clone();
    if (x.isNaN() || x.sign === -1 || x.sign === -2) return MetaNum.NaN.clone();
    base = new MetaNum(base);
    if (base.isNaN() || base.eq(MetaNum.ZERO) || base.eq(MetaNum.ONE)) return MetaNum.NaN.clone();
    if (x.eq(MetaNum.ZERO)) return MetaNum.NEGATIVE_INFINITY.clone();
    if (x.eq(MetaNum.ONE)) return MetaNum.ZERO.clone();
    if (isNumeric(x) && isNumeric(base)) {
      var lv = Math.log(x.array[0][0]) / Math.log(base.array[0][0]);
      if (Number.isFinite(lv)) return new MetaNum(lv);
    }
    return x.log10().div(base.log10());
  };
  Q.logarithm = Q.logBase = Q.log = function (x, base) {
    return new MetaNum(x).logBase(base);
  };

  P.naturalLogarithm = P.ln = function () {
    if (this.isNaN() || this.sign === -1 || this.sign === -2) return MetaNum.NaN.clone();
    if (this.eq(MetaNum.ZERO)) return MetaNum.NEGATIVE_INFINITY.clone();
    if (this.isInfinite()) return this;
    if (isNumeric(this)) {
      var lv = Math.log(this.array[0][0]);
      if (Number.isFinite(lv)) return new MetaNum(lv);
    }
    return this.log10().div(new MetaNum(Math.LOG10E));
  };
  Q.naturalLogarithm = Q.ln = function (x) {
    return new MetaNum(x).ln();
  };

  P.modular = P.mod = function (other) {
    other = new MetaNum(other);
    if (other.eq(MetaNum.ZERO)) return MetaNum.ZERO.clone();
    var tNS = toNormalizedSign(this.sign);
    var oNS = toNormalizedSign(other.sign);
    if (tNS * oNS === -1) return this.abs().mod(other.abs()).neg();
    if (this.sign === -1 || this.sign === -2) return this.abs().mod(other.abs());
    // Handle exponential format: mod(10^m, n) using modular exponentiation
    if (this.layer === 0 && this.array.length === 1 && this.array[0].length > 1 && isNumeric(other)) {
      var exp = this.array[0][0];
      var modVal = other.array[0][0];
      if (Number.isInteger(exp) && Number.isInteger(modVal) && modVal > 0) {
        var result = 1;
        var base = 10 % modVal;
        var e = exp;
        while (e > 0) {
          if (e % 2 === 1) result = (result * base) % modVal;
          e = Math.floor(e / 2);
          base = (base * base) % modVal;
        }
        return new MetaNum(result);
      }
    }
    return this.sub(this.div(other).floor().mul(other));
  };
  Q.modular = Q.mod = function (x, y) {
    return new MetaNum(x).mod(y);
  };

  P.gamma = function () {
    if (this.sign === -1 || this.sign === -2) return MetaNum.NaN.clone();
    if (this.isNaN() || this.isInfinite()) return this.clone();
    if (isSimple(this)) {
      var n = this.array[0][0];
      if (Number.isInteger(n) && n >= 0 && n <= 100) {
        var f = 1;
        for (var i = 2; i < n; i++) f *= i;
        return new MetaNum(f);
      }
      var g = f_gamma(n);
      if (Number.isFinite(g) && Math.abs(g) <= MAX_SAFE_INTEGER) return new MetaNum(g);
      var logG = f_logGamma(n);
      if (Number.isFinite(logG)) {
        return MetaNum.pow(10, new MetaNum(logG));
      }
    }
    return this;
  };
  Q.gamma = function (x) {
    return new MetaNum(x).gamma();
  };

  P.factorial = P.fact = function () {
    if (this.isNaN() || this.isInfinite()) return this;
    if (this.sign === -1 || this.sign === -2) return this.abs().fact().neg();
    if (isSimple(this)) {
      var n = this.array[0][0];
      if (Number.isInteger(n) && n >= 0 && n <= 20) {
        var f = 1;
        for (var i = 2; i <= n; i++) f *= i;
        return new MetaNum(f);
      }
      var fa = f_gamma(n + 1);
      if (Number.isFinite(fa) && Math.abs(fa) <= MAX_SAFE_INTEGER) return new MetaNum(fa);
      var logFa = f_logGamma(n + 1);
      if (Number.isFinite(logFa)) {
        return MetaNum.pow(10, new MetaNum(logFa));
      }
    }
    return this;
  };
  Q.factorial = Q.fact = function (x) {
    return new MetaNum(x).fact();
  };

  P.lambertw = function (tol, principal) {
    if (tol === undefined) tol = 1e-10;
    if (principal === undefined) principal = true;
    if (this.isNaN()) return MetaNum.NaN.clone();
    if (this.isInfinite()) return this.clone();
    if (this.lt(-0.3678794411710499)) return MetaNum.NaN.clone();
    
    // Handle large values with threshold checks (like OmegaNum)
    if (principal) {
      if (this.gt(MetaNum.TETRATED_MAX_SAFE_INTEGER)) return this.clone();
      if (this.gt(MetaNum.EE_MAX_SAFE_INTEGER)) {
        var result = this.clone();
        result.array[0][1]--;
        result.normalize();
        return result;
      }
      if (this.gt(MetaNum.E_MAX_SAFE_INTEGER)) return d_lambertw(this, tol, principal);
      if (isNumeric(this)) {
        try {
          return new MetaNum(f_lambertw(this.array[0][0], tol, principal));
        } catch (e) {
          return MetaNum.NaN.clone();
        }
      }
    } else {
      if (this.sign === 1 || this.sign === 2) return MetaNum.NaN.clone();
      if (this.abs().gt(MetaNum.EE_MAX_SAFE_INTEGER)) {
        return this.abs().recip().lambertw(tol, principal).neg();
      }
      if (this.abs().gt(MetaNum.E_MAX_SAFE_INTEGER)) return d_lambertw(this, tol, principal);
      if (isNumeric(this)) {
        try {
          return new MetaNum(f_lambertw(this.sign * this.array[0][0], tol, principal));
        } catch (e) {
          return MetaNum.NaN.clone();
        }
      }
    }
    
    return d_lambertw(this, tol, principal);
  };
  Q.lambertw = function (x, tol, principal) {
    return new MetaNum(x).lambertw(tol, principal);
  };

  P.floor = function () {
    if (this.isNaN() || this.isInfinite()) return this.clone();
    if (isSmall(this)) {
      // Small positive → 0, small negative → -1
      return this.sign === 2 ? MetaNum.ZERO.clone() : MetaNum.NEGATIVE_ONE.clone();
    }
    if (this.layer > 0 || this.array.length > 1 || this.array[0].length > 1) return this.clone();
    return new MetaNum(Math.floor(this.array[0][0]));
  };
  Q.floor = function (x) {
    return new MetaNum(x).floor();
  };

  P.ceiling = P.ceil = function () {
    if (this.isNaN() || this.isInfinite()) return this.clone();
    if (isSmall(this)) {
      // Small positive → 1, small negative → 0
      return this.sign === 2 ? MetaNum.ONE.clone() : MetaNum.ZERO.clone();
    }
    if (this.layer > 0 || this.array.length > 1 || this.array[0].length > 1) return this.clone();
    return new MetaNum(Math.ceil(this.array[0][0]));
  };
  Q.ceiling = Q.ceil = function (x) {
    return new MetaNum(x).ceil();
  };

  P.round = function () {
    if (this.isNaN() || this.isInfinite()) return this.clone();
    if (isSmall(this)) return MetaNum.ZERO.clone();
    if (this.layer > 0 || this.array.length > 1 || this.array[0].length > 1) return this.clone();
    return new MetaNum(Math.round(this.array[0][0]));
  };
  Q.round = function (x) {
    return new MetaNum(x).round();
  };

  P.isInteger = P.isint = function () {
    if (this.isNaN() || this.isInfinite()) return false;
    if (isSmall(this)) return false; // Small values are between 0 and 1, not integers
    if (this.sign === -1) return this.abs().isint();
    if (this.layer > 0 || this.array.length > 1 || this.array[0].length > 1) return true;
    return Number.isInteger(this.array[0][0]);
  };
  Q.isInteger = Q.isint = function (x) {
    return new MetaNum(x).isint();
  };

  P.tetrate = P.tetr = function (other, payload) {
    if (payload === undefined) payload = MetaNum.ONE;
    var x = this.clone();
    other = new MetaNum(other);
    payload = new MetaNum(payload);
    if (payload.neq(MetaNum.ONE)) other = other.add(payload.slog(x));
    if (x.isNaN() || other.isNaN() || payload.isNaN()) return MetaNum.NaN.clone();
    if (other.sign === -1 || other.sign === -2) {
      if (other.eq(-1)) return MetaNum.ZERO.clone();
      return MetaNum.NaN.clone();
    }
    if (other.eq(MetaNum.NEGATIVE_INFINITY)) return MetaNum.ZERO.clone();
    if (other.eq(MetaNum.ZERO)) return MetaNum.ONE.clone();
    if (other.eq(MetaNum.ONE)) return x.clone();
    if (other.eq(2)) return x.pow(x);
    if (x.eq(MetaNum.ZERO)) {
      if (other.eq(MetaNum.ZERO)) return MetaNum.NaN.clone();
      if (other.mod(2).eq(MetaNum.ZERO)) return MetaNum.ONE.clone();
      return MetaNum.ZERO.clone();
    }
    if (x.eq(MetaNum.ONE)) return MetaNum.ONE.clone();
    if (x.eq(2)) {
      if (other.eq(3)) return new MetaNum(16);
      if (other.eq(4)) return new MetaNum(65536);
    }
    if (x.isInfinite() || other.isInfinite()) return x.max(other);
    var m = x.max(other);
    if (m.gt(hyperLevel(3, MAX_SAFE_INTEGER))) return m;
    if (m.gt(MetaNum.TETRATED_MAX_SAFE_INTEGER) || other.gt(MetaNum.MAX_SAFE_INTEGER)) {
      var j = x.slog(10).add(other);
      j.array[0][2] = (j.array[0][2] || 0) + 1;
      j.normalize();
      return j;
    }
    var y = other.toNumber();
    var f = Math.floor(y);
    var r = x.pow(y - f);
    for (var i = 0; f !== 0 && r.lt(MetaNum.E_MAX_SAFE_INTEGER) && i < 100; i++) {
      if (f > 0) {
        r = x.pow(r);
        f--;
      }
    }
    if (i === 100) f = 0;
    r.array[0][1] = (r.array[0][1] + f) || f;
    r.normalize();
    return r;
  };
  Q.tetrate = Q.tetr = function (x, y, payload) {
    return new MetaNum(x).tetr(y, payload);
  };

  P.iteratedexp = function (other, payload) {
    return this.tetr(other, payload);
  };
  Q.iteratedexp = function (x, y, payload) {
    return new MetaNum(x).iteratedexp(y, payload);
  };

  P.iteratedlog = function (other) {
    var x = this.clone();
    other = new MetaNum(other);
    if (other.sign === -1 || other.sign === -2) return MetaNum.POSITIVE_INFINITY.clone();
    if (other.eq(MetaNum.ZERO)) return x.clone();
    if (isSimple(x) && isSimple(other) && Number.isInteger(other.array[0][0]) && other.array[0][0] <= 4) {
      var iv = x.array[0][0];
      var ic = other.array[0][0];
      if (ic <= 0) return x.clone();
      var r = iv;
      for (var i = 0; i < ic; i++) r = Math.log10(r);
      return new MetaNum(r);
    }
    return x;
  };
  Q.iteratedlog = function (x, y) {
    return new MetaNum(x).iteratedlog(y);
  };

  P.layeradd = function (other, base) {
    if (base == null) base = 10;
    if (other == null) other = MetaNum.ONE.clone();
    var x = this.clone();
    other = new MetaNum(other);
    base = new MetaNum(base);
    if (x.isNaN() || other.isNaN() || base.isNaN()) return MetaNum.NaN.clone();
    if (other.eq(MetaNum.ZERO)) return x.clone();
    if (other.sign === -1 || other.sign === -2) return MetaNum.ZERO.clone();
    return base.tetr(x.slog(base).add(other));
  };
  Q.layeradd = function (x, y, base) {
    return new MetaNum(x).layeradd(y, base);
  };

  P.layeradd10 = function (other) {
    return this.layeradd(other, 10);
  };
  Q.layeradd10 = function (x, y) {
    return new MetaNum(x).layeradd10(y);
  };

  P.ssqrt = P.ssrt = function () {
    if (this.sign === -1 || this.sign === -2) return MetaNum.NaN.clone();
    if (this.isNaN()) return MetaNum.NaN.clone();
    if (this.eq(MetaNum.ZERO)) return MetaNum.ZERO.clone();
    if (this.eq(MetaNum.ONE)) return MetaNum.ONE.clone();
    if (isSimple(this)) {
      var v = this.array[0][0];
      if (v > 0 && v < 1) return new MetaNum(v);
      try {
        var w = f_lambertw(Math.log(v));
        if (Number.isFinite(w)) return new MetaNum(Math.exp(w));
      } catch (e) {}
    }
    var ln = this.ln();
    var w = ln.lambertw();
    return w.exp();
  };
  Q.ssqrt = Q.ssrt = function (x) {
    return new MetaNum(x).ssqrt();
  };

  P.linear_sroot = function (other) {
    var x = this.clone();
    other = new MetaNum(other);
    if (x.isNaN() || other.isNaN()) return MetaNum.NaN.clone();
    if (x.sign === -1 || x.sign === -2 || other.sign === -1 || other.sign === -2) return MetaNum.NaN.clone();
    var degreeNum = other.toNumber();
    if (degreeNum === 1) return x.clone();
    if (x.eq(MetaNum.POSITIVE_INFINITY)) return MetaNum.POSITIVE_INFINITY.clone();
    if (!x.isFinite()) return MetaNum.NaN.clone();
    if (degreeNum > 0 && degreeNum < 1) return x.root(degreeNum);
    if (degreeNum <= 0) return MetaNum.NaN.clone();
    if (other.gt(MetaNum.MAX_SAFE_INTEGER)) {
      var xNum = x.toNumber();
      if (xNum < Math.E && xNum > 1 / Math.E) return x.pow(x.rec());
      if (x.gt(MetaNum.TETRATED_MAX_SAFE_INTEGER)) return MetaNum.tetr(10, x.slog(10).sub(other));
      return MetaNum.NaN.clone();
    }
    if (x.eq(MetaNum.ONE)) return MetaNum.ONE.clone();
    if (x.lt(MetaNum.ZERO)) return MetaNum.NaN.clone();
    if (x.gt(MetaNum.ONE)) {
      // Find upper bound
      var upperBound;
      if (degreeNum <= 1) {
        upperBound = x.root(degreeNum);
      } else if (x.gte(MetaNum.tetr(10, other))) {
        upperBound = x.iteratedlog(other, Math.floor(degreeNum) - 1);
      } else {
        upperBound = new MetaNum(10);
      }
      var lower = MetaNum.ZERO.clone();
      var layer = upperBound.array[0][2] || 0;
      var upper = upperBound.iteratedlog(10, layer);
      var guess = upper.div(2);
      for (var iter = 0; iter < 200; iter++) {
        var testVal = MetaNum.iteratedexp(10, layer, guess).tetr(other);
        if (testVal.gt(x)) {
          upper = guess;
        } else {
          lower = guess;
        }
        var newguess = lower.add(upper).div(2);
        if (newguess.eq(guess)) break;
        guess = newguess;
      }
      return MetaNum.iteratedexp(10, layer, guess);
    }
    return x;
  };
  Q.linear_sroot = function (x, y) {
    return new MetaNum(x).linear_sroot(y);
  };

  P.slog = function (base) {
    if (base === undefined) base = 10;
    var x = this.clone();
    base = new MetaNum(base);
    if (x.isNaN() || base.isNaN()) return MetaNum.NaN.clone();
    if (x.sign === -1 || x.sign === -2 || base.sign === -1 || base.sign === -2) return MetaNum.NaN.clone();
    if (x.eq(MetaNum.ONE)) return MetaNum.ZERO.clone();
    if (x.eq(base)) return MetaNum.ONE.clone();
    if (x.lt(MetaNum.ONE)) return MetaNum.fromNumber(-1).add(x.slog(base));
    var m = x.max(base);
    if (m.gt(hyperLevel(3, MAX_SAFE_INTEGER))) {
      if (x.gt(base)) return x.clone();
      return MetaNum.ZERO.clone();
    }
    if (m.gt(MetaNum.TETRATED_MAX_SAFE_INTEGER)) {
      if (x.gt(base)) {
        x.array[0][2]--;
        x.normalize();
        return x.sub(x.array[0][1] || 0);
      }
      return MetaNum.ZERO.clone();
    }
    if (isSimple(x) && isSimple(base) && base.array[0][0] > 1) {
      var v = x.array[0][0];
      var b = base.array[0][0];
      if (v <= Math.pow(b, b)) {
        if (v <= 1) return MetaNum.ZERO.clone();
        var sl = 0;
        while (Math.pow(b, b) >= v && sl < 10) {
          v = Math.log(v) / Math.log(b);
          sl++;
          if (v <= 0) break;
        }
        if (sl > 0) return new MetaNum(sl + v - 1);
      }
    }
    var r = 0;
    var t = (x.array[0][1] || 0) - (base.array[0][1] || 0);
    if (t > 3) {
      var l = t - 3;
      r += l;
      x.array[0][1] = x.array[0][1] - l;
    }
    for (var i = 0; i < 100; i++) {
      if (x.lt(0)) {
        x = MetaNum.pow(base, x);
        r--;
      } else if (x.lte(1)) {
        return new MetaNum(r + x.array[0][0] - 1);
      } else {
        r++;
        x = x.logBase(base);
      }
    }
    if (x.gt(10)) return new MetaNum(r);
    return new MetaNum(r + x.array[0][0] - 1);
  };
  Q.slog = function (x, base) {
    return new MetaNum(x).slog(base);
  };

  P.pentate = P.pent = function (other) {
    return this.arrow(3)(other);
  };
  Q.pentate = Q.pent = function (x, y) {
    return MetaNum.arrow(x, 3, y);
  };

  P.pentate_log = P.pent_log = function (base) {
    if (base === undefined) base = 10;
    var x = this.clone();
    base = new MetaNum(base);
    if (x.isNaN() || base.isNaN()) return MetaNum.NaN.clone();
    if (x.sign === -1 || x.sign === -2 || base.sign === -1 || base.sign === -2) return MetaNum.NaN.clone();
    if (x.eq(MetaNum.ONE)) return MetaNum.ZERO.clone();
    if (x.eq(base)) return MetaNum.ONE.clone();
    if (x.lt(base)) return MetaNum.ZERO.clone();
    var m = x.max(base);
    if (m.gt(hyperLevel(4, MAX_SAFE_INTEGER))) {
      if (x.gt(base)) return x.clone();
      return MetaNum.ZERO.clone();
    }
    if (isSimple(x) && isSimple(base) && base.array[0][0] > 1) {
      var v = x.array[0][0];
      var b = base.array[0][0];
      var count = 0;
      while (v > b && count < 100) {
        var slogVal = new MetaNum(v).slog(base);
        if (slogVal.array.length <= 1 && slogVal.array[0].length <= 1) {
          v = slogVal.array[0][0];
          count++;
        } else {
          return new MetaNum(count).add(slogVal);
        }
      }
      if (count > 0) return new MetaNum(count).add(new MetaNum(v).slog(base));
    }
    var r = 0;
    for (var i = 0; i < 100; i++) {
      if (x.lte(base)) {
        if (x.lte(1)) return new MetaNum(r);
        return new MetaNum(r + x.array[0][0] / base.array[0][0]);
      } else {
        r++;
        x = x.slog(base);
      }
    }
    if (x.gt(10)) return new MetaNum(r);
    return new MetaNum(r);
  };
  Q.pentate_log = Q.pent_log = function (x, base) {
    return new MetaNum(x).pentate_log(base);
  };

  P.pentate_root = P.pent_root = function (height) {
    var x = this.clone();
    height = new MetaNum(height);
    if (x.isNaN() || height.isNaN()) return MetaNum.NaN.clone();
    if (x.sign === -1 || x.sign === -2 || height.sign === -1 || height.sign === -2) return MetaNum.NaN.clone();
    if (height.eq(MetaNum.ZERO)) {
      if (x.eq(MetaNum.ONE)) return MetaNum.NaN.clone();
      return MetaNum.NaN.clone();
    }
    if (height.eq(MetaNum.ONE)) return x.clone();
    if (height.eq(2) && isSimple(x)) {
      var v2 = x.array[0][0];
      if (v2 <= 1) return MetaNum.ONE.clone();
      var lo2 = 1;
      var hi2 = Math.max(2, v2);
      for (var i2 = 0; i2 < 50; i2++) {
        var mid2 = (lo2 + hi2) / 2;
        var val2 = MetaNum.pentate(mid2, 2);
        if (val2.eq(x)) return new MetaNum(mid2);
        if (val2.lt(x)) lo2 = mid2;
        else hi2 = mid2;
      }
      return new MetaNum((lo2 + hi2) / 2);
    }
    if (isSimple(x) && isSimple(height)) {
      var v = x.array[0][0];
      var h = height.array[0][0];
      if (h >= 2 && Number.isInteger(h)) {
        var lo = 1;
        var hi = Math.max(2, v);
        for (var i = 0; i < 50; i++) {
          var mid = (lo + hi) / 2;
          var val = MetaNum.pentate(mid, h);
          if (val.eq(x)) return new MetaNum(mid);
          if (val.lt(x)) lo = mid;
          else hi = mid;
        }
        return new MetaNum((lo + hi) / 2);
      }
    }
    if (isSimple(height) && height.array[0][0] >= 2) {
      var lo2 = new MetaNum(1);
      var hi2 = x.clone();
      for (var i = 0; i < 50; i++) {
        var mid2 = lo2.add(hi2).div(2);
        var val2 = MetaNum.pentate(mid2, height);
        if (val2.eq(x)) return mid2;
        if (val2.lt(x)) lo2 = mid2;
        else hi2 = mid2;
      }
      return lo2.add(hi2).div(2);
    }
    return x;
  };
  Q.pentate_root = Q.pent_root = function (x, height) {
    return new MetaNum(x).pentate_root(height);
  };
  
  // Layer swallowing (README representation L17): a layer≥1 value is a
  // 10{ω^ω^…}10 tower and dominates every operation with a layer-0 operand
  // — the result keeps the tower's layer. Returns the dominating MetaNum,
  // or null when both operands carry the same layer>0.
  function layerDominant(a, b) {
    if (a.layer > 0 && b.layer === 0) return a;
    if (b.layer > 0 && a.layer === 0) return b;
    if (a.layer > b.layer) return a;
    if (b.layer > a.layer) return b;
    return null;
  }

  // Fast construction of the diagonal chain D(L) = t{L}t for a plain finite
  // integer base t. The generic successor-rule recursion recomputes the whole
  // chain at every level (each level re-invokes t{n-1}(t)), which is ~O(n^3)
  // for plain diagonals (3{99}3 at maxCols=100 took ~5.5s). Unrolling rule 2
  // once builds the identical normalized array bottom-up:
  //   D(1) = t{1}t ; D(n+1) = t{n}^{t-1}(t) = t{n}^{t-2}(D(n))
  // Each t{n}(D(n)) step is the engine's own structured-value fast path, so
  // the result is array-identical to the recursive evaluation, in O(L^2).
  function canFastDiagonal(t) {
    if (t.layer !== 0 || t.array.length !== 1) return false;
    var n = t.toNumber();
    if (!isFinite(n) || n < 1 || Math.floor(n) !== n) return false;
    return (n - 2) <= 1000;
  }
  function diagonalChain(t, L) {
    var repeat = Math.max(Math.floor(t.toNumber()) - 2, 0);
    var r = t.pow(t); // D(1) = t{1}t
    for (var n = 1; n < L; n++) {
      // D(n+1) = t{n}^{repeat}(D(n)) with repeat = t-2.
      // n=1,2 keep pow/tetr (their own structuralization). For n>=3 every
      // step is the engine's structured-value fast path verbatim
      // (0 + D(n), then one count at column n, normalize) — do it directly
      // instead of re-entering arrow() (whose threshold guards cost ~7ms).
      for (var k = 0; k < repeat; k++) {
        if (n >= 3) {
          var j = MetaNum.ZERO.add(r);
          if (j.array.length === 1) {
            while (j.array[0].length <= n) j.array[0].push(0);
            j.array[0][n] = (j.array[0][n] || 0) + 1;
          }
          j.normalize();
          r = j;
        } else {
          r = t.arrow(n)(r);
        }
      }
    }
    return r;
  }

  // Convert a structured raw-application COUNT C at finite operation level n
  // ({n}^C(10)) to the dlsdl Aa-band smooth argument α (v = 10{n+2}(α)),
  // α ∈ [2,10). A count given canonically as 10{k}(t), t∈[1,10]:
  //   t = 10 rewrites exactly to α-anchor 2 one level up (10{k}10=10{k+1}2);
  //   each further level promotion is the geometric smooth-log step
  //   f → 1 + log10(f) (the same step the low-level polarize produces).
  // Matches dlsdl rule (iii)-(v): {99}^{10{93}10}(10) = 10{101}(2.001607…).
  // Raw application COUNT C at operation level n ({n}^C(10)) -> the dlsdl
  // diagonal-letter smooth argument α in [2,10) with v = 10{n+2}(α).
  // Start from C=10{level}(t) (polarize: a scalar C starts at level 1 with
  // t=log10(C)), then each level promotion is the geometric smooth-log step
  // t → 1+log10(t) (exact t=10 rewrites to the α-anchor 2). The final value
  // lands in [1,2); the diagonal mantissa is α=1+t (2 at the anchor).
  function countToDiagonalAlpha(C, n, r0OfC, rowsOfC) {
    var t, level;
    if (r0OfC === undefined || r0OfC === null) {
      t = Math.log10(C); level = 1;
    } else {
      // Truncation marker normalization: when rows overflowed the budget the
      // base was reset to [10] and the LOWEST kept finite row got +1 over the
      // uniform per-level fill (xCnt). That +1 marks the dropped cascade —
      // read it as the same count as the next kept row so the count climb
      // matches the untruncated anchor across configs.
      var pr0 = r0OfC.slice();
      var prows = rowsOfC ? rowsOfC.slice() : [];
      if (pr0[0] === 10 && prows.length > 0) {
        var li = 0;
        for (var pi = 1; pi < prows.length; pi++) {
          if (prows[pi][1] < prows[li][1]) li = pi;
        }
        var sortedLv = prows.slice().sort(function (a, b) { return a[1] - b[1]; });
        var c0v = sortedLv[0][0] || 0;
        var c1v = sortedLv.length > 1 ? (sortedLv[1][0] || 0) : 0;
        if (c0v === c1v + 1) {
          prows[li] = [c1v, prows[li][1]];
          pr0[0] = 10000000000;
        }
      }
      var pol = polarizeLike(pr0, prows);
      if (!pol) return null;
      t = Math.log10(pol.bottom) + pol.repeation;
      level = pol.arrows + 1; // C = 10{level}(t)
    }
    while (level < n + 2) {
      t = (t >= 9.999999999) ? 2 : 1 + Math.log10(t);
      level++;
      if (!(t > 0)) return null;
    }
    if (t >= 9.999999999) t = 2;
    return t < 2 ? 1 + t : (t > 10 ? 10 : t);
  }

  // Minimal local structural polarize (faithful port of format-metanum's
  // refPolarize) so the engine need not import the formatter: returns
  // {bottom, repeation, arrows} for an r0 + finite [count,level] rows chain,
  // i.e. the value behaves as 10{arrows+1}(log10(bottom)+repeation).
  function polarizeLike(r0, finiteRows) {
    var array = [r0[0]];
    for (var i = 1; i < r0.length; i++) if ((r0[i] || 0) > 0) array.push([i, r0[i], 1, 1]);
    if (finiteRows) for (i = 0; i < finiteRows.length; i++) {
      var fr0 = finiteRows[i];
      if (fr0 && fr0.length === 2 && (fr0[0] || 0) > 0) array.push([fr0[1], fr0[0], 1, 1]);
    }
    function arraySort() {
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
      });
    }
    function arrayMerge() {
      var elemOffset = 0;
      for (var mi = 0; mi < array.length - 2; ++mi) {
        if (array[mi][0] == array[mi + 1][0] &&
            array[mi][2] == array[mi + 1][2] && array[mi][3] == array[mi + 1][3]) {
          array[mi][1] += array[mi + 1][1]
          array.splice(mi + 1, 1)
          --mi
          elemOffset++
        }
      }
      return elemOffset
    }
    arraySort(); arrayMerge();
    var ptr = array.length - 2
    var b = function () { return array[array.length - 1] }
    var c = function (x) { array[array.length - 1] = x }
    var repeatResult = 500000
    while (--repeatResult >= 0) {
      if (b() >= 10) {
        var a = Math.log10(b())
        array.push([1, 1, 1, 1]); ptr++; arraySort()
        var offset = arrayMerge(); ptr -= offset; c(a)
      } else {
        if (ptr == 0 && typeof array[ptr + 1] == 'number') break
        if (ptr != 0 && typeof array[ptr + 1] == 'number' && typeof array[ptr][0] == 'number' &&
          array[ptr][1] == 1 &&
          (array[ptr - 1][0] == 'x' || array[ptr - 1][2] > array[ptr][2] || array[ptr - 1][3] > array[ptr][3]) &&
          array[ptr][0] > 2 && (ptr != 0 || array[ptr - 1][0] == 'x')) {
          var arrow_count = array[ptr][0]
          var base = b()
          var Jx = arrow_count == 3 ? base : arrow_count - 1 + Math.log(base / 2) / Math.log(5)
          array[ptr][0] = 'x'
          c(Jx); arraySort(); var off2 = arrayMerge(); ptr -= off2
        }
        if (typeof array[ptr + 1] == 'number' && array[ptr][0] == 'x' && b() < 10 && ptr != 0) {
          var base2 = b()
          var JRepeation = array[ptr][1]
          var Kx = JRepeation + Math.log10(base2)
          array[ptr][1] = 1
          array[ptr][0] = 1
          array[ptr][2]++
          c(Kx); arraySort(); var off3 = arrayMerge(); ptr -= off3
        }
        if (((ptr == 0) || ptr != 0) && array[ptr][0] != 'x' && b() < 10) {
          if (b() == 1 && ptr > 0 && array[ptr - 1][0] > array[ptr][0] && array[ptr][1] == 1) {
            array[ptr][0] = array[ptr - 1][0]
          } else {
            var right = array[ptr][1] + Math.log10(b())
            array[ptr][0]++
            array[ptr][1] = 1
            c(right)
          }
          arraySort(); var off4 = arrayMerge(); ptr -= off4
        }
      }
    }
    if (typeof array[ptr][0] !== 'number' || !isFinite(b())) return null;
    return { bottom: b(), repeation: array[ptr][1], arrows: array[ptr][0] };
  }

  // Canonical compact form of the smooth diagonal value 10{L}(α) with a
  // NUMERIC α in [1,10): r0=[1] plus one finite row [α, L-1]. The fractional
  // row count survives normalization (only r0 integer columns are floored)
  // and polarize climbs it straight back to t=α at level L-1, so the smooth
  // mantissa is preserved at arbitrary finite levels (used where the iterated
  // arrow loop would MSI-dump the fraction away).
  function compactSmoothValue(L, alpha) {
    var m = new MetaNum({ sign: 1, layer: 0, array: [[1], [alpha, L - 1]] });
    return m.normalize();
  }

  // region >=ω level operations
  P.arrow = function (arrows) {
    var t = this.clone();
    arrows = new MetaNum(arrows);
    if (arrows.sign === -1 || arrows.sign === -2) return function () { return MetaNum.NaN.clone(); };
    if (!arrows.isint()) {
      // Fractional hyperoperation level.
      // Geometric interpolation per README rule (i): level n+f acts as the (n+1)-level
      // op on a geometrically interpolated argument — for the canonical
      // diagonal 10{n+f}10 = 10{n+1}(2·5^f). General anchors: θ0 satisfies
      // x{n+1}θ0 = x{n}y (recovered via hyper_log), θ1 = y, θf = θ0·(y/θ0)^f,
      // so x{n+f}y = x{n+1}(θf), continuous in f with
      // x{n}y at f=0 and x{n+1}y at f=1.
      if (arrows.gte(MetaNum.ONE)) {
        var nLev = arrows.floor();
        var frac = arrows.sub(nLev);
        var self = t;
        return function (other) {
          other = new MetaNum(other);
          if (other.eq(MetaNum.ZERO)) return MetaNum.ONE.clone();
          if (other.eq(MetaNum.ONE)) return self.clone();
          if (frac.eq(MetaNum.ZERO)) return self.arrow(nLev)(other);
          var target = self.arrow(nLev)(other);
          var theta0 = target.hyper_log(self)(nLev.add(MetaNum.ONE));
          var theta = theta0.mul(other.div(theta0).pow(frac));
          return self.arrow(nLev.add(MetaNum.ONE))(theta);
        };
      }
      return function () { return MetaNum.NaN.clone(); };
    }
    if (arrows.eq(MetaNum.ZERO)) return function (other) { return t.mul(other); };
    if (arrows.eq(MetaNum.ONE)) return function (other) { return t.pow(other); };
    if (arrows.eq(2)) return function (other) { return t.tetr(other); };
    return function (other) {
      other = new MetaNum(other);
      if (other.sign === -1 || other.sign === -2) return MetaNum.NaN.clone();
      if (other.eq(MetaNum.ZERO)) return MetaNum.ONE.clone();
      if (other.eq(MetaNum.ONE)) return t.clone();
      if (other.eq(2)) {
        var diagArrowsNum = arrows.toNumber();
        // Only build directly when the whole diagonal fits r0; at/above
        // maxCols the value must go through the truncating branch below
        // (base [10] + first-kept row count +1), reached via the ordinary
        // t{L-1}t call which itself reuses the fast diagonal for its tail.
        if (isFinite(diagArrowsNum) && diagArrowsNum >= 2 &&
            diagArrowsNum <= MetaNum.maxCols && canFastDiagonal(t)) {
          return diagonalChain(t, diagArrowsNum - 1);
        }
        return t.arrow(arrows.sub(MetaNum.ONE))(t);
      }
      // Layer swallowing: any ω-tower operand (layer≥1) dominates a layer-0
      // operand under every (finite or ordinal) hyperoperation; equal layers
      // take the supremum (higher ordinal rows win). The layer itself is the
      // ω^-tower height and must survive unchanged.
      var dom = layerDominant(t, other);
      if (dom !== null) return dom.clone().normalize();
      if (t.layer > 0) return t.max(other).normalize();
      var arrowsNum = arrows.toNumber();
      if (!isFinite(arrowsNum)) {
        // arrows is a huge MetaNum (ω-level): result inherits the largest structure
        var j = t.max(other).max(arrows).clone();
        j.array.push([1, 0, 1]);
        j.normalize();
        return j;
      }
      if (arrows.gte(Number.MAX_SAFE_INTEGER)) {
        // arrows is very large but still a JS number; use approximate overflow
        var j = t.max(other).max(arrows).clone();
        j.array.push([1, 0, 1]);
        j.normalize();
        return j;
      }
      // Fractional argument exactly at the boundary level (L == maxCols):
      // 10{L}(α) with numeric α in (1,10) carries the smooth diagonal
      // mantissa directly (compact form). Levels beyond maxCols with a
      // numeric argument keep the structural integer cascade below.
      var yNumPre = other.toNumber();
      var boundaryFractional = isFinite(yNumPre) && yNumPre !== Math.floor(yNumPre);
      if (arrowsNum === MetaNum.maxCols && boundaryFractional) {
        return compactSmoothValue(arrowsNum, yNumPre);
      }
      // Structured finite argument at/below the boundary level
      // (e.g. 10{L}(10{k}10)): convert the raw application count to the
      // dlsdl smooth diagonal argument α and return 10{L+1}(α).
      var otherFiniteChain = other.layer === 0 &&
        other.array.slice(1).every(function (rr) { return rr.length === 2; });
      var otherHasChain = other.array[0].length >= 2 || other.array.length >= 2;
      if (arrowsNum >= MetaNum.maxCols &&
          otherFiniteChain && otherHasChain && !isFinite(yNumPre) &&
          t.layer === 0 && t.array.length === 1) {
        var alphaC = countToDiagonalAlpha(null, arrowsNum - 1,
                                          other.array[0], other.array.slice(1));
        if (alphaC !== null && alphaC >= 2) return compactSmoothValue(arrowsNum + 1, alphaC);
      }
      if (arrowsNum >= MetaNum.maxCols) {
        // Finite arrow level beyond r0 capacity:
        // expand the level chain exactly as far as the array budget allows —
        //   r0 filled to maxCols (levels 1..maxCols-1, the top one being the
        //   anchor level L-1 col) + [count, level] rows for levels
        //   maxCols..L-1 (maxRows-1 rows max; the top level L itself is the
        //   10{L}2 = 10{L-1}10 anchor and takes no row) —
        // and approximate beyond the budget: keep the LARGEST maxRows-1
        // ordinal rows, the ARRAY's second row (first-kept ordinal row) first column +1,
        // first row [10].
        // Swallowing: a finite level sits below any existing ω-level row.
        var j = t.max(other).clone();
        if (j.layer > 0) return j; // ω^ω-tower swallows any finite level
        var idx = -1;
        for (var i = j.array.length - 1; i >= 1; i--) {
          var row = j.array[i];
          if (row && row.length >= 2 && (row[0] || 0) > 0) { idx = i; break; }
        }
        // value below already carries an ordinal row: merge or swallow
        if (idx >= 0) {
          var belowRow = j.array[idx];
          var belowIsTower = belowRow.length >= 3;
          var belowLevel = belowIsTower ? Infinity : belowRow[1];
          if (belowIsTower || belowLevel > arrowsNum) { j.normalize(); return j; }
          if (belowLevel === arrowsNum) {
            belowRow[0] = Math.min((belowRow[0] || 0) + 1, MAX_SAFE_INTEGER);
            j.normalize();
            return j;
          }
          // belowLevel < arrowsNum: stack rows on top of the existing chain
          var rowBudgetA = MetaNum.maxRows - 1;
          var startA = Math.max(MetaNum.maxCols, belowLevel + 1);
          var endA = arrowsNum - 1;
          if (endA - startA + 1 <= rowBudgetA) {
            for (var la = startA; la <= endA; la++) j.array.push([1, la]);
          } else {
            var keptFromA = endA - rowBudgetA + 1;
            for (var lb = keptFromA; lb <= endA; lb++) {
              var cntA = (lb === endA) ? yCnt : xCnt;
              if (lb === keptFromA) cntA += 1;
              j.array.push([cntA, lb]);
            }
            j.array[0] = [10];
          }
          j.normalize();
          return j;
        }
        // plain finite base: expand the diagonal chain bottom-up.
        // Exact law (matches the engine's own low-level path and the
        // reference): x{L}y = x{L-1}^{y-2}(x{L-1}x), so the top level L-1
        // carries (y-2) ops and every level below — the x{L-1}x tail —
        // carries (x-2) ops:
        //   3{9}3 → 1 op/level, 4{9}4 → 2, 10{25}10 → 8 ops/level (the
        //   canonical all-8s form). The top level L itself is the
        //   10{L}2 = 10{L-1}10 anchor and takes no row.
        var subDepth = MetaNum.maxCols - 1;
        var xBase = t.toNumber();
        var yBase = other.toNumber();
        var xCnt = isFinite(xBase) ? Math.min(Math.max(xBase - 2, 0), MAX_SAFE_INTEGER) : MAX_SAFE_INTEGER;
        // Top-of-chain count: x{L}y = x{L-1}^{y-1}(x), so every level below the
        // top carries (x-2) ops while level L-1 carries (y-2) ops for y>=3
        // (the y=2 anchor x{L}2=x{L-1}x carries x-2 there). This makes
        // 10{100}11 = 10{99}(10{100}10) exact (col 99 = 9, not 8).
        var topCnt;
        if (!isFinite(yBase)) topCnt = MAX_SAFE_INTEGER;
        else if (yBase <= 2) topCnt = xCnt;
        else topCnt = Math.min(Math.max(yBase - 2, 1), MAX_SAFE_INTEGER);
        // Base-2 with y≥3: 2{L-1}(2{L}2)=2{L-1}4 expands like a base-10 tail
        // (8 ops per level), with the fixed law level L-2 = 2 ops and
        // level L-1 = (y-3) ops (matches the exact main-loop arrays:
        // 2{100}3 -> cols 1..97=8, col98=2; 2{100}10 -> col99=7).
        var base2mode = (xCnt === 0 && isFinite(yBase) && yBase >= 3);
        var fillCnt = base2mode ? 8 : xCnt;
        function countAt(lv) {
          if (base2mode) {
            if (lv === arrowsNum - 2) return 2;
            if (lv === arrowsNum - 1) return Math.max(yBase - 3, 0);
          }
          return (lv === arrowsNum - 1) ? topCnt : fillCnt;
        }
        // base sub-chain: the tail's bottom x{subDepth}x
        var sub;
        if (subDepth >= 2 && subDepth < arrowsNum) {
          if (base2mode) sub = diagonalChain(MetaNum(10), subDepth);
          else sub = canFastDiagonal(t) ? diagonalChain(t, subDepth) : t.arrow(subDepth)(t);
        } else {
          sub = t.max(other).clone();
        }
        if (sub.layer > 0) { sub.normalize(); return sub; }
        // top count at the anchor column (subDepth = L-1 when L == maxCols)
        if (sub.array.length === 1) {
          var wantLen = subDepth + 1;
          while (sub.array[0].length < wantLen) sub.array[0].push(0);
          if (arrowsNum === MetaNum.maxCols) {
            // no rows above: write the exact per-level counts into r0
            if (base2mode) {
              for (var bl = 1; bl <= arrowsNum - 3; bl++) sub.array[0][bl] = 8;
              sub.array[0][arrowsNum - 2] = 2;
              sub.array[0][arrowsNum - 1] = Math.max(yBase - 3, 0);
              if (sub.array[0][arrowsNum - 1] === 0) sub.array[0].pop();
            } else if (topCnt > 0) {
              sub.array[0][subDepth] = topCnt;
            }
          } else if (fillCnt > 0) {
            sub.array[0][subDepth] = (sub.array[0][subDepth] || 0) + fillCnt;
          }
        }
        // rows for levels maxCols..arrowsNum-1 within the budget
        var rowBudget = MetaNum.maxRows - 1;
        var startLv = subDepth + 1;
        var endLv = arrowsNum - 1; // top level L is the anchor, no row
        var nRows = endLv - startLv + 1;
        if (nRows > rowBudget) {
          // beyond budget: keep the largest rowBudget rows; the array's
          // SECOND row (= the first-kept ordinal row) gets its first column
          // +1 (the dropped lower chain collapses into one extra op there);
          // first row [10] (issues.md v2.1)
          var keptFrom = endLv - rowBudget + 1;
          for (var lv = keptFrom; lv <= endLv; lv++) {
            var cnt = countAt(lv);
            if (lv === keptFrom) cnt += 1;
            if (cnt > 0) sub.array.push([cnt, lv]);
          }
          sub.array[0] = [10];
        } else {
          for (var lv2 = startLv; lv2 <= endLv; lv2++) {
            var cnt2 = countAt(lv2);
            if (cnt2 > 0) sub.array.push([cnt2, lv2]);
          }
        }
        sub.normalize();
        return sub;
      }
      if (t.max(other).gt(hyperLevelSafe(arrowsNum + 1, MAX_SAFE_INTEGER))) {
        return t.max(other);
      }
      if (t.gt(hyperLevelSafe(arrowsNum, MAX_SAFE_INTEGER)) || other.gt(MetaNum.MAX_SAFE_INTEGER)) {
        var r;
        if (t.gt(hyperLevelSafe(arrowsNum, MAX_SAFE_INTEGER))) {
          r = t.clone();
          if (arrowsNum < MetaNum.maxCols) {
            r.array[0][arrowsNum]--;
          } else {
            var lastRow = r.array[r.array.length - 1];
            if (lastRow && lastRow.length >= 2 && typeof lastRow[lastRow.length - 1] === 'number') {
              lastRow[0] = (lastRow[0] || 0) - 1;
              if (lastRow[0] <= 0) r.array.pop();
            }
          }
          r.normalize();
        } else if (t.gt(hyperLevelSafe(arrowsNum - 1, MAX_SAFE_INTEGER))) {
          if (arrowsNum - 1 < MetaNum.maxCols) {
            r = new MetaNum(t.array[0][arrowsNum - 1]);
          } else {
            r = MetaNum.ZERO.clone();
          }
        } else {
          r = MetaNum.ZERO.clone();
        }
        var j = r.add(other);
        if (arrowsNum < MetaNum.maxCols) {
          j.array[0][arrowsNum] = (j.array[0][arrowsNum] || 0) + 1;
        } else {
          j = addOrdinalRow(j, 1, arrowsNum);
        }
        j.normalize();
        return j;
      }
      var y = other.toNumber();
      var fastDiag = isFinite(y) && Math.floor(y) === y && canFastDiagonal(t);
      if (arrowsNum >= 23 && y !== Math.floor(y) && Math.floor(y) > 2) {
        // Large integer part with a fractional tail at a high level: the tail
        // would be amplified by the many iterations (e.g. 10{69}69.6 ≈
        // 10{69}10), so use the discrete 10 anchor (accepted convention).
        // y with floor ≤ 2 keeps the smooth fractional path — the recursion
        // bottoms out numerically and carries the smooth Aa-diagonal mantissa
        // (e.g. 10{101}(2.001607)).
        y = 10;
        fastDiag = false;
      }
      var f = Math.floor(y);
      var arrows_m1 = arrows.sub(MetaNum.ONE);
      var initFloor = Math.floor(other.toNumber());
      var r, i;
      if (fastDiag && arrowsNum >= 2 && f >= 2) {
        // x{L}y = x{L-1}^{y-1}(x) = x{L-1}^{y-2}(x{L-1}x): seed with the
        // diagonal D(L-1) built bottom-up and run the remaining successor
        // iterations — same loop/guard/dump semantics as the path below,
        // minus the two recomputed seed iterations.
        r = diagonalChain(t, arrowsNum - 1);
        f -= 2;
        for (i = 0; f !== 0 && r.lt(hyperLevelSafe(arrowsNum - 1, MAX_SAFE_INTEGER)) && i < 98; i++) {
          if (f > 0) {
            r = t.arrow(arrows_m1)(r);
            f--;
          }
        }
        if (i === 98) f = 0;
      } else {
        r = t.arrow(arrows_m1)(y - f);
        for (i = 0; f !== 0 && r.lt(hyperLevelSafe(arrowsNum - 1, MAX_SAFE_INTEGER)) && i < 100; i++) {
          if (f > 0) {
            r = t.arrow(arrows_m1)(r);
            f--;
          }
        }
        if (i === 100) f = 0;
      }
      if (arrowsNum - 1 < MetaNum.maxCols) {
        if (f > 0) {
          r.array[0][arrowsNum - 1] = (r.array[0][arrowsNum - 1] || 0) + f;
        }
      } else {
        var count = f > 0 ? f : (i > 0 && initFloor > 0 ? initFloor - 1 : 0);
        if (count > 0) {
          r = addOrdinalRow(r, count, arrowsNum - 1);
        }
      }
      r.normalize();
      return r;
    };
  };
  P.chain = function (other, arrows) {
    return this.arrow(arrows)(other);
  };
  Q.arrow = function (x, arrows, y) {
    return new MetaNum(x).arrow(arrows)(y);
  };

  // ==================== hyper_log / hyper_root ====================
  // Inverses of the hyperoperation a{b}c = d (arrow-style chained API):
  //   d.hyper_log(a)(b)  = c     (recover the right operand / argument)
  //   d.hyper_root(c)(b) = a     (recover the base / left operand)
  // b = 0 and b = 1 use exact division and logarithms; b ≥ 2 bisects on the
  // monotone arrow engine (issues.md addition 2). Note: for levels b beyond
  // maxCols the forward arrow diagonalizes into one [1|b] marker row and the
  // argument is no longer recoverable — the bisection then returns the
  // smallest argument that reproduces d.
  function hyperBisect(f, target, bound) {
    // smallest integer x ≥ 1 with f(x) ≥ target (f monotone nondecreasing)
    var lo = MetaNum.ONE.clone();
    var hi = new MetaNum(2);
    var iters = 0;
    while (f(hi).lt(target)) {
      lo = hi.clone();
      hi = hi.mul(2);
      if (++iters > bound) return hi;      // bracketing budget exhausted
    }
    iters = 0;
    while (hi.sub(lo).gt(MetaNum.ONE) && iters++ < bound) {
      var mid = lo.add(hi).div(2);
      if (mid.lte(lo)) mid = lo.add(MetaNum.ONE);
      if (mid.gte(hi)) mid = hi.sub(MetaNum.ONE);
      if (f(mid).lt(target)) lo = mid.clone();
      else hi = mid.clone();
    }
    return hi;
  }

  P.hyper_log = function (a) {
    var d = this.clone();
    a = new MetaNum(a);
    return function (b) {
      b = new MetaNum(b);
      if (b.lt(MetaNum.ZERO) || d.lte(MetaNum.ZERO) || a.lte(MetaNum.ZERO) || a.eq(MetaNum.ONE)) {
        return MetaNum.NaN.clone();
      }
      if (b.eq(MetaNum.ZERO)) return d.div(a);            // a·c = d
      if (b.eq(MetaNum.ONE)) return d.log10().div(a.log10()); // a^c = d
      return hyperBisect(function (x) { return a.arrow(b)(x); }, d, 200);
    };
  };
  Q.hyper_log = function (d, a, b) {
    return new MetaNum(d).hyper_log(a)(b);
  };

  P.hyper_root = function (c) {
    var d = this.clone();
    c = new MetaNum(c);
    return function (b) {
      b = new MetaNum(b);
      if (b.lt(MetaNum.ZERO) || d.lte(MetaNum.ZERO) || c.lte(MetaNum.ZERO)) {
        return MetaNum.NaN.clone();
      }
      if (b.eq(MetaNum.ZERO)) return d.div(c);            // a·c = d
      if (c.eq(MetaNum.ONE)) return d.clone();            // a{b}1 = a
      return hyperBisect(function (x) { return x.arrow(b)(c); }, d, 200);
    };
  };
  Q.hyper_root = function (d, c, b) {
    return new MetaNum(d).hyper_root(c)(b);
  };
  Q.chain = function (x, y, arrows) {
    return new MetaNum(x).arrow(arrows)(y);
  };

  // level ω, rule 3 with the fundamental sequence ω[y] = y:
  //   x{ω}y = x{ω[y]}x = x{y}x
  // (the final operand is the base x, NOT the FS index y)
  //   aperiote(3,0) = 3{0}3 = 9; aperiote(3,1) = 3{1}3 = 27;
  //   aperiote(3,2) = 3{2}3 = 3^^3 = 7625597484987; ...
  P.aperiote = P.aper = P.h10 = function (y) {
    return this.arrow(y)(this);
  };
  Q.aperiote = Q.aper = Q.h10 = function (x, y) {
    return new MetaNum(x).aperiote(y);
  };

  P.inv_aperiote = P.i_aper = P.i10 = function (z) {
    var x = this.clone();
    z = new MetaNum(z);
    if (x.isNaN() || z.isNaN()) return MetaNum.NaN.clone();
    if (x.array.length >= 2) {
      // For ordinal y: find ordinal marker and return y
      for (var i = x.array.length - 1; i >= 1; i--) {
        var row = x.array[i];
        if (row.length >= 3 && row[1] === 0 && row[2] === 1 && row[0] > 0) {
          // This is an ordinal marker, return the ordinal y
          var result = x.clone();
          result.array.splice(i, 1);
          result.normalize();
          if (result.array.length <= 1) result.layer = 0;
          return result;
        }
      }
    }
    // For finite y: count the number of values in r0
    if (x.layer === 0 && x.array.length === 1) {
      var r0 = x.array[0];
      if (r0.length > 1) {
        // r0 = [base, v1, v2, ..., v_{y-1}]
        // y = r0.length
        return new MetaNum(r0.length);
      }
      return new MetaNum(1);
    }
    return z;
  };
  Q.inv_aperiote = Q.i_aper = Q.i10 = function (x, z) {
    return new MetaNum(x).inv_aperiote(z);
  };

  //calc level ω+1 x{ω+1}y, computed by the unified ordinal engine
  P.expande = P.expa = P.h11 = function (y) {
    var x = this.clone();
    y = new MetaNum(y);
    if (x.isNaN() || y.isNaN()) return MetaNum.NaN.clone();
    if (x.eq(MetaNum.ONE)) return MetaNum.ONE.clone();
    if (y.eq(MetaNum.ONE)) return x.clone();
    if (y.lte(MetaNum.ZERO)) return MetaNum.NaN.clone();
    var base = x.aperiote(x);  // expande(x, 2) = x{x}x = x{ω}x
    if (y.eq(2)) return base.clone();
    // 1 < y < 2 follows the successor rule too: x{ω+1}y = x{ω} applied
    // floor(y) times to x^frac(y) (continuous with y=1 → x, y=2 → x{ω}x)
    return Q._hyperopFromOrdinal(x, y, [1, 1]);
  };
  Q.expande = Q.expa = Q.h11 = function (x, y) {
    return new MetaNum(x).expande(y);
  };

  P.inv_expande = P.i_expa = P.i11 = function (z) {
    var x = this.clone();
    z = new MetaNum(z);
    if (x.isNaN() || z.isNaN()) return MetaNum.NaN.clone();
    if (x.array.length >= 2) {
      // For ordinal y: find [1, 1, 1] marker and return y (the ordinal itself)
      for (var i = x.array.length - 1; i >= 1; i--) {
        var row = x.array[i];
        if (row.length >= 3 && row[1] === 1 && row[2] === 1 && row[0] === 1) {
          // This is the ordinal marker, return the ordinal y
          var result = x.clone();
          result.array.splice(i, 1);
          result.normalize();
          if (result.array.length <= 1) result.layer = 0;
          return result;
        }
      }
      // For finite y: find [count, 0, 1] and return count + warmup.
      // warmup = number of iterate steps before V exceeded MSI, + 1:
      //   x > MSI → 1 ; x{ω}x > MSI → 2 ; x{ω}(x{ω}x) > MSI → 3 ; ...
      for (var i = x.array.length - 1; i >= 1; i--) {
        var row = x.array[i];
        if (row.length >= 3 && row[1] === 0 && row[2] === 1 && row[0] > 0) {
          return new MetaNum(row[0] + hyperopWarmup(z, [0, 1]));
        }
      }
    }
    return z;
  };
  Q.inv_expande = Q.i_expa = Q.i11 = function (x, z) {
    return new MetaNum(x).inv_expande(z);
  };

  //calc level ω+2 x{ω+2}y, computed by the unified ordinal engine
  P.multiexpande = P.muea = P.h12 = function (y) {
    var x = this.clone();
    y = new MetaNum(y);
    if (x.isNaN() || y.isNaN()) return MetaNum.NaN.clone();
    if (x.eq(MetaNum.ONE)) return MetaNum.ONE.clone();
    if (y.eq(MetaNum.ONE)) return x.clone();
    if (y.lte(MetaNum.ZERO)) return MetaNum.NaN.clone();
    var base = x.expande(x);  // multiexpande(x, 2)
    if (y.eq(2)) return base.clone();
    // 1 < y < 2 follows the successor rule (continuous with the integers)
    return Q._hyperopFromOrdinal(x, y, [2, 1]);
  };
  Q.multiexpande = Q.muea = Q.h12 = function (x, y) {
    return new MetaNum(x).multiexpande(y);
  };

  P.inv_multiexpande = P.i_muea = P.i12 = function (z) {
    var x = this.clone();
    z = new MetaNum(z);
    if (x.isNaN() || z.isNaN()) return MetaNum.NaN.clone();
    if (x.array.length >= 2) {
      // For ordinal y: find [1, 2, 1] marker and return y (the ordinal itself)
      for (var i = x.array.length - 1; i >= 1; i--) {
        var row = x.array[i];
        if (row.length >= 3 && row[1] === 2 && row[2] === 1 && row[0] === 1) {
          // This is the ordinal marker, return the ordinal y
          var result = x.clone();
          result.array.splice(i, 1);
          result.normalize();
          if (result.array.length <= 1) result.layer = 0;
          return result;
        }
      }
      // For finite y: find [count, 1, 1] and return count + warmup
      for (var i = x.array.length - 1; i >= 1; i--) {
        var row = x.array[i];
        if (row.length >= 3 && row[1] === 1 && row[2] === 1 && row[0] > 0) {
          return new MetaNum(row[0] + hyperopWarmup(z, [1, 1]));
        }
      }
    }
    return z;
  };
  Q.inv_multiexpande = Q.i_muea = Q.i12 = function (x, z) {
    return new MetaNum(x).inv_multiexpande(z);
  };

  //calc level ω+3 x{ω+3}y, computed by the unified ordinal engine
  P.powerexpande = P.poea = P.h13 = function (y) {
    var x = this.clone();
    y = new MetaNum(y);
    if (x.isNaN() || y.isNaN()) return MetaNum.NaN.clone();
    if (x.eq(MetaNum.ONE)) return MetaNum.ONE.clone();
    if (y.eq(MetaNum.ONE)) return x.clone();
    if (y.lte(MetaNum.ZERO)) return MetaNum.NaN.clone();
    var base = x.multiexpande(x);  // powerexpande(x, 2)
    if (y.eq(2)) return base.clone();
    // 1 < y < 2 follows the successor rule (continuous with the integers)
    return Q._hyperopFromOrdinal(x, y, [3, 1]);
  };
  Q.powerexpande = Q.poea = Q.h13 = function (x, y) {
    return new MetaNum(x).powerexpande(y);
  };

  P.inv_powerexpande = P.i_poea = P.i13 = function (z) {
    var x = this.clone();
    z = new MetaNum(z);
    if (x.isNaN() || z.isNaN()) return MetaNum.NaN.clone();
    if (x.array.length >= 2) {
      // For ordinal y: find [1, 3, 1] marker and return y (the ordinal itself)
      for (var i = x.array.length - 1; i >= 1; i--) {
        var row = x.array[i];
        if (row.length >= 3 && row[1] === 3 && row[2] === 1 && row[0] === 1) {
          // This is the ordinal marker, return the ordinal y
          var result = x.clone();
          result.array.splice(i, 1);
          result.normalize();
          if (result.array.length <= 1) result.layer = 0;
          return result;
        }
      }
      // For finite y: find [count, 2, 1] and return count + warmup
      for (var i = x.array.length - 1; i >= 1; i--) {
        var row = x.array[i];
        if (row.length >= 3 && row[1] === 2 && row[2] === 1 && row[0] > 0) {
          return new MetaNum(row[0] + hyperopWarmup(z, [2, 1]));
        }
      }
    }
    return z;
  };
  Q.inv_powerexpande = Q.i_poea = Q.i13 = function (x, z) {
    return new MetaNum(x).inv_powerexpande(z);
  };

  // ---------------------------------------------------------------------------
  // Unified ordinal hyperoperation engine — implements README rules 1-4:
  //   rule 1: x{0}y = x*y
  //   rule 2: x{α}1 = x;  x{α}y = (x{α-1}) iterated (y-1) times from x
  //   rule 3: x{λ}y = x{λ[y]}y   (fundamental sequence at y)
  //   rule 4: operations compose right-to-left
  // Representation rules for operands/intermediates beyond MSI:
  //   x{α}y ≈ 10{α}y when y > MSI → y itself plus one ordinal row [1|α]
  //   (the iteration count y is unrepresentable, so it diagonalizes to a
  //   single α-level marker — the supremum of count-limited iterations).
  // Swallowing (right-to-left composition): applying level β to a value
  // whose top ordinal row level is γ:
  //   β > γ → push a new [k|β] row ; β = γ → top count += k ; β < γ → no change
  //   (e.g. 10{ω}10{ω+2}10 = 10{ω+2}10). Counts are always capped at MSI.
  // ---------------------------------------------------------------------------

  var COEFF_BOUND = 100; // cascade bound: larger coefficients supremum-collapse

  function trimCoeffs(coeffs) {
    while (coeffs.length > 0 && (coeffs[coeffs.length - 1] || 0) === 0) coeffs.pop();
    return coeffs;
  }

  function coeffsHaveOmegaPart(coeffs) {
    for (var i = 1; i < coeffs.length; i++) if ((coeffs[i] || 0) !== 0) return true;
    return false;
  }

  // fundamental sequence of a limit ordinal at cardinal n:
  //   ω^p*cp + rest → ω^p*(cp-1) + ω^(p-1)*n   (p = smallest index ≥ 1 with cp > 0)
  function fsCoeffs(coeffs, n) {
    var r = trimCoeffs(coeffs.slice());
    var p = 1;
    while (p < r.length && (r[p] || 0) === 0) p++;
    if (p >= r.length) return r;
    r[p] = r[p] - 1;
    r[p - 1] = (r[p - 1] || 0) + n;
    return trimCoeffs(r);
  }

  // α-1 for successor α (c0 > 0)
  function succCoeffs(coeffs) {
    var r = coeffs.slice();
    r[0] = (r[0] || 0) - 1;
    return trimCoeffs(r);
  }

  function cmpCoeffsLevel(a, b) {
    var m = Math.max(a.length, b.length);
    for (var i = m - 1; i >= 0; i--) {
      var av = i < a.length ? (a[i] || 0) : 0;
      var bv = i < b.length ? (b[i] || 0) : 0;
      if (av !== bv) return av - bv;
    }
    return 0;
  }

  // ordinal level coefficients of an ordinal row [count, c0, c1, ..., cp]
  function rowToCoeffs(row) {
    return trimCoeffs(row.slice(1));
  }

  // Supremum-collapse of oversized coefficients: ω^k*c with c > COEFF_BOUND
  // behaves like ω^(k+1) (c is effectively unbounded); applied only when the
  // ordinal already has an ω-part so pure finite levels stay exact.
  function collapseCoeffs(coeffs) {
    var r = coeffs.slice();
    if (!coeffsHaveOmegaPart(r)) return trimCoeffs(r);
    var changed = true;
    while (changed) {
      changed = false;
      for (var i = 0; i < r.length; i++) {
        if ((r[i] || 0) > COEFF_BOUND) {
          r[i] = 0;
          while (r.length <= i + 1) r.push(0);
          r[i + 1] = (r[i + 1] || 0) + 1;
          changed = true;
        }
      }
    }
    return trimCoeffs(r);
  }

  // Apply k operations of ordinal level `beta` to V (right-to-left composition
  // with swallowing). beta normally carries an ω-part (finite levels go
  // through arrow()).
  Q._applyOrdinalRows = function (V, beta, k) {
    var x = V.clone();
    if (!(k >= 1)) return x.normalize();
    if (k > MAX_SAFE_INTEGER) k = MAX_SAFE_INTEGER;
    var bt = trimCoeffs((beta || []).slice());
    if (bt.length === 0 || !coeffsHaveOmegaPart(bt)) {
      // finite level (fallback path; the engine normally uses arrow here)
      var lev = Math.floor(bt.length ? bt[0] : 0);
      return x.arrow(lev)(x).normalize();
    }
    var idx = -1;
    for (var i = x.array.length - 1; i >= 1; i--) {
      var row = x.array[i];
      if (row && row.length >= 2 && (row[0] || 0) > 0) { idx = i; break; }
    }
    if (idx < 0) {
      // no ordinal rows yet: any ω-level sits above the finite r0 chain
      x.array.push([k].concat(bt));
    } else {
      var c = cmpCoeffsLevel(bt, rowToCoeffs(x.array[idx]));
      if (c > 0) {
        // Push the larger level; if this exceeds the row budget, normalize
        // keeps the base + the largest rows (the new row is never the one
        // dropped — it ranks among the largest)
        x.array.push([k].concat(bt));
      } else if (c === 0) {
        var cnt = (x.array[idx][0] || 0) + k;
        x.array[idx][0] = cnt > MAX_SAFE_INTEGER ? MAX_SAFE_INTEGER : cnt;
      }
      // c < 0: swallowed by the larger ordinal structure on the right
    }
    return x.normalize();
  };

  // issues.md truncation rule for ordinal expansions: when the expansion
  // reaches row capacity (maxRows-1 ordinal rows), the base defaults to [10]
  // and the first (smallest kept) ordinal row's count increments by 1 —
  // marking that the exact expansion was truncated to its largest ordinals.
  Q._applyExpansionTruncation = function (x) {
    x = x.normalize();
    var maxOrdinalRows = MetaNum.maxRows - 1;
    if (x.array.length >= 2 && x.array.length - 1 >= maxOrdinalRows) {
      x.array[0] = [10];
      x.array[1][0] = (x.array[1][0] || 0) + 1;
      if (x.array[1][0] > MAX_SAFE_INTEGER) x.array[1][0] = MAX_SAFE_INTEGER;
    }
    return x;
  };

  // ---------------------------------------------------------------------------
  // Compact "layer marker" values for levels at or above ω^ω (README L17).
  // Such a level has no finite CNF coefficient row, so the result of x{α}y is
  // stored as the diagonal value of the reduced level (one rule-3 step):
  //   layer L >= 1, rows [count, a1, …, ap]  →
  //     10{ ω^ω^…((L-1) ω^'s)…^( Σ_i ω^(ord_i)·count_i + Σ_j ω^j·r_j ) }10
  //   with ord_i = ω^(p-1)·ap + … + ω·a2 + a1.
  // Examples: 10{ω^y}10 = L1 [[0],[1,y]];  10{ω^ω}10 = L1 [[0],[1,0,1]];
  //           10{ω^ω·y}10 = L1 [[0],[y,0,1]];  10{ω^(ω+y)}10 = L1 [[0],[1,y,1]];
  //           10{ω^(ω·y)}10 = L2 [[0],[y,1]];  10{ω^(ω^y)}10 = L3 [[y]];
  //           10{ω^ω^…^ω(y ω's)}10 = L_y [[0],[1,1]].
  // A marker is always stored in STANDARD FORM (Q._standardizeLayerValue):
  // finite-level rows merge into r0 and the layer drops as far as it can.
  // ---------------------------------------------------------------------------
  Q._layerMarker = function (r0, layer, rows) {
    var v = new MetaNum(0);
    v.array = [(r0 && r0.length) ? r0.slice() : [0]];
    for (var i = 0; i < (rows ? rows.length : 0); i++) {
      if (rows[i] && rows[i].length > 1) v.array.push(rows[i].slice());
    }
    v.layer = layer > 0 ? layer : 0;
    return Q._standardizeLayerValue(v);
  };

  // Standard form of a layer >= 1 value (README L17).  Two rewrites, both
  // preserving the encoded ordinal, applied until no longer possible:
  //   (a) merge: an ordinal row [count, k] holds the finite level k, i.e. the
  //       bracket term ω^k·count — the very term r0's own k-th entry spells
  //       (Σ_j ω^j·r_j).  So whenever k < maxCols the row folds into r0:
  //         cube(10,3): [[10],[1,3],[1,0,1]] → [[10,0,0,1],[1,0,1]].
  //   (b) de-layer: a layer-L value whose bracket is the finite ω-polynomial β
  //       (no row above ω survives) equals the layer-(L-1) value carrying the
  //       single row [1|β] (bracket ω^β, one ω^ less above it):
  //         layer2 [[5],[3,1]] → layer2 [[5,3]] → layer1 [[10],[1,5,3]]
  //           = 10{ω^(ω*3+5)}10;
  //         layer3 [[3]] → layer2 [[0,0,0,1]] → layer1 [[10],[1,0,0,0,1]]
  //           = 10{ω^ω^3}10.
  // Each de-layer step strictly lowers `layer`, so the loop terminates; the
  // innermost base is written as 10 (the 10{…}10 diagonal marker).
  function mergeFiniteRowsIntoR0(arr) {
    var r0 = arr[0];
    var keep = [];
    for (var i = 1; i < arr.length; i++) {
      var row = arr[i];
      if (row && row.length === 2 && row[1] >= 1 && row[1] < MetaNum.maxCols) {
        var k = row[1];
        while (r0.length <= k) r0.push(0);
        r0[k] += (row[0] || 0);
        continue;
      }
      keep.push(row);
    }
    arr.length = 1;
    for (var j = 0; j < keep.length; j++) arr.push(keep[j]);
  }

  Q._standardizeLayerValue = function (v) {
    if (!v || v.layer < 1) return v.normalize();
    var L = v.layer;
    var arr = [v.array[0].slice()];
    for (var i = 1; i < v.array.length; i++) arr.push(v.array[i].slice());
    mergeFiniteRowsIntoR0(arr);
    while (L >= 2 && arr.length === 1) {
      var poly = arr[0].slice();
      while (poly.length > 0 && poly[poly.length - 1] === 0) poly.pop();
      if (poly.length === 0) break;
      var row = [1].concat(poly);
      if (row.length > MetaNum.maxCols) break;      // row would not fit
      arr = [[0], row];
      L--;
      mergeFiniteRowsIntoR0(arr);
    }
    if ((arr[0][0] || 0) === 0) arr[0][0] = 10;   // innermost base marker
    v.array = arr;
    v.layer = L;
    return v.normalize();
  };

  // x{α}y when the operand y is itself an ordinal (or beyond MSI): the
  // iteration count is unrepresentable, so the engine convention applies —
  // "y plus one α-level marker row" (the supremum of the count-limited
  // iterations). `row` is the marker row of α at the given `layer`.
  Q._ordinalOperandOp = function (y, layer, row) {
    var v = y.clone();
    if (v.layer < layer) v.layer = layer;
    var bt = trimCoeffs((row || []).slice(1));
    var k = (row && row[0] > 0) ? row[0] : 1;
    if (bt.length === 0) return v.normalize();
    return Q._applyOrdinalRows(v, bt, k).normalize();
  };

  Q._ordinalHyperop = function (x, y, coeffs, depth) {
    x = new MetaNum(x);
    y = new MetaNum(y);
    if (depth === undefined) depth = 0;
    if (x.isNaN() || y.isNaN()) return MetaNum.NaN.clone();
    if (y.sign === -1 || y.sign === -2) return MetaNum.NaN.clone();
    if (y.lte(MetaNum.ZERO)) return MetaNum.NaN.clone();
    var cf = collapseCoeffs(trimCoeffs((coeffs || []).slice()));
    if (x.eq(MetaNum.ONE)) return MetaNum.ONE.clone();
    if (y.eq(MetaNum.ONE)) return x.clone();
    if (cf.length === 0) return x.mul(y); // rule 1: x{0}y = x*y

    if (!coeffsHaveOmegaPart(cf)) {
      // finite level: arrow() handles both small and huge operands
      return x.arrow(cf[0] || 0)(y);
    }

    var yCnt = metaFiniteCount(y);
    if (!(yCnt <= MAX_SAFE_INTEGER)) {
      // y beyond MSI (or ordinal): x{α}y ≈ 10{α}y = y + one α-row
      return Q._applyOrdinalRows(y, cf, 1);
    }
    if (depth > 2000) {
      // cascade budget exhausted: approximate residual level with one row
      return Q._applyOrdinalRows(x.max(y), cf, 1);
    }
    if ((cf[0] || 0) > 0) {
      // successor: x{α}y = iterate x{α-1} from x, y-1 times
      return Q._iterateOrdinal(x, succCoeffs(cf), x.clone(), yCnt - 1, depth);
    }
    // limit ordinal: fundamental sequence at y
    var pL = 1;
    while (pL < cf.length && (cf[pL] || 0) === 0) pL++;
    // A fundamental sequence whose cardinal is cascade-unrepresentable would
    // need more distinct ordinal levels than the array can hold — collapse to
    // the diagonalized single-row form (supremum of the iteration hierarchy).
    var hugeFs = yCnt > COEFF_BOUND && (pL >= 2 || (cf[1] || 0) > 1);
    if (hugeFs) return Q._applyOrdinalRows(x.max(y), cf, 1);
    // rule 3: x{λ}y = x{λ[y]}x — the final operand is the base x
    return Q._ordinalHyperop(x, x, fsCoeffs(cf, yCnt), depth + 1);
  };

  Q._iterateOrdinal = function (x, beta, V0, iters, depth) {
    var V = V0.clone();
    var i = 0;
    var guard = 0;
    while (i < iters) {
      if (++guard > 200) return Q._applyOrdinalRows(V, beta, iters - i);
      var vCnt = metaFiniteCount(V);
      if (!(vCnt <= MAX_SAFE_INTEGER)) {
        // V is huge: every further application adds one β-row → fast-forward
        return Q._applyOrdinalRows(V, beta, iters - i);
      }
      V = Q._ordinalHyperop(x, V, beta, (depth || 0) + 1);
      i++;
    }
    return V;
  };

  // Helper: generic hyperoperation from ordinal level (Cantor normal form coefficients).
  // coeffs: [c0, c1, c2, ..., ck] where ordinal = ω^k*ck + ... + ω^2*c2 + ω*c1 + c0
  // Two computation paths:
  //   - small operands (x ∈ [3, MSI] finite, y ∈ [3, MSI] finite, enumeration of
  //     ordinals below α with coefficients < y fits into maxRows): legacy
  //     enumeration representation (one row per ordinal below α, count = y-2)
  //   - everything else (any operand beyond MSI, x = 2, or enumeration too large):
  //     unified ordinal engine (README rules 1-4)
  Q._hyperopFromOrdinalRaw = function (x, y, coeffs) {
    x = new MetaNum(x);
    y = new MetaNum(y);
    if (x.isNaN() || y.isNaN()) return MetaNum.NaN.clone();
    if (y.sign === -1 || y.sign === -2) return MetaNum.NaN.clone();
    if (y.lte(MetaNum.ZERO)) return MetaNum.NaN.clone();
    if (x.eq(MetaNum.ONE)) return MetaNum.ONE.clone();
    if (y.eq(MetaNum.ONE)) return x.clone();
    var cf0 = trimCoeffs((coeffs || []).slice());
    if (cf0.length === 0) return x.mul(y); // rule 1: x{0}y = x*y
    // Non-integer argument at ordinal levels (issues.md addition 3):
    //   successor level α (c0 > 0):  x{α}(m+f) = x{α-1} applied m times to x^f
    //     (e.g. expa(10,2.1) = 10{ω+1}2.1 = 10{ω}10{ω}(10^0.1); continuous at
    //     the integers since x^0 = 1 and x{α-1}1 = x)
    //   limit level λ (c0 = 0): fundamental sequence at m = floor(y)
    var yFracNum = y.toNumber();
    if (!y.isint() && y.gt(MetaNum.ONE) && y.array.length === 1 && isFinite(yFracNum)) {
      // Finite levels delegate to arrow()'s own fractional-argument machinery
      if (!coeffsHaveOmegaPart(cf0)) return x.arrow(cf0[0])(y);
      // ω level: match P.aperiote exactly (x{ω}y = x.arrow(y)(x)), so the
      // successor rule composes as expa(10,2.1) = 10{ω}10{ω}(10^0.1)
      if (cf0.length === 2 && cf0[1] === 1 && !(cf0[0] > 0)) return x.aperiote(y);
      var ym = Math.floor(yFracNum);
      // toPrecision(15) strips double-rounding noise in y - floor(y)
      // (2.1 - 2 = 0.10000000000000009), so x^frac(y) reproduces x.pow(0.1)
      // exactly and composition identities stay stable across paths
      var yf = new MetaNum(Number((yFracNum - ym).toPrecision(15)));
      if ((cf0[0] || 0) > 0) {
        if (ym <= 100000) {
          // successor rule: x{α}(m+f) = x{α-1} applied m times to x^f
          var succ = cf0.slice();
          succ[0] = succ[0] - 1;
          succ = trimCoeffs(succ);
          var v = x.pow(yf);
          for (var it = 0; it < ym; it++) v = Q._hyperopFromOrdinalRaw(x, v, succ);
          return v;
        }
        // Successor level with an iteration count beyond direct evaluation:
        // successors have no fundamental sequence, so fall through to the
        // engine's huge-y supremum convention (y + one α-row marker)
        return Q._ordinalHyperop(x, y, cf0);
      }
      if (ym >= 1) {
        // limit level: fundamental sequence at m = floor(y); rule 3 puts the
        // base x as the final operand: x{λ}y = x{λ[m]}x
        return Q._hyperopFromOrdinalRaw(x, x, fsCoeffs(cf0, ym));
      }
    }
    var cf = cf0;
    var deg = 0;
    for (var di = 1; di < cf.length; di++) if ((cf[di] || 0) !== 0) deg = di;
    if (deg >= 1 && x.array.length === 1 && x.layer === 0
        && y.array.length === 1 && y.layer === 0) {
      var xC = metaFiniteCount(x), yC = metaFiniteCount(y);
      if (xC >= 3 && xC <= MAX_SAFE_INTEGER && yC >= 3 && yC <= MAX_SAFE_INTEGER
          && Math.pow(yC, deg) <= MetaNum.maxRows) {
        return Q._enumHyperop(x, y, cf);
      }
    }
    return Q._ordinalHyperop(x, y, cf);
  };

  // Public entry point of the ordinal-level hyperoperations.  The expansion is
  // exact while it fits the array budget; once the rule-1..4 cascade overflows
  // maxRows the issues.md truncation rule applies (keep the largest maxRows-1
  // ordinal rows sorted ascending, array[1][0] += 1 as the truncation marker,
  // array[0] = [10]) — the same convention arrow() and BEAF already use.
  Q._hyperopFromOrdinal = function (x, y, coeffs) {
    var r = Q._hyperopFromOrdinalRaw(x, y, coeffs);
    if (r && r._ordTrunc) {
      delete r._ordTrunc;
      r = Q._applyExpansionTruncation(r);
    }
    return r;
  };

  // Legacy (HEAD-compatible) enumeration-based hyperoperation for small operands.
  Q._enumHyperop = function (x, y, coeffs) {
    var xNum = x.toNumber();
    var yNum = y.toNumber();
    var maxRows = MetaNum.maxRows; // 100
    var baseArrowLevel = Math.max(Math.floor(isFinite(xNum) ? xNum : 3), 3);
    var baseResult = x.arrow(baseArrowLevel)(x);
    var rows = Q._generateOrdinalRows(coeffs,
      isFinite(xNum) ? Math.floor(xNum) : baseArrowLevel,
      isFinite(yNum) ? Math.floor(yNum) : baseArrowLevel,
      maxRows);
    var result = baseResult.clone();
    var maxOrdinalRows = maxRows - 1;
    if (rows.length > maxOrdinalRows) {
      // Truncation: keep the largest maxOrdinalRows rows (rows ascend), the
      // base defaults to [10] and the first kept row's count marks it with +1
      rows = rows.slice(rows.length - maxOrdinalRows);
      result.array = [[10]];
      rows[0][0] = (rows[0][0] || 0) + 1;
      if (rows[0][0] > MAX_SAFE_INTEGER) rows[0][0] = MAX_SAFE_INTEGER;
    } else {
      result.array = [baseResult.array[0].slice()];
    }
    for (var i = 0; i < rows.length; i++) result.array.push(rows[i]);
    if (result.array.length > 1) result.layer = 0;
    return result;
  };

  // Legacy (HEAD-compatible) ordinal row enumeration: one row per ordinal below
  // `coeffs` (coefficients bounded by `cardinal`), each with count = cardinal-2.
  Q._generateOrdinalRows = function (coeffs, base, cardinal, maxRows) {
    var rows = [];
    var m = base;
    var n = cardinal;

    function compareOrd(a, b) {
      var maxLen = Math.max(a.length, b.length);
      for (var i = maxLen - 1; i >= 0; i--) {
        var va = (i < a.length) ? (a[i] || 0) : 0;
        var vb = (i < b.length) ? (b[i] || 0) : 0;
        if (va < vb) return -1;
        if (va > vb) return 1;
      }
      return 0;
    }

    function addOrd(a, b) {
      if (!b || b.length === 0 || (b.length === 1 && b[0] === 0)) return a.slice();
      if (!a || a.length === 0 || (a.length === 1 && a[0] === 0)) return b.slice();
      var result = a.slice();
      var k = 0;
      while (k < result.length && (result[k] || 0) === 0) k++;
      if (k >= result.length) {
        return b.slice();
      } else if (k === 0) {
        result[0] = (result[0] || 0) + (b[0] || 0);
        for (var i = 1; i < b.length; i++) {
          result[i] = (result[i] || 0) + (b[i] || 0);
        }
      } else {
        result[k] = 0;
        result = result.slice(0, k);
        for (var i = 0; i < b.length; i++) {
          result.push(b[i] || 0);
        }
      }
      while (result.length > 0 && result[result.length - 1] === 0) result.pop();
      return result;
    }

    function isZero(ord) {
      if (!ord || ord.length === 0) return true;
      for (var i = 0; i < ord.length; i++) {
        if ((ord[i] || 0) !== 0) return false;
      }
      return true;
    }

    function buildRow(ord, count) {
      var maxIdx = ord.length - 1;
      while (maxIdx >= 0 && (ord[maxIdx] || 0) === 0) maxIdx--;
      if (maxIdx < 0) return null;
      var row = [count];
      for (var i = 0; i <= maxIdx - 1; i++) row.push(ord[i] || 0);
      row.push(ord[maxIdx]);
      return row;
    }

    // Enumerate all ordinals below ω^k with coefficients < n
    function enumBelowOmegaK(k, n) {
      if (k === 0) {
        return [[0]];
      }
      if (k === 1) {
        var result = [];
        for (var i = 0; i < n; i++) {
          result.push([i]);
        }
        return result;
      }
      var result = [];
      for (var a = 0; a < n; a++) {
        var sub = enumBelowOmegaK(k - 1, n);
        for (var i = 0; i < sub.length; i++) {
          var combined = sub[i].slice();
          while (combined.length < k) combined.push(0);
          combined[k - 1] = a;
          result.push(combined);
        }
      }
      return result;
    }

    // Enumerate all ordinals below a given ordinal
    function enumBelow(alpha, n) {
      if (isZero(alpha)) return [];

      if ((alpha[0] || 0) > 0) {
        var pred = alpha.slice();
        pred[0]--;
        while (pred.length > 0 && pred[pred.length - 1] === 0) pred.pop();
        if (pred.length === 0) pred = [0];
        var result = enumBelow(pred, n);
        result.push(pred.slice());
        return result;
      }

      var k = alpha.length - 1;
      while (k >= 0 && (alpha[k] || 0) === 0) k--;
      if (k < 0) return [];

      var ck = alpha[k] || 0;
      var rest = alpha.slice(0, k);
      while (rest.length > 0 && rest[rest.length - 1] === 0) rest.pop();

      var result = [];

      for (var j = 0; j < ck; j++) {
        var sub = enumBelowOmegaK(k, n);
        for (var i = 0; i < sub.length; i++) {
          var combined = sub[i].slice();
          while (combined.length <= k) combined.push(0);
          combined[k] = j;
          result.push(combined);
        }
      }

      if (!isZero(rest)) {
        var restSub = enumBelow(rest, n);
        for (var i = 0; i < restSub.length; i++) {
          var combined = restSub[i].slice();
          while (combined.length <= k) combined.push(0);
          combined[k] = ck;
          result.push(combined);
        }
      }

      return result;
    }

    var count = n - 2;
    if (count < 1) return rows;

    var allOrdinals = enumBelow(coeffs, n);

    var seen = {};
    var uniqueOrdinals = [];
    for (var i = 0; i < allOrdinals.length; i++) {
      var ord = allOrdinals[i];
      if (isZero(ord)) continue;

      // Normalize: remove trailing zeros
      var normalized = ord.slice();
      while (normalized.length > 0 && normalized[normalized.length - 1] === 0) {
        normalized.pop();
      }

      // Skip ordinals below ω (finite ordinals: only constant term, length <= 1)
      if (normalized.length <= 1) continue;

      var key = normalized.join(',');
      if (seen[key]) continue;
      seen[key] = true;
      uniqueOrdinals.push(normalized);
    }

    uniqueOrdinals.sort(function (a, b) {
      return compareOrd(a, b);
    });

    var allRows = [];
    for (var i = 0; i < uniqueOrdinals.length; i++) {
      var row = buildRow(uniqueOrdinals[i], count);
      if (row) allRows.push(row);
    }

    // When enumerating more rows than fit, keep the largest maxRows-1
    // ordinals (rows are sorted ascending, so drop from the front)
    if (allRows.length > maxRows - 1) {
      var maxOrdinalRows = maxRows - 1;
      allRows = allRows.slice(allRows.length - maxOrdinalRows);
    }

    for (var i = 0; i < allRows.length; i++) {
      rows.push(allRows[i]);
    }

    return rows;
  };

  // Helper: number of leading iterate applications (of level `beta`) starting
  // from x before the running value exceeds MSI, plus 1. This is the offset j
  // such that op(x, y) = ... [y-j | beta] ..., used by the inverse operators to
  // recover y from the count row.
  function hyperopWarmup(x, beta) {
    var V = new MetaNum(x);
    var steps = 0;
    while (steps < 4) {
      if (!(metaFiniteCount(V) <= MAX_SAFE_INTEGER)) break;
      V = Q._ordinalHyperop(x, V, beta);
      steps++;
    }
    return steps + 1;
  }

  // Helper: generic inverse hyperoperation from ordinal level.
  // Forward paths and the rows they leave:
  //   - small x ∈ [3, MSI] & small y (enumeration path): rows for each ordinal
  //     below α, each with count = y-2 → inverse: top row count + 2
  //   - x > MSI or x = 2 (engine path), small y: count row [c | β] where β is
  //     α-1 (successor) → y = c + warmup(z, β)  (warmup: 1 if z > MSI, else 2/3)
  //   - huge/ordinal y (engine path): marker row [1 | α] → strip and return
  //     the remainder as y
  Q._invHyperopFromOrdinal = function (x, z, coeffs) {
    x = new MetaNum(x);
    z = new MetaNum(z);
    if (x.isNaN() || z.isNaN()) return MetaNum.NaN.clone();
    if (x.array.length <= 1) return z;

    var cf = trimCoeffs((coeffs || []).slice());

    // marker row [1 | α] (huge/ordinal y): return the remainder as y
    for (var i = x.array.length - 1; i >= 1; i--) {
      var row = x.array[i];
      if (row && row.length >= 2 && row[0] === 1) {
        var lv = rowToCoeffs(row);
        if (cf.length > 0 && cmpCoeffsLevel(lv, cf) === 0) {
          var result = x.clone();
          result.array.splice(i, 1);
          result.normalize();
          if (result.array.length <= 1) result.layer = 0;
          return result;
        }
      }
    }
    if (cf.length === 0) return z;

    // enumeration path (base z is a small finite number ≥ 3): top row count = y-2
    var zC = metaFiniteCount(z);
    if (z.array.length === 1 && z.layer === 0 && zC >= 3 && zC <= MAX_SAFE_INTEGER) {
      var lastRow = x.array[x.array.length - 1];
      if (lastRow && lastRow.length >= 2 && (lastRow[0] || 0) > 0) {
        return new MetaNum((lastRow[0] || 0) + 2);
      }
      return z;
    }

    // engine path: count row [c | β] with β = α-1 (successor α only)
    var below = null;
    if ((cf[0] || 0) > 0) below = succCoeffs(cf);
    if (below && coeffsHaveOmegaPart(below)) {
      for (var i = x.array.length - 1; i >= 1; i--) {
        var row = x.array[i];
        if (row && row.length >= 2 && (row[0] || 0) > 0) {
          if (cmpCoeffsLevel(rowToCoeffs(row), below) === 0) {
            return new MetaNum((row[0] || 0) + hyperopWarmup(z, below));
          }
        }
      }
    }
    return z;
  };

  // ---------------------------------------------------------------------------
  // Hyperoperations from ω*2 up to ω^4, all generated from ordinal level (CNF).
  //   coeffs = [c0, c1, c2, ..., ck] where ordinal = Σ ω^i * ci
  // ---------------------------------------------------------------------------

  // aperioexpande = ω*2  →  coeffs [0,2]
  P.aperioexpande = P.apea = P.h20 = function (y) {
    return Q._hyperopFromOrdinal(this, y, [0,2]);
  };
  Q.aperioexpande = Q.apea = Q.h20 = function (x, y) {
    return Q._hyperopFromOrdinal(x, y, [0,2]);
  };
  P.inv_aperioexpande = P.i_apea = P.i20 = function (z) {
    return Q._invHyperopFromOrdinal(this, z, [0,2]);
  };
  Q.inv_aperioexpande = Q.i_apea = Q.i20 = function (x, z) {
    return Q._invHyperopFromOrdinal(x, z, [0,2]);
  };

  // explode = ω*2 + 1  →  coeffs [1,2]
  P.explode = P.expl = P.h21 = function (y) {
    return Q._hyperopFromOrdinal(this, y, [1,2]);
  };
  Q.explode = Q.expl = Q.h21 = function (x, y) {
    return Q._hyperopFromOrdinal(x, y, [1,2]);
  };
  P.inv_explode = P.i_expl = P.i21 = function (z) {
    return Q._invHyperopFromOrdinal(this, z, [1,2]);
  };
  Q.inv_explode = Q.i_expl = Q.i21 = function (x, z) {
    return Q._invHyperopFromOrdinal(x, z, [1,2]);
  };

  // multiexplode = ω*2 + 2  →  coeffs [2,2]
  P.multiexplode = P.muel = P.h22 = function (y) {
    return Q._hyperopFromOrdinal(this, y, [2,2]);
  };
  Q.multiexplode = Q.muel = Q.h22 = function (x, y) {
    return Q._hyperopFromOrdinal(x, y, [2,2]);
  };
  P.inv_multiexplode = P.i_muel = P.i22 = function (z) {
    return Q._invHyperopFromOrdinal(this, z, [2,2]);
  };
  Q.inv_multiexplode = Q.i_muel = Q.i22 = function (x, z) {
    return Q._invHyperopFromOrdinal(x, z, [2,2]);
  };

  // aperioexplode = ω*3  →  coeffs [0,3]
  P.aperioexplode = P.apel = P.h30 = function (y) {
    return Q._hyperopFromOrdinal(this, y, [0,3]);
  };
  Q.aperioexplode = Q.apel = Q.h30 = function (x, y) {
    return Q._hyperopFromOrdinal(x, y, [0,3]);
  };
  P.inv_aperioexplode = P.i_apel = P.i30 = function (z) {
    return Q._invHyperopFromOrdinal(this, z, [0,3]);
  };
  Q.inv_aperioexplode = Q.i_apel = Q.i30 = function (x, z) {
    return Q._invHyperopFromOrdinal(x, z, [0,3]);
  };

  // detonate = ω*3 + 1  →  coeffs [1,3]
  P.detonate = P.deto = P.h31 = function (y) {
    return Q._hyperopFromOrdinal(this, y, [1,3]);
  };
  Q.detonate = Q.deto = Q.h31 = function (x, y) {
    return Q._hyperopFromOrdinal(x, y, [1,3]);
  };
  P.inv_detonate = P.i_deto = P.i31 = function (z) {
    return Q._invHyperopFromOrdinal(this, z, [1,3]);
  };
  Q.inv_detonate = Q.i_deto = Q.i31 = function (x, z) {
    return Q._invHyperopFromOrdinal(x, z, [1,3]);
  };

  // aperiodetonate = ω*4  →  coeffs [0,4]
  P.aperiodetonate = P.apdt = P.h40 = function (y) {
    return Q._hyperopFromOrdinal(this, y, [0,4]);
  };
  Q.aperiodetonate = Q.apdt = Q.h40 = function (x, y) {
    return Q._hyperopFromOrdinal(x, y, [0,4]);
  };
  P.inv_aperiodetonate = P.i_apdt = P.i40 = function (z) {
    return Q._invHyperopFromOrdinal(this, z, [0,4]);
  };
  Q.inv_aperiodetonate = Q.i_apdt = Q.i40 = function (x, z) {
    return Q._invHyperopFromOrdinal(x, z, [0,4]);
  };

  // aperionate = ω²  →  coeffs [0,0,1]
  P.aperionate = P.apeo = P.h100 = function (y) {
    return Q._hyperopFromOrdinal(this, y, [0,0,1]);
  };
  Q.aperionate = Q.apeo = Q.h100 = function (x, y) {
    return Q._hyperopFromOrdinal(x, y, [0,0,1]);
  };
  P.inv_aperionate = P.i_apeo = P.i100 = function (z) {
    return Q._invHyperopFromOrdinal(this, z, [0,0,1]);
  };
  Q.inv_aperionate = Q.i_apeo = Q.i100 = function (x, z) {
    return Q._invHyperopFromOrdinal(x, z, [0,0,1]);
  };

  // megote = ω² + 1  →  coeffs [1,0,1]
  P.megote = P.mego = P.h101 = function (y) {
    return Q._hyperopFromOrdinal(this, y, [1,0,1]);
  };
  Q.megote = Q.mego = Q.h101 = function (x, y) {
    return Q._hyperopFromOrdinal(x, y, [1,0,1]);
  };
  P.inv_megote = P.i_mego = P.i101 = function (z) {
    return Q._invHyperopFromOrdinal(this, z, [1,0,1]);
  };
  Q.inv_megote = Q.i_mego = Q.i101 = function (x, z) {
    return Q._invHyperopFromOrdinal(x, z, [1,0,1]);
  };

  // multimegote = ω² + 2  →  coeffs [2,0,1]
  P.multimegote = P.mume = P.h102 = function (y) {
    return Q._hyperopFromOrdinal(this, y, [2,0,1]);
  };
  Q.multimegote = Q.mume = Q.h102 = function (x, y) {
    return Q._hyperopFromOrdinal(x, y, [2,0,1]);
  };
  P.inv_multimegote = P.i_mume = P.i102 = function (z) {
    return Q._invHyperopFromOrdinal(this, z, [2,0,1]);
  };
  Q.inv_multimegote = Q.i_mume = Q.i102 = function (x, z) {
    return Q._invHyperopFromOrdinal(x, z, [2,0,1]);
  };

  // aperimegote = ω² + ω  →  coeffs [0,1,1]
  P.aperimegote = P.apmg = P.h110 = function (y) {
    return Q._hyperopFromOrdinal(this, y, [0,1,1]);
  };
  Q.aperimegote = Q.apmg = Q.h110 = function (x, y) {
    return Q._hyperopFromOrdinal(x, y, [0,1,1]);
  };
  P.inv_aperimegote = P.i_apmg = P.i110 = function (z) {
    return Q._invHyperopFromOrdinal(this, z, [0,1,1]);
  };
  Q.inv_aperimegote = Q.i_apmg = Q.i110 = function (x, z) {
    return Q._invHyperopFromOrdinal(x, z, [0,1,1]);
  };

  // megoexpande = ω² + ω + 1  →  coeffs [1,1,1]
  P.megoexpande = P.mgea = P.h111 = function (y) {
    return Q._hyperopFromOrdinal(this, y, [1,1,1]);
  };
  Q.megoexpande = Q.mgea = Q.h111 = function (x, y) {
    return Q._hyperopFromOrdinal(x, y, [1,1,1]);
  };
  P.inv_megoexpande = P.i_mgea = P.i111 = function (z) {
    return Q._invHyperopFromOrdinal(this, z, [1,1,1]);
  };
  Q.inv_megoexpande = Q.i_mgea = Q.i111 = function (x, z) {
    return Q._invHyperopFromOrdinal(x, z, [1,1,1]);
  };

  // aperimegoexpande = ω² + ω*2  →  coeffs [0,2,1]
  P.aperimegoexpande = P.apme = P.h120 = function (y) {
    return Q._hyperopFromOrdinal(this, y, [0,2,1]);
  };
  Q.aperimegoexpande = Q.apme = Q.h120 = function (x, y) {
    return Q._hyperopFromOrdinal(x, y, [0,2,1]);
  };
  P.inv_aperimegoexpande = P.i_apme = P.i120 = function (z) {
    return Q._invHyperopFromOrdinal(this, z, [0,2,1]);
  };
  Q.inv_aperimegoexpande = Q.i_apme = Q.i120 = function (x, z) {
    return Q._invHyperopFromOrdinal(x, z, [0,2,1]);
  };

  // megoaperionate = ω²*2  →  coeffs [0,0,2]
  // (also alias megoaperionation for backwards compat; renamed per user request)
  P.megoaperionate = P.mgao = P.h200 = function (y) {
    return Q._hyperopFromOrdinal(this, y, [0,0,2]);
  };
  Q.megoaperionate = Q.mgao = Q.h200 = function (x, y) {
    return Q._hyperopFromOrdinal(x, y, [0,0,2]);
  };
  P.inv_megoaperionate = P.i_mgao = P.i200 = function (z) {
    return Q._invHyperopFromOrdinal(this, z, [0,0,2]);
  };
  Q.inv_megoaperionate = Q.i_mgao = Q.i200 = function (x, z) {
    return Q._invHyperopFromOrdinal(x, z, [0,0,2]);
  };

  // gigote = ω²*2 + 1  →  coeffs [1,0,2]
  P.gigote = P.gigo = P.h201 = function (y) {
    return Q._hyperopFromOrdinal(this, y, [1,0,2]);
  };
  Q.gigote = Q.gigo = Q.h201 = function (x, y) {
    return Q._hyperopFromOrdinal(x, y, [1,0,2]);
  };
  P.inv_gigote = P.i_gigo = P.i201 = function (z) {
    return Q._invHyperopFromOrdinal(this, z, [1,0,2]);
  };
  Q.inv_gigote = Q.i_gigo = Q.i201 = function (x, z) {
    return Q._invHyperopFromOrdinal(x, z, [1,0,2]);
  };

  // aperigigote = ω²*2 + ω  →  coeffs [0,1,2]
  P.aperigigote = P.apgg = P.h210 = function (y) {
    return Q._hyperopFromOrdinal(this, y, [0,1,2]);
  };
  Q.aperigigote = Q.apgg = Q.h210 = function (x, y) {
    return Q._hyperopFromOrdinal(x, y, [0,1,2]);
  };
  P.inv_aperigigote = P.i_apgg = P.i210 = function (z) {
    return Q._invHyperopFromOrdinal(this, z, [0,1,2]);
  };
  Q.inv_aperigigote = Q.i_apgg = Q.i210 = function (x, z) {
    return Q._invHyperopFromOrdinal(x, z, [0,1,2]);
  };

  // gigoaperionate = ω²*3  →  coeffs [0,0,3]
  P.gigoaperionate = P.ggap = P.h300 = function (y) {
    return Q._hyperopFromOrdinal(this, y, [0,0,3]);
  };
  Q.gigoaperionate = Q.ggap = Q.h300 = function (x, y) {
    return Q._hyperopFromOrdinal(x, y, [0,0,3]);
  };
  P.inv_gigoaperionate = P.i_ggap = P.i300 = function (z) {
    return Q._invHyperopFromOrdinal(this, z, [0,0,3]);
  };
  Q.inv_gigoaperionate = Q.i_ggap = Q.i300 = function (x, z) {
    return Q._invHyperopFromOrdinal(x, z, [0,0,3]);
  };

  // aperiatote = ω³  →  coeffs [0,0,0,1]
  // (also alias aperiatotion for backwards compat; renamed per user request)
  P.aperiatote = P.apat = P.h1000 = function (y) {
    return Q._hyperopFromOrdinal(this, y, [0,0,0,1]);
  };
  Q.aperiatote = Q.apat = Q.h1000 = function (x, y) {
    return Q._hyperopFromOrdinal(x, y, [0,0,0,1]);
  };
  P.inv_aperiatote = P.i_apat = P.i1000 = function (z) {
    return Q._invHyperopFromOrdinal(this, z, [0,0,0,1]);
  };
  Q.inv_aperiatote = Q.i_apat = Q.i1000 = function (x, z) {
    return Q._invHyperopFromOrdinal(x, z, [0,0,0,1]);
  };

  // powiainate = ω³ + 1  →  coeffs [1,0,0,1]
  P.powiainate = P.pwan = P.h1001 = function (y) {
    return Q._hyperopFromOrdinal(this, y, [1,0,0,1]);
  };
  Q.powiainate = Q.pwan = Q.h1001 = function (x, y) {
    return Q._hyperopFromOrdinal(x, y, [1,0,0,1]);
  };
  P.inv_powiainate = P.i_pwan = P.i1001 = function (z) {
    return Q._invHyperopFromOrdinal(this, z, [1,0,0,1]);
  };
  Q.inv_powiainate = Q.i_pwan = Q.i1001 = function (x, z) {
    return Q._invHyperopFromOrdinal(x, z, [1,0,0,1]);
  };

  // expandainate = ω³ + ω  →  coeffs [0,1,0,1]
  P.expandainate = P.epan = P.h1010 = function (y) {
    return Q._hyperopFromOrdinal(this, y, [0,1,0,1]);
  };
  Q.expandainate = Q.epan = Q.h1010 = function (x, y) {
    return Q._hyperopFromOrdinal(x, y, [0,1,0,1]);
  };
  P.inv_expandainate = P.i_epan = P.i1010 = function (z) {
    return Q._invHyperopFromOrdinal(this, z, [0,1,0,1]);
  };
  Q.inv_expandainate = Q.i_epan = Q.i1010 = function (x, z) {
    return Q._invHyperopFromOrdinal(x, z, [0,1,0,1]);
  };

  // megodainate = ω³ + ω²  →  coeffs [0,0,1,1]
  P.megodainate = P.mgan = P.h1100 = function (y) {
    return Q._hyperopFromOrdinal(this, y, [0,0,1,1]);
  };
  Q.megodainate = Q.mgan = Q.h1100 = function (x, y) {
    return Q._hyperopFromOrdinal(x, y, [0,0,1,1]);
  };
  P.inv_megodainate = P.i_mgan = P.i1100 = function (z) {
    return Q._invHyperopFromOrdinal(this, z, [0,0,1,1]);
  };
  Q.inv_megodainate = Q.i_mgan = Q.i1100 = function (x, z) {
    return Q._invHyperopFromOrdinal(x, z, [0,0,1,1]);
  };

  // powiairate = ω³*2  →  coeffs [0,0,0,2]
  P.powiairate = P.pwar = P.h2000 = function (y) {
    return Q._hyperopFromOrdinal(this, y, [0,0,0,2]);
  };
  Q.powiairate = Q.pwar = Q.h2000 = function (x, y) {
    return Q._hyperopFromOrdinal(x, y, [0,0,0,2]);
  };
  P.inv_powiairate = P.i_pwar = P.i2000 = function (z) {
    return Q._invHyperopFromOrdinal(this, z, [0,0,0,2]);
  };
  Q.inv_powiairate = Q.i_pwar = Q.i2000 = function (x, z) {
    return Q._invHyperopFromOrdinal(x, z, [0,0,0,2]);
  };

  // aperioguate = ω⁴  →  coeffs [0,0,0,0,1]
  P.aperioguate = P.apgu = P.h10000 = function (y) {
    return Q._hyperopFromOrdinal(this, y, [0,0,0,0,1]);
  };
  Q.aperioguate = Q.apgu = Q.h10000 = function (x, y) {
    return Q._hyperopFromOrdinal(x, y, [0,0,0,0,1]);
  };
  P.inv_aperioguate = P.i_apgu = P.i10000 = function (z) {
    return Q._invHyperopFromOrdinal(this, z, [0,0,0,0,1]);
  };
  Q.inv_aperioguate = Q.i_apgu = Q.i10000 = function (x, z) {
    return Q._invHyperopFromOrdinal(x, z, [0,0,0,0,1]);
  };

  // ---------------------------------------------------------------------------
  // Hyperoperations from ω^ω up to ε₀
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // Hyperoperations from ω^ω up to ε₀ — README rules 1-4 with the unified
  // limit rule n{λ}b = n{λ[b]}n (the final operand is the BASE n, never b).
  // Levels ≥ ω^ω have no finite CNF coefficient row, so — except where the
  // reduced level λ[y] still fits a layer-0 ordinal row — the result is stored
  // as the compact layer marker of λ[y] (see Q._layerMarker).
  // ---------------------------------------------------------------------------

  // iter (ω^ω): (ω^ω)[y] = ω^y  →  x{ω^ω}y = x{ω^y}x
  // e.g. iter(3,5) = 3{ω^5}3 = 3{ω^4*3}3 = … = 3{ω^4*2+ω^3*2+ω^2*2+ω*2+2}3…
  //   (whole fundamental-sequence cascade → layer 0 multi-row array)
  // for y >= maxCols the ω^y row no longer fits → layer=1 marker [[r0],[1,y]]
  //   (= 10{ω^y}10), and for y > MSI the operand is unrepresentable → the
  //   ω^ω marker row [1,0,1] (= 10{ω^ω}10).
  P.iterate = P.iter = P.hww = function (y) {
    var x = this.clone();
    y = new MetaNum(y);
    if (x.isNaN() || y.isNaN()) return MetaNum.NaN.clone();
    if (x.eq(MetaNum.ONE)) return MetaNum.ONE.clone();
    if (y.eq(MetaNum.ONE)) return x.clone();
    if (y.lte(MetaNum.ZERO)) return MetaNum.NaN.clone();

    // iterate(x,y) = x{ω^ω}y. Rule 3 with the fundamental sequence
    // (ω^ω)[y] = ω^y:  x{ω^ω}y = x{ω^y}x — final operand is the base x.
    var yc = metaFiniteCount(y);
    if (yc === Math.floor(yc) && yc <= MAX_SAFE_INTEGER) {
      var m = Math.max(2, Math.floor(yc));
      if (m < MetaNum.maxCols) {
        // ω^y is a layer-0 ordinal (coeffs with 1 at index y): evaluate
        // x{ω^y}x through the unified rule-1..3 engine. E.g.
        // iterate(3,5) = 3{ω^5}3 = the full FS cascade (truncated when it
        // overflows the row budget).
        var coeffs = [];
        for (var ci = 0; ci < m; ci++) coeffs.push(0);
        coeffs.push(1);
        return Q._hyperopFromOrdinal(x, x, coeffs);
      }
      // y >= maxCols: ω^y needs a row longer than maxCols — store as the
      // layer-1 compact marker 10{ω^y}10, capped at MSI
      return Q._layerMarker([10], 1, [[1, m]]);
    }
    if (yc <= MAX_SAFE_INTEGER) {
      // fractional y: rule 3 takes the fundamental sequence at floor(y)
      return P.iterate.call(x, new MetaNum(Math.max(2, Math.floor(yc))));
    }
    // ordinal / out-of-range operand: y plus one ω^ω marker row
    return Q._ordinalOperandOp(y, 1, [1, 0, 1]);
  };
  Q.iterate = Q.iter = Q.hww = function (x, y) {
    return new MetaNum(x).iterate(y);
  };
  
  P.inv_iterate = P.inv_iter = P.iww = function (z) {
    var x = this.clone();
    z = new MetaNum(z);
    if (x.isNaN() || z.isNaN()) return MetaNum.NaN.clone();
    if (x.array.length >= 2) {
      // For ordinal y: find [1, 0, 1] marker and return y (the ordinal itself)
      for (var i = x.array.length - 1; i >= 1; i--) {
        var row = x.array[i];
        if (row.length >= 3 && row[1] === 0 && row[2] === 1 && row[0] === 1) {
          // This is the ordinal marker, return the ordinal y
          var result = x.clone();
          result.array.splice(i, 1);
          result.normalize();
          if (result.array.length <= 1) result.layer = 0;
          return result;
        }
      }
      // For finite y >= maxLevel (layer-1 compact): find [1, yn] and return yn
      for (var i = x.array.length - 1; i >= 1; i--) {
        var row = x.array[i];
        if (row.length === 2 && row[0] === 1 && row[1] > 0 && x.layer >= 1) {
          return new MetaNum(row[1]);
        }
      }
      // For finite y >= maxLevel: find [1, yn, 1] and return yn
      for (var i = x.array.length - 1; i >= 1; i--) {
        var row = x.array[i];
        if (row.length === 3 && row[0] === 1 && row[2] === 1 && row[1] > 0) {
          return new MetaNum(row[1]);
        }
      }
      // For finite y < maxLevel: find [1, 0, 0, ..., 0, 1] and count zeros
      for (var i = x.array.length - 1; i >= 1; i--) {
        var row = x.array[i];
        if (row.length >= 3 && row[0] === 1 && row[row.length - 1] === 1) {
          // Count zeros between first and last element
          var zeros = 0;
          for (var j = 1; j < row.length - 1; j++) {
            if (row[j] === 0) zeros++;
            else break;
          }
          if (zeros > 0) {
            return new MetaNum(zeros);
          }
        }
      }
    }
    return z;
  };
  Q.inv_iterate = Q.inv_iter = Q.iww = function (x, z) {
    return new MetaNum(x).inv_iterate(z);
  };

  // itermult (ω^ω+1): successor level — x{ω^ω+1}y = x{ω^ω} applied y-1 times
  // to x (rule 2), i.e. itmu(3,k) = 3{ω^ω}3{ω^ω}…3 with k 3's.
  //   k = 2 → x{ω^ω}x = iterate(x,x) exactly; 1 < k < 2 → x{ω^ω}(x^(k-1)).
  //   k > 2 → layer=1 marker [[k-1],[1,0,1]] = 10{ω^ω+(k-1)}10: any finite
  //     number of ω^ω applications stays strictly below ω^ω·2, so the count
  //     lives in the constant term (ω^ω + n) — monotone in k and still below
  //     cuboiter's ω^ω+ω^k.
  P.itermult = P.itmu = P.hw01 = function (y) {
    var x = this.clone();
    y = new MetaNum(y);
    if (x.isNaN() || y.isNaN()) return MetaNum.NaN.clone();
    if (x.eq(MetaNum.ONE)) return MetaNum.ONE.clone();
    if (y.eq(MetaNum.ONE)) return x.clone();
    if (y.lte(MetaNum.ZERO)) return MetaNum.NaN.clone();
    var yc = metaFiniteCount(y);
    if (yc <= MAX_SAFE_INTEGER) {
      if (yc <= 2) {
        // rule 2 with one iteration: x{ω^ω+1}k = x{ω^ω}(x^(k-1)) (x^1 = x)
        var f = y.sub(MetaNum.ONE);
        return f.eq(MetaNum.ZERO) ? x.iterate(x) : x.iterate(x.pow(f));
      }
      var n = Math.ceil(yc) - 1;                 // number of ω^ω applications
      if (n < 1) n = 1;
      if (n > MAX_SAFE_INTEGER) n = MAX_SAFE_INTEGER;
      return Q._layerMarker([n], 1, [[1, 0, 1]]);
    }
    // ordinal / out-of-range operand: y plus one ω^ω marker row
    return Q._ordinalOperandOp(y, 1, [1, 0, 1]);
  };
  Q.itermult = Q.itmu = Q.hw01 = function (x, y) {
    return new MetaNum(x).itermult(y);
  };

  P.inv_itermult = P.i_itmu = P.iw01 = function (z) {
    var x = this.clone();
    z = new MetaNum(z);
    if (x.isNaN() || z.isNaN()) return MetaNum.NaN.clone();
    // marker [[n],[1,0,1]] = 10{ω^ω+n}10: the iteration count n sits in the
    // constant term, so y = n + 1 applications of the ω^ω level.
    if (x.layer >= 1) {
      for (var i = x.array.length - 1; i >= 1; i--) {
        var row = x.array[i];
        if (row.length === 3 && row[1] === 0 && row[2] === 1 && row[0] === 1) {
          var n = Math.round(x.array[0][0] || 0);
          return new MetaNum(n + 1);
        }
      }
    }
    if (x.array.length >= 2) {
      var result = x.clone();
      for (var j = result.array.length - 1; j >= 1; j--) {
        var row2 = result.array[j];
        if (row2.length >= 3 && row2[0] > 0) {
          row2[0]--;
          if (row2[0] <= 0) result.array.splice(j, 1);
          result.normalize();
          if (result.array.length <= 1) result.layer = 0;
          return result;
        }
      }
      return result;
    }
    return z;
  };
  Q.inv_itermult = Q.i_itmu = Q.iw01 = function (x, z) {
    return new MetaNum(x).inv_itermult(z);
  };

  // cuboiter (ω^ω*2): (ω^ω*2)[y] = ω^ω + ω^y  →  x{ω^ω*2}y = x{ω^ω+ω^y}x
    // for k <= MSI, cube(3,k)=3{ω^ω+ω^k}3
    // ≈10{ω^ω+ω^k}10 → layer=1, array=[[10],[1,k],[1,0,1]] (ω^k + ω^ω)
    // for k > MSI, cube(3,k)≈10{ω^ω*2}10 → layer=1, array=[[10],[2,0,1]]
  P.cuboiter = P.cube = P.hwx2 = function (y) {
    var x = this.clone();
    y = new MetaNum(y);
    if (x.isNaN() || y.isNaN()) return MetaNum.NaN.clone();
    if (x.eq(MetaNum.ONE)) return MetaNum.ONE.clone();
    if (y.eq(MetaNum.ONE)) return x.clone();
    if (y.lte(MetaNum.ZERO)) return MetaNum.NaN.clone();
    var yc = metaFiniteCount(y);
    if (yc <= MAX_SAFE_INTEGER) {
      var m = Math.max(2, Math.floor(yc));
      if (m > MAX_SAFE_INTEGER) m = MAX_SAFE_INTEGER;
      return Q._layerMarker([10], 1, [[1, m], [1, 0, 1]]);
    }
    // ordinal / out-of-range operand: y plus two ω^ω marker rows (ω^ω*2)
    return Q._ordinalOperandOp(y, 1, [2, 0, 1]);
  };
  Q.cuboiter = Q.cube = Q.hwx2 = function (x, y) {
    return new MetaNum(x).cuboiter(y);
  };

  P.inv_cuboiter = P.i_cube = P.iwx2 = function (z) {
    var x = this.clone();
    z = new MetaNum(z);
    if (x.isNaN() || z.isNaN()) return MetaNum.NaN.clone();
    if (x.array.length >= 2) {
      // standard marker [[…,1@y,…],[1,0,1]] = 10{ω^ω+ω^y}10: the ω^y term is
      // merged into r0 (index y) whenever y < maxCols, else it is the row [1,y]
      if (x.layer >= 1) {
        var r0 = x.array[0];
        for (var j = r0.length - 1; j >= 1; j--) {
          if ((r0[j] || 0) > 0) return new MetaNum(j);
        }
        for (var i = x.array.length - 1; i >= 1; i--) {
          var row = x.array[i];
          if (row.length === 2 && row[0] === 1 && row[1] > 0) {
            return new MetaNum(row[1]);
          }
        }
      }
      // For ordinal y: find [1, 0, 1] marker and return y
      for (var k = x.array.length - 1; k >= 1; k--) {
        var row2 = x.array[k];
        if (row2.length >= 3 && row2[1] === 0 && row2[2] === 1 && row2[0] === 1) {
          var result = x.clone();
          result.array.splice(k, 1);
          result.normalize();
          if (result.array.length <= 1) result.layer = 0;
          return result;
        }
      }
    }
    return z;
  };
  Q.inv_cuboiter = Q.i_cube = Q.iwx2 = function (x, z) {
    return new MetaNum(x).inv_cuboiter(z);
  };

  // expoiter (ω^(ω+1)): (ω^(ω+1))[y] = ω^ω*y  →  x{ω^(ω+1)}y = x{ω^ω*y}x
    // for k <= MSI, expo(3,k)=3{ω^ω*k}3
    // ≈10{ω^ω*k}10 → layer=1, array=[[10],[k,0,1]]
    // for k > MSI, expo(3,k)≈10{ω^(ω+1)}10 → layer=1, array=[[10],[1,1,1]]
  P.expoiter = P.expo = P.hwa1 = function (y) {
    var x = this.clone();
    y = new MetaNum(y);
    if (x.isNaN() || y.isNaN()) return MetaNum.NaN.clone();
    if (x.eq(MetaNum.ONE)) return MetaNum.ONE.clone();
    if (y.eq(MetaNum.ONE)) return x.clone();
    if (y.lte(MetaNum.ZERO)) return MetaNum.NaN.clone();
    var yc = metaFiniteCount(y);
    if (yc <= MAX_SAFE_INTEGER) {
      var m = Math.max(2, Math.floor(yc));
      if (m > MAX_SAFE_INTEGER) m = MAX_SAFE_INTEGER;
      return Q._layerMarker([10], 1, [[m, 0, 1]]);
    }
    // ordinal / out-of-range operand: y plus one ω^(ω+1) marker row
    return Q._ordinalOperandOp(y, 1, [1, 1, 1]);
  };
  Q.expoiter = Q.expo = Q.hwa1 = function (x, y) {
    return new MetaNum(x).expoiter(y);
  };

  P.inv_expoiter = P.i_expo = P.iwa1 = function (z) {
    var x = this.clone();
    z = new MetaNum(z);
    if (x.isNaN() || z.isNaN()) return MetaNum.NaN.clone();
    if (x.array.length >= 2) {
      // marker [y,0,1] = 10{ω^ω·y}10 → the count carries y
      for (var i = x.array.length - 1; i >= 1; i--) {
        var row = x.array[i];
        if (row.length === 3 && row[1] === 0 && row[2] === 1 && row[0] > 0) {
          return new MetaNum(row[0]);
        }
      }
      // For ordinal y: find [1, 0, 1] marker and return y
      for (var k = x.array.length - 1; k >= 1; k--) {
        var row2 = x.array[k];
        if (row2.length >= 3 && row2[1] === 0 && row2[2] === 1 && row2[0] === 1) {
          var result = x.clone();
          result.array.splice(k, 1);
          result.normalize();
          if (result.array.length <= 1) result.layer = 0;
          return result;
        }
      }
    }
    return z;
  };
  Q.inv_expoiter = Q.i_expo = Q.iwa1 = function (x, z) {
    return new MetaNum(x).inv_expoiter(z);
  };

  // trioterate (ω^(ω*2)): (ω^(ω*2))[y] = ω^(ω+y)  →  x{ω^(ω*2)}y = x{ω^(ω+y)}x
    // for k <= MSI, tria(3,k)=3{ω^(ω+k)}3
    // ≈10{ω^(ω+k)}10 → layer=1, array=[[10],[1,k,1]] (ord = ω+k)
    // for k > MSI, tria(3,k)≈10{ω^(ω*2)}10 → layer=1, array=[[10],[1,0,2]]
  P.trioterate = P.tria = P.hwm2 = function (y) {
    var x = this.clone();
    y = new MetaNum(y);
    if (x.isNaN() || y.isNaN()) return MetaNum.NaN.clone();
    if (x.eq(MetaNum.ONE)) return MetaNum.ONE.clone();
    if (y.eq(MetaNum.ONE)) return x.clone();
    if (y.lte(MetaNum.ZERO)) return MetaNum.NaN.clone();
    var yc = metaFiniteCount(y);
    if (yc <= MAX_SAFE_INTEGER) {
      var m = Math.max(2, Math.floor(yc));
      if (m > MAX_SAFE_INTEGER) m = MAX_SAFE_INTEGER;
      return Q._layerMarker([10], 1, [[1, m, 1]]);
    }
    // ordinal / out-of-range operand: y plus one ω^(ω*2) marker row
    return Q._ordinalOperandOp(y, 1, [1, 0, 2]);
  };
  Q.trioterate = Q.tria = Q.hwm2 = function (x, y) {
    return new MetaNum(x).trioterate(y);
  };

  P.inv_trioterate = P.i_tria = P.iwm2 = function (z) {
    var x = this.clone();
    z = new MetaNum(z);
    if (x.isNaN() || z.isNaN()) return MetaNum.NaN.clone();
    if (x.array.length >= 2) {
      // For ordinal y: find [1, 0, 1] marker and return y
      for (var i = x.array.length - 1; i >= 1; i--) {
        var row = x.array[i];
        if (row.length >= 3 && row[1] === 0 && row[2] === 1 && row[0] === 1) {
          var result = x.clone();
          result.array.splice(i, 1);
          result.normalize();
          if (result.array.length <= 1) result.layer = 0;
          return result;
        }
      }
      // For finite y: find [1, yn, 1] and return yn
      for (var i = x.array.length - 1; i >= 1; i--) {
        var row = x.array[i];
        if (row.length === 3 && row[0] === 1 && row[2] === 1 && row[1] > 0) {
          return new MetaNum(row[1]);
        }
      }
    }
    return z;
  };
  Q.inv_trioterate = Q.i_tria = Q.iwm2 = function (x, z) {
    return new MetaNum(x).inv_trioterate(z);
  };

  // trixxate (ω^(ω^2)): (ω^(ω^2))[y] = ω^(ω*y)  →  x{ω^(ω^2)}y = x{ω^(ω*y)}x
    // for k <= MSI, trix(3,k)=3{ω^(ω*k)}3
    // ≈10{ω^(ω*k)}10 → layer=2, array=[[10],[k,1]] (bracket = ω*k, ω^bracket)
    // for k > MSI, trix(3,k)≈10{ω^(ω^2)}10 → layer=2, array=[[10],[1,2]]
  P.trixxate = P.trix = P.hwp2 = function (y) {
    var x = this.clone();
    y = new MetaNum(y);
    if (x.isNaN() || y.isNaN()) return MetaNum.NaN.clone();
    if (x.eq(MetaNum.ONE)) return MetaNum.ONE.clone();
    if (y.eq(MetaNum.ONE)) return x.clone();
    if (y.lte(MetaNum.ZERO)) return MetaNum.NaN.clone();
    var yc = metaFiniteCount(y);
    if (yc <= MAX_SAFE_INTEGER) {
      var m = Math.max(2, Math.floor(yc));
      if (m > MAX_SAFE_INTEGER) m = MAX_SAFE_INTEGER;
      return Q._layerMarker([10], 2, [[m, 1]]);
    }
    // ordinal / out-of-range operand: y plus one ω^(ω^2) marker row
    return Q._ordinalOperandOp(y, 2, [1, 2]);
  };
  Q.trixxate = Q.trix = Q.hwp2 = function (x, y) {
    return new MetaNum(x).trixxate(y);
  };

  P.inv_trixxate = P.i_trix = P.iwp2 = function (z) {
    var x = this.clone();
    z = new MetaNum(z);
    if (x.isNaN() || z.isNaN()) return MetaNum.NaN.clone();
    // standard marker [1,10,y] = 10{ω^(ω*y+10)}10 (layer 1) or [y,1] (layer 2)
    for (var k = x.array.length - 1; k >= 1; k--) {
      var rw = x.array[k];
      if (rw.length === 2 && rw[0] > 0 && rw[1] === 1) return new MetaNum(rw[0]);
      if (rw.length === 3 && rw[0] === 1 && rw[2] >= 2) return new MetaNum(rw[2]);
    }
    if (x.array.length >= 2) {
      // For ordinal y: find [1, 0, 1] marker and return y
      for (var i = x.array.length - 1; i >= 1; i--) {
        var row = x.array[i];
        if (row.length >= 3 && row[1] === 0 && row[2] === 1 && row[0] === 1) {
          var result = x.clone();
          result.array.splice(i, 1);
          result.normalize();
          if (result.array.length <= 1) result.layer = 0;
          return result;
        }
      }
      // For finite y: find [1, yn, 1] and return yn
      for (var i = x.array.length - 1; i >= 1; i--) {
        var row = x.array[i];
        if (row.length === 3 && row[0] === 1 && row[2] === 1 && row[1] > 0) {
          return new MetaNum(row[1]);
        }
      }
    }
    return z;
  };
  Q.inv_trixxate = Q.i_trix = Q.iwp2 = function (x, z) {
    return new MetaNum(x).inv_trixxate(z);
  };

  // aperixxate (ω^(ω^ω)): (ω^(ω^ω))[y] = ω^(ω^y)  →  x{ω^(ω^ω)}y = x{ω^(ω^y)}x
    // for k <= MSI, apix(3,k)=3{ω^(ω^k)}3
    // ≈10{ω^(ω^k)}10 → layer=3, array=[[k]] (bracket = the constant k, so the
    //   ordinal reads ω^(ω^k)); layer 3 is the ω^(ω^ω) level (README).
    // for k > MSI, apix(3,k)≈10{ω^(ω^ω)}10 → layer=3, array=[[10],[1,1]]
  P.aperixxate = P.apix = P.hwpw = function (y) {
    var x = this.clone();
    y = new MetaNum(y);
    if (x.isNaN() || y.isNaN()) return MetaNum.NaN.clone();
    if (x.eq(MetaNum.ONE)) return MetaNum.ONE.clone();
    if (y.eq(MetaNum.ONE)) return x.clone();
    if (y.lte(MetaNum.ZERO)) return MetaNum.NaN.clone();
    var yc = metaFiniteCount(y);
    if (yc <= MAX_SAFE_INTEGER) {
      var m = Math.max(2, Math.floor(yc));
      if (m > MAX_SAFE_INTEGER) m = MAX_SAFE_INTEGER;
      return Q._layerMarker([m], 3, []);
    }
    // ordinal / out-of-range operand: y plus one ω^(ω^ω) marker row
    return Q._ordinalOperandOp(y, 3, [1, 1]);
  };
  Q.aperixxate = Q.apix = Q.hwpw = function (x, y) {
    return new MetaNum(x).aperixxate(y);
  };

  P.inv_aperixxate = P.i_apix = P.iwpw = function (z) {
    var x = this.clone();
    z = new MetaNum(z);
    if (x.isNaN() || z.isNaN()) return MetaNum.NaN.clone();
    // standard marker [[10],[1,0,…,0,1]] = 10{ω^(ω^y)}10 → y+1 zeros-and-one
    // row length (layer 1), or the layer-≥2 merged form r0 = [...,1@y]
    for (var k = x.array.length - 1; k >= 1; k--) {
      var rw = x.array[k];
      if (rw.length >= 3 && rw[0] === 1 && rw[rw.length - 1] === 1) {
        var zeros = 0;
        for (var j = 1; j < rw.length - 1; j++) {
          if ((rw[j] || 0) === 0) zeros++; else break;
        }
        if (zeros === rw.length - 2 && zeros > 0) return new MetaNum(zeros);
      }
    }
    if (x.layer >= 2 && x.array.length === 1) {
      var rr = x.array[0];
      for (var j2 = rr.length - 1; j2 >= 1; j2--) {
        if ((rr[j2] || 0) > 0) return new MetaNum(j2);
      }
    }
    if (x.array.length >= 2) {
      // For ordinal y: find [1, 0, 1] marker and return y
      for (var i = x.array.length - 1; i >= 1; i--) {
        var row = x.array[i];
        if (row.length >= 3 && row[1] === 0 && row[2] === 1 && row[0] === 1) {
          var result = x.clone();
          result.array.splice(i, 1);
          result.normalize();
          if (result.array.length <= 1) result.layer = 0;
          return result;
        }
      }
      // For finite y: find [1, yn, 1] and return yn
      for (var i = x.array.length - 1; i >= 1; i--) {
        var row = x.array[i];
        if (row.length === 3 && row[0] === 1 && row[2] === 1 && row[1] > 0) {
          return new MetaNum(row[1]);
        }
      }
    }
    return z;
  };
  Q.inv_aperixxate = Q.i_apix = Q.iwpw = function (x, z) {
    return new MetaNum(x).inv_aperixxate(z);
  };

  // epsilonate (ε₀ = ω↑↑ω): ε₀[y] = ω^ω^…(y ω's)  →  x{ε₀}y = x{ω↑↑y}x
  // layer = y (README L17: layer L holds an ω-tower of height L), so
  //   epsl(3,k) ≈ 10{ω^ω^…^ω(k ω's)}10 → layer=k, array=[[10],[1,1]]
  //   (bracket = ω, (k-1) ω^'s above it → a tower of k ω's).
  //   k > MSI → the ε-tower cap: layer=MSI (the MetaNum limit).
  P.epsilonate = P.epsl = P.hepsl = function (y) {
    var x = this.clone();
    y = new MetaNum(y);
    if (x.isNaN() || y.isNaN()) return MetaNum.NaN.clone();
    if (x.eq(MetaNum.ONE)) return MetaNum.ONE.clone();
    if (y.eq(MetaNum.ONE)) return x.clone();
    if (y.lte(MetaNum.ZERO)) return MetaNum.NaN.clone();
    // ε₀[2] = ω^ω, so epsilonate(x,2) = x{ω^ω}x = iterate(x,x) exactly (the
    // same value itermult(x,2) produces — x{ε₀}2 = x{ω^ω+1}2).
    if (y.eq(2)) return x.iterate(x);
    var yc = metaFiniteCount(y);
    if (yc <= MAX_SAFE_INTEGER) {
      var m = Math.max(2, Math.floor(yc));
      if (m > MAX_SAFE_INTEGER) m = MAX_SAFE_INTEGER;
      return Q._layerMarker([10], m, [[1, 1]]);
    }
    // ordinal / out-of-range operand: ε₀ caps the library → the MSI ω-tower
    return Q._layerMarker([10], MAX_SAFE_INTEGER, [[1, 1]]);
  };
  Q.epsilonate = Q.epsl = Q.hepsl = function (x, y) {
    return new MetaNum(x).epsilonate(y);
  };

  P.inv_epsilonate = P.i_epsl = P.iepsl = function (z) {
    var x = this.clone();
    z = new MetaNum(z);
    if (x.isNaN() || z.isNaN()) return MetaNum.NaN.clone();
    // standard marker: layer = y-1 with the de-layered tower row [1,10,1]
    if (x.layer >= 1) {
      for (var k = x.array.length - 1; k >= 1; k--) {
        var rw = x.array[k];
        if (rw.length === 3 && rw[0] === 1 && rw[2] === 1 && (rw[1] || 0) >= 2) {
          return new MetaNum(x.layer + 1);
        }
      }
    }
    if (x.array.length >= 2) {
      // For ordinal y: find [1, 0, 1] marker and return y
      for (var i = x.array.length - 1; i >= 1; i--) {
        var row = x.array[i];
        if (row.length >= 3 && row[1] === 0 && row[2] === 1 && row[0] === 1) {
          var result = x.clone();
          result.array.splice(i, 1);
          result.normalize();
          if (result.array.length <= 1) result.layer = 0;
          return result;
        }
      }
      // For finite y: find [1, yn, 1] and return yn
      for (var i = x.array.length - 1; i >= 1; i--) {
        var row = x.array[i];
        if (row.length === 3 && row[0] === 1 && row[2] === 1 && row[1] > 0) {
          return new MetaNum(row[1]);
        }
      }
    }
    return z;
  };
  Q.inv_epsilonate = Q.i_epsl = Q.iepsl = function (x, z) {
    return new MetaNum(x).inv_epsilonate(z);
  };


  P.choose = function (other) {
    var x = this.clone();
    other = new MetaNum(other);
    if (x.isNaN() || other.isNaN()) return MetaNum.NaN.clone();
    if (x.sign === -1 || x.sign === -2 || other.sign === -1 || other.sign === -2) return MetaNum.ZERO.clone();
    if (other.eq(MetaNum.ZERO) || x.eq(other)) return MetaNum.ONE.clone();
    if (x.lt(other)) return MetaNum.ZERO.clone();
    if (isSimple(x) && isSimple(other) && Number.isInteger(x.array[0][0]) && Number.isInteger(other.array[0][0]) &&
        x.array[0][0] >= 0 && other.array[0][0] >= 0 && x.array[0][0] <= 1000 && other.array[0][0] <= 1000) {
      var n = x.array[0][0];
      var k = other.array[0][0];
      if (k > n - k) k = n - k;
      var result = 1;
      for (var i = 0; i < k; i++) result = result * (n - i) / (i + 1);
      return new MetaNum(result);
    }
    return x.fact().div(other.fact().mul(x.sub(other).fact()));
  };
  Q.choose = function (x, y) {
    return new MetaNum(x).choose(y);
  };

  P.toNumber = function () {
    if (this.sign === -1) return -this.abs().toNumber();
    if (this.sign ===  2) return 1 / this.rec().toNumber();
    if (this.sign === -2) return -1 / this.rec().abs().toNumber();
    if (this.isNaN()) return NaN;
    if (this.isInfinite()) return Infinity;
    if (isSmall(this)) {
      // Small value: very close to 0
      if (this.layer > 0) return 0;
      if (this.array.length > 1) return 0;
      var r0 = this.array[0];
      if (r0.length === 1) {
        // Simple small value: 1/r0[0]
        return 1 / r0[0];
      }
      return 0;
    }
    if (this.layer > 0) return Infinity;
    if (this.array.length > 1) return Infinity;
    var r0 = this.array[0];
    if (r0.length === 1) return r0[0];
    if (r0.length === 2 && r0[1] == 1 && r0[0] < 309) return Math.pow(10,r0[0]);
    return Infinity;
  };
  Q.toNumber = function (x) {
    return new MetaNum(x).toNumber();
  };

  P.valueOf = function () {
    return this.toString();
  };

  P.toString = function () {
    function formatCount(pattern, count) {
      return count >= 4 ? pattern + "^" + count : pattern.repeat(count);
    }
    function formatFiniteOps(r0) {
      // Find the highest level
      var highest = -1;
      for (var i = r0.length - 1; i >= 1; i--) {
        if (r0[i] > 0) { highest = i; break; }
      }
      if (highest === -1) return "";

      // If highest level is 23+, use normalized Aa notation
      if (highest >= 23) {
        var coeff = r0[highest];
        var pow9 = 9;
        for (var i = highest - 1; i >= 1; i--) {
          coeff += (r0[i] || 0) / pow9;
          pow9 *= 9;
        }
        // Carry: if coeff >= 9, move to next level
        var level = highest;
        while (coeff >= 9) {
          coeff /= 9;
          level++;
        }
        // Format coefficient
        var coeffStr;
        if (Math.abs(coeff - Math.round(coeff)) < 1e-12 && Math.round(coeff) <= Number.MAX_SAFE_INTEGER) {
          coeffStr = String(Math.round(coeff));
        } else {
          coeffStr = decimalPlaces(coeff, 8);
        }
        return coeffStr + "Aa" + level;
      }

      // Letter notation for levels <= 22
      var parts = [];
      for (var i = highest; i >= 1; i--) {
        if (r0[i] > 0) {
          var letter = String.fromCharCode(68 + i);
          var token = formatCount(letter, r0[i]);
          parts.push(token);
        }
      }
      if (parts.length === 0) return "";
      var hasPower = false;
      for (var j = 0; j < parts.length; j++) {
        if (parts[j].indexOf("^") !== -1) { hasPower = true; break; }
      }
      var sep = hasPower ? " " : "";
      return parts.join(sep) + (hasPower ? " " : "");
    }
    // Helper: format a MetaNum as scientific notation (AeB)
    function formatExponent(num) {
      if (isSimple(num)) {
        var val = num.toNumber();
        if (isFinite(val) && val !== 0) {
          return val.toExponential(6).replace(/\+/g, '');
        }
      }
      if (num.layer === 0 && num.array.length === 1) {
        var r0 = num.array[0];
        if (r0.length === 2) {
          // E notation: array is [mantissa, 1], value = 10^mantissa
          var m = r0[0];
          if (Number.isInteger(m)) {
            return "1E" + m;
          }
          var mant = Math.pow(10, m % 1);
          var exp = Math.floor(m);
          return mant.toPrecision(6).replace(/0+$/, '').replace(/\.$/, '') + "E" + exp;
        }
      }
      // Fallback: use native toString
      return num.toString();
    }
    if (this.isNaN()) return "NaN";
    if (this.isInfinite()) return this.sign === -1 || this.sign === -2 ? "-Infinity" : "Infinity";

    if (this.eq(MetaNum.ZERO)) return "0";

    if (this.sign === -1 || this.sign === -2) return "-" + this.abs().toString();

    if (isSmall(this)) {
      // Three tiers of small value display
      var recip = this.clone();
      recip.sign = 1;  // Get the reciprocal (large number)
      var mag = recip.log10();  // log10(reciprocal) = magnitude exponent
      var maxSf = new MetaNum(MAX_SAFE_INTEGER);
      var eMaxSf = MetaNum.pow(MetaNum.TEN, maxSf);
      
      // Tier 1: |x| > 1e-MAX_SAFE_INTEGER → -log10(|x|) < MAX_SAFE_INTEGER → mag < MAX_SAFE_INTEGER
      if (mag.lt(maxSf)) {
        var expVal = mag.toNumber();
        if (Number.isFinite(expVal)) {
          if (Number.isInteger(expVal)) {
            return "1E-" + String(Math.round(expVal));
          }
          // Non-integer: normalize so mantissa is in [1, 10)
          var frac = expVal - Math.floor(expVal);
          var mantissa = Math.pow(10, 1 - frac);
          var intExp = Math.floor(expVal) + 1;
          var mantStr = mantissa.toPrecision(6).replace(/0+$/, '').replace(/\.$/, '');
          return mantStr + "E-" + intExp;
        }
      }
      
      // Tier 2: MAX_SAFE_INTEGER ≤ mag < 10^MAX_SAFE_INTEGER
      if (!mag.isInfinite() && mag.gte(maxSf) && mag.lt(eMaxSf)) {
        // Format mag in scientific notation for the "e-AeB" format
        var expStr = formatExponent(mag);
        return "E-" + expStr;
      }
      
      // Tier 3: mag ≥ 10^MAX_SAFE_INTEGER → display as reciprocal
      if (recip.layer === 0 && recip.array.length === 1 && recip.array[0].length === 1) {
        return recip.array[0][0] + "⁻¹";
      }
      return recip.toString() + "⁻¹";
    }

    if (this.layer > 0) {
      var LAYER_SYMBOLS = {1: '!', 2: '@', 3: '#', 4: '$', 5: '%', 6: '&', 7: '~', 8: '<', 9: '>', 10: '?'};
      var sym = this.layer <= 10 ? LAYER_SYMBOLS[this.layer] : null;
      
      // Layer >= 11: use {m}ε{n} format
      if (this.layer >= 11) {
        var epsVal;
        var epsIsSpecial = false;
        
        // Check for special case: r0 stores ordinal level directly [coeff, m] with 99 <= m <= MAX_SAFE_INTEGER
        if (this.array.length === 1 && this.array[0].length === 2 &&
            this.array[0][1] >= 99 && this.array[0][1] <= MAX_SAFE_INTEGER) {
          epsVal = this.array[0][1];
          epsIsSpecial = true;
        } else if (this.array.length >= 2) {
          // Normal case: ordinal level from last row structure
          // The ε value is the ordinal exponent (number of ordinal params = lastRow.length - 2)
          var lastRow = this.array[this.array.length - 1];
          epsVal = lastRow.length - 2;
        } else {
          epsVal = this.array[0][0] || 1;
        }
        
        if (epsIsSpecial) {
          return "{" + epsVal + "}\u03B5{" + this.layer + "}";
        }
        // Normal case: bare format mεn for simple values
        var epsStr;
        if (Number.isInteger(epsVal) && epsVal >= 1 && epsVal <= 1e15) {
          epsStr = String(epsVal);
        } else {
          epsStr = "{" + epsVal + "}";
        }
        // If there's more structure beyond the simple ε format, include array notation
        if (this.array.length > 2 || (this.array.length === 2 && this.array[0].length > 1)) {
          epsStr += " [" + this.array[0].join(",") + "]";
          for (var i = 1; i < this.array.length - 1; i++) {
            epsStr += " [" + this.array[i].join(",") + "]";
          }
        }
        return epsStr + "\u03B5" + this.layer;
      }
      
      // Layers 1-10: check for special ε compact format first
      // Special case: r0 stores ordinal level directly [coeff, m] with 99 <= m <= MAX_SAFE_INTEGER
      if (sym && this.array.length === 1 && this.array[0].length === 2 &&
          this.array[0][1] >= 99 && this.array[0][1] <= Number.MAX_SAFE_INTEGER) {
        return "{" + this.array[0][1] + "}\u03B5{" + (this.layer - 1) + "}";
      }

      // Layers 1-10: check for mεn format (ω^ε representation)
      if (sym && this.array.length === 2 && this.array[0].length === 1 && this.array[0][0] === 10) {
        var lastRow = this.array[1];
        // Check if last row is [1, 0_repeated_m, 1] pattern
        if (lastRow[0] === 1 && lastRow[lastRow.length - 1] === 1) {
          var allZeros = true;
          for (var ei = 1; ei < lastRow.length - 1; ei++) {
            if (lastRow[ei] !== 0) { allZeros = false; break; }
          }
          if (allZeros) {
            var m = lastRow.length - 2; // number of zeros
            return m + "\u03B5" + this.layer;
          }
        }
      }

      // Layers 1-10: try letter notation
      if (sym && this.array.length >= 2) {
        var ordTokens = [];
        var validLetter = true;
        
        for (var i = this.array.length - 1; i >= 1; i--) {
          var row = this.array[i];
          if (row.length < 3) { validLetter = false; break; }
          var diag = row[row.length - 1];
          var countVals = row[0];
          var vals = row.slice(1, row.length - 1);
          var n = vals.length;
          
          if (diag < 1 || diag > 26) { validLetter = false; break; }
          
          var U = String.fromCharCode(64 + diag);
          var allZero = true;
          var anyLarge = false;
          var largeVal = -1;
          for (var j = 0; j < n; j++) {
            if (vals[j] > 25) { anyLarge = true; largeVal = vals[j]; }
            if (vals[j] !== 0) allZero = false;
          }
          
          var token;
          if (allZero) {
            token = n > 26 ? U + "a" + n : U + "a".repeat(n);
          } else if (anyLarge && n === 1) {
            // Compact format: single large value
            token = U + "a" + largeVal;
          } else {
            var lower = "";
            var ok = true;
            for (var j = n - 1; j >= 0; j--) {
              if (vals[j] > 25) { ok = false; break; }
              lower += String.fromCharCode(97 + vals[j]);
            }
            if (!ok) { validLetter = false; break; }
            token = U + lower;
          }
          if (countVals > 1) {
            token = countVals >= 4 ? token + "^" + countVals : token.repeat(countVals);
          }
          ordTokens.push(token);
        }
        
        if (validLetter && ordTokens.length > 0) {
          var finOps = formatFiniteOps(this.array[0]);
          var hasAa = finOps && finOps.indexOf("Aa") !== -1;
          var baseStr = "";
          if (!hasAa) {
            if (this.array[0].length === 1) {
              baseStr = String(this.array[0][0]);
            } else if (finOps !== "" && this.array[0].length >= 1 && this.array[0][0] > 0) {
              baseStr = String(this.array[0][0]);
            }
          }
          // Always include layer symbol for layers 1-10
          if (this.layer >= 1 && finOps === "" && baseStr !== "") {
            return sym + ordTokens.join("") + baseStr;
          }
          return sym + ordTokens.join("") + (finOps ? finOps : "") + baseStr;
        }
      }
      
      // Ultimate fallback: array notation with layer symbol
      var s = (this.layer <= 10 ? LAYER_SYMBOLS[this.layer] || ("!".repeat(this.layer)) : "E" + this.layer) + " ";
      for (var i = 0; i < this.array.length; i++) {
        if (i > 0) s += " ";
        s += "[" + this.array[i].join(",") + "]";
      }
      return s;
    }

    if (this.array.length <= 1) {
      var r0 = this.array[0];

      if (r0.length === 1) return String(r0[0]);

      if (r0.length >= 24) {
        // Find highest level with non-zero value
        var highest = -1;
        for (var j = r0.length - 1; j >= 1; j--) {
          if (r0[j] && r0[j] !== 0) { highest = j; break; }
        }
        if (highest >= 23) {
          // Normalized Aa notation: absorb all lower levels into coefficient
          var coeff = r0[highest];
          var pow9 = 9;
          for (var j = highest - 1; j >= 1; j--) {
            coeff += (r0[j] || 0) / pow9;
            pow9 *= 9;
          }
          var level = highest;
          while (coeff >= 9) {
            coeff /= 9;
            level++;
          }
          var coeffStr;
          if (Math.abs(coeff - Math.round(coeff)) < 1e-12 && Math.round(coeff) <= Number.MAX_SAFE_INTEGER) {
            coeffStr = String(Math.round(coeff));
          } else {
            coeffStr = decimalPlaces(coeff, 8);
          }
          return coeffStr + "Aa" + level;
        }
        // Fallback: letter notation for all levels
        var result = "";
        for (var j = r0.length - 1; j >= 1; j--) {
          if (!r0[j] || r0[j] === 0) continue;
          var letter = String.fromCharCode(68 + j);
          if (r0[j] > 3) {
            result += letter + "^" + r0[j] + " ";
          } else {
            result += letter.repeat(r0[j]);
          }
        }
        result += decimalPlaces(r0[0], 6);
        return result;
      }

      var result = "";
      for (var j = r0.length - 1; j >= 1; j--) {
        if (!r0[j] || r0[j] === 0) continue;
        if (j <= 22) {
          var letter = String.fromCharCode(68 + j);
          if (r0[j] > 3) {
            result += letter + "^" + r0[j] + " ";
          } else {
            result += letter.repeat(r0[j]);
          }
        } else {
          result += r0[j] + "Aa" + j + " ";
        }
      }
      result += decimalPlaces(r0[0], 6);
      return result;
    }

    // Layer 0 with ordinal rows: try letter notation
    if (this.array.length > 1) {
      // Check if all ordinal rows are 2-element [count, value] (h10 ω-level format)
      var allTwoElement = true;
      for (var i = 1; i < this.array.length; i++) {
        if (this.array[i].length !== 2) { allTwoElement = false; break; }
      }
      if (allTwoElement) {
        // Check for truncation pattern: array[0] = [10] placeholder
        var isTruncated = this.array[0].length === 1 && this.array[0][0] === 10;
        if (isTruncated) {
          // Show only the last row: count Aa value
          var lastRow = this.array[this.array.length - 1];
          return lastRow[0] + "Aa" + lastRow[1];
        }
        // Non-truncated: show all rows as space-separated "countAalevel"
        // tokens (count always included, so the parser can re-split them)
        var tokens = [];
        for (var i = this.array.length - 1; i >= 1; i--) {
          var row = this.array[i];
          tokens.push(row[0] + "Aa" + row[1]);
        }
        var finOps = formatFiniteOps(this.array[0]);
        var hasAa = finOps && finOps.indexOf("Aa") !== -1;
        var baseNum = hasAa ? "" : decimalPlaces(this.array[0][0], 6);
        var tokStr = tokens.join(" ");
        if (tokStr !== "" && (finOps !== "" || baseNum !== "")) tokStr += " ";
        return tokStr + (finOps ? finOps : "") + baseNum;
      }
      
      var ordTokens = [];
      var validLetter = true;
      var useExclaim = false;
      
      for (var i = this.array.length - 1; i >= 1; i--) {
        var row = this.array[i];
        if (row.length < 3) { validLetter = false; break; }
        var diag = row[row.length - 1];
        var countVals = row[0];
        var vals = row.slice(1, row.length - 1);
        var n = vals.length;
        
        if (diag < 1 || diag > 26) { validLetter = false; break; }
        
        var U = String.fromCharCode(64 + diag);
        var allZero = true;
        var anyLarge = false;
        for (var j = 0; j < n; j++) {
          if (vals[j] > 25) { anyLarge = true; }
          if (vals[j] !== 0) allZero = false;
        }
        if (anyLarge) { validLetter = false; break; }
        if (!validLetter) break;
        
        var token;
        if (allZero) {
          if (n > 26) {
            useExclaim = true;
            token = U + "a" + n;
          } else {
            token = U + "a".repeat(n);
          }
        } else {
          var lower = "";
          for (var j = n - 1; j >= 0; j--) {
            lower += String.fromCharCode(97 + vals[j]);
          }
          token = U + lower;
        }
        if (countVals > 1) {
          token = countVals >= 4 ? token + "^" + countVals : token.repeat(countVals);
        }
        ordTokens.push(token);
      }
      
      if (validLetter) {
        var finOps = formatFiniteOps(this.array[0]);
        var hasAa = finOps && finOps.indexOf("Aa") !== -1;
        var prefix = useExclaim ? "!" : "";
        var baseNum = (useExclaim || hasAa) ? "" : decimalPlaces(this.array[0][0], 6);
        return prefix + ordTokens.join("") + (finOps ? finOps : "") + baseNum;
      }
    }

    if (this.array.length === 2 &&
        this.array[0].length === 1 && this.array[0][0] === 10 &&
        this.array[1].length === 2) {
      return this.array[1][0] + "Aa" + this.array[1][1];
    }

    var multiResult = "";
    for (var i = 0; i < this.array.length; i++) {
      if (i > 0) multiResult += " ";
      multiResult += "[" + this.array[i].join(",") + "]";
    }
    return multiResult;
  };

  P.toJSON = function () {
    if (MetaNum.serializeMode === 0) {
      return {
        sign: this.sign,
        array: deepCloneArray(this.array),
        layer: this.layer
      };
    } else {
      return this.toString();
    }
  };

  P.toStringWithDecimalPlaces = function (places) {
    if (this.sign === -1 || this.sign === -2) return "-" + this.abs().toStringWithDecimalPlaces(places);
    if (this.isNaN()) return "NaN";
    if (this.isInfinite()) return "Infinity";
    if (isSimple(this)) {
      var v = decimalPlaces(this.array[0][0], places);
      if (Number.isFinite(v)) return v.toString();
    }
    return this.toString();
  };

  // dlsdl letter-notation formatting (format-metanum.js, README "Format"
  // section). The module is resolved lazily to avoid a circular require:
  // format-metanum reads the MetaNum constructor from the global scope.
  //   MetaNum("G600").format()      → "1.000G600"
  //   MetaNum.hardy(4166).format()  → "2.397G5"
  P.format = function (precision, small) {
    var formatter = null;
    if (typeof require == 'function') {
      try { formatter = require('./format-metanum.js').format; } catch (e) { formatter = null; }
    }
    return format(this, precision, small);
  };

  P.toExponential = function (places) {
    if (this.sign === -1 || this.sign === -2) return "-" + this.abs().toExponential(places);
    if (this.isNaN()) return "NaN";
    if (this.isInfinite()) return "Infinity";
    if (isSimple(this)) return this.toNumber().toExponential(places);
    return this.toString();
  };

  P.toFixed = function (places) {
    if (this.sign === -1 || this.sign === -2) return "-" + this.abs().toFixed(places);
    if (this.isNaN()) return "NaN";
    if (this.isInfinite()) return "Infinity";
    if (isSimple(this)) return this.toNumber().toFixed(places);
    return this.toString();
  };

  P.toPrecision = function (places) {
    if (this.sign === -1 || this.sign === -2) return "-" + this.abs().toPrecision(places);
    if (this.isNaN()) return "NaN";
    if (this.isInfinite()) return "Infinity";
    if (isSimple(this)) return this.toNumber().toPrecision(places);
    return this.toString();
  };

  P.toHyperE = function () {
    if (this.sign === -1 || this.sign === -2) return "-" + this.abs().toHyperE();
    if (this.isNaN()) return "NaN";
    if (this.isInfinite()) return "Infinity";
    if (isSimple(this)) {
      var v = this.array[0][0];
      if (v < 10) return String(v);
      return "E" + Math.log10(v).toFixed(6);
    }
    if (this.layer > 0) return "E" + this.layer + "#" + this.toString();
    if (this.array.length === 1 && this.array[0].length >= 2) {
      var s = "E";
      for (var i = 1; i < this.array[0].length; i++) s += "#";
      s += String(this.array[0][0]);
      return s;
    }
    return this.toString();
  };

  Q.fromNumber = function (input) {
    if (typeof input !== "number") throw Error(invalidArgument + "Expected Number");
    var x = new MetaNum();
    x.array = [[Math.abs(input)]];
    x.sign = input < 0 ? -1 : 1;
    x.layer = 0;
    return x.normalize();
  };

  Q.fromArray = function (array, sign, layer) {
    if (!Array.isArray(array)) throw Error(invalidArgument + "Expected Array");
    var x = new MetaNum();
    if (array.length > 0 && !Array.isArray(array[0])) {
      x.array = [array.slice(0)];
    } else {
      x.array = deepCloneArray(array);
    }
    if (typeof sign === "number") {
      if (sign === -2 || sign === 2) x.sign = sign;
      else x.sign = sign < 0 ? -1 : 1;
    } else x.sign = 1;
    if (typeof layer === "number" && isFinite(layer) && layer >= 0) x.layer = Math.floor(layer);
    else x.layer = 0;
    return x.normalize();
  };

  Q.fromObject = function (input) {
    if (typeof input !== "object") throw Error(invalidArgument + "Expected Object");
    if (input === null) return MetaNum.ZERO.clone();
    if (Array.isArray(input)) return MetaNum.fromArray(input);
    if (input instanceof MetaNum) return new MetaNum(input);
    if (!(input.array instanceof Array)) throw Error(invalidArgument + "Expected that property 'array' exists");
    var x = new MetaNum();
    x.array = deepCloneArray(input.array);
    x.sign = typeof input.sign === "number" ?
      (input.sign === 2 || input.sign === -2 ? input.sign : (input.sign < 0 ? -1 : 1)) : 1;
    x.layer = typeof input.layer === "number" && isFinite(input.layer) && input.layer >= 0 ? Math.floor(input.layer) : 0;
    return x.normalize();
  };

  Q.fromJSON = function (input) {
    if (typeof input === "object") return MetaNum.fromObject(input);
    if (typeof input !== "string") throw Error(invalidArgument + "Expected String");
    var parsedObject;
    try {
      parsedObject = JSON.parse(input);
    } catch (e) {
      throw Error(invalidArgument + "Invalid JSON string");
    }
    return MetaNum.fromObject(parsedObject);
  };

  Q.hyper = function (n, a, b) {
    if (n === undefined) n = 2;
    n = new MetaNum(n);
    a = new MetaNum(a);
    b = new MetaNum(b);
    if (n.isNaN() || a.isNaN() || b.isNaN()) return MetaNum.NaN.clone();
    if (n.eq(MetaNum.ZERO)) return b.add(MetaNum.ONE);
    if (n.eq(MetaNum.ONE)) return a.add(b);
    if (n.eq(2)) return a.mul(b);
    if (n.eq(3)) return a.pow(b);
    if (n.eq(4)) return a.tetr(b);
    if (n.eq(5)) return a.pent(b);
    return MetaNum.arrow(a, n.sub(2), b);
  };

  Q.affordGeometricSeries = function (resourcesAvailable, priceStart, priceRatio, currentOwned) {
    resourcesAvailable = new MetaNum(resourcesAvailable);
    priceStart = new MetaNum(priceStart);
    priceRatio = new MetaNum(priceRatio);
    currentOwned = new MetaNum(currentOwned);
    return priceStart.eq(new MetaNum(1))
      ? resourcesAvailable.add(new MetaNum(1)).floor()
      : MetaNum.ONE;
  };

  Q.affordArithmeticSeries = function (resourcesAvailable, priceStart, priceAdd, currentOwned) {
    resourcesAvailable = new MetaNum(resourcesAvailable);
    priceStart = new MetaNum(priceStart);
    priceAdd = new MetaNum(priceAdd);
    currentOwned = new MetaNum(currentOwned);
    if (priceAdd.eq(MetaNum.ZERO)) return resourcesAvailable.div(priceStart).floor();
    var a = priceAdd;
    var b = priceStart.mul(2).sub(priceAdd);
    var c = priceStart.sub(priceAdd).sub(resourcesAvailable.mul(2)).add(a);
    return b.neg().add(b.pow(2).sub(a.mul(c).mul(4)).sqrt()).div(a.mul(2)).floor();
  };

  Q.sumGeometricSeries = function (numItems, start, ratio, numItemsStart) {
    if (numItemsStart === undefined) numItemsStart = 0;
    numItems = new MetaNum(numItems);
    start = new MetaNum(start);
    ratio = new MetaNum(ratio);
    numItemsStart = new MetaNum(numItemsStart);
    if (numItems.lt(numItemsStart)) return MetaNum.ZERO.clone();
    return start.mul(MetaNum.ONE.sub(ratio.pow(numItems.sub(numItemsStart).add(MetaNum.ONE))))
      .div(MetaNum.ONE.sub(ratio));
  };

  Q.sumArithmeticSeries = function (numItems, start, add, numItemsStart) {
    if (numItemsStart === undefined) numItemsStart = 0;
    numItems = new MetaNum(numItems);
    start = new MetaNum(start);
    add = new MetaNum(add);
    numItemsStart = new MetaNum(numItemsStart);
    if (numItems.lt(numItemsStart)) return MetaNum.ZERO.clone();
    var n = numItems.sub(numItemsStart).add(MetaNum.ONE);
    var last = start.add(add.mul(n.sub(MetaNum.ONE)));
    return n.mul(start.add(last)).div(new MetaNum(2));
  };

  Q.choose = function (x, y) {
    return new MetaNum(x).choose(y);
  };

  Q.fromBigInt = function (input) {
    if (typeof BigInt === "undefined") throw Error(metaNumError + "BigInt is not supported in current environment");
    if (typeof input === "bigint") {
      if (input >= BigInt(0) && input <= BigInt(MAX_SAFE_INTEGER)) {
        return new MetaNum(Number(input));
      }
      var inputStr = input.toString();
      var inputLen = inputStr.length;
      if (inputLen <= LONG_STRING_MIN_LENGTH) {
        return new MetaNum(Number(inputStr));
      }
      var x = new MetaNum();
      x.array = [[inputLen - 1 + log10LongString(inputStr)]];
      x.sign = 1;
      x.layer = 0;
      return x.normalize();
    } else {
      throw Error(invalidArgument + "Expected BigInt");
    }
  };

  Q.fromHyperE = function (input) {
    if (typeof input !== "string") throw Error(invalidArgument + "Expected String");
    var s = input.trim();
    var negateIt = false;
    if (s[0] === "-") {
      negateIt = true;
      s = s.substring(1).trim();
    }
    if (s === "NaN" || s === "Infinity") {
      var x = new MetaNum();
      x.array = [[s === "NaN" ? NaN : Infinity]];
      x.sign = negateIt ? -1 : 1;
      return x;
    }
    var count = 0;
    while (s[0] === "E") {
      count++;
      s = s.substring(1).trim();
      if (s[0] === "#") {
        s = s.substring(1);
      }
    }
    if (count === 0) {
      return MetaNum.fromString((negateIt ? "-" : "") + s);
    }
    var x = new MetaNum();
    if (count === 1) {
      x.array = [[Math.pow(10, Number(s))]];
    } else {
      x.array = [[Number(s)]];
      for (var i = 1; i < count; i++) x.array[0].push(i === count - 1 ? 1 : 0);
    }
    x.sign = negateIt ? -1 : 1;
    x.layer = 0;
    return x.normalize();
  };

  Q.fromString = function (input) {
    if (typeof input !== "string") throw Error(invalidArgument + "Expected String");

    try {
      var parsed = JSON.parse(input);
      if (parsed && typeof parsed === "object" && parsed.array) {
        return MetaNum.fromJSON(parsed);
      }
    } catch (e) {}

    var x = new MetaNum();
    x.array = [[0]];
    x.sign = 1;
    x.layer = 0;

    var s = input.trim();
    if (s === "" || s === "0") {
      return x;
    }

    var negateIt = false;
    if (s[0] === "-" || s[0] === "+") {
      var signMatch = s.match(/^[-\+]+/);
      var signs = signMatch[0];
      negateIt = (signs.match(/-/g) || []).length % 2 === 1;
      s = s.substring(signMatch[0].length).trim();
    }

    if (s === "NaN") {
      x.array = [[NaN]];
      return x;
    }
    if (s === "Infinity") {
      x.array = [[Infinity]];
      x.sign = negateIt ? -1 : 1;
      return x;
    }

    var layerMatch = s.match(/^\u03C9\^(\d+)\s*/);
    if (layerMatch) {
      x.layer = parseInt(layerMatch[1], 10);
      s = s.substring(layerMatch[0].length).trim();
    }

    // Parse {m}ε{n} format - new rule: layer = n, ordinal = [1, 0_repeated_m, 1], r0 defaults to 10
    // If m >= maxCols-1, row would exceed maxCols, so lift: array=[[10],[1,m]], layer=n
    var epsMatch = s.match(/^\{(\d+(?:\.\d+)?)\}\u03B5\{(\d+)\}\s*/);
    if (epsMatch) {
      var epsN = parseInt(epsMatch[2], 10);
      var epsM = Math.floor(Number(epsMatch[1]));
      s = s.substring(epsMatch[0].length).trim();
      if (epsM < 1 || epsN < 1) {
        x.array = [[0]];
        if (negateIt) x.sign = -1;
        return x;
      }
      if (epsM >= MetaNum.maxCols - 1) {
        // m >= 99: row [1, 0_m, 1] exceeds maxCols, lift one layer
        x.layer = epsN;
        x.array[0] = [10];
        x.array.push([1, epsM]);
      } else {
        x.layer = epsN;
        x.array[0] = [10];
        // Build row [1, 0_repeated_epsM, 1]
        var epsRow = [1];
        for (var ei = 0; ei < epsM; ei++) epsRow.push(0);
        epsRow.push(1);
        x.array.push(epsRow);
      }
      if (negateIt) x.sign = -1;
      // De-layer: Aa form ([*,0,1]) with small r0, reduce layer by 1
      if (x.layer > 0 && x.array.length >= 2) {
        var lastRow = x.array[x.array.length - 1];
        if (lastRow.length === 3 && lastRow[1] === 0 && lastRow[lastRow.length - 1] === 1 &&
            x.array[0].length === 1 && x.array[0][0] >= 0 && x.array[0][0] <= MetaNum.maxCols - 2) {
          var baseVal = x.array[0][0];
          lastRow = [lastRow[0]];
          for (var di = 0; di < baseVal; di++) lastRow.push(0);
          lastRow.push(1);
          x.array[x.array.length - 1] = lastRow;
          x.layer--;
        }
      }
      return x.normalize();
    }

    // Parse mεn format without braces - same rule: layer = n, ordinal = [1, 0_repeated_m, 1], r0 defaults to 10
    // If m >= maxCols-1, row would exceed maxCols, so lift: array=[[10],[1,m]], layer=n
    var epsBareMatch = s.match(/^(\d+(?:\.\d+)?)\u03B5(\d+)\s*/);
    if (epsBareMatch) {
      var epsBareN = parseInt(epsBareMatch[2], 10);
      var epsBareM = Math.floor(Number(epsBareMatch[1]));
      s = s.substring(epsBareMatch[0].length).trim();
      if (epsBareM < 1 || epsBareN < 1) {
        x.array = [[0]];
        if (negateIt) x.sign = -1;
        return x;
      }
      if (epsBareM >= MetaNum.maxCols - 1) {
        // m >= 99: row [1, 0_m, 1] exceeds maxCols, lift one layer
        x.layer = epsBareN;
        x.array[0] = [10];
        x.array.push([1, epsBareM]);
      } else {
        x.layer = epsBareN;
        x.array[0] = [10];
        // Build row [1, 0_repeated_epsBareM, 1]
        var epsBareRow = [1];
        for (var ebi = 0; ebi < epsBareM; ebi++) epsBareRow.push(0);
        epsBareRow.push(1);
        x.array.push(epsBareRow);
      }
      if (negateIt) x.sign = -1;
      // De-layer: Aa form ([*,0,1]) with small r0, reduce layer by 1
      if (x.layer > 0 && x.array.length >= 2) {
        var lastRow = x.array[x.array.length - 1];
        if (lastRow.length === 3 && lastRow[1] === 0 && lastRow[lastRow.length - 1] === 1 &&
            x.array[0].length === 1 && x.array[0][0] >= 0 && x.array[0][0] <= MetaNum.maxCols - 2) {
          var baseVal = x.array[0][0];
          lastRow = [lastRow[0]];
          for (var di = 0; di < baseVal; di++) lastRow.push(0);
          lastRow.push(1);
          x.array[x.array.length - 1] = lastRow;
          x.layer--;
        }
      }
      // Expand compact [1,m] form to full [1,0,...,0,1] form for display
      if (x.array.length >= 2) {
        var lastRow = x.array[x.array.length - 1];
        if (lastRow.length === 2 && lastRow[0] === 1) {
          var m = lastRow[1];
          var expandedRow = [1];
          for (var exi = 0; exi < m; exi++) expandedRow.push(0);
          expandedRow.push(1);
          x.array[x.array.length - 1] = expandedRow;
        }
      }
      return x.normalize();
    }

    // Parse ε{n} format (layer with no count)
    var epsSimpleMatch = s.match(/^\u03B5\{(\d+)\}\s*/);
    if (epsSimpleMatch) {
      x.layer = parseInt(epsSimpleMatch[1], 10);
      s = s.substring(epsSimpleMatch[0].length).trim();
      if (negateIt) x.sign = -1;
      return x.normalize();
    }

    // Parse layer symbol + letter pattern + {n} format
    // (simple case: just {n} after symbol, no letters)
    var symSimpleMatch = s.match(/^([!@#\$%&~<>?])\{(\d+(?:\.\d+)?)\}\s*$/);
    if (symSimpleMatch) {
      var SYMBOL_LAYERS = {'!': 1, '@': 2, '#': 3, '$': 4, '%': 5, '&': 6, '~': 7, '<': 8, '>': 9, '?': 10};
      x.layer = SYMBOL_LAYERS[symSimpleMatch[1]] || 1;
      var symSimpleVal = Number(symSimpleMatch[2]);
      if (!isNaN(symSimpleVal) && isFinite(symSimpleVal)) {
        x.array[0] = [symSimpleVal];
      }
      if (negateIt) x.sign = -1;
      return x.normalize();
    }

    // Parse symbol + full letter pattern {n} (multi-letter like !AaBa{n}, handles ^N notation)
    var symParseMatch = s.match(/^([!@#\$%&~<>?])(.*?)\{(\d+(?:\.\d+)?)\}\s*$/);
    if (symParseMatch) {
      var SYMBOL_LAYERS3 = {'!': 1, '@': 2, '#': 3, '$': 4, '%': 5, '&': 6, '~': 7, '<': 8, '>': 9, '?': 10};
      x.layer = SYMBOL_LAYERS3[symParseMatch[1]] || 1;
      var symLetters2 = symParseMatch[2].trim();
      var symBase2 = Number(symParseMatch[3]);
      
      // Parse tokens: ordinal tokens have lowercase (Aa, Abc), finite ops are single uppercase
      var symTokens2 = [];
      var symFinOps = [];  // finite ops for r0
      var symTokRegex = /([A-Z][a-z]*)(?:\^(\d+))?/g;
      var symTokM;
      while ((symTokM = symTokRegex.exec(symLetters2)) !== null) {
        var tokName = symTokM[1];
        var tokCount = symTokM[2] ? parseInt(symTokM[2], 10) : 1;
        // Single uppercase letter (no lowercase) = finite op
        if (tokName.length === 1 && tokName[0] >= 'D') {
          // Finite operations start from E (level 1 = E, level 2 = F, ...)
          var finLevel = tokName.charCodeAt(0) - 68; // 68 = 'D', E->1, F->2, ...
          if (finLevel > 0) {
            symFinOps.push({level: finLevel, count: tokCount});
          }
        } else {
          symTokens2.push({name: tokName, count: tokCount});
        }
      }
      
      if (symTokens2.length === 0) {
        x.array[0] = [symBase2];
        if (negateIt) x.sign = -1;
        return x;
      }
      
      // Group consecutive identical tokens
      var symGroups2 = [];
      for (var ti = 0; ti < symTokens2.length; ti++) {
        if (symGroups2.length > 0 && symGroups2[symGroups2.length - 1].name === symTokens2[ti].name) {
          symGroups2[symGroups2.length - 1].count += symTokens2[ti].count;
        } else {
          symGroups2.push({name: symTokens2[ti].name, count: symTokens2[ti].count});
        }
      }
      
      var symRows2 = [];
      for (var gi3 = 0; gi3 < symGroups2.length; gi3++) {
        var g3 = symGroups2[gi3];
        var gName3 = g3.name;
        var gU3 = gName3[0];
        var gUIdx3 = gU3.charCodeAt(0) - 64;
        var gLower3 = gName3.slice(1);
        var gIndices3 = [];
        for (var li3 = 0; li3 < gLower3.length; li3++) {
          gIndices3.push(gLower3.charCodeAt(li3) - 97);
        }
        var gK3 = gIndices3.length;
        var gAllZero3 = true;
        var gFirstNonZero3 = -1;
        for (var li3 = 0; li3 < gK3; li3++) {
          if (gIndices3[li3] !== 0) {
            gAllZero3 = false;
            if (gFirstNonZero3 === -1) gFirstNonZero3 = li3;
          }
        }
        var gLastIsA3 = gIndices3[gK3 - 1] === 0;
        var gRow3 = [g3.count];
        var gIsDiag3 = false;
        
        if (gAllZero3) {
          for (var li3 = 0; li3 < gK3; li3++) gRow3.push(0);
          gRow3.push(gUIdx3);
        } else if (gLastIsA3 && gFirstNonZero3 >= 0) {
          gIsDiag3 = true;
          for (var li3 = gK3 - 1; li3 >= 0; li3--) {
            gRow3.push(gIndices3[li3]);
          }
          gRow3.push(gUIdx3);
        } else {
          for (var li3 = gK3 - 1; li3 >= 0; li3--) {
            gRow3.push(gIndices3[li3]);
          }
          gRow3.push(gUIdx3);
        }
        symRows2.push({
          row: gRow3,
          isDiag: gIsDiag3,
          lowerIndices: gIndices3,
          level: gUIdx3
        });
      }
      
      symRows2.sort(function(a, b) {
        if (a.level !== b.level) return a.level - b.level;
        var maxLen = Math.max(a.lowerIndices.length, b.lowerIndices.length);
        for (var ii = 0; ii < maxLen; ii++) {
          var va = ii < a.lowerIndices.length ? a.lowerIndices[ii] : 0;
          var vb = ii < b.lowerIndices.length ? b.lowerIndices[ii] : 0;
          if (va !== vb) return va - vb;
        }
        return 0;
      });
      
      x.array = [[symBase2]];
      // Apply finite ops to r0
      for (var fi = 0; fi < symFinOps.length; fi++) {
        var fo = symFinOps[fi];
        x.array[0][fo.level] = (x.array[0][fo.level] || 0) + fo.count;
      }
      // Handle special finite ops: F and E
      // F (level 2): F^count means tetration exponent count-2
      // E (level 1): E^count means exponent count
      // Higher levels (G, H, ...) are higher hyperoperation levels
      x._oaRowData = [];
      for (var gi3 = 0; gi3 < symRows2.length; gi3++) {
        x.array.push(symRows2[gi3].row);
        x._oaRowData.push({isDiag: symRows2[gi3].isDiag});
      }
      if (negateIt) x.sign = -1;
      // De-layer: Aa form [*,0,1] with small r0, reduce layer by 1
      if (x.layer > 0 && x.array.length >= 2) {
        var lastRow = x.array[x.array.length - 1];
        if (lastRow.length === 3 && lastRow[1] === 0 && lastRow[lastRow.length - 1] === 1 &&
            x.array[0].length === 1 && x.array[0][0] >= 0 && x.array[0][0] <= MetaNum.maxCols - 2) {
          var baseVal = x.array[0][0];
          lastRow = [lastRow[0]];
          for (var di = 0; di < baseVal; di++) lastRow.push(0);
          lastRow.push(1);
          x.array[x.array.length - 1] = lastRow;
          x.layer--;
        }
      }
      return x.normalize();
    }

    var bracketPattern = /\[([^\]]*)\]/g;
    var match;
    var rowIndex = 0;

    while ((match = bracketPattern.exec(s)) !== null) {
      var nums = match[1].split(",");
      var row = [];
      for (var i = 0; i < nums.length; i++) {
        var raw = nums[i].trim();
        if (raw[0] === '[') raw = raw.substring(1);
        if (raw[raw.length - 1] === ']') raw = raw.substring(0, raw.length - 1);
        var n = Number(raw);
        if (!isNaN(n) && isFinite(n)) {
          row.push(n);
        } else {
          row.push(0);
        }
      }
      if (rowIndex === 0) {
        x.array[0] = row;
      } else {
        x.array.push(row);
      }
      rowIndex++;
      if (rowIndex >= MetaNum.maxRows) break;
    }

    if (rowIndex === 0) {
      var rem = s;

      // Parse "1/<expr>" form: reciprocal of <expr>.
      // For any <expr>, 1/<expr> is stored as sign=2 (or -2) with <expr>'s array.
      // The approximation rule (n ≈ 10^n for n > TETRATED_MAX_SAFE_INTEGER) means
      // 1/<expr> ≈ 10^-<expr> for very large <expr>, but the array stays as <expr>'s array.
      var recipSlashMatch = rem.match(/^1\/(.+)$/);
      if (recipSlashMatch) {
        var recipInnerStr = recipSlashMatch[1].trim();
        var recipInner = MetaNum.fromString(recipInnerStr);
        var recipResult = recipInner.clone();
        // Apply reciprocal: 1 ↔ 2, -1 ↔ -2
        recipResult.sign = recipResult.sign === 1 ? 2 : recipResult.sign === 2 ? 1 : recipResult.sign === -1 ? -2 : -1;
        // Apply outer negateIt: flip 1 ↔ -1, 2 ↔ -2
        if (negateIt) {
          recipResult.sign = recipResult.sign === 1 ? -1 : recipResult.sign === -1 ? 1 : recipResult.sign === 2 ? -2 : 2;
        }
        return recipResult.normalize();
      }

      // Parse "E-<expr>" form: 10^-(<expr>) = 1/(10^<expr>) = reciprocal of E(<expr>).
      // Approximation rule: when <expr> > TETRATED_MAX_SAFE_INTEGER (= 10^^MSI),
      // we have 10^<expr> ≈ <expr>, so E-<expr> ≈ 1/<expr> (no extra E level added).
      // When <expr> ≤ TETRATED_MAX_SAFE_INTEGER, we compute exactly: E-<expr> = 1/E(<expr>).
      var eDashMatch = rem.match(/^E-(.+)$/);
      if (eDashMatch) {
        var eDashInnerStr = eDashMatch[1].trim();
        var eDashInner = MetaNum.fromString(eDashInnerStr);
        // Handle negative <expr>: E-<expr> = 10^(-<expr>) = 10^(positive) = LARGE number E(abs(<expr>))
        if (eDashInner.sign < 0) {
          var absInner = eDashInner.abs();
          var ePosResult = MetaNum.pow(MetaNum.TEN, absInner);
          if (negateIt) ePosResult.sign = ePosResult.sign === 1 ? -1 : 1;
          return ePosResult.normalize();
        }
        var tetrMaxSafe = MetaNum(R.TETRATED_MAX_SAFE_INTEGER);
        var eDashResult;
        if (eDashInner.lte(tetrMaxSafe)) {
          // <expr> ≤ TETRATED_MAX_SAFE_INTEGER: compute E(<expr>) = 10^<expr> exactly,
          // then take reciprocal (sign=2 with E(<expr>)'s array).
          var eApplied = MetaNum.pow(MetaNum.TEN, eDashInner);
          eDashResult = eApplied.clone();
        } else {
          // <expr> > TETRATED_MAX_SAFE_INTEGER: approximation 10^<expr> ≈ <expr>,
          // so E-<expr> ≈ 1/<expr> (sign=2 with <expr>'s array).
          eDashResult = eDashInner.clone();
        }
        // Make it reciprocal (sign 1 → 2)
        eDashResult.sign = eDashResult.sign === 1 ? 2 : eDashResult.sign === -1 ? -2 : eDashResult.sign;
        // Apply outer negateIt: flip 2 ↔ -2
        if (negateIt) {
          eDashResult.sign = eDashResult.sign === 2 ? -2 : eDashResult.sign === -2 ? 2 : eDashResult.sign;
        }
        return eDashResult.normalize();
      }

      var tetrMatch = rem.match(/^(\d+(?:\.\d+)?)\s*\^\^\s*(\d+(?:\.\d+)?)\s*$/);
      if (tetrMatch) {
        var tetrBase = Number(tetrMatch[1]);
        var tetrHeight = Number(tetrMatch[2]);
        if (!isNaN(tetrBase) && !isNaN(tetrHeight) && isFinite(tetrHeight) && tetrHeight >= 0 && tetrHeight === Math.floor(tetrHeight)) {
          if (tetrHeight === 0) {
            x.array = [[1]];
          } else if (tetrHeight === 1) {
            x.array = [[tetrBase]];
          } else {
            var tetrResult = MetaNum.pow(tetrBase, new MetaNum(tetrBase));
            for (var ti = 3; ti <= tetrHeight; ti++) {
              tetrResult = MetaNum.pow(tetrBase, tetrResult);
            }
            x.array = deepCloneArray(tetrResult.array);
            x.sign = tetrResult.sign;
            x.layer = tetrResult.layer;
          }
          if (negateIt) x.sign = -1;
          return x.normalize();
        }
      }

      var coeffEMatch = rem.match(/^(\d+(?:\.\d+)?)\s*[Ee]\s*(\d+(?:\.\d+)?)\s*$/);
      if (coeffEMatch) {
        var coeff = Number(coeffEMatch[1]);
        var exp = Number(coeffEMatch[2]);
        if (!isNaN(coeff) && !isNaN(exp) && isFinite(exp) && coeff > 0) {
          x.array[0] = [exp + Math.log10(coeff), 1];
          x.sign = negateIt ? -1 : 1;
          x.layer = 0;
          return x.normalize();
        }
      }

      // Parse spaced letter-chain notation (round-trip of toString output):
      //   "M^7 L^8 K^8 ... E^8 10000000000"  finite levels with ^counts
      //   "GF^2 E^3 123"                     letters + ^counts (last letter gets count)
      //   "3Aa25 100"                        high finite level (> 22) with base
      //   "AaAa E^8 100"                     compact ordinal tokens + spaced chain
      //   "F^9 EE100"                        spaced chain + compact letters + base
      // Must come before aaMatch so "3Aa25 100" keeps its trailing base value.
      var chainMatch = rem.match(/^((?:[A-Z][a-z]+)*)((?:(?:[A-Z]+\^\d+|\d+Aa\d+)\s+)+)([A-Z]*)(\d+(?:\.\d+)?)\s*$/);
      if (chainMatch) {
        var chainOk = true;
        var chainFin = {};
        var chainTokRe = /([A-Z]+)\^(\d+)|(\d+)Aa(\d+)/g;
        var chainTokM;
        while ((chainTokM = chainTokRe.exec(chainMatch[2])) !== null) {
          var cLevel, cCount;
          if (chainTokM[1] !== undefined) {
            // "GF^2": every letter counts 1 except the last, which gets ^N
            var cLetters = chainTokM[1];
            cCount = parseInt(chainTokM[2], 10);
            for (var cli = 0; cli < cLetters.length; cli++) {
              var clLevel = cLetters.charCodeAt(cli) - 68; // E->1, F->2, ...
              if (clLevel < 1 || clLevel > 99) { chainOk = false; break; }
              chainFin[clLevel] = (chainFin[clLevel] || 0) + (cli === cLetters.length - 1 ? cCount : 1);
            }
            if (!chainOk) break;
          } else {
            cLevel = parseInt(chainTokM[4], 10);
            cCount = parseInt(chainTokM[3], 10);
            // Levels beyond maxCols are fine: normalize converts the r0
            // overflow into finite-level ordinal rows [count, level]
            if (cLevel < 1 || cLevel > 99) { chainOk = false; break; }
            chainFin[cLevel] = (chainFin[cLevel] || 0) + cCount;
          }
        }
        // compact trailing letters (each occurrence counts 1), e.g. "F^9 EE100"
        var chainCompact = chainMatch[3] || "";
        for (var cci = 0; cci < chainCompact.length && chainOk; cci++) {
          var cclLevel = chainCompact.charCodeAt(cci) - 68;
          if (cclLevel >= 1 && cclLevel <= 99) {
            chainFin[cclLevel] = (chainFin[cclLevel] || 0) + 1;
          }
        }
        if (chainOk) {
          var chainBase = Number(chainMatch[4]);
          if (!isNaN(chainBase) && isFinite(chainBase)) {
            x.array[0] = [chainBase];
            for (var ckey in chainFin) {
              x.array[0][ckey] = (x.array[0][ckey] || 0) + chainFin[ckey];
            }
            // compact ordinal tokens (group 1, e.g. "AaAa") -> ordinal rows,
            // same row-building logic as the oaMatch handler below
            var chainOrd = chainMatch[1] || "";
            var chainOrdRe = /[A-Z][a-z]+/g;
            var chainOrdM;
            var chainGroups = [];
            while ((chainOrdM = chainOrdRe.exec(chainOrd)) !== null) {
              var ctk = chainOrdM[0];
              if (chainGroups.length > 0 && chainGroups[chainGroups.length - 1].token === ctk) {
                chainGroups[chainGroups.length - 1].count++;
              } else {
                chainGroups.push({ token: ctk, count: 1 });
              }
            }
            var chainRows = [];
            for (var cgi = 0; cgi < chainGroups.length; cgi++) {
              var cg = chainGroups[cgi];
              var cgUIdx = cg.token.charCodeAt(0) - 64;
              var cgLower = cg.token.slice(1);
              var cgIndices = [];
              for (var cili = 0; cili < cgLower.length; cili++) cgIndices.push(cgLower.charCodeAt(cili) - 97);
              var cgK = cgIndices.length;
              var cgAllZero = true;
              var cgFirstNonZero = -1;
              for (var cz = 0; cz < cgK; cz++) {
                if (cgIndices[cz] !== 0) { cgAllZero = false; if (cgFirstNonZero === -1) cgFirstNonZero = cz; }
              }
              var cgRow = [cg.count];
              var cgIsDiag = false;
              if (cgAllZero) {
                for (var cz2 = 0; cz2 < cgK; cz2++) cgRow.push(0);
                cgRow.push(cgUIdx);
              } else {
                if (cgIndices[cgK - 1] === 0 && cgFirstNonZero >= 0) cgIsDiag = true;
                for (var cz3 = cgK - 1; cz3 >= 0; cz3--) cgRow.push(cgIndices[cz3]);
                cgRow.push(cgUIdx);
              }
              chainRows.push({ row: cgRow, isDiag: cgIsDiag, lowerIndices: cgIndices, level: cgUIdx });
            }
            chainRows.sort(function (a, b) {
              if (a.level !== b.level) return a.level - b.level;
              var cLen = Math.max(a.lowerIndices.length, b.lowerIndices.length);
              for (var csi = 0; csi < cLen; csi++) {
                var csa = csi < a.lowerIndices.length ? a.lowerIndices[csi] : 0;
                var csb = csi < b.lowerIndices.length ? b.lowerIndices[csi] : 0;
                if (csa !== csb) return csa - csb;
              }
              return 0;
            });
            x._oaRowData = [];
            for (var cri = 0; cri < chainRows.length; cri++) {
              x.array.push(chainRows[cri].row);
              x._oaRowData.push({ isDiag: chainRows[cri].isDiag });
            }
            if (negateIt) x.sign = -1;
            return x.normalize();
          }
        }
      }

      var aaMatch = rem.match(/^(\d+)Aa(\d+)/i);
      if (aaMatch) {
        var aaCount = aaMatch[1] ? Number(aaMatch[1]) : 1;
        var aaN = Number(aaMatch[2]);
        if (!isNaN(aaN) && isFinite(aaN) && aaN >= 1 && aaN === Math.floor(aaN)) {
          if (aaN < MetaNum.maxCols) {
            x.array[0] = [10];
            x.array[0][aaN] = aaCount;
          } else {
            x.array = [[10], [aaCount, aaN]];
          }
          if (negateIt) x.sign = -1;
          return x.normalize();
        }
      }

      // Stacked layer symbols: peel the outermost symbol and add its layer
      // to the parsed remainder ("@!2.000Aaaa10" = parse of !form at one
      // higher layer).
      var stackedSym = rem.match(/^([!@#\$%&~<>?])([!@#\$%&~<>?]+\S*)$/);
      if (stackedSym) {
        var innerS = Q.fromString(stackedSym[2]);
        // each outer symbol is exactly one more ω^-tower layer
        innerS.layer = (innerS.layer || 0) + 1;
        if (negateIt) innerS.sign = -1;
        return innerS.normalize();
      }

      // Canonical diagonal-letter output "mantissa LETTER β" where LETTER is
      // any multi-letter token ending in 'a' (Aa, Ba, Aaa, Aaaa, …), with the
      // dlsdl diagonal mantissa α ∈ [2,10):
      //   exact anchor α=2.000 -> the plain letter application LETTER(β)
      //     (2·5^0=2 adds nothing);
      //   fractional α -> compact smooth row [α, β] (r0=[1]), the same
      //     representation the engine emits for 10{β}(structured counts).
      var diagBinMatch = rem.match(/^([!@#\$%&~<>?]?)(\d+\.\d+)([A-Z][a-z]+)(\d[\d,]*)\s*$/);
      if (diagBinMatch) {
        var dbSym = diagBinMatch[1];
        var dbMant = Number(diagBinMatch[2]);
        var dbTok = diagBinMatch[3];
        var dbBeta = Number(String(diagBinMatch[4]).replace(/,/g, ""));
        if (isFinite(dbMant) && isFinite(dbBeta) &&
            dbTok[dbTok.length - 1] === "a" && dbMant >= 2 && dbMant < 10) {
          var dbVal;
          if (Math.abs(dbMant - 2) < 1e-9) {
            dbVal = Q.fromString(dbSym + dbTok + String(dbBeta));
          } else {
            // compact smooth form 10{β+1}(α): row [α, β] with r0=[1]
            dbVal = new MetaNum({ sign: 1, layer: 0, array: [[1], [dbMant, dbBeta]] });
            dbVal.normalize();
            if (dbSym) {
              dbVal.layer = "!@#$%&~<>?".indexOf(dbSym) + 1;
              dbVal.normalize();
            }
          }
          if (negateIt) dbVal.sign = -1;
          return dbVal;
        }
      }

      // Binary-form α prefix with α = 1.000 exactly: Γ(β + log 1) = Γβ, so the
      // mantissa carries no information and can be stripped before matching
      // (e.g. "!1.000Aa5" ≡ "!Aa5", "1.000F300" ≡ "F300"). Non-unit α needs
      // the fractional-argument machinery and is not accepted here.
      rem = rem.replace(/^([!@#\$%&~<>?]?)1\.0+(?=[A-Z])/, '$1');

      // Handle layer symbol prefix + letter pattern + optional finOps + number (e.g., !Abcd1234, !AaE16, @Bcde500)
      var symPrefixMatch = rem.match(/^([!@#\$%&~<>?])([A-Z][a-z]+(?:[A-Z][a-z]+)*)([A-Z]*)(\d+)\s*$/);
      if (symPrefixMatch) {
        var SYMBOL_LAYERS_P = {'!': 1, '@': 2, '#': 3, '$': 4, '%': 5, '&': 6, '~': 7, '<': 8, '>': 9, '?': 10};
        x.layer = SYMBOL_LAYERS_P[symPrefixMatch[1]] || 1;
        // Strip the symbol and let the rest fall through to oaMatch
        rem = symPrefixMatch[2] + (symPrefixMatch[3] || '') + symPrefixMatch[4];
      }

      // Ordinal-prefix chain with a full number argument — the argument may be
      // a plain integer ("AaG5"), a decimal ("AaG5.5"), or a sci-notation value
      // ("AaGF7.626E12", the round-trip of format() displays like "AaGF7.626E12"
      // whose letter chain carries a huge finite-arg). The old (\d+) regex ate
      // only "7" and silently dropped ".626E12".
      var oaMatch = rem.match(/^((?:[A-Z][a-z]+)+)([A-Z]*)((?:\d+(?:\.\d+)?(?:[Ee]\d+)?))$/);
      if (oaMatch) {
        var oaFullPrefix = oaMatch[1];
        var oaFinOps = oaMatch[2];
        var oaN = Number(oaMatch[3]);
        if (!isNaN(oaN) && isFinite(oaN) && oaN >= 0) {
          var oaTokens = [];
          var oaTokenRegex = /[A-Z][a-z]+/g;
          var oaTm;
          while ((oaTm = oaTokenRegex.exec(oaFullPrefix)) !== null) {
            oaTokens.push(oaTm[0]);
          }

          var oaGroups = [];
          for (var ti = 0; ti < oaTokens.length; ti++) {
            if (oaGroups.length > 0 && oaGroups[oaGroups.length - 1].token === oaTokens[ti]) {
              oaGroups[oaGroups.length - 1].count++;
            } else {
              oaGroups.push({token: oaTokens[ti], count: 1});
            }
          }

          var oaRows = [];
          for (var gi = 0; gi < oaGroups.length; gi++) {
            var g = oaGroups[gi];
            var gU = g.token[0];
            var gUIdx = gU.charCodeAt(0) - 64;
            var gLower = g.token.slice(1);
            var gIndices = [];
            for (var li = 0; li < gLower.length; li++) {
              gIndices.push(gLower.charCodeAt(li) - 97);
            }
            var gK = gIndices.length;
            var gAllZero = true;
            var gFirstNonZero = -1;
            for (var li = 0; li < gK; li++) {
              if (gIndices[li] !== 0) {
                gAllZero = false;
                if (gFirstNonZero === -1) gFirstNonZero = li;
              }
            }
            var gLastIsA = gIndices[gK - 1] === 0;
            var gRow = [g.count];
            var gIsDiag = false;

            if (gAllZero) {
              for (var li = 0; li < gK; li++) gRow.push(0);
              gRow.push(gUIdx);
            } else if (gLastIsA && gFirstNonZero >= 0) {
              gIsDiag = true;
              for (var li = gK - 1; li >= 0; li--) {
                gRow.push(gIndices[li]);
              }
              gRow.push(gUIdx);
            } else {
              for (var li = gK - 1; li >= 0; li--) {
                gRow.push(gIndices[li]);
              }
              gRow.push(gUIdx);
            }
            oaRows.push({
              row: gRow,
              isDiag: gIsDiag,
              lowerIndices: gIndices,
              level: gUIdx
            });
          }

          oaRows.sort(function(a, b) {
            if (a.level !== b.level) return a.level - b.level;
            var maxLen = Math.max(a.lowerIndices.length, b.lowerIndices.length);
            for (var i = 0; i < maxLen; i++) {
              var va = i < a.lowerIndices.length ? a.lowerIndices[i] : 0;
              var vb = i < b.lowerIndices.length ? b.lowerIndices[i] : 0;
              if (va !== vb) return va - vb;
            }
            return 0;
          });

          x.array = [[oaN]];
          // Apply finite ops to r0 (single uppercase letters between ordinal tokens and number)
          if (oaFinOps) {
            for (var fi = 0; fi < oaFinOps.length; fi++) {
              var finLevel = oaFinOps.charCodeAt(fi) - 68; // E->1, F->2, G->3, ...
              if (finLevel > 0) {
                x.array[0][finLevel] = (x.array[0][finLevel] || 0) + 1;
              }
            }
          }
          x._oaRowData = [];
          for (var gi = 0; gi < oaRows.length; gi++) {
            x.array.push(oaRows[gi].row);
            x._oaRowData.push({isDiag: oaRows[gi].isDiag});
          }
          if (negateIt) x.sign = -1;
          // De-layer: Aa form [*,0,1] with small r0, reduce layer by 1
          if (x.layer > 0 && x.array.length >= 2) {
            var lastRow = x.array[x.array.length - 1];
            if (lastRow.length === 3 && lastRow[1] === 0 && lastRow[lastRow.length - 1] === 1 &&
                x.array[0].length === 1 && x.array[0][0] >= 0 && x.array[0][0] <= MetaNum.maxCols - 2) {
              var baseVal = x.array[0][0];
              lastRow = [lastRow[0]];
              for (var di = 0; di < baseVal; di++) lastRow.push(0);
              lastRow.push(1);
              x.array[x.array.length - 1] = lastRow;
              x.layer--;
            }
          }
          return x.normalize();
        }
      }

      if (/^[A-Z]+/i.test(rem)) {
        var prefixMatch = rem.match(/^([A-Z]+)/i);
        var prefix = prefixMatch[0].toUpperCase();
        rem = rem.substring(prefixMatch[0].length).trim();
        var val = Number(rem);
        if (!isNaN(val) && isFinite(val)) {
          var counts = {};
          var maxIdx = 0;
          for (var i = 0; i < prefix.length; i++) {
            var letterPos = prefix.charCodeAt(i) - 64;
            if (letterPos >= 5) {
              var idx = letterPos - 4;
              counts[idx] = (counts[idx] || 0) + 1;
              maxIdx = Math.max(maxIdx, idx);
            }
          }
          x.array[0] = [val];
          var eCount = counts[1] || 0;
          var fCount = counts[2] || 0;
          if (fCount > 0 && eCount === 0 && fCount === 1 && maxIdx === 2 && val >= 0 && val === Math.floor(val)) {
            if (val === 0) {
              x.array = [[1]];
            } else if (val === 1) {
              x.array = [[10]];
            } else {
              x.array[0] = [10000000000, val - 2];
            }
          } else if (maxIdx === 1) {
            x.array[0][1] = eCount;
          } else {
            for (var idx = 1; idx <= maxIdx; idx++) {
              x.array[0][idx] = counts[idx] || 0;
            }
          }
          if (negateIt) x.sign = -1;
          return x.normalize();
        }
      }

      // Parse scientific notation with extreme exponents (e.g., 1E-1000000, 1E1000000)
      // that overflow/underflow JS Number
      var sciExtreme = rem.match(/^([\d.]+)[Ee](-?\d+)\s*$/);
      if (sciExtreme) {
        var sciMant = Number(sciExtreme[1]);
        var sciExp = Number(sciExtreme[2]);
        if (!isNaN(sciMant) && isFinite(sciMant) && isFinite(sciExp) && sciMant > 0) {
          var logVal = Math.log10(sciMant) + sciExp;
          if (logVal < -308) {
            // Very small: convert to reciprocal (sign=2)
            x.array[0][0] = -logVal;
            x.array[0][1] = 1;
            x.sign = negateIt ? -2 : 2;
            return x.normalize();
          } else if (logVal > 308) {
            // Very large: use E notation
            x.array[0][0] = logVal;
            x.array[0][1] = 1;
            if (negateIt) x.sign = -1;
            return x.normalize();
          }
          // Normal range: fall through to Number() below
        }
      }

      var num = Number(rem);
      if (!isNaN(num) && isFinite(num)) {
        x.array[0][0] = num;
      }
    }

    if (negateIt) x.sign = -1;
    return x.normalize();
  };

  
  // ==================== BEAF Ordinal Helpers ====================
  // Build ordinal coefficient array from BEAF args:
  //   BEAF(a,b,c,d,e,f,...) = a{...+ω^3*(f-1)+ω^2*(e-1)+ω*(d-1)+c}b
  //   coeffs[0] = c (ω^0 = constant term, no decrement)
  //   coeffs[1] = d-1 (ω^1 coefficient)
  //   coeffs[2] = e-1 (ω^2 coefficient)
  //   coeffs[3] = f-1 (ω^3 coefficient)
  // An argument whose value exceeds MSI (or carries ordinal structure) cannot
  // serve as an exact coefficient: it is reported in hugeArgs and the caller
  // supremum-collapses it (ω^i*HUGE ≈ ω^(i+1)).
  Q._buildOrdinalCoeffs = function(args) {
    var coeffs = [];
    var hugeArgs = [];
    for (var i = 2; i < args.length; i++) {
      var arg = args[i];
      var eff = Infinity;
      if (arg.layer === 0 && arg.array.length === 1) {
        eff = metaFiniteCount(arg);
      }
      if (!(eff <= MAX_SAFE_INTEGER)) {
        hugeArgs.push(arg.clone());
        coeffs.push(Infinity);
      } else {
        // constant term (i=2) keeps its value; ω^k coefficients (i>=3) decrement
        coeffs.push(i === 2 ? Math.max(0, Math.floor(eff)) : Math.max(0, Math.floor(eff) - 1));
      }
    }
    return { coeffs: coeffs, hugeArgs: hugeArgs };
  };

  // Ordinal BEAF computation for 4+ arguments:
  //   BEAF(a,b,c,d,...) = a{...+ω*d+c}b via the unified ordinal engine.
  // Huge coefficients (> MSI / ordinal args) supremum-collapse:
  //   ω^i*HUGE ≈ ω^(i+1) with all lower coefficients swallowed, e.g.
  //   4{ω*5+X}2 = 4{ω*6}X (X huge) → X plus one ω*6 row;
  //   4{ω*X+3}2 = 4{ω^2}X        → X plus one ω^2 row.
  // The result anchors at the largest operand (the huge argument's value).
  Q._beafOrdinal = function(a, b, coeffs, hugeArgs) {
    a = new MetaNum(a);
    b = new MetaNum(b);
    var iHuge = -1;
    for (var i = coeffs.length - 1; i >= 0; i--) {
      if (!(coeffs[i] <= MAX_SAFE_INTEGER)) { iHuge = i; break; }
    }
    if (iHuge < 0) {
      // no huge coefficients: exact engine evaluation
      var cf = trimCoeffs(coeffs.map(function (c) { return Math.max(0, Math.floor(c)); }));
      if (cf.length === 0) return a.pow(b); // level 0 → a^b (b arg is the level-1 op)
      if (!coeffsHaveOmegaPart(cf)) return a.arrow(cf[0])(b); // finite level c
      return Q._applyExpansionTruncation(Q._ordinalHyperop(a, b, cf));
    }
    // collapse at the highest huge coefficient: coeffs[iHuge+1] += 1, zero the rest below
    var cf = coeffs.slice();
    for (var j = 0; j <= iHuge; j++) cf[j] = 0;
    while (cf.length <= iHuge + 1) cf.push(0);
    cf[iHuge + 1] = (cf[iHuge + 1] || 0) + 1;
    cf = trimCoeffs(cf);
    // anchor: the largest operand dominates (right-to-left composition)
    var anchor = a.max(b);
    for (var j = 0; j < (hugeArgs || []).length; j++) anchor = anchor.max(hugeArgs[j]);
    return Q._applyExpansionTruncation(Q._applyOrdinalRows(anchor, cf, 1));
  };

  // ==================== Hardy Hierarchy ====================
  // H_α(n) via transfinite recursion (issues.md / README):
  //   H_0(n) = n
  //   H_{α+1}(n) = H_α(n+1)          (successor step: only +1, never iterated)
  //   H_λ(n) = H_{λ[n]}(n)           (limit step: CNF fundamental sequence at n)
  // where λ[n] acts on the lowest limit term: (… + ω^j·c_j)[n] = … + ω^j·(c_j−1)
  // + ω^{j−1}·n.  Closed forms keep the recursion finite:
  //   H_{β+c}(n)   = H_β(n+c)        (c successor steps)
  //   H_{β+ω·c}(n) = H_β(n·2^c)      (c ω-level limit steps)
  // For ω^j·c segments with c beyond the exact-iteration bound (j ≥ 2) the
  // value collapses into the hyperoperation engine, mirroring the classic
  // identity F_j = H^{ω^j} (F_2(n)=n·2^n, F_3(n)≈2↑↑n, …):
  //   H_{β+ω^j·c}(n) ≈ H_β(2{c}^j)   i.e. 2.arrow(j)(c)
  var HARDY_EXACT_BOUND = 50;
  // H_α(n) — ITERATIVE (the original tail recursion grew hundreds of frames
  // deep for inputs like hardy(1e10+20) where n1≈40 makes every ω^j segment
  // take the exact branch: Maximum call stack size exceeded).
  Q._hardyH = function (coeffs, nArg) {
    function MN(v) { return (v instanceof MetaNum) ? v.clone() : new MetaNum(v || 0); }
    var c = [];
    for (var i0 = 0; i0 < coeffs.length; i0++) c.push(MN(coeffs[i0]));
    var n = MN(nArg);
    var guard2 = 200000;
    // The exact limit-step expansion is only feasible while the running base n
    // stays a small plain integer; once n is structured (or the step budget is
    // exhausted) the nested expansion would take ~n^degree steps, so take the
    // same supremum collapse the engine uses above HARDY_EXACT_BOUND.
    function nIsSmallPlain() {
      if (n.layer !== 0 || n.array.length !== 1) return false;
      var nv = n.toNumber();
      return isFinite(nv) && nv === Math.floor(nv) && Math.abs(nv) <= HARDY_EXACT_BOUND;
    }
    while (--guard2 >= 0) {
      while (c.length > 0 && c[c.length - 1].eq(MetaNum.ZERO)) c.pop();
      if (c.length === 0) return n;                        // H_0(n) = n
      if (c.length === 1) return n.add(c[0]);              // H_c(n) = n + c
      if (c[0].gt(MetaNum.ZERO)) {                         // successor strip
        n = n.add(c[0]);
        c[0] = MetaNum.ZERO.clone();
        continue;
      }
      var j = 1;
      while (j < c.length && !c[j].gt(MetaNum.ZERO)) j++;
      if (j === 1) {                                       // ω-segment closed form
        // H_{β + ω·c1}(n) = H_β(n · 2^{c1}) — evaluate with the OLD c1
        var nWf = n.mul(new MetaNum(2).pow(c[1]));
        var beta = [MetaNum.ZERO.clone(), MetaNum.ZERO.clone()];
        for (var k = 2; k < c.length; k++) beta.push(c[k]);
        c = beta;
        n = nWf;
        continue;
      }
      if (c[j].gt(HARDY_EXACT_BOUND)) {                    // engine collapse
        // H_{β + ω^j·c}(n) ≈ H_β(2{c}j) — evaluate with the OLD c[j]
        var nCol = new MetaNum(2).arrow(j)(c[j]);
        var beta2 = [MetaNum.ZERO.clone()];
        for (var k2 = 0; k2 < j; k2++) beta2.push(MetaNum.ZERO.clone());
        for (var k3 = j + 1; k3 < c.length; k3++) beta2.push(c[k3]);
        c = beta2;
        n = nCol;
        continue;
      }
      // exact limit step on ω^j·c_j: c_j-=1, c_{j-1}=n
      c[j] = c[j].sub(MetaNum.ONE);
      c[j - 1] = n.clone();
    }
    // budget exhausted: keep whatever was accumulated (monotone)
    return n;
  };

  // MetaNum.hardy(n): the Hardy level of n.
  //   n < 10 → 10 + n;  otherwise the decimal digits of n become the CNF
  //   coefficients of an ordinal α (hardy(1234) = H_{ω³+ω²·2+ω·3+4}(10)) and
  //   the result is H_α(10).
  Q.hardy = function (n) {
    n = new MetaNum(n);
    if (n.sign !== 1) {
      throw Error(metaNumError + 'hardy: n must be a non-negative integer');
    }
    // v2.1 (issues.md): MetaNum-object input. Values beyond double range or
    // carrying ordinal rows/layers read their STRUCTURE as the ordinal:
    //   a power tower 10^^k shadows to ω^ω^…^ω (k ω's), and H there is the
    //   engine diagonal 10{ω^ω^…^ω(k ω's)}10 = 10.epsilonate(k) — so
    //   hardy(10^^MSI) = the MetaNum limit exactly (slog(10^^MSI) = MSI).
    //   Ordinal-row / ε-layer values sit at their own Hardy position
    //   (H_{ω^β}(10) = 10{β}10) and map to themselves.
    var num = (n.layer === 0 && n.array.length === 1) ? n.toNumber() : Infinity;
    if (!isFinite(num)) {
      if (n.layer === 0 && n.array.length === 1) {
        var hVal = n.slog();
        // a clean power tower shadows to ω^ω^…^ω (k ω's); slog(10^^k) = [[k]]
        // (a plain single number — NOT the structured slog of, say, G600)
        if (hVal.layer === 0 && hVal.array.length === 1 && hVal.array[0].length === 1) {
          var hNum = hVal.toNumber();
          if (isFinite(hNum) && hNum >= 2 && hNum <= Number.MAX_SAFE_INTEGER) {
            // k ≤ MSI: the tower fits the engine limit (f_ε₀); k > MSI is
            // beyond ε₀ and the Hardy hierarchy is undefined there → Infinity
            return MetaNum.TEN.epsilonate(hNum).normalize();
          }
        }
        // layer-0 value beyond a clean 10^^k with k ≤ MSI: finite
        // hyperoperations above tetration (G600, 3{9}3, …) or a tower taller
        // than 10^^MSI exceed the library's ε₀ ceiling → Infinity
        return new MetaNum(Infinity);
      }
      // ordinal-row / ε-layer / letter-chain values sit at their own Hardy
      // position (H_{ω^β}(10) = 10{β}10): map to themselves
      return n.clone().normalize();
    }
    var s = String(num);
    // > 1e20 arrives in scientific notation ('1e+21') — expand to the exact
    // decimal digits so the digit-reading stays monotone (issues.md v2.1:
    // hardy must support > 1e15 inputs)
    var eMatch = s.match(/^(\d)(?:\.(\d+))?e\+?(\d+)$/);
    if (eMatch) {
      var eFrac = eMatch[2] || '';
      var eZeros = Number(eMatch[3]) - eFrac.length;
      if (eZeros > 0) s = eMatch[1] + eFrac + '0'.repeat(eZeros);
    }
    if (s.length >= 11) {
      // n ≥ 1e10 (issues.md v2.0): the ordinal is built per definition, then
      // evaluated from below on the engine's own representation:
      //   n = dk·10^kExp + rest  →  α = ω^ord(kExp)·dk + ord(rest)
      //   H_α(10) = H_{ω^ord(kExp)·dk}(H_ord(rest)(10)) — the lower part acts
      // first: n1 = H_ord(rest)(10) (recursive, exact path for rest < 1e10).
      //   n1 = H_rest(10) becomes the fundamental-sequence argument of the
      // leading term:
      //   kExp = 10 (ord = ω):  H_{ω^ω·dk}(n1) = H_{ω^n1}(n1) exact (first
      //     segment), the remaining dk−1 ω^ω-segments each add one ω-row —
      //     hardy(1e10) = H_{ω^10}(10) = [3086.036065328153, 9×8] EXACTLY,
      //     strictly below 10{10}10 (issues.md);
      //   kExp ≥ 11 (ord = ω+c): mirror the engine's own ordinal rows for
      //     10{ω+c}(9+dk) on the from-below base H_{ω^n1}(n1) — hardy(1e11)
      //     = H_{ω^(ω+1)}(10) keeps expande(10,10)'s row structure with the
      //     strictly smaller definitional base, so hardy(1e11) < 10{ω+1}10
      //     (issues.md).
      var kExp = s.length - 1;
      var dk = s.charCodeAt(0) - 48;
      var restNum = Number(s.slice(1));
      var n1 = MetaNum.TEN.clone();
      if (restNum > 0) n1 = Q.hardy(restNum);
      // from-below base: H_{ω^n1}(n1) — exact for small finite n1, one
      // ω-diagonal row (engine convention) for huge n1
      var base;
      var n1Num = (n1.array.length === 1 && n1.layer === 0) ? n1.toNumber() : Infinity;
      if (isFinite(n1Num) && n1Num === Math.floor(n1Num) && n1Num >= 2 && n1Num <= 100) {
        var ec = [];
        for (var zi = 0; zi < n1Num; zi++) ec.push(0);
        ec.push(1);
        base = Q._hardyH(ec, n1);
      } else {
        base = Q._applyOrdinalRows(n1, [0, 1], 1);
      }
      if (kExp === 10) {
        return Q._applyOrdinalRows(base, [0, 1], dk - 1).normalize();
      }
      // kExp ≥ 11 (ord = ω+c): mirror the engine's own ordinal rows for
      // 10{ω+c}(9+dk) onto the from-below base — hardy(1e11) keeps
      // expande(10,10)'s row structure with the strictly smaller
      // definitional base, so hardy(1e11) < 10{ω+1}10 (issues.md)
      var ks = String(kExp);
      var ordCoeffs = [];
      for (var oi = ks.length - 1; oi >= 0; oi--) ordCoeffs.push(ks.charCodeAt(oi) - 48);
      var mir = Q._hyperopFromOrdinalRaw(MetaNum.TEN.clone(), new MetaNum(9 + dk), ordCoeffs);
      var out = base.clone();
      for (var ri = 1; ri < mir.array.length; ri++) {
        out = Q._applyOrdinalRows(out, mir.array[ri].slice(1), mir.array[ri][0]);
      }
      return out.normalize();
    }
    if (num < 10) return new MetaNum(10 + num);
    var coeffs = [];
    for (var i = s.length - 1; i >= 0; i--) coeffs.push(s.charCodeAt(i) - 48);
    return Q._hardyH(coeffs, MetaNum.TEN.clone());
  };

  // ==================== BEAF Array Notation ====================
  // Bowers' Exploding Array Function: https://googology.fandom.com/wiki/Array_notation
  // Rules:
  //   1. {a} = a, {a,b} = a^b
  //   2. {a,b,c,...,n,1} = {a,b,c,...,n}
  //   3. {a,1,b,c,...,n} = a
  //   4. {a,b,1,...,1,c,d,...,n} = {a,a,a,...,{a,b-1,1,...,1,c,d,...,n},c-1,d,...,n}
  //   5. {a,b,c,d,...,n} = {a,{a,b-1,c,d,...,n},c-1,d,...,n}

  // Internal recursive BEAF computation
  Q._beafRecursive = function(args, depth) {
    if (depth === undefined) depth = 0;
    if (depth > 500) return MetaNum.NaN.clone(); // safety limit
    var len = args.length;
    if (len === 0) return MetaNum.ONE.clone();
    if (len === 1) return args[0].clone();
    if (len === 2) return args[0].pow(args[1]);

    // Remove trailing 1s (Rule 2)
    while (len > 2 && args[len - 1].eq(MetaNum.ONE)) { args.pop(); len--; }

    // After removing trailing 1s, re-check length
    if (len <= 2) {
      return len === 1 ? args[0].clone() : args[0].pow(args[1]);
    }

    // 3-entry optimization: {a, b, c} = a{c}b (use hyperoperators)
    if (len === 3) {
      var c = args[2];
      if (c.isint() && c.sign === 1) {
        var cNum = c.toNumber();
        if (isFinite(cNum)) {
          // any finite integer level: arrow() covers small, compact ordinal-row
          // (level ≥ maxCols) approximation branches
          return args[0].arrow(cNum)(args[1]);
        }
      }
      // c is an ordinal/huge MetaNum (unrepresentable finite level): the level
      // diagonalizes past every finite level → approximate with the ω level
      if (c.array.length > 1 || c.layer > 0) {
        return Q._ordinalHyperop(args[0], args[1], [0, 1]);
      }
      // Fall through to recursive computation for non-integer c
    }

    // Rule 3: {a, 1, ...} = a
    if (args[1].eq(MetaNum.ONE)) return args[0].clone();

    // 4+ arguments: use ordinal arithmetic instead of recursion
    if (len >= 4) {
      var coeffsInfo = Q._buildOrdinalCoeffs(args);
      return Q._beafOrdinal(args[0], args[1], coeffsInfo.coeffs, coeffsInfo.hugeArgs);
    }

    // Rule 4: {a, b, 1, ..., 1, c, d, ...}
    if (args[2].eq(MetaNum.ONE)) {
      var pilotIdx = 2;
      while (pilotIdx < len && args[pilotIdx].eq(MetaNum.ONE)) pilotIdx++;
      if (pilotIdx >= len) {
        return args[0].pow(args[1]);
      }
      var c = args[pilotIdx];
      var newArgs = [args[0].clone()];
      for (var i = 1; i < pilotIdx - 1; i++) newArgs.push(args[0].clone());
      var orig = args.map(function(x) { return x.clone(); });
      orig[1] = args[1].sub(MetaNum.ONE);
      newArgs.push(Q._beafRecursive(orig, depth + 1));
      newArgs.push(c.sub(MetaNum.ONE));
      for (var i = pilotIdx + 1; i < len; i++) newArgs.push(args[i].clone());
      return Q._beafRecursive(newArgs, depth + 1);
    }

    // Rule 5: {a, b, c, d, ...} = {a, BEAF(a, b-1, c, d, ...), c-1, d, ...}
    var orig = args.map(function(x) { return x.clone(); });
    orig[1] = args[1].sub(MetaNum.ONE);
    var newArgs = [args[0].clone(), Q._beafRecursive(orig, depth + 1), args[2].sub(MetaNum.ONE)];
    for (var i = 3; i < len; i++) newArgs.push(args[i].clone());
    return Q._beafRecursive(newArgs, depth + 1);
  };

  // Public BEAF function: MetaNum.BEAF(a, b, c, ...)
  Q.BEAF = function() {
    var args = Array.prototype.slice.call(arguments);
    if (args.length > MetaNum.maxCols) {
      throw Error(metaNumError + 'BEAF: too many arguments (max ' + MetaNum.maxCols + ')');
    }
    var metaArgs = args.map(function(a) { return new MetaNum(a); });
    return Q._beafRecursive(metaArgs);
  };

  // Parse BEAF string: {a,b,c,...}
  Q.fromBeaf = function(str) {
    if (typeof str !== 'string') return MetaNum.NaN.clone();
    var s = str.trim();
    if (s.charAt(0) !== '{' || s.charAt(s.length - 1) !== '}') {
      return MetaNum.NaN.clone();
    }
    var inner = s.slice(1, -1).trim();
    if (inner === '') return MetaNum.ONE.clone();
    var parts = inner.split(',');
    var args = [];
    for (var i = 0; i < parts.length; i++) {
      var val = Number(parts[i].trim());
      if (!isFinite(val) || val < 1) return MetaNum.NaN.clone();
      args.push(val);
    }
    return Q.BEAF.apply(null, args);
  };

  // Convert to BEAF string: {a,b,c,...}
  P.toBeaf = function() {
    var x = this.clone().normalize();
    if (x.isNaN()) return 'NaN';
    if (x.layer === 0 && x.array.length === 1) {
      if (x.eq(MetaNum.ZERO)) return '{0}';
      return '{' + decimalPlaces(x.array[0][0], 6) + '}';
    }
    if (x.layer > 0 || x.array.length > 1) {
      if (x.array.length === 2 && x.array[1].length >= 3) {
        var row = x.array[1];
        var diag = row[row.length - 1];
        if (diag === 1 && row[0] === 1) {
          var vals = row.slice(1, row.length - 1);
          var allNonNegative = true;
          for (var i = 0; i < vals.length; i++) {
            if (vals[i] < 0) { allNonNegative = false; break; }
          }
          if (allNonNegative) {
            var a = decimalPlaces(x.array[0][0], 6);
            // Reconstruct BEAF: {a, ?, c, d, e, ...} from ordinal row [1, c, d, e, ..., 1]
            // (issues.md convention: BEAF(a,b,c,d,...) = a{...+ω*(d-1)+c}b)
            var beafParts = [a, '?'];
            for (var i = 0; i < vals.length; i++) {
              beafParts.push(String(vals[i]));
            }
            beafParts.push(String(diag));
            return '{' + beafParts.join(', ') + '}';
          }
        }
      }
    }
    return '{' + x.array.map(function(r) {
      return '[' + r.map(function(v) { return decimalPlaces(v, 6); }).join(', ') + ']';
    }).join(', ') + '}';
  };


  // other methods

  P.clone = function () {
    var x = new MetaNum();
    x.array = deepCloneArray(this.array);
    x.sign = this.sign;
    x.layer = this.layer;
    return x;
  };

  function objectCreate() {
    var x = {};
    x.array = [[0]];
    x.sign = 1;
    x.layer = 0;
    return x;
  }

  function clone(obj) {
    var i, p, ps;
    function MetaNum(input, input2, input3) {
      var x = this;
      if (!(x instanceof MetaNum)) return new MetaNum(input, input2, input3);
      x.constructor = MetaNum;

      if (input === undefined || input === null) {
        x.array = [[0]];
        x.sign = 1;
        x.layer = 0;
        return x;
      }

      var parsedObject = null;
      if (typeof input === "string" && (input[0] === "[" || input[0] === "{")) {
        try {
          parsedObject = JSON.parse(input);
        } catch (e) {}
      }

      var temp;
      if (typeof input === "number" && input2 === undefined) {
        temp = objectCreate();
        temp.array = [[Math.abs(input)]];
        temp.sign = input < 0 ? -1 : 1;
        temp.layer = 0;
        temp.normalize = P.normalize;
        temp = temp.normalize();
      } else if (parsedObject) {
        temp = Q.fromObject(parsedObject);
      } else if (typeof input === "string") {
        temp = Q.fromString(input);
      } else if (Array.isArray(input)) {
        temp = Q.fromArray(input, input2, input3);
      } else if (input instanceof MetaNum) {
        temp = input;
      } else if (typeof input === "object" && input !== null) {
        temp = Q.fromObject(input);
      } else {
        temp = objectCreate();
        var num = Number(input);
        if (!isNaN(num) && isFinite(num)) {
          temp.array = [[Math.abs(num)]];
          temp.sign = num < 0 ? -1 : 1;
          temp.layer = 0;
          temp.normalize = P.normalize;
          temp = temp.normalize();
        } else if (isNaN(num)) {
          temp.array = [[NaN]];
        } else {
          temp.array = [[Infinity]];
          temp.sign = num < 0 ? -1 : 1;
        }
      }

      x.array = deepCloneArray(temp.array);
      x.sign = temp.sign;
      x.layer = temp.layer;
      if (temp._oaIsDiag !== undefined) x._oaIsDiag = temp._oaIsDiag;
      if (temp._oaRowData !== undefined) x._oaRowData = temp._oaRowData.map(function(d) { return {isDiag: d.isDiag}; });

      return x;
    }

    MetaNum.prototype = P;

    MetaNum.JSON = 0;
    MetaNum.STRING = 1;

    MetaNum.NONE = 0;
    MetaNum.NORMAL = 1;
    MetaNum.ALL = 2;

    // expandOrdinals: Generate all Cantor normal form terms below a given ordinal level
    // cantorLevel: determines max nesting depth (diag range and numVals range)
    // maxVal: determines value range (0..maxVal) for each position
    // Returns array of ordinal rows [[1, v0, diag], [1, v0, v1, diag], ...]
    MetaNum.expandOrdinals = function (cantorLevel, maxVal) {
      var rows = [];
      var maxRows = MetaNum.maxCols - 1; // 99

      if (cantorLevel < 0) cantorLevel = 0;

      // nv (number of intermediate v's) must be bounded by cantorLevel:
      //   cantorLevel 0 → nv up to 0, rows are finite level (length 2)
      //   cantorLevel 1 → nv up to 1 (ω^1 rows, length 3)
      //   cantorLevel 2 → nv up to 2 (ω^2 rows, length 4)
      // In general: nv_max = cantorLevel (or 1 at minimum)
      var nvMax = Math.max(cantorLevel, 0);

      // Use maxVal as diag upper bound for proper cardinal expansion
      var diagMax = Math.max(maxVal, 1);

      for (var nv = 0; nv <= nvMax && rows.length < maxRows; nv++) {
        if (nv === 0) {
          // Finite level: just [count, d] where d is the finite level
          for (var d0 = diagMax; d0 >= 1 && rows.length < maxRows; d0--) {
            rows.push([1, d0]);
          }
          continue;
        }
        for (var d = 1; d <= diagMax && rows.length < maxRows; d++) {
          var total = Math.pow(maxVal + 1, nv);
          for (var ci = 0; ci < total && rows.length < maxRows; ci++) {
            var vals = [];
            var tmp = ci;
            for (var k = 0; k < nv; k++) {
              vals.push(tmp % (maxVal + 1));
              tmp = Math.floor(tmp / (maxVal + 1));
            }
            var row = [1];
            for (var k = 0; k < nv; k++) row.push(vals[k]);
            row.push(d);
            rows.push(row);
          }
        }
      }

      // Add boundary/special row only if it fits within nvMax:
      // Boundary row has nv = maxVal+1 zeros → length = maxVal+3 → ω^{maxVal+1} level.
      // To respect cantorLevel, we only add it if (maxVal+1) <= nvMax, otherwise cap at cantorLevel.
      if (rows.length < maxRows) {
        var boundaryNv = Math.min(maxVal + 1, nvMax);
        if (boundaryNv >= 0) {
          var bRow = [1];
          for (var k = 0; k < boundaryNv; k++) bRow.push(0);
          bRow.push(1);
          rows.push(bRow);
        }
      }

      return rows;
    };

    // getCantorLevel: map operation level to expandOrdinals cantorLevel
    // v0 values: 0=ω+1, 1=ω*2+1, 2=ω*3+1, 3-5=ω^ω range,
    //            6=ω^2+1, 7=ω^2+ω, 8=ω^2+ω+1, 9=ω^2*2,
    //            10=ω^3, 11=ω^3+1, ...
    MetaNum.getCantorLevel = function (levelN) {
      // For now, simple mapping based on known cases
      if (levelN <= 0) return 0;     // ω+1: expande
      if (levelN <= 2) return 1;     // ω*2+1 through ω*3+1
      if (levelN <= 5) return 1;     // ω^ω diagonalization range
      if (levelN <= 9) return 1;     // ω^2 range
      if (levelN <= 11) return 2;    // ω^3 range
      // Default: use levelN / some factor
      return Math.min(Math.floor(levelN / 5) + 1, MetaNum.maxCols);
    };

    MetaNum.clone = clone;
    MetaNum.config = MetaNum.set = config;

    for (var prop in Q) {
      if (Q.hasOwnProperty(prop)) {
        MetaNum[prop] = Q[prop];
      }
    }

    if (obj === void 0) obj = {};
    if (obj) {
      ps = ['maxRows', 'maxCols', 'serializeMode', 'debug'];
      for (i = 0; i < ps.length;) if (!obj.hasOwnProperty(p = ps[i++])) obj[p] = this[p];
    }

    MetaNum.config(obj);

    return MetaNum;
  }

  function defineConstants(obj) {
    // maxRows / maxCols are clamped to [10, 1000] on every write, direct or
    // through config() — outside the range the array structures lose their
    // invariants (r0 diagonal needs ≥ 2 levels, row budgets exceed the
    // ordinal-row machinery).
    if (Object.defineProperty) {
      ['maxRows', 'maxCols'].forEach(function (p) {
        var store = obj[p];
        Object.defineProperty(obj, p, {
          configurable: true,
          enumerable: true,
          get: function () { return store; },
          set: function (v) {
            var n = Math.floor(Number(v));
            if (!isFinite(n)) return;
            if (n < 10) n = 10;
            if (n > 1000) n = 1000;
            store = n;
          }
        });
      });
    }
    for (var prop in R) {
      if (R.hasOwnProperty(prop)) {
        var val = R[prop];
        if (typeof val === "string") {
          obj[prop] = new MetaNum(val);
        } else if (Object.defineProperty) {
          Object.defineProperty(obj, prop, {
            configurable: false,
            enumerable: true,
            writable: false,
            value: new MetaNum(val)
          });
        } else {
          obj[prop] = new MetaNum(val);
        }
      }
    }
    return obj;
  }

  function config(obj) {
    if (!obj || typeof obj !== 'object') {
      throw Error(metaNumError + 'Object expected');
    }
    var i, p, v,
      ps = [
        'maxRows', 10, 1000,
        'maxCols', 10, 1000,
        'serializeMode', 0, 1,
        'debug', 0, 2
      ];
    for (i = 0; i < ps.length; i += 3) {
      if ((v = obj[p = ps[i]]) !== void 0) {
        if (Math.floor(v) === v && v >= ps[i + 1] && v <= ps[i + 2]) this[p] = v;
        else throw Error(invalidArgument + p + ': ' + v);
      }
    }
    return this;
  }

  MetaNum = clone(MetaNum);
  MetaNum = defineConstants(MetaNum);
  MetaNum['default'] = MetaNum.MetaNum = MetaNum;

  if (typeof define == 'function' && define.amd) {
    define(function () {
      return MetaNum;
    });
  } else if (typeof module != 'undefined' && module.exports) {
    module.exports = MetaNum;
  } else {
    if (!globalScope) {
      globalScope = typeof self != 'undefined' && self && self.self == self
        ? self : Function('return this')();
    }
    globalScope.MetaNum = MetaNum;
  }
})(this);