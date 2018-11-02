/**
 * @fileoverview String functions.
 */

var strings = strings || {};


/**
 * Mapping from string set to string.
 *
 * @param {Array.<string>!} fromArr The map.
 * @param {string} to The to string.
 **/
strings.StringMapping = function(fromArr, to) {
  this.fromArr = fromArr;
  this.to = to;
};


/**
 * Map.
 *
 * @param {string} text The input text.
 * @return {string} The new string.
 **/
strings.StringMapping.prototype.map = function(text) {
  for (var i = 0; i < this.fromArr.length; i++) {
    if (text.includes(this.fromArr[i])) {
      return this.to;
    }
  }
  return '';
};


/**
 * Group of mappings.
 *
 * @param {string} defaultValue The value to return if there is no key.
 * @param {Array.<strings.StringMapping!>?=} opt_mappings The mappings.
 **/
strings.StringMappings = function(defaultValue, opt_mappings) {
  this.mappings = opt_mappings || [];
  this.defaultValue = defaultValue;
};


/**
 * Add a mapping.
 *
 * @param {Array.<string>!} fromArr The input text.
 * @param {string} to The to text.
 * @return {strings.StringMappings!} this
 **/
strings.StringMappings.prototype.addMapping = function(fromArr, to) {
  this.mappings.push(new strings.StringMapping(fromArr, to));
  return this;
};


/**
 * Map.
 *
 * @param {string} text The input text.
 * @return {string} The new string.
 **/
strings.StringMappings.prototype.map = function(text) {
  for (var i = 0; i < this.mappings.length; i++) {
    var newText = this.mappings[i].map(text);
    if (newText) {
      return newText;
    }
  }
  return this.defaultValue;
};

/**
 * Equals ignore case.
 *
 * @param {string} a The first argument.
 * @param {string} b The first argument.
 * @return {boolean} Whether they are equal.
 **/
strings.equalsIgnoreCase = function(a, b) {
  if (!a || !b) {
    return false;
  }
  return a.toLowerCase() == b.toLowerCase();
};
