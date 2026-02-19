// Author: dlsdl 0.3.0
// Reconstruct code and correct calculating functions
// Code snippets and templates from ExpantaNum.js and PowiainaNum.js
;(function (globalScope) {
  "use strict";
  // --  EDITABLE DEFAULTS  -- //
  var MetaNum = {
    // The maximum number of operators stored in multi-dimension arrays.
    // If the number of operations exceed the limit, then the least significant operations will be discarded.
    // This is to prevent long loops and eating away of memory and processing time.
    // 16 means there are at maximum of 16 elements in each 1D-array, 16 1D-arrays in each 2D-array, etc.
    // It is not recommended to make this number too big or too small.
    maxOps: 16,
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

//region MetaNum Constants
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
R.MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
R.MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER;
R.NaN = Number.NaN;
R.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
R.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
R.E_MAX_SAFE_INTEGER="E"+MAX_SAFE_INTEGER;
R.EE_MAX_SAFE_INTEGER="EE"+MAX_SAFE_INTEGER;
R.TETRATED_MAX_SAFE_INTEGER="F"+MAX_SAFE_INTEGER;
R.PENTATED_MAX_SAFE_INTEGER="G"+MAX_SAFE_INTEGER;
/*
R.OMEGATED_MAX_SAFE_INTEGER="Aa"+MAX_SAFE_INTEGER;
R.OMEGAEXPANTED_MAX_SAFE_INTEGER="Ba"+MAX_SAFE_INTEGER;
R.MEGOTED_MAX_SAFE_INTEGER="Aaa"+MAX_SAFE_INTEGER;
R.POWIAINATED_MAX_SAFE_INTEGER="Aaaa"+MAX_SAFE_INTEGER;
R.GODGAH_MAX_SAFE_INTEGER="!Aa"+MAX_SAFE_INTEGER;
R.GATHOR_MAX_SAFE_INTEGER="@Aa"+MAX_SAFE_INTEGER;
*/
/* The Graham's Number, = G^64(4) */
R.GRAHAMS_NUMBER = "1, 2, 3638334640023.7783, [7625597484984, 1, 63], [[1], [3], [0, 1]]";
/* QqQe308 = H_ω^(ω17+16)+ω^(ω17+4)(308) */
R.QqQe308 = "1, 2, 308, [1, 1], [[4, 17], [16, 17]]";
/* MAX_METANUM_VALUE = ε9.007e15 */
R.MAX_METANUM_VALUE = "1, " + MAX_SAFE_INTEGER + ", " + MAX_SAFE_INTEGER + ", [" + MAX_SAFE_INTEGER + "], [[ " + MAX_SAFE_INTEGER + " ]], [[[" + MAX_SAFE_INTEGER + "]]]";
// end region MetaNum Constants

//region Validation functions
function _validateSign(sign) {
  if (sign !== 1 && sign !== -1) {
    throw new Error('Sign must be 1 or -1');
  }
  return sign;
}

function _validateLayer(layer) {
  const numLayer = Number(layer);
  if (!Number.isInteger(numLayer) || numLayer < 0) {
    throw new Error('Layer must be a non-negative integer');
  }
  return numLayer;
}

function _validateArray(array) {
  const num = Number(array);
  if (num < 0) {
    throw new Error('Array must be a non-negative number');
  }
  return num;
}

function _validateBrrby(brrby) {
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

function _validateCrrcy(crrcy) {
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

function _validateDrrdy(drrdy) {
  if (!Array.isArray(drrdy)) {
    throw new Error('Drrdy must be a 4-dimensional array');
  }
  if (drrdy.length === 0) {
    return [[[[0]]]];
  }
  return drrdy.map(tier => {
    if (!Array.isArray(tier)) {
      throw new Error('Drrdy elements must be 3D arrays');
    }
    if (tier.length === 0) {
      return [[[0]]];
    }
    return tier.map(twoD => {
      if (!Array.isArray(twoD)) {
        throw new Error('Drrdy 3D elements must be 2D arrays');
      }
      if (twoD.length === 0) {
        return [[0]];
      }
      return twoD.map(row => {
        if (!Array.isArray(row)) {
          throw new Error('Drrdy 2D elements must be arrays');
        }
        if (row.length === 0) {
          return [0];
        }
        return row.map(val => {
          const num = Number(val);
          if (!Number.isInteger(num) || num < 0) {
            throw new Error('Drrdy elements must be non-negative integers');
          }
          return num;
        });
      });
    });
  });
}

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
// end region validation functions

// region operators
//1. Basic operators
P.absoluteValue=P.abs=function() {
  var x=this.clone();
  x.sign=1;
  return x;
}
Q.absoluteValue=Q.abs=function() {
  return new MetaNum(x).abs();
}
P.negate=P.neg=function() {
  var x=this.clone();
  x.sign=-x.sign;
  return x;
}
Q.negate=Q.neg=function() {
  return new MetaNum(x).neg();
}
P.isPositive=P.ispos=function (){
  return this.gt(MetaNum.ZERO);
};
Q.isPositive=Q.ispos=function (x){
  return new MetaNum(x).ispos();
};
P.isNegative=P.isneg=function (){
  return this.lt(MetaNum.ZERO);
};
Q.isNegative=Q.isneg=function (x){
  return new MetaNum(x).isneg();
};
P.isNaN=function (){
  return isNaN(this.array);
};
Q.isNaN=function (x){
  return new MetaNum(x).isNaN();
};
P.isFinite=function (){
  return isFinite(this.array);
};
Q.isFinite=function (x){
  return new MetaNum(x).isFinite();
};
P.isInfinite=function (){
  return this.array==Infinity;
};
Q.isInfinite=function (x){
  return new MetaNum(x).isInfinite();
};
P.isInteger=P.isint=function (){
  if (this.sign==-1) return this.abs().isint();
  if (this.gt(MetaNum.MAX_SAFE_INTEGER)) return true;
  return Number.isInteger(this.toNumber());
};
Q.isInteger=Q.isint=function (x){
  return new MetaNum(x).isint();
};
P.floor=function (){
  return new MetaNum(x).isint();
};
P.floor=function (){
  if (this.isInteger()) return this.clone();
  return new MetaNum(Math.floor(this.toNumber()));
};
Q.floor=function (x){
  return new MetaNum(x).floor();
};
P.ceiling=P.ceil=function (){
  if (this.isInteger()) return this.clone();
  return new MetaNum(Math.ceil(this.toNumber()));
};
Q.ceiling=Q.ceil=function (x){
  return new MetaNum(x).ceil();
};
P.round=function (){
  if (this.isInteger()) return this.clone();
  return new MetaNum(Math.round(this.toNumber()));
};
Q.round=function (x){
  return new MetaNum(x).round();
};

//2. Comparisons
/* 通过康托尔范式(cantor normal form, CNF)比较序数
任何序数α>0，都可以唯一表示为：α1=ω^β1*c1+ω^β2*c2+⋯+ω^βn*cn
其中：β1>β2>⋯>βn是递减的序数，c1,c2,⋯,cn是非零自然数
设两个康托尔范式序数：α=ω^β1*c1+ω^β2*c2+⋯+ω^βn*cn，γ=ω^δ1*d1+ω^δ2*d2+⋯+ω^δn*dn
比较最高次项：找到最大的i使得βi≠δi，如果βi>δi，则α>γ；如果βi<δi，则α<γ；
如果βi=δi，比较系数c1和d1，如果c1>d1，则α>γ；如果c1<d1，则α<γ；如果c1=d1，去掉第一项，递归比较剩余部分
核心原则：字典序比较，就像比较多项式或字符串一样，从左到右（从高次到低次）逐项比较，第一个不同的位置决定大小关系
例如：ω^2已经大于任何ω*n+m（无论n,m多大），这反映了序数运算的吸收性质：ω*β会"吸收"所有更小的序数的任意有限组合。
*/
// brrby 比较函数
function brrbyCompare(tb, ob) {
  // 先比较长度
  if (tb.length > ob.length) return 1;
  if (tb.length < ob.length) return -1;
  // 长度相同，从最后一个元素向前比较
  for (var i = tb.length - 1; i >= 0; i--) {
    if (tb[i] > ob[i]) return 1;
    if (tb[i] < ob[i]) return -1;
  }
  return 0;
}
// crrcy 比较函数
function crrcyCompare(tc, oc) {
  // crrcy中任意一个一维数组大的则整体大
  for (var i = 0; i < tc.length; i++) {
    for (var j = 0; j < oc.length; j++) {
      var tRow = tc[i];
      var oRow = oc[j];
      // 逐行比较
      var k = Math.max(tRow.length, oRow.length);
      for (var idx = 0; idx < k; idx++) {
        var tVal = idx < tRow.length ? tRow[idx] : 0;
        var oVal = idx < oRow.length ? oRow[idx] : 0;
        if (tVal > oVal) return 1;
        if (tVal < oVal) return -1;
      }
    }
  }
  return 0;
}
// drrdy 比较函数
function drrdyCompare(td, od) {
  // drrdy中任意一个二维数组大的则整体大
  for (var i = 0; i < td.length; i++) {
    for (var j = 0; j < od.length; j++) {
      var tMatrix = td[i];
      var oMatrix = od[j];
      // 逐矩阵比较
      var k = Math.max(tMatrix.length, oMatrix.length);
      for (var idx = 0; idx < k; idx++) {
        var tRow = idx < tMatrix.length ? tMatrix[idx] : [];
        var oRow = idx < oMatrix.length ? oMatrix[idx] : [];
        // 逐行比较
        var m = Math.max(tRow.length, oRow.length);
        for (var idy = 0; idy < m; idy++) {
          var tVal = idy < tRow.length ? tRow[idy] : 0;
          var oVal = idy < oRow.length ? oRow[idy] : 0;
          if (tVal > oVal) return 1;
          if (tVal < oVal) return -1;
        }
      }
    }
  }
  return 0;
}
P.compareTo=P.cmp=function(other) {
  if (!(other instanceof MetaNum)) other=new MetaNum(other);
  if (MetaNum.debug>=MetaNum.ALL) console.log('Comparing', this, 'to', other);
  if (isNaN(this.array) || isNaN(other.array)) return NaN;
  if (this.array == Infinity && other.array != Infinity) return this.sign;
  if (this.array != Infinity && other.array == Infinity) return -other.sign;
  if (this.array == 0 && other.array == 0) return 0;
  if (this.sign != other.sign) return this.sign;
  var m=this.sign;
  var r;
  if (this.layer>other.layer) r=1;
  else if (this.layer<other.layer) r=-1;
  else{
    //layer=0，array只有一个元素，直接比较array的值
    if (this.layer == 0){
      r=this.array>other.array?1:(this.array<other.array?-1:0);
      if (MetaNum.debug>=MetaNum.ALL) console.log('Layer 0 Comparison Result:', r);
    }
    //layer=1，先比较brrby，再比较array
    else if (this.layer == 1){
      var bCmp = brrbyCompare(this.brrby, other.brrby);
      if (bCmp !== 0) {
        r = bCmp;
      } else {
        r=this.array>other.array?1:(this.array<other.array?-1:0);
      }
      if (MetaNum.debug>=MetaNum.ALL) console.log('Layer 1 Comparison Result:', r);
    }
    //layer=2，先比较crrcy，再比较brrby，最后比较array
    else if (this.layer == 2){
      var cCmp = crrcyCompare(this.crrcy, other.crrcy);
      if (cCmp !== 0) {
        r = cCmp;
      } else {
        var bCmp = brrbyCompare(this.brrby, other.brrby);
        if (bCmp !== 0) {
          r = bCmp;
        } else {
          r=this.array>other.array?1:(this.array<other.array?-1:0);
        }
      }
      if (MetaNum.debug>=MetaNum.ALL) console.log('Layer 2 Comparison Result:', r);
    }
    //layer>=3，先比较drrdy，再比较crrcy，再比较brrby，最后比较array
    else if (this.layer >= 3){
      var dCmp = drrdyCompare(this.drrdy, other.drrdy);
      if (dCmp !== 0) {
        r = dCmp;
      } else {
        var cCmp = crrcyCompare(this.crrcy, other.crrcy);
        if (cCmp !== 0) {
          r = cCmp;
        } else {
          var bCmp = brrbyCompare(this.brrby, other.brrby);
          if (bCmp !== 0) {
            r = bCmp;
          } else {
            r=this.array>other.array?1:(this.array<other.array?-1:0);
          }
        }
      }
    }
    if (MetaNum.debug>=MetaNum.ALL) console.log('Layer >= 3 Comparison Result:', r);
  }
  return r*m;
}
Q.compare=Q.cmp=function (x,y){
  return new MetaNum(x).cmp(y);
};
P.greaterThan=P.gt=function (other){
  return this.cmp(other)>0;
};
Q.greaterThan=Q.gt=function (x,y){
  return new MetaNum(x).gt(y);
};
P.greaterThanOrEqualTo=P.gte=function (other){
  return this.cmp(other)>=0;
};
Q.greaterThanOrEqualTo=Q.gte=function (x,y){
  return new MetaNum(x).gte(y);
};
P.lessThan=P.lt=function (other){
  return this.cmp(other)<0;
};
Q.lessThan=Q.lt=function (x,y){
  return new MetaNum(x).lt(y);
};
P.lessThanOrEqualTo=P.lte=function (other){
  return this.cmp(other)<=0;
};
Q.lessThanOrEqualTo=Q.lte=function (x,y){
  return new MetaNum(x).lte(y);
};
P.equalsTo=P.equal=P.eq=function (other){
  return this.cmp(other)===0;
};
Q.equalsTo=Q.equal=Q.eq=function (x,y){
  return new MetaNum(x).eq(y);
};
P.notEqualsTo=P.notEqual=P.neq=function (other){
  return this.cmp(other)!==0;
};
Q.notEqualsTo=Q.notEqual=Q.neq=function (x,y){
  return new MetaNum(x).neq(y);
};
P.minimum=P.min=function (other){
  return this.lt(other)?this.clone():new MetaNum(other);
};
Q.minimum=Q.min=function (x,y){
  return new MetaNum(x).min(y);
};
P.maximum=P.max=function (other){
  return this.gt(other)?this.clone():new MetaNum(other);
};
Q.maximum=Q.max=function (x,y){
  return new MetaNum(x).max(y);
};

//3. Basic calculations
P.plus=P.add=function(other) {
  var x=this.clone();
  other=new MetaNum(other);
  if (MetaNum.debug>=MetaNum.NORMAL) console.log(this+"+"+other);
  //特殊值
  if (x.sign==-1) return x.neg().add(other.neg()).neg();
  if (other.sign==-1) return x.sub(other.neg());
  if (x.eq(MetaNum.ZERO)) return other;
  if (other.eq(MetaNum.ZERO)) return x;
  if (x.isNaN()||other.isNaN()||x.isInfinite()&&other.isInfinite()&&x.eq(other.neg())) return MetaNum.NAN.clone();
  if (x.isInfinite()) return x;
  if (other.isInfinite()) return other;
  //普通情况
  var p=x.min(other);
  var q=x.max(other);
  var t;
  //相差超过9e15倍直接返回最大值
  if (q.gt(MetaNum.E_MAX_SAFE_INTEGER)||q.div(p).gt(MetaNum.MAX_SAFE_INTEGER)) t=q;
  //layer=0时array直接相加
  else if (q.layer==0) t=new MetaNum(x.toNumber()+other.toNumber());
  //layer=1且brrby[0]==1时，array取指数后相加取对数
  else if (q.brrby[0]==1){
    var a=p.layer>0?p.array:Math.log10(p.array);
    t=new MetaNum([a+Math.log10(Math.pow(10,q.array-a)+1),1]);
    }
  p=q=null;
  return t;
}
Q.plus=Q.add=function (x,y){
  return new MetaNum(x).add(y);
};
P.minus=P.sub=function(other) {
  var x=this.clone();
  other=new MetaNum(other);
  if (MetaNum.debug>=MetaNum.NORMAL) console.log(x+"-"+other);
  if (x.sign==-1) return x.neg().sub(other.neg()).neg();
  if (other.sign==-1) return x.add(other.neg());
  if (x.eq(other)) return MetaNum.ZERO.clone();
  if (other.eq(MetaNum.ZERO)) return x;
  if (x.isNaN()||other.isNaN()||x.isInfinite()&&other.isInfinite()) return MetaNum.NAN.clone();
  if (x.isInfinite()) return x;
  if (other.isInfinite()) return other.neg();
  var p=x.min(other);
  var q=x.max(other);
  var n=other.gt(x);
  var t;
  if (q.gt(MetaNum.E_MAX_SAFE_INTEGER)||q.div(p).gt(MetaNum.MAX_SAFE_INTEGER)){
    t=q;
    t=n?t.neg():t;
  }
  else if (q.layer==0) t=new MetaNum(x.toNumber()-other.toNumber());
  else if (q.brrby[0]==1){
    var a=p.layer>0?p.array:Math.log10(p.array);
    t=new MetaNum([a+Math.log10(Math.pow(10,q.array-a)-1),1]);
    t=n?t.neg():t;
  }
  p=q=null;
  return t;
};
Q.minus=Q.sub=function (x,y){
  return new MetaNum(x).sub(y);
};
P.times=P.mul=function(other) {
  var x=this.clone();
  other=new MetaNum(other);
  if (MetaNum.debug>=MetaNum.NORMAL) console.log(x+"×"+other);
  if (x.sign*other.sign==-1) return x.abs().mul(other.abs()).neg();
  if (x.sign==-1) return x.abs().mul(other.abs());
  if (x.isNaN()||other.isNaN()||x.eq(MetaNum.ZERO)&&other.isInfinite()||x.isInfinite()&&other.abs().eq(MetaNum.ZERO)) return MetaNum.NAN.clone();
  if (other.eq(MetaNum.ZERO)) return MetaNum.ZERO.clone();
  if (other.eq(MetaNum.ONE)) return x.clone();
  if (x.isInfinite()) return x;
  if (other.isInfinite()) return other;
  if (x.max(other).gt(MetaNum.EE_MAX_SAFE_INTEGER)) return x.max(other);
  var n=x.toNumber()*other.toNumber();
  if (n<=MAX_SAFE_INTEGER) return new MetaNum(n);
  return MetaNum.pow(10,x.log10().add(other.log10()));
};
Q.times=Q.mul=function (x,y){
  return new MetaNum(x).mul(y);
};
P.divide=P.div=function(other) {
  var x=this.clone();
  other=new MetaNum(other);
  if (MetaNum.debug>=MetaNum.NORMAL) console.log(x+"÷"+other);
  if (x.sign*other.sign==-1) return x.abs().div(other.abs()).neg();
  if (x.sign==-1) return x.abs().div(other.abs());
  if (x.isNaN()||other.isNaN()||x.isInfinite()&&other.isInfinite()||x.eq(MetaNum.ZERO)&&other.eq(MetaNum.ZERO)) return MetaNum.NAN.clone();
  if (other.eq(MetaNum.ZERO)) return MetaNum.POSITIVE_INFINITY.clone();
  if (other.eq(MetaNum.ONE)) return x.clone();
  if (x.eq(other)) return MetaNum.ONE.clone();
  if (x.isInfinite()) return x;
  if (other.isInfinite()) return MetaNum.ZERO.clone();
  if (x.max(other).gt(MetaNum.EE_MAX_SAFE_INTEGER)) return x.gt(other)?x.clone():MetaNum.ZERO.clone();
  var n=x.toNumber()/other.toNumber();
  if (n<=MAX_SAFE_INTEGER) return new MetaNum(n);
  var pw=MetaNum.pow(10,x.log10().sub(other.log10()));
  var fp=pw.floor();
  if (pw.sub(fp).lt(new MetaNum(1e-9))) return fp;
  return pw;
};
Q.divide=Q.div=function (x,y){
  return new MetaNum(x).div(y);
};
P.reciprocate=P.rec=function (){
  if (MetaNum.debug>=MetaNum.NORMAL) console.log(this+"⁻¹");
  if (this.isNaN()||this.eq(MetaNum.ZERO)) return MetaNum.NaN.clone();
  if (this.abs().gt("2e323")) return MetaNum.ZERO.clone();
  return new MetaNum(1/this);
};
Q.reciprocate=Q.rec=function (x){
  return new MetaNum(x).rec();
};
P.modular=P.mod=function (other){
  other=new MetaNum(other);
  if (other.eq(MetaNum.ZERO)) return MetaNum.ZERO.clone();
  if (this.sign*other.sign==-1) return this.abs().mod(other.abs()).neg();
  if (this.sign==-1) return this.abs().mod(other.abs());
  return this.sub(this.div(other).floor().mul(other));
};
Q.modular=Q.mod=function (x,y){
  return new MetaNum(x).mod(y);
};
P.toPower=P.pow=function(other) {
  other=new MetaNum(other);
  if (MetaNum.debug>=MetaNum.NORMAL) console.log(this+"▲"+other);
  if (other.eq(MetaNum.ZERO)) return MetaNum.ONE.clone();
  if (other.eq(MetaNum.ONE)) return this.clone();
  if (other.lt(MetaNum.ZERO)) return this.pow(other.neg()).rec();
  if (this.lt(MetaNum.ZERO)&&other.isint()){
    if (other.mod(2).lt(MetaNum.ONE)) return this.abs().pow(other);
    return this.abs().pow(other).neg();
  }
  if (this.lt(MetaNum.ZERO)) return MetaNum.NAN.clone();
  if (this.eq(MetaNum.ONE)) return MetaNum.ONE.clone();
  if (this.eq(MetaNum.ZERO)) return MetaNum.ZERO.clone();
  if (this.max(other).gt(MetaNum.TETRATED_MAX_SAFE_INTEGER)) return this.max(other);
  if (this.eq(10)){
    if (other.gt(MetaNum.ZERO)){
      other.layer=1;
      other.brrby[0]=(other.brrby[0]+1)||1;
      other.normalize();
      return other;
    }
    else return new MetaNum(Math.pow(10,other.toNumber()));
  }
  if (other.lt(MetaNum.ONE)) return this.root(other.rec());
  var n=Math.pow(this.toNumber(),other.toNumber());
  if (n<=MAX_SAFE_INTEGER) return new MetaNum(n);
  return MetaNum.pow(10,this.log10().mul(other));
};
Q.toPower=Q.pow=function(x,y) {
  return new MetaNum(x).pow(y);
};
P.powered_by=P.pwb=function(other){
  return new MetaNum(other).pow(this);
}
Q.powered_by=Q.pwb=function(x,y){
  return new MetaNum(y).pow(x);
}
P.exponential=P.exp=function (){
  return OmegaNum.pow(Math.E,this);
};
Q.exponential=Q.exp=function (x){
  return OmegaNum.pow(Math.E,x);
};
P.root=P.roo=function (other){
  other=new MetaNum(other);
  if (MetaNum.debug>=MetaNum.NORMAL) console.log(this+"√"+other);
  if (other.eq(MetaNum.ONE)) return this.clone();
  if (other.lt(MetaNum.ZERO)) return this.root(other.neg()).rec();
  if (other.lt(MetaNum.ONE)) return this.pow(other.rec());
  if (this.lt(MetaNum.ZERO)&&other.isint()&&other.mod(2).eq(MetaNum.ONE)) return this.neg().root(other).neg();
  if (this.lt(MetaNum.ZERO)) return MetaNum.NAN.clone();
  if (this.eq(MetaNum.ONE)) return MetaNum.ONE.clone();
  if (this.eq(MetaNum.ZERO)) return MetaNum.ZERO.clone();
  if (this.max(other).gt(MetaNum.TETRATED_MAX_SAFE_INTEGER)) return this.gt(other)?this.clone():MetaNum.ZERO.clone();
  return MetaNum.pow(10,this.log10().div(other));
};
Q.root=Q.roo=function (x,y){
  return new MetaNum(x).root(y);
};
P.squareRoot=P.sqrt=function (){
  return this.root(2);
};
Q.squareRoot=Q.sqrt=function (x){
  return new MetaNum(x).root(2);
};
P.cubeRoot=P.cbrt=function (){
  return this.root(3);
};
Q.cubeRoot=Q.cbrt=function (x){
  return new MetaNum(x).root(3);
};
P.generalLogarithm=P.log10=function (){
  if (MetaNum.debug>=MetaNum.ALL) console.log("㏒"+this);
  var x=this.clone();
  if (x.lt(MetaNum.ZERO)) return MetaNum.NaN.clone();
  if (x.eq(MetaNum.ZERO)) return MetaNum.NEGATIVE_INFINITY.clone();
  if (x.lte(MetaNum.MAX_SAFE_INTEGER)) return new MetaNum(Math.log10(x.toNumber()));
  if (!x.isFinite()) return x;
  if (x.gt(MetaNum.TETRATED_MAX_SAFE_INTEGER)) return x;
  if (x.brrby[0]>=1) x.brrby[0]--;
  else x.array=Math.log10(x.array);
  return x.normalize();
};
Q.generalLogarithm=Q.log10=function (x){
  return new MetaNum(x).log10();
};
P.logarithm=P.logBase=function (base){
  if (MetaNum.debug>=MetaNum.NORMAL) console.log(this+"▼"+base);
  if (base===undefined) base=Math.E;
  return this.log10().div(MetaNum.log10(base));
};
Q.logarithm=Q.logBase=function (x,base){
  return new MetaNum(x).logBase(base);
};
P.naturalLogarithm=P.log=P.ln=function (){
  return this.logBase(Math.E);
};
Q.naturalLogarithm=Q.log=Q.ln=function (x){
  return new MetaNum(x).ln();
};

//4. Hyperoperations
//work in progress
P.tetrate=P.tet=function(other,payload){
  if (payload===undefined) payload=MetaNum.ONE;
  var t=this.clone();
  other=new MetaNum(other);
  payload=new MetaNum(payload);
  if (payload.neq(MetaNum.ONE)) other=other.add(payload.slog(t));
  if (MetaNum.debug>=MetaNum.NORMAL) console.log(t+"𝐓"+other);
  var negln;
  if (t.isNaN()||other.isNaN()||payload.isNaN()) return MetaNum.NAN.clone();
  /*if (other.isInfinite()&&other.sign>0){
    if (t.gte(Math.exp(1/Math.E))) return OmegaNum.POSITIVE_INFINITY.clone();
      //Formula for infinite height power tower.
    negln = t.ln().neg();
    return negln.lambertw().div(negln);
  }*/
};

//5. Conversions
P.normalize = function () {
  /* 这是MetaNum中最果糕的函数之一
  输入：任意状态的 MetaNum 对象，输出：规范化后的对象
  1. 清理无效数据（NaN、Infinity、空值）
  2. 按索引排序
  3. 合并相同索引
  4. 处理数值溢出（进位到更高阶）
  5. 调整 layer 层级
  6. 补全缺失项
  7. 优化表示（最小化数组长度）*/
  // 初始化和基本验证
  var b;
  var x = this;
  if (MetaNum.debug >= MetaNum.ALL) console.log("normalize: " + this);
  // 空数组处理
  if (!x.brrby || !x.brrby.length) x.brrby = [0];
  if (!x.crrcy || !x.crrcy.length) x.crrcy = [[0]];
  if (!x.drrdy || !x.drrdy.length) x.drrdy = [[[0]]];
  if (x.array === Infinity || Number.isNaN(x.array)) {
    return x; //直接返回Nan或Infinity
  }
  // 符号处理：确保 sign 只能是 1 或 -1
  if (x.sign != 1 && x.sign != -1) {
    if (typeof x.sign != "number") x.sign = Number(x.sign);
    x.sign = x.sign < 0 ? -1 : 1;
  }
  // 层数溢出处理：超过安全整数则设为 Infinity，表示f_ε0_(1e308)则改为MAX_VALUE
  if (x.layer > MAX_SAFE_INTEGER) {
    x.array = Infinity;
    x.brrby = [Infinity];
    x.crrcy = [[Infinity]];
    x.drrdy = [[[Infinity]]];
    return x;
  }
  // 层数取整：确保 layer 是整数
  if (Number.isInteger(x.layer)) x.layer = Math.floor(x.layer);
  // 数组元素处理特殊值
  // 处理 brrby（一维数组）
  if (Array.isArray(x.brrby)) {
    for (let i = 0; i < x.brrby.length; i++) {
      let v = x.brrby[i];
      if (v === null || v === undefined) {
        x.brrby[i] = 0;
      } else if (Number.isNaN(v) || v === Infinity) {
        x.array = v;
        return x;
      } else {
        x.brrby[i] = Math.floor(Number(v));
      }
    }
  }
  // 处理 crrcy（二维数组）
  if (Array.isArray(x.crrcy)) {
    for (let i = 0; i < x.crrcy.length; i++) {
      let row = x.crrcy[i];
      if (Array.isArray(row)) {
        for (let j = 0; j < row.length; j++) {
          let v = row[j];
          if (v === null || v === undefined) {
            row[j] = 0;
          } else if (Number.isNaN(v) || v === Infinity) {
            x.array = v;
            return x;
          } else {
            row[j] = Math.floor(Number(v));
          }
        }
      }
    }
  }
  // 处理 drrdy（三维数组）
  if (Array.isArray(x.drrdy)) {
    for (let i = 0; i < x.drrdy.length; i++) {
      let tier = x.drrdy[i];
      if (Array.isArray(tier)) {
        for (let j = 0; j < tier.length; j++) {
          let row = tier[j];
          if (Array.isArray(row)) {
            for (let k = 0; k < row.length; k++) {
              let v = row[k];
              if (v === null || v === undefined) {
                row[k] = 0;
              } else if (Number.isNaN(v) || v === Infinity) {
                x.array = v;
                return x;
              } else {
                row[k] = Math.floor(Number(v));
              }
            }
          }
        }
      }
    }
  }
  if (MetaNum.debug >= MetaNum.ALL) console.log("value processed: " + this);
  // pop brrby 最后为0的元素
  if(x.layer==1) {while(x.brrby[x.brrby.length-1] == 0) x.brrby.pop();}
  else if (x.layer==2) {
    // 移除brrby中所有为0的元素，并移除对应的crrcy元素
    let newBrrby = [];
    let newCrrcy = [];
    for (let i = 0; i < x.brrby.length; i++) {
      if (x.brrby[i] !== 0) {
        newBrrby.push(x.brrby[i]);
        newCrrcy.push(x.crrcy[i] || []);
      }
    }
    x.brrby = newBrrby;
    x.crrcy = newCrrcy;
    // 移除crrcy每个子数组中最后为0的元素
    for (let i = 0; i < x.crrcy.length; i++) {
      let row = x.crrcy[i];
      if (Array.isArray(row)) {
        while (row.length > 0 && row[row.length - 1] === 0) {
          row.pop();
        }
      }
    }
  }
  else if (x.layer>=3) {
    // 移除brrby中所有为0的元素，并移除对应的crrcy和drrdy元素
    let newBrrby = [];
    let newCrrcy = [];
    let newDrrdy = [];
    for (let i = 0; i < x.brrby.length; i++) {
      if (x.brrby[i] !== 0) {
        newBrrby.push(x.brrby[i]);
        newCrrcy.push(x.crrcy[i] || []);
        newDrrdy.push(x.drrdy[i] || []);
      }
    }
    x.brrby = newBrrby;
    x.crrcy = newCrrcy;
    x.drrdy = newDrrdy;
    // 移除crrcy每个子数组中所有为0的元素
    for (let i = 0; i < x.crrcy.length; i++) {
      let row = x.crrcy[i];
      if (Array.isArray(row)) {
        x.crrcy[i] = row.filter(val => val !== 0);
      }
    }
    // 移除drrdy每个子二维数组的每个子数组中最后为0的元素
    for (let i = 0; i < x.drrdy.length; i++) {
      let tier = x.drrdy[i];
      if (Array.isArray(tier)) {
        for (let j = 0; j < tier.length; j++) {
          let row = tier[j];
          if (Array.isArray(row)) {
            while (row.length > 0 && row[row.length - 1] === 0) {
              row.pop();
            }
          }
        }
      }
    }
  }
  if (MetaNum.debug >= MetaNum.ALL) console.log("pop processed: " + this);
  // 主循环：排序和规范化
  do{
    b = false;  // 重置标志
    //layer=0，保持原样
    //layer=1，限制brrby长度
    if (x.layer<=1) {
      //限制brrby长度
      if(x.brrby.length>MetaNum.maxOps) x.brrby.splice(0,x.brrby.length - MetaNum.maxOps);
    };
    //layer=2，限制crrcy及其子数组长度，按照crrcyCompare函数排序crrcy
    if (x.layer===2){
      //限制crrcy及其子数组长度
      if(x.crrcy.length>MetaNum.maxOps) x.crrcy.splice(0,x.crrcy.length - MetaNum.maxOps);
      x.crrcy.forEach(row => {
        if (row.length > MetaNum.maxOps) row.splice(0, row.length - MetaNum.maxOps);
      });
      x.crrcy.sort(crrcyCompare);
    }
    //layer=3，限制drrdy及其子数组长度，按照drrdyCompare函数排序drrdy，再按照crrcyCompare函数排序crrcy
    else if (x.layer===3){
        //限制drrdy及其子数组长度
      if(x.drrdy.length>MetaNum.maxOps) x.drrdy.splice(0,x.drrdy.length - MetaNum.maxOps);
        x.drrdy.forEach(tier => {
        if (tier.length > MetaNum.maxOps) tier.splice(0, tier.length - MetaNum.maxOps);
          tier.forEach(row => {
          if (row.length > MetaNum.maxOps) row.splice(0, row.length - MetaNum.maxOps);
        });
      });
      x.drrdy.sort(drrdyCompare);
      x.drrdy.forEach(tier => tier.sort(crrcyCompare));
    }
    if (MetaNum.debug >= MetaNum.ALL) console.log("cut and sorted: " + this);
    //layer升降级
    //layer=0，当array大于MAX_SAFE_INTEGER时，升级为layer=1
    if(x.layer==0 && x.array>MAX_SAFE_INTEGER){
      x.layer = 1;
      x.array = Math.log10(x.array);
      x.brrby = [1];
      b=true;
    }
    //layer=1，当brrby为[0]时，降级为layer=0
    else if(x.layer==1){
      if(x.brrby==[0] || !x.brrby){
        x.layer=0;
        b=true;
      }
      //当array小于MAX_E=log10MSI时，降级为layer=0
      while (x.array<MAX_E && x.brrby[0]){
        x.array=Math.pow(10,x.array);
        x.brrby[0]--;
        if(x.brrby[0]==0) x.layer=0;
        b=true;
      }
      //当brrby长度大于2且brrby[i-1]为0时，为brrby[i-2]赋值array，array重置为1，brrby[i-1]--
      if (x.brrby.length>2 && !x.brrby[0]){
        for (i=2;!x.brrby[i-1];++i) continue;
        x.brrby[i-2]=x.array;
        x.array=1;
        x.brrby[i-1]--;
        b=true;
      }
      //当brrby[i-1]大于MAX_SAFE_INTEGER时，为brrby[i]赋值1，array赋值brrby[i-1]+1，brrby[0...i-1]重置为0
      for (let l=x.array.length,i=1;i<l;++i){
        if (x.brrby[i-1]>MAX_SAFE_INTEGER){
          x.brrby[i]=(x.brrby[i]||0)+1;
          x.array=x.brrby[i-1]+1;
          for (var j=1;j<=i;++j) x.array[j-1]=0;
          b=true;
        }
      }
    }
    if (MetaNum.debug >= MetaNum.ALL) console.log("up/down layer: " + this);
  // to be continued

  }while(b);
  return x;
}
P.toNumber=function (){
  if (MetaNum.debug >= MetaNum.ALL) console.log(this + " to number");
  if (this.sign==-1) return -1*this.abs();
  if (this.brrby.length>=1&&(this.brrby[0]>=2||this.brrby[0]==1&&this.array>Math.log10(Number.MAX_VALUE))) return Infinity;
  if (this.brrby[0]==1) return Math.pow(10,this.array);
  return this.array;
}
P.toString=function (){
  if (this.array == 0) return '0';
  if (isNaN(this.array)) return "NaN";
  if (!isFinite(this.array)) return "Infinity";
  const signStr = this.sign === -1 ? '-' : '';
  let term;
  if (this.layer == 0) {
    return `${signStr}${this.array}`;
  }
  else if(this.layer == 1){
    var s=signStr;
    if (this.brrby.length>=1){
      for (var i=this.brrby.length-1;i>=2;--i){
        var q=String.fromCharCode(68+i);
        if (this.brrby[i-1]>1) s+=q+"^"+this.brrby[i-1];
        else if (this.brrby[i-1]==1) s+=q;
      }
    }
    if (this.brrby[0] < 3) {
      if (this.brrby[0] >= 1) s += "E".repeat(this.brrby[0] - 1) + Math.pow(10, this.array - Math.floor(this.array)) + "E" + Math.floor(this.array);
      else s += Math.pow(10, this.array - Math.floor(this.array)) + "E" + Math.floor(this.array);
    }
    else if (this.brrby[0]<8) s += "E".repeat(this.brrby[0])+this.array;
    else s+="F^"+this.brrby[0]+" "+this.array;
    return s;
  }
  else if(this.layer == 2){
    let result = '';
    for (let i = this.crrcy.length - 1; i >= 0; i--) {
      const coeff = this.brrby[i];
      if (coeff === 0) continue;
      const row = this.crrcy[i] || [];
      const expStr = formatAsExponents(row);
      if (expStr === '0') continue;
      term = `ω^(${expStr})*${coeff}`;
      if (result === '') {
      result = term;
      } else {
      result += '+' + term;
      }
    }
    return `${signStr}H_${result}_(${this.array})`;
  }
  else if(this.layer == 3){
    let result = '';
    for (let i = this.drrdy.length - 1; i >= 0; i--) {
      const coeff = this.brrby[i];
      if (coeff === 0) continue;
      const matrix = this.drrdy[i] || [];
      const expStr = formatNestedExponents(matrix);
      if (expStr === '0') continue;
      term = `ω^(${expStr})*${coeff}`;
      if (result === '') {
        result = term;
      } else {
        result += '+' + term;
      }
    }
    return `${signStr}H_${result}_(${this.array})`;
  }
  else if(this.layer >= 4){
    for (let i = n; i >= 0; i--) {
      const coeff = brrby[i];
      if (coeff === 0) continue;
      const matrix = this.drrdy[i] || [];
      const expStr = formatNestedExponents(matrix);
      if (expStr === '0') continue;
      term = `ω^(${expStr})*${coeff}`;
      if (result === '') {
        result = term;
      } else {
        result += '+' + term;
      }
    }
    const towerHeight = this.layer - 3;
    let tower = 'ω';
    for (let i = 1; i < towerHeight; i++) {
      tower = `ω^(${tower})`;
    }
    return `${signStr}H_${tower} ${result}_(${this.array})`;
  }
};
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
P.toJSON=function (){
  if (MetaNum.serializeMode==MetaNum.JSON){
    return {
      sign:this.sign,
      layer:this.layer,
      array:this.array.slice(0),
      brrby:this.brrby.slice(0),
      crrcy:this.crrcy.slice(0),
      drrdy:this.drrdy.slice(0)
    };
  }
  else if (MetaNum.serializeMode==MetaNum.STRING){
    return this.toString();
  }
};
P.toHyperE=function (){
  if (this.sign==-1) return "-"+this.abs().toHyperE();
  if (isNaN(this.array)) return "NaN";
  if (!isFinite(this.array)) return "Infinity";
  if (this.lt(MetaNum.MAX_SAFE_INTEGER)) return String(this.array);
  if (this.lt(MetaNum.E_MAX_SAFE_INTEGER)) return "E"+this.array;
  var r="E"+this.array+"#"+this.brrby[0];
  for (var i=2;i<this.brrby.length-1;++i){
    r+="#"+(this.brrby[i-1]+1);
  }
  return r;
};
Q.fromNumber = function(input) {
  if (typeof input!="number") throw Error(invalidArgument+"Expected Number");
  var x=new MetaNum();
  x.array=Math.abs(input);
  x.sign=input<0?-1:1;
  x.normalize();
  if (MetaNum.debug >= MetaNum.ALL) console.log(input+"fromNumber->",x);
  return x;
};
Q.fromString = function(input) {
  // MetaNum中最果糕的函数之二
  var x = new MetaNum();
  
  // 处理特殊值
  if (input === "NaN") {
    x.array = NaN;
    x.normalize();
    return x;
  } else if (input === "Infinity") {
    x.array = Infinity;
    x.normalize();
    return x;
  }
  
  // 处理符号
  if (input.charAt(0) === '-') {
    x.sign = -1;
    input = input.slice(1);
  } else {
    x.sign = 1;
  }
  
  // 情况1：纯数字（整数或实数）
  if (/^\d+(\.\d+)?$/.test(input)) {
    x.layer = 0;
    x.array = parseFloat(input);
    x.normalize();
    return x;
  }
  
  // 情况2：数字y + E/e + 数字z（无前导E）
  if (/^(\d+)([Ee])(-?\d+(\.\d+)?)$/.test(input)) {
    var match2 = input.match(/^(\d+)([Ee])(-?\d+(\.\d+)?)$/);
    var yVal = parseFloat(match2[1]);
    var zVal = parseFloat(match2[3]);
    x.layer = 1;
    x.array = zVal + Math.log10(yVal);
    x.brrby = [1];
    x.normalize();
    return x;
  }
  
  // 情况2b：x个E/e（x>=1）+ 数字y + E/e + 数字z
  if (/^([Ee]+)(\d+)([Ee])(-?\d+(\.\d+)?)$/.test(input)) {
    var match2b = input.match(/^([Ee]+)(\d+)([Ee])(-?\d+(\.\d+)?)$/);
    var xCount = match2b[1].length;
    var yVal2 = parseFloat(match2b[2]);
    var zVal2 = parseFloat(match2b[4]);
    x.layer = 1;
    x.array = zVal2 + Math.log10(yVal2);
    x.brrby = [xCount + 1];
    x.normalize();
    return x;
  }
  
  // 情况2c：x个E/e（x>=1）+ 数字z（只有E和数字）
  if (/^([Ee]+)(\d+)$/.test(input)) {
    var match2c = input.match(/^([Ee]+)(\d+)$/);
    var xCountc = match2c[1].length;
    var zValc = parseFloat(match2c[2]);
    x.layer = 1;
    x.array = zValc;
    x.brrby = [xCountc];
    x.normalize();
    return x;
  }
  
  // 情况3：数字y + F + 数字z（无前导F）
  if (/^(\d+)F(-?\d+(\.\d+)?)$/.test(input)) {
    var match3 = input.match(/^(\d+)F(-?\d+(\.\d+)?)$/);
    var fyVal = parseFloat(match3[1]);
    var fzVal = parseFloat(match3[2]);
    x.layer = 1;
    x.array = fzVal + Math.log10(fyVal);
    x.brrby = [0, 1];
    x.normalize();
    return x;
  }
  
  // 情况3b：x个F/f（x>=1）+ 数字y + F + 数字z
  if (/^([Ff]+)(\d+)F(-?\d+(\.\d+)?)$/.test(input)) {
    var match3b = input.match(/^([Ff]+)(\d+)F(-?\d+(\.\d+)?)$/);
    var fxCount = match3b[1].length;
    var fyVal2 = parseFloat(match3b[2]);
    var fzVal2 = parseFloat(match3b[3]);
    x.layer = 1;
    x.array = fzVal2 + Math.log10(fyVal2);
    x.brrby = [0, fxCount + 1];
    x.normalize();
    return x;
  }
  
  // 情况3c：x个F/f（x>=1）+ 数字z（只有F和数字）
  if (/^([Ff]+)(\d+)$/.test(input)) {
    var match3c = input.match(/^([Ff]+)(\d+)$/);
    var fxCountc = match3c[1].length;
    var fzValc = parseFloat(match3c[2]);
    x.layer = 1;
    x.array = fzValc;
    x.brrby = [0, fxCountc];
    x.normalize();
    return x;
  }
  
  // 情况4：数字y + E/e + 数字z + F + 数字w
  if (/^(\d+)([Ee])(\d+)F(\d+)$/.test(input)) {
    var match4 = input.match(/^(\d+)([Ee])(\d+)F(\d+)$/);
    var mixYVal = parseFloat(match4[1]);
    var mixZVal = parseFloat(match4[3]);
    var mixWVal = parseFloat(match4[4]);
    x.layer = 1;
    x.array = mixWVal + Math.log10(mixZVal);
    x.brrby = [1, mixYVal + 1];
    x.normalize();
    return x;
  }
  
  // 情况4b：x个E/e + 数字y + E/e + 数字z + F + 数字w
  if (/^([Ee]+)(\d+)([Ee])(\d+)F(\d+)$/.test(input)) {
    var match4b = input.match(/^([Ee]+)(\d+)([Ee])(\d+)F(\d+)$/);
    var mixXCount = match4b[1].length;
    var mixYVal2 = parseFloat(match4b[2]);
    var mixZVal2 = parseFloat(match4b[4]);
    var mixWVal2 = parseFloat(match4b[5]);
    x.layer = 1;
    x.array = mixWVal2 + Math.log10(mixZVal2);
    x.brrby = [mixXCount + 1, mixYVal2 + 1];
    x.normalize();
    return x;
  }
  
  // 科学计数法形式（仅当结果在安全范围内）
  if (/^-?\d+(\.\d+)?[eE]-?\d+$/.test(input)) {
    var sciMatch = input.match(/^(-?\d+(\.\d+)?)[eE](-?\d+)$/);
    var base = sciMatch[1] ? parseFloat(sciMatch[1]) : 1;
    var exp = parseFloat(sciMatch[3]);
    var result = base * Math.pow(10, exp);
    if (result <= Number.MAX_SAFE_INTEGER) {
      x.layer = 0;
      x.array = result;
      x.brrby = [0];
    } else {
      x.layer = 1;
      x.array = exp;
      x.brrby = [1];
    }
    x.normalize();
    if (MetaNum.debug >= MetaNum.ALL) console.log(input+"fromString->",x);
    return x;
  }
  
  // 默认情况
  x.layer = 0;
  x.array = 0;
  x.normalize();
  return x;
};
Q.fromArray=function (input1,input2,input3,input4,input5,input6){
  var x=new MetaNum();
  x.sign=input1;
  x.layer=input2;
  x.array=input3;
  x.brrby=input4;
  x.crrcy=input5;
  x.drrdy=input6;
  x.normalize();
  if (MetaNum.debug >= MetaNum.ALL) console.log(input+"fromArray->",x);
  return x;
}
Q.fromObject=function (input){
  var x=new MetaNum();
  x.sign=input.sign;
  x.layer=input.layer;
  x.array=input.array;
  x.brrby=input.brrby;
  x.crrcy=input.crrcy;
  x.drrdy=input.drrdy;
  x.normalize();
  if (MetaNum.debug >= MetaNum.ALL) console.log(input+"fromObject->",x);
  return x;
}
Q.fromJSON=function (input){
  var obj=JSON.parse(input);
  return Q.fromObject(obj);
}
P.clone = function() {
  var temp = new MetaNum();
  temp.sign = this.sign;
  temp.layer = this.layer;
  temp.array = this.array;
  temp.brrby = this.brrby;
  temp.crrcy = this.crrcy;
  temp.drrdy = this.drrdy;
  return temp;
};
// end region operators

// region toglobalscope
function clone(obj) {
  var i, p, ps;
  function MetaNum(input,input2,input3,input4,input5,input6) {
    var x=this;
    if (!(x instanceof MetaNum)) return new MetaNum(input);
    x.constructor=MetaNum;
    var parsedObject=null;
    if (typeof input=="string"&&(input[0]=="["||input[0]=="{")){
      try {
        parsedObject=JSON.parse(input);
      }catch(e){
        console.error("😰")
      }
    }
    var temp,temp2,temp3,temp4,temp5,temp6;
    if (typeof input=="number" && typeof input2=="undefined"){
      temp=MetaNum.fromNumber(input);
    }else if (typeof input2=="number"){
      temp=MetaNum.fromArray(input,input2,input3,input4,input5,input6);
    }else if (typeof input=="string"){
      temp=MetaNum.fromString(input);
    }else if (parsedObject){
      temp=MetaNum.fromObject(parsedObject);
    }else if (typeof input == "object") {
      temp=MetaNum.fromObject(input);
    }else if (input instanceof MetaNum){
      temp = input.clone();
    }else{
      temp=1;
      temp2=0;
      temp3=NaN;
      temp4=[0];
      temp5=[[0]];
      temp6=[[[0]]];
    }
    if (typeof temp2=="undefined"){
      x.sign=temp.sign;
      x.layer=temp.layer;
      x.array=temp.array;
      x.brrby=temp.brrby;
      x.crrcy=temp.crrcy;
      x.drrdy=temp.drrdy;
    }else{
      x.sign=temp;
      x.layer=temp2;
      x.array=temp3;
      x.brrby=temp4;
      x.crrcy=temp5;
      x.drrdy=temp6;
    }
  }
  MetaNum.prototype = P;

  MetaNum.JSON = 0;
  MetaNum.STRING = 1;

  MetaNum.NONE = 0;
  MetaNum.NORMAL = 1;
  MetaNum.ALL = 2;

  MetaNum.clone = clone;
  MetaNum.config = MetaNum.set = config
  
  for (var prop in Q){
    if (Q.hasOwnProperty(prop)){
      MetaNum[prop]=Q[prop];
    }
  }

  if (obj === void 0) obj = {};
  if (obj) {
    ps = ['maxOps', 'serializeMode', 'debug'];
    for (i = 0; i < ps.length;) if (!obj.hasOwnProperty(p = ps[i++])) obj[p] = this[p];
  }

  MetaNum.config(obj);

  return MetaNum;
}

function defineConstants(obj){
  for (var prop in R){
    if (R.hasOwnProperty(prop)){
      if (Object.defineProperty){
        Object.defineProperty(obj,prop,{
          configurable: false,
          enumerable: true,
          writable: false,
          value: new MetaNum(R[prop])
        });
      }else{
        obj[prop]=new MetaNum(R[prop]);
      }
    }
  }
  return obj;
}

function config(obj){
  if (!obj||typeof obj!=='object') {
    throw Error(MetaNumError+'Object expected');
  }
  var i,p,v,
    ps = [
      'maxOps',1,Number.MAX_SAFE_INTEGER,
      'serializeMode',0,1,
      'debug',0,2
    ];
  for (i = 0; i < ps.length; i += 3) {
    if ((v = obj[p = ps[i]]) !== void 0) {
      if (Math.floor(v) === v && v >= ps[i + 1] && v <= ps[i + 2]) this[p] = v;
      else throw Error(invalidArgument + p + ': ' + v);
    }
  }
  return this;
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
// end region toglobalscope
})(this);