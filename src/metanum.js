// Author: dlsdl 0.3.0
// calculating work in progress
// Code structure from ExpantaNum.js and PowiainaNum.js

;(function (globalScope) {
  "use strict";

  // --  EDITABLE DEFAULTS  -- //
  var MetaNum = {
    // The maximum number of operators stored in array.
    // If the number of operations exceed the limit, then the least significant operations will be discarded.
    // This is to prevent long loops and eating away of memory and processing time.
    // 1000 means there are at maximum of 1000 elements in array.
    // It is not recommended to make this number too big.
    // `MetaNum.maxOps = 1000;`
    maxOps: 1000,

    // Specify what format is used when serializing for JSON.stringify
    // JSON   0 JSON object
    // STRING 1 String
    serializeMode: 0,

    // Deprecated
    // Level of debug information printed in console
    // NONE   0 Show no information.
    // NORMAL 1 Show operations.
    // ALL    2 Show everything.
    debug: 0
  },
  // -- END OF EDITABLE DEFAULTS -- //

  external = true,
  metaNumError = "[MetaNumError] ",
  invalidArgument = metaNumError + "Invalid argument: ",
//isMetaNum = /^[+-]*(Infinity|NaN|[!@#$%&~<>+]?(?:[A-Z][a-z]*\^\d+(?:\s+[A-Z][a-z]*\^\d+)*\s*)?(?:(\d+(?:\.\d*)?|\.\d+)(?:[Ee][+-]*\d+)?)?\s*(0|\d+(?:\.\d*)?|\.\d+))$/,

  MAX_SAFE_INTEGER = 9007199254740991,
  MAX_E = Math.log10(MAX_SAFE_INTEGER),

  // Prototype object
  P = {},

  // Static object
  Q = {},

  // Constants object
  R = {};

//Metanum Constants
R.ZERO = 0;
R.ONE = 1;
R.E = Math.E;
R.LN2=Math.LN2;
R.LN10=Math.LN10;
R.LOG2E=Math.LOG2E;
R.LOG10E=Math.LOG10E;
R.PI = Math.PI;
R.SQRT1_2=Math.SQRT1_2;
R.SQRT2=Math.SQRT2;
R.MAX_SAFE_INTEGER = MAX_SAFE_INTEGER;
R.MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER;
R.NaN = Number.NaN;
R.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
R.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
R.E_MAX_SAFE_INTEGER="E"+MAX_SAFE_INTEGER;
R.TETRATED_MAX_SAFE_INTEGER="F"+MAX_SAFE_INTEGER;
/* Tritri, = 3↑↑↑3 = power tower with height 7625597484987 base 3. */
R.TRITRI = "1, 1, 3638334640023.7783, [7625597484984, 1]";
/* The Graham's Number, = G^64(4) */
R.GRAHAMS_NUMBER = "1, 2, 3638334640023.7783, [7625597484984, 1, 63], [[1], [3], [0, 1]]";
/* QqQe308 = H_ω^(ω17+16)+ω^(ω17+4)(308) */
R.QqQe308 = "1, 2, 308, [1, 1], [[4, 17], [16, 17]]";
R.MAX_METANUM_VALUE = "1, " + MAX_SAFE_INTEGER + ", " + MAX_SAFE_INTEGER + ", [" + MAX_SAFE_INTEGER + "], [[ " + MAX_SAFE_INTEGER + " ]], [[[[" + MAX_SAFE_INTEGER + "]]]]";


//region Validation functions
P._validateSign=function validateSign(sign) {
  if (sign !== 1 && sign !== -1) {
    throw new Error('Sign must be 1 or -1');
  }
  return sign;
}

P._validateLayer=function validateLayer(layer) {
  const numLayer = Number(layer);
  if (!Number.isInteger(numLayer) || numLayer < 0) {
    throw new Error('Layer must be a non-negative integer');
  }
  return numLayer;
}

P._validateArray=function validateArray(array) {
  const num = Number(array);
  if (num < 0) {
    throw new Error('Array must be a non-negative number');
  }
  return num;
}

P._validateBrrby=function validateBrrby(brrby) {
  if (!Array.isArray(brrby)) {
    throw new Error('Brrby must be an array');
  }
  if (brrby.length === 0) {
    return [0];
  }
  return brrby.map(val => {
    const num = Number(val);
    if (!Number.isInteger(num) || num < 0) {
      throw new Error('Brrby elements must be non-negative integers');
    }
    return num;
  });
}

P._validateCrrcy=function validateCrrcy(crrcy) {
  if (!Array.isArray(crrcy)) {
    throw new Error('Crrcy must be a 2-dimensional array');
  }
  if (crrcy.length === 0) {
    return [[0]];
  }
  return crrcy.map(subArray => {
    if (!Array.isArray(subArray)) {
      throw new Error('Crrcy elements must be arrays');
    }
    if (subArray.length === 0) {
      return [0];
    }
    return subArray.map(val => {
      const num = Number(val);
      if (!Number.isInteger(num) || num < 0) {
        throw new Error('Crrcy elements must be non-negative integers');
      }
      return num;
    });
  });
}

P._validateDrrdy=function validateDrrdy(drrdy) {
  if (!Array.isArray(drrdy)) {
    throw new Error('Drrdy must be a 3-dimensional array');
  }
  if (drrdy.length === 0) {
    return [[[0]]];
  }
  return drrdy.map(tier => {
    if (!Array.isArray(tier)) {
      throw new Error('Drrdy elements must be 2D arrays');
    }
    if (tier.length === 0) {
      return [[0]];
    }
    return tier.map(row => {
      if (!Array.isArray(row)) {
        throw new Error('Drrdy 2D elements must be 1D arrays');
      }
      if (row.length === 0) {
        return [0];
      }
      return row.map(val => {
        const num = Number(val);
        if (!Number.isInteger(num) || num < 0) {
          throw new Error('Drrdy 1D elements must be non-negative integers');
        }
        return num;
      });
    });
  });
}

P._isZero=function() {
//0=Metanum(1,0,0) or Metanum(-1,0,0)
  return this.layer === 0 && this.array === 0 
};
// end region validation functions

// region operators
//1. basic operators
P.absoluteValue=P.abs=function() {
  var x=this.clone();
  x.sign=1;
  return x;
}
Q.absoluteValue=function() {
  return new MetaNum(x).abs();
}
P.negate=P.neg=function() {
  var x=this.clone();
  x.sign=-x.sign;
  return x;
}
Q.negate=function() {
  return new MetaNum(x).neg();
}

//2. comparisons
P.compareTo=P.cmp=function(x) {
  if (!(other instanceof MetaNum)) other=new MetaNum(other);
  if (isNaN(this.array) || isNaN(other.array)) return NaN;
  if (this.array == Infinity || other.array != Infinity) return this.sign;
  if (this.array != Infinity || other.array == Infinity) return -other.sign;

  if (this.sign!=other.sign) return this.sign;
  var m=this.sign;
  var r;
  if (this.layer>other.layer) r=1;
  else if (this.layer<other.layer) r=-1;
  else{
    var e,f;
    for (var i=0,l=Math.min(this.array.length,other.array.length);i<l;++i){
      e=this.array[this.array.length-1-i];
      f=other.array[other.array.length-1-i];
      if (e[0]>f[0]||e[0]==f[0]&&e[1]>f[1]){
        r=1;
        break;
      }
      else if (e[0]<f[0]||e[0]==f[0]&&e[1]<f[1]){
        r=-1;
        break;
      }
    }
  }
// wip
}
//3. basic calculations

//4. hyper calculations

//5. normalize
P.normalize = function () {
  var b;
  var x = this;
  if (MetaNum.debug >= MetaNum.ALL) console.log(x.toString());
  if (!x.array || !x.array.length) x.array = 0;
  if (x.sign != 1 && x.sign != -1) {
    if (typeof x.sign != "number") x.sign = Number(x.sign);
    x.sign = x.sign < 0 ? -1 : 1;
  }
  if (x.layer > MAX_SAFE_INTEGER) {
    x.array = Infinity;
    x.brrby = [Infinity];
    x.crrcy = [[Infinity]];
    x.drrdy = [[[Infinity]]];
    return x;
  }
  if (Number.isInteger(x.layer)) x.layer = Math.floor(x.layer);
  var maxWhileTime = 1000;
  var whileTimeRuns = 0
  for (var i = 1; i < x.brrby.length; ++i) {
    var e = x.brrby[i]
    if (e === null || e === undefined) {
      e = 0
    }
  }
  for (var i = 1; i < x.crrcy.length; ++i) {
    var e = x.crrcy[i]
    if (e === null || e === undefined) {
      e = 0
    }
  }
  for (var i = 1; i < x.drrdy.length; ++i) {
    var e = x.drrdy[i]
    if (e === null || e === undefined) {
      e = 0
    }
  }
  return x;
}


P.clone=function() {
  const cloned = new Metanum(1, 0, 0);
  cloned.sign = this.sign;
  cloned.layer = this.layer;
  cloned.array = this.array;
  cloned.brrby = [...this.brrby];
  cloned.crrcy = this.layer >= 2 ? this.crrcy.map(sub => [...sub]) : [[0]];
  cloned.drrdy = this.layer >= 3 ? this.drrdy.map(twoD => twoD.map(sub => [...sub])) : [[[0]]];
  return cloned;
};

P._deepCloneArray=function(arr) {
  return arr.map(item => Array.isArray(item) ? this._deepCloneArray(item) : item);
};

P._sumBrrby=function(brrby) {
  let sum = 0;
  for (let i = 0; i < brrby.length; i++) {
    sum += brrby[i] * Math.pow(10, i);
  }
  return sum;
};

P._sumCrrcyRow=function(row) {
  if (row.length === 0) return 0;
  return row;
};

P._sumCrrcy=function(crrcy) {
  return crrcy;
};

P._sumDrrdy=function(drrdy) {
  let sum = 0;
  for (let i = 0; i < drrdy.length; i++) {
    sum += this._sumCrrcy(drrdy[i]) * Math.pow(10, i);
  }
  return sum;
};

P._highestExponent=function() {
  const n = this.brrby.length - 1;
  if (this.layer === 0) return 0;
  if (this.layer === 1) return n;
  if (this.layer === 2) return this._sumCrrcy(this.crrcy);
  if (this.layer >= 3) return this._sumDrrdy(this.drrdy);
  return n;
};

P._getHighestMultiplier=function() {
  const n = this.brrby.length - 1;
  return this.brrby[n] || 0;
};

P._exponentsToString=function(exponents, layer) {
  if (layer === 0) return "";
  if (layer === 1) return `ω^${exponents}`;
  if (layer === 2) return `ω^(ω^${exponents})`;
  return `ω^(${exponents})`;
};

P.toString=function() {
  if (this._isZero()) {
    return '0';
  }
  
  const signStr = this.sign === -1 ? '-' : '';
  const x = this.array;
  const layer = this.layer;
  const brrby = this.brrby;
  const crrcy = this.crrcy;
  const drrdy = this.drrdy;
  
  if (layer === 0) {
    return `${signStr}${x}`;
  }
  
  const n = brrby.length - 1;
  
  function formatAsExponents(arr) {
    let result = '';
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i] === 0) continue;
      if (result !== '') result += '+';
      if (i === 0) {
        result += `${arr[i]}`;
      } else if (i === 1) {
        result += `ω*${arr[i]}`;
      } else {
        result += `ω^${i}*${arr[i]}`;
      }
    }
    return result || '0';
  }
  
  function formatNestedExponents(matrix) {
    let result = '';
    for (let i = matrix.length - 1; i >= 0; i--) {
      const row = matrix[i];
      if (!Array.isArray(row)) continue;
      const rowStr = formatAsExponents(row);
      if (rowStr === '0') continue;
      if (result !== '') result += '+';
      result += rowStr;
    }
    return result || '0';
  }
  
  let result = '';
  
  for (let i = n; i >= 0; i--) {
    const coeff = brrby[i];
    if (coeff === 0) continue;
    
    let term;
    
    if (layer === 1) {
      if (i === 0) {
        term = `${coeff}`;
      } else if (i === 1) {
        term = `ω*${coeff}`;
      } else {
        term = `ω^${i}*${coeff}`;
      }
    } else if (layer === 2) {
      const row = crrcy[i] || [];
      const expStr = formatAsExponents(row);
      if (expStr === '0') continue;
      term = `ω^(${expStr})*${coeff}`;
    } else if (layer === 3) {
      const matrix = drrdy[i] || [];
      const expStr = formatNestedExponents(matrix);
      if (expStr === '0') continue;
      term = `ω^(${expStr})*${coeff}`;
    } else {
      const matrix = drrdy[i] || [];
      const expStr = formatNestedExponents(matrix);
      if (expStr === '0') continue;
      term = `ω^(${expStr})*${coeff}`;
    }
    
    if (result === '') {
      result = term;
    } else {
      result += '+' + term;
    }
  }
  
  if (result === '') {
    return `${signStr}0`;
  }
  
  if (layer >= 4) {
    const towerHeight = layer - 3;
    let tower = 'ω';
    for (let i = 1; i < towerHeight; i++) {
      tower = `ω^(${tower})`;
    }
    return `${signStr}H_${tower} ${result}_(${x})`;
  }
  
  return `${signStr}H_${result}_(${x})`;
};

