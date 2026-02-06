// Author: dlsdl 0.2.0
// New Metanum data structure with Cantor normal form
// Code structure from ExpantaNum.js

// -- EDITABLE DEFAULTS --
var MetanumDefaults = {
  maxOps: 1e3,
  serializeMode: 0,
  debug: 0
};
// -- END OF EDITABLE DEFAULTS --

var metanumError = "[MetanumError] ",
    MAX_SAFE_INTEGER = 9007199254740991,

    P={},
    R={};

// Constants
R.ZERO=0;
R.ONE=1;
R.E=Math.E;
R.PI=Math.PI;
R.MAX_SAFE_INTEGER=MAX_SAFE_INTEGER;
R.NaN=Number.NaN;
R.NEGATIVE_INFINITY=Number.NEGATIVE_INFINITY;
R.POSITIVE_INFINITY=Number.POSITIVE_INFINITY;

// Prototype methods

P._validateSign=function(sign) {
  if (sign !== 1 && sign !== -1) {
    throw new Error('Sign must be 1 or -1');
  }
  return sign;
};

P._validateLayer=function(layer) {
  const numLayer = Number(layer);
  if (!Number.isInteger(numLayer) || numLayer < 0) {
    throw new Error('Layer must be a non-negative integer');
  }
  return numLayer;
};

P._validateArray=function(array) {
  const num = Number(array);
  if (num < 0) {
    throw new Error('Array must be a non-negative number');
  }
  return num;
};

P._validateBrrby=function(brrby) {
  if (!Array.isArray(brrby)) {
    throw new Error('Brrby must be an array');
  }
  if (brrby.length === 0) {
    return [0];
  }
  const result = brrby.map(val => {
    const num = Number(val);
    if (!Number.isInteger(num) || num < 0) {
      throw new Error('Brrby elements must be non-negative integers');
    }
    return num;
  });
  // Reverse to match expected behavior (lowest to highest index)
  return result.reverse();
};

P._validateCrrcy=function(crrcy) {
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
};

P._validateDrrdy=function(drrdy) {
  if (!Array.isArray(drrdy)) {
    throw new Error('Drrdy must be a 3-dimensional array');
  }
  if (drrdy.length === 0) {
    return [[[0]]];
  }
  return drrdy.map(twoDArray => {
    if (!Array.isArray(twoDArray)) {
      throw new Error('Drrdy elements must be 2D arrays');
    }
    if (twoDArray.length === 0) {
      return [[0]];
    }
    return twoDArray.map(subArray => {
      if (!Array.isArray(subArray)) {
        throw new Error('Drrdy sub-elements must be arrays');
      }
      if (subArray.length === 0) {
        return [0];
      }
      return subArray.map(val => {
        const num = Number(val);
        if (!Number.isInteger(num) || num < 0) {
          throw new Error('Drrdy elements must be non-negative integers');
        }
        return num;
      });
    });
  });
};

P._isZero=function() {
//0=Metanum(1,0,0) or Metanum(-1,0,0)
  return this.layer === 0 && this.array === 0 
};

P.clone=function() {
  const newBrrby = [...this.brrby];
  const newCrrcy = this.layer >= 2 ? this.crrcy.map(sub => [...sub]) : [[0]];
  const newDrrdy = this.layer >= 3 ? this.drrdy.map(twoD => twoD.map(sub => [...sub])) : [[[0]]];
  return new Metanum(
    this.sign,
    this.layer,
    this.array,
    newBrrby,
    newCrrcy,
    newDrrdy
  );
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
  let sum = 0;
  for (let i = 0; i < row.length; i++) {
    sum += row[i] * Math.pow(10, i);
  }
  return sum;
};

