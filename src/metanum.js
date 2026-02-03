class Metanum {
  constructor(sign, array, level = 1) {
    this.sign = this._validateSign(sign);
    this.array = this._validateAndNormalizeArray(array);
    this.level = this._validateLevel(level);
    this._validateConsistency();
  }

  _validateSign(sign) {
    if (sign !== 1 && sign !== -1) {
      throw new Error('Sign must be 1 or -1');
    }
    return sign;
  }

  _validateLevel(level) {
    const numLevel = Number(level);
    if (!Number.isInteger(numLevel) || numLevel < 0) {
      throw new Error('Level must be a non-negative integer');
    }
    return numLevel;
  }

  _validateAndNormalizeArray(array) {
    if (!Array.isArray(array)) {
      throw new Error('Array must be an array');
    }
    if (array.length === 0) {
      return [[0]];
    }
    return this._deepNormalizeArray(array);
  }

  _deepNormalizeArray(array) {
    const result = [];
    for (let i = 0; i < array.length; i++) {
      const subArray = array[i];
      if (!Array.isArray(subArray)) {
        throw new Error(`Array[${i}] must be an array`);
      }
      if (subArray.length === 0) {
        result.push([0]);
      } else {
        const normalized = subArray.map(val => {
          const num = Number(val);
          if (!Number.isInteger(num) || num < 0) {
            throw new Error(`Array elements must be non-negative integers`);
          }
          return num;
        });
        result.push(normalized);
      }
    }
    return result;
  }

  _validateConsistency() {
    if (!this._isZero() && this.level === 0) {
      throw new Error('Non-zero values cannot have level 0');
    }
    this._checkMaxValue();
  }

  _checkMaxValue() {
    //MAX_SAFE_INTEGER=9007199254740991
    if (this.level > 0 && this.array.length > 0) {
      const firstCoeff = this.array[0][0];
      if (firstCoeff > MAX_SAFE_INTEGER) {
        throw new Error(`Value exceeds maximum representable value H_ε0_(${MAX_SAFE_INTEGER})`);
      }
    }
  }

  _isZero() {
    return this.array.length === 1 && 
           this.array[0].length === 1 && 
           this.array[0][0] === 0;
  }

  static zero() {
    return new Metanum(1, [[0]], 0);
  }

  static one() {
    return new Metanum(1, [[1]], 1);
  }

  clone() {
    const clonedArray = this._deepCloneArray(this.array);
    return new Metanum(this.sign, clonedArray, this.level);
  }

  _deepCloneArray(array) {
    return array.map(subArray => [...subArray]);
  }

  _trimTrailingZeros(array) {
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
  }

  _compareArrays(arr1, arr2) {
    const len1 = arr1.length;
    const len2 = arr2.length;
    if (len1 !== len2) {
      return len1 - len2;
    }
    for (let i = len1 - 1; i >= 0; i--) {
      const cmp = this._compareSubArrays(arr1[i], arr2[i]);
      if (cmp !== 0) {
        return cmp;
      }
    }
    return 0;
  }

  _compareSubArrays(arr1, arr2) {
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
  }

  _addArrays(arr1, arr2) {
    const maxLength = Math.max(arr1.length, arr2.length);
    const result = [];
    for (let i = 0; i < maxLength; i++) {
      const sub1 = arr1[i] || [0];
      const sub2 = arr2[i] || [0];
      result.push(this._addSubArrays(sub1, sub2));
    }
    return this._trimTrailingZeros(result);
  }

  _addSubArrays(arr1, arr2) {
    const maxLength = Math.max(arr1.length, arr2.length);
    const result = new Array(maxLength).fill(0);
    for (let i = 0; i < arr1.length; i++) {
      result[i] += arr1[i];
    }
    for (let i = 0; i < arr2.length; i++) {
      result[i] += arr2[i];
    }
    return result;
  }

  _subtractArrays(arr1, arr2) {
    const result = [];
    const maxLength = Math.max(arr1.length, arr2.length);
    for (let i = 0; i < maxLength; i++) {
      const sub1 = arr1[i] || [0];
      const sub2 = arr2[i] || [0];
      result.push(this._subtractSubArrays(sub1, sub2));
    }
    return this._trimTrailingZeros(result);
  }

  _subtractSubArrays(arr1, arr2) {
    const maxLength = Math.max(arr1.length, arr2.length);
    const result = new Array(maxLength).fill(0);
    for (let i = 0; i < arr1.length; i++) {
      result[i] += arr1[i];
    }
    for (let i = 0; i < arr2.length; i++) {
      result[i] -= arr2[i];
    }
    return result;
  }

  _multiplyArrayByScalar(array, scalar) {
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
  }

  _multiplyArrays(arr1, arr2) {
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
  }

  _subArrayToOrdinalArray(subArray) {
    return subArray.slice(1);
  }

  _addOrdinalArrays(ord1, ord2) {
    const maxLength = Math.max(ord1.length, ord2.length);
    const result = new Array(maxLength).fill(0);
    for (let i = 0; i < ord1.length; i++) {
      result[i] += ord1[i];
    }
    for (let i = 0; i < ord2.length; i++) {
      result[i] += ord2[i];
    }
    return result;
  }

  _isZeroArray(array) {
    return array.length === 1 && 
           array[0].length === 1 && 
           array[0][0] === 0;
  }

  negate() {
    if (this._isZero()) {
      return this.clone();
    }
    return new Metanum(-this.sign, this._deepCloneArray(this.array), this.level);
  }

  abs() {
    return new Metanum(1, this._deepCloneArray(this.array), this.level);
  }

  toString() {
    if (this._isZero()) {
      return '0';
    }
    const signStr = this.sign === -1 ? '-' : '';
    return `${signStr}H_${this._arrayToOrdinal()}_(10)`;
  }

  _arrayToOrdinal() {
    if (this.level === 0) {
      return '0';
    }
    if (this.level === 1) {
      return this._level1ToString();
    }
    return this._levelNToString(this.level);
  }

  _level1ToString() {
    const parts = [];
    const arr = this.array[0];
    for (let i = arr.length - 1; i >= 1; i--) {
      if (arr[i] > 0) {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const letter = letters[Math.min(i - 1, 25)];
        parts.push(`${letter}^${arr[i]}`);
      }
    }
    if (arr[0] > 0) {
      parts.push(arr[0].toString());
    }
    return parts.join(' ') || '0';
  }

  _levelNToString(n) {
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
  }

  _subArrayToOrdinal(subArray, level) {
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
  }

  toNumber() {
    if (this._isZero()) {
      return 0;
    }
    if (this.level === 1 && this.array.length === 1) {
      const arr = this.array[0];
      let value = arr[0];
      for (let i = 1; i < arr.length; i++) {
        if (arr[i] > 0) {
          const exponent = Math.pow(10, i);
          value += arr[i] * exponent;
        }
      }
      return this.sign * value;
    }
    return this.sign * Infinity;
  }

  equals(other) {
    if (!(other instanceof Metanum)) {
      return false;
    }
    if (this.sign !== other.sign) {
      return false;
    }
    if (this.level !== other.level) {
      return false;
    }
    return this._arraysEqual(this.array, other.array);
  }

  lt(other) {
    if (!(other instanceof Metanum)) {
      throw new Error('Can only compare with Metanum instances');
    }
    if (this.sign !== other.sign) {
      return this.sign < other.sign;
    }
    if (this.level !== other.level) {
      return this.level < other.level;
    }
    const cmp = this._compareArrays(this.array, other.array);
    return this.sign === 1 ? cmp < 0 : cmp > 0;
  }

  gt(other) {
    if (!(other instanceof Metanum)) {
      throw new Error('Can only compare with Metanum instances');
    }
    if (this.sign !== other.sign) {
      return this.sign > other.sign;
    }
    if (this.level !== other.level) {
      return this.level > other.level;
    }
    const cmp = this._compareArrays(this.array, other.array);
    return this.sign === 1 ? cmp > 0 : cmp < 0;
  }

  lte(other) {
    return this.lt(other) || this.equals(other);
  }

  gte(other) {
    return this.gt(other) || this.equals(other);
  }

  neq(other) {
    return !this.equals(other);
  }

  _arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
      return false;
    }
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i].length !== arr2[i].length) {
        return false;
      }
      for (let j = 0; j < arr1[i].length; j++) {
        if (arr1[i][j] !== arr2[i][j]) {
          return false;
        }
      }
    }
    return true;
  }

  static fromNumber(num) {
    if (!Number.isFinite(num)) {
      throw new Error('Cannot create Metanum from non-finite number');
    }
    if (num === 0) {
      return Metanum.zero();
    }
    const sign = num < 0 ? -1 : 1;
    const absNum = Math.abs(num);
    const array = [[Math.floor(absNum)]];
    return new Metanum(sign, array, 1);
  }

  static fromString(str) {
    throw new Error('String parsing not yet implemented');
  }

  add(other) {
    if (!(other instanceof Metanum)) {
      throw new Error('Can only add Metanum instances');
    }
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
  }

  subtract(other) {
    if (!(other instanceof Metanum)) {
      throw new Error('Can only subtract Metanum instances');
    }
    if (other._isZero()) {
      return this.clone();
    }
    if (this._isZero()) {
      return other.negate();
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
  }

  multiply(other) {
    if (!(other instanceof Metanum)) {
      throw new Error('Can only multiply Metanum instances');
    }
    if (this._isZero() || other._isZero()) {
      return Metanum.zero();
    }
    const resultSign = this.sign * other.sign;
    if (this.level === 1 && other.level === 1) {
      const resultArray = this._multiplyArrays(this.array, other.array);
      return new Metanum(resultSign, resultArray, 1);
    }
    if (this.level !== other.level) {
      throw new Error('Cannot multiply Metanums with different levels');
    }
    const resultArray = this._multiplyArrays(this.array, other.array);
    return new Metanum(resultSign, resultArray, this.level);
  }

  divide(other) {
    if (!(other instanceof Metanum)) {
      throw new Error('Can only divide Metanum instances');
    }
    if (other._isZero()) {
      throw new Error('Division by zero');
    }
    if (this._isZero()) {
      return Metanum.zero();
    }
    const resultSign = this.sign * other.sign;
    if (this.level === 1 && other.level === 1) {
      const thisNum = this.toNumber();
      const otherNum = other.toNumber();
      const result = thisNum / otherNum;
      return Metanum.fromNumber(result);
    }
    throw new Error('Division not fully implemented for this level');
  }

  _divideArrays(arr1, arr2) {
    if (this._isZeroArray(arr2)) {
      throw new Error('Division by zero');
    }
    if (this._isZeroArray(arr1)) {
      return [[0]];
    }
    const cmp = this._compareArrays(arr1, arr2);
    if (cmp < 0) {
      return [[0]];
    }
    if (cmp === 0) {
      return [[1]];
    }
    if (arr2.length === 1 && arr2[0].length === 1) {
      const divisor = arr2[0][0];
      return this._multiplyArrayByScalar(arr1, 1 / divisor);
    }
    throw new Error('Complex division not implemented');
  }

  pow(exponent) {
    if (!(exponent instanceof Metanum)) {
      throw new Error('Exponent must be a Metanum instance');
    }
    if (this._isZero()) {
      if (exponent._isZero()) {
        throw new Error('0^0 is undefined');
      }
      if (exponent.sign === -1) {
        throw new Error('Division by zero');
      }
      return Metanum.zero();
    }
    if (this.equals(Metanum.one())) {
      return Metanum.one();
    }
    if (exponent._isZero()) {
      return Metanum.one();
    }
    if (exponent.equals(Metanum.one())) {
      return this.clone();
    }
    if (exponent.sign === -1) {
      throw new Error('Negative exponents not fully implemented');
    }
    if (this.level === 1 && exponent.level === 1) {
      return this._simplePow(exponent);
    }
    throw new Error('Exponentiation not fully implemented for this level');
  }

  _simplePow(exponent) {
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
        result = result.multiply(base);
      }
      base = base.multiply(base);
      exp = Math.floor(exp / 2);
    }
    return result;
  }

  log(base) {
    if (!(base instanceof Metanum)) {
      throw new Error('Base must be a Metanum instance');
    }
    if (base._isZero() || base.equals(Metanum.one())) {
      throw new Error('Invalid base for logarithm');
    }
    if (this._isZero()) {
      throw new Error('Logarithm of zero is undefined');
    }
    if (this.sign === -1) {
      throw new Error('Logarithm of negative number is undefined');
    }
    if (this.equals(Metanum.one())) {
      return Metanum.zero();
    }
    if (base.equals(Metanum.one())) {
      throw new Error('Logarithm base cannot be 1');
    }
    if (this.level === 1 && base.level === 1) {
      return this._simpleLog(base);
    }
    throw new Error('Logarithm not fully implemented for this level');
  }

  _simpleLog(base) {
    const thisNum = this.toNumber();
    const baseNum = base.toNumber();
    if (!Number.isFinite(thisNum) || !Number.isFinite(baseNum)) {
      throw new Error('Cannot compute logarithm for infinite values');
    }
    const result = Math.log(thisNum) / Math.log(baseNum);
    return Metanum.fromNumber(result);
  }
}

export default Metanum;
