/* Author: dlsdl 0.1.0*/

// --  EDITABLE DEFAULTS  -- //
var MetanumDefaults = {

  // The maximum number of operators stored in array.
  // If the number of operations exceed the limit, then the least significant operations will be discarded.
  // This is to prevent long loops and eating away of memory and processing time.
  // 1000 means there are at maximum of 1000 elements in array.
  // It is not recommended to make this number too big.
  // `Metanum.maxOps = 1000;`
  maxOps: 1e3,

  // Specify what format is used when serializing for JSON.stringify
  //
  // JSON   0 JSON object
  // STRING 1 String
  serializeMode: 0,

  // Deprecated
  // Level of debug information printed in console
  //
  // NONE   0 Show no information.
  // NORMAL 1 Show operations.
  // ALL    2 Show everything.
  debug: 0
};

// -- END OF EDITABLE DEFAULTS -- //

var metanumError = "[MetanumError] ",
    invalidArgument = metanumError + "Invalid argument: ",

    MAX_SAFE_INTEGER = 9007199254740991,

    // Metanum.prototype object
    P={},
    // Metanum static object
    Q={},
    // Metanum constants
    R={};

R.ZERO=0;
R.ONE=1;
R.E=Math.E;
R.LN2=Math.LN2;
R.LN10=Math.LN10;
R.LOG2E=Math.LOG2E;
R.LOG10E=Math.LOG10E;
R.PI=Math.PI;
R.SQRT1_2=Math.SQRT1_2;
R.SQRT2=Math.SQRT2;
R.MAX_SAFE_INTEGER=MAX_SAFE_INTEGER;
R.MIN_SAFE_INTEGER=Number.MIN_SAFE_INTEGER;
R.NaN=Number.NaN;
R.NEGATIVE_INFINITY=Number.NEGATIVE_INFINITY;
R.POSITIVE_INFINITY=Number.POSITIVE_INFINITY;

// Metanum prototype methods

P._validateSign=function(sign) {
  if (sign !== 1 && sign !== -1) {
    throw new Error('Sign must be 1 or -1');
  }
  return sign;
};

P._validateLevel=function(level) {
  const numLevel = Number(level);
  if (!Number.isInteger(numLevel) || numLevel < 0) {
    throw new Error('Level must be a non-negative integer');
  }
  return numLevel;
};

P._validateAndNormalizeArray=function(array, level) {
  if (level === 0) {
    const num = Number(array);
    if (!Number.isInteger(num) || num < 0) {
      throw new Error('Level 0 array must be a non-negative integer');
    }
    return [num];
  } else if (level === 1) {
    if (!Array.isArray(array)) {
      throw new Error('Level 1 array must be an array');
    }
    if (array.length === 0) {
      return [0];
    }
    return array.map(val => {
      const num = Number(val);
      if (!Number.isInteger(num) || num < 0) {
        throw new Error('Level 1 array elements must be non-negative integers');
      }
      return num;
    });
  } else {
    if (!Array.isArray(array)) {
      throw new Error('Level >= 2 array must be a 2-dimensional array');
    }
    if (array.length === 0) {
      return [[0]];
    }
    return array.map(subArray => {
      if (!Array.isArray(subArray)) {
        throw new Error('Level >= 2 array must contain only arrays');
      }
      if (subArray.length === 0) {
        return [0];
      }
      return subArray.map(val => {
        const num = Number(val);
        if (!Number.isInteger(num) || num < 0) {
          throw new Error('Level >= 2 array elements must be non-negative integers');
        }
        return num;
      });
    });
  }
};

P._deepNormalizeArray=function(array) {
  return array;
};

P._validateConsistency=function() {
  this._checkMaxValue();
};

P._checkMaxValue=function() {
  //MAX_SAFE_INTEGER=9007199254740991
  if (this.level > 0 && this.array.length > 0) {
    const firstCoeff = this.array[0][0];
    if (firstCoeff > Math.MAX_SAFE_INTEGER) {
      throw new Error(`Value exceeds maximum representable value H_ε0_(${Math.MAX_SAFE_INTEGER})`);
    }
  }
};

