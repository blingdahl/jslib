/**
 * @fileoverview Config.
 */

var configs = {};

configs.LOG = false;

/**
 * Creates a Config object.
 *
 * @param {object!} obj The object.
 * @param {function()} onChangeFn The function to call.
 **/
configs.Config = function(obj, onChangeFn) {
  this.obj = obj;
  this.onChangeFn = onChangeFn;
};

/**
 * Gets a config property.
 *
 * @param {string} key The key.
 *
 * @return {configs.Config.Property!} The config property.
 **/
configs.Config.prototype.getProperty = function(key) {
  var self = this;
  return new configs.Config.Property(key, function getFn() {
    return self.get(key);
  }, function setFn(value) {
    self.set(key, value);
  });
};

/**
 * Sets a config value.
 *
 * @param {string} key The key.
 * @param {string} val The value.
 **/
configs.Config.prototype.set = function(key, val) {
  this.obj[key] = val;
  this.onChangeFn(this.toJSON());
};

/**
 * Gets a config value.
 *
 * @param {string} key The key.
 * @param {string=} opt_defaultValue The default value if the config is not set.
 * @return {string} The value.
 **/
configs.Config.prototype.get = function(key, opt_defaultValue) {
  var val = this.obj[key];
  if (val === undefined) {
    return opt_defaultValue;
  }
  return this.obj[key];
};

/**
 * Converts to JSON.
 *
 * @return {string} The JSON.
 **/
configs.Config.prototype.toJSON = function() {
  return JSON.stringify(this.obj);
};

/**
 * Loads the config with the namespace passed in.
 *
 * @param {string} namespace The config's namespace.
 * @param {function(configs.Config!)} callbackFn The function that takes the
 * config.
 **/
configs.Config.load = function(namespace, callbackFn) {
  var configName = namespace + 'Config';
  chrome.storage.local.get([configName], function(val) {
    var obj = {};
    if (configName in val) {
      obj = JSON.parse(val[configName]);
    }
    var config = new configs.Config(obj, function(json) {
      var configObj = {};
      configObj[configName] = json;
      chrome.storage.local.set(configObj, function(val) {
        if (configs.LOG) {
          console.log('Set in storage: ' + json);
        }
      });
    });
    callbackFn(config);
  });
};

/**
 * Creates a Config property object.
 *
 * @param {string} key The key.
 * @param {function(object!)} getFn The get function.
 * @param {function(object!)} setFn The set function.
 **/
configs.Config.Property = function(key, getFn, setFn) {
  this.key = key;
  this.setFn = setFn;
  this.getFn = getFn;
};

/**
 * Get the value.
 *
 * @return {object!} The value.
 **/
configs.Config.Property.prototype.get = function() {
  return this.getFn();
};

/**
 * Get the value.
 *
 * @param {object!} value The value.
 **/
configs.Config.Property.prototype.set = function(value) {
  this.setFn(value);
};