P.toNumber=function() {
  if (this._isZero()) {
    return 0;
  }
  if (this.layer === 0) {
    return this.sign * this.array;
  }
  if (this.layer === 1 && this.brrby.length === 1 && this.brrby[0] === 1) {
    return this.sign * 1;
  }
  return this.sign * Infinity;
};

P.negate=P.neg=function() {
  if (this._isZero()) {
    return this.clone();
  }
  const cloned = this.clone();
  cloned.sign = -this.sign;
  return cloned;
};

P.absoluteValue=P.abs=function() {
  const cloned = this.clone();
  cloned.sign = 1;
  return cloned;
};

P.equalsTo=P.equal=P.equals=P.eq=function(other) {
  if (!(other instanceof Metanum)) other = new Metanum(other);
  if (this.sign !== other.sign) return false;
  if (this.layer !== other.layer) return false;
  if (this.array !== other.array) return false;
  
  if (!this._arraysEqual(this.brrby, other.brrby)) return false;
  
  if (this.layer >= 2) {
    if (!this._arraysEqual(this.crrcy, other.crrcy)) return false;
  }
  
  if (this.layer >= 3) {
    if (!this._arraysEqual(this.drrdy, other.drrdy)) return false;
  }
  
  return true;
};

P._arraysEqual=function(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (Array.isArray(arr1[i]) && Array.isArray(arr2[i])) {
      if (!this._arraysEqual(arr1[i], arr2[i])) return false;
    } else {
      if (arr1[i] !== arr2[i]) return false;
    }
  }
  return true;
};