P._isZero=function() {
  if (this.level === 0) {
    return this.array[0] === 0;
  } else if (this.level === 1) {
    return this.array.length === 1 && this.array[0] === 0;
  } else {
    return this.array.length === 1 && 
           this.array[0].length === 1 && 
           this.array[0][0] === 0;
  }
};

P.clone=function() {
  const clonedArray = this._deepCloneArray(this.array);
  return new Metanum(this.sign, clonedArray, this.level);
};

P._deepCloneArray=function(array) {
  if (Array.isArray(array) && array.length > 0 && Array.isArray(array[0])) {
    return array.map(subArray => [...subArray]);
  } else {
    return [...array];
  }
};

P._trimTrailingZeros=function(array) {
  const result = [];
  for (const subArray of array) {
    let trimIndex = subArray.length;
    while (trimIndex > 1 && subArray[trimIndex - 1] === 0) {
      trimIndex--;
    }
    result.push(subArray.slice(0, trimIndex));
  }
  let trimOuter = result.length;
  while (trimOuter > 1 && result[trimOuter - 1][0] === 0) {
    trimOuter--;
  }
  return result.slice(0, trimOuter);
};

P._compareArrays=function(arr1, arr2) {
  const len1 = arr1.length;
  const len2 = arr2.length;
  if (len1 !== len2) {
    return len1 - len2;
  }
  for (let i = len1 - 1; i >= 0; i--) {
    if (Array.isArray(arr1[i]) && Array.isArray(arr2[i])) {
      const cmp = this._compareSubArrays(arr1[i], arr2[i]);
      if (cmp !== 0) {
        return cmp;
      }
    } else {
      if (arr1[i] !== arr2[i]) {
        return arr1[i] - arr2[i];
      }
    }
  }
  return 0;
};

P._compareSubArrays=function(arr1, arr2) {
  const len1 = arr1.length;
  const len2 = arr2.length;
  if (len1 !== len2) {
    return len1 - len2;
  }
  for (let i = len1 - 1; i >= 0; i--) {
    if (arr1[i] !== arr2[i]) {
      return arr1[i] - arr2[i];
    }
  }
  return 0;
};

P._addArrays=function(arr1, arr2) {
  const maxLength = Math.max(arr1.length, arr2.length);
  const result = [];
  for (let i = 0; i < maxLength; i++) {
    const sub1 = arr1[i] || [0];
    const sub2 = arr2[i] || [0];
    result.push(this._addSubArrays(sub1, sub2));
  }
  return this._trimTrailingZeros(result);
};

P._addSubArrays=function(arr1, arr2) {
  const maxLength = Math.max(arr1.length, arr2.length);
  const result = new Array(maxLength).fill(0);
  for (let i = 0; i < arr1.length; i++) {
    result[i] += arr1[i];
  }
  for (let i = 0; i < arr2.length; i++) {
    result[i] += arr2[i];
  }
  return result;
};

P._subtractArrays=function(arr1, arr2) {
  const result = [];
  const maxLength = Math.max(arr1.length, arr2.length);
  for (let i = 0; i < maxLength; i++) {
    const sub1 = arr1[i] || [0];
    const sub2 = arr2[i] || [0];
    result.push(this._subtractSubArrays(sub1, sub2));
  }
  return this._trimTrailingZeros(result);
};

P._subtractSubArrays=function(arr1, arr2) {
  const maxLength = Math.max(arr1.length, arr2.length);
  const result = new Array(maxLength).fill(0);
  for (let i = 0; i < arr1.length; i++) {
    result[i] += arr1[i];
  }
  for (let i = 0; i < arr2.length; i++) {
    result[i] -= arr2[i];
  }
  return result;
};

P._multiplyArrayByScalar=function(array, scalar) {
  if (scalar === 0) {
    return [[0]];
  }
  const result = [];
  for (const subArray of array) {
    const newSubArray = [];
    for (const val of subArray) {
      const newVal = val * scalar;
      if (!Number.isInteger(newVal) || newVal < 0) {
        throw new Error('Scalar multiplication must result in non-negative integers');
      }
      newSubArray.push(newVal);
    }
    result.push(newSubArray);
  }
  return result;
};

