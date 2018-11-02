/**
 * @fileoverview Settings.
 */

var settings = {};

/**
 * Creates a heading for a settings panel.
 *
 * @param {string} title The title.
 **/
settings.Heading = function(title) {
  this.title = title;
};

/**
 * Creates the element.
 *
 * @return {element!} The element.
 **/
settings.Heading.prototype.createElement = function() {
  if (this.elt) {
    throw 'separator element already created';
  }
  this.elt = $('<div />');
  this.elt.text(this.title);
  this.elt.css('font-weight', 'Bold');
  return this.elt;
};


/**
 * Creates a link that calls a callback on click.
 *
 * @param {string} text The text.
 * @param {function()} callbackFn The callback.
 **/
settings.LinkWithCallback = function(text, callbackFn) {
  this.text = text;
  this.callbackFn = callbackFn;
};

/**
 * Creates the element.
 *
 * @return {element!} The element.
 **/
settings.LinkWithCallback.prototype.createElement = function() {
  if (this.elt) {
    throw 'link with callback element already created';
  }
  this.elt = $('<a />').css('display', 'block');
  this.elt.text(this.text);
  this.elt.click(this.callbackFn);
  return this.elt;
};


/**
 * Creates a link that calls a callback on click.
 *
 * @param {string} text The text.
 * @param {string} href The href.
 **/
settings.LinkWithHref = function(text, href) {
  this.text = text;
  this.href = href;
};

/**
 * Creates the element.
 *
 * @return {element!} The element.
 **/
settings.LinkWithHref.prototype.createElement = function() {
  if (this.elt) {
    throw 'link with href element already created';
  }
  this.elt = $('<a />').css('display', 'block');
  this.elt.text(this.text);
  var self = this;
  this.elt.click(function() {
    window.open(self.href);
  });
  return this.elt;
};

/**
 * Creates a separator for a settings panel.
 **/
settings.Separator = function() { };

/**
 * Creates the element.
 *
 * @return {element!} The element.
 **/
settings.Separator.prototype.createElement = function() {
  if (this.elt) {
    throw 'separator element already created';
  }
  this.elt = $('<hr />');
  return this.elt;
};

/**
 * Creates a checkbox for a settings panel.
 *
 * @param {element!} textElt The text element.
 * @param {configs.Config!} config The config.
 * @param {string} key The storage key.
 * @param {function(boolean)} changeCallbackFn The callback function on change.
 * @param {boolean=} opt_defaultValue Default value.
 **/
settings.BooleanSetting = function(textElt, config, key, changeCallbackFn,
                                   opt_defaultValue) {
  this.textElt = textElt;
  this.config = config;
  this.key = key;
  this.changeCallbackFn = changeCallbackFn;
  this.value = this.config.get(this.key, opt_defaultValue);
};

/**
 * Creates the element.
 *
 * @return {element!} The element.
 **/
settings.BooleanSetting.prototype.createElement = function() {
  if (this.elt) {
    throw 'boolean setting element already created: ' + this.key;
  }
  var checkboxElt = $('<input type="checkbox">').prop('checked', this.value);
  var self = this;
  checkboxElt.change(function() {
    self.value = $(this).prop('checked');
    self.changeCallbackFn(self.value);
    self.config.set(self.key, self.value);
  });
  this.elt = $('<div />');
  this.elt.append(checkboxElt);
  this.elt.append(this.textElt);
  return this.elt;
};

/**
 * Creates a dropdown for a settings panel.
 *
 * @param {configs.Config!} config The config.
 * @param {string} key The storage key.
 * @param {function(boolean)} changeCallbackFn The callback function on change.
 **/
settings.DropdownSetting = function(config, key, changeCallbackFn) {
  this.config = config;
  this.key = key;
  this.changeCallbackFn = changeCallbackFn;
  this.value = this.config.get(this.key);
  this.options = [];
};

/**
 * Creates a dropdown for a settings panel.
 *
 * @param {string} text The text.
 * @param {string} value The value.
 **/
settings.DropdownSetting.Option = function(text, value) {
  this.text = text;
  this.value = value;
};

/**
 * Adds an option.
 *
 * @param {string} text The text.
 * @param {string} value The value.
 * @return {settings.DropdownSetting!} this
 **/
settings.DropdownSetting.prototype.addOption = function(text, value) {
  this.options.push(new settings.DropdownSetting.Option(text, value));
  return this;
};

/**
 * Creates the element.
 *
 * @return {element!} The element.
 **/