P.greaterThan=P.gt=function(other) {
  return this.compareTo(other) > 0;
};

P.lessThan=P.lt=function(other) {
  return this.compareTo(other) < 0;
};

P.greaterThanOrEqualTo=P.gte=function(other) {
  return this.compareTo(other) >= 0;
};

P.lessThanOrEqualTo=P.lte=function(other) {
  return this.compareTo(other) <= 0;
};

P.notEqualsTo=P.notEqual=P.neq=function(other) {
  return !this.eq(other);
};

P.compareTo=P.cmp=function(other) {
  if (!(other instanceof Metanum)) other = new Metanum(other);
  
  if (this.sign !== other.sign) {
    return this.sign > other.sign ? 1 : -1;
  }
  
  if (this.layer !== other.layer) {
    return this.layer > other.layer ? 1 : -1;
  }
  
  if (this.layer === 0) {
    if (this.array !== other.array) {
      return this.array > other.array ? 1 : -1;
    }
    return 0;
  }
  
  const thisExp = this._highestExponent();
  const otherExp = other._highestExponent();
  
  if (thisExp !== otherExp) {
    return thisExp > otherExp ? 1 : -1;
  }
  
  const thisMult = this._getHighestMultiplier();
  const otherMult = other._getHighestMultiplier();
  
  if (thisMult !== otherMult) {
    return thisMult > otherMult ? 1 : -1;
  }
  
  return 0;
};