P._multiplyArrays=function(arr1, arr2) {
  if (this._isZeroArray(arr1) || this._isZeroArray(arr2)) {
    return [[0]];
  }
  const result = [];
  for (let i = 0; i < arr1.length; i++) {
    for (let j = 0; j < arr2.length; j++) {
      const coeff = arr1[i][0] * arr2[j][0];
      if (coeff > 0) {
        const ordinal1 = this._subArrayToOrdinalArray(arr1[i]);
        const ordinal2 = this._subArrayToOrdinalArray(arr2[j]);
        const sumOrdinal = this._addOrdinalArrays(ordinal1, ordinal2);
        result.push([coeff, ...sumOrdinal]);
      }
    }
  }
  return this._trimTrailingZeros(result);
};

P._subArrayToOrdinalArray=function(subArray) {
  return subArray.slice(1);
};

P._addOrdinalArrays=function(ord1, ord2) {
  const maxLength = Math.max(ord1.length, ord2.length);
  const result = new Array(maxLength).fill(0);
  for (let i = 0; i < ord1.length; i++) {
    result[i] += ord1[i];
  }
  for (let i = 0; i < ord2.length; i++) {
    result[i] += ord2[i];
  }
  return result;
};

P._isZeroArray=function(array) {
  return array.length === 1 && 
         array[0].length === 1 && 
         array[0][0] === 0;
};

P.negate=P.neg=function() {
  if (this._isZero()) {
    return this.clone();
  }
  return new Metanum(-this.sign, this._deepCloneArray(this.array), this.level);
};

P.absoluteValue=P.abs=function() {
  return new Metanum(1, this._deepCloneArray(this.array), this.level);
};

P.toString=function() {
  if (this._isZero()) {
    return '0';
  }
  const signStr = this.sign === -1 ? '-' : '';
  if (this.level === 0) {
    return `${signStr}${this.array[0]}`;
  }
  return `${signStr}H_${this._arrayToOrdinal()}_(10)`;
};

P._arrayToOrdinal=function() {
  if (this.level === 0) {
    return this.array[0].toString();
  }
  if (this.level === 1) {
    return this._level1ToString();
  }
  return this._levelNToString(this.level);
};

P._level1ToString=function() {
  const parts = [];
  const arr = this.array;
  for (let i = arr.length - 1; i >= 1; i--) {
    if (arr[i] > 0) {
      if (i === 1) {
        parts.push(`ω*${arr[i]}`);
      } else {
        parts.push(`ω^${i}*${arr[i]}`);
      }
    }
  }
  if (arr[0] > 0) {
    parts.push(arr[0].toString());
  }
  return parts.join('+') || '0';
};

P._levelNToString=function(n) {
  if (n === 1) {
    return this._level1ToString();
  }
  const parts = [];
  for (let i = 0; i < this.array.length; i++) {
    const subArray = this.array[i];
    const coeff = subArray[0];
    if (coeff > 0) {
      if (subArray.length === 1) {
        parts.push(`ω*${coeff}`);
      } else if (n === 2 && subArray.length === 2) {
        parts.push(`ω^${subArray[1]}*${coeff}`);
      } else {
        const ordinal = this._subArrayToOrdinal(subArray, n - 1);
        parts.push(`ω^(${ordinal})*${coeff}`);
      }
    }
  }
  return parts.join('+') || '0';
};

P._subArrayToOrdinal=function(subArray, level) {
  if (level === 0) {
    return subArray[0].toString();
  }
  if (level === 1 && subArray.length === 2) {
    return `ω^${subArray[1]}`;
  }
  const parts = [];
  for (let i = subArray.length - 1; i >= 1; i--) {
    if (subArray[i] > 0) {
      const exponent = i - 1;
      if (exponent === 0) {
        parts.push(`ω*${subArray[i]}`);
      } else {
        parts.push(`ω^${exponent}*${subArray[i]}`);
      }
    }
  }
  if (subArray[0] > 0 && !(level === 1 && subArray.length === 2)) {
    parts.push(subArray[0].toString());
  }
  return parts.join('+') || '0';
};

P.toNumber=function() {
  if (this._isZero()) {
    return 0;
  }
  if (this.level === 0) {
    return this.sign * this.array[0];
  }
  if (this.level === 1) {
    let value = this.array[0];
    for (let i = 1; i < this.array.length; i++) {
      if (this.array[i] > 0) {
        const exponent = Math.pow(10, i);
        value += this.array[i] * exponent;
      }
    }
    return this.sign * value;
  }
  return this.sign * Infinity;
};

