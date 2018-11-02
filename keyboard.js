/**
 * @fileoverview Keyboard functionality.
 *
 * Unicode helper: http://www.amp-what.com/unicode/search/up%20arrow
 */

var Keyboard = {};

/**
 * Key combo.
 *
 * @param {object!} obj The object, which can have char, ascii, meta, shift,
 * and/or option keys.
 **/
Keyboard.Combo = function(obj) {
  this.char = obj[Keyboard.Combo.CHAR];
  this.ascii = obj[Keyboard.Combo.ASCII];
  this.meta = obj[Keyboard.Combo.META];
  this.shift = obj[Keyboard.Combo.SHIFT];
  this.option = obj[Keyboard.Combo.OPTION];
};

Keyboard.Combo.CHAR = 'char';
Keyboard.Combo.ASCII = 'ascii';
Keyboard.Combo.META = 'meta';
Keyboard.Combo.SHIFT = 'shift';
Keyboard.Combo.OPTION = 'option';

Keyboard.Combo.META_PREFIX = 'meta-';
Keyboard.Combo.SHIFT_PREFIX = 'shift-';
Keyboard.Combo.OPTION_PREFIX = 'option-';

/**
 * Whether the two are equal.
 *
 * @param {Keyboard.Combo!} other The event
 * @return {boolean} Whether it matches
 **/
Keyboard.Combo.prototype.equals = function(other) {
  if (this.shift != other.shift) {
    return false;
  }
  if (this.option != other.option) {
    return false;
  }
  if (this.meta != other.meta) {
    return false;
  }
  return (strings.equalsIgnoreCase(this.char, other.char) ||
          this.ascii === other.ascii ||
          this.char == Keyboard.Combo.CHAR);
};

/**
 * Key combo string processor.
 *
 * @param {string} s The string.
 **/
Keyboard.Combo.StringProcessor = function(s) {
  this.s = s;
  this.obj = {};
};

/**
 * Process a prefix.
 *
 * @param {string} prefix The string.
 * @param {string} objKey The object key.
 * @return {Keyboard.Combo.StringProcessor!} this
 **/
Keyboard.Combo.StringProcessor.prototype.processPrefix = function(prefix, objKey) {
  if (this.s.includes(prefix)) {
    this.s = this.s.replace(prefix, '');
    this.obj[objKey] = true;
  } else {
    this.obj[objKey] = false;
  }
  return this;
};

/**
 * Get the key combo object based on what has been processed so far, adding the
 * character or ascii.
 *
 * @return {string|number} The string or number that matched it.
 **/
Keyboard.Combo.StringProcessor.prototype.getObject = function() {
  if (isNaN(this.s)) {
    if (this.s.length != 1 && this.s != Keyboard.Combo.CHAR) {
      throw 'Invalid character: ' + this.s;
    }
    this.obj[Keyboard.Combo.CHAR] = this.s;
  } else {
    this.obj[Keyboard.Combo.ASCII] = parseInt(this.s);
  }
  return this.obj;
};

/**
 * Possibly override the string.
 *
 * @param {string} s The string.
 * @return {string} The new map.
 **/
Keyboard.Combo.maybeOverride = function(s) {
  switch (s) {
    case '?': return '191';
    case '[': return '219';
    case ']': return '221';
    default: return s;
  }
};

/**
 * Creates a key combo for the string passed in.
 *
 * May contain:
 * - Character or ascii code
 * - "meta-"
 * - "shift-"
 * - "option-"
 *
 * @param {string} s The string.
 * @return {Keyboard.Combo!} The key combo.
 **/
Keyboard.Combo.fromString = function(s) {
  var stringProcessor = new Keyboard.Combo.StringProcessor(
      Keyboard.Combo.maybeOverride(s));
  stringProcessor.
      processPrefix(Keyboard.Combo.META_PREFIX, Keyboard.Combo.META).
      processPrefix(Keyboard.Combo.SHIFT_PREFIX, Keyboard.Combo.SHIFT).
      processPrefix(Keyboard.Combo.OPTION_PREFIX, Keyboard.Combo.OPTION);
  return new Keyboard.Combo(stringProcessor.getObject());
};

/**
 * Creates a key combo for the event passed in.
 *
 * @param {Event!} event The string.
 * @return {Keyboard.Combo!} The key combo.
 **/
Keyboard.Combo.fromEvent = function(event) {
  var obj = {};
  obj[Keyboard.Combo.SHIFT] = event.shiftKey;
  obj[Keyboard.Combo.OPTION] = event.altKey;
  obj[Keyboard.Combo.META] = navigator.platform.match("Mac") ? event.metaKey : event.ctrlKey;
  obj[Keyboard.Combo.ASCII] = event.which;
  obj[Keyboard.Combo.CHAR] = String.fromCharCode(event.which).toLowerCase();
  return new Keyboard.Combo(obj);
};