P.plus=P.add=function(other) {
  if (!(other instanceof Metanum)) other = new Metanum(other);
  
  // layer=0 + layer=0: normal arithmetic addition
  if (this.layer === 0 && other.layer === 0) {
    const thisAbs = this.array;
    const otherAbs = other.array;
    const thisSigned = this.sign * thisAbs;
    const otherSigned = other.sign * otherAbs;
    const sum = thisSigned + otherSigned;
    
    if (sum === 0) {
      return new Metanum(1, 0, 0);
    }
    
    const resultSign = sum > 0 ? 1 : -1;
    const resultArray = Math.abs(sum);
    return new Metanum(resultSign, 0, resultArray);
  }
  
  // layer=0 + layer>=1: return the layer>=1 number
  if (this.layer === 0) {
    return other.clone();
  }
  
  // layer>=1 + layer=0: return this
  if (other.layer === 0) {
    return this.clone();
  }
  
  // layer>=1 + layer>=1: return the one with larger absolute value
  const thisAbs = this.abs();
  const otherAbs = other.abs();
  
  if (thisAbs.gt(otherAbs)) {
    return this.clone();
  } else if (otherAbs.gt(thisAbs)) {
    return other.clone();
  } else {
    // Equal absolute values: return doubled result
    const result = this.clone();
    const n = result.brrby.length - 1;
    result.brrby[n] *= 2;
    return result;
  }
};