P.equalsTo=P.equal=P.equals=P.eq=function(other) {
  if (!(other instanceof Metanum)) other=new Metanum(other);
  if (this.sign !== other.sign) {
    return false;
  }
  if (this.level !== other.level) {
    return false;
  }
  return this._arraysEqual(this.array, other.array);
};

P.greaterThan=P.gt=function(other) {
  return this.cmp(other)>0;
};

P.lessThan=P.lt=function(other) {
  return this.cmp(other)<0;
};

P.greaterThanOrEqualTo=P.gte=function(other) {
  return this.cmp(other)>=0;
};

P.lessThanOrEqualTo=P.lte=function(other) {
  return this.cmp(other)<=0;
};

P.notEqualsTo=P.notEqual=P.neq=function(other) {
  return !this.eq(other);
};

P.compareTo=P.cmp=function(other) {
  if (!(other instanceof Metanum)) other=new Metanum(other);
  if (this.sign !== other.sign) return this.sign;
  if (this.level !== other.level) return this.level > other.level ? 1 : -1;
  const cmp = this._compareArrays(this.array, other.array);
  return this.sign === 1 ? cmp : -cmp;
};

P._arraysEqual=function(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i++) {
    if (Array.isArray(arr1[i]) && Array.isArray(arr2[i])) {
      if (arr1[i].length !== arr2[i].length) {
        return false;
      }
      for (let j = 0; j < arr1[i].length; j++) {
        if (arr1[i][j] !== arr2[i][j]) {
          return false;
        }
      }
    } else {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }
  }
  return true;
};

P.plus=P.add=function(other) {
  if (!(other instanceof Metanum)) other=new Metanum(other);
  if (this._isZero()) {
    return other.clone();
  }
  if (other._isZero()) {
    return this.clone();
  }
  if (this.level !== other.level) {
    throw new Error('Cannot add Metanums with different levels');
  }
  const cmp = this._compareArrays(this.array, other.array);
  if (cmp > 0) {
    return this.clone();
  } else if (cmp < 0) {
    return other.clone();
  } else {
    return this.clone();
  }
};

P.minus=P.sub=P.subtract=function(other) {
  if (!(other instanceof Metanum)) other=new Metanum(other);
  if (other._isZero()) {
    return this.clone();
  }
  if (this._isZero()) {
    return other.neg();
  }
  if (this.level !== other.level) {
    throw new Error('Cannot subtract Metanums with different levels');
  }
  if (this.sign !== other.sign) {
    if (this.sign === 1) {
      return this.clone();
    } else {
      return other.clone();
    }
  }
  const cmp = this._compareArrays(this.array, other.array);
  if (cmp === 0) {
    return Metanum.zero();
  }
  if (cmp > 0) {
    return this.clone();
  } else {
    return other.clone();
  }
};

P.times=P.mul=P.multiply=function(other) {
  if (!(other instanceof Metanum)) other=new Metanum(other);
  if (this._isZero() || other._isZero()) {
    return Metanum.zero();
  }
  const resultSign = this.sign * other.sign;
  if (this.level === 0 && other.level === 0) {
    const result = this.array[0] * other.array[0];
    return new Metanum(resultSign, result, 0);
  }
  if (this.level === 1 && other.level === 1) {
    const num1 = this.toNumber();
    const num2 = other.toNumber();
    const result = num1 * num2;
    return Metanum.fromNumber(result);
  }
  if (this.level !== other.level) {
    throw new Error('Cannot multiply Metanums with different levels');
  }
  throw new Error('Multiplication not implemented for this level');
};

P.divide=P.div=function(other) {
  if (!(other instanceof Metanum)) other=new Metanum(other);
  if (other._isZero()) {
    throw new Error('Division by zero');
  }
  if (this._isZero()) {
    return Metanum.zero();
  }
  const resultSign = this.sign * other.sign;
  if (this.level === 0 && other.level === 0) {
    const result = Math.floor(this.array[0] / other.array[0]);
    return new Metanum(resultSign, result, 0);
  }
  if (this.level === 1 && other.level === 1) {
    const thisNum = this.toNumber();
    const otherNum = other.toNumber();
    const result = Math.floor(thisNum / otherNum);
    return Metanum.fromNumber(result);
  }
  throw new Error('Division not fully implemented for this level');
};