/**
 * Key handler.
 *
 * @param {Keyboard.Combo!} combo The key combo
 * @param {function()} fn Whether it matches
 **/
Keyboard.Handler = function(combo, fn) {
  this.combo = combo;
  this.fn = fn;
};

/**
 * Key alias.
 *
 * @param {Keyboard.Combo!} fromCombo The key combo to map from
 * @param {Keyboard.Combo!} toCombo The key combo to map to
 **/
Keyboard.Alias = function(fromCombo, toCombo) {
  this.fromCombo = fromCombo;
  this.toCombo = toCombo;
};

/**
 * Event handler set.
 **/
Keyboard.EventHandlers = function() {
  this.handlers = [];
  this.aliases = [];
  this.blockingPredicates = [];
};

/**
 * Add a handler or an alias.
 *
 * @param {string} comboStr The key combo string
 * @param {function()|string} value The value
 **/
Keyboard.EventHandlers.prototype.add = function(comboStr, value) {
  var combo = Keyboard.Combo.fromString(comboStr);
  if (typeof value === 'string') {
    this.aliases.push(new Keyboard.Alias(combo,
                                         Keyboard.Combo.fromString(value)));
  } else if (typeof value == 'function') {
    this.handlers.push(new Keyboard.Handler(combo, value));
  } else {
    throw 'Invalid type: ' + value;
  }
};

/**
 * Get the function for an event, or null if there is none.
 *
 * @param {event!} event The event
 * @return {function()} The function
 **/
Keyboard.EventHandlers.prototype.getFunction = function(event) {
  var eventCombo = Keyboard.Combo.fromEvent(event);
  for (var i = 0; i < this.aliases.length; i++) {
    var alias = this.aliases[i];
    if (alias.fromCombo.equals(eventCombo)) {
      eventCombo = alias.toCombo;
      break;
    }
  }
  for (var i = 0; i < this.handlers.length; i++) {
    var handler = this.handlers[i];
    if (handler.combo.equals(eventCombo)) {
      return handler.fn;
    }
  }
  return null;
};

/**
 * Add a predict which, if it returns true, will block key handlers.
 *
 * @param {function(Event!):boolean} pred The predicate
 **/
Keyboard.EventHandlers.prototype.addBlockingPredicate = function(pred) {
  this.blockingPredicates.push(pred);
};

/**
 * Add a predict which, if it returns true, will block key handlers.
 *
 * @param {Event!} event The event.
 * @return {boolean} pred Whether to block handlers.
 **/
Keyboard.EventHandlers.prototype.blockHandlers = function(event) {
  for (var i = 0; i < this.blockingPredicates.length; i++) {
    if (this.blockingPredicates[i](event)) {
      return true;
    }
  }
  return false;
};

/**
 * Run for an event.
 *
 * @param {event!} event The event
 * @return {boolean} Whether it ran
 **/
Keyboard.EventHandlers.prototype.run = function(event) {
  if (this.blockHandlers(event)) {
    return;
  }
  var fn = this.getFunction(event);
  if (fn) {
    if (!fn()) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
};

/**
 * Fake a keypress.
 **/
Keyboard.keypress = function() {
  var event = jQuery.Event( "keypress" );
  event.shiftKey = false;
  event.metaKey = false;
  event.ctrlKey = false;
  event.altKey = false;
  event.which = 0;
  $('body').trigger(event);
};

jQuery.fn.extend({
  getKeyHandlers: function(eventType) {
    if (!this.keyHandlers) {
      this.keyHandlers = {};
    }
    if (!this.keyHandlers[eventType]) {
      var handlers = new Keyboard.EventHandlers();
      this.keyHandlers[eventType] = handlers;
      this.on(eventType, function(event) {
        handlers.run(event);
      });
    }
    return this.keyHandlers[eventType];
  },
  mapKey: function(eventType, key, fn) {
    this.getKeyHandlers(eventType).add(key, fn);
    return this;
  },
  mapKeypress: function(key, fn) {
    return this.mapKey('keypress', key, fn);
  },
  mapKeydown: function(key, fn) {
    return this.mapKey('keydown', key, fn);
  },
  blockKeyHandlerIf: function(pred) {
    this.getKeyHandlers('keypress').addBlockingPredicate(pred);
    this.getKeyHandlers('keydown').addBlockingPredicate(pred);
  }
});