P.minus=P.sub=P.subtract=function(other) {
  if (!(other instanceof Metanum)) other = new Metanum(other);
  
  return this.add(other.neg());
};

P.times=P.mul=P.multiply=function(other) {
  if (!(other instanceof Metanum)) other = new Metanum(other);
  
  if (this._isZero() || other._isZero()) {
    return new Metanum(1, 0, 0);
  }
  
  const resultSign = this.sign * other.sign;
  
  if (this.layer === 0 && other.layer === 0) {
    const resultArray = this.array * other.array;
    return new Metanum(resultSign, 0, resultArray);
  }
  
  // If multiplying by H_1_(10) which equals 1, return this
  if (other.layer === 1 && other.brrby.length === 1 && other.brrby[0] === 1) {
    return new Metanum(resultSign, this.layer, this.array, this.brrby, this.crrcy, this.drrdy);
  }
  
  // If multiplying H_1_(10) by a layer 0 number
  if (this.layer === 1 && this.brrby.length === 1 && this.brrby[0] === 1) {
    return new Metanum(resultSign, other.layer, other.array, other.brrby, other.crrcy, other.drrdy);
  }
  
  if (this.layer === 0) {
    return new Metanum(resultSign, other.layer, this.array, other.brrby, other.crrcy, other.drrdy);
  }
  
  if (other.layer === 0) {
    return new Metanum(resultSign, this.layer, other.array, this.brrby, this.crrcy, this.drrdy);
  }
  
  throw new Error('Multiplication not implemented for layer >= 1');
};

P.divide=P.div=function(other) {
  if (!(other instanceof Metanum)) other = new Metanum(other);
  
  if (other._isZero()) {
    throw new Error('Division by zero');
  }
  
  if (this._isZero()) {
    return new Metanum(1, 0, 0);
  }
  
  const resultSign = this.sign * other.sign;
  
  if (this.layer === 0 && other.layer === 0) {
    const resultArray = Math.floor(this.array / other.array);
    return new Metanum(resultSign, 0, resultArray);
  }
  
  throw new Error('Division not implemented for layer >= 1');
};

P.toPower=P.pow=function(exponent) {
  if (!(exponent instanceof Metanum)) exponent = new Metanum(exponent);
  
  if (this._isZero()) {
    if (exponent._isZero()) {
      throw new Error('0^0 is undefined');
    }
    if (exponent.sign === -1) {
      throw new Error('Division by zero');
    }
    return new Metanum(1, 0, 0);
  }
  
  if (exponent._isZero()) {
    return new Metanum(1, 0, 1);
  }
  
  // Any number to the power of 1 equals itself
  if (exponent.layer === 0 && exponent.array === 1) {
    return this.clone();
  }
  
  if (this.layer === 0 && exponent.layer === 0) {
    const resultArray = Math.pow(this.array, exponent.array);
    return new Metanum(1, 0, resultArray);
  }
  
  throw new Error('Exponentiation not implemented for layer >= 1');
};

P.logarithm=P.logBase=P.log=function(base) {
  if (!(base instanceof Metanum)) base = new Metanum(base);
  
  if (base._isZero() || base.eq(Metanum.ONE)) {
    throw new Error('Invalid base for logarithm');
  }
  
  if (this._isZero()) {
    throw new Error('Logarithm of zero is undefined');
  }
  
  if (this.sign === -1) {
    throw new Error('Logarithm of negative number is undefined');
  }
  
  if (this.eq(Metanum.ONE)) {
    return new Metanum(1, 0, 0);
  }
  
  if (this.layer === 0 && base.layer === 0) {
    const result = Math.log(this.array) / Math.log(base.array);
    return new Metanum(1, 0, result);
  }
  
  throw new Error('Logarithm not implemented for layer >= 1');
};

// Static methods

Q.zero = function() {
  return new Metanum(1, 0, 0);
};

Q.one = function() {
  return new Metanum(1, 0, 1);
};