settings.DropdownSetting.prototype.createElement = function() {
  if (this.elt) {
    throw 'dropdown setting element already created: ' + this.key;
  }
  var selectElt = $('<select />');
  for (var i = 0; i < this.options.length; i++) {
    var option = this.options[i];
    var optionElt = $('<option />').attr('value', option.value);
    optionElt.text(option.text);
    if (option.value == this.value) {
      optionElt.attr('selected', true);
    }
    selectElt.append(optionElt);
  }
  var self = this;
  selectElt.change(function() {
    self.value = $(this).find(':selected').val();
    self.changeCallbackFn(self.value);
    self.config.set(self.key, self.value);
  });
  this.elt = $('<div />');
  this.elt.append(selectElt);
  return this.elt;
};

/**
 * Creates a settings panel.
 **/
settings.SettingsPanel = function() {
  this.settings = [];
  this.settingsByKey = {};
};

/**
 * Creates the element.
 *
 * @return {element!} The element.
 **/
settings.SettingsPanel.prototype.createElement = function() {
  if (this.elt) {
    throw 'settings panel element already created';
  }
  this.elt = $('<div class="settingsPanel" />');
  for (var i = 0; i < this.settings.length; i++) {
    this.appendSettingElement(this.settings[i]);
  }
  return this.elt;
};

/**
 * Appends the setting element.
 *
 * @param {object!} setting The setting. Must have createElement() method.
 **/
settings.SettingsPanel.prototype.appendSettingElement = function(setting) {
  if (!this.elt) {
    throw 'settings panel element not created';
  }
  this.elt.append(setting.createElement());
};

/**
 * Adds a heading to the panel.
 *
 * @param {string} title The title.
 * @return {setting.SettingsPanel!} this
 **/
settings.SettingsPanel.prototype.addHeading = function(title) {
  this.settings.push(new settings.Heading(title));
  return this;
};

/**
 * Adds a link with a callback to the panel.
 *
 * @param {string} text The text.
 * @param {function()} callbackFn The callback on click.
 * @return {setting.SettingsPanel!} this
 **/
settings.SettingsPanel.prototype.addLinkWithCallback = function(text,
                                                                callbackFn) {
  this.settings.push(new settings.LinkWithCallback(text, callbackFn));
  return this;
};

/**
 * Adds a link with an href to the panel.
 *
 * @param {string} text The text.
 * @param {string} href The href.
 * @return {setting.SettingsPanel!} this
 **/
settings.SettingsPanel.prototype.addLinkWithHref = function(text, href) {
  this.settings.push(new settings.LinkWithHref(text, href));
  return this;
};

/**
 * Adds a separator to the panel.
 * @return {setting.SettingsPanel!} this
 **/
settings.SettingsPanel.prototype.addSeparator = function() {
  this.settings.push(new settings.Separator());
  return this;
};

/**
 * Adds a setting to the panel.
 *
 * @param {object!} setting The setting. Must have createElement() method.
 * @return {setting.SettingsPanel!} this
 **/
settings.SettingsPanel.prototype.addSetting = function(setting) {
  this.settings.push(setting);
  this.settingsByKey[setting.key] = setting;
  if (this.elt) {
    this.appendSettingElement(setting);
  }
  return this;
};

/**
 * Gets a setting value.
 *
 * @param {string} key The key.
 * @return {object!} The setting value.
 **/
settings.SettingsPanel.prototype.getSetting = function(key) {
  return this.settingsByKey[key].value;
};

/**
 * Creates a span for an inline text string based setting.
 *
 * @param {element!} trueElt The true text element.
 * @param {element!} falseElt The false text element.
 * @param {configs.Config!} config The config.
 * @param {string} key The storage key.
 * @param {function(boolean)} changeCallbackFn The callback function on change.
 * @param {boolean=} opt_defaultValue Default value.
 **/
settings.BooleanInlineSetting = function(trueElt, falseElt, config, key,
                                         changeCallbackFn, opt_defaultValue) {
  this.trueElt = trueElt;
  this.falseElt = falseElt;
  this.config = config;
  this.key = key;
  this.changeCallbackFn = changeCallbackFn;
  this.value = this.config.get(this.key, opt_defaultValue);
};

/**
 * Sets the value.
 *
 * @param {boolean} value The value.
 **/
settings.BooleanInlineSetting.prototype.setValue = function(value) {
  this.value = value;
  console.log('setting value to ' + value);
  if (value) {
    this.trueElt.show();
    this.falseElt.hide();
  } else {
    this.trueElt.hide();
    this.falseElt.show();
  }
};

/**
 * Creates the element.
 *
 * @return {element!} The element.
 **/
settings.BooleanInlineSetting.prototype.createElement = function() {
  if (this.elt) {
    throw 'boolean inline setting element already created: ' + this.key;
  }
  var self = this;
  this.clickableElt = $('<span />').
      append(this.trueElt).
      append(this.falseElt).
      css('cursor', 'pointer').
      click(function() {
        self.setValue(!self.value);
        self.changeCallbackFn(self.value);
        self.config.set(self.key, self.value);
      });
  this.elt = $('<span />').append(this.clickableElt);
  this.setValue(this.value);
  return this.elt;
};