P._sumCrrcy=function(crrcy) {
  let sum = 0;
  for (let i = 0; i < crrcy.length; i++) {
    sum += this._sumCrrcyRow(crrcy[i]) * Math.pow(10, i);
  }
  return sum;
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
  const brrby = this.brrby;
  const crrcy = this.crrcy;
  const drrdy = this.drrdy;
  const layer = this.layer;
  
  if (layer === 0) {
    return `${signStr}${x}`;
  }
  
  const n = brrby.length - 1;
  
  let result = '';
  
  for (let i = n; i >= 0; i--) {
    if (brrby[i] === 0) continue;
    
    let exponent;
    if (layer === 1) {
      exponent = i;
    } else if (layer === 2) {
      exponent = this._sumCrrcyRow(crrcy[i]);
    } else {
      exponent = this._sumCrrcy(drrdy[i]);
    }
    
    if (i === n) {
      if (layer === 0) {
        result += `${brrby[i]}`;
      } else if (layer === 1) {
        result += `H_ω^${i}*${brrby[i]}_(${x})`;
      } else if (layer === 2) {
        result += `H_ω^(ω^${exponent})*${brrby[i]}_(${x})`;
      } else if (layer === 3) {
        result += `H_ω^(ω^(ω^${exponent}))*${brrby[i]}_(${x})`;
      } else {
        const towerHeight = layer - 3;
        let tower = 'ω';
        for (let j = 0; j < towerHeight; j++) {
          tower = `ω^(${tower})`;
        }
        result += `H_${tower}*${brrby[i]}_(${x})`;
      }
    } else {
      if (layer === 1) {
        if (i === 1) {
          result += `+ω*${brrby[i]}`;
        } else if (i === 0) {
          result += `+${brrby[i]}`;
        } else {
          result += `+ω^${i}*${brrby[i]}`;
        }
      } else {
        result += `+ω^${exponent}*${brrby[i]}`;
      }
    }
  }
  
  return result ? `${signStr}${result}` : `${signStr}0`;
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
  
  // If dividing by H_1_(10) which equals 1, return this
  if (other.layer === 1 && other.brrby.length === 1 && other.brrby[0] === 1) {
    return new Metanum(this.sign, this.layer, this.array, this.brrby, this.crrcy, this.drrdy);
  }
  
  const resultSign = this.sign * other.sign;
  
  if (this.layer === 0 && other.layer === 0) {
    const resultArray = Math.floor(this.array / other.array);
    if (resultArray === 1) {
      return new Metanum(resultSign, 1, 10, [1]);
    }
    if (resultArray === 0) {
      return new Metanum(1, 0, 0);
    }
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
    return new Metanum(1, 1, 10, [1]);
  }
  
  // Any number to the power of 1 equals itself
  if (exponent.layer === 1 && exponent.brrby.length === 1 && exponent.brrby[0] === 1) {
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

function zero() {
  return new Metanum(1, 0, 0);
}

function one() {
  return new Metanum(1, 1, 10, [1]);
}

function fromNumber(num) {
  if (!Number.isFinite(num)) {
    throw new Error('Cannot create Metanum from non-finite number');
  }
  if (num === 0) {
    return zero();
  }
  const sign = num < 0 ? -1 : 1;
  const absNum = Math.abs(num);
  return new Metanum(sign, 0, absNum);
}

function negate(x) {
  return new Metanum(x).neg();
}

function absoluteValue(x) {
  return new Metanum(x).abs();
}

function equalsTo(x, y) {
  return new Metanum(x).eq(y);
}

function greaterThan(x, y) {
  return new Metanum(x).gt(y);
}

function lessThan(x, y) {
  return new Metanum(x).lt(y);
}

function greaterThanOrEqualTo(x, y) {
  return new Metanum(x).gte(y);
}

function lessThanOrEqualTo(x, y) {
  return new Metanum(x).lte(y);
}

function notEqualsTo(x, y) {
  return new Metanum(x).neq(y);
}

function compare(x, y) {
  return new Metanum(x).cmp(y);
}

function plus(x, y) {
  return new Metanum(x).add(y);
}

function minus(x, y) {
  return new Metanum(x).sub(y);
}

function times(x, y) {
  return new Metanum(x).mul(y);
}

function divide(x, y) {
  return new Metanum(x).div(y);
}

function toPower(x, y) {
  return new Metanum(x).pow(y);
}

function logarithm(x, base) {
  return new Metanum(x).logBase(base);
}

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
  
  this.sign = this._validateSign(sign);
  this.layer = this._validateLayer(layer);
  this.array = this._validateArray(array);
  this.brrby = this._validateBrrby(brrby || [0]);
  
  if (this.layer >= 2) {
    this.crrcy = this._validateCrrcy(crrcy || [[0]]);
  } else {
    this.crrcy = [[0]];
  }
  
  if (this.layer >= 3) {
    this.drrdy = this._validateDrrdy(drrdy || [[[0]]]);
  } else {
    this.drrdy = [[[0]]];
  }
}

// Assign prototype
Metanum.prototype = P;

// Assign static methods
Metanum.zero = zero;
Metanum.one = one;
Metanum.fromNumber = fromNumber;
Metanum.negate = Metanum.neg = negate;
Metanum.absoluteValue = Metanum.abs = absoluteValue;
Metanum.equalsTo = Metanum.equal = Metanum.equals = Metanum.eq = equalsTo;
Metanum.greaterThan = Metanum.gt = greaterThan;
Metanum.lessThan = Metanum.lt = lessThan;
Metanum.greaterThanOrEqualTo = Metanum.gte = greaterThanOrEqualTo;
Metanum.lessThanOrEqualTo = Metanum.lte = lessThanOrEqualTo;
Metanum.notEqualsTo = Metanum.notEqual = Metanum.neq = notEqualsTo;
Metanum.compare = Metanum.cmp = compare;
Metanum.plus = Metanum.add = plus;
Metanum.minus = Metanum.sub = minus;
Metanum.times = Metanum.mul = times;
Metanum.divide = Metanum.div = divide;
Metanum.toPower = Metanum.pow = toPower;
Metanum.logarithm = Metanum.logBase = Metanum.log = logarithm;

// Assign constants
for (var prop in R) {
  if (R.hasOwnProperty(prop)) {
    Metanum[prop] = R[prop];
  }
}

// Assign defaults
for (var prop in MetanumDefaults) {
  if (MetanumDefaults.hasOwnProperty(prop)) {
    Metanum[prop] = MetanumDefaults[prop];
  }
}

// Assign zero and one as static properties
Metanum.ZERO = Metanum.zero();
Metanum.ONE = Metanum.one();

export default Metanum;
