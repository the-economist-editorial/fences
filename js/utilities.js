///////////////////////
// UTILITY FUNCTIONS //
///////////////////////

/**
 * returns the values of an object as an array
 *
 * @param {Object}  obj The object to iterate over
 *
 * @return {Array}      The values from that object
 */
export function values(obj) {
  var arr = [];
  for(var k of Object.keys(obj)) {
    arr.push(obj[k]);
  }
  return arr;
}

/**
 * Maps the values on an object
 *
 * @param  {Object}   obj The object to iterate over
 * @param  {Function} fn  The function to apply to each value
 *
 * @return {Object}       The new, modified object
 */
export function mapValues(obj, fn) {
  var newObj = {};
  for(var k in Object.keys(obj)) {
    newObj[k] = fn(obj[k]);
  }
  return newObj;
};


// https://github.com/jquery/jquery/blob/c869a1ef8a031342e817a2c063179a787ff57239/src/core.js#L214
export function isNumeric(n) {
  return !Array.isArray( n ) && (n - parseFloat( n ) + 1) >= 0;
}


/**
 * Parses an array of numeric data into numbers. Meant to run through
 * imported JSON/CSV data and make sure everything numeric is the
 * proper type.
 *
 * @param {*} d - a list whose items should be evaluated for numericity
 */
export function parseNumerics(d) {
  // var fn = d instanceof Array ? 'map' : 'mapValues';
  var fn = function(v) {
    return isNumeric(v) ? parseFloat(v) : v;
  }
  return d instanceof Array ? d.map(fn) : mapValues(d, fn);
}


// tagging function for generateTranslateString
function _translateCSS(strings, ...values) {
  var arr = [];

  for(let i in strings) {
    arr.push(strings[i]);
    if(values[i]) {
      arr.push(values[i] + 'px');
    }
  }

  return arr.join('');
}

/**
 * generates a translation string for transforms
 *
 * @param {Number}  x   x-coordinate to translate to
 * @param {Number}  y   y-coordinate to translate to
 * @param {Boolean} css is it a CSS transform? (adds 'px')
 *
 * @return {String}     the translate string to add to a transform
 */
export function generateTranslateString(x, y, css) {
  let translateString = `translate(${x}, ${y})`;
  let tagged = _translateCSS`translate(${x}, ${y})`;
  return css ? tagged : translateString;
}

/**
 * Reads in an array that's like a CSS margin declaration: it should
 *   be given in [top right bottom left] order, but will handle
 *   omitted values as CSS does
 *
 * @param  {Array}  marginArray - margin values as array
 *
 * @return {Object} margin values as an object
 */
export function parseMarginArray(marginArray) {
  if(!(marginArray instanceof Array)) {
    return marginArray;
  }
  var top, right, bottom, left;
  switch (marginArray.length) {
    case 1:
      top = right = bottom = left = marginArray[0];
      break;
    case 2:
      top = bottom = marginArray[0];
      right = left = marginArray[1];
      break;
    case 3:
      top = marginArray[0];
      bottom = marginArray[2];
      right = left = marginArray[1];
      break;
    default:
      top = marginArray[0];
      right = marginArray[1];
      bottom = marginArray[2];
      left = marginArray[3];
      break;
  }
  return { top : top, right : right, bottom: bottom, left : left };
}

/**
 * restricts a value to within a set minimum and maximum
 *
 * @param  {number} value - the value to be bound
 * @param  {number|Array} min - the minimum bound or an array
 *   containing both values
 * @param  {number} max - the maximum bound
 *
 * @return {number} - the value, or the min/max as appropriate
 */
export function bindValueToRange(value, min, max) {
  // array overload
  var rg = min.length === 2 ? min : [min, max];

  // if the 'min' is larger than the 'max', this will be false,
  // and the values will be reversed in the return statement
  var order = rg[1] > rg[0];
  return Math.max(rg[+!order], Math.min(rg[+order], value));
}