P.toPower=P.pow=function(exponent) {
  if (!(exponent instanceof Metanum)) exponent=new Metanum(exponent);
  if (this._isZero()) {
    if (exponent._isZero()) {
      throw new Error('0^0 is undefined');
    }
    if (exponent.sign === -1) {
      throw new Error('Division by zero');
    }
    return Metanum.zero();
  }
  if (this.eq(Metanum.ONE)) {
    return Metanum.one();
  }
  if (exponent._isZero()) {
    return Metanum.one();
  }
  if (exponent.eq(Metanum.ONE)) {
    return this.clone();
  }
  if (exponent.sign === -1) {
    throw new Error('Negative exponents not fully implemented');
  }
  if (this.level === 1 && exponent.level === 1) {
    return this._simplePow(exponent);
  }
  throw new Error('Exponentiation not fully implemented for this level');
};

P._simplePow=function(exponent) {
  const expNum = exponent.toNumber();
  if (!Number.isInteger(expNum) || expNum < 0) {
    throw new Error('Exponent must be a non-negative integer');
  }
  if (expNum === 0) {
    return Metanum.one();
  }
  let result = Metanum.one();
  let base = this.clone();
  let exp = expNum;
  while (exp > 0) {
    if (exp % 2 === 1) {
      result = result.times(base);
    }
    base = base.times(base);
    exp = Math.floor(exp / 2);
  }
  return result;
};

P.logarithm=P.logBase=P.log=function(base) {
  if (!(base instanceof Metanum)) base=new Metanum(base);
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
    return Metanum.zero();
  }
  if (base.eq(Metanum.ONE)) {
    throw new Error('Logarithm base cannot be 1');
  }
  if (this.level === 1 && base.level === 1) {
    return this._simpleLog(base);
  }
  throw new Error('Logarithm not fully implemented for this level');
};

P._simpleLog=function(base) {
  const thisNum = this.toNumber();
  const baseNum = base.toNumber();
  if (!Number.isFinite(thisNum) || !Number.isFinite(baseNum)) {
    throw new Error('Cannot compute logarithm for infinite values');
  }
  const result = Math.log(thisNum) / Math.log(baseNum);
  return Metanum.fromNumber(result);
};

// Static methods

function zero() {
  return new Metanum(1, 0, 0);
}

function one() {
  return new Metanum(1, [1], 1);
}

function fromNumber(num) {
  if (!Number.isFinite(num)) {
    throw new Error('Cannot create Metanum from non-finite number');
  }
  if (num === 0) {
    return zero();
  }
  const sign = num < 0 ? -1 : 1;
  const absNum = Math.floor(Math.abs(num));
  const array = [absNum];
  return new Metanum(sign, array, 1);
}

function fromString(str) {
  throw new Error('String parsing not yet implemented');
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
function Metanum(sign, array, level) {
  if (!(this instanceof Metanum)) {
    return new Metanum(sign, array, level);
  }

  // Handle single argument constructor
  if (arguments.length === 1) {
    level = undefined;
    array = sign;
    sign = 1;
  } else if (arguments.length === 2) {
    // Handle two arguments: (array, level) or (sign, array)
    if (sign === 1 || sign === -1) {
      // (sign, array) case
      level = undefined;
    } else {
      // (array, level) case
      level = array;
      array = sign;
      sign = 1;
    }
  }

  this.sign = this._validateSign(sign);
  this.level = this._validateLevel(level === undefined ? 1 : level);
  this.array = this._validateAndNormalizeArray(array, this.level);
  this._validateConsistency();
}

// Assign prototype
Metanum.prototype = P;

// Assign static methods
Metanum.zero = zero;
Metanum.one = one;
Metanum.fromNumber = fromNumber;
Metanum.fromString = fromString;
Metanum.negate = Metanum.neg = negate;
Metanum.absoluteValue = Metanum.abs = absoluteValue;
Metanum.equalsTo = Metanum.equal = Metanum.eq = equalsTo;
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
Metanum.logarithm = Metanum.logBase = logarithm;

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