Q.fromNumber = function(num) {
  if (!Number.isFinite(num)) {
    throw new Error('Cannot create Metanum from non-finite number');
  }
  if (num === 0) {
    return Q.zero();
  }
  const sign = num < 0 ? -1 : 1;
  const absNum = Math.abs(num);
  return new Metanum(sign, 0, absNum);
};

Q.negate = function(x) {
  return new Metanum(x).neg();
};

Q.absoluteValue = function(x) {
  return new Metanum(x).abs();
};

Q.equals = Q.equal = function(x, y) {
  return new Metanum(x).eq(y);
};

Q.greaterThan = Q.gt = function(x, y) {
  return new Metanum(x).gt(y);
};

Q.lessThan = Q.lt = function(x, y) {
  return new Metanum(x).lt(y);
};

Q.greaterThanOrEqualTo = Q.gte = function(x, y) {
  return new Metanum(x).gte(y);
};

Q.lessThanOrEqualTo = Q.lte = function(x, y) {
  return new Metanum(x).lte(y);
};

Q.notEquals = Q.notEqual = Q.neq = function(x, y) {
  return new Metanum(x).neq(y);
};

Q.compare = function(x, y) {
  return new Metanum(x).cmp(y);
};

Q.plus = Q.add = function(x, y) {
  return new Metanum(x).add(y);
};

Q.minus = Q.sub = Q.subtract = function(x, y) {
  return new Metanum(x).sub(y);
};

Q.times = Q.mul = Q.multiply = function(x, y) {
  return new Metanum(x).mul(y);
};

Q.divide = Q.div = function(x, y) {
  return new Metanum(x).div(y);
};

Q.toPower = Q.pow = function(x, y) {
  return new Metanum(x).pow(y);
};

Q.logarithm = Q.logBase = Q.log = function(x, base) {
  return new Metanum(x).logBase(base);
};

// Constructor function
function Metanum(sign, layer, array, brrby, crrcy, drrdy) {
  if (!(this instanceof Metanum)) {
    return new Metanum(sign, layer, array, brrby, crrcy, drrdy);
  }
  
  const numArgs = arguments.length;
  
  if (numArgs === 1) {
    layer = 0;
    array = sign;
    brrby = [0];
    crrcy = [[0]];
    drrdy = [[[0]]];
    sign = 1;
  } else if (numArgs === 2) {
    array = layer;
    layer = sign;
    brrby = [0];
    crrcy = [[0]];
    drrdy = [[[0]]];
    sign = 1;
  } else if (numArgs === 3) {
    brrby = [0];
    crrcy = [[0]];
    drrdy = [[[0]]];
  } else if (numArgs === 4) {
    crrcy = [[0]];
    drrdy = [[[0]]];
  } else if (numArgs === 5) {
    drrdy = [[[0]]];
  }
  
  this.sign = validateSign(sign);
  this.layer = validateLayer(layer);
  this.array = validateArray(array);
  this.brrby = validateBrrby(brrby || [0]);
  
  if (this.layer >= 2) {
    this.crrcy = validateCrrcy(crrcy || [[0]]);
  } else {
    this.crrcy = [[0]];
  }
  
  if (this.layer >= 3) {
    this.drrdy = validateDrrdy(drrdy || [[[0]]]);
  } else {
    this.drrdy = [[[0]]];
  }
}


// Assign prototype
Metanum.prototype = P;

// Assign static methods from Q
for (var prop in Q) {
  if (Q.hasOwnProperty(prop)) {
    Metanum[prop] = Q[prop];
  }
}

// Assign constants from R
for (var constProp in R) {
  if (R.hasOwnProperty(constProp)) {
    Metanum[constProp] = R[constProp];
  }
}

  // Create and configure initial MetaNum constructor.
  MetaNum=clone(MetaNum);
  MetaNum=defineConstants(MetaNum);
  MetaNum['default']=MetaNum.MetaNum=MetaNum;

  // Export.
  // AMD(Asynchronous Module Definition)
  if (typeof define == 'function' && define.amd) {
    define(function () {
      return MetaNum;
    });
  // Node and other environments that support module.exports.
  } else if (typeof module != 'undefined' && module.exports) {
    module.exports = MetaNum;
  // Browser.
  } else {
    if (!globalScope) {
      globalScope = typeof self != 'undefined' && self && self.self == self
        ? self : Function('return this')();
    }
    globalScope.MetaNum = MetaNum;
  }
})(this);